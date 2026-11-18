import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOfflineSync } from "../hooks";
import { PALETTE, RADIUS, SPACING, TYPOGRAPHY } from "../theme";

export function OfflineBanner() {
  const insets = useSafeAreaInsets();
  const { isOnline, pendingCount, syncing, lastConflict, syncNow } =
    useOfflineSync();

  if (isOnline && pendingCount === 0 && !lastConflict) {
    return null;
  }

  return (
    <View
      testID="offline-banner"
      style={[
        styles.container,
        { paddingTop: Math.max(insets.top, SPACING.xs) },
        !isOnline ? styles.offlineBg : styles.syncBg,
      ]}
    >
      <View style={styles.row}>
        <View style={styles.textWrap}>
          <Text style={styles.title}>
            {!isOnline
              ? "Đang ngoại tuyến"
              : syncing
                ? "Đang đồng bộ dữ liệu..."
                : "Có dữ liệu chờ đồng bộ"}
          </Text>
          <Text style={styles.subtitle}>
            {!isOnline
              ? `Vẫn chia cặp & nhập tỷ số bình thường · ${pendingCount} thao tác chờ đồng bộ`
              : lastConflict
                ? lastConflict.message
                : `${pendingCount} thao tác đang chờ gửi lên máy chủ`}
          </Text>
        </View>
        {isOnline && pendingCount > 0 && !syncing ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => void syncNow()}
            style={styles.syncButton}
          >
            <Text style={styles.syncButtonText}>Đồng bộ</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.14)",
  },
  offlineBg: {
    backgroundColor: "#92400E",
  },
  syncBg: {
    backgroundColor: "#065F46",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.sm,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    ...TYPOGRAPHY.labelSmall,
    color: PALETTE.text.primary,
    fontWeight: "700",
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    color: "rgba(255,255,255,0.88)",
    marginTop: 1,
  },
  syncButton: {
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  syncButtonText: {
    ...TYPOGRAPHY.labelSmall,
    color: PALETTE.text.primary,
    fontWeight: "700",
  },
});
