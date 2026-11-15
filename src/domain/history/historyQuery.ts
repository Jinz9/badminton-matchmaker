/**
 * TRUY VẤN & TỔNG HỢP LỊCH SỬ ĐẤU (MATCH HISTORY QUERY & ENRICHMENT)
 *
 * Tính chất:
 * 1. Lọc theo khoảng ngày (startDate, endDate), theo nội dung (men, women, mixed).
 * 2. Phân trang cursor-based (pageSize, lastMatchId).
 * 3. Làm giàu dữ liệu (Enrichment): ghép thông tin đồng đội, 2 đối thủ, tỷ số set, và biến động Elo từ ratings log.
 */

import { MatchDoc, RatingHistoryDoc } from "../types";
import { MatchHistoryItem, HistoryQueryFilters, MatchPlayerSummary } from "./types";

/**
 * Lọc và phân trang danh sách trận đấu trong bộ nhớ hoặc sau khi fetch từ Firestore
 */
export function filterAndPaginateMatches(
  matches: MatchDoc[],
  filters: HistoryQueryFilters
): { items: MatchDoc[]; hasMore: boolean; nextCursor?: string } {
  let filtered = matches.filter((m) => {
    // Chỉ lấy trận có user tham gia
    const hasUser =
      m.teamA?.includes(filters.userId) ||
      m.teamB?.includes(filters.userId) ||
      m.playerIds?.includes(filters.userId);
    if (!hasUser) return false;

    // Chỉ lấy trận đã hoàn thành hoặc xác nhận
    if (m.status !== "confirmed" && m.status !== "finished") {
      return false;
    }

    // Lọc theo khoảng ngày
    const matchTime = new Date(m.createdAt).getTime();
    if (filters.startDate) {
      const start = new Date(filters.startDate).getTime();
      if (matchTime < start) return false;
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate).getTime();
      if (matchTime > end) return false;
    }

    // Lọc theo nội dung sân
    if (filters.category && m.category && m.category !== filters.category) {
      return false;
    }

    return true;
  });

  // Sắp xếp thời gian giảm dần (trận mới nhất lên đầu)
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Phân trang bằng cursor
  if (filters.lastMatchId) {
    const lastIndex = filtered.findIndex((m) => m.id === filters.lastMatchId);
    if (lastIndex >= 0) {
      filtered = filtered.slice(lastIndex + 1);
    }
  }

  const pageSize = Math.min(Math.max(1, filters.pageSize ?? 20), 50);
  const pageItems = filtered.slice(0, pageSize);
  const hasMore = filtered.length > pageSize;
  const nextCursor = hasMore && pageItems.length > 0 ? pageItems[pageItems.length - 1].id : undefined;

  return {
    items: pageItems,
    hasMore,
    nextCursor,
  };
}

/**
 * Làm giàu dữ liệu danh sách trận đấu thành MatchHistoryItem hoàn chỉnh để TV2 hiển thị giao diện
 */
export function enrichMatchHistory(
  userId: string,
  matches: MatchDoc[],
  ratingsMap: Map<string, RatingHistoryDoc>, // key: matchId
  usersMap?: Map<string, { displayName: string; avatarUrl?: string }>
): MatchHistoryItem[] {
  const result: MatchHistoryItem[] = [];

  const getPlayerSummary = (uid: string): MatchPlayerSummary => {
    const isGhost = uid.startsWith("ghost_");
    const user = usersMap?.get(uid);
    return {
      userId: uid,
      displayName: user?.displayName || (isGhost ? `Khách (${uid.slice(6)})` : `VĐV ${uid.slice(0, 6)}`),
      avatarUrl: user?.avatarUrl,
      isGhost,
    };
  };

  for (const match of matches) {
    const isTeamA = match.teamA?.includes(userId);
    const isTeamB = match.teamB?.includes(userId);
    if (!isTeamA && !isTeamB) continue;

    const myTeamUids = isTeamA ? match.teamA : match.teamB;
    const opponentTeamUids = isTeamA ? match.teamB : match.teamA;

    const partnerUid = myTeamUids[0] === userId ? myTeamUids[1] : myTeamUids[0];

    const myPlayer = getPlayerSummary(userId);
    const partner = getPlayerSummary(partnerUid);
    const op1 = getPlayerSummary(opponentTeamUids[0]);
    const op2 = getPlayerSummary(opponentTeamUids[1]);

    const isWin = isTeamA ? match.winner === "teamA" : match.winner === "teamB";

    // Tìm thông tin biến động rating từ ratingsMap
    const ratingLog = ratingsMap.get(match.id);

    result.push({
      matchId: match.id,
      sessionId: match.sessionId,
      courtId: match.courtId,
      category: match.category || "men",
      date: match.createdAt,
      myTeam: [myPlayer, partner],
      opponentTeam: [op1, op2],
      partner,
      opponents: [op1, op2],
      sets: match.sets,
      winner: match.winner || (isWin ? (isTeamA ? "teamA" : "teamB") : (isTeamA ? "teamB" : "teamA")),
      isWin,
      eloDelta: ratingLog?.delta,
      newRating: ratingLog?.newRating,
      reliabilityDelta: ratingLog ? ratingLog.newReliability - ratingLog.oldReliability : undefined,
      cards: match.cards,
    });
  }

  return result;
}
