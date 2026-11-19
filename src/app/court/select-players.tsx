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
  BottomSheet,
  EmptyState,
  Header,
  LevelBadge,
  NeonCTAButton,
  ProgressBar,
  SecondaryButton,
  ShuttleIcon,
  StatusPill,
  TeamCard,
  Toast,
  ToastVariant,
} from "../../components";
import { RULES } from "../../config/rules";
import { balanceCourt, BalancingMember, BalancingResult } from "../../domain/balancing";
import { CourtCategory, RosterMember } from "../../domain/types";
import { useAuth, useCourtKeepAwake, useHaptics, useSession } from "../../hooks";
import { PALETTE, RADIUS, SPACING, TYPOGRAPHY } from "../../theme";
import {
  getTapCounterState,
  MAX_TAPS_TO_BALANCE,
  recordOnCourtTap,
} from "../../utils/tapCounter";

export interface SelectPlayersScreenProps {
  initialSessionId?: string;
  initialCourtId?: string;
  initialSelectedIds?: string[];
  candidatesOverride?: RosterMember[];
}

const COORDINATOR_NOTES = [
  "Ghi chú cho người điều phối: Ưu tiên ghép người nghỉ lâu & xoay vòng công bằng",
  "Ghi chú cho người điều phối: Cân bằng cầu trước / cầu sau cho đội hình đôi nam nữ",
  "Ghi chú cho người điều phối: Cho người mới đánh hiệp đầu làm nóng cổ tay",
] as const;

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

