import {
  computeSlots,
  canOpenRecruitment,
  validateAddCoreMember,
} from "../../src/domain/recruit/slotCalculation";
import {
  genderAllowed,
  getAvailableGenderSlots,
  validateJoinEligibility,
} from "../../src/domain/recruit/eligibility";
import {
  computeRecruitFitScore,
  rankRecruitRequests,
} from "../../src/domain/recruit/heuristicFit";
import { CourtDoc, SessionDoc, UserProfile, RosterMember, JoinRequestDoc } from "../../src/domain/types";

describe("Recruit Slots Domain Logic (WBS 3.2 & CR-02)", () => {
  // Helper tạo mock session
  const createMockSession = (overrides: Partial<SessionDoc> = {}): SessionDoc => ({
    id: "sess-01",
    hostId: "host-01",
    hostName: "Chủ kèo Tuấn",
    hostReputation: 90,
    title: "Giao lưu cầu lông tối thứ 4",
    venueName: "Sân Kỳ Đồng",
    address: "Kỳ Đồng, Thanh Khê",
    district: "Thanh Khê",
    startsAt: "2026-11-20T18:00:00.000Z",
    durationMin: 120,
    costPerPlayer: 50000,
    status: "open",
    courtCount: 1,
    courtSummaries: [],
    openSlotsTotal: 3,
    schemaVersion: 1,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  });

  // Helper tạo mock court
  const createMockCourt = (overrides: Partial<CourtDoc> = {}): CourtDoc => ({
    id: "1",
    sessionId: "sess-01",
    courtNumber: 1,
    category: "mixed",
    levelMin: 3,
    levelMax: 5,
    minReliability: 60,
    pairingMode: "auto",
    recruitOpen: true,
    roster: {},
    pairs: [],
    version: 1,
    updatedAt: new Date().toISOString(),
    ...overrides,
  });

  // Helper tạo roster member
  const createMember = (
    id: string,
    gender: "M" | "F",
    type: "core" | "recruit" = "core",
    position: "front" | "back" | "both" = "both",
    rating: number = 1450
  ): RosterMember => ({
    memberId: id,
    displayName: `Member ${id}`,
    gender,
    type,
    rating,
    level: 3,
    position,
    dominantHand: "right",
    isGhost: false,
    checkedIn: false,
    joinedAt: new Date().toISOString(),
  });

  // Helper tạo mock user profile
  const createMockUser = (overrides: Partial<UserProfile> = {}): UserProfile => ({
    uid: "cand-01",
    displayName: "Ứng viên A",
    gender: "M",
    areaLabel: "Hải Châu",
    position: "front",
    dominantHand: "right",
    selfDeclaredLevel: 3,
    role: "player",
    skill: {
      rating: 1450,
      matchesPlayed: 10,
      reliability: 80,
      isProvisional: false,
    },
    fcmTokens: [],
    schemaVersion: 1,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  });

  describe("1. Tính số suất tuyển vãng lai (computeSlots - Luật R4)", () => {
    it("Mặc định 4 người -> Suất tuyển tối đa 4 (ca suất = 4)", () => {
      const res = computeSlots(4, 0);
      expect(res.total).toBe(4);
      expect(res.open).toBe(4);
      expect(res.overbooked).toBe(false);
    });

    it("Mặc định 5 người -> Suất tuyển tối đa 3 (ca mặc định 5 thì suất 3)", () => {
      const res = computeSlots(5, 0);
      expect(res.total).toBe(3);
      expect(res.open).toBe(3);
    });

    it("Mặc định 6 người -> Suất tuyển tối đa 2", () => {
      const res = computeSlots(6, 0);
      expect(res.total).toBe(2);
      expect(res.open).toBe(2);
    });

    it("Mặc định 7 người -> Suất tuyển tối đa 1 (ca suất = 1)", () => {
      const res = computeSlots(7, 0);
      expect(res.total).toBe(1);
      expect(res.open).toBe(1);
    });

    it("Mặc định 8 người -> Không tuyển vãng lai (ca suất = 0, mặc định 8 không tuyển)", () => {
      const res = computeSlots(8, 0);
      expect(res.total).toBe(0);
      expect(res.open).toBe(0);
    });

    it("Khi đã có vãng lai được duyệt: open = total - recruitConfirmed", () => {
      // Sân có 5 người mặc định (tối đa 3 vãng lai), đã duyệt 2 vãng lai -> còn 1 suất trống
      const res = computeSlots(5, 2);
      expect(res.total).toBe(3);
      expect(res.open).toBe(1);

      // Đã duyệt đủ 3 vãng lai -> hết suất (open = 0)
      const fullRes = computeSlots(5, 3);
      expect(fullRes.open).toBe(0);
    });

    it("Ném ngoại lệ nếu số người âm", () => {
      expect(() => computeSlots(-1, 0)).toThrow();
      expect(() => computeSlots(4, -2)).toThrow();
    });
  });

  describe("2. Quyền mở tuyển của Host (canOpenRecruitment & Giả định A1)", () => {
    it("Cho phép mở tuyển khi sân có từ 4 đến 7 người mặc định và kèo open", () => {
      const court = createMockCourt({
        roster: {
          u1: createMember("u1", "M", "core"),
          u2: createMember("u2", "M", "core"),
          u3: createMember("u3", "F", "core"),
          u4: createMember("u4", "F", "core"),
        },
      });
      const session = createMockSession();

      const check = canOpenRecruitment(court, session);
      expect(check.allowed).toBe(true);
    });

    it("Chặn mở tuyển nếu sân có dưới 4 người mặc định (Giả định A1)", () => {
      const court = createMockCourt({
        roster: {
          u1: createMember("u1", "M", "core"),
          u2: createMember("u2", "M", "core"),
          u3: createMember("u3", "F", "core"),
        }, // Chỉ có 3 core
      });
      const session = createMockSession();

      const check = canOpenRecruitment(court, session);
      expect(check.allowed).toBe(false);
      expect(check.reason).toContain("tối thiểu 4 người mặc định");
    });

    it("Chặn mở tuyển nếu sân đã đủ 8 người mặc định (R3)", () => {
      const roster: Record<string, RosterMember> = {};
      for (let i = 1; i <= 8; i++) {
        roster[`u${i}`] = createMember(`u${i}`, i % 2 === 0 ? "F" : "M", "core");
      }
      const court = createMockCourt({ roster });
      const session = createMockSession();

      const check = canOpenRecruitment(court, session);
      expect(check.allowed).toBe(false);
      expect(check.reason).toContain("đã có đủ 8 người mặc định");
    });

    it("Chặn mở tuyển nếu kèo không ở trạng thái open", () => {
      const court = createMockCourt({
        roster: {
          u1: createMember("u1", "M", "core"),
          u2: createMember("u2", "M", "core"),
          u3: createMember("u3", "F", "core"),
          u4: createMember("u4", "F", "core"),
        },
      });
      const session = createMockSession({ status: "cancelled" });

      const check = canOpenRecruitment(court, session);
      expect(check.allowed).toBe(false);
      expect(check.reason).toContain("không thể mở tuyển");
    });
  });

  describe("3. Ràng buộc giới tính theo nội dung sân (genderAllowed - Luật R6)", () => {
    it("Sân đôi nam (men): Chỉ chấp nhận Nam, từ chối Nữ", () => {
      expect(genderAllowed("men", "M", [])).toBe(true);
      expect(genderAllowed("men", "F", [])).toBe(false);
    });

    it("Sân đôi nữ (women): Chỉ chấp nhận Nữ, từ chối Nam", () => {
      expect(genderAllowed("women", "F", [])).toBe(true);
      expect(genderAllowed("women", "M", [])).toBe(false);
    });

    it("Sân đôi nam nữ (mixed) với nhóm mặc định 3 nam + 1 nữ: Nhận được cả Nam và Nữ", () => {
      const roster = [
        createMember("u1", "M", "core"),
        createMember("u2", "M", "core"),
        createMember("u3", "M", "core"),
        createMember("u4", "F", "core"),
      ];

      // Đã có 3 nam, mục tiêu max(4, 3) = 4 -> thêm 1 nam được (3 + 1 <= 4)
      expect(genderAllowed("mixed", "M", roster)).toBe(true);
      // Đã có 1 nữ, mục tiêu max(4, 1) = 4 -> thêm 1 nữ được (1 + 1 <= 4)
      expect(genderAllowed("mixed", "F", roster)).toBe(true);
    });

    it("Sân đôi nam nữ (mixed) với nhóm mặc định 4 nam + 1 nữ: Đã đủ 4 Nam -> CHỈ NHẬN NỮ", () => {
      const roster = [
        createMember("u1", "M", "core"),
        createMember("u2", "M", "core"),
        createMember("u3", "M", "core"),
        createMember("u4", "M", "core"),
        createMember("u5", "F", "core"),
      ];

      // Đã có 4 nam -> chặn nam tiếp theo
      expect(genderAllowed("mixed", "M", roster)).toBe(false);
      // Vẫn nhận được nữ
      expect(genderAllowed("mixed", "F", roster)).toBe(true);
    });

    it("Tạo nhãn hiển thị suất theo giới tính chính xác (getAvailableGenderSlots)", () => {
      const roster = [
        createMember("u1", "M", "core"),
        createMember("u2", "M", "core"),
        createMember("u3", "M", "core"),
        createMember("u4", "M", "core"),
        createMember("u5", "F", "core"),
      ];

      const availability = getAvailableGenderSlots("mixed", roster, 3);
      expect(availability.maleAllowed).toBe(false);
      expect(availability.femaleAllowed).toBe(true);
      expect(availability.label).toContain("chỉ Nữ");
    });
  });

  describe("4. Kiểm tra điều kiện nộp đơn (validateJoinEligibility)", () => {
    const session = createMockSession();
    const court = createMockCourt({
      levelMin: 3,
      levelMax: 5,
      minReliability: 60,
      roster: {
        u1: createMember("u1", "M", "core"),
        u2: createMember("u2", "M", "core"),
        u3: createMember("u3", "F", "core"),
        u4: createMember("u4", "F", "core"),
      }, // 4 core -> còn 4 suất vãng lai
    });

    it("Thành công: Ứng viên thỏa mãn mọi điều kiện -> eligible = true", () => {
      const candidate = createMockUser({
        gender: "M",
        selfDeclaredLevel: 4,
        skill: { rating: 1550, matchesPlayed: 10, reliability: 85, isProvisional: false },
      });

      const res = validateJoinEligibility(court, session, candidate);
      expect(res.eligible).toBe(true);
      expect(res.canWaitlist).toBe(false);
    });

    it("Từ chối nếu người chơi đã có mặt trong sân (ALREADY_IN_SESSION - Luật R7)", () => {
      const candidate = createMockUser({ uid: "u1" }); // u1 đã có trong roster
      const res = validateJoinEligibility(court, session, candidate);
      expect(res.eligible).toBe(false);
      expect(res.errorCode).toBe("ALREADY_IN_SESSION");
    });

    it("Từ chối nếu cấp độ nằm ngoài dải (LEVEL_OUT_OF_RANGE)", () => {
      const candidateWeak = createMockUser({ selfDeclaredLevel: 1 }); // Yêu cầu 3 - 5
      const res = validateJoinEligibility(court, session, candidateWeak);
      expect(res.eligible).toBe(false);
      expect(res.errorCode).toBe("LEVEL_OUT_OF_RANGE");
    });

    it("Từ chối nếu điểm uy tín thấp hơn quy định (RELIABILITY_TOO_LOW)", () => {
      const candidateBadRep = createMockUser({
        selfDeclaredLevel: 4,
        skill: { rating: 1500, matchesPlayed: 5, reliability: 45, isProvisional: false }, // min 60
      });
      const res = validateJoinEligibility(court, session, candidateBadRep);
      expect(res.eligible).toBe(false);
      expect(res.errorCode).toBe("RELIABILITY_TOO_LOW");
    });

    it("Khi hết suất: eligible = false nhưng canWaitlist = true (NO_SLOT -> Cho vào dự bị)", () => {
      // Tạo sân Đôi nam (men) đã đủ 8 người (4 core + 4 recruit)
      const fullRoster: Record<string, RosterMember> = {
        u1: createMember("u1", "M", "core"),
        u2: createMember("u2", "M", "core"),
        u3: createMember("u3", "M", "core"),
        u4: createMember("u4", "M", "core"),
        r1: createMember("r1", "M", "recruit"),
        r2: createMember("r2", "M", "recruit"),
        r3: createMember("r3", "M", "recruit"),
        r4: createMember("r4", "M", "recruit"),
      };
      const fullCourt = createMockCourt({ category: "men", roster: fullRoster });
      const candidate = createMockUser({ gender: "M", selfDeclaredLevel: 4 });

      const res = validateJoinEligibility(fullCourt, session, candidate);
      expect(res.eligible).toBe(false);
      expect(res.canWaitlist).toBe(true);
      expect(res.errorCode).toBe("NO_SLOT");
      expect(res.message).toContain("danh sách dự bị (Waitlist)");
    });
  });

  describe("5. Host sửa số người mặc định (Giả định A4 - Hard Block)", () => {
    it("Cho phép thêm nếu tổng số người <= 8", () => {
      // 5 core + 2 recruit = 7 người -> thêm 1 core thành 8 -> Hợp lệ
      const check = validateAddCoreMember(5, 2, 1);
      expect(check.allowed).toBe(true);
    });

    it("Chặn thao tác (Hard Block) nếu thêm làm tổng người vượt quá 8", () => {
      // 5 core + 3 recruit = 8 người -> host thêm 1 core thành 9 -> BỊ CHẶN
      const check = validateAddCoreMember(5, 3, 1);
      expect(check.allowed).toBe(false);
      expect(check.reason).toContain("vượt quá giới hạn tối đa 8 người/sân");
      expect(check.reason).toContain("vui lòng hủy duyệt bớt vãng lai");
    });
  });

  describe("6. Chấm điểm độ phù hợp và xếp hạng đơn xin (Heuristic Fit Score)", () => {
    const court = createMockCourt({
      roster: {
        u1: createMember("u1", "M", "core", "back", 1450),
        u2: createMember("u2", "M", "core", "back", 1500),
        u3: createMember("u3", "F", "core", "both", 1400),
        u4: createMember("u4", "F", "core", "back", 1450),
      }, // Đang rất nhiều cầu sau (3 back, 1 both, 0 front) -> Thiếu front trầm trọng
    });

    it("Thưởng 25 điểm vị trí cho ứng viên chuyên cầu trước (front) khi nhóm đang thiếu", () => {
      const frontCandidate = createMockUser({ position: "front", skill: { rating: 1450, matchesPlayed: 10, reliability: 90, isProvisional: false } });
      const backCandidate = createMockUser({ position: "back", skill: { rating: 1450, matchesPlayed: 10, reliability: 90, isProvisional: false } });

      const fitFront = computeRecruitFitScore(frontCandidate, court, 0);
      const fitBack = computeRecruitFitScore(backCandidate, court, 0);

      expect(fitFront.positionScore).toBe(25);
      expect(fitFront.reasons).toContain("Bổ sung đúng vị trí cầu trước/bắt lưới nhóm đang thiếu");
      expect(fitBack.positionScore).toBeLessThan(25);
      expect(fitFront.totalFit).toBeGreaterThan(fitBack.totalFit);
    });

    it("Xếp hạng danh sách đơn xin theo thứ tự độ phù hợp giảm dần", () => {
      const req1: JoinRequestDoc = {
        id: "req-1",
        courtId: "1",
        sessionId: "sess-01",
        userId: "user-1",
        status: "requested",
        snapshot: {
          displayName: "Người chơi đập cầu",
          gender: "M",
          rating: 1450,
          level: 3,
          position: "back", // trùng vị trí nhóm đang thừa
          dominantHand: "right",
          reliability: 70,
        },
        createdAt: "2026-11-15T10:00:00.000Z",
      };

      const req2: JoinRequestDoc = {
        id: "req-2",
        courtId: "1",
        sessionId: "sess-01",
        userId: "user-2",
        status: "requested",
        snapshot: {
          displayName: "Người chơi bắt lưới",
          gender: "M",
          rating: 1450,
          level: 3,
          position: "front", // bù đúng vị trí thiếu
          dominantHand: "left",
          reliability: 95,
        },
        createdAt: "2026-11-15T10:05:00.000Z",
      };

      const ranked = rankRecruitRequests([req1, req2], court);
      expect(ranked[0].request.userId).toBe("user-2"); // user-2 có điểm fit cao hơn
      expect(ranked[0].fitScore.totalFit).toBeGreaterThan(ranked[1].fitScore.totalFit);
    });
  });
});
