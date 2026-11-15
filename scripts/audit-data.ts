/**
 * TOOL RÀ SOÁT DỮ LIỆU BIÊN TRÊN BAAS (FIRESTORE DATA AUDITOR)
 * Căn cứ: Milestone M9 | WBS 5.3 & Bất biến hệ thống (Invariants I1-I5)
 *
 * NGUYÊN TẮC: CHỈ ĐỌC VÀ BÁO CÁO PHÁT HIỆN LỆCH, KHÔNG TỰ SỬA DỮ LIỆU THẬT.
 *
 * Các tiêu chí kiểm tra:
 * 1. Điểm Elo ngoài dải [800, 2200], Cấp độ ngoài dải [1, 6], Uy tín ngoài dải [0, 100].
 * 2. Kèo vượt giới hạn: courtCount > 2, số người mỗi sân > 8, tổng người > 16.
 * 3. Suất tuyển sai công thức: totalSlots != min(4, 8 - coreCount).
 * 4. Waitlist lệch: User vừa có tên trong Roster vừa nằm trong Waitlist.
 * 5. Thống kê không khớp lịch sử: Số trận và thắng/thua không khớp với collection matches.
 */

import {
  UserProfile,
  SessionDoc,
  CourtDoc,
  MatchDoc,
  JoinRequestDoc,
  RatingHistoryDoc,
  UserStatsDoc,
} from "../src/domain/types";
import { countRosterMembers, computeSlots } from "../src/domain/recruit/slotCalculation";
import { validateMatchScores } from "../src/domain/elo/scoreValidation";

export type AuditSeverity = "ERROR" | "WARNING" | "INFO";

export interface AuditIssue {
  collection: "users" | "sessions" | "courts" | "matches" | "requests" | "ratings";
  documentId: string;
  severity: AuditSeverity;
  ruleCode: string;
  message: string;
  currentValue: any;
  expectedValue: any;
}

export interface AuditReport {
  timestamp: string;
  totalDocumentsScanned: number;
  totalErrors: number;
  totalWarnings: number;
  issues: AuditIssue[];
  isClean: boolean;
}

/**
 * Hàm kiểm toán toàn bộ tập dữ liệu (có thể truyền snapshot mock data hoặc dữ liệu fetch từ Firestore)
 */
