/**
 * CÁC HÀM XỬ LÝ BIẾN ĐỘNG VÀ ĐIỀU PHỐI ĐỘNG TẠI SÂN (DYNAMIC BALANCING)
 * Nguồn căn cứ:
 * - Skill `session-balancing`, `badminton-domain-rules`
 * - Xử lý ca biến động: Người rời giữa buổi, người đến muộn, tái phân bổ 2 sân khi mất cân bằng (CR-01: 4-8 người/sân)
 */

import { CourtCategory } from "../types";
import { BalancingMember, MatchPlan } from "./types";
import { balanceCourt } from "./balanceCourt";

export interface MidSessionLeaveResult {
  canContinue: boolean;
  remainingMembers: BalancingMember[];
  newCourtMode?: "auto" | "rotate";
  reason?: "INSUFFICIENT_PLAYERS" | "NORMAL";
  message: string;
}

export interface LateArrivalResult {
  success: boolean;
  updatedMembers: BalancingMember[];
  error?: "COURT_FULL" | "ALREADY_EXISTS";
  message: string;
  priorityForNextRound?: boolean;
}

export interface RebalanceTransfer {
  memberId: string;
  memberName: string;
  fromCourt: 1 | 2;
  toCourt: 1 | 2;
}

export interface RebalanceTwoCourtsResult {
  court1Members: BalancingMember[];
  court2Members: BalancingMember[];
  transfers: RebalanceTransfer[];
  suggestMergeCourts?: boolean;
  recommendation?: string;
}

export interface GenerateNextRoundOptions {
  category: CourtCategory;
  roundIndex?: number;
  maxDiffWarn?: number;
  seed?: number;
}

export interface GenerateNextRoundResult {
  roundIndex: number;
  matchPlan: MatchPlan;
  updatedMembers: BalancingMember[];
}

/**
 * 1. Xử lý khi có thành viên rời sân giữa buổi (đau chân, bận về sớm)
 */
export function handleMidSessionLeave(
  currentMembers: BalancingMember[],
  leavingMemberId: string
): MidSessionLeaveResult {
  const memberExists = currentMembers.some((m) => m.id === leavingMemberId);
  if (!memberExists) {
    throw new Error(`Thành viên ID "${leavingMemberId}" không tồn tại trong danh sách sân`);
  }

  const remainingMembers = currentMembers.filter((m) => m.id !== leavingMemberId);
  const count = remainingMembers.length;

  if (count < 4) {
    return {
      canContinue: false,
      remainingMembers,
      reason: "INSUFFICIENT_PLAYERS",
      message: `Sân chỉ còn lại ${count} người, không đủ 4 người để tiếp tục thi đấu đôi. Cần điều chuyển người từ sân khác hoặc kết thúc sớm.`,
    };
  }

  // 4..8 người -> Tiếp tục được
  const newCourtMode = count % 2 === 0 ? "auto" : "rotate";
  return {
    canContinue: true,
    remainingMembers,
    newCourtMode,
    reason: "NORMAL",
    message: `Thành viên đã rời sân thành công. Sân còn lại ${count} người, tiếp tục thi đấu với chế độ ${newCourtMode === "auto" ? "cặp cố định" : "xoay tua luân phiên"}.`,
  };
}

/**
 * 2. Xử lý khi có thành viên đến muộn xin gia nhập sân đang diễn ra
 */
export function handleLateArrival(
  currentMembers: BalancingMember[],
  newMember: BalancingMember
): LateArrivalResult {
  const alreadyExists = currentMembers.some((m) => m.id === newMember.id);
  if (alreadyExists) {
    throw new Error(`Thành viên "${newMember.name}" (${newMember.id}) đã có trong danh sách sân`);
  }

  if (currentMembers.length >= 8) {
    return {
      success: false,
      updatedMembers: currentMembers,
      error: "COURT_FULL",
      message: "Sân đã đạt sĩ số tối đa 8 người (theo quy tắc CR-01), không thể tiếp nhận thêm người đến muộn.",
    };
  }

  const memberToAdd: BalancingMember = {
    ...newMember,
    gamesPlayed: 0,
    restCount: 0,
  };

  const updatedMembers = [...currentMembers, memberToAdd];

  return {
    success: true,
    updatedMembers,
    priorityForNextRound: true,
    message: `Đã tiếp nhận thành công thành viên "${newMember.name}". Sân hiện có ${updatedMembers.length} người. Người mới sẽ được ưu tiên xếp thi đấu ở lượt kế tiếp.`,
  };
}

/**
 * 3. Tự động tái điều phối 2 sân khi sĩ số bị mất cân bằng (Two-Court Rebalancing)
 */
