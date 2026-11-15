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
import {
  JoinRequestResult,
  PartnerSearchOptions,
  SessionFilterOptions,
} from "../domain/repositories";
import { IDataRepository, RealtimeChannel } from "./types";

const NOT_CONNECTED_MSG =
  "FirebaseRepository chưa nối (Q11) — đặt EXPO_PUBLIC_DATA_SOURCE=mock để dùng dữ liệu mẫu.";

function notConnected(): never {
  throw new Error(NOT_CONNECTED_MSG);
}

/**
 * Khung rỗng FirebaseRepository triển khai ở giai đoạn Q11.
 * Giữ nguyên chữ ký IDataRepository để chuyển đổi bằng EXPO_PUBLIC_DATA_SOURCE=firebase.
 */
export class FirebaseRepository implements IDataRepository {
  subscribe<T = unknown>(
    _channel: RealtimeChannel,
    _listener: (data: T) => void
  ): () => void {
    notConnected();
  }

  async getProfile(_uid: string): Promise<UserProfile | null> {
    notConnected();
  }
  async createProfile(_profile: UserProfile): Promise<void> {
    notConnected();
  }
  async updateProfile(
    _uid: string,
    _data: Partial<Omit<UserProfile, "uid" | "role" | "skill">>
  ): Promise<void> {
    notConnected();
  }
  async updateFcmTokens(_uid: string, _tokens: string[]): Promise<void> {
    notConnected();
  }
  async getUserRatingHistory(
    _uid: string,
    _limitCount?: number
  ): Promise<RatingHistoryDoc[]> {
    notConnected();
  }

  async listSessions(_filter?: SessionFilterOptions): Promise<SessionDoc[]> {
    notConnected();
  }
  async getSessionById(_sessionId: string): Promise<SessionDoc | null> {
    notConnected();
  }
  async createSession(
    _sessionData: Omit<SessionDoc, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    notConnected();
  }
  async updateSessionStatus(
    _sessionId: string,
    _status: SessionStatus
  ): Promise<void> {
    notConnected();
  }
  async cancelSession(_sessionId: string, _reason: string): Promise<void> {
    notConnected();
  }

  async getCourt(_sessionId: string, _courtId: string): Promise<CourtDoc | null> {
    notConnected();
  }
  async listCourtsBySession(_sessionId: string): Promise<CourtDoc[]> {
    notConnected();
  }
  async addCoreMember(
    _sessionId: string,
    _courtId: string,
    _member: RosterMember
  ): Promise<void> {
    notConnected();
  }
  async addGhostMember(
    _sessionId: string,
    _courtId: string,
    _ghostData: Omit<RosterMember, "memberId" | "isGhost" | "type" | "joinedAt">
  ): Promise<string> {
    notConnected();
  }
  async removeMemberFromCourt(
    _sessionId: string,
    _courtId: string,
    _memberId: string
  ): Promise<void> {
    notConnected();
  }
  async updateLockedPairs(
    _sessionId: string,
    _courtId: string,
    _pairs: LockedPair[]
  ): Promise<void> {
    notConnected();
  }
  async toggleRecruitStatus(
    _sessionId: string,
    _courtId: string,
    _isOpen: boolean
  ): Promise<void> {
    notConnected();
  }

  async submitJoinRequest(
    _sessionId: string,
    _courtId: string,
    _userId: string,
    _note?: string
  ): Promise<JoinRequestResult> {
    notConnected();
  }
  async listRequestsByCourt(
    _sessionId: string,
    _courtId: string
  ): Promise<JoinRequestDoc[]> {
    notConnected();
  }
  async reviewRequest(
    _sessionId: string,
    _courtId: string,
    _requestId: string,
    _action: "approve" | "decline"
  ): Promise<void> {
    notConnected();
  }
  async withdrawRequest(
    _sessionId: string,
    _courtId: string,
    _requestId: string
  ): Promise<void> {
    notConnected();
  }
  async cancelParticipation(
    _sessionId: string,
    _courtId: string,
    _userId: string
  ): Promise<{ penalty: number; promotedUser?: string }> {
    notConnected();
  }

  async getUserMatches(_userId: string): Promise<MatchDoc[]> {
    notConnected();
  }

  async listMatches(_sessionId: string, _courtId?: string): Promise<MatchDoc[]> {
    notConnected();
  }
  async createMatch(
    _matchData: Omit<
      MatchDoc,
      "id" | "status" | "ratingProcessed" | "createdAt" | "updatedAt"
    >
  ): Promise<string> {
    notConnected();
  }
  async saveMatchScore(_matchId: string, _sets: MatchSetScore[]): Promise<void> {
    notConnected();
  }
  async confirmMatchResult(
    _matchId: string,
    _hostId: string,
    _cards?: PostMatchCard[]
  ): Promise<void> {
    notConnected();
  }

  async searchCompatiblePartners(
    _userId: string,
    _options?: PartnerSearchOptions
  ): Promise<Array<{ user: UserProfile; compatibilityScore: number; reason: string }>> {
    notConnected();
  }
  async listBestPartners(_userId: string): Promise<BestPartnerStat[]> {
    notConnected();
  }

  async listNotifications(
    _userId: string,
    _limitCount?: number
  ): Promise<NotificationDoc[]> {
    notConnected();
  }
  async markAsRead(_notificationId: string): Promise<void> {
    notConnected();
  }
}

