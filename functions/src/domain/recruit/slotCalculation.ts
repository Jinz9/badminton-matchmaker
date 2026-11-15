/**
 * MODULE TÍNH TOÁN SUẤT TUYỂN VÃNG LAI (SLOT CALCULATION)
 * Nguồn căn cứ:
 * - Luật R2, R3, R4 trong Skill `badminton-domain-rules`
 * - Giả định A1 (tối thiểu 4 core) & A4 (Hard block khi tăng core làm vượt trần 8)
 * - CR-02 trong `docs/PROJECT_CONTEXT.md`
 */

import { RULES } from "../../config/rules";
import { CourtDoc, SessionDoc } from "../types";
import { SlotCalculationResult } from "./types";

/**
 * Tính số suất tuyển vãng lai của một sân đấu
 * Công thức chuẩn: total = min(4, 8 - coreCount)
 *
 * @param coreCount Số người mặc định hiện có trên sân
 * @param recruitConfirmed Số vãng lai đã được Host duyệt vào sân
 */
export function computeSlots(
  coreCount: number,
  recruitConfirmed: number = 0
): SlotCalculationResult {
  if (coreCount < 0 || recruitConfirmed < 0) {
    throw new Error("Số lượng thành viên không thể âm");
  }

  // R4: Suất tối đa = min(4, 8 - coreCount)
  const total = Math.max(
    0,
    Math.min(RULES.MAX_RECRUITS_PER_COURT, RULES.COURT_CAPACITY - coreCount)
  );

  const open = total - recruitConfirmed;
  const isOverbooked = coreCount + recruitConfirmed > RULES.COURT_CAPACITY;

  return {
    total,
    open: Math.max(0, open),
    coreCount,
    recruitConfirmed,
    overbooked: isOverbooked,
  };
}

/**
 * Đếm số người mặc định và vãng lai đã duyệt từ Roster của sân
 */
export function countRosterMembers(court: CourtDoc): {
  coreCount: number;
  recruitConfirmed: number;
  totalMembers: number;
} {
  const members = Object.values(court.roster || {});
  let coreCount = 0;
  let recruitConfirmed = 0;

  for (const m of members) {
    if (m.type === "core") {
      coreCount++;
    } else if (m.type === "recruit") {
      recruitConfirmed++;
    }
  }

  return {
    coreCount,
    recruitConfirmed,
    totalMembers: coreCount + recruitConfirmed,
  };
}

/**
 * Kiểm tra xem Host có được phép bật mở tuyển vãng lai cho sân hay không
 */
export function canOpenRecruitment(
  court: CourtDoc,
  session?: SessionDoc
): { allowed: boolean; reason?: string } {
  // 1. Kèo phải ở trạng thái mở
  if (session && session.status !== "open") {
    return {
      allowed: false,
      reason: `Kèo đang ở trạng thái "${session.status}", không thể mở tuyển`,
    };
  }

  const { coreCount, recruitConfirmed, totalMembers } = countRosterMembers(court);

  // 2. Kiểm tra tổng số người trên sân & số người mặc định
  if (coreCount >= RULES.COURT_CAPACITY) {
    return {
      allowed: false,
      reason: "Sân đã có đủ 8 người mặc định, không cần tuyển vãng lai",
    };
  }

  if (totalMembers >= RULES.COURT_CAPACITY) {
    return {
      allowed: false,
      reason: `Sân đã đủ tối đa ${RULES.COURT_CAPACITY} người, không thể mở tuyển thêm`,
    };
  }

  // 3. Giả định A1: Sân phải có tối thiểu 4 người mặc định mới được mở tuyển
  if (coreCount < RULES.MIN_CORE_PER_COURT) {
    return {
      allowed: false,
      reason: `Sân cần tối thiểu ${RULES.MIN_CORE_PER_COURT} người mặc định để mở tuyển (hiện có ${coreCount})`,
    };
  }

  // 4. R3: Sân đã đủ 8 người mặc định thì không mở tuyển
  if (coreCount >= RULES.COURT_CAPACITY) {
    return {
      allowed: false,
      reason: "Sân đã có đủ 8 người mặc định, không cần tuyển vãng lai",
    };
  }

  // 5. Kiểm tra suất còn trống
  const slots = computeSlots(coreCount, recruitConfirmed);
  if (slots.open <= 0) {
    return {
      allowed: false,
      reason: "Sân đã hết suất tuyển vãng lai trống",
    };
  }

  return { allowed: true };
}

/**
 * Kiểm tra xem Host có được phép thêm người mặc định vào sân hay không (Giả định A4 - Hard Block)
 *
 * @param currentCoreCount Số người mặc định hiện tại
 * @param currentRecruitConfirmed Số vãng lai đã được duyệt
 * @param additionalCount Số người mặc định dự định thêm vào (mặc định 1)
 */
export function validateAddCoreMember(
  currentCoreCount: number,
  currentRecruitConfirmed: number,
  additionalCount: number = 1
): { allowed: boolean; reason?: string } {
  const newTotal = currentCoreCount + currentRecruitConfirmed + additionalCount;

  if (newTotal > RULES.COURT_CAPACITY) {
    return {
      allowed: false,
      reason: `Không thể thêm người mặc định. Tổng số người (${newTotal}) vượt quá giới hạn tối đa ${RULES.COURT_CAPACITY} người/sân. Host vui lòng hủy duyệt bớt vãng lai trước.`,
    };
  }

  return { allowed: true };
}
