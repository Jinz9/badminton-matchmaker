import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { FONT_SCALE_LIMIT, PALETTE, RADIUS, SPACING, TYPOGRAPHY } from "../theme";
import { IconButton } from "./IconButton";
import { CloseIcon } from "./Icons";

export interface BottomSheetProps {
  /** Bật/tắt hiển thị BottomSheet */
  visible: boolean;
  /** Hàm đóng modal */
  onClose: () => void;
  /** Tiêu đề hiển thị ở đầu BottomSheet */
  title?: string;
  /** Nội dung bên trong BottomSheet */
  children: React.ReactNode;
  /** Style bổ sung cho khung nội dung */
  contentStyle?: ViewStyle;
  /** Định danh kiểm thử */
  testID?: string;
}

/**
 * BottomSheet / Modal trượt từ dưới lên (dùng cho Modal hồ sơ người chơi ở màn 02, bộ lọc kèo...).
 */
export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  title,
  children,
  contentStyle,
  testID,
}) => {
  return (
    <Modal
      testID={testID}
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable
          style={styles.backdropDismiss}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Đóng cửa sổ"
        />

        <View style={[styles.sheet, contentStyle]}>
          <View style={styles.handleBar} />

          <View style={styles.headerRow}>
            <Text
              style={styles.title}
              allowFontScaling
              maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
            >
              {title ?? ""}
            </Text>
            <IconButton
              testID={testID ? `${testID}-close` : undefined}
              icon={<CloseIcon size={18} color={PALETTE.text.primary} />}
              accessibilityLabel="Đóng"
              onPress={onClose}
            />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.bodyContent}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(6, 14, 32, 0.78)",
    justifyContent: "flex-end",
  },
  backdropDismiss: {
    flex: 1,
  },
  sheet: {
    maxHeight: "82%",
    backgroundColor: PALETTE.surface.card,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    borderTopWidth: 1.5,
    borderColor: PALETTE.border.strong,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.lg,
  },
  handleBar: {
    width: 44,
    height: 4,
    borderRadius: RADIUS.pill,
    backgroundColor: PALETTE.border.strong,
    alignSelf: "center",
    marginBottom: SPACING.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.screenTitle,
    fontSize: 18,
    color: PALETTE.text.primary,
    flex: 1,
  },
  bodyContent: {
    gap: SPACING.sm + 4,
    paddingBottom: SPACING.md,
  },
});

