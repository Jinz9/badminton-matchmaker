import { useCallback, useEffect, useState } from "react";
import { getRepository } from "../data";
import { SessionFilterOptions } from "../domain/repositories";
import { SessionDoc } from "../domain/types";

export interface UseLobbiesResult {
  sessions: SessionDoc[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

function applySessionFilter(
  list: SessionDoc[],
  filter?: SessionFilterOptions
): SessionDoc[] {
  let result = list.filter((s) => !s.isDeleted);
  if (filter?.district) {
    result = result.filter((s) => s.district === filter.district);
  }
  if (filter?.category) {
    result = result.filter((s) =>
      s.courtSummaries.some((c) => c.category === filter.category)
    );
  }
  if (typeof filter?.userLevel === "number") {
    const lvl = filter.userLevel;
    result = result.filter((s) =>
      s.courtSummaries.some((c) => lvl >= c.levelMin && lvl <= c.levelMax)
    );
  }
  if (filter?.onlyOpenSlots) {
    result = result.filter((s) => s.openSlotsTotal > 0 && s.status === "open");
  }
  if (filter?.fromDate) {
    result = result.filter((s) => s.startsAt >= filter.fromDate!);
  }
  result.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  if (filter?.limit) {
    result = result.slice(0, filter.limit);
  }
  return result;
}

/** Hook lấy danh sách kèo và tự động cập nhật realtime khi số suất thay đổi */
export function useLobbies(filter?: SessionFilterOptions): UseLobbiesResult {
  const [sessions, setSessions] = useState<SessionDoc[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const filterKey = JSON.stringify(filter ?? {});

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const parsedFilter = JSON.parse(filterKey) as SessionFilterOptions;
      const data = await getRepository().listSessions(parsedFilter);
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách kèo.");
    } finally {
      setLoading(false);
    }
  }, [filterKey]);

  useEffect(() => {
    void refresh();
    const parsedFilter = JSON.parse(filterKey) as SessionFilterOptions;
    const unsub = getRepository().subscribe<SessionDoc[]>("sessions", (all) => {
      setSessions(applySessionFilter(all, parsedFilter));
    });
    return unsub;
  }, [filterKey, refresh]);

  return { sessions, loading, error, refresh };
}

