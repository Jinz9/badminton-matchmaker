import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { CourtHomeScreen } from "../../src/app/court/index";
import { SelectPlayersScreen } from "../../src/app/court/select-players";
import { getRepository } from "../../src/data";
import { RosterMember } from "../../src/domain/types";
import { AuthProvider } from "../../src/hooks";
import {
  getTapCounterState,
  recordOnCourtTap,
  resetTapCounter,
} from "../../src/utils/tapCounter";

const mockPush = jest.fn();
const mockBack = jest.fn();
let mockSearchParams: Record<string, string> = {};

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: mockBack,
  }),
  useLocalSearchParams: () => mockSearchParams,
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
  },
}));

function buildTenMockCandidates(): RosterMember[] {
  return [
    {
      memberId: "p1",
      displayName: "Hoàng Anh",
      gender: "M",
      type: "core",
      rating: 1520,
      level: 4,
      position: "back",
      dominantHand: "right",
      isGhost: false,
      checkedIn: true,
      joinedAt: "2026-11-15T06:00:00.000Z",
    },
    {
      memberId: "p2",
      displayName: "Thảo Vy",
      gender: "F",
      type: "core",
      rating: 1380,
      level: 2,
      position: "front",
      dominantHand: "right",
      isGhost: false,
      checkedIn: true,
      joinedAt: "2026-11-15T06:01:00.000Z",
    },
    {
      memberId: "p3",
      displayName: "Đức Mạnh",
      gender: "M",
      type: "core",
      rating: 1470,
      level: 4,
      position: "both",
      dominantHand: "right",
      isGhost: false,
      checkedIn: true,
      joinedAt: "2026-11-15T06:02:00.000Z",
    },
    {
      memberId: "p4",
      displayName: "Khánh Linh",
      gender: "F",
      type: "core",
      rating: 1400,
      level: 3,
      position: "front",
      dominantHand: "right",
      isGhost: false,
      checkedIn: true,
      joinedAt: "2026-11-15T06:03:00.000Z",
    },
    {
      memberId: "p5",
      displayName: "Tuấn Kiệt",
      gender: "M",
      type: "recruit",
      rating: 1390,
      level: 3,
      position: "back",
      dominantHand: "right",
      isGhost: false,
      checkedIn: true,
      joinedAt: "2026-11-15T06:04:00.000Z",
    },
    {
      memberId: "p6",
      displayName: "Bảo Trâm",
      gender: "F",
      type: "recruit",
      rating: 1180,
      level: 1,
      position: "front",
      dominantHand: "right",
      isGhost: false,
      checkedIn: true,
      joinedAt: "2026-11-15T06:05:00.000Z",
    },
    {
      memberId: "p7",
      displayName: "Đào Duy Nhật",
      gender: "M",
      type: "core",
      rating: 1425,
      level: 3,
      position: "back",
      dominantHand: "right",
      isGhost: false,
      checkedIn: true,
      joinedAt: "2026-11-15T06:06:00.000Z",
    },
    {
      memberId: "p8",
      displayName: "Nguyễn Đức Đạt",
      gender: "M",
      type: "recruit",
      rating: 1575,
      level: 4,
      position: "front",
      dominantHand: "left",
      isGhost: false,
      checkedIn: true,
      joinedAt: "2026-11-15T06:07:00.000Z",
    },
    {
      memberId: "p9",
      displayName: "Lê Quang Minh",
      gender: "M",
      type: "core",
      rating: 1750,
      level: 5,
      position: "back",
      dominantHand: "right",
      isGhost: false,
      checkedIn: true,
      joinedAt: "2026-11-15T06:08:00.000Z",
    },
  ];
}

