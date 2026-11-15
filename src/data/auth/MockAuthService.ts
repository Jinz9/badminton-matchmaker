import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  AccountPreview,
  AuthError,
  AuthUser,
  IAuthService,
  RegisterInput,
} from "./types";
import { maskEmail } from "./validators";

/**
 * Mã OTP / mã khôi phục giả lập CỐ ĐỊNH.
 * TODO(ADR-002): chờ phương án đăng nhập thật theo ADR-002 — thay bằng Firebase Auth ở Q11.
 */
export const MOCK_OTP_CODE = "123456";

export const MOCK_DEMO_ACCOUNTS = [
  {
    email: "host@badminton.vn",
    password: "123456",
    uid: "usr_nhat_01",
    displayName: "Đào Duy Nhật",
    label: "Host (Đào Duy Nhật)",
  },
  {
    email: "player@badminton.vn",
    password: "123456",
    uid: "usr_dat_02",
    displayName: "Nguyễn Đức Đạt",
    label: "Người chơi (Nguyễn Đức Đạt)",
  },
] as const;

const ACCOUNTS_KEY = "@badminton/mock_accounts_v1";
const SESSION_KEY = "@badminton/auth_session_v1";

interface StoredAccount {
  uid: string;
  email: string;
  /** CHỈ DÙNG CHO MOCK — Firebase thật không bao giờ lưu mật khẩu ở client */
  password: string;
  displayName?: string;
  phoneNumber?: string;
  verified: boolean;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toAuthUser(a: StoredAccount): AuthUser {
  return {
    uid: a.uid,
    email: a.email,
    displayName: a.displayName,
    phoneNumber: a.phoneNumber,
    verified: a.verified,
  };
}

function seedAccounts(): StoredAccount[] {
  return MOCK_DEMO_ACCOUNTS.map((d) => ({
    uid: d.uid,
    email: d.email,
    password: d.password,
    displayName: d.displayName,
    verified: true,
  }));
}

export interface MockAuthOptions {
  /** Độ trễ giả lập (ms); mặc định 300 */
  latencyMs?: number;
}

export class MockAuthService implements IAuthService {
  private latencyMs: number;

  constructor(options: MockAuthOptions = {}) {
    this.latencyMs = options.latencyMs ?? 300;
  }

  private async wait(): Promise<void> {
    if (this.latencyMs > 0) {
      await new Promise((r) => setTimeout(r, this.latencyMs));
    }
  }

