import { useCallback, useEffect, useState } from "react";
import { getRepository } from "../data";
import { JoinRequestResult } from "../domain/repositories";
import {
  CourtDoc,
  JoinRequestDoc,
  MatchDoc,
  SessionDoc,
} from "../domain/types";

export interface UseSessionResult {
  session: SessionDoc | null;
  courts: CourtDoc[];
  requests: JoinRequestDoc[];
  matches: MatchDoc[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  joinCourt: (
    courtId: string,
    userId: string,
    note?: string
  ) => Promise<JoinRequestResult>;
  cancelJoin: (
    courtId: string,
    userId: string
  ) => Promise<{ penalty: number; promotedUser?: string }>;
  reviewRequest: (
    courtId: string,
    requestId: string,
    action: "approve" | "decline"
  ) => Promise<void>;
}

/** Hook quản lý chi tiết 1 phòng kèo (1-2 sân, đơn xin vào, waitlist, trận đấu) với realtime subscribe */
export function useSession(sessionId: string | null | undefined): UseSessionResult {
  const [session, setSession] = useState<SessionDoc | null>(null);
  const [courts, setCourts] = useState<CourtDoc[]>([]);
  const [requests, setRequests] = useState<JoinRequestDoc[]>([]);
  const [matches, setMatches] = useState<MatchDoc[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(sessionId));
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!sessionId) {
      setSession(null);
      setCourts([]);
      setRequests([]);
      setMatches([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const repo = getRepository();
      const [sessionDoc, courtList, matchList] = await Promise.all([
        repo.getSessionById(sessionId),
        repo.listCourtsBySession(sessionId),
        repo.listMatches(sessionId),
      ]);
      const reqLists = await Promise.all(
        courtList.map((c) => repo.listRequestsByCourt(sessionId, c.id))
      );
      setSession(sessionDoc);
      setCourts(courtList);
      setMatches(matchList);
      setRequests(reqLists.flat());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải thông tin phòng kèo.");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    void refresh();
    if (!sessionId) return;
    const repo = getRepository();
    const unsubSession = repo.subscribe<SessionDoc[]>("sessions", (all) => {
      const found = all.find((s) => s.id === sessionId && !s.isDeleted) ?? null;
      if (found) {
        setSession(found);
        setLoading(false);
      }
    });
    const unsubCourts = repo.subscribe<CourtDoc[]>("courts", (all) => {
      const filtered = all
        .filter((c) => c.sessionId === sessionId)
        .sort((a, b) => a.courtNumber - b.courtNumber);
      setCourts(filtered);
      if (filtered.length > 0) {
        setLoading(false);
      }
    });
    const unsubRequests = repo.subscribe<JoinRequestDoc[]>("requests", (all) => {
      setRequests(all.filter((r) => r.sessionId === sessionId));
    });
    const unsubMatches = repo.subscribe<MatchDoc[]>("matches", (all) => {
      setMatches(all.filter((m) => m.sessionId === sessionId));
    });

    return () => {
      unsubSession();
      unsubCourts();
      unsubRequests();
      unsubMatches();
    };
  }, [sessionId, refresh]);

  const joinCourt = useCallback(
    async (courtId: string, userId: string, note?: string) => {
      if (!sessionId) throw new Error("Thiếu mã phòng kèo.");
      setError(null);
      try {
        return await getRepository().submitJoinRequest(
          sessionId,
          courtId,
          userId,
          note
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Không thể gửi đơn tham gia.";
        setError(msg);
        throw err;
      }
    },
    [sessionId]
  );

  const cancelJoin = useCallback(
    async (courtId: string, userId: string) => {
      if (!sessionId) throw new Error("Thiếu mã phòng kèo.");
      setError(null);
      try {
        return await getRepository().cancelParticipation(sessionId, courtId, userId);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Không thể hủy tham gia.";
        setError(msg);
        throw err;
      }
    },
    [sessionId]
  );

  const reviewRequest = useCallback(
    async (courtId: string, requestId: string, action: "approve" | "decline") => {
      if (!sessionId) throw new Error("Thiếu mã phòng kèo.");
      setError(null);
      try {
        await getRepository().reviewRequest(sessionId, courtId, requestId, action);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Không thể xử lý đơn tham gia.";
        setError(msg);
        throw err;
      }
    },
    [sessionId]
  );

  return {
    session,
    courts,
    requests,
    matches,
    loading,
    error,
    refresh,
    joinCourt,
    cancelJoin,
    reviewRequest,
  };
}

