import { useFonts } from "expo-font";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from "@expo-google-fonts/inter";

export * from "./colors";
export * from "./typography";
export * from "./spacing";
export * from "./shadows";
export { triggerHaptic } from "../utils/haptics";

/** Lấy tối đa 2 chữ cái đầu từ tên người Việt (ví dụ "Hoàng Anh" -> "HA") */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/**
 * Tải bộ font Inter bằng expo-font khi khởi động ứng dụng.
 * Trả về [loaded, error] để layout có thể hiển thị ngay bằng font hệ thống
 * và tự nâng cấp sang Inter khi tải xong.
 */
export function useThemeFonts(): [boolean, Error | null] {
  return useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });
}
