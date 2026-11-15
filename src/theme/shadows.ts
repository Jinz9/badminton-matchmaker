import { Platform, ViewStyle } from "react-native";

/**
 * Bóng đổ và hiệu ứng phát sáng (Neon Glow / Elevation)
 * Nguồn: docs/ui/design-tokens.md Mục 3
 */

type ShadowStyle = Pick<
  ViewStyle,
  "shadowColor" | "shadowOffset" | "shadowOpacity" | "shadowRadius" | "elevation"
>;

function createGlow(color: string, opacity: number, radius: number, elevation: number): ShadowStyle {
  return Platform.select<ShadowStyle>({
    ios: {
      shadowColor: color,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: {
      elevation,
    },
    default: {
      shadowColor: color,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
  })!;
}

export const SHADOWS = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } as ShadowStyle,
  /** Ánh sáng neon xanh lá cho CTA chính tại sân */
  neonGlow: createGlow("#A3E636", 0.35, 14, 8),
  /** Thẻ nổi cấp 2 */
  cardElevated: createGlow("#000000", 0.32, 10, 6),
  /** Ánh sáng xanh cyan cho Đội A */
  teamAGlow: createGlow("#00A6E0", 0.28, 12, 6),
  /** Ánh sáng hổ phách cho Đội B */
  teamBGlow: createGlow("#FFB783", 0.24, 12, 6),
  /** Ánh sáng đỏ cho nút kết thúc / cảnh báo */
  dangerGlow: createGlow("#93010B", 0.35, 10, 6),
} as const;

