/**
 * REPOSITORY INTERFACES
 * Hợp đồng giao tiếp dữ liệu (Data Access Layer Contracts)
 * Phục vụ Mobile Developer (TV2) cắm mock data và tích hợp Firebase SDK
 * Phiên bản: 1.0 (Ban hành Tuần 3)
 */

import {
  UserProfile,
  SessionDoc,
  CourtDoc,
  RosterMember,
  LockedPair,
  JoinRequestDoc,
  MatchDoc,
  MatchSetScore,
  PostMatchCard,
  BestPartnerStat,
  RatingHistoryDoc,
  NotificationDoc,
  CourtCategory,
  BadmintonLevel,
  SessionStatus,
} from "./types";

// ==========================================
// 1. QUERY & FILTER DTOs
// ==========================================

export interface SessionFilterOptions {
  district?: string;                 // Quận/Huyện tại Đà Nẵng
  category?: CourtCategory;          // Thể thức (men, women, mixed)
  userLevel?: BadmintonLevel;        // Lọc kèo khớp trình độ
  onlyOpenSlots?: boolean;           // Chỉ lấy kèo còn chỗ (openSlotsTotal > 0)
  fromDate?: string;                 // ISO 8601
  limit?: number;
}

export interface PartnerSearchOptions {
  district?: string;
  category?: CourtCategory;
  maxEloDifference?: number;         // Mặc định: 150 điểm
  limit?: number;
}

export interface JoinRequestResult {
  status: "confirmed" | "waitlist";
  message: string;
  waitlistPosition?: number;
}

// ==========================================
// 2. REPOSITORY INTERFACES
// ==========================================

export interface IUserRepository {
  getProfile(uid: string): Promise<UserProfile | null>;
  createProfile(profile: UserProfile): Promise<void>;
  updateProfile(uid: string, data: Partial<Omit<UserProfile, "uid" | "role" | "skill">>): Promise<void>;
  updateFcmTokens(uid: string, tokens: string[]): Promise<void>;
  getUserRatingHistory(uid: string, limitCount?: number): Promise<RatingHistoryDoc[]>;
}

export interface ISessionRepository {
  listSessions(filter?: SessionFilterOptions): Promise<SessionDoc[]>;
  getSessionById(sessionId: string): Promise<SessionDoc | null>;
  createSession(sessionData: Omit<SessionDoc, "id" | "createdAt" | "updatedAt">): Promise<string>;
  updateSessionStatus(sessionId: string, status: SessionStatus): Promise<void>;
  cancelSession(sessionId: string, reason: string): Promise<void>;
}

export interface ICourtRepository {
  getCourt(sessionId: string, courtId: string): Promise<CourtDoc | null>;
  listCourtsBySession(sessionId: string): Promise<CourtDoc[]>;
  addCoreMember(sessionId: string, courtId: string, member: RosterMember): Promise<void>;
  addGhostMember(sessionId: string, courtId: string, ghostData: Omit<RosterMember, "memberId" | "isGhost" | "type" | "joinedAt">): Promise<string>;
  removeMemberFromCourt(sessionId: string, courtId: string, memberId: string): Promise<void>;
  updateLockedPairs(sessionId: string, courtId: string, pairs: LockedPair[]): Promise<void>;
  toggleRecruitStatus(sessionId: string, courtId: string, isOpen: boolean): Promise<void>;
}

export interface IRequestRepository {
  submitJoinRequest(sessionId: string, courtId: string, userId: string, note?: string): Promise<JoinRequestResult>;
  listRequestsByCourt(sessionId: string, courtId: string): Promise<JoinRequestDoc[]>;
  reviewRequest(sessionId: string, courtId: string, requestId: string, action: "approve" | "decline"): Promise<void>;
  withdrawRequest(sessionId: string, courtId: string, requestId: string): Promise<void>;
  cancelParticipation(sessionId: string, courtId: string, userId: string): Promise<{ penalty: number; promotedUser?: string }>;
}

export interface IMatchRepository {
  listMatches(sessionId: string, courtId?: string): Promise<MatchDoc[]>;
  createMatch(matchData: Omit<MatchDoc, "id" | "status" | "ratingProcessed" | "createdAt" | "updatedAt">): Promise<string>;
  saveMatchScore(matchId: string, sets: MatchSetScore[]): Promise<void>;
  confirmMatchResult(matchId: string, hostId: string, cards?: PostMatchCard[]): Promise<void>;
}

export interface IPartnerRepository {
  searchCompatiblePartners(userId: string, options?: PartnerSearchOptions): Promise<Array<{ user: UserProfile; compatibilityScore: number; reason: string }>>;
  listBestPartners(userId: string): Promise<BestPartnerStat[]>;
}

export interface INotificationRepository {
  listNotifications(userId: string, limitCount?: number): Promise<NotificationDoc[]>;
  markAsRead(notificationId: string): Promise<void>;
}
