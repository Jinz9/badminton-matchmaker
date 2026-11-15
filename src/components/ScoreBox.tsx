import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
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

export interface ScoreBoxProps {
  /** Phe của ô điểm (Đội A cyan / Đội B hổ phách) */
  team: "A" | "B";
  /** Tên hiển thị của đội */
  teamLabel: string;
  /** Điểm số hiện tại */
  score: number;
  /** Hàm gọi khi chạm để cộng +1 điểm */
  onIncrement?: () => void;
  /** Trạng thái vô hiệu hóa (ví dụ trận đã kết thúc) */
  disabled?: boolean;
  /** Bật/tắt rung xúc giác */
  hapticsEnabled?: boolean;
  /** Style bổ sung */
  style?: ViewStyle;
  /** Định danh kiểm thử */
  testID?: string;
}

/**
 * Ô điểm lớn thao tác 1 tay ở màn 04 (Touch Area Đội A / Đội B).
 */
export const ScoreBox: React.FC<ScoreBoxProps> = ({
  team,
  teamLabel,
  score,
  onIncrement,
  disabled = false,
  hapticsEnabled = true,
  style,
  testID,
}) => {
  const isTeamA = team === "A";
  const accent = isTeamA ? PALETTE.teamA.cyan : PALETTE.teamB.amber;
  const buttonColor = isTeamA ? PALETTE.teamA.button : PALETTE.teamB.button;
  const surfaceBg = isTeamA ? PALETTE.teamA.surfaceAlt : PALETTE.teamB.surface;

  const handlePress = () => {
    if (disabled) return;
    void triggerHaptic("scorePoint", hapticsEnabled);
    onIncrement?.();
  };

  return (
    <Pressable
      testID={testID}
      onPress={handlePress}
      disabled={disabled || !onIncrement}
      accessibilityRole="button"
      accessibilityLabel={`Cộng 1 điểm cho ${teamLabel}, điểm hiện tại ${score}`}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: surfaceBg, borderColor: accent },
        isTeamA ? SHADOWS.teamAGlow : SHADOWS.teamBGlow,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        numberOfLines={1}
        style={[styles.teamLabel, { color: accent }]}
        allowFontScaling
        maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
      >
        {teamLabel}
      </Text>

      <Text
        style={[styles.scoreText, { color: PALETTE.text.primary }]}
        allowFontScaling
        maxFontSizeMultiplier={FONT_SCALE_LIMIT.displayMaxMultiplier}
      >
        {score}
      </Text>

      <View style={[styles.plusBtn, { backgroundColor: buttonColor }]}>
        <Text
          style={styles.plusBtnText}
          allowFontScaling
          maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
        >
          + {isTeamA ? "ĐỘI A" : "ĐỘI B"} +1
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: TOUCH.scoreBoxMinHeight,
    borderRadius: RADIUS.card,
    borderWidth: 1.5,
    padding: SPACING.md,
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.sm,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.92,
  },
  disabled: {
    opacity: 0.5,
  },
  teamLabel: {
    ...TYPOGRAPHY.badge,
    fontSize: 12,
    letterSpacing: 0.8,
  },
  scoreText: {
    ...TYPOGRAPHY.scoreDisplay,
  },
  plusBtn: {
    width: "100%",
    minHeight: TOUCH.minTarget,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.sm,
  },
  plusBtnText: {
    ...TYPOGRAPHY.ctaText,
    fontSize: 14,
    color: "#FFFFFF",
  },
});

