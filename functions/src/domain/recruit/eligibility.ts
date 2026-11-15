/**
 * MODULE KIỂM TRA ĐIỀU KIỆN ĐẶT SUẤT VÃNG LAI (ELIGIBILITY VALIDATION)
 * Nguồn căn cứ:
 * - Skill `recruit-slot-matching` (Bảng thứ tự ưu tiên kiểm tra & mã lỗi)
 * - Luật R6 (Ràng buộc giới tính theo nội dung), R7 (Một người chỉ ở 1 sân/kèo)
 */

import {
  CourtDoc,
  SessionDoc,
  UserProfile,
  PlayerSnapshot,
  Gender,
  CourtCategory,
  RosterMember,
} from "../types";
import { computeSlots, countRosterMembers } from "./slotCalculation";
import {
  RecruitEligibilityResult,
  GenderSlotAvailability,
} from "./types";

/**
 * Kiểm tra xem giới tính ứng viên có được phép vào sân hay không (Luật R6)
 *
 * @param category Nội dung sân: 'men', 'women', 'mixed'
 * @param gender Giới tính người xin: 'M' hoặc 'F'
 * @param roster Danh sách thành viên hiện có trên sân
 */
export function genderAllowed(
  category: CourtCategory,
  gender: Gender,
  roster: RosterMember[] | Record<string, RosterMember>
): boolean {
  if (category === "men") {
    return gender === "M";
  }
  if (category === "women") {
    return gender === "F";
  }

  // category === "mixed": Đôi nam nữ (Mục tiêu 4 nam + 4 nữ khi đủ 8 người)
  const rosterList = Array.isArray(roster) ? roster : Object.values(roster || {});
  const coreG = rosterList.filter(
    (m) => m.type === "core" && m.gender === gender
  ).length;
  const nowG = rosterList.filter((m) => m.gender === gender).length;

  // Vãng lai giới tính G chỉ được nhận nếu nowG + 1 <= max(4, coreG)
  return nowG + 1 <= Math.max(4, coreG);
}

/**
 * Tính số suất trống chi tiết theo giới tính cho sân (Dùng hiển thị trên UI Card)
 */
export function getAvailableGenderSlots(
  category: CourtCategory,
  roster: RosterMember[] | Record<string, RosterMember>,
  openSlotsTotal: number
): GenderSlotAvailability {
  if (openSlotsTotal <= 0) {
    return {
      maleAllowed: false,
      femaleAllowed: false,
      maleRemaining: 0,
      femaleRemaining: 0,
      label: "Hết suất (chỉ nhận dự bị)",
    };
  }

  if (category === "men") {
    return {
      maleAllowed: true,
      femaleAllowed: false,
      maleRemaining: openSlotsTotal,
      femaleRemaining: 0,
      label: `Còn ${openSlotsTotal} suất (chỉ Nam)`,
    };
  }

  if (category === "women") {
    return {
      maleAllowed: false,
      femaleAllowed: true,
      maleRemaining: 0,
      femaleRemaining: openSlotsTotal,
      label: `Còn ${openSlotsTotal} suất (chỉ Nữ)`,
    };
  }

  // category === "mixed"
  const rosterList = Array.isArray(roster) ? roster : Object.values(roster || {});
  const maleAllowed = genderAllowed("mixed", "M", rosterList);
  const femaleAllowed = genderAllowed("mixed", "F", rosterList);

  const coreM = rosterList.filter((m) => m.type === "core" && m.gender === "M").length;
  const coreF = rosterList.filter((m) => m.type === "core" && m.gender === "F").length;
  const nowM = rosterList.filter((m) => m.gender === "M").length;
  const nowF = rosterList.filter((m) => m.gender === "F").length;

  const maxPossibleM = Math.max(0, Math.max(4, coreM) - nowM);
  const maxPossibleF = Math.max(0, Math.max(4, coreF) - nowF);

  const maleRemaining = Math.min(openSlotsTotal, maxPossibleM);
  const femaleRemaining = Math.min(openSlotsTotal, maxPossibleF);

  let label = `Còn ${openSlotsTotal} suất`;
  if (maleRemaining > 0 && femaleRemaining > 0) {
    label = `Còn ${openSlotsTotal} suất: tối đa ${maleRemaining} nam, ${femaleRemaining} nữ`;
  } else if (maleRemaining > 0) {
    label = `Còn ${maleRemaining} suất (chỉ Nam)`;
  } else if (femaleRemaining > 0) {
    label = `Còn ${femaleRemaining} suất (chỉ Nữ)`;
  }

  return {
    maleAllowed,
    femaleAllowed,
    maleRemaining,
    femaleRemaining,
    label,
  };
}

