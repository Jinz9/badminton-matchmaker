/**
 * Triển khai IDataRepository trên Firebase Modular JS SDK (Firestore + Cloud Functions).
 * Tuân thủ Data Contract v1 và firestore.rules của TV1.
 */

import {
  addDoc,
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { RULES } from "../config/rules";
import { computeBestPartners } from "../domain/history/bestPartners";
import { findPartners } from "../domain/partnerFinder/findPartners";
import { validateJoinEligibility } from "../domain/recruit/eligibility";
import {
  computeSlots,
  countRosterMembers,
  validateAddCoreMember,
} from "../domain/recruit/slotCalculation";
import {
  JoinRequestResult,
  PartnerSearchOptions,
  SessionFilterOptions,
} from "../domain/repositories";
import {
  BestPartnerStat,
  CourtDoc,
  JoinRequestDoc,
  LockedPair,
  MatchDoc,
  MatchSetScore,
  NotificationDoc,
  PlayerSnapshot,
  PostMatchCard,
  RatingHistoryDoc,
  RosterMember,
  SessionDoc,
  SessionStatus,
  UserProfile,
} from "../domain/types";
import { validateUpdateProfileInput } from "../domain/user/userProfile";
import {
  getFirebaseAuth,
  getFirebaseDb,
  getFirebaseFunctions,
} from "./firebase/client";
import { extractFirebaseErrorCode, mapFirebaseError } from "./firebase/errors";
import { IDataRepository, RealtimeChannel } from "./types";

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out as T;
}

export class FirebaseRepository implements IDataRepository {
  /** Cache ánh xạ matchId -> sessionId để thao tác nhanh trên subcollection matches */
  private matchSessionMap = new Map<string, string>();

  subscribe<T = unknown>(
    channel: RealtimeChannel,
    callback: (data: T) => void
  ): () => void {
    const db = getFirebaseDb();
    const auth = getFirebaseAuth();

    const onError = () => {
      // Không làm crash UI nếu listener bị từ chối quyền hoặc mất mạng tạm thời
    };

    if (channel === "users") {
      return onSnapshot(
        collection(db, "users"),
        (snap) => {
          const items = snap.docs.map((d) => d.data() as UserProfile);
          callback(items as unknown as T);
        },
        onError
      );
    }

    if (channel === "sessions") {
      return onSnapshot(
        collection(db, "sessions"),
        (snap) => {
          const items = snap.docs.map((d) => ({
            ...(d.data() as SessionDoc),
            id: d.id,
          }));
          callback(items as unknown as T);
        },
        onError
      );
    }

    if (channel === "notifications") {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        return () => {};
      }
      const q = query(
        collection(db, "notifications"),
        where("userId", "==", uid)
      );
      return onSnapshot(
        q,
        (snap) => {
          const items = snap.docs.map((d) => ({
            ...(d.data() as NotificationDoc),
            id: d.id,
          }));
          callback(items as unknown as T);
        },
        onError
      );
    }