describe("Q05: Màn 01 Home Sân Đấu (Chạm 1) & Màn 02 Chọn Người & Cân Trình (Chạm 2)", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockMemoryStorage.clear();
    mockSearchParams = {};
    resetTapCounter();
    const repo = getRepository();
    repo.setMockConfig?.({ minLatencyMs: 0, maxLatencyMs: 0, errorRate: 0 });
    await repo.resetMockData?.();
  });

  it("Màn 01 hiển thị đúng Figma: Header sân, thông tin kèo LIVE, Sân 01 trống + CTA 58px, Sân 02 đang đấu + tỷ số, 6 chip chờ, 4 tab và cưỡng chế tối đa 2 sân/kèo (CR-01)", async () => {
    const screen = await render(
      <AuthProvider>
        <CourtHomeScreen initialSessionId="session_tienson_05" showBottomTabBar />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("court-card-1")).toBeTruthy();
    });

    // Header tên sân & trạng thái LIVE
    expect(screen.getByText(/Sân Cầu Lông Tiên Sơn - Đà Nẵng/i)).toBeTruthy();
    expect(screen.getByText(/LIVE • ĐANG HOẠT ĐỘNG/i)).toBeTruthy();

    // Cưỡng chế CR-01: Tối đa 2 sân/kèo, không hiển thị sân thứ 3
    expect(screen.getByTestId("court-card-1")).toBeTruthy();
    expect(screen.getByTestId("court-card-2")).toBeTruthy();
    expect(screen.queryByTestId("court-card-3")).toBeNull();
    expect(screen.getByTestId("session-court-count-label")).toBeTruthy();

    // Sân 02 tỷ số trực tiếp 18 - 15
    expect(screen.getByTestId("court-2-live-score")).toBeTruthy();
    expect(screen.getByText("18")).toBeTruthy();
    expect(screen.getByText("15")).toBeTruthy();

    // Hàng đợi chờ 6 chip nhanh
    for (let i = 0; i < 6; i++) {
      expect(screen.getByTestId(`waiting-chip-${i}`)).toBeTruthy();
    }

    // Thanh điều hướng dưới 4 tab
    expect(screen.getByTestId("court-bottom-tab-bar")).toBeTruthy();

    // Bấm nút lớn "Bắt đầu chia" trên Sân 01 -> Ghi nhận Chạm 1 và chuyển sang Màn 02
    await fireEvent.press(screen.getByTestId("start-divide-court-1-btn"));
    expect(getTapCounterState().currentTaps).toBe(1);
    expect(mockPush).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: "/court/select-players",
      })
    );

    await screen.unmount();
  });

  it("Màn 02 chọn đủ 4 người cập nhật đồng hồ cân bằng trực tiếp, hỗ trợ bỏ chọn từng ô và nút Xóa hết", async () => {
    const candidates = buildTenMockCandidates();
    const screen = await render(
      <AuthProvider>
        <SelectPlayersScreen
          candidatesOverride={candidates}
          initialSelectedIds={["p1", "p2", "p3"]}
        />
      </AuthProvider>
    );

    // Khi mới chọn 3 người (< 4), nút XEM KÈO CÂN BẰNG bị vô hiệu & hiện hộp chờ đủ 4 người
    expect(screen.getByTestId("balance-pending-box")).toBeTruthy();

    // Chọn người thứ 4 (p4 - Khánh Linh) -> Đồng hồ cân bằng trực tiếp lập tức hiển thị kết quả từ hàm thuần balanceCourt
    await fireEvent.press(screen.getByTestId("grid-player-p4"));
    expect(screen.queryByTestId("balance-pending-box")).toBeNull();
    expect(screen.getByTestId("live-balance-preview-teams")).toBeTruthy();

    // Xóa 1 ô đã chọn (remove-slot-0) -> còn 3 người -> quay về trạng thái chờ đủ 4 người
    await fireEvent.press(screen.getByTestId("remove-slot-0"));
    expect(screen.getByTestId("balance-pending-box")).toBeTruthy();

    // Bấm nút "Xóa hết" -> toàn bộ 4 ô trống
    await fireEvent.press(screen.getByTestId("clear-all-slots-btn"));
    expect(screen.getByText(/Đã chọn 0\/8 VĐV/i)).toBeTruthy();

    await screen.unmount();
  });

  it("Màn 02 xử lý ca lẻ 5 và 7 người hiển thị người nghỉ luân phiên, và chặn chọn quá 8 người/sân kèm thông báo lỗi thân thiện (CR-01)", async () => {
    const candidates = buildTenMockCandidates();
    const screen = await render(
      <AuthProvider>
        <SelectPlayersScreen
          candidatesOverride={candidates}
          initialSelectedIds={["p1", "p2", "p3", "p4"]}
        />
      </AuthProvider>
    );

    // 1. Ca lẻ 5 người -> hiển thị 1 người nghỉ luân phiên
    await fireEvent.press(screen.getByTestId("preset-5-btn"));
    expect(screen.getByTestId("resting-players-box")).toBeTruthy();
    expect(
      screen.getByText(/Người nghỉ luân phiên hiệp 1 \(1 người • Ca lẻ 5 người\)/i)
    ).toBeTruthy();

    // 2. Ca lẻ 7 người -> hiển thị 3 người nghỉ luân phiên
    await fireEvent.press(screen.getByTestId("preset-7-btn"));
    expect(
      screen.getByText(/Người nghỉ luân phiên hiệp 1 \(3 người • Ca lẻ 7 người\)/i)
    ).toBeTruthy();

    // 3. Chọn đủ tối đa 8 người/sân
    await fireEvent.press(screen.getByTestId("preset-8-btn"));
    expect(screen.getByText(/Đã chọn 8\/8 VĐV/i)).toBeTruthy();

    // 4. Bấm chọn thêm người thứ 9 (p9) -> Bị chặn và hiển thị cảnh báo thân thiện không vượt quá 8 người/sân
    await fireEvent.press(screen.getByTestId("grid-player-p9"));
    expect(screen.getByTestId("over-limit-error-banner")).toBeTruthy();
    expect(
      screen.getAllByText(/Không thể chọn quá 8 người một sân/i).length
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Đã chọn 8\/8 VĐV/i)).toBeTruthy();

    await screen.unmount();
  });

  it("Màn 02 hiển thị trạng thái rỗng khi danh sách tham gia kèo trống và mở/đóng được Modal Hồ Sơ Người Chơi", async () => {
    const emptyScreen = await render(
      <AuthProvider>
        <SelectPlayersScreen
          candidatesOverride={[]}
          initialSelectedIds={[]}
        />
      </AuthProvider>
    );

    expect(
      emptyScreen.getByText(/Chưa có người chơi trong kèo/i)
    ).toBeTruthy();
    await emptyScreen.unmount();

    // Kiểm tra Modal Hồ sơ người chơi (Điểm Elo, thống kê 75%, độ ổn định, nút thu gọn)
    const candidates = buildTenMockCandidates();
    const screen = await render(
      <AuthProvider>
        <SelectPlayersScreen
          candidatesOverride={candidates}
          initialSelectedIds={["p1", "p2", "p3", "p4"]}
        />
      </AuthProvider>
    );

    await fireEvent.press(screen.getByTestId("open-profile-p1"));
    expect(screen.getByTestId("player-profile-modal")).toBeTruthy();
    expect(screen.getByText(/75%/i)).toBeTruthy();
    expect(screen.getByText(/Độ ổn định: Phong độ cao/i)).toBeTruthy();

    await fireEvent.press(screen.getByTestId("close-profile-modal-btn"));
    expect(screen.queryByTestId("player-profile-modal")).toBeNull();

    await screen.unmount();
  });

  it("Test hiệu năng & Luồng tối đa 3 chạm: bấm chọn/bỏ chọn liên tục 20 lần không giật và hoàn tất đủ 3 chạm", async () => {
    const candidates = buildTenMockCandidates();
    recordOnCourtTap("home", "CHIA KÈO SÂN 1 [CHẠM 1]");

    const screen = await render(
      <AuthProvider>
        <SelectPlayersScreen
          candidatesOverride={candidates}
          initialSelectedIds={["p1", "p2", "p3", "p4"]}
        />
      </AuthProvider>
    );

    const startMs = Date.now();
    for (let i = 0; i < 10; i++) {
      await fireEvent.press(screen.getByTestId("grid-player-p5"));
      await fireEvent.press(screen.getByTestId("grid-player-p5"));
    }
    const elapsedMs = Date.now() - startMs;

    // 20 lần bấm chọn/bỏ chọn kèm tính toán balanceCourt trực tiếp hoàn tất mượt mà (< 1500ms trong môi trường Jest)
    expect(elapsedMs).toBeLessThan(1500);
    expect(screen.getByText(/Đã chọn 4\/8 VĐV/i)).toBeTruthy();

    // Bấm Chạm 2: XEM KÈO CÂN BẰNG
    await fireEvent.press(screen.getByTestId("confirm-select-players-btn"));
    expect(getTapCounterState().currentTaps).toBe(2);
    expect(screen.getByTestId("balanced-match-plan-sheet")).toBeTruthy();

    // Bấm Chạm 3: VÀO SÂN NGAY -> Đúng 3 chạm từ Home đến phương án chia kèo hoàn chỉnh
    await fireEvent.press(screen.getByTestId("confirm-tap-3-enter-court-btn"));
    const tapState = getTapCounterState();
    expect(tapState.currentTaps).toBe(3);
    expect(tapState.withinTarget).toBe(true);

    await screen.unmount();
  });
});

