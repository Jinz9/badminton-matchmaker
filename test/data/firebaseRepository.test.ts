import {
  createRepository,
  getConfiguredDataSource,
  setRepository,
} from "../../src/data";
import { FirebaseRepository } from "../../src/data/FirebaseRepository";
import { MockRepository } from "../../src/data/MockRepository";
import {
  getAuthService,
  setAuthService,
  FirebaseAuthService,
  MockAuthService,
} from "../../src/data/auth";
import {
  getFirebaseAuth,
  getFirebaseDb,
  getFirebaseFunctions,
  resetFirebaseClientCache,
  resolveEmulatorSettings,
} from "../../src/data/firebase/client";
import {
  isPermissionDeniedError,
  mapFirebaseError,
} from "../../src/data/firebase/errors";

// Mock modular Firebase SDKs
const mockConnectAuthEmulator = jest.fn((..._args: unknown[]) => undefined);
const mockInitializeAuth = jest.fn((..._args: unknown[]) => ({ currentUser: null }));
const mockGetAuth = jest.fn((..._args: unknown[]) => ({ currentUser: null }));
const mockSignInWithEmailAndPassword = jest.fn();
const mockCreateUserWithEmailAndPassword = jest.fn();
const mockSignOut = jest.fn();
const mockSendPasswordResetEmail = jest.fn();
const mockOnAuthStateChanged = jest.fn();
const mockUpdateAuthProfile = jest.fn();

jest.mock("firebase/app", () => ({
  getApps: jest.fn(() => []),
  getApp: jest.fn(() => ({ name: "[DEFAULT]" })),
  initializeApp: jest.fn(() => ({ name: "[DEFAULT]" })),
}));

jest.mock("firebase/auth", () => ({
  initializeAuth: (...args: unknown[]) => mockInitializeAuth(...args),
  getAuth: (...args: unknown[]) => mockGetAuth(...args),
  getReactNativePersistence: jest.fn(() => ({ type: "ASYNC_STORAGE" })),
  connectAuthEmulator: (...args: unknown[]) => mockConnectAuthEmulator(...args),
  signInWithEmailAndPassword: (...args: unknown[]) =>
    mockSignInWithEmailAndPassword(...args),
  createUserWithEmailAndPassword: (...args: unknown[]) =>
    mockCreateUserWithEmailAndPassword(...args),
  signOut: (...args: unknown[]) => mockSignOut(...args),
  sendPasswordResetEmail: (...args: unknown[]) =>
    mockSendPasswordResetEmail(...args),
  onAuthStateChanged: (...args: unknown[]) => mockOnAuthStateChanged(...args),
  updateProfile: (...args: unknown[]) => mockUpdateAuthProfile(...args),
}));

const mockConnectFirestoreEmulator = jest.fn((..._args: unknown[]) => undefined);
const mockInitializeFirestore = jest.fn((..._args: unknown[]) => ({ __type: "firestore" }));
const mockGetFirestore = jest.fn((..._args: unknown[]) => ({ __type: "firestore" }));
const mockDoc = jest.fn((_db, ...segments: string[]) => ({
  id: segments[segments.length - 1] || "auto_id",
  path: segments.join("/"),
}));
const mockCollection = jest.fn((_db, ...segments: string[]) => ({
  path: segments.join("/"),
}));
const mockCollectionGroup = jest.fn((_db, name: string) => ({
  group: name,
}));
const mockGetDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockSetDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockAddDoc = jest.fn();
const mockOnSnapshot = jest.fn();
const mockRunTransaction = jest.fn();
const mockBatchSet = jest.fn((..._args: unknown[]) => undefined);
const mockBatchCommit = jest.fn((..._args: unknown[]) => Promise.resolve());
const mockWriteBatch = jest.fn((..._args: unknown[]) => ({
  set: mockBatchSet,
  commit: mockBatchCommit,
}));

jest.mock("firebase/firestore", () => ({
  initializeFirestore: (...args: unknown[]) => mockInitializeFirestore(...args),
  getFirestore: (...args: unknown[]) => mockGetFirestore(...args),
  connectFirestoreEmulator: (...args: unknown[]) =>
    mockConnectFirestoreEmulator(...args),
  doc: (...args: unknown[]) => mockDoc(...(args as [unknown, ...string[]])),
  collection: (...args: unknown[]) =>
    mockCollection(...(args as [unknown, ...string[]])),
  collectionGroup: (...args: unknown[]) =>
    mockCollectionGroup(...(args as [unknown, string])),
  query: jest.fn((...args: unknown[]) => ({ queryArgs: args })),
  where: jest.fn((...args: unknown[]) => ({ where: args })),
  orderBy: jest.fn((...args: unknown[]) => ({ orderBy: args })),
  limit: jest.fn((...args: unknown[]) => ({ limit: args })),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
  updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),
  addDoc: (...args: unknown[]) => mockAddDoc(...args),
  onSnapshot: (...args: unknown[]) => mockOnSnapshot(...args),
  runTransaction: (...args: unknown[]) => mockRunTransaction(...args),
  writeBatch: (...args: unknown[]) => mockWriteBatch(...args),
}));

