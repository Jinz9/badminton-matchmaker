/**
 * THUẬT TOÁN TÍNH TOÁN & XẾP HẠNG "ĐỒNG ĐỘI ĂN Ý NHẤT" (BEST PARTNERS)
 *
 * Tiêu chí phê duyệt chính thức từ TV1 (2026-11-15):
 * 1. Ngưỡng số trận tối thiểu: >= 5 trận (N_min = 5).
 * 2. Ngưỡng tỷ lệ chiến thắng: >= 60% (winRate >= 0.60).
 * 3. Quy tắc xếp hạng & Tie-break:
 *    - Ưu tiên 1: Tỷ lệ thắng giảm dần (winRate DESC).
 *    - Ưu tiên 2: Số trận đánh cùng nhau nhiều hơn (matchesCount DESC).
 *    - Ưu tiên 3: Thời điểm trận đánh gần nhất mới hơn (lastPlayedAt DESC).
 *    - Ưu tiên 4: Deterministic theo partnerId ASC.
 */

import { MatchDoc, BestPartnerStat } from "../types";
import { BestPartnerCriteria } from "./types";

export const DEFAULT_BEST_PARTNER_CRITERIA: Required<BestPartnerCriteria> = {
  minMatches: 5,
  minWinRate: 0.60,
};

export interface PartnerAccumulator {
  partnerId: string;
  partnerName: string;
  partnerAvatar?: string;
  matchesCount: number;
  winsCount: number;
  lastPlayedAt: string;
}

/**
 * Hàm thuần tính toán danh sách đồng đội ăn ý nhất từ lịch sử các trận đấu
 */
export function computeBestPartners(
  currentUserId: string,
  matches: MatchDoc[],
  partnerInfoMap?: Map<string, { displayName: string; avatarUrl?: string }>,
  criteria?: BestPartnerCriteria
): BestPartnerStat[] {
  const minMatches = criteria?.minMatches ?? DEFAULT_BEST_PARTNER_CRITERIA.minMatches;
  const minWinRate = criteria?.minWinRate ?? DEFAULT_BEST_PARTNER_CRITERIA.minWinRate;

  const partnerMap = new Map<string, PartnerAccumulator>();

  for (const match of matches) {
    // Chỉ xét các trận đấu đã hoàn thành và có kết quả
    if (match.status !== "confirmed" && match.status !== "finished") {
      continue;
    }

    const teamA = match.teamA;
    const teamB = match.teamB;
    if (!teamA || !teamB) continue;

    let partnerId: string | null = null;
    let isWin = false;

    if (teamA.includes(currentUserId)) {
      partnerId = teamA[0] === currentUserId ? teamA[1] : teamA[0];
      isWin = match.winner === "teamA";
    } else if (teamB.includes(currentUserId)) {
      partnerId = teamB[0] === currentUserId ? teamB[1] : teamB[0];
      isWin = match.winner === "teamB";
    }

    // Không tìm thấy user trong trận, hoặc đồng đội là ghost member/tự đánh với mình
    if (!partnerId || partnerId.startsWith("ghost_") || partnerId === currentUserId) {
      continue;
    }

    const matchTime = match.createdAt || match.updatedAt || new Date().toISOString();

    const existing = partnerMap.get(partnerId);
    if (!existing) {
      const info = partnerInfoMap?.get(partnerId);
      partnerMap.set(partnerId, {
        partnerId,
        partnerName: info?.displayName || `Đồng đội ${partnerId.slice(0, 6)}`,
        partnerAvatar: info?.avatarUrl,
        matchesCount: 1,
        winsCount: isWin ? 1 : 0,
        lastPlayedAt: matchTime,
      });
    } else {
      existing.matchesCount += 1;
      if (isWin) {
        existing.winsCount += 1;
      }
      if (new Date(matchTime) > new Date(existing.lastPlayedAt)) {
        existing.lastPlayedAt = matchTime;
      }
    }
  }

  // Lọc theo điều kiện minMatches và minWinRate
  const eligiblePartners: BestPartnerStat[] = [];

  for (const item of partnerMap.values()) {
    if (item.matchesCount < minMatches) {
      continue;
    }

    const rawWinRate = item.winsCount / item.matchesCount;
    // Làm tròn 4 chữ số thập phân
    const winRate = Math.round(rawWinRate * 10000) / 10000;

    if (winRate < minWinRate) {
      continue;
    }

    eligiblePartners.push({
      partnerId: item.partnerId,
      partnerName: item.partnerName,
      partnerAvatar: item.partnerAvatar,
      matchesCount: item.matchesCount,
      winsCount: item.winsCount,
      winRate,
      lastPlayedAt: item.lastPlayedAt,
    });
  }

  // Sắp xếp (Sorting & Tie-break)
  eligiblePartners.sort((a, b) => {
    // 1. Tỷ lệ thắng giảm dần
    if (b.winRate !== a.winRate) {
      return b.winRate - a.winRate;
    }
    // 2. Số trận đánh cùng nhiều hơn xếp trên
    if (b.matchesCount !== a.matchesCount) {
      return b.matchesCount - a.matchesCount;
    }
    // 3. Trận đánh gần nhất mới hơn xếp trên
    const timeA = new Date(a.lastPlayedAt).getTime();
    const timeB = new Date(b.lastPlayedAt).getTime();
    if (timeB !== timeA) {
      return timeB - timeA;
    }
    // 4. Deterministic theo partnerId
    return a.partnerId.localeCompare(b.partnerId);
  });

  return eligiblePartners;
}
