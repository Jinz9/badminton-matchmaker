import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  FormScreen,
  NeonCTAButton,
  OtpInput,
  StatusPill,
  TextField,
} from "../../components";
import {
  AccountPreview,
  getAuthService,
  mapAuthErrorMessage,
  MOCK_OTP_CODE,
  validateEmail,
  validateOtpCode,
  validatePassword,
} from "../../data/auth";
import { PALETTE, RADIUS, SPACING, TOUCH, TYPOGRAPHY } from "../../theme";

/**
 * Màn 28 — Khôi Phục Mật Khẩu & Tài Khoản VĐV (Figma node 5:1437).
 *
 * TODO(ADR-002): chờ phương án đăng nhập thật theo ADR-002.
 * Hỗ trợ tra cứu hồ sơ theo Email, nhận diện tự động thẻ VĐV (Elo & Khu vực),
 * gửi mã OTP giả lập cố định MOCK_OTP_CODE = "123456" và đặt lại mật khẩu mới.
 */
export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [channel, setChannel] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("host@badminton.vn");
  const [preview, setPreview] = useState<AccountPreview | null>(null);
  const [step, setStep] = useState<"lookup" | "reset" | "done">("lookup");

  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    setError(null);
    const eErr = validateEmail(email);
    if (eErr) {
      setError(eErr);
      return;
    }

    setLoading(true);
    try {
      const found = await getAuthService().lookupAccount(email);
      setPreview(found);
      await getAuthService().sendResetCode(email);
      setStep("reset");
    } catch (err) {
      setError(mapAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError(null);
    const otpErr = validateOtpCode(otpCode);
    const pwErr = validatePassword(newPassword);
    if (otpErr || pwErr) {
      setError(otpErr || pwErr);
      return;
    }

    setLoading(true);
    try {
      await getAuthService().resetPassword(email, otpCode, newPassword);
      setStep("done");
    } catch (err) {
      setError(mapAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormScreen
      testID="forgot-password-screen"
      footer={
        <View style={styles.footerWrap}>
          {step === "lookup" ? (
            <NeonCTAButton
              label="GỬI MÃ KHÔI PHỤC (OTP) →"
              onPress={handleSendCode}
              loading={loading}
              testID="forgot-send-code-btn"
            />
          ) : step === "reset" ? (
            <NeonCTAButton
              label="ĐẶT LẠI MẬT KHẨU MỚI →"
              onPress={handleResetPassword}
              loading={loading}
              testID="forgot-reset-submit-btn"
            />
          ) : (
            <NeonCTAButton
              label="QUAY LẠI ĐĂNG NHẬP →"
              onPress={() => router.replace("/(auth)/login" as never)}
              testID="forgot-back-login-btn"
            />
          )}

          <Pressable
            onPress={() => router.replace("/(auth)/login" as never)}
            style={styles.backToLoginBtn}
            accessibilityRole="button"
          >
            <Text style={styles.backToLoginText}>
              Nhớ lại mật khẩu rồi? <Text style={styles.highlightLink}>QUAY LẠI ĐĂNG NHẬP</Text>
            </Text>
          </Pressable>
        </View>
      }
    >
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
        >
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.stepTag}>AN TOÀN TÀI KHOẢN</Text>
          <Text style={styles.screenTitle}>KHÔI PHỤC MẬT KHẨU</Text>
        </View>
      </View>

      {/* Hero Recovery Card (Figma 5:1437) */}
      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>Quên mật khẩu vào sân?</Text>
        <Text style={styles.heroSubtitle}>
          Chọn phương thức nhận mã OTP 6 chữ số để đặt lại mật khẩu mới. Toàn bộ điểm
          Elo & lịch sử trận đấu của bạn vẫn được giữ nguyên.
        </Text>

        {/* Segmented Channel Switcher */}
        <View style={styles.segmentRow}>
          <Pressable
            onPress={() => setChannel("email")}
            style={[
              styles.segmentTab,
              channel === "email" && styles.segmentTabActive,
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: channel === "email" }}
          >
            <Text
              style={[
                styles.segmentText,
                channel === "email" && styles.segmentTextActive,
              ]}
            >
              ✉ Qua Email (ADR-002)
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setChannel("phone")}
            style={[
              styles.segmentTab,
              channel === "phone" && styles.segmentTabActive,
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: channel === "phone" }}
          >
            <Text
              style={[
                styles.segmentText,
                channel === "phone" && styles.segmentTextActive,
              ]}
            >
              📱 Qua SĐT (Giả lập)
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Lookup & Matched Account Card */}
      <View style={styles.formCard}>
        <TextField
          label="EMAIL ĐÃ ĐĂNG KÝ TÀI KHOẢN VĐV"
          placeholder="host@badminton.vn"
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            setError(null);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={step === "lookup"}
          testID="forgot-email-input"
        />

        {preview ? (
          <View style={styles.matchedCard}>
            <View style={styles.matchedHeader}>
              <Text style={styles.matchedLabel}>HỒ SƠ NHẬN DIỆN TỰ ĐỘNG</Text>
              <StatusPill label="ĐÃ XÁC MINH" variant="live" />
            </View>
            <Text style={styles.matchedName}>{preview.displayName}</Text>
            <Text style={styles.matchedSub}>
              {preview.eloLabel} • {preview.areaLabel}
            </Text>
          </View>
        ) : null}

        {step === "reset" ? (
          <View style={styles.resetBlock}>
            <Text style={styles.otpInstruction}>
              Nhập mã OTP khôi phục [Chờ phương án đăng nhập thật theo ADR-002 • Mã thử
              nghiệm: <Text style={styles.otpCodeHighlight}>{MOCK_OTP_CODE}</Text>]:
            </Text>
            <OtpInput
              value={otpCode}
              onChange={(v) => {
                setError(null);
                setOtpCode(v);
              }}
              testID="forgot-otp-input"
            />
            <TextField
              label="MẬT KHẨU MỚI (TỐI THIỂU 8 KÝ TỰ)"
              placeholder="••••••••••••"
              value={newPassword}
              onChangeText={(v) => {
                setError(null);
                setNewPassword(v);
              }}
              secureTextEntry
              testID="forgot-new-password-input"
            />
          </View>
        ) : null}

        {step === "done" ? (
          <View style={styles.successBanner}>
            <Text style={styles.successTitle}>✓ ĐẶT LẠI MẬT KHẨU THÀNH CÔNG</Text>
            <Text style={styles.successBody}>
              Mật khẩu của hồ sơ {preview?.displayName ?? email} đã được cập nhật. Bạn có
              thể đăng nhập ngay.
            </Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorBanner} accessibilityRole="alert">
            <Text style={styles.errorText}>⚠ {error}</Text>
          </View>
        ) : null}
      </View>

      {/* Security Checklist Card (Figma 5:1437) */}
      <View style={styles.securityCard}>
        <Text style={styles.securityTitle}>QUY TRÌNH BẢO VỆ HỒ SƠ ELO</Text>
        <Text style={styles.securityItem}>
          ✓ Bước 1: Xác thực chính chủ qua OTP 6 số (Hiệu lực 60 giây).
        </Text>
        <Text style={styles.securityItem}>
          ✓ Bước 2: Đặt mật khẩu mới tối thiểu 8 ký tự, tự động đăng xuất thiết bị lạ.
        </Text>
      </View>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  backBtn: {
    width: TOUCH.minTarget,
    height: TOUCH.minTarget,
    borderRadius: RADIUS.md,
    backgroundColor: PALETTE.bg.surface,
    borderWidth: 1,
    borderColor: PALETTE.border.default,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    color: PALETTE.text.primary,
    fontSize: 20,
    fontWeight: "700",
  },
  stepTag: {
    ...TYPOGRAPHY.micro,
    color: PALETTE.accent.primary,
  },
  screenTitle: {
    ...TYPOGRAPHY.titleMedium,
    color: PALETTE.text.primary,
  },
  heroCard: {
    backgroundColor: PALETTE.bg.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  heroTitle: {
    ...TYPOGRAPHY.cardTitle,
    color: PALETTE.text.primary,
  },
  heroSubtitle: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
  },
  segmentRow: {
    flexDirection: "row",
    backgroundColor: PALETTE.bg.elevated,
    borderRadius: RADIUS.md,
    padding: 4,
    gap: 6,
  },
  segmentTab: {
    flex: 1,
    minHeight: TOUCH.minTarget - 4,
    borderRadius: RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.sm,
  },
  segmentTabActive: {
    backgroundColor: PALETTE.accent.primarySoft,
    borderWidth: 1,
    borderColor: PALETTE.border.accent,
  },
  segmentText: {
    ...TYPOGRAPHY.captionBold,
    color: PALETTE.text.secondary,
  },
  segmentTextActive: {
    color: PALETTE.accent.primary,
  },
  formCard: {
    backgroundColor: PALETTE.bg.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  matchedCard: {
    backgroundColor: PALETTE.bg.elevated,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: PALETTE.border.accent,
    padding: SPACING.md,
    gap: 4,
  },
  matchedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  matchedLabel: {
    ...TYPOGRAPHY.micro,
    color: PALETTE.accent.primary,
  },
  matchedName: {
    ...TYPOGRAPHY.cardTitle,
    color: PALETTE.text.primary,
  },
  matchedSub: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
  },
  resetBlock: {
    gap: SPACING.md,
  },
  otpInstruction: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
  },
  otpCodeHighlight: {
    color: PALETTE.accent.primary,
    fontWeight: "800",
  },
  successBanner: {
    backgroundColor: "rgba(34, 197, 94, 0.14)",
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: PALETTE.status.success,
    padding: SPACING.md,
    gap: 4,
  },
  successTitle: {
    ...TYPOGRAPHY.captionBold,
    color: PALETTE.status.success,
  },
  successBody: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.primary,
  },
  errorBanner: {
    backgroundColor: "rgba(239, 68, 68, 0.14)",
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: PALETTE.status.danger,
    padding: SPACING.sm,
  },
  errorText: {
    ...TYPOGRAPHY.captionBold,
    color: PALETTE.status.danger,
  },
  securityCard: {
    backgroundColor: PALETTE.bg.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    padding: SPACING.md,
    gap: 6,
  },
  securityTitle: {
    ...TYPOGRAPHY.micro,
    color: PALETTE.accent.cyan,
  },
  securityItem: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
  },
  footerWrap: {
    gap: SPACING.xs,
  },
  backToLoginBtn: {
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  backToLoginText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
  },
  highlightLink: {
    ...TYPOGRAPHY.captionBold,
    color: PALETTE.accent.primary,
  },
});

