/**
 * Cấu hình hằng số thang điểm, cấp độ và thuật toán Elo
 * Nguồn căn cứ:
 * - Skill `badminton-rating`
 * - Skill `badminton-domain-rules`
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
  // Nguồn: skill badminton-rating, mục 1 & 3 [ĐỀ XUẤT TV1: 10 trận hoặc 5 trận]
  PROVISIONAL_MATCHES_THRESHOLD: 10,

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
  // Nguồn: skill badminton-rating, mục 1
  LEVELS: [
    {
      level: 1,
      name: "Mới chơi",
      minRating: 1000,
      maxRating: 1199,
      defaultRating: 1100,
      description: "Còn khó giữ cầu qua lưới, mới bắt đầu làm quen",
    },
    {
      level: 2,
      name: "Cơ bản",
      minRating: 1200,
      maxRating: 1349,
      defaultRating: 1275,
      description: "Đánh được cầu cao, phát cầu ổn định qua lưới",
    },
    {
      level: 3,
      name: "Trung bình",
      minRating: 1350,
      maxRating: 1499,
      defaultRating: 1425,
      description: "Có clear, drop, smash cơ bản; biết xoay vị trí",
    },
    {
      level: 4,
      name: "Khá",
      minRating: 1500,
      maxRating: 1649,
      defaultRating: 1575,
      description: "Chủ động tấn công, kiểm soát lưới tốt, phản xạ nhanh",
    },
    {
      level: 5,
      name: "Giỏi",
      minRating: 1650,
      maxRating: 1799,
      defaultRating: 1725,
      description: "Đánh có chiến thuật, ít lỗi hỏng, thể lực bền bỉ",
    },
    {
      level: 6,
      name: "Rất giỏi",
      minRating: 1800,
      maxRating: 2000,
      defaultRating: 1900,
      description: "Trình độ bán chuyên phong trào, cựu năng khiếu",
    },
  ] as const satisfies readonly LevelDefinition[],

  // Trọng số tương thích tay thuận (Hand Compatibility Bonus) trong Partner Finder
  // Nguồn: docs/06-rating-scale.md, mục 3
  HAND_COMPATIBILITY_BONUS: {
    RIGHT_AND_LEFT: 25,
    RIGHT_AND_RIGHT: 0,
    LEFT_AND_LEFT: -10,
  },

  // Trọng số tương thích vị trí sở trường (Position Compatibility Bonus)
  // Nguồn: docs/06-rating-scale.md, mục 4
  POSITION_COMPATIBILITY_BONUS: {
    FRONT_AND_BACK: 40,
    BOTH_AND_ANY: 25,
    BOTH_AND_BOTH: 20,
    SAME_SPECIALIZED: -30, // Cả 2 cùng chuyên lưới hoặc cùng chuyên công
  },
} as const;
