import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  BottomTabBar,
  ChartIcon,
  CourtDiagram,
  CourtNavIcon,
  EmptyState,
  Header,
  LevelBadge,
  NeonCTAButton,
  SecondaryButton,
  ShuttleIcon,
  Skeleton,
  StatusPill,
  Toast,
  ToastVariant,
  UserIcon,
  UsersIcon,
} from "../../components";
import { RULES } from "../../config/rules";
import { RosterMember } from "../../domain/types";
import { useAuth, useHaptics, useSession } from "../../hooks";
import { PALETTE, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "../../theme";
import { getTapCounterState, recordOnCourtTap } from "../../utils/tapCounter";

export interface CourtHomeScreenProps {
  initialSessionId?: string;
  showBottomTabBar?: boolean;
}

const SESSION_SCENARIOS = [
  {
    id: "session_tienson_05",
    shortLabel: "Tiên Sơn (2 sân • Chuẩn Figma)",
  },
  {
    id: "session_odd_04",
    shortLabel: "Sơn Trà (2 sân • Ca lẻ 5 & 7 người)",
  },
  {
    id: "session_full_03",
    shortLabel: "Quân Khu 5 (1 sân • Đủ 8 người)",
  },
] as const;

const REST_MINUTES_LABELS = [
  "Nghỉ 25p",
  "Nghỉ 22p",
  "Nghỉ 18p",
  "Nghỉ 15p",
  "Nghỉ 10p",
  "Nghỉ 8p",
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "VĐ";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function CourtHomeScreen({
  initialSessionId = "session_tienson_05",
  showBottomTabBar = true,
}: CourtHomeScreenProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { enabled: hapticsEnabled, trigger } = useHaptics(true);

  const [activeSessionId, setActiveSessionId] = useState<string>(initialSessionId);
  const [activeTab, setActiveTab] = useState<string>("court");
  const [toast, setToast] = useState<{
    visible: boolean;
    variant: ToastVariant;
    message: string;
  }>({
    visible: false,
    variant: "info",
    message: "",
  });

  const { session, courts, matches, loading, error } = useSession(activeSessionId);

  // Cưỡng chế nghiêm ngặt CR-01: Tối đa 2 sân/kèo, không bao giờ hiển thị sân thứ 3
  const visibleCourts = useMemo(
    () => courts.slice(0, RULES.MAX_COURTS_PER_SESSION),
    [courts]
  );

  const court1 = visibleCourts[0] ?? null;
  const court2 = visibleCourts[1] ?? null;

  const court1Members = useMemo<RosterMember[]>(() => {
    if (!court1) return [];
    return Object.values(court1.roster).slice(0, RULES.COURT_CAPACITY);
  }, [court1]);

  const court2Members = useMemo<RosterMember[]>(() => {
    if (!court2) return [];
    return Object.values(court2.roster).slice(0, RULES.COURT_CAPACITY);
  }, [court2]);

  const totalPresentPlayers = useMemo(() => {
    const uniqueIds = new Set<string>();
    for (const c of visibleCourts) {
      Object.keys(c.roster)
        .slice(0, RULES.COURT_CAPACITY)
        .forEach((uid) => uniqueIds.add(uid));
    }
    return uniqueIds.size;
  }, [visibleCourts]);

  // 6 chip người chơi ưu tiên ở hàng đợi chờ (lấy từ danh sách tham gia kèo hiện tại)
  const waitingPriorityPlayers = useMemo<RosterMember[]>(() => {
    const merged: RosterMember[] = [];
    const seen = new Set<string>();
    for (const c of visibleCourts) {
      for (const m of Object.values(c.roster)) {
        if (!seen.has(m.memberId)) {
          seen.add(m.memberId);
          merged.push(m);
        }
      }
    }
    return merged.slice(0, 6);
  }, [visibleCourts]);

  // Tỷ số trực tiếp trên Sân 02
  const court2LiveMatch = useMemo(() => {
    if (!court2) return null;
    return (
      matches.find((m) => m.courtId === court2.id && m.status === "playing") ??
      matches.find((m) => m.status === "playing") ??
      null
    );
  }, [court2, matches]);

  const liveScoreA = court2LiveMatch?.sets?.[0]?.scoreA ?? 18;
  const liveScoreB = court2LiveMatch?.sets?.[0]?.scoreB ?? 15;

  const handleStartDivideCourt = (courtId: string, label: string) => {
    trigger("selectPlayer");
    recordOnCourtTap("home", label);
    router.push({
      pathname: "/court/select-players",
      params: { sessionId: activeSessionId, courtId },
    } as never);
  };

  const handleWaitingChipPress = (member: RosterMember) => {
    trigger("selectPlayer");
    recordOnCourtTap("home", `Chọn nhanh ${member.displayName} [CHẠM 1]`);
    router.push({
      pathname: "/court/select-players",
      params: {
        sessionId: activeSessionId,
        courtId: court1?.id ?? "1",
        focusMemberId: member.memberId,
      },
    } as never);
  };

  const handleTabSelect = (key: string) => {
    setActiveTab(key);
    if (key === "partners") {
      router.push("/(tabs)/partners" as never);
    } else if (key === "history") {
      router.push("/(tabs)/history" as never);
    } else if (key === "profile") {
      router.push("/(tabs)/profile" as never);
    }
  };

  const tapCount = getTapCounterState().currentTaps;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      {/* Header tên sân, trạng thái, nút thông báo và avatar (Figma 1:3267) */}
      <Header
        title={session?.venueName ?? "Sân Cầu Lông Tiên Sơn - Đà Nẵng"}
        subtitle={session?.address ?? "Quận Hải Châu, Đà Nẵng"}
        status={{ variant: "live", label: "TRỰC TIẾP TẠI SÂN" }}
        notificationCount={3}
        onNotificationPress={() =>
          setToast({
            visible: true,
            variant: "info",
            message: "Có 3 vãng lai mới đang chờ duyệt tại sân",
          })
        }
        userName={user?.displayName ?? "Đào Duy Nhật"}
        onAvatarPress={() => router.push("/(tabs)/profile" as never)}
      />

      {toast.visible ? (
        <View style={styles.toastWrap}>
          <Toast
            visible={toast.visible}
            variant={toast.variant}
            message={toast.message}
            onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
          />
        </View>
      ) : null}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Thanh chuyển nhanh kịch bản kèo (2 sân chuẩn Figma, Ca lẻ 5 & 7 người, Đủ 8 người) */}
        <View style={styles.scenarioBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scenarioScrollContent}
          >
            <Pressable
              testID="btn-go-lobby-list"
              onPress={() => router.push("/lobby" as never)}
              style={styles.scenarioChip}
            >
              <Text style={styles.scenarioChipText}>🌐 Kèo Giao Lưu</Text>
            </Pressable>
            {SESSION_SCENARIOS.map((sc) => {
              const isSelected = sc.id === activeSessionId;
              return (
                <Pressable
                  key={sc.id}
                  testID={`scenario-pill-${sc.id}`}
                  accessibilityRole="button"
                  onPress={() => {
                    trigger("selectPlayer");
                    setActiveSessionId(sc.id);
                  }}
                  style={[
                    styles.scenarioPill,
                    isSelected && styles.scenarioPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.scenarioPillText,
                      isSelected && styles.scenarioPillTextActive,
                    ]}
                    maxFontSizeMultiplier={1.3}
                  >
                    {sc.shortLabel}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Layer 1: Header Thông Tin Kèo Context (Giờ, Số người, Trạng thái LIVE - Figma 1:3102) */}
        <View style={styles.sessionContextCard} testID="session-context-header">
          <View style={styles.sessionTopRow}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.sessionTitle} maxFontSizeMultiplier={1.3}>
                {session?.title ?? "Tối T3 • Sân Tiên Sơn"}
              </Text>
              <Text style={styles.sessionTimeText} maxFontSizeMultiplier={1.3}>
                19:00 - 21:00 • Tối đa {RULES.MAX_COURTS_PER_SESSION} sân/kèo,{" "}
                {RULES.COURT_CAPACITY} người/sân
              </Text>
            </View>
            <StatusPill variant="live" label="LIVE • ĐANG HOẠT ĐỘNG" />
          </View>

          <View style={styles.sessionMetaRow}>
            <View style={styles.sessionMetaLeft}>
              <Text style={styles.sessionMetaHighlight} maxFontSizeMultiplier={1.3}>
                👥 {totalPresentPlayers} VĐV có mặt
              </Text>
              <Text style={styles.sessionMetaDot}>•</Text>
              <Text
                style={styles.sessionMetaCourts}
                testID="session-court-count-label"
                maxFontSizeMultiplier={1.3}
              >
                {visibleCourts.length} sân sẵn sàng (CR-01 ≤ 2 sân)
              </Text>
            </View>
            <Text style={styles.sessionCodeText} maxFontSizeMultiplier={1.2}>
              PHIÊN #04 • Chạm: {tapCount}/3
            </Text>
          </View>
        </View>

        {loading && visibleCourts.length === 0 ? (
          <View style={styles.skeletonWrap}>
            <Skeleton width="100%" height={220} borderRadius={16} />
            <Skeleton width="100%" height={134} borderRadius={16} />
          </View>
        ) : error && visibleCourts.length === 0 ? (
          <EmptyState
            title="Không thể tải dữ liệu sân đấu"
            description={error}
            actionLabel="THỬ LẠI"
            onActionPress={() => setActiveSessionId("session_tienson_05")}
          />
        ) : (
          <>
            {/* Layer 2.1: Thẻ Sân 01 (Đang trống, sơ đồ sân SVG, nút lớn "Bắt đầu chia" cao 58px - Figma 1:3124) */}
            {court1 ? (
              <View style={styles.court1Card} testID="court-card-1">
                <View style={styles.courtCardHeader}>
                  <View style={styles.courtTitleRow}>
                    <View style={styles.neonDot} />
                    <Text style={styles.courtTitleText} maxFontSizeMultiplier={1.3}>
                      SÂN 01
                    </Text>
                    <View style={styles.capacityBadge}>
                      <Text style={styles.capacityBadgeText} maxFontSizeMultiplier={1.2}>
                        {court1Members.length}/{RULES.COURT_CAPACITY} người
                      </Text>
                    </View>
                  </View>
                  <StatusPill variant="empty" label="SÂN 01 • ĐANG TRỐNG" />
                </View>

                {/* Sơ đồ sân SVG + Nhãn giữa sân */}
                <View style={styles.diagramContainer}>
                  <CourtDiagram courtName="Sân 01" status="empty" />
                  <View style={styles.diagramReadyPill} pointerEvents="none">
                    <Text style={styles.diagramReadyText} maxFontSizeMultiplier={1.2}>
                      🏁 Sẵn sàng ghép cặp đấu mới (4–8 VĐV)
                    </Text>
                  </View>
                </View>

                {/* Nút lớn "Bắt đầu chia" cao 58px trong vùng ngón cái */}
                <NeonCTAButton
                  testID="start-divide-court-1-btn"
                  label="CHIA KÈO SÂN 1 (BẮT ĐẦU CHIA)"
                  subtitle="[CHẠM 1]"
                  icon={<ShuttleIcon size={18} color={PALETTE.brand.neonTextDark} />}
                  hapticsEnabled={hapticsEnabled}
                  onPress={() =>
                    handleStartDivideCourt(
                      court1.id,
                      "CHIA KÈO SÂN 1 [CHẠM 1]"
                    )
                  }
                />
              </View>
            ) : null}

            {/* Layer 2.2: Thẻ Sân 02 (Đang thi đấu, đội hình hai bên, tỷ số trực tiếp - Figma 1:3149) */}
            {court2 ? (
              <View style={styles.court2Card} testID="court-card-2">
                <View style={styles.courtCardHeader}>
                  <View style={styles.courtTitleRow}>
                    <View style={styles.cyanDot} />
                    <Text style={styles.courtTitleText} maxFontSizeMultiplier={1.3}>
                      SÂN 02
                    </Text>
                    <View style={styles.capacityBadge}>
                      <Text style={styles.capacityBadgeText} maxFontSizeMultiplier={1.2}>
                        {court2Members.length}/{RULES.COURT_CAPACITY} người
                      </Text>
                    </View>
                  </View>
                  <StatusPill
                    variant="playing"
                    label="⏱ 14:20 • SÂN 02 ĐANG THI ĐẤU"
                  />
                </View>

                {/* Đội hình hai bên & Tỷ số trực tiếp */}
                <View style={styles.liveMatchBox}>
                  <View style={styles.liveTeamsColumn}>
                    <View style={styles.liveTeamRow}>
                      <View style={styles.teamADot} />
                      <Text
                        style={styles.liveTeamNames}
                        numberOfLines={1}
                        maxFontSizeMultiplier={1.3}
                      >
                        Minh / Hùng
                      </Text>
                      <LevelBadge level={4} compact showRange={false} />
                    </View>
                    <View style={styles.liveTeamRow}>
                      <View style={styles.teamBDot} />
                      <Text
                        style={styles.liveTeamNames}
                        numberOfLines={1}
                        maxFontSizeMultiplier={1.3}
                      >
                        Lan / Tuấn
                      </Text>
                      <LevelBadge level={4} compact showRange={false} />
                    </View>
                  </View>

                  <View
                    style={styles.liveScoreSplitBadge}
                    testID="court-2-live-score"
                    accessibilityLabel={`Tỷ số trực tiếp Sân 02: Đội A ${liveScoreA}, Đội B ${liveScoreB}`}
                  >
                    <View style={styles.scoreCellA}>
                      <Text style={styles.scoreTextA} maxFontSizeMultiplier={1.2}>
                        {liveScoreA}
                      </Text>
                    </View>
                    <Text style={styles.scoreDash}>-</Text>
                    <View style={styles.scoreCellB}>
                      <Text style={styles.scoreTextB} maxFontSizeMultiplier={1.2}>
                        {liveScoreB}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Nút phụ mở chọn người/cân trình cho Sân 02 (hỗ trợ kiểm thử ca lẻ 7 người ở Sân 02) */}
                <SecondaryButton
                  testID="select-players-court-2-btn"
                  label={`Chọn người & Cân trình Sân 02 (${court2Members.length}/8 người)`}
                  variant="outline"
                  hapticsEnabled={hapticsEnabled}
                  onPress={() =>
                    handleStartDivideCourt(
                      court2.id,
                      "CHIA KÈO SÂN 2 [CHẠM 1]"
                    )
                  }
                />
              </View>
            ) : null}

            {/* Layer 3: Hàng đợi chờ với 6 chip người chơi nhanh (Figma 1:3184) */}
            <View style={styles.waitingSection} testID="waiting-queue-section">
              <View style={styles.waitingHeaderRow}>
                <Text style={styles.waitingTitle} maxFontSizeMultiplier={1.3}>
                  ⏳ Hàng đợi ưu tiên
                </Text>
                <Text style={styles.waitingSortLabel} maxFontSizeMultiplier={1.2}>
                  SẮP XẾP: NGHỈ LÂU
                </Text>
              </View>

              <View style={styles.waitingChipsGrid}>
                {waitingPriorityPlayers.map((player, index) => (
                  <Pressable
                    key={player.memberId}
                    testID={`waiting-chip-${index}`}
                    accessibilityRole="button"
                    accessibilityLabel={`${player.displayName}, Cấp ${player.level}, ${REST_MINUTES_LABELS[index] ?? "Đang chờ"}`}
                    onPress={() => handleWaitingChipPress(player)}
                    style={({ pressed }) => [
                      styles.waitingChip,
                      pressed && styles.waitingChipPressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.waitingAvatar,
                        index % 2 === 0
                          ? styles.waitingAvatarWarm
                          : styles.waitingAvatarCyan,
                      ]}
                    >
                      <Text style={styles.waitingAvatarText} maxFontSizeMultiplier={1.2}>
                        {getInitials(player.displayName)}
                      </Text>
                    </View>
                    <View style={styles.waitingNameCol}>
                      <Text
                        style={styles.waitingPlayerName}
                        numberOfLines={1}
                        maxFontSizeMultiplier={1.3}
                      >
                        {player.displayName}
                      </Text>
                      <Text
                        style={styles.waitingRestSub}
                        numberOfLines={1}
                        maxFontSizeMultiplier={1.2}
                      >
                        {REST_MINUTES_LABELS[index] ?? "Đang chờ"}
                      </Text>
                    </View>
                    <LevelBadge
                      level={player.level}
                      compact
                      showRange={false}
                    />
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Thanh điều hướng dưới 4 tab (Figma 1:3284) */}
      {showBottomTabBar ? (
        <View style={styles.bottomTabWrap} testID="court-bottom-tab-bar">
          <BottomTabBar
            activeKey={activeTab}
            onSelect={handleTabSelect}
            hapticsEnabled={hapticsEnabled}
            items={[
              {
                key: "court",
                label: "Sân đấu",
                renderIcon: (active) => (
                  <CourtNavIcon
                    size={18}
                    color={active ? PALETTE.brand.neonGlow : PALETTE.text.muted}
                  />
                ),
              },
              {
                key: "partners",
                label: "Hàng đợi",
                renderIcon: (active) => (
                  <UsersIcon
                    size={18}
                    color={active ? PALETTE.brand.neonGlow : PALETTE.text.muted}
                  />
                ),
              },
              {
                key: "history",
                label: "Bảng điểm",
                renderIcon: (active) => (
                  <ChartIcon
                    size={18}
                    color={active ? PALETTE.brand.neonGlow : PALETTE.text.muted}
                  />
                ),
              },
              {
                key: "profile",
                label: "Hồ sơ",
                renderIcon: (active) => (
                  <UserIcon
                    size={18}
                    color={active ? PALETTE.brand.neonGlow : PALETTE.text.muted}
                  />
                ),
              },
            ]}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

export default function CourtHomeRoute() {
  return <CourtHomeScreen showBottomTabBar />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PALETTE.bg.canvas,
  },
  toastWrap: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xs,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  scenarioBar: {
    marginBottom: 2,
  },
  scenarioScrollContent: {
    gap: SPACING.xs,
  },
  scenarioPill: {
    minHeight: 38,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    backgroundColor: PALETTE.surface.card,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    justifyContent: "center",
  },
  scenarioPillActive: {
    backgroundColor: "rgba(163, 230, 54, 0.14)",
    borderColor: PALETTE.brand.neonLime,
  },
  scenarioPillText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
  },
  scenarioPillTextActive: {
    color: PALETTE.brand.neonLime,
    fontWeight: "700",
  },
  sessionContextCard: {
    backgroundColor: PALETTE.surface.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    gap: SPACING.sm,
  },
  sessionTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: SPACING.sm,
  },
  sessionTitle: {
    ...TYPOGRAPHY.screenTitle,
    color: PALETTE.text.primary,
  },
  sessionTimeText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
  },
  sessionMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: SPACING.xs,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: PALETTE.border.subtle,
  },
  sessionMetaLeft: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  sessionMetaHighlight: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.primary,
    fontWeight: "700",
  },
  sessionMetaDot: {
    color: PALETTE.text.muted,
    fontSize: 12,
  },
  sessionMetaCourts: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.brand.neonLime,
    fontWeight: "700",
  },
  sessionCodeText: {
    ...TYPOGRAPHY.badge,
    color: PALETTE.text.muted,
  },
  skeletonWrap: {
    gap: SPACING.md,
  },
  court1Card: {
    backgroundColor: PALETTE.surface.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderColor: PALETTE.border.neonActive,
    gap: SPACING.md,
    ...SHADOWS.cardSubtle,
  },
  court2Card: {
    backgroundColor: PALETTE.surface.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    gap: SPACING.md,
  },
  courtCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: SPACING.xs,
  },
  courtTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  neonDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: PALETTE.brand.neonLime,
  },
  cyanDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PALETTE.teamA.cyan,
  },
  courtTitleText: {
    ...TYPOGRAPHY.cardTitle,
    color: PALETTE.text.primary,
  },
  capacityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    backgroundColor: PALETTE.surface.elevated,
  },
  capacityBadgeText: {
    ...TYPOGRAPHY.badge,
    color: PALETTE.text.secondary,
  },
  diagramContainer: {
    position: "relative",
    justifyContent: "center",
  },
  diagramReadyPill: {
    position: "absolute",
    alignSelf: "center",
    backgroundColor: "rgba(19, 27, 46, 0.92)",
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: PALETTE.border.neonActive,
  },
  diagramReadyText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.brand.neonLime,
    fontWeight: "700",
  },
  liveMatchBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: PALETTE.surface.elevated,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  liveTeamsColumn: {
    flex: 1,
    gap: SPACING.xs,
  },
  liveTeamRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  teamADot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PALETTE.teamA.cyan,
  },
  teamBDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PALETTE.teamB.amber,
  },
  liveTeamNames: {
    ...TYPOGRAPHY.bodyBold,
    color: PALETTE.text.primary,
    flexShrink: 1,
  },
  liveScoreSplitBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  scoreCellA: {
    minWidth: 48,
    height: 42,
    borderRadius: RADIUS.sm,
    backgroundColor: PALETTE.bg.canvas,
    borderWidth: 1,
    borderColor: PALETTE.border.neonActive,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  scoreTextA: {
    ...TYPOGRAPHY.sectionTitle,
    fontSize: 22,
    lineHeight: 26,
    color: PALETTE.brand.neonLime,
    fontWeight: "800",
  },
  scoreDash: {
    ...TYPOGRAPHY.bodyBold,
    color: PALETTE.text.muted,
  },
  scoreCellB: {
    minWidth: 48,
    height: 42,
    borderRadius: RADIUS.sm,
    backgroundColor: PALETTE.bg.canvas,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  scoreTextB: {
    ...TYPOGRAPHY.sectionTitle,
    fontSize: 22,
    lineHeight: 26,
    color: PALETTE.text.primary,
    fontWeight: "800",
  },
  waitingSection: {
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  waitingHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  waitingTitle: {
    ...TYPOGRAPHY.cardTitle,
    color: PALETTE.text.primary,
  },
  waitingSortLabel: {
    ...TYPOGRAPHY.badge,
    color: PALETTE.text.secondary,
  },
  waitingChipsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: SPACING.sm,
  },
  waitingChip: {
    width: "48.5%",
    minHeight: 58,
    backgroundColor: PALETTE.surface.card,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  waitingChipPressed: {
    borderColor: PALETTE.brand.neonLime,
    backgroundColor: PALETTE.surface.elevated,
  },
  waitingAvatar: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  waitingAvatarWarm: {
    backgroundColor: "rgba(255, 183, 131, 0.2)",
  },
  waitingAvatarCyan: {
    backgroundColor: "rgba(123, 208, 255, 0.2)",
  },
  waitingAvatarText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.primary,
    fontWeight: "800",
  },
  waitingNameCol: {
    flex: 1,
    gap: 2,
  },
  waitingPlayerName: {
    ...TYPOGRAPHY.caption,
    fontSize: 13,
    color: PALETTE.text.primary,
    fontWeight: "700",
  },
  waitingRestSub: {
    ...TYPOGRAPHY.badge,
    color: PALETTE.text.muted,
    textTransform: "none",
  },
  bottomTabWrap: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xs,
    paddingTop: 4,
    backgroundColor: PALETTE.bg.canvas,
  },
});

