/**
 * SEED DATA & DEMO GENERATOR CHO HỆ THỐNG GHÉP ĐỘI CẦU LÔNG ĐÀ NẴNG
 * Căn cứ: Milestone M9 | WBS 5.3
 *
 * Tạo tập dữ liệu phong phú phục vụ demo cho TV2 và bảo vệ đồ án:
 * - 24 người chơi phong trào Đà Nẵng (dữ liệu hoàn toàn hư cấu), đủ 6 cấp độ.
 * - 4 Kèo giao lưu ở các trạng thái: open, full (kèm Waitlist), in_progress, completed.
 * - Lịch sử trận đấu & Ratings log để hiển thị ngay biểu đồ Elo và Đồng đội ăn ý nhất.
 * - Hỗ trợ cờ --reset để dọn sạch dữ liệu cũ và nạp lại từ đầu.
 */

import {
  UserProfile,
  SessionDoc,
  CourtDoc,
  MatchDoc,
  JoinRequestDoc,
  RatingHistoryDoc,
} from "../src/domain/types";

export interface SeedDataset {
  users: UserProfile[];
  sessions: SessionDoc[];
  courts: CourtDoc[];
  matches: MatchDoc[];
  requests: JoinRequestDoc[];
  ratings: RatingHistoryDoc[];
}

/**
 * 24 Tài khoản người chơi phong trào hư cấu tại Đà Nẵng
 */
