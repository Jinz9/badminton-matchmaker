import {
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  createSessionTx,
  cancelSessionByHostTx,
  leaveSessionWithPenaltyTx,
} from '../../src/domain/lobby/transactions';
import { approveRecruitRequestTx } from '../../src/domain/recruit/transactions';
import { SessionDoc, CourtDoc, UserProfile, JoinRequestDoc } from '../../src/domain/types';

const PROJECT_ID = 'badminton-danang-lobby-test';
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

describe('Firebase Integration: Match Lobby Concurrency & Transactions (WBS 3.2 & M5)', () => {
  let testEnv: RulesTestEnvironment;
  let emulatorAvailable = false;

  beforeAll(async () => {
    emulatorAvailable = await isEmulatorRunning();
    if (!emulatorAvailable) {
      console.warn(
        '\n[NOTICE] Firestore emulator not detected on 127.0.0.1:8080. ' +
        'Skipping Match Lobby concurrency test suite. ' +
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

  const mockHost: UserProfile = {
    uid: 'host-lobby-01',
    displayName: 'Host Dũng',
    gender: 'M',
    areaLabel: 'Hải Châu',
    position: 'both',
    dominantHand: 'right',
    selfDeclaredLevel: 4,
    role: 'host',
    skill: { rating: 1600, matchesPlayed: 30, reliability: 95, isProvisional: false },
    fcmTokens: [],
    schemaVersion: 1,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('LOBBY-1: Tạo kèo 2 sân (CR-01) - Ghi đúng cấu trúc Session và 2 CourtDocs độc lập', async () => {
    if (!emulatorAvailable) return;

    await testEnv.withSecurityRulesDisabled(async (adminContext) => {
      const db = adminContext.firestore() as any;

      const createRes = await createSessionTx(db, mockHost, {
        title: 'Kèo 2 sân cuối tuần',
        venueName: 'Sân Tuyên Sơn',
        address: 'Đường 2/9, Hải Châu',
        district: 'Hải Châu',
        startsAt: '2026-11-25T18:00:00.000Z',
        durationMin: 120,
        costPerPlayer: 60000,
        courtCount: 2,
        courts: [
          {
            courtNumber: 1,
            category: 'men',
            levelMin: 3,
            levelMax: 5,
            initialCoreMembers: [
              { displayName: 'Nam 1', gender: 'M', rating: 1450, level: 3, position: 'both', dominantHand: 'right', isGhost: false, checkedIn: false },
              { displayName: 'Nam 2', gender: 'M', rating: 1450, level: 3, position: 'both', dominantHand: 'right', isGhost: false, checkedIn: false },
              { displayName: 'Nam 3', gender: 'M', rating: 1450, level: 3, position: 'both', dominantHand: 'right', isGhost: false, checkedIn: false },
              { displayName: 'Nam 4', gender: 'M', rating: 1450, level: 3, position: 'both', dominantHand: 'right', isGhost: false, checkedIn: false },
            ], // 4 core -> 4 suất
          },
          {
            courtNumber: 2,
            category: 'mixed',
            levelMin: 3,
            levelMax: 5,
            initialCoreMembers: [
              { displayName: 'Nam A', gender: 'M', rating: 1450, level: 3, position: 'both', dominantHand: 'right', isGhost: false, checkedIn: false },
              { displayName: 'Nam B', gender: 'M', rating: 1450, level: 3, position: 'both', dominantHand: 'right', isGhost: false, checkedIn: false },
              { displayName: 'Nữ C', gender: 'F', rating: 1450, level: 3, position: 'both', dominantHand: 'right', isGhost: false, checkedIn: false },
              { displayName: 'Nữ D', gender: 'F', rating: 1450, level: 3, position: 'both', dominantHand: 'right', isGhost: false, checkedIn: false },
              { displayName: 'Nam E', gender: 'M', rating: 1450, level: 3, position: 'both', dominantHand: 'right', isGhost: false, checkedIn: false },
            ], // 5 core -> 3 suất
          },
        ],
      });

      expect(createRes.sessionId).toBeDefined();
      expect(createRes.courtIds).toEqual(['1', '2']);

      // Kiểm tra Session document
      const sessionSnap = await getDoc(doc(db, 'sessions', createRes.sessionId));
      const sessionData = sessionSnap.data() as SessionDoc;
      expect(sessionData.courtCount).toBe(2);
      expect(sessionData.courtSummaries).toHaveLength(2);
      expect(sessionData.openSlotsTotal).toBe(7); // Sân 1 (4) + Sân 2 (3) = 7
      expect(sessionData.status).toBe('open');

      // Kiểm tra 2 Court documents
      const court1Snap = await getDoc(doc(db, 'sessions', createRes.sessionId, 'courts', '1'));
      expect(court1Snap.exists()).toBe(true);
      const court1 = court1Snap.data() as CourtDoc;
      expect(court1.category).toBe('men');
      expect(Object.keys(court1.roster)).toHaveLength(4);

      const court2Snap = await getDoc(doc(db, 'sessions', createRes.sessionId, 'courts', '2'));
      expect(court2Snap.exists()).toBe(true);
      const court2 = court2Snap.data() as CourtDoc;
      expect(court2.category).toBe('mixed');
      expect(Object.keys(court2.roster)).toHaveLength(5);
    });
  });

  it('LOBBY-2: Kiểm thử đồng thời - Nhiều người cùng tranh suất cuối cùng', async () => {
    if (!emulatorAvailable) return;

    await testEnv.withSecurityRulesDisabled(async (adminContext) => {
      const db = adminContext.firestore() as any;
      const sessionId = 'session-concurrency-02';
      const courtId = '1';

      // Sân có 5 core + 2 recruit = 7 người -> Còn đúng 1 suất cuối
      const initialRoster: Record<string, any> = {};
      for (let i = 1; i <= 5; i++) initialRoster[`c${i}`] = { memberId: `c${i}`, displayName: `C${i}`, gender: 'M', type: 'core', rating: 1450, level: 3, position: 'both', dominantHand: 'right', isGhost: false, checkedIn: false, joinedAt: '' };
      for (let i = 1; i <= 2; i++) initialRoster[`r${i}`] = { memberId: `r${i}`, displayName: `R${i}`, gender: 'M', type: 'recruit', rating: 1450, level: 3, position: 'both', dominantHand: 'right', isGhost: false, checkedIn: false, joinedAt: '' };

      const mockSession: SessionDoc = {
        id: sessionId,
        hostId: mockHost.uid,
        hostName: mockHost.displayName,
        hostReputation: 95,
        title: 'Kèo test tranh suất',
        venueName: 'Sân Kỳ Đồng',
        address: 'Kỳ Đồng, Thanh Khê',
        district: 'Thanh Khê',
        startsAt: '2026-11-25T18:00:00.000Z',
        durationMin: 120,
        costPerPlayer: 50000,
        status: 'open',
        courtCount: 1,
        courtSummaries: [{ courtId: '1', category: 'men', levelMin: 3, levelMax: 5, openSlots: 1, openByGender: { M: 1, F: 0 }, recruitOpen: true }],
        openSlotsTotal: 1,
        schemaVersion: 1,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockCourt: CourtDoc = {
        id: courtId,
        sessionId,
        courtNumber: 1,
        category: 'men',
        levelMin: 3,
        levelMax: 5,
        minReliability: 60,
        pairingMode: 'auto',
        recruitOpen: true,
        roster: initialRoster,
        pairs: [],
        version: 1,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'sessions', sessionId), mockSession);
      await setDoc(doc(db, 'sessions', sessionId, 'courts', courtId), mockCourt);

      // Tạo 3 đơn xin tham gia đồng thời
      const reqIds = ['req-user-1', 'req-user-2', 'req-user-3'];
      for (const rId of reqIds) {
        await setDoc(doc(db, 'requests', rId), {
          id: rId,
          courtId,
          sessionId,
          userId: `usr-${rId}`,
          status: 'requested',
          snapshot: { displayName: `User ${rId}`, gender: 'M', rating: 1450, level: 3, position: 'both', dominantHand: 'right', reliability: 85 },
          createdAt: new Date().toISOString(),
        });
      }

      // Host duyệt cả 3 đơn đồng thời qua Promise.allSettled
      const results = await Promise.allSettled(
        reqIds.map((rId) => approveRecruitRequestTx(db, sessionId, courtId, mockHost.uid, rId))
      );

      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter((r) => r.status === 'rejected');

      // Đúng 1 đơn thành công và 2 đơn bị chặn ném lỗi
      expect(fulfilled).toHaveLength(1);
      expect(rejected).toHaveLength(2);

      // Tổng số thành viên trên sân không bao giờ vượt 8
      const courtCheckSnap = await getDoc(doc(db, 'sessions', sessionId, 'courts', courtId));
      const courtCheck = courtCheckSnap.data() as CourtDoc;
      expect(Object.keys(courtCheck.roster)).toHaveLength(8);

      // Kèo chuyển sang 'full' và openSlotsTotal = 0
      const sessionCheckSnap = await getDoc(doc(db, 'sessions', sessionId));
      const sessionCheck = sessionCheckSnap.data() as SessionDoc;
      expect(sessionCheck.status).toBe('full');
      expect(sessionCheck.openSlotsTotal).toBe(0);
    });
  });

  it('LOBBY-3: Thành viên rời kèo sát giờ - Phạt 5 điểm uy tín và ghi log ratings', async () => {
    if (!emulatorAvailable) return;

    await testEnv.withSecurityRulesDisabled(async (adminContext) => {
      const db = adminContext.firestore() as any;
      const sessionId = 'session-leave-03';
      const courtId = '1';
      const playerUid = 'player-leave-01';

      // Tạo hồ sơ người chơi có 80 điểm uy tín ban đầu
      const playerProfile: UserProfile = {
        uid: playerUid,
        displayName: 'Người chơi rời kèo',
        gender: 'M',
        areaLabel: 'Hải Châu',
        position: 'both',
        dominantHand: 'right',
        selfDeclaredLevel: 3,
        role: 'player',
        skill: { rating: 1400, matchesPlayed: 10, reliability: 80, isProvisional: false },
        fcmTokens: [],
        schemaVersion: 1,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', playerUid), playerProfile);

      const startsAt = '2026-11-20T18:00:00.000Z';
      const cancelTimeIso = '2026-11-20T13:00:00.000Z'; // Trước 5 tiếng (< 12h)

      const mockSession: SessionDoc = {
        id: sessionId,
        hostId: mockHost.uid,
        hostName: mockHost.displayName,
        hostReputation: 95,
        title: 'Kèo test rời sát giờ',
        venueName: 'Sân Kỳ Đồng',
        address: 'Kỳ Đồng, Thanh Khê',
        district: 'Thanh Khê',
        startsAt,
        durationMin: 120,
        costPerPlayer: 50000,
        status: 'full',
        courtCount: 1,
        courtSummaries: [{ courtId: '1', category: 'men', levelMin: 3, levelMax: 5, openSlots: 0, openByGender: { M: 0, F: 0 }, recruitOpen: false }],
        openSlotsTotal: 0,
        schemaVersion: 1,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockCourt: CourtDoc = {
        id: courtId,
        sessionId,
        courtNumber: 1,
        category: 'men',
        levelMin: 3,
        levelMax: 5,
        minReliability: 60,
        pairingMode: 'auto',
        recruitOpen: true,
        roster: {
          c1: { memberId: 'c1', displayName: 'C1', gender: 'M', type: 'core', rating: 1450, level: 3, position: 'both', dominantHand: 'right', isGhost: false, checkedIn: false, joinedAt: '' },
          c2: { memberId: 'c2', displayName: 'C2', gender: 'M', type: 'core', rating: 1450, level: 3, position: 'both', dominantHand: 'right', isGhost: false, checkedIn: false, joinedAt: '' },
          c3: { memberId: 'c3', displayName: 'C3', gender: 'M', type: 'core', rating: 1450, level: 3, position: 'both', dominantHand: 'right', isGhost: false, checkedIn: false, joinedAt: '' },
          c4: { memberId: 'c4', displayName: 'C4', gender: 'M', type: 'core', rating: 1450, level: 3, position: 'both', dominantHand: 'right', isGhost: false, checkedIn: false, joinedAt: '' },
          c5: { memberId: 'c5', displayName: 'C5', gender: 'M', type: 'core', rating: 1450, level: 3, position: 'both', dominantHand: 'right', isGhost: false, checkedIn: false, joinedAt: '' },
          [playerUid]: { memberId: playerUid, displayName: 'Người chơi rời kèo', gender: 'M', type: 'recruit', rating: 1400, level: 3, position: 'both', dominantHand: 'right', isGhost: false, checkedIn: false, joinedAt: '' },
        },
        pairs: [],
        version: 1,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'sessions', sessionId), mockSession);
      await setDoc(doc(db, 'sessions', sessionId, 'courts', courtId), mockCourt);
      await setDoc(doc(db, 'requests', `${sessionId}_${courtId}_${playerUid}`), {
        id: `${sessionId}_${courtId}_${playerUid}`,
        courtId,
        sessionId,
        userId: playerUid,
        status: 'confirmed',
        snapshot: { displayName: 'Người chơi rời kèo', gender: 'M', rating: 1400, level: 3, position: 'both', dominantHand: 'right', reliability: 80 },
        createdAt: new Date().toISOString(),
      });

      // Thực thi rời kèo sát giờ
      const leaveRes = await leaveSessionWithPenaltyTx(db, sessionId, courtId, playerUid, {
        cancelTimeIso,
      });

      expect(leaveRes.penalty.penaltyPoints).toBe(5);
      expect(leaveRes.penalty.reason).toBe('CANCEL_WITHIN_12_HOURS');

      // Điểm uy tín của người chơi bị trừ từ 80 xuống 75
      const userCheckSnap = await getDoc(doc(db, 'users', playerUid));
      const userCheck = userCheckSnap.data() as UserProfile;
      expect(userCheck.skill.reliability).toBe(75);

      // Kèo mở lại (status = 'open', openSlotsTotal = 1)
      const sessionCheckSnap = await getDoc(doc(db, 'sessions', sessionId));
      const sessionCheck = sessionCheckSnap.data() as SessionDoc;
      expect(sessionCheck.status).toBe('open');
      expect(sessionCheck.openSlotsTotal).toBe(1);
    });
  });

  it('LOBBY-4: Hủy liên tiếp khi Waitlist rỗng - Suất trống tăng dần tuần tự', async () => {
    if (!emulatorAvailable) return;

    await testEnv.withSecurityRulesDisabled(async (adminContext) => {
      const db = adminContext.firestore() as any;
      const sessionId = 'session-empty-wl-04';
      const courtId = '1';

      const userA = 'user-cancel-A';
      const userB = 'user-cancel-B';

      const mockSession: SessionDoc = {
        id: sessionId,
        hostId: mockHost.uid,
        hostName: mockHost.displayName,
        hostReputation: 95,
        title: 'Kèo hủy liên tiếp',
        venueName: 'Sân Kỳ Đồng',
        address: 'Kỳ Đồng, Thanh Khê',
        district: 'Thanh Khê',
        startsAt: '2026-11-25T18:00:00.000Z',
        durationMin: 120,
        costPerPlayer: 50000,
        status: 'full',
        courtCount: 1,
        courtSummaries: [{ courtId: '1', category: 'men', levelMin: 3, levelMax: 5, openSlots: 0, openByGender: { M: 0, F: 0 }, recruitOpen: false }],
        openSlotsTotal: 0,
        schemaVersion: 1,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockCourt: CourtDoc = {
        id: courtId,
        sessionId,
        courtNumber: 1,
        category: 'men',
        levelMin: 3,
        levelMax: 5,
        minReliability: 60,
        pairingMode: 'auto',
        recruitOpen: true,
        roster: {
          c1: { memberId: 'c1', displayName: 'C1', gender: 'M', type: 'core', rating: 1450, level: 3, position: 'both', dominantHand: 'right', isGhost: false, checkedIn: false, joinedAt: '' },
          c2: { memberId: 'c2', displayName: 'C2', gender: 'M', type: 'core', rating: 1450, level: 3, position: 'both', dominantHand: 'right', isGhost: false, checkedIn: false, joinedAt: '' },
          c3: { memberId: 'c3', displayName: 'C3', gender: 'M', type: 'core', rating: 1450, level: 3, position: 'both', dominantHand: 'right', isGhost: false, checkedIn: false, joinedAt: '' },
          c4: { memberId: 'c4', displayName: 'C4', gender: 'M', type: 'core', rating: 1450, level: 3, position: 'both', dominantHand: 'right', isGhost: false, checkedIn: false, joinedAt: '' },
          c5: { memberId: 'c5', displayName: 'C5', gender: 'M', type: 'core', rating: 1450, level: 3, position: 'both', dominantHand: 'right', isGhost: false, checkedIn: false, joinedAt: '' },
          [userA]: { memberId: userA, displayName: 'User A', gender: 'M', type: 'recruit', rating: 1450, level: 3, position: 'both', dominantHand: 'right', isGhost: false, checkedIn: false, joinedAt: '' },
          [userB]: { memberId: userB, displayName: 'User B', gender: 'M', type: 'recruit', rating: 1450, level: 3, position: 'both', dominantHand: 'right', isGhost: false, checkedIn: false, joinedAt: '' },
        },
        pairs: [],
        version: 1,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'sessions', sessionId), mockSession);
      await setDoc(doc(db, 'sessions', sessionId, 'courts', courtId), mockCourt);
      await setDoc(doc(db, 'requests', `${sessionId}_${courtId}_${userA}`), { id: `${sessionId}_${courtId}_${userA}`, courtId, sessionId, userId: userA, status: 'confirmed', snapshot: { displayName: 'A', gender: 'M', rating: 1450, level: 3, position: 'both', dominantHand: 'right', reliability: 80 }, createdAt: '' });
      await setDoc(doc(db, 'requests', `${sessionId}_${courtId}_${userB}`), { id: `${sessionId}_${courtId}_${userB}`, courtId, sessionId, userId: userB, status: 'confirmed', snapshot: { displayName: 'B', gender: 'M', rating: 1450, level: 3, position: 'both', dominantHand: 'right', reliability: 80 }, createdAt: '' });

      // Người A hủy trước trên 12 tiếng -> 0 phạt
      await leaveSessionWithPenaltyTx(db, sessionId, courtId, userA, { cancelTimeIso: '2026-11-24T18:00:00.000Z' });

      let sessionCheck = (await getDoc(doc(db, 'sessions', sessionId))).data() as SessionDoc;
      expect(sessionCheck.openSlotsTotal).toBe(1);

      // Người B hủy tiếp theo
      await leaveSessionWithPenaltyTx(db, sessionId, courtId, userB, { cancelTimeIso: '2026-11-24T19:00:00.000Z' });

      sessionCheck = (await getDoc(doc(db, 'sessions', sessionId))).data() as SessionDoc;
      expect(sessionCheck.openSlotsTotal).toBe(2);

      const courtCheck = (await getDoc(doc(db, 'sessions', sessionId, 'courts', courtId))).data() as CourtDoc;
      expect(Object.keys(courtCheck.roster)).toHaveLength(5); // Chỉ còn 5 core
    });
  });

  it('LOBBY-5: Host hủy cả buổi đánh - Session và toàn bộ Request chuyển sang cancelled/declined', async () => {
    if (!emulatorAvailable) return;

    await testEnv.withSecurityRulesDisabled(async (adminContext) => {
      const db = adminContext.firestore() as any;
      const sessionId = 'session-cancel-all-05';

      const mockSession: SessionDoc = {
        id: sessionId,
        hostId: mockHost.uid,
        hostName: mockHost.displayName,
        hostReputation: 95,
        title: 'Kèo chuẩn bị bị hủy',
        venueName: 'Sân Kỳ Đồng',
        address: 'Kỳ Đồng, Thanh Khê',
        district: 'Thanh Khê',
        startsAt: '2026-11-25T18:00:00.000Z',
        durationMin: 120,
        costPerPlayer: 50000,
        status: 'open',
        courtCount: 1,
        courtSummaries: [{ courtId: '1', category: 'men', levelMin: 3, levelMax: 5, openSlots: 2, openByGender: { M: 2, F: 0 }, recruitOpen: true }],
        openSlotsTotal: 2,
        schemaVersion: 1,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'sessions', sessionId), mockSession);

      const reqId = 'req-to-be-declined';
      await setDoc(doc(db, 'requests', reqId), {
        id: reqId,
        courtId: '1',
        sessionId,
        userId: 'some-user-waiting',
        status: 'requested',
        snapshot: { displayName: 'Chờ duyệt', gender: 'M', rating: 1450, level: 3, position: 'both', dominantHand: 'right', reliability: 80 },
        createdAt: new Date().toISOString(),
      });

      // Host thực hiện hủy toàn bộ kèo
      await cancelSessionByHostTx(db, sessionId, mockHost.uid, 'Sân ngập nước mưa');

      // Session phải chuyển sang status = 'cancelled'
      const sessionCheck = (await getDoc(doc(db, 'sessions', sessionId))).data() as SessionDoc;
      expect(sessionCheck.status).toBe('cancelled');
      expect(sessionCheck.openSlotsTotal).toBe(0);

      // Đơn đăng ký phải chuyển sang status = 'declined'
      const reqCheck = (await getDoc(doc(db, 'requests', reqId))).data() as JoinRequestDoc;
      expect(reqCheck.status).toBe('declined');
    });
  });
});

