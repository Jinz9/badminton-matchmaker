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

import { CreateSessionScreen } from "../../src/app/lobby/create";
import { LobbyDetailScreen } from "../../src/app/lobby/[id]";
import { LobbyListScreen } from "../../src/app/lobby/index";
import { MockRepository, setRepository } from "../../src/data";
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

describe("Q08: Sảnh chờ Danh sách kèo, Tạo kèo (CR-01/02), Chi tiết, Waitlist & Đôn người", () => {
  let repo: MockRepository;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockMemoryStorage.clear();
    repo = new MockRepository({
      minLatencyMs: 0,
      maxLatencyMs: 0,
      errorRate: 0,
    });
    setRepository(repo);
  });

  it("CreateSessionScreen: tính đúng suất tuyển các ca 4, 1, 0 và chặn vượt quá 8 người/sân", async () => {
    const { getByTestId, getByText, unmount } = await render(
      <AuthProvider>
        <CreateSessionScreen />
      </AuthProvider>
    );

    // Mặc định Sân 01 có 4 người mặc định -> 4 suất tuyển
    expect(getByText("Suất tuyển = min(4, 8 - 4) = 4")).toBeTruthy();
    expect(getByText("Mở tuyển 4 vãng lai")).toBeTruthy();

    // Tăng lên 7 người mặc định -> 1 suất tuyển
    const plusBtn = getByTestId("court-1-core-plus");
    await fireEvent.press(plusBtn); // 5
    await fireEvent.press(plusBtn); // 6
    await fireEvent.press(plusBtn); // 7
    expect(getByText("Suất tuyển = min(4, 8 - 7) = 1")).toBeTruthy();

    // Tăng lên 8 người mặc định -> 0 suất tuyển (Đủ 8 người)
    await fireEvent.press(plusBtn); // 8
    expect(getByText("Suất tuyển = min(4, 8 - 8) = 0")).toBeTruthy();
    expect(getByText("Đủ 8 người (Không mở tuyển)")).toBeTruthy();

    // Bấm + lần nữa vượt 8 -> báo lỗi CR-01
    await fireEvent.press(plusBtn);
    expect(getByTestId("create-form-error")).toBeTruthy();

    // Chọn 2 sân (tối đa 16 người)
    await fireEvent.press(getByTestId("btn-court-count-2"));
    expect(getByTestId("court-config-2")).toBeTruthy();

    await unmount();
  });

  it("LobbyListScreen: tải danh sách kèo, lọc theo quận Đà Nẵng & hiển thị trạng thái rỗng", async () => {
    const { getByTestId, unmount } = await render(
      <AuthProvider>
        <LobbyListScreen />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId("lobby-list")).toBeTruthy();
    });

    // Lọc quận Hòa Vang (không có kèo mẫu) -> hiện EmptyState
    await fireEvent.press(getByTestId("filter-district-Hòa Vang"));
    await waitFor(() => {
      expect(getByTestId("lobby-empty")).toBeTruthy();
    });

    await unmount();
  });

  it("LobbyDetailScreen: tham gia kèo còn suất -> đầy chuyển Waitlist -> hủy có cảnh báo uy tín -> đôn người và hiện thông báo", async () => {
    // Tạo kèo mới 1 sân có 7 người mặc định (1 suất tuyển duy nhất!)
    const futureStart = new Date(Date.now() + 4 * 3600 * 1000).toISOString();
    const futureEnd = new Date(Date.now() + 6 * 3600 * 1000).toISOString();
    const sessionId = await repo.createSession({
      hostId: "user_host_01",
      hostName: "Host Test",
      venueName: "Sân Test Q08",
      district: "Hải Châu",
      address: "Hải Châu, Đà Nẵng",
      startsAt: futureStart,
      endsAt: futureEnd,
      courtCount: 1,
      status: "open",
      openSlotsTotal: 1,
      courtSummaries: [
        {
          courtId: "1",
          category: "men",
          levelMin: 1,
          levelMax: 6,
          openSlots: 1,
          recruitOpen: true,
        },
      ],
      isDeleted: false,
    });

    // Thêm 7 nam mặc định (core), giãn 2ms để tránh trùng Date.now()
    for (let i = 1; i <= 7; i++) {
      await repo.addGhostMember(sessionId, "1", {
        displayName: `Core #${i}`,
        gender: "M",
        rating: 1450,
        position: "both",
        dominantHand: "right",
        type: "core",
        isGhost: true,
      } as never);
      await new Promise((r) => setTimeout(r, 2));
    }

    // Lấy 2 user thật từ MockRepository
    const users = await repo.listSessions(); // init store
    expect(users.length).toBeGreaterThan(0);

    // Tạo 2 user nam hợp lệ trong store bằng createProfile
    await repo.createProfile({
      uid: "test_p1",
      displayName: "VĐV Số 1",
      email: "p1@test.local",
      gender: "M",
      dominantHand: "right",
      position: "both",
      areaLabel: "Hải Châu, Đà Nẵng",
      skill: {
        rating: 1450,
        level: 3,
        matchesPlayed: 10,
        wins: 5,
        losses: 5,
        isProvisional: false,
        reliability: 90,
        noShowCount: 0,
        lateCancelCount: 0,
      },
      role: "player",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await repo.createProfile({
      uid: "test_p2",
      displayName: "VĐV Số 2",
      email: "p2@test.local",
      gender: "M",
      dominantHand: "right",
      position: "both",
      areaLabel: "Hải Châu, Đà Nẵng",
      skill: {
        rating: 1450,
        level: 3,
        matchesPlayed: 10,
        wins: 5,
        losses: 5,
        isProvisional: false,
        reliability: 90,
        noShowCount: 0,
        lateCancelCount: 0,
      },
      role: "player",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // User P1 vào nhận suất cuối cùng (suất 1/1 -> vào roster confirmed)
    const viewP1 = await render(
      <AuthProvider>
        <LobbyDetailScreen
          initialSessionId={sessionId}
          currentUserIdOverride="test_p1"
        />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(viewP1.getByTestId("btn-join-court")).toBeTruthy();
    });

    await fireEvent.press(viewP1.getByTestId("btn-join-court"));
    await waitFor(() => {
      expect(viewP1.getByTestId("my-status-pending")).toBeTruthy();
    });

    // Host duyệt đơn của P1 -> P1 vào sân confirmed (8/8 đủ người)
    await repo.reviewRequest(sessionId, "1", `${sessionId}_1_test_p1`, "approve");
    await waitFor(() => {
      expect(viewP1.getByTestId("my-status-confirmed")).toBeTruthy();
    });
    await viewP1.unmount();

    // User P2 vào khi sân đã đầy 8/8 -> tự động vào Waitlist #1
    const viewP2 = await render(
      <AuthProvider>
        <LobbyDetailScreen
          initialSessionId={sessionId}
          currentUserIdOverride="test_p2"
        />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(viewP2.getByTestId("btn-join-court")).toBeTruthy();
    });

    await fireEvent.press(viewP2.getByTestId("btn-join-court"));
    await waitFor(() => {
      expect(viewP2.getByTestId("my-status-waitlist")).toBeTruthy();
      expect(viewP2.getByTestId("waitlist-item-test_p2")).toBeTruthy();
    });
    await viewP2.unmount();

    // User P1 quay lại phòng kèo, bấm hủy tham gia -> hiện cảnh báo phạt uy tín -> xác nhận -> tự đôn P2 & hiện banner!
    const viewP1Cancel = await render(
      <AuthProvider>
        <LobbyDetailScreen
          initialSessionId={sessionId}
          currentUserIdOverride="test_p1"
        />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(viewP1Cancel.getByTestId("btn-cancel-participation")).toBeTruthy();
    });

    await fireEvent.press(viewP1Cancel.getByTestId("btn-cancel-participation"));
    await waitFor(() => {
      expect(viewP1Cancel.getByTestId("cancel-penalty-warning")).toBeTruthy();
    });

    await fireEvent.press(viewP1Cancel.getByTestId("btn-confirm-cancel-join"));
    await waitFor(() => {
      expect(viewP1Cancel.getByTestId("waitlist-promotion-banner")).toBeTruthy();
    });

    await viewP1Cancel.unmount();
  });
});

