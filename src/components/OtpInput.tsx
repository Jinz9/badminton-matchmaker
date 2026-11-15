import { Pressable, StyleSheet, Text, TextInput, View, ViewStyle } from "react-native";
import { FONT_SCALE_LIMIT, PALETTE, RADIUS, SPACING, TYPOGRAPHY } from "../theme";
import { triggerHaptic } from "../utils/haptics";

export interface OtpInputProps {
  /** Mã đã nhập (chuỗi chữ số, tối đa `length`) */
  value: string;
  /** Hàm cập nhật chuỗi OTP (khi nhập từ bàn phím hoặc kiểm thử tự động) */
  onChange?: (next: string) => void;
  /** Số ô (mặc định 6 theo Figma "6-Digit OTP Interactive Boxes") */
  length?: number;
  error?: string | null;
  style?: ViewStyle;
  testID?: string;
}

/** Hàng ô hiển thị mã OTP (nhập bằng NumericKeypad hoặc TextInput ẩn). Ô đang nhập có viền neon. */
export function OtpInput({ value, onChange, length = 6, error, style, testID }: OtpInputProps) {
  return (
    <View style={style}>
      <TextInput
        testID={testID}
        value={value}
        onChangeText={(txt) => onChange?.(txt.replace(/\D/g, "").slice(0, length))}
        keyboardType="number-pad"
        maxLength={length}
        accessibilityLabel={`Mã xác thực ${value.length} trên ${length} chữ số`}
        style={styles.hiddenInput}
      />
      <View style={styles.row}>
        {Array.from({ length }).map((_, i) => {
          const char = value[i];
          const active = i === Math.min(value.length, length - 1);
          return (
            <View
              key={i}
              style={[
                styles.box,
                active && styles.boxActive,
                Boolean(error) && styles.boxError,
              ]}
            >
              <Text
                style={styles.char}
                allowFontScaling
                maxFontSizeMultiplier={FONT_SCALE_LIMIT.displayMaxMultiplier}
              >
                {char ?? ""}
              </Text>
            </View>
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
          {`! ${error}`}
        </Text>
      ) : null}
    </View>
  );
}

export interface NumericKeypadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  disabled?: boolean;
  testID?: string;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"] as const;

/** Bàn phím số cỡ lớn chống mồ hôi (nút cao 56px, theo Figma "On-Court Ergonomic Numeric Keypad"). */
export function NumericKeypad({ onDigit, onBackspace, disabled, testID }: NumericKeypadProps) {
  return (
    <View style={styles.pad} testID={testID}>
      {KEYS.map((k, idx) =>
        k === "" ? (
          <View key={`empty-${idx}`} style={styles.keyPlaceholder} />
        ) : (
          <Pressable
            key={k}
            testID={testID ? `${testID}-${k === "⌫" ? "back" : k}` : undefined}
            disabled={disabled}
            onPress={() => {
              void triggerHaptic("selectPlayer");
              if (k === "⌫") onBackspace();
              else onDigit(k);
            }}
            accessibilityRole="button"
            accessibilityLabel={k === "⌫" ? "Xóa chữ số cuối" : `Số ${k}`}
            style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
          >
            <Text
              style={styles.keyText}
              allowFontScaling
              maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
            >
              {k}
            </Text>
          </Pressable>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    width: 1,
    height: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SPACING.xs + 2,
  },
  box: {
    flex: 1,
    minHeight: 56,
    maxWidth: 56,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: PALETTE.border.subtle,
    backgroundColor: PALETTE.surface.elevated,
    alignItems: "center",
    justifyContent: "center",
  },
  boxActive: {
    borderColor: PALETTE.brand.neonLime,
  },
  boxError: {
    borderColor: PALETTE.status.dangerBright,
  },
  char: {
    ...TYPOGRAPHY.heroTitle,
    color: PALETTE.text.primary,
  },
  error: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.status.dangerText,
    marginTop: SPACING.sm,
  },
  pad: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: SPACING.sm,
  },
  key: {
    width: "31.5%",
    height: 56,
    borderRadius: RADIUS.md,
    backgroundColor: PALETTE.surface.interactive,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    alignItems: "center",
    justifyContent: "center",
  },
  keyPlaceholder: {
    width: "31.5%",
    height: 56,
  },
  keyPressed: {
    backgroundColor: PALETTE.surface.card,
    transform: [{ scale: 0.97 }],
  },
  keyText: {
    ...TYPOGRAPHY.heroTitle,
    fontSize: 22,
    color: PALETTE.text.primary,
  },
});

