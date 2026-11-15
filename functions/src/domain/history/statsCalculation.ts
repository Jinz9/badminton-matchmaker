/**
 * TÍNH TOÁN THỐNG KÊ TỶ LỆ THẮNG & DỮ LIỆU BIỂU ĐỒ (STATS & TIME-SERIES CALCULATION)
 *
 * Tính chất:
 * 1. Hàm thuần tính toán tổng hợp tỷ lệ thắng tổng quan, theo tháng, theo nội dung (men/women/mixed).
 * 2. Ưu tiên sử dụng tài liệu cache tổng hợp `UserStatsDoc` nếu có để giảm chi phí đọc Firestore.
 * 3. Chuẩn bị chuỗi dữ liệu thời gian (Time-series) phục vụ biểu đồ Elo và tỷ lệ thắng cho TV2 dựng UI.
 */

import {
  MatchDoc,
  RatingHistoryDoc,
  UserStatsDoc,
  CategoryStat,
  MonthlyStat,
  CourtCategory,
} from "../types";
import { PersonalStatsSummary, TimeSeriesPoint } from "./types";
import { computeBestPartners } from "./bestPartners";

/**
 * Tạo đối tượng thống kê nội dung mặc định rỗng
 */
function createEmptyCategoryStat(): CategoryStat {
  return {
    matches: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
  };
}

/**
 * Tính toán thống kê cá nhân và chuỗi thời gian từ lịch sử trận đấu và ratings log
 */
export function calculatePersonalStats(
  userId: string,
  matches: MatchDoc[],
  ratingsLogs: RatingHistoryDoc[] = [],
  cachedStats?: UserStatsDoc | null,
  partnerInfoMap?: Map<string, { displayName: string; avatarUrl?: string }>
): PersonalStatsSummary {
  // 1. Nếu đã có dữ liệu cache sẵn và không có dữ liệu trận mới cần tính lại
  if (cachedStats && matches.length === 0) {
    // Tái cấu trúc từ cache
    return {
      userId,
      totalMatches: cachedStats.totalMatches,
      totalWins: cachedStats.totalWins,
      totalLosses: cachedStats.totalLosses,
      overallWinRate: cachedStats.overallWinRate,
      currentRating: ratingsLogs.length > 0 ? ratingsLogs[ratingsLogs.length - 1].newRating : 1400,
      currentReliability: ratingsLogs.length > 0 ? ratingsLogs[ratingsLogs.length - 1].newReliability : 80,
      byCategory: cachedStats.byCategory,
      byMonth: cachedStats.byMonth,
      bestPartners: cachedStats.bestPartners,
      ratingTimeSeries: buildRatingTimeSeries(ratingsLogs),
    };
  }

  // 2. Tính toán từ danh sách trận đấu thực tế (sắp xếp tăng dần theo thời gian)
  const sortedMatches = [...matches]
    .filter((m) => m.status === "confirmed" || m.status === "finished")
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  let totalWins = 0;
  let totalLosses = 0;

  const byCategory: Record<CourtCategory, CategoryStat> = {
    men: createEmptyCategoryStat(),
    women: createEmptyCategoryStat(),
    mixed: createEmptyCategoryStat(),
  };

  const byMonth: Record<string, MonthlyStat> = {};

  for (const match of sortedMatches) {
    const isTeamA = match.teamA?.includes(userId);
    const isTeamB = match.teamB?.includes(userId);
    if (!isTeamA && !isTeamB) continue;

    const isWin = isTeamA ? match.winner === "teamA" : match.winner === "teamB";

    if (isWin) {
      totalWins += 1;
    } else {
      totalLosses += 1;
    }

    // Nhóm theo nội dung sân
    const category: CourtCategory = match.category || "men";
    if (byCategory[category]) {
      byCategory[category].matches += 1;
      if (isWin) {
        byCategory[category].wins += 1;
      } else {
        byCategory[category].losses += 1;
      }
    }

    // Nhóm theo tháng ("YYYY-MM")
    const matchDate = new Date(match.createdAt || match.updatedAt || Date.now());
    const monthKey = `${matchDate.getFullYear()}-${String(matchDate.getMonth() + 1).padStart(2, "0")}`;

    if (!byMonth[monthKey]) {
      byMonth[monthKey] = {
        month: monthKey,
        matches: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
      };
    }

    byMonth[monthKey].matches += 1;
    if (isWin) {
      byMonth[monthKey].wins += 1;
    } else {
      byMonth[monthKey].losses += 1;
    }
  }

  // Tính tỷ lệ thắng các danh mục
  const totalMatches = totalWins + totalLosses;
  const overallWinRate = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 10000) / 10000 : 0;

  for (const cat of Object.keys(byCategory) as CourtCategory[]) {
    const cStat = byCategory[cat];
    cStat.winRate = cStat.matches > 0 ? Math.round((cStat.wins / cStat.matches) * 10000) / 10000 : 0;
  }

  for (const mKey of Object.keys(byMonth)) {
    const mStat = byMonth[mKey];
    mStat.winRate = mStat.matches > 0 ? Math.round((mStat.wins / mStat.matches) * 10000) / 10000 : 0;
  }

  // Tính danh sách đồng đội ăn ý nhất
  const bestPartners = computeBestPartners(userId, sortedMatches, partnerInfoMap);

  // Sinh chuỗi thời gian cho biểu đồ
  const ratingTimeSeries = buildRatingTimeSeries(ratingsLogs);

  // Điểm hiện tại
  const lastLog = ratingsLogs.length > 0 ? ratingsLogs[ratingsLogs.length - 1] : null;
  const currentRating = lastLog?.newRating ?? 1400;
  const currentReliability = lastLog?.newReliability ?? 80;

  return {
    userId,
    totalMatches,
    totalWins,
    totalLosses,
    overallWinRate,
    currentRating,
    currentReliability,
    byCategory,
    byMonth,
    bestPartners,
    ratingTimeSeries,
  };
}

/**
 * Xây dựng chuỗi thời gian biến động Elo phục vụ biểu đồ đường (Line Chart)
 */
export function buildRatingTimeSeries(ratingsLogs: RatingHistoryDoc[]): TimeSeriesPoint[] {
  const sortedLogs = [...ratingsLogs].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  let cumulativeMatches = 0;
  let cumulativeWins = 0;

  const points: TimeSeriesPoint[] = [];

  for (const log of sortedLogs) {
    if (log.reason === "match_result") {
      cumulativeMatches += 1;
      if (log.delta > 0) {
        cumulativeWins += 1;
      }
    }

    const cumulativeWinRate =
      cumulativeMatches > 0
        ? Math.round((cumulativeWins / cumulativeMatches) * 10000) / 10000
        : 0;

    points.push({
      date: log.createdAt,
      rating: log.newRating,
      delta: log.delta,
      cumulativeMatches,
      cumulativeWins,
      cumulativeWinRate,
    });
  }

  return points;
}
