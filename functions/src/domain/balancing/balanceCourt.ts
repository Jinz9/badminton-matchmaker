/**
 * THUẬT TOÁN CHIA KÈO VÀ XẾP CẶP CÂN BẰNG CHO MỘT SÂN (COURT BALANCING)
 * Nguồn căn cứ:
 * - Skill `session-balancing` & `badminton-domain-rules` (CR-01: Chạy riêng từng sân 4-8 người, ca lẻ 5 và 7 người)
 * - Thuật toán Heuristic / Greedy cân bằng tổng điểm Elo đôi
 */

import { CourtCategory } from "../types";
import {
  BalancingMember,
  BalancingOptions,
  BalancingResult,
  MatchPlan,
  SwapPlayersResult,
} from "./types";

/**
 * Sinh số giả ngẫu nhiên có seed (Linear Congruential Generator - LCG)
 * Giúp đảm bảo tính Deterministic (cùng đầu vào + cùng seed -> cùng kết quả 100%)
 */
function createPseudoRandom(seed: number = 42) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/**
 * Tìm cách chia 4 người thành 2 đội có tổng Elo cân bằng nhất
 */
function divideIntoTwoBalancedTeams(
  fourPlayers: BalancingMember[],
  category: CourtCategory
): {
  teamA: [BalancingMember, BalancingMember];
  teamB: [BalancingMember, BalancingMember];
  ratingA: number;
  ratingB: number;
  diff: number;
  warning?: string;
} {
  if (category === "mixed") {
    const males = fourPlayers.filter((p) => p.gender === "M").sort((a, b) => b.rating - a.rating);
    const females = fourPlayers.filter((p) => p.gender === "F").sort((a, b) => b.rating - a.rating);

    // Chuẩn mixed: 2 Nam và 2 Nữ
    if (males.length === 2 && females.length === 2) {
      // Cách 1: Nam mạnh + Nữ yếu vs Nam yếu + Nữ mạnh: (M1 + F2) vs (M2 + F1)
      const diff1 = Math.abs((males[0].rating + females[1].rating) - (males[1].rating + females[0].rating));
      // Cách 2: Nam mạnh + Nữ mạnh vs Nam yếu + Nữ yếu: (M1 + F1) vs (M2 + F2)
      const diff2 = Math.abs((males[0].rating + females[0].rating) - (males[1].rating + females[1].rating));

      if (diff1 <= diff2) {
        const ratingA = males[0].rating + females[1].rating;
        const ratingB = males[1].rating + females[0].rating;
        return {
          teamA: [males[0], females[1]],
          teamB: [males[1], females[0]],
          ratingA,
          ratingB,
          diff: diff1,
        };
      } else {
        const ratingA = males[0].rating + females[0].rating;
        const ratingB = males[1].rating + females[2 - 1].rating;
        return {
          teamA: [males[0], females[0]],
          teamB: [males[1], females[1]],
          ratingA,
          ratingB,
          diff: diff2,
        };
      }
    }
  }

  // category === "men", "women" hoặc mixed không đủ 2 nam 2 nữ
  // Sắp xếp 4 người theo rating giảm dần: a >= b >= c >= d
  const sorted = [...fourPlayers].sort((a, b) => b.rating - a.rating);
  const [a, b, c, d] = sorted;

  // 3 phương án ghép cặp:
  // Cách 1: (a + d) vs (b + c) -> Thường là phương án cân bằng nhất
  const diff1 = Math.abs((a.rating + d.rating) - (b.rating + c.rating));
  // Cách 2: (a + c) vs (b + d)
  const diff2 = Math.abs((a.rating + c.rating) - (b.rating + d.rating));
  // Cách 3: (a + b) vs (c + d)
  const diff3 = Math.abs((a.rating + b.rating) - (c.rating + d.rating));

  let minDiff = diff1;
  let chosenTeamA: [BalancingMember, BalancingMember] = [a, d];
  let chosenTeamB: [BalancingMember, BalancingMember] = [b, c];

  if (diff2 < minDiff) {
    minDiff = diff2;
    chosenTeamA = [a, c];
    chosenTeamB = [b, d];
  }
  if (diff3 < minDiff) {
    minDiff = diff3;
    chosenTeamA = [a, b];
    chosenTeamB = [c, d];
  }

  const ratingA = chosenTeamA[0].rating + chosenTeamA[1].rating;
  const ratingB = chosenTeamB[0].rating + chosenTeamB[1].rating;

  return {
    teamA: chosenTeamA,
    teamB: chosenTeamB,
    ratingA,
    ratingB,
    diff: minDiff,
  };
}

