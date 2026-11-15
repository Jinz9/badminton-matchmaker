import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

export type HapticPattern =
  | "selectPlayer"
  | "selection"
  | "swapTeam"
  | "scorePoint"
  | "success"
  | "warning"
  | "error";

let globalHapticsEnabled = true;

/** Bật hoặc tắt phản hồi xúc giác toàn cục (ví dụ trong Cài đặt người dùng) */
export function setGlobalHapticsEnabled(enabled: boolean): void {
  globalHapticsEnabled = enabled;
}

/** Đọc trạng thái phản hồi xúc giác toàn cục hiện tại */
export function isGlobalHapticsEnabled(): boolean {
  return globalHapticsEnabled;
}

/**
 * Kích hoạt phản hồi xúc giác (Haptics) an toàn trên iOS/Android/Web/Jest.
 * @param pattern Loại thao tác tại sân (chọn người, đổi chỗ, chấm điểm...)
 * @param enabled Cho phép ghi đè tắt/bật theo từng component
 */
export async function triggerHaptic(
  pattern: HapticPattern,
  enabled: boolean = true
): Promise<void> {
  if (!globalHapticsEnabled || !enabled) return;
  if (Platform.OS === "web") return;

  try {
    switch (pattern) {
      case "selectPlayer":
      case "selection":
        await Haptics.selectionAsync();
        break;
      case "scorePoint":
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case "swapTeam":
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case "success":
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case "warning":
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case "error":
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
    }
  } catch {
    // Bỏ qua an toàn trên thiết bị/simulator không hỗ trợ Taptic Engine
  }
}

