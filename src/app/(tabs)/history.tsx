import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { COLORS, SPACING } from "../../theme";

export default function MatchHistoryScreen() {
  const matches = [
    {
      id: "m1",
      court: "Sân Kỳ Đồng • Sân số 1",
      time: "Hôm nay, 19:45",
      teamA: "Nhật (1601) & Đạt (1540)",
      teamB: "Toàn (1420) & Tuấn (1380)",
      score: "21 - 19, 21 - 17",
      result: "WIN",
      eloDelta: "+13",
      partnerBadge: "⭐ Đồng Đội Ăn Ý",
    },
    {
      id: "m2",
      court: "Sân Tuyên Sơn • Sân số 2",
      time: "13/11/2026, 20:15",
      teamA: "Nhật (1588) & Đạt (1528)",
      teamB: "Bình (1590) & Long (1610)",
      score: "22 - 20, 19 - 21, 21 - 18",
      result: "WIN",
      eloDelta: "+16",
      partnerBadge: "⭐ Đồng Đội Ăn Ý",
    },
    {
      id: "m3",
      court: "Sân Quân Khu 5",
      time: "10/11/2026, 18:30",
      teamA: "Nhật (1572) & Hoàng (1450)",
      teamB: "Quân (1620) & Dũng (1600)",
      score: "18 - 21, 15 - 21",
      result: "LOSS",
      eloDelta: "-9",
      partnerBadge: null,
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.screenTag}>
        <Text style={styles.screenTagText}>MÀN HÌNH: SCR-10 & SCR-11 (LỊCH SỬ & ĐỒNG ĐỘI ĂN Ý)</Text>
      </View>

      {/* Thống kê nhanh */}
      <View style={styles.statsCard}>
        <View style={styles.statCol}>
          <Text style={styles.statNumber}>18</Text>
          <Text style={styles.statLabel}>Trận đã đấu</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCol}>
          <Text style={[styles.statNumber, { color: COLORS.primary }]}>72%</Text>
          <Text style={styles.statLabel}>Tỷ lệ thắng</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCol}>
          <Text style={[styles.statNumber, { color: COLORS.secondary }]}>+112</Text>
          <Text style={styles.statLabel}>Tăng trưởng Elo</Text>
        </View>
      </View>

      {/* Danh hiệu đồng đội ăn ý nhất */}
      <View style={styles.bestPartnerBox}>
        <Text style={styles.bestPartnerTitle}>🏆 ĐỒNG ĐỘI ĂN Ý NHẤT (WIN RATE ≥ 60%)</Text>
        <View style={styles.partnerRow}>
          <Text style={styles.partnerName}>Nguyễn Đức Đạt (Cấp 4: TB+)</Text>
          <Text style={styles.partnerWinRate}>5/5 trận thắng (100%)</Text>
        </View>
      </View>

      <Text style={styles.sectionHeader}>LỊCH SỬ CÁC SET ĐẤU GẦN ĐÂY</Text>

      {matches.map((m) => (
        <View key={m.id} style={styles.matchItem}>
          <View style={styles.itemHeader}>
            <Text style={styles.courtText}>{m.court}</Text>
            <View style={[styles.resultTag, m.result === "WIN" ? styles.tagWin : styles.tagLoss]}>
              <Text style={[styles.resultText, m.result === "WIN" ? styles.textWin : styles.textLoss]}>
                {m.result === "WIN" ? `THẮNG (${m.eloDelta})` : `THUA (${m.eloDelta})`}
              </Text>
            </View>
          </View>

          <Text style={styles.teamsText}>Đội nhà: {m.teamA}</Text>
          <Text style={styles.teamsText}>Đối thủ: {m.teamB}</Text>

          <View style={styles.scoreRow}>
            <Text style={styles.scoreText}>Tỷ số: {m.score}</Text>
            {m.partnerBadge && (
              <View style={styles.badgeSmall}>
                <Text style={styles.badgeSmallText}>{m.partnerBadge}</Text>
              </View>
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  screenTag: {
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: SPACING.md,
  },
  screenTagText: {
    color: COLORS.secondary,
    fontSize: 10,
    fontWeight: "700",
  },
  statsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    marginBottom: SPACING.md,
  },
  statCol: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 2,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.surfaceLight,
  },
  bestPartnerBox: {
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    borderWidth: 1,
    borderColor: COLORS.accent,
    padding: SPACING.md,
    borderRadius: 14,
    marginBottom: SPACING.md,
  },
  bestPartnerTitle: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 4,
  },
  partnerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  partnerName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
  },
  partnerWinRate: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  sectionHeader: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  matchItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    marginBottom: SPACING.sm,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  courtText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  resultTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagWin: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
  },
  tagLoss: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
  },
  resultText: {
    fontSize: 11,
    fontWeight: "800",
  },
  textWin: {
    color: COLORS.primary,
  },
  textLoss: {
    color: COLORS.danger,
  },
  teamsText: {
    color: COLORS.text,
    fontSize: 13,
    marginBottom: 2,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceLight,
    paddingTop: 6,
  },
  scoreText: {
    color: COLORS.secondary,
    fontSize: 13,
    fontWeight: "700",
  },
  badgeSmall: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeSmallText: {
    color: COLORS.accent,
    fontSize: 10,
    fontWeight: "700",
  },
});

