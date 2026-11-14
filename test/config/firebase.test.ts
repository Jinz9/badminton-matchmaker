import { firebaseConfig, FIREBASE_CONSTANTS } from "../../src/config/firebase";

describe("Config: Firebase Configuration", () => {
  test("Cấu hình Firebase phải có projectId định danh", () => {
    expect(firebaseConfig.projectId).toBeDefined();
    expect(typeof firebaseConfig.projectId).toBe("string");
  });

  test("Region máy chủ phải là asia-southeast1 (Singapore)", () => {
    expect(FIREBASE_CONSTANTS.REGION).toBe("asia-southeast1");
  });

  test("Cổng mặc định của Firebase Emulator", () => {
    expect(FIREBASE_CONSTANTS.FIRESTORE_PORT).toBe(8080);
    expect(FIREBASE_CONSTANTS.AUTH_PORT).toBe(9099);
  });
});

