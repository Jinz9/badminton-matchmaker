import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Header, NeonCTAButton, SecondaryButton, StatusPill } from "../../components";
import { PALETTE, RADIUS, SPACING, TYPOGRAPHY } from "../../theme";

export default function CourtScorePlaceholderRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    matchId?: string;
    sessionId?: string;
    courtId?: string;
  }>();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <Header
        title="Chấm Điểm Trận Đấu"
        subtitle={`Mã trận: ${params.matchId ?? "—"} • Sân 0${params.courtId ?? "1"}`}
        status={{ variant: "playing", label: "ĐANG ĐẤU" }}
        onBackPress={() => router.back()}
      />
      <View style={styles.container}>
        <View style={styles.card}>
          <StatusPill variant="live" label="ĐÃ LƯU CẶP ĐẤU VÀO REPOSITORY" />
          <Text style={styles.title}>Sẵn sàng chấm điểm trực tiếp (Q07)</Text>
          <Text style={styles.sub}>
            Trận đấu {params.matchId ?? "mới"} thuộc phòng kèo {params.sessionId ?? "hiện tại"} đã được tạo thành công. Màn hình chấm điểm đầy đủ (+1, Hoàn tác, +1 Quả cầu, Kết thúc & Cập nhật Elo) sẽ được dựng hoàn chỉnh ở bước Q07.
          </Text>
          <NeonCTAButton
            label="QUAY VỀ HOME SÂN ĐẤU"
            onPress={() => router.replace("/(tabs)" as never)}
          />
          <SecondaryButton
            label="Mở màn thử nghiệm UI Kit"
            variant="outline"
            onPress={() => router.push("/dev/ui-kit" as never)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PALETTE.bg.canvas,
  },
  container: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: "center",
  },
  card: {
    backgroundColor: PALETTE.surface.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    gap: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.screenTitle,
    color: PALETTE.text.primary,
  },
  sub: {
    ...TYPOGRAPHY.body,
    color: PALETTE.text.secondary,
  },
});

