import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import {
  FONT_SCALE_LIMIT,
  PALETTE,
  RADIUS,
  SPACING,
  TOUCH,
  TYPOGRAPHY,
} from "../theme";
import { triggerHaptic } from "../utils/haptics";
import { CheckIcon } from "./Icons";
import { LevelBadge } from "./LevelBadge";

export interface PlayerChipProps {
  /** Tên hiển thị của người chơi */
  name: string;
  /** Cấp trình độ từ 1 đến 6 */
  level: number;
  /** Điểm Elo hiện tại */
  elo: number;
  /** Trạng thái đang được chọn vào sân */
  selected?: boolean;
  /** Trạng thái vô hiệu hóa (ví dụ đã đủ 4 người hoặc đang ở sân khác) */
  disabled?: boolean;
  /** Nhãn phụ (ví dụ "Mặc định", "Vãng lai", "Tay trái") */
  subtitle?: string;
  /** Hàm xử lý khi chạm chọn/bỏ chọn */
  onPress?: () => void;
  /** Bật/tắt rung xúc giác */
  hapticsEnabled?: boolean;
  /** Style bổ sung */
  style?: ViewStyle;
  /** Định danh kiểm thử */
  testID?: string;
}

/** Lấy tối đa 2 chữ cái đầu từ tên người Việt (ví dụ "Hoàng Anh" -> "HA") */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/**
 * Thẻ chọn người chơi nhanh bằng 1 tay tại sân (kích thước tối thiểu >= 80x64dp).
 * Khi chọn hiển thị cả viền neon và dấu tích Check để không dựa vào màu đơn thuần.
 */
export const PlayerChip: React.FC<PlayerChipProps> = ({
  name,
  level,
  elo,
  selected = false,
  disabled = false,
  subtitle,
  onPress,
  hapticsEnabled = true,
  style,
  testID,
}) => {
  const initials = getInitials(name);

  const handlePress = () => {
    if (disabled) return;
    void triggerHaptic("selectPlayer", hapticsEnabled);
    onPress?.();
  };

  return (
    <Pressable
      testID={testID}
      onPress={handlePress}
      disabled={disabled || !onPress}
      accessibilityRole="checkbox"
      accessibilityLabel={`${name}, ${elo} Elo, cấp ${level}${selected ? ", đã chọn" : ""}`}
      accessibilityState={{ checked: selected, selected, disabled }}
      style={({ pressed }) => [
        styles.container,
        selected && styles.selectedContainer,
        pressed && !disabled && onPress && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <View style={[styles.avatar, selected && styles.avatarSelected]}>
        <Text
          style={[styles.avatarText, selected && styles.avatarTextSelected]}
          allowFontScaling
          maxFontSizeMultiplier={FONT_SCALE_LIMIT.displayMaxMultiplier}
        >
          {initials}
        </Text>
      </View>

      <View style={styles.infoCol}>
        <Text
          numberOfLines={1}
          style={styles.name}
          allowFontScaling
          maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
        >
          {name}
        </Text>
        <View style={styles.metaRow}>
          <LevelBadge level={level} compact />
          <Text
            style={styles.eloText}
            allowFontScaling
            maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
          >
            {elo} Elo
          </Text>
        </View>
        {subtitle ? (
          <Text
            numberOfLines={1}
            style={styles.subtitle}
            allowFontScaling
            maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View
        style={[
          styles.checkCircle,
          selected ? styles.checkCircleSelected : styles.checkCircleUnselected,
        ]}
      >
        {selected ? <CheckIcon size={14} color={PALETTE.brand.neonTextDark} /> : null}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    minWidth: TOUCH.quickPlayerMinWidth,
    minHeight: TOUCH.quickPlayerMinHeight,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PALETTE.surface.card,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: PALETTE.border.subtle,
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.sm + 2,
    gap: SPACING.sm + 2,
  },
  selectedContainer: {
    backgroundColor: PALETTE.brand.neonSurface,
    borderColor: PALETTE.brand.neonLime,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.45,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.pill,
    backgroundColor: PALETTE.surface.interactive,
    borderWidth: 1,
    borderColor: PALETTE.border.strong,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarSelected: {
    backgroundColor: PALETTE.brand.neonLime,
    borderColor: PALETTE.brand.neonGlow,
  },
  avatarText: {
    ...TYPOGRAPHY.cardTitle,
    fontSize: 14,
    color: PALETTE.text.primary,
  },
  avatarTextSelected: {
    color: PALETTE.brand.neonTextDark,
  },
  infoCol: {
    flex: 1,
    gap: 4,
  },
  name: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: "700",
    color: PALETTE.text.primary,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: SPACING.xs + 2,
  },
  eloText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
    fontVariant: ["tabular-nums"],
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: PALETTE.text.muted,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  checkCircleSelected: {
    backgroundColor: PALETTE.brand.neonLime,
    borderColor: PALETTE.brand.neonLime,
  },
  checkCircleUnselected: {
    backgroundColor: "transparent",
    borderColor: PALETTE.border.strong,
  },
});

