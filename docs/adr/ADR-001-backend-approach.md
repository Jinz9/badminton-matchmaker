# QUYẾT ĐỊNH KIẾN TRÚC 001 (ADR-001): HƯỚNG TIẾP CẬN BACKEND & HẠ TẦNG FIREBASE

**Mã ADR:** `ADR-001-backend-approach`  
**Ngày quyết định:** 2026-11-15  
**Trạng thái:** 🟢 ĐÃ PHÊ DUYỆT (Approved)  
**Người quyết định:** Đào Duy Nhật (TV1 - PM, Technical Lead)  
**Tài liệu liên quan:** `docs/PROJECT_CONTEXT.md`, `docs/DECISIONS-PENDING.md`, `docs/07-srs.md`  

---

## 1. BỐI CẢNH & VẤN ĐỀ CẦN GIẢI QUYẾT (CONTEXT)

Hệ thống "Ghép đội và cân bằng kèo cầu lông" là ứng dụng di động phục vụ cộng đồng tại Đà Nẵng, xây dựng trên nền tảng React Native (Expo) và Firebase BaaS. Hệ thống chứa 2 luồng nghiệp vụ nhạy cảm và cốt lõi:
1. **Tính toán và cập nhật điểm Elo đôi:** Nếu để client tự ý tính toán và ghi thẳng điểm Elo mới lên cơ sở dữ liệu, người dùng có thể can thiệp sửa đổi kết quả hoặc gửi request giả mạo để gian lận trình độ (làm hỏng toàn bộ tính công bằng của hệ thống ghép cặp).
2. **Quản lý suất tuyển vãng lai & Đôn người từ Waitlist:** Thao tác đặt suất cuối cùng cần đảm bảo tính toàn vẹn (ACID), chống tranh chấp suất (race-condition) khi nhiều người chơi cùng bấm xin tham gia tại cùng một giây.

Nhóm 2 người trong 12 tuần cần lựa chọn mô hình Backend:
- Dùng **Cloud Functions** chuyên trách (Chạy trên Cloud) hay chỉ dùng **Client-side Logic thuần** kết hợp Firestore Security Rules?
- Chọn gói dịch vụ Firebase nào: **Spark (Miễn phí 100%)** hay **Blaze (Pay-as-you-go)**?
- Chọn Region máy chủ nào để tối ưu độ trễ cho người dùng tại Đà Nẵng?
- Cơ chế chia sẻ mã nguồn thuật toán giữa Mobile Client và Backend thế nào để không bị trùng lặp code (DRY)?

---

## 2. CÁC PHƯƠNG ÁN ĐÃ XEM XÉT (CONSIDERED ALTERNATIVES)

### Phương án 1: Chỉ chạy logic ở Client trên gói Spark (Client-only / Serverless BaaS thuần)
- **Cơ chế:** Toàn bộ code tính Elo, chia cặp, tính suất nằm trong `src/domain/` và được import vào ứng dụng di động Expo. Sử dụng Firestore Transaction để ghi dữ liệu. Khóa quyền ghi bằng Firestore Security Rules.
- **Ưu điểm:**
  - Hoàn toàn miễn phí 100% (Gói Spark).
  - Không cần thẻ thanh toán quốc tế Visa/Mastercard để kích hoạt.
  - Tốc độ phát triển ban đầu nhanh, không cần quản lý môi trường runtime Node.js trên Cloud.
- **Nhược điểm & Rủi ro lớn:**
  - **Rủi ro gian lận điểm Elo (High Vulnerability):** Firestore Security Rules không thể xác minh phép tính toán ma trận Elo đôi phức tạp. Client gửi điểm Elo mới lên thì rules rất khó để kiểm chứng điểm đó có đúng công thức toán học hay không.
  - Không hỗ trợ Cloud Functions để chạy các trigger nền (ví dụ: tự động phạt uy tín khi hết giờ, trigger gửi thông báo đẩy FCM khi có suất trống).
  - Gói Spark giới hạn kết nối mạng ra bên ngoài Google Network.

### Phương án 2: Dùng gói Blaze + Cloud Functions V2 chuyên trách (ĐƯỢC CHỌN)
- **Cơ chế:**
  - Client chỉ gửi kết quả trận đấu (tỷ số, danh sách vận động viên).
  - Cloud Functions (Trigger `onDocumentCreated` hoặc Callable Function) tại backend sẽ tính toán lại Elo, xác thực tính toàn vẹn, cập nhật lịch sử thi đấu và xử lý tự động đôn người từ Waitlist.
  - Client vẫn lưu bản sao logic domain để chạy tính toán mô phỏng khi ngoại tuyến (Offline tại sân).
- **Phân tích chi phí gói Blaze đối với đồ án sinh viên:**
  - *Hạn ngạch miễn phí hàng tháng của Blaze (Always Free Tier):*
    - Cloud Functions: **2,000,000 lượt gọi/tháng** miễn phí.
    - Thời gian tính toán: **400,000 GB-giây/tháng** miễn phí.
    - Cloud Firestore: **50,000 lượt đọc/ngày**, **20,000 lượt ghi/ngày** miễn phí.
    - Firebase Auth: Miễn phí không giới hạn với Google Sign-In và Email/Password.
  - *Ước tính sử dụng đồ án:* Nhóm kiểm thử tối đa vài trăm lượt trận và vài chục người dùng thử nghiệm $\to$ **Chi phí thực tế = 0 VNĐ ($0.00)**.