export const SEED_USERS: UserProfile[] = [
  // CẤP 1: Yếu (1000 - 1199)
  {
    uid: "usr_seed_01",
    displayName: "Nguyễn Hải Đăng",
    gender: "M",
    phoneNumber: "0905111001",
    areaLabel: "Hải Châu",
    position: "both",
    dominantHand: "right",
    selfDeclaredLevel: 1,
    role: "player",
    fcmTokens: ["fcm_token_01"],
    schemaVersion: 1,
    isDeleted: false,
    skill: { rating: 1100, matchesPlayed: 2, reliability: 80, isProvisional: true },
    createdAt: "2026-11-01T08:00:00Z",
    updatedAt: "2026-11-01T08:00:00Z",
  },
  {
    uid: "usr_seed_02",
    displayName: "Lê Thị Mai",
    gender: "F",
    phoneNumber: "0905111002",
    areaLabel: "Thanh Khê",
    position: "front",
    dominantHand: "right",
    selfDeclaredLevel: 1,
    role: "player",
    fcmTokens: [],
    schemaVersion: 1,
    isDeleted: false,
    skill: { rating: 1150, matchesPlayed: 3, reliability: 75, isProvisional: true },
    createdAt: "2026-11-01T08:30:00Z",
    updatedAt: "2026-11-01T08:30:00Z",
  },
  {
    uid: "usr_seed_03",
    displayName: "Trần Minh Trí",
    gender: "M",
    phoneNumber: "0905111003",
    areaLabel: "Cẩm Lệ",
    position: "back",
    dominantHand: "right",
    selfDeclaredLevel: 1,
    role: "player",
    fcmTokens: [],
    schemaVersion: 1,
    isDeleted: false,
    skill: { rating: 1080, matchesPlayed: 1, reliability: 80, isProvisional: true },
    createdAt: "2026-11-02T09:00:00Z",
    updatedAt: "2026-11-02T09:00:00Z",
  },
  {
    uid: "usr_seed_04",
    displayName: "Phạm Thúy Hằng",
    gender: "F",
    phoneNumber: "0905111004",
    areaLabel: "Sơn Trà",
    position: "both",
    dominantHand: "left",
    selfDeclaredLevel: 1,
    role: "player",
    fcmTokens: [],
    schemaVersion: 1,
    isDeleted: false,
    skill: { rating: 1120, matchesPlayed: 4, reliability: 85, isProvisional: true },
    createdAt: "2026-11-02T09:30:00Z",
    updatedAt: "2026-11-02T09:30:00Z",
  },

  // CẤP 2: Trung bình yếu TB- (1200 - 1349)
  {
    uid: "usr_seed_05",
    displayName: "Võ Hoàng Nam",
    gender: "M",
    phoneNumber: "0905111005",
    areaLabel: "Hải Châu",
    position: "back",
    dominantHand: "right",
    selfDeclaredLevel: 2,
    role: "player",
    fcmTokens: [],
    schemaVersion: 1,
    isDeleted: false,
    skill: { rating: 1260, matchesPlayed: 6, reliability: 85, isProvisional: false },
    createdAt: "2026-11-03T10:00:00Z",
    updatedAt: "2026-11-03T10:00:00Z",
  },
  {
    uid: "usr_seed_06",
    displayName: "Đỗ Kim Oanh",
    gender: "F",
    phoneNumber: "0905111006",
    areaLabel: "Ngũ Hành Sơn",
    position: "front",
    dominantHand: "right",
    selfDeclaredLevel: 2,
    role: "player",
    fcmTokens: [],
    schemaVersion: 1,
    isDeleted: false,
    skill: { rating: 1280, matchesPlayed: 8, reliability: 90, isProvisional: false },
    createdAt: "2026-11-03T10:30:00Z",
    updatedAt: "2026-11-03T10:30:00Z",
  },
  {
    uid: "usr_seed_07",
    displayName: "Phan Gia Huy",
    gender: "M",
    phoneNumber: "0905111007",
    areaLabel: "Liên Chiểu",
    position: "both",
    dominantHand: "left",
    selfDeclaredLevel: 2,
    role: "player",
    fcmTokens: [],
    schemaVersion: 1,
    isDeleted: false,
    skill: { rating: 1310, matchesPlayed: 7, reliability: 80, isProvisional: false },
    createdAt: "2026-11-04T11:00:00Z",
    updatedAt: "2026-11-04T11:00:00Z",
  },
  {
    uid: "usr_seed_08",
    displayName: "Bùi Thị Lan",
    gender: "F",
    phoneNumber: "0905111008",
    areaLabel: "Thanh Khê",
    position: "both",
    dominantHand: "right",
    selfDeclaredLevel: 2,
    role: "player",
    fcmTokens: [],
    schemaVersion: 1,
    isDeleted: false,
    skill: { rating: 1240, matchesPlayed: 5, reliability: 70, isProvisional: false },
    createdAt: "2026-11-04T11:30:00Z",
    updatedAt: "2026-11-04T11:30:00Z",
  },

  // CẤP 3: Trung bình TB (1350 - 1499)
  {
    uid: "usr_seed_09",
    displayName: "Hồ Văn Long (Host)",
    gender: "M",
    phoneNumber: "0905111009",
    areaLabel: "Hải Châu",
    position: "back",
    dominantHand: "right",
    selfDeclaredLevel: 3,
    role: "host",
    fcmTokens: ["fcm_token_host_09"],
    schemaVersion: 1,
    isDeleted: false,
    skill: { rating: 1420, matchesPlayed: 18, reliability: 95, isProvisional: false },
    createdAt: "2026-11-05T08:00:00Z",
    updatedAt: "2026-11-05T08:00:00Z",
  },
  {
    uid: "usr_seed_10",
    displayName: "Đặng Thùy Dương",
    gender: "F",
    phoneNumber: "0905111010",
    areaLabel: "Hải Châu",
    position: "front",
    dominantHand: "right",
    selfDeclaredLevel: 3,
    role: "player",
    fcmTokens: [],
    schemaVersion: 1,
    isDeleted: false,
    skill: { rating: 1390, matchesPlayed: 12, reliability: 85, isProvisional: false },
    createdAt: "2026-11-05T08:30:00Z",
    updatedAt: "2026-11-05T08:30:00Z",
  },
  {
    uid: "usr_seed_11",
    displayName: "Ngô Đức Trọng",
    gender: "M",
    phoneNumber: "0905111011",
    areaLabel: "Sơn Trà",
    position: "both",
    dominantHand: "left",
    selfDeclaredLevel: 3,
    role: "player",
    fcmTokens: [],
    schemaVersion: 1,
    isDeleted: false,
    skill: { rating: 1460, matchesPlayed: 15, reliability: 90, isProvisional: false },
    createdAt: "2026-11-06T09:00:00Z",
    updatedAt: "2026-11-06T09:00:00Z",
  },
  {
    uid: "usr_seed_12",
    displayName: "Trịnh Thùy Linh",
    gender: "F",
    phoneNumber: "0905111012",
    areaLabel: "Cẩm Lệ",
    position: "front",
    dominantHand: "right",
    selfDeclaredLevel: 3,
    role: "player",
    fcmTokens: [],
    schemaVersion: 1,
    isDeleted: false,
    skill: { rating: 1375, matchesPlayed: 10, reliability: 80, isProvisional: false },
    createdAt: "2026-11-06T09:30:00Z",
    updatedAt: "2026-11-06T09:30:00Z",
  },
  {
    uid: "usr_seed_13",
    displayName: "Lý Quốc Bảo",
    gender: "M",
    phoneNumber: "0905111013",
    areaLabel: "Thanh Khê",
    position: "back",
    dominantHand: "right",
    selfDeclaredLevel: 3,
    role: "player",
    fcmTokens: [],
    schemaVersion: 1,
    isDeleted: false,
    skill: { rating: 1440, matchesPlayed: 14, reliability: 85, isProvisional: false },
    createdAt: "2026-11-07T10:00:00Z",
    updatedAt: "2026-11-07T10:00:00Z",
  },

  // CẤP 4: Trung bình khá TB+ (1500 - 1649)
  {
    uid: "usr_seed_14",
    displayName: "Trần Anh Tuấn (Host)",
    gender: "M",
    phoneNumber: "0905111014",
    areaLabel: "Thanh Khê",
    position: "back",
    dominantHand: "right",
    selfDeclaredLevel: 4,
    role: "host",
    fcmTokens: ["fcm_token_host_14"],
    schemaVersion: 1,
    isDeleted: false,
    skill: { rating: 1560, matchesPlayed: 25, reliability: 98, isProvisional: false },
    createdAt: "2026-11-07T10:30:00Z",
    updatedAt: "2026-11-07T10:30:00Z",
  },
  {
    uid: "usr_seed_15",
    displayName: "Nguyễn Thúy Quỳnh",
    gender: "F",
    phoneNumber: "0905111015",
    areaLabel: "Hải Châu",
    position: "front",
    dominantHand: "left",
    selfDeclaredLevel: 4,
    role: "player",
    fcmTokens: [],
    schemaVersion: 1,
    isDeleted: false,
    skill: { rating: 1520, matchesPlayed: 20, reliability: 92, isProvisional: false },
    createdAt: "2026-11-08T11:00:00Z",
    updatedAt: "2026-11-08T11:00:00Z",
  },
  {
    uid: "usr_seed_16",
    displayName: "Đoàn Minh Khang",
    gender: "M",
    phoneNumber: "0905111016",
    areaLabel: "Ngũ Hành Sơn",
    position: "both",
    dominantHand: "right",
    selfDeclaredLevel: 4,
    role: "player",
    fcmTokens: [],
    schemaVersion: 1,
    isDeleted: false,
    skill: { rating: 1585, matchesPlayed: 22, reliability: 88, isProvisional: false },
    createdAt: "2026-11-08T11:30:00Z",
    updatedAt: "2026-11-08T11:30:00Z",
  },
  {
    uid: "usr_seed_17",
    displayName: "Lâm Thanh Trúc",
    gender: "F",
    phoneNumber: "0905111017",
    areaLabel: "Sơn Trà",
    position: "both",
    dominantHand: "right",
    selfDeclaredLevel: 4,
    role: "player",
    fcmTokens: [],
    schemaVersion: 1,
    isDeleted: false,
    skill: { rating: 1510, matchesPlayed: 16, reliability: 85, isProvisional: false },
    createdAt: "2026-11-09T14:00:00Z",
    updatedAt: "2026-11-09T14:00:00Z",
  },
  {
    uid: "usr_seed_18",
    displayName: "Dương Đình Trí",
    gender: "M",
    phoneNumber: "0905111018",
    areaLabel: "Hải Châu",
    position: "back",
    dominantHand: "right",
    selfDeclaredLevel: 4,
    role: "player",
    fcmTokens: [],
    schemaVersion: 1,
    isDeleted: false,
    skill: { rating: 1605, matchesPlayed: 30, reliability: 95, isProvisional: false },
    createdAt: "2026-11-09T14:30:00Z",
    updatedAt: "2026-11-09T14:30:00Z",
  },

  // CẤP 5: Khá (1650 - 1799)
  {
    uid: "usr_seed_19",
    displayName: "Phạm Tấn Tài (Admin)",
    gender: "M",
    phoneNumber: "0905111019",
    areaLabel: "Hải Châu",
    position: "back",
    dominantHand: "right",
    selfDeclaredLevel: 5,
    role: "admin",
    fcmTokens: ["fcm_token_admin_19"],
    schemaVersion: 1,
    isDeleted: false,
    skill: { rating: 1720, matchesPlayed: 45, reliability: 100, isProvisional: false },
    createdAt: "2026-11-10T08:00:00Z",
    updatedAt: "2026-11-10T08:00:00Z",
  },
  {
    uid: "usr_seed_20",
    displayName: "Hoàng Ngọc Ánh",
    gender: "F",
    phoneNumber: "0905111020",
    areaLabel: "Hải Châu",
    position: "front",
    dominantHand: "left",
    selfDeclaredLevel: 5,
    role: "player",
    fcmTokens: [],
    schemaVersion: 1,
    isDeleted: false,
    skill: { rating: 1680, matchesPlayed: 35, reliability: 92, isProvisional: false },
    createdAt: "2026-11-10T08:30:00Z",
    updatedAt: "2026-11-10T08:30:00Z",
  },
  {
    uid: "usr_seed_21",
    displayName: "Trịnh Bá Phong",
    gender: "M",
    phoneNumber: "0905111021",
    areaLabel: "Thanh Khê",
    position: "both",
    dominantHand: "right",
    selfDeclaredLevel: 5,
    role: "player",
    fcmTokens: [],
    schemaVersion: 1,
    isDeleted: false,
    skill: { rating: 1750, matchesPlayed: 40, reliability: 90, isProvisional: false },
    createdAt: "2026-11-11T09:00:00Z",
    updatedAt: "2026-11-11T09:00:00Z",
  },
  {
    uid: "usr_seed_22",
    displayName: "Vũ Phương Thảo",
    gender: "F",
    phoneNumber: "0905111022",
    areaLabel: "Cẩm Lệ",
    position: "front",
    dominantHand: "right",
    selfDeclaredLevel: 5,
    role: "player",
    fcmTokens: [],
    schemaVersion: 1,
    isDeleted: false,
    skill: { rating: 1660, matchesPlayed: 28, reliability: 86, isProvisional: false },
    createdAt: "2026-11-11T09:30:00Z",
    updatedAt: "2026-11-11T09:30:00Z",
  },

  // CẤP 6: Tốt / Bán chuyên (1800 - 2000)
  {
    uid: "usr_seed_23",
    displayName: "Lê Hoàng Phúc",
    gender: "M",
    phoneNumber: "0905111023",
    areaLabel: "Hải Châu",
    position: "back",
    dominantHand: "right",
    selfDeclaredLevel: 6,
    role: "player",
    fcmTokens: [],
    schemaVersion: 1,
    isDeleted: false,
    skill: { rating: 1890, matchesPlayed: 60, reliability: 96, isProvisional: false },
    createdAt: "2026-11-12T10:00:00Z",
    updatedAt: "2026-11-12T10:00:00Z",
  },
  {
    uid: "usr_seed_24",
    displayName: "Nguyễn Duy Khang",
    gender: "M",
    phoneNumber: "0905111024",
    areaLabel: "Sơn Trà",
    position: "both",
    dominantHand: "left",
    selfDeclaredLevel: 6,
    role: "player",
    fcmTokens: [],
    schemaVersion: 1,
    isDeleted: false,
    skill: { rating: 1920, matchesPlayed: 75, reliability: 94, isProvisional: false },
    createdAt: "2026-11-12T10:30:00Z",
    updatedAt: "2026-11-12T10:30:00Z",
  },
];

