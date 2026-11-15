/**
 * THUẬT TOÁN TÌM ĐỒNG ĐỘI ĐÁNH ĐÔI ĂN Ý (PARTNER FINDER)
 *
 * Căn cứ pháp lý & kỹ thuật:
 * - Skill `badminton-domain-rules` (ràng buộc đôi nam, đôi nữ, đôi nam nữ)
 * - Skill `badminton-rating` & `docs/06-rating-scale.md` (chênh lệch Elo <= 150, ma trận lối chơi, tay thuận)
 * - CR-02 trong `docs/PROJECT_CONTEXT.md` (phân định rõ với tuyển vãng lai)
 */

import { UserProfile, PlayStyle, Handedness } from "../types";
import { RATING_CONFIG } from "../../config/rating";
import {
  PartnerFinderFilters,
  PartnerFinderConfig,
  PartnerScoreBreakdown,
  PartnerMatchItem,
} from "./types";

export const DEFAULT_PARTNER_CONFIG: PartnerFinderConfig = {
  maxEloDiff: RATING_CONFIG.PARTNER_FINDER_MAX_ELO_DIFF, // 150
  weights: {
    elo: 40,         // Độ tương đồng Elo: tối đa 40 điểm
    position: 30,    // Bù trừ vị trí cầu trước/sau: tối đa 30 điểm
    hand: 15,        // Cặp đôi vàng Phải - Trái: tối đa 15 điểm
    area: 10,        // Cùng quận/huyện sân tại Đà Nẵng: tối đa 10 điểm
    reliability: 5,  // Điểm uy tín & tác phong: tối đa 5 điểm
  },
};

/**
 * Tính điểm bù trừ vị trí thi đấu (PlayStyle Compatibility)
 * Thang điểm tối đa theo config.weights.position (chuẩn 30 điểm)
 */
export function evaluatePositionCompatibility(
  posA?: PlayStyle,
  posB?: PlayStyle,
  maxWeight: number = 30
): { score: number; reason?: string; warning?: string } {
  if (!posA || !posB) {
    return {
      score: Math.round(maxWeight * (10 / 30)), // ~10 điểm trung tính
      reason: undefined,
    };
  }

  // 1. Hoàn hảo: Cầu trước + Cầu sau (Bù trừ âm - dương)
  if (
    (posA === "front" && posB === "back") ||
    (posA === "back" && posB === "front")
  ) {
    return {
      score: maxWeight, // 30 điểm
      reason: "Bù trừ vị trí hoàn hảo (Cầu trước + Cầu sau)",
    };
  }

  // 2. Rất tốt: Toàn diện + (Cầu trước HOẶC Cầu sau)
  if (
    (posA === "both" && (posB === "front" || posB === "back")) ||
    (posB === "both" && (posA === "front" || posA === "back"))
  ) {
    return {
      score: Math.round(maxWeight * (22 / 30)), // 22 điểm
      reason: "Lối chơi bổ trợ rất tốt (Toàn diện + Chuyên vị trí)",
    };
  }

  // 3. Tốt: Cả 2 cùng Toàn diện (Dễ xoay vị trí)
  if (posA === "both" && posB === "both") {
    return {
      score: Math.round(maxWeight * (18 / 30)), // 18 điểm
      reason: "Lối chơi toàn diện, dễ hoán đổi vị trí linh hoạt",
    };
  }

  // 4. Kém: Cùng chuyên lưới (Front + Front)
  if (posA === "front" && posB === "front") {
    return {
      score: 0,
      warning: "Cả hai cùng thích cầu trước (cần chú ý bọc lót cầu sau)",
    };
  }

  // 5. Kém: Cùng chuyên công (Back + Back)
  if (posA === "back" && posB === "back") {
    return {
      score: 0,
      warning: "Cả hai cùng thích cầu sau (cần chú ý tranh cầu và giữ lưới)",
    };
  }

  return {
    score: Math.round(maxWeight * (10 / 30)),
  };
}

/**
 * Tính điểm tương thích tay thuận (Handedness Compatibility)
 * Thang điểm tối đa theo config.weights.hand (chuẩn 15 điểm)
 */
export function evaluateHandCompatibility(
  handA?: Handedness,
  handB?: Handedness,
  maxWeight: number = 15
): { score: number; reason?: string } {
  if (!handA || !handB) {
    return { score: Math.round(maxWeight * (5 / 15)) }; // 5 điểm
  }

  // Cặp đôi vàng: 1 người thuận tay phải + 1 người thuận tay trái
  if (
    (handA === "right" && handB === "left") ||
    (handA === "left" && handB === "right")
  ) {
    return {
      score: maxWeight, // 15 điểm
      reason: "Cặp đôi vàng (Tay phải + Tay trái)",
    };
  }

  // 2 người cùng tay phải hoặc cùng tay trái: Mức chuẩn
  return {
    score: Math.round(maxWeight * (5 / 15)), // 5 điểm
  };
}

