import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import Svg, { Line, Rect, Text as SvgText } from "react-native-svg";
import { FONT_SCALE_LIMIT, PALETTE, RADIUS, SPACING, TYPOGRAPHY } from "../theme";

export interface CourtDiagramProps {
  /** Tên sân (ví dụ "Sân 01") */
  courtName?: string;
  /** 2 tên VĐV của Đội A (nửa sân trên/trái) */
  teamANames?: [string?, string?];
  /** 2 tên VĐV của Đội B (nửa sân dưới/phải) */
  teamBNames?: [string?, string?];
  /** Trạng thái sân: đang trống hay đang thi đấu */
  status?: "empty" | "playing";
  /** Style bổ sung */
  style?: ViewStyle;
  /** Định danh kiểm thử */
  testID?: string;
}

function shortPlayerName(name?: string): string {
  if (!name) return "Trống";
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? parts[parts.length - 1] : parts[0];
}

/**
 * Sơ đồ SVG sân cầu lông đánh đôi 4 người/sân (2 đội đối diện qua lưới giữa).
 */
export const CourtDiagram: React.FC<CourtDiagramProps> = ({
  courtName = "Sân 01",
  teamANames = [],
  teamBNames = [],
  status = "playing",
  style,
  testID,
}) => {
  const isEmpty = status === "empty";
  const lineColor = isEmpty ? PALETTE.border.strong : PALETTE.brand.neonGlow;

  return (
    <View
      testID={testID}
      accessibilityLabel={`Sơ đồ ${courtName}, ${isEmpty ? "đang trống" : "đang thi đấu đánh đôi 4 người"}`}
      style={[styles.container, style]}
    >
      <View style={styles.captionRow}>
        <Text
          style={styles.captionTitle}
          allowFontScaling
          maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
        >
          {courtName} · Đánh đôi (4 người)
        </Text>
        <Text
          style={[styles.captionState, { color: isEmpty ? PALETTE.text.muted : PALETTE.brand.neonGlow }]}
          allowFontScaling
          maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
        >
          {isEmpty ? "CHỜ GHÉP CẶP" : "ĐANG THI ĐẤU"}
        </Text>
      </View>

      <Svg width="100%" height={148} viewBox="0 0 320 148">
        {/* Mặt sân tối tương phản cao */}
        <Rect
          x={4}
          y={4}
          width={312}
          height={140}
          rx={10}
          fill={PALETTE.bg.deep}
          stroke={lineColor}
          strokeWidth={2}
          strokeDasharray={isEmpty ? "6 4" : undefined}
        />

        {/* Vạch biên đơn trên/dưới */}
        <Line x1={4} y1={20} x2={316} y2={20} stroke={PALETTE.border.subtle} strokeWidth={1.2} />
        <Line x1={4} y1={128} x2={316} y2={128} stroke={PALETTE.border.subtle} strokeWidth={1.2} />

        {/* Vạch giao cầu ngắn */}
        <Line x1={120} y1={4} x2={120} y2={144} stroke={PALETTE.border.subtle} strokeWidth={1.2} />
        <Line x1={200} y1={4} x2={200} y2={144} stroke={PALETTE.border.subtle} strokeWidth={1.2} />

        {/* Đường chia giữa sân 2 bên */}
        <Line x1={4} y1={74} x2={120} y2={74} stroke={PALETTE.border.subtle} strokeWidth={1.2} />
        <Line x1={200} y1={74} x2={316} y2={74} stroke={PALETTE.border.subtle} strokeWidth={1.2} />

        {/* Lưới giữa sân */}
        <Line
          x1={160}
          y1={2}
          x2={160}
          y2={146}
          stroke={PALETTE.brand.neonLime}
          strokeWidth={3}
        />

        {/* 2 ô VĐV Đội A (bên trái - Cyan) */}
        <Rect
          x={22}
          y={26}
          width={86}
          height={38}
          rx={8}
          fill={PALETTE.teamA.surfaceAlt}
          stroke={PALETTE.teamA.cyan}
          strokeWidth={1.2}
        />
        <SvgText
          x={65}
          y={50}
          fill={PALETTE.teamA.cyan}
          fontSize={13}
          fontWeight="700"
          textAnchor="middle"
        >
          {shortPlayerName(teamANames[0])}
        </SvgText>

        <Rect
          x={22}
          y={84}
          width={86}
          height={38}
          rx={8}
          fill={PALETTE.teamA.surfaceAlt}
          stroke={PALETTE.teamA.cyan}
          strokeWidth={1.2}
        />
        <SvgText
          x={65}
          y={108}
          fill={PALETTE.teamA.cyan}
          fontSize={13}
          fontWeight="700"
          textAnchor="middle"
        >
          {shortPlayerName(teamANames[1])}
        </SvgText>

        {/* 2 ô VĐV Đội B (bên phải - Amber) */}
        <Rect
          x={212}
          y={26}
          width={86}
          height={38}
          rx={8}
          fill={PALETTE.teamB.surfaceAlt}
          stroke={PALETTE.teamB.amber}
          strokeWidth={1.2}
        />
        <SvgText
          x={255}
          y={50}
          fill={PALETTE.teamB.amberLight}
          fontSize={13}
          fontWeight="700"
          textAnchor="middle"
        >
          {shortPlayerName(teamBNames[0])}
        </SvgText>

        <Rect
          x={212}
          y={84}
          width={86}
          height={38}
          rx={8}
          fill={PALETTE.teamB.surfaceAlt}
          stroke={PALETTE.teamB.amber}
          strokeWidth={1.2}
        />
        <SvgText
          x={255}
          y={108}
          fill={PALETTE.teamB.amberLight}
          fontSize={13}
          fontWeight="700"
          textAnchor="middle"
        >
          {shortPlayerName(teamBNames[1])}
        </SvgText>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: PALETTE.surface.card,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  captionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  captionTitle: {
    ...TYPOGRAPHY.caption,
    fontWeight: "700",
    color: PALETTE.text.primary,
  },
  captionState: {
    ...TYPOGRAPHY.badge,
  },
});

