/**
 * Cấu hình khởi tạo Firebase Client SDK cho Mobile App
 * Tài liệu hướng dẫn: docs/firebase-setup-checklist.md
 */

// Cấu hình Firebase Project chính thức từ Firebase Console (badminton-danang):
export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyBQUICFkWOmzsks6TcE6e76lNT46QbHk98",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "badminton-danang.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "badminton-danang",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "badminton-danang.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "730755069279",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:730755069279:web:cdac30b35f76e14e0bb2ea",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-KF36CF8NCC",
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

