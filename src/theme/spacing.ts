/**
 * Hệ thống khoảng cách, bo góc và kích thước vùng chạm
 * Nguồn: docs/ui/design-tokens.md (đo trực tiếp từ Figma node 0:1) & NFR-03
 */

export const SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

export const RADIUS = {
  xs: 6,
  sm: 8,
  md: 12,
  cta: 14,
  card: 16,
  lg: 20,
  pill: 999,
} as const;

export const TOUCH = {
  /** Vùng chạm tối thiểu chuẩn truy cập (NFR-03) */
  minTarget: 48,
  /** Nút icon chuẩn Figma (44x44) — luôn kèm hitSlop >= 4 để đạt 48dp */
  iconButton: 44,
  /** Chiều cao nút CTA chính tại sân (Thumb-Zone) */
  ctaHeight: 58,
  /** Chiều cao nút CTA phụ */
  secondaryCtaHeight: 52,
  /** Chiều cao nút thao tác nhanh (Hoàn tác / +1 Quả cầu / Kết thúc) */
  actionButtonHeight: 56,
  /** Chiều cao Header bar chuẩn Figma */
  headerHeight: 64,
  /** Ô chọn nhanh người chơi tại sân (Chạm 2) */
  quickPlayerMinWidth: 80,
  quickPlayerMinHeight: 64,
  /** Vùng chạm bảng điểm 1 tay (Màn 04) */
  scoreBoxMinHeight: 200,
  scoreBoxFigmaHeight: 256,
  /** Chiều rộng khung thiết kế tham chiếu */
  figmaFrameWidth: 390,
  /** Lề ngang màn hình chuẩn */
  screenPaddingHorizontal: 16,
} as const;

