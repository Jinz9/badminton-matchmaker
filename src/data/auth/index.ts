import { getConfiguredDataSource } from "../index";
import { FirebaseAuthService } from "./FirebaseAuthService";
import { MockAuthService } from "./MockAuthService";
import { IAuthService } from "./types";

export * from "./types";
export * from "./validators";
export * from "./MockAuthService";
export * from "./FirebaseAuthService";

let activeAuth: IAuthService | null = null;

/** Singleton dịch vụ xác thực theo EXPO_PUBLIC_DATA_SOURCE (mock | firebase) */
export function getAuthService(): IAuthService {
  if (!activeAuth) {
    activeAuth =
      getConfiguredDataSource() === "firebase"
        ? new FirebaseAuthService()
        : new MockAuthService();
  }
  return activeAuth;
}

/** Cho Unit Test hoặc đổi nguồn khi chạy */
export function setAuthService(service: IAuthService | null): void {
  activeAuth = service;
}

