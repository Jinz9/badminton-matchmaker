/**
 * MODULE KIỂM TRA TỶ SỐ SET CẦU LÔNG THEO LUẬT BWF (SCORE VALIDATION)
 * Luật thi đấu đánh đôi chuẩn:
 * - Thắng ở điểm 21 với cách biệt tối thiểu 2 điểm (21-19, 21-15...)
 * - Nếu hòa 20-20 (Deuce): Đánh tiếp đến khi cách nhau 2 điểm (22-20, 25-23...)
 * - Điểm tối đa tuyệt đối là 30: Nếu hòa 29-29, bên ghi điểm 30 trước sẽ thắng (30-29)
 * - Trận 1 set hoặc đánh 3 set thắng 2 (Best of 3)
 */

import { MatchSetScore } from "../types";
import { ScoreValidationResult } from "./types";

/**
 * Kiểm tra tính hợp lệ của một set đấu đơn lẻ
 */
export function validateSingleSet(
  scoreA: number,
  scoreB: number,
  setNumber: number = 1
): { isValid: boolean; winner?: "teamA" | "teamB"; error?: string } {
  if (
    !Number.isInteger(scoreA) ||
    !Number.isInteger(scoreB) ||
    scoreA < 0 ||
    scoreB < 0
  ) {
    return {
      isValid: false,
      error: `Set ${setNumber}: Điểm số phải là số nguyên không âm (${scoreA} - ${scoreB})`,
    };
  }

  if (scoreA === scoreB) {
    return {
      isValid: false,
      error: `Set ${setNumber}: Trận đấu cầu lông không có tỷ số hòa trong một set (${scoreA} - ${scoreB})`,
    };
  }

  const maxScore = Math.max(scoreA, scoreB);
  const minScore = Math.min(scoreA, scoreB);
  const diff = maxScore - minScore;

  // Điểm số tuyệt đối không được vượt quá 30 điểm
  if (maxScore > 30) {
    return {
      isValid: false,
      error: `Set ${setNumber}: Điểm số tối đa theo luật BWF là 30 điểm (${scoreA} - ${scoreB})`,
    };
  }

  // Điểm thắng tối thiểu phải đạt 21
  if (maxScore < 21) {
    return {
      isValid: false,
      error: `Set ${setNumber}: Bên thắng phải đạt tối thiểu 21 điểm (${scoreA} - ${scoreB})`,
    };
  }

  // Trường hợp 1: Thắng đúng ở điểm 21
  if (maxScore === 21) {
    if (minScore > 19) {
      return {
        isValid: false,
        error: `Set ${setNumber}: Tỷ số 21 - ${minScore} chưa đạt cách biệt 2 điểm theo luật Deuce`,
      };
    }
    return {
      isValid: true,
      winner: scoreA > scoreB ? "teamA" : "teamB",
    };
  }

  // Trường hợp 2: Điểm thắng từ 22 đến 29 (phải đúng cách biệt 2 điểm)
  if (maxScore > 21 && maxScore < 30) {
    if (diff !== 2) {
      return {
        isValid: false,
        error: `Set ${setNumber}: Khi điểm vượt quá 21, bên thắng phải cách biệt đúng 2 điểm (nhận được cách biệt ${diff})`,
      };
    }
    return {
      isValid: true,
      winner: scoreA > scoreB ? "teamA" : "teamB",
    };
  }

  // Trường hợp 3: Chạm trần 30 điểm (30 - 29 hoặc 30 - 28)
  if (maxScore === 30) {
    if (minScore < 28 || minScore > 29) {
      return {
        isValid: false,
        error: `Set ${setNumber}: Tỷ số chạm 30 điểm chỉ hợp lệ khi đối phương đạt 28 hoặc 29 điểm (${scoreA} - ${scoreB})`,
      };
    }
    return {
      isValid: true,
      winner: scoreA > scoreB ? "teamA" : "teamB",
    };
  }

  return { isValid: false, error: `Set ${setNumber}: Tỷ số không hợp lệ theo luật BWF` };
}

/**
 * Kiểm tra toàn bộ các set trong một trận đấu (1 set hoặc 3 set thắng 2)
 */
export function validateMatchScores(sets: MatchSetScore[]): ScoreValidationResult {
  if (!sets || sets.length === 0) {
    return {
      isValid: false,
      setsWonA: 0,
      setsWonB: 0,
      error: "Trận đấu chưa có tỷ số set nào",
    };
  }

  if (sets.length > 3) {
    return {
      isValid: false,
      setsWonA: 0,
      setsWonB: 0,
      error: "Một trận đấu tối đa gồm 3 set (Best of 3)",
    };
  }

  let setsWonA = 0;
  let setsWonB = 0;

  for (let i = 0; i < sets.length; i++) {
    const s = sets[i];
    const validation = validateSingleSet(s.scoreA, s.scoreB, s.setNumber || i + 1);
    if (!validation.isValid) {
      return {
        isValid: false,
        setsWonA,
        setsWonB,
        error: validation.error,
      };
    }

    if (validation.winner === "teamA") {
      setsWonA++;
    } else {
      setsWonB++;
    }

    // Nếu một bên đã thắng 2-0 mà vẫn có set 3
    if (i === 1 && (setsWonA === 2 || setsWonB === 2) && sets.length === 3) {
      return {
        isValid: false,
        setsWonA,
        setsWonB,
        error: "Một bên đã thắng 2-0 sau 2 set, không thể có thêm set thứ 3",
      };
    }
  }

  // Xác định đội chiến thắng
  if (sets.length === 1) {
    const winner = setsWonA > setsWonB ? "teamA" : "teamB";
    return { isValid: true, winner, setsWonA, setsWonB };
  }

  // Trường hợp 2 hoặc 3 set
  if (setsWonA === setsWonB) {
    return {
      isValid: false,
      setsWonA,
      setsWonB,
      error: "Trận đấu chưa phân định thắng bại (hòa 1-1, cần đánh set 3)",
    };
  }

  const winner = setsWonA > setsWonB ? "teamA" : "teamB";
  return {
    isValid: true,
    winner,
    setsWonA,
    setsWonB,
  };
}

