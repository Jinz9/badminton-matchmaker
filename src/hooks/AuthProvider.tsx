import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getRepository } from "../data";
import {
  AuthUser,
  getAuthService,
  RegisterInput,
} from "../data/auth";
import { savePlayCategoryPref } from "../data/preferences";
import { PlayCategoryPref } from "../data/onboarding";
import { createUserProfile, CreateUserInput } from "../domain/user/userProfile";
import { UserProfile } from "../domain/types";

export type AuthStatus = "loading" | "signedOut" | "needsOtp" | "needsOnboarding" | "ready";

export interface OnboardingSubmit extends Omit<CreateUserInput, "uid"> {
  answers?: number[];
  playCategory?: PlayCategoryPref;
}

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  profile: UserProfile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: RegisterInput) => Promise<void>;
  signOut: () => Promise<void>;
  verifyOtp: (code: string) => Promise<void>;
  resendOtp: () => Promise<void>;
  submitOnboarding: (input: OnboardingSubmit) => Promise<UserProfile>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function resolveState(user: AuthUser | null): Promise<{
  status: AuthStatus;
  profile: UserProfile | null;
}> {
  if (!user) return { status: "signedOut", profile: null };
  if (!user.verified) return { status: "needsOtp", profile: null };
  const profile = await getRepository().getProfile(user.uid);
  return profile
    ? { status: "ready", profile }
    : { status: "needsOnboarding", profile: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const apply = useCallback(async (next: AuthUser | null) => {
    const resolved = await resolveState(next);
    setUser(next);
    setProfile(resolved.profile);
    setStatus(resolved.status);
  }, []);

  // Khôi phục phiên đã lưu (AsyncStorage) khi mở app
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const restored = await getAuthService().restoreSession();
        if (!cancelled) await apply(restored);
      } catch {
        if (!cancelled) await apply(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apply]);

  // Đồng bộ hồ sơ realtime (ví dụ Elo đổi sau trận)
  useEffect(() => {
    if (!user || status !== "ready") return;
    return getRepository().subscribe<UserProfile[]>("users", (all) => {
      const found = all.find((u) => u.uid === user.uid && !u.isDeleted);
      if (found) setProfile(found);
    });
  }, [user, status]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const u = await getAuthService().login(email, password);
      await apply(u);
    },
    [apply]
  );

  const signUp = useCallback(
    async (input: RegisterInput) => {
      const u = await getAuthService().register(input);
      await apply(u);
    },
    [apply]
  );

  const signOut = useCallback(async () => {
    await getAuthService().logout();
    await apply(null);
  }, [apply]);

  const verifyOtp = useCallback(
    async (code: string) => {
      const u = await getAuthService().verifyOtp(code);
      await apply(u);
    },
    [apply]
  );

  const resendOtp = useCallback(async () => {
    await getAuthService().sendOtp();
  }, []);

  const submitOnboarding = useCallback(
    async (input: OnboardingSubmit) => {
      const activeUser = user ?? (await getAuthService().restoreSession());
      if (!activeUser) {
        throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      }
      const { playCategory, answers, ...rest } = input;
      // Hàm domain của TV1 tự validate + tính Elo khởi tạo (calculateInitialRatingFromAnswers)
      const newProfile = createUserProfile({
        ...rest,
        onboardingAnswers: rest.onboardingAnswers ?? answers,
        uid: activeUser.uid,
      });
      await getRepository().createProfile(newProfile);
      if (playCategory) await savePlayCategoryPref(activeUser.uid, playCategory);
      setUser(activeUser);
      setProfile(newProfile);
      setStatus("ready");
      return newProfile;
    },
    [user]
  );

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const p = await getRepository().getProfile(user.uid);
    if (p) setProfile(p);
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      profile,
      signIn,
      signUp,
      signOut,
      verifyOtp,
      resendOtp,
      submitOnboarding,
      refreshProfile,
    }),
    [status, user, profile, signIn, signUp, signOut, verifyOtp, resendOtp, submitOnboarding, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải được dùng bên trong <AuthProvider>.");
  return ctx;
}

