/**
 * Hợp đồng dịch vụ xác thực cho Mobile App.
 *
 * Nguồn thật (Firebase Auth) sẽ nối ở Q11. Bản Expo Go hiện chạy MockAuthService
 * (email/mật khẩu lưu AsyncStorage, OTP giả lập).
 *
 * TODO(ADR-002): chờ phương án đăng nhập thật theo ADR-002 (Google Sign-In + Email/Password
 * qua Firebase Auth). Màn OTP và khôi phục mật khẩu hiện dùng mã giả lập cố định.
 */

export interface AuthUser {
  uid: string;
  email: string;
  /** Tên gợi ý lúc đăng ký (dùng điền sẵn bước khởi tạo hồ sơ) */
  displayName?: string;
  phoneNumber?: string;
  /** Đã xác thực mã OTP/kích hoạt tài khoản chưa */
  verified: boolean;
}

export interface RegisterInput {
  email: string;
  password: string;
  displayName: string;
  phoneNumber?: string;
}

export interface AccountPreview {
  maskedEmail: string;
  displayName: string | null;
  eloLabel?: string;
  areaLabel?: string;
}

export class AuthError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

export interface IAuthService {
  /** Khôi phục phiên đã lưu (AsyncStorage). Trả null nếu chưa đăng nhập. */
  restoreSession(): Promise<AuthUser | null>;
  register(input: RegisterInput): Promise<AuthUser>;
  login(email: string, password: string): Promise<AuthUser>;
  logout(): Promise<void>;
  /** Gửi lại mã OTP (giả lập) */
  sendOtp(): Promise<void>;
  /** Xác thực OTP; thành công thì đánh dấu tài khoản đã kích hoạt */
  verifyOtp(code: string): Promise<AuthUser>;
  /** Tra cứu tài khoản theo email để hiển thị thẻ xác minh khi khôi phục mật khẩu */
  lookupAccount(email: string): Promise<AccountPreview>;
  /** Gửi mã khôi phục (giả lập) */
  sendResetCode(email: string): Promise<void>;
  /** Đặt lại mật khẩu bằng mã khôi phục */
  resetPassword(email: string, code: string, newPassword: string): Promise<void>;
}

