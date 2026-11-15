/**
 * Bộ đếm thao tác chạm tại sân (Tối đa 3 chạm từ Home đến phương án chia kèo)
 * Dùng cho Field Test (Q15) và hiển thị trực tiếp trong màn hình /dev/ui-kit.
 */

export const MAX_TAPS_TO_BALANCE = 3;

export interface TapRecord {
  tapNumber: number;
  screen: "home" | "select" | "confirm";
  actionLabel: string;
  timestamp: string;
}

export interface TapCounterState {
  currentTaps: number;
  maxAllowedTaps: number;
  withinTarget: boolean;
  history: TapRecord[];
}

type TapListener = (state: TapCounterState) => void;

let currentTaps = 0;
let history: TapRecord[] = [];
const listeners = new Set<TapListener>();

function buildState(): TapCounterState {
  return {
    currentTaps,
    maxAllowedTaps: MAX_TAPS_TO_BALANCE,
    withinTarget: currentTaps <= MAX_TAPS_TO_BALANCE,
    history: [...history],
  };
}

function notify() {
  const snapshot = buildState();
  listeners.forEach((cb) => cb(snapshot));
}

export function getTapCounterState(): TapCounterState {
  return buildState();
}

/**
 * Ghi nhận 1 chạm trong luồng 3 chạm tại sân:
 * - Chạm 1 (Home): Bấm "CHIA KÈO SÂN 1 [CHẠM 1]"
 * - Chạm 2 (Select): Bấm "XEM KÈO CÂN BẰNG [CHẠM 2]"
 * - Chạm 3 (Confirm): Bấm "VÀO SÂN NGAY [CHẠM 3]"
 */
export function recordOnCourtTap(
  screen: "home" | "select" | "confirm",
  actionLabel: string
): TapCounterState {
  if (screen === "home") {
    currentTaps = 1;
    history = [
      {
        tapNumber: 1,
        screen,
        actionLabel,
        timestamp: new Date().toISOString(),
      },
    ];
  } else {
    currentTaps += 1;
    history = [
      ...history,
      {
        tapNumber: currentTaps,
        screen,
        actionLabel,
        timestamp: new Date().toISOString(),
      },
    ];
  }
  notify();
  return buildState();
}

export function resetTapCounter(): TapCounterState {
  currentTaps = 0;
  history = [];
  notify();
  return buildState();
}

export function subscribeTapCounter(listener: TapListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

