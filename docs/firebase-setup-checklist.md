# HƯỚNG DẪN THIẾT LẬP HẠ TẦNG FIREBASE (FIREBASE-SETUP-CHECKLIST.MD)

Tài liệu này hướng dẫn chi tiết các bước thiết lập dự án Firebase trên nền tảng đám mây Google Firebase và cấu hình Firebase Emulator cục bộ phục vụ cho đồ án **Hệ thống ghép đội và cân bằng kèo cầu lông (Mobile App)**.

> ⚠️ **LƯU Ý:** Đây là tài liệu hướng dẫn từng bước dành cho TV1 thực hiện thủ công trên console. Chưa tự ý chạy các lệnh deploy tự động lên cloud.

---

## 📋 Checklist Các bước thiết lập tổng quát

- [ ] **Bước 1:** Khởi tạo Project trên Google Firebase Console
- [ ] **Bước 2:** Bật dịch vụ Firebase Authentication (Google & Email/Password)
- [ ] **Bước 3:** Khởi tạo Cloud Firestore Database (Chọn Region gần Việt Nam)
- [ ] **Bước 4:** Lấy thông tin cấu hình SDK (`firebaseConfig`)
- [ ] **Bước 5:** Thiết lập Firebase Local Emulator Suite để kiểm thử offline
- [ ] **Bước 6:** Kiểm tra hạn mức gói cước (Spark Plan)

---

## 1. Bước 1: Khởi tạo Project trên Firebase Console

1. Mở trình duyệt và truy cập: [https://console.firebase.google.com](https://console.firebase.google.com).
2. Đăng nhập bằng tài khoản Google của TV1.
3. Nhấn **Add project (Thêm dự án)**:
   - **Tên dự án:** Đặt tên là `badminton-danang` (hoặc `badminton-matchmaker-danang`).
   - **Google Analytics:** Có thể tắt (Disable) để tối ưu tốc độ khởi tạo dự án và tránh phức tạp hóa cấu hình trong giai đoạn MVP.
4. Nhấn **Create project** và chờ khoảng 30 giây để Google cấp phát tài nguyên hạ tầng.

---

## 2. Bước 2: Bật dịch vụ Firebase Authentication

1. Trong thanh điều hướng bên trái của Firebase Console, chọn mục **Build ➔ Authentication**.
2. Nhấn **Get started (Bắt đầu)**.
3. Tại tab **Sign-in method (Phương thức đăng nhập)**, kích hoạt 2 nhà cung cấp sau:
   - **Email/Password:**
     - Bật công tắc **Enable**.
     - Nhấn **Save**.
   - **Google:**
     - Bật công tắc **Enable**.
     - Chọn email hỗ trợ dự án (email của TV1).
     - Nhấn **Save**.
4. *(Tùy chọn cho Kiểm thử):* Chuyển sang tab **Users** ➔ Nhấn **Add user** để tạo sẵn 2–3 tài khoản kiểm thử:
   - `host_test@gmail.com` / `123456`
   - `player1_test@gmail.com` / `123456`
   - `player2_test@gmail.com` / `123456`

---

## 3. Bước 3: Khởi tạo Cloud Firestore Database

1. Trong thanh điều hướng bên trái, chọn **Build ➔ Firestore Database**.
2. Nhấn **Create database (Tạo cơ sở dữ liệu)**:
3. **Thiết lập chế độ bảo mật ban đầu:**
   - Chọn **Start in production mode (Chế độ sản xuất)** để đảm bảo dữ liệu được khóa an toàn và bảo vệ bởi file `firestore.rules`.
4. **Chọn vị trí lưu trữ máy chủ (Cloud Firestore Location - RẤT QUAN TRỌNG):**
   - Chọn khu vực địa lý gần Việt Nam nhất để giảm thiểu độ trễ mạng (latency) cho người dùng tại Đà Nẵng:
     - Khuyên dùng: **`asia-southeast1` (Singapore)** — độ trễ ~30-40ms từ Đà Nẵng.
     - Lựa chọn thay thế: **`asia-east2` (Hong Kong)**.
   - ⚠️ *Cảnh báo: Vị trí database sau khi chọn sẽ KHÔNG THỂ THAY ĐỔI sau này.*
5. Nhấn **Enable (Bật)** và chờ hệ thống hoàn tất phân vùng cơ sở dữ liệu.

---

## 4. Bước 4: Đăng ký ứng dụng và Lấy cấu hình SDK

1. Tại màn hình **Project Overview (Tổng quan dự án)**, nhấn vào biểu tượng **Web `</>`** (hoặc Android) để đăng ký App client:
   - **App nickname:** `Badminton Mobile App`.
   - Bỏ chọn mục *Firebase Hosting*.
   - Nhấn **Register app**.
2. Copy đoạn mã cấu hình `firebaseConfig` có định dạng:
   ```typescript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "badminton-danang.firebaseapp.com",
     projectId: "badminton-danang",
     storageBucket: "badminton-danang.appspot.com",
     messagingSenderId: "...",
     appId: "..."
   };
   ```
3. Mở file [src/config/firebase.ts](file:///d:/QLDAPM/src/config/firebase.ts) và dán đoạn cấu hình trên vào file.
4. ⚠️ **Bảo mật:** Không bao giờ đưa các file chứa Service Account Private Key (`.json`) vào Git.

---

## 5. Bước 5: Cấu hình Firebase Local Emulator Suite (Kiểm thử Offline)

Để phục vụ kiểm thử đơn vị, kiểm thử tích hợp Security Rules và lập trình không cần kết nối mạng tại sân:

1. **Cài đặt Firebase CLI (nếu máy chưa có):**
   ```bash
   npm install -g firebase-tools
   ```
2. **Đăng nhập Firebase CLI:**
   ```bash
   firebase login
   ```
3. **Liên kết với project đã tạo trên Console:**
   ```bash
   firebase use --add
   # Chọn dự án badminton-danang và đặt alias là default
   ```
4. **Khởi tạo bộ giả lập (Local Emulators):**
   ```bash
   firebase init emulators
   # Tích chọn: Authentication Emulator và Firestore Emulator
   # Chấp nhận các cổng mặc định (Auth: 9099, Firestore: 8080, UI: 4000)
   ```
5. **Khởi chạy Emulator để kiểm thử cục bộ:**
   ```bash
   firebase emulators:start
   ```
   *(Giao diện quản lý trực quan có thể xem tại: `http://localhost:4000`)*.

---

## 6. Bước 6: Kiểm tra hạn mức gói cước (Pricing Plan)

- **Gói cước áp dụng:** **Spark Plan (Hoàn toàn miễn phí 0 VNĐ)**.
- **Hạn mức tài nguyên miễn phí mỗi ngày:**
  - *Cloud Firestore Reads:* 50,000 lượt đọc / ngày (dư sức cho 2 người phát triển và kiểm thử).
  - *Cloud Firestore Writes:* 20,000 lượt ghi / ngày.
  - *Cloud Firestore Deletes:* 20,000 lượt xóa / ngày.
  - *Lưu trữ dữ liệu:* Tối đa 1 GB dung lượng lưu trữ.
  - *Firebase Authentication:* Miễn phí không giới hạn cho Email/Password và Google Sign-In.
- ⚠️ **Khuyến nghị an toàn chi phí:**
  - Không tự ý nâng cấp lên gói Blaze (trả phí theo mức dùng) khi chưa có sự thống nhất của cả nhóm.
  - Thiết kế các câu lệnh truy vấn Firestore tối ưu (dùng `limit`, cache offline) để không làm lãng phí lượt đọc.