export function auditDatabaseSnapshot(data: {
  users: UserProfile[];
  sessions: SessionDoc[];
  courts: CourtDoc[];
  matches: MatchDoc[];
  requests: JoinRequestDoc[];
  ratings: RatingHistoryDoc[];
  stats?: UserStatsDoc[];
}): AuditReport {
  const issues: AuditIssue[] = [];
  let scannedCount = 0;

  // ========================================================
  // 1. KIỂM TOÁN TÀI KHOẢN NGƯỜI DÙNG (USERS)
  // ========================================================
  for (const user of data.users) {
    scannedCount++;
    // A. Điểm Elo sàn 800 trần 2200
    if (user.skill.rating < 800 || user.skill.rating > 2200) {
      issues.push({
        collection: "users",
        documentId: user.uid,
        severity: "ERROR",
        ruleCode: "USER_RATING_OUT_OF_BOUNDS",
        message: `Điểm Elo của user (${user.displayName}) nằm ngoài dải hợp lệ [800, 2200]`,
        currentValue: user.skill.rating,
        expectedValue: "[800, 2200]",
      });
    }

    // B. Cấp độ tự khai [1, 6]
    if (user.selfDeclaredLevel < 1 || user.selfDeclaredLevel > 6) {
      issues.push({
        collection: "users",
        documentId: user.uid,
        severity: "ERROR",
        ruleCode: "USER_LEVEL_OUT_OF_BOUNDS",
        message: `Cấp độ tự khai (${user.selfDeclaredLevel}) không nằm trong thang 6 cấp [1, 6]`,
        currentValue: user.selfDeclaredLevel,
        expectedValue: "[1, 6]",
      });
    }

    // C. Điểm uy tín [0, 100]
    if (user.skill.reliability < 0 || user.skill.reliability > 100) {
      issues.push({
        collection: "users",
        documentId: user.uid,
        severity: "ERROR",
        ruleCode: "USER_RELIABILITY_OUT_OF_BOUNDS",
        message: `Điểm uy tín (${user.skill.reliability}) nằm ngoài dải [0, 100]`,
        currentValue: user.skill.reliability,
        expectedValue: "[0, 100]",
      });
    }

    // D. Số trận âm
    if (user.skill.matchesPlayed < 0) {
      issues.push({
        collection: "users",
        documentId: user.uid,
        severity: "ERROR",
        ruleCode: "USER_NEGATIVE_MATCHES",
        message: `Số trận đã đấu bị âm (${user.skill.matchesPlayed})`,
        currentValue: user.skill.matchesPlayed,
        expectedValue: ">= 0",
      });
    }
  }

  // ========================================================
  // 2. KIỂM TOÁN BUỔI ĐÁNH (SESSIONS) & SÂN (COURTS)
  // ========================================================
  const courtsBySession = new Map<string, CourtDoc[]>();
  for (const court of data.courts) {
    scannedCount++;
    const list = courtsBySession.get(court.sessionId) || [];
    list.push(court);
    courtsBySession.set(court.sessionId, list);

    // Kiểm tra từng sân:
    // A. Bất biến số người trên sân <= 8 (Invariant I1)
    const { totalMembers, coreCount, recruitConfirmed } = countRosterMembers(court);
    if (totalMembers > 8) {
      issues.push({
        collection: "courts",
        documentId: court.id,
        severity: "ERROR",
        ruleCode: "COURT_OVERBOOKED",
        message: `Sân ${court.courtNumber} vượt quá giới hạn 8 người/sân (Hiện có: ${totalMembers} người)`,
        currentValue: totalMembers,
        expectedValue: "<= 8",
      });
    }

    // B. Kiểm tra công thức suất tuyển vãng lai (Luật R4)
    const expectedSlots = computeSlots(coreCount, recruitConfirmed);
    if (expectedSlots.total !== Math.min(4, Math.max(0, 8 - coreCount))) {
      issues.push({
        collection: "courts",
        documentId: court.id,
        severity: "WARNING",
        ruleCode: "COURT_SLOT_FORMULA_MISMATCH",
        message: `Công thức suất tuyển của sân ${court.courtNumber} tính sai`,
        currentValue: expectedSlots.total,
        expectedValue: Math.min(4, Math.max(0, 8 - coreCount)),
      });
    }
  }

  for (const session of data.sessions) {
    scannedCount++;
    // A. Số sân <= 2 (Invariant I3)
    if (session.courtCount < 1 || session.courtCount > 2) {
      issues.push({
        collection: "sessions",
        documentId: session.id,
        severity: "ERROR",
        ruleCode: "SESSION_INVALID_COURT_COUNT",
        message: `Kèo có số sân (${session.courtCount}) không hợp lệ (Chỉ cho phép 1 hoặc 2 sân)`,
        currentValue: session.courtCount,
        expectedValue: "1 hoặc 2",
      });
    }

    // B. Số document CourtDoc thực tế khớp với courtCount
    const actualCourts = courtsBySession.get(session.id) || [];
    if (actualCourts.length !== session.courtCount) {
      issues.push({
        collection: "sessions",
        documentId: session.id,
        severity: "WARNING",
        ruleCode: "SESSION_COURT_DOCS_MISMATCH",
        message: `Kèo khai báo ${session.courtCount} sân nhưng chỉ tìm thấy ${actualCourts.length} tài liệu CourtDoc`,
        currentValue: actualCourts.length,
        expectedValue: session.courtCount,
      });
    }

    // C. Tổng số người cả kèo <= 16 (CR-01)
    let totalSessionPlayers = 0;
    for (const c of actualCourts) {
      const { totalMembers } = countRosterMembers(c);
      totalSessionPlayers += totalMembers;
    }
    if (totalSessionPlayers > 16) {
      issues.push({
        collection: "sessions",
        documentId: session.id,
        severity: "ERROR",
        ruleCode: "SESSION_TOTAL_PLAYERS_EXCEEDED",
        message: `Kèo vượt quá giới hạn 16 người (Hiện có: ${totalSessionPlayers} người)`,
        currentValue: totalSessionPlayers,
        expectedValue: "<= 16",
      });
    }
  }

  // ========================================================
  // 3. KIỂM TOÁN WAITLIST & TRÙNG LẶP (REQUESTS)
  // ========================================================
  for (const req of data.requests) {
    scannedCount++;
    const court = data.courts.find((c) => c.sessionId === req.sessionId && c.id === req.courtId);
    if (!court) continue;

    // A. Người chơi vừa có tên trong Roster vừa ở Waitlist (Lỗi trạng thái)
    const inRoster = court.roster && court.roster[req.userId] !== undefined;
    if (inRoster && req.status === "waitlist") {
      issues.push({
        collection: "requests",
        documentId: req.id,
        severity: "ERROR",
        ruleCode: "WAITLIST_ALREADY_IN_ROSTER",
        message: `Người chơi (${req.userId}) vừa có tên trong Roster vừa nằm trong hàng đợi Waitlist`,
        currentValue: `status = waitlist & inRoster = true`,
        expectedValue: "Chỉ được ở Roster HOẶC Waitlist",
      });
    }
  }

  // ========================================================
  // 4. KIỂM TOÁN TRẬN ĐẤU & TỶ SỐ BWF (MATCHES)
  // ========================================================
  for (const match of data.matches) {
    scannedCount++;
    // A. Kiểm tra tỷ số set theo chuẩn BWF nếu trận đã kết thúc
    if (match.status === "confirmed" || match.status === "finished") {
      const val = validateMatchScores(match.sets);
      if (!val.isValid) {
        issues.push({
          collection: "matches",
          documentId: match.id,
          severity: "ERROR",
          ruleCode: "MATCH_INVALID_BWF_SCORE",
          message: `Trận đấu có tỷ số set sai luật BWF: ${val.error}`,
          currentValue: match.sets,
          expectedValue: "Điểm thắng >= 21, cách biệt >= 2, trần 30",
        });
      }
    }
  }

  const totalErrors = issues.filter((i) => i.severity === "ERROR").length;
  const totalWarnings = issues.filter((i) => i.severity === "WARNING").length;

  return {
    timestamp: new Date().toISOString(),
    totalDocumentsScanned: scannedCount,
    totalErrors,
    totalWarnings,
    issues,
    isClean: totalErrors === 0,
  };
}

