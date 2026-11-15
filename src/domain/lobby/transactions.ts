/**
 * GIAO DỊCH FIRESTORE CHO QUẢN LÝ PHÒNG KÈO (MATCH LOBBY TRANSACTIONS)
 *
 * Đảm bảo các giao dịch:
 * 1. Tạo kèo kèm 1 hoặc 2 sân đấu (CR-01)
 * 2. Host hủy cả kèo (xử lý toàn bộ thành viên và đơn nộp)
 * 3. Thành viên rời kèo kèm tính phạt điểm uy tín (P16) & tự động đôn Waitlist
 */

import {
  Firestore,
  doc,
  runTransaction,
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import {
  SessionDoc,
  CourtDoc,
  CourtSummary,
  JoinRequestDoc,
  UserProfile,
  RosterMember,
  RatingHistoryDoc,
  NotificationDoc,
} from "../types";
import { RULES } from "../../config/rules";
import { computeSlots, countRosterMembers } from "../recruit/slotCalculation";
import { getAvailableGenderSlots } from "../recruit/eligibility";
import {
  CreateSessionInput,
  CancellationPenaltyResult,
} from "./types";
import {
  validateCreateSessionInput,
  calculateCancellationPenalty,
  evaluateWaitlistPromotion,
} from "./lobbyValidation";

export interface CreateSessionResult {
  sessionId: string;
  courtIds: string[];
}

export interface LeaveSessionResult {
  penalty: CancellationPenaltyResult;
  promotedWaitlistUserId?: string;
  message: string;
}

/**
 * Host tạo phòng giao lưu mới kèm các sân đấu (Giao dịch Atomic)
 */
export async function createSessionTx(
  db: Firestore,
  hostProfile: UserProfile,
  input: CreateSessionInput,
  nowIso: string = new Date().toISOString()
): Promise<CreateSessionResult> {
  // 1. Kiểm tra tính hợp lệ nghiệp vụ
  const validation = validateCreateSessionInput(input, hostProfile, nowIso);
  if (!validation.isValid) {
    throw new Error(`Dữ liệu tạo kèo không hợp lệ: ${validation.errors.join(", ")}`);
  }

  const sessionRef = doc(collection(db, "sessions"));
  const sessionId = sessionRef.id;

  const courtDocsToCreate: CourtDoc[] = [];
  const courtSummaries: CourtSummary[] = [];
  let openSlotsTotal = 0;

  for (const cInput of input.courts) {
    const courtId = String(cInput.courtNumber);
    const initialCores = cInput.initialCoreMembers || [];
    const coreCount = initialCores.length;

    const roster: Record<string, RosterMember> = {};
    for (const core of initialCores) {
      const memberId = core.memberId || `ghost_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      roster[memberId] = {
        ...core,
        memberId,
        type: "core",
        joinedAt: nowIso,
      };
    }

    const slotCalc = computeSlots(coreCount, 0);
    // Giả định A1: Chỉ mở tuyển khi có tối thiểu 4 người mặc định
    const recruitOpen = coreCount >= RULES.MIN_CORE_PER_COURT && slotCalc.open > 0;

    const genderAvailability = getAvailableGenderSlots(cInput.category, roster, slotCalc.open);

    const summary: CourtSummary = {
      courtId,
      category: cInput.category,
      levelMin: cInput.levelMin,
      levelMax: cInput.levelMax,
      openSlots: slotCalc.open,
      openByGender: {
        M: genderAvailability.maleRemaining,
        F: genderAvailability.femaleRemaining,
      },
      recruitOpen,
    };

    courtSummaries.push(summary);
    openSlotsTotal += slotCalc.open;

    const courtDoc: CourtDoc = {
      id: courtId,
      sessionId,
      courtNumber: cInput.courtNumber,
      category: cInput.category,
      levelMin: cInput.levelMin,
      levelMax: cInput.levelMax,
      minReliability: cInput.minReliability ?? RULES.DEFAULT_MIN_RELIABILITY,
      pairingMode: "auto",
      recruitOpen,
      roster,
      pairs: [],
      version: 1,
      updatedAt: nowIso,
    };

    courtDocsToCreate.push(courtDoc);
  }

  const sessionDoc: SessionDoc = {
    id: sessionId,
    hostId: hostProfile.uid,
    hostName: hostProfile.displayName,
    hostAvatar: hostProfile.avatarUrl,
    hostReputation: hostProfile.skill?.reliability ?? 80,
    title: input.title.trim(),
    venueName: input.venueName.trim(),
    address: input.address.trim(),
    district: input.district.trim(),
    startsAt: input.startsAt,
    durationMin: input.durationMin || 120,
    costPerPlayer: input.costPerPlayer,
    status: openSlotsTotal === 0 ? "full" : "open",
    courtCount: input.courtCount,
    courtSummaries,
    openSlotsTotal,
    vietQrInfo: input.vietQrInfo,
    schemaVersion: 1,
    isDeleted: false,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  await runTransaction(db, async (tx) => {
    tx.set(sessionRef, sessionDoc);
    for (const cDoc of courtDocsToCreate) {
      const courtRef = doc(db, "sessions", sessionId, "courts", cDoc.id);
      tx.set(courtRef, cDoc);
    }
  });

  return {
    sessionId,
    courtIds: courtDocsToCreate.map((c) => c.id),
  };
}

/**
 * Host hủy toàn bộ buổi đánh (Session)
 * Tự động hủy các đơn đăng ký và thông báo cho người tham gia
 */
export async function cancelSessionByHostTx(
  db: Firestore,
  sessionId: string,
  hostId: string,
  reason: string = "Host có việc bận đột xuất"
): Promise<void> {
  const sessionRef = doc(db, "sessions", sessionId);

  // Đọc danh sách tất cả các đơn nộp cho buổi đánh này
  const requestsQuery = query(
    collection(db, "requests"),
    where("sessionId", "==", sessionId)
  );
  const requestsSnap = await getDocs(requestsQuery);

  await runTransaction(db, async (tx) => {
    const sessionSnap = await tx.get(sessionRef);
    if (!sessionSnap.exists()) {
      throw new Error("Buổi đánh không tồn tại");
    }
    const session = sessionSnap.data() as SessionDoc;
    if (session.hostId !== hostId) {
      throw new Error("Chỉ Host mới có quyền hủy buổi đánh này");
    }
    if (session.status === "cancelled") {
      throw new Error("Buổi đánh này đã bị hủy trước đó");
    }
    if (session.status === "completed") {
      throw new Error("Buổi đánh đã kết thúc, không thể hủy");
    }

    const nowIso = new Date().toISOString();

    // 1. Cập nhật trạng thái kèo sang 'cancelled'
    tx.update(sessionRef, {
      status: "cancelled",
      openSlotsTotal: 0,
      updatedAt: nowIso,
    });

    // 2. Chuyển tất cả các đơn requested hoặc waitlist sang 'declined'
    for (const reqDoc of requestsSnap.docs) {
      const req = reqDoc.data() as JoinRequestDoc;
      if (req.status === "requested" || req.status === "waitlist" || req.status === "confirmed") {
        tx.update(doc(db, "requests", reqDoc.id), {
          status: "declined",
          decidedAt: nowIso,
        });

        // Tạo thông báo cho người tham gia
        const notifRef = doc(collection(db, "notifications"));
        const notif: NotificationDoc = {
          id: notifRef.id,
          userId: req.userId,
          type: "request_declined",
          title: "Kèo giao lưu đã bị hủy",
          body: `Kèo "${session.title}" đã bị Host hủy với lý do: ${reason}`,
          data: { sessionId },
          read: false,
          createdAt: nowIso,
        };
        tx.set(notifRef, notif);
      }
    }
  });
}

/**
 * Thành viên hủy tham gia / rời kèo:
 * - Tính phạt uy tín theo mốc thời gian (<12h phạt 5đ, no-show phạt 15đ)
 * - Tự động đôn ứng viên từ Waitlist lên requested
 * - Ghi lịch sử biến động điểm uy tín
 */
export async function leaveSessionWithPenaltyTx(
  db: Firestore,
  sessionId: string,
  courtId: string,
  userId: string,
  options: {
    cancelTimeIso?: string;
    isNoShow?: boolean;
    reason?: string;
  } = {}
): Promise<LeaveSessionResult> {
  const sessionRef = doc(db, "sessions", sessionId);
  const courtRef = doc(db, "sessions", sessionId, "courts", courtId);
  const requestRef = doc(db, "requests", `${sessionId}_${courtId}_${userId}`);
  const userRef = doc(db, "users", userId);

  // Đọc danh sách Waitlist
  const waitlistQuery = query(
    collection(db, "requests"),
    where("sessionId", "==", sessionId),
    where("courtId", "==", courtId),
    where("status", "==", "waitlist"),
    orderBy("createdAt", "asc")
  );
  const waitlistSnap = await getDocs(waitlistQuery);
  const waitlistDocs = waitlistSnap.docs.map((d) => d.data() as JoinRequestDoc);

  return await runTransaction(db, async (tx) => {
    const sessionSnap = await tx.get(sessionRef);
    const courtSnap = await tx.get(courtRef);
    const userSnap = await tx.get(userRef);

    if (!sessionSnap.exists() || !courtSnap.exists()) {
      throw new Error("Buổi đánh hoặc Sân không tồn tại");
    }

    const session = sessionSnap.data() as SessionDoc;
    const court = courtSnap.data() as CourtDoc;

    if (!court.roster || !court.roster[userId]) {
      throw new Error("Bạn không có trong danh sách thành viên của sân này");
    }

    const nowIso = options.cancelTimeIso || new Date().toISOString();

    // 1. Tính toán mức phạt uy tín
    const penalty = calculateCancellationPenalty(
      session.startsAt,
      nowIso,
      options.isNoShow
    );

    // 2. Cập nhật điểm uy tín trong hồ sơ người chơi nếu có phạt
    if (userSnap.exists() && penalty.penaltyPoints > 0) {
      const user = userSnap.data() as UserProfile;
      const currentRel = user.skill?.reliability ?? 80;
      const newRel = Math.max(0, currentRel - penalty.penaltyPoints);

      tx.update(userRef, {
        "skill.reliability": newRel,
        updatedAt: nowIso,
      });

      // Ghi lịch sử trừ điểm uy tín vào collection ratings
      const ratingHistoryRef = doc(collection(db, "ratings"));
      const historyEntry: RatingHistoryDoc = {
        id: ratingHistoryRef.id,
        userId,
        matchId: "cancelled_session",
        sessionId,
        oldRating: user.skill?.rating ?? 1400,
        newRating: user.skill?.rating ?? 1400,
        delta: 0,
        kFactor: 0,
        oldReliability: currentRel,
        newReliability: newRel,
        reason: "cancel_penalty",
        createdAt: nowIso,
      };
      tx.set(ratingHistoryRef, historyEntry);

      // Bắn thông báo phạt uy tín
      const notifRef = doc(collection(db, "notifications"));
      const notif: NotificationDoc = {
        id: notifRef.id,
        userId,
        type: "reputation_penalty",
        title: "Cảnh báo trừ điểm uy tín",
        body: penalty.message,
        data: { sessionId, courtId },
        read: false,
        createdAt: nowIso,
      };
      tx.set(notifRef, notif);
    }

    // 3. Xóa người khỏi Roster
    const updatedRoster = { ...court.roster };
    delete updatedRoster[userId];

    // Cập nhật trạng thái request của người rút sang 'cancelled'
    const reqSnap = await tx.get(requestRef);
    if (reqSnap.exists()) {
      tx.update(requestRef, {
        status: "cancelled",
        decidedAt: nowIso,
      });
    }

    // 4. Đánh giá đôn ứng viên từ Waitlist
    const promotion = evaluateWaitlistPromotion(
      { ...court, roster: updatedRoster },
      waitlistDocs
    );

    let promotedUserId: string | undefined;
    if (promotion.promotedRequest) {
      promotedUserId = promotion.promotedRequest.userId;
      const promotedReqRef = doc(db, "requests", promotion.promotedRequest.id);
      tx.update(promotedReqRef, {
        status: "requested", // Chuyển sang chờ Host duyệt
      });

      // Bắn thông báo cho người được đôn
      const notifRef = doc(collection(db, "notifications"));
      const notif: NotificationDoc = {
        id: notifRef.id,
        userId: promotedUserId,
        type: "waitlist_promoted",
        title: "Bạn đã được đôn từ danh sách dự bị!",
        body: `Một thành viên đã rút khỏi sân ${court.courtNumber}. Đơn của bạn đã được chuyển lên danh sách chờ Host duyệt.`,
        data: { sessionId, courtId },
        read: false,
        createdAt: nowIso,
      };
      tx.set(notifRef, notif);
    }

    // 5. Cập nhật lại số suất của sân và buổi đánh
    const { coreCount, recruitConfirmed } = countRosterMembers({
      ...court,
      roster: updatedRoster,
    });
    const slots = computeSlots(coreCount, recruitConfirmed);

    tx.update(courtRef, {
      roster: updatedRoster,
      version: (court.version || 1) + 1,
      updatedAt: nowIso,
    });

    const updatedSummaries = (session.courtSummaries || []).map((summary) => {
      if (summary.courtId === courtId) {
        return {
          ...summary,
          openSlots: slots.open,
          recruitOpen: slots.open > 0 && court.recruitOpen,
        };
      }
      return summary;
    });

    const newTotalOpen = updatedSummaries.reduce((sum, s) => sum + s.openSlots, 0);

    tx.update(sessionRef, {
      courtSummaries: updatedSummaries,
      openSlotsTotal: newTotalOpen,
      status: "open", // Mở lại kèo nếu trước đó bị full
      updatedAt: nowIso,
    });

    return {
      penalty,
      promotedWaitlistUserId: promotedUserId,
      message: `Rời kèo thành công. ${penalty.message}`,
    };
  });
}