/**
 * 4 Kèo giao lưu đa dạng trạng thái
 */
export const SEED_SESSIONS: SessionDoc[] = [
  // KÈO 1: OPEN (2 sân, Tuyên Sơn, còn trống suất vãng lai)
  {
    id: "session_seed_01",
    hostId: "usr_seed_09", // Hồ Văn Long
    hostName: "Hồ Văn Long (Host)",
    hostAvatar: undefined,
    hostReputation: 95,
    title: "Giao lưu Sân Tuyên Sơn Chiều T7 (Cấp 2 - 4)",
    venueName: "Sân Cầu Lông Tuyên Sơn",
    address: "01 Nại Nam 2, Phường Hòa Cường Bắc",
    district: "Hải Châu",
    startsAt: "2026-11-20T17:00:00Z",
    durationMin: 120,
    costPerPlayer: 45000,
    status: "open",
    courtCount: 2,
    courtSummaries: [
      { courtId: "1", category: "men", levelMin: 2, levelMax: 4, openSlots: 2, openByGender: { M: 2, F: 0 }, recruitOpen: true },
      { courtId: "2", category: "mixed", levelMin: 2, levelMax: 4, openSlots: 1, openByGender: { M: 0, F: 1 }, recruitOpen: true },
    ],
    openSlotsTotal: 3,
    vietQrInfo: {
      bankId: "MB",
      accountNumber: "0905111009",
      accountName: "HO VAN LONG",
    },
    schemaVersion: 1,
    isDeleted: false,
    createdAt: "2026-11-15T08:00:00Z",
    updatedAt: "2026-11-15T08:00:00Z",
  },

  // KÈO 2: FULL (1 sân, Kỳ Đồng, đã đủ 8 người, có Waitlist)
  {
    id: "session_seed_02",
    hostId: "usr_seed_14", // Trần Anh Tuấn
    hostName: "Trần Anh Tuấn (Host)",
    hostReputation: 98,
    title: "Sân Kỳ Đồng Tối CN (Kèo Cứng Cấp 3 - 5)",
    venueName: "Sân Cầu Lông Kỳ Đồng",
    address: "Đường Kỳ Đồng, Phường Thanh Khê Đông",
    district: "Thanh Khê",
    startsAt: "2026-11-21T19:00:00Z",
    durationMin: 120,
    costPerPlayer: 50000,
    status: "full",
    courtCount: 1,
    courtSummaries: [
      { courtId: "1", category: "men", levelMin: 3, levelMax: 5, openSlots: 0, openByGender: { M: 0, F: 0 }, recruitOpen: true },
    ],
    openSlotsTotal: 0,
    schemaVersion: 1,
    isDeleted: false,
    createdAt: "2026-11-15T09:00:00Z",
    updatedAt: "2026-11-15T09:00:00Z",
  },

  // KÈO 3: IN_PROGRESS (1 sân, Quân Khu 5, đang thi đấu tại sân)
  {
    id: "session_seed_03",
    hostId: "usr_seed_09",
    hostName: "Hồ Văn Long (Host)",
    hostReputation: 95,
    title: "Giao lưu Sáng T7 Quân Khu 5",
    venueName: "Sân Cầu Lông Quân Khu 5",
    address: "Số 07 Duy Tân, Phường Hòa Thuận Đông",
    district: "Hải Châu",
    startsAt: "2026-11-15T08:00:00Z",
    durationMin: 120,
    costPerPlayer: 40000,
    status: "in_progress",
    courtCount: 1,
    courtSummaries: [
      { courtId: "1", category: "men", levelMin: 2, levelMax: 4, openSlots: 0, openByGender: { M: 0, F: 0 }, recruitOpen: false },
    ],
    openSlotsTotal: 0,
    schemaVersion: 1,
    isDeleted: false,
    createdAt: "2026-11-15T07:00:00Z",
    updatedAt: "2026-11-15T08:00:00Z",
  },

  // KÈO 4: COMPLETED (1 sân, Bưu Điện, đã kết thúc & chốt Elo)
  {
    id: "session_seed_04",
    hostId: "usr_seed_14",
    hostName: "Trần Anh Tuấn (Host)",
    hostReputation: 98,
    title: "Giao lưu Bưu Điện Tối Thứ 4",
    venueName: "Sân Cầu Lông Bưu Điện",
    address: "Đường Nguyễn Du, Phường Thạch Thang",
    district: "Hải Châu",
    startsAt: "2026-11-11T18:00:00Z",
    durationMin: 120,
    costPerPlayer: 50000,
    status: "completed",
    courtCount: 1,
    courtSummaries: [
      { courtId: "1", category: "men", levelMin: 3, levelMax: 5, openSlots: 0, openByGender: { M: 0, F: 0 }, recruitOpen: false },
    ],
    openSlotsTotal: 0,
    schemaVersion: 1,
    isDeleted: false,
    createdAt: "2026-11-11T17:00:00Z",
    updatedAt: "2026-11-11T20:30:00Z",
  },
];