- **Yêu cầu:** Cần 1 thẻ Visa/Mastercard (thẻ ghi nợ hoặc tín dụng) để xác minh danh tính tài khoản Google Cloud khi kích hoạt Blaze.

---

## 3. QUYẾT ĐỊNH CHÍNH THỨC (DECISION)

TV1 đã chính thức phê duyệt **Phương án 2 (Blaze + Cloud Functions)**:

1. **Gói dịch vụ:** Kích hoạt gói **Blaze (Pay-as-you-go)** cho dự án Firebase `badminton-danang`. Thiết lập Budget Alert ở mức $1.00 để nhận cảnh báo sớm qua email nếu có bất thường.
2. **Vị trí đặt máy chủ (Region):** Chọn **`asia-southeast1` (Singapore)** cho cả Cloud Firestore, Firebase Storage và Cloud Functions. Đây là trung tâm dữ liệu gần Việt Nam nhất của Google Cloud, đảm bảo độ trễ ping từ Đà Nẵng chỉ dao động trong khoảng $30 - 50\text{ ms}$.
3. **Phân định trách nhiệm logic (Separation of Concerns):**
   - **Backend (Cloud Functions):** Chịu trách nhiệm bảo mật tối cao cho việc ghi nhận tỷ số trận đấu, tính toán biến động Elo, cập nhật điểm uy tín và trigger đẩy thông báo qua Firebase Cloud Messaging (FCM).
   - **Frontend (Mobile App Expo):** Chịu trách nhiệm hiển thị UI, thu thập thông tin trắc nghiệm Onboarding, chạy thuật toán Partner Finder và thuật toán chia cặp Session Balancing cục bộ (kể cả khi mất mạng tại sân).
4. **Cơ chế chia sẻ mã nguồn Domain Logic (`src/domain` $\leftrightarrow$ `functions/`):**
   - *Vấn đề kỹ thuật:* Khi chạy lệnh `firebase deploy --only functions`, Firebase CLI chỉ đóng gói mã nguồn trong thư mục `functions/`. Nếu mã nguồn trong `functions/` tham chiếu tương đối ra ngoài (`../../src/domain`), tiến trình build trên cloud sẽ bị lỗi thiếu file.
   - *Giải pháp lựa chọn:* Nhóm áp dụng kỹ thuật **Build-time Synchronization Script (Pre-build Copy)** kết hợp TypeScript Path Mapping. 
     - Mã nguồn sự thật duy nhất (Single Source of Truth) nằm tại `src/domain/`.
     - Trong `functions/package.json`, kịch bản `"build"` được cấu hình: `"prebuild": "node ../scripts/sync-domain.js && tsc"`.
     - Script sẽ tự động đồng bộ mã nguồn TypeScript từ `src/domain/` sang `functions/src/domain/` trước mỗi lần compile hoặc chạy test.
     - Cách làm này đảm bảo tính an toàn $100\%$ khi deploy lên Cloud mà không phụ thuộc vào cấu hình symlink phức tạp trên hệ điều hành Windows.

---

## 4. HỆ QUẢ & TÁC ĐỘNG (CONSEQUENCES)

- **Tích cực:**
  - Bảo mật tuyệt đối thuật toán Elo, loại bỏ hoàn toàn nguy cơ gian lận từ phía client.
  - Môi trường kiểm thử Firebase Emulator Suite hoàn chỉnh (hỗ trợ Auth, Firestore, Functions cục bộ trên máy dev).
  - Tối ưu chi phí $0$ VNĐ cho sinh viên thực hiện đồ án.
  - Độ trễ mạng thấp nhất cho người dùng Đà Nẵng nhờ trung tâm Singapore.
- **Tiêu cực / Ràng buộc cần kiểm soát:**
  - TV1 cần chuẩn bị thẻ Visa/Mastercard để kích hoạt Blaze trên Firebase Console.
  - Cần duy trì script đồng bộ domain giữa thư mục gốc và thư mục functions.

---

## 5. PHỤ LỤC CẬP NHẬT THỰC ĐỊA (UPDATE 2026-11-15: THỰC THI TRÊN GÓI SPARK)

- **Bối cảnh thực tế:** Trong quá trình thiết lập Firebase Console, TV1 không có thẻ thanh toán quốc tế Visa/Mastercard để kích hoạt gói Blaze.
- **Giải pháp thích ứng chính thức:**
  1. Dự án Firebase `badminton-danang` hoạt động chính thức trên gói **Spark plan (Miễn phí 100%, không cần thẻ)**:
     - Firebase Authentication: Bật Google Sign-In & Email/Password.
     - Cloud Firestore: Đặt tại `asia-southeast1` (Singapore).
     - Storage Bucket: `badminton-danang.firebasestorage.app`.
  2. **Chuyển dịch logic nghiệp vụ (Client Domain Engine):**
     - Toàn bộ thuật toán Elo đôi, tính suất vãng lai và thuật toán chia cặp Session Balancing được thực thi trực tiếp trên ứng dụng Mobile Client từ thư viện chuẩn `src/domain/`.
     - An toàn dữ liệu được đảm bảo bằng **Firestore Transaction** (chống race-condition tranh chấp suất cuối) và **Firestore Security Rules** (chỉ cho phép Host cập nhật kết quả trận đấu).
  3. **Môi trường Cloud Functions:** Thư mục `functions/` và bộ test Emulator Suite vẫn được duy trì hoàn chỉnh trong mã nguồn để phục vụ kiểm thử tích hợp trên máy local dev và sẵn sàng deploy lên Cloud nếu sau này nhóm nâng cấp gói Blaze.

