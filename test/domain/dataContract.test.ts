import * as fs from "fs";
import * as path from "path";
import {
  UserProfile,
  SessionDoc,
  CourtDoc,
  JoinRequestDoc,
  MatchDoc,
  BestPartnerStat,
  NotificationDoc,
} from "../../src/domain/types";

describe("Data Contract & Mock Samples Validation", () => {
  const mockDir = path.resolve(__dirname, "../../docs/api/mock-samples");

  test("1. users.json phải tồn tại, hợp lệ và có ít nhất 8 người chơi đa dạng", () => {
    const filePath = path.join(mockDir, "users.json");
    expect(fs.existsSync(filePath)).toBe(true);

    const users: UserProfile[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    expect(users.length).toBeGreaterThanOrEqual(8);

    // Kiểm tra cấu trúc từng user
    const levelsFound = new Set<number>();
    let hasMale = false;
    let hasFemale = false;
    let hasLeftHanded = false;

    for (const u of users) {
      expect(u.uid).toBeTruthy();
      expect(u.displayName).toBeTruthy();
      expect(["M", "F"]).toContain(u.gender);
      expect(["front", "back", "both"]).toContain(u.position);
      expect(["right", "left"]).toContain(u.dominantHand);
      expect(u.selfDeclaredLevel).toBeGreaterThanOrEqual(1);
      expect(u.selfDeclaredLevel).toBeLessThanOrEqual(6);
      expect(["player", "host", "admin"]).toContain(u.role);

      expect(u.skill.rating).toBeGreaterThanOrEqual(800);
      expect(u.skill.rating).toBeLessThanOrEqual(2200);
      expect(u.skill.reliability).toBeGreaterThanOrEqual(0);
      expect(u.skill.reliability).toBeLessThanOrEqual(100);
      expect(typeof u.skill.isProvisional).toBe("boolean");
      expect(u.schemaVersion).toBe(1);

      levelsFound.add(u.selfDeclaredLevel);
      if (u.gender === "M") hasMale = true;
      if (u.gender === "F") hasFemale = true;
      if (u.dominantHand === "left") hasLeftHanded = true;
    }

    // Đảm bảo có cả nam, nữ, tay trái và đa dạng trình độ
    expect(hasMale).toBe(true);
    expect(hasFemale).toBe(true);
    expect(hasLeftHanded).toBe(true);
    expect(levelsFound.size).toBeGreaterThanOrEqual(5);
  });

  test("2. sessions.json phải chứa ít nhất 2 kèo hợp lệ (1 kèo 1 sân, 1 kèo 2 sân)", () => {
    const filePath = path.join(mockDir, "sessions.json");
    expect(fs.existsSync(filePath)).toBe(true);

    const sessions: SessionDoc[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    expect(sessions.length).toBeGreaterThanOrEqual(2);

    const singleCourtSession = sessions.find((s) => s.courtCount === 1);
    const doubleCourtSession = sessions.find((s) => s.courtCount === 2);

    expect(singleCourtSession).toBeDefined();
    expect(doubleCourtSession).toBeDefined();

    for (const s of sessions) {
      expect(s.id).toBeTruthy();
      expect(s.hostId).toBeTruthy();
      expect(s.hostName).toBeTruthy();
      expect(s.venueName).toBeTruthy();
      expect(s.district).toBeTruthy();
      expect(s.durationMin).toBeGreaterThan(0);
      expect(s.costPerPlayer).toBeGreaterThan(0);
      expect(["open", "full", "in_progress", "completed", "cancelled"]).toContain(s.status);
      expect(s.courtSummaries.length).toBe(s.courtCount);
      expect(s.openSlotsTotal).toBeGreaterThanOrEqual(0);
    }
  });

  test("3. courts.json phải tuân thủ nghiêm ngặt bất biến dữ liệu (I1-I5)", () => {
    const filePath = path.join(mockDir, "courts.json");
    expect(fs.existsSync(filePath)).toBe(true);

    const courts: CourtDoc[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    expect(courts.length).toBeGreaterThanOrEqual(3);

    for (const c of courts) {
      expect(["1", "2"]).toContain(c.id);
      expect(["men", "women", "mixed"]).toContain(c.category);
      expect(c.levelMin).toBeLessThanOrEqual(c.levelMax);
      expect(c.minReliability).toBeGreaterThanOrEqual(0);
      expect(c.version).toBeGreaterThan(0);

      // Bất biến I1: Roster tối đa 8 người
      const members = Object.values(c.roster);
      expect(members.length).toBeLessThanOrEqual(8);

      // Bất biến I2: Số recruit tối đa 4
      const recruits = members.filter((m) => m.type === "recruit");
      expect(recruits.length).toBeLessThanOrEqual(4);

      // Kiểm tra thành viên
      for (const m of members) {
        expect(m.memberId).toBeTruthy();
        expect(m.displayName).toBeTruthy();
        expect(["M", "F"]).toContain(m.gender);
        expect(["core", "recruit"]).toContain(m.type);
        expect(typeof m.isGhost).toBe("boolean");
      }
    }
  });

  test("4. requests.json phải chứa cả đơn chờ duyệt và đơn trong Waitlist", () => {
    const filePath = path.join(mockDir, "requests.json");
    expect(fs.existsSync(filePath)).toBe(true);

    const requests: JoinRequestDoc[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    expect(requests.length).toBeGreaterThanOrEqual(2);

    const waitlistReq = requests.find((r) => r.status === "waitlist");
    expect(waitlistReq).toBeDefined();
    expect(waitlistReq?.waitlistPosition).toBe(1);

    for (const r of requests) {
      expect(r.userId).toBeTruthy();
      expect(r.courtId).toBeTruthy();
      expect(r.sessionId).toBeTruthy();
      expect(r.snapshot.displayName).toBeTruthy();
      expect(r.snapshot.rating).toBeGreaterThan(0);
    }
  });

  test("5. matches.json phải có tỷ số set đấu hợp lệ và thẻ đánh giá", () => {
    const filePath = path.join(mockDir, "matches.json");
    expect(fs.existsSync(filePath)).toBe(true);

    const matches: MatchDoc[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    expect(matches.length).toBeGreaterThanOrEqual(1);

    for (const m of matches) {
      expect(m.teamA.length).toBe(2);
      expect(m.teamB.length).toBe(2);
      expect(m.sets.length).toBeGreaterThanOrEqual(1);
      expect(m.status).toBe("confirmed");
      expect(m.ratingProcessed).toBe(true);

      if (m.cards) {
        expect(m.cards.length).toBeGreaterThan(0);
        for (const card of m.cards) {
          expect(["correct_level", "plays_better", "good_attitude"]).toContain(card.tag);
        }
      }
    }
  });

  test("6. bestPartners.json phải đáp ứng tiêu chí >= 3 trận và winRate >= 60%", () => {
    const filePath = path.join(mockDir, "bestPartners.json");
    expect(fs.existsSync(filePath)).toBe(true);

    const partners: BestPartnerStat[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    expect(partners.length).toBeGreaterThanOrEqual(1);

    for (const p of partners) {
      expect(p.matchesCount).toBeGreaterThanOrEqual(3);
      expect(p.winRate).toBeGreaterThanOrEqual(0.6);
      expect(p.winsCount).toBeLessThanOrEqual(p.matchesCount);
    }
  });

  test("7. notifications.json phải có cấu trúc thông báo chuẩn", () => {
    const filePath = path.join(mockDir, "notifications.json");
    expect(fs.existsSync(filePath)).toBe(true);

    const notifs: NotificationDoc[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    expect(notifs.length).toBeGreaterThanOrEqual(2);

    for (const n of notifs) {
      expect(n.userId).toBeTruthy();
      expect(n.title).toBeTruthy();
      expect(n.body).toBeTruthy();
      expect(typeof n.read).toBe("boolean");
    }
  });
});
