import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { COLORS, SPACING } from "../../theme";

export default function SessionLobbyScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Banner chào mừng */}
      <View style={styles.heroCard}>
        <Text style={styles.badgeText}>PHONG TRÀO ĐÀ NẴNG</Text>
        <Text style={styles.heroTitle}>Kèo Cầu Lông Hôm Nay</Text>
        <Text style={styles.heroSubtitle}>
          Tìm kèo giao lưu, tuyển suất vãng lai và cân bằng trình độ tự động.
        </Text>
      </View>

      {/* Thông tin màn hình SCR-05 */}
      <View style={styles.screenTag}>
        <Text style={styles.screenTagText}>MÀN HÌNH: SCR-05 (SẢNH PHÒNG KÈO)</Text>
      </View>

      {/* Danh sách kèo mẫu */}
      <Text style={styles.sectionTitle}>KÈO ĐANG MỞ TUYỂN</Text>

      {/* Kèo 1: Sân Kỳ Đồng */}
      <TouchableOpacity style={styles.matchCard} activeOpacity={0.8}>
        <View style={styles.cardHeader}>
          <Text style={styles.courtName}>Sân Cầu Lông Kỳ Đồng</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Còn 2 suất</Text>
          </View>
        </View>
        <Text style={styles.cardSub}>Quận Thanh Khê • 18:00 - 20:00 (Hôm nay)</Text>
        
        <View style={styles.infoRow}>
          <View style={styles.infoChip}>
            <Text style={styles.chipText}>2 Sân • 12/16 người</Text>
          </View>
          <View style={[styles.infoChip, { borderColor: COLORS.secondary }]}>
            <Text style={[styles.chipText, { color: COLORS.secondary }]}>Trình độ: TB1 - TB2</Text>
          </View>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.hostText}>Host: Nam Hải (Uy tín 98đ)</Text>
          <TouchableOpacity style={styles.joinButton}>
            <Text style={styles.joinButtonText}>Đặt Suất Ngay</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Kèo 2: Sân Tuyên Sơn */}
      <TouchableOpacity style={styles.matchCard} activeOpacity={0.8}>
        <View style={styles.cardHeader}>
          <Text style={styles.courtName}>Sân Thể Thao Tuyên Sơn</Text>
          <View style={[styles.statusBadge, { backgroundColor: COLORS.accent }]}>
            <Text style={[styles.statusText, { color: COLORS.background }]}>Waitlist (Dự bị)</Text>
          </View>
        </View>
        <Text style={styles.cardSub}>Quận Hải Châu • 19:30 - 21:30 (Tối mai)</Text>
        
        <View style={styles.infoRow}>
          <View style={styles.infoChip}>
            <Text style={styles.chipText}>1 Sân • 8/8 người</Text>
          </View>
          <View style={[styles.infoChip, { borderColor: COLORS.primary }]}>
            <Text style={[styles.chipText, { color: COLORS.primary }]}>Trình độ: Khá 1 (K1)</Text>
          </View>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.hostText}>Host: Quốc Toàn (Uy tín 100đ)</Text>
          <TouchableOpacity style={[styles.joinButton, { backgroundColor: COLORS.surfaceLight }]}>
            <Text style={styles.joinButtonText}>Vào Hàng Đợi</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Nút tạo kèo Sticky Floating ở dưới */}
      <TouchableOpacity style={styles.createButton} activeOpacity={0.8}>
        <Text style={styles.createButtonText}>+ Đăng Kèo Tuyển Người Mới</Text>
      </TouchableOpacity>
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
  heroCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    marginBottom: SPACING.md,
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 4,
  },
  heroTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 6,
  },
  heroSubtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18,
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
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  matchCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  courtName: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "700",
    flex: 1,
  },
  statusBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "700",
  },
  cardSub: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: SPACING.sm,
  },
  infoRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: SPACING.md,
  },
  infoChip: {
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  chipText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceLight,
    paddingTop: SPACING.sm,
  },
  hostText: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  joinButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinButtonText: {
    color: COLORS.background,
    fontSize: 12,
    fontWeight: "700",
  },
  createButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.sm,
  },
  createButtonText: {
    color: COLORS.background,
    fontSize: 15,
    fontWeight: "800",
  },
});
