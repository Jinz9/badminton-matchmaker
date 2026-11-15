/**
 * TYPE DEFINITIONS CHO MODULE QUẢN LÝ PHÒNG KÈO (MATCH LOBBY)
 * Căn cứ: Skill `badminton-domain-rules` (CR-01, CR-02) & Data Contract v1.0
 */

import {
  CourtCategory,
  BadmintonLevel,
  RosterMember,
  VietQrPaymentInfo,
  JoinRequestDoc,
} from "../types";

/**
 * Cấu hình khởi tạo cho 1 sân đấu trong kèo
 */
export interface CreateCourtInput {
  courtNumber: 1 | 2;
  category: CourtCategory;
  levelMin: BadmintonLevel;
  levelMax: BadmintonLevel;
  minReliability?: number;    // Mặc định: 60
  initialCoreMembers?: (Omit<RosterMember, "joinedAt" | "type" | "memberId"> & {
    memberId?: string;
  })[];
}

/**
 * Dữ liệu đầu vào để Host tạo một Phòng giao lưu (Session) mới
 */
export interface CreateSessionInput {
  title: string;
  venueName: string;
  address: string;
  district: string;           // Phải nằm trong 7 quận/huyện Đà Nẵng
  startsAt: string;           // ISO 8601 string trong tương lai
  durationMin: number;        // Phút (60 - 360, mặc định 120)
  costPerPlayer: number;      // VNĐ
  courtCount: 1 | 2;          // CR-01: Tối đa 2 sân/kèo (không áp 8-16 của kế hoạch gốc)
  courts: CreateCourtInput[]; // Mảng tương ứng 1 hoặc 2 sân
  vietQrInfo?: VietQrPaymentInfo;
}

/**
 * Kết quả tính phạt điểm uy tín khi hủy/rời kèo
 */
export interface CancellationPenaltyResult {
  penaltyPoints: number;      // Số điểm uy tín bị trừ (0, 5 hoặc 15)
  reason: "CANCEL_OVER_12_HOURS" | "CANCEL_WITHIN_12_HOURS" | "NO_SHOW";
  hoursBeforeStart: number;
  message: string;
}

/**
 * Kết quả đánh giá đôn người từ danh sách dự bị (Waitlist)
 */
export interface WaitlistPromotionResult {
  promotedRequest?: JoinRequestDoc;
  skippedRequests: JoinRequestDoc[]; // Những người bị bỏ qua do không còn thỏa mãn giới tính/uy tín
}
