/**
 * MODULE XÁC THỰC VÀ QUY TẮC NGHIỆP VỤ PHÒNG KÈO (MATCH LOBBY VALIDATION)
 * Căn cứ:
 * - Skill `badminton-domain-rules` (CR-01: Tối đa 2 sân/kèo, 8 người/sân, <= 16 người/kèo)
 * - Skill `badminton-rating` & `RATING_CONFIG` (Hạn chót hủy 12h, mức phạt uy tín)
 * - Skill `recruit-slot-matching` (Quy tắc đôn Waitlist trong giao dịch)
 */

import { RULES } from "../../config/rules";
import { RATING_CONFIG } from "../../config/rating";
import { isValidDistrict } from "../../config/districts";
import { CourtDoc, UserProfile, JoinRequestDoc } from "../types";
import { genderAllowed } from "../recruit/eligibility";
import {
  CreateSessionInput,
  CancellationPenaltyResult,
  WaitlistPromotionResult,
} from "./types";

/**
 * Xác thực dữ liệu đầu vào khi Host tạo phòng giao lưu mới
 */
export function validateCreateSessionInput(
  input: CreateSessionInput,
  hostProfile: UserProfile,
  nowIso: string = new Date().toISOString()
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 1. Kiểm tra tiêu đề và địa điểm
  if (!input.title || input.title.trim().length < 5 || input.title.trim().length > 100) {
    errors.push("Tiêu đề buổi đánh phải từ 5 đến 100 ký tự");
  }
  if (!input.venueName || input.venueName.trim().length === 0) {
    errors.push("Tên sân cầu lông không được để trống");
  }
  if (!input.address || input.address.trim().length === 0) {
    errors.push("Địa chỉ sân không được để trống");
  }

  // 2. Kiểm tra quận/huyện thuộc Đà Nẵng
  if (!isValidDistrict(input.district)) {
    errors.push(`Khu vực "${input.district}" không thuộc 7 quận/huyện chính thức của Đà Nẵng`);
  }

  // 3. Kiểm tra số sân (CR-01: 1 hoặc 2 sân, không áp 8-16 một lượt của kế hoạch gốc)
  if (input.courtCount !== 1 && input.courtCount !== 2) {
    errors.push("Mỗi buổi đánh chỉ được phép tổ chức 1 hoặc 2 sân (tối đa 16 người)");
  }
  if (!input.courts || input.courts.length !== input.courtCount) {
    errors.push(`Số lượng cấu hình sân (${input.courts?.length || 0}) không khớp với số sân đã chọn (${input.courtCount})`);
  }

  // 4. Kiểm tra thời gian bắt đầu (phải cách hiện tại ít nhất 30 phút)
  const startTime = new Date(input.startsAt).getTime();
  const nowTime = new Date(nowIso).getTime();
  if (isNaN(startTime)) {
    errors.push("Thời điểm bắt đầu không đúng định dạng ngày giờ (ISO 8601)");
  } else if (startTime < nowTime + 30 * 60 * 1000) {
    errors.push("Thời điểm bắt đầu phải cách hiện tại tối thiểu 30 phút");
  }

  // 5. Kiểm tra thời lượng buổi đánh (từ 60 đến 360 phút)
  if (!input.durationMin || input.durationMin < 60 || input.durationMin > 360) {
    errors.push("Thời lượng buổi đánh phải từ 60 đến 360 phút (chuẩn 120 phút)");
  }

  // 6. Kiểm tra chi phí chia sẻ
  if (input.costPerPlayer === undefined || input.costPerPlayer < 0) {
    errors.push("Chi phí mỗi người chơi không được âm");
  }

  // 7. Kiểm tra từng sân đấu
  let totalCoreAllCourts = 0;
  const courtNumbersSeen = new Set<number>();

  if (input.courts) {
    for (const c of input.courts) {
      if (courtNumbersSeen.has(c.courtNumber)) {
        errors.push(`Mã số sân ${c.courtNumber} bị trùng lặp`);
      }
      courtNumbersSeen.add(c.courtNumber);

      if (!RULES.CATEGORIES.includes(c.category)) {
        errors.push(`Nội dung thi đấu "${c.category}" của Sân ${c.courtNumber} không hợp lệ (phải là men, women hoặc mixed)`);
      }

      if (c.levelMin < 1 || c.levelMin > 6 || c.levelMax < 1 || c.levelMax > 6 || c.levelMin > c.levelMax) {
        errors.push(`Dải cấp độ yêu cầu (Cấp ${c.levelMin} - ${c.levelMax}) của Sân ${c.courtNumber} không hợp lệ`);
      }

      const initialCores = c.initialCoreMembers || [];
      totalCoreAllCourts += initialCores.length;

      if (initialCores.length > RULES.COURT_CAPACITY) {
        errors.push(`Sân ${c.courtNumber} vượt quá giới hạn tối đa ${RULES.COURT_CAPACITY} người mặc định`);
      }

      // Kiểm tra giới tính của các thành viên mặc định so với nội dung sân
      for (const core of initialCores) {
        if (!core.displayName || core.displayName.trim().length === 0) {
          errors.push(`Thành viên mặc định trên Sân ${c.courtNumber} bị thiếu tên hiển thị`);
        }
        if (c.category === "men" && core.gender !== "M") {
          errors.push(`Sân ${c.courtNumber} là Đôi nam nhưng có thành viên mặc định là Nữ (${core.displayName})`);
        }
        if (c.category === "women" && core.gender !== "F") {
          errors.push(`Sân ${c.courtNumber} là Đôi nữ nhưng có thành viên mặc định là Nam (${core.displayName})`);
        }
      }
    }
  }

  // 8. Bất biến tổng số người cả kèo <= 16 người
  if (totalCoreAllCourts > input.courtCount * RULES.COURT_CAPACITY) {
    errors.push(`Tổng số người mặc định toàn bộ buổi đánh (${totalCoreAllCourts}) vượt quá giới hạn tối đa ${input.courtCount * RULES.COURT_CAPACITY} người`);
  }

  // 9. Host profile kiểm tra
  if (!hostProfile || !hostProfile.uid) {
    errors.push("Thông tin Host không hợp lệ hoặc thiếu UID");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Tính toán mức phạt điểm uy tín khi người chơi hủy hoặc bùng kèo (Skill `badminton-rating` & P16)
 *
 * @param startsAt Thời điểm bắt đầu buổi đánh (ISO 8601)
 * @param cancelTimeIso Thời điểm người chơi thực hiện thao tác hủy
 * @param isNoShow Cờ đánh dấu bùng kèo (không đến sân mà không báo)
 */
export function calculateCancellationPenalty(
  startsAt: string,
  cancelTimeIso: string = new Date().toISOString(),
  isNoShow: boolean = false
): CancellationPenaltyResult {
  const startTime = new Date(startsAt).getTime();
  const cancelTime = new Date(cancelTimeIso).getTime();
  const hoursBeforeStart = (startTime - cancelTime) / (1000 * 60 * 60);

  // 1. Trường hợp Bùng kèo (No-show) hoặc Hủy sau khi trận đấu đã bắt đầu
  if (isNoShow || hoursBeforeStart <= 0) {
    return {
      penaltyPoints: Math.abs(RATING_CONFIG.REPUTATION_CHANGE.NO_SHOW), // Phạt 15 điểm
      reason: "NO_SHOW",
      hoursBeforeStart: Math.max(0, hoursBeforeStart),
      message: `Bùng kèo hoặc hủy sát/sau giờ thi đấu: Bị trừ ${Math.abs(RATING_CONFIG.REPUTATION_CHANGE.NO_SHOW)} điểm uy tín.`,
    };
  }

  // 2. Hủy sát giờ (trong vòng 12 tiếng trước giờ đánh)
  if (hoursBeforeStart < 12) {
    return {
      penaltyPoints: Math.abs(RATING_CONFIG.REPUTATION_CHANGE.CANCEL_WITHIN_12_HOURS), // Phạt 5 điểm
      reason: "CANCEL_WITHIN_12_HOURS",
      hoursBeforeStart: Math.round(hoursBeforeStart * 10) / 10,
      message: `Hủy kèo trước giờ đấu ${Math.round(hoursBeforeStart)} tiếng (< 12h): Bị trừ ${Math.abs(RATING_CONFIG.REPUTATION_CHANGE.CANCEL_WITHIN_12_HOURS)} điểm uy tín.`,
    };
  }

  // 3. Hủy sớm có trách nhiệm (trước trên 12 tiếng)
  return {
    penaltyPoints: RATING_CONFIG.REPUTATION_CHANGE.CANCEL_OVER_12_HOURS, // 0 điểm
    reason: "CANCEL_OVER_12_HOURS",
    hoursBeforeStart: Math.round(hoursBeforeStart * 10) / 10,
    message: `Hủy kèo trước giờ đấu ${Math.round(hoursBeforeStart)} tiếng (>= 12h): Không bị trừ điểm uy tín.`,
  };
}

/**
 * Đánh giá danh sách dự bị (Waitlist) để chọn ra ứng viên hợp lệ đầu tiên đôn lên (Skill `recruit-slot-matching`)
 *
 * @param court Sân đấu sau khi đã xóa người rút
 * @param waitlistRequests Danh sách các đơn đang ở trạng thái 'waitlist'
 */
export function evaluateWaitlistPromotion(
  court: CourtDoc,
  waitlistRequests: JoinRequestDoc[]
): WaitlistPromotionResult {
  if (!waitlistRequests || waitlistRequests.length === 0) {
    return { skippedRequests: [] };
  }

  // Sắp xếp đơn dự bị theo thời gian nộp sớm nhất (FIFO)
  const sorted = [...waitlistRequests].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const skipped: JoinRequestDoc[] = [];

  for (const req of sorted) {
    const candidateSnapshot = req.snapshot;

    // 1. Kiểm tra giới tính theo đội hình sân hiện tại
    if (!genderAllowed(court.category, candidateSnapshot.gender, court.roster)) {
      skipped.push(req);
      continue;
    }

    // 2. Kiểm tra dải cấp độ
    if (
      candidateSnapshot.level < court.levelMin ||
      candidateSnapshot.level > court.levelMax
    ) {
      skipped.push(req);
      continue;
    }

    // 3. Kiểm tra điểm uy tín tối thiểu
    const minRel = court.minReliability ?? 60;
    if (candidateSnapshot.reliability < minRel) {
      skipped.push(req);
      continue;
    }

    // Ứng viên đầu tiên thỏa mãn mọi điều kiện
    return {
      promotedRequest: req,
      skippedRequests: skipped,
    };
  }

  return {
    skippedRequests: skipped,
  };
}
