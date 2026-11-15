import { useCallback, useEffect, useState } from "react";
import { getRepository } from "../data";
import { NotificationDoc } from "../domain/types";

export interface UseNotificationsResult {
  notifications: NotificationDoc[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
}

/** Hook quản lý thông báo realtime (đôn waitlist, duyệt đơn, đổi lịch...) */
export function useNotifications(
  userId: string | null | undefined
): UseNotificationsResult {
  const [notifications, setNotifications] = useState<NotificationDoc[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await getRepository().listNotifications(userId, 30);
      setNotifications(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải thông báo.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
    if (!userId) return;
    const unsub = getRepository().subscribe<NotificationDoc[]>(
      "notifications",
      (all) => {
        setNotifications(
          all
            .filter((n) => n.userId === userId)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        );
      }
    );
    return unsub;
  }, [userId, refresh]);

  const markAsRead = useCallback(async (notificationId: string) => {
    await getRepository().markAsRead(notificationId);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, loading, error, refresh, markAsRead };
}

