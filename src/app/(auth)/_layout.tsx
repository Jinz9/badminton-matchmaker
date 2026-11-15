import { Stack } from "expo-router";
import { PALETTE } from "../../theme";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: PALETTE.bg.canvas },
        animation: "fade",
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}