    // courts / requests / matches là subcollection của sessions
    return onSnapshot(
      collectionGroup(db, channel),
      (snap) => {
        const items = snap.docs.map((d) => {
          const data = d.data() as Record<string, unknown>;
          if (channel === "matches" && typeof data.sessionId === "string") {
            this.matchSessionMap.set(d.id, data.sessionId);
          }
          return { ...data, id: d.id };
        });
        callback(items as unknown as T);
      },
      onError
    );
  }

  // =========================================================================
  // 1. IUserRepository
  // =========================================================================

  async getProfile(uid: string): Promise<UserProfile | null> {
    try {
      const db = getFirebaseDb();
      const snap = await getDoc(doc(db, "users", uid));
      if (!snap.exists()) return null;
      const data = snap.data() as UserProfile;
      return data.isDeleted ? null : data;
    } catch (err) {
      throw mapFirebaseError(err, "Không thể tải hồ sơ người chơi.");
    }
  }

  async createProfile(profile: UserProfile): Promise<void> {
    try {
      const db = getFirebaseDb();
      const now = profile.createdAt || new Date().toISOString();
      const payload: UserProfile = {
        ...profile,
        role: "player",
        isDeleted: false,
        createdAt: now,
        updatedAt: profile.updatedAt || now,
        skill: {
          ...profile.skill,
          reliability: 100,
          matchesPlayed: 0,
          isProvisional: true,
        },
      };
      await setDoc(doc(db, "users", profile.uid), stripUndefined(payload as never));
    } catch (err) {
      throw mapFirebaseError(err, "Không thể tạo hồ sơ người chơi.");
    }
  }

  async updateProfile(
    uid: string,
    updates: Partial<Omit<UserProfile, "uid" | "role" | "skill">>
  ): Promise<void> {
    const check = validateUpdateProfileInput(updates);
    if (!check.isValid) {
      throw new Error(check.errors.join(", "));
    }

    try {
      const db = getFirebaseDb();
      await updateDoc(
        doc(db, "users", uid),
        stripUndefined({
          ...updates,
          updatedAt: new Date().toISOString(),
        })
      );
    } catch (err) {
      throw mapFirebaseError(err, "Không thể cập nhật hồ sơ.");
    }
  }

  async updateFcmTokens(uid: string, tokens: string[]): Promise<void> {
    try {
      const db = getFirebaseDb();
      await updateDoc(doc(db, "users", uid), {
        fcmTokens: tokens,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      throw mapFirebaseError(err, "Không thể cập nhật token thông báo.");
    }
  }

  async getUserRatingHistory(
    uid: string,
    limitCount = 50
  ): Promise<RatingHistoryDoc[]> {
    try {
      const db = getFirebaseDb();
      const q = query(
        collection(db, "ratings"),
        where("userId", "==", uid),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({
        ...(d.data() as RatingHistoryDoc),
        id: d.id,
      }));
    } catch (err) {
      throw mapFirebaseError(err, "Không thể tải lịch sử biến động Elo.");
    }
  }

  // =========================================================================
  // 2. ISessionRepository
  // =========================================================================

  async listSessions(filters?: SessionFilterOptions): Promise<SessionDoc[]> {
    try {
      const db = getFirebaseDb();
      const snap = await getDocs(collection(db, "sessions"));
      let list = snap.docs
        .map((d) => ({ ...(d.data() as SessionDoc), id: d.id }))
        .filter((s) => !s.isDeleted);

      if (filters?.district) {
        list = list.filter((s) => s.district === filters.district);
      }
      if (filters?.category) {
        list = list.filter((s) =>
          s.courtSummaries?.some((c) => c.category === filters.category)
        );
      }
      if (filters?.onlyOpenSlots) {
        list = list.filter((s) => s.openSlotsTotal > 0);
      }
      if (filters?.fromDate) {
        list = list.filter((s) => s.startsAt >= filters.fromDate!);
      }

      const sorted = list.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
      return filters?.limit ? sorted.slice(0, filters.limit) : sorted;
    } catch (err) {
      throw mapFirebaseError(err, "Không thể tải danh sách kèo.");
    }
  }

  async getSessionById(sessionId: string): Promise<SessionDoc | null> {
    try {
      const db = getFirebaseDb();
      const snap = await getDoc(doc(db, "sessions", sessionId));
      if (!snap.exists()) return null;
      const data = { ...(snap.data() as SessionDoc), id: snap.id };
      return data.isDeleted ? null : data;
    } catch (err) {
      throw mapFirebaseError(err, "Không thể tải thông tin phòng kèo.");
    }
  }

  async createSession(
    sessionData: Omit<SessionDoc, "id" | "createdAt" | "updatedAt">,
    courtsData?: Array<Omit<CourtDoc, "id" | "sessionId" | "updatedAt">>
  ): Promise<string> {
    const resolvedCourts: Array<Omit<CourtDoc, "id" | "sessionId" | "updatedAt">> =
      courtsData && courtsData.length > 0
        ? courtsData
        : Array.from({ length: sessionData.courtCount }, (_, idx) => {
            const courtNumber = (idx + 1) as 1 | 2;
            const summary = sessionData.courtSummaries?.[idx];
            return {
              courtNumber,
              category: summary?.category ?? "mixed",
              levelMin: summary?.levelMin ?? 1,
              levelMax: summary?.levelMax ?? 6,
              minReliability: 50,
              pairingMode: "auto" as const,
              recruitOpen: (summary?.openSlots ?? 0) > 0,
              roster: {},
              pairs: [],
              version: 1,
            };
          });

    if (
      resolvedCourts.length < 1 ||
      resolvedCourts.length > RULES.MAX_COURTS_PER_SESSION
    ) {
      throw new Error(
        `Mỗi kèo chỉ được có 1 đến ${RULES.MAX_COURTS_PER_SESSION} sân.`
      );
    }

    try {
      const db = getFirebaseDb();
      const now = new Date().toISOString();
      const sessionRef = doc(collection(db, "sessions"));
      const sessionId = sessionRef.id;

      // Tạo Session trước để isHostOfSession(sessionId) trong firestore.rules đọc được khi tạo Courts
      const sessionPayload: SessionDoc = {
        ...sessionData,
        id: sessionId,
        courtCount: resolvedCourts.length as 1 | 2,
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
      };
      await setDoc(sessionRef, stripUndefined(sessionPayload as never));

      const batch = writeBatch(db);
      for (const c of resolvedCourts) {
        const courtId = String(c.courtNumber);
        const courtRef = doc(db, "sessions", sessionId, "courts", courtId);
        const courtPayload: CourtDoc = {
          ...c,
          id: courtId,
          sessionId,
          updatedAt: now,
        };
        batch.set(courtRef, stripUndefined(courtPayload as never));
      }
      await batch.commit();

      return sessionId;
    } catch (err) {
      throw mapFirebaseError(err, "Không thể tạo phòng kèo mới.");
    }
  }

  async updateSessionStatus(
    sessionId: string,
    status: SessionStatus
  ): Promise<void> {
    try {
      const db = getFirebaseDb();
      await updateDoc(doc(db, "sessions", sessionId), {
        status,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      throw mapFirebaseError(err, "Không thể cập nhật trạng thái kèo.");
    }
  }

  async cancelSession(sessionId: string, reason: string): Promise<void> {
    try {
      const db = getFirebaseDb();
      await updateDoc(doc(db, "sessions", sessionId), {
        status: "cancelled",
        cancelReason: reason,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      throw mapFirebaseError(err, "Không thể hủy phòng kèo.");
    }
  }

  // =========================================================================
  // 3. ICourtRepository
  // =========================================================================

  async getCourt(sessionId: string, courtId: string): Promise<CourtDoc | null> {
    try {
      const db = getFirebaseDb();
      const snap = await getDoc(
        doc(db, "sessions", sessionId, "courts", courtId)
      );
      if (!snap.exists()) return null;
      return { ...(snap.data() as CourtDoc), id: snap.id };
    } catch (err) {
      throw mapFirebaseError(err, "Không thể tải thông tin sân.");
    }
  }

  async listCourtsBySession(sessionId: string): Promise<CourtDoc[]> {
    try {
      const db = getFirebaseDb();
      const snap = await getDocs(
        collection(db, "sessions", sessionId, "courts")
      );
      return snap.docs
        .map((d) => ({ ...(d.data() as CourtDoc), id: d.id }))
        .sort((a, b) => a.courtNumber - b.courtNumber);
    } catch (err) {
      throw mapFirebaseError(err, "Không thể tải danh sách sân của kèo.");
    }
  }

  async addCoreMember(
    sessionId: string,
    courtId: string,
    member: RosterMember
  ): Promise<void> {
    try {
      const db = getFirebaseDb();
      const sessionRef = doc(db, "sessions", sessionId);
      const courtRef = doc(db, "sessions", sessionId, "courts", courtId);

      await runTransaction(db, async (tx) => {
        const [sessionSnap, courtSnap] = await Promise.all([
          tx.get(sessionRef),
          tx.get(courtRef),
        ]);
        if (!courtSnap.exists()) {
          throw new Error("Sân đấu không tồn tại.");
        }
        const court = courtSnap.data() as CourtDoc;
        const { coreCount, recruitConfirmed } = countRosterMembers(court);
        const check = validateAddCoreMember(coreCount, recruitConfirmed);
        if (!check.allowed) {
          throw new Error(check.reason || "Sân đã đủ tối đa 8 người.");
        }

        const nextRoster = {
          ...court.roster,
          [member.memberId]: {
            ...member,
            type: "core" as const,
            joinedAt: member.joinedAt || new Date().toISOString(),
          },
        };
        const nextSlots = computeSlots(coreCount + 1, recruitConfirmed);
        const now = new Date().toISOString();

        tx.update(courtRef, {
          roster: nextRoster,
          version: (court.version ?? 0) + 1,
          updatedAt: now,
        });

        if (sessionSnap.exists()) {
          const session = sessionSnap.data() as SessionDoc;
          const nextSummaries = (session.courtSummaries || []).map((cs) =>
            cs.courtId === courtId
              ? {
                  ...cs,
                  coreCount: coreCount + 1,
                  openSlots: nextSlots.open,
                }
              : cs
          );
          const openSlotsTotal = nextSummaries.reduce(
            (sum, cs) => sum + cs.openSlots,
            0
          );
          tx.update(sessionRef, {
            courtSummaries: nextSummaries,
            openSlotsTotal,
            updatedAt: now,
          });
        }
      });
    } catch (err) {
      throw mapFirebaseError(err, "Không thể thêm người mặc định vào sân.");
    }
  }

  async addGhostMember(
    sessionId: string,
    courtId: string,
    ghostData: Omit<RosterMember, "memberId" | "isGhost" | "type" | "joinedAt">
  ): Promise<string> {
    const memberId = `ghost_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 7)}`;
    await this.addCoreMember(sessionId, courtId, {
      ...ghostData,
      memberId,
      isGhost: true,
      type: "core",
      joinedAt: new Date().toISOString(),
    });
    return memberId;
  }

  async removeMemberFromCourt(
    sessionId: string,
    courtId: string,
    memberId: string
  ): Promise<void> {
    try {
      const db = getFirebaseDb();
      const sessionRef = doc(db, "sessions", sessionId);
      const courtRef = doc(db, "sessions", sessionId, "courts", courtId);

      await runTransaction(db, async (tx) => {
        const [sessionSnap, courtSnap] = await Promise.all([
          tx.get(sessionRef),
          tx.get(courtRef),
        ]);
        if (!courtSnap.exists()) {
          throw new Error("Sân đấu không tồn tại.");
        }
        const court = courtSnap.data() as CourtDoc;
        if (!court.roster[memberId]) {
          throw new Error("Thành viên không có trong danh sách sân.");
        }

        const nextRoster = { ...court.roster };
        delete nextRoster[memberId];
        const { coreCount, recruitConfirmed } = countRosterMembers({
          ...court,
          roster: nextRoster,
        });
        const nextSlots = computeSlots(coreCount, recruitConfirmed);
        const now = new Date().toISOString();

        tx.update(courtRef, {
          roster: nextRoster,
          version: (court.version ?? 0) + 1,
          updatedAt: now,
        });

        if (sessionSnap.exists()) {
          const session = sessionSnap.data() as SessionDoc;
          const nextSummaries = (session.courtSummaries || []).map((cs) =>
            cs.courtId === courtId
              ? {
                  ...cs,
                  openSlots: nextSlots.open,
                }
              : cs
          );
          const openSlotsTotal = nextSummaries.reduce(
            (sum, cs) => sum + cs.openSlots,
            0
          );
          tx.update(sessionRef, {
            courtSummaries: nextSummaries,
            openSlotsTotal,
            updatedAt: now,
          });
        }
      });
    } catch (err) {
      throw mapFirebaseError(err, "Không thể xóa thành viên khỏi sân.");
    }
  }

  async updateLockedPairs(
    sessionId: string,
    courtId: string,
    pairs: LockedPair[]
  ): Promise<void> {
    try {
      const db = getFirebaseDb();
      const courtRef = doc(db, "sessions", sessionId, "courts", courtId);
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(courtRef);
        if (!snap.exists()) throw new Error("Sân đấu không tồn tại.");
        const court = snap.data() as CourtDoc;
        tx.update(courtRef, {
          pairs,
          version: (court.version ?? 0) + 1,
          updatedAt: new Date().toISOString(),
        });
      });
    } catch (err) {
      throw mapFirebaseError(err, "Không thể cập nhật cặp khóa.");
    }
  }

  async toggleRecruitStatus(
    sessionId: string,
    courtId: string,
    isOpen: boolean
  ): Promise<void> {
    try {
      const db = getFirebaseDb();
      const sessionRef = doc(db, "sessions", sessionId);
      const courtRef = doc(db, "sessions", sessionId, "courts", courtId);

      await runTransaction(db, async (tx) => {
        const [sessionSnap, courtSnap] = await Promise.all([
          tx.get(sessionRef),
          tx.get(courtRef),
        ]);
        if (!courtSnap.exists()) throw new Error("Sân đấu không tồn tại.");
        const court = courtSnap.data() as CourtDoc;
        const now = new Date().toISOString();

        tx.update(courtRef, {
          recruitOpen: isOpen,
          version: (court.version ?? 0) + 1,
          updatedAt: now,
        });

        if (sessionSnap.exists()) {
          const session = sessionSnap.data() as SessionDoc;
          const nextSummaries = (session.courtSummaries || []).map((cs) =>
            cs.courtId === courtId ? { ...cs, recruitOpen: isOpen } : cs
          );
          tx.update(sessionRef, {
            courtSummaries: nextSummaries,
            updatedAt: now,
          });
        }
      });
    } catch (err) {
      throw mapFirebaseError(err, "Không thể thay đổi trạng thái tuyển.");
    }
  }

  // =========================================================================
  // 4. IRequestRepository
  // =========================================================================

  async submitJoinRequest(
    sessionId: string,
    courtId: string,
    userId: string,
    note?: string
  ): Promise<JoinRequestResult> {
    try {
      const db = getFirebaseDb();
      const userSnap = await getDoc(doc(db, "users", userId));
      if (!userSnap.exists()) {
        throw new Error("Không tìm thấy hồ sơ người chơi.");
      }
      const userProfile = userSnap.data() as UserProfile;

      const sessionRef = doc(db, "sessions", sessionId);
      const courtRef = doc(db, "sessions", sessionId, "courts", courtId);
      // Khớp firestore.rules: /sessions/{sessionId}/courts/{courtId}/requests/{requestId} với requestId == uid
      const requestRef = doc(
        db,
        "sessions",
        sessionId,
        "courts",
        courtId,
        "requests",
        userId
      );

      return await runTransaction(db, async (tx) => {
        const [sessionSnap, courtSnap, existingReqSnap] = await Promise.all([
          tx.get(sessionRef),
          tx.get(courtRef),
          tx.get(requestRef),
        ]);
        if (!sessionSnap.exists()) throw new Error("Buổi đánh không tồn tại.");
        if (!courtSnap.exists()) throw new Error("Sân đấu không tồn tại.");

        const session = sessionSnap.data() as SessionDoc;
        const court = courtSnap.data() as CourtDoc;

        if (existingReqSnap.exists()) {
          const prev = existingReqSnap.data() as JoinRequestDoc;
          if (prev.status === "requested" || prev.status === "confirmed") {
            throw new Error("Bạn đã nộp đơn hoặc đã có suất trên sân này.");
          }
        }

        const eligibility = validateJoinEligibility(court, session, userProfile);
        if (!eligibility.eligible && !eligibility.canWaitlist) {
          throw new Error(
            eligibility.message || "Không đủ điều kiện tham gia sân này."
          );
        }

        const docStatus: "requested" | "waitlist" = eligibility.eligible
          ? "requested"
          : "waitlist";
        const snapshot: PlayerSnapshot = {
          displayName: userProfile.displayName,
          gender: userProfile.gender,
          rating: userProfile.skill?.rating ?? 1400,
          level: userProfile.selfDeclaredLevel ?? 3,
          position: userProfile.position ?? "both",
          dominantHand: userProfile.dominantHand ?? "right",
          reliability: userProfile.skill?.reliability ?? 80,
        };

        const reqDoc: JoinRequestDoc = {
          id: userId,
          sessionId,
          courtId,
          userId,
          snapshot,
          status: docStatus,
          note: note ?? "",
          createdAt: new Date().toISOString(),
        };

        tx.set(requestRef, stripUndefined(reqDoc as never));

        return {
          status: eligibility.eligible ? "confirmed" : "waitlist",
          message:
            docStatus === "requested"
              ? "Đã gửi đơn xin tham gia, chờ Host duyệt."
              : "Sân đã đủ suất, bạn đã vào danh sách dự bị (Waitlist).",
        };
      });
    } catch (err) {
      throw mapFirebaseError(err, "Không thể gửi đơn xin tham gia.");
    }
  }

  async listRequestsByCourt(
    sessionId: string,
    courtId: string
  ): Promise<JoinRequestDoc[]> {
    try {
      const db = getFirebaseDb();
      const snap = await getDocs(
        collection(db, "sessions", sessionId, "courts", courtId, "requests")
      );
      return snap.docs
        .map((d) => ({ ...(d.data() as JoinRequestDoc), id: d.id }))
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    } catch (err) {
      throw mapFirebaseError(err, "Không thể tải danh sách đơn tham gia.");
    }
  }

  async reviewRequest(
    sessionId: string,
    courtId: string,
    requestId: string,
    action: "approve" | "decline"
  ): Promise<void> {
    try {
      const db = getFirebaseDb();
      const sessionRef = doc(db, "sessions", sessionId);
      const courtRef = doc(db, "sessions", sessionId, "courts", courtId);
      const requestRef = doc(
        db,
        "sessions",
        sessionId,
        "courts",
        courtId,
        "requests",
        requestId
      );

      await runTransaction(db, async (tx) => {
        const [sessionSnap, courtSnap, reqSnap] = await Promise.all([
          tx.get(sessionRef),
          tx.get(courtRef),
          tx.get(requestRef),
        ]);
        if (!courtSnap.exists()) throw new Error("Sân đấu không tồn tại.");
        if (!reqSnap.exists()) throw new Error("Đơn đăng ký không tồn tại.");

        const court = courtSnap.data() as CourtDoc;
        const reqData = reqSnap.data() as JoinRequestDoc;
        const now = new Date().toISOString();

        if (action === "decline") {
          tx.update(requestRef, {
            status: "declined",
            decidedAt: now,
          });
          return;
        }

        const { coreCount, recruitConfirmed } = countRosterMembers(court);
        const slots = computeSlots(coreCount, recruitConfirmed);
        if (slots.open <= 0 || coreCount + recruitConfirmed >= RULES.COURT_CAPACITY) {
          throw new Error("Sân đã hết suất tuyển vãng lai.");
        }

        const nextRoster: Record<string, RosterMember> = {
          ...court.roster,
          [reqData.userId]: {
            memberId: reqData.userId,
            isGhost: false,
            checkedIn: false,
            displayName: reqData.snapshot.displayName,
            gender: reqData.snapshot.gender,
            rating: reqData.snapshot.rating,
            level: reqData.snapshot.level,
            position: reqData.snapshot.position,
            dominantHand: reqData.snapshot.dominantHand ?? "right",
            type: "recruit",
            joinedAt: now,
          },
        };

        tx.update(requestRef, {
          status: "confirmed",
          decidedAt: now,
        });

        tx.update(courtRef, {
          roster: nextRoster,
          version: (court.version ?? 0) + 1,
          updatedAt: now,
        });

        if (sessionSnap.exists()) {
          const session = sessionSnap.data() as SessionDoc;
          const nextSlots = computeSlots(coreCount, recruitConfirmed + 1);
          const nextSummaries = (session.courtSummaries || []).map((cs) =>
            cs.courtId === courtId
              ? {
                  ...cs,
                  openSlots: nextSlots.open,
                }
              : cs
          );
          const openSlotsTotal = nextSummaries.reduce(
            (sum, cs) => sum + cs.openSlots,
            0
          );
          tx.update(sessionRef, {
            courtSummaries: nextSummaries,
            openSlotsTotal,
            updatedAt: now,
          });
        }
      });
    } catch (err) {
      throw mapFirebaseError(err, "Không thể duyệt đơn tham gia.");
    }
  }

  async withdrawRequest(
    sessionId: string,
    courtId: string,
    requestId: string
  ): Promise<void> {
    try {
      const db = getFirebaseDb();
      await updateDoc(
        doc(db, "sessions", sessionId, "courts", courtId, "requests", requestId),
        {
          status: "withdrawn",
          decidedAt: new Date().toISOString(),
        }
      );
    } catch (err) {
      throw mapFirebaseError(err, "Không thể rút đơn tham gia.");
    }
  }

  async cancelParticipation(
    sessionId: string,
    courtId: string,
    userId: string
  ): Promise<{ penalty: number; promotedUser?: string }> {
    // Ưu tiên gọi Cloud Function nếu TV1 đã deploy
    try {
      const functions = getFirebaseFunctions();
      const fn = httpsCallable<
        { sessionId: string; courtId: string; userId: string },
        { penalty: number; promotedUser?: string }
      >(functions, "cancelParticipation");
      const res = await fn({ sessionId, courtId, userId });
      return res.data;
    } catch (fnErr) {
      const code = extractFirebaseErrorCode(fnErr);
      if (code !== "functions/not-found" && code !== "functions/unavailable") {
        throw mapFirebaseError(fnErr, "Không thể hủy suất tham gia.");
      }
    }

    // Fallback: tự xóa chính mình khỏi roster theo firestore.rules (lines 158-165)
    try {
      const db = getFirebaseDb();
      const courtRef = doc(db, "sessions", sessionId, "courts", courtId);
      const reqRef = doc(
        db,
        "sessions",
        sessionId,
        "courts",
        courtId,
        "requests",
        userId
      );

      await runTransaction(db, async (tx) => {
        const courtSnap = await tx.get(courtRef);
        if (!courtSnap.exists()) throw new Error("Sân đấu không tồn tại.");
        const court = courtSnap.data() as CourtDoc;
        if (!court.roster[userId]) {
          throw new Error("Bạn không có trong danh sách sân này.");
        }
        const nextRoster = { ...court.roster };
        delete nextRoster[userId];
        tx.update(courtRef, {
          roster: nextRoster,
          version: (court.version ?? 0) + 1,
          updatedAt: new Date().toISOString(),
        });
      });

      try {
        await updateDoc(reqRef, {
          status: "cancelled",
          decidedAt: new Date().toISOString(),
        });
      } catch {
        // Có thể user là core member không có request doc
      }

      return { penalty: 0 };
    } catch (err) {
      throw mapFirebaseError(err, "Không thể hủy suất tham gia.");
    }
  }

  // =========================================================================
  // 5. IMatchRepository
  // =========================================================================

  async getUserMatches(userId: string): Promise<MatchDoc[]> {
    try {
      const db = getFirebaseDb();
      const snap = await getDocs(collectionGroup(db, "matches"));
      const matches: MatchDoc[] = [];
      for (const d of snap.docs) {
        const m = { ...(d.data() as MatchDoc), id: d.id };
        if (m.sessionId) this.matchSessionMap.set(m.id, m.sessionId);
        const players = [...(m.teamA || []), ...(m.teamB || [])];
        if (players.includes(userId)) {
          matches.push(m);
        }
      }
      return matches.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } catch (err) {
      throw mapFirebaseError(err, "Không thể tải lịch sử trận đấu.");
    }
  }

  async listMatches(sessionId: string, courtId?: string): Promise<MatchDoc[]> {
    try {
      const db = getFirebaseDb();
      const snap = await getDocs(
        collection(db, "sessions", sessionId, "matches")
      );
      let items = snap.docs.map((d) => {
        this.matchSessionMap.set(d.id, sessionId);
        return { ...(d.data() as MatchDoc), id: d.id };
      });
      if (courtId) {
        items = items.filter((m) => m.courtId === courtId);
      }
      return items.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    } catch (err) {
      throw mapFirebaseError(err, "Không thể tải danh sách trận đấu.");
    }
  }

  async createMatch(
    matchData: Omit<
      MatchDoc,
      "id" | "status" | "ratingProcessed" | "createdAt" | "updatedAt"
    >
  ): Promise<string> {
    try {
      const db = getFirebaseDb();
      const now = new Date().toISOString();
      const colRef = collection(
        db,
        "sessions",
        matchData.sessionId,
        "matches"
      );
      const docRef = await addDoc(
        colRef,
        stripUndefined({
          ...matchData,
          status: "planned",
          ratingProcessed: false,
          createdAt: now,
          updatedAt: now,
        })
      );
      this.matchSessionMap.set(docRef.id, matchData.sessionId);
      return docRef.id;
    } catch (err) {
      throw mapFirebaseError(err, "Không thể tạo trận đấu mới.");
    }
  }

  private async resolveMatchSessionId(matchId: string): Promise<string> {
    const cached = this.matchSessionMap.get(matchId);
    if (cached) return cached;

    const db = getFirebaseDb();
    const snap = await getDocs(collectionGroup(db, "matches"));
    for (const d of snap.docs) {
      const data = d.data() as MatchDoc;
      if (data.sessionId) this.matchSessionMap.set(d.id, data.sessionId);
      if (d.id === matchId && data.sessionId) {
        return data.sessionId;
      }
    }
    throw new Error(`Không tìm thấy trận đấu "${matchId}".`);
  }

  async saveMatchScore(
    matchId: string,
    sets: MatchSetScore[]
  ): Promise<void> {
    try {
      const db = getFirebaseDb();
      const sessionId = await this.resolveMatchSessionId(matchId);
      await updateDoc(doc(db, "sessions", sessionId, "matches", matchId), {
        sets,
        status: "finished",
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      throw mapFirebaseError(err, "Không thể lưu tỷ số trận đấu.");
    }
  }

  async confirmMatchResult(
    matchId: string,
    hostId: string,
    cards?: PostMatchCard[]
  ): Promise<void> {
    // Lưu thẻ đánh giá (nếu có) trước khi gọi Cloud Function
    if (cards && cards.length > 0) {
      try {
        const db = getFirebaseDb();
        const sessionId = await this.resolveMatchSessionId(matchId);
        await updateDoc(doc(db, "sessions", sessionId, "matches", matchId), {
          cards,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        throw mapFirebaseError(err, "Không thể lưu thẻ đánh giá sau trận.");
      }
    }

    try {
      const functions = getFirebaseFunctions();
      const finishMatchFn = httpsCallable<
        { matchId: string; hostId: string; cards?: PostMatchCard[] },
        unknown
      >(functions, "finishMatch");
      await finishMatchFn({ matchId, hostId, cards });
    } catch (err) {
      const code = extractFirebaseErrorCode(err);
      if (code === "functions/not-found") {
        throw new Error(
          "Cloud Function 'finishMatch' chưa được triển khai trên backend. " +
            "Tỷ số đã được lưu, nhưng cập nhật Elo và xác nhận trận cần Cloud Function từ TV1."
        );
      }
      throw mapFirebaseError(err, "Không thể xác nhận kết quả trận đấu.");
    }
  }

  // =========================================================================
  // 6. IPartnerRepository
  // =========================================================================

  async searchCompatiblePartners(
    userId: string,
    options?: PartnerSearchOptions
  ): Promise<Array<{ user: UserProfile; compatibilityScore: number; reason: string }>> {
    try {
      const db = getFirebaseDb();
      const snap = await getDocs(collection(db, "users"));
      const users = snap.docs
        .map((d) => d.data() as UserProfile)
        .filter((u) => !u.isDeleted);

      const me = users.find((u) => u.uid === userId);
      if (!me) return [];

      const candidates = users.filter((u) => u.uid !== userId);
      const matches = findPartners(me, candidates, {
        areaLabel: options?.district,
        maxEloDiff: options?.maxEloDifference,
        category: options?.category,
      });

      const maxCount = options?.limit ?? 20;
      return matches.slice(0, maxCount).map((m) => ({
        user: m.user,
        compatibilityScore: m.matchScore,
        reason: m.reasons.join(" · "),
      }));
    } catch (err) {
      throw mapFirebaseError(err, "Không thể tìm kiếm đồng đội.");
    }
  }

  async listBestPartners(userId: string): Promise<BestPartnerStat[]> {
    try {
      const matches = await this.getUserMatches(userId);
      return computeBestPartners(userId, matches);
    } catch (err) {
      throw mapFirebaseError(err, "Không thể tính thống kê đồng đội ăn ý.");
    }
  }

  // =========================================================================
  // 7. INotificationRepository
  // =========================================================================

  async listNotifications(
    userId: string,
    limitCount = 30
  ): Promise<NotificationDoc[]> {
    try {
      const db = getFirebaseDb();
      const q = query(
        collection(db, "notifications"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({
        ...(d.data() as NotificationDoc),
        id: d.id,
      }));
    } catch (err) {
      throw mapFirebaseError(err, "Không thể tải danh sách thông báo.");
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      const db = getFirebaseDb();
      await updateDoc(doc(db, "notifications", notificationId), {
        read: true,
      });
    } catch (err) {
      throw mapFirebaseError(err, "Không thể đánh dấu đã đọc thông báo.");
    }
  }
}
