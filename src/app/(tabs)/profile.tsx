import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { COLORS, SPACING } from "../../theme";

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.screenTag}>
        <Text style={styles.screenTagText}>MÀN HÌNH: SCR-03 (HỒ SƠ TAY VỢT & PLAYER CARD)</Text>
      </View>

      {/* Player Card thể thao */}
      <View style={styles.playerCard}>
        <View style={styles.cardHeader}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>N</Text>
          </View>
          <View style={styles.playerInfo}>
            <Text style={styles.playerName}>Đào Duy Nhật</Text>
            <Text style={styles.playerSub}>Host Kỳ Đồng • Thanh Khê, Đà Nẵng</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>CẤP 4: TRUNG BÌNH KHÁ (TB+)</Text>
            </View>
          </View>
        </View>

        {/* Điểm Elo & Uy tín */}
        <View style={styles.ratingRow}>
          <View style={styles.ratingCol}>
            <Text style={styles.ratingNumber}>1,601</Text>
            <Text style={styles.ratingLabel}>Điểm Elo Đôi (Chính thức)</Text>
          </View>
          <View style={styles.ratingDivider} />
          <View style={styles.ratingCol}>
            <Text style={[styles.ratingNumber, { color: COLORS.primary }]}>98 / 100</Text>
            <Text style={styles.ratingLabel}>Độ Uy Tín (Đúng giờ)</Text>
          </View>
        </View>

        {/* Thông số kỹ thuật */}
        <View style={styles.specsRow}>
          <View style={styles.specChip}><Text style={styles.specText}>🏸 Tay Phải</Text></View>
          <View style={styles.specChip}><Text style={styles.specText}>⚡ Chuyên Công Sau (Back)</Text></View>
          <View style={styles.specChip}><Text style={styles.specText}>🛡️ Host Uy Tín</Text></View>
        </View>
      </View>

      {/* Thông tin thống kê sau trận */}
      <Text style={styles.sectionHeader}>ĐÁNH GIÁ TỪ BẠN CHƠI CÙNG SÂN</Text>
      <View style={styles.reviewCard}>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewCount}>18</Text>
          <Text style={styles.reviewLabel}>Đúng trình độ</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewCount}>12</Text>
          <Text style={styles.reviewLabel}>Đánh hay hơn khai báo</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewCount}>24</Text>
          <Text style={styles.reviewLabel}>Thái độ văn minh</Text>
        </View>
      </View>

      {/* Menu cài đặt */}
      <View style={styles.menuBox}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Chỉnh sửa hồ sơ & Khảo sát lại trình độ</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Cài đặt tài khoản ngân hàng & VietQR nhận cọc</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]}>
          <Text style={[styles.menuText, { color: COLORS.danger }]}>Đăng xuất tài khoản</Text>
          <Text style={[styles.menuArrow, { color: COLORS.danger }]}>›</Text>
        </TouchableOpacity>
      </View>
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
  playerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  avatarLargeText: {
    color: COLORS.background,
    fontSize: 26,
    fontWeight: "800",
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 2,
  },
  playerSub: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: 6,
  },
  levelBadge: {
    backgroundColor: "rgba(6, 182, 212, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  levelBadgeText: {
    color: COLORS.secondary,
    fontSize: 10,
    fontWeight: "700",
  },
  ratingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  ratingCol: {
    flex: 1,
    alignItems: "center",
  },
  ratingNumber: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 2,
  },
  ratingLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  ratingDivider: {
    width: 1,
    backgroundColor: COLORS.surfaceLight,
  },
  specsRow: {
    flexDirection: "row",
    gap: 8,
  },
  specChip: {
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  specText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  sectionHeader: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  reviewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.md,
    flexDirection: "row",
    justifyContent: "space-around",
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    marginBottom: SPACING.md,
  },
  reviewItem: {
    alignItems: "center",
  },
  reviewCount: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 2,
  },
  reviewLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  menuBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceLight,
  },
  menuText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
  },
  menuArrow: {
    color: COLORS.textMuted,
    fontSize: 18,
    fontWeight: "700",
  },
});

