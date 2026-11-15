import { TextStyle } from "react-native";

/**
 * Hệ thống Typography (Inter / System Sans)
 * Nguồn: docs/ui/design-tokens.md Mục 3
 * Lưu ý: Luôn hỗ trợ font scaling của hệ thống (allowFontScaling = true)
 * và tabular-nums cho số điểm / Elo / phần trăm.
 */

export const FONT_FAMILY = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semiBold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  extraBold: "Inter_800ExtraBold",
} as const;

export const FONT_SCALE_LIMIT = {
  /** Cho phép chữ hệ thống phóng lớn đến 1.4x (đạt chuẩn tiếp cận mà không vỡ nút) */
  defaultMaxMultiplier: 1.4,
  /** Cho số điểm cực lớn (48-56px) giới hạn nhẹ để tránh tràn khung */
  displayMaxMultiplier: 1.2,
} as const;

export const TYPOGRAPHY: Record<string, TextStyle> = {
  /** Số điểm bảng tỷ số (18 - 17) */
  scoreDisplay: {
    fontFamily: FONT_FAMILY.extraBold,
    fontSize: 52,
    lineHeight: 58,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  /** Phần trăm cân kèo / Tiêu đề lớn (51% vs 49%) */
  heroTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  /** Tiêu đề màn hình / Header */
  screenTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "700",
  },
  /** Tiêu đề Card / CTA chính */
  cardTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "700",
  },
  /** Chữ nút CTA chính 58px */
  ctaText: {
    fontFamily: FONT_FAMILY.extraBold,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  /** Nội dung chính */
  body: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
  },
  /** Nội dung nhấn mạnh */
  bodyMedium: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  /** Mô tả phụ */
  caption: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
  },
  /** Nhãn nhỏ / Badge (P-Elo, TB+, SÂN 01) */
  badge: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
} as const;

