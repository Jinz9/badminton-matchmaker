import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { FONT_SCALE_LIMIT, PALETTE, RADIUS, SPACING, TOUCH, TYPOGRAPHY } from "../theme";
import { IconButton } from "./IconButton";
import { BackIcon, BellIcon } from "./Icons";
import { getInitials } from "./PlayerChip";
import { StatusPill, StatusPillVariant } from "./StatusPill";

export interface HeaderProps {
  /** Tên sân hoặc tiêu đề màn hình (ví dụ "Sân Cầu Lông Tiên Sơn") */
  title: string;
  /** Phụ đề nhỏ (ví dụ "Tối T3 • 19:30 - 21:30") */
  subtitle?: string;
  /** Trạng thái sân hiển thị cạnh tiêu đề */
  status?: { variant: StatusPillVariant; label: string };
  /** Hàm gọi khi nhấn nút quay lại; nếu bỏ trống sẽ ẩn nút quay lại */
  onBackPress?: () => void;
  /** Hàm gọi khi nhấn nút chuông thông báo */
  onNotificationPress?: () => void;
  /** Số lượng thông báo chưa đọc */
  notificationCount?: number;
  /** Tên người dùng để hiển thị avatar chữ cái ở góc phải */
  userName?: string;
  /** Hàm gọi khi nhấn avatar */
  onAvatarPress?: () => void;
  /** Style bổ sung */
  style?: ViewStyle;
  /** Định danh kiểm thử */
  testID?: string;
}

/**
 * Thanh Header chuẩn 64px của Figma: nút quay lại, tên sân, trạng thái, thông báo và avatar.
 */
export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  status,
  onBackPress,
  onNotificationPress,
  notificationCount = 0,
  userName,
  onAvatarPress,
  style,
  testID,
}) => {
  return (
    <View testID={testID} style={[styles.container, style]}>
      <View style={styles.leftGroup}>
        {onBackPress ? (
          <IconButton
            testID={testID ? `${testID}-back` : undefined}
            icon={<BackIcon size={20} color={PALETTE.text.primary} />}
            accessibilityLabel="Quay lại"
            onPress={onBackPress}
          />
        ) : null}

        <View style={styles.titleCol}>
          <Text
            numberOfLines={1}
            style={styles.title}
            allowFontScaling
            maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
          >
            {title}
          </Text>
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
          {status ? (
            <View style={styles.statusWrap}>
              <StatusPill variant={status.variant} label={status.label} />
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.rightGroup}>
        {onNotificationPress ? (
          <IconButton
            testID={testID ? `${testID}-bell` : undefined}
            icon={<BellIcon size={20} color={PALETTE.text.primary} />}
            accessibilityLabel="Mở thông báo"
            badgeCount={notificationCount}
            onPress={onNotificationPress}
          />
        ) : null}

        {userName ? (
          <Pressable
            testID={testID ? `${testID}-avatar` : undefined}
            onPress={onAvatarPress}
            disabled={!onAvatarPress}
            hitSlop={4}
            accessibilityRole={onAvatarPress ? "button" : "image"}
            accessibilityLabel={`Hồ sơ ${userName}`}
            style={({ pressed }) => [
              styles.avatarBtn,
              pressed && onAvatarPress && { opacity: 0.8 },
            ]}
          >
            <Text
              style={styles.avatarText}
              allowFontScaling
              maxFontSizeMultiplier={FONT_SCALE_LIMIT.displayMaxMultiplier}
            >
              {getInitials(userName)}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: TOUCH.headerHeight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: PALETTE.bg.canvas,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.border.subtle,
    gap: SPACING.sm,
  },
  leftGroup: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm + 2,
  },
  titleCol: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...TYPOGRAPHY.cardTitle,
    color: PALETTE.text.primary,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.muted,
  },
  statusWrap: {
    marginTop: 2,
  },
  rightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  avatarBtn: {
    width: TOUCH.iconButton,
    height: TOUCH.iconButton,
    borderRadius: RADIUS.pill,
    backgroundColor: PALETTE.brand.neonSurface,
    borderWidth: 1.5,
    borderColor: PALETTE.brand.neonLime,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...TYPOGRAPHY.caption,
    fontWeight: "800",
    color: PALETTE.brand.neonGlow,
  },
});

