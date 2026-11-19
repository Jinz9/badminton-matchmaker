import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  FormScreen,
  NeonCTAButton,
  NumericKeypad,
  OtpInput,
} from "../../components";
import {
  mapAuthErrorMessage,
  maskEmail,
  MOCK_OTP_CODE,
  validateOtpCode,
} from "../../data/auth";
import { useAuth } from "../../hooks";
import { PALETTE, RADIUS, SPACING, TOUCH, TYPOGRAPHY } from "../../theme";

/**
 * Màn 27 — Xác Thực OTP Kích Hoạt Tài Khoản (Figma node 5:1308).
 *
 * TODO(ADR-002): chờ phương án đăng nhập thật theo ADR-002.
 * Bản chạy Expo Go dùng mã OTP giả lập cố định MOCK_OTP_CODE = "123456"
 * (ghi rõ trong màn /dev/ui-kit) để kiểm thử đầy đủ giao diện mà không tốn phí SMS.
 */
export default function OtpVerificationScreen() {
  const router = useRouter();
  const { user, verifyOtp, resendOtp } = useAuth();

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resendInfo, setResendInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const maskedRecipient = user?.email ? maskEmail(user.email) : "qu***@badminton.vn";

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(auth)/register" as never);
    }
  };

  const handleDigit = (d: string) => {
    setError(null);
    setCode((prev) => (prev.length < 6 ? prev + d : prev));
  };

  const handleBackspace = () => {
    setError(null);
    setCode((prev) => prev.slice(0, -1));
  };

  const handleVerify = async () => {
    setError(null);
    if (!user) {
      setError("Chưa có phiên đăng ký. Đang chuyển về màn Đăng nhập...");
      router.replace("/(auth)/login" as never);
      return;
    }

    const vErr = validateOtpCode(code);
    if (vErr) {
      setError(vErr);
      return;
    }

    setSubmitting(true);
    try {
      await verifyOtp(code);
      router.replace("/(auth)/onboarding" as never);
    } catch (err) {
      setError(mapAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    await resendOtp();
    setResendInfo(`Đã gửi lại mã OTP giả lập (${MOCK_OTP_CODE}).`);
  };

  return (
    <FormScreen
      testID="otp-screen"
      footer={
        <NeonCTAButton
          label="XÁC NHẬN & VÀO BƯỚC CÂN TRÌNH ELO →"
          onPress={handleVerify}
          loading={submitting}
          testID="otp-submit-btn"
        />
      }
    >
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable
          onPress={handleGoBack}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
        >
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.stepTag}>KÍCH HOẠT TÀI KHOẢN</Text>
          <Text style={styles.screenTitle}>Xác Thực Mã OTP</Text>
        </View>
      </View>

      {/* Hero Recipient Card (Figma 5:1308) */}
      <View style={styles.heroCard}>
        <Text style={styles.heroDesc}>
          Mã xác thực 6 chữ số đã được gửi tới tài khoản VĐV của bạn:
        </Text>
        <View style={styles.recipientRow}>
          <Text style={styles.recipientText}>✉ {maskedRecipient}</Text>
          <Pressable onPress={handleGoBack} accessibilityRole="button">
            <Text style={styles.changeLink}>Đổi Email</Text>
          </Pressable>
        </View>
        <Text style={styles.devOtpNote}>
          [Chờ phương án đăng nhập thật theo ADR-002 • Mã OTP thử nghiệm:{" "}
          <Text style={styles.devOtpCode}>{MOCK_OTP_CODE}</Text>]
        </Text>
      </View>

      {/* 6-Digit OTP Input + Timer */}
      <View style={styles.otpSection}>
        <OtpInput
          value={code}
          onChange={(next) => {
            setError(null);
            setCode(next);
          }}
          error={error}
          testID="otp-code-input"
        />

        <View style={styles.timerRow}>
          <Text style={styles.timerBadge}>⏱ Mã hết hạn sau 00:48s</Text>
          <Pressable
            onPress={handleResend}
            accessibilityRole="button"
            testID="otp-resend-btn"
          >
            <Text style={styles.resendLink}>GỬI LẠI MÃ NGAY</Text>
          </Pressable>
        </View>

        {resendInfo ? <Text style={styles.resendInfo}>{resendInfo}</Text> : null}
      </View>

      {/* Warning Notice Box (Figma 5:1308) */}
      <View style={styles.warningCard}>
        <Text style={styles.warningTitle}>🛡 LƯU Ý TRỌNG TÀI SÂN SMASH</Text>
        <Text style={styles.warningBody}>
          Mỗi tài khoản gắn liền với chỉ số Elo & điểm Uy tín (Reliability) duy nhất để
          chống tạo nick ảo phá kèo.
        </Text>
      </View>

      {/* Custom One-Handed Numeric Keypad */}
      <NumericKeypad onDigit={handleDigit} onBackspace={handleBackspace} />
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
    gap: SPACING.xs,
  },
  heroDesc: {
    ...TYPOGRAPHY.bodySmall,
    color: PALETTE.text.secondary,
  },
  recipientRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: PALETTE.bg.elevated,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  recipientText: {
    ...TYPOGRAPHY.bodyBold,
    color: PALETTE.text.primary,
  },
  changeLink: {
    ...TYPOGRAPHY.captionBold,
    color: PALETTE.accent.cyan,
  },
  devOtpNote: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
    marginTop: 2,
  },
  devOtpCode: {
    color: PALETTE.accent.primary,
    fontWeight: "800",
  },
  otpSection: {
    backgroundColor: PALETTE.bg.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  timerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.xs,
  },
  timerBadge: {
    ...TYPOGRAPHY.captionBold,
    color: PALETTE.accent.amber,
  },
  resendLink: {
    ...TYPOGRAPHY.captionBold,
    color: PALETTE.accent.primary,
  },
  resendInfo: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.status.success,
  },
  warningCard: {
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: PALETTE.accent.amber,
    padding: SPACING.md,
    gap: 4,
  },
  warningTitle: {
    ...TYPOGRAPHY.captionBold,
    color: PALETTE.accent.amber,
  },
  warningBody: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
  },
});

