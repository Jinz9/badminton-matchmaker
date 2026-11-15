/**
 * TEST SUITE: AUDIT DATA SCRIPT (BÁO CÁO LỖI DỮ LIỆU BIÊN TRÊN BAAS)
 */

import { auditDatabaseSnapshot } from "../../scripts/audit-data";
import { UserProfile, CourtDoc } from "../../src/domain/types";

describe("Data Audit Script: Boundary & Invariant Validation", () => {
  it("Báo cáo sạch (isClean = true) khi toàn bộ dữ liệu hợp lệ", () => {
    const validUser: UserProfile = {
      uid: "u1",
      displayName: "Nguyễn Văn A",
      gender: "M",
      areaLabel: "Hải Châu",
      position: "both",
      dominantHand: "right",
      selfDeclaredLevel: 3,
      role: "player",
      fcmTokens: [],
      schemaVersion: 1,
      isDeleted: false,
      skill: { rating: 1450, matchesPlayed: 10, reliability: 80, isProvisional: false },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const validCourt: CourtDoc = {
      id: "c1",
      sessionId: "s1",
      courtNumber: 1,
      category: "men",
      levelMin: 2,
      levelMax: 5,
      minReliability: 60,
      pairingMode: "auto",
      recruitOpen: true,
      roster: {},
      pairs: [],
      version: 1,
      updatedAt: new Date().toISOString(),
    };

    const report = auditDatabaseSnapshot({
      users: [validUser],
      sessions: [{
        id: "s1",
        hostId: "u1",
        hostName: "Nguyễn Văn A",
        hostReputation: 90,
        title: "Kèo chuẩn",
        venueName: "Tuyên Sơn",
        address: "Hải Châu",
        district: "Hải Châu",
        startsAt: new Date().toISOString(),
        durationMin: 120,
        costPerPlayer: 50000,
        status: "open",
        courtCount: 1,
        courtSummaries: [],
        openSlotsTotal: 4,
        schemaVersion: 1,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }],
      courts: [validCourt],
      matches: [],
      requests: [],
      ratings: [],
    });

    expect(report.isClean).toBe(true);
    expect(report.totalErrors).toBe(0);
  });

  it("Phát hiện lỗi khi Elo ngoài thang [800, 2200] hoặc Level ngoài [1, 6]", () => {
    const brokenUser: UserProfile = {
      uid: "broken_u",
      displayName: "User Hỏng",
      gender: "M",
      areaLabel: "Hải Châu",
      position: "both",
      dominantHand: "right",
      selfDeclaredLevel: 7 as any, // Level 7 sai thang
      role: "player",
      fcmTokens: [],
      schemaVersion: 1,
      isDeleted: false,
      skill: { rating: 2500, matchesPlayed: 10, reliability: 80, isProvisional: false }, // 2500 vượt trần 2200
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const report = auditDatabaseSnapshot({
      users: [brokenUser],
      sessions: [],
      courts: [],
      matches: [],
      requests: [],
      ratings: [],
    });

    expect(report.isClean).toBe(false);
    expect(report.totalErrors).toBe(2);
    expect(report.issues.some((i) => i.ruleCode === "USER_RATING_OUT_OF_BOUNDS")).toBe(true);
    expect(report.issues.some((i) => i.ruleCode === "USER_LEVEL_OUT_OF_BOUNDS")).toBe(true);
  });

  it("Phát hiện lỗi khi Kèo có courtCount > 2 hoặc sân quá 8 người", () => {
    const overbookedCourt: CourtDoc = {
      id: "c_full",
      sessionId: "s_bad",
      courtNumber: 1,
      category: "men",
      levelMin: 2,
      levelMax: 5,
      minReliability: 60,
      pairingMode: "auto",
      recruitOpen: true,
      roster: {
        p1: { memberId: "p1", displayName: "P1", gender: "M", type: "core", rating: 1400, level: 3, position: "both", dominantHand: "right", isGhost: false, joinedAt: "", checkedIn: false },
        p2: { memberId: "p2", displayName: "P2", gender: "M", type: "core", rating: 1400, level: 3, position: "both", dominantHand: "right", isGhost: false, joinedAt: "", checkedIn: false },
        p3: { memberId: "p3", displayName: "P3", gender: "M", type: "core", rating: 1400, level: 3, position: "both", dominantHand: "right", isGhost: false, joinedAt: "", checkedIn: false },
        p4: { memberId: "p4", displayName: "P4", gender: "M", type: "core", rating: 1400, level: 3, position: "both", dominantHand: "right", isGhost: false, joinedAt: "", checkedIn: false },
        p5: { memberId: "p5", displayName: "P5", gender: "M", type: "core", rating: 1400, level: 3, position: "both", dominantHand: "right", isGhost: false, joinedAt: "", checkedIn: false },
        p6: { memberId: "p6", displayName: "P6", gender: "M", type: "core", rating: 1400, level: 3, position: "both", dominantHand: "right", isGhost: false, joinedAt: "", checkedIn: false },
        p7: { memberId: "p7", displayName: "P7", gender: "M", type: "core", rating: 1400, level: 3, position: "both", dominantHand: "right", isGhost: false, joinedAt: "", checkedIn: false },
        p8: { memberId: "p8", displayName: "P8", gender: "M", type: "core", rating: 1400, level: 3, position: "both", dominantHand: "right", isGhost: false, joinedAt: "", checkedIn: false },
        p9: { memberId: "p9", displayName: "P9", gender: "M", type: "core", rating: 1400, level: 3, position: "both", dominantHand: "right", isGhost: false, joinedAt: "", checkedIn: false }, // 9 người
      },
      pairs: [],
      version: 1,
      updatedAt: new Date().toISOString(),
    };

    const report = auditDatabaseSnapshot({
      users: [],
      sessions: [{
        id: "s_bad",
        hostId: "u1",
        hostName: "Host",
        hostReputation: 90,
        title: "Kèo 3 sân sai luật",
        venueName: "Sân X",
        address: "ĐN",
        district: "Hải Châu",
        startsAt: new Date().toISOString(),
        durationMin: 120,
        costPerPlayer: 50000,
        status: "open",
        courtCount: 3 as any, // courtCount > 2
        courtSummaries: [],
        openSlotsTotal: 0,
        schemaVersion: 1,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }],
      courts: [overbookedCourt],
      matches: [],
      requests: [],
      ratings: [],
    });

    expect(report.issues.some((i) => i.ruleCode === "SESSION_INVALID_COURT_COUNT")).toBe(true);
    expect(report.issues.some((i) => i.ruleCode === "COURT_OVERBOOKED")).toBe(true);
  });
});
