import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { FONT_SCALE_LIMIT, PALETTE, RADIUS, SPACING, TYPOGRAPHY } from "../theme";

export interface ProgressIndicatorProps {
  /** Bước hiện tại (1..total) */
  currentStep?: number;
  /** Alias cho currentStep */
  current?: number;
  /** Tổng số bước (mặc định 3 chạm tại sân) */
  totalSteps?: number;
  /** Alias cho totalSteps */
  total?: number;
  /** Nhãn tiền tố (mặc định "Chạm") */
  labelPrefix?: string;
  /** Alias cho labelPrefix */
  label?: string;
  /** Chế độ hiển thị: thanh tiến trình hoặc các chấm */
  variant?: "bar" | "dots";
  /** Style bổ sung */
  style?: ViewStyle;
  /** Định danh kiểm thử */
  testID?: string;
}

/**
 * Hiển thị tiến trình 3 chạm tại sân ("Chạm 2/3") dạng ProgressBar hoặc ProgressDots.
 */
export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  current,
  totalSteps = 3,
  total,
  labelPrefix = "Chạm",
  variant = "bar",
  style,
  testID,
}) => {
  const safeTotal = Math.max(1, total ?? totalSteps);
  const safeStep = Math.min(safeTotal, Math.max(1, current ?? currentStep ?? 1));
  const percent = (safeStep / safeTotal) * 100;

  return (
    <View
      testID={testID}
      accessibilityLabel={`${labelPrefix} ${safeStep} trên ${safeTotal}`}
      style={[styles.container, style]}
    >
      <View style={styles.labelRow}>
        <Text
          style={styles.stepText}
          allowFontScaling
          maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
        >
          {labelPrefix} {safeStep}/{safeTotal}
        </Text>
        <Text
          style={styles.percentText}
          allowFontScaling
          maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
        >
          {Math.round(percent)}%
        </Text>
      </View>

      {variant === "bar" ? (
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${percent}%` }]} />
        </View>
      ) : (
        <View style={styles.dotsRow}>
          {Array.from({ length: safeTotal }).map((_, idx) => {
            const active = idx + 1 <= safeStep;
            return (
              <View
                key={idx}
                style={[styles.dot, active ? styles.dotActive : styles.dotInactive]}
              />
            );
          })}
        </View>
      )}
    </View>
  );
};

export const ProgressBar = (props: Omit<ProgressIndicatorProps, "variant">) => (
  <ProgressIndicator {...props} variant="bar" />
);

export const ProgressDots = (props: Omit<ProgressIndicatorProps, "variant">) => (
  <ProgressIndicator {...props} variant="dots" />
);

const styles = StyleSheet.create({
  container: {
    gap: SPACING.xs + 2,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepText: {
    ...TYPOGRAPHY.caption,
    fontWeight: "700",
    color: PALETTE.brand.neonGlow,
  },
  percentText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.muted,
    fontVariant: ["tabular-nums"],
  },
  barTrack: {
    height: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: PALETTE.surface.interactive,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: RADIUS.pill,
    backgroundColor: PALETTE.brand.neonLime,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  dot: {
    flex: 1,
    height: 6,
    borderRadius: RADIUS.pill,
  },
  dotActive: {
    backgroundColor: PALETTE.brand.neonLime,
  },
  dotInactive: {
    backgroundColor: PALETTE.surface.interactive,
  },
});

