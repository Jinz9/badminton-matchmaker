# BẢN GHI QUYẾT ĐỊNH KIẾN TRÚC: PHƯƠNG THỨC XÁC THỰC NGƯỜI DÙNG (ADR-002)

**Dự án:** Hệ thống ghép đội và cân bằng kèo cầu lông (Mobile App - Đà Nẵng)  
**Mã tài liệu:** `docs/adr/ADR-002-auth-methods.md`  
**Ngày quyết định:** 2026-11-15  
**Trạng thái:** **ĐÃ CHẤP THUẬN (ACCEPTED)**  
**Người quyết định:** Đào Duy Nhật (TV1 - PM & Tech Lead)  
**Người phối hợp:** Nguyễn Đức Đạt (TV2 - Mobile Dev & UI/UX)  

---

## 1. BỐI CẢNH & VẤN ĐỀ (CONTEXT & PROBLEM STATEMENT)

Ứng dụng ghép đội cầu lông phục vụ các tay vợt phong trào tại thành phố Đà Nẵng. Hệ thống cần một phương thức xác thực (Authentication) đáp ứng các tiêu chí:
1. **Trải nghiệm người dùng (UX):** Đăng nhập nhanh tại sân cầu lông, ma sát thấp, ít phải thao tác phức tạp bằng một tay.
2. **Chi phí vận hành:** Dự án là đồ án tốt nghiệp sinh viên, chạy trên **Gói Spark ($0/tháng)** của Firebase, TV1 không có thẻ tín dụng quốc tế (Visa/Mastercard) để kích hoạt thanh toán trả theo lưu lượng (Pay-as-you-go).
3. **Môi trường phát triển & Kiểm thử:** Thuận tiện cho việc giả lập nhiều tài khoản người chơi (Player 1..8) trên **Firebase Local Emulator Suite** và tự động hóa kiểm thử bằng Jest.

---

## 2. CÁC PHƯƠNG ÁN ĐÃ XEM XÉT (CONSIDERED OPTIONS)

### Phương án 1: Xác thực qua Số điện thoại (Phone Number OTP qua SMS)
- **Ưu điểm:** Sát với văn hóa chơi thể thao tại Việt Nam; mỗi tay vợt đều có số điện thoại; dễ dàng chia sẻ số điện thoại cho Host để liên hệ khi đến sân.
- **Nhược điểm nghiêm trọng:**
  - Firebase chỉ miễn phí 10 số điện thoại thử nghiệm (test numbers).
  - Gửi SMS OTP về số điện thoại thật tại Việt Nam phát sinh chi phí thực tế (khoảng $0.03 – $0.06/SMS).
  - **Bắt buộc phải có thẻ Visa/Mastercard để nâng cấp gói Blaze**; không thể triển khai trên gói Spark miễn phí.
  - Nguy cơ bị tấn công SMS Toll Fraud (spam gửi OTP làm cạn ngân sách đồ án).

### Phương án 2: Xác thực qua Google Sign-In (OAuth 2.0)
- **Ưu điểm:**
  - Đăng nhập 1-chạm (1-tap), tiện lợi tối đa cho người dùng smartphone (Android & iOS).
  - Tự động lấy được `displayName` và ảnh đại diện `avatarUrl` từ hồ sơ Google.
  - Hoàn toàn miễn phí, không giới hạn số lượng người dùng trên gói Spark.
  - Tích hợp chuẩn qua thư viện `expo-auth-session` trên React Native.
- **Nhược điểm:** Cần cấu hình OAuth Client ID trên Google Cloud Console cho cả nền tảng Expo Go và standalone build.

### Phương án 3: Xác thực qua Email & Mật khẩu (Email / Password)
- **Ưu điểm:**
  - Hoàn toàn miễn phí trên gói Spark.
  - Tương thích 100% với Firebase Emulator và kiểm thử tự động (Unit Test / Integration Test) bằng script mà không phụ thuộc vào trình duyệt hay OAuth pop-up.
  - Dễ dàng tạo nhanh hàng loạt tài khoản người chơi ảo (ví dụ: `player01@badminton.vn`, `player02@badminton.vn`) để thử nghiệm tính năng xếp cặp 8 người tại sân.
- **Nhược điểm:** Người dùng phải nhập mật khẩu lần đầu (có thể lưu phiên đăng nhập lâu dài qua `AsyncStorage`).

---

## 3. QUYẾT ĐỊNH (DECISION)

Nhóm quyết định lựa chọn **PHƯƠNG ÁN KẾT HỢP: GOOGLE SIGN-IN + EMAIL & MẬT KHẨU (HYBRID AUTHENTICATION)**:

1. **Giao diện Client (Mobile App):**
   - Màn hình Đăng nhập cung cấp 2 nút bấm rõ ràng:
     - **"Tiếp tục với Google" (Khuyên dùng cho người dùng thật):** 1-chạm vào ngay ứng dụng, tự động điền sẵn tên hiển thị và ảnh đại diện vào bước Onboarding.
     - **"Đăng nhập bằng Email" (Dự phòng và Test):** Dành cho người dùng không muốn liên kết Google, hoặc dùng cho nhóm phát triển kiểm thử.
2. **Số điện thoại người dùng:**
   - Số điện thoại **không dùng làm phương thức đăng nhập**, mà được đưa vào bước cập nhật hồ sơ cá nhân (`users/{uid}.phoneNumber`).
   - Số điện thoại chỉ hiển thị nội bộ trong phòng kèo khi người chơi đã được duyệt vào sân, giúp Host và bạn cặp liên lạc khi cần.
3. **Môi trường Test & Emulator:**
   - Mọi kịch bản kiểm thử tự động (Jest, Emulator) sử dụng cổng Email/Password để đăng ký/đăng nhập tức thì mà không cần tương tác UI OAuth.

---

## 4. HỆ QUẢ & TÁC ĐỘNG (CONSEQUENCES)

### Tác động tích cực:
- **Chi phí $0 tuyệt đối:** Hoạt động trọn vẹn trên gói Spark miễn phí của Firebase, không yêu cầu thẻ tín dụng.
- **Tốc độ Onboarding tối đa:** Người chơi bấm nút Google là hoàn tất đăng nhập trong 2 giây, chuyển thẳng sang bài khảo sát trình độ 10 câu.
- **Dễ dàng kiểm thử:** TV1 và TV2 có thể chạy emulator cục bộ và test kịch bản 8 người chơi cùng lúc mà không lo hết quota SMS.

### Nhiệm vụ phát sinh:
- **TV1 (Backend):** Cung cấp hàm khởi tạo Profile và Skill chuẩn khi có `uid` mới từ Auth (hỗ trợ cả tài khoản Google lẫn Email/Password).
- **TV2 (Mobile Dev):** Cấu hình `expo-auth-session` cho Google Sign-In trên ứng dụng Expo theo tài liệu hướng dẫn [docs/api/auth-profile.md](file:///d:/QLDAPM/docs/api/auth-profile.md).

