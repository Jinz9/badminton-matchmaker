import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { FONT_SCALE_LIMIT, PALETTE, RADIUS, SHADOWS, SPACING, TOUCH, TYPOGRAPHY } from "../theme";
import { AlertIcon, CheckIcon, CloseIcon } from "./Icons";

export type ToastVariant = "success" | "info" | "warning" | "error";

export interface ToastProps {
  /** Bật/tắt hiển thị Toast */
  visible: boolean;
  /** Thông điệp tiếng Việt ngắn gọn */
  message: string;
  /** Loại thông báo */
  variant?: ToastVariant;
  /** Hàm đóng Toast (tùy chọn) */
  onDismiss?: () => void;
  /** Style bổ sung */
  style?: ViewStyle;
  /** Định danh kiểm thử */
  testID?: string;
}

const TOAST_THEME: Record<
  ToastVariant,
  { bg: string; border: string; accent: string }
> = {
  success: {
    bg: PALETTE.brand.neonSurface,
    border: PALETTE.brand.neonLime,
    accent: PALETTE.brand.neonGlow,
  },
  info: {
    bg: PALETTE.teamA.surface,
    border: PALETTE.teamA.cyan,
    accent: PALETTE.teamA.cyan,
  },
  warning: {
    bg: PALETTE.teamB.surface,
    border: PALETTE.teamB.amber,
    accent: PALETTE.teamB.amberLight,
  },
  error: {
    bg: "#3B0D12",
    border: PALETTE.status.dangerBright,
    accent: PALETTE.status.dangerText,
  },
};

/**
 * Thanh thông báo nổi phản hồi tức thì tại sân (lưu offline, đổi kèo, lỗi kết nối).
 */
export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  variant = "info",
  onDismiss,
  style,
  testID,
}) => {
  if (!visible) return null;
  const theme = TOAST_THEME[variant];

  return (
    <View
      testID={testID}
      accessibilityRole="alert"
      accessibilityLabel={message}
      style={[
        styles.container,
        SHADOWS.cardElevated,
        { backgroundColor: theme.bg, borderColor: theme.border },
        style,
      ]}
    >
      <View style={styles.iconWrap}>
        {variant === "success" ? (
          <CheckIcon size={16} color={theme.accent} />
        ) : (
          <AlertIcon size={18} color={theme.accent} />
        )}
      </View>

      <Text
        style={[styles.message, { color: PALETTE.text.primary }]}
        allowFontScaling
        maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
      >
        {message}
      </Text>

      {onDismiss ? (
        <Pressable
          onPress={onDismiss}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Đóng thông báo"
          style={styles.closeBtn}
        >
          <CloseIcon size={16} color={PALETTE.text.secondary} />
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    gap: SPACING.sm + 2,
    minHeight: TOUCH.minTarget,
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    ...TYPOGRAPHY.bodyMedium,
    flex: 1,
  },
  closeBtn: {
    minWidth: 32,
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});

