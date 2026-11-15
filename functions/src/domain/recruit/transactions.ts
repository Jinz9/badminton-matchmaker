/**
 * GIAO DỊCH FIRESTORE CHO TUYỂN VÃNG LAI & ĐẶT SUẤT (FIRESTORE TRANSACTIONS)
 *
 * Đảm bảo tính toàn vẹn dữ liệu (ACID) và chống Race-Condition:
 * - Chống nhận quá suất khi nhiều người cùng nộp hoặc Host cùng duyệt
 * - Đảm bảo bất biến tối đa 8 người/sân và 2 sân/kèo
 * - Tự động đôn danh sách dự bị (Waitlist) khi có người hủy
 * - Chặn Host thêm người mặc định làm vượt trần 8 người (Giả định A4 - Hard Block)
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
  JoinRequestDoc,
  UserProfile,
  PlayerSnapshot,
  RosterMember,
} from "../types";
import { RULES } from "../../config/rules";
import { computeSlots, countRosterMembers, validateAddCoreMember, canOpenRecruitment } from "./slotCalculation";
import { validateJoinEligibility, genderAllowed } from "./eligibility";

export interface JoinRequestResult {
  status: "requested" | "waitlist";
  message: string;
}

export interface CancelParticipationResult {
  promotedWaitlistUserId?: string;
  message: string;
}

/**
 * Gửi đơn xin tham gia kèo (Người chơi gọi)
 * Sử dụng Transaction để đảm bảo đọc trạng thái sân mới nhất và xếp đúng vào requested hoặc waitlist
 */
export async function submitRecruitRequestTx(
  db: Firestore,
  sessionId: string,
  courtId: string,
  userProfile: UserProfile,
  note?: string
): Promise<JoinRequestResult> {
  const sessionRef = doc(db, "sessions", sessionId);
  const courtRef = doc(db, "sessions", sessionId, "courts", courtId);
  const requestRef = doc(db, "requests", `${sessionId}_${courtId}_${userProfile.uid}`);

  return await runTransaction(db, async (tx) => {
    const sessionSnap = await tx.get(sessionRef);
    if (!sessionSnap.exists()) {
      throw new Error("Buổi đánh không tồn tại hoặc đã bị xóa");
    }
    const session = sessionSnap.data() as SessionDoc;

    const courtSnap = await tx.get(courtRef);
    if (!courtSnap.exists()) {
      throw new Error("Sân đấu không tồn tại");
    }
    const court = courtSnap.data() as CourtDoc;

    // Kiểm tra xem đơn đã tồn tại chưa
    const existingReqSnap = await tx.get(requestRef);
    if (existingReqSnap.exists()) {
      const existingReq = existingReqSnap.data() as JoinRequestDoc;
      if (existingReq.status === "requested" || existingReq.status === "confirmed") {
        throw new Error("Bạn đã có đơn đăng ký đang chờ duyệt hoặc đã vào sân");
      }
    }

    // Kiểm tra điều kiện tham gia
    const eligibility = validateJoinEligibility(court, session, userProfile);

    if (!eligibility.eligible && !eligibility.canWaitlist) {
      throw new Error(eligibility.message || "Không đủ điều kiện tham gia");
    }

    const snapshot: PlayerSnapshot = {
      displayName: userProfile.displayName,
      gender: userProfile.gender,
      rating: userProfile.skill?.rating ?? 1400,
      level: userProfile.selfDeclaredLevel ?? 3,
      position: userProfile.position ?? "both",
      dominantHand: userProfile.dominantHand ?? "right",
      reliability: userProfile.skill?.reliability ?? 80,
    };

    const now = new Date().toISOString();

    if (eligibility.eligible) {
      // Còn suất chính thức -> Chờ Host duyệt
      const newRequest: JoinRequestDoc = {
        id: requestRef.id,
        courtId,
        sessionId,
        userId: userProfile.uid,
        status: "requested",
        snapshot,
        note,
        createdAt: now,
      };
      tx.set(requestRef, newRequest);
      return {
        status: "requested",
        message: "Gửi yêu cầu tham gia thành công. Đang chờ Host duyệt.",
      };
    } else {
      // Hết suất -> Vào hàng đợi dự bị (Waitlist)
      const newRequest: JoinRequestDoc = {
        id: requestRef.id,
        courtId,
        sessionId,
        userId: userProfile.uid,
        status: "waitlist",
        snapshot,
        note,
        createdAt: now,
      };
      tx.set(requestRef, newRequest);
      return {
        status: "waitlist",
        message: "Sân đã hết suất trống. Bạn đã được ghi danh vào danh sách dự bị.",
      };
    }
  });
}

