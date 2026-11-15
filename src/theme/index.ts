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