/**
 * Các sân đấu chi tiết (Courts)
 */
export const SEED_COURTS: CourtDoc[] = [
  // Sân 1 Kèo 1 (Tuyên Sơn Sân 1 - Đôi nam, 6 người có mặt, còn 2 suất)
  {
    id: "court_seed_01_1",
    sessionId: "session_seed_01",
    courtNumber: 1,
    category: "men",
    levelMin: 2,
    levelMax: 4,
    minReliability: 60,
    pairingMode: "auto",
    recruitOpen: true,
    roster: {
      usr_seed_09: { memberId: "usr_seed_09", displayName: "Hồ Văn Long (Host)", gender: "M", type: "core", rating: 1420, level: 3, position: "back", dominantHand: "right", isGhost: false, joinedAt: "2026-11-15T08:00:00Z", checkedIn: false },
      usr_seed_05: { memberId: "usr_seed_05", displayName: "Võ Hoàng Nam", gender: "M", type: "core", rating: 1260, level: 2, position: "back", dominantHand: "right", isGhost: false, joinedAt: "2026-11-15T08:00:00Z", checkedIn: false },
      usr_seed_07: { memberId: "usr_seed_07", displayName: "Phan Gia Huy", gender: "M", type: "core", rating: 1310, level: 2, position: "both", dominantHand: "left", isGhost: false, joinedAt: "2026-11-15T08:00:00Z", checkedIn: false },
      usr_seed_11: { memberId: "usr_seed_11", displayName: "Ngô Đức Trọng", gender: "M", type: "core", rating: 1460, level: 3, position: "both", dominantHand: "left", isGhost: false, joinedAt: "2026-11-15T08:00:00Z", checkedIn: false },
      usr_seed_13: { memberId: "usr_seed_13", displayName: "Lý Quốc Bảo", gender: "M", type: "recruit", rating: 1440, level: 3, position: "back", dominantHand: "right", isGhost: false, joinedAt: "2026-11-15T08:15:00Z", checkedIn: false },
      usr_seed_03: { memberId: "usr_seed_03", displayName: "Trần Minh Trí", gender: "M", type: "recruit", rating: 1080, level: 1, position: "back", dominantHand: "right", isGhost: false, joinedAt: "2026-11-15T08:20:00Z", checkedIn: false },
    },
    pairs: [],
    version: 1,
    updatedAt: "2026-11-15T08:20:00Z",
  },

  // Sân 2 Kèo 1 (Tuyên Sơn Sân 2 - Đôi nam nữ, 7 người, còn 1 suất Nữ)
  {
    id: "court_seed_01_2",
    sessionId: "session_seed_01",
    courtNumber: 2,
    category: "mixed",
    levelMin: 2,
    levelMax: 4,
    minReliability: 60,
    pairingMode: "auto",
    recruitOpen: true,
    roster: {
      usr_seed_01: { memberId: "usr_seed_01", displayName: "Nguyễn Hải Đăng", gender: "M", type: "core", rating: 1100, level: 1, position: "both", dominantHand: "right", isGhost: false, joinedAt: "2026-11-15T08:00:00Z", checkedIn: false },
      usr_seed_16: { memberId: "usr_seed_16", displayName: "Đoàn Minh Khang", gender: "M", type: "core", rating: 1585, level: 4, position: "both", dominantHand: "right", isGhost: false, joinedAt: "2026-11-15T08:00:00Z", checkedIn: false },
      usr_seed_18: { memberId: "usr_seed_18", displayName: "Dương Đình Trí", gender: "M", type: "core", rating: 1605, level: 4, position: "back", dominantHand: "right", isGhost: false, joinedAt: "2026-11-15T08:00:00Z", checkedIn: false },
      usr_seed_06: { memberId: "usr_seed_06", displayName: "Đỗ Kim Oanh", gender: "F", type: "core", rating: 1280, level: 2, position: "front", dominantHand: "right", isGhost: false, joinedAt: "2026-11-15T08:00:00Z", checkedIn: false },
      usr_seed_10: { memberId: "usr_seed_10", displayName: "Đặng Thùy Dương", gender: "F", type: "core", rating: 1390, level: 3, position: "front", dominantHand: "right", isGhost: false, joinedAt: "2026-11-15T08:00:00Z", checkedIn: false },
      usr_seed_12: { memberId: "usr_seed_12", displayName: "Trịnh Thùy Linh", gender: "F", type: "recruit", rating: 1375, level: 3, position: "front", dominantHand: "right", isGhost: false, joinedAt: "2026-11-15T08:30:00Z", checkedIn: false },
      ghost_vanglai_01: { memberId: "ghost_vanglai_01", displayName: "Bạn anh Long (Khách)", gender: "M", type: "core", rating: 1350, level: 2, position: "both", dominantHand: "right", isGhost: true, joinedAt: "2026-11-15T08:00:00Z", checkedIn: false },
    },
    pairs: [],
    version: 1,
    updatedAt: "2026-11-15T08:30:00Z",
  },

  // Sân Kèo 2 (Kỳ Đồng - 8 người FULL)
  {
    id: "court_seed_02_1",
    sessionId: "session_seed_02",
    courtNumber: 1,
    category: "men",
    levelMin: 3,
    levelMax: 5,
    minReliability: 70,
    pairingMode: "auto",
    recruitOpen: true,
    roster: {
      usr_seed_14: { memberId: "usr_seed_14", displayName: "Trần Anh Tuấn (Host)", gender: "M", type: "core", rating: 1560, level: 4, position: "back", dominantHand: "right", isGhost: false, joinedAt: "2026-11-15T09:00:00Z", checkedIn: false },
      usr_seed_16: { memberId: "usr_seed_16", displayName: "Đoàn Minh Khang", gender: "M", type: "core", rating: 1585, level: 4, position: "both", dominantHand: "right", isGhost: false, joinedAt: "2026-11-15T09:00:00Z", checkedIn: false },
      usr_seed_18: { memberId: "usr_seed_18", displayName: "Dương Đình Trí", gender: "M", type: "core", rating: 1605, level: 4, position: "back", dominantHand: "right", isGhost: false, joinedAt: "2026-11-15T09:00:00Z", checkedIn: false },
      usr_seed_19: { memberId: "usr_seed_19", displayName: "Phạm Tấn Tài", gender: "M", type: "core", rating: 1720, level: 5, position: "back", dominantHand: "right", isGhost: false, joinedAt: "2026-11-15T09:00:00Z", checkedIn: false },
      usr_seed_21: { memberId: "usr_seed_21", displayName: "Trịnh Bá Phong", gender: "M", type: "recruit", rating: 1750, level: 5, position: "both", dominantHand: "right", isGhost: false, joinedAt: "2026-11-15T09:10:00Z", checkedIn: false },
      usr_seed_23: { memberId: "usr_seed_23", displayName: "Lê Hoàng Phúc", gender: "M", type: "recruit", rating: 1890, level: 6, position: "back", dominantHand: "right", isGhost: false, joinedAt: "2026-11-15T09:15:00Z", checkedIn: false },
      usr_seed_24: { memberId: "usr_seed_24", displayName: "Nguyễn Duy Khang", gender: "M", type: "recruit", rating: 1920, level: 6, position: "both", dominantHand: "left", isGhost: false, joinedAt: "2026-11-15T09:20:00Z", checkedIn: false },
      usr_seed_13: { memberId: "usr_seed_13", displayName: "Lý Quốc Bảo", gender: "M", type: "recruit", rating: 1440, level: 3, position: "back", dominantHand: "right", isGhost: false, joinedAt: "2026-11-15T09:25:00Z", checkedIn: false },
    },
    pairs: [],
    version: 1,
    updatedAt: "2026-11-15T09:25:00Z",
  },

  // Sân Kèo 3 (Quân Khu 5 - Đang đánh)
  {
    id: "court_seed_03_1",
    sessionId: "session_seed_03",
    courtNumber: 1,
    category: "men",
    levelMin: 2,
    levelMax: 4,
    minReliability: 60,
    pairingMode: "auto",
    recruitOpen: false,
    roster: {
      usr_seed_09: { memberId: "usr_seed_09", displayName: "Hồ Văn Long (Host)", gender: "M", type: "core", rating: 1420, level: 3, position: "back", dominantHand: "right", isGhost: false, joinedAt: "2026-11-15T07:00:00Z", checkedIn: true },
      usr_seed_05: { memberId: "usr_seed_05", displayName: "Võ Hoàng Nam", gender: "M", type: "core", rating: 1260, level: 2, position: "back", dominantHand: "right", isGhost: false, joinedAt: "2026-11-15T07:00:00Z", checkedIn: true },
      usr_seed_07: { memberId: "usr_seed_07", displayName: "Phan Gia Huy", gender: "M", type: "core", rating: 1310, level: 2, position: "both", dominantHand: "left", isGhost: false, joinedAt: "2026-11-15T07:00:00Z", checkedIn: true },
      usr_seed_11: { memberId: "usr_seed_11", displayName: "Ngô Đức Trọng", gender: "M", type: "recruit", rating: 1460, level: 3, position: "both", dominantHand: "left", isGhost: false, joinedAt: "2026-11-15T07:15:00Z", checkedIn: true },
      usr_seed_13: { memberId: "usr_seed_13", displayName: "Lý Quốc Bảo", gender: "M", type: "recruit", rating: 1440, level: 3, position: "back", dominantHand: "right", isGhost: false, joinedAt: "2026-11-15T07:20:00Z", checkedIn: true },
    },
    pairs: [],
    version: 1,
    updatedAt: "2026-11-15T08:00:00Z",
  },

  // Sân Kèo 4 (Bưu Điện - Đã kết thúc)
  {
    id: "court_seed_04_1",
    sessionId: "session_seed_04",
    courtNumber: 1,
    category: "men",
    levelMin: 3,
    levelMax: 5,
    minReliability: 70,
    pairingMode: "auto",
    recruitOpen: false,
    roster: {
      usr_seed_14: { memberId: "usr_seed_14", displayName: "Trần Anh Tuấn (Host)", gender: "M", type: "core", rating: 1560, level: 4, position: "back", dominantHand: "right", isGhost: false, joinedAt: "2026-11-11T17:00:00Z", checkedIn: true },
      usr_seed_16: { memberId: "usr_seed_16", displayName: "Đoàn Minh Khang", gender: "M", type: "core", rating: 1585, level: 4, position: "both", dominantHand: "right", isGhost: false, joinedAt: "2026-11-11T17:00:00Z", checkedIn: true },
      usr_seed_18: { memberId: "usr_seed_18", displayName: "Dương Đình Trí", gender: "M", type: "core", rating: 1605, level: 4, position: "back", dominantHand: "right", isGhost: false, joinedAt: "2026-11-11T17:00:00Z", checkedIn: true },
      usr_seed_19: { memberId: "usr_seed_19", displayName: "Phạm Tấn Tài", gender: "M", type: "core", rating: 1720, level: 5, position: "back", dominantHand: "right", isGhost: false, joinedAt: "2026-11-11T17:00:00Z", checkedIn: true },
      usr_seed_21: { memberId: "usr_seed_21", displayName: "Trịnh Bá Phong", gender: "M", type: "recruit", rating: 1750, level: 5, position: "both", dominantHand: "right", isGhost: false, joinedAt: "2026-11-11T17:10:00Z", checkedIn: true },
      usr_seed_23: { memberId: "usr_seed_23", displayName: "Lê Hoàng Phúc", gender: "M", type: "recruit", rating: 1890, level: 6, position: "back", dominantHand: "right", isGhost: false, joinedAt: "2026-11-11T17:15:00Z", checkedIn: true },
      usr_seed_24: { memberId: "usr_seed_24", displayName: "Nguyễn Duy Khang", gender: "M", type: "recruit", rating: 1920, level: 6, position: "both", dominantHand: "left", isGhost: false, joinedAt: "2026-11-11T17:20:00Z", checkedIn: true },
    },
    pairs: [],
    version: 1,
    updatedAt: "2026-11-11T20:30:00Z",
  },
];

