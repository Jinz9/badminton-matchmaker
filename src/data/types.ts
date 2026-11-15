import {
  ICourtRepository,
  IMatchRepository,
  INotificationRepository,
  IPartnerRepository,
  IRequestRepository,
  ISessionRepository,
  IUserRepository,
} from "../domain/repositories";

export type DataSourceMode = "mock" | "firebase";

export type RealtimeChannel =
  | "users"
  | "sessions"
  | "courts"
  | "requests"
  | "matches"
  | "notifications";

export interface MockConfig {
  /** Độ trễ mạng giả lập tối thiểu (ms), mặc định 200ms */
  minLatencyMs: number;
  /** Độ trễ mạng giả lập tối đa (ms), mặc định 600ms */
  maxLatencyMs: number;
  /** Xác suất lỗi ngẫu nhiên (0..1) để test trạng thái lỗi UI */
  errorRate: number;
}

/**
 * Hợp đồng Repository tổng hợp cho tầng dữ liệu Mobile (Data Access Layer).
 * Kết hợp đầy đủ 7 interface của TV1 + cơ chế subscribe() tương thích Firestore listener.
 */
export interface IDataRepository
  extends IUserRepository,
    ISessionRepository,
    ICourtRepository,
    IRequestRepository,
    IMatchRepository,
    IPartnerRepository,
    INotificationRepository {
  /** Đăng ký lắng nghe thay đổi realtime theo kênh (trả về hàm unsubscribe) */
  subscribe<T = unknown>(
    channel: RealtimeChannel,
    listener: (data: T) => void
  ): () => void;

  /** Đặt lại dữ liệu mẫu về trạng thái ban đầu (chỉ dùng cho MockRepository) */
  resetMockData?: () => Promise<void>;

  /** Cập nhật cấu hình độ trễ/lỗi giả lập (chỉ dùng cho MockRepository) */
  setMockConfig?: (config: Partial<MockConfig>) => void;

  /** Lấy cấu hình giả lập hiện tại */
  getMockConfig?: () => MockConfig;
}

