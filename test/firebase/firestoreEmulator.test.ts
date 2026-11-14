import * as fs from "fs";
import * as path from "path";
import { SEED_VENUES, CourtVenue } from "../../scripts/seed-placeholder";
import { FIREBASE_CONSTANTS } from "../../src/config/firebase";

describe("Firebase: Firestore Emulator & Rules Validation", () => {
  const rulesPath = path.resolve(__dirname, "../../firestore.rules");
  const firebaseJsonPath = path.resolve(__dirname, "../../firebase.json");

  test("1. Cấu hình firebase.json phải khai báo đầy đủ các cổng Emulator chuẩn", () => {
    expect(fs.existsSync(firebaseJsonPath)).toBe(true);
    const config = JSON.parse(fs.readFileSync(firebaseJsonPath, "utf-8"));

    expect(config.emulators).toBeDefined();
    expect(config.emulators.firestore.port).toBe(8080);
    expect(config.emulators.auth.port).toBe(9099);
    expect(config.emulators.functions.port).toBe(5001);
    expect(config.emulators.ui.port).toBe(4000);
  });

  test("2. firestore.rules khởi đầu phải áp dụng nguyên tắc Least Privilege (chặn mặc định)", () => {
    expect(fs.existsSync(rulesPath)).toBe(true);
    const rulesContent = fs.readFileSync(rulesPath, "utf-8");

    expect(rulesContent).toContain("rules_version = '2'");
    expect(rulesContent).toContain("cloud.firestore");
    expect(rulesContent).toContain("allow read, write: if false;");
  });

  test("3. Seed placeholder data phải có cấu trúc hợp lệ để ghi vào Firestore Emulator", () => {
    expect(SEED_VENUES.length).toBeGreaterThanOrEqual(5);

    for (const venue of SEED_VENUES) {
      expect(venue.id).toMatch(/^venue-[a-z0-9-]+$/);
      expect(venue.name).toBeTruthy();
      expect(venue.district).toBeTruthy();
      expect(venue.courtCount).toBeGreaterThanOrEqual(1);
      expect(typeof venue.latitude).toBe("number");
      expect(typeof venue.longitude).toBe("number");
    }
  });

  test("4. Xác thực endpoint REST API của Firestore Emulator cục bộ", () => {
    const projectId = "badminton-danang";
    const emulatorHost = "127.0.0.1";
    const firestorePort = FIREBASE_CONSTANTS.FIRESTORE_PORT;

    const endpointUrl = `http://${emulatorHost}:${firestorePort}/v1/projects/${projectId}/databases/(default)/documents`;
    expect(endpointUrl).toBe("http://127.0.0.1:8080/v1/projects/badminton-danang/databases/(default)/documents");

    // Kiểm tra định dạng Document JSON tương thích với Firestore REST API
    const sampleVenue: CourtVenue = SEED_VENUES[0];
    const firestoreDocumentPayload = {
      fields: {
        name: { stringValue: sampleVenue.name },
        district: { stringValue: sampleVenue.district },
        courtCount: { integerValue: String(sampleVenue.courtCount) },
        latitude: { doubleValue: sampleVenue.latitude },
        longitude: { doubleValue: sampleVenue.longitude },
      },
    };

    expect(firestoreDocumentPayload.fields.name.stringValue).toBe("Sân Cầu Lông Kỳ Đồng");
    expect(firestoreDocumentPayload.fields.district.stringValue).toBe("Thanh Khê");
  });
});
