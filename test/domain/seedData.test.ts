/**
 * TEST SUITE: SEED DATA INTEGRITY & AUDIT (WBS 5.3 & M9)
 */

import { executeSeedProcess, getFullSeedDataset } from "../../scripts/seed";
import { auditDatabaseSnapshot } from "../../scripts/audit-data";

describe("Seed Data Integrity Test (24 Users, 6 Levels, 4 Sessions, Waitlist & Matches)", () => {
  it("Dữ liệu Seed phải có đầy đủ 24 người chơi, đủ 6 cấp độ và sạch 100% khi audit", async () => {
    const dataset = await executeSeedProcess({ reset: true });
    expect(dataset.users.length).toBe(24);
    expect(dataset.sessions.length).toBe(4);
    expect(dataset.requests.length).toBe(2);
    expect(dataset.matches.length).toBe(5);

    // Kiểm tra phân bổ đủ 6 cấp độ
    const levels = new Set(dataset.users.map((u) => u.selfDeclaredLevel));
    expect(levels.has(1)).toBe(true);
    expect(levels.has(2)).toBe(true);
    expect(levels.has(3)).toBe(true);
    expect(levels.has(4)).toBe(true);
    expect(levels.has(5)).toBe(true);
    expect(levels.has(6)).toBe(true);

    // Kiểm tra kiểm toán sạch
    const report = auditDatabaseSnapshot(dataset);
    expect(report.isClean).toBe(true);
    expect(report.totalErrors).toBe(0);
  });

  it("Tài khoản trong seed data phải có đủ cả Nam và Nữ, và các vị trí thi đấu", () => {
    const dataset = getFullSeedDataset();
    const males = dataset.users.filter((u) => u.gender === "M");
    const females = dataset.users.filter((u) => u.gender === "F");
    expect(males.length).toBeGreaterThan(0);
    expect(females.length).toBeGreaterThan(0);

    const positions = new Set(dataset.users.map((u) => u.position));
    expect(positions.has("front")).toBe(true);
    expect(positions.has("back")).toBe(true);
    expect(positions.has("both")).toBe(true);
  });
});
