/**
 * Lưu trữ cục bộ Snapshot buổi đánh hiện tại (AsyncStorage)
 * Tuân thủ hợp đồng docs/api/offline-contract.md (Mục 2).
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { CourtDoc, MatchDoc, MatchSetScore, SessionDoc } from "../../domain/types";

export const OFFLINE_STORAGE_KEYS = {
  SESSION_SNAPSHOT: (sessionId: string) =>
    `@badminton/session_snapshot_${sessionId}`,
  OFFLINE_MUTATION_QUEUE: (sessionId: string) =>
    `@badminton/mutation_queue_${sessionId}`,
  NETWORK_STATUS: "@badminton/network_status",
  SIMULATED_OFFLINE: "@badminton/simulated_offline_v1",
  SYNCED_IDEMPOTENCY_KEYS: "@badminton/synced_idempotency_keys_v1",
  ACTIVE_SESSION_INDEX: "@badminton/offline_active_sessions_v1",
} as const;

export interface LocalPlayerInfo {
  userId: string;
  displayName: string;
  eloScore: number;
  gender: "MALE" | "FEMALE";
  preferredPosition?: "FRONT" | "BACK" | "FLEXIBLE";
  dominantHand?: "LEFT" | "RIGHT" | "BOTH";
  checkInStatus: "CHECKED_IN" | "WAITING" | "ABSENT";
}

export interface ActiveMatchSnapshot {
  matchId: string;
  courtId: string;
  roundIndex: number;
  teamA: [string, string];
  teamB: [string, string];
  restingPlayerIds: string[];
  scores?: Array<{ setNumber: number; teamAScore: number; teamBScore: number }>;
}

export interface SessionSnapshot {
  sessionId: string;
  version: number;
  updatedAt: string;
  session: SessionDoc;
  courts: Record<string, CourtDoc>;
  players: Record<string, LocalPlayerInfo>;
  currentRound: number;
  completedMatches: MatchDoc[];
  activeMatches: Record<string, ActiveMatchSnapshot>;
}

export async function saveSessionSnapshot(
  snapshot: SessionSnapshot
): Promise<SessionSnapshot> {
  const normalized: SessionSnapshot = {
    ...snapshot,
    updatedAt: snapshot.updatedAt || new Date().toISOString(),
  };
  try {
    await AsyncStorage.setItem(
      OFFLINE_STORAGE_KEYS.SESSION_SNAPSHOT(normalized.sessionId),
      JSON.stringify(normalized)
    );
  } catch {
    // Giữ app chạy mượt trên sân nếu bộ nhớ cục bộ lỗi tạm thời
  }
  return normalized;
}

export async function loadSessionSnapshot(
  sessionId: string
): Promise<SessionSnapshot | null> {
  try {
    const raw = await AsyncStorage.getItem(
      OFFLINE_STORAGE_KEYS.SESSION_SNAPSHOT(sessionId)
    );
    if (!raw) return null;
    return JSON.parse(raw) as SessionSnapshot;
  } catch {
    return null;
  }
}

export async function updateSnapshotRound(
  sessionId: string,
  courtId: string,
  roundIndex: number,
  match: ActiveMatchSnapshot,
  nextCourt?: CourtDoc
): Promise<SessionSnapshot | null> {
  const current = await loadSessionSnapshot(sessionId);
  if (!current) return null;

  const nextCourts = nextCourt
    ? { ...current.courts, [courtId]: nextCourt }
    : current.courts;

  const updated: SessionSnapshot = {
    ...current,
    version: current.version + 1,
    updatedAt: new Date().toISOString(),
    currentRound: Math.max(current.currentRound, roundIndex),
    courts: nextCourts,
    activeMatches: {
      ...current.activeMatches,
      [match.matchId]: match,
    },
  };

  return saveSessionSnapshot(updated);
}

export async function updateSnapshotMatchScore(
  sessionId: string,
  matchId: string,
  sets: MatchSetScore[]
): Promise<SessionSnapshot | null> {
  const current = await loadSessionSnapshot(sessionId);
  if (!current) return null;

  const existingMatch = current.activeMatches[matchId];
  if (!existingMatch) return current;

  const mappedScores = sets.map((s) => ({
    setNumber: s.setNumber,
    teamAScore: s.scoreA,
    teamBScore: s.scoreB,
  }));

  const updated: SessionSnapshot = {
    ...current,
    version: current.version + 1,
    updatedAt: new Date().toISOString(),
    activeMatches: {
      ...current.activeMatches,
      [matchId]: {
        ...existingMatch,
        scores: mappedScores,
      },
    },
  };

  return saveSessionSnapshot(updated);
}

export async function clearSessionSnapshot(sessionId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(
      OFFLINE_STORAGE_KEYS.SESSION_SNAPSHOT(sessionId)
    );
  } catch {
    // ignore
  }
}

/** Chuyển đổi danh sách RosterMember trên CourtDoc thành bản đồ LocalPlayerInfo */
export function buildLocalPlayersFromCourts(
  courts: CourtDoc[]
): Record<string, LocalPlayerInfo> {
  const map: Record<string, LocalPlayerInfo> = {};
  for (const court of courts) {
    for (const member of Object.values(court.roster || {})) {
      map[member.memberId] = {
        userId: member.memberId,
        displayName: member.displayName,
        eloScore: member.rating,
        gender: member.gender === "F" ? "FEMALE" : "MALE",
        preferredPosition:
          member.position === "front"
            ? "FRONT"
            : member.position === "back"
              ? "BACK"
              : "FLEXIBLE",
        dominantHand: member.dominantHand === "left" ? "LEFT" : "RIGHT",
        checkInStatus: member.checkedIn ? "CHECKED_IN" : "WAITING",
      };
    }
  }
  return map;
}