/**
 * Hàng đợi Waitlist cho Sân Kỳ Đồng (Kèo 2)
 */
export const SEED_REQUESTS: JoinRequestDoc[] = [
  {
    id: "req_waitlist_01",
    courtId: "court_seed_02_1",
    sessionId: "session_seed_02",
    userId: "usr_seed_05", // Võ Hoàng Nam
    status: "waitlist",
    waitlistPosition: 1,
    snapshot: {
      displayName: "Võ Hoàng Nam",
      gender: "M",
      rating: 1260,
      level: 2,
      position: "back",
      dominantHand: "right",
      reliability: 85,
    },
    note: "Nếu có ai hủy thì cho mình xin 1 slot nhé Host!",
    createdAt: "2026-11-15T09:30:00Z",
  },
  {
    id: "req_waitlist_02",
    courtId: "court_seed_02_1",
    sessionId: "session_seed_02",
    userId: "usr_seed_07", // Phan Gia Huy
    status: "waitlist",
    waitlistPosition: 2,
    snapshot: {
      displayName: "Phan Gia Huy",
      gender: "M",
      rating: 1310,
      level: 2,
      position: "both",
      dominantHand: "left",
      reliability: 80,
    },
    note: "Xin slot dự bị ạ",
    createdAt: "2026-11-15T09:35:00Z",
  },
];

