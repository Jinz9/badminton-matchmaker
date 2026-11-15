import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { BalanceConfirmScreen } from "../../src/app/court/balance-confirm";
import { getRepository } from "../../src/data";
import { balanceCourt, BalancingMember } from "../../src/domain/balancing";
import { RosterMember } from "../../src/domain/types";
import { AuthProvider } from "../../src/hooks";
import {
  getTapCounterState,
  recordOnCourtTap,
  resetTapCounter,
} from "../../src/utils/tapCounter";

const mockPush = jest.fn();
const mockBack = jest.fn();
let mockSearchParams: Record<string, string> = {};

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: mockBack,
  }),
  useLocalSearchParams: () => mockSearchParams,
}));

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: "light", Medium: "medium", Heavy: "heavy" },
  NotificationFeedbackType: {
    Success: "success",
    Warning: "warning",
    Error: "error",
  },
}));

const mockMemoryStorage = new Map<string, string>();
jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn((key: string) =>
      Promise.resolve(mockMemoryStorage.get(key) ?? null)
    ),
    setItem: jest.fn((key: string, val: string) => {
      mockMemoryStorage.set(key, val);
      return Promise.resolve();
    }),
    removeItem: jest.fn((key: string) => {
      mockMemoryStorage.delete(key);
      return Promise.resolve();
    }),
  },
}));

function buildMembers(count: number, equalRating?: number): RosterMember[] {
  const ratings = [1650, 1520, 1470, 1420, 1380, 1340, 1290, 1200];
  const names = [
    "Hoàng Anh",
    "Thảo Vy",
    "Đức Mạnh",
    "Khánh Linh",
    "Tuấn Kiệt",
    "Bảo Trâm",
    "Đào Duy Nhật",
    "Nguyễn Đức Đạt",
  ];
  return Array.from({ length: count }, (_, idx) => ({
    memberId: `p${idx + 1}`,
    displayName: names[idx] ?? `VĐV ${idx + 1}`,
    gender: idx % 2 === 0 ? "M" : "F",
    type: idx < 4 ? "core" : "recruit",
    rating: equalRating ?? ratings[idx] ?? 1400,
    level: 3,
    position: idx % 2 === 0 ? "back" : "front",
    dominantHand: "right",
    isGhost: false,
    checkedIn: true,
    joinedAt: "2026-11-15T06:00:00.000Z",
  }));
}

