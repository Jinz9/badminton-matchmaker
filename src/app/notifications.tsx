import { useRouter } from "expo-router";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  EmptyState,
  Header,
  SecondaryButton,
  Skeleton,
  StatusPill,
} from "../components";
import { NotificationDoc } from "../domain/types";
import { useAuth, useNotifications } from "../hooks";
import { PALETTE, RADIUS, SPACING, TYPOGRAPHY } from "../theme";

const TYPE_META: Record<
  string,
  { label: string; variant: "open" | "live" | "warning" | "closed" }
> = {
  match_reminder: { label: "Nhắc lịch 1h", variant: "live" },
  session_full: { label: "Kèo đủ người", variant: "open" },
  waitlist_promoted: { label: "Đôn Waitlist", variant: "open" },
  request_approved: { label: "Đã duyệt suất", variant: "open" },
  request_declined: { label: "Từ chối đơn", variant: "closed" },
};

function formatNotifTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  return `${hh}:${mm} · ${dd}/${mo}`;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const targetUid = user?.uid ?? null;
  const { notifications, unreadCount, loading, error, refresh, markAsRead } =
    useNotifications(targetUid);

  const handlePressItem = async (item: NotificationDoc) => {
    if (!item.read) {
      try {
        await markAsRead(item.id);
      } catch {
        // Không chặn điều hướng nếu đánh dấu đã đọc lỗi mạng
      }
    }

    const sessionId = item.data?.sessionId;
    if (!sessionId) return;

    const screen = item.data?.screen;
    if (item.type === "session_full" || screen === "court_balancing") {
      router.push({
        pathname: "/court/balance-confirm",
        params: { sessionId },
      } as never);
      return;
    }

    router.push(`/lobby/${sessionId}` as never);
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    await Promise.all(unread.map((n) => markAsRead(n.id).catch(() => {})));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <Header
        title="Thông Báo"
        subtitle={
          unreadCount > 0
            ? `${unreadCount} thông báo chưa đọc`
            : "Đã cập nhật mới nhất"
        }
        onBackPress={() => router.back()}
      />

      <View style={styles.infoBanner}>
        <Text style={styles.infoBannerText}>
          Expo Go: Hỗ trợ nhắc lịch cục bộ trước 1 giờ & Trung tâm thông báo
          realtime. Push từ xa (FCM) cần EAS Development Build.
        </Text>
      </View>

      {unreadCount > 0 ? (
        <View style={styles.actionRow}>
          <SecondaryButton
            label={`Đánh dấu đã đọc tất cả (${unreadCount})`}
            variant="outline"
            onPress={() => void handleMarkAllRead()}
          />
        </View>
      ) : null}

      {loading && notifications.length === 0 ? (
        <View style={styles.skeletonWrap}>
          <Skeleton height={86} />
          <Skeleton height={86} />
          <Skeleton height={86} />
        </View>
      ) : error && notifications.length === 0 ? (
        <View style={styles.centerWrap}>
          <EmptyState
            title="Không tải được thông báo"
            description={error}
            actionLabel="Thử lại"
            onAction={() => void refresh()}
          />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.centerWrap}>
          <EmptyState
            title="Chưa có thông báo nào"
            description="Khi kèo đủ người, có suất trống từ Waitlist hoặc gần giờ đánh, thông báo sẽ hiện tại đây."
          />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => void refresh()}
              tintColor={PALETTE.accent.primary}
            />
          }
          renderItem={({ item }) => {
            const meta = TYPE_META[item.type] ?? {
              label: "Thông báo",
              variant: "live" as const,
            };
            return (
              <Pressable
                testID={`notif-item-${item.id}`}
                accessibilityRole="button"
                onPress={() => void handlePressItem(item)}
                style={[styles.card, !item.read && styles.cardUnread]}
              >
                <View style={styles.cardTop}>
                  <StatusPill variant={meta.variant} label={meta.label} />
                  <View style={styles.timeRow}>
                    <Text style={styles.timeText}>
                      {formatNotifTime(item.createdAt)}
                    </Text>
                    {!item.read ? (
                      <View
                        testID={`notif-unread-dot-${item.id}`}
                        style={styles.unreadDot}
                      />
                    ) : null}
                  </View>
                </View>

                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardBody}>{item.body}</Text>

                {item.data?.sessionId ? (
                  <Text style={styles.linkHint}>Chạm để mở phòng kèo →</Text>
                ) : null}
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PALETTE.bg.canvas,
  },
  infoBanner: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.xs,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: PALETTE.surface.elevated,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
  },
  infoBannerText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
    lineHeight: 18,
  },
  actionRow: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  skeletonWrap: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  centerWrap: {
    flex: 1,
    justifyContent: "center",
    padding: SPACING.lg,
  },
  listContent: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  card: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: PALETTE.surface.card,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    gap: SPACING.xs,
  },
  cardUnread: {
    borderColor: PALETTE.accent.primary,
    backgroundColor: PALETTE.surface.elevated,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.muted,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PALETTE.accent.primary,
  },
  cardTitle: {
    ...TYPOGRAPHY.titleSmall,
    color: PALETTE.text.primary,
  },
  cardBody: {
    ...TYPOGRAPHY.bodySmall,
    color: PALETTE.text.secondary,
    lineHeight: 20,
  },
  linkHint: {
    ...TYPOGRAPHY.labelSmall,
    color: PALETTE.accent.primary,
    marginTop: 2,
  },
});
