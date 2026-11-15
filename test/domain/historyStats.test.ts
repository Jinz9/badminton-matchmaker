/**
 * UNIT TESTS: LỊCH SỬ ĐẤU, THỐNG KÊ TỶ LỆ THẮNG & ĐỒNG ĐỘI ĂN Ý NHẤT (WBS 3.4 & Milestone M7)
 * Căn cứ: Quyết định phê duyệt của TV1 (Ngưỡng minMatches = 5, minWinRate = 0.60)
 */

import { MatchDoc, RatingHistoryDoc, UserStatsDoc } from "../../src/domain/types";
import {
  computeBestPartners,
  calculatePersonalStats,
  buildRatingTimeSeries,
  filterAndPaginateMatches,
  enrichMatchHistory,
} from "../../src/domain/history";

describe("History & Stats Domain Algorithm (WBS 3.4 & Milestone M7)", () => {
  const currentUserId = "user_me";

  function createMatch(params: {
    id: string;
    teamA: [string, string];
    teamB: [string, string];
    winner: "teamA" | "teamB";
    category?: "men" | "women" | "mixed";
    date?: string;
    status?: "confirmed" | "finished" | "playing" | "planned";
  }): MatchDoc {
    return {
      id: params.id,
      sessionId: "session_01",
      courtId: "1",
      index: 1,
      teamA: params.teamA,
      teamB: params.teamB,
      playerIds: [...params.teamA, ...params.teamB],
      category: params.category || "men",
      sets: [{ setNumber: 1, scoreA: 21, scoreB: 18 }],
      status: params.status || "confirmed",
      winner: params.winner,
      ratingProcessed: true,
      createdAt: params.date || "2026-11-10T10:00:00Z",
      updatedAt: params.date || "2026-11-10T10:30:00Z",
    };
  }

  // ========================================================
  // PHẦN 1: CHỈ SỐ "ĐỒNG ĐỘI ĂN Ý NHẤT" (BEST PARTNERS)
  // ========================================================
  describe("1. Chỉ số 'Đồng đội ăn ý nhất' (computeBestPartners)", () => {
    it("Đạt ngưỡng đúng 60% và >= 5 trận (Ví dụ: Đánh 5 trận thắng 3 -> Đủ điều kiện)", () => {
      // Đánh cặp với partner_a 5 trận, thắng 3 trận (3/5 = 60%)
      const matches: MatchDoc[] = [
        createMatch({ id: "m1", teamA: [currentUserId, "partner_a"], teamB: ["op1", "op2"], winner: "teamA" }),
        createMatch({ id: "m2", teamA: [currentUserId, "partner_a"], teamB: ["op1", "op2"], winner: "teamA" }),
        createMatch({ id: "m3", teamA: [currentUserId, "partner_a"], teamB: ["op1", "op2"], winner: "teamA" }),
        createMatch({ id: "m4", teamA: [currentUserId, "partner_a"], teamB: ["op1", "op2"], winner: "teamB" }),
        createMatch({ id: "m5", teamA: [currentUserId, "partner_a"], teamB: ["op1", "op2"], winner: "teamB" }),
      ];

      const res = computeBestPartners(currentUserId, matches);
      expect(res.length).toBe(1);
      expect(res[0].partnerId).toBe("partner_a");
      expect(res[0].matchesCount).toBe(5);
      expect(res[0].winsCount).toBe(3);
      expect(res[0].winRate).toBe(0.60);
    });

    it("Dưới ngưỡng tỷ lệ thắng (< 60%): Bị loại khỏi danh sách ăn ý", () => {
      // Đánh 5 trận thắng 2 (2/5 = 40% < 60%)
      const matches: MatchDoc[] = [
        createMatch({ id: "m1", teamA: [currentUserId, "partner_low_wr"], teamB: ["op1", "op2"], winner: "teamA" }),
        createMatch({ id: "m2", teamA: [currentUserId, "partner_low_wr"], teamB: ["op1", "op2"], winner: "teamA" }),
        createMatch({ id: "m3", teamA: [currentUserId, "partner_low_wr"], teamB: ["op1", "op2"], winner: "teamB" }),
        createMatch({ id: "m4", teamA: [currentUserId, "partner_low_wr"], teamB: ["op1", "op2"], winner: "teamB" }),
        createMatch({ id: "m5", teamA: [currentUserId, "partner_low_wr"], teamB: ["op1", "op2"], winner: "teamB" }),
      ];

      const res = computeBestPartners(currentUserId, matches);
      expect(res.length).toBe(0);
    });

    it("Dưới ngưỡng số trận (< 5 trận): Dù thắng 100% (4/4 trận) vẫn bị loại", () => {
      // Đánh 4 trận thắng cả 4 (winRate = 100% nhưng matchesCount = 4 < 5)
      const matches: MatchDoc[] = [
        createMatch({ id: "m1", teamA: [currentUserId, "partner_few_matches"], teamB: ["op1", "op2"], winner: "teamA" }),
        createMatch({ id: "m2", teamA: [currentUserId, "partner_few_matches"], teamB: ["op1", "op2"], winner: "teamA" }),
        createMatch({ id: "m3", teamA: [currentUserId, "partner_few_matches"], teamB: ["op1", "op2"], winner: "teamA" }),
        createMatch({ id: "m4", teamA: [currentUserId, "partner_few_matches"], teamB: ["op1", "op2"], winner: "teamA" }),
      ];

      const res = computeBestPartners(currentUserId, matches);
      expect(res.length).toBe(0);
    });

    it("Quy tắc Tie-break 1: Khi tỷ lệ thắng bằng nhau -> Ưu tiên người có số trận đánh cùng nhiều hơn", () => {
      // Partner 1: Đánh 10 trận thắng 8 (8/10 = 80%)
      // Partner 2: Đánh 5 trận thắng 4 (4/5 = 80%)
      const matches: MatchDoc[] = [];

      // Partner 1 (10 trận, thắng 8)
      for (let i = 1; i <= 10; i++) {
        matches.push(
          createMatch({
            id: `p1_${i}`,
            teamA: [currentUserId, "partner_veteran"],
            teamB: ["op1", "op2"],
            winner: i <= 8 ? "teamA" : "teamB",
          })
        );
      }

      // Partner 2 (5 trận, thắng 4)
      for (let i = 1; i <= 5; i++) {
        matches.push(
          createMatch({
            id: `p2_${i}`,
            teamA: [currentUserId, "partner_newer"],
            teamB: ["op1", "op2"],
            winner: i <= 4 ? "teamA" : "teamB",
          })
        );
      }

      const res = computeBestPartners(currentUserId, matches);
      expect(res.length).toBe(2);
      expect(res[0].partnerId).toBe("partner_veteran"); // 10 trận đứng trước
      expect(res[0].matchesCount).toBe(10);
      expect(res[1].partnerId).toBe("partner_newer");   // 5 trận đứng sau
      expect(res[1].matchesCount).toBe(5);
    });

    it("Quy tắc Tie-break 2: Khi cả tỷ lệ thắng và số trận đều bằng nhau -> Ưu tiên người có trận đấu gần nhất hơn", () => {
      // Cả 2 đều đánh 5 trận thắng 4 (80%)
      // Partner Recent: Trận cuối ngày 2026-11-15
      // Partner Old: Trận cuối ngày 2026-11-01
      const matches: MatchDoc[] = [];

      for (let i = 1; i <= 5; i++) {
        matches.push(
          createMatch({
            id: `rec_${i}`,
            teamA: [currentUserId, "partner_recent"],
            teamB: ["op1", "op2"],
            winner: i <= 4 ? "teamA" : "teamB",
            date: "2026-11-15T10:00:00Z",
          })
        );
        matches.push(
          createMatch({
            id: `old_${i}`,
            teamA: [currentUserId, "partner_old"],
            teamB: ["op1", "op2"],
            winner: i <= 4 ? "teamA" : "teamB",
            date: "2026-11-01T10:00:00Z",
          })
        );
      }

      const res = computeBestPartners(currentUserId, matches);
      expect(res.length).toBe(2);
      expect(res[0].partnerId).toBe("partner_recent"); // Mới hơn xếp trên
      expect(res[1].partnerId).toBe("partner_old");
    });

    it("Không có đồng đội nào đủ điều kiện -> Trả về mảng rỗng [] an toàn", () => {
      const res = computeBestPartners(currentUserId, []);
      expect(res).toEqual([]);
    });

    it("Bỏ qua đồng đội là ghost member và trận chưa kết thúc", () => {
      const matches: MatchDoc[] = [
        // 5 trận với ghost
        createMatch({ id: "g1", teamA: [currentUserId, "ghost_vãnglai"], teamB: ["op1", "op2"], winner: "teamA" }),
        createMatch({ id: "g2", teamA: [currentUserId, "ghost_vãnglai"], teamB: ["op1", "op2"], winner: "teamA" }),
        createMatch({ id: "g3", teamA: [currentUserId, "ghost_vãnglai"], teamB: ["op1", "op2"], winner: "teamA" }),
        createMatch({ id: "g4", teamA: [currentUserId, "ghost_vãnglai"], teamB: ["op1", "op2"], winner: "teamA" }),
        createMatch({ id: "g5", teamA: [currentUserId, "ghost_vãnglai"], teamB: ["op1", "op2"], winner: "teamA" }),
        // Trận chưa kết thúc
        createMatch({ id: "p1", teamA: [currentUserId, "real_p"], teamB: ["op1", "op2"], winner: "teamA", status: "playing" }),
      ];

      const res = computeBestPartners(currentUserId, matches);
      expect(res.length).toBe(0);
    });
  });

  // ========================================================
  // PHẦN 2: THỐNG KÊ TỶ LỆ THẮNG CÁ NHÂN (calculatePersonalStats)
  // ========================================================
  describe("2. Thống kê tỷ lệ thắng cá nhân & theo nhóm", () => {
    it("Tính đúng tổng số trận, thắng, thua và tỷ lệ thắng", () => {
      const matches: MatchDoc[] = [
        createMatch({ id: "m1", teamA: [currentUserId, "p1"], teamB: ["op1", "op2"], winner: "teamA", category: "men" }),
        createMatch({ id: "m2", teamA: [currentUserId, "p1"], teamB: ["op1", "op2"], winner: "teamA", category: "men" }),
        createMatch({ id: "m3", teamB: [currentUserId, "p2"], teamA: ["op1", "op2"], winner: "teamA", category: "mixed" }), // thua
      ];

      const stats = calculatePersonalStats(currentUserId, matches);
      expect(stats.totalMatches).toBe(3);
      expect(stats.totalWins).toBe(2);
      expect(stats.totalLosses).toBe(1);
      expect(stats.overallWinRate).toBe(0.6667);
      expect(stats.byCategory.men.matches).toBe(2);
      expect(stats.byCategory.men.wins).toBe(2);
      expect(stats.byCategory.mixed.matches).toBe(1);
      expect(stats.byCategory.mixed.losses).toBe(1);
    });

    it("Thống kê theo tháng chính xác", () => {
      const matches: MatchDoc[] = [
        createMatch({ id: "oct_1", teamA: [currentUserId, "p1"], teamB: ["op1", "op2"], winner: "teamA", date: "2026-10-15T10:00:00Z" }),
        createMatch({ id: "nov_1", teamA: [currentUserId, "p1"], teamB: ["op1", "op2"], winner: "teamA", date: "2026-11-05T10:00:00Z" }),
        createMatch({ id: "nov_2", teamA: [currentUserId, "p1"], teamB: ["op1", "op2"], winner: "teamB", date: "2026-11-12T10:00:00Z" }),
      ];

      const stats = calculatePersonalStats(currentUserId, matches);
      expect(stats.byMonth["2026-10"].matches).toBe(1);
      expect(stats.byMonth["2026-10"].winRate).toBe(1.0);
      expect(stats.byMonth["2026-11"].matches).toBe(2);
      expect(stats.byMonth["2026-11"].winRate).toBe(0.5);
    });

    it("Ưu tiên sử dụng tài liệu cache UserStatsDoc nếu không có trận mới", () => {
      const cachedStats: UserStatsDoc = {
        userId: currentUserId,
        totalMatches: 20,
        totalWins: 14,
        totalLosses: 6,
        overallWinRate: 0.70,
        byCategory: {
          men: { matches: 15, wins: 11, losses: 4, winRate: 0.7333 },
          women: { matches: 0, wins: 0, losses: 0, winRate: 0 },
          mixed: { matches: 5, wins: 3, losses: 2, winRate: 0.60 },
        },
        byMonth: {
          "2026-11": { month: "2026-11", matches: 20, wins: 14, losses: 6, winRate: 0.70 },
        },
        bestPartners: [],
        updatedAt: "2026-11-15T00:00:00Z",
      };

      const stats = calculatePersonalStats(currentUserId, [], [], cachedStats);
      expect(stats.totalMatches).toBe(20);
      expect(stats.totalWins).toBe(14);
      expect(stats.overallWinRate).toBe(0.70);
    });
  });

  // ========================================================
  // PHẦN 3: DỮ LIỆU BIỂU ĐỒ & CHUỖI THỜI GIAN (TIME-SERIES)
  // ========================================================
  describe("3. Dữ liệu biểu đồ chuỗi thời gian (buildRatingTimeSeries)", () => {
    it("Tạo chuỗi thời gian điểm Elo và tỷ lệ thắng tích lũy cho TV2 dựng đồ thị", () => {
      const logs: RatingHistoryDoc[] = [
        {
          id: "log_1",
          userId: currentUserId,
          matchId: "m1",
          sessionId: "s1",
          oldRating: 1400,
          newRating: 1415,
          delta: 15,
          kFactor: 40,
          oldReliability: 80,
          newReliability: 82,
          reason: "match_result",
          createdAt: "2026-11-01T10:00:00Z",
        },
        {
          id: "log_2",
          userId: currentUserId,
          matchId: "m2",
          sessionId: "s1",
          oldRating: 1415,
          newRating: 1405,
          delta: -10,
          kFactor: 40,
          oldReliability: 82,
          newReliability: 84,
          reason: "match_result",
          createdAt: "2026-11-05T10:00:00Z",
        },
      ];

      const points = buildRatingTimeSeries(logs);
      expect(points.length).toBe(2);
      expect(points[0].rating).toBe(1415);
      expect(points[0].cumulativeWinRate).toBe(1.0); // 1 trận, 1 thắng
      expect(points[1].rating).toBe(1405);
      expect(points[1].cumulativeWinRate).toBe(0.5); // 2 trận, 1 thắng
    });
  });

  // ========================================================
  // PHẦN 4: LỌC, PHÂN TRANG & LÀM GIÀU DỮ LIỆU LỊCH SỬ ĐẤU
  // ========================================================
  describe("4. Truy vấn, Lọc & Phân trang Lịch sử đấu", () => {
    const sampleMatches: MatchDoc[] = [
      createMatch({ id: "m_nov_15", teamA: [currentUserId, "p1"], teamB: ["op1", "op2"], winner: "teamA", category: "men", date: "2026-11-15T10:00:00Z" }),
      createMatch({ id: "m_nov_10", teamA: [currentUserId, "p1"], teamB: ["op1", "op2"], winner: "teamA", category: "mixed", date: "2026-11-10T10:00:00Z" }),
      createMatch({ id: "m_nov_05", teamA: [currentUserId, "p1"], teamB: ["op1", "op2"], winner: "teamB", category: "men", date: "2026-11-05T10:00:00Z" }),
      createMatch({ id: "m_oct_20", teamA: [currentUserId, "p1"], teamB: ["op1", "op2"], winner: "teamA", category: "men", date: "2026-10-20T10:00:00Z" }),
    ];

    it("Lọc theo khoảng ngày (startDate, endDate)", () => {
      const res = filterAndPaginateMatches(sampleMatches, {
        userId: currentUserId,
        startDate: "2026-11-01T00:00:00Z",
        endDate: "2026-11-12T23:59:59Z",
      });

      expect(res.items.length).toBe(2);
      expect(res.items[0].id).toBe("m_nov_10");
      expect(res.items[1].id).toBe("m_nov_05");
    });

    it("Lọc theo nội dung thi đấu (category: 'mixed')", () => {
      const res = filterAndPaginateMatches(sampleMatches, {
        userId: currentUserId,
        category: "mixed",
      });

      expect(res.items.length).toBe(1);
      expect(res.items[0].id).toBe("m_nov_10");
    });

    it("Phân trang với cursor lastMatchId", () => {
      const page1 = filterAndPaginateMatches(sampleMatches, {
        userId: currentUserId,
        pageSize: 2,
      });

      expect(page1.items.length).toBe(2);
      expect(page1.hasMore).toBe(true);
      expect(page1.nextCursor).toBe("m_nov_10");

      const page2 = filterAndPaginateMatches(sampleMatches, {
        userId: currentUserId,
        pageSize: 2,
        lastMatchId: page1.nextCursor,
      });

      expect(page2.items.length).toBe(2);
      expect(page2.items[0].id).toBe("m_nov_05");
      expect(page2.items[1].id).toBe("m_oct_20");
      expect(page2.hasMore).toBe(false);
    });

    it("Làm giàu dữ liệu lịch sử đấu (enrichMatchHistory) ghép đúng đối thủ, tỷ số và delta Elo", () => {
      const ratingsMap = new Map<string, RatingHistoryDoc>();
      ratingsMap.set("m_nov_15", {
        id: "r1",
        userId: currentUserId,
        matchId: "m_nov_15",
        sessionId: "s1",
        oldRating: 1400,
        newRating: 1414,
        delta: 14,
        kFactor: 24,
        oldReliability: 80,
        newReliability: 82,
        reason: "match_result",
        createdAt: "2026-11-15T10:00:00Z",
      });

      const usersMap = new Map<string, { displayName: string; avatarUrl?: string }>();
      usersMap.set("p1", { displayName: "Bạn đánh cùng P1" });
      usersMap.set("op1", { displayName: "Đối thủ OP1" });
      usersMap.set("op2", { displayName: "Đối thủ OP2" });

      const enriched = enrichMatchHistory(currentUserId, [sampleMatches[0]], ratingsMap, usersMap);
      expect(enriched.length).toBe(1);
      expect(enriched[0].partner.displayName).toBe("Bạn đánh cùng P1");
      expect(enriched[0].opponents[0].displayName).toBe("Đối thủ OP1");
      expect(enriched[0].isWin).toBe(true);
      expect(enriched[0].eloDelta).toBe(14);
      expect(enriched[0].newRating).toBe(1414);
      expect(enriched[0].reliabilityDelta).toBe(2);
    });
  });
});

