/**
 * Theo dõi trạng thái mạng (NetInfo) + công tắc "Ngoại tuyến giả" phục vụ dev & test thực địa.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NetInfoState } from "@react-native-community/netinfo";
import { OFFLINE_STORAGE_KEYS } from "./sessionSnapshot";

export interface NetworkMonitorState {
  realConnected: boolean;
  simulatedOffline: boolean;
  isOnline: boolean;
}

type NetworkListener = (state: NetworkMonitorState) => void;

let realConnected = true;
let simulatedOffline = false;
let initialized = false;
const listeners = new Set<NetworkListener>();
let netInfoUnsub: (() => void) | null = null;

function buildState(): NetworkMonitorState {
  return {
    realConnected,
    simulatedOffline,
    isOnline: realConnected && !simulatedOffline,
  };
}

function notifyAll(): void {
  const snapshot = buildState();
  listeners.forEach((cb) => cb(snapshot));
}

function parseNetInfoConnected(state: NetInfoState): boolean {
  if (state.isConnected === false) return false;
  if (state.isInternetReachable === false) return false;
  return true;
}

export async function initNetworkMonitor(): Promise<NetworkMonitorState> {
  if (!initialized) {
    initialized = true;
    try {
      const saved = await AsyncStorage.getItem(
        OFFLINE_STORAGE_KEYS.SIMULATED_OFFLINE
      );
      simulatedOffline = saved === "true";
    } catch {
      simulatedOffline = false;
    }

    try {
      const NetInfo = require("@react-native-community/netinfo")
        .default as typeof import("@react-native-community/netinfo").default;
      const initial = await NetInfo.fetch();
      realConnected = parseNetInfoConnected(initial);
      netInfoUnsub = NetInfo.addEventListener((next) => {
        const nextConnected = parseNetInfoConnected(next);
        if (nextConnected !== realConnected) {
          realConnected = nextConnected;
          notifyAll();
        }
      });
    } catch {
      realConnected = true;
    }
    notifyAll();
  }
  return buildState();
}

export function getNetworkMonitorState(): NetworkMonitorState {
  return buildState();
}

export async function setSimulatedOffline(value: boolean): Promise<void> {
  simulatedOffline = value;
  try {
    await AsyncStorage.setItem(
      OFFLINE_STORAGE_KEYS.SIMULATED_OFFLINE,
      value ? "true" : "false"
    );
  } catch {
    // ignore
  }
  notifyAll();
}

export function subscribeNetworkMonitor(cb: NetworkListener): () => void {
  listeners.add(cb);
  cb(buildState());
  if (!initialized) {
    void initNetworkMonitor();
  }
  return () => {
    listeners.delete(cb);
  };
}

/** Reset trạng thái phục vụ Unit Test */
export function resetNetworkMonitorForTest(): void {
  if (netInfoUnsub) {
    netInfoUnsub();
    netInfoUnsub = null;
  }
  initialized = false;
  realConnected = true;
  simulatedOffline = false;
  listeners.clear();
}
