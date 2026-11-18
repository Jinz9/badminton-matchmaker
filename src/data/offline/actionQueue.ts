/**
 * Hàng đợi thao tác offline bền vững (AsyncStorage) kèm Idempotency,
 * Exponential Backoff và xử lý xung đột theo docs/api/offline-contract.md (Mục 5 & 6).
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { LockedPair, MatchSetScore, PostMatchCard } from "../../domain/types";
import { getRepository } from "../index";
import { OFFLINE_STORAGE_KEYS } from "./sessionSnapshot";

export type OfflineActionType =
  | "GENERATE_ROUND"
  | "SWAP_PLAYERS"
  | "SUBMIT_SCORE"
  | "CHECK_IN_PLAYER"
  | "FINISH_MATCH";

export interface QueuedAction<TPayload = unknown> {
  id: string;
  idempotencyKey: string;
  sessionId: string;
  courtId: string;
  actionType: OfflineActionType;
  clientTimestamp: number;
  localSequence: number;
  version: number;
  payload: TPayload;
  retryCount: number;
  nextRetryAt?: number;
  lastError?: string;
}

export interface ConflictNotice {
  actionId: string;
  actionType: OfflineActionType;
  code: "MATCH_ALREADY_SETTLED" | "VERSION_CONFLICT" | "USER_WITHDREW";
  message: string;
}

export interface ProcessQueueResult {
  syncedCount: number;
  remainingCount: number;
  skippedBackoffCount: number;
  conflicts: ConflictNotice[];
}

export type SyncActionExecutor = (action: QueuedAction) => Promise<void>;

const MAX_BACKOFF_MS = 30_000;
const BASE_BACKOFF_MS = 1_000;
const MAX_SYNCED_KEYS = 200;

let sequenceCounter = 0;

export function computeBackoffMs(retryCount: number): number {
  const safeCount = Math.max(0, retryCount);
  return Math.min(MAX_BACKOFF_MS, BASE_BACKOFF_MS * Math.pow(2, safeCount));
}

function generateId(): string {
  return `act_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

async function getActiveSessionIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(
      OFFLINE_STORAGE_KEYS.ACTIVE_SESSION_INDEX
    );
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

async function registerSessionId(sessionId: string): Promise<void> {
  const list = await getActiveSessionIds();
  if (!list.includes(sessionId)) {
    try {
      await AsyncStorage.setItem(
        OFFLINE_STORAGE_KEYS.ACTIVE_SESSION_INDEX,
        JSON.stringify([...list, sessionId])
      );
    } catch {
      // ignore
    }
  }
}

async function getSyncedIdempotencyKeys(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(
      OFFLINE_STORAGE_KEYS.SYNCED_IDEMPOTENCY_KEYS
    );
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

async function markIdempotencyKeySynced(key: string): Promise<void> {
  const keys = await getSyncedIdempotencyKeys();
  if (keys.includes(key)) return;
  const next = [...keys, key].slice(-MAX_SYNCED_KEYS);
  try {
    await AsyncStorage.setItem(
      OFFLINE_STORAGE_KEYS.SYNCED_IDEMPOTENCY_KEYS,
      JSON.stringify(next)
    );
  } catch {
    // ignore
  }
}

export async function getOfflineQueue(
  sessionId: string
): Promise<QueuedAction[]> {
  try {
    const raw = await AsyncStorage.getItem(
      OFFLINE_STORAGE_KEYS.OFFLINE_MUTATION_QUEUE(sessionId)
    );
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as QueuedAction[]) : [];
  } catch {
    return [];
  }
}

async function saveOfflineQueue(
  sessionId: string,
  queue: QueuedAction[]
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      OFFLINE_STORAGE_KEYS.OFFLINE_MUTATION_QUEUE(sessionId),
      JSON.stringify(queue)
    );
  } catch {
    // ignore
  }
}

export async function getTotalPendingActionsCount(): Promise<number> {
  const sessionIds = await getActiveSessionIds();
  let total = 0;
  for (const sid of sessionIds) {
    const q = await getOfflineQueue(sid);
    total += q.length;
  }
  return total;
}

export interface EnqueueActionInput<TPayload = unknown> {
  sessionId: string;
  courtId: string;
  actionType: OfflineActionType;
  version: number;
  payload: TPayload;
  idempotencyKey?: string;
  clientTimestamp?: number;
}

/**
 * Đưa một thao tác vào hàng đợi offline bền vững.
 * Nếu trùng idempotencyKey chưa đồng bộ, ghi đè payload mới nhất thay vì nhân đôi.
 */
