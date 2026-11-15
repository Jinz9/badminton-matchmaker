import {
  validateCreateUserInput,
  createUserProfile,
  validateUpdateProfileInput,
  updateUserProfile,
  createPlayerSnapshot,
  CreateUserInput,
} from '../../src/domain/user/userProfile';
import {
  DA_NANG_DISTRICTS,
  DA_NANG_VENUES,
  isValidDistrict,
  getVenuesByDistrict,
  searchVenues,
} from '../../src/config/districts';
import { UserProfile } from '../../src/domain/types';

describe('Domain: User Profile & Skill Onboarding (WBS 3.1)', () => {
  const sampleAnswers = [3, 3, 2, 3, 3, 2, 3, 3, 2, 3]; // Tổng 27 điểm -> Cấp 3 (1425)

  const validCreateInput: CreateUserInput = {
    uid: 'usr_test_01',
    displayName: 'Đào Duy Nhật',
    gender: 'M',
    phoneNumber: '0905123456',
    areaLabel: 'Hải Châu',
    position: 'back',
    dominantHand: 'right',
    onboardingAnswers: sampleAnswers,
  };

  // =========================================================================
  // 1. VALIDATION ĐẦU VÀO KHI ĐĂNG KÝ HỒ SƠ
  // =========================================================================
  describe('1. validateCreateUserInput', () => {
    it('V1: Dữ liệu hợp lệ đầy đủ -> Trả về isValid = true', () => {
      const result = validateCreateUserInput(validCreateInput);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('V2: Thiếu UID hoặc UID rỗng -> Trả về lỗi', () => {
      const result = validateCreateUserInput({ ...validCreateInput, uid: '' });
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('UID'))).toBe(true);
    });

    it('V3: Tên hiển thị quá ngắn (< 2) hoặc quá dài (> 50) -> Trả về lỗi', () => {
      const tooShort = validateCreateUserInput({ ...validCreateInput, displayName: 'A' });
      expect(tooShort.isValid).toBe(false);

      const tooLong = validateCreateUserInput({
        ...validCreateInput,
        displayName: 'A'.repeat(51),
      });
      expect(tooLong.isValid).toBe(false);
    });

    it('V4: Giới tính không phải M hoặc F -> Trả về lỗi', () => {
      const result = validateCreateUserInput({
        ...validCreateInput,
        gender: 'X' as any,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('Giới tính'))).toBe(true);
    });

    it('V5: Số điện thoại sai định dạng di động VN -> Trả về lỗi', () => {
      const result = validateCreateUserInput({
        ...validCreateInput,
        phoneNumber: '12345',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('Số điện thoại'))).toBe(true);
    });

    it('V6: Khu vực không nằm trong 7 quận/huyện Đà Nẵng -> Trả về lỗi', () => {
      const result = validateCreateUserInput({
        ...validCreateInput,
        areaLabel: 'Quận 1, TP.HCM',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('quận/huyện tại Đà Nẵng'))).toBe(true);
    });

    it('V7: Vị trí sở trường hoặc tay thuận không hợp lệ -> Trả về lỗi', () => {
      const badPos = validateCreateUserInput({
        ...validCreateInput,
        position: 'center' as any,
      });
      expect(badPos.isValid).toBe(false);

      const badHand = validateCreateUserInput({
        ...validCreateInput,
        dominantHand: 'middle' as any,
      });
      expect(badHand.isValid).toBe(false);
    });

    it('V8: Thiếu cả onboardingAnswers và selfDeclaredLevel -> Trả về lỗi', () => {
      const result = validateCreateUserInput({
        ...validCreateInput,
        onboardingAnswers: undefined,
        selfDeclaredLevel: undefined,
      });
      expect(result.isValid).toBe(false);
    });

    it('V9: onboardingAnswers không đủ 10 câu hoặc có điểm ngoài 1..4 -> Trả về lỗi', () => {
      const notEnough = validateCreateUserInput({
        ...validCreateInput,
        onboardingAnswers: [1, 2, 3],
      });
      expect(notEnough.isValid).toBe(false);

      const invalidScore = validateCreateUserInput({
        ...validCreateInput,
        onboardingAnswers: [1, 2, 3, 4, 5, 2, 3, 1, 2, 3], // có điểm 5
      });
      expect(invalidScore.isValid).toBe(false);
    });
  });

  // =========================================================================
  // 2. KHỞI TẠO PROFILE VÀ SKILL TỪ DỮ LIỆU ĐĂNG KÝ
  // =========================================================================
  describe('2. createUserProfile', () => {
    it('C1: Khởi tạo từ 10 câu trắc nghiệm Onboarding -> Tính đúng cấp độ và Elo', () => {
      const profile = createUserProfile(validCreateInput);

      expect(profile.uid).toBe('usr_test_01');
      expect(profile.displayName).toBe('Đào Duy Nhật');
      expect(profile.role).toBe('player'); // Luôn mặc định là player
      expect(profile.schemaVersion).toBe(1);
      expect(profile.isDeleted).toBe(false);

      // Điểm khởi tạo từ câu trả lời (tổng 27 -> cấp 3, rating 1425)
      expect(profile.selfDeclaredLevel).toBe(3);
      expect(profile.skill.rating).toBe(1425);
      expect(profile.skill.matchesPlayed).toBe(0);
      expect(profile.skill.reliability).toBe(100); // 100 điểm uy tín khởi đầu
      expect(profile.skill.isProvisional).toBe(true); // Giai đoạn 5 trận đầu
      expect(profile.createdAt).toBeDefined();
      expect(profile.updatedAt).toBeDefined();
    });

    it('C2: Khởi tạo từ selfDeclaredLevel trực tiếp (không có bảng câu hỏi)', () => {
      const inputWithLevel: CreateUserInput = {
        ...validCreateInput,
        onboardingAnswers: undefined,
        selfDeclaredLevel: 4, // Cấp 4 (TB+) -> 1575
      };

      const profile = createUserProfile(inputWithLevel);
      expect(profile.selfDeclaredLevel).toBe(4);
      expect(profile.skill.rating).toBe(1575);
      expect(profile.skill.reliability).toBe(100);
      expect(profile.skill.isProvisional).toBe(true);
    });

    it('C3: Dữ liệu không hợp lệ -> Ném ngoại lệ có thông điệp rõ ràng', () => {
      expect(() =>
        createUserProfile({ ...validCreateInput, displayName: '' })
      ).toThrow('Dữ liệu đăng ký không hợp lệ');
    });
  });

  // =========================================================================
  // 3. CẬP NHẬT HỒ SƠ & CHỐNG SỬA BẤT BIẾN / LEO THANG
  // =========================================================================
  describe('3. validateUpdateProfileInput & updateUserProfile', () => {
    let currentProfile: UserProfile;

    beforeEach(() => {
      currentProfile = createUserProfile(validCreateInput);
      currentProfile.createdAt = '2026-11-15T00:00:00.000Z';
    });

    it('U1: Cập nhật thông tin cá nhân hợp lệ (displayName, position, areaLabel) -> Thành công', () => {
      const updates = {
        displayName: 'Nhật Đào Pro',
        position: 'both' as const,
        areaLabel: 'Thanh Khê',
      };

      const validation = validateUpdateProfileInput(updates);
      expect(validation.isValid).toBe(true);

      const updated = updateUserProfile(currentProfile, updates);
      expect(updated.displayName).toBe('Nhật Đào Pro');
      expect(updated.position).toBe('both');
      expect(updated.areaLabel).toBe('Thanh Khê');
      expect(updated.updatedAt).not.toBe(currentProfile.createdAt);
      // Các trường bất biến không bị thay đổi
      expect(updated.uid).toBe(currentProfile.uid);
      expect(updated.role).toBe('player');
      expect(updated.skill).toEqual(currentProfile.skill);
    });

    it('U2: Cố tình cập nhật trường bất biến (uid, role, skill, rating, reliability) -> Bị phát hiện và từ chối', () => {
      const forbiddenAttempts = [
        { role: 'admin' },
        { uid: 'usr_hacked' },
        { rating: 1900 },
        { skill: { rating: 2000 } },
        { reliability: 100 },
        { isDeleted: true },
        { createdAt: '2020-01-01' },
      ];

      for (const attempt of forbiddenAttempts) {
        const validation = validateUpdateProfileInput(attempt);
        expect(validation.isValid).toBe(false);
        expect(validation.errors.some((e) => e.includes('bất biến'))).toBe(true);

        expect(() => updateUserProfile(currentProfile, attempt as any)).toThrow();
      }
    });

    it('U3: Cập nhật tên hiển thị rỗng hoặc vượt quá 50 ký tự -> Bị từ chối', () => {
      const invalidName = validateUpdateProfileInput({ displayName: ' ' });
      expect(invalidName.isValid).toBe(false);
    });
  });

  // =========================================================================
  // 4. TRÍCH XUẤT PLAYER SNAPSHOT
  // =========================================================================
  describe('4. createPlayerSnapshot', () => {
    it('S1: Trích xuất snapshot chuẩn xác từ UserProfile để dùng trong Roster', () => {
      const profile = createUserProfile(validCreateInput);
      const snapshot = createPlayerSnapshot(profile);

      expect(snapshot).toEqual({
        displayName: 'Đào Duy Nhật',
        gender: 'M',
        rating: 1425,
        level: 3,
        position: 'back',
        dominantHand: 'right',
        reliability: 100,
      });
    });
  });

  // =========================================================================
  // 5. CẤU HÌNH KHU VỰC & CỤM SÂN ĐÀ NẴNG (src/config/districts.ts)
  // =========================================================================
  describe('5. Cấu hình Quận/Huyện & Sân Đà Nẵng', () => {
    it('D1: Danh sách 7 quận/huyện chính thức tại Đà Nẵng', () => {
      expect(DA_NANG_DISTRICTS).toHaveLength(7);
      expect(DA_NANG_DISTRICTS).toContain('Hải Châu');
      expect(DA_NANG_DISTRICTS).toContain('Thanh Khê');
      expect(DA_NANG_DISTRICTS).toContain('Sơn Trà');
      expect(DA_NANG_DISTRICTS).toContain('Ngũ Hành Sơn');
      expect(DA_NANG_DISTRICTS).toContain('Cẩm Lệ');
      expect(DA_NANG_DISTRICTS).toContain('Liên Chiểu');
      expect(DA_NANG_DISTRICTS).toContain('Hòa Vang');
    });

    it('D2: isValidDistrict xác thực chính xác', () => {
      expect(isValidDistrict('Hải Châu')).toBe(true);
      expect(isValidDistrict('Thanh Khê')).toBe(true);
      expect(isValidDistrict('Hà Nội')).toBe(false);
      expect(isValidDistrict('')).toBe(false);
    });

    it('D3: Cụm sân tiêu biểu chứa các sân nổi tiếng', () => {
      expect(DA_NANG_VENUES.length).toBeGreaterThanOrEqual(8);
      const kyDong = DA_NANG_VENUES.find((v) => v.id === 'venue_ky_dong');
      expect(kyDong).toBeDefined();
      expect(kyDong?.district).toBe('Thanh Khê');
      expect(kyDong?.courtCount).toBeGreaterThan(0);
    });

    it('D4: getVenuesByDistrict lọc đúng sân theo quận', () => {
      const haiChauVenues = getVenuesByDistrict('Hải Châu');
      expect(haiChauVenues.length).toBeGreaterThanOrEqual(3);
      expect(haiChauVenues.every((v) => v.district === 'Hải Châu')).toBe(true);
    });

    it('D5: searchVenues tìm kiếm chính xác theo tên và địa chỉ', () => {
      const results = searchVenues('Kỳ Đồng');
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].name).toContain('Kỳ Đồng');

      const all = searchVenues('');
      expect(all).toHaveLength(DA_NANG_VENUES.length);
    });
  });
});
