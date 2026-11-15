import { useCallback, useEffect, useState } from "react";
import { getRepository } from "../data";
import { PartnerSearchOptions } from "../domain/repositories";
import { BestPartnerStat, UserProfile } from "../domain/types";

export interface PartnerCandidate {
  user: UserProfile;
  compatibilityScore: number;
  reason: string;
}

export interface UsePartnersResult {
  candidates: PartnerCandidate[];
  bestPartners: BestPartnerStat[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/** Hook tìm đồng đội ăn ý & thống kê đồng đội hay đánh cùng */
export function usePartners(
  userId: string | null | undefined,
  options?: PartnerSearchOptions
): UsePartnersResult {
  const [candidates, setCandidates] = useState<PartnerCandidate[]>([]);
  const [bestPartners, setBestPartners] = useState<BestPartnerStat[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  const optionsKey = JSON.stringify(options ?? {});

  const refresh = useCallback(async () => {
    if (!userId) {
      setCandidates([]);
      setBestPartners([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const repo = getRepository();
      const parsedOptions = JSON.parse(optionsKey) as PartnerSearchOptions;
      const [found, best] = await Promise.all([
        repo.searchCompatiblePartners(userId, parsedOptions),
        repo.listBestPartners(userId),
      ]);
      setCandidates(found);
      setBestPartners(best);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tìm đồng đội.");
    } finally {
      setLoading(false);
    }
  }, [userId, optionsKey]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { candidates, bestPartners, loading, error, refresh };
}

