import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import {
  createUserProfile,
  CreateUserInput,
} from '../../src/domain/user/userProfile';

const PROJECT_ID = 'badminton-danang-auth-test';
const RULES_PATH = path.resolve(__dirname, '../../firestore.rules');

function isEmulatorRunning(): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get('http://127.0.0.1:8080', () => resolve(true));
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

describe('Firebase Integration: Auth & Profile Flow (WBS 3.1 & M3)', () => {
  let testEnv: RulesTestEnvironment;
  let emulatorAvailable = false;

  beforeAll(async () => {
    emulatorAvailable = await isEmulatorRunning();
    if (!emulatorAvailable) {
      console.warn(
        '\n[NOTICE] Firestore emulator not detected on 127.0.0.1:8080. ' +
        'Skipping Auth Profile integration test suite. ' +
        'Run "npm run test:rules" to launch the emulator.\n'
      );
      return;
    }

    const rules = fs.readFileSync(RULES_PATH, 'utf8');
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules,
        host: '127.0.0.1',
        port: 8080,
      },
    });
  });

  afterAll(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async () => {
    if (testEnv) {
      await testEnv.clearFirestore();
    }
  });

  const authedDb = (uid: string, token: Record<string, any> = {}) =>
    testEnv.authenticatedContext(uid, token).firestore();

  const runTest = (name: string, fn: () => Promise<void>) => {
    it(name, async () => {
      if (!emulatorAvailable) return;
      await fn();
    });
  };

  const sampleAnswers = [3, 3, 2, 3, 3, 2, 3, 3, 2, 3]; // Tổng 27 -> Cấp 3, Elo 1425
  const newPlayerInput: CreateUserInput = {
    uid: 'usr_new_player_01',
    displayName: 'Nguyễn Đức Đạt',
    gender: 'M',
    phoneNumber: '0905123456',
    areaLabel: 'Hải Châu',
    position: 'front',
    dominantHand: 'right',
    onboardingAnswers: sampleAnswers,
  };

  runTest('INT-1: Người chơi mới đăng ký và lưu Profile Onboarding hợp lệ lên Firestore Emulator', async () => {
    // 1. Domain tạo Profile chuẩn
    const newProfile = createUserProfile(newPlayerInput);

    // 2. Client ghi vào Firestore với Auth của chính mình
    const db = authedDb(newProfile.uid);
    const userDocRef = doc(db, 'users', newProfile.uid);

    await assertSucceeds(setDoc(userDocRef, newProfile));

    // 3. Đọc lại và kiểm tra toàn vẹn
    const snap = await getDoc(userDocRef);
    expect(snap.exists()).toBe(true);
    const data = snap.data();
    expect(data?.displayName).toBe('Nguyễn Đức Đạt');
    expect(data?.role).toBe('player');
    expect(data?.skill?.rating).toBe(1425);
    expect(data?.skill?.reliability).toBe(100);
    expect(data?.skill?.isProvisional).toBe(true);
    expect(data?.skill?.matchesPlayed).toBe(0);
  });

  runTest('INT-2: Người chơi cập nhật thông tin cá nhân (displayName, position, areaLabel) thành công', async () => {
    const profile = createUserProfile(newPlayerInput);
    const db = authedDb(profile.uid);
    const userDocRef = doc(db, 'users', profile.uid);

    await setDoc(userDocRef, profile);

    // Cập nhật thông tin cho phép
    await assertSucceeds(
      updateDoc(userDocRef, {
        displayName: 'Đạt Nguyễn (Net Master)',
        position: 'both',
        areaLabel: 'Thanh Khê',
      })
    );

    const updatedSnap = await getDoc(userDocRef);
    expect(updatedSnap.data()?.displayName).toBe('Đạt Nguyễn (Net Master)');
    expect(updatedSnap.data()?.position).toBe('both');
    expect(updatedSnap.data()?.areaLabel).toBe('Thanh Khê');
  });

  runTest('INT-3: [BẢO MẬT] Cố tình tự sửa điểm Elo (skill.rating) bị Firestore Rules chặn đứng', async () => {
    const profile = createUserProfile(newPlayerInput);
    const db = authedDb(profile.uid);
    const userDocRef = doc(db, 'users', profile.uid);

    await setDoc(userDocRef, profile);

    // Cố tình sửa rating từ 1425 lên 1800
    await assertFails(
      updateDoc(userDocRef, {
        'skill.rating': 1800,
      })
    );
  });

  runTest('INT-4: [BẢO MẬT] Cố tình tự đổi role từ player sang admin bị Firestore Rules chặn đứng', async () => {
    const profile = createUserProfile(newPlayerInput);
    const db = authedDb(profile.uid);
    const userDocRef = doc(db, 'users', profile.uid);

    await setDoc(userDocRef, profile);

    // Cố tình leo thang đặc quyền
    await assertFails(
      updateDoc(userDocRef, {
        role: 'admin',
      })
    );
  });

  runTest('INT-5: Người chơi khác (đã đăng nhập) có thể đọc hồ sơ để ghép kèo/tìm đồng đội', async () => {
    const profile = createUserProfile(newPlayerInput);
    const dbOwner = authedDb(profile.uid);
    await setDoc(doc(dbOwner, 'users', profile.uid), profile);

    // Player khác đọc
    const dbOther = authedDb('usr_other_player');
    await assertSucceeds(getDoc(doc(dbOther, 'users', profile.uid)));
  });
});
