/**
 * THUẬT TOÁN TÍNH ĐIỂM ELO ĐÔI ĐỘNG VÀ ĐIỂM UY TÍN (DYNAMIC DOUBLE ELO CALCULATION)
 * Căn cứ:
 * - Skill `badminton-rating`, `docs/06-rating-scale.md` & Phê duyệt của TV1 ngày 15/11/2026
 * - Công thức Elo đôi chuẩn, hệ số tỷ số set, và thẻ đánh giá chéo có consensus
 */

import { RATING_CONFIG } from "../../config/rating";
import { MatchSetScore, PostMatchCard } from "../types";
import {
  EloCalculationInput,
  MatchEloResult,
  PlayerEloResult,
  PlayerReviewSummary,
} from "./types";
import { validateMatchScores } from "./scoreValidation";

/**
 * Tính điểm kỳ vọng thắng (Expected Score) của hai đội đánh đôi
 */
export function calculateExpectedScore(
  teamRatingA: number,
  teamRatingB: number
): { expectedA: number; expectedB: number } {
  const diff = teamRatingB - teamRatingA;
  const expectedA = 1 / (1 + Math.pow(10, diff / 400));
  const expectedB = 1 - expectedA;

  return {
    expectedA: Math.round(expectedA * 1000) / 1000,
    expectedB: Math.round(expectedB * 1000) / 1000,
  };
}

/**
 * Tính hệ số nhân dựa trên chênh lệch tỷ số set (Score Margin Multiplier)
 * Multiplier = 1 + (Hiệu số set / 21) * 0.25 (kẹp tối đa 1.25, tối thiểu 1.0)
 */
export function calculateScoreMarginMultiplier(
  sets: MatchSetScore[],
  winner: "teamA" | "teamB"
): number {
  let netPointDiff = 0;

  for (const s of sets) {
    const diff = s.scoreA - s.scoreB;
    if (winner === "teamA") {
      netPointDiff += diff;
    } else {
      netPointDiff += -diff;
    }
  }

  const avgDiff = Math.max(0, netPointDiff / sets.length);
  const rawMultiplier = 1 + (avgDiff / 21) * 0.25;

  return Math.round(Math.min(1.25, Math.max(1.0, rawMultiplier)) * 100) / 100;
}

/**
 * Xử lý thẻ đánh giá chéo và tính điểm điều chỉnh có chống gian lận
 */
export function processReviewCards(
  playerUids: string[],
  cards?: PostMatchCard[]
): Map<string, { eloAdjustment: number; reliabilityAdjustment: number; summary: PlayerReviewSummary }> {
  const resultMap = new Map<
    string,
    { eloAdjustment: number; reliabilityAdjustment: number; summary: PlayerReviewSummary }
  >();

  // Khởi tạo
  for (const uid of playerUids) {
    resultMap.set(uid, {
      eloAdjustment: 0,
      reliabilityAdjustment: 0,
      summary: {
        correctLevelVotes: 0,
        playsBetterVotes: 0,
        goodAttitudeVotes: 0,
        fakeLevelVotes: 0,
      },
    });
  }

  if (!cards || cards.length === 0) {
    return resultMap;
  }

  for (const card of cards) {
    // 1. Chống tự chấm cho mình
    if (card.fromUserId === card.toUserId) {
      continue;
    }

    // 2. Chỉ tính thẻ giữa 4 người chơi trong trận
    if (!playerUids.includes(card.fromUserId) || !playerUids.includes(card.toUserId)) {
      continue;
    }

    const target = resultMap.get(card.toUserId);
    if (!target) continue;

    if (card.tag === "correct_level") {
      target.summary.correctLevelVotes += 1;
    } else if (card.tag === "plays_better") {
      target.summary.playsBetterVotes += 1;
    } else if (card.tag === "good_attitude") {
      target.summary.goodAttitudeVotes += 1;
    }

    if (card.reportReason === "fake_level") {
      target.summary.fakeLevelVotes += 1;
    }
  }

  // Áp dụng quy tắc đồng thuận (Consensus) và kẹp trần +-5 Elo
  for (const data of resultMap.values()) {
    let eloAdj = 0;
    let relAdj = 0;

    // Đánh hay hơn khai báo: Cần ít nhất 2 người cùng vote -> +4 Elo
    if (data.summary.playsBetterVotes >= 2) {
      eloAdj += 4;
    }

    // Khai khống trình độ: Cần ít nhất 2 người cùng report -> -5 Elo, -2 uy tín
    if (data.summary.fakeLevelVotes >= 2) {
      eloAdj -= 5;
      relAdj -= 2;
    }

    // Thái độ tốt: Mỗi vote +1 uy tín (tối đa +2 uy tín)
    if (data.summary.goodAttitudeVotes > 0) {
      relAdj += Math.min(2, data.summary.goodAttitudeVotes);
    }

    // Kẹp trần điều chỉnh Elo từ thẻ: tối đa +-5
    data.eloAdjustment = Math.max(-5, Math.min(5, eloAdj));
    data.reliabilityAdjustment = relAdj;
  }

  return resultMap;
}

/**
 * Hàm thuần tính toán biến động điểm Elo và điểm uy tín cho toàn bộ 4 người sau trận đấu
 */
