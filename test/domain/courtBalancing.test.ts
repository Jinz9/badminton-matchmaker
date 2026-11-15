import {
  balanceCourt,
  swapPlayers,
  distributePlayersToCourts,
} from "../../src/domain/balancing/balanceCourt";
import { BalancingMember } from "../../src/domain/balancing/types";

describe("Session Balancing Domain Algorithm (WBS 3.3 & M6, CR-01)", () => {
  // Helper tạo danh sách người chơi
  const createMemberList = (
    count: number,
    category: "men" | "women" | "mixed" = "men",
    ratingStep: number = 50,
    baseRating: number = 1400
  ): BalancingMember[] => {
    const members: BalancingMember[] = [];
    const positions = ["front", "back", "both"] as const;

    for (let i = 1; i <= count; i++) {
      let gender: "M" | "F" = "M";
      if (category === "women") {
        gender = "F";
      } else if (category === "mixed") {
        gender = i % 2 === 0 ? "F" : "M";
      }

      members.push({
        id: `u_${i}`,
        name: `Player ${i}`,
        gender,
        rating: baseRating + (i - 1) * ratingStep,
        position: positions[i % 3],
        dominantHand: i % 3 === 0 ? "left" : "right",
        gamesPlayed: 0,
      });
    }
    return members;
  };

  describe("1. Kích thước 4 người (Một trận đôi chuẩn)", () => {
    it("Xếp 4 người thành 2 đội cân bằng nhất (a + d) vs (b + c)", () => {
      // 4 người có Elo: 1600 (a), 1550 (b), 1450 (c), 1400 (d)
      // Cách 1: (1600 + 1400 = 3000) vs (1550 + 1450 = 3000) -> diff = 0
      const members: BalancingMember[] = [
        { id: "u1", name: "A", gender: "M", rating: 1600 },
        { id: "u2", name: "B", gender: "M", rating: 1550 },
        { id: "u3", name: "C", gender: "M", rating: 1450 },
        { id: "u4", name: "D", gender: "M", rating: 1400 },
      ];

      const res = balanceCourt(members, { category: "men", targetMatches: 1 });
      expect(res.matches).toHaveLength(1);

      const m = res.matches[0];
      expect(m.diff).toBe(0);
      expect(m.ratingA).toBe(3000);
      expect(m.ratingB).toBe(3000);
      expect(m.restingMembers).toHaveLength(0); // Không ai nghỉ
    });

    it("Từ chối nếu số người < 4 hoặc > 8 (Bất biến CR-01)", () => {
      const under3 = createMemberList(3);
      expect(() => balanceCourt(under3, { category: "men" })).toThrow(/từ 4 đến 8 người/);

      const over9 = createMemberList(9);
      expect(() => balanceCourt(over9, { category: "men" })).toThrow(/từ 4 đến 8 người/);
    });
  });

  describe("2. Ca lẻ 5 người và 7 người (Luân phiên người nghỉ công bằng)", () => {
    it("5 người: Mỗi trận đúng 4 người đánh, 1 người nghỉ luân phiên", () => {
      const members = createMemberList(5, "men");
      const res = balanceCourt(members, { category: "men", targetMatches: 5 });
      expect(res.matches).toHaveLength(5);

      const restingMap: Record<string, number> = {};
      const playedMap: Record<string, number> = {};

      for (const m of res.matches) {
        expect(m.restingMembers).toHaveLength(1);
        const restingId = m.restingMembers[0].id;
        restingMap[restingId] = (restingMap[restingId] || 0) + 1;

        for (const pId of [...m.teamAIds, ...m.teamBIds]) {
          playedMap[pId] = (playedMap[pId] || 0) + 1;
        }
      }

      // Mỗi người nghỉ đúng 1 lần qua 5 trận
      for (const p of members) {
        expect(restingMap[p.id]).toBe(1);
        expect(playedMap[p.id]).toBe(4); // Đánh đúng 4 trận
      }
    });

    it("7 người: Mỗi trận 4 người đánh, 3 người nghỉ xoay vòng", () => {
      const members = createMemberList(7, "men");
      const res = balanceCourt(members, { category: "men", targetMatches: 7 });
      expect(res.matches).toHaveLength(7);

      for (const m of res.matches) {
        expect(m.restingMembers).toHaveLength(3);
        expect([...m.teamAIds, ...m.teamBIds]).toHaveLength(4);
      }

      // Độ lệch số trận giữa 2 người bất kỳ không quá 1
      const matchCounts = members.map((p) =>
        res.matches.filter((m) => m.teamAIds.includes(p.id) || m.teamBIds.includes(p.id)).length
      );
      const minPlayed = Math.min(...matchCounts);
      const maxPlayed = Math.max(...matchCounts);
      expect(maxPlayed - minPlayed).toBeLessThanOrEqual(1);
    });
  });

  describe("3. Kích thước 6 người và 8 người", () => {
    it("6 người: Lập lịch 6 trận xoay tua công bằng", () => {
      const members = createMemberList(6, "men");
      const res = balanceCourt(members, { category: "men", targetMatches: 6 });
      expect(res.matches).toHaveLength(6);
      for (const m of res.matches) {
        expect(m.restingMembers).toHaveLength(2); // 6 - 4 = 2
      }
    });

    it("8 người: Lập lịch đủ người, mỗi trận 4 người nghỉ", () => {
      const members = createMemberList(8, "mixed");
      const res = balanceCourt(members, { category: "mixed", targetMatches: 8 });
      expect(res.matches).toHaveLength(8);
      for (const m of res.matches) {
        expect(m.restingMembers).toHaveLength(4); // 8 - 4 = 4
      }
    });
  });

  describe("4. Ràng buộc giới tính theo nội dung sân", () => {
    it("Nội dung 'mixed' (Đôi nam nữ): Mỗi đội luôn gồm 1 Nam + 1 Nữ", () => {
      // 4 người: 2 nam (u1, u3) và 2 nữ (u2, u4)
      const members = createMemberList(4, "mixed");
      const res = balanceCourt(members, { category: "mixed", targetMatches: 1 });
      const m = res.matches[0];

      // Team A: 1 Nam + 1 Nữ
      const teamAGenders = m.teamA.map((p) => p.gender);
      expect(teamAGenders).toContain("M");
      expect(teamAGenders).toContain("F");

      // Team B: 1 Nam + 1 Nữ
      const teamBGenders = m.teamB.map((p) => p.gender);
      expect(teamBGenders).toContain("M");
      expect(teamBGenders).toContain("F");
    });

    it("Cảnh báo CATEGORY_MISMATCH nếu sân đôi nam có nữ hoặc đôi nữ có nam", () => {
      const members = createMemberList(4, "mixed"); // Có cả nam lẫn nữ
      const res = balanceCourt(members, { category: "men" });
      expect(res.warnings.some((w) => w.includes("CATEGORY_MISMATCH"))).toBe(true);
    });
  });

  describe("5. Các ca biên về điểm số và độ lệch Elo", () => {
    it("Tất cả người chơi cùng điểm Elo -> Độ lệch diff = 0", () => {
      const sameEloMembers: BalancingMember[] = [
        { id: "u1", name: "A", gender: "M", rating: 1500 },
        { id: "u2", name: "B", gender: "M", rating: 1500 },
        { id: "u3", name: "C", gender: "M", rating: 1500 },
        { id: "u4", name: "D", gender: "M", rating: 1500 },
      ];

      const res = balanceCourt(sameEloMembers, { category: "men", targetMatches: 1 });
      expect(res.matches[0].diff).toBe(0);
      expect(res.matches[0].isUnbalanced).toBe(false);
    });

    it("Một người có điểm cực cao -> Chọn phương án tối ưu nhất và gắn cảnh báo UNBALANCED_MATCH", () => {
      // 1 người 2000 Elo, 3 người 1200 Elo
      const extremeMembers: BalancingMember[] = [
        { id: "pro", name: "Pro", gender: "M", rating: 2000 },
        { id: "u1", name: "Noob 1", gender: "M", rating: 1200 },
        { id: "u2", name: "Noob 2", gender: "M", rating: 1200 },
        { id: "u3", name: "Noob 3", gender: "M", rating: 1200 },
      ];

      const res = balanceCourt(extremeMembers, { category: "men", targetMatches: 1, maxDiffWarn: 200 });
      const m = res.matches[0];

      // Đội Pro: 2000 + 1200 = 3200; Đội còn lại: 1200 + 1200 = 2400 -> diff = 800
      expect(m.diff).toBe(800);
      expect(m.isUnbalanced).toBe(true);
      expect(m.warning).toContain("UNBALANCED_MATCH");
      expect(res.warnings.some((w) => w.includes("UNBALANCED_MATCH"))).toBe(true);
    });
  });

  describe("6. Bất biến hệ thống (System Invariants) & Tính Deterministic", () => {
    it("Bất biến: Không ai vừa thi đấu vừa nghỉ trong cùng một trận", () => {
      const members = createMemberList(6, "men");
      const res = balanceCourt(members, { category: "men", targetMatches: 6 });

      for (const m of res.matches) {
        const activeIds = new Set([...m.teamAIds, ...m.teamBIds]);
        for (const restingId of m.restingIds) {
          expect(activeIds.has(restingId)).toBe(false);
        }
        // Tổng người thi đấu + người nghỉ = 6
        expect(activeIds.size + m.restingIds.length).toBe(6);
      }
    });

    it("Tính Deterministic: Cùng danh sách + cùng seed -> Cho ra kết quả giống hệt nhau 100%", () => {
      const members = createMemberList(7, "men");
      const res1 = balanceCourt(members, { category: "men", targetMatches: 5, seed: 12345 });
      const res2 = balanceCourt(members, { category: "men", targetMatches: 5, seed: 12345 });

      expect(res1.matches).toEqual(res2.matches);
    });
  });

  describe("7. Hoán đổi thủ công (swapPlayers)", () => {
    it("Cho phép Host đổi vị trí giữa Team A và Team B, tự động tính lại diff", () => {
      const members = createMemberList(4, "men");
      const res = balanceCourt(members, { category: "men", targetMatches: 1 });
      const originalMatch = res.matches[0];

      // Đổi người thứ 2 của Team A sang Team B
      const playerA = originalMatch.teamAIds[1];
      const playerB = originalMatch.teamBIds[0];

      const swapRes = swapPlayers(originalMatch, playerA, playerB, "men");
      expect(swapRes.isValid).toBe(true);
      expect(swapRes.match.teamAIds).toContain(playerB);
      expect(swapRes.match.teamBIds).toContain(playerA);
      expect(swapRes.match.ratingA).toBe(
        swapRes.match.teamA[0].rating + swapRes.match.teamA[1].rating
      );
    });

    it("Cảnh báo khi đổi làm mất cân bằng giới tính trong Đôi nam nữ", () => {
      const members = createMemberList(4, "mixed");
      const res = balanceCourt(members, { category: "mixed", targetMatches: 1 });
      const match = res.matches[0];

      // Đổi 1 Nam của Team A lấy 1 Nữ của Team B -> Team A thành 2 Nữ, Team B thành 2 Nam
      const maleA = match.teamA.find((p) => p.gender === "M")!.id;
      const femaleB = match.teamB.find((p) => p.gender === "F")!.id;

      const swapRes = swapPlayers(match, maleA, femaleB, "mixed");
      expect(swapRes.isValid).toBe(true);
      expect(swapRes.warning).toContain("mất cân bằng giới tính");
    });
  });

  describe("8. Phân bổ người chơi cho kèo 2 sân (distributePlayersToCourts - CR-01)", () => {
    it("Phân bổ 16 người vào 2 sân khác nội dung (Sân 1 Đôi nam, Sân 2 Đôi nữ)", () => {
      const males = createMemberList(8, "men", 20, 1400);
      const females = createMemberList(8, "women", 20, 1350);
      const all16 = [...males, ...females];

      const distributed = distributePlayersToCourts(all16, [
        { courtNumber: 1, category: "men" },
        { courtNumber: 2, category: "women" },
      ]);

      expect(distributed.court1Members).toHaveLength(8);
      expect(distributed.court1Members.every((m) => m.gender === "M")).toBe(true);

      expect(distributed.court2Members).toHaveLength(8);
      expect(distributed.court2Members.every((m) => m.gender === "F")).toBe(true);
    });

    it("Phân bổ 12 người vào 2 sân cùng nội dung: Chia đều theo trình độ", () => {
      const all12 = createMemberList(12, "men", 30, 1300);
      const distributed = distributePlayersToCourts(all12, [
        { courtNumber: 1, category: "men" },
        { courtNumber: 2, category: "men" },
      ]);

      expect(distributed.court1Members).toHaveLength(6);
      expect(distributed.court2Members).toHaveLength(6);
    });
  });
});
