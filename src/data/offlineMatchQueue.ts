import AsyncStorage from "@react-native-async-storage/async-storage";
import { MatchSetScore, PostMatchCard } from "../domain/types";

const DRAFT_KEY_PREFIX = "@badminton_match_draft_v1_";
const OFFLINE_QUEUE_KEY = "@badminton_offline_match_queue_v1";

export interface ScoreHistoryEntry {
  setIndex: number;
  team: "A" | "B";
}

export interface MatchScoreDraft {
  matchId: string;
  sets: MatchSetScore[];
  activeSetIndex: number;
  history: ScoreHistoryEntry[];
  shuttleCount: number;
  elapsedSeconds: number;
  updatedAt: string;
}

export interface PendingMatchResultItem {
  matchId: string;
  hostId: string;
  sets: MatchSetScore[];
  cards: PostMatchCard[];
  queuedAt: string;
}

/**
 * Lưu nháp tỷ số trận đấu vào AsyncStorage để không mất điểm khi xoay máy hoặc app vào nền.
 */
export async function saveMatchDraft(draft: MatchScoreDraft): Promise<void> {
  try {
    await AsyncStorage.setItem(
      `${DRAFT_KEY_PREFIX}${draft.matchId}`,
      JSON.stringify(draft)
    );
  } catch {
    // Bỏ qua lỗi storage cục bộ để không gián đoạn thao tác chấm điểm trên sân
  }
}

/**
 * Đọc nháp tỷ số trận đấu đã lưu cục bộ.
 */
export async function loadMatchDraft(
  matchId: string
): Promise<MatchScoreDraft | null> {
  try {
    const raw = await AsyncStorage.getItem(`${DRAFT_KEY_PREFIX}${matchId}`);
    if (!raw) return null;
    return JSON.parse(raw) as MatchScoreDraft;
  } catch {
    return null;
  }
}

/**
 * Xóa nháp tỷ số sau khi trận đã chốt thành công.
 */
export async function clearMatchDraft(matchId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(`${DRAFT_KEY_PREFIX}${matchId}`);
  } catch {
    // ignore
  }
}

/**
 * Đọc danh sách kết quả trận đang chờ đồng bộ offline (cho Q12).
 */
export async function getPendingMatchResults(): Promise<
  PendingMatchResultItem[]
> {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PendingMatchResultItem[]) : [];
  } catch {
    return [];
  }
}

/**
 * Đưa kết quả trận vào hàng đợi offline khi mất mạng hoặc lỗi gửi.
 */
export async function enqueuePendingMatchResult(
  item: PendingMatchResultItem
): Promise<PendingMatchResultItem[]> {
  const current = await getPendingMatchResults();
  const filtered = current.filter((x) => x.matchId !== item.matchId);
  const next = [...filtered, item];
  try {
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
}

/**
 * Xóa 1 trận khỏi hàng đợi offline sau khi đồng bộ thành công.
 */
export async function removePendingMatchResult(
  matchId: string
): Promise<PendingMatchResultItem[]> {
  const current = await getPendingMatchResults();
  const next = current.filter((x) => x.matchId !== matchId);
  try {
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
}