export function calculateMatchElo(input: EloCalculationInput): MatchEloResult {
  // 1. Kiểm tra tính hợp lệ của tỷ số set
  const scoreValidation = validateMatchScores(input.sets);
  if (!scoreValidation.isValid) {
    throw new Error(`Tỷ số trận đấu không hợp lệ: ${scoreValidation.error}`);
  }

  const winner = input.winner || scoreValidation.winner!;

  // 2. Tính trung bình Elo của từng đội (Thành viên ghost vẫn đóng góp rating để tính kỳ vọng)
  const teamRatingA = (input.teamA[0].currentRating + input.teamA[1].currentRating) / 2;
  const teamRatingB = (input.teamB[0].currentRating + input.teamB[1].currentRating) / 2;

  // 3. Tính điểm kỳ vọng
  const { expectedA, expectedB } = calculateExpectedScore(teamRatingA, teamRatingB);

  // 4. Tính hệ số tỷ số set
  const multiplier = calculateScoreMarginMultiplier(input.sets, winner);

  // 5. Xử lý thẻ đánh giá chéo
  const allUids = [
    input.teamA[0].userId,
    input.teamA[1].userId,
    input.teamB[0].userId,
    input.teamB[1].userId,
  ];
  const cardResults = processReviewCards(allUids, input.reviewCards);

  // Điểm thực tế: S = 1 (thắng), S = 0 (thua)
  const scoreA = winner === "teamA" ? 1 : 0;
  const scoreB = 1 - scoreA;

  // 6. Tính toán cho từng người chơi
  const calculatePlayerResult = (
    player: typeof input.teamA[0],
    actualScore: number,
    expectedScore: number
  ): PlayerEloResult => {
    // Thành viên ghost không bị cập nhật Elo
    if (player.isGhost) {
      return {
        userId: player.userId,
        displayName: player.displayName,
        oldRating: player.currentRating,
        newRating: player.currentRating,
        delta: 0,
        kFactor: 0,
        oldReliability: player.currentReliability,
        newReliability: player.currentReliability,
        reliabilityDelta: 0,
        isProvisional: false,
        matchesPlayed: player.matchesPlayed,
        isGhost: true,
        cardsSummary: { correctLevelVotes: 0, playsBetterVotes: 0, goodAttitudeVotes: 0, fakeLevelVotes: 0 },
        cardEloAdjustment: 0,
      };
    }

    // Xác định K-factor: Provisional (<= 5 trận) -> K=40; Standard (> 5 trận) -> K=24
    const isProvisionalNow =
      player.isProvisional ||
      player.matchesPlayed < RATING_CONFIG.PROVISIONAL_MATCHES_THRESHOLD;
    const kFactor = isProvisionalNow
      ? RATING_CONFIG.K_FACTOR_PROVISIONAL
      : RATING_CONFIG.K_FACTOR_STANDARD;

    // Delta cơ bản theo Elo
    const rawDelta = kFactor * (actualScore - expectedScore);
    const scaledDelta = Math.round(rawDelta * multiplier);

    // Điểm thưởng/phạt từ thẻ đánh giá
    const cardData = cardResults.get(player.userId) || {
      eloAdjustment: 0,
      reliabilityAdjustment: 0,
      summary: { correctLevelVotes: 0, playsBetterVotes: 0, goodAttitudeVotes: 0, fakeLevelVotes: 0 },
    };

    const finalDelta = scaledDelta + cardData.eloAdjustment;

    // Kẹp trong sàn 800 và trần 2200 của hệ thống
    const newRating = Math.max(
      RATING_CONFIG.MIN_RATING_FLOOR,
      Math.min(RATING_CONFIG.MAX_RATING_CEILING, player.currentRating + finalDelta)
    );

    // Cập nhật số trận và cờ provisional
    const newMatchesPlayed = player.matchesPlayed + 1;
    const nextIsProvisional = newMatchesPlayed < RATING_CONFIG.PROVISIONAL_MATCHES_THRESHOLD;

    // Cập nhật điểm uy tín: Hoàn thành trận đấu được cộng +2 điểm uy tín (khởi tạo phục hồi)
    const attendanceReward = RATING_CONFIG.REPUTATION_CHANGE.CHECK_IN_ON_TIME; // +2
    const totalRelDelta = attendanceReward + cardData.reliabilityAdjustment;
    const newReliability = Math.max(
      RATING_CONFIG.REPUTATION_MIN,
      Math.min(RATING_CONFIG.REPUTATION_MAX, player.currentReliability + totalRelDelta)
    );

    return {
      userId: player.userId,
      displayName: player.displayName,
      oldRating: player.currentRating,
      newRating,
      delta: finalDelta,
      kFactor,
      oldReliability: player.currentReliability,
      newReliability,
      reliabilityDelta: totalRelDelta,
      isProvisional: nextIsProvisional,
      matchesPlayed: newMatchesPlayed,
      isGhost: false,
      cardsSummary: cardData.summary,
      cardEloAdjustment: cardData.eloAdjustment,
    };
  };

  const resA1 = calculatePlayerResult(input.teamA[0], scoreA, expectedA);
  const resA2 = calculatePlayerResult(input.teamA[1], scoreA, expectedA);
  const resB1 = calculatePlayerResult(input.teamB[0], scoreB, expectedB);
  const resB2 = calculatePlayerResult(input.teamB[1], scoreB, expectedB);

  return {
    teamA: [resA1, resA2],
    teamB: [resB1, resB2],
    expectedScoreA: expectedA,
    expectedScoreB: expectedB,
    scoreMarginMultiplier: multiplier,
    totalSetsPlayed: input.sets.length,
    winner,
  };
}
