/**
 * Dịch vụ xác thực thật dùng Firebase Auth JS SDK (modular).
 * Lưu phiên qua AsyncStorage (cấu hình trong src/data/firebase/client.ts).
 *
 * Lưu ý ADR-002:
 * - Bản Expo Go hỗ trợ Email/Mật khẩu qua Firebase Auth (Emulator cổng 9099 hoặc Cloud).
 * - Google Sign-In (expo-auth-session) sẽ bổ sung khi chốt Client ID theo ADR-002.
 */

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as updateAuthProfile,
  User,
} from "firebase/auth";
import { getFirebaseAuth } from "../firebase/client";
import { extractFirebaseErrorCode, mapFirebaseError } from "../firebase/errors";
import {
  AccountPreview,
  AuthError,
  AuthUser,
  IAuthService,
  RegisterInput,
} from "./types";
import {
  maskEmail,
  validateDisplayName,
  validateEmail,
  validatePassword,
} from "./validators";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toAuthUser(user: User, fallbackDisplayName?: string): AuthUser {
  return {
    uid: user.uid,
    email: user.email ?? "",
    displayName: user.displayName ?? fallbackDisplayName,
    phoneNumber: user.phoneNumber ?? undefined,
    // Email/Mật khẩu Firebase Auth trên Expo Go: cho phép đi tiếp sang khởi tạo hồ sơ
    // mà không bị kẹt ở màn OTP giả lập.
    verified: true,
  };
}

function wrapAuthError(err: unknown, fallback: string): AuthError {
  if (err instanceof AuthError) return err;
  const code = extractFirebaseErrorCode(err);
  const mapped = mapFirebaseError(err, fallback);
  return new AuthError(code, mapped.message);
}

export class FirebaseAuthService implements IAuthService {
  async restoreSession(): Promise<AuthUser | null> {
    const auth = getFirebaseAuth();
    if (auth.currentUser) {
      return toAuthUser(auth.currentUser);
    }

    return new Promise<AuthUser | null>((resolve) => {
      let settled = false;
      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          resolve(auth.currentUser ? toAuthUser(auth.currentUser) : null);
        }
      }, 2000);

      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          unsubscribe();
          resolve(user ? toAuthUser(user) : null);
        },
        () => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          unsubscribe();
          resolve(null);
        }
      );
    });
  }

  async register(input: RegisterInput): Promise<AuthUser> {
    const emailErr = validateEmail(input.email);
    if (emailErr) throw new AuthError("INVALID_EMAIL", emailErr);
    const pwErr = validatePassword(input.password);
    if (pwErr) throw new AuthError("WEAK_PASSWORD", pwErr);
    const nameErr = validateDisplayName(input.displayName);
    if (nameErr) throw new AuthError("INVALID_NAME", nameErr);

    const auth = getFirebaseAuth();
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        normalizeEmail(input.email),
        input.password
      );
      const trimmedName = input.displayName.trim();
      if (trimmedName) {
        try {
          await updateAuthProfile(cred.user, { displayName: trimmedName });
        } catch {
          // Không chặn đăng ký nếu cập nhật displayName trên Auth chậm
        }
      }
      return toAuthUser(cred.user, trimmedName);
    } catch (err) {
      throw wrapAuthError(err, "Không thể tạo tài khoản Firebase.");
    }
  }

  async login(email: string, password: string): Promise<AuthUser> {
    const emailErr = validateEmail(email);
    if (emailErr) throw new AuthError("INVALID_EMAIL", emailErr);
    if (!password) {
      throw new AuthError("MISSING_PASSWORD", "Vui lòng nhập mật khẩu.");
    }

    const auth = getFirebaseAuth();
    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        normalizeEmail(email),
        password
      );
      return toAuthUser(cred.user);
    } catch (err) {
      throw wrapAuthError(err, "Đăng nhập thất bại.");
    }
  }

  async logout(): Promise<void> {
    const auth = getFirebaseAuth();
    try {
      await signOut(auth);
    } catch (err) {
      throw wrapAuthError(err, "Không thể đăng xuất.");
    }
  }

  async sendOtp(): Promise<void> {
    // Chờ ADR-002 / Cloud Function gửi OTP thật nếu dùng Phone/Email OTP
    return Promise.resolve();
  }

  async verifyOtp(_code: string): Promise<AuthUser> {
    const auth = getFirebaseAuth();
    if (!auth.currentUser) {
      throw new AuthError("NO_SESSION", "Phiên đăng nhập không tồn tại.");
    }
    return toAuthUser(auth.currentUser);
  }

  async lookupAccount(email: string): Promise<AccountPreview> {
    const emailErr = validateEmail(email);
    if (emailErr) throw new AuthError("INVALID_EMAIL", emailErr);
    const normalized = normalizeEmail(email);
    return {
      maskedEmail: maskEmail(normalized),
      displayName: null,
    };
  }

  async sendResetCode(email: string): Promise<void> {
    const emailErr = validateEmail(email);
    if (emailErr) throw new AuthError("INVALID_EMAIL", emailErr);
    const auth = getFirebaseAuth();
    try {
      await sendPasswordResetEmail(auth, normalizeEmail(email));
    } catch (err) {
      throw wrapAuthError(
        err,
        "Không thể gửi email khôi phục mật khẩu. Vui lòng thử lại."
      );
    }
  }

  async resetPassword(
    _email: string,
    _code: string,
    _newPassword: string
  ): Promise<void> {
    throw new AuthError(
      "RESET_VIA_EMAIL_LINK",
      "Firebase Auth gửi liên kết đặt lại mật khẩu qua email. Vui lòng kiểm tra hộp thư để đổi mật khẩu."
    );
  }
}