/**
 * Thuật toán chính: Xếp cặp và lập lịch thi đấu cho một sân (4 đến 8 người)
 */
export function balanceCourt(
  members: BalancingMember[],
  options: BalancingOptions
): BalancingResult {
  const startTime = performance.now();
  const warnings: string[] = [];

  const n = members.length;
  // 1. Kiểm tra số lượng người (4 <= n <= 8)
  if (n < 4 || n > 8) {
    throw new Error(`Số lượng thành viên trên sân không hợp lệ: ${n} người (yêu cầu từ 4 đến 8 người)`);
  }

  // 2. Kiểm tra giới tính theo nội dung sân
  if (options.category === "men") {
    if (members.some((m) => m.gender !== "M")) {
      warnings.push("CATEGORY_MISMATCH: Sân Đôi nam nhưng có thành viên là Nữ");
    }
  } else if (options.category === "women") {
    if (members.some((m) => m.gender !== "F")) {
      warnings.push("CATEGORY_MISMATCH: Sân Đôi nữ nhưng có thành viên là Nam");
    }
  } else if (options.category === "mixed") {
    const maleCount = members.filter((m) => m.gender === "M").length;
    const femaleCount = members.filter((m) => m.gender === "F").length;
    if (maleCount < 2 || femaleCount < 2) {
      warnings.push(`MIXED_IMBALANCE: Sân Đôi nam nữ có ${maleCount} Nam và ${femaleCount} Nữ (cần ít nhất 2 Nam và 2 Nữ để đánh đôi nam nữ)`);
    }
  }

  const maxDiffWarn = options.maxDiffWarn ?? 200;
  const numMatches = options.targetMatches ?? (n === 4 ? 1 : n);
  const rnd = createPseudoRandom(options.seed ?? 42);

  // Tạo bản sao danh sách để theo dõi số trận đã chơi và số lần nghỉ
  const playerStats = members.map((m) => ({
    ...m,
    gamesPlayed: m.gamesPlayed ?? 0,
    restCount: 0,
  }));

  const matches: MatchPlan[] = [];

  // Lập lịch từng lượt trận
  for (let matchIndex = 1; matchIndex <= numMatches; matchIndex++) {
    let activePlayers: BalancingMember[] = [];
    let restingPlayers: BalancingMember[] = [];

    if (n === 4) {
      // 4 người: Toàn bộ 4 người thi đấu, không ai nghỉ
      activePlayers = playerStats.map((p) => members.find((m) => m.id === p.id)!);
      restingPlayers = [];
    } else {
      // n = 5, 6, 7, 8: Chọn 4 người thi đấu và n - 4 người nghỉ
      // Tiêu chí ưu tiên chọn người thi đấu:
      // 1. gamesPlayed ít hơn
      // 2. restCount nhiều hơn (vừa nghỉ xong)
      // 3. Phá hòa ngẫu nhiên theo seed xác định

      let candidatePool = [...playerStats];

      if (options.category === "mixed") {
        const malePool = candidatePool.filter((p) => p.gender === "M");
        const femalePool = candidatePool.filter((p) => p.gender === "F");

        if (malePool.length >= 2 && femalePool.length >= 2) {
          // Sắp xếp ưu tiên người chơi ít hơn
          malePool.sort((a, b) => a.gamesPlayed - b.gamesPlayed || b.restCount - a.restCount || rnd() - 0.5);
          femalePool.sort((a, b) => a.gamesPlayed - b.gamesPlayed || b.restCount - a.restCount || rnd() - 0.5);

          const chosenMales = malePool.slice(0, 2);
          const chosenFemales = femalePool.slice(0, 2);

          const chosenStats = [...chosenMales, ...chosenFemales];
          activePlayers = chosenStats.map((p) => members.find((m) => m.id === p.id)!);
          restingPlayers = candidatePool
            .filter((p) => !chosenStats.some((c) => c.id === p.id))
            .map((p) => members.find((m) => m.id === p.id)!);
        } else {
          // Không đủ 2 nam 2 nữ -> chọn theo gamesPlayed chung
          candidatePool.sort((a, b) => a.gamesPlayed - b.gamesPlayed || b.restCount - a.restCount || rnd() - 0.5);
          const chosenStats = candidatePool.slice(0, 4);
          activePlayers = chosenStats.map((p) => members.find((m) => m.id === p.id)!);
          restingPlayers = candidatePool.slice(4).map((p) => members.find((m) => m.id === p.id)!);
        }
      } else {
        // men hoặc women
        candidatePool.sort((a, b) => a.gamesPlayed - b.gamesPlayed || b.restCount - a.restCount || rnd() - 0.5);
        const chosenStats = candidatePool.slice(0, 4);
        activePlayers = chosenStats.map((p) => members.find((m) => m.id === p.id)!);
        restingPlayers = candidatePool.slice(4).map((p) => members.find((m) => m.id === p.id)!);
      }
    }

    // Chia 4 người thành Team A và Team B
    const division = divideIntoTwoBalancedTeams(activePlayers, options.category);
    const isUnbalanced = division.diff > maxDiffWarn;

    let warningText: string | undefined;
    if (isUnbalanced) {
      warningText = `UNBALANCED_MATCH: Chênh lệch Elo hai đội là ${division.diff} điểm (vượt ngưỡng cảnh báo ${maxDiffWarn} điểm)`;
      if (!warnings.includes(warningText)) {
        warnings.push(warningText);
      }
    }

    const matchPlan: MatchPlan = {
      matchIndex,
      teamA: division.teamA,
      teamB: division.teamB,
      teamAIds: [division.teamA[0].id, division.teamA[1].id],
      teamBIds: [division.teamB[0].id, division.teamB[1].id],
      restingMembers: restingPlayers,
      restingIds: restingPlayers.map((p) => p.id),
      ratingA: division.ratingA,
      ratingB: division.ratingB,
      diff: division.diff,
      isUnbalanced,
      warning: warningText,
    };

    matches.push(matchPlan);

    // Cập nhật thống kê cho lượt sau
    for (const p of playerStats) {
      if (matchPlan.teamAIds.includes(p.id) || matchPlan.teamBIds.includes(p.id)) {
        p.gamesPlayed += 1;
      } else {
        p.restCount += 1;
      }
    }
  }

  const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

  return {
    courtNumber: undefined,
    category: options.category,
    totalMembers: n,
    matches,
    warnings,
    executionTimeMs,
  };
}

