import { useCallback, useEffect, useRef, useState } from "react";
import { getRepository } from "../data";
import {
  ConflictNotice,
  getNetworkMonitorState,
  getTotalPendingActionsCount,
  processAllOfflineQueues,
  setSimulatedOffline as persistSimulatedOffline,
  subscribeNetworkMonitor,
} from "../data/offline";
import {
  getPendingMatchResults,
  removePendingMatchResult,
} from "../data/offlineMatchQueue";

export interface OfflineSyncState {
  isOnline: boolean;
  realConnected: boolean;
  simulatedOffline: boolean;
  pendingCount: number;
  syncing: boolean;
  lastConflict: ConflictNotice | null;
  setSimulatedOffline: (value: boolean) => Promise<void>;
  refreshPendingCount: () => Promise<number>;
  syncNow: () => Promise<void>;
}

export function useOfflineSync(): OfflineSyncState {
  const initialNet = getNetworkMonitorState();
  const [isOnline, setIsOnline] = useState(initialNet.isOnline);
  const [realConnected, setRealConnected] = useState(initialNet.realConnected);
  const [simulatedOffline, setSimulatedOfflineState] = useState(
    initialNet.simulatedOffline
  );
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [lastConflict, setLastConflict] = useState<ConflictNotice | null>(null);
  const prevOnlineRef = useRef(initialNet.isOnline);
  const syncingRef = useRef(false);

  const refreshPendingCount = useCallback(async (): Promise<number> => {
    const [queueCount, matchPending] = await Promise.all([
      getTotalPendingActionsCount(),
      getPendingMatchResults(),
    ]);
    const total = queueCount + matchPending.length;
    setPendingCount(total);
    return total;
  }, []);

  const syncNow = useCallback(async () => {
    if (syncingRef.current) return;
    if (!getNetworkMonitorState().isOnline) return;

    syncingRef.current = true;
    setSyncing(true);
    try {
      const queueRes = await processAllOfflineQueues({ force: true });
      if (queueRes.conflicts.length > 0) {
        setLastConflict(queueRes.conflicts[queueRes.conflicts.length - 1]);
      }

      // Đồng bộ thêm hàng đợi kết quả trận cũ (offlineMatchQueue) nếu có
      const pendingMatches = await getPendingMatchResults();
      const repo = getRepository();
      for (const item of pendingMatches) {
        try {
          await repo.saveMatchScore(item.matchId, item.sets);
          await repo.confirmMatchResult(item.matchId, item.hostId, item.cards);
          await removePendingMatchResult(item.matchId);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "";
          if (msg.includes("Idempotent Block") || msg.includes("đã được xác nhận")) {
            await removePendingMatchResult(item.matchId);
          } else {
            break;
          }
        }
      }
    } finally {
      syncingRef.current = false;
      setSyncing(false);
      await refreshPendingCount();
    }
  }, [refreshPendingCount]);

  useEffect(() => {
    void refreshPendingCount();
    const unsub = subscribeNetworkMonitor((state) => {
      setIsOnline(state.isOnline);
      setRealConnected(state.realConnected);
      setSimulatedOfflineState(state.simulatedOffline);
      if (!prevOnlineRef.current && state.isOnline) {
        void syncNow();
      }
      prevOnlineRef.current = state.isOnline;
    });
    return unsub;
  }, [refreshPendingCount, syncNow]);

  const setSimulatedOffline = useCallback(
    async (value: boolean) => {
      await persistSimulatedOffline(value);
      await refreshPendingCount();
    },
    [refreshPendingCount]
  );

  return {
    isOnline,
    realConnected,
    simulatedOffline,
    pendingCount,
    syncing,
    lastConflict,
    setSimulatedOffline,
    refreshPendingCount,
    syncNow,
  };
}
