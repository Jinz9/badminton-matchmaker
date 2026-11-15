/**
 * NGUỒN SỰ THẬT VỀ LUẬT NGHIỆP VỤ & HẰNG SỐ CẦU LÔNG (BADMINTON DOMAIN RULES)
 * Áp dụng cho: Match Lobby, Courts, Recruit Slot Matching, Session Balancing
 * Căn cứ: Skill `badminton-domain-rules` & `docs/PROJECT_CONTEXT.md` (CR-01, CR-02)
 */

export const RULES = {
  /**
   * Mỗi kèo giao lưu tối đa 2 sân (tối đa 16 người / kèo)
   */
  MAX_COURTS_PER_SESSION: 2,

  /**
   * Sức chứa tối đa của mỗi sân đấu: 8 người (người mặc định + vãng lai)
   */
  COURT_CAPACITY: 8,

  /**
   * Đánh đôi: Đúng 4 người trên sân trong mỗi set đấu, số còn lại nghỉ xoay tua
   */
  PLAYERS_PER_MATCH: 4,

  /**
   * Số suất vãng lai tối đa được phép tuyển trên một sân
   */
  MAX_RECRUITS_PER_COURT: 4,

  /**
   * Giả định A1: Sân phải có tối thiểu 4 người mặc định (core) mới được mở tuyển vãng lai
   */
  MIN_CORE_PER_COURT: 4,

  /**
   * Danh mục nội dung thi đấu đánh đôi
   */
  CATEGORIES: ["men", "women", "mixed"] as const,

  /**
   * Mức điểm uy tín tối thiểu mặc định để được đăng ký tham gia
   */
  DEFAULT_MIN_RELIABILITY: 60,
} as const;

export type RuleCategory = (typeof RULES.CATEGORIES)[number];

