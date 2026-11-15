/**
 * Hệ thống màu sắc Design System (Dark Navy + Neon Lime)
 * Giá trị #HEX trích xuất từ Figma (docs/ui/design-tokens.md)
 * Đảm bảo tương phản WCAG AA trên nền tối khi dùng tại sân cầu lông.
 */

export interface LevelColorToken {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  name: string;
  shortLabel: string;
  bg: string;
  border: string;
  text: string;
}

export const PALETTE = {
  bg: {
    canvas: "#0B1326",
    deep: "#060E20",
  },
  surface: {
    card: "#131B2E",
    elevated: "#171F33",
    interactive: "#222A3D",
    interactiveAlt: "#232B3E",
  },
  border: {
    subtle: "#2E354A",
    strong: "#3E4763",
  },
  brand: {
    neonLime: "#A3E636",
    neonLimePressed: "#8CD11E",
    neonGlow: "#CCFF80",
    neonTextDark: "#0B1326",
    neonTextMuted: "#416400",
    neonSurface: "#19262A",
  },
  teamA: {
    cyan: "#7BD0FF",
    button: "#00A6E0",
    buttonPressed: "#008CBE",
    surface: "#0E5579",
    surfaceAlt: "#1B435E",
    badgeSurface: "#1D3F5B",
  },
  teamB: {
    amber: "#FFB783",
    amberLight: "#FFC7A1",
    button: "#8E4700",
    buttonPressed: "#733900",
    surface: "#3B2B24",
    surfaceAlt: "#43322B",
  },
  status: {
    danger: "#93010B",
    dangerBright: "#EF4444",
    dangerText: "#FECACA",
    success: "#A3E636",
    successSurface: "#19262A",
    warning: "#FFB783",
    warningSurface: "#3B2B24",
    info: "#7BD0FF",
    infoSurface: "#0E5579",
    neutralSurface: "#222A3D",
  },
  badge: {
    purpleBg: "#2E2B5A",
    purpleText: "#DDD6FE",
  },
  text: {
    primary: "#DAE2FD",
    secondary: "#C2CAB0",
    muted: "#94A3B8",
    dim: "#64748B",
    inverse: "#0B1326",
  },
} as const;

/**
 * Màu sắc theo thang 6 cấp độ trình độ (phương án B — đã duyệt bởi TV1)
 * Cấp 1: Yếu (xám nhạt) -> Cấp 2: TB- (vàng) -> Cấp 3: TB (xanh lá)
 * -> Cấp 4: TB+ (xanh dương) -> Cấp 5: Khá (tím) -> Cấp 6: Tốt / Bán chuyên (san hô nổi bật)
 */
export const LEVEL_COLORS: Record<1 | 2 | 3 | 4 | 5 | 6, LevelColorToken> = {
  1: {
    level: 1,
    name: "Yếu",
    shortLabel: "Cấp 1 · Yếu",
    bg: "#232B3E",
    border: "#64748B",
    text: "#E2E8F0",
  },
  2: {
    level: 2,
    name: "TB-",
    shortLabel: "Cấp 2 · TB-",
    bg: "#3B2B24",
    border: "#F59E0B",
    text: "#FDE68A",
  },
  3: {
    level: 3,
    name: "TB",
    shortLabel: "Cấp 3 · TB",
    bg: "#19262A",
    border: "#A3E636",
    text: "#CCFF80",
  },
  4: {
    level: 4,
    name: "TB+",
    shortLabel: "Cấp 4 · TB+",
    bg: "#1D3F5B",
    border: "#38BDF8",
    text: "#BAE6FD",
  },
  5: {
    level: 5,
    name: "Khá",
    shortLabel: "Cấp 5 · Khá",
    bg: "#2E2B5A",
    border: "#A78BFA",
    text: "#EDE9FE",
  },
  6: {
    level: 6,
    name: "Tốt / Bán chuyên",
    shortLabel: "Cấp 6 · Tốt",
    bg: "#4A1D3D",
    border: "#FB7185",
    text: "#FFE4E6",
  },
};

export function getLevelColorToken(level: number): LevelColorToken {
  const clamped = Math.min(6, Math.max(1, Math.round(level))) as 1 | 2 | 3 | 4 | 5 | 6;
  return LEVEL_COLORS[clamped];
}

/**
 * Alias phẳng tương thích ngược với các màn hình MVP đã dựng trước đó
 */
export const COLORS = {
  background: PALETTE.bg.canvas,
  backgroundDeep: PALETTE.bg.deep,
  surface: PALETTE.surface.card,
  surfaceElevated: PALETTE.surface.elevated,
  surfaceLight: PALETTE.border.subtle,
  surfaceInteractive: PALETTE.surface.interactive,
  primary: PALETTE.brand.neonLime,
  primaryGlow: PALETTE.brand.neonGlow,
  primaryDark: PALETTE.brand.neonTextMuted,
  secondary: PALETTE.teamA.button,
  secondaryLight: PALETTE.teamA.cyan,
  accent: PALETTE.teamB.amber,
  accentDark: PALETTE.teamB.button,
  danger: PALETTE.status.danger,
  dangerBright: PALETTE.status.dangerBright,
  text: PALETTE.text.primary,
  textSecondary: PALETTE.text.secondary,
  textMuted: PALETTE.text.muted,
  textDim: PALETTE.text.dim,
  white: "#FFFFFF",
  black: "#000000",
} as const;