const mockConnectFunctionsEmulator = jest.fn((..._args: unknown[]) => undefined);
const mockGetFunctions = jest.fn((..._args: unknown[]) => ({ __type: "functions" }));
const mockCallableInvoke = jest.fn((..._args: unknown[]) => Promise.resolve({ data: {} }));
const mockHttpsCallable = jest.fn((..._args: unknown[]) => mockCallableInvoke);

jest.mock("firebase/functions", () => ({
  getFunctions: (...args: unknown[]) => mockGetFunctions(...args),
  connectFunctionsEmulator: (...args: unknown[]) =>
    mockConnectFunctionsEmulator(...args),
  httpsCallable: (...args: unknown[]) => mockHttpsCallable(...args),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe("Firebase Integration (Q11)", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    resetFirebaseClientCache();
    setRepository(null);
    setAuthService(null);
    process.env = { ...originalEnv };
    delete process.env.EXPO_PUBLIC_DATA_SOURCE;
    delete process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR;
    delete process.env.EXPO_PUBLIC_USE_EMULATOR;
    delete process.env.EXPO_PUBLIC_EMULATOR_HOST;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("Data source & Emulator config", () => {
    it("chuyển đổi giữa MockRepository và FirebaseRepository theo EXPO_PUBLIC_DATA_SOURCE", () => {
      expect(getConfiguredDataSource()).toBe("mock");
      expect(createRepository()).toBeInstanceOf(MockRepository);
      expect(getAuthService()).toBeInstanceOf(MockAuthService);

      setAuthService(null);
      process.env.EXPO_PUBLIC_DATA_SOURCE = "firebase";
      expect(getConfiguredDataSource()).toBe("firebase");
      expect(createRepository()).toBeInstanceOf(FirebaseRepository);
      expect(getAuthService()).toBeInstanceOf(FirebaseAuthService);
    });

    it("đọc cấu hình Emulator hỗ trợ cả EXPO_PUBLIC_USE_FIREBASE_EMULATOR và EXPO_PUBLIC_USE_EMULATOR", () => {
      process.env.EXPO_PUBLIC_USE_EMULATOR = "true";
      process.env.EXPO_PUBLIC_EMULATOR_HOST = "192.168.1.50";

      const settings = resolveEmulatorSettings();
      expect(settings).toEqual({
        enabled: true,
        host: "192.168.1.50",
        authPort: 9099,
        firestorePort: 8080,
        functionsPort: 5001,
      });
    });

    it("kết nối Auth, Firestore (long polling), Functions Emulator đúng cổng 9099/8080/5001 một lần duy nhất", () => {
      process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR = "true";
      process.env.EXPO_PUBLIC_EMULATOR_HOST = "10.0.2.2";

      getFirebaseAuth();
      getFirebaseDb();
      getFirebaseFunctions();
      // Gọi lại lần 2 không nối lại emulator
      getFirebaseAuth();
      getFirebaseDb();
      getFirebaseFunctions();

      expect(mockInitializeFirestore).toHaveBeenCalledWith(
        expect.anything(),
        { experimentalAutoDetectLongPolling: true }
      );
      expect(mockConnectAuthEmulator).toHaveBeenCalledTimes(1);
      expect(mockConnectAuthEmulator).toHaveBeenCalledWith(
        expect.anything(),
        "http://10.0.2.2:9099",
        { disableWarnings: true }
      );
      expect(mockConnectFirestoreEmulator).toHaveBeenCalledTimes(1);
      expect(mockConnectFirestoreEmulator).toHaveBeenCalledWith(
        expect.anything(),
        "10.0.2.2",
        8080
      );
      expect(mockConnectFunctionsEmulator).toHaveBeenCalledTimes(1);
      expect(mockConnectFunctionsEmulator).toHaveBeenCalledWith(
        expect.anything(),
        "10.0.2.2",
        5001
      );
    });
  });

  describe("FirebaseRepository CRUD, Realtime & Security Rules errors", () => {
    it("subscribe('sessions') nhận cập nhật realtime từ onSnapshot và không crash khi bị permission-denied", () => {
      const repo = new FirebaseRepository();
      const unsubMock = jest.fn();
      mockOnSnapshot.mockImplementation((_ref, onNext, onError) => {
        onNext({
          docs: [
            {
              id: "sess_1",
              data: () => ({
                hostId: "u1",
                title: "Kèo Tiên Sơn",
                status: "open",
              }),
            },
          ],
        });
        // Giả lập Security Rules từ chối bất ngờ -> không throw
        onError({ code: "permission-denied", message: "Missing permissions" });
        return unsubMock;
      });

      const received: unknown[] = [];
      const unsub = repo.subscribe("sessions", (data) => received.push(data));
      expect(received).toHaveLength(1);
      expect((received[0] as Array<{ id: string }>)[0].id).toBe("sess_1");
      unsub();
      expect(unsubMock).toHaveBeenCalledTimes(1);
    });

    it("getProfile trả về null nếu isDeleted=true hoặc không tồn tại, và báo lỗi tiếng Việt khi permission-denied", async () => {
      const repo = new FirebaseRepository();

      mockGetDoc.mockResolvedValueOnce({ exists: () => false });
      await expect(repo.getProfile("u_missing")).resolves.toBeNull();

      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ uid: "u_del", isDeleted: true }),
      });
      await expect(repo.getProfile("u_del")).resolves.toBeNull();

      mockGetDoc.mockRejectedValueOnce({
        code: "permission-denied",
        message: "PERMISSION_DENIED",
      });
      await expect(repo.getProfile("u_1")).rejects.toThrow(
        "Bạn không có quyền thực hiện thao tác này"
      );
    });

    it("confirmMatchResult lưu thẻ đánh giá (nếu có) và gọi Cloud Function finishMatch", async () => {
      const repo = new FirebaseRepository();
      mockAddDoc.mockResolvedValueOnce({ id: "match_1" });
      const createdId = await repo.createMatch({
        sessionId: "sess_1",
        courtId: "1",
        index: 1,
        category: "men",
        teamA: ["u1", "u2"],
        teamB: ["u3", "u4"],
        sets: [],
        cards: [],
      });
      expect(createdId).toBe("match_1");

      mockUpdateDoc.mockResolvedValueOnce(undefined);
      mockCallableInvoke.mockResolvedValueOnce({ data: { ok: true } });

      await repo.confirmMatchResult("match_1", "host_1", [
        { fromUserId: "u1", toUserId: "u2", tag: "correct_level" },
      ]);

      expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
      expect(mockHttpsCallable).toHaveBeenCalledWith(
        expect.anything(),
        "finishMatch"
      );
      expect(mockCallableInvoke).toHaveBeenCalledWith({
        matchId: "match_1",
        hostId: "host_1",
        cards: [{ fromUserId: "u1", toUserId: "u2", tag: "correct_level" }],
      });
    });

    it("cancelParticipation fallback tự rút khỏi roster khi Cloud Function chưa triển khai (functions/not-found)", async () => {
      const repo = new FirebaseRepository();
      mockCallableInvoke.mockRejectedValueOnce({ code: "functions/not-found" });

      const txUpdate = jest.fn();
      mockRunTransaction.mockImplementationOnce(async (_db, fn) => {
        const tx = {
          get: jest.fn().mockResolvedValue({
            exists: () => true,
            data: () => ({
              version: 3,
              roster: {
                u1: { memberId: "u1" },
                u2: { memberId: "u2" },
              },
            }),
          }),
          update: txUpdate,
        };
        return fn(tx);
      });
      mockUpdateDoc.mockResolvedValueOnce(undefined);

      const res = await repo.cancelParticipation("sess_1", "1", "u1");
      expect(res).toEqual({ penalty: 0 });
      expect(txUpdate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          version: 4,
          roster: { u2: { memberId: "u2" } },
        })
      );
    });

    it("mapFirebaseError nhận diện permission-denied thân thiện", () => {
      const err = { code: "permission-denied", message: "Missing permissions" };
      expect(isPermissionDeniedError(err)).toBe(true);
      const mapped = mapFirebaseError(err);
      expect(mapped.message).toContain("quy tắc bảo mật");
    });
  });

  describe("FirebaseAuthService", () => {
    it("login / register / sendResetCode hoạt động với modular Auth SDK và map lỗi mật khẩu sai", async () => {
      const authSvc = new FirebaseAuthService();

      mockSignInWithEmailAndPassword.mockResolvedValueOnce({
        user: {
          uid: "uid_1",
          email: "an@example.com",
          displayName: "An",
          phoneNumber: null,
        },
      });
      const user = await authSvc.login("An@example.com", "123456");
      expect(user).toEqual({
        uid: "uid_1",
        email: "an@example.com",
        displayName: "An",
        phoneNumber: undefined,
        verified: true,
      });

      mockSignInWithEmailAndPassword.mockRejectedValueOnce({
        code: "auth/wrong-password",
      });
      await expect(
        authSvc.login("an@example.com", "wrongpw")
      ).rejects.toThrow("Email hoặc mật khẩu không đúng.");

      mockSendPasswordResetEmail.mockResolvedValueOnce(undefined);
      await authSvc.sendResetCode("an@example.com");
      expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(
        expect.anything(),
        "an@example.com"
      );
    });
  });
});

