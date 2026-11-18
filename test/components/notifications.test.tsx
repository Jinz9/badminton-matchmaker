import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import NotificationsScreen from "../../src/app/notifications";
import { NotificationDoc } from "../../src/domain/types";

const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    replace: jest.fn(),
  }),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
  },
}));

const mockMarkAsRead = jest.fn((_id: string) => Promise.resolve());
const mockRefresh = jest.fn(() => Promise.resolve());
let mockNotificationsData: NotificationDoc[] = [];

jest.mock("../../src/hooks", () => ({
  useAuth: () => ({
    user: { uid: "usr_dat_02", email: "dat@example.com", verified: true },
  }),
  useNotifications: () => ({
    notifications: mockNotificationsData,
    unreadCount: mockNotificationsData.filter((n) => !n.read).length,
    loading: false,
    error: null,
    refresh: mockRefresh,
    markAsRead: mockMarkAsRead,
  }),
}));

describe("Trung tâm Thông báo (Q13)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNotificationsData = [
      {
        id: "n_waitlist",
        userId: "usr_dat_02",
        type: "waitlist_promoted",
        title: "Bạn đã có suất thi đấu chính thức!",
        body: "Bạn đã được đôn từ hàng đợi dự bị lên Sân 1.",
        data: { sessionId: "session_kd_01", courtId: "1" },
        read: false,
        createdAt: "2026-11-18T10:00:00.000Z",
      },
      {
        id: "n_full",
        userId: "usr_dat_02",
        type: "session_full",
        title: "Kèo đấu đã đủ người!",
        body: "Kèo Tuyên Sơn đã đủ quân số.",
        data: { sessionId: "session_ts_02", screen: "court_balancing" },
        read: true,
        createdAt: "2026-11-18T09:00:00.000Z",
      },
    ];
  });

  it("hiển thị danh sách thông báo realtime, trạng thái Expo Go/FCM và điều hướng khi chạm", async () => {
    await render(<NotificationsScreen />);

    expect(screen.getByText("Thông Báo")).toBeTruthy();
    expect(screen.getByText(/1 thông báo chưa đọc/i)).toBeTruthy();
    expect(screen.getByText(/Push từ xa \(FCM\) cần EAS Development Build/i)).toBeTruthy();
    expect(screen.getByText("Bạn đã có suất thi đấu chính thức!")).toBeTruthy();
    expect(screen.getByTestId("notif-unread-dot-n_waitlist")).toBeTruthy();

    // Chạm thông báo waitlist_promoted -> markAsRead + điều hướng sang /lobby/session_kd_01
    fireEvent.press(screen.getByTestId("notif-item-n_waitlist"));
    await waitFor(() => {
      expect(mockMarkAsRead).toHaveBeenCalledWith("n_waitlist");
      expect(mockPush).toHaveBeenCalledWith("/lobby/session_kd_01");
    });

    // Chạm thông báo session_full -> điều hướng sang /court/balance-confirm
    fireEvent.press(screen.getByTestId("notif-item-n_full"));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith({
        pathname: "/court/balance-confirm",
        params: { sessionId: "session_ts_02" },
      });
    });
  });

  it("hiển thị EmptyState khi chưa có thông báo", async () => {
    mockNotificationsData = [];
    await render(<NotificationsScreen />);
    expect(screen.getByText("Chưa có thông báo nào")).toBeTruthy();
  });
});
