import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
import { DA_NANG_DISTRICTS } from "../../config/districts";
import { RATING_CONFIG } from "../../config/rating";
import { getRepository } from "../../data";
import { findPartners } from "../../domain/partnerFinder/findPartners";
import { PartnerMatchItem } from "../../domain/partnerFinder/types";
import { CourtCategory, UserProfile } from "../../domain/types";
import usersSeed from "../../mocks/users.json";
import { useAuth, useHaptics } from "../../hooks";
import { PALETTE, RADIUS, SPACING, TYPOGRAPHY } from "../../theme";

const PAGE_SIZE = 5;

export interface PartnerFinderScreenProps {
  seekerOverride?: UserProfile;
  candidatesOverride?: UserProfile[];
  forceError?: string | null;
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
  return "Linh hoạt (Both)";
}

export function PartnerFinderScreen({
  seekerOverride,
  candidatesOverride,
  forceError = null,
}: PartnerFinderScreenProps = {}) {
  const { user } = useAuth();
  const { trigger } = useHaptics(true);

  const [activeTab, setActiveTab] = useState<"finder" | "leaderboard">(
    "finder"
  );
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<
    "week" | "month" | "all"
  >("week");

  // Bộ lọc Partner Finder
  const [selectedDistrict, setSelectedDistrict] = useState<string | undefined>(
    undefined
  );
  const [selectedCategory, setSelectedCategory] = useState<
    CourtCategory | undefined
  >(undefined);
  const [maxEloDiff, setMaxEloDiff] = useState<number>(
    RATING_CONFIG.PARTNER_FINDER_MAX_ELO_DIFF
  );

  // Dữ liệu & phân trang
  const [seeker, setSeeker] = useState<UserProfile | null>(
    seekerOverride ?? user ?? null
  );
  const [allUsers, setAllUsers] = useState<UserProfile[]>(
    candidatesOverride ?? []
  );
  const [loading, setLoading] = useState<boolean>(!candidatesOverride);
  const [error, setError] = useState<string | null>(forceError);
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [invitedUids, setInvitedUids] = useState<Record<string, boolean>>({});
  const [detailPartner, setDetailPartner] = useState<PartnerMatchItem | null>(
    null
  );
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    variant: ToastVariant;
  }>({ visible: false, message: "", variant: "info" });

  const loadData = useCallback(async () => {
    if (forceError) {
      setError(forceError);
      setLoading(false);
      return;
    }
    if (candidatesOverride) {
      setAllUsers(candidatesOverride);
      if (seekerOverride) setSeeker(seekerOverride);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const repo = getRepository();
      const targetUid = seekerOverride?.uid ?? user?.uid ?? "user_player_01";
      const profile = seekerOverride ?? (await repo.getProfile(targetUid));

      const seededUsers = usersSeed as unknown as UserProfile[];
      const effectiveSeeker =
        profile ??
        seededUsers.find((u) => u.uid === targetUid) ??
        seededUsers[0];
      setSeeker(effectiveSeeker);

      // Lấy pool ứng viên từ Repository (kèm hồ sơ từ mock seed để bảo đảm đủ dữ liệu chi tiết)
      const repoResults = await repo.searchCompatiblePartners(
        effectiveSeeker.uid,
        { maxEloDiff: 500 }
      );
      const mergedMap = new Map<string, UserProfile>();
      seededUsers.forEach((u) => mergedMap.set(u.uid, u));
      repoResults.forEach((r) => mergedMap.set(r.user.uid, r.user));
      setAllUsers(Array.from(mergedMap.values()));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể tải danh sách gợi ý đồng đội."
      );
    } finally {
      setLoading(false);
    }
  }, [candidatesOverride, seekerOverride, user, forceError]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Reset trang về 1 khi đổi bộ lọc
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedDistrict, selectedCategory, maxEloDiff]);

  const rankedMatches = useMemo<PartnerMatchItem[]>(() => {
    if (!seeker || allUsers.length === 0) return [];
    const results = findPartners(seeker, allUsers, {
      areaLabel: selectedDistrict,
      category: selectedCategory,
      maxEloDiff,
    });
    // Nếu người dùng chọn lọc cứng theo quận Đà Nẵng, lọc chính xác theo quận đã chọn
    if (selectedDistrict) {
      return results.filter((item) =>
        item.user.areaLabel
          .toLowerCase()
          .includes(selectedDistrict.toLowerCase())
      );
    }
    return results;
  }, [seeker, allUsers, selectedDistrict, selectedCategory, maxEloDiff]);

  const paginatedMatches = useMemo(
    () => rankedMatches.slice(0, visibleCount),
    [rankedMatches, visibleCount]
  );

  const hasMore = visibleCount < rankedMatches.length;

  const leaderboardList = useMemo(() => {
    const base = [...allUsers].filter((u) => !u.isDeleted);
    if (leaderboardPeriod === "week") {
      return base
        .filter((u) => u.skill.matchesPlayed > 0)
        .sort((a, b) => b.skill.rating - a.skill.rating);
    }
    if (leaderboardPeriod === "month") {
      return base.sort(
        (a, b) =>
          b.skill.rating +
          b.skill.wins * 2 -
          (a.skill.rating + a.skill.wins * 2)
      );
    }
    return base.sort((a, b) => b.skill.rating - a.skill.rating);
  }, [allUsers, leaderboardPeriod]);

  const handleInvitePartner = (item: PartnerMatchItem) => {
    trigger("success");
    setInvitedUids((prev) => ({ ...prev, [item.user.uid]: true }));
    setToast({
      visible: true,
      message: `Đã gửi lời mời đánh cặp cố định tới ${item.user.displayName}!`,
      variant: "success",
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header
        title="Tìm Đồng Đội Ăn Ý"
        subtitle={`Đánh cặp cố định (lệch ≤ ${maxEloDiff} Elo) • Đà Nẵng`}
      />

      <Toast
        visible={toast.visible}
        message={toast.message}
        variant={toast.variant}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      {/* Tab chuyển giữa Tìm Đồng Đội (P0) và BXH Elo CLB (P1) */}
      <View style={styles.modeTabs}>
        <Pressable
          testID="tab-partner-finder"
          onPress={() => setActiveTab("finder")}
          style={[
            styles.modeTab,
            activeTab === "finder" && styles.modeTabActive,
          ]}
        >
          <Text
            style={[
              styles.modeTabText,
              activeTab === "finder" && styles.modeTabTextActive,
            ]}
          >
            🤝 Tìm Đồng Đội
          </Text>
        </Pressable>
        <Pressable
          testID="tab-club-leaderboard"
          onPress={() => setActiveTab("leaderboard")}
          style={[
            styles.modeTab,
            activeTab === "leaderboard" && styles.modeTabActive,
          ]}
        >
          <Text
            style={[
              styles.modeTabText,
              activeTab === "leaderboard" && styles.modeTabTextActive,
            ]}
          >
            🏆 BXH Elo CLB
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "finder" ? (
          <>
            {/* Bộ lọc khoảng lệch Elo */}
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>
                Độ lệch Elo tối đa (Mặc định ≤{" "}
                {RATING_CONFIG.PARTNER_FINDER_MAX_ELO_DIFF})
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}
              >
                {[80, 150, 200].map((diff) => {
                  const active = maxEloDiff === diff;
                  return (
                    <Pressable
                      key={diff}
                      testID={`filter-elo-${diff}`}
                      onPress={() => setMaxEloDiff(diff)}
                      style={[styles.chip, active && styles.chipActive]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          active && styles.chipTextActive,
                        ]}
                      >
                        Lệch ≤ {diff} Elo
                        {diff === 150 ? " (Chuẩn)" : ""}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Bộ lọc nội dung đánh */}
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Nội dung đánh cặp</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}
              >
                {(
                  [
                    { key: undefined, label: "Tất cả nội dung" },
                    { key: "men", label: "👨 Đôi nam" },
                    { key: "women", label: "👩 Đôi nữ" },
                    { key: "mixed", label: "🤝 Đôi nam nữ" },
                  ] as const
                ).map((cat) => {
                  const active = selectedCategory === cat.key;
                  return (
                    <Pressable
                      key={String(cat.key ?? "all")}
                      testID={`partner-cat-${cat.key ?? "all"}`}
                      onPress={() => setSelectedCategory(cat.key)}
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
              </ScrollView>
            </View>

            {/* Bộ lọc quận Đà Nẵng */}
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Khu vực sân tại Đà Nẵng</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}
              >
                <Pressable
                  testID="partner-district-all"
                  onPress={() => setSelectedDistrict(undefined)}
                  style={[
                    styles.chip,
                    !selectedDistrict && styles.chipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      !selectedDistrict && styles.chipTextActive,
                    ]}
                  >
                    Tất cả quận
                  </Text>
                </Pressable>
                {DA_NANG_DISTRICTS.map((d) => {
                  const active = selectedDistrict === d;
                  return (
                    <Pressable
                      key={d}
                      testID={`partner-district-${d}`}
                      onPress={() => setSelectedDistrict(active ? undefined : d)}
                      style={[styles.chip, active && styles.chipActive]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          active && styles.chipTextActive,
                        ]}
                      >
                        {d}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Trạng thái Loading / Error / Empty / Danh sách */}
            {loading ? (
              <View style={{ gap: SPACING.md }} testID="partner-loading">
                <Skeleton height={150} borderRadius={RADIUS.lg} />
                <Skeleton height={150} borderRadius={RADIUS.lg} />
              </View>
            ) : error ? (
              <EmptyState
                testID="partner-error"
                title="Không tải được gợi ý đồng đội"
                description={error}
                actionLabel="Thử lại"
                onAction={() => void loadData()}
              />
            ) : rankedMatches.length === 0 ? (
              <EmptyState
                testID="partner-empty"
                title="Không có đồng đội phù hợp bộ lọc"
                description={`Không tìm thấy VĐV lệch ≤ ${maxEloDiff} Elo ở khu vực đã chọn.`}
                actionLabel="Đặt lại bộ lọc"
                onAction={() => {
                  setSelectedDistrict(undefined);
                  setSelectedCategory(undefined);
                  setMaxEloDiff(RATING_CONFIG.PARTNER_FINDER_MAX_ELO_DIFF);
                }}
              />
            ) : (
              <View style={{ gap: SPACING.md }} testID="partner-list">
                <Text style={styles.resultCounter} testID="partner-count-text">
                  Hiển thị {paginatedMatches.length} / {rankedMatches.length}{" "}
                  đồng đội phù hợp
                </Text>

                {paginatedMatches.map((item) => {
                  const isInvited = Boolean(invitedUids[item.user.uid]);
                  return (
                    <View
                      key={item.user.uid}
                      testID={`partner-card-${item.user.uid}`}
                      style={styles.partnerCard}
                    >
                      <View style={styles.cardTop}>
                        <View style={styles.avatar}>
                          <Text style={styles.avatarText}>
                            {getInitials(item.user.displayName)}
                          </Text>
                        </View>
                        <View style={{ flex: 1, gap: 2 }}>
                          <Text style={styles.nameText} numberOfLines={1}>
                            {item.user.displayName}
                          </Text>
                          <View style={styles.levelMetaRow}>
                            <LevelBadge
                              level={item.user.skill.level}
                              compact
                              size="sm"
                            />
                            <Text style={styles.subText}>
                              {item.user.skill.rating} Elo (Lệch {item.eloDiff})
                            </Text>
                          </View>
                          <Text style={styles.subText}>
                            📍 {item.user.areaLabel} • Uy tín{" "}
                            {item.user.skill.reliability}/100
                          </Text>
                        </View>

                        <View style={styles.scoreBadge}>
                          <Text style={styles.scoreNumber}>
                            {item.matchScore}%
                          </Text>
                          <Text style={styles.scoreLabel}>Phù hợp</Text>
                        </View>
                      </View>

                      <View style={styles.tagsRow}>
                        <View style={styles.tag}>
                          <Text style={styles.tagText}>
                            {getPositionLabel(item.user.position)}
                          </Text>
                        </View>
                        <View style={styles.tag}>
                          <Text style={styles.tagText}>
                            {item.user.dominantHand === "left"
                              ? "Tay trái"
                              : "Tay phải"}
                          </Text>
                        </View>
                      </View>

                      {item.reasons.length > 0 && (
                        <View style={styles.reasonsBox}>
                          {item.reasons.map((r, i) => (
                            <Text key={i} style={styles.reasonText}>
                              ✓ {r}
                            </Text>
                          ))}
                        </View>
                      )}

                      {item.warnings.length > 0 && (
                        <View style={styles.warningsBox}>
                          {item.warnings.map((w, i) => (
                            <Text key={i} style={styles.warningText}>
                              ⚠️ {w}
                            </Text>
                          ))}
                        </View>
                      )}

                      <View style={styles.cardActions}>
                        <SecondaryButton
                          testID={`btn-view-partner-${item.user.uid}`}
                          label="Xem hồ sơ"
                          variant="outline"
                          onPress={() => setDetailPartner(item)}
                          style={{ flex: 1 }}
                        />
                        <NeonCTAButton
                          testID={`btn-invite-partner-${item.user.uid}`}
                          label={isInvited ? "ĐÃ GỬI LỜI MỜI ✓" : "GỬI LỜI MỜI"}
                          disabled={isInvited}
                          onPress={() => handleInvitePartner(item)}
                          style={{ flex: 1.3, height: 48 }}
                        />
                      </View>
                    </View>
                  );
                })}

                {hasMore && (
                  <SecondaryButton
                    testID="btn-load-more-partners"
                    label={`Tải thêm đồng đội (${rankedMatches.length - paginatedMatches.length} còn lại)`}
                    variant="outline"
                    onPress={() => {
                      trigger("tap");
                      setVisibleCount((prev) => prev + PAGE_SIZE);
                    }}
                  />
                )}
              </View>
            )}
          </>
        ) : (
          /* Bảng xếp hạng Elo CLB (P1) */
          <View style={{ gap: SPACING.md }} testID="leaderboard-view">
            <View style={styles.chipsRowWrap}>
              {(
                [
                  { key: "week", label: "Tuần này" },
                  { key: "month", label: "Tháng này" },
                  { key: "all", label: "Toàn thời gian" },
                ] as const
              ).map((p) => {
                const active = leaderboardPeriod === p.key;
                return (
                  <Pressable
                    key={p.key}
                    testID={`leaderboard-period-${p.key}`}
                    onPress={() => setLeaderboardPeriod(p.key)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        active && styles.chipTextActive,
                      ]}
                    >
                      {p.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {leaderboardList.map((u, idx) => (
              <View
                key={u.uid}
                testID={`leaderboard-row-${u.uid}`}
                style={styles.leaderRow}
              >
                <Text style={styles.rankNumber}>#{idx + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nameText}>{u.displayName}</Text>
                  <Text style={styles.subText}>
                    {u.areaLabel} • {u.skill.matchesPlayed} trận • Uy tín{" "}
                    {u.skill.reliability}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 2 }}>
                  <Text style={styles.leaderElo}>{u.skill.rating} Elo</Text>
                  <LevelBadge level={u.skill.level} compact size="sm" />
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* BottomSheet xem chi tiết hồ sơ đồng đội */}
      <BottomSheet
        visible={Boolean(detailPartner)}
        title={detailPartner?.user.displayName ?? "Hồ sơ VĐV"}
        onClose={() => setDetailPartner(null)}
      >
        {detailPartner && (
          <View style={{ gap: SPACING.sm }}>
            <View style={styles.levelMetaRow}>
              <LevelBadge
                level={detailPartner.user.skill.level}
                showRange
                size="md"
              />
              <StatusPill
                variant="open"
                label={`${detailPartner.matchScore}% Phù hợp`}
              />
            </View>
            <Text style={styles.subText}>
              Điểm Elo: {detailPartner.user.skill.rating} (Chênh lệch{" "}
              {detailPartner.eloDiff} điểm)
            </Text>
            <Text style={styles.subText}>
              Lối chơi: {getPositionLabel(detailPartner.user.position)} • Tay{" "}
              {detailPartner.user.dominantHand === "left" ? "trái" : "phải"}
            </Text>
            <Text style={styles.subText}>
              Khu vực: {detailPartner.user.areaLabel} • Uy tín:{" "}
              {detailPartner.user.skill.reliability}/100
            </Text>
            <Text style={styles.subText}>
              Thành tích: {detailPartner.user.skill.wins} Thắng /{" "}
              {detailPartner.user.skill.losses} Thua (
              {detailPartner.user.skill.matchesPlayed} trận)
            </Text>
            <NeonCTAButton
              label={
                invitedUids[detailPartner.user.uid]
                  ? "ĐÃ GỬI LỜI MỜI ✓"
                  : "GỬI LỜI MỜI ĐÁNH CẶP"
              }
              disabled={Boolean(invitedUids[detailPartner.user.uid])}
              onPress={() => {
                handleInvitePartner(detailPartner);
                setDetailPartner(null);
              }}
            />
          </View>
        )}
      </BottomSheet>
    </SafeAreaView>
  );
}

export default PartnerFinderScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PALETTE.bg.canvas,
  },
  modeTabs: {
    flexDirection: "row",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.border.subtle,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADIUS.pill,
    backgroundColor: PALETTE.surface.card,
    alignItems: "center",
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
  },
  modeTabActive: {
    backgroundColor: "rgba(0, 255, 163, 0.16)",
    borderColor: PALETTE.accent.primary,
  },
  modeTabText: {
    ...TYPOGRAPHY.bodySmall,
    color: PALETTE.text.secondary,
    fontWeight: "700",
  },
  modeTabTextActive: {
    color: PALETTE.accent.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  filterGroup: {
    gap: SPACING.xs,
  },
  filterLabel: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
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
    backgroundColor: PALETTE.surface.card,
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
  resultCounter: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
    fontWeight: "700",
  },
  partnerCard: {
    backgroundColor: PALETTE.surface.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    gap: SPACING.sm,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 255, 163, 0.14)",
    borderWidth: 1.5,
    borderColor: PALETTE.accent.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...TYPOGRAPHY.bodySmall,
    color: PALETTE.accent.primary,
    fontWeight: "800",
  },
  nameText: {
    ...TYPOGRAPHY.body,
    color: PALETTE.text.primary,
    fontWeight: "700",
  },
  levelMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  subText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
  },
  scoreBadge: {
    backgroundColor: "rgba(0, 255, 163, 0.14)",
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: PALETTE.accent.primary,
  },
  scoreNumber: {
    ...TYPOGRAPHY.sectionTitle,
    color: PALETTE.accent.primary,
    fontWeight: "800",
  },
  scoreLabel: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.accent.primary,
    fontSize: 10,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
  },
  tag: {
    backgroundColor: PALETTE.bg.surface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
  },
  tagText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.primary,
    fontWeight: "600",
  },
  reasonsBox: {
    backgroundColor: "rgba(0, 255, 163, 0.08)",
    borderRadius: RADIUS.md,
    padding: SPACING.xs,
    gap: 2,
  },
  reasonText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.accent.primary,
    fontWeight: "600",
  },
  warningsBox: {
    backgroundColor: "rgba(255, 179, 0, 0.12)",
    borderRadius: RADIUS.md,
    padding: SPACING.xs,
    gap: 2,
  },
  warningText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.teamB.amber,
    fontWeight: "600",
  },
  cardActions: {
    flexDirection: "row",
    gap: SPACING.sm,
    alignItems: "center",
  },
  leaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: PALETTE.surface.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
  },
  rankNumber: {
    ...TYPOGRAPHY.sectionTitle,
    color: PALETTE.accent.primary,
    fontWeight: "800",
    minWidth: 34,
  },
  leaderElo: {
    ...TYPOGRAPHY.body,
    color: PALETTE.text.primary,
    fontWeight: "800",
  },
});