/**
 * Host duyệt đơn xin tham gia (Duyệt tay 100% - Giả định A3 & Luật R9)
 * Giao dịch Atomic ngăn chặn tuyệt đối tình trạng nhận vượt quá 8 người
 */
export async function approveRecruitRequestTx(
  db: Firestore,
  sessionId: string,
  courtId: string,
  hostId: string,
  requestId: string
): Promise<void> {
  const sessionRef = doc(db, "sessions", sessionId);
  const courtRef = doc(db, "sessions", sessionId, "courts", courtId);
  const requestRef = doc(db, "requests", requestId);

  await runTransaction(db, async (tx) => {
    const sessionSnap = await tx.get(sessionRef);
    if (!sessionSnap.exists()) {
      throw new Error("Kèo không tồn tại");
    }
    const session = sessionSnap.data() as SessionDoc;
    if (session.hostId !== hostId) {
      throw new Error("Chỉ Host của kèo mới có quyền duyệt đơn");
    }

    const courtSnap = await tx.get(courtRef);
    if (!courtSnap.exists()) {
      throw new Error("Sân không tồn tại");
    }
    const court = courtSnap.data() as CourtDoc;

    const reqSnap = await tx.get(requestRef);
    if (!reqSnap.exists()) {
      throw new Error("Đơn xin tham gia không tồn tại");
    }
    const request = reqSnap.data() as JoinRequestDoc;

    if (request.status !== "requested" && request.status !== "waitlist") {
      throw new Error(`Đơn này đang ở trạng thái "${request.status}", không thể duyệt`);
    }

    // 1. Kiểm tra giới hạn 8 người và số suất còn lại trong Transaction
    const { coreCount, recruitConfirmed, totalMembers } = countRosterMembers(court);
    if (totalMembers >= RULES.COURT_CAPACITY) {
      throw new Error("Sân đã đủ tối đa 8 người, không thể nhận thêm");
    }

    const slots = computeSlots(coreCount, recruitConfirmed);
    if (slots.open <= 0) {
      throw new Error("Sân đã hết suất vãng lai trống");
    }

    // 2. Kiểm tra lại giới tính
    if (!genderAllowed(court.category, request.snapshot.gender, court.roster)) {
      throw new Error("Giới tính của ứng viên không còn phù hợp với số lượng hiện tại trên sân");
    }

    const now = new Date().toISOString();
    const newMember: RosterMember = {
      memberId: request.userId,
      displayName: request.snapshot.displayName,
      gender: request.snapshot.gender,
      type: "recruit",
      rating: request.snapshot.rating,
      level: request.snapshot.level,
      position: request.snapshot.position,
      dominantHand: request.snapshot.dominantHand ?? "right",
      isGhost: false,
      checkedIn: false,
      joinedAt: now,
    };

    // 3. Cập nhật Roster trên sân
    const updatedRoster = {
      ...(court.roster || {}),
      [request.userId]: newMember,
    };

    tx.update(courtRef, {
      roster: updatedRoster,
      version: (court.version || 1) + 1,
      updatedAt: now,
    });

    // 4. Cập nhật trạng thái Request sang 'confirmed'
    tx.update(requestRef, {
      status: "confirmed",
      decidedAt: now,
    });

    // 5. Cập nhật courtSummaries trong Session
    const newOpenSlots = Math.max(0, slots.open - 1);
    const updatedSummaries = (session.courtSummaries || []).map((summary) => {
      if (summary.courtId === courtId) {
        return {
          ...summary,
          openSlots: newOpenSlots,
          recruitOpen: newOpenSlots > 0 && court.recruitOpen,
        };
      }
      return summary;
    });

    const newTotalOpen = updatedSummaries.reduce((sum, s) => sum + s.openSlots, 0);

    tx.update(sessionRef, {
      courtSummaries: updatedSummaries,
      openSlotsTotal: newTotalOpen,
      status: newTotalOpen === 0 ? "full" : session.status,
      updatedAt: now,
    });
  });
}

