import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { COLORS, SPACING } from "../../theme";

export default function PartnerFinderScreen() {
  const partners = [
    {
      id: "u1",
      name: "Nguyễn Đức Đạt",
      level: "Cấp 4: TB+",
      elo: 1540,
      fitScore: 94,
      hand: "Tay Trái",
      position: "Chuyên Lưới (Front)",
      district: "Thanh Khê",
      advantage: "+40đ Bù trừ Lưới - Công • +25đ Cặp Trái - Phải",
    },
    {
      id: "u2",
      name: "Trần Văn Tuấn",
      level: "Cấp 3: TB",
      elo: 1420,
      fitScore: 88,
      hand: "Tay Phải",
      position: "Linh Hoạt (Both)",
      district: "Hải Châu",
      advantage: "Lệch ≤ 80 Elo • Cùng khu vực trung tâm",
    },
    {
      id: "u3",
      name: "Lê Hoàng Nam",
      level: "Cấp 4: TB+",
      elo: 1510,
      fitScore: 82,
      hand: "Tay Phải",
      position: "Chuyên Công (Back)",
      district: "Sơn Trà",
      advantage: "Phù hợp đánh đôi nam thể lực cao",
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.screenTag}>
        <Text style={styles.screenTagText}>MÀN HÌNH: SCR-04 (TÌM ĐỒNG ĐỘI ĂN Ý)</Text>
      </View>

      <Text style={styles.sectionHeader}>GỢI Ý TƯƠNG ĐỒNG TRÌNH ĐỘ (LỆCH ≤ 150 ELO)</Text>

      {partners.map((p) => (
        <View key={p.id} style={styles.partnerCard}>
          <View style={styles.cardTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{p.name.charAt(0)}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.nameText}>{p.name}</Text>
              <Text style={styles.subText}>{p.level} • {p.elo} Elo • {p.district}</Text>
            </View>
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreNumber}>{p.fitScore}%</Text>
              <Text style={styles.scoreLabel}>Ăn Ý</Text>
            </View>
          </View>

          <View style={styles.tagsRow}>
            <View style={styles.tag}><Text style={styles.tagText}>{p.hand}</Text></View>
            <View style={[styles.tag, { borderColor: COLORS.secondary }]}><Text style={[styles.tagText, { color: COLORS.secondary }]}>{p.position}</Text></View>
          </View>

          <View style={styles.advantageBox}>
            <Text style={styles.advantageText}>⚡ {p.advantage}</Text>
          </View>

          <TouchableOpacity style={styles.inviteButton}>
            <Text style={styles.inviteButtonText}>Mời Đánh Cặp Cùng Nhau</Text>
          </TouchableOpacity>
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
    marginBottom: SPACING.sm,
  },
  screenTagText: {
    color: COLORS.secondary,
    fontSize: 10,
    fontWeight: "700",
  },
  sectionHeader: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  partnerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    marginBottom: SPACING.md,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.sm,
  },
  avatarText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "800",
  },
  infoCol: {
    flex: 1,
  },
  nameText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  subText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  scoreBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: "center",
  },
  scoreNumber: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "800",
  },
  scoreLabel: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: "700",
  },
  tagsRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: SPACING.sm,
  },
  tag: {
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  advantageBox: {
    backgroundColor: "rgba(6, 182, 212, 0.1)",
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  advantageText: {
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: "600",
  },
  inviteButton: {
    backgroundColor: COLORS.surfaceLight,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  inviteButtonText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
  },
});

