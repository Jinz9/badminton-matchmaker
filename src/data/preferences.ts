import AsyncStorage from "@react-native-async-storage/async-storage";
import { PlayCategoryPref } from "./onboarding";

/**
 * Tùy chọn cục bộ của người chơi (không thuộc Data Contract v1.0).
 * "Nội dung đánh" ưa thích (đôi nam / đôi nữ / đôi nam nữ) lưu tại máy để gợi ý bộ lọc kèo & tìm đồng đội.
 * CR-03 đề xuất: nếu TV1 muốn lưu lên Firestore cần thêm trường vào UserProfile.
 */
const key = (uid: string) => `@badminton/pref_category_${uid}`;

export async function savePlayCategoryPref(uid: string, value: PlayCategoryPref): Promise<void> {
  try {
    await AsyncStorage.setItem(key(uid), value);
  } catch {
    // bỏ qua nếu không ghi được
  }
}

export async function loadPlayCategoryPref(uid: string): Promise<PlayCategoryPref | null> {
  try {
    const v = await AsyncStorage.getItem(key(uid));
    return v === "men" || v === "women" || v === "mixed" ? v : null;
  } catch {
    return null;
  }
}

