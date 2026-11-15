import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import {
  FONT_SCALE_LIMIT,
  getLevelColorToken,
  RADIUS,
  SPACING,
  TYPOGRAPHY,
} from "../theme";

export interface LevelBadgeProps {
  /** Cấp độ trình độ từ 1 đến 6 (Yếu -> Tốt / Bán chuyên) */
  level: number;
  /** Hiển thị dạng ngắn ("TB+") hay đầy đủ ("Cấp 4 · TB+") */
  compact?: boolean;
  /** Style bổ sung */
  style?: ViewStyle;
  /** Định danh kiểm thử */
  testID?: string;
}

/**
 * Huy hiệu hiển thị cấp trình độ phong trào 6 cấp (luôn có chữ, không dựa vào màu đơn thuần).
 */
export const LevelBadge: React.FC<LevelBadgeProps> = ({
  level,
  compact = false,
  style,
  testID,
}) => {
  const token = getLevelColorToken(level);
  const label = compact ? token.name : token.shortLabel;

  return (
    <View
      testID={testID}
      accessibilityLabel={`Trình độ ${token.shortLabel}`}
      style={[
        styles.badge,
        {
          backgroundColor: token.bg,
          borderColor: token.border,
        },
        style,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: token.border }]} />
      <Text
        style={[styles.text, { color: token.text }]}
        allowFontScaling
        maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: RADIUS.pill,
  },
  text: {
    ...TYPOGRAPHY.badge,
  },
});