/**
 * Host kéo đổi thủ công vị trí giữa 2 người chơi (Swap Players)
 * Tính lại chênh lệch điểm và cảnh báo nếu mất cân bằng (không chặn host)
 */
export function swapPlayers(
  match: MatchPlan,
  playerAId: string,
  playerBId: string,
  category: CourtCategory,
  maxDiffWarn: number = 200
): SwapPlayersResult {
  const allMembers = [
    ...match.teamA,
    ...match.teamB,
    ...match.restingMembers,
  ];

  const pA = allMembers.find((m) => m.id === playerAId);
  const pB = allMembers.find((m) => m.id === playerBId);

  if (!pA || !pB) {
    return {
      match,
      isValid: false,
      warning: "Không tìm thấy thông tin một trong hai người chơi cần hoán đổi",
    };
  }

  // Sao chép danh sách hiện tại
  let newTeamA = [...match.teamA] as [BalancingMember, BalancingMember];
  let newTeamB = [...match.teamB] as [BalancingMember, BalancingMember];
  let newResting = [...match.restingMembers];

  // Thay thế hoán đổi
  const replaceInList = (list: BalancingMember[], targetId: string, replacement: BalancingMember) => {
    return list.map((m) => (m.id === targetId ? replacement : m));
  };

  const isAInTeamA = match.teamAIds.includes(playerAId);
  const isAInTeamB = match.teamBIds.includes(playerAId);
  const isAInRest = match.restingIds.includes(playerAId);

  const isBInTeamA = match.teamAIds.includes(playerBId);
  const isBInTeamB = match.teamBIds.includes(playerBId);
  const isBInRest = match.restingIds.includes(playerBId);

  // Đổi chỗ
  if (isAInTeamA) newTeamA = replaceInList(newTeamA, playerAId, pB) as [BalancingMember, BalancingMember];
  else if (isAInTeamB) newTeamB = replaceInList(newTeamB, playerAId, pB) as [BalancingMember, BalancingMember];
  else if (isAInRest) newResting = replaceInList(newResting, playerAId, pB);

  if (isBInTeamA) newTeamA = replaceInList(newTeamA, playerBId, pA) as [BalancingMember, BalancingMember];
  else if (isBInTeamB) newTeamB = replaceInList(newTeamB, playerBId, pA) as [BalancingMember, BalancingMember];
  else if (isBInRest) newResting = replaceInList(newResting, playerBId, pA);

  const newRatingA = newTeamA[0].rating + newTeamA[1].rating;
  const newRatingB = newTeamB[0].rating + newTeamB[1].rating;
  const newDiff = Math.abs(newRatingA - newRatingB);
  const isUnbalanced = newDiff > maxDiffWarn;

  let warning: string | undefined;
  if (category === "mixed") {
    const teamAMales = newTeamA.filter((m) => m.gender === "M").length;
    const teamBMales = newTeamB.filter((m) => m.gender === "M").length;
    if (teamAMales !== 1 || teamBMales !== 1) {
      warning = "CẢNH BÁO: Đổi người làm mất cân bằng giới tính Đôi nam nữ (mỗi đội phải có 1 Nam và 1 Nữ)";
    }
  }

  if (isUnbalanced && !warning) {
    warning = `CẢNH BÁO: Đội hình sau khi đổi bị lệch ${newDiff} điểm Elo (vượt ngưỡng khuyến nghị ${maxDiffWarn} điểm)`;
  }

  const updatedMatch: MatchPlan = {
    ...match,
    teamA: newTeamA,
    teamB: newTeamB,
    teamAIds: [newTeamA[0].id, newTeamA[1].id],
    teamBIds: [newTeamB[0].id, newTeamB[1].id],
    restingMembers: newResting,
    restingIds: newResting.map((m) => m.id),
    ratingA: newRatingA,
    ratingB: newRatingB,
    diff: newDiff,
    isUnbalanced,
    warning,
  };

  return {
    match: updatedMatch,
    isValid: true,
    warning,
  };
}