export async function enqueueOfflineAction<TPayload = unknown>(
  input: EnqueueActionInput<TPayload>
): Promise<QueuedAction<TPayload>[]> {
  await registerSessionId(input.sessionId);
  const ts = input.clientTimestamp ?? Date.now();
  const idempotencyKey =
    input.idempotencyKey ??
    `${input.actionType}_${input.sessionId}_${input.courtId}_${ts}`;

  const syncedKeys = await getSyncedIdempotencyKeys();
  const current = await getOfflineQueue(input.sessionId);
  if (syncedKeys.includes(idempotencyKey)) {
    return current as QueuedAction<TPayload>[];
  }

  sequenceCounter += 1;
  const entry: QueuedAction<TPayload> = {
    id: generateId(),
    idempotencyKey,
    sessionId: input.sessionId,
    courtId: input.courtId,
    actionType: input.actionType,
    clientTimestamp: ts,
    localSequence: sequenceCounter,
    version: input.version,
    payload: input.payload,
    retryCount: 0,
  };

  // Tránh trùng khóa idempotent đang chờ trong hàng đợi
  const filtered = current.filter(
    (item) => item.idempotencyKey !== idempotencyKey
  );
  const next = [...filtered, entry];
  await saveOfflineQueue(input.sessionId, next);
  return next as QueuedAction<TPayload>[];
}

export async function removeActionFromQueue(
  sessionId: string,
  actionId: string
): Promise<QueuedAction[]> {
  const current = await getOfflineQueue(sessionId);
  const next = current.filter((a) => a.id !== actionId);
  await saveOfflineQueue(sessionId, next);
  return next;
}

function classifyConflict(err: unknown): ConflictNotice["code"] | null {
  if (!err || typeof err !== "object") return null;
  const code = String((err as { code?: unknown }).code ?? "");
  const message = String((err as { message?: unknown }).message ?? "");

  if (
    message.includes("MATCH_ALREADY_SETTLED") ||
    message.includes("Idempotent Block") ||
    message.includes("đã được xác nhận kết quả")
  ) {
    return "MATCH_ALREADY_SETTLED";
  }
  if (message.includes("USER_WITHDREW") || message.includes("hủy kèo")) {
    return "USER_WITHDREW";
  }
  if (
    code === "failed-precondition" ||
    message.includes("CONFLICT") ||
    message.includes("version")
  ) {
    return "VERSION_CONFLICT";
  }
  return null;
}

export async function defaultSyncActionExecutor(
  action: QueuedAction
): Promise<void> {
  const repo = getRepository();
  const payload = action.payload as Record<string, unknown>;

  if (action.actionType === "GENERATE_ROUND") {
    const teamA = payload.teamA as [string, string] | undefined;
    const teamB = payload.teamB as [string, string] | undefined;
    if (teamA && teamB) {
      await repo.createMatch({
        sessionId: action.sessionId,
        courtId: action.courtId,
        index: Number(payload.roundIndex ?? 1),
        category: (payload.category as "men" | "women" | "mixed") ?? "mixed",
        teamA,
        teamB,
        sets: [],
        cards: [],
      });
    }
    return;
  }

  if (action.actionType === "SWAP_PLAYERS") {
    const pairs = payload.pairs as LockedPair[] | undefined;
    if (pairs) {
      await repo.updateLockedPairs(action.sessionId, action.courtId, pairs);
    }
    return;
  }

  if (action.actionType === "SUBMIT_SCORE") {
    const matchId = String(payload.matchId ?? "");
    const sets = (payload.sets as MatchSetScore[]) ?? [];
    if (matchId) {
      await repo.saveMatchScore(matchId, sets);
    }
    return;
  }

  if (action.actionType === "FINISH_MATCH") {
    const matchId = String(payload.matchId ?? "");
    const hostId = String(payload.hostId ?? "");
    const sets = (payload.sets as MatchSetScore[]) ?? [];
    const cards = (payload.cards as PostMatchCard[]) ?? [];
    if (matchId) {
      await repo.saveMatchScore(matchId, sets);
      await repo.confirmMatchResult(matchId, hostId, cards);
    }
  }
}

