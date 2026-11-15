import {
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  approveRecruitRequestTx,
  addCoreMemberTx,
  cancelParticipationTx,
} from '../../src/domain/recruit/transactions';
import { CourtDoc, SessionDoc, JoinRequestDoc } from '../../src/domain/types';

const PROJECT_ID = 'badminton-danang-recruit-test';
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

describe('Firebase Integration: Recruit Transactions & Race Condition (WBS 3.2)', () => {
  let testEnv: RulesTestEnvironment;
  let emulatorAvailable = false;

  beforeAll(async () => {
    emulatorAvailable = await isEmulatorRunning();
    if (!emulatorAvailable) {
      console.warn(
        '\n[NOTICE] Firestore emulator not detected on 127.0.0.1:8080. ' +
        'Skipping Recruit Transactions integration test suite. ' +
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

  it('RACE-1: Hai đơn tranh suất cuối cùng - Transaction đảm bảo chỉ 1 người được duyệt', async () => {
    if (!emulatorAvailable) return;

    // Sử dụng context admin để seed và test giao dịch transaction
    await testEnv.withSecurityRulesDisabled(async (adminContext) => {
      const db = adminContext.firestore();

      const sessionId = 'session-race-01';
      const courtId = '1';
      const hostId = 'host-user-01';

      // Tạo Kèo có 1 sân: 5 core + 2 recruit -> Chỉ còn ĐÚNG 1 suất trống duy nhất
      const mockSession: SessionDoc = {
        id: sessionId,
        hostId,
        hostName: 'Host Tuấn',
        hostReputation: 90,
        title: 'Kèo tranh suất cuối',
        venueName: 'Sân Kỳ Đồng',
        address: 'Kỳ Đồng, Thanh Khê',
        district: 'Thanh Khê',
        startsAt: '2026-11-20T18:00:00.000Z',
        durationMin: 120,
        costPerPlayer: 50000,
        status: 'open',
        courtCount: 1,
        courtSummaries: [
          {
            courtId: '1',
            category: 'men',
            levelMin: 3,
            levelMax: 5,
            openSlots: 1,
            openByGender: { M: 1, F: 0 },
            recruitOpen: true,
          },
        ],
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
        roster: {
          c1: { memberId: 'c1', displayName: 'C1', gender: 'M', type: 'core', rating: 1450, level: 3, position: 'both', dominantHand: 'right', isGhost: false, checkedIn: false, joinedAt: new Date().toISOString() },
          c2: { memberId: 'c2', displayName: 'C2', gender: 'M', type: 'core', rating: 1450, level: 3, position: 'both', dominantHand: 'right', isGhost: false, checkedIn: false, joinedAt: new Date().toISOString() },
          c3: { memberId: 'c3', displayName: 'C3', gender: 'M', type: 'core', rating: 1450, level: 3, position: 'both', dominantHand: 'right', isGhost: false, checkedIn: false, joinedAt: new Date().toISOString() },
          c4: { memberId: 'c4', displayName: 'C4', gender: 'M', type: 'core', rating: 1450, level: 3, position: 'both', dominantHand: 'right', isGhost: false, checkedIn: false, joinedAt: new Date().toISOString() },
          c5: { memberId: 'c5', displayName: 'C5', gender: 'M', type: 'core', rating: 1450, level: 3, position: 'both', dominantHand: 'right', isGhost: false, checkedIn: false, joinedAt: new Date().toISOString() },
          r1: { memberId: 'r1', displayName: 'R1', gender: 'M', type: 'recruit', rating: 1450, level: 3, position: 'both', dominantHand: 'right', isGhost: false, checkedIn: false, joinedAt: new Date().toISOString() },
          r2: { memberId: 'r2', displayName: 'R2', gender: 'M', type: 'recruit', rating: 1450, level: 3, position: 'both', dominantHand: 'right', isGhost: false, checkedIn: false, joinedAt: new Date().toISOString() },
        },
        pairs: [],
        version: 1,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'sessions', sessionId), mockSession);
      await setDoc(doc(db, 'sessions', sessionId, 'courts', courtId), mockCourt);

      // Tạo 2 đơn xin của User A và User B
      const reqIdA = 'req-user-A';
      const reqIdB = 'req-user-B';

      const reqDocA: JoinRequestDoc = {
        id: reqIdA,
        courtId,
        sessionId,
        userId: 'user-A',
        status: 'requested',
        snapshot: { displayName: 'User A', gender: 'M', rating: 1450, level: 3, position: 'front', dominantHand: 'right', reliability: 85 },
        createdAt: new Date().toISOString(),
      };
      const reqDocB: JoinRequestDoc = {
        id: reqIdB,
        courtId,
        sessionId,
        userId: 'user-B',
        status: 'requested',
        snapshot: { displayName: 'User B', gender: 'M', rating: 1450, level: 3, position: 'back', dominantHand: 'left', reliability: 90 },
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'requests', reqIdA), reqDocA);
      await setDoc(doc(db, 'requests', reqIdB), reqDocB);

      // Thực thi duyệt đồng thời cả 2 đơn bằng Promise.allSettled
      const [resA, resB] = await Promise.allSettled([
        approveRecruitRequestTx(db as any, sessionId, courtId, hostId, reqIdA),
        approveRecruitRequestTx(db as any, sessionId, courtId, hostId, reqIdB),
      ]);

      // Chỉ có đúng 1 giao dịch thành công (fulfilled), giao dịch còn lại phải bị từ chối (rejected)
      const successCount = [resA, resB].filter((r) => r.status === 'fulfilled').length;
      const failureCount = [resA, resB].filter((r) => r.status === 'rejected').length;

      expect(successCount).toBe(1);
      expect(failureCount).toBe(1);

      // Kiểm tra Roster trong Firestore: chính xác 8 người, không bao giờ vượt 8
      const updatedCourtSnap = await getDoc(doc(db, 'sessions', sessionId, 'courts', courtId));
      const updatedCourt = updatedCourtSnap.data() as CourtDoc;
      const membersCount = Object.keys(updatedCourt.roster).length;
      expect(membersCount).toBe(8);

      // Kiểm tra Session: openSlotsTotal = 0 và status = "full"
      const updatedSessionSnap = await getDoc(doc(db, 'sessions', sessionId));
      const updatedSession = updatedSessionSnap.data() as SessionDoc;
      expect(updatedSession.openSlotsTotal).toBe(0);
      expect(updatedSession.status).toBe('full');
    });
  });

  it('RACE-2: Host thêm người mặc định khi sân đã đủ 8 người - Bị chặn đứng (Hard Block A4)', async () => {
    if (!emulatorAvailable) return;

    await testEnv.withSecurityRulesDisabled(async (adminContext) => {
      const db = adminContext.firestore();
      const sessionId = 'session-block-02';
      const courtId = '1';
      const hostId = 'host-user-02';

      // Sân có 5 core + 3 recruit = 8 người (đã kín chỗ)
      const fullRoster: Record<string, any> = {};
      for (let i = 1; i <= 5; i++) {
        fullRoster[`c${i}`] = { memberId: `c${i}`, displayName: `C${i}`, gender: 'M', type: 'core', rating: 1450, level: 3, position: 'both', dominantHand: 'right', isGhost: false, checkedIn: false, joinedAt: new Date().toISOString() };
      }
      for (let i = 1; i <= 3; i++) {
        fullRoster[`r${i}`] = { memberId: `r${i}`, displayName: `R${i}`, gender: 'M', type: 'recruit', rating: 1450, level: 3, position: 'both', dominantHand: 'right', isGhost: false, checkedIn: false, joinedAt: new Date().toISOString() };
      }

      const mockSession: SessionDoc = {
        id: sessionId,
        hostId,
        hostName: 'Host Tuấn',
        hostReputation: 90,
        title: 'Kèo kín chỗ',
        venueName: 'Sân Kỳ Đồng',
        address: 'Kỳ Đồng, Thanh Khê',
        district: 'Thanh Khê',
        startsAt: '2026-11-20T18:00:00.000Z',
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
        recruitOpen: false,
        roster: fullRoster,
        pairs: [],
        version: 1,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'sessions', sessionId), mockSession);
      await setDoc(doc(db, 'sessions', sessionId, 'courts', courtId), mockCourt);

      // Host cố tình thêm người mặc định thứ 6 (thành 9 người)
      const newGhostCore = {
        memberId: 'ghost_friend_01',
        displayName: 'Bạn của Host (Ghost)',
        gender: 'M' as const,
        rating: 1400,
        level: 3 as const,
        position: 'both' as const,
        dominantHand: 'right' as const,
        isGhost: true,
        checkedIn: false,
      };

      // Giao dịch phải ném ngoại lệ và không ghi dữ liệu
      await expect(
        addCoreMemberTx(db as any, sessionId, courtId, hostId, newGhostCore)
      ).rejects.toThrow(/vượt quá giới hạn tối đa 8 người/);

      // Xác nhận trong DB: số lượng thành viên vẫn là 8
      const courtCheckSnap = await getDoc(doc(db, 'sessions', sessionId, 'courts', courtId));
      const courtCheck = courtCheckSnap.data() as CourtDoc;
      expect(Object.keys(courtCheck.roster)).toHaveLength(8);
    });
  });

  it('RACE-3: Người chơi hủy tham gia - Tự động đôn ứng viên trong Waitlist lên danh sách chờ duyệt', async () => {
    if (!emulatorAvailable) return;

    await testEnv.withSecurityRulesDisabled(async (adminContext) => {
      const db = adminContext.firestore();
      const sessionId = 'session-waitlist-03';
      const courtId = '1';
      const cancellingUserId = 'recruit-cancelling';
      const waitlistUserId = 'user-in-waitlist';

      // Sân đã kín 8 người (5 core + 3 recruit)
      const roster: Record<string, any> = {
        c1: { memberId: 'c1', displayName: 'C1', gender: 'M', type: 'core', rating: 1450, level: 3, position: 'both', dominantHand: 'right', isGhost: false, checkedIn: false, joinedAt: new Date().toISOString() },
        c2: { memberId: 'c2', displayName: 'C2', gender: 'M', type: 'core', rating: 1450, level: 3, position: 'both', dominantHand: 'right', isGhost: false, checkedIn: false, joinedAt: new Date().toISOString() },
        c3: { memberId: 'c3', displayName: 'C3', gender: 'M', type: 'core', rating: 1450, level: 3, position: 'both', dominantHand: 'right', isGhost: false, checkedIn: false, joinedAt: new Date().toISOString() },
        c4: { memberId: 'c4', displayName: 'C4', gender: 'M', type: 'core', rating: 1450, level: 3, position: 'both', dominantHand: 'right', isGhost: false, checkedIn: false, joinedAt: new Date().toISOString() },
        c5: { memberId: 'c5', displayName: 'C5', gender: 'M', type: 'core', rating: 1450, level: 3, position: 'both', dominantHand: 'right', isGhost: false, checkedIn: false, joinedAt: new Date().toISOString() },
        r1: { memberId: 'r1', displayName: 'R1', gender: 'M', type: 'recruit', rating: 1450, level: 3, position: 'both', dominantHand: 'right', isGhost: false, checkedIn: false, joinedAt: new Date().toISOString() },
        r2: { memberId: 'r2', displayName: 'R2', gender: 'M', type: 'recruit', rating: 1450, level: 3, position: 'both', dominantHand: 'right', isGhost: false, checkedIn: false, joinedAt: new Date().toISOString() },
        [cancellingUserId]: { memberId: cancellingUserId, displayName: 'Người xin rút', gender: 'M', type: 'recruit', rating: 1450, level: 3, position: 'both', dominantHand: 'right', isGhost: false, checkedIn: false, joinedAt: new Date().toISOString() },
      };

      const mockSession: SessionDoc = {
        id: sessionId,
        hostId: 'host-03',
        hostName: 'Host Tuấn',
        hostReputation: 90,
        title: 'Kèo có người rút',
        venueName: 'Sân Kỳ Đồng',
        address: 'Kỳ Đồng, Thanh Khê',
        district: 'Thanh Khê',
        startsAt: '2026-11-20T18:00:00.000Z',
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
        roster,
        pairs: [],
        version: 1,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'sessions', sessionId), mockSession);
      await setDoc(doc(db, 'sessions', sessionId, 'courts', courtId), mockCourt);

      // Tạo đơn của người sắp hủy
      const cancelReqId = `${sessionId}_${courtId}_${cancellingUserId}`;
      await setDoc(doc(db, 'requests', cancelReqId), {
        id: cancelReqId,
        courtId,
        sessionId,
        userId: cancellingUserId,
        status: 'confirmed',
        snapshot: { displayName: 'Người xin rút', gender: 'M', rating: 1450, level: 3, position: 'both', dominantHand: 'right', reliability: 80 },
        createdAt: '2026-11-15T09:00:00.000Z',
      });

      // Tạo đơn trong Waitlist
      const waitlistReqId = `${sessionId}_${courtId}_${waitlistUserId}`;
      await setDoc(doc(db, 'requests', waitlistReqId), {
        id: waitlistReqId,
        courtId,
        sessionId,
        userId: waitlistUserId,
        status: 'waitlist',
        snapshot: { displayName: 'Bạn chờ dự bị', gender: 'M', rating: 1450, level: 3, position: 'front', dominantHand: 'left', reliability: 90 },
        createdAt: '2026-11-15T09:30:00.000Z',
      });

      // Thực thi hủy tham gia
      const cancelResult = await cancelParticipationTx(db as any, sessionId, courtId, cancellingUserId);
      expect(cancelResult.promotedWaitlistUserId).toBe(waitlistUserId);

      // Kiểm tra Roster: Người hủy đã bị xóa
      const courtCheckSnap = await getDoc(doc(db, 'sessions', sessionId, 'courts', courtId));
      const courtCheck = courtCheckSnap.data() as CourtDoc;
      expect(courtCheck.roster[cancellingUserId]).toBeUndefined();
      expect(Object.keys(courtCheck.roster)).toHaveLength(7);

      // Kiểm tra đơn Waitlist: Đã được đôn lên 'requested'
      const promotedReqSnap = await getDoc(doc(db, 'requests', waitlistReqId));
      const promotedReq = promotedReqSnap.data() as JoinRequestDoc;
      expect(promotedReq.status).toBe('requested');

      // Kiểm tra Kèo: Đã mở lại (status = 'open', openSlotsTotal = 1)
      const sessionCheckSnap = await getDoc(doc(db, 'sessions', sessionId));
      const sessionCheck = sessionCheckSnap.data() as SessionDoc;
      expect(sessionCheck.status).toBe('open');
      expect(sessionCheck.openSlotsTotal).toBe(1);
    });
  });
});