/**
 * Kiểm tra xem người chơi có bị trùng giờ với một kèo khác đang tham gia hay không
 */
export function hasTimeConflict(
  targetSession: SessionDoc,
  activeSessions: SessionDoc[]
): boolean {
  if (!activeSessions || activeSessions.length === 0) {
    return false;
  }

  const targetStart = new Date(targetSession.startsAt).getTime();
  const targetEnd = targetStart + (targetSession.durationMin || 120) * 60 * 1000;

  for (const s of activeSessions) {
    if (s.id === targetSession.id || s.status === "cancelled" || s.status === "completed") {
      continue;
    }
    const sStart = new Date(s.startsAt).getTime();
    const sEnd = sStart + (s.durationMin || 120) * 60 * 1000;

    // Hai khoảng thời gian giao nhau: max(sStart, targetStart) < min(sEnd, targetEnd)
    if (Math.max(sStart, targetStart) < Math.min(sEnd, targetEnd)) {
      return true;
    }
  }

  return false;
}

/**
 * Kiểm tra toàn diện điều kiện của người xin tham gia theo đúng thứ tự ưu tiên
 *
 * @param court Sân cần xin vào
 * @param session Kèo chứa sân đó
 * @param candidate Hồ sơ người chơi (UserProfile hoặc PlayerSnapshot)
 * @param options Các tùy chọn phụ: các sân khác cùng kèo, các kèo đang tham gia
 */
