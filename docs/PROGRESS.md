# TIẾN ĐỘ THỰC HIỆN ĐỒ ÁN (PROGRESS.md)
**Cập nhật lần cuối:** 2026-11-15  
**Quản lý tiến độ:** TV1 (PM, Backend, Data & Algorithm)

---

## 1. Bảng theo dõi các mốc tiến độ (Milestones M1–M12)

| Mốc | Tên mốc | Mô tả chi tiết | Trạng thái | Ghi chú |
|---|---|---|---|---|
| **M1** | Charter & Môi trường Dev | Ký duyệt Charter, thiết lập Git repo, bộ quy tắc, cấu trúc thư mục, bộ nhớ chung | 🟡 Đang thực hiện | Khởi tạo cấu trúc và các tài liệu nền tảng |
| **M2** | SRS & Figma Prototype | Hoàn thành tài liệu yêu cầu SRS, Data Contract; TV2 hoàn thành Prototype Figma | ⚪ Chưa bắt đầu | TV1 soạn SRS; TV2 thiết kế UI |
| **M3** | Đăng nhập & Profile Cloud | Xác thực Firebase Auth, lưu thông tin User và hồ sơ cơ bản lên Firestore | ⚪ Chưa bắt đầu | Cần chốt phương thức đăng nhập |
| **M4** | Module Hồ sơ & Tìm đồng đội | Triển khai thang 6 cấp, thuật toán Partner Finder (lệch ≤ 150 Elo, vị trí đánh) | ⚪ Chưa bắt đầu | Module 1 & 2a |
| **M5** | Phòng kèo Realtime & Waitlist | Tạo kèo, tuyển vãng lai, cơ chế đặt suất chống race condition, hàng đợi dự bị | ⚪ Chưa bắt đầu | Module 3 |
| **M6** | Thuật toán chia cặp cân kèo | Thuật toán xếp cặp và xoay vòng 4–8 người/sân, hỗ trợ cặp khóa, unit test Jest | ⚪ Chưa bắt đầu | Module 2b |
| **M7** | Vòng lặp trận đấu & Elo | Ghi nhận tỷ số, Cloud Function cập nhật Elo đôi động và điểm uy tín | ⚪ Chưa bắt đầu | Module 4 |
| **M8** | Feature Freeze | Đóng băng toàn bộ tính năng mới, chuẩn bị kiểm thử tích hợp | ⚪ Chưa bắt đầu | Cuối Sprint 4 |
| **M9** | Mobile nâng cao & Test Cases | UI một tay tại sân, cache offline, bộ test cases tự động và kịch bản thực địa | ⚪ Chưa bắt đầu | Sprint 5 |
| **M10**| Hoàn tất kiểm thử & Sửa lỗi | Chạy field test tại sân cầu lông thực tế, fix 100% bug nghiêm trọng | ⚪ Chưa bắt đầu | Sprint 5 |
| **M11**| 100% Báo cáo & Video Demo | Hoàn tất báo cáo tổng kết đồ án, quay video demo thực tế, chuẩn bị slide | ⚪ Chưa bắt đầu | Sprint 6 |
| **M12**| Nộp hồ sơ & Bảo vệ đồ án | Đóng gói mã nguồn, hồ sơ đồ án, bảo vệ trước hội đồng | ⚪ Chưa bắt đầu | Tuần 12 |

*Quy ước trạng thái: ⚪ Chưa bắt đầu | 🟡 Đang thực hiện | 🟢 Hoàn thành | 🔴 Bị chặn/Chậm tiến độ*

---

## 2. Nhật ký công việc (Work Log)

| Ngày | Công việc thực hiện | Nhánh Git | Commit | Người thực hiện |
|---|---|---|---|---|
| 2026-11-15 | Khởi tạo cấu trúc dự án, kiểm tra bộ skill, tạo bộ nhớ chung (`PROJECT_CONTEXT.md`, `PROGRESS.md`, `DECISIONS-PENDING.md`) | `main` / `dev` | `chore: project context` | TV1 & Trợ lý |
| 2026-11-15 | Hoàn thành dự thảo Điều lệ dự án (`01-project-charter.md`) và Phân tích bên liên quan (`02-stakeholders.md`) | `docs/charter` | `docs(charter): project charter and stakeholders` | TV1 & Trợ lý |
| 2026-11-15 | Hoàn thành Cơ cấu WBS & RACI (`03-wbs-raci.md`), Lịch trình Gantt (`04-schedule-gantt.md`) và `schedule.csv` | `docs/wbs-schedule` | `docs(wbs): wbs raci schedule gantt` | TV1 & Trợ lý |
| 2026-11-15 | Hoàn thành Kế hoạch quản trị rủi ro (`05-risk-register.md`) với 14 rủi ro, ma trận 5x5 và quy trình cập nhật tuần | `docs/risk-register` | `docs(risk): 14 risks heatmap and review process` | TV1 & Trợ lý |

---

## 3. Danh sách tác vụ ⚠️ THỦ CÔNG đang chờ xử lý

| Mã | Hạng mục | Hướng dẫn từng bước | Người phụ trách | Trạng thái |
|---|---|---|---|---|
| **MAN-01** | Tạo dự án Firebase Console | 1. Truy cập https://console.firebase.google.com<br>2. Tạo dự án mới tên `badminton-danang`<br>3. Bật Firebase Authentication, Cloud Firestore (Database region: `asia-southeast1` - Singapore hoặc lân cận)<br>4. Lấy cấu hình `firebaseConfig` dán vào `src/config/firebase.ts` | [TV1 điền] | Chờ xử lý |
| **MAN-02** | Phỏng vấn 2–3 chủ sân/host thật tại Đà Nẵng | Phỏng vấn xác nhận các giả định A1–A8 trong `badminton-domain-rules` để chốt quy tắc nghiệp vụ cuối cùng | [TV1 điền] | Chờ xử lý |
| **MAN-03** | Đăng ký tài khoản Figma cho nhóm | Tạo team workspace trên Figma và phân quyền cho TV2 bắt đầu vẽ Prototype | [TV1 điền] | Chờ xử lý |

