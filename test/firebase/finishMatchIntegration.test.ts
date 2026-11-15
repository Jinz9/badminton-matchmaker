/**
 * INTEGRATION TEST: GIAO DỊCH CHỐT KẾT QUẢ TRẬN ĐẤU, TÍNH ELO & ĐIỂM UY TÍN
 * Căn cứ: WBS 3.4 & Milestone M7, Hợp đồng dữ liệu `data-contract.md`
 *
 * Kiểm tra các tính chất:
 * 1. Tính toán cập nhật Elo và Uy tín nguyên tử (ACID).
 * 2. Tính chất BẮT BUỘC IDEMPOTENT: Chặn tuyệt đối gọi 2 lần cộng điểm 2 lần.
 * 3. Phân quyền bảo mật: Chỉ Host của buổi đánh mới được chốt kết quả.
 * 4. Xử lý thành viên Ghost (vãng lai không có tài khoản): không lỗi, không ghi user profile hay rating log.
 * 5. Hiệu chỉnh thẻ đánh giá chéo (Review Cards).
 */

import {
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import * as fs from "fs";
import * as path from "path";
import * as http from "http";
import { doc, getDoc, setDoc, getDocs, collection } from "firebase/firestore";
import { confirmMatchResultTx } from "../../src/domain/elo/transactions";
import { SessionDoc, MatchDoc, UserProfile, PostMatchCard } from "../../src/domain/types";

const PROJECT_ID = "badminton-danang-finish-match-test";
const RULES_PATH = path.resolve(__dirname, "../../firestore.rules");

function isEmulatorRunning(): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get("http://127.0.0.1:8080", () => resolve(true));
    req.on("error", () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

describe("Firebase Integration: Finish Match Transaction & Idempotency (WBS 3.4 & M7)", () => {
  let testEnv: RulesTestEnvironment;
  let emulatorAvailable = false;

  beforeAll(async () => {
    emulatorAvailable = await isEmulatorRunning();
    if (!emulatorAvailable) {
      console.warn(
        "\n[NOTICE] Firestore emulator not detected on 127.0.0.1:8080. " +
        "Skipping Finish Match concurrency test suite. " +
        "Run emulator to execute full integration tests.\n"
      );
      return;
    }

    const rules = fs.readFileSync(RULES_PATH, "utf8");
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules,
        host: "127.0.0.1",
        port: 8080,
      },
    });
  });

  afterAll(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async () => {
    if (testEnv) {
      await testEnv.clearFirestore();
    }
  });

  function createMockUser(uid: string, name: string, rating = 1500, matchesPlayed = 10): UserProfile {
    return {
      uid,
      phoneNumber: "0905123456",
      displayName: name,
      gender: "M",
      areaLabel: "Hải Châu",
      position: "both",
      dominantHand: "right",
      selfDeclaredLevel: 3,
      role: "player",
      fcmTokens: [],
      schemaVersion: 1,
      isDeleted: false,
      skill: {
        rating,
        matchesPlayed,
        reliability: 80,
        isProvisional: matchesPlayed <= 5,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  it("1. Chốt kết quả trận đấu hợp lệ: Cập nhật Elo, Uy tín và ghi Rating log cho 4 người chơi", async () => {
    if (!emulatorAvailable) return;

    const adminCtx = testEnv.unauthenticatedContext();
    const db = adminCtx.firestore() as any;

    const hostId = "host_1";
    const sessionId = "session_101";
    const matchId = "match_201";

    // Setup Session
    const sessionDoc: SessionDoc = {
      id: sessionId,
      hostId,
      hostName: "Anh Host Hải Châu",
      hostReputation: 95,
      title: "Giao lưu Tuyên Sơn Thứ 7",
      venueName: "Sân Tuyên Sơn",
      address: "01 Nại Nam 2",
      district: "Hải Châu",
      startsAt: new Date(Date.now() + 3600000).toISOString(),
      durationMin: 120,
      costPerPlayer: 50000,
      status: "in_progress",
      courtCount: 1,
      courtSummaries: [],
      openSlotsTotal: 0,
      schemaVersion: 1,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, "sessions", sessionId), sessionDoc);

    // Setup 4 Users
    const uids = ["user_a1", "user_a2", "user_b1", "user_b2"];
    for (const uid of uids) {
      await setDoc(doc(db, "users", uid), createMockUser(uid, `VĐV ${uid}`, 1500, 10));
    }

    // Setup MatchDoc
    const matchDoc: MatchDoc = {
      id: matchId,
      sessionId,
      courtId: "1",
      index: 1,
      teamA: ["user_a1", "user_a2"],
      teamB: ["user_b1", "user_b2"],
      sets: [],
      status: "playing",
      ratingProcessed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, "matches", matchId), matchDoc);

    // Thực hiện chốt kết quả: Đội A thắng sát nút 21-19
    const sets = [{ setNumber: 1, scoreA: 21, scoreB: 19 }];
    const out = await confirmMatchResultTx(db, matchId, hostId, sets);

    expect(out.matchId).toBe(matchId);
    expect(out.eloResult.winner).toBe("teamA");

    // Kiểm tra tài liệu Match sau khi xác nhận
    const updatedMatchSnap = await getDoc(doc(db, "matches", matchId));
    const updatedMatch = updatedMatchSnap.data() as MatchDoc;
    expect(updatedMatch.status).toBe("confirmed");
    expect(updatedMatch.ratingProcessed).toBe(true);
    expect(updatedMatch.sets[0].scoreA).toBe(21);

    // Kiểm tra hồ sơ User A1 (Thắng -> Elo tăng, matchesPlayed tăng)
    const userA1Snap = await getDoc(doc(db, "users", "user_a1"));
    const userA1 = userA1Snap.data() as UserProfile;
    expect(userA1.skill.rating).toBeGreaterThan(1500);
    expect(userA1.skill.matchesPlayed).toBe(11);
    expect(userA1.skill.reliability).toBe(82); // Đúng giờ / hoàn thành trận (+2)

    // Kiểm tra hồ sơ User B1 (Thua -> Elo giảm)
    const userB1Snap = await getDoc(doc(db, "users", "user_b1"));
    const userB1 = userB1Snap.data() as UserProfile;
    expect(userB1.skill.rating).toBeLessThan(1500);
    expect(userB1.skill.matchesPlayed).toBe(11);

    // Kiểm tra đã ghi 4 logs vào collection ratings
    const ratingsSnap = await getDocs(collection(db, "ratings"));
    expect(ratingsSnap.size).toBe(4);
  });

  it("2. TÍNH CHẤT BẮT BUỘC IDEMPOTENT: Gọi lần thứ hai bị chặn và không cộng dồn điểm", async () => {
    if (!emulatorAvailable) return;

    const adminCtx = testEnv.unauthenticatedContext();
    const db = adminCtx.firestore() as any;

    const hostId = "host_idem";
    const sessionId = "session_idem";
    const matchId = "match_idem";

    // Setup Session & Users
    await setDoc(doc(db, "sessions", sessionId), {
      id: sessionId,
      hostId,
      status: "in_progress",
    });

    const uids = ["id_a1", "id_a2", "id_b1", "id_b2"];
    for (const uid of uids) {
      await setDoc(doc(db, "users", uid), createMockUser(uid, uid, 1500, 10));
    }

    await setDoc(doc(db, "matches", matchId), {
      id: matchId,
      sessionId,
      courtId: "1",
      index: 1,
      teamA: ["id_a1", "id_a2"],
      teamB: ["id_b1", "id_b2"],
      sets: [],
      status: "playing",
      ratingProcessed: false,
    });

    const sets = [{ setNumber: 1, scoreA: 21, scoreB: 15 }];

    // Lần gọi 1: Thành công
    await confirmMatchResultTx(db, matchId, hostId, sets);

    const userA1AfterFirst = (await getDoc(doc(db, "users", "id_a1"))).data() as UserProfile;
    const ratingAfterFirst = userA1AfterFirst.skill.rating;
    const matchesAfterFirst = userA1AfterFirst.skill.matchesPlayed;

    // Lần gọi 2: Phải bị từ chối do cờ ratingProcessed = true
    await expect(confirmMatchResultTx(db, matchId, hostId, sets)).rejects.toThrow(
      /Idempotent Block/i
    );

    // Kiểm tra điểm số và số trận không bị cộng thêm lần nữa
    const userA1AfterSecond = (await getDoc(doc(db, "users", "id_a1"))).data() as UserProfile;
    expect(userA1AfterSecond.skill.rating).toBe(ratingAfterFirst);
    expect(userA1AfterSecond.skill.matchesPlayed).toBe(matchesAfterFirst);
  });

  it("3. Phân quyền bảo mật: Không phải Host của buổi đánh cố chốt kết quả -> Bị từ chối", async () => {
    if (!emulatorAvailable) return;

    const adminCtx = testEnv.unauthenticatedContext();
    const db = adminCtx.firestore() as any;

    const hostId = "host_chuan";
    const hackerId = "ke_la_mat";
    const sessionId = "session_auth_test";
    const matchId = "match_auth_test";

    await setDoc(doc(db, "sessions", sessionId), {
      id: sessionId,
      hostId,
      status: "in_progress",
    });

    await setDoc(doc(db, "matches", matchId), {
      id: matchId,
      sessionId,
      courtId: "1",
      index: 1,
      teamA: ["p1", "p2"],
      teamB: ["p3", "p4"],
      sets: [],
      status: "playing",
      ratingProcessed: false,
    });

    const sets = [{ setNumber: 1, scoreA: 21, scoreB: 18 }];

    await expect(confirmMatchResultTx(db, matchId, hackerId, sets)).rejects.toThrow(
      "Chỉ Host của buổi đánh mới có quyền xác nhận kết quả trận đấu"
    );
  });

  it("4. Xử lý thành viên Ghost (vãng lai không có tài khoản): Không lỗi, 3 người thật vẫn nhận điểm", async () => {
    if (!emulatorAvailable) return;

    const adminCtx = testEnv.unauthenticatedContext();
    const db = adminCtx.firestore() as any;

    const hostId = "host_ghost_test";
    const sessionId = "session_ghost_test";
    const matchId = "match_ghost_test";

    await setDoc(doc(db, "sessions", sessionId), {
      id: sessionId,
      hostId,
      status: "in_progress",
    });

    // 3 người thật + 1 ghost
    await setDoc(doc(db, "users", "real_a1"), createMockUser("real_a1", "Người thật A1", 1500, 10));
    await setDoc(doc(db, "users", "real_b1"), createMockUser("real_b1", "Người thật B1", 1500, 10));
    await setDoc(doc(db, "users", "real_b2"), createMockUser("real_b2", "Người thật B2", 1500, 10));

    await setDoc(doc(db, "matches", matchId), {
      id: matchId,
      sessionId,
      courtId: "1",
      index: 1,
      teamA: ["real_a1", "ghost_vanglai_99"], // ghost
      teamB: ["real_b1", "real_b2"],
      sets: [],
      status: "playing",
      ratingProcessed: false,
    });

    const sets = [{ setNumber: 1, scoreA: 21, scoreB: 15 }];
    const out = await confirmMatchResultTx(db, matchId, hostId, sets);

    expect(out.eloResult.winner).toBe("teamA");
    expect(out.eloResult.teamA[1].isGhost).toBe(true);
    expect(out.eloResult.teamA[1].delta).toBe(0);

    // Người thật cùng đội vẫn nhận điểm tăng bình thường
    const realA1Snap = await getDoc(doc(db, "users", "real_a1"));
    const realA1 = realA1Snap.data() as UserProfile;
    expect(realA1.skill.rating).toBeGreaterThan(1500);

    // Kiểm tra ghost không có document tạo mới trong collection users
    const ghostSnap = await getDoc(doc(db, "users", "ghost_vanglai_99"));
    expect(ghostSnap.exists()).toBe(false);

    // Số bản ghi ratings log chỉ có 3 (dành riêng cho 3 người thật)
    const ratingsSnap = await getDocs(collection(db, "ratings"));
    expect(ratingsSnap.size).toBe(3);
  });

  it("5. Thẻ đánh giá chéo: Đồng thuận 2 vote 'plays_better' cộng thêm +4 Elo cho người được khen", async () => {
    if (!emulatorAvailable) return;

    const adminCtx = testEnv.unauthenticatedContext();
    const db = adminCtx.firestore() as any;

    const hostId = "host_card_test";
    const sessionId = "session_card_test";
    const matchId = "match_card_test";

    await setDoc(doc(db, "sessions", sessionId), {
      id: sessionId,
      hostId,
      status: "in_progress",
    });

    for (const uid of ["c_a1", "c_a2", "c_b1", "c_b2"]) {
      await setDoc(doc(db, "users", uid), createMockUser(uid, uid, 1500, 10));
    }

    await setDoc(doc(db, "matches", matchId), {
      id: matchId,
      sessionId,
      courtId: "1",
      index: 1,
      teamA: ["c_a1", "c_a2"],
      teamB: ["c_b1", "c_b2"],
      sets: [],
      status: "playing",
      ratingProcessed: false,
    });

    // 2 đối thủ vote c_a1 đánh hay hơn
    const cards: PostMatchCard[] = [
      { fromUserId: "c_b1", toUserId: "c_a1", tag: "plays_better" },
      { fromUserId: "c_b2", toUserId: "c_a1", tag: "plays_better" },
    ];

    const sets = [{ setNumber: 1, scoreA: 21, scoreB: 19 }];
    const out = await confirmMatchResultTx(db, matchId, hostId, sets, cards);

    const a1Res = out.eloResult.teamA[0];
    expect(a1Res.userId).toBe("c_a1");
    expect(a1Res.cardEloAdjustment).toBe(4); // +4 Elo từ thẻ đánh giá
  });
});
