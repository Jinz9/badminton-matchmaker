import { useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  BalanceMeter,
  BottomSheet,
  BottomTabBar,
  ChartIcon,
  CourtDiagram,
  CourtNavIcon,
  EmptyState,
  Header,
  IconButton,
  LevelBadge,
  NeonCTAButton,
  PlayerChip,
  ProgressBar,
  ProgressDots,
  ScoreBox,
  SecondaryButton,
  SectionHeader,
  ShuttleIcon,
  Skeleton,
  StatusPill,
  SwapIcon,
  TeamCard,
  Toast,
  ToastVariant,
  UndoIcon,
  UserIcon,
  UsersIcon,
} from "../../components";
import { getConfiguredDataSource, getRepository } from "../../data";
import { getAuthService, MOCK_DEMO_ACCOUNTS, MOCK_OTP_CODE } from "../../data/auth";
import { useHaptics } from "../../hooks";
import { PALETTE, RADIUS, SPACING, TYPOGRAPHY } from "../../theme";

const MOCK_PLAYERS = [
  { id: "p1", name: "Hoàng Anh", level: 4, elo: 1520, subtitle: "Mặc định · Cầu công" },
  { id: "p2", name: "Minh Tuấn", level: 3, elo: 1410, subtitle: "Vãng lai · Lưới" },
  { id: "p3", name: "Thảo Vy", level: 5, elo: 1685, subtitle: "Mặc định · Linh hoạt" },
  { id: "p4", name: "Đức Đạt", level: 2, elo: 1290, subtitle: "Vãng lai · Tay trái" },
];

type DevTab = "components" | "screens";

