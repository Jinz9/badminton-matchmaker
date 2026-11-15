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

import { MatchHistoryScreen } from "../../src/app/(tabs)/history";
import { CourtHomeScreen } from "../../src/app/court/index";
import {
  MatchDoc,
  RatingHistoryDoc,
  UserProfile,
} from "../../src/domain/types";
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

function makeUser(uid: string, name: string, rating = 1500): UserProfile {
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
      matchesPlayed: 15,
      wins: 10,
      losses: 5,
      isProvisional: false,
      reliability: 90,
      noShowCount: 0,
      lateCancelCount: 0,
    },
    role: "player",
    createdAt: "2026-11-01T00:00:00.000Z",
    updatedAt: "2026-11-16T00:00:00.000Z",
  };
}

function makeConfirmedMatch(
  id: string,
  partnerId: string,
  isWin: boolean,
  daysAgo: number,
  category: "men" | "women" | "mixed" = "men"
): MatchDoc {
  const created = new Date(Date.now() - daysAgo * 86400 * 1000).toISOString();
  return {
    id,
    sessionId: "s_hist_01",
    courtId: "1",
    index: 1,
    teamA: ["me", partnerId],
    teamB: ["opp_1", "opp_2"],
    playerIds: ["me", partnerId, "opp_1", "opp_2"],
    category,
    sets: isWin
      ? [{ setNumber: 1, scoreA: 21, scoreB: 17 }]
      : [{ setNumber: 1, scoreA: 16, scoreB: 21 }],
    status: "confirmed",
    winner: isWin ? "teamA" : "teamB",
    ratingProcessed: true,
    createdAt: created,
    updatedAt: created,
  };
}

describe("Q10: Lịch sử đấu, Thống kê SVG, Đồng đội ăn ý (>=5 trận & >=60%) & Điều hướng", () => {
  const users = [
    makeUser("me", "Tôi (Host)", 1540),
    makeUser("partner_qualified", "Đạt Ăn Ý", 1550),
    makeUser("partner_under_5", "Tuấn Dưới 5 Trận", 1500),
    makeUser("partner_low_winrate", "Hùng Dưới 60%", 1480),
    makeUser("opp_1", "Đối Thủ 1", 1510),
    makeUser("opp_2", "Đối Thủ 2", 1520),
  ];

  // 5 trận với partner_qualified (4 thắng = 80%) + 4 trận với partner_under_5 (4 thắng = 100%, < 5 trận)
  // + 5 trận với partner_low_winrate (2 thắng = 40%, < 60%) = 14 trận
  const matches: MatchDoc[] = [
    makeConfirmedMatch("m_q1", "partner_qualified", true, 1, "men"),
    makeConfirmedMatch("m_q2", "partner_qualified", true, 2, "men"),
    makeConfirmedMatch("m_q3", "partner_qualified", true, 3, "men"),
    makeConfirmedMatch("m_q4", "partner_qualified", true, 4, "men"),
    makeConfirmedMatch("m_q5", "partner_qualified", false, 5, "mixed"),
    makeConfirmedMatch("m_u1", "partner_under_5", true, 6, "men"),
    makeConfirmedMatch("m_u2", "partner_under_5", true, 10, "men"),
    makeConfirmedMatch("m_u3", "partner_under_5", true, 12, "men"),
    makeConfirmedMatch("m_u4", "partner_under_5", true, 15, "men"),
    makeConfirmedMatch("m_l1", "partner_low_winrate", true, 20, "men"),
    makeConfirmedMatch("m_l2", "partner_low_winrate", true, 25, "men"),
    makeConfirmedMatch("m_l3", "partner_low_winrate", false, 35, "men"),
    makeConfirmedMatch("m_l4", "partner_low_winrate", false, 40, "men"),
    makeConfirmedMatch("m_l5", "partner_low_winrate", false, 45, "men"),
  ];

  const ratingLogs: RatingHistoryDoc[] = [
    {
      id: "r1",
      userId: "me",
      matchId: "m_q2",
      sessionId: "s_hist_01",
      oldRating: 1500,
      newRating: 1520,
      delta: 20,
      kFactor: 24,
      oldReliability: 88,
      newReliability: 90,
      reason: "match_result",
      createdAt: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
    },
    {
      id: "r2",
      userId: "me",
      matchId: "m_q1",
      sessionId: "s_hist_01",
      oldRating: 1520,
      newRating: 1540,
      delta: 20,
      kFactor: 24,
      oldReliability: 90,
      newReliability: 92,
      reason: "match_result",
      createdAt: new Date(Date.now() - 1 * 86400 * 1000).toISOString(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockMemoryStorage.clear();
  });

  it("hiển thị lịch sử trận đấu phân trang, lọc thời gian/nội dung, biểu đồ SVG & chỉ hiển thị đồng đội >= 5 trận và >= 60% thắng", async () => {
    const { getByTestId, queryByTestId, unmount } = await render(
      <AuthProvider>
        <MatchHistoryScreen
          userIdOverride="me"
          matchesOverride={matches}
          ratingHistoryOverride={ratingLogs}
          usersOverride={users}
        />
      </AuthProvider>
    );

    // Tab 1: Lịch sử đấu phân trang 5 trận đầu -> có nút Tải thêm
    expect(getByTestId("history-match-m_q1")).toBeTruthy();
    expect(queryByTestId("history-match-m_u1")).toBeNull();

    await fireEvent.press(getByTestId("btn-load-more-history"));
    await waitFor(() => {
      expect(getByTestId("history-match-m_u1")).toBeTruthy();
    });

    // Lọc nội dung Đôi nam nữ -> chỉ còn m_q5
    await fireEvent.press(getByTestId("history-cat-mixed"));
    await waitFor(() => {
      expect(getByTestId("history-match-m_q5")).toBeTruthy();
      expect(queryByTestId("history-match-m_q1")).toBeNull();
    });

    // Tab 2: Thống kê cá nhân & Biểu đồ đường Elo SVG + Radar SVG
    await fireEvent.press(getByTestId("history-tab-stats"));
    await waitFor(() => {
      expect(getByTestId("elo-line-chart")).toBeTruthy();
      expect(getByTestId("skill-radar-chart")).toBeTruthy();
    });

    // Tab 3: Đồng đội ăn ý -> chỉ partner_qualified (>= 5 trận & 80%) được hiển thị
    await fireEvent.press(getByTestId("history-tab-partners"));
    await waitFor(() => {
      expect(
        getByTestId("best-partner-card-partner_qualified")
      ).toBeTruthy();
    });
    expect(queryByTestId("best-partner-card-partner_under_5")).toBeNull();
    expect(queryByTestId("best-partner-card-partner_low_winrate")).toBeNull();

    await unmount();
  });

  it("kiểm tra điều hướng từ Home Sân Đấu sang Sảnh Kèo Giao Lưu (/lobby)", async () => {
    const { getByTestId, unmount } = await render(
      <AuthProvider>
        <CourtHomeScreen />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId("btn-go-lobby-list")).toBeTruthy();
    });

    await fireEvent.press(getByTestId("btn-go-lobby-list"));
    expect(mockPush).toHaveBeenCalledWith("/lobby");

    await unmount();
  });
});

