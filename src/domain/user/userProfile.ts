/**
 * MODULE QUẢN LÝ TÀI KHOẢN & HỒ SƠ NGƯỜI CHƠI (USER PROFILE & SKILL ONBOARDING)
 * Nguồn sự thật cho: Xác thực dữ liệu đầu vào, khởi tạo SkillProfile, cập nhật thông tin cá nhân
 * Tuân thủ: Data Contract v1.0, firestore.rules, RATING_CONFIG, DA_NANG_DISTRICTS
 */

import {
  UserProfile,
  UserSkillProfile,
  Gender,
  Handedness,
  PlayStyle,
  BadmintonLevel,
  PlayerSnapshot,
} from '../types';
import { RATING_CONFIG } from '../../config/rating';
import { DA_NANG_DISTRICTS, isValidDistrict } from '../../config/districts';
import {
  calculateInitialRatingFromAnswers,
  levelToRange,
} from '../rating/initialRating';

export interface CreateUserInput {
  uid: string;
  displayName: string;
  gender: Gender;
  phoneNumber?: string;
  avatarUrl?: string;
  areaLabel: string;
  position: PlayStyle;
  dominantHand: Handedness;
  selfDeclaredLevel?: BadmintonLevel;
  onboardingAnswers?: number[];
  fcmTokens?: string[];
}

export interface UpdateUserProfileInput {
  displayName?: string;
  gender?: Gender;
  phoneNumber?: string;
  avatarUrl?: string;
  areaLabel?: string;
  position?: PlayStyle;
  dominantHand?: Handedness;
  fcmTokens?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Kiểm tra tính hợp lệ của dữ liệu đăng ký hồ sơ ban đầu
 */
export function validateCreateUserInput(input: CreateUserInput): ValidationResult {
  const errors: string[] = [];

  // 1. UID
  if (!input.uid || typeof input.uid !== 'string' || input.uid.trim() === '') {
    errors.push('UID người dùng không được để trống.');
  }

  // 2. Tên hiển thị (2 - 50 ký tự)
  if (!input.displayName || typeof input.displayName !== 'string') {
    errors.push('Tên hiển thị là bắt buộc.');
  } else {
    const trimmedName = input.displayName.trim();
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      errors.push('Tên hiển thị phải từ 2 đến 50 ký tự.');
    }
  }

  // 3. Giới tính ('M' hoặc 'F')
  if (!input.gender || (input.gender !== 'M' && input.gender !== 'F')) {
    errors.push('Giới tính phải là "M" (Nam) hoặc "F" (Nữ).');
  }