export interface ProcessQueueOptions {
  now?: number;
  force?: boolean;
  executor?: SyncActionExecutor;
}

/**
 * Xử lý đồng bộ hàng đợi FIFO cho một buổi đánh khi có mạng.
 * - Kiểm tra idempotencyKey để không gửi 2 lần
 * - Áp dụng exponential backoff khi lỗi mạng tạm thời
 * - Xử lý xung đột theo quy tắc Host-Authority của TV1
 */
export async function processOfflineQueue(
  sessionId: string,
  options: ProcessQueueOptions = {}
): Promise<ProcessQueueResult> {
  const now = options.now ?? Date.now();
  const executor = options.executor ?? defaultSyncActionExecutor;
  const queue = await getOfflineQueue(sessionId);

  if (queue.length === 0) {
    return {
      syncedCount: 0,
      remainingCount: 0,
      skippedBackoffCount: 0,
      conflicts: [],
    };
  }

  const syncedKeys = await getSyncedIdempotencyKeys();
  const workingQueue = [...queue];
  let syncedCount = 0;
  let skippedBackoffCount = 0;
  const conflicts: ConflictNotice[] = [];

  for (let i = 0; i < workingQueue.length; i += 1) {
    const action = workingQueue[i];

    // Đã đồng bộ trước đó -> bỏ qua và xóa khỏi queue (Idempotent)
    if (syncedKeys.includes(action.idempotencyKey)) {
      workingQueue.splice(i, 1);
      i -= 1;
      continue;
    }

    // Chưa tới hạn backoff -> dừng đợt sync FIFO hoặc bỏ qua
    if (!options.force && action.nextRetryAt && action.nextRetryAt > now) {
      skippedBackoffCount += 1;
      continue;
    }

    try {
      await executor(action);
      await markIdempotencyKeySynced(action.idempotencyKey);
      workingQueue.splice(i, 1);
      i -= 1;
      syncedCount += 1;
    } catch (err) {
      const conflictCode = classifyConflict(err);
      if (conflictCode) {
        const message =
          conflictCode === "MATCH_ALREADY_SETTLED"
            ? "Trận đấu đã được chốt Elo trước đó trên máy chủ (đã bỏ qua thao tác trùng)."
            : conflictCode === "USER_WITHDREW"
              ? "Có thành viên đã hủy kèo trực tuyến trước khi đồng bộ, vui lòng kiểm tra lại cặp đấu."
              : "Phiên bản sân trên máy chủ đã thay đổi, hệ thống giữ quyền Host và bỏ qua bản ghi cũ.";
        conflicts.push({
          actionId: action.id,
          actionType: action.actionType,
          code: conflictCode,
          message,
        });
        workingQueue.splice(i, 1);
        i -= 1;
      } else {
        // Lỗi mạng tạm thời -> tăng retryCount, đặt nextRetryAt theo backoff và dừng FIFO
        const nextRetry = action.retryCount + 1;
        const delayMs = computeBackoffMs(action.retryCount);
        workingQueue[i] = {
          ...action,
          retryCount: nextRetry,
          nextRetryAt: now + delayMs,
          lastError: err instanceof Error ? err.message : String(err),
        };
        break;
      }
    }
  }

  await saveOfflineQueue(sessionId, workingQueue);

  return {
    syncedCount,
    remainingCount: workingQueue.length,
    skippedBackoffCount,
    conflicts,
  };
}

export async function processAllOfflineQueues(
  options: ProcessQueueOptions = {}
): Promise<ProcessQueueResult> {
  const sessionIds = await getActiveSessionIds();
  let syncedCount = 0;
  let remainingCount = 0;
  let skippedBackoffCount = 0;
  const conflicts: ConflictNotice[] = [];

  for (const sid of sessionIds) {
    const res = await processOfflineQueue(sid, options);
    syncedCount += res.syncedCount;
    remainingCount += res.remainingCount;
    skippedBackoffCount += res.skippedBackoffCount;
    conflicts.push(...res.conflicts);
  }

  return { syncedCount, remainingCount, skippedBackoffCount, conflicts };
}

export async function clearOfflineQueue(sessionId: string): Promise<void> {
  await saveOfflineQueue(sessionId, []);
}