/**
 * Lịch sử các trận đấu đã hoàn thành (Matches & Ratings Log)
 */
export const SEED_MATCHES: MatchDoc[] = [
  // Trận 1 (Kèo Bưu Điện): Tuấn + Khang vs Tài + Phong -> Tuấn + Khang thắng 21-19
  {
    id: "match_seed_01",
    sessionId: "session_seed_04",
    courtId: "1",
    index: 1,
    teamA: ["usr_seed_14", "usr_seed_16"],
    teamB: ["usr_seed_19", "usr_seed_21"],
    playerIds: ["usr_seed_14", "usr_seed_16", "usr_seed_19", "usr_seed_21"],
    category: "men",
    sets: [{ setNumber: 1, scoreA: 21, scoreB: 19 }],
    status: "confirmed",
    winner: "teamA",
    confirmedBy: "usr_seed_14",
    ratingProcessed: true,
    cards: [
      { fromUserId: "usr_seed_19", toUserId: "usr_seed_16", tag: "plays_better" },
      { fromUserId: "usr_seed_21", toUserId: "usr_seed_16", tag: "plays_better" },
    ],
    createdAt: "2026-11-11T18:15:00Z",
    updatedAt: "2026-11-11T18:40:00Z",
  },
  // Trận 2: Tuấn + Khang vs Phúc + Khang (Duy Khang) -> Tuấn + Khang thắng 22-20
  {
    id: "match_seed_02",
    sessionId: "session_seed_04",
    courtId: "1",
    index: 2,
    teamA: ["usr_seed_14", "usr_seed_16"],
    teamB: ["usr_seed_23", "usr_seed_24"],
    playerIds: ["usr_seed_14", "usr_seed_16", "usr_seed_23", "usr_seed_24"],
    category: "men",
    sets: [{ setNumber: 1, scoreA: 22, scoreB: 20 }],
    status: "confirmed",
    winner: "teamA",
    confirmedBy: "usr_seed_14",
    ratingProcessed: true,
    createdAt: "2026-11-11T18:45:00Z",
    updatedAt: "2026-11-11T19:10:00Z",
  },
  // Trận 3: Tuấn + Khang vs Trí + Tài -> Tuấn + Khang thắng 21-17
  {
    id: "match_seed_03",
    sessionId: "session_seed_04",
    courtId: "1",
    index: 3,
    teamA: ["usr_seed_14", "usr_seed_16"],
    teamB: ["usr_seed_18", "usr_seed_19"],
    playerIds: ["usr_seed_14", "usr_seed_16", "usr_seed_18", "usr_seed_19"],
    category: "men",
    sets: [{ setNumber: 1, scoreA: 21, scoreB: 17 }],
    status: "confirmed",
    winner: "teamA",
    confirmedBy: "usr_seed_14",
    ratingProcessed: true,
    createdAt: "2026-11-11T19:15:00Z",
    updatedAt: "2026-11-11T19:35:00Z",
  },
  // Trận 4: Tuấn + Khang vs Phong + Phúc -> Tuấn + Khang thua 18-21
  {
    id: "match_seed_04",
    sessionId: "session_seed_04",
    courtId: "1",
    index: 4,
    teamA: ["usr_seed_14", "usr_seed_16"],
    teamB: ["usr_seed_21", "usr_seed_23"],
    playerIds: ["usr_seed_14", "usr_seed_16", "usr_seed_21", "usr_seed_23"],
    category: "men",
    sets: [{ setNumber: 1, scoreA: 18, scoreB: 21 }],
    status: "confirmed",
    winner: "teamB",
    confirmedBy: "usr_seed_14",
    ratingProcessed: true,
    createdAt: "2026-11-11T19:40:00Z",
    updatedAt: "2026-11-11T20:00:00Z",
  },
  // Trận 5: Tuấn + Khang vs Trí + Duy Khang -> Tuấn + Khang thắng 21-19
  // (Đạt 5 trận đánh cùng nhau: thắng 4/5 = 80% -> Đạt danh hiệu ĐỒNG ĐỘI ĂN Ý NHẤT!)
  {
    id: "match_seed_05",
    sessionId: "session_seed_04",
    courtId: "1",
    index: 5,
    teamA: ["usr_seed_14", "usr_seed_16"],
    teamB: ["usr_seed_18", "usr_seed_24"],
    playerIds: ["usr_seed_14", "usr_seed_16", "usr_seed_18", "usr_seed_24"],
    category: "men",
    sets: [{ setNumber: 1, scoreA: 21, scoreB: 19 }],
    status: "confirmed",
    winner: "teamA",
    confirmedBy: "usr_seed_14",
    ratingProcessed: true,
    createdAt: "2026-11-11T20:05:00Z",
    updatedAt: "2026-11-11T20:25:00Z",
  },
];