/**
 * Phân bổ danh sách người chơi vào 2 sân khi kèo có 2 sân (CR-01)
 * Sau đó chạy balanceCourt độc lập cho từng sân
 */
export function distributePlayersToCourts(
  allMembers: BalancingMember[],
  courtConfigs: {
    courtNumber: 1 | 2;
    category: CourtCategory;
    levelMin?: number;
    levelMax?: number;
  }[]
): {
  court1Members: BalancingMember[];
  court2Members: BalancingMember[];
} {
  if (courtConfigs.length !== 2) {
    throw new Error("Hàm phân bổ 2 sân yêu cầu đúng cấu hình của 2 sân");
  }

  const [c1, c2] = courtConfigs;

  // Nếu 2 sân có nội dung khác nhau (ví dụ Sân 1 là Đôi nam, Sân 2 là Đôi nam nữ hoặc Đôi nữ)
  if (c1.category !== c2.category) {
    const court1Members: BalancingMember[] = [];
    const court2Members: BalancingMember[] = [];

    for (const m of allMembers) {
      if (c1.category === "men" && m.gender === "M" && court1Members.length < 8) {
        court1Members.push(m);
      } else if (c1.category === "women" && m.gender === "F" && court1Members.length < 8) {
        court1Members.push(m);
      } else {
        court2Members.push(m);
      }
    }
    return { court1Members, court2Members };
  }

  // Nếu cả 2 sân cùng nội dung: Sắp xếp theo trình độ và chia đều theo phương pháp Z-order (rắn leo thang)
  const sorted = [...allMembers].sort((a, b) => b.rating - a.rating);
  const court1Members: BalancingMember[] = [];
  const court2Members: BalancingMember[] = [];

  sorted.forEach((m, idx) => {
    // Luân phiên chia vào 2 sân để cả 2 sân đều có người mạnh và người yếu đồng đều
    if (idx % 2 === 0) {
      court1Members.push(m);
    } else {
      court2Members.push(m);
    }
  });

  return { court1Members, court2Members };
}
