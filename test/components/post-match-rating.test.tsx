import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";

const mockMemoryStorage = new Map<string, string>();

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn((key: string) =>
      Promise.resolve(mockMemoryStorage.get(key) ?? null)
    ),
    setItem: jest.fn((key: string, val: string) => {
      mockMemoryStorage.set(key, val);
      return Promise.resolve();
    }),
    removeItem: jest.fn((key: string) => {
      mockMemoryStorage.delete(key);
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      mockMemoryStorage.clear();
      return Promise.resolve();
    }),
  },
}));

import { ScoreMatchScreen } from "../../src/app/court/score";
import {
  getPendingMatchResults,
  getRepository,
  MockRepository,
  setRepository,
} from "../../src/data";
import { MatchDoc, UserProfile } from "../../src/domain/types";
import { AuthProvider } from "../../src/hooks";

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
  }),
  useLocalSearchParams: () => ({}),
}));

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: "light", Medium: "medium", Heavy: "heavy" },
  NotificationFeedbackType: {
    Success: "success",
    Warning: "warning",
    Error: "error",
  },
}));

function makeTestUser(
  uid: string,
  name: string,
  rating: number,
  matchesPlayed = 10
): UserProfile {
  return {
    uid,
    displayName: name,
    email: `${uid}@test.local`,
    gender: "M",
    dominantHand: "right",
    position: "both",
    areaLabel: "Hải Châu, Đà Nẵng",
    skill: {
      rating,
      level: 4,
      matchesPlayed,
      wins: 5,
      losses: 5,
      isProvisional: matchesPlayed < 5,
      reliability: 80,
      noShowCount: 0,
      lateCancelCount: 0,
    },
    role: "player",
    createdAt: "2026-11-15T00:00:00.000Z",
    updatedAt: "2026-11-15T00:00:00.000Z",
  };
}

const TEST_PLAYERS: Record<string, UserProfile> = {
  u_a1: makeTestUser("u_a1", "Minh Anh", 1500, 10),
  u_a2: makeTestUser("u_a2", "Hùng Dũng", 1500, 3), // provisional K=40
  u_b1: makeTestUser("u_b1", "Tuấn Kiệt", 1500, 12),
  u_b2: makeTestUser("u_b2", "Hoàng Nam", 1500, 14),
};

