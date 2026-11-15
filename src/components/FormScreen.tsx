import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PALETTE, SPACING } from "../theme";

export interface FormScreenProps {
  children: ReactNode;
  /** Thanh hành động cố định ở đáy (nút chính — vùng ngón cái, luôn nổi trên bàn phím) */
  footer?: ReactNode;
  /** Header cố định phía trên (ví dụ nút Quay lại) */
  header?: ReactNode;
  contentStyle?: ViewStyle;
  testID?: string;
}

/**
 * Khung màn hình biểu mẫu: KeyboardAvoidingView đẩy nút chính lên trên bàn phím,
 * ScrollView cuộn nội dung (keyboardShouldPersistTaps) và dock đáy cố định.
 */
export function FormScreen({ children, footer, header, contentStyle, testID }: FormScreenProps) {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]} testID={testID}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {header}
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.content, contentStyle]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: PALETTE.bg.canvas,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
    gap: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  footer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm + 2,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
    backgroundColor: PALETTE.bg.deep,
    borderTopWidth: 1,
    borderTopColor: PALETTE.border.subtle,
  },
});

