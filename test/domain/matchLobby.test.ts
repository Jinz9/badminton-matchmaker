import {
  validateCreateSessionInput,
  calculateCancellationPenalty,
  evaluateWaitlistPromotion,
} from "../../src/domain/lobby/lobbyValidation";
import { CreateSessionInput } from "../../src/domain/lobby/types";
import { CourtDoc, UserProfile, JoinRequestDoc } from "../../src/domain/types";

describe("Match Lobby Domain Logic (WBS 3.2 & M5, CR-01)", () => {
  const createMockHost = (overrides: Partial<UserProfile> = {}): UserProfile => ({
    uid: "host-user-01",
    displayName: "Chủ kèo Tuấn",
    gender: "M",
    areaLabel: "Hải Châu",
    position: "both",
    dominantHand: "right",
    selfDeclaredLevel: 4,
    role: "host",
    skill: {
      rating: 1550,
      matchesPlayed: 25,
      reliability: 95,
      isProvisional: false,
    },
    fcmTokens: [],
    schemaVersion: 1,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  });

  const nowIso = "2026-11-20T10:00:00.000Z";
  const validStartTime = "2026-11-20T18:00:00.000Z"; // Cách 8 tiếng

  describe("1. Kiểm tra tính hợp lệ khi tạo Phòng giao lưu (validateCreateSessionInput)", () => {
    const host = createMockHost();

    const valid1CourtInput: CreateSessionInput = {
      title: "Giao lưu cầu lông tối thứ 6",
      venueName: "Sân Kỳ Đồng",
      address: "Kỳ Đồng, Thanh Khê",
      district: "Thanh Khê",
      startsAt: validStartTime,
      durationMin: 120,
      costPerPlayer: 50000,
      courtCount: 1,
      courts: [
        {
          courtNumber: 1,
          category: "mixed",
          levelMin: 3,
          levelMax: 5,
          minReliability: 60,
          initialCoreMembers: [
            { displayName: "Tuấn", gender: "M", rating: 1550, level: 4, position: "both", dominantHand: "right", isGhost: false, checkedIn: false },
            { displayName: "Hùng", gender: "M", rating: 1450, level: 3, position: "back", dominantHand: "right", isGhost: true, checkedIn: false },
            { displayName: "Mai", gender: "F", rating: 1400, level: 3, position: "front", dominantHand: "left", isGhost: true, checkedIn: false },
            { displayName: "Lan", gender: "F", rating: 1450, level: 3, position: "both", dominantHand: "right", isGhost: true, checkedIn: false },
          ],
        },
      ],
    };

    it("Hợp lệ cho kèo 1 sân có 4 người mặc định", () => {
      const res = validateCreateSessionInput(valid1CourtInput, host, nowIso);
      expect(res.isValid).toBe(true);
      expect(res.errors).toHaveLength(0);
    });

    it("Hợp lệ cho kèo 2 sân (CR-01: Tối đa 2 sân/kèo, mỗi sân tối đa 8 người)", () => {
      const valid2CourtsInput: CreateSessionInput = {
        ...valid1CourtInput,
        courtCount: 2,
        courts: [
          valid1CourtInput.courts[0],
          {
            courtNumber: 2,
            category: "men",
            levelMin: 4,
            levelMax: 6,
            minReliability: 70,
            initialCoreMembers: [
              { displayName: "Dũng", gender: "M", rating: 1650, level: 5, position: "back", dominantHand: "right", isGhost: false, checkedIn: false },
              { displayName: "Bình", gender: "M", rating: 1600, level: 4, position: "front", dominantHand: "left", isGhost: true, checkedIn: false },
            ],
          },
        ],
      };

      const res = validateCreateSessionInput(valid2CourtsInput, host, nowIso);
      expect(res.isValid).toBe(true);
    });

    it("Từ chối nếu số sân không phải 1 hoặc 2 (ví dụ 0 sân hoặc 3 sân)", () => {
      const invalidCountInput = { ...valid1CourtInput, courtCount: 3 as any };
      const res = validateCreateSessionInput(invalidCountInput, host, nowIso);
      expect(res.isValid).toBe(false);
      expect(res.errors.some((e) => e.includes("chỉ được phép tổ chức 1 hoặc 2 sân"))).toBe(true);
    });

    it("Từ chối nếu khu vực không thuộc 7 quận/huyện Đà Nẵng", () => {
      const invalidDistrictInput = { ...valid1CourtInput, district: "Quận 1" };
      const res = validateCreateSessionInput(invalidDistrictInput, host, nowIso);
      expect(res.isValid).toBe(false);
      expect(res.errors.some((e) => e.includes("không thuộc 7 quận/huyện"))).toBe(true);
    });

    it("Từ chối nếu giờ bắt đầu dưới 30 phút hoặc trong quá khứ", () => {
      const tooSoonTime = "2026-11-20T10:15:00.000Z"; // Chỉ cách 15 phút
      const invalidTimeInput = { ...valid1CourtInput, startsAt: tooSoonTime };
      const res = validateCreateSessionInput(invalidTimeInput, host, nowIso);
      expect(res.isValid).toBe(false);
      expect(res.errors.some((e) => e.includes("tối thiểu 30 phút"))).toBe(true);
    });

    it("Từ chối nếu giới tính thành viên mặc định vi phạm nội dung sân (ví dụ Nữ trong sân Đôi nam)", () => {
      const invalidGenderCoreInput: CreateSessionInput = {
        ...valid1CourtInput,
        courts: [
          {
            courtNumber: 1,
            category: "men", // Đôi nam
            levelMin: 3,
            levelMax: 5,
            initialCoreMembers: [
              { displayName: "Bạn Nữ", gender: "F", rating: 1400, level: 3, position: "front", dominantHand: "right", isGhost: true, checkedIn: false },
            ],
          },
        ],
      };
      const res = validateCreateSessionInput(invalidGenderCoreInput, host, nowIso);
      expect(res.isValid).toBe(false);
      expect(res.errors.some((e) => e.includes("Đôi nam nhưng có thành viên mặc định là Nữ"))).toBe(true);
    });

    it("Từ chối nếu số người mặc định trên 1 sân vượt quá 8 người", () => {
      const overCapacityCores: any[] = [];
      for (let i = 1; i <= 9; i++) {
        overCapacityCores.push({ displayName: `Core ${i}`, gender: "M", rating: 1400, level: 3, position: "both", dominantHand: "right", isGhost: true, checkedIn: false });
      }

      const overCourtInput: CreateSessionInput = {
        ...valid1CourtInput,
        courts: [{ ...valid1CourtInput.courts[0], initialCoreMembers: overCapacityCores }],
      };
      const res = validateCreateSessionInput(overCourtInput, host, nowIso);
      expect(res.isValid).toBe(false);
      expect(res.errors.some((e) => e.includes("vượt quá giới hạn tối đa 8 người"))).toBe(true);
    });
  });

  describe("2. Tính phạt điểm uy tín khi hủy hoặc rời kèo (calculateCancellationPenalty - P16)", () => {
    const startsAt = "2026-11-20T18:00:00.000Z";

    it("Hủy trước 15 tiếng (>= 12h): Phạt 0 điểm uy tín (CANCEL_OVER_12_HOURS)", () => {
      const cancelTime = "2026-11-20T03:00:00.000Z"; // Trước 15 tiếng
      const res = calculateCancellationPenalty(startsAt, cancelTime);
      expect(res.penaltyPoints).toBe(0);
      expect(res.reason).toBe("CANCEL_OVER_12_HOURS");
      expect(res.hoursBeforeStart).toBe(15);
    });

    it("Hủy trước 5 tiếng (< 12h): Phạt 5 điểm uy tín (CANCEL_WITHIN_12_HOURS)", () => {
      const cancelTime = "2026-11-20T13:00:00.000Z"; // Trước 5 tiếng
      const res = calculateCancellationPenalty(startsAt, cancelTime);
      expect(res.penaltyPoints).toBe(5);
      expect(res.reason).toBe("CANCEL_WITHIN_12_HOURS");
      expect(res.hoursBeforeStart).toBe(5);
    });

    it("Bùng kèo hoặc hủy sau khi trận đã bắt đầu: Phạt 15 điểm uy tín (NO_SHOW)", () => {
      // Hủy sau giờ bắt đầu 15 phút
      const lateCancelTime = "2026-11-20T18:15:00.000Z";
      const res = calculateCancellationPenalty(startsAt, lateCancelTime);
      expect(res.penaltyPoints).toBe(15);
      expect(res.reason).toBe("NO_SHOW");

      // Đánh dấu rõ ràng isNoShow
      const noShowRes = calculateCancellationPenalty(startsAt, "2026-11-20T12:00:00.000Z", true);
      expect(noShowRes.penaltyPoints).toBe(15);
      expect(noShowRes.reason).toBe("NO_SHOW");
    });
  });

  describe("3. Thuật toán chọn người đôn từ Waitlist (evaluateWaitlistPromotion)", () => {
    // Sân đôi nam nữ (mixed) đang có: 4 nam + 2 nữ = 6 người (vừa có 1 bạn nữ rút)
    // Sân cần tuyển thêm NỮ (vì đã có 4 nam)
    const court: CourtDoc = {
      id: "1",
      sessionId: "sess-01",
      courtNumber: 1,
      category: "mixed",
      levelMin: 3,
      levelMax: 5,
      minReliability: 60,
      pairingMode: "auto",
      recruitOpen: true,
      roster: {
        m1: { memberId: "m1", displayName: "M1", gender: "M", type: "core", rating: 1450, level: 3, position: "both", dominantHand: "right", isGhost: false, checkedIn: false, joinedAt: "" },
        m2: { memberId: "m2", displayName: "M2", gender: "M", type: "core", rating: 1450, level: 3, position: "both", dominantHand: "right", isGhost: false, checkedIn: false, joinedAt: "" },
        m3: { memberId: "m3", displayName: "M3", gender: "M", type: "core", rating: 1450, level: 3, position: "both", dominantHand: "right", isGhost: false, checkedIn: false, joinedAt: "" },
        m4: { memberId: "m4", displayName: "M4", gender: "M", type: "core", rating: 1450, level: 3, position: "both", dominantHand: "right", isGhost: false, checkedIn: false, joinedAt: "" },
        f1: { memberId: "f1", displayName: "F1", gender: "F", type: "core", rating: 1450, level: 3, position: "both", dominantHand: "right", isGhost: false, checkedIn: false, joinedAt: "" },
        f2: { memberId: "f2", displayName: "F2", gender: "F", type: "recruit", rating: 1450, level: 3, position: "both", dominantHand: "right", isGhost: false, checkedIn: false, joinedAt: "" },
      },
      pairs: [],
      version: 1,
      updatedAt: "",
    };

    it("Bỏ qua ứng viên Nam nộp sớm (vì sân đã đủ 4 Nam) và đôn ứng viên Nữ nộp tiếp theo", () => {
      const waitlistRequests: JoinRequestDoc[] = [
        {
          id: "req-male",
          courtId: "1",
          sessionId: "sess-01",
          userId: "user-male",
          status: "waitlist",
          snapshot: { displayName: "Bạn Nam", gender: "M", rating: 1450, level: 4, position: "both", dominantHand: "right", reliability: 90 },
          createdAt: "2026-11-20T08:00:00.000Z", // Nộp trước
        },
        {
          id: "req-female",
          courtId: "1",
          sessionId: "sess-01",
          userId: "user-female",
          status: "waitlist",
          snapshot: { displayName: "Bạn Nữ", gender: "F", rating: 1400, level: 3, position: "front", dominantHand: "left", reliability: 85 },
          createdAt: "2026-11-20T08:30:00.000Z", // Nộp sau
        },
      ];

      const res = evaluateWaitlistPromotion(court, waitlistRequests);
      expect(res.promotedRequest).toBeDefined();
      expect(res.promotedRequest?.userId).toBe("user-female");
      expect(res.skippedRequests.map((r) => r.userId)).toContain("user-male");
    });

    it("Bỏ qua ứng viên có điểm uy tín thấp (< minReliability)", () => {
      const waitlistRequests: JoinRequestDoc[] = [
        {
          id: "req-bad-rep",
          courtId: "1",
          sessionId: "sess-01",
          userId: "user-bad-rep",
          status: "waitlist",
          snapshot: { displayName: "Bạn Nữ Uy Tín Thấp", gender: "F", rating: 1400, level: 3, position: "both", dominantHand: "right", reliability: 40 }, // min 60
          createdAt: "2026-11-20T08:00:00.000Z",
        },
      ];

      const res = evaluateWaitlistPromotion(court, waitlistRequests);
      expect(res.promotedRequest).toBeUndefined();
      expect(res.skippedRequests).toHaveLength(1);
    });

    it("Trả về undefined nếu danh sách Waitlist rỗng", () => {
      const res = evaluateWaitlistPromotion(court, []);
      expect(res.promotedRequest).toBeUndefined();
      expect(res.skippedRequests).toEqual([]);
    });
  });
});
