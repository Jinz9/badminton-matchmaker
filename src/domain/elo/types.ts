/**
 * TYPE DEFINITIONS CHO THUẬT TOÁN TÍNH ELO ĐÔI & ĐIỂM UY TÍN (ELO & RATING DOMAIN)
 * Căn cứ: Skill `badminton-rating`, `docs/06-rating-scale.md` & Phê duyệt của TV1
 */

import { MatchSetScore, PostMatchCard } from "../types";

export interface MatchTeamPlayer {
  userId: string;
  displayName: string;
  currentRating: number;
  matchesPlayed: number;
  isProvisional: boolean;
  currentReliability: number;
  isGhost?: boolean;
}

export interface EloCalculationInput {
  teamA: [MatchTeamPlayer, MatchTeamPlayer];
  teamB: [MatchTeamPlayer, MatchTeamPlayer];
  winner: "teamA" | "teamB";
  sets: MatchSetScore[];
  reviewCards?: PostMatchCard[];
}

export interface PlayerReviewSummary {
  correctLevelVotes: number;
  playsBetterVotes: number;
  goodAttitudeVotes: number;
  fakeLevelVotes: number;
}

export interface PlayerEloResult {
  userId: string;
  displayName: string;
  oldRating: number;
  newRating: number;
  delta: number;                  // Biến động Elo thuần (bao gồm cả tỷ số và thẻ)
  kFactor: number;                // 40 (provisional) hoặc 24 (standard)
  oldReliability: number;
  newReliability: number;
  reliabilityDelta: number;
  isProvisional: boolean;
  matchesPlayed: number;
  isGhost: boolean;
  cardsSummary: PlayerReviewSummary;
  cardEloAdjustment: number;      // Điểm thưởng/phạt từ thẻ (kẹp tối đa +-5)
}

export interface MatchEloResult {
  teamA: [PlayerEloResult, PlayerEloResult];
  teamB: [PlayerEloResult, PlayerEloResult];
  expectedScoreA: number;         // Điểm kỳ vọng Đội A (0.00 - 1.00)
  expectedScoreB: number;         // Điểm kỳ vọng Đội B (0.00 - 1.00)
  scoreMarginMultiplier: number;  // Hệ số chênh lệch tỷ số (1.00 - 1.25)
  totalSetsPlayed: number;
  winner: "teamA" | "teamB";
}

export interface ScoreValidationResult {
  isValid: boolean;
  winner?: "teamA" | "teamB";
  setsWonA: number;
  setsWonB: number;
  error?: string;
}