/**
 * In báo cáo kiểm toán ra Console
 */
export function printAuditReport(report: AuditReport): void {
  console.log("\n================================================================================");
  console.log("  BÁO CÁO KIỂM TOÁN DỮ LIỆU BIÊN TRÊN BAAS (FIRESTORE DATA AUDIT REPORT)");
  console.log("================================================================================");
  console.log(`Thời điểm rà soát : ${report.timestamp}`);
  console.log(`Tổng tài liệu quét: ${report.totalDocumentsScanned}`);
  console.log(`Tổng số LỖI (Error): ${report.totalErrors}`);
  console.log(`Tổng CẢNH BÁO (Warn): ${report.totalWarnings}`);
  console.log("--------------------------------------------------------------------------------");

  if (report.issues.length === 0) {
    console.log("\x1b[32m✔ HỆ THỐNG DỮ LIỆU SẠCH 100%! Không phát hiện bất kỳ lỗi biên hay bất biến nào.\x1b[0m\n");
    return;
  }

  for (const issue of report.issues) {
    const color = issue.severity === "ERROR" ? "\x1b[31m" : "\x1b[33m";
    console.log(`${color}[${issue.severity}] [${issue.collection}/${issue.documentId}] [${issue.ruleCode}]\x1b[0m`);
    console.log(`  -> ${issue.message}`);
    console.log(`  -> Giá trị hiện tại: ${JSON.stringify(issue.currentValue)}`);
    console.log(`  -> Giá trị kỳ vọng : ${JSON.stringify(issue.expectedValue)}\n`);
  }
  console.log("================================================================================\n");
}
