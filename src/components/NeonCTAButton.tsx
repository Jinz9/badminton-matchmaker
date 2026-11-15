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

export interface NeonCTAButtonProps {
  /** Nhãn chính hiển thị trên nút CTA (ví dụ: "CHIA KÈO SÂN 1") */
  label: string;
  /** Nhãn phụ bên cạnh hoặc phía dưới (ví dụ: "[CHẠM 1]") */
  subtitle?: string;
  /** Hàm xử lý khi người dùng nhấn nút */
  onPress?: () => void;
  /** Trạng thái vô hiệu hóa nút */
  disabled?: boolean;
  /** Trạng thái đang xử lý bất đồng bộ */
  loading?: boolean;
  /** Icon tùy chọn hiển thị bên trái nhãn */
  icon?: React.ReactNode;
  /** Bật/tắt phản hồi rung xúc giác khi nhấn */
  hapticsEnabled?: boolean;
  /** Ghi đè style container ngoài */
  style?: ViewStyle;
  /** Nhãn trợ năng cho trình đọc màn hình */
  accessibilityLabel?: string;
  /** Định danh kiểm thử */
  testID?: string;
}

/**
 * Nút hành động chính màu xanh neon (#A3E636), chiều cao chuẩn 58px tối ưu vùng ngón cái.
 */
export const NeonCTAButton: React.FC<NeonCTAButtonProps> = ({
  label,
  subtitle,
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
    void triggerHaptic("success", hapticsEnabled);
    onPress?.();
  };

  return (
    <Pressable
      testID={testID}
      onPress={handlePress}
      disabled={isInactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? (subtitle ? `${label} ${subtitle}` : label)}
      accessibilityState={{ disabled: isInactive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        !isInactive && SHADOWS.neonGlow,
        pressed && !isInactive && styles.pressed,
        isInactive && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <View style={styles.contentRow}>
          <ActivityIndicator
            testID={testID ? `${testID}-spinner` : undefined}
            size="small"
            color={PALETTE.brand.neonTextDark}
          />
          <Text
            style={[styles.label, styles.disabledLabel]}
            allowFontScaling
            maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
          >
            Đang xử lý...
          </Text>
        </View>
      ) : (
        <View style={styles.contentRow}>
          {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
          <Text
            style={[styles.label, isInactive && styles.disabledLabel]}
            allowFontScaling
            maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
          >
            {label}
          </Text>
          {subtitle ? (
            <View style={styles.subtitlePill}>
              <Text
                style={styles.subtitleText}
                allowFontScaling
                maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
              >
                {subtitle}
              </Text>
            </View>
          ) : null}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: TOUCH.ctaHeight,
    borderRadius: RADIUS.cta,
    backgroundColor: PALETTE.brand.neonLime,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    backgroundColor: PALETTE.brand.neonLimePressed,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    backgroundColor: PALETTE.surface.interactive,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    opacity: 0.7,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  iconWrap: {
    marginRight: SPACING.xxs,
  },
  label: {
    ...TYPOGRAPHY.ctaText,
    color: PALETTE.brand.neonTextDark,
    textAlign: "center",
  },
  disabledLabel: {
    color: PALETTE.text.muted,
  },
  subtitlePill: {
    backgroundColor: "rgba(11, 19, 38, 0.14)",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
  },
  subtitleText: {
    ...TYPOGRAPHY.badge,
    color: PALETTE.brand.neonTextDark,
  },
});

