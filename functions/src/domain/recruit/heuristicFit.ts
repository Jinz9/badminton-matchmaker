/**
 * MODULE CHẤM ĐIỂM ĐỘ PHÙ HỢP CỦA ĐƠN XIN VÃNG LAI (HEURISTIC FIT SCORE)
 * Nguồn căn cứ: Skill `recruit-slot-matching` mục 4
 *
 * Cho Host một danh sách ứng viên đã được xếp hạng thông minh:
 * fit = levelScore (0-40) + positionScore (0-25) + reliabilityScore (0-25) + earlyScore (0-10)
 */

import { CourtDoc, PlayerSnapshot, JoinRequestDoc, UserProfile } from "../types";
import { RecruitFitScoreBreakdown, RankedRecruitRequest } from "./types";

/**
 * Tính điểm độ phù hợp của một ứng viên đối với đội hình hiện tại của sân
 *
 * @param candidate Người nộp đơn
 * @param court Sân đấu
 * @param queueIndex Thứ tự nộp đơn (0: nộp sớm nhất, 1, 2,...)
 */
export function computeRecruitFitScore(
  candidate: PlayerSnapshot | UserProfile,
  court: CourtDoc,
  queueIndex: number = 0
): RecruitFitScoreBreakdown {
  const candidateRating = "skill" in candidate ? candidate.skill.rating : candidate.rating;
  const candidatePosition = candidate.position;
  const candidateReliability = "skill" in candidate ? candidate.skill.reliability : candidate.reliability;

  const rosterList = Object.values(court.roster || {});
  const reasons: string[] = [];

  // --- 1. LEVEL SCORE (Tối đa 40 điểm) ---
  // levelScore = 40 * (1 - |rating - avgRating| / 200), kẹp 0..40
  let levelScore = 30; // Mặc định nếu sân chưa có ai
  if (rosterList.length > 0) {
    const totalRating = rosterList.reduce((sum, m) => sum + (m.rating || 1400), 0);
    const avgRating = totalRating / rosterList.length;
    const diff = Math.abs(candidateRating - avgRating);
    const rawLevelScore = 40 * (1 - diff / 200);
    levelScore = Math.max(0, Math.min(40, Math.round(rawLevelScore)));

    if (diff <= 30) {
      reasons.push("Trình độ tương đương mức trung bình của nhóm");
    } else if (diff <= 70) {
      reasons.push("Trình độ phù hợp với mặt bằng chung sân");
    }
  }

  // --- 2. POSITION SCORE (Tối đa 25 điểm) ---
  // 25 nếu bù đúng vị trí nhóm đang thiếu, 12 nếu "both", 0 nếu trùng vị trí nhóm đã thừa
  let frontCount = 0;
  let backCount = 0;
  let bothCount = 0;

  for (const m of rosterList) {
    if (m.position === "front") frontCount++;
    else if (m.position === "back") backCount++;
    else bothCount++;
  }

  let positionScore = 12;
  if (candidatePosition === "both") {
    positionScore = 15;
    reasons.push("Lối chơi toàn diện (linh hoạt công thủ)");
  } else if (candidatePosition === "front") {
    if (backCount > frontCount) {
      positionScore = 25;
      reasons.push("Bổ sung đúng vị trí cầu trước/bắt lưới nhóm đang thiếu");
    } else if (frontCount > backCount + 1) {
      positionScore = 5;
    } else {
      positionScore = 15;
    }
  } else if (candidatePosition === "back") {
    if (frontCount > backCount) {
      positionScore = 25;
      reasons.push("Bổ sung đúng vị trí cầu sau/đập công nhóm đang thiếu");
    } else if (backCount > frontCount + 1) {
      positionScore = 5;
    } else {
      positionScore = 15;
    }
  }

  // --- 3. RELIABILITY SCORE (Tối đa 25 điểm) ---
  // reliabilityScore = reliability / 100 * 25
  const rawRelScore = ((candidateReliability || 80) / 100) * 25;
  const reliabilityScore = Math.max(0, Math.min(25, Math.round(rawRelScore)));
  if (candidateReliability >= 90) {
    reasons.push(`Uy tín rất cao (${candidateReliability} điểm)`);
  }

  // --- 4. EARLY SCORE (Tối đa 10 điểm) ---
  // Ưu tiên người nộp sớm
  const earlyScore = Math.max(0, 10 - queueIndex * 2);
  if (queueIndex === 0) {
    reasons.push("Đăng ký sớm nhất");
  }

  const totalFit = Math.min(100, levelScore + positionScore + reliabilityScore + earlyScore);

  return {
    levelScore,
    positionScore,
    reliabilityScore,
    earlyScore,
    totalFit,
    reasons,
  };
}

/**
 * Xếp hạng danh sách đơn xin tham gia theo độ phù hợp
 */
export function rankRecruitRequests(
  requests: JoinRequestDoc[],
  court: CourtDoc
): RankedRecruitRequest[] {
  // Sắp xếp theo thời gian nộp trước để tính earlyScore
  const sortedByTime = [...requests].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const ranked: RankedRecruitRequest[] = sortedByTime.map((req, index) => ({
    request: req,
    fitScore: computeRecruitFitScore(req.snapshot, court, index),
  }));

  // Sắp xếp kết quả cuối cùng theo totalFit giảm dần, tie-break bằng thời gian nộp
  ranked.sort((a, b) => {
    if (b.fitScore.totalFit !== a.fitScore.totalFit) {
      return b.fitScore.totalFit - a.fitScore.totalFit;
    }
    return new Date(a.request.createdAt).getTime() - new Date(b.request.createdAt).getTime();
  });

  return ranked;
}