export default function DevUiKitScreen() {
  const router = useRouter();
  const { enabled: hapticsEnabled, setEnabled: setHapticsEnabled, trigger } = useHaptics(true);

  const [devTab, setDevTab] = useState<DevTab>("components");
  const [selectedIds, setSelectedIds] = useState<string[]>(["p1", "p3"]);
  const [scoreA, setScoreA] = useState(18);
  const [scoreB, setScoreB] = useState(17);
  const [scoreHistory, setScoreHistory] = useState<("A" | "B")[]>([]);
  const [shuttleCount, setShuttleCount] = useState(2);
  const [matchEnded, setMatchEnded] = useState(false);
  const [endSheetVisible, setEndSheetVisible] = useState(false);
  const [simulateError, setSimulateError] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState("court");
  const [sheetVisible, setSheetVisible] = useState(false);
  const [toastState, setToastState] = useState<{
    visible: boolean;
    variant: ToastVariant;
    message: string;
  }>({
    visible: false,
    variant: "success",
    message: "Đã lưu tỷ số tạm (Offline Cache)",
  });

  const togglePlayer = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const showToast = (variant: ToastVariant, message: string) => {
    setToastState({ visible: true, variant, message });
  };

  const incrementScore = (team: "A" | "B") => {
    if (matchEnded) {
      showToast("warning", "Trận đấu đã kết thúc. Hãy bấm Chơi ván mới để thử lại.");
      return;
    }
    if (team === "A") {
      setScoreA((s) => s + 1);
    } else {
      setScoreB((s) => s + 1);
    }
    setScoreHistory((prev) => [...prev, team]);
  };

  const undoScore = () => {
    if (matchEnded) {
      showToast("warning", "Trận đấu đã kết thúc, không thể hoàn tác.");
      return;
    }
    if (scoreHistory.length === 0) {
      showToast("info", "Chưa có điểm mới nào để hoàn tác.");
      return;
    }
    const lastTeam = scoreHistory[scoreHistory.length - 1];
    if (lastTeam === "A") {
      setScoreA((s) => Math.max(0, s - 1));
    } else {
      setScoreB((s) => Math.max(0, s - 1));
    }
    setScoreHistory((prev) => prev.slice(0, -1));
    showToast("info", `Đã hoàn tác 1 điểm của Đội ${lastTeam}`);
  };

  const addShuttle = () => {
    if (matchEnded) {
      showToast("warning", "Trận đấu đã kết thúc.");
      return;
    }
    setShuttleCount((c) => {
      const next = c + 1;
      showToast("success", `Đã đổi cầu mới (Tổng: ${next} quả)`);
      return next;
    });
  };

  const resetMatchDemo = () => {
    setScoreA(0);
    setScoreB(0);
    setScoreHistory([]);
    setShuttleCount(1);
    setMatchEnded(false);
    setEndSheetVisible(false);
    showToast("info", "Đã tạo ván mới 0 - 0 trên Sân 01");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <Header
        title="UI Kit · Design System"
        subtitle="Expo Go · Dark Navy + Neon Lime"
        status={{ variant: "live", label: "MÔI TRƯỜNG DEV" }}
        onBackPress={() => router.back()}
        notificationCount={3}
        onNotificationPress={() =>
          showToast("info", "Có 3 vãng lai mới đang chờ duyệt vào sân")
        }
        userName="Đức Đạt"
        onAvatarPress={() => setSheetVisible(true)}
      />

      {/* Thanh chuyển chế độ xem: Toàn bộ Component vs 4 Màn hình lõi */}
      <View style={styles.modeSwitchRow}>
        <SecondaryButton
          label="1. Thư viện Component"
          variant={devTab === "components" ? "teamA" : "default"}
          onPress={() => setDevTab("components")}
          hapticsEnabled={hapticsEnabled}
          style={styles.modeBtn}
        />
        <SecondaryButton
          label="2. Xem thử 4 màn lõi"
          variant={devTab === "screens" ? "teamA" : "default"}
          onPress={() => setDevTab("screens")}
          hapticsEnabled={hapticsEnabled}
          style={styles.modeBtn}
        />
      </View>

      {toastState.visible ? (
        <View style={styles.toastWrap}>
          <Toast
            visible={toastState.visible}
            variant={toastState.variant}
            message={toastState.message}
            onDismiss={() => setToastState((prev) => ({ ...prev, visible: false }))}
          />
        </View>
      ) : null}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Công tắc bật/tắt Haptics */}
        <View style={styles.hapticCard}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.cardHeading}>Phản hồi xúc giác (Haptics)</Text>
            <Text style={styles.cardSub}>
              Rung nhẹ khi chọn người, đổi chỗ, chấm điểm tại sân
            </Text>
          </View>
          <Switch
            value={hapticsEnabled}
            onValueChange={setHapticsEnabled}
            trackColor={{ false: PALETTE.surface.interactive, true: PALETTE.brand.neonLime }}
            thumbColor={PALETTE.bg.canvas}
          />
        </View>

        {/* Điều khiển dữ liệu giả lập (Data Layer) */}
        <View style={styles.hapticCard}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.cardHeading}>
              Dữ liệu mẫu ({getConfiguredDataSource().toUpperCase()})
            </Text>
            <Text style={styles.cardSub}>
              Bật giả lập lỗi mạng 30% hoặc đặt lại dữ liệu AsyncStorage về mặc định
            </Text>
            <View style={{ marginTop: SPACING.xs }}>
              <SecondaryButton
                label="Đặt lại dữ liệu mẫu"
                variant="outline"
                onPress={async () => {
                  const repo = getRepository();
                  if (repo.resetMockData) {
                    await repo.resetMockData();
                  }
                  await getAuthService().resetMockAccounts?.();
                  showToast("success", "Đã khôi phục dữ liệu mẫu & tài khoản Auth ban đầu");
                }}
                hapticsEnabled={hapticsEnabled}
              />
            </View>
          </View>
          <Switch
            value={simulateError}
            onValueChange={(next) => {
              setSimulateError(next);
              const repo = getRepository();
              repo.setMockConfig?.({ errorRate: next ? 0.3 : 0 });
              showToast(
                next ? "warning" : "info",
                next ? "Đã bật giả lập lỗi ngẫu nhiên 30%" : "Đã tắt giả lập lỗi mạng"
              );
            }}
            trackColor={{ false: PALETTE.surface.interactive, true: PALETTE.teamB.amber }}
            thumbColor={PALETTE.bg.canvas}
          />
        </View>

        {/* Thông tin Xác thực & Mã OTP cố định (Q04 / ADR-002) */}
        <View style={styles.hapticCard}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.cardHeading}>
              Xác thực & Hồ sơ (Mã OTP cố định: {MOCK_OTP_CODE})
            </Text>
            <Text style={styles.cardSub}>
              Chờ phương án đăng nhập thật theo ADR-002 • Mã OTP giả lập cố định:{" "}
              {MOCK_OTP_CODE} • Tài khoản mẫu:{" "}
              {MOCK_DEMO_ACCOUNTS.map((a) => `${a.email} (${a.password})`).join(" | ")}
            </Text>
            <View style={[styles.rowWrap, { marginTop: SPACING.xs }]}>
              <SecondaryButton
                label="Mở Đăng Nhập"
                variant="outline"
                onPress={() => router.push("/(auth)/login" as never)}
                style={{ flex: 1 }}
              />
              <SecondaryButton
                label="Mở Đăng Ký"
                variant="outline"
                onPress={() => router.push("/(auth)/register" as never)}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>

        {devTab === "components" ? (
          <>
            <SectionHeader title="1. Nút hành động chính (NeonCTAButton · 58px)" />
            <NeonCTAButton
              label="CHIA KÈO SÂN 1"
              subtitle="[CHẠM 1]"
              icon={<ShuttleIcon size={18} color={PALETTE.brand.neonTextDark} />}
              onPress={() => showToast("success", "Đã nhấn CTA chính (58px)")}
              hapticsEnabled={hapticsEnabled}
            />
            <NeonCTAButton label="Đang cân bằng kèo..." loading hapticsEnabled={hapticsEnabled} />
            <NeonCTAButton
              label="CHƯA ĐỦ 4 NGƯỜI"
              subtitle="Vô hiệu"
              disabled
              hapticsEnabled={hapticsEnabled}
            />

            <SectionHeader title="2. Nút phụ & IconButton (>= 48dp)" />
            <View style={styles.rowWrap}>
              <SecondaryButton
                label="Mặc định"
                onPress={() => showToast("info", "Nút phụ mặc định")}
                hapticsEnabled={hapticsEnabled}
                style={{ flex: 1 }}
              />
              <SecondaryButton
                label="Viền"
                variant="outline"
                onPress={() => showToast("info", "Nút phụ viền")}
                hapticsEnabled={hapticsEnabled}
                style={{ flex: 1 }}
              />
            </View>
            <View style={styles.rowWrap}>
              <SecondaryButton
                label={`Hoàn tác (${scoreHistory.length})`}
                icon={<UndoIcon size={16} color={PALETTE.text.primary} />}
                onPress={undoScore}
                hapticsEnabled={hapticsEnabled}
                style={{ flex: 1 }}
              />
              <SecondaryButton
                label="KẾT THÚC & TRẢ SÂN"
                variant="danger"
                onPress={() => setEndSheetVisible(true)}
                hapticsEnabled={hapticsEnabled}
                style={{ flex: 1 }}
              />
            </View>
            <View style={styles.iconRow}>
              <IconButton
                icon={<SwapIcon size={18} color={PALETTE.text.primary} />}
                accessibilityLabel="Đổi chỗ"
                onPress={() => {
                  trigger("swapTeam");
                  showToast("info", "Đã đổi chỗ 2 VĐV");
                }}
                hapticsEnabled={hapticsEnabled}
              />
              <IconButton
                icon={<UserIcon size={18} color={PALETTE.text.primary} />}
                accessibilityLabel="Mở hồ sơ mẫu"
                badgeCount={2}
                onPress={() => setSheetVisible(true)}
                hapticsEnabled={hapticsEnabled}
              />
              <IconButton
                icon={<UserIcon size={18} color={PALETTE.text.muted} />}
                accessibilityLabel="Vô hiệu"
                disabled
              />
            </View>

            <SectionHeader title="3. Cấp trình độ (6 cấp) & Trạng thái (StatusPill)" />
            <View style={styles.wrapBadges}>
              {[1, 2, 3, 4, 5, 6].map((lvl) => (
                <LevelBadge key={lvl} level={lvl} />
              ))}
            </View>
            <View style={styles.wrapBadges}>
              <StatusPill variant="live" label="ĐANG HOẠT ĐỘNG" />
              <StatusPill variant="playing" label="SÂN 01 • ĐANG ĐẤU" />
              <StatusPill variant="empty" label="SÂN 02 • ĐANG TRỐNG" />
              <StatusPill variant="warning" label="CHỜ DUYỆT (2)" />
            </View>

            <SectionHeader
              title="4. Chọn người chơi (PlayerChip)"
              subtitle="Chạm để thử trạng thái chọn & dấu tích"
            />
            {MOCK_PLAYERS.map((p) => (
              <PlayerChip
                key={p.id}
                name={p.name}
                level={p.level}
                elo={p.elo}
                subtitle={p.subtitle}
                selected={selectedIds.includes(p.id)}
                onPress={() => togglePlayer(p.id)}
                hapticsEnabled={hapticsEnabled}
              />
            ))}
            <PlayerChip
              name="Văn Hùng (Đã vào Sân 1)"
              level={4}
              elo={1550}
              disabled
              subtitle="Đang thi đấu"
            />

            <SectionHeader title="5. Tiến trình 3 chạm & Thanh cân bằng" />
            <ProgressBar currentStep={2} totalSteps={3} />
            <ProgressDots currentStep={3} totalSteps={3} />
            <BalanceMeter teamAPercent={51} eloDiff={15} />
            <BalanceMeter
              teamAPercent={68}
              eloDiff={120}
              statusLabel="Cần đổi người để cân hơn"
            />

            <SectionHeader title="6. Thẻ Đội A / Đội B & Sơ đồ sân 4 người" />
            <TeamCard
              team="A"
              players={[
                { id: "a1", name: "Hoàng Anh", level: 4, elo: 1520, positionLabel: "Cầu sau (Công)" },
                { id: "a2", name: "Minh Tuấn", level: 3, elo: 1410, positionLabel: "Cầu trước (Lưới)" },
              ]}
              averageElo={1465}
              onSwapPress={() => showToast("info", "Hoán đổi người trong Đội A")}
              onPlayerPress={() => setSheetVisible(true)}
              hapticsEnabled={hapticsEnabled}
            />
            <TeamCard
              team="B"
              players={[
                { id: "b1", name: "Thảo Vy", level: 5, elo: 1685, positionLabel: "Linh hoạt" },
                { id: "b2", name: "Đức Đạt", level: 2, elo: 1290, positionLabel: "Tay trái" },
              ]}
              averageElo={1488}
              onPlayerPress={() => setSheetVisible(true)}
              hapticsEnabled={hapticsEnabled}
            />
            <CourtDiagram
              courtName="Sân 01"
              teamANames={["Hoàng Anh", "Minh Tuấn"]}
              teamBNames={["Thảo Vy", "Đức Đạt"]}
              status="playing"
            />
            <CourtDiagram courtName="Sân 02" status="empty" />

            <SectionHeader title="7. Bảng điểm 1 tay (ScoreBox)" />
            <View style={styles.scoreRow}>
              <ScoreBox
                team="A"
                teamLabel="ĐỘI A"
                score={scoreA}
                onIncrement={() => incrementScore("A")}
                disabled={matchEnded}
                hapticsEnabled={hapticsEnabled}
              />
              <ScoreBox
                team="B"
                teamLabel="ĐỘI B"
                score={scoreB}
                onIncrement={() => incrementScore("B")}
                disabled={matchEnded}
                hapticsEnabled={hapticsEnabled}
              />
            </View>

            <SectionHeader title="8. Modal hồ sơ, EmptyState, Skeleton & BottomTabBar" />
            <SecondaryButton
              label="Mở BottomSheet Hồ Sơ (Màn 02)"
              variant="outline"
              onPress={() => setSheetVisible(true)}
              hapticsEnabled={hapticsEnabled}
            />
            <EmptyState
              title="Chưa có kèo phù hợp hôm nay"
              description="Hãy mở rộng khu vực Đà Nẵng hoặc tự tạo phòng kèo 1–2 sân mới."
              actionLabel="TẠO KÈO MỚI"
              onActionPress={() => showToast("success", "Chuyển sang form tạo kèo")}
            />
            <View style={styles.skeletonCard}>
              <Skeleton width="55%" height={18} />
              <Skeleton width="90%" height={14} />
              <Skeleton width="100%" height={56} borderRadius={12} />
            </View>
            <BottomTabBar
              activeKey={activeBottomTab}
              onSelect={setActiveBottomTab}
              hapticsEnabled={hapticsEnabled}
              items={[
                {
                  key: "court",
                  label: "Tại sân",
                  renderIcon: (a) => (
                    <CourtNavIcon size={18} color={a ? PALETTE.brand.neonGlow : PALETTE.text.muted} />
                  ),
                },
                {
                  key: "partners",
                  label: "Tìm bạn",
                  renderIcon: (a) => (
                    <UsersIcon size={18} color={a ? PALETTE.brand.neonGlow : PALETTE.text.muted} />
                  ),
                },
                {
                  key: "history",
                  label: "Lịch sử",
                  renderIcon: (a) => (
                    <ChartIcon size={18} color={a ? PALETTE.brand.neonGlow : PALETTE.text.muted} />
                  ),
                },
                {
                  key: "profile",
                  label: "Hồ sơ",
                  renderIcon: (a) => (
                    <UserIcon size={18} color={a ? PALETTE.brand.neonGlow : PALETTE.text.muted} />
                  ),
                },
              ]}
            />
          </>
        ) : (
          /* Chế độ xem thử khối chính 4 màn hình lõi để đối chiếu Figma */
          <View style={styles.previewStack}>
            <SectionHeader
              title="Màn 01 · Home Sân Đấu (Chạm 1)"
              subtitle="Khối sân 1 đang trống + Sân 2 đang đấu + CTA vùng ngón cái"
            />
            <View style={styles.screenFrame}>
              <StatusPill variant="empty" label="SÂN 01 • ĐANG TRỐNG" />
              <CourtDiagram courtName="Sân 01" status="empty" />
              <NeonCTAButton
                label="CHIA KÈO SÂN 1"
                subtitle="[CHẠM 1]"
                hapticsEnabled={hapticsEnabled}
                onPress={() => showToast("info", "Chuyển sang Chạm 2")}
              />
            </View>

            <SectionHeader
              title="Màn 02 · Chọn Người & Cân Trình (Chạm 2)"
              subtitle="Tiến trình Chạm 2/3 + Thanh cân bằng + Chọn 4 VĐV"
            />
            <View style={styles.screenFrame}>
              <ProgressBar currentStep={2} totalSteps={3} />
              <BalanceMeter teamAPercent={51} eloDiff={15} />
              {MOCK_PLAYERS.slice(0, 2).map((p) => (
                <PlayerChip
                  key={`m2-${p.id}`}
                  name={p.name}
                  level={p.level}
                  elo={p.elo}
                  selected={selectedIds.includes(p.id)}
                  onPress={() => togglePlayer(p.id)}
                  hapticsEnabled={hapticsEnabled}
                />
              ))}
              <NeonCTAButton
                label="XEM KÈO CÂN BẰNG"
                subtitle="[CHẠM 2]"
                hapticsEnabled={hapticsEnabled}
              />
            </View>

            <SectionHeader
              title="Màn 03 · Xác Nhận Kèo Cân Bằng (Chạm 3)"
              subtitle="Đội A Cyan vs Đội B Hổ phách + Xáo lại + Vào sân ngay"
            />
            <View style={styles.screenFrame}>
              <ProgressDots currentStep={3} totalSteps={3} />
              <BalanceMeter teamAPercent={51} eloDiff={15} />
              <TeamCard
                team="A"
                players={[
                  { id: "m3a1", name: "Hoàng Anh", level: 4, elo: 1520 },
                  { id: "m3a2", name: "Minh Tuấn", level: 3, elo: 1410 },
                ]}
                averageElo={1465}
              />
              <TeamCard
                team="B"
                players={[
                  { id: "m3b1", name: "Thảo Vy", level: 5, elo: 1685 },
                  { id: "m3b2", name: "Đức Đạt", level: 2, elo: 1290 },
                ]}
                averageElo={1488}
              />
              <SecondaryButton label="Xáo lại đội hình khác" variant="outline" />
              <NeonCTAButton label="VÀO SÂN NGAY" subtitle="[CHẠM 3]" />
            </View>

            <SectionHeader
              title="Màn 04 · Chấm Điểm & Kết Thúc Trận"
              subtitle="2 ô điểm lớn 1 tay + Hoàn tác + Kết thúc & Trả sân"
            />
            <View style={styles.screenFrame}>
              <View style={styles.matchStatusRow}>
                <StatusPill
                  variant={matchEnded ? "empty" : "playing"}
                  label={matchEnded ? "SÂN 01 • ĐÃ TRẢ SÂN" : "SÂN 01 • LIVE"}
                />
                <StatusPill variant="live" label={`Cầu đã dùng: ${shuttleCount}`} />
              </View>
              <View style={styles.scoreRow}>
                <ScoreBox
                  team="A"
                  teamLabel="ĐỘI A"
                  score={scoreA}
                  onIncrement={() => incrementScore("A")}
                  disabled={matchEnded}
                  hapticsEnabled={hapticsEnabled}
                />
                <ScoreBox
                  team="B"
                  teamLabel="ĐỘI B"
                  score={scoreB}
                  onIncrement={() => incrementScore("B")}
                  disabled={matchEnded}
                  hapticsEnabled={hapticsEnabled}
                />
              </View>
              <View style={styles.rowWrap}>
                <SecondaryButton
                  label={`Hoàn tác (${scoreHistory.length})`}
                  icon={<UndoIcon size={16} color={PALETTE.text.primary} />}
                  onPress={undoScore}
                  disabled={matchEnded || scoreHistory.length === 0}
                  hapticsEnabled={hapticsEnabled}
                  style={{ flex: 1 }}
                />
                <SecondaryButton
                  label={`+1 Quả cầu (${shuttleCount})`}
                  onPress={addShuttle}
                  disabled={matchEnded}
                  hapticsEnabled={hapticsEnabled}
                  style={{ flex: 1 }}
                />
              </View>
              {matchEnded ? (
                <NeonCTAButton
                  label="CHƠI VÁN MỚI (RESET)"
                  onPress={resetMatchDemo}
                  hapticsEnabled={hapticsEnabled}
                />
              ) : (
                <SecondaryButton
                  label="KẾT THÚC & TRẢ SÂN"
                  variant="danger"
                  onPress={() => setEndSheetVisible(true)}
                  hapticsEnabled={hapticsEnabled}
                />
              )}
            </View>
          </View>
        )}
      </ScrollView>

      <BottomSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        title="Hồ sơ tay vợt · Hoàng Anh"
      >
        <View style={styles.sheetProfileRow}>
          <LevelBadge level={4} />
          <StatusPill variant="live" label="Uy tín: 96/100" />
        </View>
        <Text style={styles.cardSub}>
          Elo đôi chính thức: 1,520 • Sở trường: Cầu sau (Công) • Tay thuận: Phải
        </Text>
        <BalanceMeter teamAPercent={58} statusLabel="Tỷ lệ thắng gần đây: 58%" />
        <NeonCTAButton
          label="CHỌN VÀO ĐỘI A"
          onPress={() => {
            setSheetVisible(false);
            showToast("success", "Đã chọn Hoàng Anh vào Đội A");
          }}
        />
      </BottomSheet>
      <BottomSheet
        visible={endSheetVisible}
        onClose={() => setEndSheetVisible(false)}
        title="Xác nhận kết thúc & trả Sân 01"
      >
        <Text style={styles.cardHeading}>
          Tỷ số chung cuộc: Đội A {scoreA} - {scoreB} Đội B
        </Text>
        <Text style={styles.cardSub}>
          Số quả cầu đã sử dụng: {shuttleCount} quả • Kết quả sẽ được lưu vào lịch sử đấu.
        </Text>
        <View style={styles.rowWrap}>
          <SecondaryButton
            label="Đánh tiếp"
            variant="outline"
            onPress={() => setEndSheetVisible(false)}
            hapticsEnabled={hapticsEnabled}
            style={{ flex: 1 }}
          />
          <SecondaryButton
            label="XÁC NHẬN TRẢ SÂN"
            variant="danger"
            onPress={() => {
              setMatchEnded(true);
              setEndSheetVisible(false);
              showToast("success", `Đã kết thúc (${scoreA}-${scoreB}) & trả Sân 01`);
            }}
            hapticsEnabled={hapticsEnabled}
            style={{ flex: 1 }}
          />
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PALETTE.bg.canvas,
  },
  modeSwitchRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: PALETTE.bg.deep,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.border.subtle,
  },
  modeBtn: {
    flex: 1,
    minHeight: 44,
  },
  toastWrap: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
    gap: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  hapticCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PALETTE.surface.card,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  cardHeading: {
    ...TYPOGRAPHY.cardTitle,
    color: PALETTE.text.primary,
  },
  cardSub: {
    ...TYPOGRAPHY.body,
    color: PALETTE.text.muted,
  },
  rowWrap: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  wrapBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  scoreRow: {
    flexDirection: "row",
    gap: SPACING.sm + 4,
  },
  matchStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  skeletonCard: {
    backgroundColor: PALETTE.surface.card,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  previewStack: {
    gap: SPACING.md,
  },
  screenFrame: {
    backgroundColor: PALETTE.bg.deep,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: PALETTE.border.strong,
    padding: SPACING.md,
    gap: SPACING.sm + 4,
  },
  sheetProfileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    flexWrap: "wrap",
  },
});

