import {
  buildMatchReminderContent,
  cancelSessionReminder,
  getScheduledReminderId,
  requestNotificationPermission,
  scheduleSessionReminder,
} from "../../src/data/notifications";

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

const mockGetPermissionsAsync = jest.fn();
const mockRequestPermissionsAsync = jest.fn();
const mockSetNotificationChannelAsync = jest.fn();
const mockScheduleNotificationAsync = jest.fn();
const mockCancelScheduledNotificationAsync = jest.fn();

jest.mock("expo-notifications", () => ({
  __esModule: true,
  AndroidImportance: { HIGH: 4 },
  SchedulableTriggerInputTypes: { DATE: "date" },
  getPermissionsAsync: (...args: unknown[]) => mockGetPermissionsAsync(...args),
  requestPermissionsAsync: (...args: unknown[]) =>
    mockRequestPermissionsAsync(...args),
  setNotificationChannelAsync: (...args: unknown[]) =>
    mockSetNotificationChannelAsync(...args),
  scheduleNotificationAsync: (...args: unknown[]) =>
    mockScheduleNotificationAsync(...args),
  cancelScheduledNotificationAsync: (...args: unknown[]) =>
    mockCancelScheduledNotificationAsync(...args),
}));

describe("Local Match Reminder Notifications (Q13)", () => {
  beforeEach(() => {
    memoryStorage.clear();
    jest.clearAllMocks();
    mockGetPermissionsAsync.mockResolvedValue({ status: "granted" });
    mockRequestPermissionsAsync.mockResolvedValue({ status: "granted" });
    mockSetNotificationChannelAsync.mockResolvedValue(undefined);
    mockScheduleNotificationAsync.mockResolvedValue("local_notif_1");
    mockCancelScheduledNotificationAsync.mockResolvedValue(undefined);
  });

  it("xin quyền thông báo khi chưa được cấp quyền trước đó", async () => {
    mockGetPermissionsAsync.mockResolvedValueOnce({ status: "undetermined" });
    mockRequestPermissionsAsync.mockResolvedValueOnce({ status: "granted" });

    const granted = await requestNotificationPermission();
    expect(granted).toBe(true);
    expect(mockRequestPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(mockSetNotificationChannelAsync).toHaveBeenCalledWith(
      "badminton-reminders",
      expect.objectContaining({ name: "Nhắc lịch đấu cầu lông" })
    );
  });

  it("hẹn giờ nhắc đúng 1 giờ trước giờ đánh với mẫu tiếng Việt TV1 và hủy khi rời kèo", async () => {
    const startsAt = "2026-11-20T19:00:00.000Z";
    const nowMs = new Date("2026-11-20T15:00:00.000Z").getTime(); // Trước 4 tiếng

    const session = {
      id: "sess_kd_1",
      venueName: "Sân Cầu Lông Kỳ Đồng",
      startsAt,
    };

    const res = await scheduleSessionReminder(session, nowMs);
    expect(res.scheduled).toBe(true);
    expect(res.notificationId).toBe("local_notif_1");
    expect(res.triggerAt).toBe("2026-11-20T18:00:00.000Z");

    const expectedContent = buildMatchReminderContent(session);
    expect(expectedContent.title).toContain("Sắp đến giờ ra sân");
    expect(expectedContent.body).toContain("Sân Cầu Lông Kỳ Đồng");
    expect(expectedContent.data).toEqual({
      screen: "lobby_detail",
      sessionId: "sess_kd_1",
      type: "match_reminder",
    });

    expect(mockScheduleNotificationAsync).toHaveBeenCalledWith({
      content: expectedContent,
      trigger: {
        type: "date",
        date: new Date("2026-11-20T18:00:00.000Z"),
      },
    });
    expect(await getScheduledReminderId("sess_kd_1")).toBe("local_notif_1");

    // Đặt lại cho cùng sessionId -> hủy lịch cũ trước khi đặt lịch mới
    mockScheduleNotificationAsync.mockResolvedValueOnce("local_notif_2");
    await scheduleSessionReminder(session, nowMs);
    expect(mockCancelScheduledNotificationAsync).toHaveBeenCalledWith(
      "local_notif_1"
    );
    expect(await getScheduledReminderId("sess_kd_1")).toBe("local_notif_2");

    // Rời kèo -> hủy hẹn lịch
    const cancelled = await cancelSessionReminder("sess_kd_1");
    expect(cancelled).toBe(true);
    expect(mockCancelScheduledNotificationAsync).toHaveBeenCalledWith(
      "local_notif_2"
    );
    expect(await getScheduledReminderId("sess_kd_1")).toBeNull();
  });

  it("không hẹn giờ nếu thời điểm nhắc (trước 1h) đã trôi qua", async () => {
    const startsAt = "2026-11-20T19:00:00.000Z";
    const nowMs = new Date("2026-11-20T18:30:00.000Z").getTime(); // Chỉ còn 30 phút

    const res = await scheduleSessionReminder(
      { id: "sess_late", venueName: "Sân Tiên Sơn", startsAt },
      nowMs
    );
    expect(res.scheduled).toBe(false);
    expect(res.reason).toBe("PAST_TRIGGER");
    expect(mockScheduleNotificationAsync).not.toHaveBeenCalled();
  });
});
