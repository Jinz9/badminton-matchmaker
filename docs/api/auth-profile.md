# HƯỚNG DẪN TÍCH HỢP XÁC THỰC & HỒ SƠ NGƯỜI CHƠI (AUTH & PROFILE INTEGRATION GUIDE)

**Dự án:** Hệ thống ghép đội và cân bằng kèo cầu lông (Mobile App - Đà Nẵng)  
**Tài liệu:** `docs/api/auth-profile.md`  
**Phiên bản:** 1.0 (Ban hành Tuần 3 - Mốc M3)  
**Người soạn:** Đào Duy Nhật (TV1 - PM & Backend Lead)  
**Người nhận chuyển giao:** Nguyễn Đức Đạt (TV2 - Mobile Dev & UI/UX)  
**Tài liệu liên quan:** [ADR-002](file:///d:/QLDAPM/docs/adr/ADR-002-auth-methods.md), [Data Contract v1.0](file:///d:/QLDAPM/docs/api/data-contract.md), [firestore.rules](file:///d:/QLDAPM/firestore.rules)  

---

## 1. TỔNG QUAN LUỒNG NGƯỜI DÙNG (USER FLOW OVERVIEW)

```mermaid
flowchart TD
    Start([Khởi động App]) --> CheckAuth{Đã đăng nhập?}
    
    CheckAuth -- Chưa --> LoginScreen[Màn hình Đăng nhập\n1. Google Sign-In 1-chạm\n2. Email & Mật khẩu]
    LoginScreen --> DoLogin[Thực hiện Xác thực Firebase Auth]
    
    CheckAuth -- Đã có phiên --> CheckProfile{Kiểm tra Profile\nFirestore /users/{uid}}
    DoLogin --> CheckProfile
    
    CheckProfile -- Chưa có Profile --> OnboardingFlow[Luồng Khảo sát Onboarding\n1. 10 câu trắc nghiệm trình độ\n2. Điền thông tin cá nhân & Quận/Huyện ĐN]
    OnboardingFlow --> InitRating[Hệ thống tự tính điểm Elo ban đầu\nSàn 800 - Trần 2200, K=40, Uy tín 100]
    InitRating --> SaveProfile[Lưu Profile vào Firestore /users/{uid}\n(Tuân thủ 100% Security Rules)]
    
    SaveProfile --> HomeScreen([Vào Màn hình Sảnh Chờ Lobby])
    CheckProfile -- Đã có Profile --> HomeScreen
```

---

## 2. CHI TIẾT CÁC BƯỚC TRIỂN KHAI PHÍA MOBILE APP (EXPO)

---

### Bước 2.1: Đăng nhập bằng Google (Google Sign-In 1-chạm)

Sử dụng thư viện `expo-auth-session` kết hợp với Firebase Auth Web SDK:

```typescript
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../config/firebase';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleLogin() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '730755069279-android.apps.googleusercontent.com', // Cấu hình Expo
    webClientId: '730755069279-web.apps.googleusercontent.com',
  });

  const handleGoogleSignIn = async () => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      const userCredential = await signInWithCredential(auth, credential);
      return userCredential.user;
    }
  };

  return { promptAsync, handleGoogleSignIn, isReady: Boolean(request) };
}
```

---

### Bước 2.2: Đăng ký & Đăng nhập bằng Email/Mật khẩu

Dành cho người chơi muốn tạo tài khoản riêng biệt hoặc phục vụ kiểm thử:

```typescript
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { auth } from '../config/firebase';

// 1. Đăng ký tài khoản mới
export async function registerWithEmail(email: string, pass: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  return userCredential.user;
}

// 2. Đăng nhập
export async function loginWithEmail(email: string, pass: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return userCredential.user;
}

// 3. Đăng xuất
export async function logoutUser() {
  await signOut(auth);
}
```

---

### Bước 2.3: Kiểm tra Hồ sơ & Lưu Profile Onboarding

Sau khi đăng nhập thành công, TV2 kiểm tra xem người dùng đã có hồ sơ trong collection `users` hay chưa. Nếu chưa có, hướng dẫn người dùng làm khảo sát 10 câu và tạo hồ sơ bằng hàm chuẩn `createUserProfile`:

```typescript
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { createUserProfile, CreateUserInput } from '../domain/user/userProfile';
import { UserProfile } from '../domain/types';

// 1. Kiểm tra User đã có hồ sơ chưa
export async function checkUserProfileExists(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, 'users', uid);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }
  return null;
}

// 2. Lưu hồ sơ Onboarding lên Firestore
export async function submitOnboardingProfile(input: CreateUserInput): Promise<UserProfile> {
  // Hàm domain tự động validate dữ liệu và tính điểm Elo khởi tạo
  const newProfile = createUserProfile(input);

  // Ghi vào Firestore (khớp 100% với firestore.rules)
  const docRef = doc(db, 'users', newProfile.uid);
  await setDoc(docRef, newProfile);

  return newProfile;
}
```

---

### Bước 2.4: Cập nhật Thông tin Cá nhân

Khi người dùng chỉnh sửa hồ sơ trong màn hình Cài đặt cá nhân:

```typescript
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { validateUpdateProfileInput, UpdateUserProfileInput } from '../domain/user/userProfile';

export async function updateProfile(uid: string, updates: UpdateUserProfileInput) {
  // Validate trước ở client
  const validation = validateUpdateProfileInput(updates);
  if (!validation.isValid) {
    throw new Error(validation.errors.join('; '));
  }

  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}
```

> [!WARNING]
> **CẢNH BÁO BẢO MẬT BẮT BUỘC:**  
> Tuyệt đối **KHÔNG** truyền các trường `skill`, `rating`, `reliability`, `role`, `uid` trong `updateDoc`! `firestore.rules` sẽ chặn ngay lập tức với lỗi `permission-denied`.

---

## 3. BẢNG MÃ LỖI VÀ XỬ LÝ GIAO DIỆN (ERROR HANDLING MATRIX)

| Mã lỗi Firebase | Nguyên nhân | Thông báo gợi ý hiển thị trên giao diện (UX) |
|---|---|---|
| `auth/email-already-in-use` | Email đã có tài khoản | "Email này đã được sử dụng. Vui lòng đăng nhập hoặc chọn Quên mật khẩu." |
| `auth/invalid-email` | Định dạng email sai | "Địa chỉ email không hợp lệ. Vui lòng kiểm tra lại." |
| `auth/wrong-password` / `auth/invalid-credential` | Mật khẩu không đúng | "Email hoặc mật khẩu không chính xác. Vui lòng thử lại." |
| `auth/weak-password` | Mật khẩu < 6 ký tự | "Mật khẩu quá ngắn. Vui lòng nhập tối thiểu 6 ký tự để bảo mật." |
| `auth/user-not-found` | Tài khoản chưa tồn tại | "Không tìm thấy tài khoản với email này. Vui lòng đăng ký." |
| `auth/popup-closed-by-user` | Hủy cửa sổ Google | Không báo lỗi đỏ; giữ nguyên màn hình để người dùng bấm lại. |
| `permission-denied` | Vi phạm Security Rules | "Thao tác không được phép hoặc phiên đăng nhập đã hết hạn. Vui lòng thử lại." |
| `unavailable` | Mất kết nối mạng | "Không có kết nối mạng. Vui lòng kiểm tra Wifi/4G tại sân." |

---

## 4. DANH MỤC QUẬN/HUYỆN & SÂN ĐÀ NẴNG CHO DROPDOWN UI

TV2 sử dụng trực tiếp cấu hình tại `src/config/districts.ts` để vẽ Select/Dropdown:

```typescript
import { DA_NANG_DISTRICTS, DA_NANG_VENUES } from '../config/districts';

// 1. Danh sách 7 Quận/Huyện cho màn hình Onboarding:
// ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn', 'Cẩm Lệ', 'Liên Chiểu', 'Hòa Vang']

// 2. Danh sách Cụm sân cho màn hình Tạo Kèo (Session Creation):
// DA_NANG_VENUES chứa danh sách 10 sân nổi tiếng Đà Nẵng kèm địa chỉ và toạ độ GPS.
```

---

## 5. KIỂM THỬ TRÊN MÔI TRƯỜNG LOCAL EMULATOR CỦA TV2

Để TV2 phát triển giao diện offline mà không cần kết nối mạng hoặc không lo ảnh hưởng database thật:
1. Chạy lệnh: `npm run emulators:start` tại máy tính.
2. Expo app kết nối Auth và Firestore qua IP máy host (Android Emulator: `10.0.2.2:9099`, Thiết bị thật qua IP LAN: `192.168.x.x:9099`). Chi tiết xem tại [docs/firebase-env.md](file:///d:/QLDAPM/docs/firebase-env.md).