/**
 * Host từ chối đơn xin tham gia
 */
export async function declineRecruitRequestTx(
  db: Firestore,
  sessionId: string,
  hostId: string,
  requestId: string
): Promise<void> {
  const sessionRef = doc(db, "sessions", sessionId);
  const requestRef = doc(db, "requests", requestId);

  await runTransaction(db, async (tx) => {
    const sessionSnap = await tx.get(sessionRef);
    if (!sessionSnap.exists() || (sessionSnap.data() as SessionDoc).hostId !== hostId) {
      throw new Error("Chỉ Host mới có quyền từ chối đơn");
    }

    const reqSnap = await tx.get(requestRef);
    if (!reqSnap.exists()) {
      throw new Error("Đơn không tồn tại");
    }

    tx.update(requestRef, {
      status: "declined",
      decidedAt: new Date().toISOString(),
    });
  });
}

/**
 * Host thêm người mặc định (Core / Ghost member - A2)
 * Áp dụng Giả định A4: Chặn nếu tổng số người > 8 (Hard Block)
 */
export async function addCoreMemberTx(
  db: Firestore,
  sessionId: string,
  courtId: string,
  hostId: string,
  coreMember: Omit<RosterMember, "joinedAt" | "type">
): Promise<void> {
  const sessionRef = doc(db, "sessions", sessionId);
  const courtRef = doc(db, "sessions", sessionId, "courts", courtId);

  await runTransaction(db, async (tx) => {
    const sessionSnap = await tx.get(sessionRef);
    if (!sessionSnap.exists() || (sessionSnap.data() as SessionDoc).hostId !== hostId) {
      throw new Error("Chỉ Host mới có quyền quản lý danh sách người mặc định");
    }
    const session = sessionSnap.data() as SessionDoc;

    const courtSnap = await tx.get(courtRef);
    if (!courtSnap.exists()) {
      throw new Error("Sân không tồn tại");
    }
    const court = courtSnap.data() as CourtDoc;

    const { coreCount, recruitConfirmed } = countRosterMembers(court);

    // KIỂM TRA GIẢ ĐỊNH A4: CHẶN NẾU TỔNG > 8
    const validation = validateAddCoreMember(coreCount, recruitConfirmed, 1);
    if (!validation.allowed) {
      throw new Error(validation.reason);
    }

    const now = new Date().toISOString();
    const memberId = coreMember.memberId || `ghost_${Date.now()}`;
    const fullMember: RosterMember = {
      ...coreMember,
      memberId,
      type: "core",
      joinedAt: now,
    };

    const updatedRoster = {
      ...(court.roster || {}),
      [memberId]: fullMember,
    };

    const newCoreCount = coreCount + 1;
    const newSlotCalc = computeSlots(newCoreCount, recruitConfirmed);

    tx.update(courtRef, {
      roster: updatedRoster,
      version: (court.version || 1) + 1,
      updatedAt: now,
    });

    // Cập nhật session summary
    const updatedSummaries = (session.courtSummaries || []).map((summary) => {
      if (summary.courtId === courtId) {
        return {
          ...summary,
          openSlots: newSlotCalc.open,
          recruitOpen: newSlotCalc.open > 0 && court.recruitOpen,
        };
      }
      return summary;
    });

    const newTotalOpen = updatedSummaries.reduce((sum, s) => sum + s.openSlots, 0);

    tx.update(sessionRef, {
      courtSummaries: updatedSummaries,
      openSlotsTotal: newTotalOpen,
      updatedAt: now,
    });
  });
}

/**
 * Host bật hoặc tắt trạng thái mở tuyển vãng lai của sân
 */
