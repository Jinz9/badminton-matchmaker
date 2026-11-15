import AsyncStorage from "@react-native-async-storage/async-storage";
import { RULES } from "../config/rules";
import { RATING_CONFIG } from "../config/rating";
import { calculateMatchElo } from "../domain/elo/calculateElo";
import { MatchTeamPlayer } from "../domain/elo/types";
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
  PostMatchCard,
  RatingHistoryDoc,
  RosterMember,
  SessionDoc,
  SessionStatus,
  UserProfile,
} from "../domain/types";

import bestPartnersSeed from "../mocks/bestPartners.json";
import courtsSeed from "../mocks/courts.json";
import matchesSeed from "../mocks/matches.json";
import notificationsSeed from "../mocks/notifications.json";
import requestsSeed from "../mocks/requests.json";
import sessionsSeed from "../mocks/sessions.json";
import usersSeed from "../mocks/users.json";

import { IDataRepository, MockConfig, RealtimeChannel } from "./types";

const STORAGE_KEY = "@badminton/mock_store_v1";

interface MockStoreSnapshot {
  users: UserProfile[];
  sessions: SessionDoc[];
  courts: CourtDoc[];
  requests: JoinRequestDoc[];
  matches: MatchDoc[];
  notifications: NotificationDoc[];
  bestPartners: BestPartnerStat[];
  ratingHistory: RatingHistoryDoc[];
}

function deepClone<T>(val: T): T {
  return JSON.parse(JSON.stringify(val)) as T;
}

function createInitialSnapshot(): MockStoreSnapshot {
  return {
    users: deepClone(usersSeed as unknown as UserProfile[]),
    sessions: deepClone(sessionsSeed as unknown as SessionDoc[]),
    courts: deepClone(courtsSeed as unknown as CourtDoc[]),
    requests: deepClone(requestsSeed as unknown as JoinRequestDoc[]),
    matches: deepClone(matchesSeed as unknown as MatchDoc[]),
    notifications: deepClone(notificationsSeed as unknown as NotificationDoc[]),
    bestPartners: deepClone(bestPartnersSeed as unknown as BestPartnerStat[]),
    ratingHistory: [],
  };
}

/**
 * Triển khai Repository giả lập lưu trong bộ nhớ + AsyncStorage,
 * hỗ trợ độ trễ mạng 200-600ms, giả lập lỗi, subscribe() realtime và gọi thẳng hàm thuần src/domain.
 */
export class MockRepository implements IDataRepository {
  private store: MockStoreSnapshot = createInitialSnapshot();
  private initialized = false;
  private initPromise: Promise<void> | null = null;
  private config: MockConfig;
  private listeners: Map<RealtimeChannel, Set<(data: unknown) => void>> = new Map();

  constructor(initialConfig?: Partial<MockConfig>) {
    this.config = {
      minLatencyMs: initialConfig?.minLatencyMs ?? 200,
      maxLatencyMs: initialConfig?.maxLatencyMs ?? 600,
      errorRate: initialConfig?.errorRate ?? 0,
    };
  }

  getMockConfig(): MockConfig {
    return { ...this.config };
  }

  setMockConfig(config: Partial<MockConfig>): void {
    this.config = {
      minLatencyMs: config.minLatencyMs ?? this.config.minLatencyMs,
      maxLatencyMs: config.maxLatencyMs ?? this.config.maxLatencyMs,
      errorRate: config.errorRate ?? this.config.errorRate,
    };
  }

