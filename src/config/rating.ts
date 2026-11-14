/**
 * Cấu hình hằng số thang điểm, cấp độ và thuật toán Elo
 * Nguồn căn cứ:
 * - Skill `badminton-rating` & `badminton-domain-rules`
 * - Quyết định phê duyệt chính thức của TV1 (Chuyên môn Cầu lông) ngày 15/11/2026
 * - Tài liệu đặc tả `docs/06-rating-scale.md`
 */

export interface LevelDefinition {
  level: number;
  name: string;
  minRating: number;
  maxRating: number;
  defaultRating: number;
  description: string;
}

export const RATING_CONFIG = {
  // Điểm sàn và trần tuyệt đối của hệ thống Elo
  // Nguồn: skill badminton-rating, mục 3
  MIN_RATING_FLOOR: 800,
  MAX_RATING_CEILING: 2200,

  // Số trận đầu tiên xem là giai đoạn hiệu chỉnh (Provisional)
  // Trong giai đoạn này dùng K_FACTOR_PROVISIONAL cao để nhanh chóng đưa rank về đúng thực lực
  // TV1 đã chốt: N = 5 trận
  PROVISIONAL_MATCHES_THRESHOLD: 5,

  // Hệ số K-factor trong tính toán Elo đôi
  // Nguồn: skill badminton-rating, mục 3
  K_FACTOR_PROVISIONAL: 40,
  K_FACTOR_STANDARD: 24,

  // Độ lệch Elo tối đa cho phép trong Partner Finder để tìm bạn chơi phù hợp
  // Nguồn: Kế hoạch gốc & docs/PROJECT_CONTEXT.md (CR-02)
  PARTNER_FINDER_MAX_ELO_DIFF: 150,

  // Điểm uy tín (Reputation Score)
  // Nguồn: skill badminton-rating, mục 4
  REPUTATION_DEFAULT: 80,
  REPUTATION_MAX: 100,
  REPUTATION_MIN: 0,
  REPUTATION_WARN_THRESHOLD: 40,

  // Mức biến động điểm uy tín theo hành vi
  REPUTATION_CHANGE: {
    CHECK_IN_ON_TIME: 2,
    CANCEL_OVER_12_HOURS: 0,
    CANCEL_WITHIN_12_HOURS: -5,
    NO_SHOW: -15,
  },

  // Thang 6 cấp độ trình độ phong trào
  // TV1 đã chốt: Phương án B (Theo ngôn ngữ thực tế các sân cầu lông Đà Nẵng)
  LEVELS: [
    {
      level: 1,
      name: "Yếu",
      minRating: 1000,
      maxRating: 1199,
      defaultRating: 1100,
      description: "Mới chơi, còn khó giữ cầu qua lưới, mới bắt đầu làm quen",
    },
    {
      level: 2,
      name: "TB-",
      minRating: 1200,
      maxRating: 1349,
      defaultRating: 1275,
      description: "Cơ bản, đánh được cầu cao, phát cầu ổn định qua lưới",
    },
    {
      level: 3,
      name: "TB",
      minRating: 1350,
      maxRating: 1499,
      defaultRating: 1425,
      description: "Trung bình, có clear, drop, smash cơ bản; biết xoay vị trí",
    },
    {
      level: 4,
      name: "TB+",
      minRating: 1500,
      maxRating: 1649,
      defaultRating: 1575,
      description: "Trung bình khá, chủ động tấn công, kiểm soát lưới tốt, phản xạ nhanh",
    },
    {
      level: 5,
      name: "Khá",
      minRating: 1650,
      maxRating: 1799,
      defaultRating: 1725,
      description: "Khá giỏi, đánh có chiến thuật, ít lỗi hỏng, thể lực bền bỉ",
    },
    {
      level: 6,
      name: "Tốt / Bán chuyên",
      minRating: 1800,
      maxRating: 2000,
      defaultRating: 1900,
      description: "Rất giỏi, trình độ bán chuyên phong trào, cựu năng khiếu",
    },
  ] as const satisfies readonly LevelDefinition[],

  // Trọng số tương thích tay thuận (Hand Compatibility Bonus) trong Partner Finder
  // TV1 đã chốt: Phải + Trái: +25; Phải + Phải: 0; Trái + Trái: 0
  HAND_COMPATIBILITY_BONUS: {
    RIGHT_AND_LEFT: 25,
    RIGHT_AND_RIGHT: 0,
    LEFT_AND_LEFT: 0,
  },

  // Trọng số tương thích vị trí sở trường (Position Compatibility Bonus)
  // TV1 đã chốt: Lưới + Công: +40; Linh hoạt + Bất kỳ: +25; Cùng chuyên biệt: -30
  POSITION_COMPATIBILITY_BONUS: {
    FRONT_AND_BACK: 40,
    BOTH_AND_ANY: 25,
    BOTH_AND_BOTH: 20,
    SAME_SPECIALIZED: -30, // Cả 2 cùng chuyên lưới hoặc cùng chuyên công
  },
} as const;
