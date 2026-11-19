import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import {
  FONT_SCALE_LIMIT,
  PALETTE,
  RADIUS,
  SHADOWS,
  SPACING,
  TOUCH,
  TYPOGRAPHY,
} from "../theme";
import { triggerHaptic } from "../utils/haptics";
import { SwapIcon } from "./Icons";
import { LevelBadge } from "./LevelBadge";
import { getInitials } from "./PlayerChip";

export interface TeamPlayerItem {
  id: string;
  name: string;
  level: number;
  elo: number;
  /** Vị trí sở trường (Lưới / Công / Linh hoạt) */
  positionLabel?: string;
}

export interface TeamCardProps {
  /** Phe của đội: Đội A (Cyan) hoặc Đội B (Hổ phách / San hô) */
  team: "A" | "B";
  /** Tên hiển thị của đội (mặc định: "ĐỘI A" / "ĐỘI B") */
  title?: string;
  /** Danh sách 2 VĐV trong cặp đánh đôi */
  players: TeamPlayerItem[];
  /** Điểm Elo trung bình của đội */
  averageElo: number;
  /** Hàm gọi khi chạm nút đổi chéo VĐV (tùy chọn) */
  onSwapPress?: () => void;
  /** Hàm gọi khi chạm vào từng VĐV (ví dụ mở modal hồ sơ) */
  onPlayerPress?: (player: TeamPlayerItem) => void;
  /** Bật/tắt rung xúc giác */
  hapticsEnabled?: boolean;
  /** Style bổ sung */
  style?: ViewStyle;
  /** Định danh kiểm thử */
  testID?: string;
}

/**
 * Thẻ hiển thị đội hình đánh đôi (Đội A cyan / Đội B hổ phách) tại màn Chạm 3 & Chấm điểm.
 */
export const TeamCard: React.FC<TeamCardProps> = React.memo(({
  team,
  title,
  players,
  averageElo,
  onSwapPress,
  onPlayerPress,
  hapticsEnabled = true,
  style,
  testID,
}) => {
  const isTeamA = team === "A";
  const accent = isTeamA ? PALETTE.teamA.cyan : PALETTE.teamB.amber;
  const pillBg = isTeamA ? PALETTE.teamA.surface : PALETTE.teamB.surface;
  const glow = isTeamA ? SHADOWS.teamAGlow : SHADOWS.teamBGlow;
  const teamLabel = title ?? (isTeamA ? "ĐỘI A" : "ĐỘI B");

  return (
    <View
      testID={testID}
      style={[
        styles.card,
        glow,
        { borderColor: accent },
        style,
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <View style={[styles.teamDot, { backgroundColor: accent }]} />
          <Text
            style={[styles.teamTitle, { color: accent }]}
            allowFontScaling
            maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
          >
            {teamLabel}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <View style={[styles.eloPill, { backgroundColor: pillBg, borderColor: accent }]}>
            <Text
              style={[styles.eloPillText, { color: accent }]}
              allowFontScaling
              maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
            >
              Elo TB: {Math.round(averageElo)}
            </Text>
          </View>

          {onSwapPress ? (
            <Pressable
              testID={testID ? `${testID}-swap` : undefined}
              onPress={() => {
                void triggerHaptic("swapTeam", hapticsEnabled);
                onSwapPress();
              }}
              accessibilityRole="button"
              accessibilityLabel={`Đổi người trong ${teamLabel}`}
              hitSlop={8}
              style={({ pressed }) => [
                styles.swapBtn,
                pressed && { opacity: 0.75 },
              ]}
            >
              <SwapIcon size={16} color={PALETTE.text.primary} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.playerList}>
        {players.map((player) => (
          <Pressable
            key={player.id}
            disabled={!onPlayerPress}
            onPress={() => {
              void triggerHaptic("selectPlayer", hapticsEnabled);
              onPlayerPress?.(player);
            }}
            accessibilityRole={onPlayerPress ? "button" : "text"}
            accessibilityLabel={`${player.name}, ${player.elo} Elo, cấp ${player.level}`}
            style={({ pressed }) => [
              styles.playerRow,
              pressed && onPlayerPress && styles.playerRowPressed,
            ]}
          >
            <View style={[styles.avatar, { backgroundColor: pillBg, borderColor: accent }]}>
              <Text
                style={[styles.avatarText, { color: accent }]}
                allowFontScaling
                maxFontSizeMultiplier={FONT_SCALE_LIMIT.displayMaxMultiplier}
              >
                {getInitials(player.name)}
              </Text>
            </View>

            <View style={styles.playerMeta}>
              <Text
                numberOfLines={1}
                style={styles.playerName}
                allowFontScaling
                maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
              >
                {player.name}
              </Text>
              {player.positionLabel ? (
                <Text
                  style={styles.positionLabel}
                  allowFontScaling
                  maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
                >
                  {player.positionLabel}
                </Text>
              ) : null}
            </View>

            <View style={styles.rightMeta}>
              <LevelBadge level={player.level} compact />
              <Text
                style={styles.playerElo}
                allowFontScaling
                maxFontSizeMultiplier={FONT_SCALE_LIMIT.defaultMaxMultiplier}
              >
                {player.elo}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: PALETTE.surface.card,
    borderRadius: RADIUS.card,
    borderWidth: 1.5,
    padding: SPACING.md,
    gap: SPACING.sm + 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.sm,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  teamDot: {
    width: 10,
    height: 10,
    borderRadius: RADIUS.pill,
  },
  teamTitle: {
    ...TYPOGRAPHY.cardTitle,
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  eloPill: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
  },
  eloPillText: {
    ...TYPOGRAPHY.badge,
    fontVariant: ["tabular-nums"],
  },
  swapBtn: {
    minWidth: TOUCH.minTarget - 12,
    minHeight: TOUCH.minTarget - 12,
    borderRadius: RADIUS.sm,
    backgroundColor: PALETTE.surface.interactive,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    alignItems: "center",
    justifyContent: "center",
  },
  playerList: {
    gap: SPACING.sm,
  },
  playerRow: {
    minHeight: TOUCH.minTarget,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PALETTE.surface.elevated,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm + 2,
  },
  playerRowPressed: {
    backgroundColor: PALETTE.surface.interactive,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...TYPOGRAPHY.caption,
    fontWeight: "700",
  },
  playerMeta: {
    flex: 1,
    gap: 2,
  },
  playerName: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: "700",
    color: PALETTE.text.primary,
  },
  positionLabel: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: PALETTE.text.muted,
  },
  rightMeta: {
    alignItems: "flex-end",
    gap: 3,
  },
  playerElo: {
    ...TYPOGRAPHY.caption,
    fontWeight: "700",
    color: PALETTE.text.secondary,
    fontVariant: ["tabular-nums"],
  },
});

