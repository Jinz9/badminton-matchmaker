/**
 * ĐỊNH NGHĨA TYPES CHO MODULE TUYỂN VÃNG LAI & ĐẶT SUẤT (RECRUIT SLOT MATCHING)
 * Nguồn căn cứ: Skill `recruit-slot-matching` & `badminton-domain-rules`
 */

import { JoinRequestDoc } from "../types";

/**
 * Mã lỗi khi kiểm tra điều kiện nộp đơn xin tham gia kèo
 */
export type RecruitErrorCode =
  | "SESSION_CLOSED"       // Kèo không ở trạng thái mở ('open')
  | "RECRUIT_CLOSED"       // Sân hiện không mở tuyển vãng lai
  | "ALREADY_IN_SESSION"   // Người chơi đã có mặt ở sân này hoặc sân khác cùng kèo
  | "GENDER_NOT_ALLOWED"   // Giới tính không được phép theo nội dung sân
  | "LEVEL_OUT_OF_RANGE"   // Cấp độ hoặc Elo nằm ngoài dải quy định của sân
  | "RELIABILITY_TOO_LOW"  // Điểm uy tín thấp hơn mức tối thiểu sân yêu cầu
  | "TIME_CONFLICT"        // Trùng giờ với kèo khác mà người chơi đang tham gia
  | "NO_SLOT"              // Hết suất chính thức (chỉ có thể vào danh sách dự bị)
  | "OVERBOOKED";          // Sân đã đủ hoặc vượt quá 8 người

/**
 * Kết quả kiểm tra điều kiện xin tham gia
 */
export interface RecruitEligibilityResult {
  eligible: boolean;           // true nếu được vào thẳng suất chính thức (trạng thái requested)
  canWaitlist: boolean;        // true nếu chỉ bị lỗi NO_SLOT và được phép vào waitlist
  errorCode?: RecruitErrorCode;
  message?: string;            // Thông điệp tiếng Việt thân thiện hiển thị trên giao diện
}

/**
 * Kết quả tính toán số suất tuyển vãng lai của sân
 */
export interface SlotCalculationResult {
  total: number;       // Tổng số suất tối đa mở cho vãng lai: min(4, 8 - coreCount)
  open: number;        // Số suất còn trống: total - recruitConfirmed
  coreCount: number;   // Số người mặc định hiện có
  recruitConfirmed: number; // Số vãng lai đã duyệt
  overbooked: boolean; // Trạng thái lỗi nếu tổng người > 8
}

/**
 * Chi tiết điểm đánh giá độ phù hợp của ứng viên (Heuristic Fit Score)
 */
export interface RecruitFitScoreBreakdown {
  levelScore: number;          // Điểm khớp trình độ (0 - 40)
  positionScore: number;       // Điểm bổ trợ vị trí nhóm đang thiếu (0 - 25)
  reliabilityScore: number;    // Điểm uy tín tác phong (0 - 25)
  earlyScore: number;          // Điểm ưu tiên nộp sớm (0 - 10)
  totalFit: number;            // Tổng điểm phù hợp (0 - 100)
  reasons: string[];           // Danh sách lý do khen/ưu tiên hiển thị trên card duyệt
}

/**
 * Đơn xin tham gia đã được chấm điểm và xếp hạng
 */
export interface RankedRecruitRequest {
  request: JoinRequestDoc;
  fitScore: RecruitFitScoreBreakdown;
}

/**
 * Số suất mở theo giới tính trên sân
 */
export interface GenderSlotAvailability {
  maleAllowed: boolean;
  femaleAllowed: boolean;
  maleRemaining: number;
  femaleRemaining: number;
  label: string; // "Còn 2 suất: 1 nam, 1 nữ"
}

