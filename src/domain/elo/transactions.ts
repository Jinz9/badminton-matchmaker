/**
 * GIAO DỊCH FIRESTORE XÁC NHẬN KẾT QUẢ TRẬN ĐẤU & CẬP NHẬT ELO (FINISH MATCH TX)
 *
 * Tính chất bắt buộc (WBS 3.4 & Milestone M7):
 * 1. IDEMPOTENT: Đảm bảo gọi hai lần không bao giờ cộng điểm hai lần (dựa trên cờ ratingProcessed)
 * 2. GIAO DỊCH NGUYÊN TỬ (ACID): Cập nhật đồng bộ Match, Users Skill, Ratings log và BestPartners
 * 3. BẢO MẬT: Chỉ Host của buổi đánh hoặc Admin mới có quyền chốt tỷ số
 * 4. BẤT BIẾN: Không cho sửa lại kết quả trận đã chốt
 */

import {
  Firestore,
  doc,
  runTransaction,
  collection,
} from "firebase/firestore";
import {
  MatchDoc,
  SessionDoc,
  UserProfile,
  MatchSetScore,
  PostMatchCard,
  RatingHistoryDoc,
} from "../types";
import { MatchTeamPlayer, MatchEloResult } from "./types";
import { calculateMatchElo } from "./calculateElo";
import { validateMatchScores } from "./scoreValidation";

export interface ConfirmMatchResultTxOutput {
  matchId: string;
  eloResult: MatchEloResult;
  message: string;
}

/**
 * Giao dịch xác nhận tỷ số trận đấu, cập nhật Elo và điểm uy tín
 */
export async function confirmMatchResultTx(
  db: Firestore,
  matchId: string,
  hostId: string,
  sets: MatchSetScore[],
  cards?: PostMatchCard[]
): Promise<ConfirmMatchResultTxOutput> {
  const matchRef = doc(db, "matches", matchId);

  // 1. Kiểm tra tính hợp lệ của tỷ số set trước khi vào giao dịch
  const scoreValidation = validateMatchScores(sets);
  if (!scoreValidation.isValid) {
    throw new Error(`Tỷ số trận đấu không hợp lệ: ${scoreValidation.error}`);
  }

  const result = await runTransaction(db, async (tx) => {
    // 2. Đọc tài liệu trận đấu
    const matchSnap = await tx.get(matchRef);
    if (!matchSnap.exists()) {
      throw new Error(`Trận đấu "${matchId}" không tồn tại`);
    }
    const match = matchSnap.data() as MatchDoc;

    // 3. TÍNH CHẤT IDEMPOTENT: Chặn tuyệt đối việc xử lý 2 lần
    if (match.ratingProcessed === true || match.status === "confirmed") {
      throw new Error("Trận đấu này đã được xác nhận kết quả và cập nhật Elo trước đó (Idempotent Block)");
    }

    // 4. Kiểm tra quyền Host thông qua Session
    const sessionRef = doc(db, "sessions", match.sessionId);
    const sessionSnap = await tx.get(sessionRef);
    if (!sessionSnap.exists()) {
      throw new Error("Buổi đánh không tồn tại");
    }
    const session = sessionSnap.data() as SessionDoc;
    if (session.hostId !== hostId) {
      throw new Error("Chỉ Host của buổi đánh mới có quyền xác nhận kết quả trận đấu");
    }

    // 5. Đọc hồ sơ người chơi thực tế từ Firestore
    const pA1 = Array.isArray(match.teamA) ? match.teamA[0] : (match.teamA as any).a;
    const pA2 = Array.isArray(match.teamA) ? match.teamA[1] : (match.teamA as any).b;
    const pB1 = Array.isArray(match.teamB) ? match.teamB[0] : (match.teamB as any).a;
    const pB2 = Array.isArray(match.teamB) ? match.teamB[1] : (match.teamB as any).b;
    const uids = [pA1, pA2, pB1, pB2];
    const userDocsMap = new Map<string, UserProfile | null>();

    for (const uid of uids) {
      if (uid.startsWith("ghost_")) {
        userDocsMap.set(uid, null);
      } else {
        const userRef = doc(db, "users", uid);
        const userSnap = await tx.get(userRef);
        userDocsMap.set(uid, userSnap.exists() ? (userSnap.data() as UserProfile) : null);
      }
    }

    // Tạo đối tượng MatchTeamPlayer cho hàm thuần
    const buildTeamPlayer = (uid: string, fallbackName: string): MatchTeamPlayer => {
      const isGhost = uid.startsWith("ghost_");
      const user = userDocsMap.get(uid);

      return {
        userId: uid,
        displayName: user?.displayName || fallbackName,
        currentRating: user?.skill?.rating ?? 1400,
        matchesPlayed: user?.skill?.matchesPlayed ?? 0,
        isProvisional: user?.skill?.isProvisional ?? true,
        currentReliability: user?.skill?.reliability ?? 80,
        isGhost,
      };
    };

    const teamPlayerA1 = buildTeamPlayer(pA1, "Cầu thủ A1");
    const teamPlayerA2 = buildTeamPlayer(pA2, "Cầu thủ A2");
    const teamPlayerB1 = buildTeamPlayer(pB1, "Cầu thủ B1");
    const teamPlayerB2 = buildTeamPlayer(pB2, "Cầu thủ B2");

    // 6. Tính toán Elo bằng hàm thuần
    const eloResult = calculateMatchElo({
      teamA: [teamPlayerA1, teamPlayerA2],
      teamB: [teamPlayerB1, teamPlayerB2],
      winner: scoreValidation.winner!,
      sets,
      reviewCards: cards,
    });

    const nowIso = new Date().toISOString();

    // 7. Cập nhật tài liệu Match
    tx.update(matchRef, {
      sets,
      status: "confirmed",
      ratingProcessed: true,
      updatedAt: nowIso,
    });

    // 8. Cập nhật hồ sơ 4 người chơi và ghi lịch sử Ratings
    const allResults = [...eloResult.teamA, ...eloResult.teamB];

    for (const pRes of allResults) {
      if (pRes.isGhost) continue; // Bỏ qua ghost member

      const userRef = doc(db, "users", pRes.userId);
      tx.update(userRef, {
        "skill.rating": pRes.newRating,
        "skill.matchesPlayed": pRes.matchesPlayed,
        "skill.isProvisional": pRes.isProvisional,
        "skill.reliability": pRes.newReliability,
        updatedAt: nowIso,
      });

      // Ghi lịch sử Ratings log
      const ratingHistoryRef = doc(collection(db, "ratings"));
      const historyEntry: RatingHistoryDoc = {
        id: ratingHistoryRef.id,
        userId: pRes.userId,
        matchId,
        sessionId: match.sessionId,
        oldRating: pRes.oldRating,
        newRating: pRes.newRating,
        delta: pRes.delta,
        kFactor: pRes.kFactor,
        oldReliability: pRes.oldReliability,
        newReliability: pRes.newReliability,
        reason: "match_result",
        createdAt: nowIso,
      };
      tx.set(ratingHistoryRef, historyEntry);
    }

    return {
      matchId,
      eloResult,
      message: `Xác nhận kết quả trận đấu thành công. Đội ${scoreValidation.winner === "teamA" ? "A" : "B"} chiến thắng.`,
    };
  });

  return result;
}
