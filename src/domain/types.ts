/**
 * DATA CONTRACT TYPES & DOMAIN INTERFACES
 * Nguồn sự thật (Single Source of Truth) về kiểu dữ liệu toàn hệ thống
 * Áp dụng cho: Mobile Client (Expo), Backend (Cloud Functions), Local Mock Data & Tests
 * Phiên bản: 1.0 (Ban hành Tuần 3)
 */

// ==========================================
// 1. ENUMS & CONSTANTS
// ==========================================

export type UserRole = "player" | "host" | "admin";

export type Gender = "M" | "F";

export type Handedness = "right" | "left";

export type PlayStyle = "front" | "back" | "both";

export type BadmintonLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type SessionStatus =
  | "open"         // Đang mở tuyển vãng lai
  | "full"         // Đã đủ người (hết suất chính thức, chỉ nhận waitlist)
  | "in_progress"  // Buổi đánh đang diễn ra tại sân
  | "completed"    // Buổi đánh đã kết thúc và chốt kết quả
  | "cancelled";   // Kèo bị hủy

export type CourtCategory = "men" | "women" | "mixed";

export type PairingMode = "auto" | "rotate";

export type PairSource = "self" | "host";

export type RosterRole = "core" | "recruit";

export type RequestStatus =
  | "requested"   // Đang chờ Host duyệt
  | "waitlist"    // Nằm trong hàng đợi dự bị
  | "confirmed"   // Đã được Host duyệt vào sân
  | "declined"    // Bị Host từ chối
  | "withdrawn"   // Người chơi tự rút yêu cầu khi chưa duyệt
  | "cancelled";  // Người chơi đã duyệt nhưng sau đó bấm hủy

export type MatchStatus =
  | "planned"     // Đã lên lịch, chưa đánh
  | "playing"     // Đang thi đấu trên sân
  | "finished"    // Đã đánh xong, chờ Host xác nhận tỷ số
  | "confirmed";  // Đã xác nhận tỷ số, sẵn sàng cập nhật Elo

export type ReviewTag =
  | "correct_level"  // Đúng trình độ tự khai
  | "plays_better"   // Đánh hay hơn khai báo
  | "good_attitude"; // Thái độ hòa nhã, fair-play

export type ReportReason =
  | "fake_level"  // Khai khống trình độ (quá yếu so với điểm)
  | "no_show";    // Bùng kèo (không đến sân mà không báo)

// ==========================================
// 2. USER & SKILL PROFILE
// ==========================================

export interface UserSkillProfile {
  rating: number;             // Điểm Elo hiện tại (800 - 2200)
  matchesPlayed: number;      // Tổng số trận đã đấu
  reliability: number;        // Điểm uy tín (0 - 100)
  isProvisional: boolean;     // true: 5 trận đầu (K=40), false: chính thức (K=24)
}

export interface UserProfile {
  uid: string;
  displayName: string;
  gender: Gender;
  phoneNumber?: string;
  avatarUrl?: string;
  areaLabel: string;          // Quận/Huyện tại Đà Nẵng (Hải Châu, Thanh Khê,...)
  position: PlayStyle;
  dominantHand: Handedness;
  selfDeclaredLevel: BadmintonLevel;
  role: UserRole;
  skill: UserSkillProfile;
  fcmTokens: string[];
  schemaVersion: number;      // Phiên bản schema (mặc định: 1)
  isDeleted: boolean;         // Xóa mềm
  createdAt: string;          // ISO 8601 string hoặc Firestore Timestamp
  updatedAt: string;
}

// Thông tin tóm tắt người chơi (Dùng nhúng trong Roster / Requests / Cards)
export interface PlayerSnapshot {
  displayName: string;
  gender: Gender;
  rating: number;
  level: BadmintonLevel;
  position: PlayStyle;
  dominantHand?: Handedness;
  reliability: number;
}

// ==========================================
// 3. SESSIONS & COURTS
// ==========================================

export interface VietQrPaymentInfo {
  bankId: string;             // Mã định danh ngân hàng (ví dụ: MB, VCB, TCB)
  accountNumber: string;      // Số tài khoản người nhận
  accountName: string;        // Tên chủ tài khoản
}

// Tóm tắt sân lưu trực tiếp trong SessionDoc để tối ưu query danh sách kèo
export interface CourtSummary {
  courtId: string;            // "1" hoặc "2"
  category: CourtCategory;
  levelMin: BadmintonLevel;
  levelMax: BadmintonLevel;
  openSlots: number;          // Suất tuyển vãng lai còn lại: min(4, 8 - coreCount) - confirmedRecruits
  openByGender: {
    M: number;
    F: number;
  };
  recruitOpen: boolean;       // Host có đang mở tuyển hay không
}