export const SEED_RATINGS: RatingHistoryDoc[] = [
  {
    id: "rate_seed_01",
    userId: "usr_seed_14",
    matchId: "match_seed_01",
    sessionId: "session_seed_04",
    oldRating: 1546,
    newRating: 1560,
    delta: 14,
    kFactor: 24,
    oldReliability: 96,
    newReliability: 98,
    reason: "match_result",
    createdAt: "2026-11-11T18:40:00Z",
  },
  {
    id: "rate_seed_02",
    userId: "usr_seed_16",
    matchId: "match_seed_01",
    sessionId: "session_seed_04",
    oldRating: 1567,
    newRating: 1585,
    delta: 18, // 14 Elo trận + 4 Elo thẻ đánh giá
    kFactor: 24,
    oldReliability: 86,
    newReliability: 88,
    reason: "match_result",
    createdAt: "2026-11-11T18:40:00Z",
  },
];

export function getFullSeedDataset(): SeedDataset {
  return {
    users: SEED_USERS,
    sessions: SEED_SESSIONS,
    courts: SEED_COURTS,
    matches: SEED_MATCHES,
    requests: SEED_REQUESTS,
    ratings: SEED_RATINGS,
  };
}

/**
 * Hàm nạp dữ liệu Seed vào Emulator hoặc Local Mock
 */