function makeMatch(overrides?: Partial<MatchDoc>): MatchDoc {
  return {
    id: `match_test_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    sessionId: "session_tienson_05",
    courtId: "1",
    index: 1,
    teamA: ["u_a1", "u_a2"],
    teamB: ["u_b1", "u_b2"],
    playerIds: ["u_a1", "u_a2", "u_b1", "u_b2"],
    category: "men",
    sets: [{ setNumber: 1, scoreA: 0, scoreB: 0 }],
    status: "playing",
    ratingProcessed: false,
    createdAt: "2026-11-16T00:00:00.000Z",
    updatedAt: "2026-11-16T00:00:00.000Z",
    ...overrides,
  };
}

describe("Q07: Chấm điểm 1 tay, Hoàn tác đa bước, Luật BWF, Thẻ 5s & Elo", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockMemoryStorage.clear();
    const repo = new MockRepository({
      minLatencyMs: 0,
      maxLatencyMs: 0,
      errorRate: 0,
    });
    setRepository(repo);
  });

  it("hoàn tác nhiều bước theo đúng thứ tự Đội A & Đội B và tăng +1 quả cầu", async () => {
    const match = makeMatch({ id: "match_undo_01" });
    const { getByTestId, getByText, unmount } = await render(
      <AuthProvider>
        <ScoreMatchScreen
          initialMatchId={match.id}
          matchOverride={match}
          playersOverride={TEST_PLAYERS}
          currentUserIdOverride="u_a1"
          disableTimer
        />
      </AuthProvider>
    );

    const boxA = getByTestId("score-box-a");
    const boxB = getByTestId("score-box-b");
    const undoBtn = getByTestId("btn-undo-score");
    const shuttleBtn = getByTestId("btn-add-shuttle");

    // Bấm: A (+1), B (+1), A (+1), B (+1) -> 2 - 2
    await fireEvent.press(boxA);
    await fireEvent.press(boxB);
    await fireEvent.press(boxA);
    await fireEvent.press(boxB);

    expect(getByText("Set 1: 2-2")).toBeTruthy();

    // Hoàn tác lần 1 -> trừ Đội B -> 2-1
    await fireEvent.press(undoBtn);
    expect(getByText("Set 1: 2-1")).toBeTruthy();

    // Hoàn tác lần 2 -> trừ Đội A -> 1-1
    await fireEvent.press(undoBtn);
    expect(getByText("Set 1: 1-1")).toBeTruthy();

    // Hoàn tác lần 3 -> trừ Đội B -> 1-0
    await fireEvent.press(undoBtn);
    expect(getByText("Set 1: 1-0")).toBeTruthy();

    // Hoàn tác lần 4 -> trừ Đội A -> 0-0
    await fireEvent.press(undoBtn);
    expect(getByText("Set 1: 0-0")).toBeTruthy();

    // +1 quả cầu
    expect(getByText("Cầu: 1")).toBeTruthy();
    await fireEvent.press(shuttleBtn);
    await fireEvent.press(shuttleBtn);
    expect(getByText("Cầu: 3")).toBeTruthy();

    await unmount();
  });

  it("kiểm tra luật BWF: chặn tỷ số không hợp lệ (< 21 hoặc Deuce 21-20), chỉ cho kết thúc khi hợp lệ", async () => {
    const match = makeMatch({
      id: "match_bwf_01",
      sets: [{ setNumber: 1, scoreA: 20, scoreB: 20 }],
    });
    const { getByTestId, queryByText, unmount } = await render(
      <AuthProvider>
        <ScoreMatchScreen
          initialMatchId={match.id}
          matchOverride={match}
          playersOverride={TEST_PLAYERS}
          currentUserIdOverride="u_a1"
          disableTimer
        />
      </AuthProvider>
    );

    // 20-20 hòa -> bấm Kết thúc phải bị chặn
    await fireEvent.press(getByTestId("btn-finish-match"));
    expect(getByTestId("bwf-score-error")).toBeTruthy();
    expect(queryByText("Chấm điểm nhanh 5 giây")).toBeNull();

    // +1 Đội A thành 21-20 (chưa cách 2 điểm) -> vẫn phải bị chặn
    await fireEvent.press(getByTestId("score-box-a"));
    await fireEvent.press(getByTestId("btn-finish-match"));
    expect(getByTestId("bwf-score-error")).toBeTruthy();
    expect(queryByText("Chấm điểm nhanh 5 giây")).toBeNull();

    // +1 Đội A thành 22-20 (hợp lệ!) -> mở sheet chấm điểm 5 giây
    await fireEvent.press(getByTestId("score-box-a"));
    await fireEvent.press(getByTestId("btn-finish-match"));
    await waitFor(() => {
      expect(queryByText("Chấm điểm nhanh 5 giây")).toBeTruthy();
    });

    await unmount();
  });

  it("chặn tự chấm mình trong bảng thẻ 5 giây, gửi kết quả qua Repository và hiện Elo trước/sau của 4 VĐV", async () => {
    const repo = getRepository();
    const matchId = await repo.createMatch({
      sessionId: "session_tienson_05",
      courtId: "1",
      index: 1,
      teamA: ["u_a1", "u_a2"],
      teamB: ["u_b1", "u_b2"],
      category: "men",
      sets: [{ setNumber: 1, scoreA: 21, scoreB: 15 }],
    });

    const saveSpy = jest.spyOn(repo, "saveMatchScore");
    const confirmSpy = jest
      .spyOn(repo, "confirmMatchResult")
      .mockResolvedValueOnce(undefined);

    const match = makeMatch({
      id: matchId,
      sets: [{ setNumber: 1, scoreA: 21, scoreB: 15 }],
    });

    const { getByTestId, queryByTestId, getByText, unmount } = await render(
      <AuthProvider>
        <ScoreMatchScreen
          initialMatchId={matchId}
          matchOverride={match}
          playersOverride={TEST_PLAYERS}
          currentUserIdOverride="u_a1"
          disableTimer
        />
      </AuthProvider>
    );

    // Bấm Kết thúc -> mở sheet đánh giá 5 giây
    await fireEvent.press(getByTestId("btn-finish-match"));
    await waitFor(() => {
      expect(getByTestId("self-locked-u_a1")).toBeTruthy();
    });

    // Không được có nút tự chấm cho chính mình (u_a1)
    expect(queryByTestId("review-tag-u_a1-plays_better")).toBeNull();
    expect(queryByTestId("review-tag-u_a1-good_attitude")).toBeNull();

    // Chọn thẻ 1 chạm cho đồng đội & đối thủ
    await fireEvent.press(getByTestId("review-tag-u_a2-good_attitude"));
    await fireEvent.press(getByTestId("review-tag-u_b1-correct_level"));

    // Xác nhận & cập nhật Elo
    await fireEvent.press(getByTestId("btn-submit-match-result"));

    await waitFor(() => {
      expect(getByTestId("elo-summary-view")).toBeTruthy();
    });

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(confirmSpy).toHaveBeenCalledTimes(1);
    const sentCards = confirmSpy.mock.calls[0][2] ?? [];
    expect(sentCards.some((c) => c.toUserId === "u_a1")).toBe(false);
    expect(sentCards.length).toBe(2);

    // Hiển thị Elo cho cả 4 VĐV
    expect(getByTestId("elo-result-u_a1")).toBeTruthy();
    expect(getByTestId("elo-result-u_a2")).toBeTruthy();
    expect(getByTestId("elo-result-u_b1")).toBeTruthy();
    expect(getByTestId("elo-result-u_b2")).toBeTruthy();
    expect(getByText("🏆 ĐỘI A CHIẾN THẮNG!")).toBeTruthy();

    await unmount();
  });

  it("lưu hàng đợi offline khi gửi thất bại và cho phép thử lại thành công", async () => {
    const repo = getRepository();
    const matchId = await repo.createMatch({
      sessionId: "session_tienson_05",
      courtId: "1",
      index: 2,
      teamA: ["u_a1", "u_a2"],
      teamB: ["u_b1", "u_b2"],
      category: "men",
      sets: [{ setNumber: 1, scoreA: 21, scoreB: 19 }],
    });

    const confirmSpy = jest
      .spyOn(repo, "confirmMatchResult")
      .mockRejectedValueOnce(new Error("Mất kết nối mạng tại sân"))
      .mockResolvedValueOnce(undefined);

    const match = makeMatch({
      id: matchId,
      sets: [{ setNumber: 1, scoreA: 21, scoreB: 19 }],
    });

    const { getByTestId, unmount } = await render(
      <AuthProvider>
        <ScoreMatchScreen
          initialMatchId={matchId}
          matchOverride={match}
          playersOverride={TEST_PLAYERS}
          currentUserIdOverride="u_a1"
          disableTimer
        />
      </AuthProvider>
    );

    await fireEvent.press(getByTestId("btn-finish-match"));
    await fireEvent.press(getByTestId("btn-submit-match-result"));

    await waitFor(() => {
      expect(getByTestId("submit-error-box")).toBeTruthy();
      expect(getByTestId("offline-queue-banner")).toBeTruthy();
    });

    const queued = await getPendingMatchResults();
    expect(queued.some((q) => q.matchId === matchId)).toBe(true);

    // Bấm thử lại -> thành công và dọn hàng đợi
    await fireEvent.press(getByTestId("btn-retry-submit"));
    await waitFor(() => {
      expect(getByTestId("elo-summary-view")).toBeTruthy();
    });
    expect(confirmSpy).toHaveBeenCalledTimes(2);
    const afterRetry = await getPendingMatchResults();
    expect(afterRetry.some((q) => q.matchId === matchId)).toBe(false);

    await unmount();
  });
});

