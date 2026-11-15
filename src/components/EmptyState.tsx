import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { FONT_SCALE_LIMIT, PALETTE, RADIUS, SPACING, TYPOGRAPHY } from "../theme";
import { ShuttleIcon } from "./Icons";
import { NeonCTAButton } from "./NeonCTAButton";

export interface EmptyStateProps {
  /** Tiêu đề trạng thái rỗng */
  title: string;
  /** Mô tả hướng dẫn người dùng */
  description: string;
  /** Icon tùy chỉnh (mặc định icon quả cầu lông) */
  icon?: React.ReactNode;
  /** Nhãn nút hành động tùy chọn */
  actionLabel?: string;
  /** Hàm gọi khi bấm nút hành động */
  onActionPress?: () => void;
  /** Style bổ sung */
  style?: ViewStyle;
  /** Định danh kiểm thử */
  testID?: string;
}

/**
 * Khung trạng thái rỗng (chưa có kèo phù hợp, chưa có lịch sử đấu...).
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onActionPress,
  style,
  testID,
}) => (
  <View testID={testID} style={[styles.container, style]}>
    <View style={styles.iconCircle}>
      {icon ?? <ShuttleIcon size={28} color={PALETTE.brand.neonLime} />}
    </View>
    <Text
      style={styles.title}
      allowFontScaling
      maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
    >
      {title}
    </Text>
    <Text
      style={styles.description}
      allowFontScaling
      maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
    >
      {description}
    </Text>
    {actionLabel && onActionPress ? (
      <NeonCTAButton
        label={actionLabel}
        onPress={onActionPress}
        style={styles.cta}
      />
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: PALETTE.surface.card,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: PALETTE.border.strong,
    padding: SPACING.lg,
    alignItems: "center",
    gap: SPACING.sm + 2,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.pill,
    backgroundColor: PALETTE.brand.neonSurface,
    borderWidth: 1,
    borderColor: PALETTE.brand.neonLime,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...TYPOGRAPHY.cardTitle,
    color: PALETTE.text.primary,
    textAlign: "center",
  },
  description: {
    ...TYPOGRAPHY.body,
    color: PALETTE.text.muted,
    textAlign: "center",
  },
  cta: {
    width: "100%",
    marginTop: SPACING.xs,
  },
});