export function rebalanceTwoCourts(
  court1Members: BalancingMember[],
  court2Members: BalancingMember[],
  configs?: {
    category1: CourtCategory;
    category2: CourtCategory;
  }
): RebalanceTwoCourtsResult {
  const total = court1Members.length + court2Members.length;
  const transfers: RebalanceTransfer[] = [];

  // Trường hợp tổng < 8 người: Khuyến nghị dồn về 1 sân
  if (total < 8) {
    return {
      court1Members,
      court2Members,
      transfers: [],
      suggestMergeCourts: true,
      recommendation: `Tổng số người của cả 2 sân chỉ còn ${total} người (< 8). Khuyến nghị: Dồn về 1 sân duy nhất để tiết kiệm chi phí và tập trung thi đấu.`,
    };
  }

  const c1 = [...court1Members];
  const c2 = [...court2Members];

  // Nếu 1 trong 2 sân bị thiếu người (< 4 người) hoặc chênh lệch sĩ số > 1
  while (c1.length > c2.length + 1 || c2.length < 4) {
    if (c1.length <= 4) break; // Không thể rút thêm từ sân 1 nếu sân 1 cũng chạm sàn 4 người

    // Chọn người từ c1 chuyển sang c2 (lưu ý kiểm tra tương thích giới tính nếu có configs)
    const targetCategory = configs?.category2;
    let candidateIndex = c1.length - 1;
    if (targetCategory === "men") {
      const maleIdx = c1.findIndex((m) => m.gender === "M");
      if (maleIdx !== -1) candidateIndex = maleIdx;
    } else if (targetCategory === "women") {
      const femaleIdx = c1.findIndex((m) => m.gender === "F");
      if (femaleIdx !== -1) candidateIndex = femaleIdx;
    }

    const [transferred] = c1.splice(candidateIndex, 1);
    c2.push(transferred);
    transfers.push({
      memberId: transferred.id,
      memberName: transferred.name,
      fromCourt: 1,
      toCourt: 2,
    });
  }

  while (c2.length > c1.length + 1 || c1.length < 4) {
    if (c2.length <= 4) break;

    const targetCategory = configs?.category1;
    let candidateIndex = c2.length - 1;
    if (targetCategory === "men") {
      const maleIdx = c2.findIndex((m) => m.gender === "M");
      if (maleIdx !== -1) candidateIndex = maleIdx;
    } else if (targetCategory === "women") {
      const femaleIdx = c2.findIndex((m) => m.gender === "F");
      if (femaleIdx !== -1) candidateIndex = femaleIdx;
    }

    const [transferred] = c2.splice(candidateIndex, 1);
    c1.push(transferred);
    transfers.push({
      memberId: transferred.id,
      memberName: transferred.name,
      fromCourt: 2,
      toCourt: 1,
    });
  }

  let recommendation: string | undefined;
  if (transfers.length > 0) {
    recommendation = `Đã điều chuyển ${transfers.length} người để cân bằng sĩ số (Sân 1: ${c1.length} người, Sân 2: ${c2.length} người).`;
  }

  return {
    court1Members: c1,
    court2Members: c2,
    transfers,
    suggestMergeCourts: false,
    recommendation,
  };
}

/**
 * 4. Sinh từng lượt trận đơn lẻ (Round-by-round) cho Host điều phối trực tiếp trên sân
 */
export function generateNextRound(
  members: BalancingMember[],
  options: GenerateNextRoundOptions
): GenerateNextRoundResult {
  const roundIndex = options.roundIndex ?? 1;

  // Tận dụng thuật toán balanceCourt chạy 1 match duy nhất cho lượt này
  const result = balanceCourt(members, {
    category: options.category,
    targetMatches: 1,
    maxDiffWarn: options.maxDiffWarn ?? 200,
    seed: (options.seed ?? 42) + roundIndex * 13,
  });

  const matchPlan = result.matches[0];
  if (!matchPlan) {
    throw new Error("Không thể lập lịch trận đấu cho lượt này");
  }

  // Cập nhật lại số trận gamesPlayed cho các thành viên sau lượt này
  const updatedMembers = members.map((m) => {
    const isPlaying =
      matchPlan.teamAIds.includes(m.id) || matchPlan.teamBIds.includes(m.id);
    return {
      ...m,
      gamesPlayed: (m.gamesPlayed ?? 0) + (isPlaying ? 1 : 0),
      restCount: (m.restCount ?? 0) + (isPlaying ? 0 : 1),
    };
  });

  return {
    roundIndex,
    matchPlan,
    updatedMembers,
  };
}
