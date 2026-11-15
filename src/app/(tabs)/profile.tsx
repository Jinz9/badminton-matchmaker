import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  BottomSheet,
  ChoiceGroup,
  EmptyState,
  LevelBadge,
  NeonCTAButton,
  SecondaryButton,
  Skeleton,
  StatusPill,
  TextField,
  Toast,
} from "../../components";
import { DA_NANG_DISTRICTS } from "../../config/districts";
import {
  mapAuthErrorMessage,
  validateDisplayName,
  validateOptionalPhone,
} from "../../data/auth";
import {
  GENDER_OPTIONS,
  HAND_LABEL,
  HAND_OPTIONS,
  PLAY_CATEGORY_OPTIONS,
  PlayCategoryPref,
  POSITION_LABEL,
  POSITION_OPTIONS,
} from "../../data/onboarding";
import {
  loadPlayCategoryPref,
  savePlayCategoryPref,
} from "../../data/preferences";
import { levelToRange, ratingToLevel } from "../../domain/rating/initialRating";
import { DominantHand, Gender, Position } from "../../domain/types";
import { useAuth, useProfile } from "../../hooks";
import {
  getInitials,
  getLevelMeta,
  PALETTE,
  RADIUS,
  SPACING,
  TOUCH,
  TYPOGRAPHY,
} from "../../theme";

const DEFAULT_PREVIEW_UID = "usr_nhat_01";

const PLAY_CATEGORY_LABEL: Record<PlayCategoryPref, string> = {
  men: "Đôi nam",
  women: "Đôi nữ",
  mixed: "Đôi nam nữ",
};

/**
 * Màn 09 & 23 — Hồ Sơ Cá Nhân & Elo + Cài Đặt Tài Khoản (Figma nodes 9:1903 & 5:483).
 * - Avatar chữ cái, điểm Elo, cấp độ + khoảng điểm, điểm uy tín, tỷ lệ thắng (từ Repository)
 * - Nút chỉnh sửa hồ sơ (chỉ sửa các trường được phép theo Security Rules: KHÔNG sửa điểm Elo/Uy tín)
 * - Lưu phiên đăng nhập & Đăng xuất
 */
