import React, { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  BalanceMeter,
  CourtDiagram,
  EmptyState,
  Header,
  LevelBadge,
  NeonCTAButton,
  ProgressDots,
  SecondaryButton,
  ShuttleIcon,
  Skeleton,
  StatusPill,
  SwapIcon,
  Toast,
  ToastVariant,
} from "../../components";
import { RULES } from "../../config/rules";
import { getRepository } from "../../data";
import {
  balanceCourt,
  BalancingMember,
  BalancingResult,
  MatchPlan,
  swapPlayers,
} from "../../domain/balancing";
import { CourtCategory, RosterMember } from "../../domain/types";
import { useAuth, useCourtKeepAwake, useHaptics, useSession } from "../../hooks";
import { PALETTE, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "../../theme";
import { getTapCounterState, recordOnCourtTap } from "../../utils/tapCounter";

export interface BalanceConfirmScreenProps {
  initialSessionId?: string;
  initialCourtId?: string;
  initialSelectedIds?: string[];
  candidatesOverride?: RosterMember[];
  initialCategory?: CourtCategory;
  onMatchConfirmed?: (matchId: string) => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "VĐ";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getPositionLabel(pos?: string): string {
  if (pos === "front") return "Cầu trước (Lưới)";
  if (pos === "back") return "Cầu sau (Công)";
  return "Công thủ toàn diện";
}

function getCategoryLabel(cat: CourtCategory): string {
  if (cat === "men") return "Đôi nam";
  if (cat === "women") return "Đôi nữ";
  return "Đôi nam nữ";
}

export function BalanceConfirmScreen({
  initialSessionId,
  initialCourtId,
  initialSelectedIds,
  candidatesOverride,
  initialCategory,
  onMatchConfirmed,
}: BalanceConfirmScreenProps) {
  const router = useRouter();
  useCourtKeepAwake("balance-confirm");
  const params = useLocalSearchParams<{
    sessionId?: string;
    courtId?: string;
    selectedIds?: string;
  }>();
  const { user } = useAuth();
  const { enabled: hapticsEnabled, trigger } = useHaptics(true);

  const sessionId = initialSessionId ?? params.sessionId ?? "session_tienson_05";
  const paramCourtId = initialCourtId ?? params.courtId ?? "1";

  const { session, courts, matches, loading } = useSession(sessionId);

  // Cưỡng chế CR-01: Tối đa 2 sân/kèo
  const visibleCourts = useMemo(
    () => courts.slice(0, RULES.MAX_COURTS_PER_SESSION),
    [courts]
  );

  const [activeCourtId, setActiveCourtId] = useState<string>(paramCourtId);
  const [seed, setSeed] = useState<number>(42);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [swapFirstId, setSwapFirstId] = useState<string | null>(null);
  const [customMatch, setCustomMatch] = useState<MatchPlan | null>(null);
  const [swapWarning, setSwapWarning] = useState<string | null>(null);
  const [measuredMs, setMeasuredMs] = useState<number>(0);
  const [toast, setToast] = useState<{
    visible: boolean;
    variant: ToastVariant;
    message: string;
  }>({
    visible: false,
    variant: "info",
    message: "",
  });

  const activeCourt = useMemo(
    () =>
      visibleCourts.find((c) => c.id === activeCourtId) ??
      visibleCourts[0] ??
      null,
    [visibleCourts, activeCourtId]
  );

  // Tập ứng viên của sân đang chọn (giới hạn tối đa 8 người/sân theo CR-01)
  const courtMembers = useMemo<RosterMember[]>(() => {
    if (candidatesOverride) {
      return candidatesOverride.slice(0, RULES.COURT_CAPACITY);
    }

    // Nếu có selectedIds truyền từ Màn 02 và đang xem đúng sân truyền vào
    const rawParamIds = params.selectedIds
      ? params.selectedIds.split(",").filter(Boolean)
      : initialSelectedIds;

    const allInSession: RosterMember[] = [];
    const seen = new Set<string>();
    if (activeCourt) {
      for (const m of Object.values(activeCourt.roster)) {
        if (!seen.has(m.memberId)) {
          seen.add(m.memberId);
          allInSession.push(m);
        }
      }
    }
    for (const c of visibleCourts) {
      for (const m of Object.values(c.roster)) {
        if (!seen.has(m.memberId)) {
          seen.add(m.memberId);
          allInSession.push(m);
        }
      }
    }

    if (
      rawParamIds &&
      rawParamIds.length >= RULES.PLAYERS_PER_MATCH &&
      activeCourtId === paramCourtId
    ) {
      const byId = new Map(allInSession.map((m) => [m.memberId, m]));
      const resolved = rawParamIds
        .map((id) => byId.get(id))
        .filter((m): m is RosterMember => Boolean(m))
        .slice(0, RULES.COURT_CAPACITY);
      if (resolved.length >= RULES.PLAYERS_PER_MATCH) {
        return resolved;
      }
    }

    if (activeCourt) {
      return Object.values(activeCourt.roster).slice(0, RULES.COURT_CAPACITY);
    }
    return [];
  }, [
    candidatesOverride,
    params.selectedIds,
    initialSelectedIds,
    activeCourt,
    visibleCourts,
    activeCourtId,
    paramCourtId,
  ]);

  const memberById = useMemo(
    () => new Map(courtMembers.map((m) => [m.memberId, m])),
    [courtMembers]
  );

  const effectiveCategory = useMemo<CourtCategory>(() => {
    if (initialCategory) return initialCategory;
    const courtCat = activeCourt?.category ?? "mixed";
    if (courtCat === "mixed") {
      const males = courtMembers.filter((m) => m.gender === "M").length;
      const females = courtMembers.filter((m) => m.gender === "F").length;
      if (males >= 2 && females >= 2) return "mixed";
      return "men";
    }
    return courtCat;
  }, [initialCategory, activeCourt, courtMembers]);

  // Chạy thuật toán balanceCourt của TV1 độc lập cho sân đang chọn (4..8 người)
  const balanceResult = useMemo<BalancingResult | null>(() => {
    if (
      courtMembers.length < RULES.PLAYERS_PER_MATCH ||
      courtMembers.length > RULES.COURT_CAPACITY
    ) {
      return null;
    }
    const members: BalancingMember[] = courtMembers.map((m) => ({
      id: m.memberId,
      name: m.displayName,
      gender: m.gender,
      rating: m.rating,
      position: m.position,
      dominantHand: m.dominantHand,
    }));

    const t0 =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    const res = balanceCourt(members, {
      category: effectiveCategory,
      mode: "rotate",
      seed,
      targetMatches: courtMembers.length > RULES.PLAYERS_PER_MATCH ? courtMembers.length : 1,
      maxDiffWarn: 200,
    });
    const t1 =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    const elapsed = Math.max(0.01, Math.round((t1 - t0) * 100) / 100);
    // Dùng executionTimeMs từ thuật toán nếu có, hoặc elapsed đo thực tế
    return {
      ...res,
      executionTimeMs: res.executionTimeMs > 0 ? res.executionTimeMs : elapsed,
    };
  }, [courtMembers, effectiveCategory, seed]);

  // Reset manual swap khi đổi sân, đổi danh sách hoặc bấm Xáo lại
  useEffect(() => {
    setCustomMatch(null);
    setSwapFirstId(null);
    setSwapWarning(null);
    if (balanceResult) {
      setMeasuredMs(balanceResult.executionTimeMs);
    }
  }, [balanceResult]);

  const currentMatch = customMatch ?? balanceResult?.matches?.[0] ?? null;

  const teamAPercent = useMemo(() => {
    if (!currentMatch) return 50;
    const total = currentMatch.ratingA + currentMatch.ratingB;
    if (total <= 0) return 50;
    return Math.round((currentMatch.ratingA / total) * 100);
  }, [currentMatch]);

  const teamBPercent = 100 - teamAPercent;
  const diffPercent = Math.abs(teamAPercent - teamBPercent);

  const activeWarning =
    swapWarning ??
    currentMatch?.warning ??
    balanceResult?.warnings?.[0] ??
    null;

  // Chạm người thứ 1 -> chạm người thứ 2 -> gọi swapPlayers (không chặn host dù mất cân bằng)
  const handlePlayerTapForSwap = (playerId: string) => {
    if (!currentMatch) return;
    trigger("selectPlayer");

    if (!swapFirstId) {
      setSwapFirstId(playerId);
      return;
    }
    if (swapFirstId === playerId) {
      setSwapFirstId(null);
      return;
    }

    const res = swapPlayers(
      currentMatch,
      swapFirstId,
      playerId,
      effectiveCategory,
      200
    );
    setCustomMatch(res.match);
    setSwapFirstId(null);
    setSwapWarning(res.warning ?? null);
    trigger("swapTeam");

    if (res.warning) {
      setToast({
        visible: true,
        variant: "warning",
        message: res.warning,
      });
    } else {
      setToast({
        visible: true,
        variant: "info",
        message: `Đã đổi chỗ 2 VĐV • Lệch mới: ${res.match.diff} Elo`,
      });
    }
  };

  // Nút VS đổi chéo: hoán đổi chéo Đội A[1] ↔ Đội B[1] để đổi cặp nhanh trong 1 chạm
  const handleVsCrossSwap = () => {
    if (!currentMatch) return;
    trigger("swapTeam");
    const pA = currentMatch.teamAIds[1];
    const pB = currentMatch.teamBIds[1];
    const res = swapPlayers(currentMatch, pA, pB, effectiveCategory, 200);
    setCustomMatch(res.match);
    setSwapFirstId(null);
    setSwapWarning(res.warning ?? null);
    if (res.warning) {
      setToast({
        visible: true,
        variant: "warning",
        message: res.warning,
      });
    } else {
      setToast({
        visible: true,
        variant: "info",
        message: `Đã đổi chéo 2 đội • Lệch mới: ${res.match.diff} Elo`,
      });
    }
  };

  const handleReshuffle = () => {
    trigger("selectPlayer");
    setSeed((prev) => prev + 17);
    setToast({
      visible: true,
      variant: "info",
      message: "Đã xáo lại phương án chia cặp tối ưu mới",
    });
  };

  const handleConfirmMatch = async () => {
    if (!currentMatch || submitting) return;
    setSubmitting(true);
    trigger("scorePoint");
    try {
      const repo = getRepository();
      const targetCourtId = activeCourt?.id ?? paramCourtId;
      const courtMatches = matches.filter((m) => m.courtId === targetCourtId);
      const nextIndex = courtMatches.length + 1;

      const {
        enqueueOfflineAction,
        getNetworkMonitorState,
        updateSnapshotRound,
      } = require("../../data/offline") as typeof import("../../data/offline");

      let matchId: string;
      if (!getNetworkMonitorState().isOnline) {
        matchId = `local_match_${Date.now()}`;
        await enqueueOfflineAction({
          sessionId,
          courtId: targetCourtId,
          actionType: "GENERATE_ROUND",
          version: activeCourt?.version ?? 1,
          idempotencyKey: `round_${sessionId}_${targetCourtId}_${nextIndex}`,
          payload: {
            roundIndex: nextIndex,
            category: effectiveCategory,
            teamA: currentMatch.teamAIds,
            teamB: currentMatch.teamBIds,
          },
        });
      } else {
        matchId = await repo.createMatch({
          sessionId,
          courtId: targetCourtId,
          index: nextIndex,
          teamA: currentMatch.teamAIds,
          teamB: currentMatch.teamBIds,
          sets: [],
        });
      }

      await updateSnapshotRound(sessionId, targetCourtId, nextIndex, {
        matchId,
        courtId: targetCourtId,
        roundIndex: nextIndex,
        teamA: currentMatch.teamAIds,
        teamB: currentMatch.teamBIds,
        restingPlayerIds: currentMatch.restingIds ?? [],
      });

      recordOnCourtTap("confirm", "VÀO SÂN NGAY [CHẠM 3]");
      if (onMatchConfirmed) {
        onMatchConfirmed(matchId);
      }

      router.push({
        pathname: "/court/score",
        params: {
          matchId,
          sessionId,
          courtId: targetCourtId,
        },
      } as never);
    } catch (err) {
      setToast({
        visible: true,
        variant: "error",
        message:
          err instanceof Error
            ? err.message
            : "Không thể lưu cặp đấu. Vui lòng thử lại.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const tapCount = getTapCounterState().currentTaps;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <Header
        title="CHI TIẾT TRẬN ĐẤU"
        subtitle={`${session?.venueName ?? "Sân Cầu Lông Tiên Sơn"} • Sân 0${activeCourt?.courtNumber ?? 1} (${getCategoryLabel(effectiveCategory)})`}
        onBackPress={() => router.back()}
        userName={user?.displayName ?? "Đào Duy Nhật"}
      />

      <View style={styles.progressWrap} testID="confirm-progress-dots">
        <ProgressDots currentStep={3} totalSteps={3} />
      </View>

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
        {/* Chuyển giữa Sân 01 và Sân 02 đối với kèo có 2 sân (CR-01) */}
        {visibleCourts.length > 1 ? (
          <View style={styles.courtSwitchRow} testID="two-court-switcher">
            {visibleCourts.map((c) => {
              const active = c.id === (activeCourt?.id ?? visibleCourts[0].id);
              const count = Math.min(
                Object.keys(c.roster).length,
                RULES.COURT_CAPACITY
              );
              return (
                <Pressable
                  key={c.id}
                  testID={`switch-court-${c.id}`}
                  accessibilityRole="button"
                  onPress={() => {
                    trigger("selectPlayer");
                    setActiveCourtId(c.id);
                  }}
                  style={[
                    styles.courtSwitchBtn,
                    active && styles.courtSwitchBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.courtSwitchText,
                      active && styles.courtSwitchTextActive,
                    ]}
                    maxFontSizeMultiplier={1.2}
                  >
                    Sân 0{c.courtNumber} ({count}/{RULES.COURT_CAPACITY} VĐV)
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {loading && !currentMatch ? (
          <View style={{ gap: SPACING.md }}>
            <Skeleton width="100%" height={110} borderRadius={16} />
            <Skeleton width="100%" height={160} borderRadius={16} />
            <Skeleton width="100%" height={160} borderRadius={16} />
          </View>
        ) : !currentMatch ? (
          <EmptyState
            title="Chưa đủ 4 VĐV trên sân"
            description="Cần tối thiểu 4 người và tối đa 8 người trên mỗi sân để thuật toán chia cặp cân bằng."
            actionLabel="CHỌN LẠI NGƯỜI CHƠI"
            onActionPress={() => router.back()}
          />
        ) : (
          <>
            {/* Huy hiệu Thuật toán tối ưu + Tỷ lệ dự đoán & Thanh cân bằng (Figma 1:3440) */}
            <View style={styles.predictionHeroCard} testID="prediction-hero-card">
              <View style={styles.algoBadge} testID="optimal-algo-badge">
                <Text style={styles.algoBadgeText} maxFontSizeMultiplier={1.2}>
                  ✨ ĐỀ XUẤT CHIA CẶP TỐI ƯU • LỆCH TRÌNH {diffPercent}%
                </Text>
              </View>

              <View style={styles.percentRow}>
                <Text
                  style={styles.percentTeamA}
                  testID="team-a-percent"
                  maxFontSizeMultiplier={1.2}
                >
                  {teamAPercent}%
                </Text>
                <Text style={styles.percentVs} maxFontSizeMultiplier={1.2}>
                  VS
                </Text>
                <Text
                  style={styles.percentTeamB}
                  testID="team-b-percent"
                  maxFontSizeMultiplier={1.2}
                >
                  {teamBPercent}%
                </Text>
              </View>

              <Text style={styles.predictionSub} maxFontSizeMultiplier={1.3}>
                {currentMatch.diff === 0
                  ? "• Hai đội cân bằng tuyệt đối (ΔElo: 0) • Dự báo 3 set kịch tính"
                  : currentMatch.isUnbalanced
                    ? `• Độ lệch lớn (ΔElo: ${currentMatch.diff}) • Host vẫn có thể xác nhận`
                    : `• Cực kỳ cân tài (ΔElo: ${currentMatch.diff}) • Xử lý trong ${measuredMs} ms`}
              </Text>

              <BalanceMeter
                teamAPercent={teamAPercent}
                eloDiff={currentMatch.diff}
                statusLabel={`Hiệu năng: ${measuredMs} ms (< 1000ms) • Chạm ${tapCount}/3`}
              />
            </View>

            {/* Cảnh báo khi chênh lệch lớn hoặc mất cân bằng giới tính (KHÔNG chặn host) */}
            {activeWarning ? (
              <View
                style={styles.warningBanner}
                testID="unbalanced-warning-banner"
                accessibilityRole="alert"
              >
                <Text style={styles.warningText} maxFontSizeMultiplier={1.3}>
                  ⚠️ {activeWarning}
                </Text>
              </View>
            ) : null}

            {/* Hướng dẫn đổi thủ công 2 người */}
            <View style={styles.swapHintRow}>
              <Text style={styles.swapHintText} maxFontSizeMultiplier={1.2}>
                {swapFirstId
                  ? `🔄 Đang chọn ${memberById.get(swapFirstId)?.displayName ?? swapFirstId} — hãy chạm người thứ 2 để đổi chỗ`
                  : "💡 Mẹo: Chạm 2 người bất kỳ (kể cả người nghỉ) để đổi chỗ thủ công"}
              </Text>
              {swapFirstId ? (
                <Pressable
                  testID="cancel-swap-selection-btn"
                  onPress={() => setSwapFirstId(null)}
                  hitSlop={8}
                >
                  <Text style={styles.cancelSwapText}>Hủy</Text>
                </Pressable>
              ) : null}
            </View>

            {/* Thẻ ĐỘI A (ÁO SÁNG - Cyan) */}
            <View style={styles.teamACard} testID="confirm-team-a-card">
              <View style={styles.teamHeaderRow}>
                <View style={styles.teamTitleGroup}>
                  <View style={styles.dotCyan} />
                  <Text style={styles.teamATitle} maxFontSizeMultiplier={1.3}>
                    ĐỘI A (ÁO SÁNG)
                  </Text>
                </View>
                <View style={styles.eloPillA}>
                  <Text style={styles.eloPillAText} maxFontSizeMultiplier={1.2}>
                    Elo TB: {Math.round(currentMatch.ratingA / 2)} (Tổng {currentMatch.ratingA})
                  </Text>
                </View>
              </View>

              {currentMatch.teamA.map((player) => {
                const rosterInfo = memberById.get(player.id);
                const isSwapSelected = swapFirstId === player.id;
                return (
                  <Pressable
                    key={player.id}
                    testID={`swap-player-${player.id}`}
                    accessibilityRole="button"
                    accessibilityLabel={`Đổi chỗ ${player.name}, ${player.rating} Elo`}
                    onPress={() => handlePlayerTapForSwap(player.id)}
                    style={[
                      styles.playerRow,
                      isSwapSelected && styles.playerRowSelected,
                    ]}
                  >
                    <View style={styles.avatarBoxA}>
                      <Text style={styles.avatarTextA} maxFontSizeMultiplier={1.2}>
                        {getInitials(player.name)}
                      </Text>
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={styles.playerName} maxFontSizeMultiplier={1.3}>
                        {player.name}
                      </Text>
                      <View style={styles.playerMetaRow}>
                        <LevelBadge
                          level={rosterInfo?.level ?? 3}
                          compact
                          showRange={false}
                        />
                        <Text style={styles.playerPosText} maxFontSizeMultiplier={1.2}>
                          • {getPositionLabel(player.position)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.eloRightCol}>
                      <Text style={styles.eloValue} maxFontSizeMultiplier={1.2}>
                        {player.rating}
                      </Text>
                      <Text style={styles.eloSubLabel} maxFontSizeMultiplier={1.1}>
                        {isSwapSelected ? "Đang chọn" : "P-Elo"}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* Nút VS đổi chéo đặt giữa Đội A và Đội B (Figma 1:3440) */}
            <View style={styles.vsDividerWrap}>
              <View style={styles.vsLine} />
              <Pressable
                testID="vs-cross-swap-btn"
                accessibilityRole="button"
                accessibilityLabel="Đổi chéo hai đội"
                hitSlop={8}
                onPress={handleVsCrossSwap}
                style={({ pressed }) => [
                  styles.vsPillButton,
                  pressed && styles.vsPillButtonPressed,
                ]}
              >
                <Text style={styles.vsText}>VS</Text>
                <SwapIcon size={16} color={PALETTE.brand.neonLime} />
              </Pressable>
              <View style={styles.vsLine} />
            </View>

            {/* Thẻ ĐỘI B (ÁO TỐI - Hổ phách) */}
            <View style={styles.teamBCard} testID="confirm-team-b-card">
              <View style={styles.teamHeaderRow}>
                <View style={styles.teamTitleGroup}>
                  <View style={styles.dotAmber} />
                  <Text style={styles.teamBTitle} maxFontSizeMultiplier={1.3}>
                    ĐỘI B (ÁO TỐI)
                  </Text>
                </View>
                <View style={styles.eloPillB}>
                  <Text style={styles.eloPillBText} maxFontSizeMultiplier={1.2}>
                    Elo TB: {Math.round(currentMatch.ratingB / 2)} (Tổng {currentMatch.ratingB})
                  </Text>
                </View>
              </View>

              {currentMatch.teamB.map((player) => {
                const rosterInfo = memberById.get(player.id);
                const isSwapSelected = swapFirstId === player.id;
                return (
                  <Pressable
                    key={player.id}
                    testID={`swap-player-${player.id}`}
                    accessibilityRole="button"
                    accessibilityLabel={`Đổi chỗ ${player.name}, ${player.rating} Elo`}
                    onPress={() => handlePlayerTapForSwap(player.id)}
                    style={[
                      styles.playerRow,
                      isSwapSelected && styles.playerRowSelected,
                    ]}
                  >
                    <View style={styles.avatarBoxB}>
                      <Text style={styles.avatarTextB} maxFontSizeMultiplier={1.2}>
                        {getInitials(player.name)}
                      </Text>
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={styles.playerName} maxFontSizeMultiplier={1.3}>
                        {player.name}
                      </Text>
                      <View style={styles.playerMetaRow}>
                        <LevelBadge
                          level={rosterInfo?.level ?? 3}
                          compact
                          showRange={false}
                        />
                        <Text style={styles.playerPosText} maxFontSizeMultiplier={1.2}>
                          • {getPositionLabel(player.position)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.eloRightCol}>
                      <Text style={styles.eloValue} maxFontSizeMultiplier={1.2}>
                        {player.rating}
                      </Text>
                      <Text style={styles.eloSubLabel} maxFontSizeMultiplier={1.1}>
                        {isSwapSelected ? "Đang chọn" : "P-Elo"}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* Kết quả người nghỉ (ca lẻ 5 & 7, và 6/8) + Lịch xoay vòng các hiệp */}
            {currentMatch.restingMembers.length > 0 ? (
              <View style={styles.restingCard} testID="confirm-resting-section">
                <View style={styles.teamHeaderRow}>
                  <Text style={styles.restingTitle} maxFontSizeMultiplier={1.3}>
                    ⏳ NGƯỜI NGHỈ HIỆP 1 ({currentMatch.restingMembers.length} VĐV)
                  </Text>
                  <StatusPill
                    variant="warning"
                    label={
                      courtMembers.length === 5 || courtMembers.length === 7
                        ? `Ca lẻ ${courtMembers.length} người`
                        : `${courtMembers.length} người`
                    }
                  />
                </View>

                <View style={styles.restingChipsRow}>
                  {currentMatch.restingMembers.map((rp) => {
                    const isSwapSelected = swapFirstId === rp.id;
                    return (
                      <Pressable
                        key={rp.id}
                        testID={`swap-player-${rp.id}`}
                        accessibilityRole="button"
                        onPress={() => handlePlayerTapForSwap(rp.id)}
                        style={[
                          styles.restingChip,
                          isSwapSelected && styles.playerRowSelected,
                        ]}
                      >
                        <Text style={styles.restingChipText} maxFontSizeMultiplier={1.2}>
                          {rp.name} ({rp.rating})
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {balanceResult && balanceResult.matches.length > 1 ? (
                  <View style={styles.scheduleList} testID="rotation-schedule-list">
                    <Text style={styles.scheduleHeading} maxFontSizeMultiplier={1.2}>
                      Lịch nghỉ luân phiên công bằng ({balanceResult.matches.length} hiệp):
                    </Text>
                    {balanceResult.matches.map((m) => (
                      <Text
                        key={m.matchIndex}
                        style={styles.scheduleLine}
                        maxFontSizeMultiplier={1.2}
                      >
                        • Hiệp {m.matchIndex}: Nghỉ [
                        {m.restingMembers.map((r) => r.name).join(", ")}]
                      </Text>
                    ))}
                  </View>
                ) : null}
              </View>
            ) : null}

            {/* Sơ đồ sân trực quan 4 người/sân */}
            <View style={styles.diagramSection} testID="confirm-court-diagram">
              <Text style={styles.diagramLabel} maxFontSizeMultiplier={1.3}>
                🏸 SƠ ĐỒ SÂN 0{activeCourt?.courtNumber ?? 1} (4 VĐV TRÊN SÂN)
              </Text>
              <CourtDiagram
                courtName={`Sân 0${activeCourt?.courtNumber ?? 1}`}
                status="playing"
                teamANames={[
                  currentMatch.teamA[0].name,
                  currentMatch.teamA[1].name,
                ]}
                teamBNames={[
                  currentMatch.teamB[0].name,
                  currentMatch.teamB[1].name,
                ]}
              />
            </View>
          </>
        )}
      </ScrollView>

      {/* Thanh hành động cố định phía dưới: Xáo lại & VÀO SÂN NGAY [CHẠM 3] */}
      {currentMatch ? (
        <View style={styles.bottomDock} testID="confirm-bottom-dock">
          <NeonCTAButton
            testID="confirm-start-match-btn"
            label="VÀO SÂN NGAY"
            subtitle="[CHẠM 3]"
            loading={submitting}
            icon={<ShuttleIcon size={18} color={PALETTE.brand.neonTextDark} />}
            hapticsEnabled={hapticsEnabled}
            onPress={handleConfirmMatch}
          />
          <SecondaryButton
            testID="reshuffle-match-btn"
            label="🔄 Đổi cặp khác (Xáo lại)"
            variant="outline"
            hapticsEnabled={hapticsEnabled}
            onPress={handleReshuffle}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

export default function BalanceConfirmRoute() {
  return <BalanceConfirmScreen />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PALETTE.bg.canvas,
  },
  progressWrap: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.border.subtle,
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
  courtSwitchRow: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  courtSwitchBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: RADIUS.md,
    backgroundColor: PALETTE.surface.card,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.sm,
  },
  courtSwitchBtnActive: {
    borderColor: PALETTE.brand.neonLime,
    backgroundColor: "rgba(163, 230, 54, 0.14)",
  },
  courtSwitchText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
    fontWeight: "700",
  },
  courtSwitchTextActive: {
    color: PALETTE.brand.neonLime,
  },
  predictionHeroCard: {
    backgroundColor: PALETTE.surface.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    alignItems: "center",
    gap: SPACING.sm,
  },
  algoBadge: {
    backgroundColor: "rgba(163, 230, 54, 0.14)",
    borderColor: PALETTE.border.neonActive,
    borderWidth: 1,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
  },
  algoBadgeText: {
    ...TYPOGRAPHY.badge,
    color: PALETTE.brand.neonLime,
  },
  percentRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: SPACING.sm,
  },
  percentTeamA: {
    ...TYPOGRAPHY.heroTitle,
    fontSize: 32,
    lineHeight: 38,
    color: PALETTE.teamA.cyan,
    fontWeight: "800",
  },
  percentVs: {
    ...TYPOGRAPHY.bodyBold,
    color: PALETTE.text.muted,
  },
  percentTeamB: {
    ...TYPOGRAPHY.heroTitle,
    fontSize: 32,
    lineHeight: 38,
    color: PALETTE.teamB.amber,
    fontWeight: "800",
  },
  predictionSub: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
    textAlign: "center",
  },
  warningBanner: {
    backgroundColor: "rgba(245, 158, 11, 0.16)",
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: PALETTE.status.warning,
  },
  warningText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.primary,
    fontWeight: "700",
  },
  swapHintRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  swapHintText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
    flex: 1,
  },
  cancelSwapText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.teamB.amber,
    fontWeight: "800",
  },
  teamACard: {
    backgroundColor: PALETTE.surface.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: PALETTE.teamA.border,
    gap: SPACING.sm,
    ...SHADOWS.cardSubtle,
  },
  teamBCard: {
    backgroundColor: PALETTE.surface.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: PALETTE.teamB.border,
    gap: SPACING.sm,
    ...SHADOWS.cardSubtle,
  },
  teamHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: SPACING.xs,
  },
  teamTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dotCyan: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PALETTE.teamA.cyan,
  },
  dotAmber: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PALETTE.teamB.amber,
  },
  teamATitle: {
    ...TYPOGRAPHY.cardTitle,
    color: PALETTE.teamA.cyan,
  },
  teamBTitle: {
    ...TYPOGRAPHY.cardTitle,
    color: PALETTE.teamB.amber,
  },
  eloPillA: {
    backgroundColor: PALETTE.teamA.bg,
    borderColor: PALETTE.teamA.border,
    borderWidth: 1,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
  },
  eloPillAText: {
    ...TYPOGRAPHY.badge,
    color: PALETTE.teamA.cyan,
    textTransform: "none",
  },
  eloPillB: {
    backgroundColor: PALETTE.teamB.bg,
    borderColor: PALETTE.teamB.border,
    borderWidth: 1,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
  },
  eloPillBText: {
    ...TYPOGRAPHY.badge,
    color: PALETTE.teamB.amber,
    textTransform: "none",
  },
  playerRow: {
    minHeight: 62,
    backgroundColor: PALETTE.surface.elevated,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  playerRowSelected: {
    borderWidth: 2,
    borderColor: PALETTE.brand.neonLime,
    backgroundColor: PALETTE.surface.selected,
  },
  avatarBoxA: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: PALETTE.teamA.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTextA: {
    ...TYPOGRAPHY.bodyBold,
    color: PALETTE.teamA.cyan,
  },
  avatarBoxB: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: PALETTE.teamB.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTextB: {
    ...TYPOGRAPHY.bodyBold,
    color: PALETTE.teamB.amber,
  },
  playerName: {
    ...TYPOGRAPHY.bodyBold,
    color: PALETTE.text.primary,
  },
  playerMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  playerPosText: {
    ...TYPOGRAPHY.badge,
    color: PALETTE.text.secondary,
    textTransform: "none",
  },
  eloRightCol: {
    alignItems: "flex-end",
  },
  eloValue: {
    ...TYPOGRAPHY.bodyBold,
    color: PALETTE.text.primary,
  },
  eloSubLabel: {
    ...TYPOGRAPHY.badge,
    fontSize: 10,
    color: PALETTE.text.muted,
    textTransform: "none",
  },
  vsDividerWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginVertical: -4,
  },
  vsLine: {
    flex: 1,
    height: 1,
    backgroundColor: PALETTE.border.subtle,
  },
  vsPillButton: {
    minWidth: 78,
    minHeight: 44,
    borderRadius: RADIUS.full,
    backgroundColor: PALETTE.surface.elevated,
    borderWidth: 1.5,
    borderColor: PALETTE.border.neonActive,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: SPACING.md,
  },
  vsPillButtonPressed: {
    backgroundColor: PALETTE.surface.selected,
  },
  vsText: {
    ...TYPOGRAPHY.bodyBold,
    color: PALETTE.brand.neonLime,
  },
  restingCard: {
    backgroundColor: PALETTE.surface.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    gap: SPACING.sm,
  },
  restingTitle: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.teamB.amber,
    fontWeight: "800",
  },
  restingChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
  },
  restingChip: {
    minHeight: 40,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: PALETTE.surface.elevated,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    justifyContent: "center",
  },
  restingChipText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.primary,
    fontWeight: "700",
  },
  scheduleList: {
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: PALETTE.border.subtle,
    gap: 4,
  },
  scheduleHeading: {
    ...TYPOGRAPHY.badge,
    color: PALETTE.text.secondary,
    textTransform: "none",
  },
  scheduleLine: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.muted,
  },
  diagramSection: {
    gap: SPACING.xs,
  },
  diagramLabel: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
    fontWeight: "800",
  },
  bottomDock: {
    backgroundColor: PALETTE.surface.card,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: PALETTE.border.subtle,
    gap: SPACING.xs,
  },
});