export function SelectPlayersScreen({
  initialSessionId,
  initialCourtId,
  initialSelectedIds,
  candidatesOverride,
}: SelectPlayersScreenProps) {
  const router = useRouter();
  useCourtKeepAwake("select-players");
  const params = useLocalSearchParams<{
    sessionId?: string;
    courtId?: string;
    focusMemberId?: string;
  }>();
  const { user } = useAuth();
  const { enabled: hapticsEnabled, trigger } = useHaptics(true);

  const sessionId = initialSessionId ?? params.sessionId ?? "session_tienson_05";
  const courtId = initialCourtId ?? params.courtId ?? "1";

  const { session, courts, loading } = useSession(sessionId);

  // Cưỡng chế CR-01: chỉ lấy trong phạm vi tối đa 2 sân của kèo
  const visibleCourts = useMemo(
    () => courts.slice(0, RULES.MAX_COURTS_PER_SESSION),
    [courts]
  );

  const targetCourt = useMemo(
    () =>
      visibleCourts.find((c) => c.id === courtId) ?? visibleCourts[0] ?? null,
    [visibleCourts, courtId]
  );

  // Danh sách người tham gia của kèo hiện tại (ưu tiên VĐV của sân đang chọn trước, sau đó đến VĐV có mặt ở sân còn lại trong cùng kèo)
  const sessionParticipants = useMemo<RosterMember[]>(() => {
    if (candidatesOverride) return candidatesOverride;
    const list: RosterMember[] = [];
    const seen = new Set<string>();

    if (targetCourt) {
      for (const m of Object.values(targetCourt.roster)) {
        if (!seen.has(m.memberId)) {
          seen.add(m.memberId);
          list.push(m);
        }
      }
    }
    for (const c of visibleCourts) {
      for (const m of Object.values(c.roster)) {
        if (!seen.has(m.memberId)) {
          seen.add(m.memberId);
          list.push(m);
        }
      }
    }
    return list;
  }, [candidatesOverride, targetCourt, visibleCourts]);

  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialSelectedIds ?? []
  );
  const [initializedSelection, setInitializedSelection] = useState<boolean>(
    Boolean(initialSelectedIds)
  );
  const [overLimitError, setOverLimitError] = useState<string | null>(null);
  const [noteIndex, setNoteIndex] = useState<number>(0);
  const [profileMember, setProfileMember] = useState<RosterMember | null>(null);
  const [matchPlanSheetVisible, setMatchPlanSheetVisible] = useState<boolean>(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    variant: ToastVariant;
    message: string;
  }>({
    visible: false,
    variant: "info",
    message: "",
  });

  // Khởi tạo mặc định 4 người đầu tiên của sân (khớp Figma Frame 02: Slot 1..4 đã chọn sẵn) nếu không truyền initialSelectedIds
  useEffect(() => {
    if (!initializedSelection && sessionParticipants.length > 0) {
      const targetRosterCount = targetCourt
        ? Object.keys(targetCourt.roster).length
        : 4;
      // Nếu sân là ca lẻ 5 hoặc 7 người (như session_odd_04), chọn đúng 5 hoặc 7 người của sân đó; ngược lại chọn 4 người đầu tiên như Figma 02
      const initialCount =
        targetRosterCount === 5 || targetRosterCount === 7
          ? targetRosterCount
          : Math.min(RULES.PLAYERS_PER_MATCH, sessionParticipants.length);
      const defaultIds = sessionParticipants
        .slice(0, initialCount)
        .map((m) => m.memberId);
      setSelectedIds(defaultIds);
      setInitializedSelection(true);
    }
  }, [initializedSelection, sessionParticipants, targetCourt]);

  // Nếu đi từ chip hàng đợi ở Màn 01 kèm focusMemberId, mở hồ sơ hoặc đảm bảo người đó nằm trong danh sách chọn
  useEffect(() => {
    if (params.focusMemberId && sessionParticipants.length > 0) {
      const found = sessionParticipants.find(
        (m) => m.memberId === params.focusMemberId
      );
      if (found) {
        setProfileMember(found);
      }
    }
  }, [params.focusMemberId, sessionParticipants]);

  const selectedPlayers = useMemo<RosterMember[]>(() => {
    const byId = new Map(sessionParticipants.map((p) => [p.memberId, p]));
    return selectedIds
      .map((id) => byId.get(id))
      .filter((p): p is RosterMember => Boolean(p));
  }, [selectedIds, sessionParticipants]);

  // Chế độ nội dung xem trước cân bằng: dùng nội dung của sân nếu toàn bộ VĐV đã chọn khớp giới tính, hoặc dùng "men" làm chế độ xem trước cân điểm Elo tổng quát
  const previewCategory = useMemo<CourtCategory>(() => {
    const courtCat = targetCourt?.category ?? "mixed";
    if (courtCat === "mixed") {
      const males = selectedPlayers.filter((p) => p.gender === "M").length;
      const females = selectedPlayers.filter((p) => p.gender === "F").length;
      if (males >= 2 && females >= 2) return "mixed";
    }
    return "men";
  }, [targetCourt, selectedPlayers]);

  // Gọi trực tiếp hàm thuần balanceCourt của TV1 ở chế độ xem trước mỗi khi chọn/bỏ chọn (4..8 người)
  const liveBalanceResult = useMemo<BalancingResult | null>(() => {
    if (
      selectedPlayers.length < RULES.PLAYERS_PER_MATCH ||
      selectedPlayers.length > RULES.COURT_CAPACITY
    ) {
      return null;
    }

    const members: BalancingMember[] = selectedPlayers.map((p) => ({
      id: p.memberId,
      name: p.displayName,
      gender: p.gender,
      rating: p.rating,
      position: p.position,
      dominantHand: p.dominantHand,
    }));

    return balanceCourt(members, {
      category: previewCategory,
      mode: "rotate",
      targetMatches: selectedPlayers.length > RULES.PLAYERS_PER_MATCH ? 3 : 1,
    });
  }, [selectedPlayers, previewCategory]);

  const firstMatch = liveBalanceResult?.matches?.[0] ?? null;

  const teamAPercent = useMemo<number>(() => {
    if (!firstMatch) return 50;
    const total = firstMatch.ratingA + firstMatch.ratingB;
    if (total <= 0) return 50;
    return Math.round((firstMatch.ratingA / total) * 100);
  }, [firstMatch]);

  // 4 VĐV ra sân hiệp 1 (ưu tiên theo kết quả chia của balanceCourt nếu đã đủ >= 4 người)
  const fourActiveSlotPlayers = useMemo<(RosterMember | null)[]>(() => {
    const byId = new Map(selectedPlayers.map((p) => [p.memberId, p]));
    if (firstMatch) {
      const ids = [...firstMatch.teamAIds, ...firstMatch.teamBIds];
      return [0, 1, 2, 3].map((idx) => byId.get(ids[idx]) ?? null);
    }
    return [0, 1, 2, 3].map((idx) => selectedPlayers[idx] ?? null);
  }, [firstMatch, selectedPlayers]);

  // Danh sách người nghỉ luân phiên khi chọn 5, 6, 7, 8 người (đặc biệt ca lẻ 5 & 7 người theo CR-01)
  const restingPlayers = useMemo<RosterMember[]>(() => {
    if (selectedPlayers.length <= RULES.PLAYERS_PER_MATCH) return [];
    const byId = new Map(selectedPlayers.map((p) => [p.memberId, p]));
    if (firstMatch && firstMatch.restingIds.length > 0) {
      return firstMatch.restingIds
        .map((id) => byId.get(id))
        .filter((p): p is RosterMember => Boolean(p));
    }
    return selectedPlayers.slice(RULES.PLAYERS_PER_MATCH);
  }, [firstMatch, selectedPlayers]);

  const handleTogglePlayer = (memberId: string) => {
    trigger("selectPlayer");
    setSelectedIds((prev) => {
      if (prev.includes(memberId)) {
        setOverLimitError(null);
        return prev.filter((id) => id !== memberId);
      }
      if (prev.length >= RULES.COURT_CAPACITY) {
        const msg = `Không thể chọn quá ${RULES.COURT_CAPACITY} người một sân (giới hạn 4–8 người/sân theo CR-01).`;
        setOverLimitError(msg);
        setToast({
          visible: true,
          variant: "warning",
          message: msg,
        });
        return prev;
      }
      setOverLimitError(null);
      return [...prev, memberId];
    });
  };

  const handleRemovePlayer = (memberId: string) => {
    trigger("selectPlayer");
    setOverLimitError(null);
    setSelectedIds((prev) => prev.filter((id) => id !== memberId));
  };

  const handleClearAll = () => {
    trigger("selectPlayer");
    setOverLimitError(null);
    setSelectedIds([]);
  };

  const handlePresetCount = (count: number) => {
    trigger("selectPlayer");
    setOverLimitError(null);
    const bounded = Math.min(count, RULES.COURT_CAPACITY, sessionParticipants.length);
    setSelectedIds(sessionParticipants.slice(0, bounded).map((p) => p.memberId));
  };

  const handleConfirmTap2 = () => {
    if (selectedPlayers.length < RULES.PLAYERS_PER_MATCH) {
      setToast({
        visible: true,
        variant: "warning",
        message: "Cần chọn tối thiểu 4 VĐV để chia kèo trên sân.",
      });
      return;
    }
    trigger("selectPlayer");
    recordOnCourtTap("select", "XEM KÈO CÂN BẰNG [CHẠM 2]");
    router.push({
      pathname: "/court/balance-confirm",
      params: {
        sessionId,
        courtId: targetCourt?.id ?? courtId,
        selectedIds: selectedIds.join(","),
      },
    } as never);
  };

  const handleConfirmTap3EnterCourt = () => {
    trigger("scorePoint");
    recordOnCourtTap("confirm", "VÀO SÂN NGAY [CHẠM 3]");
    setMatchPlanSheetVisible(false);
    setToast({
      visible: true,
      variant: "success",
      message: `Đã chốt đội hình vào Sân 0${targetCourt?.courtNumber ?? 1} sau đúng ${getTapCounterState().currentTaps}/${MAX_TAPS_TO_BALANCE} chạm!`,
    });
  };

  const byIdMap = useMemo(
    () => new Map(sessionParticipants.map((p) => [p.memberId, p])),
    [sessionParticipants]
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      {/* Header với nút Quay lại >= 48dp (Figma 1:2966) */}
      <Header
        title="Chọn Người & Cân Trình"
        subtitle={`${session?.venueName ?? "Sân Cầu Lông Tiên Sơn"} • Sân 0${targetCourt?.courtNumber ?? 1}`}
        onBackPress={() => router.back()}
        userName={user?.displayName ?? "Đào Duy Nhật"}
      />

      {/* Thanh tiến trình "Chạm 2/3" (Figma 1:2727) */}
      <View style={styles.progressWrap} testID="select-progress-bar">
        <ProgressBar
          currentStep={2}
          totalSteps={3}
          label="TIẾN TRÌNH CHIA SÂN"
        />
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
        {/* Top Hero Banner + Nút chọn nhanh kịch bản 4, 5, 7, 8 người theo CR-01 (Figma 1:2737) */}
        <View style={styles.heroBanner}>
          <View style={styles.heroTopRow}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.heroTitle} maxFontSizeMultiplier={1.3}>
                SÂN 0{targetCourt?.courtNumber ?? 1} • QUY TẮC 4–8 NGƯỜI/SÂN
              </Text>
              <Text style={styles.heroSubtitle} maxFontSizeMultiplier={1.3}>
                Chọn từ 4 đến 8 VĐV có mặt. Với ca lẻ 5 hoặc 7 người, hệ thống tự xếp người nghỉ luân phiên công bằng.
              </Text>
            </View>
            <StatusPill
              variant={
                selectedPlayers.length >= RULES.PLAYERS_PER_MATCH
                  ? "live"
                  : "warning"
              }
              label={`${selectedPlayers.length}/${RULES.COURT_CAPACITY} VĐV`}
            />
          </View>

          <View style={styles.presetRow}>
            {[
              { count: 4, label: "Đủ 4 người", testID: "preset-4-btn" },
              { count: 5, label: "Ca lẻ 5 người", testID: "preset-5-btn" },
              { count: 7, label: "Ca lẻ 7 người", testID: "preset-7-btn" },
              { count: 8, label: "Tối đa 8 người", testID: "preset-8-btn" },
            ].map((item) => {
              const active = selectedPlayers.length === item.count;
              return (
                <Pressable
                  key={item.count}
                  testID={item.testID}
                  accessibilityRole="button"
                  onPress={() => handlePresetCount(item.count)}
                  style={[styles.presetBtn, active && styles.presetBtnActive]}
                >
                  <Text
                    style={[
                      styles.presetBtnText,
                      active && styles.presetBtnTextActive,
                    ]}
                    maxFontSizeMultiplier={1.2}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Cảnh báo thân thiện khi chọn vượt quá 8 người/sân */}
        {overLimitError ? (
          <View
            style={styles.overLimitBanner}
            testID="over-limit-error-banner"
            accessibilityRole="alert"
          >
            <Text style={styles.overLimitText} maxFontSizeMultiplier={1.3}>
              ⚠️ {overLimitError}
            </Text>
          </View>
        ) : null}

        {/* Section 1: 4 Ô Xếp Hàng Đã Chọn - Xóa từng ô & Nút Xóa hết (Figma 1:2753) */}
        <View style={styles.slotsSection} testID="selected-slots-section">
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading} maxFontSizeMultiplier={1.3}>
              🏸 4 Ô XẾP HÀNG ĐÃ CHỌN (HIỆP 1)
            </Text>
            <Pressable
              testID="clear-all-slots-btn"
              accessibilityRole="button"
              accessibilityLabel="Xóa hết người chơi đã chọn"
              hitSlop={10}
              onPress={handleClearAll}
              style={styles.clearAllBtn}
            >
              <Text style={styles.clearAllText} maxFontSizeMultiplier={1.3}>
                ✕ Xóa hết
              </Text>
            </Pressable>
          </View>

          <View style={styles.fourSlotsGrid}>
            {fourActiveSlotPlayers.map((slotPlayer, idx) => (
              <View
                key={slotPlayer ? slotPlayer.memberId : `empty-slot-${idx}`}
                testID={`selected-slot-${idx}`}
                style={[
                  styles.slotCard,
                  slotPlayer ? styles.slotCardFilled : styles.slotCardEmpty,
                  idx < 2 && slotPlayer ? styles.slotCardTeamA : null,
                  idx >= 2 && slotPlayer ? styles.slotCardTeamB : null,
                ]}
              >
                {slotPlayer ? (
                  <>
                    <View style={styles.slotAvatar}>
                      <Text style={styles.slotAvatarText} maxFontSizeMultiplier={1.2}>
                        {getInitials(slotPlayer.displayName)}
                      </Text>
                    </View>
                    <View style={styles.slotInfoCol}>
                      <Text
                        style={styles.slotPlayerName}
                        numberOfLines={1}
                        maxFontSizeMultiplier={1.3}
                      >
                        {slotPlayer.displayName}
                      </Text>
                      <View style={styles.slotBadgeRow}>
                        <LevelBadge
                          level={slotPlayer.level}
                          compact
                          showRange={false}
                        />
                        <Text style={styles.slotEloText} maxFontSizeMultiplier={1.2}>
                          {slotPlayer.rating}
                        </Text>
                      </View>
                    </View>
                    <Pressable
                      testID={`remove-slot-${idx}`}
                      accessibilityRole="button"
                      accessibilityLabel={`Xóa ${slotPlayer.displayName}`}
                      hitSlop={12}
                      onPress={() => handleRemovePlayer(slotPlayer.memberId)}
                      style={styles.slotRemoveBtn}
                    >
                      <Text style={styles.slotRemoveIcon}>✕</Text>
                    </Pressable>
                  </>
                ) : (
                  <Text style={styles.emptySlotLabel} maxFontSizeMultiplier={1.2}>
                    Ô trống #{idx + 1} • Chạm VĐV bên dưới
                  </Text>
                )}
              </View>
            ))}
          </View>

          {/* Hiển thị Người nghỉ luân phiên khi chọn 5, 6, 7 hoặc 8 người (CR-01) */}
          {restingPlayers.length > 0 ? (
            <View style={styles.restingBox} testID="resting-players-box">
              <View style={styles.restingHeaderRow}>
                <Text style={styles.restingTitle} maxFontSizeMultiplier={1.3}>
                  🔄 Người nghỉ luân phiên hiệp 1 ({restingPlayers.length} người •{" "}
                  {selectedPlayers.length === 5 || selectedPlayers.length === 7
                    ? `Ca lẻ ${selectedPlayers.length} người`
                    : `Ca ${selectedPlayers.length} người`}
                  )
                </Text>
              </View>
              <View style={styles.restingChipsWrap}>
                {restingPlayers.map((rp) => (
                  <View
                    key={rp.memberId}
                    style={styles.restingChip}
                    testID={`resting-chip-${rp.memberId}`}
                  >
                    <Text style={styles.restingChipName} maxFontSizeMultiplier={1.3}>
                      {rp.displayName} ({rp.rating})
                    </Text>
                    <Pressable
                      testID={`remove-resting-${rp.memberId}`}
                      accessibilityRole="button"
                      accessibilityLabel={`Xóa ${rp.displayName}`}
                      hitSlop={10}
                      onPress={() => handleRemovePlayer(rp.memberId)}
                      style={styles.restingRemoveBtn}
                    >
                      <Text style={styles.slotRemoveIcon}>✕</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
              {liveBalanceResult && liveBalanceResult.matches.length > 1 ? (
                <Text style={styles.rotationHintText} maxFontSizeMultiplier={1.2}>
                  Lịch xoay vòng tự động:{" "}
                  {liveBalanceResult.matches
                    .map((m) => {
                      const restNames = m.restingIds
                        .map((id) => byIdMap.get(id)?.displayName ?? id)
                        .join(", ");
                      return `Hiệp ${m.matchIndex}: nghỉ [${restNames}]`;
                    })
                    .join(" • ")}
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>

        {/* Section: Đồng Hồ Cân Bằng Trực Tiếp (Live Balance Meter - Figma 1:2830) */}
        <View style={styles.balanceSection} testID="live-balance-section">
          {firstMatch ? (
            <>
              <BalanceMeter
                teamAPercent={teamAPercent}
                eloDiff={firstMatch.diff}
                statusLabel={
                  firstMatch.isUnbalanced
                    ? "Độ lệch cao (>150 Elo) • Khuyên đổi người"
                    : "Cực kỳ cân tài • Tự động cân bằng trực tiếp"
                }
              />
              <View style={styles.previewTeamsBar} testID="live-balance-preview-teams">
                <Text style={styles.previewTeamAText} maxFontSizeMultiplier={1.2}>
                  Đội A ({firstMatch.ratingA} Elo):{" "}
                  {firstMatch.teamAIds
                    .map((id) => byIdMap.get(id)?.displayName ?? id)
                    .join(" + ")}
                </Text>
                <Text style={styles.previewTeamBText} maxFontSizeMultiplier={1.2}>
                  Đội B ({firstMatch.ratingB} Elo):{" "}
                  {firstMatch.teamBIds
                    .map((id) => byIdMap.get(id)?.displayName ?? id)
                    .join(" + ")}
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.balancePendingBox} testID="balance-pending-box">
              <Text style={styles.balancePendingTitle} maxFontSizeMultiplier={1.3}>
                ⚖️ Đồng hồ cân bằng trực tiếp (Đã chọn {selectedPlayers.length}/4 người tối thiểu)
              </Text>
              <Text style={styles.balancePendingSub} maxFontSizeMultiplier={1.3}>
                Hãy chọn thêm {Math.max(0, RULES.PLAYERS_PER_MATCH - selectedPlayers.length)} VĐV nữa từ lưới bên dưới để tính độ cân bằng trực tiếp.
              </Text>
            </View>
          )}
        </View>

        {/* Section 2: Lưới Chọn Nhanh >= 80x64px vùng ngón cái (Figma 1:2845) */}
        <View style={styles.gridSection} testID="quick-select-grid-section">
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading} maxFontSizeMultiplier={1.3}>
              ⚡ LƯỚI CHỌN NHANH VÙNG NGÓN CÁI
            </Text>
            <Text style={styles.gridCountLabel} maxFontSizeMultiplier={1.2}>
              Đã chọn {selectedPlayers.length}/{RULES.COURT_CAPACITY} VĐV
            </Text>
          </View>

          {sessionParticipants.length === 0 && !loading ? (
            <EmptyState
              title="Chưa có người chơi trong kèo"
              description="Danh sách tham gia của kèo hiện tại đang trống. Vui lòng kiểm tra lại phòng kèo."
            />
          ) : (
            <View style={styles.thumbGrid} testID="thumb-select-grid">
              {sessionParticipants.map((member) => {
                const isSelected = selectedIds.includes(member.memberId);
                return (
                  <View
                    key={member.memberId}
                    style={[
                      styles.gridItemCard,
                      isSelected && styles.gridItemCardSelected,
                    ]}
                  >
                    <View
                      style={[
                        styles.gridItemAccentBar,
                        isSelected && styles.gridItemAccentBarSelected,
                      ]}
                    />

                    <Pressable
                      testID={`grid-player-${member.memberId}`}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isSelected }}
                      accessibilityLabel={`Chọn ${member.displayName}, Cấp ${member.level}, ${member.rating} Elo`}
                      onPress={() => handleTogglePlayer(member.memberId)}
                      style={styles.gridItemMainTouch}
                    >
                      <View style={styles.gridItemTextCol}>
                        <Text
                          style={styles.gridItemName}
                          numberOfLines={1}
                          maxFontSizeMultiplier={1.3}
                        >
                          {member.displayName}
                        </Text>
                        <View style={styles.gridItemMetaRow}>
                          <LevelBadge
                            level={member.level}
                            compact
                            showRange={false}
                          />
                          <Text
                            style={styles.gridItemElo}
                            maxFontSizeMultiplier={1.2}
                          >
                            {member.rating} Elo
                          </Text>
                        </View>
                      </View>

                      <View
                        style={[
                          styles.gridCheckCircle,
                          isSelected && styles.gridCheckCircleSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.gridCheckIcon,
                            isSelected && styles.gridCheckIconSelected,
                          ]}
                        >
                          {isSelected ? "✓" : "+"}
                        </Text>
                      </View>
                    </Pressable>

                    {/* Nút mở Modal Hồ sơ người chơi (Figma 1:2977) */}
                    <Pressable
                      testID={`open-profile-${member.memberId}`}
                      accessibilityRole="button"
                      accessibilityLabel={`Xem hồ sơ ${member.displayName}`}
                      hitSlop={8}
                      onPress={() => {
                        trigger("selectPlayer");
                        setProfileMember(member);
                      }}
                      style={styles.profileInfoBtn}
                    >
                      <Text style={styles.profileInfoBtnText} maxFontSizeMultiplier={1.2}>
                        ⓘ Hồ sơ
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Ghi chú cho người điều phối (Coordinator Tactile Notes Pill - Figma 1:2940) */}
        <Pressable
          testID="coordinator-note-pill"
          accessibilityRole="button"
          accessibilityLabel="Đổi ghi chú cho người điều phối"
          onPress={() => {
            trigger("selectPlayer");
            setNoteIndex((i) => (i + 1) % COORDINATOR_NOTES.length);
          }}
          style={styles.coordinatorNotePill}
        >
          <Text
            style={styles.coordinatorNoteText}
            numberOfLines={2}
            maxFontSizeMultiplier={1.3}
          >
            📝 {COORDINATOR_NOTES[noteIndex]}
          </Text>
          <Text style={styles.coordinatorNoteAction} maxFontSizeMultiplier={1.2}>
            Đổi
          </Text>
        </Pressable>
      </ScrollView>

      {/* Section 3: Thanh hành động cố định phía dưới với nút lớn 58px (Figma 1:2949) */}
      <View style={styles.bottomDock} testID="bottom-action-dock">
        <View style={styles.microStatusBar}>
          <Text style={styles.microStatusLeft} maxFontSizeMultiplier={1.2}>
            {selectedPlayers.length >= RULES.PLAYERS_PER_MATCH
              ? `✅ Đã đủ ${selectedPlayers.length} VĐV (Giới hạn 4–8 người/sân)`
              : `⏳ Cần chọn thêm ${RULES.PLAYERS_PER_MATCH - selectedPlayers.length} VĐV nữa`}
          </Text>
          <Text style={styles.microStatusRight} maxFontSizeMultiplier={1.2}>
            Chạm 2/{MAX_TAPS_TO_BALANCE}
          </Text>
        </View>

        <NeonCTAButton
          testID="confirm-select-players-btn"
          label="XEM KÈO CÂN BẰNG"
          subtitle="[CHẠM 2]"
          icon={<ShuttleIcon size={18} color={PALETTE.brand.neonTextDark} />}
          disabled={selectedPlayers.length < RULES.PLAYERS_PER_MATCH}
          hapticsEnabled={hapticsEnabled}
          onPress={handleConfirmTap2}
        />
      </View>

      {/* Modal Hồ Sơ Người Chơi (Figma 1:2977 - Điểm, Thống kê, Độ ổn định, Nút thu gọn) */}
      <BottomSheet
        visible={Boolean(profileMember)}
        title={profileMember ? `Hồ sơ VĐV • ${profileMember.displayName}` : "Hồ sơ VĐV"}
        subtitle={
          profileMember
            ? `${profileMember.rating} Elo • CLB Cầu Lông Đêm Đà Nẵng`
            : undefined
        }
        onClose={() => setProfileMember(null)}
      >
        {profileMember ? (
          <View style={styles.modalBody} testID="player-profile-modal">
            {/* Hàng thông tin đầu: Avatar chữ cái + Tên + Cấp độ + Elo */}
            <View style={styles.modalProfileHeader}>
              <View style={styles.modalAvatarBox}>
                <Text style={styles.modalAvatarText}>
                  {getInitials(profileMember.displayName)}
                </Text>
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <View style={styles.modalNameRow}>
                  <Text style={styles.modalPlayerName} maxFontSizeMultiplier={1.3}>
                    {profileMember.displayName}
                  </Text>
                  <LevelBadge level={profileMember.level} compact />
                </View>
                <Text style={styles.modalEloSub} maxFontSizeMultiplier={1.3}>
                  {profileMember.rating} Elo • {getPositionLabel(profileMember.position)}
                </Text>
              </View>
            </View>

            {/* 3 ô thống kê: Tỷ lệ thắng, Trận thắng, Trận thua (Figma 1:2998) */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValueNeon}>75%</Text>
                <Text style={styles.statLabel}>TỶ LỆ THẮNG</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValueCyan}>18</Text>
                <Text style={styles.statLabel}>TRẬN THẮNG</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValueWhite}>6</Text>
                <Text style={styles.statLabel}>TRẬN THUA</Text>
              </View>
            </View>

            {/* Chỉ số kỹ năng, thể lực & Độ ổn định (Figma 1:3015) */}
            <View style={styles.skillBox}>
              <View style={styles.skillHeaderRow}>
                <Text style={styles.skillTitle}>CHỈ SỐ KỸ NĂNG & ĐỘ ỔN ĐỊNH</Text>
                <Text style={styles.stabilityBadge}>
                  Độ ổn định: Phong độ cao (Uy tín 98%)
                </Text>
              </View>

              <View style={styles.skillBarItem}>
                <View style={styles.skillBarLabelRow}>
                  <Text style={styles.skillBarName}>Tấn công đập cầu</Text>
                  <Text style={styles.skillBarVal}>88 km/h</Text>
                </View>
                <View style={styles.skillTrack}>
                  <View style={[styles.skillFillNeon, { width: "88%" }]} />
                </View>
              </View>

              <View style={styles.skillBarItem}>
                <View style={styles.skillBarLabelRow}>
                  <Text style={styles.skillBarName}>Phòng thủ & Điều cầu</Text>
                  <Text style={styles.skillBarVal}>82%</Text>
                </View>
                <View style={styles.skillTrack}>
                  <View style={[styles.skillFillCyan, { width: "82%" }]} />
                </View>
              </View>

              <View style={styles.skillBarItem}>
                <View style={styles.skillBarLabelRow}>
                  <Text style={styles.skillBarName}>Thể lực & Độ ổn định tâm lý</Text>
                  <Text style={styles.skillBarVal}>90%</Text>
                </View>
                <View style={styles.skillTrack}>
                  <View style={[styles.skillFillNeon, { width: "90%" }]} />
                </View>
              </View>
            </View>

            {/* Lịch sử 3 trận gần nhất (Figma 1:3046) */}
            <View style={styles.recentMatchesBox}>
              <Text style={styles.skillTitle}>LỊCH SỬ 3 TRẬN GẦN NHẤT</Text>
              <View style={styles.recentMatchItem}>
                <Text style={styles.winBadge}>W</Text>
                <Text style={styles.recentMatchDesc} numberOfLines={1}>
                  21 - 19 (vs Đức Mạnh / Khánh Linh) • Sân 01
                </Text>
                <Text style={styles.eloGainText}>+15 Elo</Text>
              </View>
              <View style={styles.recentMatchItem}>
                <Text style={styles.winBadge}>W</Text>
                <Text style={styles.recentMatchDesc} numberOfLines={1}>
                  21 - 17 (vs Tuấn Kiệt / Bảo Trâm) • Sân 02
                </Text>
                <Text style={styles.eloGainText}>+12 Elo</Text>
              </View>
              <View style={styles.recentMatchItem}>
                <Text style={styles.lossBadge}>L</Text>
                <Text style={styles.recentMatchDesc} numberOfLines={1}>
                  19 - 21 (vs Minh / Hùng) • Hôm qua
                </Text>
                <Text style={styles.eloLossText}>-10 Elo</Text>
              </View>
            </View>

            {/* Hàng 2 nút dưới: Thu gọn (ĐÓNG) & Chọn/Bỏ chọn (XẾP SÂN KẾ TIẾP - Figma 1:3092) */}
            <View style={styles.modalActionsRow}>
              <SecondaryButton
                testID="close-profile-modal-btn"
                label="THU GỌN (ĐÓNG)"
                variant="outline"
                onPress={() => setProfileMember(null)}
                style={{ flex: 1 }}
              />
              <SecondaryButton
                testID="toggle-select-from-modal-btn"
                label={
                  selectedIds.includes(profileMember.memberId)
                    ? "BỎ CHỌN VĐV"
                    : "⚡ XẾP SÂN KẾ TIẾP"
                }
                variant="teamA"
                onPress={() => {
                  handleTogglePlayer(profileMember.memberId);
                  setProfileMember(null);
                }}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        ) : null}
      </BottomSheet>

      {/* BottomSheet xem nhanh Phương án chia kèo cân bằng (Chạm 3/3) */}
      <BottomSheet
        visible={matchPlanSheetVisible}
        title="Đề Xuất Chia Cặp Tối Ưu (Chạm 3/3)"
        subtitle={`Cân bằng ${teamAPercent}% vs ${100 - teamAPercent}% • ΔElo: ${firstMatch?.diff ?? 0}`}
        onClose={() => setMatchPlanSheetVisible(false)}
      >
        {firstMatch ? (
          <View style={styles.modalBody} testID="balanced-match-plan-sheet">
            <TeamCard
              team="A"
              averageElo={firstMatch.ratingA}
              players={firstMatch.teamAIds.map((id) => {
                const p = byIdMap.get(id);
                return {
                  id,
                  name: p?.displayName ?? id,
                  level: p?.level ?? 3,
                  elo: p?.rating ?? 1400,
                  positionLabel: getPositionLabel(p?.position),
                };
              })}
            />
            <TeamCard
              team="B"
              averageElo={firstMatch.ratingB}
              players={firstMatch.teamBIds.map((id) => {
                const p = byIdMap.get(id);
                return {
                  id,
                  name: p?.displayName ?? id,
                  level: p?.level ?? 3,
                  elo: p?.rating ?? 1400,
                  positionLabel: getPositionLabel(p?.position),
                };
              })}
            />
            {restingPlayers.length > 0 ? (
              <Text style={styles.rotationHintText}>
                🔄 Nghỉ luân phiên hiệp 1:{" "}
                {restingPlayers.map((p) => p.displayName).join(", ")}
              </Text>
            ) : null}
            <NeonCTAButton
              testID="confirm-tap-3-enter-court-btn"
              label="VÀO SÂN NGAY"
              subtitle="[CHẠM 3]"
              hapticsEnabled={hapticsEnabled}
              onPress={handleConfirmTap3EnterCourt}
            />
          </View>
        ) : null}
      </BottomSheet>
    </SafeAreaView>
  );
}

export default function SelectPlayersRoute() {
  return <SelectPlayersScreen />;
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
  heroBanner: {
    backgroundColor: PALETTE.surface.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    gap: SPACING.sm,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: SPACING.sm,
  },
  heroTitle: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.brand.neonLime,
    fontWeight: "800",
  },
  heroSubtitle: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
  },
  presetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
  },
  presetBtn: {
    minHeight: 36,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: PALETTE.surface.elevated,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    justifyContent: "center",
  },
  presetBtnActive: {
    backgroundColor: "rgba(163, 230, 54, 0.16)",
    borderColor: PALETTE.brand.neonLime,
  },
  presetBtnText: {
    ...TYPOGRAPHY.badge,
    color: PALETTE.text.secondary,
  },
  presetBtnTextActive: {
    color: PALETTE.brand.neonLime,
    fontWeight: "800",
  },
  overLimitBanner: {
    backgroundColor: "rgba(239, 68, 68, 0.16)",
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: PALETTE.status.danger,
  },
  overLimitText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.primary,
    fontWeight: "700",
  },
  slotsSection: {
    gap: SPACING.sm,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionHeading: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  clearAllBtn: {
    minHeight: 36,
    paddingHorizontal: SPACING.sm,
    justifyContent: "center",
  },
  clearAllText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.teamB.amber,
    fontWeight: "700",
  },
  fourSlotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: SPACING.sm,
  },
  slotCard: {
    width: "48.5%",
    minHeight: 64,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  slotCardFilled: {
    backgroundColor: PALETTE.surface.card,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
  },
  slotCardTeamA: {
    borderLeftWidth: 4,
    borderLeftColor: PALETTE.teamA.cyan,
  },
  slotCardTeamB: {
    borderLeftWidth: 4,
    borderLeftColor: PALETTE.teamB.amber,
  },
  slotCardEmpty: {
    backgroundColor: "rgba(19, 27, 46, 0.45)",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: PALETTE.border.subtle,
    justifyContent: "center",
  },
  slotAvatar: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: PALETTE.surface.elevated,
    alignItems: "center",
    justifyContent: "center",
  },
  slotAvatarText: {
    ...TYPOGRAPHY.badge,
    color: PALETTE.text.primary,
    fontWeight: "800",
  },
  slotInfoCol: {
    flex: 1,
    gap: 2,
  },
  slotPlayerName: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.primary,
    fontWeight: "700",
  },
  slotBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  slotEloText: {
    ...TYPOGRAPHY.badge,
    color: PALETTE.text.secondary,
  },
  slotRemoveBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PALETTE.surface.elevated,
    alignItems: "center",
    justifyContent: "center",
  },
  slotRemoveIcon: {
    fontSize: 12,
    color: PALETTE.text.secondary,
    fontWeight: "800",
  },
  emptySlotLabel: {
    ...TYPOGRAPHY.badge,
    color: PALETTE.text.muted,
    textAlign: "center",
    textTransform: "none",
  },
  restingBox: {
    backgroundColor: PALETTE.surface.elevated,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    gap: SPACING.xs,
  },
  restingHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  restingTitle: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.teamB.amber,
    fontWeight: "700",
  },
  restingChipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
  },
  restingChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: PALETTE.surface.card,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
  },
  restingChipName: {
    ...TYPOGRAPHY.badge,
    color: PALETTE.text.primary,
    textTransform: "none",
  },
  restingRemoveBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  rotationHintText: {
    ...TYPOGRAPHY.badge,
    color: PALETTE.text.secondary,
    textTransform: "none",
  },
  balanceSection: {
    gap: SPACING.xs,
  },
  previewTeamsBar: {
    backgroundColor: PALETTE.surface.card,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    gap: 4,
  },
  previewTeamAText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.teamA.cyan,
    fontWeight: "700",
  },
  previewTeamBText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.teamB.amber,
    fontWeight: "700",
  },
  balancePendingBox: {
    backgroundColor: PALETTE.surface.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    gap: 4,
  },
  balancePendingTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: PALETTE.text.primary,
  },
  balancePendingSub: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
  },
  gridSection: {
    gap: SPACING.sm,
  },
  gridCountLabel: {
    ...TYPOGRAPHY.badge,
    color: PALETTE.brand.neonLime,
  },
  thumbGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: SPACING.sm,
  },
  gridItemCard: {
    width: "48.5%",
    minWidth: 140,
    minHeight: 80,
    backgroundColor: PALETTE.surface.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    overflow: "hidden",
    position: "relative",
    paddingLeft: 10,
    paddingRight: SPACING.sm,
    paddingVertical: SPACING.xs,
    justifyContent: "space-between",
  },
  gridItemCardSelected: {
    borderColor: PALETTE.brand.neonLime,
    backgroundColor: PALETTE.surface.selected,
  },
  gridItemAccentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: "transparent",
  },
  gridItemAccentBarSelected: {
    backgroundColor: PALETTE.brand.neonLime,
  },
  gridItemMainTouch: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  gridItemTextCol: {
    flex: 1,
    gap: 4,
  },
  gridItemName: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 14,
    color: PALETTE.text.primary,
  },
  gridItemMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  gridItemElo: {
    ...TYPOGRAPHY.badge,
    color: PALETTE.text.secondary,
  },
  gridCheckCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: PALETTE.surface.elevated,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    alignItems: "center",
    justifyContent: "center",
  },
  gridCheckCircleSelected: {
    backgroundColor: PALETTE.brand.neonLime,
    borderColor: PALETTE.brand.neonLime,
  },
  gridCheckIcon: {
    fontSize: 13,
    fontWeight: "800",
    color: PALETTE.text.secondary,
  },
  gridCheckIconSelected: {
    color: PALETTE.brand.neonTextDark,
  },
  profileInfoBtn: {
    alignSelf: "flex-start",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: PALETTE.surface.elevated,
  },
  profileInfoBtnText: {
    ...TYPOGRAPHY.badge,
    fontSize: 10,
    color: PALETTE.teamA.cyan,
    textTransform: "none",
  },
  coordinatorNotePill: {
    minHeight: 48,
    backgroundColor: PALETTE.surface.card,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.sm,
  },
  coordinatorNoteText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
    flex: 1,
  },
  coordinatorNoteAction: {
    ...TYPOGRAPHY.badge,
    color: PALETTE.brand.neonLime,
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
  microStatusBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  microStatusLeft: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
  },
  microStatusRight: {
    ...TYPOGRAPHY.badge,
    color: PALETTE.brand.neonLime,
  },
  modalBody: {
    gap: SPACING.md,
  },
  modalProfileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  modalAvatarBox: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: "rgba(123, 208, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalAvatarText: {
    ...TYPOGRAPHY.cardTitle,
    color: PALETTE.teamA.cyan,
    fontWeight: "800",
  },
  modalNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    flexWrap: "wrap",
  },
  modalPlayerName: {
    ...TYPOGRAPHY.cardTitle,
    color: PALETTE.text.primary,
  },
  modalEloSub: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: PALETTE.surface.elevated,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: "center",
    gap: 2,
  },
  statValueNeon: {
    ...TYPOGRAPHY.sectionTitle,
    color: PALETTE.brand.neonLime,
  },
  statValueCyan: {
    ...TYPOGRAPHY.sectionTitle,
    color: PALETTE.teamA.cyan,
  },
  statValueWhite: {
    ...TYPOGRAPHY.sectionTitle,
    color: PALETTE.text.primary,
  },
  statLabel: {
    ...TYPOGRAPHY.badge,
    color: PALETTE.text.muted,
  },
  skillBox: {
    backgroundColor: PALETTE.surface.elevated,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  skillHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 4,
  },
  skillTitle: {
    ...TYPOGRAPHY.badge,
    color: PALETTE.text.secondary,
  },
  stabilityBadge: {
    ...TYPOGRAPHY.badge,
    color: PALETTE.brand.neonLime,
    textTransform: "none",
  },
  skillBarItem: {
    gap: 4,
  },
  skillBarLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  skillBarName: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.primary,
  },
  skillBarVal: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
    fontWeight: "700",
  },
  skillTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: PALETTE.bg.canvas,
    overflow: "hidden",
  },
  skillFillNeon: {
    height: "100%",
    backgroundColor: PALETTE.brand.neonLime,
  },
  skillFillCyan: {
    height: "100%",
    backgroundColor: PALETTE.teamA.cyan,
  },
  recentMatchesBox: {
    gap: SPACING.xs,
  },
  recentMatchItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PALETTE.surface.elevated,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 8,
    gap: SPACING.xs,
  },
  winBadge: {
    ...TYPOGRAPHY.badge,
    backgroundColor: PALETTE.brand.neonLime,
    color: PALETTE.brand.neonTextDark,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lossBadge: {
    ...TYPOGRAPHY.badge,
    backgroundColor: PALETTE.surface.interactive,
    color: PALETTE.text.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recentMatchDesc: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.primary,
    flex: 1,
  },
  eloGainText: {
    ...TYPOGRAPHY.badge,
    color: PALETTE.brand.neonLime,
  },
  eloLossText: {
    ...TYPOGRAPHY.badge,
    color: PALETTE.status.danger,
  },
  modalActionsRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
});

