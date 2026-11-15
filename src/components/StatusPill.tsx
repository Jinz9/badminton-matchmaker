import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import {
  FONT_SCALE_LIMIT,
  PALETTE,
  RADIUS,
  SPACING,
  TYPOGRAPHY,
} from "../theme";

export type StatusPillVariant = "live" | "playing" | "empty" | "warning";

export interface StatusPillProps {
  /** Trạng thái sân / kèo */
  variant: StatusPillVariant;
  /** Nhãn chữ tiếng Việt hiển thị cạnh chấm trạng thái */
  label: string;
  /** Style bổ sung */
  style?: ViewStyle;
  /** Định danh kiểm thử */
  testID?: string;
}

const STATUS_MAP: Record<
  StatusPillVariant,
  { bg: string; border: string; dot: string; text: string }
> = {
  live: {
    bg: PALETTE.brand.neonSurface,
    border: PALETTE.brand.neonLime,
    dot: PALETTE.brand.neonGlow,
    text: PALETTE.brand.neonGlow,
  },
  playing: {
    bg: PALETTE.teamA.surface,
    border: PALETTE.teamA.cyan,
    dot: PALETTE.teamA.cyan,
    text: PALETTE.teamA.cyan,
  },
  empty: {
    bg: PALETTE.surface.interactive,
    border: PALETTE.border.strong,
    dot: PALETTE.text.muted,
    text: PALETTE.text.primary,
  },
  warning: {
    bg: PALETTE.teamB.surface,
    border: PALETTE.teamB.amber,
    dot: PALETTE.teamB.amber,
    text: PALETTE.teamB.amberLight,
  },
};

/**
 * Nhãn trạng thái dạng pill (Đang hoạt động / Đang đánh / Đang trống / Chờ duyệt).
 */
export const StatusPill: React.FC<StatusPillProps> = ({
  variant,
  label,
  style,
  testID,
}) => {
  const palette = STATUS_MAP[variant] ?? STATUS_MAP.live;

  return (
    <View
      testID={testID}
      accessibilityLabel={label}
      style={[
        styles.pill,
        { backgroundColor: palette.bg, borderColor: palette.border },
        style,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: palette.dot }]} />
      <Text
        style={[styles.text, { color: palette.text }]}
        allowFontScaling
        maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: RADIUS.pill,
  },
  text: {
    ...TYPOGRAPHY.badge,
  },
});

