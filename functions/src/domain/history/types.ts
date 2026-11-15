/**
 * TYPE DEFINITIONS CHO MODULE LỊCH SỬ ĐẤU & THỐNG KÊ (HISTORY & STATS DOMAIN)
 * Căn cứ: Skill `badminton-domain-rules`, `badminton-rating`, Hợp đồng dữ liệu `data-contract.md`
 * Quyết định phê duyệt TV1: Ngưỡng tối thiểu >= 5 trận, winRate >= 0.60
 */

import {
  CourtCategory,
  MatchSetScore,
  BestPartnerStat,
  CategoryStat,
  MonthlyStat,
  PostMatchCard,
} from "../types";

export interface MatchPlayerSummary {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  isGhost?: boolean;
}

export interface MatchHistoryItem {
  matchId: string;
  sessionId: string;
  sessionTitle?: string;
  venueName?: string;
  courtId: string;
  category: CourtCategory;
  date: string;               // ISO 8601
  myTeam: [MatchPlayerSummary, MatchPlayerSummary];
  opponentTeam: [MatchPlayerSummary, MatchPlayerSummary];
  partner: MatchPlayerSummary;
  opponents: [MatchPlayerSummary, MatchPlayerSummary];
  sets: MatchSetScore[];
  winner: "teamA" | "teamB";
  isWin: boolean;
  eloDelta?: number;          // Điểm Elo biến động (+13, -11)
  newRating?: number;         // Điểm Elo sau trận
  reliabilityDelta?: number;  // Biến động điểm uy tín (+2)
  cards?: PostMatchCard[];
}

export interface HistoryQueryFilters {
  userId: string;
  startDate?: string;         // Lọc từ ngày (ISO string, ví dụ: 2026-11-01T00:00:00Z)
  endDate?: string;           // Lọc đến ngày (ISO string, ví dụ: 2026-11-30T23:59:59Z)
  category?: CourtCategory;   // "men" | "women" | "mixed"
  pageSize?: number;          // Phân trang (mặc định: 20, tối đa: 50)
  lastMatchId?: string;       // Cursor phân trang
}

export interface TimeSeriesPoint {
  date: string;               // ISO 8601 hoặc "YYYY-MM-DD"
  rating: number;             // Điểm Elo tại thời điểm đó
  delta: number;              // Biến động
  cumulativeMatches: number;  // Số trận tích lũy
  cumulativeWins: number;     // Số trận thắng tích lũy
  cumulativeWinRate: number;  // Tỷ lệ thắng tích lũy (0.00 - 1.00)
}

export interface PersonalStatsSummary {
  userId: string;
  totalMatches: number;
  totalWins: number;
  totalLosses: number;
  overallWinRate: number;      // 0.00 - 1.00
  currentRating: number;
  currentReliability: number;
  byCategory: {
    men: CategoryStat;
    women: CategoryStat;
    mixed: CategoryStat;
  };
  byMonth: Record<string, MonthlyStat>;
  bestPartners: BestPartnerStat[];
  ratingTimeSeries: TimeSeriesPoint[];
}

export interface BestPartnerCriteria {
  minMatches?: number;        // Mặc định: 5 (theo phê duyệt TV1)
  minWinRate?: number;        // Mặc định: 0.60 (theo phê duyệt TV1)
}
