/**
 * Quản lý thông báo cục bộ (Local Scheduled Notification) bằng expo-notifications.
 * Phục vụ nhắc lịch 1 giờ trước giờ đánh trên Expo Go (theo docs/api/notifications.md).
 *
 * Ghi chú: Push từ xa qua FCM cần EAS Development Build; bản Expo Go chỉ dùng
 * thông báo cục bộ hẹn giờ 1h + Trung tâm thông báo realtime trong app.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { SessionDoc } from "../../domain/types";

const REMINDERS_STORAGE_KEY = "@badminton/local_reminders_v1";
const ONE_HOUR_MS = 60 * 60 * 1000;

export interface ScheduleReminderResult {
  scheduled: boolean;
  notificationId?: string;
  triggerAt?: string;
  reason?: "PERMISSION_DENIED" | "PAST_TRIGGER" | "UNAVAILABLE";
}

function getNotificationsModule(): typeof import("expo-notifications") | null {
  try {
    return require("expo-notifications") as typeof import("expo-notifications");
  } catch {
    return null;
  }
}

async function readReminderMap(): Promise<Record<string, string>> {
  try {
    const raw = await AsyncStorage.getItem(REMINDERS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, string>)
      : {};
  } catch {
    return {};
  }
}

async function writeReminderMap(map: Record<string, string>): Promise<void> {
  try {
    await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore storage errors
  }
}

export function formatSessionStartTimeVi(startsAt: string): string {
  const date = new Date(startsAt);
  if (Number.isNaN(date.getTime())) return startsAt;
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function buildMatchReminderContent(session: {
  id: string;
  venueName: string;
  startsAt: string;
}) {
  const timeStr = formatSessionStartTimeVi(session.startsAt);
  return {
    title: "🏸 Sắp đến giờ ra sân giao lưu!",
    body: `Kèo cầu lông tại ${session.venueName} sẽ bắt đầu lúc ${timeStr}. Bạn nhớ chuẩn bị vợt và có mặt đúng giờ nhé!`,
    data: {
      screen: "lobby_detail",
      sessionId: session.id,
      type: "match_reminder",
    },
  };
}

/**
 * Xin quyền hiển thị thông báo trên thiết bị (iOS & Android).
 */
export async function requestNotificationPermission(): Promise<boolean> {
  const Notifications = getNotificationsModule();
  if (!Notifications) return false;

  try {
    if (Notifications.setNotificationChannelAsync) {
      await Notifications.setNotificationChannelAsync("badminton-reminders", {
        name: "Nhắc lịch đấu cầu lông",
        importance: Notifications.AndroidImportance?.HIGH ?? 4,
      });
    }

    const current = await Notifications.getPermissionsAsync();
    if (current.status === "granted") return true;

    const asked = await Notifications.requestPermissionsAsync();
    return asked.status === "granted";
  } catch {
    return false;
  }
}

/**
 * Đặt lịch thông báo cục bộ nhắc trước giờ đánh 1 tiếng.
 * Nếu đã có lịch cũ cho cùng sessionId sẽ tự hủy lịch cũ trước khi đặt lại.
 */
export async function scheduleSessionReminder(
  session: Pick<SessionDoc, "id" | "venueName" | "startsAt">,
  nowMs: number = Date.now()
): Promise<ScheduleReminderResult> {
  const Notifications = getNotificationsModule();
  if (!Notifications?.scheduleNotificationAsync) {
    return { scheduled: false, reason: "UNAVAILABLE" };
  }

  const startMs = new Date(session.startsAt).getTime();
  const triggerMs = startMs - ONE_HOUR_MS;
  if (Number.isNaN(startMs) || triggerMs <= nowMs) {
    return { scheduled: false, reason: "PAST_TRIGGER" };
  }

  const granted = await requestNotificationPermission();
  if (!granted) {
    return { scheduled: false, reason: "PERMISSION_DENIED" };
  }

  // Hủy lịch cũ nếu đã từng hẹn cho kèo này
  await cancelSessionReminder(session.id);

  const content = buildMatchReminderContent(session);
  const triggerDate = new Date(triggerMs);

  const notificationId = await Notifications.scheduleNotificationAsync({
    content,
    trigger: {
      type:
        Notifications.SchedulableTriggerInputTypes?.DATE ?? ("date" as never),
      date: triggerDate,
    },
  });

  const map = await readReminderMap();
  map[session.id] = notificationId;
  await writeReminderMap(map);

  return {
    scheduled: true,
    notificationId,
    triggerAt: triggerDate.toISOString(),
  };
}

/**
 * Hủy thông báo nhắc lịch cục bộ khi người chơi rút đơn / rời kèo.
 */
export async function cancelSessionReminder(sessionId: string): Promise<boolean> {
  const map = await readReminderMap();
  const existingId = map[sessionId];
  if (!existingId) return false;

  const Notifications = getNotificationsModule();
  try {
    if (Notifications?.cancelScheduledNotificationAsync) {
      await Notifications.cancelScheduledNotificationAsync(existingId);
    }
  } catch {
    // ignore
  }

  delete map[sessionId];
  await writeReminderMap(map);
  return true;
}

export async function getScheduledReminderId(
  sessionId: string
): Promise<string | null> {
  const map = await readReminderMap();
  return map[sessionId] ?? null;
}
