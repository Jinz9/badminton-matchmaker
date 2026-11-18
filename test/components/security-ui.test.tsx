import { render, screen, waitFor } from "@testing-library/react-native";
import ProfileScreen from "../../src/app/(tabs)/profile";
import { LobbyDetailScreen } from "../../src/app/lobby/[id]";
import { MockRepository } from "../../src/data/MockRepository";
import { setRepository } from "../../src/data";

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  }),
  useLocalSearchParams: () => ({ id: "session_kd_01" }),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
  },
}));

const mockPlayerProfile = {
  uid: "usr_dat_02",
  displayName: "Nguyễn Đức Đạt",
  gender: "M" as const,
  areaLabel: "Hải Châu",
  position: "both" as const,
  dominantHand: "right" as const,
  selfDeclaredLevel: 3 as const,
  role: "player" as const,
  skill: {
    rating: 1425,
    matchesPlayed: 4,
    reliability: 95,
    isProvisional: true,
  },
  fcmTokens: [],
  schemaVersion: 1,
  isDeleted: false,
  createdAt: "2026-11-01T00:00:00.000Z",
  updatedAt: "2026-11-01T00:00:00.000Z",
};

jest.mock("../../src/hooks/AuthProvider", () => ({
  useAuth: () => ({
    status: "ready",
    user: { uid: "usr_dat_02", email: "dat@example.com", verified: true },
    profile: mockPlayerProfile,
    signOut: jest.fn(),
    refreshProfile: jest.fn(),
  }),
}));

describe("Bảo mật giao diện & Phân quyền UI (TC-081, TC-082)", () => {
  beforeEach(() => {
    setRepository(new MockRepository({ minLatencyMs: 0, maxLatencyMs: 0, errorRate: 0 }));
  });

  it("TC-081: Người chơi thường không thể chỉnh sửa điểm Elo hay role trên màn Hồ sơ", async () => {
    await render(<ProfileScreen />);

    expect(screen.getByText("Nguyễn Đức Đạt")).toBeTruthy();
    expect(screen.getByText(/1425/)).toBeTruthy();
    // Không có input hay nút cho phép sửa Elo hoặc nâng quyền Admin
    expect(screen.queryByPlaceholderText(/Elo/i)).toBeNull();
    expect(screen.queryByText(/Đổi vai trò|Chỉnh sửa Elo|Nâng quyền/i)).toBeNull();
  });

  it("TC-082: Người chơi không phải Host không thấy nút quản lý kèo, duyệt vãng lai hay hủy kèo", async () => {
    await render(
      <LobbyDetailScreen
        initialSessionId="session_kd_01"
        currentUserIdOverride="usr_vy_07"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Sân Cầu Lông Kỳ Đồng/i)).toBeTruthy();
    });

    // Người không phải host không thấy các nút quản trị của Host
    expect(screen.queryByText("Thêm người mặc định")).toBeNull();
    expect(screen.queryByText("Hủy kèo")).toBeNull();
    expect(screen.queryByText("Duyệt")).toBeNull();
    expect(screen.queryByText("Từ chối")).toBeNull();
  });
});
