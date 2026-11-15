import { getConfiguredDataSource } from "../index";
import { MockAuthService } from "./MockAuthService";
import { IAuthService } from "./types";

export * from "./types";
export * from "./validators";
export * from "./MockAuthService";

let activeAuth: IAuthService | null = null;

/** Singleton dịch vụ xác thực theo EXPO_PUBLIC_DATA_SOURCE (mock | firebase) */
export function getAuthService(): IAuthService {
  if (!activeAuth) {
    if (getConfiguredDataSource() === "firebase") {
      // Tải lười để tránh nạp firebase/auth ESM khi chạy chế độ mock / test UI
      const { FirebaseAuthService } = require("./FirebaseAuthService") as {
        FirebaseAuthService: new () => IAuthService;
      };
      activeAuth = new FirebaseAuthService();
    } else {
      activeAuth = new MockAuthService();
    }
  }
  return activeAuth;
}

/** Cho Unit Test hoặc đổi nguồn khi chạy */
export function setAuthService(service: IAuthService | null): void {
  activeAuth = service;
}

