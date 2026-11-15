import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import ForgotPasswordScreen from "../../src/app/(auth)/forgot-password";
import LoginScreen from "../../src/app/(auth)/login";
import OnboardingScreen from "../../src/app/(auth)/onboarding";
import OtpVerificationScreen from "../../src/app/(auth)/otp";
import RegisterScreen from "../../src/app/(auth)/register";
import ProfileScreen from "../../src/app/(tabs)/profile";
import { MockRepository, setRepository } from "../../src/data";
import {
  MOCK_OTP_CODE,
  MockAuthService,
  setAuthService,
} from "../../src/data/auth";
import { ONBOARDING_QUESTIONS } from "../../src/data/onboarding";
import { AuthProvider } from "../../src/hooks";

const mockMemoryStorage = new Map<string, string>();

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn((key: string) =>
      Promise.resolve(mockMemoryStorage.get(key) ?? null)
    ),
    setItem: jest.fn((key: string, val: string) => {
      mockMemoryStorage.set(key, val);
      return Promise.resolve();
    }),
    removeItem: jest.fn((key: string) => {
      mockMemoryStorage.delete(key);
      return Promise.resolve();
    }),
  },
}));

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
  }),
}));

jest.mock("expo-haptics", () => ({
  selectionAsync: jest.fn(() => Promise.resolve()),
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: "light", Medium: "medium", Heavy: "heavy" },
  NotificationFeedbackType: {
    Success: "success",
    Warning: "warning",
    Error: "error",
  },
}));

