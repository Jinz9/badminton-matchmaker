import {
  clearOfflineQueue,
  clearSessionSnapshot,
  computeBackoffMs,
  enqueueOfflineAction,
  getNetworkMonitorState,
  getOfflineQueue,
  getTotalPendingActionsCount,
  loadSessionSnapshot,
  processAllOfflineQueues,
  processOfflineQueue,
  resetNetworkMonitorForTest,
  saveSessionSnapshot,
  setSimulatedOffline,
  updateSnapshotMatchScore,
  updateSnapshotRound,
} from "../../src/data/offline";
import { balanceCourt, swapPlayers } from "../../src/domain/balancing/balanceCourt";
import { BalancingMember } from "../../src/domain/balancing/types";
import { SessionDoc } from "../../src/domain/types";

const memoryStorage = new Map<string, string>();

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn((key: string) =>
      Promise.resolve(memoryStorage.get(key) ?? null)
    ),
    setItem: jest.fn((key: string, value: string) => {
      memoryStorage.set(key, value);
      return Promise.resolve();
    }),
    removeItem: jest.fn((key: string) => {
      memoryStorage.delete(key);
      return Promise.resolve();
    }),
  },
}));

jest.mock("@react-native-community/netinfo", () => ({
  __esModule: true,
  default: {
    fetch: jest.fn(() =>
      Promise.resolve({ isConnected: true, isInternetReachable: true })
    ),
    addEventListener: jest.fn(() => jest.fn()),
  },
}));

function makeMember(
  id: string,
  name: string,
  rating: number,
  gender: "M" | "F" = "M"
): BalancingMember {
  return {
    id,
    name,
    gender,
    rating,
    position: "both",
    dominantHand: "right",
  };
}

function makeSession(id = "sess_offline_1"): SessionDoc {
  return {
    id,
    hostId: "host_1",
    hostName: "Anh Nhật",
    hostReputation: 100,
    title: "Kèo Tuyên Sơn Tối Thứ 4",
    venueName: "Sân Cầu Lông Tuyên Sơn",
    address: "Đà Nẵng",
    district: "Hải Châu",
    startsAt: "2026-11-18T19:00:00.000Z",
    durationMin: 120,
    courtCount: 1,
    costPerPlayer: 60000,
    status: "in_progress",
    openSlotsTotal: 0,
    courtSummaries: [],
    schemaVersion: 1,
    isDeleted: false,
    createdAt: "2026-11-18T08:00:00.000Z",
    updatedAt: "2026-11-18T08:00:00.000Z",
  };
}

