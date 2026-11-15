import {
  ICourtRepository,
  IMatchRepository,
  INotificationRepository,
  IPartnerRepository,
  IRequestRepository,
  ISessionRepository,
  IUserRepository,
} from "../domain/repositories";
import { MatchDoc } from "../domain/types";

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

  /**
   * Tiện ích của TV2 (ngoài hợp đồng TV1): lấy mọi trận đã có kết quả của 1 người chơi
   * để tính tỷ lệ thắng bằng hàm thuần calculatePersonalStats.
   */
  getUserMatches(userId: string): Promise<MatchDoc[]>;

  /** Đặt lại dữ liệu mẫu về trạng thái ban đầu (chỉ dùng cho MockRepository) */
  resetMockData?: () => Promise<void>;

  /** Cập nhật cấu hình độ trễ/lỗi giả lập (chỉ dùng cho MockRepository) */
  setMockConfig?: (config: Partial<MockConfig>) => void;

  /** Lấy cấu hình giả lập hiện tại */
  getMockConfig?: () => MockConfig;
}

