import { useCallback, useState } from "react";
import {
  HapticPattern,
  isGlobalHapticsEnabled,
  setGlobalHapticsEnabled,
  triggerHaptic,
} from "../utils/haptics";

export interface UseHapticsResult {
  /** Trạng thái đang bật hay tắt rung xúc giác */
  enabled: boolean;
  /** Bật/tắt rung xúc giác toàn cục */
  setEnabled: (next: boolean) => void;
  /** Kích hoạt rung theo ngữ cảnh */
  trigger: (pattern: HapticPattern) => void;
}

/** Hook quản lý phản hồi xúc giác (Haptics) cho màn hình tại sân */
export function useHaptics(initialEnabled?: boolean): UseHapticsResult {
  const [enabled, setEnabledState] = useState<boolean>(
    initialEnabled ?? isGlobalHapticsEnabled()
  );

  const setEnabled = useCallback((next: boolean) => {
    setGlobalHapticsEnabled(next);
    setEnabledState(next);
  }, []);

  const trigger = useCallback(
    (pattern: HapticPattern) => {
      void triggerHaptic(pattern, enabled);
    },
    [enabled]
  );

  return { enabled, setEnabled, trigger };
}

