import React, { useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  EmptyState,
  Header,
  LevelBadge,
  NeonCTAButton,
  SecondaryButton,
  Skeleton,
  StatusPill,
} from "../../components";
import { DA_NANG_DISTRICTS } from "../../config/districts";
import { RULES } from "../../config/rules";
import { CourtCategory, SessionDoc } from "../../domain/types";
import { useHaptics, useLobbies } from "../../hooks";
import { PALETTE, RADIUS, SPACING, TYPOGRAPHY } from "../../theme";

function formatCategoryWithIcon(category: CourtCategory): string {
  if (category === "men") return "👨 Đôi nam";
  if (category === "women") return "👩 Đôi nữ";
  return "🤝 Đôi nam nữ";
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  return `${hh}:${mm} • ${dd}/${mo}`;
}

export function LobbyListScreen() {
  const router = useRouter();
  const { trigger } = useHaptics(true);

  const [selectedDistrict, setSelectedDistrict] = useState<string | undefined>(
    undefined
  );
  const [selectedCategory, setSelectedCategory] = useState<
    CourtCategory | undefined
  >(undefined);
  const [onlyOpenSlots, setOnlyOpenSlots] = useState<boolean>(false);
  const [dateFilter, setDateFilter] = useState<"all" | "today">("all");
  const [refreshing, setRefreshing] = useState(false);

  const fromDate = useMemo(() => {
    if (dateFilter !== "today") return undefined;
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }, [dateFilter]);

  const { sessions, loading, error, refresh } = useLobbies({
    district: selectedDistrict,
    category: selectedCategory,
    onlyOpenSlots,
    fromDate,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const renderSessionCard = (session: SessionDoc) => {
    const isFull = session.openSlotsTotal <= 0 || session.status === "full";
    const courtCount = Math.min(session.courtCount, RULES.MAX_COURTS_PER_SESSION);

    return (
      <Pressable
        key={session.id}
        testID={`lobby-card-${session.id}`}
        onPress={() => {
          trigger("tap");
          router.push(`/lobby/${session.id}` as never);
        }}
        style={({ pressed }) => [
          styles.card,
          pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
        ]}
      >
        <View style={styles.cardHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.venueName} numberOfLines={1}>
              {session.venueName}
            </Text>
            <Text style={styles.metaText}>
              📍 {session.district} • 🕒 {formatDateTime(session.startsAt)}
            </Text>
          </View>
          <StatusPill
            variant={isFull ? "full" : "open"}
            label={
              isFull
                ? "ĐÃ ĐẦY (WAITLIST)"
                : `CÒN ${session.openSlotsTotal} SUẤT`
            }
          />
        </View>

        <View style={styles.hostRow}>
          <Text style={styles.hostText}>
            Host: <Text style={styles.hostBold}>{session.hostName}</Text> •{" "}
            {courtCount} sân (tối đa {courtCount * RULES.COURT_CAPACITY} người)
          </Text>
        </View>

        <View style={styles.courtsSummaryList}>
          {session.courtSummaries.slice(0, RULES.MAX_COURTS_PER_SESSION).map((c) => (
            <View key={c.courtId} style={styles.courtMiniRow}>
              <Text style={styles.courtMiniTitle}>
                Sân 0{c.courtId}: {formatCategoryWithIcon(c.category)}
              </Text>
              <View style={styles.courtMiniRight}>
                <LevelBadge level={c.levelMin} compact size="sm" />
                <Text style={styles.rangeDash}>–</Text>
                <LevelBadge level={c.levelMax} compact size="sm" />
                <Text
                  style={[
                    styles.slotCountText,
                    {
                      color:
                        c.openSlots > 0
                          ? PALETTE.accent.primary
                          : PALETTE.teamB.amber,
                    },
                  ]}
                >
                  {c.openSlots > 0 ? `${c.openSlots} chỗ` : "Hết chỗ"}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <Header
        title="Kèo Giao Lưu Đà Nẵng"
        subtitle="Tìm kèo đôi gần bạn • Cập nhật realtime"
        onBackPress={() => router.back()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={PALETTE.accent.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Bộ lọc khu vực Đà Nẵng */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Khu vực Đà Nẵng</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            <Pressable
              testID="filter-district-all"
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
                  testID={`filter-district-${d}`}
                  onPress={() => setSelectedDistrict(active ? undefined : d)}
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

        {/* Bộ lọc Nội dung + Ngày + Còn chỗ */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Nội dung & Trạng thái</Text>
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
            ).map((item) => {
              const active = selectedCategory === item.key;
              return (
                <Pressable
                  key={String(item.key ?? "all")}
                  testID={`filter-category-${item.key ?? "all"}`}
                  onPress={() => setSelectedCategory(item.key)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}

            <Pressable
              testID="filter-only-open"
              onPress={() => setOnlyOpenSlots((prev) => !prev)}
              style={[styles.chip, onlyOpenSlots && styles.chipActive]}
            >
              <Text
                style={[
                  styles.chipText,
                  onlyOpenSlots && styles.chipTextActive,
                ]}
              >
                {onlyOpenSlots ? "✓ Chỉ kèo còn chỗ" : "Chỉ kèo còn chỗ"}
              </Text>
            </Pressable>

            <Pressable
              testID="filter-date-today"
              onPress={() =>
                setDateFilter((prev) => (prev === "today" ? "all" : "today"))
              }
              style={[styles.chip, dateFilter === "today" && styles.chipActive]}
            >
              <Text
                style={[
                  styles.chipText,
                  dateFilter === "today" && styles.chipTextActive,
                ]}
              >
                Hôm nay trở đi
              </Text>
            </Pressable>
          </ScrollView>
        </View>

        {/* Trạng thái Loading / Error / Empty / List */}
        {loading && sessions.length === 0 ? (
          <View style={{ gap: SPACING.md }} testID="lobby-loading">
            <Skeleton height={130} borderRadius={RADIUS.lg} />
            <Skeleton height={130} borderRadius={RADIUS.lg} />
          </View>
        ) : error ? (
          <EmptyState
            testID="lobby-error"
            title="Không tải được danh sách kèo"
            description={error}
            actionLabel="Thử lại"
            onAction={() => void refresh()}
          />
        ) : sessions.length === 0 ? (
          <EmptyState
            testID="lobby-empty"
            title="Chưa có kèo phù hợp bộ lọc"
            description="Thử bỏ bớt bộ lọc quận/nội dung hoặc tự tạo một kèo mới cho nhóm của bạn."
            actionLabel="Xóa bộ lọc"
            onAction={() => {
              setSelectedDistrict(undefined);
              setSelectedCategory(undefined);
              setOnlyOpenSlots(false);
              setDateFilter("all");
            }}
          />
        ) : (
          <View style={styles.listWrap} testID="lobby-list">
            {sessions.map(renderSessionCard)}
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomDock}>
        <NeonCTAButton
          testID="btn-open-create-lobby"
          label="+ TẠO KÈO GIAO LƯU MỚI"
          onPress={() => {
            trigger("tap");
            router.push("/lobby/create" as never);
          }}
        />
      </View>
    </SafeAreaView>
  );
}

export default function LobbyIndexRoute() {
  return <LobbyListScreen />;
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
  filterSection: {
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
  listWrap: {
    gap: SPACING.md,
  },
  card: {
    backgroundColor: PALETTE.surface.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    gap: SPACING.sm,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: SPACING.sm,
  },
  venueName: {
    ...TYPOGRAPHY.sectionTitle,
    color: PALETTE.text.primary,
    fontWeight: "700",
  },
  metaText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
    marginTop: 2,
  },
  hostRow: {
    borderTopWidth: 1,
    borderTopColor: PALETTE.border.subtle,
    paddingTop: SPACING.xs,
  },
  hostText: {
    ...TYPOGRAPHY.bodySmall,
    color: PALETTE.text.secondary,
  },
  hostBold: {
    color: PALETTE.text.primary,
    fontWeight: "700",
  },
  courtsSummaryList: {
    gap: 6,
  },
  courtMiniRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: PALETTE.bg.surface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
  },
  courtMiniTitle: {
    ...TYPOGRAPHY.bodySmall,
    color: PALETTE.text.primary,
    fontWeight: "600",
  },
  courtMiniRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rangeDash: {
    color: PALETTE.text.muted,
    fontSize: 12,
  },
  slotCountText: {
    ...TYPOGRAPHY.caption,
    fontWeight: "800",
    marginLeft: 6,
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