  // 4. Số điện thoại (Tùy chọn - nếu có phải là định dạng 10 số VN)
  if (input.phoneNumber) {
    const cleanPhone = input.phoneNumber.replace(/\s+/g, '');
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(cleanPhone)) {
      errors.push('Số điện thoại không đúng định dạng di động Việt Nam.');
    }
  }

  // 5. Khu vực / Quận huyện tại Đà Nẵng
  if (!input.areaLabel || !isValidDistrict(input.areaLabel)) {
    errors.push(
      `Khu vực hoạt động không hợp lệ. Vui lòng chọn 1 trong 7 quận/huyện tại Đà Nẵng: ${DA_NANG_DISTRICTS.join(', ')}.`
    );
  }

  // 6. Vị trí sở trường
  const validPositions: PlayStyle[] = ['front', 'back', 'both'];
  if (!input.position || !validPositions.includes(input.position)) {
    errors.push('Vị trí sở trường phải là "front" (lưới), "back" (công) hoặc "both" (linh hoạt).');
  }

  // 7. Tay thuận
  const validHands: Handedness[] = ['right', 'left'];
  if (!input.dominantHand || !validHands.includes(input.dominantHand)) {
    errors.push('Tay thuận phải là "right" (tay phải) hoặc "left" (tay trái).');
  }

  // 8. Trình độ ban đầu (Cần 1 trong 2: onboardingAnswers 10 câu hoặc selfDeclaredLevel 1..6)
  if (!input.onboardingAnswers && !input.selfDeclaredLevel) {
    errors.push('Người chơi phải hoàn thành bài trắc nghiệm Onboarding hoặc tự khai cấp độ ban đầu.');
  }

  if (input.onboardingAnswers) {
    if (!Array.isArray(input.onboardingAnswers) || input.onboardingAnswers.length !== 10) {
      errors.push('Bài trắc nghiệm Onboarding bắt buộc phải có đủ 10 câu trả lời.');
    } else {
      const invalidAnswer = input.onboardingAnswers.some((a) => a < 1 || a > 4 || !Number.isInteger(a));
      if (invalidAnswer) {
        errors.push('Mỗi câu trả lời trắc nghiệm phải có điểm từ 1 đến 4.');
      }
    }
  }

  if (input.selfDeclaredLevel) {
    if (![1, 2, 3, 4, 5, 6].includes(input.selfDeclaredLevel)) {
      errors.push('Cấp độ tự khai phải là số nguyên từ 1 đến 6.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Khởi tạo tài khoản UserProfile và SkillProfile từ dữ liệu đăng ký hợp lệ
 */
export function createUserProfile(input: CreateUserInput): UserProfile {
  const validation = validateCreateUserInput(input);
  if (!validation.isValid) {
    throw new Error(`Dữ liệu đăng ký không hợp lệ: ${validation.errors.join('; ')}`);
  }

  // Xác định điểm Elo và Cấp độ ban đầu
  let initialLevel: BadmintonLevel;
  let initialRatingValue: number;

  if (input.onboardingAnswers && input.onboardingAnswers.length === 10) {
    const calc = calculateInitialRatingFromAnswers(input.onboardingAnswers);
    initialLevel = calc.level as BadmintonLevel;
    initialRatingValue = calc.initialRating;
  } else if (input.selfDeclaredLevel) {
    initialLevel = input.selfDeclaredLevel;
    initialRatingValue = levelToRange(input.selfDeclaredLevel).defaultRating;
  } else {
    // Mặc định an toàn cho người mới: Cấp 2 (TB-)
    initialLevel = 2;
    initialRatingValue = levelToRange(2).defaultRating;
  }

  const skill: UserSkillProfile = {
    rating: initialRatingValue,
    matchesPlayed: 0,
    reliability: RATING_CONFIG.REPUTATION_MAX, // 100 điểm uy tín ban đầu (theo rules & contract)
    isProvisional: true, // 5 trận đầu dùng K=40 hiệu chỉnh nhanh
  };

  const nowIso = new Date().toISOString();

  const profile: UserProfile = {
    uid: input.uid,
    displayName: input.displayName.trim(),
    gender: input.gender,
    areaLabel: input.areaLabel,
    position: input.position,
    dominantHand: input.dominantHand,
    selfDeclaredLevel: initialLevel,
    role: 'player', // Mặc định luôn là player (chống privilege escalation)
    skill,
    fcmTokens: input.fcmTokens || [],
    schemaVersion: 1,
    isDeleted: false,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  if (input.phoneNumber) {
    profile.phoneNumber = input.phoneNumber.replace(/\s+/g, '');
  }

  if (input.avatarUrl) {
    profile.avatarUrl = input.avatarUrl;
  }

  return profile;
}

/**
 * Kiểm tra tính hợp lệ của dữ liệu cập nhật hồ sơ cá nhân
 * Ngăn chặn tuyệt đối việc cố tình sửa các trường bất biến hoặc leo thang đặc quyền
 */
export function validateUpdateProfileInput(
  updates: Record<string, any>
): ValidationResult {
  const errors: string[] = [];

  // DANH SÁCH TRƯỜNG CẤM CLIENT TỰ SỬA
  const FORBIDDEN_FIELDS = [
    'uid',
    'role',
    'skill',
    'rating',
    'reliability',
    'matchesPlayed',
    'isProvisional',
    'isDeleted',
    'schemaVersion',
    'createdAt',
  ];

  for (const field of FORBIDDEN_FIELDS) {
    if (field in updates) {
      errors.push(`Trường "${field}" là bất biến hoặc chỉ do hệ thống quản lý. Client không được phép tự sửa.`);
    }
  }

  // Kiểm tra tên hiển thị nếu có cập nhật
  if ('displayName' in updates) {
    if (typeof updates.displayName !== 'string') {
      errors.push('Tên hiển thị phải là chuỗi văn bản.');
    } else {
      const trimmed = updates.displayName.trim();
      if (trimmed.length < 2 || trimmed.length > 50) {
        errors.push('Tên hiển thị cập nhật phải từ 2 đến 50 ký tự.');
      }
    }
  }

  // Kiểm tra giới tính nếu có cập nhật
  if ('gender' in updates && updates.gender !== 'M' && updates.gender !== 'F') {
    errors.push('Giới tính phải là "M" (Nam) hoặc "F" (Nữ).');
  }

  // Kiểm tra khu vực nếu có cập nhật
  if ('areaLabel' in updates && !isValidDistrict(updates.areaLabel)) {
    errors.push(`Khu vực "${updates.areaLabel}" không hợp lệ tại Đà Nẵng.`);
  }

  // Kiểm tra vị trí nếu có cập nhật
  if ('position' in updates && !['front', 'back', 'both'].includes(updates.position)) {
    errors.push('Vị trí sở trường không hợp lệ.');
  }

  // Kiểm tra tay thuận nếu có cập nhật
  if ('dominantHand' in updates && !['right', 'left'].includes(updates.dominantHand)) {
    errors.push('Tay thuận không hợp lệ.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Cập nhật thông tin hồ sơ của người chơi một cách an toàn
 */
export function updateUserProfile(
  current: UserProfile,
  updates: UpdateUserProfileInput
): UserProfile {
  const validation = validateUpdateProfileInput(updates as Record<string, any>);
  if (!validation.isValid) {
    throw new Error(`Dữ liệu cập nhật không hợp lệ: ${validation.errors.join('; ')}`);
  }

  return {
    ...current,
    displayName: updates.displayName !== undefined ? updates.displayName.trim() : current.displayName,
    gender: updates.gender !== undefined ? updates.gender : current.gender,
    phoneNumber: updates.phoneNumber !== undefined ? updates.phoneNumber.replace(/\s+/g, '') : current.phoneNumber,
    avatarUrl: updates.avatarUrl !== undefined ? updates.avatarUrl : current.avatarUrl,
    areaLabel: updates.areaLabel !== undefined ? updates.areaLabel : current.areaLabel,
    position: updates.position !== undefined ? updates.position : current.position,
    dominantHand: updates.dominantHand !== undefined ? updates.dominantHand : current.dominantHand,
    fcmTokens: updates.fcmTokens !== undefined ? updates.fcmTokens : current.fcmTokens,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Trích xuất ảnh chụp thông tin người chơi (Snapshot) để nhúng vào Roster hoặc đơn xin vào sân
 */
export function createPlayerSnapshot(user: UserProfile): PlayerSnapshot {
  return {
    displayName: user.displayName,
    gender: user.gender,
    rating: user.skill.rating,
    level: user.selfDeclaredLevel,
    position: user.position,
    dominantHand: user.dominantHand,
    reliability: user.skill.reliability,
  };
}
