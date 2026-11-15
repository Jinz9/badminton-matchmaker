import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  FormScreen,
  NeonCTAButton,
  StatusPill,
  TextField,
} from "../../components";
import {
  mapAuthErrorMessage,
  MOCK_DEMO_ACCOUNTS,
  validateEmail,
} from "../../data/auth";
import { useAuth } from "../../hooks";
import { PALETTE, RADIUS, SPACING, TOUCH, TYPOGRAPHY } from "../../theme";

/**
 * Màn 25 — Đăng Nhập VĐV SmashCourt (Figma node 5:997).
 * Chạy Email/Mật khẩu trên Expo Go theo ADR-002; có tài khoản mẫu để test 1 chạm.
 */
export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setFormError(null);
    const eErr = validateEmail(email);
    const pErr = !password ? "Vui lòng nhập mật khẩu." : null;
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) return;

    setSubmitting(true);
    try {
      await signIn(email, password);
      router.replace("/(tabs)/profile" as never);
    } catch (err) {
      setFormError(mapAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setEmailError(null);
    setPasswordError(null);
    setFormError(null);
  };

  return (
    <FormScreen
      testID="login-screen"
      footer={
        <View style={styles.footerWrap}>
          <NeonCTAButton
            label="ĐĂNG NHẬP VÀO SÂN →"
            onPress={handleSubmit}
            loading={submitting}
            testID="login-submit-btn"
          />
          <View style={styles.signupRow}>
            <Text style={styles.signupHint}>Chưa có hồ sơ VĐV SmashCourt? </Text>
            <Pressable
              onPress={() => router.push("/(auth)/register" as never)}
              accessibilityRole="button"
              hitSlop={8}
              testID="go-to-register-btn"
            >
              <Text style={styles.signupLink}>ĐĂNG KÝ TÀI KHOẢN MỚI</Text>
            </Pressable>
          </View>
        </View>
      }
    >
      {/* Hero Brand Banner (Figma 5:997) */}
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoEmoji}>🏸</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.brandTitle}>SMASHCOURT DN</Text>
            <Text style={styles.brandSub}>CẦU LÔNG ĐÀ NẴNG • ELO RATING</Text>
          </View>
          <StatusPill label="ONLINE" variant="live" />
        </View>

        <Text style={styles.welcomeTitle}>
          CHÀO MỪNG VĐV{"\n"}
          <Text style={styles.welcomeHighlight}>TRỞ LẠI SÂN ĐẤU</Text>
        </Text>
        <Text style={styles.welcomeSubtitle}>
          Đăng nhập để nhận kèo ghép sân tự động & cập nhật điểm Elo cá nhân.
        </Text>
      </View>

      {/* Form card */}
      <View style={styles.formCard}>
        <TextField
          label="EMAIL TÀI KHOẢN VĐV"
          placeholder="host@badminton.vn"
          value={email}
          onChangeText={(txt) => {
            setEmail(txt);
            if (emailError) setEmailError(null);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          error={emailError}
          testID="login-email-input"
        />

        <TextField
          label="MẬT KHẨU BẢO MẬT"
          placeholder="••••••••••"
          value={password}
          onChangeText={(txt) => {
            setPassword(txt);
            if (passwordError) setPasswordError(null);
          }}
          secureTextEntry
          error={passwordError}
          testID="login-password-input"
        />

        <View style={styles.optionsRow}>
          <Pressable
            onPress={() => setRememberMe((prev) => !prev)}
            style={styles.rememberRow}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: rememberMe }}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe ? <Text style={styles.checkboxTick}>✓</Text> : null}
            </View>
            <Text style={styles.rememberText}>Ghi nhớ đăng nhập</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/(auth)/forgot-password" as never)}
            accessibilityRole="button"
            hitSlop={8}
            testID="go-to-forgot-btn"
          >
            <Text style={styles.forgotLink}>QUÊN MẬT KHẨU?</Text>
          </Pressable>
        </View>

        {formError ? (
          <View style={styles.errorBanner} accessibilityRole="alert">
            <Text style={styles.errorBannerText}>⚠ {formError}</Text>
          </View>
        ) : null}
      </View>

      {/* Quick Demo Accounts (dành cho kiểm thử Expo Go) */}
      <View style={styles.demoCard}>
        <Text style={styles.demoTitle}>TÀI KHOẢN MẪU EXPO GO (1 CHẠM):</Text>
        <View style={styles.demoRow}>
          {MOCK_DEMO_ACCOUNTS.map((acc) => (
            <Pressable
              key={acc.uid}
              onPress={() => fillDemo(acc.email, acc.password)}
              style={styles.demoPill}
              accessibilityRole="button"
              testID={`demo-fill-${acc.uid}`}
            >
              <Text style={styles.demoPillName}>{acc.displayName}</Text>
              <Text style={styles.demoPillEmail}>{acc.email}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: PALETTE.bg.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: PALETTE.accent.primarySoft,
    borderWidth: 1,
    borderColor: PALETTE.border.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  logoEmoji: {
    fontSize: 22,
  },
  brandTitle: {
    ...TYPOGRAPHY.cardTitle,
    color: PALETTE.text.primary,
  },
  brandSub: {
    ...TYPOGRAPHY.micro,
    color: PALETTE.accent.primary,
  },
  welcomeTitle: {
    ...TYPOGRAPHY.titleLarge,
    color: PALETTE.text.primary,
    marginTop: SPACING.xs,
  },
  welcomeHighlight: {
    color: PALETTE.accent.primary,
  },
  welcomeSubtitle: {
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
  optionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: TOUCH.minTarget,
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    minHeight: TOUCH.minTarget,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: PALETTE.text.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: PALETTE.accent.primary,
    borderColor: PALETTE.accent.primary,
  },
  checkboxTick: {
    color: PALETTE.text.inverse,
    fontSize: 12,
    fontWeight: "900",
  },
  rememberText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
  },
  forgotLink: {
    ...TYPOGRAPHY.captionBold,
    color: PALETTE.accent.primary,
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
  demoCard: {
    backgroundColor: PALETTE.bg.elevated,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: PALETTE.border.default,
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  demoTitle: {
    ...TYPOGRAPHY.micro,
    color: PALETTE.accent.cyan,
  },
  demoRow: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  demoPill: {
    flex: 1,
    minHeight: TOUCH.minTarget,
    backgroundColor: PALETTE.bg.surface,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    justifyContent: "center",
  },
  demoPillName: {
    ...TYPOGRAPHY.captionBold,
    color: PALETTE.text.primary,
  },
  demoPillEmail: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
  },
  footerWrap: {
    gap: SPACING.sm,
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    minHeight: 36,
  },
  signupHint: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
  },
  signupLink: {
    ...TYPOGRAPHY.captionBold,
    color: PALETTE.accent.primary,
  },
});

