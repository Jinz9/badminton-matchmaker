import { forwardRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import { FONT_SCALE_LIMIT, PALETTE, RADIUS, SPACING, TYPOGRAPHY } from "../theme";

export interface TextFieldProps
  extends Omit<TextInputProps, "style" | "placeholderTextColor"> {
  /** Nhãn hiển thị phía trên ô nhập */
  label: string;
  /** Thông báo lỗi tiếng Việt (hiện dưới ô, kèm biểu tượng chữ "!" để không chỉ dựa vào màu) */
  error?: string | null;
  /** Gợi ý ngắn dưới ô nhập khi không có lỗi */
  helper?: string;
  /** Alias của helper */
  hint?: string;
  /** Hiện nút "Hiện/Ẩn" cho ô mật khẩu */
  passwordToggle?: boolean;
  /** Nội dung phụ bên phải ô (ví dụ mã vùng) */
  rightAdornment?: React.ReactNode;
  containerStyle?: ViewStyle;
  testID?: string;
}

/**
 * Ô nhập liệu cao 56px (đủ vùng chạm >= 48dp), nhãn + lỗi tiếng Việt, hỗ trợ cỡ chữ hệ thống lớn.
 */
export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  {
    label,
    error,
    helper,
    hint,
    passwordToggle = false,
    rightAdornment,
    containerStyle,
    secureTextEntry,
    onFocus,
    onBlur,
    testID,
    ...inputProps
  },
  ref
) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const isSecure = passwordToggle ? hidden : Boolean(secureTextEntry);
  const hasError = Boolean(error);
  const helperText = helper ?? hint;

  return (
    <View style={containerStyle}>
      <Text
        style={styles.label}
        allowFontScaling
        maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
      >
        {label}
      </Text>
      <View
        style={[
          styles.box,
          focused && styles.boxFocused,
          hasError && styles.boxError,
        ]}
      >
        <TextInput
          ref={ref}
          testID={testID}
          accessibilityLabel={label}
          style={styles.input}
          placeholderTextColor={PALETTE.text.dim}
          selectionColor={PALETTE.brand.neonLime}
          autoCapitalize="none"
          autoCorrect={false}
          allowFontScaling
          maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
          secureTextEntry={isSecure}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...inputProps}
        />
        {rightAdornment}
        {passwordToggle ? (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Hiện mật khẩu" : "Ẩn mật khẩu"}
            style={styles.toggle}
          >
            <Text
              style={styles.toggleText}
              allowFontScaling
              maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
            >
              {hidden ? "Hiện" : "Ẩn"}
            </Text>
          </Pressable>
        ) : null}
      </View>
      {hasError ? (
        <Text
          testID={testID ? `${testID}-error` : undefined}
          style={styles.error}
          accessibilityRole="alert"
          allowFontScaling
          maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
        >
          {`! ${error}`}
        </Text>
      ) : helperText ? (
        <Text
          style={styles.helper}
          allowFontScaling
          maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
        >
          {helperText}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  label: {
    ...TYPOGRAPHY.caption,
    fontWeight: "700",
    color: PALETTE.text.secondary,
    marginBottom: SPACING.xs + 2,
    letterSpacing: 0.4,
  },
  box: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PALETTE.surface.elevated,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: PALETTE.border.subtle,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  boxFocused: {
    borderColor: PALETTE.brand.neonLime,
    backgroundColor: PALETTE.surface.card,
  },
  boxError: {
    borderColor: PALETTE.status.dangerBright,
  },
  input: {
    flex: 1,
    minHeight: 52,
    ...TYPOGRAPHY.body,
    fontSize: 16,
    color: PALETTE.text.primary,
    paddingVertical: SPACING.sm,
  },
  toggle: {
    minHeight: 44,
    minWidth: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleText: {
    ...TYPOGRAPHY.caption,
    fontWeight: "700",
    color: PALETTE.brand.neonGlow,
  },
  error: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.status.dangerText,
    marginTop: SPACING.xs + 2,
  },
  helper: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.muted,
    marginTop: SPACING.xs + 2,
  },
});