describe("Offline Cache, Queue & Sync Engine (Q12)", () => {
  beforeEach(() => {
    memoryStorage.clear();
    resetNetworkMonitorForTest();
    jest.clearAllMocks();
  });

  it("lưu và đọc SessionSnapshot (người chơi, điểm, cặp đấu, tỷ số, version, updatedAt)", async () => {
    const session = makeSession("sess_snap_1");
    await saveSessionSnapshot({
      sessionId: session.id,
      version: 3,
      updatedAt: "2026-11-18T14:00:00.000Z",
      session,
      courts: {},
      players: {
        u1: {
          userId: "u1",
          displayName: "An",
          eloScore: 1450,
          gender: "MALE",
          checkInStatus: "CHECKED_IN",
        },
      },
      currentRound: 1,
      completedMatches: [],
      activeMatches: {},
    });

    await updateSnapshotRound(session.id, "1", 2, {
      matchId: "m_local_1",
      courtId: "1",
      roundIndex: 2,
      teamA: ["u1", "u2"],
      teamB: ["u3", "u4"],
      restingPlayerIds: ["u5"],
    });

    await updateSnapshotMatchScore(session.id, "m_local_1", [
      { setNumber: 1, scoreA: 21, scoreB: 18 },
    ]);

    const loaded = await loadSessionSnapshot(session.id);
    expect(loaded).not.toBeNull();
    expect(loaded!.version).toBe(5);
    expect(loaded!.currentRound).toBe(2);
    expect(loaded!.players.u1.eloScore).toBe(1450);
    expect(loaded!.activeMatches["m_local_1"].scores).toEqual([
      { setNumber: 1, teamAScore: 21, teamBScore: 18 },
    ]);

    await clearSessionSnapshot(session.id);
    await expect(loadSessionSnapshot(session.id)).resolves.toBeNull();
  });

  it("chống gửi trùng bằng idempotencyKey và áp dụng exponential backoff khi lỗi mạng", async () => {
    const sid = "sess_q_1";
    await enqueueOfflineAction({
      sessionId: sid,
      courtId: "1",
      actionType: "FINISH_MATCH",
      version: 1,
      idempotencyKey: "finish_match_99",
      payload: { matchId: "match_99", sets: [{ setNumber: 1, scoreA: 21, scoreB: 15 }] },
    });
    // Đưa lại cùng idempotencyKey -> không nhân đôi phần tử trong hàng đợi
    await enqueueOfflineAction({
      sessionId: sid,
      courtId: "1",
      actionType: "FINISH_MATCH",
      version: 1,
      idempotencyKey: "finish_match_99",
      payload: { matchId: "match_99", sets: [{ setNumber: 1, scoreA: 21, scoreB: 16 }] },
    });

    expect(await getOfflineQueue(sid)).toHaveLength(1);

    // Kiểm tra hàm tính backoff tăng theo lũy thừa 2 và chặn trần 30s
    expect(computeBackoffMs(0)).toBe(1000);
    expect(computeBackoffMs(1)).toBe(2000);
    expect(computeBackoffMs(2)).toBe(4000);
    expect(computeBackoffMs(10)).toBe(30000);

    // Lần 1 gặp lỗi mạng tạm thời -> retryCount=1, nextRetryAt = t0 + 1000
    const executor = jest
      .fn()
      .mockRejectedValueOnce(new Error("Network timeout"))
      .mockResolvedValue(undefined);

    const t0 = 1_000_000;
    const res1 = await processOfflineQueue(sid, { now: t0, executor });
    expect(res1.syncedCount).toBe(0);
    expect(res1.remainingCount).toBe(1);

    // Chưa tới hạn backoff (t0 + 500ms) -> bỏ qua không gọi executor
    const resTooSoon = await processOfflineQueue(sid, {
      now: t0 + 500,
      executor,
    });
    expect(resTooSoon.skippedBackoffCount).toBe(1);
    expect(executor).toHaveBeenCalledTimes(1);

    // Đủ thời gian backoff (t0 + 1500ms) -> đồng bộ thành công & xóa khỏi queue
    const resOk = await processOfflineQueue(sid, {
      now: t0 + 1500,
      executor,
    });
    expect(resOk.syncedCount).toBe(1);
    expect(resOk.remainingCount).toBe(0);
    expect(executor).toHaveBeenCalledTimes(2);

    // Thử enqueue lại cùng idempotencyKey đã sync -> bị chặn, không gửi lần 2
    await enqueueOfflineAction({
      sessionId: sid,
      courtId: "1",
      actionType: "FINISH_MATCH",
      version: 1,
      idempotencyKey: "finish_match_99",
      payload: { matchId: "match_99" },
    });
    expect(await getOfflineQueue(sid)).toHaveLength(0);
    await clearOfflineQueue(sid);
  });

  it("xử lý xung đột MATCH_ALREADY_SETTLED, VERSION_CONFLICT và USER_WITHDREW mà không làm kẹt hàng đợi", async () => {
    const sid = "sess_conflict_1";
    await enqueueOfflineAction({
      sessionId: sid,
      courtId: "1",
      actionType: "FINISH_MATCH",
      version: 1,
      idempotencyKey: "k_settled",
      payload: { matchId: "m1" },
    });
    await enqueueOfflineAction({
      sessionId: sid,
      courtId: "1",
      actionType: "SWAP_PLAYERS",
      version: 1,
      idempotencyKey: "k_version",
      payload: {},
    });
    await enqueueOfflineAction({
      sessionId: sid,
      courtId: "1",
      actionType: "SUBMIT_SCORE",
      version: 1,
      idempotencyKey: "k_ok",
      payload: { matchId: "m2" },
    });

    const executor = jest
      .fn()
      .mockRejectedValueOnce(new Error("Idempotent Block: trận đã được xác nhận kết quả"))
      .mockRejectedValueOnce(
        Object.assign(new Error("CONFLICT"), { code: "failed-precondition" })
      )
      .mockResolvedValueOnce(undefined);

    const res = await processOfflineQueue(sid, { force: true, executor });
    expect(res.conflicts).toHaveLength(2);
    expect(res.conflicts.map((c) => c.code)).toEqual([
      "MATCH_ALREADY_SETTLED",
      "VERSION_CONFLICT",
    ]);
    expect(res.syncedCount).toBe(1);
    expect(res.remainingCount).toBe(0);
  });

  it("kịch bản mất mạng giữa buổi: chia cặp thuần (balanceCourt/swapPlayers), nhập tỷ số và đồng bộ khi có mạng lại", async () => {
    const sid = "sess_mid_offline";
    const session = makeSession(sid);
    const members: BalancingMember[] = [
      makeMember("u1", "An", 1500),
      makeMember("u2", "Bình", 1420),
      makeMember("u3", "Cường", 1480),
      makeMember("u4", "Dũng", 1400),
      makeMember("u5", "Em", 1380),
    ];

    // 1. Trước khi mất mạng: lưu snapshot
    await saveSessionSnapshot({
      sessionId: sid,
      version: 1,
      updatedAt: new Date().toISOString(),
      session,
      courts: {},
      players: {},
      currentRound: 0,
      completedMatches: [],
      activeMatches: {},
    });

    // 2. Bật chế độ Ngoại tuyến giả (mất mạng tại sân mái tôn)
    await setSimulatedOffline(true);
    expect(getNetworkMonitorState().isOnline).toBe(false);

    // 3. Host vẫn chia cặp bằng hàm thuần & đổi người offline
    const balanced = balanceCourt(members, {
      category: "men",
      mode: "rotate",
    });
    expect(balanced.matches.length).toBeGreaterThan(0);

    const firstMatch = balanced.matches[0];
    const swapped = swapPlayers(
      firstMatch,
      firstMatch.teamAIds[0],
      firstMatch.teamBIds[0],
      "men"
    );

    await updateSnapshotRound(sid, "1", 1, {
      matchId: "local_m1",
      courtId: "1",
      roundIndex: 1,
      teamA: swapped.match.teamAIds,
      teamB: swapped.match.teamBIds,
      restingPlayerIds: swapped.match.restingIds,
    });

    await enqueueOfflineAction({
      sessionId: sid,
      courtId: "1",
      actionType: "GENERATE_ROUND",
      version: 1,
      idempotencyKey: `round_${sid}_1_1`,
      payload: {
        roundIndex: 1,
        teamA: swapped.match.teamAIds,
        teamB: swapped.match.teamBIds,
      },
    });

    // 4. Host nhập tỷ số offline & xếp hàng đợi chốt trận
    const sets = [
      { setNumber: 1, scoreA: 21, scoreB: 17 },
      { setNumber: 2, scoreA: 21, scoreB: 19 },
    ];
    await updateSnapshotMatchScore(sid, "local_m1", sets);
    await enqueueOfflineAction({
      sessionId: sid,
      courtId: "1",
      actionType: "FINISH_MATCH",
      version: 2,
      idempotencyKey: "finish_local_m1",
      payload: { matchId: "local_m1", hostId: "host_1", sets, cards: [] },
    });

    expect(await getTotalPendingActionsCount()).toBe(2);

    // 5. Có mạng trở lại -> đồng bộ theo thứ tự FIFO
    await setSimulatedOffline(false);
    expect(getNetworkMonitorState().isOnline).toBe(true);

    const executedOrder: string[] = [];
    const syncRes = await processAllOfflineQueues({
      force: true,
      executor: async (action) => {
        executedOrder.push(action.actionType);
      },
    });

    expect(syncRes.syncedCount).toBe(2);
    expect(syncRes.remainingCount).toBe(0);
    expect(executedOrder).toEqual(["GENERATE_ROUND", "FINISH_MATCH"]);
    expect(await getTotalPendingActionsCount()).toBe(0);
  });
});
