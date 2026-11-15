import React from "react";
import { Tabs } from "expo-router";
import { Text, Platform } from "react-native";
import { COLORS } from "../../theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.background,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.surfaceLight,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          color: COLORS.text,
          fontSize: 18,
          fontWeight: "700",
        },
        headerTintColor: COLORS.primary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.surfaceLight,
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 88 : 64,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Tại Sân",
          tabBarLabel: "Sân Đấu",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>🏸</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="partners"
        options={{
          title: "Tìm Bạn",
          headerTitle: "Gợi Ý Đồng Đội Ăn Ý",
          tabBarLabel: "Tìm Bạn",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20 }}>👥</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Lịch Sử",
          headerTitle: "Lịch Sử Thi Đấu & Thống Kê",
          tabBarLabel: "Lịch Sử",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20 }}>📊</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Cá Nhân",
          headerTitle: "Hồ Sơ Tay Vợt",
          tabBarLabel: "Cá Nhân",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20 }}>👤</Text>
          ),
        }}
      />
    </Tabs>
  );
}