  private async loadAccounts(): Promise<StoredAccount[]> {
    try {
      const raw = await AsyncStorage.getItem(ACCOUNTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredAccount[];
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // bỏ qua, dùng dữ liệu seed
    }
    return seedAccounts();
  }

  private async saveAccounts(accounts: StoredAccount[]): Promise<void> {
    await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  }

  private async saveSession(uid: string | null): Promise<void> {
    if (uid) await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ uid }));
    else await AsyncStorage.removeItem(SESSION_KEY);
  }

  async restoreSession(): Promise<AuthUser | null> {
    try {
      const raw = await AsyncStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const { uid } = JSON.parse(raw) as { uid: string };
      const accounts = await this.loadAccounts();
      const acc = accounts.find((a) => a.uid === uid);
      return acc ? toAuthUser(acc) : null;
    } catch {
      return null;
    }
  }

  async register(input: RegisterInput): Promise<AuthUser> {
    await this.wait();
    const email = normalizeEmail(input.email);
    const accounts = await this.loadAccounts();
    if (accounts.some((a) => a.email === email)) {
      throw new AuthError(
        "auth/email-already-in-use",
        "Email này đã được sử dụng. Vui lòng đăng nhập hoặc chọn Quên mật khẩu."
      );
    }
    if (input.password.length < 6) {
      throw new AuthError(
        "auth/weak-password",
        "Mật khẩu quá ngắn. Vui lòng nhập tối thiểu 6 ký tự để bảo mật."
      );
    }
    const account: StoredAccount = {
      uid: `usr_${Date.now().toString(36)}`,
      email,
      password: input.password,
      displayName: input.displayName.trim(),
      phoneNumber: input.phoneNumber?.replace(/\s+/g, "") || undefined,
      verified: false,
    };
    accounts.push(account);
    await this.saveAccounts(accounts);
    await this.saveSession(account.uid);
    return toAuthUser(account);
  }

  async login(email: string, password: string): Promise<AuthUser> {
    await this.wait();
    const accounts = await this.loadAccounts();
    const acc = accounts.find((a) => a.email === normalizeEmail(email));
    if (!acc) {
      throw new AuthError(
        "auth/user-not-found",
        "Không tìm thấy tài khoản với email này. Vui lòng đăng ký."
      );
    }
    if (acc.password !== password) {
      throw new AuthError(
        "auth/invalid-credential",
        "Email hoặc mật khẩu không chính xác. Vui lòng thử lại."
      );
    }
    await this.saveAccounts(accounts);
    await this.saveSession(acc.uid);
    return toAuthUser(acc);
  }

  async logout(): Promise<void> {
    await this.saveSession(null);
  }

  async sendOtp(): Promise<void> {
    await this.wait();
  }

  async verifyOtp(code: string): Promise<AuthUser> {
    await this.wait();
    if (code !== MOCK_OTP_CODE) {
      throw new AuthError(
        "auth/invalid-verification-code",
        "Mã xác thực không đúng. Vui lòng kiểm tra và thử lại."
      );
    }
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) {
      throw new AuthError("auth/requires-recent-login", "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }
    const { uid } = JSON.parse(raw) as { uid: string };
    const accounts = await this.loadAccounts();
    const acc = accounts.find((a) => a.uid === uid);
    if (!acc) {
      throw new AuthError("auth/user-not-found", "Không tìm thấy tài khoản. Vui lòng đăng nhập lại.");
    }
    acc.verified = true;
    await this.saveAccounts(accounts);
    return toAuthUser(acc);
  }

  async lookupAccount(email: string): Promise<AccountPreview> {
    await this.wait();
    const accounts = await this.loadAccounts();
    const acc = accounts.find((a) => a.email === normalizeEmail(email));
    if (!acc) {
      throw new AuthError(
        "auth/user-not-found",
        "Không tìm thấy tài khoản với email này. Vui lòng đăng ký."
      );
    }
    return {
      maskedEmail: maskEmail(acc.email),
      displayName: acc.displayName ?? "Đào Duy Nhật",
      eloLabel: "1601 ELO • Cấp 4 TB+",
      areaLabel: "Hải Châu, Đà Nẵng",
    };
  }

  async sendResetCode(email: string): Promise<void> {
    await this.lookupAccount(email);
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    await this.wait();
    if (code !== MOCK_OTP_CODE) {
      throw new AuthError(
        "auth/invalid-verification-code",
        "Mã xác thực không đúng. Vui lòng kiểm tra và thử lại."
      );
    }
    if (newPassword.length < 6) {
      throw new AuthError(
        "auth/weak-password",
        "Mật khẩu quá ngắn. Vui lòng nhập tối thiểu 6 ký tự để bảo mật."
      );
    }
    const accounts = await this.loadAccounts();
    const acc = accounts.find((a) => a.email === normalizeEmail(email));
    if (!acc) {
      throw new AuthError(
        "auth/user-not-found",
        "Không tìm thấy tài khoản với email này. Vui lòng đăng ký."
      );
    }
    acc.password = newPassword;
    await this.saveAccounts(accounts);
  }

  /** Dùng trong màn dev: xóa toàn bộ tài khoản mock & phiên */
  async resetMockAccounts(): Promise<void> {
    await AsyncStorage.removeItem(ACCOUNTS_KEY);
    await AsyncStorage.removeItem(SESSION_KEY);
  }
}