export async function toggleRecruitSlotTx(
  db: Firestore,
  sessionId: string,
  courtId: string,
  hostId: string,
  isOpen: boolean
): Promise<void> {
  const sessionRef = doc(db, "sessions", sessionId);
  const courtRef = doc(db, "sessions", sessionId, "courts", courtId);

  await runTransaction(db, async (tx) => {
    const sessionSnap = await tx.get(sessionRef);
    if (!sessionSnap.exists() || (sessionSnap.data() as SessionDoc).hostId !== hostId) {
      throw new Error("Chỉ Host mới có quyền thay đổi trạng thái tuyển vãng lai");
    }
    const session = sessionSnap.data() as SessionDoc;

    const courtSnap = await tx.get(courtRef);
    if (!courtSnap.exists()) {
      throw new Error("Sân không tồn tại");
    }
    const court = courtSnap.data() as CourtDoc;

    if (isOpen) {
      const check = canOpenRecruitment(court, session);
      if (!check.allowed) {
        throw new Error(check.reason);
      }
    }

    const now = new Date().toISOString();
    tx.update(courtRef, {
      recruitOpen: isOpen,
      updatedAt: now,
    });

    const updatedSummaries = (session.courtSummaries || []).map((summary) => {
      if (summary.courtId === courtId) {
        return {
          ...summary,
          recruitOpen: isOpen,
        };
      }
      return summary;
    });

    tx.update(sessionRef, {
      courtSummaries: updatedSummaries,
      updatedAt: now,
    });
  });
}

/**
 * Người chơi vãng lai đã confirmed bấm hủy tham gia
 * Giải phóng suất và tự động tìm ứng viên hợp lệ đầu tiên trong Waitlist để đôn lên
 */
export async function cancelParticipationTx(
  db: Firestore,
  sessionId: string,
  courtId: string,
  userId: string
): Promise<CancelParticipationResult> {
  const sessionRef = doc(db, "sessions", sessionId);
  const courtRef = doc(db, "sessions", sessionId, "courts", courtId);
  const requestRef = doc(db, "requests", `${sessionId}_${courtId}_${userId}`);

  // Tìm danh sách waitlist của sân này
  const waitlistQuery = query(
    collection(db, "requests"),
    where("sessionId", "==", sessionId),
    where("courtId", "==", courtId),
    where("status", "==", "waitlist"),
    orderBy("createdAt", "asc")
  );

  const waitlistSnap = await getDocs(waitlistQuery);
  const waitlistDocs = waitlistSnap.docs;

  return await runTransaction(db, async (tx) => {
    const sessionSnap = await tx.get(sessionRef);
    const courtSnap = await tx.get(courtRef);

    if (!sessionSnap.exists() || !courtSnap.exists()) {
      throw new Error("Kèo hoặc Sân không tồn tại");
    }

    const session = sessionSnap.data() as SessionDoc;
    const court = courtSnap.data() as CourtDoc;

    if (!court.roster || !court.roster[userId]) {
      throw new Error("Bạn không có trong danh sách thành viên của sân này");
    }

    const now = new Date().toISOString();

    // 1. Xóa người chơi khỏi Roster
    const updatedRoster = { ...court.roster };
    delete updatedRoster[userId];

    // 2. Cập nhật request của người hủy sang 'cancelled'
    tx.update(requestRef, {
      status: "cancelled",
      decidedAt: now,
    });

    // 3. Tự động kiểm tra danh sách Waitlist để đôn người phù hợp nhất lên 'requested'
    let promotedUserId: string | undefined;

    for (const docSnap of waitlistDocs) {
      const waitlistReq = docSnap.data() as JoinRequestDoc;
      // Kiểm tra xem giới tính người này có phù hợp với roster mới không
      if (genderAllowed(court.category, waitlistReq.snapshot.gender, updatedRoster)) {
        promotedUserId = waitlistReq.userId;
        const targetReqRef = doc(db, "requests", docSnap.id);
        tx.update(targetReqRef, {
          status: "requested", // Chuyển sang chờ Host duyệt
        });
        break;
      }
    }

    const { coreCount, recruitConfirmed } = countRosterMembers({
      ...court,
      roster: updatedRoster,
    });
    const slots = computeSlots(coreCount, recruitConfirmed);

    tx.update(courtRef, {
      roster: updatedRoster,
      version: (court.version || 1) + 1,
      updatedAt: now,
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
      status: "open", // Mở lại kèo vì vừa có suất trống
      updatedAt: now,
    });

    return {
      promotedWaitlistUserId: promotedUserId,
      message: promotedUserId
        ? `Hủy tham gia thành công. Ứng viên dự bị (${promotedUserId}) đã được đôn lên danh sách chờ duyệt.`
        : "Hủy tham gia thành công. Đã giải phóng suất trống trên sân.",
    };
  });
}

