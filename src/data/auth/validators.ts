/**
 * Kiểm tra đầu vào biểu mẫu Xác thực & Hồ sơ (thuần, không phụ thuộc React).
 * Thông báo lỗi bằng tiếng Việt, khớp bảng mã lỗi trong docs/api/auth-profile.md.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const VN_MOBILE_REGEX = /^(?:\+?84|0)(?:3|5|7|8|9)\d{8}$/;

export type FieldError = string | null;

export function validateEmail(value: string): FieldError {
  const email = value.trim();
  if (!email) return "Vui lòng nhập địa chỉ email.";
  if (!EMAIL_REGEX.test(email)) {
    return "Địa chỉ email không hợp lệ. Vui lòng kiểm tra lại.";
  }
  return null;
}

export function validatePassword(value: string): FieldError {
  if (!value) return "Vui lòng nhập mật khẩu.";
  if (value.length < 6) {
    return "Mật khẩu quá ngắn. Vui lòng nhập tối thiểu 6 ký tự để bảo mật.";
  }
  return null;
}

export function validatePasswordConfirm(password: string, confirm: string): FieldError {
  if (!confirm) return "Vui lòng nhập lại mật khẩu.";
  if (password !== confirm) return "Mật khẩu nhập lại không khớp.";
  return null;
}

export function validateDisplayName(value: string): FieldError {
  const name = value.trim();
  if (!name) return "Vui lòng nhập họ và tên.";
  if (name.length < 2 || name.length > 50) {
    return "Tên hiển thị phải từ 2 đến 50 ký tự.";
  }
  return null;
}

/** Số điện thoại là tùy chọn (ADR-002): để trống thì hợp lệ. */
export function validateOptionalPhone(value: string): FieldError {
  const phone = value.replace(/\s+/g, "");
  if (!phone) return null;
  if (!VN_MOBILE_REGEX.test(phone)) {
    return "Số điện thoại không đúng định dạng di động Việt Nam (ví dụ 0905123456).";
  }
  return null;
}

export function validateOtpCode(value: string, length = 6): FieldError {
  if (value.length < length) return `Vui lòng nhập đủ ${length} chữ số.`;
  if (!/^\d+$/.test(value)) return "Mã xác thực chỉ gồm chữ số.";
  return null;
}

export type PasswordStrength = {
  /** 0 (rỗng) .. 4 (rất mạnh) */
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
};

/** Độ mạnh mật khẩu hiển thị dạng chữ (không chỉ dựa vào màu). */
export function evaluatePasswordStrength(password: string): PasswordStrength {
  if (!password) return { score: 0, label: "Chưa nhập" };
  let points = 0;
  if (password.length >= 6) points += 1;
  if (password.length >= 10) points += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) points += 1;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) points += 1;
  const score = Math.min(4, Math.max(1, points)) as 1 | 2 | 3 | 4;
  const labels = ["", "Yếu", "Trung bình", "Khá", "Mạnh"];
  return { score, label: labels[score] };
}

/** Che email khi hiển thị thẻ xác minh tài khoản (ví dụ: ng***@gmail.com). */
export function maskEmail(email: string): string {
  const [name, domain] = email.trim().split("@");
  if (!name || !domain) return email;
  const visible = name.slice(0, Math.min(2, name.length));
  return `${visible}***@${domain}`;
}

/** Chuyển mã lỗi hoặc đối tượng lỗi Auth sang thông báo tiếng Việt (docs/api/auth-profile.md mục 3). */
export function mapAuthErrorMessage(errOrCode: unknown, fallback?: string): string {
  const code =
    typeof errOrCode === "string"
      ? errOrCode
      : typeof errOrCode === "object" && errOrCode !== null && "code" in errOrCode
        ? String((errOrCode as { code?: unknown }).code)
        : undefined;
  const msg =
    typeof errOrCode === "object" && errOrCode !== null && "message" in errOrCode
      ? String((errOrCode as { message?: unknown }).message)
      : undefined;

  switch (code) {
    case "auth/email-already-in-use":
      return "Email này đã được sử dụng. Vui lòng đăng nhập hoặc chọn Quên mật khẩu.";
    case "auth/invalid-email":
      return "Địa chỉ email không hợp lệ. Vui lòng kiểm tra lại.";
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email hoặc mật khẩu không chính xác. Vui lòng thử lại.";
    case "auth/weak-password":
      return "Mật khẩu quá ngắn. Vui lòng nhập tối thiểu 6 ký tự để bảo mật.";
    case "auth/user-not-found":
      return "Không tìm thấy tài khoản với email này. Vui lòng đăng ký.";
    case "auth/invalid-verification-code":
      return msg ?? "Mã xác thực không đúng. Vui lòng kiểm tra và thử lại.";
    case "permission-denied":
      return "Thao tác không được phép hoặc phiên đăng nhập đã hết hạn. Vui lòng thử lại.";
    case "unavailable":
      return "Không có kết nối mạng. Vui lòng kiểm tra Wifi/4G tại sân.";
    default:
      return msg ?? fallback ?? "Đã xảy ra lỗi. Vui lòng thử lại sau.";
  }
}

