import {
  createRepository,
  getConfiguredDataSource,
  MockRepository,
} from "../../src/data";
import { FirebaseRepository } from "../../src/data/FirebaseRepository";
import { RULES } from "../../src/config/rules";
import { SessionDoc } from "../../src/domain/types";

const memoryStorage = new Map<string, string>();

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn((key: string) => Promise.resolve(memoryStorage.get(key) ?? null)),
    setItem: jest.fn((key: string, val: string) => {
      memoryStorage.set(key, val);
      return Promise.resolve();
    }),
    removeItem: jest.fn((key: string) => {
      memoryStorage.delete(key);
      return Promise.resolve();
    }),
  },
}));

describe("Data Layer: MockRepository & Data Source Switch", () => {
  let repo: MockRepository;

  beforeEach(async () => {
    memoryStorage.clear();
    repo = new MockRepository({ minLatencyMs: 0, maxLatencyMs: 0, errorRate: 0 });
    await repo.resetMockData();
  });

  it("đọc danh sách kèo mẫu gồm kèo 2 sân, kèo ca lẻ 5/7 người và kèo đầy", async () => {
    const all = await repo.listSessions();
    expect(all.length).toBeGreaterThanOrEqual(4);

    const twoCourt = all.find((s) => s.id === "session_ts_02");
    expect(twoCourt?.courtCount).toBe(2);

    const oddSessionCourts = await repo.listCourtsBySession("session_odd_04");
    expect(oddSessionCourts).toHaveLength(2);
    expect(Object.keys(oddSessionCourts[0].roster).length).toBe(5);
    expect(Object.keys(oddSessionCourts[1].roster).length).toBe(7);

    const openOnly = await repo.listSessions({ onlyOpenSlots: true });
    expect(openOnly.some((s) => s.id === "session_full_03")).toBe(false);
  });

  it("tham gia kèo còn suất -> duyệt đơn -> tăng roster & giảm openSlotsTotal", async () => {
    const beforeSession = await repo.getSessionById("session_kd_01");
    const beforeSlots = beforeSession!.openSlotsTotal;

    // usr_tuan_06 chưa có trong session_kd_01 (cấp 6 > max 4? dùng usr_minh_04 cấp 5 hoặc tạo user phù hợp)
    // Ở session_kd_01 court 1: category mixed, levelMin 2, levelMax 4
    await repo.createProfile({
      uid: "usr_test_valid",
      displayName: "Trần Minh Test",
      gender: "M",
      areaLabel: "Thanh Khê",
      position: "back",
      dominantHand: "right",
      selfDeclaredLevel: 3,
      role: "player",
      skill: {
        rating: 1425,
        matchesPlayed: 6,
        reliability: 90,
        isProvisional: false,
      },
      fcmTokens: [],
      schemaVersion: 1,
      isDeleted: false,
      createdAt: "2026-11-15T00:00:00.000Z",
      updatedAt: "2026-11-15T00:00:00.000Z",
    });

    const joinRes = await repo.submitJoinRequest(
      "session_kd_01",
      "1",
      "usr_test_valid",
      "Xin 1 suất tối T4"
    );
    expect(joinRes.status).toBe("confirmed");

    await repo.reviewRequest(
      "session_kd_01",
      "1",
      "session_kd_01_1_usr_test_valid",
      "approve"
    );

    const court = await repo.getCourt("session_kd_01", "1");
    expect(court?.roster["usr_test_valid"]).toBeDefined();
    expect(Object.keys(court!.roster).length).toBeLessThanOrEqual(
      RULES.COURT_CAPACITY
    );

    const afterSession = await repo.getSessionById("session_kd_01");
    expect(afterSession!.openSlotsTotal).toBe(beforeSlots - 1);
  });

  it("chặn người chơi có độ uy tín thấp (< minReliability)", async () => {
    await expect(
      repo.submitJoinRequest("session_kd_01", "1", "usr_lowrep_09")
    ).rejects.toThrow();
  });

  it("hủy kèo đầy -> tự động đôn Waitlist lên chính thức và không vượt quá 8 người/sân", async () => {
    const fullCourtBefore = await repo.getCourt("session_full_03", "1");
    expect(Object.keys(fullCourtBefore!.roster).length).toBe(8);

    // Hủy 1 vãng lai đã duyệt (usr_dat_02)
    const result = await repo.cancelParticipation(
      "session_full_03",
      "1",
      "usr_dat_02"
    );
    expect(result.promotedUser).toBe("usr_huong_05");

    const fullCourtAfter = await repo.getCourt("session_full_03", "1");
    const rosterCount = Object.keys(fullCourtAfter!.roster).length;
    expect(rosterCount).toBe(8);
    expect(rosterCount).toBeLessThanOrEqual(RULES.COURT_CAPACITY);
    expect(fullCourtAfter!.roster["usr_dat_02"]).toBeUndefined();
    expect(fullCourtAfter!.roster["usr_huong_05"]).toBeDefined();

    // Kiểm tra người dự bị số 2 được đôn lên vị trí #1
    const requests = await repo.listRequestsByCourt("session_full_03", "1");
    const vyReq = requests.find((r) => r.userId === "usr_vy_07");
    expect(vyReq?.status).toBe("waitlist");
    expect(vyReq?.waitlistPosition).toBe(1);

    // Kiểm tra thông báo đôn waitlist được tạo cho usr_huong_05
    const notifs = await repo.listNotifications("usr_huong_05");
    expect(notifs.some((n) => n.type === "waitlist_promoted")).toBe(true);
  });

  it("subscribe() phát cập nhật realtime khi dữ liệu phòng kèo thay đổi", async () => {
    const snapshots: SessionDoc[][] = [];
    const unsubscribe = repo.subscribe<SessionDoc[]>("sessions", (data) => {
      snapshots.push(data);
    });

    await repo.updateSessionStatus("session_kd_01", "in_progress");
    unsubscribe();

    expect(snapshots.length).toBeGreaterThanOrEqual(1);
    const latest = snapshots[snapshots.length - 1];
    expect(latest.find((s) => s.id === "session_kd_01")?.status).toBe(
      "in_progress"
    );
  });

  it("tìm đồng đội ăn ý, chấm kết quả trận cập nhật Elo và đặt lại dữ liệu mẫu", async () => {
    const partners = await repo.searchCompatiblePartners("usr_dat_02");
    expect(partners.length).toBeGreaterThan(0);

    const best = await repo.listBestPartners("usr_nhat_01");
    expect(best.length).toBeGreaterThan(0);

    const beforeMinh = await repo.getProfile("usr_minh_04");
    await repo.saveMatchScore("match_odd_02", [{ setNumber: 1, scoreA: 21, scoreB: 17 }]);
    await repo.confirmMatchResult("match_odd_02", "usr_minh_04");
    const afterMinh = await repo.getProfile("usr_minh_04");
    expect(afterMinh!.skill.matchesPlayed).toBe(
      beforeMinh!.skill.matchesPlayed + 1
    );

    // Đặt lại dữ liệu mẫu về ban đầu
    await repo.resetMockData();
    const resetMinh = await repo.getProfile("usr_minh_04");
    expect(resetMinh!.skill.matchesPlayed).toBe(beforeMinh!.skill.matchesPlayed);
  });

  it("chọn nguồn qua EXPO_PUBLIC_DATA_SOURCE=firebase trả về FirebaseRepository và xử lý lỗi quyền truy cập thân thiện", async () => {
    const prev = process.env.EXPO_PUBLIC_DATA_SOURCE;
    process.env.EXPO_PUBLIC_DATA_SOURCE = "firebase";
    try {
      expect(getConfiguredDataSource()).toBe("firebase");
      const fbRepo = createRepository();
      expect(fbRepo).toBeInstanceOf(FirebaseRepository);
      await expect(fbRepo.listSessions()).rejects.toThrow(
        /quy tắc bảo mật|chưa nối|kết nối/i
      );
    } finally {
      if (prev === undefined) delete process.env.EXPO_PUBLIC_DATA_SOURCE;
      else process.env.EXPO_PUBLIC_DATA_SOURCE = prev;
    }
  });
});

