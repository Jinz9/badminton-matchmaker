/**
 * TYPE DEFINITIONS CHO THUẬT TOÁN CHIA KÈO VÀ XẾP CẶP CÂN BẰNG (SESSION BALANCING)
 * Nguồn căn cứ: Skill `session-balancing`, `badminton-domain-rules` (CR-01)
 */

import { CourtCategory, PlayStyle, Handedness, PairSource } from "../types";

export interface BalancingMember {
  id: string;                 // uid hoặc ghost_xxx
  name: string;
  gender: "M" | "F";
  rating: number;             // Điểm Elo hiện tại
  position?: PlayStyle;       // front | back | both
  dominantHand?: Handedness;  // right | left
  gamesPlayed?: number;       // Số trận đã đánh trong buổi
}

export interface BalancingLockedPair {
  id: string;
  a: string;                  // memberId của người 1
  b: string;                  // memberId của người 2
  source: PairSource;         // self | host
}

export interface BalancingOptions {
  category: CourtCategory;
  mode?: "auto" | "rotate";   // auto: Cặp cố định, rotate: Đổi cặp xoay tua
  lockedPairs?: BalancingLockedPair[];
  targetMatches?: number;     // Số lượt trận dự kiến lập lịch (mặc định = số người)
  seed?: number;              // Seed ngẫu nhiên xác định (Deterministic tie-break)
  maxDiffWarn?: number;       // Ngưỡng cảnh báo chênh lệch điểm (mặc định 200)
  restingHistory?: string[][];// Mảng các memberId đã nghỉ ở các lượt trước
}

export interface MatchPlan {
  matchIndex: number;
  teamA: [BalancingMember, BalancingMember];
  teamB: [BalancingMember, BalancingMember];
  teamAIds: [string, string];
  teamBIds: [string, string];
  restingMembers: BalancingMember[];
  restingIds: string[];
  ratingA: number;
  ratingB: number;
  diff: number;               // |ratingA - ratingB|
  isUnbalanced: boolean;      // diff > maxDiffWarn
  warning?: string;
}

export interface BalancingResult {
  courtNumber?: number;
  category: CourtCategory;
  totalMembers: number;
  matches: MatchPlan[];
  warnings: string[];
  executionTimeMs: number;
}

export interface SwapPlayersResult {
  match: MatchPlan;
  isValid: boolean;
  warning?: string;
}
