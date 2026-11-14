# TÀI LIỆU BỐI CẢNH VÀ QUY ƯỚC DỰ ÁN (PROJECT CONTEXT)
**Đồ án:** Hệ thống ghép đội và cân bằng kèo cầu lông phong trào (Khu vực Đà Nẵng)  
**Nền tảng:** Mobile App (Expo / React Native) + Backend Cloud (Firebase)  
**Thời gian:** 12 tuần | 6 Sprint | Nhóm: 2 thành viên  
**Vai trò TV1:** PM, BA, Backend, Data Architecture & Thuật toán cân kèo  
**Vai trò TV2:** Mobile Developer, UI/UX (Figma, Expo Client, Components)

---

## 1. Tổng quan dự án

Hệ thống hỗ trợ cộng đồng cầu lông phong trào tại Đà Nẵng tổ chức các buổi giao lưu ("kèo"), tuyển người chơi vãng lai khi thiếu chân, tự động ghép cặp và cân bằng trình độ cho từng sân đấu.

### 4 Module cốt lõi:
1. **Hồ sơ & Đánh giá trình độ động:** Quản lý thông tin tay vợt, thang trình độ phong trào 6 cấp (Yếu, TB-, TB, TB+, Khá, Tốt), cập nhật điểm Elo đôi động sau mỗi trận đấu và theo dõi điểm uy tín (chống bùng kèo/hủy kèo phút chót).
2. **Ghép đồng đội & Chia cặp cân kèo (Partner Finder & Balancing):**
   - Tìm kiếm đồng đội đánh đôi phù hợp theo trình độ (chênh lệch ≤ 150 điểm Elo, bù trừ lối chơi cầu trước/cầu sau).
   - Thuật toán cân bằng trình độ và xoay tua người nghỉ cho từng sân đấu (4–8 người/sân).
3. **Quản lý kèo & Danh sách dự bị (Match Lobby & Waitlist):** Tạo kèo, quản lý người mặc định (core), tuyển vãng lai (recruit slots), cơ chế đặt suất, duyệt/từ chối và hàng đợi dự bị (waitlist) tự động đôn người khi có người rút.
4. **Lịch sử & Đồng đội ăn ý:** Thống kê lịch sử đấu, biến động Elo, tỷ lệ thắng theo cặp đấu, gợi ý bạn đánh ăn ý nhất.

### Phạm vi triển khai (MVP):
- Ứng dụng di động thuần túy: iOS và Android (Expo).
- **Không có Web Admin riêng:** Quyền quản trị (Admin) được phân quyền theo vai trò (`role: "admin"`) và thao tác trực tiếp ngay trong giao diện ứng dụng di động.

---

## 2. Phạm vi công việc của TV1 theo WBS

- **WBS 1.1–1.4 (Khởi tạo & Quản trị dự án):** TV1 phụ trách chính (Project Charter, Kế hoạch 12 tuần, Phân tích rủi ro Risk Register, Thiết lập môi trường dự án).
- **WBS 2.1–2.3 (Phân tích & Thiết kế hệ thống):**
  - **2.1:** Thang trình độ & Thuật toán Elo (TV1 chính).
  - **2.2:** Đặc tả yêu cầu phần mềm SRS, Use Cases, User Stories (TV1 chính).
  - **2.3:** Thiết kế dữ liệu Firestore, Security Rules, Transactions (TV1 chính).
  - *(Lưu ý: 2.4 Thiết kế UI/UX trên Figma do TV2 phụ trách chính)*.
- **WBS 3.1–3.4 (Phát triển Backend, Dữ liệu & Thuật toán lõi):**
  - **3.1:** Authentication & Quản lý User Profile (TV1 chính, TV2 tích hợp giao diện).
  - **3.2:** Tuyển vãng lai & Đặt suất (Recruit Slot Matching) (TV1 chính).
  - **3.3:** Thuật toán chia cặp & Xoay tua sân đấu (Session Balancing) (TV1 chính).
  - **3.4:** Cập nhật kết quả trận, tính toán Elo đôi & Điểm uy tín (TV1 chính).
- **WBS 4.x (Giao diện Mobile App):** TV2 phụ trách chính; TV1 hỗ trợ định nghĩa Data Contract, API Interface, Mock data và tích hợp Firebase SDK.
- **WBS 5.3–5.4 (Đảm bảo chất lượng & Hoàn tất đồ án):**
  - **5.3:** Sửa lỗi hệ thống, kiểm tra Security Rules và tối ưu thuật toán (TV1 chính).
  - **5.4:** Tổng hợp báo cáo tổng kết, kịch bản & video demo, slide bảo vệ (TV1 chính).

---

## 3. Phân quyền cây thư mục dự án

Để tránh xung đột mã nguồn giữa 2 thành viên:

