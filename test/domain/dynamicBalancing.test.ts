import {
  handleMidSessionLeave,
  handleLateArrival,
  rebalanceTwoCourts,
  generateNextRound,
} from "../../src/domain/balancing/dynamicBalancing";
import { BalancingMember } from "../../src/domain/balancing/types";

describe("Dynamic Balancing & Court Edge Cases (M10, CR-01)", () => {
  const createMembers = (count: number, baseRating: number = 1400): BalancingMember[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `user_${i + 1}`,
      name: `Player ${i + 1}`,
      gender: (i % 2 === 0 ? "M" : "F") as "M" | "F",
      rating: baseRating + i * 50,
      gamesPlayed: 0,
    }));
  };

  describe("1. Người rời giữa buổi (Mid-session Departure)", () => {
    it("Sân 5 người có 1 người về sớm -> Sân còn 4 người, tiếp tục đánh trận 4 người chuẩn", () => {
      const members = createMembers(5);
      const result = handleMidSessionLeave(members, "user_5");

      expect(result.canContinue).toBe(true);
      expect(result.remainingMembers).toHaveLength(4);
      expect(result.remainingMembers.some((m: BalancingMember) => m.id === "user_5")).toBe(false);
      expect(result.message).toContain("còn lại 4 người");
    });

    it("Sân 8 người có 1 người về sớm -> Sân còn 7 người, tiếp tục với ca lẻ 7 người", () => {
      const members = createMembers(8);
      const result = handleMidSessionLeave(members, "user_8");

      expect(result.canContinue).toBe(true);
      expect(result.remainingMembers).toHaveLength(7);
      expect(result.newCourtMode).toBe("rotate");
    });

    it("Sân 4 người có 1 người về sớm -> Sân còn 3 người, không đủ người đánh đôi", () => {
      const members = createMembers(4);
      const result = handleMidSessionLeave(members, "user_4");

      expect(result.canContinue).toBe(false);
      expect(result.remainingMembers).toHaveLength(3);
      expect(result.reason).toBe("INSUFFICIENT_PLAYERS");
      expect(result.message).toContain("không đủ 4 người");
    });

    it("Báo lỗi nếu ID người rời không tồn tại trong sân", () => {
      const members = createMembers(5);
      expect(() => handleMidSessionLeave(members, "user_999")).toThrow(/không tồn tại/);
    });
  });

  describe("2. Người đến muộn (Late Arrival)", () => {
    it("Sân 4 người tiếp nhận 1 người đến muộn -> Thành 5 người, người mới có gamesPlayed = 0", () => {
      const members = createMembers(4);
      // Đã đánh 1 trận
      members.forEach((m) => {
        m.gamesPlayed = 1;
      });

      const latePlayer: BalancingMember = {
        id: "user_late",
        name: "Late Player",
        gender: "M",
        rating: 1550,
      };

      const result = handleLateArrival(members, latePlayer);

      expect(result.success).toBe(true);
      expect(result.updatedMembers).toHaveLength(5);
      const added = result.updatedMembers.find((m: BalancingMember) => m.id === "user_late");
      expect(added).toBeDefined();
      expect(added?.gamesPlayed).toBe(0);
      expect(result.priorityForNextRound).toBe(true);
    });

    it("Từ chối người đến muộn nếu sân đã đạt tối đa 8 người (Bất biến CR-01)", () => {
      const members = createMembers(8);
      const latePlayer: BalancingMember = {
        id: "user_overflow",
        name: "Extra Player",
        gender: "M",
        rating: 1600,
      };

      const result = handleLateArrival(members, latePlayer);

      expect(result.success).toBe(false);
      expect(result.error).toBe("COURT_FULL");
      expect(result.updatedMembers).toHaveLength(8);
      expect(result.message).toContain("tối đa 8 người");
    });

    it("Báo lỗi nếu người đến muộn đã có trong danh sách sân", () => {
      const members = createMembers(5);
      const duplicatePlayer = members[0];

      expect(() => handleLateArrival(members, duplicatePlayer)).toThrow(/đã có trong danh sách/);
    });
  });

  describe("3. Kèo 2 sân mất cân bằng người (Two-Court Dynamic Rebalancing)", () => {
    it("Điều chuyển 1 người từ sân đông sang sân thiếu khi 1 sân bị rớt xuống dưới 4 người", () => {
      // Sân 1 có 7 người, Sân 2 chỉ còn 3 người (do có người về sớm)
      const court1 = createMembers(7, 1400);
      const court2 = [
        { id: "c2_1", name: "C2 P1", gender: "M" as const, rating: 1500, gamesPlayed: 2 },
        { id: "c2_2", name: "C2 P2", gender: "F" as const, rating: 1450, gamesPlayed: 2 },
        { id: "c2_3", name: "C2 P3", gender: "M" as const, rating: 1400, gamesPlayed: 2 },
      ];

      const result = rebalanceTwoCourts(court1, court2, {
        category1: "men",
        category2: "men",
      });

      expect(result.court1Members).toHaveLength(5);
      expect(result.court2Members).toHaveLength(5); // Cân bằng 5 - 5 công bằng tuyệt đối
      expect(result.transfers).toHaveLength(2);
      expect(result.transfers[0].fromCourt).toBe(1);
      expect(result.transfers[0].toCourt).toBe(2);
    });

    it("Đề xuất dồn về 1 sân duy nhất nếu tổng số người của cả 2 sân < 8 người", () => {
      // Sân 1 có 4 người, Sân 2 chỉ có 3 người (tổng = 7 người)
      const court1 = createMembers(4, 1400);
      const court2 = createMembers(3, 1400).map((m) => ({ ...m, id: `c2_${m.id}` }));

      const result = rebalanceTwoCourts(court1, court2, {
        category1: "men",
        category2: "men",
      });

      expect(result.suggestMergeCourts).toBe(true);
      expect(result.recommendation).toContain("Dồn về 1 sân");
    });

    it("Tự động cân bằng khi 2 sân bị lệch số lượng (ví dụ 8 vs 4 -> 6 vs 6)", () => {
      const court1 = createMembers(8, 1400);
      const court2 = createMembers(4, 1400).map((m) => ({ ...m, id: `c2_${m.id}` }));

      const result = rebalanceTwoCourts(court1, court2, {
        category1: "men",
        category2: "men",
      });

      expect(result.court1Members).toHaveLength(6);
      expect(result.court2Members).toHaveLength(6);
      expect(result.transfers).toHaveLength(2); // Chuyển 2 người
    });
  });

  describe("4. Sinh từng lượt trận động (generateNextRound) cho quản lý thực tế tại sân", () => {
    it("5 người: Vòng 1 người 1 nghỉ, Vòng 2 người 1 được đánh và người khác nghỉ", () => {
      const members = createMembers(5);

      // Vòng 1
      const round1 = generateNextRound(members, { category: "men", roundIndex: 1 });
      expect(round1.matchPlan.restingMembers).toHaveLength(1);
      const restedInRound1 = round1.matchPlan.restingMembers[0].id;

      // Cập nhật gamesPlayed cho các thành viên
      const updatedMembers = members.map((m) => ({
        ...m,
        gamesPlayed: m.id === restedInRound1 ? 0 : 1,
        restCount: m.id === restedInRound1 ? 1 : 0,
      }));

      // Vòng 2
      const round2 = generateNextRound(updatedMembers, { category: "men", roundIndex: 2 });
      expect(round2.matchPlan.restingMembers).toHaveLength(1);
      const restedInRound2 = round2.matchPlan.restingMembers[0].id;

      // Người nghỉ ở vòng 1 không được nghỉ tiếp ở vòng 2
      expect(restedInRound2).not.toBe(restedInRound1);
      // Người đã nghỉ ở vòng 1 bắt buộc có mặt trong đội hình thi đấu vòng 2
      expect(
        round2.matchPlan.teamAIds.includes(restedInRound1) ||
        round2.matchPlan.teamBIds.includes(restedInRound1)
      ).toBe(true);
    });

    it("Gắn cờ cảnh báo UNBALANCED_MATCH khi chênh lệch trình độ quá lớn", () => {
      // 4 người: 2 người rất mạnh (2000, 1950) và 2 người mới tập chơi (850, 800)
      const members: BalancingMember[] = [
        { id: "pro_1", name: "Pro 1", gender: "M", rating: 2000, gamesPlayed: 0 },
        { id: "pro_2", name: "Pro 2", gender: "M", rating: 1950, gamesPlayed: 0 },
        { id: "beg_1", name: "Beginner 1", gender: "M", rating: 850, gamesPlayed: 0 },
        { id: "beg_2", name: "Beginner 2", gender: "M", rating: 800, gamesPlayed: 0 },
      ];

      const round = generateNextRound(members, { category: "men", roundIndex: 1, maxDiffWarn: 200 });

      // Phương án tốt nhất: (2000 + 800 = 2800) vs (1950 + 850 = 2800) -> diff = 0
      expect(round.matchPlan.diff).toBe(0);
      expect(round.matchPlan.isUnbalanced).toBe(false);

      // Nếu ghép lệch do ràng buộc hoặc chênh lệch không thể cân:
      // Ví dụ: 3 pro và 1 beginner: 2000, 1950, 1900, 800
      const unbalancedMembers: BalancingMember[] = [
        { id: "p1", name: "P1", gender: "M", rating: 2000, gamesPlayed: 0 },
        { id: "p2", name: "P2", gender: "M", rating: 1950, gamesPlayed: 0 },
        { id: "p3", name: "P3", gender: "M", rating: 1900, gamesPlayed: 0 },
        { id: "b1", name: "B1", gender: "M", rating: 800, gamesPlayed: 0 },
      ];

      const roundUnbalanced = generateNextRound(unbalancedMembers, {
        category: "men",
        roundIndex: 1,
        maxDiffWarn: 200,
      });

      expect(roundUnbalanced.matchPlan.diff).toBeGreaterThan(200);
      expect(roundUnbalanced.matchPlan.isUnbalanced).toBe(true);
      expect(roundUnbalanced.matchPlan.warning).toContain("UNBALANCED_MATCH");
    });
  });
});