export function validateJoinEligibility(
  court: CourtDoc,
  session: SessionDoc,
  candidate: UserProfile | PlayerSnapshot,
  options: {
    existingUserSessions?: SessionDoc[];
    otherCourtsInSession?: CourtDoc[];
  } = {}
): RecruitEligibilityResult {
  const candidateUid = "uid" in candidate ? candidate.uid : "";
  const candidateLevel = "selfDeclaredLevel" in candidate ? candidate.selfDeclaredLevel : candidate.level;
  const candidateReliability = "skill" in candidate ? candidate.skill.reliability : candidate.reliability;

  // 1. SESSION_CLOSED: Kèo phải ở trạng thái "open"
  if (session.status !== "open") {
    return {
      eligible: false,
      canWaitlist: false,
      errorCode: "SESSION_CLOSED",
      message: "Buổi đánh này hiện không còn mở nhận thêm người.",
    };
  }

  // 2. RECRUIT_CLOSED: Sân phải đang mở tuyển
  if (!court.recruitOpen) {
    return {
      eligible: false,
      canWaitlist: false,
      errorCode: "RECRUIT_CLOSED",
      message: "Sân này hiện đang đóng tuyển vãng lai.",
    };
  }

  // 3. ALREADY_IN_SESSION: Kiểm tra xem người chơi đã ở sân này hoặc sân khác của cùng kèo chưa (Luật R7)
  if (candidateUid) {
    // Sân hiện tại
    const inCurrentCourt = Object.values(court.roster || {}).some(
      (m) => m.memberId === candidateUid
    );
    if (inCurrentCourt) {
      return {
        eligible: false,
        canWaitlist: false,
        errorCode: "ALREADY_IN_SESSION",
        message: "Bạn đã có tên trong danh sách thành viên của sân này.",
      };
    }

    // Các sân khác trong cùng kèo
    if (options.otherCourtsInSession) {
      for (const otherCourt of options.otherCourtsInSession) {
        if (otherCourt.id === court.id) continue;
        const inOtherCourt = Object.values(otherCourt.roster || {}).some(
          (m) => m.memberId === candidateUid
        );
        if (inOtherCourt) {
          return {
            eligible: false,
            canWaitlist: false,
            errorCode: "ALREADY_IN_SESSION",
            message: "Bạn đã tham gia sân khác trong cùng buổi giao lưu này (Luật R7).",
          };
        }
      }
    }
  }

  // 4. TIME_CONFLICT: Kiểm tra trùng giờ với kèo khác
  if (options.existingUserSessions && hasTimeConflict(session, options.existingUserSessions)) {
    return {
      eligible: false,
      canWaitlist: false,
      errorCode: "TIME_CONFLICT",
      message: "Bạn đang tham gia một buổi đánh khác bị trùng khung giờ thi đấu.",
    };
  }

  // 5. GENDER_NOT_ALLOWED: Kiểm tra giới tính theo nội dung sân (Luật R6)
  if (!genderAllowed(court.category, candidate.gender, court.roster)) {
    let genderMsg = "Giới tính của bạn không phù hợp với nội dung sân này.";
    if (court.category === "men") genderMsg = "Sân này là nội dung Đôi nam (chỉ tuyển Nam).";
    if (court.category === "women") genderMsg = "Sân này là nội dung Đôi nữ (chỉ tuyển Nữ).";
    if (court.category === "mixed") genderMsg = "Sân này đã đủ số lượng người chơi theo giới tính của bạn.";

    return {
      eligible: false,
      canWaitlist: false,
      errorCode: "GENDER_NOT_ALLOWED",
      message: genderMsg,
    };
  }

  // 6. LEVEL_OUT_OF_RANGE: Cấp độ nằm trong [court.levelMin, court.levelMax]
  if (candidateLevel < court.levelMin || candidateLevel > court.levelMax) {
    return {
      eligible: false,
      canWaitlist: false,
      errorCode: "LEVEL_OUT_OF_RANGE",
      message: `Trình độ của bạn (Cấp ${candidateLevel}) không nằm trong khoảng yêu cầu của sân (Cấp ${court.levelMin} - ${court.levelMax}).`,
    };
  }

  // 7. RELIABILITY_TOO_LOW: Điểm uy tín >= court.minReliability
  const requiredReliability = court.minReliability ?? 60;
  if (candidateReliability < requiredReliability) {
    return {
      eligible: false,
      canWaitlist: false,
      errorCode: "RELIABILITY_TOO_LOW",
      message: `Điểm uy tín của bạn (${candidateReliability}đ) thấp hơn mức tối thiểu yêu cầu của sân (${requiredReliability}đ).`,
    };
  }

  // 8. NO_SLOT: Kiểm tra số suất còn lại
  const { coreCount, recruitConfirmed, totalMembers } = countRosterMembers(court);

  if (totalMembers >= 8) {
    return {
      eligible: false,
      canWaitlist: true,
      errorCode: "NO_SLOT",
      message: "Sân đã đủ 8 người. Bạn sẽ được xếp vào danh sách dự bị (Waitlist).",
    };
  }

  const slotCalc = computeSlots(coreCount, recruitConfirmed);
  if (slotCalc.open <= 0) {
    // Chỉ bị lỗi này -> CHO PHÉP VÀO WAITLIST
    return {
      eligible: false,
      canWaitlist: true,
      errorCode: "NO_SLOT",
      message: "Sân đã hết suất tuyển chính thức. Bạn sẽ được xếp vào danh sách dự bị (Waitlist).",
    };
  }

  // Đủ điều kiện vào thẳng danh sách chờ Host duyệt
  return {
    eligible: true,
    canWaitlist: false,
  };
}
