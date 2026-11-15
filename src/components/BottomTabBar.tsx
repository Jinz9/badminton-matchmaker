import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { FONT_SCALE_LIMIT, PALETTE, RADIUS, SPACING, TOUCH, TYPOGRAPHY } from "../theme";
import { triggerHaptic } from "../utils/haptics";

export interface BottomTabItem {
  /** Khóa định danh tab */
  key: string;
  /** Nhãn tiếng Việt dưới icon */
  label: string;
  /** Hàm render icon theo trạng thái active */
  renderIcon: (active: boolean) => React.ReactNode;
}

export interface BottomTabBarProps {
  /** Danh sách các tab (tối đa 4-5 tab) */
  items: BottomTabItem[];
  /** Khóa tab đang được chọn */
  activeKey: string;
  /** Hàm gọi khi chọn tab */
  onSelect: (key: string) => void;
  /** Bật/tắt rung xúc giác */
  hapticsEnabled?: boolean;
  /** Style bổ sung */
  style?: ViewStyle;
  /** Định danh kiểm thử */
  testID?: string;
}

/**
 * Thanh điều hướng dưới cùng (BottomTabBar) theo phong cách Dark Navy & Neon Lime.
 */
export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  items,
  activeKey,
  onSelect,
  hapticsEnabled = true,
  style,
  testID,
}) => {
  return (
    <View testID={testID} style={[styles.container, style]}>
      {items.map((item) => {
        const active = item.key === activeKey;
        return (
          <Pressable
            key={item.key}
            testID={testID ? `${testID}-${item.key}` : undefined}
            onPress={() => {
              void triggerHaptic("selectPlayer", hapticsEnabled);
              onSelect(item.key);
            }}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: active }}
            style={({ pressed }) => [
              styles.tabItem,
              active && styles.tabItemActive,
              pressed && { opacity: 0.8 },
            ]}
          >
            {item.renderIcon(active)}
            <Text
              numberOfLines={1}
              style={[styles.label, active && styles.labelActive]}
              allowFontScaling
              maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PALETTE.bg.deep,
    borderTopWidth: 1,
    borderTopColor: PALETTE.border.subtle,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs + 2,
    gap: SPACING.xs,
  },
  tabItem: {
    flex: 1,
    minHeight: TOUCH.minTarget + 4,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xs,
    gap: 3,
  },
  tabItemActive: {
    backgroundColor: PALETTE.brand.neonSurface,
  },
  label: {
    ...TYPOGRAPHY.badge,
    fontSize: 11,
    color: PALETTE.text.muted,
  },
  labelActive: {
    color: PALETTE.brand.neonGlow,
  },
});