| Thư mục / File | Thành viên sở hữu | Trách nhiệm |
|---|---|---|
| `docs/` | **TV1** | Toàn bộ tài liệu (Charter, SRS, ADR, Test cases, Biên bản họp, Báo cáo) |
| `functions/` | **TV1** | Cloud Functions xử lý logic bảo mật, cập nhật Elo, bảo vệ dữ liệu |
| `firebase.json`, `firestore.rules`, `firestore.indexes.json` | **TV1** | Cấu hình hạ tầng Firebase, chỉ mục và Security Rules |
| `scripts/` | **TV1** | Script kiểm thử, seed dữ liệu mẫu, công cụ bảo trì |
| `src/domain/` | **TV1** | Các hàm thuần túy nghiệp vụ (slot, pairing, elo, rating rules) kèm Jest unit tests |
| `src/config/` | **TV1** | Cấu hình Firebase SDK, môi trường, constants nghiệp vụ |
| `src/app/` | **TV2** | Điều hướng và các màn hình ứng dụng (Expo Router) |
| `src/components/` | **TV2** | Các thành phần giao diện tái sử dụng |
| `src/theme/` | **TV2** | Màu sắc, typography, kích thước giao diện |
| `src/mocks/` | **TV2** | Dữ liệu giả lập phía client trong giai đoạn làm UI song song |
| `src/data/` (phần UI) | **TV2** | Lớp hook/state binding giao diện |

> **Quy định giao tiếp:** TV1 chịu trách nhiệm định nghĩa toàn bộ **TypeScript Interface / Data Contract** làm chuẩn chung trước khi TV2 tiến hành nối giao diện.

---

## 4. Các mốc tiến độ chính (Milestones M1–M12)

- **M1:** Project Charter và thiết lập môi trường Dev (Git, Expo, Firebase, bộ quy tắc).
- **M2:** Tài liệu SRS hoàn chỉnh và Figma Prototype.
- **M3:** Xác thực đăng nhập và lưu trữ Profile người dùng lên Cloud Firestore.
- **M4:** Hoàn thành Module Hồ sơ & Tìm kiếm đồng đội (Partner Finder).
- **M5:** Phòng kèo thời gian thực (Match Lobby) với cơ chế đặt suất và Waitlist tự động.
- **M6:** Hoàn thành và kiểm thử thuật toán chia cặp cân kèo cho sân 4–8 người.
- **M7:** Khép kín vòng lặp trận đấu: Ghi nhận kết quả, chấm điểm, tự động cập nhật Elo & điểm uy tín.
- **M8:** **Feature Freeze** (Đóng băng tính năng, không nhận thêm yêu cầu mới).
- **M9:** Hoàn thiện tính năng mobile nâng cao (UI một tay, offline cache) & bộ Test Cases.
- **M10:** Hoàn tất kiểm thử thực địa tại sân và sửa chữa toàn bộ lỗi nghiêm trọng.
- **M11:** Hoàn thiện 100% Báo cáo đồ án, kịch bản và Video demo.
- **M12:** Nộp toàn bộ hồ sơ đồ án và bảo vệ trước hội đồng.

---

## 5. Quy tắc làm việc (BẮT BUỘC TUÂN THỦ)

1) Đầu mỗi tác vụ đọc PROJECT_CONTEXT.md, PROGRESS.md và SKILL.md liên quan; luôn đọc badminton-domain-rules trước.
2) Kế hoạch gốc mâu thuẫn luật thực tế: không tự quyết, ghi Change Request và báo tôi.
3) Mỗi tính năng một nhánh (feat/..., docs/..., fix/...), không push thẳng main, commit nhỏ dạng feat(scope): nội dung.
4) Logic nghiệp vụ là hàm thuần có test Jest; chạy test trước khi báo xong và báo kết quả thật.
5) Việc phải làm tay ghi ⚠️ THỦ CÔNG kèm hướng dẫn từng bước và ghi vào PROGRESS.md.
6) Không đưa khóa bí mật, service account, .env vào git.
7) Không bịa dữ liệu thực tế (biên bản họp, tiến độ thực tế, kết quả test thiết bị, ý kiến người dùng); thiếu thì ghi [TV1 điền].
8) Cuối mỗi tác vụ: cập nhật PROGRESS.md; liệt kê file đã tạo hoặc sửa; tiêu chí hoàn thành đạt hay chưa; việc còn lại; câu hỏi cần tôi quyết.

---

## 6. Bảng theo dõi yêu cầu thay đổi (Change Requests)

| Mã CR | Mô tả nội dung thay đổi | Lý do thực tế & Giải pháp | Trạng thái |
|---|---|---|---|
| **CR-01** | **Điều chỉnh quy mô chia cặp sân:** Kế hoạch gốc ghi chia cặp 8–16 người một lượt và ca lẻ 9, 11, 13 người. | **Luật thực tế:** Mỗi sân tối đa 8 người, mỗi kèo tối đa 2 sân. Thuật toán cân kèo phải chạy độc lập cho từng sân (4–8 người). Các ca lẻ thực tế trên một sân đấu chỉ gồm **5 người** và **7 người** (xoay tua 1 người nghỉ mỗi hiệp). | Đã duyệt vào luật nghiệp vụ |
| **CR-02** | **Làm rõ ranh giới Partner Finder và Match Lobby:** Phân định rõ 2 luồng tính năng. | **Giải pháp:** <br>1. **Partner Finder:** Giữ nguyên kế hoạch là tìm bạn đánh cặp cố định (lệch ≤ 150 Elo, bù trừ công thủ cầu trước/cầu sau).<br>2. **Match Lobby:** Bổ sung cơ chế tuyển vãng lai và đặt suất (Host chỉ tuyển khi sân thiếu người, số suất tuyển: `slot = min(4, 8 - số người mặc định)`). | Đã duyệt vào luật nghiệp vụ |
