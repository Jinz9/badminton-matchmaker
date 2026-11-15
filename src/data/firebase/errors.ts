/**
 * Ánh xạ mã lỗi Firebase (Auth, Firestore, Security Rules, Cloud Functions)
 * sang thông báo tiếng Việt thân thiện, không làm crash UI.
 */

export interface MappedFirebaseError {
  code: string;
  message: string;
  isPermissionDenied: boolean;
}

const CODE_MESSAGES: Record<string, string> = {
  // Firestore & Security Rules
  "permission-denied":
    "Bạn không có quyền thực hiện thao tác này theo quy tắc bảo mật của hệ thống.",
  unauthenticated: "Vui lòng đăng nhập lại để tiếp tục thao tác.",
  "not-found": "Không tìm thấy dữ liệu được yêu cầu hoặc dữ liệu đã bị xóa.",
  "already-exists": "Dữ liệu này đã tồn tại trên hệ thống.",
  "failed-precondition":
    "Điều kiện thực hiện chưa hợp lệ (có thể phiên bản sân đã thay đổi, vui lòng tải lại).",
  aborted: "Xung đột dữ liệu đồng thời, vui lòng thử lại.",
  unavailable:
    "Không thể kết nối máy chủ Firebase/Emulator. Kiểm tra lại mạng hoặc cổng Emulator.",
  "deadline-exceeded": "Kết nối quá thời gian chờ, vui lòng thử lại.",

  // Cloud Functions
  "functions/permission-denied":
    "Chỉ Host của kèo hoặc Admin mới có quyền thực hiện thao tác này.",
  "functions/unauthenticated": "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.",
  "functions/not-found":
    "Cloud Function chưa được triển khai hoặc không tìm thấy trên máy chủ.",
  "functions/failed-precondition":
    "Không đủ điều kiện nghiệp vụ để xử lý (ví dụ: hết suất hoặc trận đã chốt).",
  "functions/invalid-argument": "Dữ liệu gửi lên không hợp lệ.",
  "functions/unavailable":
    "Không thể kết nối Cloud Functions. Kiểm tra cổng 5001 (Emulator) hoặc kết nối mạng.",

  // Firebase Auth
  "auth/email-already-in-use": "Email này đã được đăng ký tài khoản.",
  "auth/invalid-email": "Địa chỉ email không hợp lệ.",
  "auth/weak-password": "Mật khẩu quá yếu (tối thiểu 6 ký tự).",
  "auth/user-not-found": "Email hoặc mật khẩu không đúng.",
  "auth/wrong-password": "Email hoặc mật khẩu không đúng.",
  "auth/invalid-credential": "Email hoặc mật khẩu không đúng.",
  "auth/too-many-requests":
    "Bạn đã thử quá nhiều lần. Vui lòng đợi một lát rồi thử lại.",
  "auth/network-request-failed":
    "Lỗi kết nối mạng tới máy chủ xác thực. Kiểm tra mạng hoặc Auth Emulator (cổng 9099).",
  "auth/requires-recent-login":
    "Vui lòng đăng nhập lại để thực hiện thao tác nhạy cảm này.",
};

export function extractFirebaseErrorCode(err: unknown): string {
  if (!err || typeof err !== "object") return "unknown";
  const maybeCode = (err as { code?: unknown }).code;
  if (typeof maybeCode === "string" && maybeCode.trim().length > 0) {
    return maybeCode.trim();
  }
  const msg = (err as { message?: unknown }).message;
  if (typeof msg === "string") {
    if (msg.includes("PERMISSION_DENIED") || msg.includes("permission-denied")) {
      return "permission-denied";
    }
    if (msg.includes("UNAUTHENTICATED") || msg.includes("unauthenticated")) {
      return "unauthenticated";
    }
  }
  return "unknown";
}

export function mapFirebaseError(
  err: unknown,
  fallbackMessage = "Đã xảy ra lỗi khi thao tác với Firebase."
): Error {
  const code = extractFirebaseErrorCode(err);
  const mapped = CODE_MESSAGES[code];
  if (mapped) {
    const wrapped = new Error(mapped);
    (wrapped as Error & { code?: string }).code = code;
    return wrapped;
  }
  if (err instanceof Error) {
    return err;
  }
  return new Error(fallbackMessage);
}

export function isPermissionDeniedError(err: unknown): boolean {
  const code = extractFirebaseErrorCode(err);
  return (
    code === "permission-denied" || code === "functions/permission-denied"
  );
}