  private async ensureLoaded(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<MockStoreSnapshot>;
          if (Array.isArray(parsed.users) && Array.isArray(parsed.sessions)) {
            this.store = {
              ...createInitialSnapshot(),
              ...parsed,
            };
          }
        }
      } catch {
        // An toàn khi AsyncStorage chưa sẵn sàng (ví dụ trong Jest node env)
      } finally {
        this.initialized = true;
      }
    })();

    return this.initPromise;
  }

  private async persist(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.store));
    } catch {
      // Bỏ qua trong môi trường không có native AsyncStorage
    }
  }

  private async simulateNetwork(): Promise<void> {
    await this.ensureLoaded();
    const min = Math.max(0, this.config.minLatencyMs);
    const max = Math.max(min, this.config.maxLatencyMs);
    if (max > 0) {
      const delay = min + Math.floor(Math.random() * (max - min + 1));
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    if (this.config.errorRate > 0 && Math.random() < this.config.errorRate) {
      throw new Error("Lỗi mạng giả lập: Không thể kết nối máy chủ sân cầu lông.");
    }
  }

  private getChannelPayload(channel: RealtimeChannel): unknown {
    switch (channel) {
      case "users":
        return deepClone(this.store.users);
      case "sessions":
        return deepClone(this.store.sessions);
      case "courts":
        return deepClone(this.store.courts);
      case "requests":
        return deepClone(this.store.requests);
      case "matches":
        return deepClone(this.store.matches);
      case "notifications":
        return deepClone(this.store.notifications);
    }
  }

  private notify(channels: RealtimeChannel[]): void {
    for (const ch of channels) {
      const subs = this.listeners.get(ch);
      if (!subs || subs.size === 0) continue;
      const payload = this.getChannelPayload(ch);
      subs.forEach((cb) => cb(payload));
    }
  }

  subscribe<T = unknown>(
    channel: RealtimeChannel,
    listener: (data: T) => void
  ): () => void {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
    }
    const set = this.listeners.get(channel)!;
    const wrapped = listener as (data: unknown) => void;
    set.add(wrapped);

    // Phát dữ liệu hiện tại ngay khi đăng ký (giống hành vi Firestore onSnapshot)
    void this.ensureLoaded().then(() => {
      if (set.has(wrapped)) {
        wrapped(this.getChannelPayload(channel));
      }
    });

    return () => {
      set.delete(wrapped);
    };
  }

  async resetMockData(): Promise<void> {
    this.store = createInitialSnapshot();
    this.initialized = true;
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    await this.persist();
    this.notify(["users", "sessions", "courts", "requests", "matches", "notifications"]);
  }

  // ==========================================
  // 1. USER REPOSITORY
  // ==========================================

  async getProfile(uid: string): Promise<UserProfile | null> {
    await this.simulateNetwork();
    const user = this.store.users.find((u) => u.uid === uid && !u.isDeleted);
    return user ? deepClone(user) : null;
  }

  async createProfile(profile: UserProfile): Promise<void> {
    await this.simulateNetwork();
    const idx = this.store.users.findIndex((u) => u.uid === profile.uid);
    if (idx >= 0) {
      this.store.users[idx] = deepClone(profile);
    } else {
      this.store.users.push(deepClone(profile));
    }
    await this.persist();
    this.notify(["users"]);
  }

  async updateProfile(
    uid: string,
    data: Partial<Omit<UserProfile, "uid" | "role" | "skill">>
  ): Promise<void> {
    await this.simulateNetwork();
    const user = this.store.users.find((u) => u.uid === uid);
    if (!user) throw new Error(`Không tìm thấy người chơi ${uid}`);
    Object.assign(user, data, { updatedAt: new Date().toISOString() });
    await this.persist();
    this.notify(["users"]);
  }

  async updateFcmTokens(uid: string, tokens: string[]): Promise<void> {
    await this.simulateNetwork();
    const user = this.store.users.find((u) => u.uid === uid);
    if (!user) return;
    user.fcmTokens = [...tokens];
    user.updatedAt = new Date().toISOString();
    await this.persist();
  }

  async getUserRatingHistory(
    uid: string,
    limitCount: number = 20
  ): Promise<RatingHistoryDoc[]> {
    await this.simulateNetwork();
    return deepClone(
      this.store.ratingHistory
        .filter((r) => r.userId === uid)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, limitCount)
    );
  }

  // ==========================================
  // 2. SESSION REPOSITORY
  // ==========================================

  async listSessions(filter?: SessionFilterOptions): Promise<SessionDoc[]> {
    await this.simulateNetwork();
    let list = this.store.sessions.filter((s) => !s.isDeleted);

    if (filter?.district) {
      list = list.filter((s) => s.district === filter.district);
    }
    if (filter?.category) {
      list = list.filter((s) =>
        s.courtSummaries.some((c) => c.category === filter.category)
      );
    }
    if (typeof filter?.userLevel === "number") {
      const lvl = filter.userLevel;
      list = list.filter((s) =>
        s.courtSummaries.some((c) => lvl >= c.levelMin && lvl <= c.levelMax)
      );
    }
    if (filter?.onlyOpenSlots) {
      list = list.filter((s) => s.openSlotsTotal > 0 && s.status === "open");
    }
    if (filter?.fromDate) {
      list = list.filter((s) => s.startsAt >= filter.fromDate!);
    }

    list.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    if (filter?.limit) {
      list = list.slice(0, filter.limit);
    }
    return deepClone(list);
  }

  async getSessionById(sessionId: string): Promise<SessionDoc | null> {
    await this.simulateNetwork();
    const session = this.store.sessions.find(
      (s) => s.id === sessionId && !s.isDeleted
    );
    return session ? deepClone(session) : null;
  }

  async createSession(
    sessionData: Omit<SessionDoc, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    await this.simulateNetwork();
    if (sessionData.courtCount > RULES.MAX_COURTS_PER_SESSION) {
      throw new Error(
        `Mỗi kèo chỉ được tối đa ${RULES.MAX_COURTS_PER_SESSION} sân theo quy định.`
      );
    }

    const now = new Date().toISOString();
    const id = `session_${Date.now()}`;
    const newSession: SessionDoc = {
      ...deepClone(sessionData),
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.store.sessions.push(newSession);

    // Tự khởi tạo CourtDoc tương ứng cho 1 hoặc 2 sân
    for (let i = 1; i <= newSession.courtCount; i++) {
      const summary = newSession.courtSummaries[i - 1];
      const courtId = String(i);
      this.store.courts.push({
        id: courtId,
        sessionId: id,
        courtNumber: i as 1 | 2,
        category: summary?.category ?? "mixed",
        levelMin: summary?.levelMin ?? 1,
        levelMax: summary?.levelMax ?? 6,
        minReliability: 50,
        pairingMode: "auto",
        recruitOpen: summary?.recruitOpen ?? true,
        roster: {},
        pairs: [],
        version: 1,
        updatedAt: now,
      });
    }

    await this.persist();
    this.notify(["sessions", "courts"]);
    return id;
  }

  async updateSessionStatus(
    sessionId: string,
    status: SessionStatus
  ): Promise<void> {
    await this.simulateNetwork();
    const session = this.store.sessions.find((s) => s.id === sessionId);
    if (!session) throw new Error(`Không tìm thấy kèo ${sessionId}`);
    session.status = status;
    session.updatedAt = new Date().toISOString();
    await this.persist();
    this.notify(["sessions"]);
  }

  async cancelSession(sessionId: string, _reason: string): Promise<void> {
    await this.updateSessionStatus(sessionId, "cancelled");
  }

  // ==========================================
  // 3. COURT REPOSITORY
  // ==========================================

  private findCourtOrThrow(sessionId: string, courtId: string): CourtDoc {
    const court = this.store.courts.find(
      (c) => c.sessionId === sessionId && c.id === courtId
    );
    if (!court) {
      throw new Error(`Không tìm thấy sân ${courtId} thuộc kèo ${sessionId}`);
    }
    return court;
  }

  /** Đồng bộ lại courtSummaries & openSlotsTotal bằng hàm thuần computeSlots */
  private syncSessionSummaries(sessionId: string): void {
    const session = this.store.sessions.find((s) => s.id === sessionId);
    if (!session) return;
    const courts = this.store.courts.filter((c) => c.sessionId === sessionId);

    session.courtSummaries = courts.map((court) => {
      const { coreCount, recruitConfirmed } = countRosterMembers(court);
      const { open: openSlots } = computeSlots(coreCount, recruitConfirmed);
      const maleCount = Object.values(court.roster).filter(
        (m) => m.gender === "M"
      ).length;
      const femaleCount = Object.values(court.roster).filter(
        (m) => m.gender === "F"
      ).length;

      return {
        courtId: court.id,
        category: court.category,
        levelMin: court.levelMin,
        levelMax: court.levelMax,
        openSlots: court.recruitOpen ? openSlots : 0,
        openByGender: {
          M:
            court.category === "women" || !court.recruitOpen
              ? 0
              : Math.max(0, Math.min(openSlots, 4 - maleCount + openSlots)),
          F:
            court.category === "men" || !court.recruitOpen
              ? 0
              : Math.max(0, Math.min(openSlots, 4 - femaleCount + openSlots)),
        },
        recruitOpen: court.recruitOpen,
      };
    });

    session.openSlotsTotal = session.courtSummaries.reduce(
      (sum, c) => sum + c.openSlots,
      0
    );

    if (session.status === "open" && session.openSlotsTotal === 0) {
      session.status = "full";
    } else if (session.status === "full" && session.openSlotsTotal > 0) {
      session.status = "open";
    }
    session.updatedAt = new Date().toISOString();
  }

  async getCourt(sessionId: string, courtId: string): Promise<CourtDoc | null> {
    await this.simulateNetwork();
    const court = this.store.courts.find(
      (c) => c.sessionId === sessionId && c.id === courtId
    );
    return court ? deepClone(court) : null;
  }

  async listCourtsBySession(sessionId: string): Promise<CourtDoc[]> {
    await this.simulateNetwork();
    return deepClone(
      this.store.courts
        .filter((c) => c.sessionId === sessionId)
        .sort((a, b) => a.courtNumber - b.courtNumber)
    );
  }

  async addCoreMember(
    sessionId: string,
    courtId: string,
    member: RosterMember
  ): Promise<void> {
    await this.simulateNetwork();
    const court = this.findCourtOrThrow(sessionId, courtId);
    const { coreCount, recruitConfirmed } = countRosterMembers(court);
    const check = validateAddCoreMember(coreCount, recruitConfirmed, 1);
    if (!check.allowed) {
      throw new Error(check.reason ?? "Sân đã đủ tối đa 8 người.");
    }

    court.roster[member.memberId] = deepClone({ ...member, type: "core" });
    court.version += 1;
    court.updatedAt = new Date().toISOString();
    this.syncSessionSummaries(sessionId);

    await this.persist();
    this.notify(["courts", "sessions"]);
  }

  async addGhostMember(
    sessionId: string,
    courtId: string,
    ghostData: Omit<RosterMember, "memberId" | "isGhost" | "type" | "joinedAt">
  ): Promise<string> {
    const memberId = `ghost_${Date.now()}`;
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
    await this.simulateNetwork();
    const court = this.findCourtOrThrow(sessionId, courtId);
    delete court.roster[memberId];
    court.pairs = court.pairs.filter((p) => p.a !== memberId && p.b !== memberId);
    court.version += 1;
    court.updatedAt = new Date().toISOString();
    this.syncSessionSummaries(sessionId);

    await this.persist();
    this.notify(["courts", "sessions"]);
  }

  async updateLockedPairs(
    sessionId: string,
    courtId: string,
    pairs: LockedPair[]
  ): Promise<void> {
    await this.simulateNetwork();
    const court = this.findCourtOrThrow(sessionId, courtId);
    court.pairs = deepClone(pairs);
    court.version += 1;
    court.updatedAt = new Date().toISOString();
    await this.persist();
    this.notify(["courts"]);
  }

  async toggleRecruitStatus(
    sessionId: string,
    courtId: string,
    isOpen: boolean
  ): Promise<void> {
    await this.simulateNetwork();
    const court = this.findCourtOrThrow(sessionId, courtId);
    court.recruitOpen = isOpen;
    court.version += 1;
    court.updatedAt = new Date().toISOString();
    this.syncSessionSummaries(sessionId);
    await this.persist();
    this.notify(["courts", "sessions"]);
  }

  // ==========================================
  // 4. REQUEST & WAITLIST REPOSITORY
  // ==========================================

  async submitJoinRequest(
    sessionId: string,
    courtId: string,
    userId: string,
    note?: string
  ): Promise<JoinRequestResult> {
    await this.simulateNetwork();
    const session = this.store.sessions.find((s) => s.id === sessionId);
    if (!session) throw new Error("Kèo đấu không tồn tại.");
    const court = this.findCourtOrThrow(sessionId, courtId);
    const user = this.store.users.find((u) => u.uid === userId);
    if (!user) throw new Error("Không tìm thấy hồ sơ người chơi.");

    if (court.roster[userId]) {
      return {
        status: "confirmed",
        message: "Bạn đã có tên trong danh sách sân này.",
      };
    }

    const existingReq = this.store.requests.find(
      (r) =>
        r.sessionId === sessionId &&
        r.courtId === courtId &&
        r.userId === userId &&
        (r.status === "requested" || r.status === "waitlist" || r.status === "confirmed")
    );
    if (existingReq) {
      return {
        status: existingReq.status === "waitlist" ? "waitlist" : "confirmed",
        message: "Bạn đã gửi đơn vào sân này trước đó.",
        waitlistPosition: existingReq.waitlistPosition,
      };
    }

    // Kiểm tra điều kiện hợp lệ bằng hàm thuần TV1 (trình độ, giới tính, uy tín...)
    const eligibility = validateJoinEligibility(court, session, user, {
      otherCourtsInSession: this.store.courts.filter(
        (c) => c.sessionId === sessionId && c.id !== courtId
      ),
    });

    const { coreCount, recruitConfirmed } = countRosterMembers(court);
    const { open: openSlots } = computeSlots(coreCount, recruitConfirmed);
    const totalMembers = Object.keys(court.roster).length;
    const isCourtFull = openSlots <= 0 || totalMembers >= RULES.COURT_CAPACITY;

    // Nếu kèo đang full nhưng sân còn nhận waitlist, cho phép vào waitlist nếu đạt trình độ/uy tín/giới tính
    if (!eligibility.eligible && !eligibility.canWaitlist) {
      if (eligibility.errorCode !== "SESSION_CLOSED" || session.status !== "full") {
        throw new Error(eligibility.message);
      }
    }

    const now = new Date().toISOString();
    const snapshot = {
      displayName: user.displayName,
      gender: user.gender,
      rating: user.skill.rating,
      level: user.selfDeclaredLevel,
      position: user.position,
      dominantHand: user.dominantHand,
      reliability: user.skill.reliability,
    };

    if (isCourtFull || eligibility.canWaitlist || session.status === "full") {
      const currentWaitlist = this.store.requests.filter(
        (r) =>
          r.sessionId === sessionId &&
          r.courtId === courtId &&
          r.status === "waitlist"
      );
      const nextPos = currentWaitlist.length + 1;
      const newReq: JoinRequestDoc = {
        id: `${sessionId}_${courtId}_${userId}`,
        sessionId,
        courtId,
        userId,
        status: "waitlist",
        snapshot,
        note,
        waitlistPosition: nextPos,
        createdAt: now,
      };
      this.store.requests.push(newReq);
      await this.persist();
      this.notify(["requests"]);
      return {
        status: "waitlist",
        message: `Sân đã hết suất chính thức. Bạn đang ở vị trí dự bị #${nextPos}.`,
        waitlistPosition: nextPos,
      };
    }

    // Còn suất -> tạo đơn chờ Host duyệt hoặc tự vào danh sách chờ duyệt
    const newReq: JoinRequestDoc = {
      id: `${sessionId}_${courtId}_${userId}`,
      sessionId,
      courtId,
      userId,
      status: "requested",
      snapshot,
      note,
      createdAt: now,
    };
    this.store.requests.push(newReq);
    await this.persist();
    this.notify(["requests"]);
    return {
      status: "confirmed",
      message: "Đã gửi đơn tham gia thành công, đang chờ Host duyệt.",
    };
  }

  async listRequestsByCourt(
    sessionId: string,
    courtId: string
  ): Promise<JoinRequestDoc[]> {
    await this.simulateNetwork();
    return deepClone(
      this.store.requests
        .filter((r) => r.sessionId === sessionId && r.courtId === courtId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    );
  }

  async reviewRequest(
    sessionId: string,
    courtId: string,
    requestId: string,
    action: "approve" | "decline"
  ): Promise<void> {
    await this.simulateNetwork();
    const req = this.store.requests.find(
      (r) => r.id === requestId && r.sessionId === sessionId && r.courtId === courtId
    );
    if (!req) throw new Error("Không tìm thấy đơn tham gia.");

    const now = new Date().toISOString();
    if (action === "decline") {
      req.status = "declined";
      req.decidedAt = now;
      await this.persist();
      this.notify(["requests"]);
      return;
    }

    const court = this.findCourtOrThrow(sessionId, courtId);
    const totalMembers = Object.keys(court.roster).length;
    const { coreCount, recruitConfirmed } = countRosterMembers(court);
    const { open: openSlots } = computeSlots(coreCount, recruitConfirmed);

    if (totalMembers >= RULES.COURT_CAPACITY || openSlots <= 0) {
      throw new Error(
        `Sân đã đủ tối đa ${RULES.COURT_CAPACITY} người hoặc hết suất tuyển.`
      );
    }

    req.status = "confirmed";
    req.decidedAt = now;
    req.waitlistPosition = undefined;

    court.roster[req.userId] = {
      memberId: req.userId,
      displayName: req.snapshot.displayName,
      gender: req.snapshot.gender,
      type: "recruit",
      rating: req.snapshot.rating,
      level: req.snapshot.level,
      position: req.snapshot.position,
      dominantHand: req.snapshot.dominantHand ?? "right",
      isGhost: false,
      checkedIn: false,
      joinedAt: now,
    };
    court.version += 1;
    court.updatedAt = now;

    this.syncSessionSummaries(sessionId);
    await this.persist();
    this.notify(["requests", "courts", "sessions"]);
  }

  async withdrawRequest(
    sessionId: string,
    courtId: string,
    requestId: string
  ): Promise<void> {
    await this.simulateNetwork();
    const req = this.store.requests.find(
      (r) => r.id === requestId && r.sessionId === sessionId && r.courtId === courtId
    );
    if (!req) return;
    req.status = "withdrawn";
    req.waitlistPosition = undefined;
    req.decidedAt = new Date().toISOString();
    await this.persist();
    this.notify(["requests"]);
  }

  async cancelParticipation(
    sessionId: string,
    courtId: string,
    userId: string
  ): Promise<{ penalty: number; promotedUser?: string }> {
    await this.simulateNetwork();
    const session = this.store.sessions.find((s) => s.id === sessionId);
    if (!session) throw new Error("Kèo đấu không tồn tại.");
    const court = this.findCourtOrThrow(sessionId, courtId);

    const now = new Date();
    const hoursUntilStart =
      (new Date(session.startsAt).getTime() - now.getTime()) / (1000 * 60 * 60);
    const penalty = hoursUntilStart < 12 ? Math.abs(RATING_CONFIG.REPUTATION_CHANGE.CANCEL_WITHIN_12_HOURS) : 0;

    // 1. Xóa khỏi roster & đánh dấu đơn là cancelled
    delete court.roster[userId];
    court.pairs = court.pairs.filter((p) => p.a !== userId && p.b !== userId);

    const userReq = this.store.requests.find(
      (r) =>
        r.sessionId === sessionId &&
        r.courtId === courtId &&
        r.userId === userId &&
        r.status === "confirmed"
    );
    if (userReq) {
      userReq.status = "cancelled";
      userReq.decidedAt = now.toISOString();
    }

    if (penalty > 0) {
      const user = this.store.users.find((u) => u.uid === userId);
      if (user) {
        user.skill.reliability = Math.max(
          RATING_CONFIG.REPUTATION_MIN,
          user.skill.reliability - penalty
        );
      }
    }

    // 2. Tự động đôn người đầu tiên trong Waitlist nếu sân còn chỗ (< 8 người)
    let promotedUser: string | undefined;
    const waitlistQueue = this.store.requests
      .filter(
        (r) =>
          r.sessionId === sessionId &&
          r.courtId === courtId &&
          r.status === "waitlist"
      )
      .sort(
        (a, b) =>
          (a.waitlistPosition ?? 999) - (b.waitlistPosition ?? 999) ||
          a.createdAt.localeCompare(b.createdAt)
      );

    const currentCount = Object.keys(court.roster).length;
    const { coreCount, recruitConfirmed } = countRosterMembers(court);
    const { open: availableSlots } = computeSlots(coreCount, recruitConfirmed);

    if (
      waitlistQueue.length > 0 &&
      currentCount < RULES.COURT_CAPACITY &&
      availableSlots > 0
    ) {
      const nextCandidate = waitlistQueue[0];
      nextCandidate.status = "confirmed";
      nextCandidate.waitlistPosition = undefined;
      nextCandidate.decidedAt = now.toISOString();

      court.roster[nextCandidate.userId] = {
        memberId: nextCandidate.userId,
        displayName: nextCandidate.snapshot.displayName,
        gender: nextCandidate.snapshot.gender,
        type: "recruit",
        rating: nextCandidate.snapshot.rating,
        level: nextCandidate.snapshot.level,
        position: nextCandidate.snapshot.position,
        dominantHand: nextCandidate.snapshot.dominantHand ?? "right",
        isGhost: false,
        checkedIn: false,
        joinedAt: now.toISOString(),
      };
      promotedUser = nextCandidate.userId;

      // Đánh lại số thứ tự cho những người còn lại trong waitlist
      waitlistQueue.slice(1).forEach((item, idx) => {
        item.waitlistPosition = idx + 1;
      });

      this.store.notifications.unshift({
        id: `notif_${Date.now()}`,
        userId: nextCandidate.userId,
        type: "waitlist_promoted",
        title: "Bạn đã được đôn lên suất chính thức!",
        body: `Có người vừa hủy kèo tại ${session.venueName} (Sân ${courtId}). Suất của bạn đã được xác nhận.`,
        data: { sessionId, courtId },
        read: false,
        createdAt: now.toISOString(),
      });
    }

    court.version += 1;
    court.updatedAt = now.toISOString();
    this.syncSessionSummaries(sessionId);

    await this.persist();
    this.notify(["courts", "requests", "sessions", "notifications", "users"]);
    return { penalty, promotedUser };
  }

  // ==========================================
  // 5. MATCH & ELO REPOSITORY
  // ==========================================

  async listMatches(sessionId: string, courtId?: string): Promise<MatchDoc[]> {
    await this.simulateNetwork();
    return deepClone(
      this.store.matches
        .filter(
          (m) =>
            m.sessionId === sessionId &&
            (courtId ? m.courtId === courtId : true)
        )
        .sort((a, b) => a.index - b.index)
    );
  }

  async createMatch(
    matchData: Omit<
      MatchDoc,
      "id" | "status" | "ratingProcessed" | "createdAt" | "updatedAt"
    >
  ): Promise<string> {
    await this.simulateNetwork();
    const now = new Date().toISOString();
    const id = `match_${Date.now()}`;
    const newMatch: MatchDoc = {
      ...deepClone(matchData),
      id,
      status: "playing",
      ratingProcessed: false,
      createdAt: now,
      updatedAt: now,
    };
    this.store.matches.push(newMatch);
    await this.persist();
    this.notify(["matches"]);
    return id;
  }

  async saveMatchScore(matchId: string, sets: MatchSetScore[]): Promise<void> {
    await this.simulateNetwork();
    const match = this.store.matches.find((m) => m.id === matchId);
    if (!match) throw new Error(`Không tìm thấy trận ${matchId}`);
    match.sets = deepClone(sets);
    match.updatedAt = new Date().toISOString();
    await this.persist();
    this.notify(["matches"]);
  }

  async confirmMatchResult(
    matchId: string,
    hostId: string,
    cards?: PostMatchCard[]
  ): Promise<void> {
    await this.simulateNetwork();
    const match = this.store.matches.find((m) => m.id === matchId);
    if (!match) throw new Error(`Không tìm thấy trận ${matchId}`);
    if (match.ratingProcessed) return;

    let winsA = 0;
    let winsB = 0;
    match.sets.forEach((s) => {
      if (s.scoreA > s.scoreB) winsA += 1;
      else if (s.scoreB > s.scoreA) winsB += 1;
    });
    const winner: "teamA" | "teamB" = winsA >= winsB ? "teamA" : "teamB";

    const toTeamPlayer = (memberId: string): MatchTeamPlayer => {
      const u = this.store.users.find((x) => x.uid === memberId);
      if (u) {
        return {
          userId: u.uid,
          displayName: u.displayName,
          currentRating: u.skill.rating,
          matchesPlayed: u.skill.matchesPlayed,
          isProvisional: u.skill.isProvisional,
          currentReliability: u.skill.reliability,
          isGhost: false,
        };
      }
      return {
        userId: memberId,
        displayName: memberId,
        currentRating: 1400,
        matchesPlayed: 5,
        isProvisional: false,
        currentReliability: 80,
        isGhost: true,
      };
    };

    const eloResult = calculateMatchElo({
      teamA: [toTeamPlayer(match.teamA[0]), toTeamPlayer(match.teamA[1])],
      teamB: [toTeamPlayer(match.teamB[0]), toTeamPlayer(match.teamB[1])],
      winner,
      sets: match.sets,
      reviewCards: cards,
    });

    const now = new Date().toISOString();
    [...eloResult.teamA, ...eloResult.teamB].forEach((res) => {
      if (res.isGhost) return;
      const u = this.store.users.find((x) => x.uid === res.userId);
      if (u) {
        u.skill.rating = res.newRating;
        u.skill.matchesPlayed = res.matchesPlayed;
        u.skill.isProvisional = res.isProvisional;
        u.skill.reliability = res.newReliability;
        u.updatedAt = now;

        this.store.ratingHistory.push({
          id: `rate_${match.id}_${u.uid}`,
          userId: u.uid,
          matchId: match.id,
          sessionId: match.sessionId,
          oldRating: res.oldRating,
          newRating: res.newRating,
          delta: res.delta,
          kFactor: res.kFactor,
          oldReliability: res.oldReliability,
          newReliability: res.newReliability,
          reason: "match_result",
          createdAt: now,
        });
      }
    });

    match.winner = winner;
    match.confirmedBy = hostId;
    match.cards = cards ? deepClone(cards) : match.cards;
    match.status = "confirmed";
    match.ratingProcessed = true;
    match.updatedAt = now;

    await this.persist();
    this.notify(["matches", "users"]);
  }

  // ==========================================
  // 6. PARTNER FINDER & HISTORY REPOSITORY
  // ==========================================

  async searchCompatiblePartners(
    userId: string,
    options?: PartnerSearchOptions
  ): Promise<
    Array<{ user: UserProfile; compatibilityScore: number; reason: string }>
  > {
    await this.simulateNetwork();
    const seeker = this.store.users.find((u) => u.uid === userId);
    if (!seeker) throw new Error(`Không tìm thấy người chơi ${userId}`);

    const candidates = this.store.users.filter(
      (u) => u.uid !== userId && !u.isDeleted
    );

    const matches = findPartners(seeker, candidates, {
      areaLabel: options?.district,
      category: options?.category,
      maxEloDiff: options?.maxEloDifference,
    });

    const limited = options?.limit ? matches.slice(0, options.limit) : matches;

    return limited.map((m) => ({
      user: deepClone(m.user),
      compatibilityScore: m.matchScore,
      reason: m.reasons.join(" • ") || "Trình độ tương đương",
    }));
  }

  async listBestPartners(userId: string): Promise<BestPartnerStat[]> {
    await this.simulateNetwork();
    const partnerInfoMap = new Map(
      this.store.users.map((u) => [
        u.uid,
        { displayName: u.displayName, avatarUrl: u.avatarUrl },
      ])
    );
    const computed = computeBestPartners(
      userId,
      this.store.matches,
      partnerInfoMap
    );
    if (computed.length > 0) return computed;
    return deepClone(this.store.bestPartners);
  }

  // ==========================================
  // 7. NOTIFICATION REPOSITORY
  // ==========================================

  async listNotifications(
    userId: string,
    limitCount: number = 20
  ): Promise<NotificationDoc[]> {
    await this.simulateNetwork();
    return deepClone(
      this.store.notifications
        .filter((n) => n.userId === userId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, limitCount)
    );
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.simulateNetwork();
    const notif = this.store.notifications.find((n) => n.id === notificationId);
    if (!notif) return;
    notif.read = true;
    await this.persist();
    this.notify(["notifications"]);
  }
}

