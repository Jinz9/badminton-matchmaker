import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { FONT_SCALE_LIMIT, PALETTE, RADIUS, SPACING, TOUCH, TYPOGRAPHY } from "../theme";
import { triggerHaptic } from "../utils/haptics";
import { CheckIcon } from "./Icons";

export interface ChoiceOption<T extends string> {
  value: T;
  label: string;
  /** Mô tả ngắn dưới nhãn (tùy chọn) */
  hint?: string;
}

export interface ChoiceGroupProps<T extends string> {
  /** Nhãn nhóm lựa chọn */
  label?: string;
  options: readonly ChoiceOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  /** Số cột hiển thị (1 = danh sách dọc) */
  columns?: 1 | 2 | 3;
  error?: string | null;
  style?: ViewStyle;
  testID?: string;
  testIDPrefix?: string;
}

/**
 * Nhóm lựa chọn 1 đáp án (giới tính, tay thuận, vị trí, nội dung đánh, quận/huyện...).
 * Mục đã chọn có viền neon + dấu tích ✓ (không dựa vào màu đơn thuần). Vùng chạm >= 52dp.
 */
export function ChoiceGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  columns = 1,
  error,
  style,
  testID,
  testIDPrefix,
}: ChoiceGroupProps<T>) {
  const idPrefix = testIDPrefix ?? testID;
  return (
    <View style={style}>
      {label ? (
        <Text
          style={styles.label}
          allowFontScaling
          maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
        >
          {label}
        </Text>
      ) : null}
      <View style={styles.grid}>
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <Pressable
              key={opt.value}
              testID={idPrefix ? `${idPrefix}-${opt.value}` : undefined}
              onPress={() => {
                void triggerHaptic("selectPlayer");
                onChange(opt.value);
              }}
              accessibilityRole="radio"
              accessibilityLabel={opt.label}
              accessibilityState={{ selected, checked: selected }}
              style={({ pressed }) => [
                styles.item,
                { width: columns === 1 ? "100%" : columns === 2 ? "48.5%" : "31.5%" },
                selected && styles.itemSelected,
                pressed && { opacity: 0.85 },
              ]}
            >
              <View style={styles.itemText}>
                <Text
                  style={[styles.itemLabel, selected && styles.itemLabelSelected]}
                  allowFontScaling
                  maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
                >
                  {opt.label}
                </Text>
                {opt.hint ? (
                  <Text
                    style={styles.itemHint}
                    allowFontScaling
                    maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
                  >
                    {opt.hint}
                  </Text>
                ) : null}
              </View>
              <View style={[styles.mark, selected && styles.markSelected]}>
                {selected ? <CheckIcon size={12} color={PALETTE.brand.neonTextDark} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <Text
          style={styles.error}
          accessibilityRole="alert"
          allowFontScaling
          maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
        >
          ! {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    ...TYPOGRAPHY.caption,
    fontWeight: "700",
    color: PALETTE.text.secondary,
    marginBottom: SPACING.xs + 2,
    letterSpacing: 0.4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  item: {
    minHeight: TOUCH.minTarget + 4,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PALETTE.surface.card,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: PALETTE.border.subtle,
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  itemSelected: {
    backgroundColor: PALETTE.brand.neonSurface,
    borderColor: PALETTE.brand.neonLime,
  },
  itemText: {
    flex: 1,
    gap: 2,
  },
  itemLabel: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: "700",
    color: PALETTE.text.primary,
  },
  itemLabelSelected: {
    color: PALETTE.brand.neonGlow,
  },
  itemHint: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: PALETTE.text.muted,
  },
  mark: {
    width: 20,
    height: 20,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: PALETTE.border.strong,
    alignItems: "center",
    justifyContent: "center",
  },
  markSelected: {
    backgroundColor: PALETTE.brand.neonLime,
    borderColor: PALETTE.brand.neonLime,
  },
  error: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.status.dangerText,
    marginTop: SPACING.xs + 2,
  },
});