/**
 * Kiểm tra các điều kiện lọc cứng (Hard Filters)
 * Trả về false nếu vi phạm bất kỳ luật nào
 */
function passesHardFilters(
  seeker: UserProfile,
  candidate: UserProfile,
  filters: PartnerFinderFilters,
  allowedEloDiff: number
): boolean {
  // 1. Không tự ghép với chính mình
  if (candidate.uid === seeker.uid) {
    return false;
  }

  // 2. Không ghép với tài khoản đã xóa mềm
  if (candidate.isDeleted) {
    return false;
  }

  // 3. Loại trừ danh sách chỉ định (block list, previous matches)
  if (filters.excludeUids && filters.excludeUids.includes(candidate.uid)) {
    return false;
  }

  // 4. Ràng buộc giới tính theo nội dung đánh đôi (badminton-domain-rules)
  if (filters.category) {
    if (filters.category === "men") {
      // Cả 2 đều phải là Nam
      if (seeker.gender !== "M" || candidate.gender !== "M") {
        return false;
      }
    } else if (filters.category === "women") {
      // Cả 2 đều phải là Nữ
      if (seeker.gender !== "F" || candidate.gender !== "F") {
        return false;
      }
    } else if (filters.category === "mixed") {
      // Đôi nam nữ: 1 Nam + 1 Nữ
      if (seeker.gender === candidate.gender) {
        return false;
      }
    }
  }

  // 5. Lọc cứng theo khu vực (nếu bộ lọc có yêu cầu chính xác quận)
  if (filters.areaLabel && candidate.areaLabel !== filters.areaLabel) {
    return false;
  }

  // 6. Lọc theo dải cấp độ tự khai
  if (filters.levelMin && candidate.selfDeclaredLevel < filters.levelMin) {
    return false;
  }
  if (filters.levelMax && candidate.selfDeclaredLevel > filters.levelMax) {
    return false;
  }

  // 7. Lọc theo độ lệch điểm Elo tối đa (mặc định 150)
  const eloDiff = Math.abs(seeker.skill.rating - candidate.skill.rating);
  if (eloDiff > allowedEloDiff) {
    return false;
  }

  return true;
}

/**
 * Hàm thuần tính toán độ phù hợp và xếp hạng danh sách ứng viên đồng đội
 *
 * @param seeker Người đang tìm kiếm bạn chơi
 * @param candidates Danh sách hồ sơ ứng viên
 * @param filters Bộ lọc tìm kiếm
 * @param customConfig Cấu hình trọng số và giới hạn Elo tùy chỉnh
 * @returns Danh sách PartnerMatchItem đã được sắp xếp theo thứ tự ưu tiên xác định (deterministic)
 */