export default function ProfileScreen() {
  const router = useRouter();
  const { status, user, signOut, refreshProfile } = useAuth();

  const activeUid = user?.uid ?? DEFAULT_PREVIEW_UID;
  const {
    profile,
    stats,
    loading,
    error,
    refresh,
    updateProfile,
  } = useProfile(activeUid);

  const [playCategory, setPlayCategory] = useState<PlayCategoryPref>("men");
  const [editOpen, setEditOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // State cho biểu mẫu chỉnh sửa (chỉ các trường hợp lệ theo Security Rules)
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editGender, setEditGender] = useState<Gender>("M");
  const [editHand, setEditHand] = useState<DominantHand>("right");
  const [editPosition, setEditPosition] = useState<Position>("back");
  const [editArea, setEditArea] = useState<string>(DA_NANG_DISTRICTS[0]);
  const [editCategory, setEditCategory] = useState<PlayCategoryPref>("men");
  const [editError, setEditError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadPlayCategoryPref(activeUid).then((pref) => {
      if (!cancelled && pref) setPlayCategory(pref);
    });
    return () => {
      cancelled = true;
    };
  }, [activeUid]);

  const districtOptions = useMemo(
    () => DA_NANG_DISTRICTS.map((d) => ({ value: d, label: d })),
    []
  );

  const openEditModal = () => {
    if (!profile) return;
    setEditName(profile.displayName);
    setEditPhone(profile.phoneNumber ?? "");
    setEditGender(profile.gender);
    setEditHand(profile.dominantHand);
    setEditPosition(profile.position);
    setEditArea(profile.areaLabel || DA_NANG_DISTRICTS[0]);
    setEditCategory(playCategory);
    setEditError(null);
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    setEditError(null);
    const nErr = validateDisplayName(editName);
    const pErr = validateOptionalPhone(editPhone);
    if (nErr || pErr) {
      setEditError(nErr || pErr);
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        displayName: editName.trim(),
        phoneNumber: editPhone.trim() || null,
        gender: editGender,
        dominantHand: editHand,
        position: editPosition,
        areaLabel: editArea,
      });
      await savePlayCategoryPref(activeUid, editCategory);
      setPlayCategory(editCategory);
      await refreshProfile();
      setEditOpen(false);
      setToastMsg("Đã cập nhật hồ sơ VĐV thành công.");
    } catch (err) {
      setEditError(mapAuthErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.replace("/(auth)/login" as never);
  };

  if (loading && !profile) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Skeleton height={180} />
          <Skeleton height={110} />
          <Skeleton height={160} />
        </View>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="Chưa tìm thấy hồ sơ VĐV"
          description={error ?? "Hãy đăng nhập hoặc hoàn tất bước khai báo trình độ Elo."}
          actionLabel="ĐĂNG NHẬP / ĐĂNG KÝ"
          onAction={() => router.push("/(auth)/login" as never)}
        />
      </View>
    );
  }

  const initials = getInitials(profile.displayName);
  const currentLevel = ratingToLevel(profile.skill.rating);
  const levelMeta = getLevelMeta(currentLevel);
  const range = levelToRange(currentLevel);
  const winRatePct = stats
    ? Math.round(stats.overallWinRate * 100)
    : 0;
  const remainingProvisional = Math.max(0, 5 - profile.skill.matchesPlayed);

  return (
    <View style={styles.container} testID="profile-screen">
      {toastMsg ? (
        <Toast
          visible
          message={toastMsg}
          variant="success"
          onDismiss={() => setToastMsg(null)}
        />
      ) : null}

      <ScrollView contentContainerStyle={styles.content}>
        {/* Auth Session Status Banner */}
        <View style={styles.sessionBar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sessionLabel}>
              {status === "ready" && user
                ? `PHIÊN ĐĂNG NHẬP: ${user.email}`
                : "CHẾ ĐỘ XEM THỬ HỒ SƠ MẪU"}
            </Text>
            <Text style={styles.sessionSub}>
              {status === "ready" && user
                ? "Đã lưu phiên tự động (AsyncStorage)"
                : "Bấm Đăng nhập / Đăng ký để thử luồng Auth & Khảo sát Elo"}
            </Text>
          </View>
          {status !== "ready" || !user ? (
            <Pressable
              onPress={() => router.push("/(auth)/login" as never)}
              style={styles.sessionAuthBtn}
              accessibilityRole="button"
              testID="profile-goto-login-btn"
            >
              <Text style={styles.sessionAuthBtnText}>ĐĂNG NHẬP / ĐĂNG KÝ</Text>
            </Pressable>
          ) : (
            <StatusPill label="ĐÃ XÁC THỰC" variant="live" />
          )}
        </View>

        {/* Athlete Passport Banner (Figma 9:1903 & 5:483) */}
        <View style={styles.passportCard}>
          <View style={styles.passportHeader}>
            <View style={[styles.avatarCircle, { borderColor: levelMeta.color }]}>
              <Text style={styles.avatarInitials} testID="profile-avatar-initials">
                {initials}
              </Text>
            </View>

            <View style={{ flex: 1, gap: 4 }}>
              <View style={styles.nameRow}>
                <Text style={styles.playerName} testID="profile-display-name">
                  {profile.displayName}
                </Text>
                <View style={styles.roleTag}>
                  <Text style={styles.roleTagText}>
                    {profile.role === "host" ? "HOST CLB" : "VĐV"}
                  </Text>
                </View>
              </View>

              <Text style={styles.playerArea}>
                📍 {profile.areaLabel || "Hải Châu"}, Đà Nẵng
                {profile.phoneNumber ? ` • 📞 ${profile.phoneNumber}` : ""}
              </Text>

              <View style={styles.badgeRow}>
                <LevelBadge level={currentLevel} showRange />
                <StatusPill
                  label={
                    profile.skill.isProvisional
                      ? `HIỆU CHỈNH K=40 (CÒN ${remainingProvisional} TRẬN)`
                      : "CHÍNH THỨC K=24"
                  }
                  variant={profile.skill.isProvisional ? "warning" : "live"}
                />
              </View>
            </View>
          </View>

          {/* Elo Hero & Range */}
          <View style={styles.eloBox}>
            <View style={styles.eloCol}>
              <Text style={styles.eloNumber} testID="profile-elo-rating">
                {`${profile.skill.rating} ELO`}
              </Text>
              <Text style={styles.eloCaption}>
                {`${levelMeta.fullVi} • Khoảng chuẩn ${range.minRating}–${range.maxRating}`}
              </Text>
            </View>
            <View style={styles.eloDivider} />
            <View style={styles.eloCol}>
              <Text
                style={[styles.eloNumber, { color: PALETTE.accent.primary }]}
                testID="profile-reliability-score"
              >
                {`${profile.skill.reliability} / 100`}
              </Text>
              <Text style={styles.eloCaption}>Điểm Uy Tín (Đúng giờ)</Text>
            </View>
          </View>

          {/* 3-Tile Quick Snapshot (Figma 9:1903) */}
          <View style={styles.snapshotRow}>
            <View style={styles.snapshotTile}>
              <Text style={styles.snapshotLabel}>TỶ LỆ THẮNG</Text>
              <Text style={styles.snapshotValue} testID="profile-win-rate">
                {winRatePct}%
              </Text>
            </View>
            <View style={styles.snapshotTile}>
              <Text style={styles.snapshotLabel}>TRẬN ĐÃ ĐẤU</Text>
              <Text style={styles.snapshotValue} testID="profile-matches-played">
                {profile.skill.matchesPlayed}
              </Text>
            </View>
            <View style={styles.snapshotTile}>
              <Text style={styles.snapshotLabel}>UY TÍN FAIR-PLAY</Text>
              <Text style={[styles.snapshotValue, { color: PALETTE.accent.primary }]}>
                {profile.skill.reliability}%
              </Text>
            </View>
          </View>

          {/* Technical Spec Chips */}
          <View style={styles.specsWrap}>
            <View style={styles.specChip}>
              <Text style={styles.specText}>
                🏸 {HAND_LABEL[profile.dominantHand] ?? "Tay phải"}
              </Text>
            </View>
            <View style={styles.specChip}>
              <Text style={styles.specText}>
                ⚡ {POSITION_LABEL[profile.position] ?? "Linh hoạt"}
              </Text>
            </View>
            <View style={styles.specChip}>
              <Text style={styles.specText}>
                👥 {PLAY_CATEGORY_LABEL[playCategory]}
              </Text>
            </View>
            <View style={styles.specChip}>
              <Text style={styles.specText}>
                {profile.gender === "F" ? "♀ Nữ" : "♂ Nam"}
              </Text>
            </View>
          </View>

          <SecondaryButton
            label="✎ CHỈNH SỬA HỒ SƠ VĐV"
            onPress={openEditModal}
            testID="profile-edit-btn"
          />
        </View>

        {/* Calibration & Fair-Play Explanation Card */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionHeader}>CƠ CHẾ CHẤM ĐIỂM ELO & BẢO VỆ HỒ SƠ</Text>
          <Text style={styles.infoBody}>
            • Điểm Elo động đánh đôi tính theo trung bình cặp đấu.{" "}
            {profile.skill.isProvisional
              ? `Hồ sơ của bạn đang trong giai đoạn hiệu chỉnh (5 trận đầu, hệ số K = 40, còn ${remainingProvisional} trận) để hội tụ nhanh về đúng thực lực.`
              : "Hồ sơ của bạn đã hoàn tất giai đoạn hiệu chỉnh và dùng hệ số chuẩn K = 24."}
          </Text>
          <Text style={styles.infoBody}>
            • Theo Security Rules, điểm Elo và độ Uy tín được tính tự động bởi hệ thống
            sau mỗi trận — người chơi không thể tự chỉnh sửa điểm số.
          </Text>
        </View>

        {/* Account & Settings Actions (Figma 5:483) */}
        <View style={styles.menuBox}>
          <Pressable
            onPress={openEditModal}
            style={styles.menuItem}
            accessibilityRole="button"
          >
            <Text style={styles.menuText}>✎ Chỉnh sửa thông tin cá nhân & lối chơi</Text>
            <Text style={styles.menuArrow}>›</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/(auth)/onboarding" as never)}
            style={styles.menuItem}
            accessibilityRole="button"
          >
            <Text style={styles.menuText}>🏸 Xem bảng câu hỏi tự đánh giá trình độ (10 câu)</Text>
            <Text style={styles.menuArrow}>›</Text>
          </Pressable>

          <Pressable
            onPress={refresh}
            style={styles.menuItem}
            accessibilityRole="button"
          >
            <Text style={styles.menuText}>↻ Đồng bộ lại hồ sơ & thống kê trận đấu</Text>
            <Text style={styles.menuArrow}>›</Text>
          </Pressable>

          <Pressable
            onPress={handleLogout}
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            accessibilityRole="button"
            testID="profile-logout-btn"
          >
            <Text style={[styles.menuText, { color: PALETTE.status.danger }]}>
              ⎋ ĐĂNG XUẤT TÀI KHOẢN
            </Text>
            <Text style={[styles.menuArrow, { color: PALETTE.status.danger }]}>›</Text>
          </Pressable>
        </View>

        {__DEV__ ? (
          <Pressable
            style={[styles.menuBox, { borderColor: PALETTE.accent.primary }]}
            onPress={() => router.push("/dev/ui-kit" as never)}
            accessibilityRole="button"
            testID="profile-dev-uikit-btn"
          >
            <View style={[styles.menuItem, { borderBottomWidth: 0 }]}>
              <Text style={[styles.menuText, { color: PALETTE.accent.primary }]}>
                [DEV] Mở UI Kit, Mã OTP Giả Lập & Đặt Lại Dữ Liệu Mẫu
              </Text>
              <Text style={[styles.menuArrow, { color: PALETTE.accent.primary }]}>›</Text>
            </View>
          </Pressable>
        ) : null}
      </ScrollView>

      {/* BottomSheet Chỉnh Sửa Hồ Sơ (chỉ trường được phép theo Security Rules) */}
      <BottomSheet
        visible={editOpen}
        onClose={() => setEditOpen(false)}
        title="Chỉnh sửa hồ sơ VĐV"
      >
        <ScrollView contentContainerStyle={styles.sheetContent}>
          <View style={styles.securityRuleNotice}>
            <Text style={styles.securityRuleText}>
              🔒 Theo Security Rules: Điểm Elo ({profile.skill.rating}), Cấp độ (Cấp{" "}
              {currentLevel}) và Điểm uy tín ({profile.skill.reliability}/100) do
              hệ thống quản lý tự động, không thể chỉnh sửa thủ công.
            </Text>
          </View>

          <TextField
            label="TÊN HIỂN THỊ VĐV"
            value={editName}
            onChangeText={setEditName}
            testID="edit-profile-name-input"
          />

          <TextField
            label="SỐ ĐIỆN THOẠI LIÊN HỆ SÂN"
            value={editPhone}
            onChangeText={setEditPhone}
            keyboardType="phone-pad"
            testID="edit-profile-phone-input"
          />

          <ChoiceGroup
            label="GIỚI TÍNH"
            options={GENDER_OPTIONS}
            value={editGender}
            onChange={setEditGender}
            testIDPrefix="edit-profile-gender"
          />

          <ChoiceGroup
            label="TAY THUẬN"
            options={HAND_OPTIONS}
            value={editHand}
            onChange={setEditHand}
            testIDPrefix="edit-profile-hand"
          />

          <ChoiceGroup
            label="VỊ TRÍ TRONG SÂN (LỐI CHƠI)"
            options={POSITION_OPTIONS}
            value={editPosition}
            onChange={setEditPosition}
            columns={3}
            testIDPrefix="edit-profile-position"
          />

          <ChoiceGroup
            label="NỘI DUNG ĐÁNH ƯU TIÊN"
            options={PLAY_CATEGORY_OPTIONS}
            value={editCategory}
            onChange={setEditCategory}
            columns={3}
            testIDPrefix="edit-profile-category"
          />

          <ChoiceGroup
            label="KHU VỰC ĐÀ NẴNG"
            options={districtOptions}
            value={editArea}
            onChange={setEditArea}
            columns={2}
            testIDPrefix="edit-profile-district"
          />

          {editError ? (
            <Text style={styles.editErrorText} accessibilityRole="alert">
              ⚠ {editError}
            </Text>
          ) : null}

          <NeonCTAButton
            label="LƯU THAY ĐỔI HỒ SƠ"
            onPress={handleSaveEdit}
            loading={saving}
            testID="edit-profile-save-btn"
          />
        </ScrollView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.bg.canvas,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  sessionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: PALETTE.bg.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  sessionLabel: {
    ...TYPOGRAPHY.micro,
    color: PALETTE.accent.primary,
  },
  sessionSub: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
  },
  sessionAuthBtn: {
    minHeight: TOUCH.minTarget - 6,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    backgroundColor: PALETTE.accent.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sessionAuthBtnText: {
    ...TYPOGRAPHY.captionBold,
    color: PALETTE.text.inverse,
  },
  passportCard: {
    backgroundColor: PALETTE.bg.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  passportHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: PALETTE.accent.primarySoft,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    ...TYPOGRAPHY.titleMedium,
    color: PALETTE.accent.primary,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    flexWrap: "wrap",
  },
  playerName: {
    ...TYPOGRAPHY.titleMedium,
    color: PALETTE.text.primary,
  },
  roleTag: {
    backgroundColor: PALETTE.accent.cyanSoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  roleTagText: {
    ...TYPOGRAPHY.micro,
    color: PALETTE.accent.cyan,
  },
  playerArea: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 2,
  },
  eloBox: {
    flexDirection: "row",
    backgroundColor: PALETTE.bg.canvas,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    padding: SPACING.md,
  },
  eloCol: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  eloDivider: {
    width: 1,
    backgroundColor: PALETTE.border.subtle,
    marginHorizontal: SPACING.sm,
  },
  eloNumber: {
    ...TYPOGRAPHY.titleMedium,
    color: PALETTE.text.primary,
  },
  eloCaption: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
    textAlign: "center",
  },
  snapshotRow: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  snapshotTile: {
    flex: 1,
    backgroundColor: PALETTE.bg.elevated,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    padding: SPACING.sm,
    alignItems: "center",
    gap: 2,
  },
  snapshotLabel: {
    ...TYPOGRAPHY.micro,
    color: PALETTE.text.secondary,
  },
  snapshotValue: {
    ...TYPOGRAPHY.cardTitle,
    color: PALETTE.text.primary,
  },
  specsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  specChip: {
    backgroundColor: PALETTE.bg.canvas,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: PALETTE.border.default,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  specText: {
    ...TYPOGRAPHY.captionBold,
    color: PALETTE.text.secondary,
  },
  infoCard: {
    backgroundColor: PALETTE.bg.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    padding: SPACING.md,
    gap: 6,
  },
  sectionHeader: {
    ...TYPOGRAPHY.micro,
    color: PALETTE.accent.cyan,
  },
  infoBody: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
  },
  menuBox: {
    backgroundColor: PALETTE.bg.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: TOUCH.minTarget,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.border.subtle,
  },
  menuText: {
    ...TYPOGRAPHY.bodyBold,
    color: PALETTE.text.primary,
  },
  menuArrow: {
    ...TYPOGRAPHY.titleMedium,
    color: PALETTE.text.secondary,
  },
  sheetContent: {
    gap: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  securityRuleNotice: {
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: PALETTE.accent.cyan,
    padding: SPACING.sm,
  },
  securityRuleText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
  },
  editErrorText: {
    ...TYPOGRAPHY.captionBold,
    color: PALETTE.status.danger,
  },
});
