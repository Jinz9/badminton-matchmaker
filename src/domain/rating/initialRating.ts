import { RATING_CONFIG, LevelDefinition } from "../../config/rating";

/**
 * Kết quả tính toán trình độ ban đầu từ bảng câu hỏi Onboarding
 */
export interface InitialRatingResult {
  totalScore: number;       // Tổng điểm trắc nghiệm (10 - 40)
  level: number;            // Cấp độ suy ra (1 - 6)
  levelName: string;        // Tên cấp độ
  initialRating: number;    // Điểm Elo khởi tạo ban đầu
  isProvisional: boolean;   // Luôn là true cho người chơi mới
}

/**
 * Quy đổi cấp độ (1 - 6) sang khoảng điểm Elo cho phép của sân đấu
 * @param level Cấp độ từ 1 đến 6
 * @returns Khoảng điểm { minRating, maxRating, name, defaultRating }
 */
export function levelToRange(level: number): LevelDefinition {
  if (level < 1 || level > 6 || !Number.isInteger(level)) {
    throw new Error(`Cấp độ không hợp lệ: ${level}. Cấp độ phải là số nguyên từ 1 đến 6.`);
  }

  const def = RATING_CONFIG.LEVELS.find((l) => l.level === level);
  if (!def) {
    throw new Error(`Không tìm thấy cấu hình cho cấp độ ${level}`);
  }
  return def;
}

/**
 * Quy đổi điểm Elo thực tế sang Cấp độ tương ứng (1 - 6)
 * @param rating Điểm Elo hiện tại
 * @returns Cấp độ tương ứng (1 - 6)
 */
export function ratingToLevel(rating: number): number {
  if (typeof rating !== "number" || isNaN(rating)) {
    throw new Error("Điểm Elo phải là một con số hợp lệ.");
  }

  // Nếu điểm dưới cận cấp 1
  if (rating < RATING_CONFIG.LEVELS[0].minRating) {
    return 1;
  }

  // Duyệt qua từng cấp
  for (const def of RATING_CONFIG.LEVELS) {
    if (rating >= def.minRating && rating <= def.maxRating) {
      return def.level;
    }
  }

  // Nếu điểm vượt qua cận trên cấp 6
  return 6;
}

/**
 * Tính điểm Elo khởi tạo và cấp độ ban đầu dựa trên 10 câu trả lời trắc nghiệm Onboarding
 * @param answers Mảng gồm 10 phần tử, mỗi phần tử có giá trị điểm từ 1 đến 4
 * @returns InitialRatingResult
 */
export function calculateInitialRatingFromAnswers(answers: number[]): InitialRatingResult {
  if (!Array.isArray(answers) || answers.length !== 10) {
    throw new Error("Bảng câu hỏi tự đánh giá yêu cầu đúng 10 câu trả lời.");
  }

  let totalScore = 0;
  for (let i = 0; i < answers.length; i++) {
    const val = answers[i];
    if (typeof val !== "number" || val < 1 || val > 4 || !Number.isInteger(val)) {
      throw new Error(`Câu trả lời số ${i + 1} không hợp lệ (${val}). Điểm mỗi câu phải là số nguyên từ 1 đến 4.`);
    }
    totalScore += val;
  }

  // Phân loại cấp độ theo tổng điểm (10 - 40 điểm)
  let level = 1;
  if (totalScore <= 14) {
    level = 1;
  } else if (totalScore <= 20) {
    level = 2;
  } else if (totalScore <= 27) {
    level = 3;
  } else if (totalScore <= 33) {
    level = 4;
  } else if (totalScore <= 38) {
    level = 5;
  } else {
    level = 6;
  }

  const levelInfo = levelToRange(level);

  return {
    totalScore,
    level,
    levelName: levelInfo.name,
    initialRating: levelInfo.defaultRating,
    isProvisional: true,
  };
}