export function findPartners(
  seeker: UserProfile,
  candidates: UserProfile[],
  filters: PartnerFinderFilters = {},
  customConfig?: Partial<PartnerFinderConfig>
): PartnerMatchItem[] {
  const config: PartnerFinderConfig = {
    ...DEFAULT_PARTNER_CONFIG,
    ...customConfig,
    weights: {
      ...DEFAULT_PARTNER_CONFIG.weights,
      ...(customConfig?.weights || {}),
    },
  };

  // Xác định khoảng cách Elo cho phép
  let allowedEloDiff = filters.maxEloDiff ?? config.maxEloDiff;

  const results: PartnerMatchItem[] = [];

  for (const candidate of candidates) {
    // Nếu có cờ allowProvisionalExpansion và một trong hai người là provisional thì nới lỏng thêm 50 điểm
    let candidateAllowedElo = allowedEloDiff;
    const isCandidateProvisional =
      candidate.skill.isProvisional ||
      candidate.skill.matchesPlayed < RATING_CONFIG.PROVISIONAL_MATCHES_THRESHOLD;
    const isSeekerProvisional =
      seeker.skill.isProvisional ||
      seeker.skill.matchesPlayed < RATING_CONFIG.PROVISIONAL_MATCHES_THRESHOLD;

    if (filters.allowProvisionalExpansion && (isCandidateProvisional || isSeekerProvisional)) {
      candidateAllowedElo += 50;
    }

    if (!passesHardFilters(seeker, candidate, filters, candidateAllowedElo)) {
      continue;
    }

    const reasons: string[] = [];
    const warnings: string[] = [];

    // --- 1. TÍNH ĐIỂM ELO PROXIMITY (Tối đa 40 điểm) ---
    const eloDiff = Math.abs(seeker.skill.rating - candidate.skill.rating);
    const eloProximityRatio = Math.max(0, 1 - eloDiff / candidateAllowedElo);
    const eloScore = Math.round(config.weights.elo * eloProximityRatio);

    if (eloDiff === 0) {
      reasons.push(`Trình độ ngang ngửa tuyệt đối (cùng ${candidate.skill.rating} Elo)`);
    } else if (eloDiff <= 50) {
      reasons.push(`Trình độ rất tương đồng (lệch ${eloDiff} điểm)`);
    } else if (eloDiff <= 100) {
      reasons.push(`Trình độ tương đồng (lệch ${eloDiff} điểm)`);
    } else {
      reasons.push(`Chênh lệch trong ngưỡng cho phép (lệch ${eloDiff} điểm)`);
    }

    // --- 2. TÍNH ĐIỂM BÙ TRỪ VỊ TRÍ (Tối đa 30 điểm) ---
    const positionEval = evaluatePositionCompatibility(
      seeker.position,
      candidate.position,
      config.weights.position
    );
    const positionScore = positionEval.score;
    if (positionEval.reason) {
      reasons.push(positionEval.reason);
    }
    if (positionEval.warning) {
      warnings.push(positionEval.warning);
    }

    // --- 3. TÍNH ĐIỂM TAY THUẬN (Tối đa 15 điểm) ---
    const handEval = evaluateHandCompatibility(
      seeker.dominantHand,
      candidate.dominantHand,
      config.weights.hand
    );
    const handScore = handEval.score;
    if (handEval.reason) {
      reasons.push(handEval.reason);
    }

    // --- 4. TÍNH ĐIỂM CÙNG KHU VỰC (Tối đa 10 điểm) ---
    let areaScore = 0;
    if (
      seeker.areaLabel &&
      candidate.areaLabel &&
      seeker.areaLabel.trim().toLowerCase() === candidate.areaLabel.trim().toLowerCase()
    ) {
      areaScore = config.weights.area;
      reasons.push(`Cùng khu vực ${candidate.areaLabel}`);
    }

    // --- 5. TÍNH ĐIỂM UY TÍN & KINH NGHIỆM (Tối đa 5 điểm) ---
    let reliabilityScore = 0;
    const rel = candidate.skill.reliability ?? RATING_CONFIG.REPUTATION_DEFAULT;
    if (rel >= 90) {
      reliabilityScore = config.weights.reliability;
      reasons.push(`Độ uy tín cao (${rel}/100)`);
    } else if (rel >= 70) {
      reliabilityScore = Math.round(config.weights.reliability * 0.8);
    } else if (rel >= 50) {
      reliabilityScore = Math.round(config.weights.reliability * 0.4);
    } else {
      reliabilityScore = 0;
      warnings.push(`Uy tín cần lưu ý (${rel}/100 - có tiền sử hủy/bùng kèo)`);
    }

    if (isCandidateProvisional) {
      warnings.push(
        `Người chơi mới đang trong giai đoạn hiệu chỉnh rank (${candidate.skill.matchesPlayed}/${RATING_CONFIG.PROVISIONAL_MATCHES_THRESHOLD} trận)`
      );
    }

    // --- TỔNG HỢP MATCH SCORE (0 - 100) ---
    const rawScore = eloScore + positionScore + handScore + areaScore + reliabilityScore;
    const matchScore = Math.min(100, Math.max(0, rawScore));

    const breakdown: PartnerScoreBreakdown = {
      eloScore,
      positionScore,
      handScore,
      areaScore,
      reliabilityScore,
    };

    results.push({
      user: candidate,
      matchScore,
      eloDiff,
      reasons,
      warnings,
      breakdown,
      isProvisional: isCandidateProvisional,
    });
  }

  // --- SẮP XẾP TIE-BREAK DETERMINISTIC (Ổn định 100%, không ngẫu nhiên) ---
  results.sort((a, b) => {
    // 1. Điểm tương thích matchScore giảm dần
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    // 2. Chênh lệch Elo tăng dần (ít chênh lệch hơn xếp trước)
    if (a.eloDiff !== b.eloDiff) {
      return a.eloDiff - b.eloDiff;
    }
    // 3. Điểm uy tín giảm dần
    const relA = a.user.skill.reliability ?? 0;
    const relB = b.user.skill.reliability ?? 0;
    if (relB !== relA) {
      return relB - relA;
    }
    // 4. Số trận đã đấu giảm dần
    if (b.user.skill.matchesPlayed !== a.user.skill.matchesPlayed) {
      return b.user.skill.matchesPlayed - a.user.skill.matchesPlayed;
    }
    // 5. UID tăng dần theo thứ tự từ điển (đảm bảo thứ tự xác định)
    return a.user.uid.localeCompare(b.user.uid);
  });

  return results;
}

