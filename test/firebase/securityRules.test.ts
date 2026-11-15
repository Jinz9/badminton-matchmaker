import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

const PROJECT_ID = 'badminton-danang-rules-test';
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

describe('Firestore Security Rules Unit Tests (WBS 5.2)', () => {
  let testEnv: RulesTestEnvironment;
  let emulatorAvailable = false;

  beforeAll(async () => {
    emulatorAvailable = await isEmulatorRunning();
    if (!emulatorAvailable) {
      console.warn(
        '\n[NOTICE] Firestore emulator not detected on 127.0.0.1:8080. ' +
        'Skipping Security Rules unit tests. ' +
        'Run "npm run test:rules" to launch the emulator and execute all 60 security rules tests.\n'
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

  // Helper context getters
  const unauthedDb = () => testEnv.unauthenticatedContext().firestore();
  const authedDb = (uid: string, token: Record<string, any> = {}) =>
    testEnv.authenticatedContext(uid, token).firestore();
  const adminDb = () =>
    testEnv.authenticatedContext('admin_user', { role: 'admin', admin: true }).firestore();

  // Helper seed function (bypasses security rules)
  async function seedDoc(pathStr: string, data: Record<string, any>) {
    if (!emulatorAvailable) return;
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), pathStr), data);
    });
  }

  // Wrapper for each test to conditionally run if emulator is available
  const runTest = (name: string, fn: () => Promise<void>) => {
    it(name, async () => {
      if (!emulatorAvailable) {
        return;
      }
      await fn();
    });
  };

  // =========================================================================
  // SUITE 1: AUTHENTICATION & GLOBAL CATCH-ALL
  // =========================================================================
  describe('1. Authentication & Catch-All Rules', () => {
    runTest('T01 [DENY] Unauthenticated user cannot read /users/{uid}', async () => {
      await seedDoc('users/usr_01', { displayName: 'Nhật', role: 'player' });
      await assertFails(getDoc(doc(unauthedDb(), 'users/usr_01')));
    });

    runTest('T02 [DENY] Unauthenticated user cannot read /sessions/{sessionId}', async () => {
      await seedDoc('sessions/session_01', { title: 'Kèo Kỳ Đồng', hostId: 'host_01' });
      await assertFails(getDoc(doc(unauthedDb(), 'sessions/session_01')));
    });

    runTest('T03 [DENY] Any user is denied access to unmapped collections (Least Privilege)', async () => {
      const db = authedDb('usr_01');
      await assertFails(getDoc(doc(db, 'system_secrets/config')));
      await assertFails(setDoc(doc(db, 'system_secrets/config'), { secret: '123' }));
    });
  });

  // =========================================================================
  // SUITE 2: USERS COLLECTION (/users/{uid})
  // =========================================================================
  describe('2. Users Collection (/users/{uid})', () => {
    const validProfile = (uid: string) => ({
      uid,
      displayName: 'Đào Duy Nhật',
      gender: 'M',
      areaLabel: 'Hải Châu',
      position: 'back',
      dominantHand: 'right',
      selfDeclaredLevel: 3,
      role: 'player',
      skill: {
        rating: 1425,
        reliability: 100,
        matchesPlayed: 0,
        isProvisional: true,
      },
      isDeleted: false,
      createdAt: '2026-11-15T08:00:00Z',
      updatedAt: '2026-11-15T08:00:00Z',
    });

    runTest('T04 [ALLOW] Authenticated user can read another player profile', async () => {
      await seedDoc('users/usr_alice', validProfile('usr_alice'));
      const db = authedDb('usr_bob');
      await assertSucceeds(getDoc(doc(db, 'users/usr_alice')));
    });

    runTest('T05 [ALLOW] Player can create their own profile with valid data and role player', async () => {
      const db = authedDb('usr_alice');
      await assertSucceeds(setDoc(doc(db, 'users/usr_alice'), validProfile('usr_alice')));
    });

    runTest('T06 [DENY] Player cannot create profile for a mismatched UID', async () => {
      const db = authedDb('usr_alice');
      await assertFails(setDoc(doc(db, 'users/usr_bob'), validProfile('usr_bob')));
    });

    runTest('T07 [DENY] Player cannot self-assign role admin on creation (Privilege Escalation)', async () => {
      const db = authedDb('usr_alice');
      const malicious = { ...validProfile('usr_alice'), role: 'admin' };
      await assertFails(setDoc(doc(db, 'users/usr_alice'), malicious));
    });

    runTest('T08 [DENY] Player cannot create profile with rating outside [800, 2200]', async () => {
      const db = authedDb('usr_alice');
      const invalidRating = {
        ...validProfile('usr_alice'),
        skill: { ...validProfile('usr_alice').skill, rating: 2500 },
      };
      await assertFails(setDoc(doc(db, 'users/usr_alice'), invalidRating));
    });

    runTest('T09 [DENY] Player cannot create profile with initial reliability != 100', async () => {
      const db = authedDb('usr_alice');
      const invalidRel = {
        ...validProfile('usr_alice'),
        skill: { ...validProfile('usr_alice').skill, reliability: 80 },
      };
      await assertFails(setDoc(doc(db, 'users/usr_alice'), invalidRel));
    });

    runTest('T10 [ALLOW] Player can update their own personal info (displayName, position)', async () => {
      await seedDoc('users/usr_alice', validProfile('usr_alice'));
      const db = authedDb('usr_alice');
      await assertSucceeds(
        updateDoc(doc(db, 'users/usr_alice'), {
          displayName: 'Nhật Đào (Pro)',
          position: 'both',
        })
      );
    });

    runTest('T11 [DENY] Player cannot tamper with their own Elo rating (skill.rating)', async () => {
      await seedDoc('users/usr_alice', validProfile('usr_alice'));
      const db = authedDb('usr_alice');
      await assertFails(
        updateDoc(doc(db, 'users/usr_alice'), {
          'skill.rating': 1900,
        })
      );
    });

    runTest('T12 [DENY] Player cannot tamper with their own reliability (skill.reliability)', async () => {
      await seedDoc('users/usr_alice', {
        ...validProfile('usr_alice'),
        skill: { ...validProfile('usr_alice').skill, reliability: 70 },
      });
      const db = authedDb('usr_alice');
      await assertFails(
        updateDoc(doc(db, 'users/usr_alice'), {
          'skill.reliability': 100,
        })
      );
    });

    runTest('T13 [DENY] Player cannot escalate role from player to admin on update', async () => {
      await seedDoc('users/usr_alice', validProfile('usr_alice'));
      const db = authedDb('usr_alice');
      await assertFails(
        updateDoc(doc(db, 'users/usr_alice'), {
          role: 'admin',
        })
      );
    });

    runTest('T14 [DENY] Player cannot modify immutable uid or createdAt', async () => {
      await seedDoc('users/usr_alice', validProfile('usr_alice'));
      const db = authedDb('usr_alice');
      await assertFails(
        updateDoc(doc(db, 'users/usr_alice'), {
          uid: 'usr_hacked',
        })
      );
      await assertFails(
        updateDoc(doc(db, 'users/usr_alice'), {
          createdAt: '2020-01-01T00:00:00Z',
        })
      );
    });

    runTest('T15 [DENY] Player cannot update another user profile', async () => {
      await seedDoc('users/usr_alice', validProfile('usr_alice'));
      const db = authedDb('usr_bob');
      await assertFails(
        updateDoc(doc(db, 'users/usr_alice'), {
          displayName: 'Bob hacked Alice',
        })
      );
    });

    runTest('T16 [DENY] Non-admin cannot hard-delete a user profile', async () => {
      await seedDoc('users/usr_alice', validProfile('usr_alice'));
      const db = authedDb('usr_alice');
      await assertFails(deleteDoc(doc(db, 'users/usr_alice')));
    });

    runTest('T17 [ALLOW] Admin user can update any user profile (e.g. lock account / soft delete)', async () => {
      await seedDoc('users/usr_alice', validProfile('usr_alice'));
      const db = adminDb();
      await assertSucceeds(
        updateDoc(doc(db, 'users/usr_alice'), {
          isDeleted: true,
        })
      );
    });
  });

  // =========================================================================
  // SUITE 3: SESSIONS COLLECTION (/sessions/{sessionId})
  // =========================================================================
  describe('3. Sessions Collection (/sessions/{sessionId})', () => {
    const validSession = (sessionId: string, hostId: string) => ({
      id: sessionId,
      hostId,
      hostName: 'Đào Duy Nhật',
      hostReputation: 98,
      title: 'Kèo tối T4 Sân Kỳ Đồng',
      venueName: 'Sân Kỳ Đồng',
      address: '49 Kỳ Đồng',
      district: 'Thanh Khê',
      startsAt: '2026-11-18T18:00:00Z',
      durationMin: 120,
      costPerPlayer: 50000,
      status: 'open',
      courtCount: 1,
      openSlotsTotal: 2,
      schemaVersion: 1,
      isDeleted: false,
      createdAt: '2026-11-15T09:00:00Z',
      updatedAt: '2026-11-15T09:00:00Z',
    });

    runTest('T18 [ALLOW] Authenticated user can read sessions', async () => {
      await seedDoc('sessions/session_01', validSession('session_01', 'host_01'));
      const db = authedDb('usr_player');
      await assertSucceeds(getDoc(doc(db, 'sessions/session_01')));
    });

    runTest('T19 [ALLOW] Host can create a session with 1 or 2 courts', async () => {
      const db = authedDb('host_01');
      await assertSucceeds(
        setDoc(doc(db, 'sessions/session_01'), validSession('session_01', 'host_01'))
      );
    });

    runTest('T20 [DENY] Host cannot create session with courtCount > 2 (Invariant I3)', async () => {
      const db = authedDb('host_01');
      const invalid = {
        ...validSession('session_01', 'host_01'),
        courtCount: 3,
      };
      await assertFails(setDoc(doc(db, 'sessions/session_01'), invalid));
    });

    runTest('T21 [DENY] User cannot create session on behalf of another hostId', async () => {
      const db = authedDb('usr_imposter');
      const invalid = validSession('session_01', 'host_01');
      await assertFails(setDoc(doc(db, 'sessions/session_01'), invalid));
    });

    runTest('T22 [DENY] Host cannot create session with title < 3 characters', async () => {
      const db = authedDb('host_01');
      const invalid = {
        ...validSession('session_01', 'host_01'),
        title: 'AB',
      };
      await assertFails(setDoc(doc(db, 'sessions/session_01'), invalid));
    });

    runTest('T23 [ALLOW] Host can update their own session details', async () => {
      await seedDoc('sessions/session_01', validSession('session_01', 'host_01'));
      const db = authedDb('host_01');
      await assertSucceeds(
        updateDoc(doc(db, 'sessions/session_01'), {
          title: 'Kèo tối T4 Kỳ Đồng - Đổi giờ 19h',
          openSlotsTotal: 1,
        })
      );
    });

    runTest('T24 [DENY] Host cannot modify immutable hostId on update', async () => {
      await seedDoc('sessions/session_01', validSession('session_01', 'host_01'));
      const db = authedDb('host_01');
      await assertFails(
        updateDoc(doc(db, 'sessions/session_01'), {
          hostId: 'host_02',
        })
      );
    });

    runTest('T25 [DENY] Non-host user cannot update someone else session', async () => {
      await seedDoc('sessions/session_01', validSession('session_01', 'host_01'));
      const db = authedDb('usr_intruder');
      await assertFails(
        updateDoc(doc(db, 'sessions/session_01'), {
          title: 'Defaced by intruder',
        })
      );
    });

    runTest('T26 [DENY] Non-admin cannot delete session document', async () => {
      await seedDoc('sessions/session_01', validSession('session_01', 'host_01'));
      const db = authedDb('host_01');
      await assertFails(deleteDoc(doc(db, 'sessions/session_01')));
    });
  });

  // =========================================================================
  // SUITE 4: COURTS SUBCOLLECTION (/sessions/{sessionId}/courts/{courtId})
  // =========================================================================
  describe('4. Courts Subcollection (/sessions/{sessionId}/courts/{courtId})', () => {
    const validSession = {
      id: 'session_01',
      hostId: 'host_01',
      courtCount: 1,
      title: 'Kèo Kỳ Đồng',
      status: 'open',
      isDeleted: false,
    };

    const validCourt = (courtId: string): {
      id: string;
      sessionId: string;
      courtNumber: number;
      category: string;
      levelMin: number;
      levelMax: number;
      minReliability: number;
      pairingMode: string;
      recruitOpen: boolean;
      roster: Record<string, any>;
      pairs: any[];
      version: number;
      updatedAt: string;
    } => ({
      id: courtId,
      sessionId: 'session_01',
      courtNumber: parseInt(courtId, 10),
      category: 'mixed',
      levelMin: 2,
      levelMax: 4,
      minReliability: 50,
      pairingMode: 'auto',
      recruitOpen: true,
      roster: {
        host_01: {
          type: 'core',
          displayName: 'Host Nhật',
          gender: 'M',
          rating: 1500,
          level: 4,
          position: 'back',
          dominantHand: 'right',
          isGhost: false,
          checkedIn: true,
          joinedAt: '2026-11-15T09:30:00Z',
        },
      },
      pairs: [],
      version: 1,
      updatedAt: '2026-11-15T10:00:00Z',
    });

    beforeEach(async () => {
      await seedDoc('sessions/session_01', validSession);
    });

    runTest('T27 [ALLOW] Authenticated user can read court document', async () => {
      await seedDoc('sessions/session_01/courts/1', validCourt('1'));
      const db = authedDb('usr_player');
      await assertSucceeds(getDoc(doc(db, 'sessions/session_01/courts/1')));
    });

    runTest('T28 [ALLOW] Host of session can create court 1 or 2', async () => {
      const db = authedDb('host_01');
      await assertSucceeds(setDoc(doc(db, 'sessions/session_01/courts/1'), validCourt('1')));
    });

    runTest('T29 [DENY] Host cannot create court with courtId > 2 (courtId 3)', async () => {
      const db = authedDb('host_01');
      await assertFails(
        setDoc(doc(db, 'sessions/session_01/courts/3'), {
          ...validCourt('3'),
          courtNumber: 3,
        })
      );
    });

    runTest('T30 [DENY] Non-host cannot create court in host session', async () => {
      const db = authedDb('usr_stranger');
      await assertFails(setDoc(doc(db, 'sessions/session_01/courts/1'), validCourt('1')));
    });

    runTest('T31 [ALLOW] Host can update court roster and increment version', async () => {
      await seedDoc('sessions/session_01/courts/1', validCourt('1'));
      const db = authedDb('host_01');
      await assertSucceeds(
        updateDoc(doc(db, 'sessions/session_01/courts/1'), {
          recruitOpen: false,
          version: 2,
        })
      );
    });

    runTest('T32 [DENY] Host cannot put > 8 players in roster (Invariant I1)', async () => {
      await seedDoc('sessions/session_01/courts/1', validCourt('1'));
      const db = authedDb('host_01');
      const overflowRoster: Record<string, any> = {};
      for (let i = 1; i <= 9; i++) {
        overflowRoster[`user_${i}`] = {
          type: 'core',
          displayName: `Player ${i}`,
          gender: 'M',
        };
      }
      await assertFails(
        updateDoc(doc(db, 'sessions/session_01/courts/1'), {
          roster: overflowRoster,
        })
      );
    });

    runTest('T33 [ALLOW] Player can cancel/withdraw self from roster (version+1, removes only own uid)', async () => {
      const courtData = validCourt('1');
      courtData.roster['usr_player'] = {
        type: 'recruit',
        displayName: 'Player Đạt',
        gender: 'M',
        rating: 1400,
        level: 3,
        position: 'front',
        dominantHand: 'right',
        isGhost: false,
        checkedIn: false,
        joinedAt: '2026-11-15T09:40:00Z',
      };
      await seedDoc('sessions/session_01/courts/1', courtData);

      const db = authedDb('usr_player');
      const updatedRoster = { host_01: courtData.roster.host_01 }; // Removed usr_player only

      await assertSucceeds(
        updateDoc(doc(db, 'sessions/session_01/courts/1'), {
          roster: updatedRoster,
          version: 2,
          updatedAt: '2026-11-15T10:10:00Z',
        })
      );
    });

    runTest('T34 [DENY] Player cannot remove another player key from roster', async () => {
      const courtData = validCourt('1');
      courtData.roster['usr_victim'] = {
        type: 'recruit',
        displayName: 'Victim',
        gender: 'M',
      };
      await seedDoc('sessions/session_01/courts/1', courtData);

      const db = authedDb('usr_attacker');
      const maliciousRoster = { host_01: courtData.roster.host_01 }; // Trying to remove usr_victim

      await assertFails(
        updateDoc(doc(db, 'sessions/session_01/courts/1'), {
          roster: maliciousRoster,
          version: 2,
          updatedAt: '2026-11-15T10:10:00Z',
        })
      );
    });

    runTest('T35 [DENY] Player cannot add themselves directly into roster without host approval', async () => {
      await seedDoc('sessions/session_01/courts/1', validCourt('1'));
      const db = authedDb('usr_sneaky');
      const sneakedRoster = {
        ...validCourt('1').roster,
        usr_sneaky: { type: 'recruit', displayName: 'Sneaky', gender: 'M' },
      };
      await assertFails(
        updateDoc(doc(db, 'sessions/session_01/courts/1'), {
          roster: sneakedRoster,
          version: 2,
          updatedAt: '2026-11-15T10:10:00Z',
        })
      );
    });

    runTest('T36 [DENY] Non-host player cannot modify court settings (levelMin, category)', async () => {
      await seedDoc('sessions/session_01/courts/1', validCourt('1'));
      const db = authedDb('usr_player');
      await assertFails(
        updateDoc(doc(db, 'sessions/session_01/courts/1'), {
          levelMin: 1,
          category: 'men',
        })
      );
    });
  });

  // =========================================================================
  // SUITE 5: REQUESTS SUBCOLLECTION (.../requests/{requestId})
  // =========================================================================
  describe('5. Requests Subcollection (.../requests/{requestId})', () => {
    const validSession = { id: 'session_01', hostId: 'host_01', status: 'open' };
    const validRequest = (userId: string) => ({
      id: userId,
      courtId: '1',
      sessionId: 'session_01',
      userId,
      status: 'requested',
      snapshot: {
        displayName: 'Player Đạt',
        gender: 'M',
        rating: 1400,
        level: 3,
        position: 'front',
        reliability: 100,
      },
      note: 'Xin giao lưu nhé',
      createdAt: '2026-11-15T10:15:00Z',
    });

    beforeEach(async () => {
      await seedDoc('sessions/session_01', validSession);
    });

    runTest('T37 [ALLOW] Player can submit request for themselves (status requested)', async () => {
      const db = authedDb('usr_dat');
      await assertSucceeds(
        setDoc(
          doc(db, 'sessions/session_01/courts/1/requests/usr_dat'),
          validRequest('usr_dat')
        )
      );
    });

    runTest('T38 [DENY] Player cannot submit request on behalf of another user', async () => {
      const db = authedDb('usr_attacker');
      await assertFails(
        setDoc(
          doc(db, 'sessions/session_01/courts/1/requests/usr_victim'),
          validRequest('usr_victim')
        )
      );
    });

    runTest('T39 [ALLOW] Host of session can approve request (status confirmed)', async () => {
      await seedDoc(
        'sessions/session_01/courts/1/requests/usr_dat',
        validRequest('usr_dat')
      );
      const db = authedDb('host_01');
      await assertSucceeds(
        updateDoc(doc(db, 'sessions/session_01/courts/1/requests/usr_dat'), {
          status: 'confirmed',
          decidedAt: '2026-11-15T10:30:00Z',
        })
      );
    });

    runTest('T40 [DENY] Player cannot self-approve their own request to confirmed', async () => {
      await seedDoc(
        'sessions/session_01/courts/1/requests/usr_dat',
        validRequest('usr_dat')
      );
      const db = authedDb('usr_dat');
      await assertFails(
        updateDoc(doc(db, 'sessions/session_01/courts/1/requests/usr_dat'), {
          status: 'confirmed',
        })
      );
    });

    runTest('T41 [ALLOW] Player can withdraw their own request (status withdrawn)', async () => {
      await seedDoc(
        'sessions/session_01/courts/1/requests/usr_dat',
        validRequest('usr_dat')
      );
      const db = authedDb('usr_dat');
      await assertSucceeds(
        updateDoc(doc(db, 'sessions/session_01/courts/1/requests/usr_dat'), {
          status: 'withdrawn',
        })
      );
    });

    runTest('T42 [DENY] Player cannot withdraw someone else request', async () => {
      await seedDoc(
        'sessions/session_01/courts/1/requests/usr_dat',
        validRequest('usr_dat')
      );
      const db = authedDb('usr_stranger');
      await assertFails(
        updateDoc(doc(db, 'sessions/session_01/courts/1/requests/usr_dat'), {
          status: 'withdrawn',
        })
      );
    });

    runTest('T43 [ALLOW] Host can decline request (status declined)', async () => {
      await seedDoc(
        'sessions/session_01/courts/1/requests/usr_dat',
        validRequest('usr_dat')
      );
      const db = authedDb('host_01');
      await assertSucceeds(
        updateDoc(doc(db, 'sessions/session_01/courts/1/requests/usr_dat'), {
          status: 'declined',
          decidedAt: '2026-11-15T10:30:00Z',
        })
      );
    });

    runTest('T44 [ALLOW] Player can delete their own request', async () => {
      await seedDoc(
        'sessions/session_01/courts/1/requests/usr_dat',
        validRequest('usr_dat')
      );
      const db = authedDb('usr_dat');
      await assertSucceeds(
        deleteDoc(doc(db, 'sessions/session_01/courts/1/requests/usr_dat'))
      );
    });
  });

  // =========================================================================
  // SUITE 6: MATCHES SUBCOLLECTION (.../matches/{matchId})
  // =========================================================================
  describe('6. Matches Subcollection (.../matches/{matchId})', () => {
    const validSession = { id: 'session_01', hostId: 'host_01' };
    const validMatch = (matchId: string) => ({
      id: matchId,
      sessionId: 'session_01',
      courtId: '1',
      index: 1,
      teamA: ['usr_01', 'usr_02'],
      teamB: ['usr_03', 'usr_04'],
      sets: [{ setNumber: 1, scoreA: 21, scoreB: 18 }],
      status: 'confirmed',
      ratingProcessed: false,
      cards: [],
      createdAt: '2026-11-18T18:30:00Z',
      updatedAt: '2026-11-18T18:50:00Z',
    });

    beforeEach(async () => {
      await seedDoc('sessions/session_01', validSession);
    });

    runTest('T45 [ALLOW] Host can create a match with ratingProcessed = false', async () => {
      const db = authedDb('host_01');
      await assertSucceeds(
        setDoc(doc(db, 'sessions/session_01/matches/match_01'), validMatch('match_01'))
      );
    });

    runTest('T46 [DENY] Host cannot create match with ratingProcessed = true', async () => {
      const db = authedDb('host_01');
      const malicious = { ...validMatch('match_01'), ratingProcessed: true };
      await assertFails(
        setDoc(doc(db, 'sessions/session_01/matches/match_01'), malicious)
      );
    });

    runTest('T47 [ALLOW] Host can update match scores and status', async () => {
      await seedDoc('sessions/session_01/matches/match_01', validMatch('match_01'));
      const db = authedDb('host_01');
      await assertSucceeds(
        updateDoc(doc(db, 'sessions/session_01/matches/match_01'), {
          sets: [{ setNumber: 1, scoreA: 21, scoreB: 19 }],
          status: 'finished',
        })
      );
    });

    runTest('T48 [DENY] Host or client cannot set ratingProcessed = true on update', async () => {
      await seedDoc('sessions/session_01/matches/match_01', validMatch('match_01'));
      const db = authedDb('host_01');
      await assertFails(
        updateDoc(doc(db, 'sessions/session_01/matches/match_01'), {
          ratingProcessed: true,
        })
      );
    });

    runTest('T49 [ALLOW] Player can submit review cards after match (only modifies cards, updatedAt)', async () => {
      await seedDoc('sessions/session_01/matches/match_01', validMatch('match_01'));
      const db = authedDb('usr_01');
      await assertSucceeds(
        updateDoc(doc(db, 'sessions/session_01/matches/match_01'), {
          cards: [{ fromUserId: 'usr_01', toUserId: 'usr_02', tag: 'good_attitude' }],
          updatedAt: '2026-11-18T19:00:00Z',
        })
      );
    });

    runTest('T50 [DENY] Non-host non-player cannot alter match scores', async () => {
      await seedDoc('sessions/session_01/matches/match_01', validMatch('match_01'));
      const db = authedDb('usr_random');
      await assertFails(
        updateDoc(doc(db, 'sessions/session_01/matches/match_01'), {
          sets: [{ setNumber: 1, scoreA: 0, scoreB: 21 }],
        })
      );
    });
  });

  // =========================================================================
  // SUITE 7: RATINGS COLLECTION (/ratings/{ratingId})
  // =========================================================================
  describe('7. Ratings Collection (/ratings/{ratingId})', () => {
    const ratingDoc = {
      id: 'rate_01',
      userId: 'usr_alice',
      oldRating: 1400,
      newRating: 1416,
      delta: 16,
      kFactor: 40,
      reason: 'match_result',
      createdAt: '2026-11-18T19:00:00Z',
    };

    runTest('T51 [ALLOW] Player can read their own rating change log', async () => {
      await seedDoc('ratings/rate_01', ratingDoc);
      const db = authedDb('usr_alice');
      await assertSucceeds(getDoc(doc(db, 'ratings/rate_01')));
    });

    runTest('T52 [DENY] Player cannot read another player rating change log', async () => {
      await seedDoc('ratings/rate_01', ratingDoc);
      const db = authedDb('usr_bob');
      await assertFails(getDoc(doc(db, 'ratings/rate_01')));
    });

    runTest('T53 [ALLOW] Admin can read any player rating change log', async () => {
      await seedDoc('ratings/rate_01', ratingDoc);
      const db = adminDb();
      await assertSucceeds(getDoc(doc(db, 'ratings/rate_01')));
    });

    runTest('T54 [DENY] Client write to /ratings is completely blocked (Admin SDK only)', async () => {
      const db = authedDb('usr_alice');
      await assertFails(setDoc(doc(db, 'ratings/rate_fake'), ratingDoc));
    });
  });

  // =========================================================================
  // SUITE 8: NOTIFICATIONS COLLECTION (/notifications/{notificationId})
  // =========================================================================
  describe('8. Notifications Collection (/notifications/{notificationId})', () => {
    const notifDoc = {
      id: 'notif_01',
      userId: 'usr_alice',
      type: 'request_approved',
      title: 'Đơn đã được duyệt',
      body: 'Bạn đã vào Sân 1',
      read: false,
      createdAt: '2026-11-15T10:30:00Z',
    };

    runTest('T55 [ALLOW] Recipient can read their own notification', async () => {
      await seedDoc('notifications/notif_01', notifDoc);
      const db = authedDb('usr_alice');
      await assertSucceeds(getDoc(doc(db, 'notifications/notif_01')));
    });

    runTest('T56 [DENY] Other user cannot read recipient notification', async () => {
      await seedDoc('notifications/notif_01', notifDoc);
      const db = authedDb('usr_bob');
      await assertFails(getDoc(doc(db, 'notifications/notif_01')));
    });

    runTest('T57 [DENY] Client cannot create a notification (Backend/Admin SDK only)', async () => {
      const db = authedDb('usr_alice');
      await assertFails(setDoc(doc(db, 'notifications/notif_fake'), notifDoc));
    });

    runTest('T58 [ALLOW] Recipient can mark notification as read (read = true)', async () => {
      await seedDoc('notifications/notif_01', notifDoc);
      const db = authedDb('usr_alice');
      await assertSucceeds(
        updateDoc(doc(db, 'notifications/notif_01'), {
          read: true,
        })
      );
    });

    runTest('T59 [DENY] Recipient cannot tamper with notification title or body', async () => {
      await seedDoc('notifications/notif_01', notifDoc);
      const db = authedDb('usr_alice');
      await assertFails(
        updateDoc(doc(db, 'notifications/notif_01'), {
          title: 'Hacked Title',
        })
      );
    });

    runTest('T60 [ALLOW] Recipient can delete their own notification', async () => {
      await seedDoc('notifications/notif_01', notifDoc);
      const db = authedDb('usr_alice');
      await assertSucceeds(deleteDoc(doc(db, 'notifications/notif_01')));
    });
  });
});