describe("Q06: Màn 03 Xác Nhận Kèo Cân Bằng (Chạm 3) & Tích hợp balanceCourt / swapPlayers", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockMemoryStorage.clear();
    mockSearchParams = {};
    resetTapCounter();
    const repo = getRepository();
    repo.setMockConfig?.({ minLatencyMs: 0, maxLatencyMs: 0, errorRate: 0 });
    await repo.resetMockData?.();
  });

  it("hiển thị đúng Frame 03 Figma: huy hiệu thuật toán tối ưu, tỷ lệ %, thẻ Đội A (cyan) & Đội B (hổ phách), nút VS đổi chéo, CourtDiagram và nút bắt đầu", async () => {
    const members = buildMembers(4);
    const screen = await render(
      <AuthProvider>
        <BalanceConfirmScreen
          candidatesOverride={members}
          initialCategory="mixed"
        />
      </AuthProvider>
    );

    expect(screen.getByTestId("optimal-algo-badge")).toBeTruthy();
    expect(screen.getByText(/ĐỀ XUẤT CHIA CẶP TỐI ƯU/i)).toBeTruthy();
    expect(screen.getByTestId("team-a-percent")).toBeTruthy();
    expect(screen.getByTestId("team-b-percent")).toBeTruthy();
    expect(screen.getByTestId("confirm-team-a-card")).toBeTruthy();
    expect(screen.getByTestId("confirm-team-b-card")).toBeTruthy();
    expect(screen.getByTestId("vs-cross-swap-btn")).toBeTruthy();
    expect(screen.getByTestId("confirm-court-diagram")).toBeTruthy();
    expect(screen.getByTestId("confirm-start-match-btn")).toBeTruthy();
    expect(screen.queryByTestId("confirm-resting-section")).toBeNull();

    await screen.unmount();
  });

  it("xử lý chuẩn cả 4, 5, 6, 7, 8 người/sân và xoay vòng người nghỉ không lặp liên tiếp ở ca lẻ 5 & 7 người", async () => {
    for (const count of [4, 5, 6, 7, 8]) {
      const members = buildMembers(count);
      const screen = await render(
        <AuthProvider>
          <BalanceConfirmScreen
            candidatesOverride={members}
            initialCategory="men"
          />
        </AuthProvider>
      );

      if (count === 4) {
        expect(screen.queryByTestId("confirm-resting-section")).toBeNull();
      } else {
        expect(screen.getByTestId("confirm-resting-section")).toBeTruthy();
        const expectedRest = count - 4;
        expect(
          screen.getByText(new RegExp(`NGƯỜI NGHỈ HIỆP 1 \\(${expectedRest} VĐV\\)`))
        ).toBeTruthy();
        expect(screen.getByTestId("rotation-schedule-list")).toBeTruthy();
      }
      await screen.unmount();
    }

    // Kiểm tra logic người nghỉ luân phiên không lặp liên tiếp ở ca 5 người
    const fiveMembers: BalancingMember[] = buildMembers(5).map((m) => ({
      id: m.memberId,
      name: m.displayName,
      gender: m.gender,
      rating: m.rating,
      position: m.position,
      dominantHand: m.dominantHand,
    }));
    const res5 = balanceCourt(fiveMembers, {
      category: "men",
      mode: "rotate",
      targetMatches: 5,
    });
    expect(res5.matches).toHaveLength(5);
    const restedOrder = res5.matches.map((m) => m.restingIds[0]);
    // 5 hiệp đầu, 5 người nghỉ khác nhau hoàn toàn không trùng lặp
    expect(new Set(restedOrder).size).toBe(5);
  });

  it("hai đội cùng điểm Elo cho kết quả diff = 0 và tỷ lệ 50% vs 50%", async () => {
    const equalMembers = buildMembers(4, 1500);
    const screen = await render(
      <AuthProvider>
        <BalanceConfirmScreen
          candidatesOverride={equalMembers}
          initialCategory="men"
        />
      </AuthProvider>
    );

    expect(screen.getAllByText("50%").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/cân bằng tuyệt đối \(ΔElo: 0\)/i)).toBeTruthy();

    await screen.unmount();
  });

  it("đổi thủ công 2 người (swapPlayers) và nút VS đổi chéo: cập nhật cân bằng ngay, cảnh báo khi chênh lệch lớn nhưng KHÔNG chặn host", async () => {
    // Tạo 4 người có chênh lệch lớn: 1900, 1850, 1150, 1100
    const skewedMembers: RosterMember[] = [
      { ...buildMembers(4)[0], memberId: "p1", displayName: "Mạnh Nhất", rating: 1900, gender: "M" },
      { ...buildMembers(4)[1], memberId: "p2", displayName: "Mạnh Nhì", rating: 1850, gender: "M" },
      { ...buildMembers(4)[2], memberId: "p3", displayName: "Yếu Ba", rating: 1150, gender: "M" },
      { ...buildMembers(4)[3], memberId: "p4", displayName: "Yếu Tư", rating: 1100, gender: "M" },
    ];

    const screen = await render(
      <AuthProvider>
        <BalanceConfirmScreen
          candidatesOverride={skewedMembers}
          initialCategory="men"
        />
      </AuthProvider>
    );

    // Ban đầu thuật toán ghép (1900+1100=3000) vs (1850+1150=3000) -> diff = 0
    expect(screen.getByText(/ΔElo: 0/i)).toBeTruthy();

    // Host đổi thủ công p4 (1100 ở Đội A) với p2 (1850 ở Đội B) => Đội A thành (1900+1850=3750) vs Đội B (1150+1100=2250) -> diff = 1500!
    await fireEvent.press(screen.getByTestId("swap-player-p4"));
    await fireEvent.press(screen.getByTestId("swap-player-p2"));

    // Hiện cảnh báo chênh lệch lớn nhưng nút xác nhận vẫn bật (không chặn host)
    expect(screen.getByTestId("unbalanced-warning-banner")).toBeTruthy();
    expect(screen.getByText(/Độ lệch lớn \(ΔElo: 1500\)/i)).toBeTruthy();
    expect(
      screen.getByTestId("confirm-start-match-btn").props.accessibilityState
        .disabled
    ).toBe(false);

    // Thử bấm nút VS đổi chéo 2 đội -> diff cập nhật lại ngay
    await fireEvent.press(screen.getByTestId("vs-cross-swap-btn"));
    expect(screen.queryByTestId("unbalanced-warning-banner")).toBeNull();

    await screen.unmount();
  });

  it("hỗ trợ chuyển giữa Sân 01 và Sân 02 trong kèo 2 sân và xác nhận kèo lưu vào MockRepository + chuyển màn chấm điểm", async () => {
    recordOnCourtTap("home", "CHIA KÈO SÂN 1 [CHẠM 1]");
    recordOnCourtTap("select", "XEM KÈO CÂN BẰNG [CHẠM 2]");
    const onConfirmed = jest.fn();

    const screen = await render(
      <AuthProvider>
        <BalanceConfirmScreen
          initialSessionId="session_tienson_05"
          initialCourtId="1"
          onMatchConfirmed={onConfirmed}
        />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("two-court-switcher")).toBeTruthy();
    });

    // Chuyển sang Sân 02 rồi quay lại Sân 01
    await fireEvent.press(screen.getByTestId("switch-court-2"));
    expect(screen.getByTestId("confirm-resting-section")).toBeTruthy(); // Sân 02 có 6 người -> có 2 người nghỉ
    await fireEvent.press(screen.getByTestId("switch-court-1"));

    // Xác nhận kèo (Chạm 3) -> lưu vào MockRepository và điều hướng sang /court/score
    await fireEvent.press(screen.getByTestId("confirm-start-match-btn"));
    await waitFor(() => {
      expect(onConfirmed).toHaveBeenCalledTimes(1);
    });

    const createdMatchId = onConfirmed.mock.calls[0][0] as string;
    const matchesAfter = await getRepository().listMatches("session_tienson_05");
    expect(matchesAfter.some((m) => m.id === createdMatchId)).toBe(true);

    expect(getTapCounterState().currentTaps).toBe(3);
    expect(mockPush).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: "/court/score",
        params: expect.objectContaining({
          matchId: createdMatchId,
          sessionId: "session_tienson_05",
        }),
      })
    );

    await screen.unmount();
  });

  it("hiệu năng chia kèo từ 4 đến 8 người dưới 1 giây (< 1000ms)", () => {
    const results: Record<number, number> = {};
    for (const n of [4, 5, 6, 7, 8]) {
      const members: BalancingMember[] = buildMembers(n).map((m) => ({
        id: m.memberId,
        name: m.displayName,
        gender: m.gender,
        rating: m.rating,
        position: m.position,
        dominantHand: m.dominantHand,
      }));
      const t0 = performance.now();
      const res = balanceCourt(members, {
        category: "men",
        mode: "rotate",
        targetMatches: n,
      });
      const dt = performance.now() - t0;
      results[n] = Math.round(dt * 1000) / 1000;
      expect(dt).toBeLessThan(1000);
      expect(res.matches.length).toBeGreaterThanOrEqual(1);
    }
    // Ghi log phục vụ đối chiếu số liệu thật trong docs/test/perf-notes.md
    console.log("[PERF_BENCHMARK_BALANCE_COURT_MS]", JSON.stringify(results));
  });
});

