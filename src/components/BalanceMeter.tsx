import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { FONT_SCALE_LIMIT, PALETTE, RADIUS, SPACING, TYPOGRAPHY } from "../theme";

export interface BalanceMeterProps {
  /** Tỷ lệ thắng dự đoán của Đội A (0..100), Đội B tự tính = 100 - teamAPercent */
  teamAPercent: number;
  /** Chênh lệch Elo tuyệt đối giữa 2 đội */
  eloDiff?: number;
  /** Nhãn đánh giá độ cân bằng (ví dụ: "Kèo cân bằng tối ưu") */
  statusLabel?: string;
  /** Style bổ sung */
  style?: ViewStyle;
  /** Định danh kiểm thử */
  testID?: string;
}

/**
 * Thanh cân bằng kèo với phần trăm 2 đội (ví dụ 51% vs 49%) và chênh lệch Elo.
 */
export const BalanceMeter: React.FC<BalanceMeterProps> = ({
  teamAPercent,
  eloDiff,
  statusLabel,
  style,
  testID,
}) => {
  const clampedA = Math.min(95, Math.max(5, Math.round(teamAPercent)));
  const clampedB = 100 - clampedA;
  const isBalanced = Math.abs(clampedA - 50) <= 10;

  return (
    <View
      testID={testID}
      accessibilityLabel={`Tỷ lệ cân bằng Đội A ${clampedA} phần trăm, Đội B ${clampedB} phần trăm${
        typeof eloDiff === "number" ? `, lệch ${eloDiff} Elo` : ""
      }`}
      style={[styles.container, style]}
    >
      <View style={styles.topRow}>
        <Text
          style={[styles.percentText, { color: PALETTE.teamA.cyan }]}
          allowFontScaling
          maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
        >
          Đội A {clampedA}%
        </Text>
        <Text
          style={[
            styles.statusText,
            { color: isBalanced ? PALETTE.brand.neonGlow : PALETTE.teamB.amber },
          ]}
          allowFontScaling
          maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
        >
          {statusLabel ?? (isBalanced ? "Cân bằng tối ưu" : "Có chênh lệch")}
        </Text>
        <Text
          style={[styles.percentText, { color: PALETTE.teamB.amber }]}
          allowFontScaling
          maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
        >
          {clampedB}% Đội B
        </Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.fillA, { flex: clampedA }]} />
        <View style={styles.divider} />
        <View style={[styles.fillB, { flex: clampedB }]} />
      </View>

      {typeof eloDiff === "number" ? (
        <Text
          style={styles.diffCaption}
          allowFontScaling
          maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
        >
          Chênh lệch sức mạnh: {Math.round(eloDiff)} Elo
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: PALETTE.surface.elevated,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    padding: SPACING.sm + 4,
    gap: SPACING.sm,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.xs,
  },
  percentText: {
    ...TYPOGRAPHY.caption,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  statusText: {
    ...TYPOGRAPHY.badge,
  },
  track: {
    height: 10,
    borderRadius: RADIUS.pill,
    overflow: "hidden",
    flexDirection: "row",
    backgroundColor: PALETTE.surface.interactive,
  },
  fillA: {
    backgroundColor: PALETTE.teamA.button,
  },
  divider: {
    width: 2,
    backgroundColor: PALETTE.bg.canvas,
  },
  fillB: {
    backgroundColor: PALETTE.teamB.amber,
  },
  diffCaption: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: PALETTE.text.muted,
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
});

