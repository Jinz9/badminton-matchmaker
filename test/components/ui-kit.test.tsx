import { fireEvent, render, screen } from "@testing-library/react-native";
import * as Haptics from "expo-haptics";

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
  },
}));
import {
  BalanceMeter,
  BottomSheet,
  BottomTabBar,
  CourtDiagram,
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
  StatusPill,
  TeamCard,
  Toast,
} from "../../src/components";
import { BackIcon } from "../../src/components/Icons";
import { setGlobalHapticsEnabled } from "../../src/utils/haptics";

jest.mock("expo-haptics", () => ({
  selectionAsync: jest.fn(() => Promise.resolve()),
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: "light", Medium: "medium", Heavy: "heavy" },
  NotificationFeedbackType: { Success: "success", Warning: "warning", Error: "error" },
}));

describe("UI Kit Components (Q02)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setGlobalHapticsEnabled(true);
  });

  describe("NeonCTAButton", () => {
    it("hiển thị nhãn chính, phụ đề và gọi onPress khi nhấn", async () => {
      const onPress = jest.fn();
      await render(
        <NeonCTAButton
          testID="cta-btn"
          label="CHIA KÈO SÂN 1"
          subtitle="[CHẠM 1]"
          onPress={onPress}
        />
      );

      expect(screen.getByText("CHIA KÈO SÂN 1")).toBeTruthy();
      expect(screen.getByText("[CHẠM 1]")).toBeTruthy();

      await fireEvent.press(screen.getByTestId("cta-btn"));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it("không gọi onPress khi disabled = true", async () => {
      const onPress = jest.fn();
      await render(
        <NeonCTAButton
          testID="cta-disabled"
          label="CHƯA ĐỦ NGƯỜI"
          disabled
          onPress={onPress}
        />
      );

      await fireEvent.press(screen.getByTestId("cta-disabled"));
      expect(onPress).not.toHaveBeenCalled();
    });

    it("hiển thị trạng thái loading và chặn nhấn", async () => {
      const onPress = jest.fn();
      await render(
        <NeonCTAButton
          testID="cta-loading"
          label="ĐANG TẠO"
          loading
          onPress={onPress}
        />
      );

      expect(screen.getByTestId("cta-loading-spinner")).toBeTruthy();
      expect(screen.getByText("Đang xử lý...")).toBeTruthy();
      await fireEvent.press(screen.getByTestId("cta-loading"));
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  describe("SecondaryButton & IconButton", () => {
    it("SecondaryButton gọi onPress khi hợp lệ và chặn khi disabled", async () => {
      const onPress = jest.fn();
      const { rerender } = await render(
        <SecondaryButton testID="sec-btn" label="Hoàn tác" onPress={onPress} />
      );
      await fireEvent.press(screen.getByTestId("sec-btn"));
      expect(onPress).toHaveBeenCalledTimes(1);

      await rerender(
        <SecondaryButton testID="sec-btn" label="Hoàn tác" disabled onPress={onPress} />
      );
      await fireEvent.press(screen.getByTestId("sec-btn"));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it("IconButton hiển thị badgeCount và gọi onPress", async () => {
      const onPress = jest.fn();
      await render(
        <IconButton
          testID="icon-btn"
          icon={<BackIcon />}
          accessibilityLabel="Quay lại"
          badgeCount={3}
          onPress={onPress}
        />
      );
      expect(screen.getByText("3")).toBeTruthy();
      await fireEvent.press(screen.getByTestId("icon-btn"));
      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });

  describe("PlayerChip & LevelBadge", () => {
    it("hiển thị tên, chữ cái avatar, Elo, cấp độ và đổi trạng thái chọn", async () => {
      const onPress = jest.fn();
      await render(
        <PlayerChip
          testID="player-chip"
          name="Hoàng Anh"
          level={4}
          elo={1520}
          selected
          onPress={onPress}
        />
      );

      expect(screen.getByText("HA")).toBeTruthy();
      expect(screen.getByText("Hoàng Anh")).toBeTruthy();
      expect(screen.getByText("1520 Elo")).toBeTruthy();
      expect(screen.getByText("TB+")).toBeTruthy();

      await fireEvent.press(screen.getByTestId("player-chip"));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it("không gọi onPress khi PlayerChip bị disabled", async () => {
      const onPress = jest.fn();
      await render(
        <PlayerChip
          testID="player-disabled"
          name="Minh Tuấn"
          level={3}
          elo={1400}
          disabled
          onPress={onPress}
        />
      );
      await fireEvent.press(screen.getByTestId("player-disabled"));
      expect(onPress).not.toHaveBeenCalled();
    });

    it("LevelBadge hiển thị đủ 6 cấp với nhãn chữ rõ ràng", async () => {
      await render(
        <>
          <LevelBadge level={1} />
          <LevelBadge level={2} />
          <LevelBadge level={3} />
          <LevelBadge level={4} />
          <LevelBadge level={5} />
          <LevelBadge level={6} />
        </>
      );
      expect(screen.getByText("Cấp 1 · Yếu")).toBeTruthy();
      expect(screen.getByText("Cấp 2 · TB-")).toBeTruthy();
      expect(screen.getByText("Cấp 3 · TB")).toBeTruthy();
      expect(screen.getByText("Cấp 4 · TB+")).toBeTruthy();
      expect(screen.getByText("Cấp 5 · Khá")).toBeTruthy();
      expect(screen.getByText("Cấp 6 · Tốt")).toBeTruthy();
    });
  });

  describe("ScoreBox, TeamCard, BalanceMeter & CourtDiagram", () => {
    it("ScoreBox hiển thị điểm và gọi onIncrement khi chạm", async () => {
      const onIncrement = jest.fn();
      await render(
        <ScoreBox
          testID="score-a"
          team="A"
          teamLabel="ĐỘI A"
          score={18}
          onIncrement={onIncrement}
        />
      );
      expect(screen.getByText("18")).toBeTruthy();
      expect(screen.getByText("+ ĐỘI A +1")).toBeTruthy();

      await fireEvent.press(screen.getByTestId("score-a"));
      expect(onIncrement).toHaveBeenCalledTimes(1);
    });

    it("TeamCard hiển thị 2 VĐV, Elo TB và nút đổi chỗ", async () => {
      const onSwap = jest.fn();
      await render(
        <TeamCard
          testID="team-a"
          team="A"
          averageElo={1465}
          onSwapPress={onSwap}
          players={[
            { id: "1", name: "Hoàng Anh", level: 4, elo: 1520 },
            { id: "2", name: "Minh Tuấn", level: 3, elo: 1410 },
          ]}
        />
      );
      expect(screen.getByText("ĐỘI A")).toBeTruthy();
      expect(screen.getByText("Elo TB: 1465")).toBeTruthy();
      expect(screen.getByText("Hoàng Anh")).toBeTruthy();
      expect(screen.getByText("Minh Tuấn")).toBeTruthy();

      await fireEvent.press(screen.getByTestId("team-a-swap"));
      expect(onSwap).toHaveBeenCalledTimes(1);
    });

    it("BalanceMeter tính đúng phần trăm 2 đội và chênh lệch Elo", async () => {
      await render(<BalanceMeter teamAPercent={51} eloDiff={15} />);
      expect(screen.getByText("Đội A 51%")).toBeTruthy();
      expect(screen.getByText("49% Đội B")).toBeTruthy();
      expect(screen.getByText("Chênh lệch sức mạnh: 15 Elo")).toBeTruthy();
    });

    it("CourtDiagram & ProgressBar/ProgressDots render đầy đủ", async () => {
      await render(
        <>
          <CourtDiagram courtName="Sân 01" status="playing" />
          <ProgressBar currentStep={2} totalSteps={3} />
          <ProgressDots currentStep={3} totalSteps={3} />
        </>
      );
      expect(screen.getByText("Sân 01 · Đánh đôi (4 người)")).toBeTruthy();
      expect(screen.getByText("Chạm 2/3")).toBeTruthy();
      expect(screen.getByText("Chạm 3/3")).toBeTruthy();
    });
  });

  describe("Header, StatusPill, BottomTabBar, BottomSheet, Toast & EmptyState", () => {
    it("Header, StatusPill, Toast và EmptyState render đúng thông tin", async () => {
      const onDismiss = jest.fn();
      await render(
        <>
          <Header
            title="Sân Tiên Sơn"
            status={{ variant: "live", label: "ĐANG HOẠT ĐỘNG" }}
            notificationCount={2}
          />
          <StatusPill variant="empty" label="ĐANG TRỐNG" />
          <Toast visible message="Đã lưu ngoại tuyến" variant="success" onDismiss={onDismiss} />
          <EmptyState title="Chưa có kèo" description="Hãy tạo kèo mới" />
        </>
      );

      expect(screen.getByText("Sân Tiên Sơn")).toBeTruthy();
      expect(screen.getByText("ĐANG HOẠT ĐỘNG")).toBeTruthy();
      expect(screen.getByText("ĐANG TRỐNG")).toBeTruthy();
      expect(screen.getByText("Đã lưu ngoại tuyến")).toBeTruthy();
      expect(screen.getByText("Chưa có kèo")).toBeTruthy();
    });

    it("BottomTabBar chuyển tab khi bấm và BottomSheet gọi onClose", async () => {
      const onSelect = jest.fn();
      const onClose = jest.fn();
      await render(
        <>
          <BottomTabBar
            testID="tab-bar"
            activeKey="court"
            onSelect={onSelect}
            items={[
              { key: "court", label: "Tại sân", renderIcon: () => null },
              { key: "profile", label: "Hồ sơ", renderIcon: () => null },
            ]}
          />
          <BottomSheet testID="sheet" visible title="Hồ sơ VĐV" onClose={onClose}>
            <></>
          </BottomSheet>
        </>
      );

      await fireEvent.press(screen.getByTestId("tab-bar-profile"));
      expect(onSelect).toHaveBeenCalledWith("profile");

      await fireEvent.press(screen.getByTestId("sheet-close"));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("Tắt haptics toàn cục thì không gọi expo-haptics", async () => {
      setGlobalHapticsEnabled(false);
      const onPress = jest.fn();
      await render(<NeonCTAButton testID="no-haptic" label="NHẤN" onPress={onPress} />);
      await fireEvent.press(screen.getByTestId("no-haptic"));
      expect(onPress).toHaveBeenCalledTimes(1);
      expect(Haptics.notificationAsync).not.toHaveBeenCalled();
    });
  });
});
