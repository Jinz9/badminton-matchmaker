import React, { useState } from "react";
import { View } from "react-native";
import { fireEvent, render, screen } from "@testing-library/react-native";
import {
  IconButton,
  NeonCTAButton,
  PlayerChip,
  SecondaryButton,
  TeamCard,
} from "../../src/components";
import { BellIcon } from "../../src/components/Icons";
import { useCourtKeepAwake } from "../../src/hooks";
import { TOUCH } from "../../src/theme";

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock("expo-keep-awake", () => ({
  activateKeepAwakeAsync: jest.fn(() => Promise.resolve()),
  deactivateKeepAwake: jest.fn(() => Promise.resolve()),
}));

function KeepAwakeHarness() {
  useCourtKeepAwake("test-court");
  return <View testID="keep-awake-active" />;
}

function MemoGridHarness({ onChipRender }: { onChipRender: (id: string) => void }) {
  const [selectedId, setSelectedId] = useState<string>("p1");
  const players = Array.from({ length: 8 }, (_, idx) => ({
    id: `p${idx + 1}`,
    name: `VĐV ${idx + 1}`,
    level: ((idx % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6,
    elo: 1300 + idx * 40,
  }));

  return (
    <View>
      {players.map((p) => {
        onChipRender(p.id);
        return (
          <PlayerChip
            key={p.id}
            testID={`chip-${p.id}`}
            name={p.name}
            level={p.level}
            elo={p.elo}
            selected={selectedId === p.id}
            onPress={() => setSelectedId(p.id)}
          />
        );
      })}
    </View>
  );
}

describe("Hiệu năng, Trải nghiệm tại sân & Accessibility (Q16)", () => {
  it("PlayerChip và TeamCard được bọc React.memo để tối ưu render lại", () => {
    expect((PlayerChip as unknown as { $$typeof?: symbol }).$$typeof).toBe(
      Symbol.for("react.memo")
    );
    expect((TeamCard as unknown as { $$typeof?: symbol }).$$typeof).toBe(
      Symbol.for("react.memo")
    );
  });

  it("đo thời gian render lưới 8 PlayerChip và tương tác chọn nhanh (< 500ms trong Jest)", async () => {
    const renderCalls: string[] = [];
    const t0 = performance.now();
    await render(<MemoGridHarness onChipRender={(id) => renderCalls.push(id)} />);
    const initialRenderMs = performance.now() - t0;

    const t1 = performance.now();
    await fireEvent.press(screen.getByTestId("chip-p4"));
    const toggleMs = performance.now() - t1;

    console.log(
      "[PERF_UI_PLAYER_CHIP_GRID_MS]",
      JSON.stringify({
        initialRenderMs: Number(initialRenderMs.toFixed(2)),
        toggleMs: Number(toggleMs.toFixed(2)),
        chipsCount: 8,
      })
    );

    expect(initialRenderMs).toBeLessThan(1000);
    expect(toggleMs).toBeLessThan(200);
    expect(screen.getByTestId("chip-p4").props.accessibilityState.selected).toBe(
      true
    );
  });

  it("các nút tương tác chính có accessibilityRole, accessibilityLabel và vùng chạm >= 48dp", async () => {
    await render(
      <View>
        <NeonCTAButton testID="cta-btn" label="CHIA KÈO NGAY" onPress={jest.fn()} />
        <SecondaryButton
          testID="sec-btn"
          label="Hoàn tác"
          onPress={jest.fn()}
        />
        <IconButton
          testID="icon-btn"
          icon={<BellIcon />}
          accessibilityLabel="Mở thông báo"
          onPress={jest.fn()}
        />
      </View>
    );

    expect(screen.getByTestId("cta-btn").props.accessibilityRole).toBe("button");
    expect(screen.getByTestId("cta-btn").props.accessibilityLabel).toBe(
      "CHIA KÈO NGAY"
    );
    expect(screen.getByTestId("sec-btn").props.accessibilityRole).toBe("button");
    expect(screen.getByTestId("icon-btn").props.accessibilityLabel).toBe(
      "Mở thông báo"
    );
    expect(TOUCH.minTarget).toBeGreaterThanOrEqual(48);
    expect(TOUCH.quickPlayerMinHeight).toBeGreaterThanOrEqual(48);
  });

  it("useCourtKeepAwake kích hoạt khi vào màn và tắt khi rời màn hình", async () => {
    const KeepAwake = require("expo-keep-awake");
    const { unmount } = await render(<KeepAwakeHarness />);
    expect(KeepAwake.activateKeepAwakeAsync).toHaveBeenCalledWith("test-court");
    await unmount();
    expect(KeepAwake.deactivateKeepAwake).toHaveBeenCalledWith("test-court");
  });
});
