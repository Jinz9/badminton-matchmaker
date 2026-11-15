import { AccountPreview, AuthUser, IAuthService, RegisterInput } from "./types";

const NOT_CONNECTED_MSG =
  "FirebaseAuthService chưa nối (Q11) — đặt EXPO_PUBLIC_DATA_SOURCE=mock để dùng đăng nhập giả lập. " +
  "Chờ phương án đăng nhập thật theo ADR-002 (Google + Email/Mật khẩu).";

function notConnected(): never {
  throw new Error(NOT_CONNECTED_MSG);
}

/**
 * Khung rỗng Firebase Auth — làm ở Q11.
 * TODO(ADR-002): Google Sign-In (expo-auth-session) + createUserWithEmailAndPassword.
 */
export class FirebaseAuthService implements IAuthService {
  async restoreSession(): Promise<AuthUser | null> {
    notConnected();
  }
  async register(_input: RegisterInput): Promise<AuthUser> {
    notConnected();
  }
  async login(_email: string, _password: string): Promise<AuthUser> {
    notConnected();
  }
  async logout(): Promise<void> {
    notConnected();
  }
  async sendOtp(): Promise<void> {
    notConnected();
  }
  async verifyOtp(_code: string): Promise<AuthUser> {
    notConnected();
  }
  async lookupAccount(_email: string): Promise<AccountPreview> {
    notConnected();
  }
  async sendResetCode(_email: string): Promise<void> {
    notConnected();
  }
  async resetPassword(_email: string, _code: string, _newPassword: string): Promise<void> {
    notConnected();
  }
}

