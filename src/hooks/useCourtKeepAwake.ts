import { useEffect } from "react";

/**
 * Giữ màn hình luôn sáng khi Host đang chia kèo hoặc chấm điểm tại sân.
 * Bọc an toàn để không lỗi trong môi trường Jest / Web không có native module.
 */
export function useCourtKeepAwake(tag = "badminton-on-court"): void {
  useEffect(() => {
    let keepAwake: typeof import("expo-keep-awake") | null = null;
    try {
      keepAwake = require("expo-keep-awake") as typeof import("expo-keep-awake");
      void keepAwake.activateKeepAwakeAsync?.(tag);
    } catch {
      // Bỏ qua trong môi trường test
    }

    return () => {
      try {
        void keepAwake?.deactivateKeepAwake?.(tag);
      } catch {
        // ignore
      }
    };
  }, [tag]);
}
