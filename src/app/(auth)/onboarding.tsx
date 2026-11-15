import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  ChoiceGroup,
  FormScreen,
  LevelBadge,
  NeonCTAButton,
  ProgressDots,
  TextField,
} from "../../components";
import { DA_NANG_DISTRICTS } from "../../config/districts";
import {
  mapAuthErrorMessage,
  validateDisplayName,
  validateOptionalPhone,
} from "../../data/auth";
import {
  GENDER_OPTIONS,
  HAND_OPTIONS,
  ONBOARDING_QUESTIONS,
  PLAY_CATEGORY_OPTIONS,
  PlayCategoryPref,
  POSITION_OPTIONS,
  TOTAL_QUESTIONS,
} from "../../data/onboarding";
import {
  calculateInitialRatingFromAnswers,
  levelToRange,
} from "../../domain/rating/initialRating";
import { DominantHand, Gender, Position } from "../../domain/types";
import { useAuth } from "../../hooks";
import {
  getLevelMeta,
  PALETTE,
  RADIUS,
  SPACING,
  TOUCH,
  TYPOGRAPHY,
  triggerHaptic,
} from "../../theme";

/**
 * Màn 21 — Khởi Tạo Hồ Sơ & Cân Trình Elo (Figma node 5:268).
 * - 10 câu hỏi tự đánh giá lấy nguyên văn từ docs/06-rating-scale.md
 * - Điểm khởi tạo và cấp độ tính bằng calculateInitialRatingFromAnswers (TV1)
 * - Chọn tay thuận, vị trí cầu trước/cầu sau, khu vực Đà Nẵng (src/config/districts.ts),
 *   nội dung đánh (đôi nam / đôi nữ / đôi nam nữ)
 * - Hiển thị cấp độ + khoảng điểm (levelToRange) + giải thích giai đoạn hiệu chỉnh (N=5, K=40)
 */
