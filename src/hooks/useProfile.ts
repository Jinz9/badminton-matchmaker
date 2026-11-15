import { useCallback, useEffect, useState } from "react";
import { getRepository } from "../data";
import { calculatePersonalStats } from "../domain/history/statsCalculation";
import { PersonalStatsSummary } from "../domain/history/types";
import { RatingHistoryDoc, UserProfile } from "../domain/types";

export interface UseProfileResult {
  profile: UserProfile | null;
  ratingHistory: RatingHistoryDoc[];
  /** Thống kê (tỷ lệ thắng...) tính bằng hàm thuần của TV1 */
  stats: PersonalStatsSummary | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateProfile: (
    data: Partial<Omit<UserProfile, "uid" | "role" | "skill">>
  ) => Promise<void>;
}

/** Hook đọc/cập nhật hồ sơ người chơi, lịch sử Elo và thống kê */
export function useProfile(uid: string | null | undefined): UseProfileResult {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ratingHistory, setRatingHistory] = useState<RatingHistoryDoc[]>([]);
  const [stats, setStats] = useState<PersonalStatsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(uid));
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!uid) {
      setProfile(null);
      setRatingHistory([]);
      setStats(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const repo = getRepository();
      const [userDoc, history, matches] = await Promise.all([
        repo.getProfile(uid),
        repo.getUserRatingHistory(uid, 20),
        repo.getUserMatches(uid),
      ]);
      setProfile(userDoc);
      setRatingHistory(history);
      setStats(calculatePersonalStats(uid, matches, history));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải hồ sơ người chơi.");
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    void refresh();
    if (!uid) return;
    const repo = getRepository();
    const unsub = repo.subscribe<UserProfile[]>("users", (users) => {
      const found = users.find((u) => u.uid === uid && !u.isDeleted) ?? null;
      if (found) setProfile(found);
    });
    return unsub;
  }, [uid, refresh]);

  const updateProfile = useCallback(
    async (data: Partial<Omit<UserProfile, "uid" | "role" | "skill">>) => {
      if (!uid) return;
      setError(null);
      try {
        await getRepository().updateProfile(uid, data);
        await refresh();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Cập nhật hồ sơ thất bại.";
        setError(msg);
        throw err;
      }
    },
    [uid, refresh]
  );

  return { profile, ratingHistory, stats, loading, error, refresh, updateProfile };
}
