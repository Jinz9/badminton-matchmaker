/**
 * KỊCH BẢN KIỂM THỬ TÍCH HỢP END-TO-END TOÀN HỆ THỐNG (E2E INTEGRATION FLOW)
 * Căn cứ: Milestone M8 (Feature Freeze) | WBS 5.1 & WBS 5.3
 *
 * Luồng nghiệp vụ xuyên suốt 4 Module:
 * 1. Đăng ký & Khai báo trình độ (Initial Rating - Module 1)
 * 2. Tạo kèo 2 sân (Session Creation - Module 3)
 * 3. Mở tuyển & Đặt suất vãng lai (Recruit Slots - Module 2)
 * 4. Đăng ký vượt giới hạn -> Đưa vào Waitlist (Waitlist Queue - Module 3)
 * 5. Hủy kèo muộn -> Phạt uy tín & Tự động đôn Waitlist (Cancellation & Promotion - Module 3)
 * 6. Điểm danh có mặt & Cân kèo sân đấu (Court Balancing ca lẻ 5 người - Module 3, CR-01)
 * 7. Kiểm tra tỷ số set theo chuẩn BWF (Score Validation - Module 4)
 * 8. Chốt kết quả, Cập nhật Elo đôi động & Điểm uy tín có Idempotency (Finish Match - Module 4)
 * 9. Tổng hợp Lịch sử đấu, Thống kê cá nhân & Đồng đội ăn ý nhất (History & Stats - Module 4)
 */

import { calculateInitialRatingFromAnswers } from "../src/domain/rating/initialRating";
import { validateUpdateProfileInput } from "../src/domain/user/userProfile";
import { computeSlots, validateJoinEligibility } from "../src/domain/recruit";
import {
  validateCreateSessionInput,
  calculateCancellationPenalty,
  evaluateWaitlistPromotion,
} from "../src/domain/lobby/lobbyValidation";
import { balanceCourt, swapPlayers } from "../src/domain/balancing";
import { validateMatchScores } from "../src/domain/elo/scoreValidation";
import { calculateMatchElo } from "../src/domain/elo/calculateElo";
import { computeBestPartners } from "../src/domain/history/bestPartners";
import { calculatePersonalStats, buildRatingTimeSeries } from "../src/domain/history/statsCalculation";
import { enrichMatchHistory } from "../src/domain/history/historyQuery";
import {
  MatchDoc,
  UserProfile,
  RatingHistoryDoc,
  CourtDoc,
  SessionDoc,
  JoinRequestDoc,
  RosterMember,
} from "../src/domain/types";
import { BalancingMember } from "../src/domain/balancing/types";

// ==========================================
// ASSERTION UTILITIES
// ==========================================
function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`\x1b[31m[FAILED ASSERTION] ${message}\x1b[0m`);
    throw new Error(`Assertion Failed: ${message}`);
  }
  console.log(`\x1b[32m  ✔ ${message}\x1b[0m`);
}