export async function executeSeedProcess(options: { reset?: boolean } = {}): Promise<SeedDataset> {
  console.log("\n================================================================================");
  console.log(`  BẮT ĐẦU QUÁ TRÌNH SEED DỮ LIỆU PHONG TRÀO ĐÀ NẴNG (Reset: ${options.reset ? "BẬT" : "TẮT"})`);
  console.log("================================================================================");

  const dataset = getFullSeedDataset();

  // 1. Rà soát chất lượng dữ liệu seed bằng công cụ audit
  const { auditDatabaseSnapshot, printAuditReport } = await import("./audit-data");
  const auditReport = auditDatabaseSnapshot(dataset);
  printAuditReport(auditReport);

  if (!auditReport.isClean) {
    throw new Error("Dữ liệu seed chứa lỗi bất biến! Dừng nạp dữ liệu.");
  }

  console.log(`\x1b[32m✔ Đã sẵn sàng 24 Users (đủ 6 cấp độ), 4 Kèo, 3 Courts, 2 Waitlist, 5 Matches, 2 Ratings log.\x1b[0m\n`);
  return dataset;
}

if (require.main === module) {
  const isReset = process.argv.includes("--reset");
  executeSeedProcess({ reset: isReset }).catch((err) => {
    console.error("Lỗi seed dữ liệu:", err);
    process.exit(1);
  });
}