describe("Luồng Xác thực, Khai báo Elo & Hồ sơ VĐV (Q04 - feat/auth-profile-ui)", () => {
  jest.setTimeout(25000);
  let repo: MockRepository;
  let auth: MockAuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockMemoryStorage.clear();
    repo = new MockRepository({ minLatencyMs: 0, maxLatencyMs: 0, errorRate: 0 });
    await repo.resetMockData();
    setRepository(repo);

    auth = new MockAuthService({ latencyMs: 0 });
    await auth.resetMockAccounts();
    setAuthService(auth);
  });

  it("chứa đúng 10 câu hỏi tự đánh giá từ docs/06-rating-scale.md", () => {
    expect(ONBOARDING_QUESTIONS).toHaveLength(10);
    expect(ONBOARDING_QUESTIONS[0].title).toContain(
      "Thời gian bạn đã chơi cầu lông phong trào liên tục"
    );
    expect(ONBOARDING_QUESTIONS[9].title).toContain(
      "Kinh nghiệm tham gia các giải đấu phong trào"
    );
  });

  it("kiểm tra đầu vào biểu mẫu tiếng Việt khi Đăng ký thiếu hoặc sai định dạng", async () => {
    const { unmount } = await render(
      <AuthProvider>
        <RegisterScreen />
      </AuthProvider>
    );

    await fireEvent.changeText(screen.getByTestId("register-name-input"), "A");
    await fireEvent.changeText(
      screen.getByTestId("register-email-input"),
      "email-sai"
    );
    await fireEvent.changeText(
      screen.getByTestId("register-password-input"),
      "123"
    );
    await fireEvent.press(screen.getByTestId("register-submit-btn"));

    expect(
      screen.getByText(/Tên hiển thị phải từ 2 đến 50 ký tự\./)
    ).toBeTruthy();
    expect(
      screen.getByText(/Địa chỉ email không hợp lệ\. Vui lòng kiểm tra lại\./)
    ).toBeTruthy();
    expect(
      screen.getByText(
        /Mật khẩu quá ngắn\. Vui lòng nhập tối thiểu 6 ký tự để bảo mật\./
      )
    ).toBeTruthy();
    expect(mockPush).not.toHaveBeenCalled();

    await unmount();
  });

  it("chạy trọn vẹn luồng: Đăng ký -> Xác thực OTP giả lập (123456) -> Khai báo 10 câu hỏi Elo -> Xem & Chỉnh sửa Profile -> Đăng xuất", async () => {
    // BƯỚC 1: Đăng ký tài khoản mới
    const { unmount: unmountRegister } = await render(
      <AuthProvider>
        <RegisterScreen />
      </AuthProvider>
    );

    await fireEvent.changeText(
      screen.getByTestId("register-name-input"),
      "Trần Quốc Bảo"
    );
    await fireEvent.changeText(
      screen.getByTestId("register-email-input"),
      "bao.tran@badminton.vn"
    );
    await fireEvent.changeText(
      screen.getByTestId("register-phone-input"),
      "0905123456"
    );
    await fireEvent.changeText(
      screen.getByTestId("register-password-input"),
      "MatKhauManh@2026"
    );
    await fireEvent.press(screen.getByTestId("register-submit-btn"));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/(auth)/otp");
    });
    await unmountRegister();

    // BƯỚC 2: Xác thực OTP giả lập (thử sai mã trước, sau đó nhập đúng MOCK_OTP_CODE = 123456)
    const { unmount: unmountOtp } = await render(
      <AuthProvider>
        <OtpVerificationScreen />
      </AuthProvider>
    );

    await fireEvent.changeText(screen.getByTestId("otp-code-input"), "000000");
    await fireEvent.press(screen.getByTestId("otp-submit-btn"));

    await waitFor(() => {
      expect(
        screen.getByText(
          /Mã xác thực không đúng\. Vui lòng kiểm tra và thử lại\./
        )
      ).toBeTruthy();
    });

    await fireEvent.changeText(
      screen.getByTestId("otp-code-input"),
      MOCK_OTP_CODE
    );
    await fireEvent.press(screen.getByTestId("otp-submit-btn"));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/(auth)/onboarding");
    });
    await unmountOtp();

    // BƯỚC 3: Khai báo trình độ 10 câu hỏi + chọn tay thuận, vị trí, khu vực Đà Nẵng, nội dung đánh
    const { unmount: unmountOnboarding } = await render(
      <AuthProvider>
        <OnboardingScreen />
      </AuthProvider>
    );

    await fireEvent.changeText(
      screen.getByTestId("onboarding-name-input"),
      "Trần Quốc Bảo"
    );

    // Chọn mẫu C (3 điểm x 10 câu = 30 điểm -> Cấp 4 TB+, Elo khởi tạo 1575, khoảng 1500-1649)
    await fireEvent.press(screen.getByTestId("onboarding-preset-3"));
    await fireEvent.press(screen.getByTestId("onboarding-hand-left"));
    await fireEvent.press(screen.getByTestId("onboarding-position-front"));
    await fireEvent.press(screen.getByTestId("onboarding-category-mixed"));
    await fireEvent.press(screen.getByTestId("onboarding-district-Sơn Trà"));

    expect(screen.getAllByText(/1575 ELO/).length).toBeGreaterThan(0);

    await fireEvent.press(screen.getByTestId("onboarding-submit-btn"));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/(tabs)/profile");
    });
    await unmountOnboarding();

    // BƯỚC 4: Xem màn Profile với dữ liệu từ Repository (Elo 1575, Uy tín 100/100, Hiệu chỉnh K=40)
    const { unmount: unmountProfile } = await render(
      <AuthProvider>
        <ProfileScreen />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("profile-display-name").props.children).toBe(
        "Trần Quốc Bảo"
      );
    });

    expect(screen.getByTestId("profile-avatar-initials").props.children).toBe(
      "TB"
    );
    expect(
      String(screen.getByTestId("profile-elo-rating").props.children)
    ).toContain("1575");
    expect(
      String(screen.getByTestId("profile-reliability-score").props.children)
    ).toContain("100");
    expect(screen.getByText(/Sơn Trà/)).toBeTruthy();
    expect(screen.getByText(/Tay trái/)).toBeTruthy();
    expect(screen.getByText(/Cầu trước \(Lưới\)/)).toBeTruthy();

    // BƯỚC 5: Chỉnh sửa hồ sơ (chỉ sửa các trường hợp lệ theo Security Rules)
    await fireEvent.press(screen.getByTestId("profile-edit-btn"));
    await fireEvent.changeText(
      screen.getByTestId("edit-profile-name-input"),
      "Trần Quốc Bảo (CLB Sơn Trà)"
    );
    await fireEvent.press(screen.getByTestId("edit-profile-save-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("profile-display-name").props.children).toBe(
        "Trần Quốc Bảo (CLB Sơn Trà)"
      );
    });

    // Kiểm tra Security Rules ở tầng Repository: cấm ghi đè điểm skill/role
    const session = await auth.restoreSession();
    expect(session).not.toBeNull();
    await expect(
      repo.updateProfile(session!.uid, {
        displayName: "Gian lận Elo",
        // @ts-expect-error kiểm thử cố tình truyền trường cấm theo Security Rules
        skill: { rating: 2500 },
      })
    ).rejects.toThrow(/không được phép/i);

    // BƯỚC 6: Đăng xuất
    await fireEvent.press(screen.getByTestId("profile-logout-btn"));
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/(auth)/login");
    });
    expect(await auth.restoreSession()).toBeNull();
    await unmountProfile();
  });

  it("hỗ trợ đăng nhập tài khoản mẫu và khôi phục mật khẩu bằng OTP giả lập 123456", async () => {
    const { unmount: unmountForgot } = await render(
      <AuthProvider>
        <ForgotPasswordScreen />
      </AuthProvider>
    );

    await fireEvent.press(screen.getByTestId("forgot-send-code-btn"));

    await waitFor(() => {
      expect(screen.getByText("Đào Duy Nhật")).toBeTruthy();
    });

    await fireEvent.changeText(
      screen.getByTestId("forgot-otp-input"),
      MOCK_OTP_CODE
    );
    await fireEvent.changeText(
      screen.getByTestId("forgot-new-password-input"),
      "MatKhauMoi@2026"
    );
    await fireEvent.press(screen.getByTestId("forgot-reset-submit-btn"));

    await waitFor(() => {
      expect(screen.getByText(/ĐẶT LẠI MẬT KHẨU THÀNH CÔNG/)).toBeTruthy();
    });
    await unmountForgot();

    // Đăng nhập bằng mật khẩu mới
    const { unmount: unmountLogin } = await render(
      <AuthProvider>
        <LoginScreen />
      </AuthProvider>
    );

    await fireEvent.changeText(
      screen.getByTestId("login-email-input"),
      "host@badminton.vn"
    );
    await fireEvent.changeText(
      screen.getByTestId("login-password-input"),
      "MatKhauMoi@2026"
    );
    await fireEvent.press(screen.getByTestId("login-submit-btn"));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/(tabs)/profile");
    });
    await unmountLogin();
  });
});
