import {
  UserProfile,
  CourtCategory,
  BadmintonLevel,
} from "../types";

/**
 * Bộ lọc cho Partner Finder (Tìm đồng đội đánh đôi cố định)
 */
export interface PartnerFinderFilters {
  /**
   * Nội dung đánh đôi mong muốn:
   * - 'men': Đôi nam (Seeker phải là Nam, Candidate phải là Nam)
   * - 'women': Đôi nữ (Seeker phải là Nữ, Candidate phải là Nữ)
   * - 'mixed': Đôi nam nữ (Seeker và Candidate phải khác giới tính)
   */
  category?: CourtCategory;

  /**
   * Lọc theo quận/huyện tại Đà Nẵng (Hải Châu, Thanh Khê, Cẩm Lệ,...)
   * Nếu bỏ trống, không lọc cứng theo quận nhưng cùng quận sẽ được cộng điểm ưu tiên.
   */
  areaLabel?: string;

  /**
   * Cấp độ tối thiểu (1 - 6)
   */
  levelMin?: BadmintonLevel;

  /**
   * Cấp độ tối đa (1 - 6)
   */
  levelMax?: BadmintonLevel;

  /**
   * Độ lệch Elo tối đa cho phép (mặc định lấy từ RATING_CONFIG.PARTNER_FINDER_MAX_ELO_DIFF = 150)
   */
  maxEloDiff?: number;

  /**
   * Danh sách UID cần loại trừ (bản thân, người đã chặn, người đã kết nối)
   */
  excludeUids?: string[];

  /**
   * Cho phép nới lỏng giới hạn Elo thêm 50 điểm cho người chơi đang trong giai đoạn Provisional (<= 5 trận)
   */
  allowProvisionalExpansion?: boolean;
}

/**
 * Trọng số và cấu hình thuật toán ghép cặp
 */
export interface PartnerFinderConfig {
  maxEloDiff: number;
  weights: {
    elo: number;         // Tối đa 40 điểm
    position: number;    // Tối đa 30 điểm
    hand: number;        // Tối đa 15 điểm
    area: number;        // Tối đa 10 điểm
    reliability: number; // Tối đa 5 điểm
  };
}

/**
 * Chi tiết điểm thành phần (để debug hoặc hiển thị thanh radar nếu cần)
 */
export interface PartnerScoreBreakdown {
  eloScore: number;
  positionScore: number;
  handScore: number;
  areaScore: number;
  reliabilityScore: number;
}

/**
 * Kết quả khớp cặp của 1 ứng viên
 */
export interface PartnerMatchItem {
  user: UserProfile;
  matchScore: number;        // Điểm tương thích tổng hợp 0 - 100
  eloDiff: number;           // Độ chênh lệch Elo tuyệt đối
  reasons: string[];         // Danh sách lý do điểm cộng (tiếng Việt cho UI)
  warnings: string[];        // Danh sách cảnh báo (nếu có)
  breakdown: PartnerScoreBreakdown;
  isProvisional: boolean;    // Ứng viên có đang trong giai đoạn hiệu chỉnh hay không
}

