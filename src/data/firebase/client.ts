/**
 * Khởi tạo Firebase Client SDK (Modular v10+/v13) cho Expo / React Native.
 * Hỗ trợ:
 * - Lưu phiên Auth qua AsyncStorage (khi chạy trong React Native)
 * - Firestore experimentalAutoDetectLongPolling (tránh lỗi WebChannel trên RN/Android)
 * - Tự động nối Firebase Emulator khi EXPO_PUBLIC_USE_FIREBASE_EMULATOR=true hoặc EXPO_PUBLIC_USE_EMULATOR=true
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import * as firebaseAuth from "firebase/auth";
import { Auth, connectAuthEmulator, getAuth, initializeAuth } from "firebase/auth";
import {
  connectFirestoreEmulator,
  Firestore,
  getFirestore,
  initializeFirestore,
} from "firebase/firestore";
import {
  connectFunctionsEmulator,
  Functions,
  getFunctions,
} from "firebase/functions";
import { FIREBASE_CONSTANTS, firebaseConfig } from "../../config/firebase";

export interface EmulatorSettings {
  enabled: boolean;
  host: string;
  authPort: number;
  firestorePort: number;
  functionsPort: number;
}

export function resolveEmulatorSettings(): EmulatorSettings {
  const useFlag =
    process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR ??
    process.env.EXPO_PUBLIC_USE_EMULATOR;
  const enabled = useFlag?.trim().toLowerCase() === "true";
  const host =
    process.env.EXPO_PUBLIC_EMULATOR_HOST?.trim() ||
    FIREBASE_CONSTANTS.EMULATOR_HOST ||
    "10.0.2.2";

  return {
    enabled,
    host,
    authPort: FIREBASE_CONSTANTS.AUTH_PORT || 9099,
    firestorePort: FIREBASE_CONSTANTS.FIRESTORE_PORT || 8080,
    functionsPort: 5001,
  };
}

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;
let cachedDb: Firestore | null = null;
let cachedFunctions: Functions | null = null;
let authEmulatorConnected = false;
let firestoreEmulatorConnected = false;
let functionsEmulatorConnected = false;

export function getFirebaseApp(): FirebaseApp {
  if (cachedApp) return cachedApp;
  cachedApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  return cachedApp;
}

export function getFirebaseAuth(): Auth {
  if (cachedAuth) return cachedAuth;
  const app = getFirebaseApp();
  try {
    const getRNPersistence = (
      firebaseAuth as unknown as {
        getReactNativePersistence?: (storage: typeof AsyncStorage) => unknown;
      }
    ).getReactNativePersistence;

    if (typeof getRNPersistence === "function") {
      cachedAuth = initializeAuth(app, {
        persistence: getRNPersistence(AsyncStorage) as never,
      });
    } else {
      cachedAuth = getAuth(app);
    }
  } catch {
    // Đã initializeAuth trước đó (Fast Refresh) hoặc môi trường test -> dùng getAuth
    cachedAuth = getAuth(app);
  }

  const emu = resolveEmulatorSettings();
  if (emu.enabled && !authEmulatorConnected) {
    try {
      connectAuthEmulator(cachedAuth, `http://${emu.host}:${emu.authPort}`, {
        disableWarnings: true,
      });
      authEmulatorConnected = true;
    } catch {
      // Bỏ qua nếu đã kết nối trước đó
    }
  }

  return cachedAuth;
}

export function getFirebaseDb(): Firestore {
  if (cachedDb) return cachedDb;
  const app = getFirebaseApp();
  try {
    cachedDb = initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
    });
  } catch {
    cachedDb = getFirestore(app);
  }

  const emu = resolveEmulatorSettings();
  if (emu.enabled && !firestoreEmulatorConnected) {
    try {
      connectFirestoreEmulator(cachedDb, emu.host, emu.firestorePort);
      firestoreEmulatorConnected = true;
    } catch {
      // Bỏ qua nếu đã kết nối trước đó
    }
  }

  return cachedDb;
}

export function getFirebaseFunctions(): Functions {
  if (cachedFunctions) return cachedFunctions;
  const app = getFirebaseApp();
  cachedFunctions = getFunctions(app, FIREBASE_CONSTANTS.REGION || "asia-southeast1");

  const emu = resolveEmulatorSettings();
  if (emu.enabled && !functionsEmulatorConnected) {
    try {
      connectFunctionsEmulator(cachedFunctions, emu.host, emu.functionsPort);
      functionsEmulatorConnected = true;
    } catch {
      // Bỏ qua nếu đã kết nối trước đó
    }
  }

  return cachedFunctions;
}

/** Reset cache phục vụ Unit Test */
export function resetFirebaseClientCache(): void {
  cachedApp = null;
  cachedAuth = null;
  cachedDb = null;
  cachedFunctions = null;
  authEmulatorConnected = false;
  firestoreEmulatorConnected = false;
  functionsEmulatorConnected = false;
}

