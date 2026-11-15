import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import {
  FONT_SCALE_LIMIT,
  PALETTE,
  RADIUS,
  SHADOWS,
  SPACING,
  TOUCH,
  TYPOGRAPHY,
} from "../theme";
import { triggerHaptic } from "../utils/haptics";

export type SecondaryButtonVariant = "default" | "outline" | "danger" | "teamA" | "teamB";

export interface SecondaryButtonProps {
  /** Nhãn hiển thị trên nút */
  label: string;
  /** Biến thể màu sắc theo ngữ cảnh sân đấu */
  variant?: SecondaryButtonVariant;
  /** Hàm xử lý khi nhấn */
  onPress?: () => void;
  /** Trạng thái vô hiệu hóa */
  disabled?: boolean;
  /** Trạng thái đang tải */
  loading?: boolean;
  /** Icon hiển thị bên trái */
  icon?: React.ReactNode;
  /** Bật/tắt rung xúc giác */
  hapticsEnabled?: boolean;
  /** Style bổ sung */
  style?: ViewStyle;
  /** Nhãn trợ năng */
  accessibilityLabel?: string;
  /** Định danh kiểm thử */
  testID?: string;
}

const VARIANT_BG: Record<SecondaryButtonVariant, string> = {
  default: PALETTE.surface.interactive,
  outline: "transparent",
  danger: PALETTE.status.danger,
  teamA: PALETTE.teamA.button,
  teamB: PALETTE.teamB.button,
};

const VARIANT_TEXT: Record<SecondaryButtonVariant, string> = {
  default: PALETTE.text.primary,
  outline: PALETTE.text.primary,
  danger: "#FFFFFF",
  teamA: "#FFFFFF",
  teamB: "#FFFFFF",
};

/**
 * Nút hành động phụ (cao 52–56px): Xáo lại đội hình, Hoàn tác, +1 Quả cầu, Kết thúc & Trả sân.
 */
export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  label,
  variant = "default",
  onPress,
  disabled = false,
  loading = false,
  icon,
  hapticsEnabled = true,
  style,
  accessibilityLabel,
  testID,
}) => {
  const isInactive = disabled || loading;

  const handlePress = () => {
    if (isInactive) return;
    void triggerHaptic(variant === "danger" ? "warning" : "selectPlayer", hapticsEnabled);
    onPress?.();
  };

  return (
    <Pressable
      testID={testID}
      onPress={handlePress}
      disabled={isInactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isInactive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: VARIANT_BG[variant] },
        variant === "outline" && styles.outlineBorder,
        variant === "danger" && !isInactive && SHADOWS.dangerGlow,
        pressed && !isInactive && styles.pressed,
        isInactive && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={VARIANT_TEXT[variant]} />
      ) : (
        <View style={styles.row}>
          {icon ? <View>{icon}</View> : null}
          <Text
            style={[styles.label, { color: isInactive ? PALETTE.text.muted : VARIANT_TEXT[variant] }]}
            allowFontScaling
            maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: TOUCH.secondaryCtaHeight,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
  },
  outlineBorder: {
    borderColor: PALETTE.border.strong,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.45,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
  },
  label: {
    ...TYPOGRAPHY.cardTitle,
    fontSize: 15,
    textAlign: "center",
  },
});

