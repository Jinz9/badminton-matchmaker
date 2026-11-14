/**
 * Cấu hình khởi tạo Firebase Client SDK cho Mobile App
 * Tài liệu hướng dẫn: docs/firebase-setup-checklist.md
 */

// Cấu hình Firebase Project lấy từ Firebase Console:
// Truy cập: https://console.firebase.google.com -> Project Settings -> General -> Your apps -> Web app
export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "badminton-danang.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "badminton-danang",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "badminton-danang.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID",
};

/**
 * Cấu hình môi trường mạng và Emulator
 */
export const FIREBASE_CONSTANTS = {
  REGION: "asia-southeast1", // Singapore (độ trễ thấp nhất cho Đà Nẵng)
  EMULATOR_HOST: "127.0.0.1",
  FIRESTORE_PORT: 8080,
  AUTH_PORT: 9099,
};
