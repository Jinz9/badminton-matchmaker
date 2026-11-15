import {
  calculateMatchElo,
  calculateExpectedScore,
  calculateScoreMarginMultiplier,
  processReviewCards,
} from "../../src/domain/elo/calculateElo";
import {
  validateSingleSet,
  validateMatchScores,
} from "../../src/domain/elo/scoreValidation";
import { MatchTeamPlayer, EloCalculationInput } from "../../src/domain/elo/types";
import { PostMatchCard } from "../../src/domain/types";

describe("Dynamic Double Elo & Rating Domain Algorithm (WBS 3.4 & M7)", () => {
  // Helper tạo nhanh người chơi
  const createPlayer = (
    id: string,
    rating: number,
    matchesPlayed: number = 10,
    isProvisional: boolean = false,
    reliability: number = 80,
    isGhost: boolean = false
  ): MatchTeamPlayer => ({
    userId: id,
    displayName: `Player ${id}`,
    currentRating: rating,
    matchesPlayed,
    isProvisional,
    currentReliability: reliability,
    isGhost,
  });

  describe("1. Kiểm tra tính hợp lệ của tỷ số set theo luật BWF", () => {
    it("Hợp lệ: Thắng chuẩn ở điểm 21 (21-19, 21-15, 21-0)", () => {
      expect(validateSingleSet(21, 19).isValid).toBe(true);
      expect(validateSingleSet(21, 15).isValid).toBe(true);
      expect(validateSingleSet(21, 0).isValid).toBe(true);
      expect(validateSingleSet(15, 21).winner).toBe("teamB");
    });

    it("Hợp lệ: Thắng cách biệt 2 điểm khi hòa 20-20 Deuce (22-20, 25-23, 29-27)", () => {
      expect(validateSingleSet(22, 20).isValid).toBe(true);
      expect(validateSingleSet(25, 23).isValid).toBe(true);
      expect(validateSingleSet(29, 27).isValid).toBe(true);
    });

    it("Hợp lệ: Chạm trần tối đa 30 điểm (30-29 hoặc 30-28)", () => {
      expect(validateSingleSet(30, 29).isValid).toBe(true);
      expect(validateSingleSet(28, 30).isValid).toBe(true);
    });

    it("Từ chối: Tỷ số hòa, điểm âm, hoặc chưa đạt 21 điểm", () => {
      expect(validateSingleSet(20, 20).isValid).toBe(false); // Hòa
      expect(validateSingleSet(18, 15).isValid).toBe(false); // Chưa tới 21
      expect(validateSingleSet(-1, 21).isValid).toBe(false); // Âm
    });

    it("Từ chối: Tỷ số sai luật cách biệt (21-20) hoặc vượt trần 30 điểm (31-29)", () => {
      expect(validateSingleSet(21, 20).isValid).toBe(false); // Chưa cách 2 điểm
      expect(validateSingleSet(31, 29).isValid).toBe(false); // Vượt trần 30 điểm
      expect(validateSingleSet(25, 20).isValid).toBe(false); // Đã kết thúc ở 21-20? Không hợp lệ
    });

    it("Kiểm tra toàn bộ trận đấu (1 set hoặc 3 set thắng 2)", () => {
      // Trận 1 set
      const match1Set = [{ setNumber: 1, scoreA: 21, scoreB: 18 }];
      expect(validateMatchScores(match1Set).winner).toBe("teamA");

      // Trận 3 set lội ngược dòng 2-1
      const match3Sets = [
        { setNumber: 1, scoreA: 19, scoreB: 21 },
        { setNumber: 2, scoreA: 21, scoreB: 17 },
        { setNumber: 3, scoreA: 21, scoreB: 15 },
      ];
      const res3 = validateMatchScores(match3Sets);
      expect(res3.isValid).toBe(true);
      expect(res3.winner).toBe("teamA");
      expect(res3.setsWonA).toBe(2);
      expect(res3.setsWonB).toBe(1);

      // Từ chối nếu 2-0 mà vẫn có set 3
      const invalid3Sets = [
        { setNumber: 1, scoreA: 21, scoreB: 15 },
        { setNumber: 2, scoreA: 21, scoreB: 18 },
        { setNumber: 3, scoreA: 21, scoreB: 19 },
      ];
      expect(validateMatchScores(invalid3Sets).isValid).toBe(false);
    });
  });

  describe("2. Điểm kỳ vọng và Hệ số tỷ số set (Expected Score & Multiplier)", () => {
    it("Hai đội có điểm ngang nhau -> Kỳ vọng thắng bằng nhau (0.50 - 0.50)", () => {
      const exp = calculateExpectedScore(1500, 1500);
      expect(exp.expectedA).toBe(0.5);
      expect(exp.expectedB).toBe(0.5);
    });

    it("Đội A mạnh hơn Đội B 200 Elo -> Kỳ vọng Đội A thắng ~76%", () => {
      const exp = calculateExpectedScore(1600, 1400);
      expect(exp.expectedA).toBeGreaterThan(0.75);
      expect(exp.expectedB).toBeLessThan(0.25);
    });

    it("Tính hệ số tỷ số set: Thắng áp đảo nhận multiplier cao hơn thắng sát nút", () => {
      const closeSets = [{ setNumber: 1, scoreA: 21, scoreB: 19 }]; // Chênh 2 quả
      const blowOutSets = [{ setNumber: 1, scoreA: 21, scoreB: 8 }]; // Chênh 13 quả

      const multClose = calculateScoreMarginMultiplier(closeSets, "teamA");
      const multBlowOut = calculateScoreMarginMultiplier(blowOutSets, "teamA");

      expect(multClose).toBeLessThan(multBlowOut);
      expect(multBlowOut).toBeGreaterThanOrEqual(1.15);
      expect(multBlowOut).toBeLessThanOrEqual(1.25);
    });
  });

  describe("3. Tính toán Elo cho trận đấu đôi (calculateMatchElo)", () => {
    it("Hai đội ngang điểm (cùng 1500), Đội A thắng sát nút 21-19 (Standard K=24)", () => {
      const input: EloCalculationInput = {
        teamA: [createPlayer("a1", 1500), createPlayer("a2", 1500)],
        teamB: [createPlayer("b1", 1500), createPlayer("b2", 1500)],
        winner: "teamA",
        sets: [{ setNumber: 1, scoreA: 21, scoreB: 19 }],
      };

      const res = calculateMatchElo(input);
      expect(res.winner).toBe("teamA");

      // Đội A được cộng Elo (~12-13 điểm)
      expect(res.teamA[0].delta).toBeGreaterThan(0);
      expect(res.teamA[0].newRating).toBeGreaterThan(1500);

      // Đội B bị trừ Elo đối xứng (~ -12-13 điểm)
      expect(res.teamB[0].delta).toBeLessThan(0);
      expect(res.teamB[0].newRating).toBeLessThan(1500);
      expect(res.teamA[0].delta).toBe(-res.teamB[0].delta);
    });

    it("Đội yếu (Underdog) lội ngược dòng thắng Đội mạnh -> Nhận được nhiều điểm hơn bình thường", () => {
      // Đội yếu B (1350) thắng Đội mạnh A (1550)
      const input: EloCalculationInput = {
        teamA: [createPlayer("a1", 1550), createPlayer("a2", 1550)],
        teamB: [createPlayer("b1", 1350), createPlayer("b2", 1350)],
        winner: "teamB", // Đội yếu thắng
        sets: [{ setNumber: 1, scoreA: 19, scoreB: 21 }],
      };

      const res = calculateMatchElo(input);
      // Đội yếu nhận được lượng điểm lớn (khoảng +18 đến +20 Elo với K=24)
      expect(res.teamB[0].delta).toBeGreaterThan(16);
      expect(res.teamA[0].delta).toBeLessThan(-16);
    });

    it("Người mới Provisional (<= 5 trận, K=40) nhận lượng điểm biến động lớn hơn người cũ (K=24)", () => {
      const newPlayer = createPlayer("newbie", 1400, 2, true); // 2 trận, provisional K=40
      const veteran = createPlayer("vet", 1400, 20, false);    // 20 trận, standard K=24

      const input: EloCalculationInput = {
        teamA: [newPlayer, veteran],
        teamB: [createPlayer("b1", 1400), createPlayer("b2", 1400)],
        winner: "teamA",
        sets: [{ setNumber: 1, scoreA: 21, scoreB: 15 }],
      };

      const res = calculateMatchElo(input);
      // Cả 2 cùng đội thắng nhưng người mới nhận delta cao hơn vì K=40
      expect(res.teamA[0].kFactor).toBe(40);
      expect(res.teamA[1].kFactor).toBe(24);
      expect(res.teamA[0].delta).toBeGreaterThan(res.teamA[1].delta);
    });

    it("Thành viên Ghost (chưa có tài khoản): delta = 0, điểm không đổi", () => {
      const ghostPlayer = createPlayer("ghost_1", 1450, 0, false, 80, true); // Ghost
      const realPlayer = createPlayer("real_1", 1450, 10, false);

      const input: EloCalculationInput = {
        teamA: [ghostPlayer, realPlayer],
        teamB: [createPlayer("b1", 1450), createPlayer("b2", 1450)],
        winner: "teamA",
        sets: [{ setNumber: 1, scoreA: 21, scoreB: 18 }],
      };

      const res = calculateMatchElo(input);
      expect(res.teamA[0].isGhost).toBe(true);
      expect(res.teamA[0].delta).toBe(0);
      expect(res.teamA[0].newRating).toBe(1450);

      // Người thật cùng đội vẫn nhận điểm bình thường
      expect(res.teamA[1].delta).toBeGreaterThan(0);
    });

    it("Kẹp trong sàn 800 và trần 2200 của hệ thống", () => {
      // Người chơi ở cận sàn 805 bị thua đối thủ ngang cơ -> mất ~13 điểm -> kẹp sàn 800
      const floorPlayer = createPlayer("floor", 805);
      const inputFloor: EloCalculationInput = {
        teamA: [floorPlayer, createPlayer("a2", 805)],
        teamB: [createPlayer("b1", 805), createPlayer("b2", 805)],
        winner: "teamB",
        sets: [{ setNumber: 1, scoreA: 10, scoreB: 21 }],
      };
      const resFloor = calculateMatchElo(inputFloor);
      expect(resFloor.teamA[0].newRating).toBe(800); // Không thể dưới 800

      // Người chơi ở cận trần 2195 thắng đối thủ ngang cơ -> nhận ~13 điểm -> kẹp trần 2200
      const ceilPlayer = createPlayer("ceil", 2195);
      const inputCeil: EloCalculationInput = {
        teamA: [ceilPlayer, createPlayer("a2", 2195)],
        teamB: [createPlayer("b1", 2195), createPlayer("b2", 2195)],
        winner: "teamA",
        sets: [{ setNumber: 1, scoreA: 21, scoreB: 10 }],
      };
      const resCeil = calculateMatchElo(inputCeil);
      expect(resCeil.teamA[0].newRating).toBe(2200); // Không thể vượt 2200
    });
  });

  describe("4. Xử lý Thẻ đánh giá chéo (Review Cards & Consensus)", () => {
    it("Thẻ 'plays_better' (Đánh hay hơn khai báo) chỉ cộng +4 Elo khi có ít nhất 2 người cùng vote", () => {
      const uids = ["a1", "a2", "b1", "b2"];

      // Chỉ 1 người vote -> Không được cộng
      const cards1Vote: PostMatchCard[] = [
        { fromUserId: "b1", toUserId: "a1", tag: "plays_better" },
      ];
      const res1 = processReviewCards(uids, cards1Vote);
      expect(res1.get("a1")?.eloAdjustment).toBe(0);

      // Có 2 người khác nhau cùng vote -> Được cộng +4 Elo
      const cards2Votes: PostMatchCard[] = [
        { fromUserId: "b1", toUserId: "a1", tag: "plays_better" },
        { fromUserId: "b2", toUserId: "a1", tag: "plays_better" },
      ];
      const res2 = processReviewCards(uids, cards2Votes);
      expect(res2.get("a1")?.eloAdjustment).toBe(4);
    });

    it("Chống gian lận: Tự vote cho chính mình bị loại bỏ hoàn toàn", () => {
      const uids = ["a1", "a2", "b1", "b2"];
      const selfVoteCards: PostMatchCard[] = [
        { fromUserId: "a1", toUserId: "a1", tag: "plays_better" }, // Tự vote
        { fromUserId: "b1", toUserId: "a1", tag: "plays_better" },
      ];

      const res = processReviewCards(uids, selfVoteCards);
      // Chỉ có 1 vote hợp lệ từ b1 -> không đủ consensus 2 votes
      expect(res.get("a1")?.eloAdjustment).toBe(0);
    });

    it("Thẻ 'good_attitude' cộng điểm uy tín (+1 mỗi vote, tối đa +2)", () => {
      const uids = ["a1", "a2", "b1", "b2"];
      const attitudeCards: PostMatchCard[] = [
        { fromUserId: "a2", toUserId: "a1", tag: "good_attitude" },
        { fromUserId: "b1", toUserId: "a1", tag: "good_attitude" },
        { fromUserId: "b2", toUserId: "a1", tag: "good_attitude" },
      ];

      const res = processReviewCards(uids, attitudeCards);
      expect(res.get("a1")?.reliabilityAdjustment).toBe(2); // Kẹp tối đa +2
    });

    it("Báo cáo 'fake_level' (Khai khống trình độ) phạt -5 Elo và -2 uy tín khi có ít nhất 2 vote", () => {
      const uids = ["a1", "a2", "b1", "b2"];
      const fakeCards: PostMatchCard[] = [
        { fromUserId: "b1", toUserId: "a1", reportReason: "fake_level" },
        { fromUserId: "b2", toUserId: "a1", reportReason: "fake_level" },
      ];

      const res = processReviewCards(uids, fakeCards);
      expect(res.get("a1")?.eloAdjustment).toBe(-5);
      expect(res.get("a1")?.reliabilityAdjustment).toBe(-2);
    });
  });
});
