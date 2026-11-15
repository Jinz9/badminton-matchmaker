import React, { useEffect, useRef } from "react";
import { Animated, DimensionValue, StyleSheet, ViewStyle } from "react-native";
import { PALETTE, RADIUS } from "../theme";

export interface SkeletonProps {
  /** Chiều rộng khung loading */
  width?: DimensionValue;
  /** Chiều cao khung loading */
  height?: number;
  /** Bo góc */
  borderRadius?: number;
  /** Style bổ sung */
  style?: ViewStyle;
  /** Định danh kiểm thử */
  testID?: string;
}

/**
 * Khung Placeholder Skeleton tối màu khi đang tải dữ liệu sân / kèo.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 18,
  borderRadius = RADIUS.sm,
  style,
  testID,
}) => {
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: false,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 750,
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      testID={testID}
      accessibilityLabel="Đang tải dữ liệu"
      style={[
        styles.base,
        { width, height, borderRadius, opacity },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: PALETTE.surface.interactive,
  },
});

