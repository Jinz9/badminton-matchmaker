import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { FONT_SCALE_LIMIT, PALETTE, RADIUS, TOUCH, TYPOGRAPHY } from "../theme";
import { triggerHaptic } from "../utils/haptics";

export interface IconButtonProps {
  /** Icon SVG bên trong nút */
  icon: React.ReactNode;
  /** Nhãn trợ năng bắt buộc cho nút chỉ có icon */
  accessibilityLabel: string;
  /** Hàm xử lý khi nhấn */
  onPress?: () => void;
  /** Trạng thái vô hiệu hóa */
  disabled?: boolean;
  /** Số thông báo hoặc dấu chấm hiển thị ở góc trên phải */
  badgeCount?: number;
  /** Kích thước khung hiển thị (>= 44px, hitSlop tự mở rộng đạt >= 48dp) */
  size?: number;
  /** Bật/tắt rung xúc giác */
  hapticsEnabled?: boolean;
  /** Style bổ sung */
  style?: ViewStyle;
  /** Định danh kiểm thử */
  testID?: string;
}

/**
 * Nút icon chuẩn Figma (tối thiểu 44x44px kèm hitSlop đạt >= 48x48dp theo NFR-03).
 */
export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  accessibilityLabel,
  onPress,
  disabled = false,
  badgeCount,
  size = TOUCH.iconButton,
  hapticsEnabled = true,
  style,
  testID,
}) => {
  const safeSize = Math.max(TOUCH.iconButton, size);
  const pad = Math.max(4, Math.ceil((TOUCH.minTarget - safeSize) / 2) + 2);

  const handlePress = () => {
    if (disabled) return;
    void triggerHaptic("selectPlayer", hapticsEnabled);
    onPress?.();
  };

  return (
    <Pressable
      testID={testID}
      onPress={handlePress}
      disabled={disabled}
      hitSlop={{ top: pad, bottom: pad, left: pad, right: pad }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        { width: safeSize, height: safeSize, borderRadius: RADIUS.md },
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {icon}
      {typeof badgeCount === "number" && badgeCount > 0 ? (
        <View style={styles.badge}>
          <Text
            style={styles.badgeText}
            allowFontScaling
            maxFontSizeMultiplier={FONT_SCALE_LIMIT.displayMaxMultiplier}
          >
            {badgeCount > 9 ? "9+" : badgeCount}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: PALETTE.surface.elevated,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    backgroundColor: PALETTE.surface.interactive,
    transform: [{ scale: 0.96 }],
  },
  disabled: {
    opacity: 0.45,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: RADIUS.pill,
    backgroundColor: PALETTE.status.dangerBright,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: PALETTE.bg.canvas,
  },
  badgeText: {
    ...TYPOGRAPHY.badge,
    fontSize: 10,
    color: "#FFFFFF",
  },
});

