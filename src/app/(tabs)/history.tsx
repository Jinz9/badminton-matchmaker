import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, {
  Circle,
  Line,
  Polygon,
  Polyline,
  Text as SvgText,
} from "react-native-svg";
import {
  EmptyState,
  Header,
  SecondaryButton,
  Skeleton,
  StatusPill,
} from "../../components";
import { getRepository } from "../../data";
import {
  computeBestPartners,
  DEFAULT_BEST_PARTNER_CRITERIA,
} from "../../domain/history/bestPartners";
import {
  enrichMatchHistory,
  filterAndPaginateMatches,
} from "../../domain/history/historyQuery";
import {
  buildRatingTimeSeries,
  calculatePersonalStats,
} from "../../domain/history/statsCalculation";
import { MatchHistoryItem } from "../../domain/history/types";
import {
  BestPartnerStat,
  CourtCategory,
  MatchDoc,
  RatingHistoryDoc,
  UserProfile,
} from "../../domain/types";
import matchesSeed from "../../mocks/matches.json";
import usersSeed from "../../mocks/users.json";
import { useAuth } from "../../hooks";
import { PALETTE, RADIUS, SPACING, TYPOGRAPHY } from "../../theme";

const HISTORY_PAGE_SIZE = 5;

export interface HistoryStatsScreenProps {
  userIdOverride?: string;
  matchesOverride?: MatchDoc[];
  ratingHistoryOverride?: RatingHistoryDoc[];
  usersOverride?: UserProfile[];
  forceError?: string | null;
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}`;
}

function formatCategoryLabel(cat: CourtCategory): string {
  if (cat === "men") return "👨 Đôi nam";
  if (cat === "women") return "👩 Đôi nữ";
  return "🤝 Đôi nam nữ";
}

export function MatchHistoryScreen({
  userIdOverride,
  matchesOverride,
  ratingHistoryOverride,
  usersOverride,
  forceError = null,
}: HistoryStatsScreenProps = {}) {
  const { user } = useAuth();
  const currentUserId = userIdOverride ?? user?.uid ?? "user_player_01";

  const [subTab, setSubTab] = useState<"history" | "stats" | "partners">(
    "history"
  );
  const [timeFilter, setTimeFilter] = useState<"all" | "7d" | "30d">("all");
  const [categoryFilter, setCategoryFilter] = useState<
    CourtCategory | undefined
  >(undefined);
  const [pageSize, setPageSize] = useState<number>(HISTORY_PAGE_SIZE);

  const [matches, setMatches] = useState<MatchDoc[]>(matchesOverride ?? []);
  const [ratingLogs, setRatingLogs] = useState<RatingHistoryDoc[]>(
    ratingHistoryOverride ?? []
  );
  const [usersList, setUsersList] = useState<UserProfile[]>(
    usersOverride ?? (usersSeed as unknown as UserProfile[])
  );
  const [loading, setLoading] = useState<boolean>(!matchesOverride);
  const [error, setError] = useState<string | null>(forceError);

  const loadHistoryData = useCallback(async () => {
    if (forceError) {
      setError(forceError);
      setLoading(false);
      return;
    }
    if (matchesOverride) {
      setMatches(matchesOverride);
      setRatingLogs(ratingHistoryOverride ?? []);
      if (usersOverride) setUsersList(usersOverride);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const repo = getRepository();
      const [sessions, ratings, profile] = await Promise.all([
        repo.listSessions(),
        repo.getUserRatingHistory(currentUserId, 50),
        repo.getProfile(currentUserId),
      ]);

      const matchArrays = await Promise.all(
        sessions.map((s) => repo.listMatches(s.id))
      );
      const flatMatches = matchArrays.flat();
      const seededMatches = matchesSeed as unknown as MatchDoc[];
      const mergedMatchMap = new Map<string, MatchDoc>();
      seededMatches.forEach((m) => mergedMatchMap.set(m.id, m));
      flatMatches.forEach((m) => mergedMatchMap.set(m.id, m));

      setMatches(Array.from(mergedMatchMap.values()));
      setRatingLogs(ratings);

      if (profile) {
        setUsersList((prev) => {
          const map = new Map(prev.map((u) => [u.uid, u]));
          map.set(profile.uid, profile);
          return Array.from(map.values());
        });
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể tải lịch sử và thống kê trận đấu."
      );
    } finally {
      setLoading(false);
    }
  }, [
    forceError,
    matchesOverride,
    ratingHistoryOverride,
    usersOverride,
    currentUserId,
  ]);

  useEffect(() => {
    void loadHistoryData();
  }, [loadHistoryData]);

  const userInfoMap = useMemo(
    () =>
      new Map(
        usersList.map((u) => [
          u.uid,
          { displayName: u.displayName, avatarUrl: u.avatarUrl },
        ])
      ),
    [usersList]
  );

  const startDateIso = useMemo(() => {
    if (timeFilter === "all") return undefined;
    const days = timeFilter === "7d" ? 7 : 30;
    return new Date(Date.now() - days * 86400 * 1000).toISOString();
  }, [timeFilter]);

  const filteredMatchesResult = useMemo(
    () =>
      filterAndPaginateMatches(matches, {
        userId: currentUserId,
        startDate: startDateIso,
        category: categoryFilter,
        pageSize,
      }),
    [matches, currentUserId, startDateIso, categoryFilter, pageSize]
  );

  const ratingsMap = useMemo(
    () => new Map(ratingLogs.map((r) => [r.matchId, r])),
    [ratingLogs]
  );

  const enrichedHistory = useMemo<MatchHistoryItem[]>(
    () =>
      enrichMatchHistory(
        currentUserId,
        filteredMatchesResult.items,
        ratingsMap,
        userInfoMap
      ),
    [currentUserId, filteredMatchesResult.items, ratingsMap, userInfoMap]
  );

  const currentUserProfile = useMemo(
    () => usersList.find((u) => u.uid === currentUserId),
    [usersList, currentUserId]
  );

  const personalStats = useMemo(
    () =>
      calculatePersonalStats(
        currentUserId,
        matches,
        ratingLogs,
        null,
        userInfoMap
      ),
    [currentUserId, matches, ratingLogs, userInfoMap]
  );

  const ratingSeries = useMemo(() => {
    if (personalStats.ratingTimeSeries.length > 0) {
      return personalStats.ratingTimeSeries;
    }
    return buildRatingTimeSeries(ratingLogs);
  }, [personalStats.ratingTimeSeries, ratingLogs]);

  // Đồng đội ăn ý: bắt buộc >= 5 trận & tỷ lệ thắng >= 60%
  const qualifiedBestPartners = useMemo<BestPartnerStat[]>(
    () =>
      computeBestPartners(currentUserId, matches, userInfoMap, {
        minMatches: DEFAULT_BEST_PARTNER_CRITERIA.minMatches,
        minWinRate: DEFAULT_BEST_PARTNER_CRITERIA.minWinRate,
      }),
    [currentUserId, matches, userInfoMap]
  );

  const renderEloLineChart = () => {
    const points =
      ratingSeries.length >= 2
        ? ratingSeries
        : [
            { date: "2026-11-01", rating: 1450 },
            {
              date: "2026-11-16",
              rating: currentUserProfile?.skill.rating ?? 1500,
            },
          ];

    const width = 300;
    const height = 140;
    const padX = 24;
    const padY = 20;
    const ratings = points.map((p) => p.rating);
    const minR = Math.min(...ratings) - 20;
    const maxR = Math.max(...ratings) + 20;
    const span = Math.max(1, maxR - minR);

    const coords = points.map((p, idx) => {
      const x =
        padX +
        (idx / Math.max(1, points.length - 1)) * (width - padX * 2);
      const y =
        height - padY - ((p.rating - minR) / span) * (height - padY * 2);
      return { x, y, rating: p.rating, date: p.date };
    });

    const polylinePoints = coords.map((c) => `${c.x},${c.y}`).join(" ");

    return (
      <View style={styles.chartCard} testID="elo-line-chart">
        <Text style={styles.chartTitle}>📈 Biểu đồ biến động điểm Elo</Text>
        <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          <Line
            x1={padX}
            y1={height - padY}
            x2={width - padX}
            y2={height - padY}
            stroke={PALETTE.border.subtle}
            strokeWidth="1"
          />
          <Polyline
            fill="none"
            stroke={PALETTE.accent.primary}
            strokeWidth="3"
            points={polylinePoints}
          />
          {coords.map((c, idx) => (
            <React.Fragment key={idx}>
              <Circle
                cx={c.x}
                cy={c.y}
                r="4"
                fill={PALETTE.accent.primary}
              />
              <SvgText
                x={c.x}
                y={c.y - 8}
                fill={PALETTE.text.primary}
                fontSize="10"
                textAnchor="middle"
              >
                {c.rating}
              </SvgText>
            </React.Fragment>
          ))}
        </Svg>
      </View>
    );
  };

  const renderSkillRadarChart = () => {
    const size = 210;
    const cx = size / 2;
    const cy = size / 2;
    const r = 68;
    const axes = [
      { label: "Phông", value: 0.78 },
      { label: "Lưới", value: 0.85 },
      { label: "Đập", value: 0.72 },
      { label: "Thủ", value: 0.8 },
      { label: "Bộ chân", value: 0.75 },
    ];

    const getPoint = (idx: number, ratio: number) => {
      const angle = (Math.PI * 2 * idx) / axes.length - Math.PI / 2;
      return {
        x: cx + Math.cos(angle) * r * ratio,
        y: cy + Math.sin(angle) * r * ratio,
      };
    };

    const outerPolygon = axes
      .map((_, i) => {
        const p = getPoint(i, 1);
        return `${p.x},${p.y}`;
      })
      .join(" ");

    const dataPolygon = axes
      .map((a, i) => {
        const p = getPoint(i, a.value);
        return `${p.x},${p.y}`;
      })
      .join(" ");

    return (
      <View style={styles.chartCard} testID="skill-radar-chart">
        <Text style={styles.chartTitle}>
          🕸️ Biểu đồ 5 kỹ năng BWF (Không gồm cảm biến P2)
        </Text>
        <View style={{ alignItems: "center" }}>
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <Polygon
              points={outerPolygon}
              fill="none"
              stroke={PALETTE.border.subtle}
              strokeWidth="1.2"
            />
            <Polygon
              points={dataPolygon}
              fill="rgba(0, 255, 163, 0.22)"
              stroke={PALETTE.accent.primary}
              strokeWidth="2"
            />
            {axes.map((a, i) => {
              const p = getPoint(i, 1.24);
              return (
                <SvgText
                  key={a.label}
                  x={p.x}
                  y={p.y}
                  fill={PALETTE.text.secondary}
                  fontSize="11"
                  textAnchor="middle"
                >
                  {a.label}
                </SvgText>
              );
            })}
          </Svg>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header
        title="Lịch Sử & Thống Kê"
        subtitle="Theo dõi Elo, tỷ lệ thắng & đồng đội ăn ý"
      />

      {/* 3 Sub-tabs */}
      <View style={styles.subTabsRow}>
        {(
          [
            { key: "history", label: "Lịch sử đấu" },
            { key: "stats", label: "Thống kê & Elo" },
            { key: "partners", label: "Đồng đội ăn ý" },
          ] as const
        ).map((t) => {
          const active = subTab === t.key;
          return (
            <Pressable
              key={t.key}
              testID={`history-tab-${t.key}`}
              onPress={() => setSubTab(t.key)}
              style={[styles.subTab, active && styles.subTabActive]}
            >
              <Text
                style={[styles.subTabText, active && styles.subTabTextActive]}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={{ gap: SPACING.md }} testID="history-loading">
            <Skeleton height={110} borderRadius={RADIUS.lg} />
            <Skeleton height={110} borderRadius={RADIUS.lg} />
          </View>
        ) : error ? (
          <EmptyState
            testID="history-error"
            title="Không tải được dữ liệu thống kê"
            description={error}
            actionLabel="Thử lại"
            onAction={() => void loadHistoryData()}
          />
        ) : subTab === "history" ? (
          <View style={{ gap: SPACING.md }} testID="history-list-view">
            {/* Bộ lọc thời gian & nội dung */}
            <View style={styles.filterRow}>
              {(
                [
                  { key: "all", label: "Tất cả" },
                  { key: "7d", label: "7 ngày" },
                  { key: "30d", label: "30 ngày" },
                ] as const
              ).map((tf) => {
                const active = timeFilter === tf.key;
                return (
                  <Pressable
                    key={tf.key}
                    testID={`history-time-${tf.key}`}
                    onPress={() => setTimeFilter(tf.key)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        active && styles.chipTextActive,
                      ]}
                    >
                      {tf.label}
                    </Text>
                  </Pressable>
                );
              })}

              {(
                [
                  { key: undefined, label: "Mọi nội dung" },
                  { key: "men", label: "👨 Đôi nam" },
                  { key: "women", label: "👩 Đôi nữ" },
                  { key: "mixed", label: "🤝 Đôi nam nữ" },
                ] as const
              ).map((cf) => {
                const active = categoryFilter === cf.key;
                return (
                  <Pressable
                    key={String(cf.key ?? "all")}
                    testID={`history-cat-${cf.key ?? "all"}`}
                    onPress={() => setCategoryFilter(cf.key)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        active && styles.chipTextActive,
                      ]}
                    >
                      {cf.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {enrichedHistory.length === 0 ? (
              <EmptyState
                testID="history-empty"
                title="Chưa có trận đấu nào"
                description="Không tìm thấy trận đấu phù hợp bộ lọc thời gian/nội dung."
                actionLabel="Xem tất cả"
                onAction={() => {
                  setTimeFilter("all");
                  setCategoryFilter(undefined);
                }}
              />
            ) : (
              <>
                {enrichedHistory.map((item) => (
                  <View
                    key={item.matchId}
                    testID={`history-match-${item.matchId}`}
                    style={styles.matchCard}
                  >
                    <View style={styles.matchCardHeader}>
                      <Text style={styles.matchMetaText}>
                        {formatShortDate(item.date)} •{" "}
                        {formatCategoryLabel(item.category)}
                      </Text>
                      <StatusPill
                        variant={item.isWin ? "open" : "full"}
                        label={
                          item.isWin
                            ? `THẮNG${
                                item.eloDelta !== undefined
                                  ? ` (+${item.eloDelta} Elo)`
                                  : ""
                              }`
                            : `THUA${
                                item.eloDelta !== undefined
                                  ? ` (${item.eloDelta} Elo)`
                                  : ""
                              }`
                        }
                      />
                    </View>

                    <Text style={styles.teamLine}>
                      🤝 Đồng đội:{" "}
                      <Text style={styles.teamBold}>
                        {item.partner.displayName}
                      </Text>
                    </Text>
                    <Text style={styles.teamLine}>
                      ⚔️ Đối thủ:{" "}
                      <Text style={styles.teamBold}>
                        {item.opponents[0].displayName} &{" "}
                        {item.opponents[1].displayName}
                      </Text>
                    </Text>
                    <Text style={styles.scoreLine}>
                      Tỷ số:{" "}
                      {item.sets
                        .map((s) => `${s.scoreA}-${s.scoreB}`)
                        .join("  |  ")}
                    </Text>
                  </View>
                ))}

                {filteredMatchesResult.hasMore && (
                  <SecondaryButton
                    testID="btn-load-more-history"
                    label="Tải thêm trận đấu"
                    variant="outline"
                    onPress={() =>
                      setPageSize((prev) => prev + HISTORY_PAGE_SIZE)
                    }
                  />
                )}
              </>
            )}
          </View>
        ) : subTab === "stats" ? (
          <View style={{ gap: SPACING.md }} testID="stats-view">
            {/* Tổng quan 3 chỉ số */}
            <View style={styles.statsSummaryCard}>
              <View style={styles.statTile}>
                <Text style={styles.statValue}>
                  {personalStats.totalMatches}
                </Text>
                <Text style={styles.statLabel}>Tổng trận</Text>
              </View>
              <View style={styles.statTile}>
                <Text
                  style={[styles.statValue, { color: PALETTE.accent.primary }]}
                >
                  {Math.round(personalStats.overallWinRate * 100)}%
                </Text>
                <Text style={styles.statLabel}>Tỷ lệ thắng</Text>
              </View>
              <View style={styles.statTile}>
                <Text style={[styles.statValue, { color: PALETTE.teamA.cyan }]}>
                  {personalStats.currentRating}
                </Text>
                <Text style={styles.statLabel}>Elo hiện tại</Text>
              </View>
            </View>

            {/* Tỷ lệ thắng theo nội dung đánh */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>
                🎯 Tỷ lệ thắng theo nội dung đánh
              </Text>
              {(["men", "women", "mixed"] as const).map((cat) => {
                const stat = personalStats.byCategory[cat];
                return (
                  <View key={cat} style={styles.catStatRow}>
                    <Text style={styles.catStatName}>
                      {formatCategoryLabel(cat)}
                    </Text>
                    <Text style={styles.catStatVal}>
                      {stat.wins}W - {stat.losses}L (
                      {Math.round(stat.winRate * 100)}%)
                    </Text>
                  </View>
                );
              })}
            </View>

            {renderEloLineChart()}
            {renderSkillRadarChart()}
          </View>
        ) : (
          /* Tab Đồng đội ăn ý (>= 5 trận & winRate >= 60%) */
          <View style={{ gap: SPACING.md }} testID="best-partners-view">
            <Text style={styles.criteriaNote}>
              Tiêu chí TV1: Đánh cùng tối thiểu{" "}
              {DEFAULT_BEST_PARTNER_CRITERIA.minMatches} trận và tỷ lệ thắng ≥{" "}
              {Math.round(DEFAULT_BEST_PARTNER_CRITERIA.minWinRate * 100)}%.
            </Text>

            {qualifiedBestPartners.length === 0 ? (
              <EmptyState
                testID="best-partners-empty"
                title="Chưa có đồng đội ăn ý đạt chuẩn"
                description={`Hãy đánh thêm cùng đồng đội (≥ ${DEFAULT_BEST_PARTNER_CRITERIA.minMatches} trận & tỷ lệ thắng ≥ 60%) để mở khóa danh hiệu.`}
              />
            ) : (
              qualifiedBestPartners.map((bp, idx) => (
                <View
                  key={bp.partnerId}
                  testID={`best-partner-card-${bp.partnerId}`}
                  style={styles.bestPartnerCard}
                >
                  <View style={styles.matchCardHeader}>
                    <Text style={styles.partnerRankName}>
                      #{idx + 1} ⭐ {bp.partnerName}
                    </Text>
                    <StatusPill
                      variant="open"
                      label={`${Math.round(bp.winRate * 100)}% Thắng`}
                    />
                  </View>
                  <Text style={styles.teamLine}>
                    Thắng {bp.winsCount}/{bp.matchesCount} trận cùng nhau • Gần
                    nhất: {formatShortDate(bp.lastPlayedAt)}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default MatchHistoryScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PALETTE.bg.canvas,
  },
  subTabsRow: {
    flexDirection: "row",
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.border.subtle,
  },
  subTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADIUS.pill,
    backgroundColor: PALETTE.surface.card,
    alignItems: "center",
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
  },
  subTabActive: {
    backgroundColor: "rgba(0, 255, 163, 0.16)",
    borderColor: PALETTE.accent.primary,
  },
  subTabText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
    fontWeight: "700",
  },
  subTabTextActive: {
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
  filterRow: {
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
  matchCard: {
    backgroundColor: PALETTE.surface.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    gap: 6,
  },
  matchCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.xs,
  },
  matchMetaText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
    fontWeight: "700",
  },
  teamLine: {
    ...TYPOGRAPHY.bodySmall,
    color: PALETTE.text.secondary,
  },
  teamBold: {
    color: PALETTE.text.primary,
    fontWeight: "700",
  },
  scoreLine: {
    ...TYPOGRAPHY.body,
    color: PALETTE.accent.primary,
    fontWeight: "800",
    marginTop: 2,
  },
  statsSummaryCard: {
    flexDirection: "row",
    backgroundColor: PALETTE.surface.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    gap: SPACING.sm,
  },
  statTile: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    ...TYPOGRAPHY.screenTitle,
    color: PALETTE.text.primary,
    fontWeight: "800",
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
  },
  chartCard: {
    backgroundColor: PALETTE.surface.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    gap: SPACING.sm,
  },
  chartTitle: {
    ...TYPOGRAPHY.sectionTitle,
    color: PALETTE.text.primary,
    fontWeight: "700",
  },
  catStatRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.border.subtle,
  },
  catStatName: {
    ...TYPOGRAPHY.bodySmall,
    color: PALETTE.text.primary,
    fontWeight: "600",
  },
  catStatVal: {
    ...TYPOGRAPHY.bodySmall,
    color: PALETTE.accent.primary,
    fontWeight: "700",
  },
  criteriaNote: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
    backgroundColor: PALETTE.surface.card,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  bestPartnerCard: {
    backgroundColor: PALETTE.surface.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: PALETTE.accent.primary,
    gap: 6,
  },
  partnerRankName: {
    ...TYPOGRAPHY.sectionTitle,
    color: PALETTE.text.primary,
    fontWeight: "800",
  },
});