export interface SessionDoc {
  id: string;
  hostId: string;
  hostName: string;           // Trường phi chuẩn hóa để hiển thị nhanh
  hostAvatar?: string;
  hostReputation: number;
  title: string;
  venueName: string;          // Tên sân (Kỳ Đồng, Tuyên Sơn,...)
  address: string;
  district: string;           // Quận/Huyện tại Đà Nẵng
  startsAt: string;           // Thời điểm bắt đầu (ISO 8601)
  durationMin: number;        // Thời lượng buổi đánh (phút, ví dụ: 120)
  costPerPlayer: number;      // Tiền sân chia sẻ ước tính (VNĐ)
  status: SessionStatus;
  courtCount: 1 | 2;          // Tối đa 2 sân/kèo
  courtSummaries: CourtSummary[];
  openSlotsTotal: number;     // Tổng số suất vãng lai còn trống của cả kèo
  vietQrInfo?: VietQrPaymentInfo;
  schemaVersion: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 4. COURT ROSTER & PAIRS
// ==========================================

export interface RosterMember {
  memberId: string;           // uid thật hoặc "ghost_<id>"
  displayName: string;
  gender: Gender;
  type: RosterRole;           // "core": Người mặc định | "recruit": Vãng lai
  rating: number;             // Điểm Elo ảnh chụp thời điểm vào sân
  level: BadmintonLevel;
  position: PlayStyle;
  dominantHand: Handedness;
  isGhost: boolean;           // true nếu là thành viên chưa có tài khoản app
  checkedIn: boolean;         // Đã có mặt tại sân hay chưa
  joinedAt: string;
}

export interface LockedPair {
  id: string;                 // Mã cặp (ví dụ: "pair_1")
  a: string;                  // memberId của đấu thủ 1
  b: string;                  // memberId của đấu thủ 2
  source: PairSource;         // "self": Tự bắt cặp | "host": Host gán cố định
}

export interface CourtDoc {
  id: string;                 // "1" hoặc "2"
  sessionId: string;
  courtNumber: 1 | 2;
  category: CourtCategory;
  levelMin: BadmintonLevel;
  levelMax: BadmintonLevel;
  minReliability: number;     // Điểm uy tín tối thiểu để nộp đơn (mặc định: 50)
  pairingMode: PairingMode;
  recruitOpen: boolean;
  // Bất biến: Tổng số phần tử roster <= 8
  roster: Record<string, RosterMember>;
  pairs: LockedPair[];        // Các cặp khóa không được tách
  version: number;            // Phiên bản tăng dần để chống race-condition trong Transaction
  updatedAt: string;
}

// ==========================================
// 5. REQUESTS & WAITLIST
// ==========================================

export interface JoinRequestDoc {
  id: string;                 // Thường bằng uid của người chơi xin vào
  courtId: string;
  sessionId: string;
  userId: string;
  status: RequestStatus;
  snapshot: PlayerSnapshot;
  note?: string;              // Lời nhắn gửi tới Host
  waitlistPosition?: number;  // Vị trí trong hàng đợi dự bị (1, 2, 3...)
  createdAt: string;
  decidedAt?: string;
}

// ==========================================
// 6. MATCHES, SETS & REVIEWS
// ==========================================

export interface MatchSetScore {
  setNumber: number;
  scoreA: number;             // Điểm của Team A (ví dụ: 21)
  scoreB: number;             // Điểm của Team B (ví dụ: 19)
}

export interface PostMatchCard {
  fromUserId: string;
  toUserId: string;
  tag?: ReviewTag;
  reportReason?: ReportReason;
}

export interface MatchDoc {
  id: string;
  sessionId: string;
  courtId: string;            // "1" hoặc "2"
  index: number;              // Thứ tự trận đấu trong buổi (1, 2, 3...)
  teamA: [string, string];    // [memberId_1, memberId_2]
  teamB: [string, string];    // [memberId_3, memberId_4]
  playerIds?: string[];       // Danh sách 4 VĐV để Firestore query array-contains
  category?: CourtCategory;   // "men" | "women" | "mixed"
  sets: MatchSetScore[];
  status: MatchStatus;
  winner?: "teamA" | "teamB"; // Đội chiến thắng
  confirmedBy?: string;       // hostId xác nhận kết quả
  ratingProcessed: boolean;   // true: Đã cập nhật Elo, false: Chưa cập nhật
  cards?: PostMatchCard[];    // Thẻ đánh giá sau trận
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 7. BEST PARTNERS & RATING HISTORY
// ==========================================

export interface BestPartnerStat {
  partnerId: string;
  partnerName: string;
  partnerAvatar?: string;
  matchesCount: number;       // Số trận đánh cùng nhau (>= 3 để xét)
  winsCount: number;          // Số trận thắng
  winRate: number;            // Tỷ lệ thắng (0.0 - 1.0, >= 0.60 xét ăn ý)
  lastPlayedAt: string;
}

export interface RatingHistoryDoc {
  id: string;
  userId: string;
  matchId: string;
  sessionId: string;
  oldRating: number;
  newRating: number;
  delta: number;              // Ví dụ: +16 hoặc -12
  kFactor: number;            // 40 hoặc 24
  oldReliability: number;
  newReliability: number;
  reason: "match_result" | "cancel_penalty" | "attendance_reward" | "admin_adjustment";
  createdAt: string;
}

export interface MonthlyStat {
  month: string;              // "2026-11"
  matches: number;
  wins: number;
  losses: number;
  winRate: number;            // 0.0 - 1.0
}

export interface CategoryStat {
  matches: number;
  wins: number;
  losses: number;
  winRate: number;            // 0.0 - 1.0
}

export interface UserStatsDoc {
  userId: string;
  totalMatches: number;
  totalWins: number;
  totalLosses: number;
  overallWinRate: number;      // 0.0 - 1.0
  byCategory: {
    men: CategoryStat;
    women: CategoryStat;
    mixed: CategoryStat;
  };
  byMonth: Record<string, MonthlyStat>;
  bestPartners: BestPartnerStat[];
  updatedAt: string;
}

// ==========================================
// 8. NOTIFICATIONS
// ==========================================

export type NotificationType =
  | "request_received"
  | "request_approved"
  | "request_declined"
  | "waitlist_promoted"
  | "match_reminder"
  | "reputation_penalty"
  | "reputation_reward";

export interface NotificationDoc {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: {
    sessionId?: string;
    courtId?: string;
    matchId?: string;
  };
  read: boolean;
  createdAt: string;
}
