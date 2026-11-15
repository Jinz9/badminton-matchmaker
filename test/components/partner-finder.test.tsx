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

import { PartnerFinderScreen } from "../../src/app/(tabs)/partners";
import { UserProfile } from "../../src/domain/types";
import { AuthProvider } from "../../src/hooks";

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

function makeCandidate(
  uid: string,
  name: string,
  rating: number,
  overrides?: Partial<UserProfile>
): UserProfile {
  return {
    uid,
    displayName: name,
    email: `${uid}@test.local`,
    gender: "M",
    dominantHand: "left",
    position: "front",
    areaLabel: "Hải Châu, Đà Nẵng",
    skill: {
      rating,
      level: 4,
      matchesPlayed: 12,
      wins: 7,
      losses: 5,
      isProvisional: false,
      reliability: 92,
      noShowCount: 0,
      lateCancelCount: 0,
    },
    role: "player",
    createdAt: "2026-11-15T00:00:00.000Z",
    updatedAt: "2026-11-15T00:00:00.000Z",
    ...overrides,
  };
}

describe("Q09: Màn Tìm đồng đội ăn ý & BXH Elo CLB", () => {
  const seeker = makeCandidate("seeker_01", "Người Tìm", 1500, {
    gender: "M",
    dominantHand: "right",
    position: "back",
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockMemoryStorage.clear();
  });

  it("kiểm tra biên 150 và 151 điểm Elo: 150 hiển thị, 151 bị loại khi mặc định ≤ 150", async () => {
    const candidates = [
      makeCandidate("cand_150", "Biên 150 Điểm", 1650),
      makeCandidate("cand_151", "Biên 151 Điểm", 1651),
    ];

    const { getByTestId, queryByTestId, unmount } = await render(
      <AuthProvider>
        <PartnerFinderScreen
          seekerOverride={seeker}
          candidatesOverride={candidates}
        />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId("partner-card-cand_150")).toBeTruthy();
    });
    expect(queryByTestId("partner-card-cand_151")).toBeNull();

    // Nới bộ lọc lên <= 200 Elo -> ứng viên lệch 151 điểm xuất hiện
    await fireEvent.press(getByTestId("filter-elo-200"));
    await waitFor(() => {
      expect(getByTestId("partner-card-cand_151")).toBeTruthy();
    });

    await unmount();
  });

  it("lọc theo quận Đà Nẵng, nội dung và hiển thị trạng thái rỗng & lỗi", async () => {
    const candidates = [
      makeCandidate("cand_hc", "VĐV Hải Châu", 1520, {
        areaLabel: "Hải Châu, Đà Nẵng",
      }),
    ];

    const { getByTestId, unmount } = await render(
      <AuthProvider>
        <PartnerFinderScreen
          seekerOverride={seeker}
          candidatesOverride={candidates}
        />
      </AuthProvider>
    );

    expect(getByTestId("partner-card-cand_hc")).toBeTruthy();

    // Lọc quận Ngũ Hành Sơn (không có ai) -> trạng thái rỗng
    await fireEvent.press(getByTestId("partner-district-Ngũ Hành Sơn"));
    await waitFor(() => {
      expect(getByTestId("partner-empty")).toBeTruthy();
    });

    await unmount();

    // Kiểm tra trạng thái lỗi
    const errView = await render(
      <AuthProvider>
        <PartnerFinderScreen
          seekerOverride={seeker}
          candidatesOverride={candidates}
          forceError="Mất kết nối máy chủ"
        />
      </AuthProvider>
    );
    expect(errView.getByTestId("partner-error")).toBeTruthy();
    await errView.unmount();
  });

  it("phân trang đúng (5 người/trang -> bấm Tải thêm hiện đủ 7 người) và chuyển tab BXH Elo CLB", async () => {
    const candidates = Array.from({ length: 7 }, (_, i) =>
      makeCandidate(`cand_${i + 1}`, `Đồng Đội #${i + 1}`, 1500 + i * 10)
    );

    const { getByTestId, getByText, queryByTestId, unmount } = await render(
      <AuthProvider>
        <PartnerFinderScreen
          seekerOverride={seeker}
          candidatesOverride={candidates}
        />
      </AuthProvider>
    );

    expect(getByText("Hiển thị 5 / 7 đồng đội phù hợp")).toBeTruthy();
    expect(getByTestId("btn-load-more-partners")).toBeTruthy();

    await fireEvent.press(getByTestId("btn-load-more-partners"));
    await waitFor(() => {
      expect(getByText("Hiển thị 7 / 7 đồng đội phù hợp")).toBeTruthy();
    });
    expect(queryByTestId("btn-load-more-partners")).toBeNull();

    // Chuyển sang BXH Elo CLB
    await fireEvent.press(getByTestId("tab-club-leaderboard"));
    await waitFor(() => {
      expect(getByTestId("leaderboard-view")).toBeTruthy();
      expect(getByTestId("leaderboard-row-cand_7")).toBeTruthy();
    });

    await unmount();
  });
});

