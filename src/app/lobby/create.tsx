import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Header,
  LevelBadge,
  NeonCTAButton,
  Toast,
  ToastVariant,
} from "../../components";
import { DA_NANG_DISTRICTS, DA_NANG_VENUES } from "../../config/districts";
import { RULES } from "../../config/rules";
import { getRepository } from "../../data";
import { computeSlots } from "../../domain/recruit/slotCalculation";
import { BadmintonLevel, CourtCategory } from "../../domain/types";
import { useAuth, useHaptics } from "../../hooks";
import { PALETTE, RADIUS, SPACING, TYPOGRAPHY } from "../../theme";

interface CourtFormConfig {
  category: CourtCategory;
  coreCount: number;
  levelMin: BadmintonLevel;
  levelMax: BadmintonLevel;
}

const TIME_SLOTS = [
  { label: "Hôm nay 18:00", offsetHours: 3 },
  { label: "Hôm nay 19:30", offsetHours: 4.5 },
  { label: "Ngày mai 18:00", offsetHours: 24 },
  { label: "Ngày mai 20:00", offsetHours: 26 },
];

export function CreateSessionScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { trigger } = useHaptics(true);

  const [selectedVenueId, setSelectedVenueId] = useState<string>(
    DA_NANG_VENUES[0].id
  );
  const [venueName, setVenueName] = useState<string>(DA_NANG_VENUES[0].name);
  const [district, setDistrict] = useState<string>(DA_NANG_VENUES[0].district);
  const [timeSlotIdx, setTimeSlotIdx] = useState<number>(1);
  const [courtCount, setCourtCount] = useState<1 | 2>(1);
  const [courtConfigs, setCourtConfigs] = useState<[CourtFormConfig, CourtFormConfig]>([
    { category: "mixed", coreCount: 4, levelMin: 2, levelMax: 5 },
    { category: "men", coreCount: 6, levelMin: 3, levelMax: 6 },
  ]);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    variant: ToastVariant;
  }>({ visible: false, message: "", variant: "info" });

  const activeConfigs = useMemo(
    () => courtConfigs.slice(0, courtCount),
    [courtConfigs, courtCount]
  );

  const totalCorePlayers = useMemo(
    () => activeConfigs.reduce((sum, c) => sum + c.coreCount, 0),
    [activeConfigs]
  );

  const totalOpenSlots = useMemo(
    () =>
      activeConfigs.reduce(
        (sum, c) => sum + computeSlots(c.coreCount, 0).total,
        0
      ),
    [activeConfigs]
  );

  const updateCourtConfig = (
    idx: 0 | 1,
    patch: Partial<CourtFormConfig>
  ) => {
    setFormError(null);
    setCourtConfigs((prev) => {
      const next: [CourtFormConfig, CourtFormConfig] = [{ ...prev[0] }, { ...prev[1] }];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  };

  const handleCreateSession = async () => {
    if (submitting) return;

    if (!venueName.trim()) {
      setFormError("Vui lòng nhập tên sân cầu lông.");
      return;
    }

    if (courtCount > RULES.MAX_COURTS_PER_SESSION) {
      setFormError(
        `Mỗi kèo chỉ được tối đa ${RULES.MAX_COURTS_PER_SESSION} sân theo quy định.`
      );
      return;
    }

    for (let i = 0; i < activeConfigs.length; i++) {
      const cfg = activeConfigs[i];
      if (
        cfg.coreCount < RULES.MIN_CORE_PER_COURT ||
        cfg.coreCount > RULES.COURT_CAPACITY
      ) {
        setFormError(
          `Sân 0${i + 1}: Số người mặc định phải từ ${RULES.MIN_CORE_PER_COURT} đến ${RULES.COURT_CAPACITY} người.`
        );
        return;
      }
      if (cfg.levelMin > cfg.levelMax) {
        setFormError(
          `Sân 0${i + 1}: Cấp trình độ tối thiểu không được lớn hơn tối đa.`
        );
        return;
      }
    }

    const totalCapacity = courtCount * RULES.COURT_CAPACITY;
    if (totalCorePlayers > totalCapacity) {
      setFormError(
        `Tổng số người vượt quá giới hạn tối đa ${totalCapacity} người (${courtCount} sân).`
      );
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const repo = getRepository();
      const chosenSlot = TIME_SLOTS[timeSlotIdx] ?? TIME_SLOTS[0];
      const startsAtDate = new Date(
        Date.now() + chosenSlot.offsetHours * 3600 * 1000
      );
      const endsAtDate = new Date(startsAtDate.getTime() + 2 * 3600 * 1000);

      const hostId = user?.uid ?? "user_host_01";
      const hostName = user?.displayName ?? "Host Đà Nẵng";

      const courtSummaries = activeConfigs.map((cfg, i) => {
        const slot = computeSlots(cfg.coreCount, 0);
        return {
          courtId: String(i + 1),
          category: cfg.category,
          levelMin: cfg.levelMin,
          levelMax: cfg.levelMax,
          openSlots: slot.open,
          recruitOpen: slot.total > 0,
        };
      });

      const sessionId = await repo.createSession({
        hostId,
        hostName,
        venueName: venueName.trim(),
        district,
        address: `${venueName.trim()}, ${district}, Đà Nẵng`,
        startsAt: startsAtDate.toISOString(),
        endsAt: endsAtDate.toISOString(),
        courtCount,
        status: totalOpenSlots > 0 ? "open" : "full",
        openSlotsTotal: totalOpenSlots,
        courtSummaries,
        notes: "Kèo giao lưu phong trào Đà Nẵng",
        isDeleted: false,
      });

      // Thêm sẵn nhóm người mặc định (core/ghost) tương ứng vào từng sân
      for (let i = 0; i < activeConfigs.length; i++) {
        const cfg = activeConfigs[i];
        const courtId = String(i + 1);
        for (let m = 0; m < cfg.coreCount; m++) {
          const gender =
            cfg.category === "women"
              ? "F"
              : cfg.category === "men"
                ? "M"
                : m % 2 === 0
                  ? "M"
                  : "F";
          await repo.addGhostMember(sessionId, courtId, {
            displayName: `Nhóm Host #${m + 1}`,
            gender,
            rating: 1425,
            position: "both",
            dominantHand: "right",
            type: "core",
            isGhost: true,
          } as never);
          await new Promise((r) => setTimeout(r, 2));
        }
      }

      trigger("success");
      setToast({
        visible: true,
        message: "Tạo kèo giao lưu thành công!",
        variant: "success",
      });
      router.replace(`/lobby/${sessionId}` as never);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Không thể tạo kèo mới."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <Header
        title="Tạo Kèo Giao Lưu Mới"
        subtitle="Quy chuẩn CR-01: Tối đa 2 sân • <= 8 người/sân"
        onBackPress={() => router.back()}
      />

      <Toast
        visible={toast.visible}
        message={toast.message}
        variant={toast.variant}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Chọn cụm sân & Quận Đà Nẵng */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>1. Địa điểm tại Đà Nẵng</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {DA_NANG_VENUES.slice(0, 6).map((v) => {
                const active = selectedVenueId === v.id;
                return (
                  <Pressable
                    key={v.id}
                    testID={`venue-chip-${v.id}`}
                    onPress={() => {
                      setSelectedVenueId(v.id);
                      setVenueName(v.name);
                      setDistrict(v.district);
                    }}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text
                      style={[styles.chipText, active && styles.chipTextActive]}
                    >
                      {v.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <TextInput
              testID="input-venue-name"
              value={venueName}
              onChangeText={(txt) => {
                setFormError(null);
                setVenueName(txt);
              }}
              placeholder="Tên sân cầu lông..."
              placeholderTextColor={PALETTE.text.muted}
              style={styles.textInput}
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {DA_NANG_DISTRICTS.map((d) => {
                const active = district === d;
                return (
                  <Pressable
                    key={d}
                    testID={`create-district-${d}`}
                    onPress={() => setDistrict(d)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text
                      style={[styles.chipText, active && styles.chipTextActive]}
                    >
                      {d}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* 2. Khung giờ & Số sân (1–2 sân) */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>2. Thời gian & Quy mô sân</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {TIME_SLOTS.map((slot, idx) => {
                const active = timeSlotIdx === idx;
                return (
                  <Pressable
                    key={slot.label}
                    onPress={() => setTimeSlotIdx(idx)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text
                      style={[styles.chipText, active && styles.chipTextActive]}
                    >
                      🕒 {slot.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={styles.subLabel}>
              Số sân thuê (Tối đa {RULES.MAX_COURTS_PER_SESSION} sân / 16 người)
            </Text>
            <View style={styles.rowTwo}>
              {([1, 2] as const).map((cnt) => {
                const active = courtCount === cnt;
                return (
                  <Pressable
                    key={cnt}
                    testID={`btn-court-count-${cnt}`}
                    onPress={() => {
                      trigger("tap");
                      setCourtCount(cnt);
                    }}
                    style={[styles.toggleBox, active && styles.toggleBoxActive]}
                  >
                    <Text
                      style={[
                        styles.toggleTitle,
                        active && styles.toggleTitleActive,
                      ]}
                    >
                      {cnt} Sân
                    </Text>
                    <Text style={styles.toggleSub}>
                      Tối đa {cnt * RULES.COURT_CAPACITY} người
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* 3. Cấu hình từng sân */}
          {activeConfigs.map((cfg, idx) => {
            const courtIdx = idx as 0 | 1;
            const slotInfo = computeSlots(cfg.coreCount, 0);

            return (
              <View
                key={idx}
                style={styles.sectionCard}
                testID={`court-config-${idx + 1}`}
              >
                <View style={styles.courtConfigHeader}>
                  <Text style={styles.sectionTitle}>
                    Cấu hình Sân 0{idx + 1}
                  </Text>
                  <Text
                    style={[
                      styles.recruitBadge,
                      {
                        color:
                          slotInfo.total > 0
                            ? PALETTE.accent.primary
                            : PALETTE.teamB.amber,
                      },
                    ]}
                  >
                    {slotInfo.total > 0
                      ? `Mở tuyển ${slotInfo.total} vãng lai`
                      : "Đủ 8 người (Không mở tuyển)"}
                  </Text>
                </View>

                <Text style={styles.subLabel}>Nội dung thi đấu</Text>
                <View style={styles.chipsRowWrap}>
                  {(
                    [
                      { key: "men", label: "👨 Đôi nam" },
                      { key: "women", label: "👩 Đôi nữ" },
                      { key: "mixed", label: "🤝 Đôi nam nữ" },
                    ] as const
                  ).map((cat) => {
                    const active = cfg.category === cat.key;
                    return (
                      <Pressable
                        key={cat.key}
                        testID={`court-${idx + 1}-cat-${cat.key}`}
                        onPress={() =>
                          updateCourtConfig(courtIdx, { category: cat.key })
                        }
                        style={[styles.chip, active && styles.chipActive]}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            active && styles.chipTextActive,
                          ]}
                        >
                          {cat.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={styles.subLabel}>
                  Số người mặc định sẵn có ({RULES.MIN_CORE_PER_COURT}–
                  {RULES.COURT_CAPACITY} người)
                </Text>
                <View style={styles.stepperRow}>
                  <Pressable
                    testID={`court-${idx + 1}-core-minus`}
                    onPress={() => {
                      if (cfg.coreCount <= RULES.MIN_CORE_PER_COURT) {
                        setFormError(
                          `Mỗi sân cần tối thiểu ${RULES.MIN_CORE_PER_COURT} người mặc định.`
                        );
                        return;
                      }
                      updateCourtConfig(courtIdx, {
                        coreCount: cfg.coreCount - 1,
                      });
                    }}
                    style={styles.stepperBtn}
                  >
                    <Text style={styles.stepperBtnText}>−</Text>
                  </Pressable>

                  <View style={styles.stepperValueBox}>
                    <Text
                      style={styles.stepperValue}
                      testID={`court-${idx + 1}-core-value`}
                    >
                      {cfg.coreCount} người mặc định
                    </Text>
                    <Text style={styles.stepperSub}>
                      Suất tuyển = min(4, 8 - {cfg.coreCount}) = {slotInfo.total}
                    </Text>
                  </View>

                  <Pressable
                    testID={`court-${idx + 1}-core-plus`}
                    onPress={() => {
                      if (cfg.coreCount >= RULES.COURT_CAPACITY) {
                        setFormError(
                          `Mỗi sân tối đa ${RULES.COURT_CAPACITY} người theo luật CR-01.`
                        );
                        return;
                      }
                      updateCourtConfig(courtIdx, {
                        coreCount: cfg.coreCount + 1,
                      });
                    }}
                    style={styles.stepperBtn}
                  >
                    <Text style={styles.stepperBtnText}>+</Text>
                  </Pressable>
                </View>

                <Text style={styles.subLabel}>
                  Dải trình độ yêu cầu (Cấp {cfg.levelMin} – Cấp {cfg.levelMax})
                </Text>
                <View style={styles.levelRangeRow}>
                  <LevelBadge level={cfg.levelMin} compact size="sm" />
                  <Text style={styles.rangeArrow}>→</Text>
                  <LevelBadge level={cfg.levelMax} compact size="sm" />
                </View>
              </View>
            );
          })}

          {formError && (
            <View style={styles.errorBox} testID="create-form-error">
              <Text style={styles.errorText}>⚠️ {formError}</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.bottomDock}>
        <NeonCTAButton
          testID="btn-submit-create-session"
          label={
            submitting
              ? "ĐANG TẠO KÈO..."
              : `TẠO KÈO (${courtCount} SÂN • ${totalOpenSlots} SUẤT TUYỂN)`
          }
          loading={submitting}
          disabled={submitting}
          onPress={handleCreateSession}
        />
      </View>
    </SafeAreaView>
  );
}

export default function CreateSessionRoute() {
  return <CreateSessionScreen />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PALETTE.bg.canvas,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
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
  subLabel: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
    fontWeight: "600",
    marginTop: 4,
  },
  chipsRow: {
    gap: SPACING.xs,
    paddingVertical: 2,
  },
  chipsRowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
  },
  chip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    backgroundColor: PALETTE.bg.surface,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    minHeight: 38,
    justifyContent: "center",
  },
  chipActive: {
    backgroundColor: "rgba(0, 255, 163, 0.16)",
    borderColor: PALETTE.accent.primary,
  },
  chipText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
    fontWeight: "600",
  },
  chipTextActive: {
    color: PALETTE.accent.primary,
    fontWeight: "800",
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
  rowTwo: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  toggleBox: {
    flex: 1,
    backgroundColor: PALETTE.bg.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    padding: SPACING.sm,
    alignItems: "center",
    minHeight: 58,
    justifyContent: "center",
  },
  toggleBoxActive: {
    backgroundColor: "rgba(0, 255, 163, 0.14)",
    borderColor: PALETTE.accent.primary,
  },
  toggleTitle: {
    ...TYPOGRAPHY.body,
    color: PALETTE.text.primary,
    fontWeight: "700",
  },
  toggleTitleActive: {
    color: PALETTE.accent.primary,
  },
  toggleSub: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.muted,
  },
  courtConfigHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.xs,
  },
  recruitBadge: {
    ...TYPOGRAPHY.caption,
    fontWeight: "800",
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  stepperBtn: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: PALETTE.bg.surface,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperBtnText: {
    fontSize: 22,
    color: PALETTE.text.primary,
    fontWeight: "800",
  },
  stepperValueBox: {
    flex: 1,
    alignItems: "center",
  },
  stepperValue: {
    ...TYPOGRAPHY.body,
    color: PALETTE.text.primary,
    fontWeight: "700",
  },
  stepperSub: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.accent.primary,
  },
  levelRangeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  rangeArrow: {
    color: PALETTE.text.muted,
    fontWeight: "700",
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
});