export default function OnboardingScreen() {
  const router = useRouter();
  const { user, submitOnboarding } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? "");
  const [gender, setGender] = useState<Gender>("M");
  const [dominantHand, setDominantHand] = useState<DominantHand>("right");
  const [position, setPosition] = useState<Position>("back");
  const [areaLabel, setAreaLabel] = useState<string>(DA_NANG_DISTRICTS[0]);
  const [playCategory, setPlayCategory] = useState<PlayCategoryPref>("men");

  // Mặc định chọn đáp án B (2 điểm) cho mỗi câu để có preview Elo trực tiếp;
  // người chơi có thể bấm chọn bất kỳ mức A/B/C/D (1..4 điểm) cho từng câu.
  const [answers, setAnswers] = useState<number[]>(() =>
    ONBOARDING_QUESTIONS.map(() => 2)
  );
  const [touchedQuestions, setTouchedQuestions] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const ratingPreview = useMemo(
    () => calculateInitialRatingFromAnswers(answers),
    [answers]
  );
  const rangePreview = useMemo(
    () => levelToRange(ratingPreview.level),
    [ratingPreview.level]
  );
  const levelMeta = getLevelMeta(ratingPreview.level);
  const totalScore = useMemo(
    () => answers.reduce((acc, v) => acc + v, 0),
    [answers]
  );

  const districtOptions = useMemo(
    () => DA_NANG_DISTRICTS.map((d) => ({ value: d, label: d })),
    []
  );

  const handleSelectAnswer = (qIndex: number, score: 1 | 2 | 3 | 4) => {
    triggerHaptic("selection");
    setAnswers((prev) => {
      const next = [...prev];
      next[qIndex] = score;
      return next;
    });
    setTouchedQuestions((prev) => ({ ...prev, [qIndex]: true }));
  };

  const handleQuickPreset = (score: 1 | 2 | 3 | 4) => {
    triggerHaptic("selection");
    setAnswers(ONBOARDING_QUESTIONS.map(() => score));
    const allTouched: Record<number, boolean> = {};
    ONBOARDING_QUESTIONS.forEach((_, idx) => {
      allTouched[idx] = true;
    });
    setTouchedQuestions(allTouched);
  };

  const handleSubmit = async () => {
    setError(null);
    const nameErr = validateDisplayName(displayName);
    const phoneErr = validateOptionalPhone(phoneNumber);
    if (nameErr || phoneErr) {
      setError(nameErr || phoneErr);
      return;
    }

    setSubmitting(true);
    try {
      await submitOnboarding({
        displayName: displayName.trim(),
        gender,
        phoneNumber: phoneNumber.trim() || undefined,
        dominantHand,
        position,
        areaLabel,
        onboardingAnswers: answers,
        playCategory,
      });
      router.replace("/(tabs)/profile" as never);
    } catch (err) {
      setError(mapAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = Object.keys(touchedQuestions).length;

  return (
    <FormScreen
      testID="onboarding-screen"
      footer={
        <View style={styles.footerWrap}>
          <View style={styles.footerSummaryRow}>
            <View>
              <Text style={styles.footerSmall}>CẤP ĐỘ DỰ KIẾN ({totalScore}/40 điểm):</Text>
              <Text style={styles.footerElo}>
                {`${ratingPreview.initialRating} ELO • Khoảng ${rangePreview.minRating}–${rangePreview.maxRating}`}
              </Text>
            </View>
            <LevelBadge level={ratingPreview.level} showRange />
          </View>
          <NeonCTAButton
            label="HOÀN TẤT & VÀO SÂN ĐẤU BWF →"
            onPress={handleSubmit}
            loading={submitting}
            testID="onboarding-submit-btn"
          />
        </View>
      }
    >
      {/* Header (Figma 5:268) */}
      <View style={styles.headerBlock}>
        <View style={styles.headerTopRow}>
          <Text style={styles.stepBadge}>BƯỚC 2/2 • CÂN TRÌNH ĐỘ CHUẨN BWF</Text>
          <ProgressDots current={2} total={2} label="Bước 2/2" />
        </View>
        <Text style={styles.screenTitle}>Khởi Tạo Hồ Sơ & Cân Trình Elo</Text>
        <Text style={styles.subtitle}>
          Khai báo chính xác giúp thuật toán ghép bạn vào đúng bàn đấu cân sức nhất tại Đà Nẵng.
        </Text>
      </View>

      {/* Live Elo & Level Preview Card */}
      <View style={[styles.eloPreviewCard, { borderColor: levelMeta.color }]}>
        <View style={styles.eloPreviewTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eloPreviewLabel}>ĐIỂM ELO KHỞI TẠO DỰ KIẾN</Text>
            <Text
              style={[styles.eloBigNumber, { color: levelMeta.color }]}
              testID="onboarding-elo-preview"
            >
              {`${ratingPreview.initialRating} ELO`}
            </Text>
            <Text style={styles.eloRangeText}>
              {levelMeta.fullVi} ({levelMeta.shortVi}) • Dải điểm chuẩn:{" "}
              {rangePreview.minRating} – {rangePreview.maxRating}
            </Text>
          </View>
          <LevelBadge level={ratingPreview.level} size="md" />
        </View>
      </View>

      {/* Section 1: Thông tin cá nhân & Lối chơi */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>1. HỒ SƠ VĐV & LỐI ĐÁNH SỞ TRƯỜNG</Text>

        <TextField
          label="TÊN HIỂN THỊ TRÊN SÂN (2–50 KÝ TỰ)"
          placeholder="Nguyễn Văn Quốc"
          value={displayName}
          onChangeText={setDisplayName}
          testID="onboarding-name-input"
        />

        <TextField
          label="SỐ ĐIỆN THOẠI LIÊN HỆ SÂN (TÙY CHỌN)"
          placeholder="0905 888 999"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          testID="onboarding-phone-input"
        />

        <ChoiceGroup
          label="GIỚI TÍNH THI ĐẤU"
          options={GENDER_OPTIONS}
          value={gender}
          onChange={setGender}
          testIDPrefix="onboarding-gender"
        />

        <ChoiceGroup
          label="TAY THUẬN CẦM VỢT"
          options={HAND_OPTIONS}
          value={dominantHand}
          onChange={setDominantHand}
          testIDPrefix="onboarding-hand"
        />

        <ChoiceGroup
          label="VỊ TRÍ SỞ TRƯỜNG TRONG ĐÁNH ĐÔI (LỐI CHƠI)"
          options={POSITION_OPTIONS}
          value={position}
          onChange={setPosition}
          columns={3}
          testIDPrefix="onboarding-position"
        />

        <ChoiceGroup
          label="NỘI DUNG ĐÁNH ƯU TIÊN"
          options={PLAY_CATEGORY_OPTIONS}
          value={playCategory}
          onChange={setPlayCategory}
          columns={3}
          testIDPrefix="onboarding-category"
        />

        <ChoiceGroup
          label="KHU VỰC SÂN THƯỜNG ĐÁNH TẠI ĐÀ NẴNG"
          options={districtOptions}
          value={areaLabel}
          onChange={setAreaLabel}
          columns={2}
          testIDPrefix="onboarding-district"
        />
      </View>

      {/* Section 2: 10 Câu hỏi tự đánh giá từ docs/06-rating-scale.md */}
      <View style={styles.card}>
        <View style={styles.quizHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>
              2. KHẢO SÁT KỸ THUẬT 10 CÂU ( CHUẨN THANG 6 CẤP )
            </Text>
            <Text style={styles.quizSub}>
              Đã tinh chỉnh {answeredCount}/{TOTAL_QUESTIONS} câu • Tổng điểm hiện tại:{" "}
              {totalScore}/40
            </Text>
          </View>
        </View>

        {/* Quick presets for fast selection */}
        <View style={styles.presetRow}>
          <Text style={styles.presetLabel}>Chọn nhanh mẫu trình độ:</Text>
          <View style={styles.presetButtons}>
            {(
              [
                { score: 1, title: "Mới chơi (A)" },
                { score: 2, title: "TB- (B)" },
                { score: 3, title: "TB / TB+ (C)" },
                { score: 4, title: "Khá / Tốt (D)" },
              ] as const
            ).map((p) => (
              <Pressable
                key={p.score}
                onPress={() => handleQuickPreset(p.score)}
                style={styles.presetChip}
                accessibilityRole="button"
                testID={`onboarding-preset-${p.score}`}
              >
                <Text style={styles.presetChipText}>{p.title}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {ONBOARDING_QUESTIONS.map((q, qIdx) => {
          const currentScore = answers[qIdx];
          return (
            <View key={q.id} style={styles.questionCard}>
              <Text style={styles.questionTitle}>
                Câu {q.id}/{TOTAL_QUESTIONS}: {q.title}
              </Text>
              <View style={styles.optionsCol}>
                {q.options.map((opt) => {
                  const selected = currentScore === opt.score;
                  return (
                    <Pressable
                      key={opt.key}
                      onPress={() => handleSelectAnswer(qIdx, opt.score)}
                      style={[
                        styles.optionItem,
                        selected && styles.optionItemSelected,
                      ]}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      testID={`onboarding-q${q.id}-${opt.key}`}
                    >
                      <View
                        style={[
                          styles.optionKeyBadge,
                          selected && styles.optionKeyBadgeSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionKeyText,
                            selected && styles.optionKeyTextSelected,
                          ]}
                        >
                          {opt.key}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.optionText,
                          selected && styles.optionTextSelected,
                        ]}
                      >
                        {opt.text}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>

      {/* Section 3: Fair-Play K-Factor Calibration Banner (Figma 5:268 + docs/06-rating-scale.md) */}
      <View style={styles.calibrationBanner}>
        <Text style={styles.calibrationTitle}>
          🛡 CƠ CHẾ HIỆU CHỈNH TRÌNH ĐỘ (PROVISIONAL K-FACTOR)
        </Text>
        <Text style={styles.calibrationBody}>
          Điểm Elo chỉ là điểm khởi đầu! Hệ thống áp dụng hệ số hiệu chỉnh cao{" "}
          <Text style={styles.calibrationHighlight}>K = 40 trong 5 trận đầu tiên</Text>{" "}
          để điểm số hội tụ nhanh về đúng thực lực trên sân (từ trận thứ 6 trở đi hệ số
          về chuẩn K = 24), chống ép trình (sandbagging).
        </Text>
      </View>

      {error ? (
        <View style={styles.errorBanner} accessibilityRole="alert">
          <Text style={styles.errorText}>⚠ {error}</Text>
        </View>
      ) : null}
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    gap: 4,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stepBadge: {
    ...TYPOGRAPHY.micro,
    color: PALETTE.accent.primary,
  },
  screenTitle: {
    ...TYPOGRAPHY.titleMedium,
    color: PALETTE.text.primary,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
  },
  eloPreviewCard: {
    backgroundColor: PALETTE.bg.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    padding: SPACING.md,
  },
  eloPreviewTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.sm,
  },
  eloPreviewLabel: {
    ...TYPOGRAPHY.micro,
    color: PALETTE.text.secondary,
  },
  eloBigNumber: {
    ...TYPOGRAPHY.titleLarge,
    marginVertical: 2,
  },
  eloRangeText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
  },
  card: {
    backgroundColor: PALETTE.bg.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.sectionHeader,
    color: PALETTE.accent.primary,
  },
  quizHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quizSub: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
    marginTop: 2,
  },
  presetRow: {
    backgroundColor: PALETTE.bg.elevated,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    gap: 6,
  },
  presetLabel: {
    ...TYPOGRAPHY.captionBold,
    color: PALETTE.text.secondary,
  },
  presetButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: PALETTE.bg.surface,
    borderWidth: 1,
    borderColor: PALETTE.border.default,
  },
  presetChipText: {
    ...TYPOGRAPHY.captionBold,
    color: PALETTE.accent.cyan,
  },
  questionCard: {
    backgroundColor: PALETTE.bg.canvas,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    padding: SPACING.sm,
    gap: SPACING.xs,
  },
  questionTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: PALETTE.text.primary,
  },
  optionsCol: {
    gap: 6,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    minHeight: TOUCH.minTarget,
    backgroundColor: PALETTE.bg.surface,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: PALETTE.border.default,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 8,
  },
  optionItemSelected: {
    backgroundColor: PALETTE.accent.primarySoft,
    borderColor: PALETTE.accent.primary,
  },
  optionKeyBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: PALETTE.bg.elevated,
    alignItems: "center",
    justifyContent: "center",
  },
  optionKeyBadgeSelected: {
    backgroundColor: PALETTE.accent.primary,
  },
  optionKeyText: {
    ...TYPOGRAPHY.captionBold,
    color: PALETTE.text.secondary,
  },
  optionKeyTextSelected: {
    color: PALETTE.text.inverse,
  },
  optionText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
    flex: 1,
  },
  optionTextSelected: {
    color: PALETTE.text.primary,
    fontWeight: "600",
  },
  calibrationBanner: {
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: PALETTE.accent.cyan,
    padding: SPACING.md,
    gap: 4,
  },
  calibrationTitle: {
    ...TYPOGRAPHY.captionBold,
    color: PALETTE.accent.cyan,
  },
  calibrationBody: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
  },
  calibrationHighlight: {
    color: PALETTE.accent.primary,
    fontWeight: "700",
  },
  errorBanner: {
    backgroundColor: "rgba(239, 68, 68, 0.14)",
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: PALETTE.status.danger,
    padding: SPACING.sm,
  },
  errorText: {
    ...TYPOGRAPHY.captionBold,
    color: PALETTE.status.danger,
  },
  footerWrap: {
    gap: SPACING.xs,
  },
  footerSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  footerSmall: {
    ...TYPOGRAPHY.micro,
    color: PALETTE.text.secondary,
  },
  footerElo: {
    ...TYPOGRAPHY.captionBold,
    color: PALETTE.text.primary,
  },
});

