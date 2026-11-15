import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { FONT_SCALE_LIMIT, PALETTE, SPACING, TOUCH, TYPOGRAPHY } from "../theme";

export interface SectionHeaderProps {
  /** Tiêu đề chính của mục */
  title: string;
  /** Mô tả ngắn bên dưới tiêu đề */
  subtitle?: string;
  /** Nhãn nút hành động bên phải (ví dụ "Xem tất cả") */
  actionLabel?: string;
  /** Hàm xử lý khi nhấn nút hành động */
  onActionPress?: () => void;
  /** Style bổ sung */
  style?: ViewStyle;
  /** Định danh kiểm thử */
  testID?: string;
}

/**
 * Tiêu đề phân vùng nội dung kèm nút hành động tùy chọn bên phải.
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionLabel,
  onActionPress,
  style,
  testID,
}) => (
  <View testID={testID} style={[styles.container, style]}>
    <View style={styles.left}>
      <Text
        style={styles.title}
        allowFontScaling
        maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={styles.subtitle}
          allowFontScaling
          maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>

    {actionLabel && onActionPress ? (
      <Pressable
        onPress={onActionPress}
        accessibilityRole="button"
        accessibilityLabel={actionLabel}
        hitSlop={8}
        style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}
      >
        <Text
          style={styles.actionText}
          allowFontScaling
          maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
        >
          {actionLabel}
        </Text>
      </Pressable>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.sm,
  },
  left: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...TYPOGRAPHY.cardTitle,
    color: PALETTE.text.primary,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.muted,
  },
  actionBtn: {
    minHeight: TOUCH.minTarget - 12,
    justifyContent: "center",
    paddingHorizontal: SPACING.xs,
  },
  actionText: {
    ...TYPOGRAPHY.caption,
    fontWeight: "700",
    color: PALETTE.brand.neonGlow,
  },
});

