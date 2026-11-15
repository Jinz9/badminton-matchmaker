import React, { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  BottomSheet,
  EmptyState,
  Header,
  LevelBadge,
  NeonCTAButton,
  SecondaryButton,
  Skeleton,
  StatusPill,
  Toast,
  ToastVariant,
} from "../../components";
import { RATING_CONFIG } from "../../config/rating";
import { RULES } from "../../config/rules";
import { getRepository } from "../../data";
import {
  computeSlots,
  countRosterMembers,
} from "../../domain/recruit/slotCalculation";
import { CourtCategory, RosterMember } from "../../domain/types";
import { useAuth, useHaptics, useSession } from "../../hooks";
import { PALETTE, RADIUS, SPACING, TYPOGRAPHY } from "../../theme";

export interface LobbyDetailScreenProps {
  initialSessionId?: string;
  currentUserIdOverride?: string;
}

function formatCategoryWithIcon(category: CourtCategory): string {
  if (category === "men") return "👨 Đôi nam";
  if (category === "women") return "👩 Đôi nữ";
  return "🤝 Đôi nam nữ";
}

function formatDateTime(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")} • ${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}`;
}

export function LobbyDetailScreen({
  initialSessionId,
  currentUserIdOverride,
}: LobbyDetailScreenProps) {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { user } = useAuth();
  const { trigger } = useHaptics(true);

  const sessionId = initialSessionId ?? params.id ?? "session_tienson_05";
  const currentUserId = currentUserIdOverride ?? user?.uid ?? "user_player_01";

  const {
    session,
    courts,
    requests,
    loading,
    error,
    refresh,
    joinCourt,
    cancelJoin,
    reviewRequest,
  } = useSession(sessionId);

  const [selectedCourtId, setSelectedCourtId] = useState<string>("1");
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [promotionNotice, setPromotionNotice] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showGhostSheet, setShowGhostSheet] = useState(false);
  const [ghostName, setGhostName] = useState("");
  const [ghostGender, setGhostGender] = useState<"M" | "F">("M");
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    variant: ToastVariant;
  }>({ visible: false, message: "", variant: "info" });

  useEffect(() => {
    if (courts.length > 0 && !courts.some((c) => c.id === selectedCourtId)) {
      setSelectedCourtId(courts[0].id);
    }
  }, [courts, selectedCourtId]);

  const activeCourt = useMemo(
    () => courts.find((c) => c.id === selectedCourtId) ?? courts[0] ?? null,
    [courts, selectedCourtId]
  );

  const rosterList = useMemo<RosterMember[]>(() => {
    if (!activeCourt?.roster) return [];
    return Object.values(activeCourt.roster);
  }, [activeCourt]);

  const slotInfo = useMemo(() => {
    if (!activeCourt) {
      return {
        total: 0,
        open: 0,
        coreCount: 0,
        recruitConfirmed: 0,
        overbooked: false,
      };
    }
    const { coreCount, recruitConfirmed } = countRosterMembers(activeCourt);
    return computeSlots(coreCount, recruitConfirmed);
  }, [activeCourt]);

  const isHost = session?.hostId === currentUserId;

  const courtRequests = useMemo(() => {
    if (!activeCourt) return [];
    return requests.filter((r) => r.courtId === activeCourt.id);
  }, [requests, activeCourt]);

  const pendingRequests = useMemo(
    () => courtRequests.filter((r) => r.status === "requested"),
    [courtRequests]
  );

  const waitlistRequests = useMemo(
    () =>
      courtRequests
        .filter((r) => r.status === "waitlist")
        .sort(
          (a, b) =>
            (a.waitlistPosition ?? 999) - (b.waitlistPosition ?? 999) ||
            a.createdAt.localeCompare(b.createdAt)
        ),
    [courtRequests]
  );

  const myRosterEntry = useMemo(
    () => (activeCourt ? activeCourt.roster[currentUserId] : undefined),
    [activeCourt, currentUserId]
  );

  const myWaitlistEntry = useMemo(
    () =>
      waitlistRequests.find((r) => r.userId === currentUserId) ?? null,
    [waitlistRequests, currentUserId]
  );

  const myPendingEntry = useMemo(
    () =>
      pendingRequests.find((r) => r.userId === currentUserId) ?? null,
    [pendingRequests, currentUserId]
  );

  const hoursUntilStart = useMemo(() => {
    if (!session?.startsAt) return 24;
    return (new Date(session.startsAt).getTime() - Date.now()) / 3600000;
  }, [session?.startsAt]);

  const expectedCancelPenalty =
    hoursUntilStart < 12
      ? Math.abs(RATING_CONFIG.REPUTATION_CHANGE.CANCEL_WITHIN_12_HOURS)
      : 0;

  const handleJoinPress = async () => {
    if (!activeCourt || actionBusy) return;
    setActionBusy(true);
    setActionError(null);
    try {
      const res = await joinCourt(activeCourt.id, currentUserId);
      trigger("success");
      setToast({
        visible: true,
        message: res.message,
        variant: res.status === "waitlist" ? "warning" : "success",
      });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Không thể gửi yêu cầu tham gia.";
      setActionError(msg);
      setToast({ visible: true, message: msg, variant: "error" });
    } finally {
      setActionBusy(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!activeCourt || actionBusy) return;
    setActionBusy(true);
    setActionError(null);
    try {
      const res = await cancelJoin(activeCourt.id, currentUserId);
      setShowCancelConfirm(false);
      trigger("tap");
      if (res.promotedUser) {
        const promoMsg = `Đã hủy tham gia. Hệ thống tự động đôn ${res.promotedUser} từ Waitlist lên chính thức!`;
        setPromotionNotice(promoMsg);
        setToast({ visible: true, message: promoMsg, variant: "info" });
      } else {
        setToast({
          visible: true,
          message:
            res.penalty > 0
              ? `Đã hủy tham gia (-${res.penalty} điểm uy tín).`
              : "Đã hủy tham gia thành công (0 điểm phạt).",
          variant: "info",
        });
      }
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Không thể hủy tham gia."
      );
    } finally {
      setActionBusy(false);
    }
  };

  const handleToggleRecruit = async () => {
    if (!session || !activeCourt || actionBusy) return;
    if (
      !activeCourt.recruitOpen &&
      (slotInfo.coreCount < RULES.MIN_CORE_PER_COURT ||
        slotInfo.coreCount >= RULES.COURT_CAPACITY)
    ) {
      const msg =
        slotInfo.coreCount >= RULES.COURT_CAPACITY
          ? "Sân đã đủ 8 người mặc định, không thể mở tuyển vãng lai."
          : `Cần tối thiểu ${RULES.MIN_CORE_PER_COURT} người mặc định mới được mở tuyển.`;
      setActionError(msg);
      setToast({ visible: true, message: msg, variant: "warning" });
      return;
    }
    setActionBusy(true);
    setActionError(null);
    try {
      await getRepository().toggleRecruitStatus(
        session.id,
        activeCourt.id,
        !activeCourt.recruitOpen
      );
      await refresh();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Không đổi được trạng thái tuyển."
      );
    } finally {
      setActionBusy(false);
    }
  };

  const handleAddGhost = async () => {
    if (!session || !activeCourt || !ghostName.trim() || actionBusy) return;
    setActionBusy(true);
    setActionError(null);
    try {
      await getRepository().addGhostMember(session.id, activeCourt.id, {
        displayName: ghostName.trim(),
        gender: ghostGender,
        rating: 1425,
        position: "both",
        dominantHand: "right",
      } as never);
      setGhostName("");
      setShowGhostSheet(false);
      await refresh();
      setToast({
        visible: true,
        message: "Đã thêm thành viên mặc định (Ghost) vào sân.",
        variant: "success",
      });
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Không thể thêm thành viên."
      );
    } finally {
      setActionBusy(false);
    }
  };

  if (loading && !session) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <Header title="Chi Tiết Phòng Kèo" onBackPress={() => router.back()} />
        <View style={styles.loadingWrap} testID="lobby-detail-loading">
          <Skeleton height={110} borderRadius={RADIUS.lg} />
          <Skeleton height={180} borderRadius={RADIUS.lg} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !session) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <Header title="Chi Tiết Phòng Kèo" onBackPress={() => router.back()} />
        <View style={styles.loadingWrap}>
          <EmptyState
            testID="lobby-detail-error"
            title="Không tìm thấy phòng kèo"
            description={error ?? "Phòng kèo có thể đã bị xóa hoặc không tồn tại."}
            actionLabel="Thử lại"
            onAction={() => void refresh()}
          />
        </View>
      </SafeAreaView>
    );
  }

  const isCourtFull =
    slotInfo.open <= 0 || rosterList.length >= RULES.COURT_CAPACITY;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <Header
        title={session.venueName}
        subtitle={`📍 ${session.district} • 🕒 ${formatDateTime(session.startsAt)}`}
        status={{
          variant: isCourtFull ? "full" : "open",
          label: isCourtFull ? "ĐÃ ĐẦY" : `CÒN ${slotInfo.open} SUẤT`,
        }}
        onBackPress={() => router.back()}
      />

      <Toast
        visible={toast.visible}
        message={toast.message}
        variant={toast.variant}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {promotionNotice && (
          <View style={styles.promoBanner} testID="waitlist-promotion-banner">
            <Text style={styles.promoBannerText}>🔔 {promotionNotice}</Text>
          </View>
        )}

        {/* Bộ chuyển Sân 01 / Sân 02 (CR-01 tối đa 2 sân) */}
        {courts.length > 1 && (
          <View style={styles.courtSwitchRow}>
            {courts.slice(0, RULES.MAX_COURTS_PER_SESSION).map((c) => {
              const active = c.id === activeCourt?.id;
              return (
                <Pressable
                  key={c.id}
                  testID={`detail-court-tab-${c.id}`}
                  onPress={() => setSelectedCourtId(c.id)}
                  style={[styles.courtTab, active && styles.courtTabActive]}
                >
                  <Text
                    style={[
                      styles.courtTabText,
                      active && styles.courtTabTextActive,
                    ]}
                  >
                    Sân 0{c.courtNumber} ({formatCategoryWithIcon(c.category)})
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Thẻ tổng quan suất tuyển của sân */}
        {activeCourt && (
          <View style={styles.summaryCard} testID="court-slot-summary">
            <View style={styles.summaryTopRow}>
              <Text style={styles.summaryTitle}>
                Sân 0{activeCourt.courtNumber} •{" "}
                {formatCategoryWithIcon(activeCourt.category)}
              </Text>
              <StatusPill
                variant={isCourtFull ? "full" : "open"}
                label={
                  isCourtFull
                    ? "Hết suất chính thức"
                    : `Còn ${slotInfo.open}/${slotInfo.total} suất`
                }
              />
            </View>

            <View style={styles.levelLine}>
              <Text style={styles.metaLabel}>Trình độ:</Text>
              <LevelBadge level={activeCourt.levelMin} compact size="sm" />
              <Text style={styles.metaLabel}>–</Text>
              <LevelBadge level={activeCourt.levelMax} compact size="sm" />
              <Text style={styles.metaLabel}>
                • Uy tín ≥ {activeCourt.minReliability}
              </Text>
            </View>

            <Text style={styles.slotBreakdown} testID="slot-breakdown-text">
              Mặc định: {slotInfo.coreCount}/{RULES.COURT_CAPACITY} • Vãng lai đã
              duyệt: {slotInfo.recruitConfirmed}/{slotInfo.total} • Còn trống:{" "}
              {slotInfo.open} suất
            </Text>

            {isHost && (
              <View style={styles.hostToolsRow}>
                <SecondaryButton
                  testID="btn-toggle-recruit"
                  label={
                    activeCourt.recruitOpen
                      ? "Đóng tuyển vãng lai"
                      : "Mở tuyển vãng lai"
                  }
                  variant="outline"
                  onPress={handleToggleRecruit}
                  style={{ flex: 1 }}
                />
                <SecondaryButton
                  testID="btn-open-add-ghost"
                  label="+ Thêm người (Ghost)"
                  variant="ghost"
                  onPress={() => setShowGhostSheet(true)}
                  style={{ flex: 1 }}
                />
              </View>
            )}
          </View>
        )}

        {/* Danh sách thành viên trên sân (tối đa 8 người) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            Danh sách trên sân ({rosterList.length}/{RULES.COURT_CAPACITY})
          </Text>
          {rosterList.length === 0 ? (
            <Text style={styles.emptySub}>Chưa có thành viên nào trên sân.</Text>
          ) : (
            rosterList.map((m) => (
              <View
                key={m.memberId}
                testID={`roster-member-${m.memberId}`}
                style={styles.memberRow}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.memberName}>{m.displayName}</Text>
                  <Text style={styles.memberMeta}>
                    {m.type === "core"
                      ? m.isGhost
                        ? "Mặc định (Chưa có TK)"
                        : "Mặc định"
                      : "Vãng lai đã duyệt"}{" "}
                    • {m.gender === "M" ? "Nam" : "Nữ"} • Elo {m.rating}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Đơn chờ duyệt (Host) */}
        {isHost && pendingRequests.length > 0 && (
          <View style={styles.sectionCard} testID="pending-requests-section">
            <Text style={styles.sectionTitle}>
              Đơn xin tham gia chờ duyệt ({pendingRequests.length})
            </Text>
            {pendingRequests.map((req) => (
              <View key={req.id} style={styles.requestCard}>
                <Text style={styles.memberName}>
                  {req.snapshot.displayName} (Elo {req.snapshot.rating} • Uy tín{" "}
                  {req.snapshot.reliability})
                </Text>
                <View style={styles.requestActions}>
                  <SecondaryButton
                    testID={`btn-approve-${req.id}`}
                    label="Duyệt"
                    variant="outline"
                    onPress={() =>
                      void reviewRequest(
                        activeCourt!.id,
                        req.id,
                        "approve"
                      )
                    }
                    style={{ flex: 1 }}
                  />
                  <SecondaryButton
                    testID={`btn-decline-${req.id}`}
                    label="Từ chối"
                    variant="ghost"
                    onPress={() =>
                      void reviewRequest(
                        activeCourt!.id,
                        req.id,
                        "decline"
                      )
                    }
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Danh sách dự bị (Waitlist) */}
        <View style={styles.sectionCard} testID="waitlist-section">
          <Text style={styles.sectionTitle}>
            Danh sách dự bị — Waitlist ({waitlistRequests.length})
          </Text>
          {waitlistRequests.length === 0 ? (
            <Text style={styles.emptySub}>Chưa có ai trong hàng đợi dự bị.</Text>
          ) : (
            waitlistRequests.map((w, idx) => (
              <View
                key={w.id}
                testID={`waitlist-item-${w.userId}`}
                style={styles.memberRow}
              >
                <Text style={styles.waitlistRank}>
                  #{w.waitlistPosition ?? idx + 1}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.memberName}>
                    {w.snapshot.displayName}
                  </Text>
                  <Text style={styles.memberMeta}>
                    Elo {w.snapshot.rating} • Uy tín {w.snapshot.reliability}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {actionError && (
          <View style={styles.errorBox} testID="lobby-action-error">
            <Text style={styles.errorText}>⚠️ {actionError}</Text>
          </View>
        )}
      </ScrollView>

      {/* Thanh hành động dưới cùng */}
      <View style={styles.bottomDock}>
        {myRosterEntry ? (
          <View style={{ gap: SPACING.xs }}>
            <Text style={styles.myStatusText} testID="my-status-confirmed">
              ✓ Bạn đã có tên trong sân này
            </Text>
            <SecondaryButton
              testID="btn-cancel-participation"
              label="HỦY THAM GIA"
              variant="outline"
              onPress={() => setShowCancelConfirm(true)}
            />
          </View>
        ) : myWaitlistEntry ? (
          <View style={{ gap: SPACING.xs }}>
            <Text style={styles.myStatusText} testID="my-status-waitlist">
              ⏳ Bạn đang ở vị trí dự bị #{myWaitlistEntry.waitlistPosition ?? 1}
            </Text>
            <SecondaryButton
              testID="btn-cancel-waitlist"
              label="RÚT KHỎI DỰ BỊ"
              variant="outline"
              onPress={() => setShowCancelConfirm(true)}
            />
          </View>
        ) : myPendingEntry ? (
          <Text style={styles.myStatusText} testID="my-status-pending">
            ⏳ Đơn của bạn đang chờ Host duyệt
          </Text>
        ) : (
          <NeonCTAButton
            testID="btn-join-court"
            label={
              isCourtFull
                ? "ĐĂNG KÝ DỰ BỊ (WAITLIST)"
                : "XIN THAM GIA SÂN NÀY"
            }
            loading={actionBusy}
            disabled={actionBusy}
            onPress={handleJoinPress}
          />
        )}
      </View>

      {/* BottomSheet xác nhận hủy & cảnh báo phạt uy tín */}
      <BottomSheet
        visible={showCancelConfirm}
        title="Xác nhận hủy tham gia"
        onClose={() => setShowCancelConfirm(false)}
      >
        <View style={{ gap: SPACING.md }}>
          <Text style={styles.cancelWarningText} testID="cancel-penalty-warning">
            {expectedCancelPenalty > 0
              ? `⚠️ Lưu ý: Hiện còn dưới 12 giờ trước giờ đánh. Nếu hủy lúc này, bạn sẽ bị trừ -${expectedCancelPenalty} điểm uy tín.`
              : "Bạn đang hủy trước giờ đánh >= 12 tiếng nên không bị trừ điểm uy tín (0 điểm phạt)."}
          </Text>
          <NeonCTAButton
            testID="btn-confirm-cancel-join"
            label="XÁC NHẬN HỦY THAM GIA"
            loading={actionBusy}
            onPress={handleConfirmCancel}
          />
          <SecondaryButton
            label="Giữ nguyên suất"
            variant="ghost"
            onPress={() => setShowCancelConfirm(false)}
          />
        </View>
      </BottomSheet>

      {/* BottomSheet thêm thành viên Ghost (chưa có tài khoản) */}
      <BottomSheet
        visible={showGhostSheet}
        title="Thêm người mặc định (Chưa có TK)"
        onClose={() => setShowGhostSheet(false)}
      >
        <View style={{ gap: SPACING.md }}>
          <TextInput
            testID="input-ghost-name"
            value={ghostName}
            onChangeText={setGhostName}
            placeholder="Tên thành viên (ví dụ: Anh Hùng)..."
            placeholderTextColor={PALETTE.text.muted}
            style={styles.textInput}
          />
          <View style={{ flexDirection: "row", gap: SPACING.sm }}>
            {(["M", "F"] as const).map((g) => (
              <Pressable
                key={g}
                onPress={() => setGhostGender(g)}
                style={[
                  styles.chip,
                  { flex: 1, alignItems: "center" },
                  ghostGender === g && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    ghostGender === g && styles.chipTextActive,
                  ]}
                >
                  {g === "M" ? "Nam" : "Nữ"}
                </Text>
              </Pressable>
            ))}
          </View>
          <NeonCTAButton
            testID="btn-confirm-add-ghost"
            label="THÊM VÀO SÂN"
            loading={actionBusy}
            onPress={handleAddGhost}
          />
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

export default function LobbyDetailRoute() {
  return <LobbyDetailScreen />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PALETTE.bg.canvas,
  },
  loadingWrap: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
  },
  promoBanner: {
    backgroundColor: "rgba(0, 255, 163, 0.14)",
    borderColor: PALETTE.accent.primary,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
  },
  promoBannerText: {
    ...TYPOGRAPHY.bodySmall,
    color: PALETTE.accent.primary,
    fontWeight: "700",
  },
  courtSwitchRow: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  courtTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: PALETTE.surface.card,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    alignItems: "center",
  },
  courtTabActive: {
    borderColor: PALETTE.accent.primary,
    backgroundColor: "rgba(0, 255, 163, 0.14)",
  },
  courtTabText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
    fontWeight: "600",
  },
  courtTabTextActive: {
    color: PALETTE.accent.primary,
    fontWeight: "800",
  },
  summaryCard: {
    backgroundColor: PALETTE.surface.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    gap: SPACING.sm,
  },
  summaryTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.xs,
  },
  summaryTitle: {
    ...TYPOGRAPHY.sectionTitle,
    color: PALETTE.text.primary,
    fontWeight: "700",
    flex: 1,
  },
  levelLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  metaLabel: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
  },
  slotBreakdown: {
    ...TYPOGRAPHY.bodySmall,
    color: PALETTE.accent.primary,
    fontWeight: "700",
  },
  hostToolsRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: PALETTE.surface.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    gap: SPACING.sm,
  },
  sectionTitle: {
    ...TYPOGRAPHY.sectionTitle,
    color: PALETTE.text.primary,
    fontWeight: "700",
  },
  emptySub: {
    ...TYPOGRAPHY.bodySmall,
    color: PALETTE.text.muted,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: PALETTE.bg.surface,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  memberName: {
    ...TYPOGRAPHY.body,
    color: PALETTE.text.primary,
    fontWeight: "700",
  },
  memberMeta: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
  },
  waitlistRank: {
    ...TYPOGRAPHY.sectionTitle,
    color: PALETTE.teamB.amber,
    fontWeight: "800",
    minWidth: 30,
  },
  requestCard: {
    backgroundColor: PALETTE.bg.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    gap: SPACING.xs,
  },
  requestActions: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  errorBox: {
    backgroundColor: "rgba(255, 82, 82, 0.14)",
    borderColor: PALETTE.teamB.coral,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
  },
  errorText: {
    ...TYPOGRAPHY.bodySmall,
    color: PALETTE.teamB.coral,
    fontWeight: "600",
  },
  bottomDock: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    backgroundColor: PALETTE.bg.canvas,
    borderTopWidth: 1,
    borderTopColor: PALETTE.border.subtle,
  },
  myStatusText: {
    ...TYPOGRAPHY.bodySmall,
    color: PALETTE.accent.primary,
    fontWeight: "700",
    textAlign: "center",
  },
  cancelWarningText: {
    ...TYPOGRAPHY.body,
    color: PALETTE.teamB.amber,
    lineHeight: 22,
  },
  textInput: {
    backgroundColor: PALETTE.bg.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    color: PALETTE.text.primary,
    ...TYPOGRAPHY.body,
  },
  chip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 10,
    borderRadius: RADIUS.pill,
    backgroundColor: PALETTE.bg.surface,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
  },
  chipActive: {
    backgroundColor: "rgba(0, 255, 163, 0.16)",
    borderColor: PALETTE.accent.primary,
  },
  chipText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
    fontWeight: "700",
  },
  chipTextActive: {
    color: PALETTE.accent.primary,
  },
});