function createMockUserProfile(uid: string, name: string, level: any = 3, rating = 1425): UserProfile {
  return {
    uid,
    phoneNumber: "0905123456",
    displayName: name,
    gender: "M",
    areaLabel: "Hải Châu",
    position: "both",
    dominantHand: "right",
    selfDeclaredLevel: level,
    role: "player",
    fcmTokens: [],
    schemaVersion: 1,
    isDeleted: false,
    skill: {
      rating,
      matchesPlayed: 10,
      reliability: 80,
      isProvisional: false,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function createMockRosterMember(memberId: string, displayName: string, rating: number, type: "core" | "recruit" = "core"): RosterMember {
  return {
    memberId,
    displayName,
    gender: "M",
    type,
    rating,
    level: 3,
    position: "both",
    dominantHand: "right",
    isGhost: false,
    checkedIn: false,
    joinedAt: new Date().toISOString(),
  };
}

function createInitialCore(displayName: string, rating: number, gender: "M" | "F" = "M") {
  return {
    displayName,
    gender,
    rating,
    level: 3 as const,
    position: "both" as const,
    dominantHand: "right" as const,
    isGhost: false,
    checkedIn: false,
  };
}

export async function runE2EIntegrationFlow(): Promise<void> {
  console.log("\n================================================================================");
  console.log("  BẮT ĐẦU CHẠY KỊCH BẢN E2E INTEGRATION FLOW - HỆ THỐNG GHÉP ĐỘI CẦU LÔNG ĐÀ NẴNG");
  console.log("================================================================================\n");

  // ============================================================================
  // BƯỚC 1: ĐĂNG KÝ NGƯỜI DÙNG & KHAI BÁO TRÌNH ĐỘ (MODULE 1)
  // ============================================================================
  console.log("\x1b[36m[BƯỚC 1] Khởi tạo Người dùng & Khai báo trình độ 10 câu hỏi\x1b[0m");

  // Host Nhật: Trả lời 10 câu hỏi (trình độ TB+ / Khá)
  const hostAnswers = [3, 3, 3, 3, 4, 3, 3, 4, 3, 3]; // Tổng = 32 điểm -> Cấp 4 (TB+)
  const hostRatingInit = calculateInitialRatingFromAnswers(hostAnswers);
  assert(hostRatingInit.level === 4, "Host Nhật đạt Cấp độ 4 (TB+)");
  assert(hostRatingInit.initialRating === 1575, "Host Nhật có điểm Elo ban đầu là 1575");

  // Player Đạt: Trả lời 10 câu hỏi (trình độ Trung bình)
  const datAnswers = [2, 3, 2, 3, 2, 3, 2, 3, 2, 3]; // Tổng = 25 điểm -> Cấp 3 (TB)
  const datRatingInit = calculateInitialRatingFromAnswers(datAnswers);
  assert(datRatingInit.level === 3, "Player Đạt đạt Cấp độ 3 (Trung bình)");
  assert(datRatingInit.initialRating === 1425, "Player Đạt có điểm Elo ban đầu là 1425");

  const hostProfile = createMockUserProfile("host_nhat_01", "Đào Duy Nhật", 4, 1575);
  const datProfile = createMockUserProfile("player_dat_02", "Nguyễn Đức Đạt", 3, 1425);

  // Kiểm tra cập nhật thông tin hợp lệ
  const profileValidation = validateUpdateProfileInput({
    displayName: "Đào Duy Nhật (Host)",
    position: "back",
    areaLabel: "Hải Châu",
  });
  assert(profileValidation.isValid, "Hồ sơ cập nhật của Host Nhật hợp lệ theo Data Contract");

  // ============================================================================
  // BƯỚC 2: TẠO KÈO 2 SÂN (MODULE 3)
  // ============================================================================
  console.log("\n\x1b[36m[BƯỚC 2] Host tạo Kèo giao lưu 2 sân tại Tuyên Sơn\x1b[0m");

  const futureTime = new Date(Date.now() + 7200000).toISOString(); // Sau 2 tiếng
  const sessionInput = {
    title: "Giao lưu Cầu lông Tuyên Sơn Chiều Thứ 7",
    venueName: "Sân Cầu Lông Tuyên Sơn",
    address: "01 Nại Nam 2, Hải Châu, Đà Nẵng",
    district: "Hải Châu",
    startsAt: futureTime,
    durationMin: 120,
    costPerPlayer: 45000,
    courtCount: 2 as const,
    courts: [
      {
        courtNumber: 1 as const,
        category: "men" as const,
        levelMin: 2 as const,
        levelMax: 5 as const,
        initialCoreMembers: [
          createInitialCore("Duy Nhật", 1575),
          createInitialCore("Cầu thủ 2", 1500),
          createInitialCore("Cầu thủ 3", 1450),
          createInitialCore("Cầu thủ 4", 1400),
        ],
      },
      {
        courtNumber: 2 as const,
        category: "mixed" as const,
        levelMin: 2 as const,
        levelMax: 4 as const,
        initialCoreMembers: [
          createInitialCore("Cầu thủ 5", 1400),
          createInitialCore("Cầu thủ 6", 1350),
          createInitialCore("Cầu thủ 7", 1300, "F"),
          createInitialCore("Cầu thủ 8", 1350, "F"),
          createInitialCore("Cầu thủ 9", 1300, "F"),
        ],
      },
    ],
  };

  const sessionValidation = validateCreateSessionInput(sessionInput, hostProfile);
  assert(sessionValidation.isValid, "Thông tin tạo kèo 2 sân hợp lệ (1-2 sân, <= 8 người/sân, startsAt >= 30p)");

  // Mô phỏng Document Session & Court sau khi tạo
  const mockSession: SessionDoc = {
    id: "session_ts_01",
    hostId: hostProfile.uid,
    hostName: hostProfile.displayName,
    hostReputation: 95,
    title: sessionInput.title,
    venueName: sessionInput.venueName,
    address: sessionInput.address,
    district: sessionInput.district,
    startsAt: futureTime,
    durationMin: 120,
    costPerPlayer: 45000,
    status: "open",
    courtCount: 2,
    courtSummaries: [
      { courtId: "1", category: "men", levelMin: 2, levelMax: 5, openSlots: 4, openByGender: { M: 4, F: 0 }, recruitOpen: true },
      { courtId: "2", category: "mixed", levelMin: 2, levelMax: 4, openSlots: 3, openByGender: { M: 2, F: 1 }, recruitOpen: true },
    ],
    openSlotsTotal: 7,
    schemaVersion: 1,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockCourt1Roster: Record<string, RosterMember> = {
    host_nhat_01: createMockRosterMember("host_nhat_01", "Duy Nhật", 1575),
    core_p2: createMockRosterMember("core_p2", "Cầu thủ 2", 1500),
    core_p3: createMockRosterMember("core_p3", "Cầu thủ 3", 1450),
    core_p4: createMockRosterMember("core_p4", "Cầu thủ 4", 1400),
  };

  const mockCourt1: CourtDoc = {
    id: "court_1",
    sessionId: mockSession.id,
    courtNumber: 1,
    category: "men",
    levelMin: 2,
    levelMax: 5,
    minReliability: 60,
    pairingMode: "auto",
    recruitOpen: true,
    roster: mockCourt1Roster,
    pairs: [],
    version: 1,
    updatedAt: new Date().toISOString(),
  };

  // ============================================================================
  // BƯỚC 3: MỞ TUYỂN & ĐẶT SUẤT VÃNG LAI (MODULE 2)
  // ============================================================================
  console.log("\n\x1b[36m[BƯỚC 3] Tính toán suất tuyển vãng lai & Đặt suất\x1b[0m");

  // Sân 1: 4 người mặc định -> Suất tuyển tối đa: min(4, 8 - 4) = 4
  const court1Slots = computeSlots(4, 0);
  assert(court1Slots.total === 4, "Sân 1 có 4 suất vãng lai tối đa (Luật R4)");
  assert(court1Slots.open === 4, "Sân 1 còn trống 4 suất vãng lai");

  // Sân 2: 5 người mặc định -> Suất tuyển tối đa: min(4, 8 - 5) = 3
  const court2Slots = computeSlots(5, 0);
  assert(court2Slots.total === 3, "Sân 2 có 3 suất vãng lai tối đa");
  assert(court2Slots.open === 3, "Sân 2 còn trống 3 suất vãng lai");

  // Kiểm tra điều kiện Player Đạt xin vào Sân 1 (Đôi nam, cấp 2-5, uy tín >= 60)
  const datEligibility = validateJoinEligibility(mockCourt1, mockSession, datProfile);
  assert(datEligibility.eligible, "Player Đạt đủ điều kiện nộp đơn vào Sân 1");

  // Duyệt 4 vãng lai vào Sân 1 -> Đạt 8 người (Hết chỗ)
  const court1AfterFull = computeSlots(4, 4);
  assert(court1AfterFull.open === 0, "Sân 1 đã tuyển đủ 4 vãng lai -> Hết chỗ (open = 0)");

  // Cập nhật Sân 1 đầy chỗ
  const mockCourt1FullRoster: Record<string, RosterMember> = {
    ...mockCourt1Roster,
    player_dat_02: createMockRosterMember("player_dat_02", "Đức Đạt", 1425, "recruit"),
    recruit_03: createMockRosterMember("recruit_03", "Minh Cường", 1450, "recruit"),
    recruit_04: createMockRosterMember("recruit_04", "Tuấn Anh", 1400, "recruit"),
    recruit_05: createMockRosterMember("recruit_05", "Quang Hải", 1420, "recruit"),
  };

  const mockCourt1Full: CourtDoc = {
    ...mockCourt1,
    recruitOpen: true,
    roster: mockCourt1FullRoster,
  };

  // ============================================================================
  // BƯỚC 4: VƯỢT GIỚI HẠN VÀO WAITLIST (MODULE 3)
  // ============================================================================
  console.log("\n\x1b[36m[BƯỚC 4] Vượt giới hạn chỗ -> Tự động đưa vào Waitlist\x1b[0m");

  const waitlistUser6 = createMockUserProfile("waitlist_user_06", "Hoàng Long", 3, 1400);
  const waitlistEligibility = validateJoinEligibility(mockCourt1Full, mockSession, waitlistUser6);
  assert(!waitlistEligibility.eligible, "Không được vào danh sách chính thức vì sân 1 đã đủ 8 người");
  assert(waitlistEligibility.canWaitlist === true, "Được tự động đưa vào hàng đợi dự bị (Waitlist)");

  // ============================================================================
  // BƯỚC 5: HỦY KÈO MUỘN & TỰ ĐỘNG ĐÔN WAITLIST (MODULE 3)
  // ============================================================================
  console.log("\n\x1b[36m[BƯỚC 5] Thành viên hủy kèo muộn -> Phạt uy tín & Tự động đôn Waitlist\x1b[0m");

  // recruit_05 hủy kèo trước giờ thi đấu 2 tiếng (Hạn chót là 12 tiếng -> Hủy muộn)
  const penalty = calculateCancellationPenalty(futureTime, new Date().toISOString());
  assert(penalty.penaltyPoints === 5, "Hủy kèo muộn (< 12h) bị phạt trừ 5 điểm uy tín");
  assert(penalty.reason === "CANCEL_WITHIN_12_HOURS", "Mã lý do phạt là CANCEL_WITHIN_12_HOURS");

  // Hàng đợi Waitlist gồm 2 người
  const waitlistRequests: JoinRequestDoc[] = [
    {
      id: "req_06",
      sessionId: mockSession.id,
      courtId: "1",
      userId: "waitlist_user_06",
      status: "waitlist",
      snapshot: {
        displayName: "Hoàng Long",
        gender: "M",
        level: 3,
        rating: 1400,
        position: "both",
        reliability: 85,
      },
      createdAt: "2026-11-15T12:00:00Z",
    },
    {
      id: "req_07",
      sessionId: mockSession.id,
      courtId: "1",
      userId: "waitlist_user_07",
      status: "waitlist",
      snapshot: {
        displayName: "Văn Hậu",
        gender: "M",
        level: 3,
        rating: 1380,
        position: "both",
        reliability: 75,
      },
      createdAt: "2026-11-15T12:05:00Z",
    },
  ];

  const promotion = evaluateWaitlistPromotion(mockCourt1Full, waitlistRequests);
  assert(promotion.promotedRequest !== undefined, "Đã tìm thấy ứng viên hợp lệ từ Waitlist để đôn lên");
  assert(promotion.promotedRequest?.userId === "waitlist_user_06", "Ứng viên đầu hàng đợi (waitlist_user_06) được đôn lên chính thức");

  // ============================================================================
  // BƯỚC 6: ĐIỂM DANH & CHIA CẶP CÂN KÈO CA LẺ 5 NGƯỜI (MODULE 3 & CR-01)
  // ============================================================================
  console.log("\n\x1b[36m[BƯỚC 6] Điểm danh 5 người có mặt tại Sân 1 & Chia cặp tự động (CR-01)\x1b[0m");

  const attendeesS1: BalancingMember[] = [
    { id: "host_nhat_01", name: "Duy Nhật", rating: 1575, gender: "M", gamesPlayed: 0 },
    { id: "player_dat_02", name: "Đức Đạt", rating: 1425, gender: "M", gamesPlayed: 0 },
    { id: "core_p2", name: "Cầu thủ 2", rating: 1500, gender: "M", gamesPlayed: 0 },
    { id: "recruit_03", name: "Minh Cường", rating: 1450, gender: "M", gamesPlayed: 0 },
    { id: "waitlist_user_06", name: "Hoàng Long", rating: 1400, gender: "M", gamesPlayed: 0 },
  ];

  const balanceResult = balanceCourt(attendeesS1, { category: "men" });
  assert(balanceResult.matches.length > 0, "Thuật toán đã xếp được hiệp đấu");

  const match1 = balanceResult.matches[0];
  assert(match1.teamA.length === 2 && match1.teamB.length === 2, "Hiệp đấu gồm đúng 4 người (2 đội thi đấu)");
  assert(match1.restingMembers.length === 1, "Đúng 1 người nghỉ xoay tua trong ca lẻ 5 người");
  assert(match1.diff <= 100, `Hai đội được cân bằng tốt (Độ lệch Elo = ${match1.diff} điểm)`);

  // Thử tính năng kéo đổi người chơi thủ công (swapPlayers)
  const swapRes = swapPlayers(match1, match1.teamA[0].id, match1.teamB[0].id, "men");
  assert(swapRes.isValid === true, "Host kéo đổi người thủ công thành công, độ lệch mới được tính lại");

  // ============================================================================
  // BƯỚC 7: KIỂM TRA TỶ SỐ SET THEO CHUẨN BWF (MODULE 4)
  // ============================================================================
  console.log("\n\x1b[36m[BƯỚC 7] Kiểm tra tính hợp lệ của tỷ số set chuẩn BWF\x1b[0m");

  const validSets = [{ setNumber: 1, scoreA: 21, scoreB: 19 }];
  const valResult = validateMatchScores(validSets);
  assert(valResult.isValid === true, "Tỷ số 21 - 19 là tỷ số thắng hợp lệ theo luật BWF");
  assert(valResult.winner === "teamA", "Đội A chiến thắng hiệp đấu");

  // Kiểm tra chặn tỷ số bất hợp lệ (cách biệt 1 điểm 21-20 khi chưa Deuce)
  const invalidSets = [{ setNumber: 1, scoreA: 21, scoreB: 20 }];
  const invResult = validateMatchScores(invalidSets);
  assert(invResult.isValid === false, "Chặn thành công tỷ số sai luật 21-20 (phải cách biệt ít nhất 2 điểm)");

  // ============================================================================
  // BƯỚC 8: CẬP NHẬT ELO ĐÔI ĐỘNG & ĐIỂM UY TÍN CÓ IDEMPOTENCY (MODULE 4)
  // ============================================================================
  console.log("\n\x1b[36m[BƯỚC 8] Cập nhật Elo đôi động, Điểm uy tín & Thẻ đánh giá chéo\x1b[0m");

  const teamAPlayers: [any, any] = [
    { userId: "host_nhat_01", displayName: "Duy Nhật", currentRating: 1575, matchesPlayed: 10, isProvisional: false, currentReliability: 80 },
    { userId: "player_dat_02", displayName: "Đức Đạt", currentRating: 1425, matchesPlayed: 3, isProvisional: true, currentReliability: 80 },
  ];
  const teamBPlayers: [any, any] = [
    { userId: "core_p2", displayName: "Cầu thủ 2", currentRating: 1500, matchesPlayed: 15, isProvisional: false, currentReliability: 80 },
    { userId: "recruit_03", displayName: "Minh Cường", currentRating: 1450, matchesPlayed: 20, isProvisional: false, currentReliability: 80 },
  ];

  // Thẻ đánh giá chéo: Cả 2 đối thủ cùng khen Đức Đạt đánh hay hơn khai báo
  const reviewCards = [
    { fromUserId: "core_p2", toUserId: "player_dat_02", tag: "plays_better" as const },
    { fromUserId: "recruit_03", toUserId: "player_dat_02", tag: "plays_better" as const },
  ];

  const eloResult = calculateMatchElo({
    teamA: teamAPlayers,
    teamB: teamBPlayers,
    winner: "teamA",
    sets: validSets,
    reviewCards,
  });

  // Kiểm tra biến động Elo
  assert(eloResult.teamA[0].delta > 0, "Host Nhật thắng được cộng điểm Elo");
  assert(eloResult.teamA[1].delta > eloResult.teamA[0].delta, "Player Đạt (Provisional K=40 + Thẻ khen) nhận nhiều điểm Elo hơn");
  assert(eloResult.teamA[1].cardEloAdjustment === 4, "Player Đạt nhận đúng +4 Elo thưởng từ 2 phiếu bầu đồng thuận");
  assert(eloResult.teamA[0].newReliability === 82, "Hoàn thành trận đấu được cộng +2 điểm uy tín (80 -> 82)");
  assert(eloResult.teamB[0].delta < 0, "Đội B thua bị trừ điểm Elo tương ứng");

  // ============================================================================
  // BƯỚC 9: LỊCH SỬ ĐẤU, THỐNG KÊ CÁ NHÂN & ĐỒNG ĐỘI ĂN Ý NHẤT (MODULE 4)
  // ============================================================================
  console.log("\n\x1b[36m[BƯỚC 9] Tổng hợp Lịch sử đấu, Biểu đồ thống kê & Đồng đội ăn ý nhất\x1b[0m");

  const matchDoc1: MatchDoc = {
    id: "match_e2e_01",
    sessionId: "session_ts_01",
    courtId: "1",
    index: 1,
    teamA: ["host_nhat_01", "player_dat_02"],
    teamB: ["core_p2", "recruit_03"],
    playerIds: ["host_nhat_01", "player_dat_02", "core_p2", "recruit_03"],
    category: "men",
    sets: validSets,
    status: "confirmed",
    winner: "teamA",
    ratingProcessed: true,
    createdAt: "2026-11-15T10:00:00Z",
    updatedAt: "2026-11-15T10:30:00Z",
  };

  // Tạo thêm 4 trận đấu nữa giữa Nhật và Đạt (tổng cộng 5 trận, thắng cả 5 trận -> 100% win rate)
  const allMatches: MatchDoc[] = [matchDoc1];
  for (let i = 2; i <= 5; i++) {
    allMatches.push({
      ...matchDoc1,
      id: `match_e2e_0${i}`,
      createdAt: `2026-11-15T1${i}:00:00Z`,
      updatedAt: `2026-11-15T1${i}:30:00Z`,
    });
  }

  // 1. Kiểm tra thuật toán Đồng đội ăn ý nhất (N_min = 5, winRate >= 0.60)
  const bestPartners = computeBestPartners("host_nhat_01", allMatches);
  assert(bestPartners.length === 1, "Host Nhật tìm được 1 đồng đội ăn ý nhất");
  assert(bestPartners[0].partnerId === "player_dat_02", "Đồng đội ăn ý nhất là Player Đạt");
  assert(bestPartners[0].matchesCount === 5, "Hai người đã đánh cùng nhau đủ 5 trận");
  assert(bestPartners[0].winRate === 1.0, "Tỷ lệ thắng đạt 100% (>= 60%)");

  // 2. Kiểm tra thống kê cá nhân
  const stats = calculatePersonalStats("host_nhat_01", allMatches);
  assert(stats.totalMatches === 5, "Tổng số trận đã đấu là 5 trận");
  assert(stats.totalWins === 5, "Tổng số trận thắng là 5 trận");
  assert(stats.overallWinRate === 1.0, "Tỷ lệ thắng tổng quan là 100%");
  assert(stats.byCategory.men.matches === 5, "Cả 5 trận đều thuộc nội dung Đôi nam");

  // 3. Kiểm tra chuỗi thời gian cho biểu đồ của TV2
  const ratingLogs: RatingHistoryDoc[] = [
    { id: "log_1", userId: "host_nhat_01", matchId: "match_e2e_01", sessionId: "session_ts_01", oldRating: 1575, newRating: 1588, delta: 13, kFactor: 24, oldReliability: 80, newReliability: 82, reason: "match_result", createdAt: "2026-11-15T10:30:00Z" },
    { id: "log_2", userId: "host_nhat_01", matchId: "match_e2e_02", sessionId: "session_ts_01", oldRating: 1588, newRating: 1601, delta: 13, kFactor: 24, oldReliability: 82, newReliability: 84, reason: "match_result", createdAt: "2026-11-15T11:30:00Z" },
  ];
  const timeSeries = buildRatingTimeSeries(ratingLogs);
  assert(timeSeries.length === 2, "Tạo thành công 2 điểm dữ liệu cho biểu đồ đường Elo");
  assert(timeSeries[1].rating === 1601, "Điểm Elo mới nhất trên biểu đồ đạt 1601");

  // 4. Kiểm tra phân trang và làm giàu lịch sử đấu
  const ratingsMap = new Map<string, RatingHistoryDoc>();
  ratingsMap.set("match_e2e_01", ratingLogs[0]);
  const enriched = enrichMatchHistory("host_nhat_01", [matchDoc1], ratingsMap);
  assert(enriched.length === 1, "Làm giàu thành công dữ liệu lịch sử đấu");
  assert(enriched[0].partner.userId === "player_dat_02", "Hiển thị đúng đồng đội đánh cùng là Player Đạt");
  assert(enriched[0].eloDelta === 13, "Hiển thị đúng biến động Elo (+13)");

  console.log("\n================================================================================");
  console.log("  \x1b[32m✔ TẤT CẢ CÁC BƯỚC TRONG KỊCH BẢN E2E ĐÃ ĐẠT 100% ASSERTION THÀNH CÔNG!\x1b[0m");
  console.log("================================================================================\n");
}

// Cho phép chạy trực tiếp từ dòng lệnh: node scripts/e2e-flow.js
if (require.main === module) {
  runE2EIntegrationFlow().catch((err) => {
    console.error("Lỗi khi chạy kịch bản E2E:", err);
    process.exit(1);
  });
}
