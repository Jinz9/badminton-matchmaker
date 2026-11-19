import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  FormScreen,
  NeonCTAButton,
  ProgressDots,
  TextField,
} from "../../components";
import {
  evaluatePasswordStrength,
  mapAuthErrorMessage,
  validateDisplayName,
  validateEmail,
  validateOptionalPhone,
  validatePassword,
} from "../../data/auth";
import { useAuth } from "../../hooks";
import { PALETTE, RADIUS, SPACING, TOUCH, TYPOGRAPHY } from "../../theme";

/**
 * Màn 26 — Đăng Ký Tài Khoản VĐV Mới (Figma node 5:1153).
 * Gồm: Họ và tên VĐV, Email (dùng đăng nhập theo ADR-002), SĐT (tùy chọn),
 * Mật khẩu + thanh độ mạnh 4 nấc, đồng ý Điều khoản Fair-Play.
 */
export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const strength = evaluatePasswordStrength(password);

  const handleSubmit = async () => {
    setFormError(null);
    const nErr = validateDisplayName(displayName);
    const eErr = validateEmail(email);
    const phErr = validateOptionalPhone(phoneNumber);
    const pwErr = validatePassword(password);

    setNameError(nErr);
    setEmailError(eErr);
    setPhoneError(phErr);
    setPasswordError(pwErr);

    if (nErr || eErr || phErr || pwErr) return;
    if (!acceptedTerms) {
      setFormError("Vui lòng đồng ý với Quy chế Fair-Play & Cân trình Elo của SmashCourt.");
      return;
    }

    setSubmitting(true);
    try {
      await signUp({
        displayName: displayName.trim(),
        email: email.trim(),
        password,
        phoneNumber: phoneNumber.trim() || undefined,
      });
      router.push("/(auth)/otp" as never);
    } catch (err) {
      setFormError(mapAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormScreen
      testID="register-screen"
      footer={
        <View style={styles.footerWrap}>
          <NeonCTAButton
            label="TIẾP TỤC & NHẬN MÃ OTP →"
            onPress={handleSubmit}
            loading={submitting}
            testID="register-submit-btn"
          />
          <View style={styles.bottomRow}>
            <Text style={styles.bottomHint}>Đã có tài khoản VĐV? </Text>
            <Pressable
              onPress={() => router.replace("/(auth)/login" as never)}
              accessibilityRole="button"
              hitSlop={8}
            >
              <Text style={styles.bottomLink}>ĐĂNG NHẬP NGAY</Text>
            </Pressable>
          </View>
        </View>
      }
    >
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : router.replace("/(auth)/login" as never)
          }
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
        >
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.stepLabel}>Bước 1/2: Thông tin đăng ký</Text>
          <Text style={styles.screenTitle}>Tạo Tài Khoản VĐV Mới</Text>
        </View>
        <ProgressDots current={1} total={2} label="Bước 1/2" />
      </View>

      <Text style={styles.subtitle}>
        Gia nhập cộng đồng cầu lông Đà Nẵng & khởi tạo hồ sơ trình độ Elo chuẩn BWF.
      </Text>

      <View style={styles.formCard}>
        <TextField
          label="HỌ VÀ TÊN VĐV (HIỂN THỊ TRÊN BẢNG KÈO)"
          placeholder="Nguyễn Văn Quốc"
          value={displayName}
          onChangeText={(v) => {
            setDisplayName(v);
            if (nameError) setNameError(null);
          }}
          error={nameError}
          testID="register-name-input"
        />

        <TextField
          label="EMAIL ĐĂNG NHẬP (NHẬN MÃ XÁC THỰC)"
          placeholder="quoc.nguyen@badminton.vn"
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            if (emailError) setEmailError(null);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          error={emailError}
          testID="register-email-input"
        />

        <TextField
          label="SỐ ĐIỆN THOẠI LIÊN HỆ SÂN (TÙY CHỌN)"
          placeholder="0905 888 999"
          value={phoneNumber}
          onChangeText={(v) => {
            setPhoneNumber(v);
            if (phoneError) setPhoneError(null);
          }}
          keyboardType="phone-pad"
          hint="Không bắt buộc — dùng để Host liên hệ khi tới sân."
          error={phoneError}
          testID="register-phone-input"
        />

        <TextField
          label="MẬT KHẨU BẢO MẬT (TỐI THIỂU 8 KÝ TỰ)"
          placeholder="••••••••••••"
          value={password}
          onChangeText={(v) => {
            setPassword(v);
            if (passwordError) setPasswordError(null);
          }}
          secureTextEntry
          error={passwordError}
          testID="register-password-input"
        />

        {/* Password Strength Indicator (4 bars - Figma 5:1153) */}
        <View style={styles.strengthWrap}>
          <View style={styles.strengthBars}>
            {[1, 2, 3, 4].map((idx) => (
              <View
                key={idx}
                style={[
                  styles.strengthBar,
                  idx <= strength.score && styles.strengthBarActive,
                ]}
              />
            ))}
          </View>
          <Text style={styles.strengthLabel}>{strength.label}</Text>
        </View>

        {/* Terms Checkbox */}
        <Pressable
          onPress={() => setAcceptedTerms((prev) => !prev)}
          style={styles.termsRow}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: acceptedTerms }}
          testID="register-terms-checkbox"
        >
          <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
            {acceptedTerms ? <Text style={styles.checkboxTick}>✓</Text> : null}
          </View>
          <Text style={styles.termsText}>
            Tôi đồng ý với{" "}
            <Text style={styles.termsHighlight}>Quy chế Fair-Play & Cân trình Elo</Text>{" "}
            cùng Chính sách bảo mật thông tin VĐV của SmashCourt Đà Nẵng.
          </Text>
        </Pressable>

        {formError ? (
          <View style={styles.errorBanner} accessibilityRole="alert">
            <Text style={styles.errorBannerText}>⚠ {formError}</Text>
          </View>
        ) : null}
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
  stepLabel: {
    ...TYPOGRAPHY.micro,
    color: PALETTE.accent.primary,
  },
  screenTitle: {
    ...TYPOGRAPHY.titleMedium,
    color: PALETTE.text.primary,
  },
  subtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: PALETTE.text.secondary,
  },
  formCard: {
    backgroundColor: PALETTE.bg.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  strengthWrap: {
    gap: 6,
  },
  strengthBars: {
    flexDirection: "row",
    gap: 6,
  },
  strengthBar: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: PALETTE.bg.elevated,
  },
  strengthBarActive: {
    backgroundColor: PALETTE.accent.primary,
  },
  strengthLabel: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.accent.primary,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: PALETTE.text.muted,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: PALETTE.accent.primary,
    borderColor: PALETTE.accent.primary,
  },
  checkboxTick: {
    color: PALETTE.text.inverse,
    fontSize: 13,
    fontWeight: "900",
  },
  termsText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
    flex: 1,
  },
  termsHighlight: {
    color: PALETTE.accent.primary,
    fontWeight: "700",
  },
  errorBanner: {
    backgroundColor: "rgba(239, 68, 68, 0.14)",
    borderWidth: 1,
    borderColor: PALETTE.status.danger,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
  },
  errorBannerText: {
    ...TYPOGRAPHY.captionBold,
    color: PALETTE.status.danger,
  },
  footerWrap: {
    gap: SPACING.sm,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 34,
  },
  bottomHint: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
  },
  bottomLink: {
    ...TYPOGRAPHY.captionBold,
    color: PALETTE.accent.primary,
  },
});

