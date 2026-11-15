import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../hooks";
import { PALETTE, useThemeFonts } from "../theme";

export default function RootLayout() {
  // Tải font Inter bất đồng bộ; giữ render ngay bằng font hệ thống nếu chưa xong
  useThemeFonts();

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: PALETTE.bg.canvas },
            animation: "fade",
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="court/index" options={{ headerShown: false }} />
          <Stack.Screen
            name="court/select-players"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="court/balance-confirm"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="court/score" options={{ headerShown: false }} />
          <Stack.Screen name="dev/ui-kit" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
