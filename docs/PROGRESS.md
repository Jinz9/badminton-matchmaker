# TIẾN ĐỘ THỰC HIỆN ĐỒ ÁN (PROGRESS.md)
**Cập nhật lần cuối:** 2026-11-15  
**Quản lý tiến độ:** TV1 (Đào Duy Nhật - PM, Backend, Data & Algorithm)

---

## 1. Bảng theo dõi các mốc tiến độ (Milestones M1–M12)

| Mốc | Tên mốc | Mô tả chi tiết | Trạng thái | Ghi chú |
|---|---|---|:---:|---|
| **M1** | Charter & Môi trường Dev | Ký duyệt Charter, thiết lập Git repo, bộ quy tắc, cấu trúc thư mục, môi trường Jest, Board quản lý | 🟢 Hoàn thành | Đã sẵn sàng toàn bộ tài liệu & hạ tầng kiểm thử |
| **M2** | SRS & Figma Prototype | Hoàn thành tài liệu yêu cầu SRS, Data Contract; TV2 hoàn thành Prototype Figma | ⚪ Chưa bắt đầu | Kế hoạch Tuần 2 (Sprint 1) |
| **M3** | Đăng nhập & Profile Cloud | Xác thực Firebase Auth, lưu thông tin User và hồ sơ cơ bản lên Firestore | ⚪ Chưa bắt đầu | Kế hoạch Tuần 3 (Sprint 2) |
| **M4** | Module Hồ sơ & Tìm đồng đội | Triển khai thang 6 cấp, thuật toán Partner Finder (lệch ≤ 150 Elo, vị trí đánh) | ⚪ Chưa bắt đầu | Kế hoạch Tuần 4 (Sprint 2) |
| **M5** | Phòng kèo Realtime & Waitlist | Tạo kèo, tuyển vãng lai, cơ chế đặt suất chống race condition, hàng đợi dự bị | ⚪ Chưa bắt đầu | Kế hoạch Tuần 5–6 (Sprint 3) |
| **M6** | Thuật toán chia cặp cân kèo | Thuật toán xếp cặp và xoay vòng 4–8 người/sân, hỗ trợ cặp khóa, unit test Jest | ⚪ Chưa bắt đầu | Kế hoạch Tuần 7 (Sprint 4) |
| **M7** | Vòng lặp trận đấu & Elo | Ghi nhận tỷ số, hàm cập nhật Elo đôi động và điểm uy tín | ⚪ Chưa bắt đầu | Kế hoạch Tuần 8 (Sprint 4) |
| **M8** | Feature Freeze | Đóng băng toàn bộ tính năng mới, chuẩn bị kiểm thử tích hợp | ⚪ Chưa bắt đầu | Cuối Sprint 4 (Tuần 8) |
| **M9** | Mobile nâng cao & Test Cases | UI một tay tại sân, cache offline, bộ test cases tự động và kịch bản thực địa | ⚪ Chưa bắt đầu | Kế hoạch Tuần 9 (Sprint 5) |
| **M10**| Hoàn tất kiểm thử & Sửa lỗi | Chạy field test tại sân cầu lông thực tế Đà Nẵng, fix 100% bug nghiêm trọng | ⚪ Chưa bắt đầu | Kế hoạch Tuần 10 (Sprint 5) |
| **M11**| 100% Báo cáo & Video Demo | Hoàn tất báo cáo tổng kết đồ án, quay video demo thực tế, chuẩn bị slide | ⚪ Chưa bắt đầu | Kế hoạch Tuần 11 (Sprint 6) |
| **M12**| Nộp hồ sơ & Bảo vệ đồ án | Đóng gói mã nguồn, hồ sơ đồ án, bảo vệ trước Hội đồng chấm | ⚪ Chưa bắt đầu | Kế hoạch Tuần 12 (Sprint 6) |

*Quy ước trạng thái: ⚪ Chưa bắt đầu | 🟡 Đang thực hiện | 🟢 Hoàn thành | 🔴 Bị chặn/Chậm tiến độ*

---

## 2. Nhật ký công việc (Work Log)

| Ngày | Công việc thực hiện | Nhánh Git | Commit | Người thực hiện |
|---|---|---|---|---|
| 2026-11-15 | Khởi tạo cấu trúc dự án, kiểm tra bộ skill, tạo bộ nhớ chung (`PROJECT_CONTEXT.md`, `PROGRESS.md`, `DECISIONS-PENDING.md`) | `main` / `dev` | `chore: project context` | TV1 & Trợ lý |
| 2026-11-15 | Hoàn thành dự thảo Điều lệ dự án (`01-project-charter.md`) và Phân tích bên liên quan (`02-stakeholders.md`) | `docs/charter` | `docs(charter): project charter and stakeholders` | TV1 & Trợ lý |
| 2026-11-15 | Hoàn thành Cơ cấu WBS & RACI (`03-wbs-raci.md`), Lịch trình Gantt (`04-schedule-gantt.md`) và `schedule.csv` | `docs/wbs-schedule` | `docs(wbs): wbs raci schedule gantt` | TV1 & Trợ lý |
| 2026-11-15 | Hoàn thành Kế hoạch quản trị rủi ro (`05-risk-register.md`) với 14 rủi ro, ma trận 5x5 và quy trình cập nhật tuần | `docs/risk-register` | `docs(risk): 14 risks heatmap and review process` | TV1 & Trợ lý |
| 2026-11-15 | Thiết lập toàn diện môi trường dự án: TypeScript + Jest cho domain, `.gitignore`, `README.md`, `CONTRIBUTING.md`, PR/Issue Templates, `OWNERSHIP.md`, `board-import.md`, `firebase-setup-checklist.md`, Biên bản họp mẫu & W01 | `chore/workspace` | `chore(workspace): test suite, conventions, board import and meeting notes` | TV1 & Trợ lý |
| 2026-11-15 | Hoàn thành chính thức Thang đo trình độ (`06-rating-scale.md`), mã cấu hình (`src/config/rating.ts`), hàm tính điểm ban đầu (`src/domain/rating/initialRating.ts`) và bộ test Jest (28 tests PASS). Đã áp dụng 5 quyết định phê duyệt chuyên môn từ TV1. | `docs/rating-scale` | `feat(rating): finalize 6-level rating scale, config, domain logic and tests` | TV1 & Trợ lý |

---

## 3. Danh sách tác vụ ⚠️ THỦ CÔNG đang chờ xử lý

| Mã | Hạng mục | Hướng dẫn từng bước cụ thể | Người phụ trách | Trạng thái |
|---|---|---|:---:|:---:|
| **MAN-01** | Tạo GitHub Repo & Bật Branch Protection | 1. Đã tạo repo: https://github.com/Jinz9/badminton-matchmaker<br>2. Đã mời TV2 (`Dat2204`) làm Collaborator quyền Write.<br>3. Đã bật Branch Protection Rule cho nhánh `main` (Bắt buộc PR trước khi merge, yêu cầu ít nhất 1 review approval). | TV1 & Trợ lý | 🟢 Hoàn thành |
| **MAN-02** | Tạo Kanban Board trên GitHub / Trello / Jira | 1. Đã tự động tạo 29 Issues chuẩn WBS trực tiếp trên GitHub: https://github.com/Jinz9/badminton-matchmaker/issues<br>2. TV1/TV2 có thể bật tab Projects trên GitHub hoặc làm theo hướng dẫn tại [docs/board-import.md](file:///d:/QLDAPM/docs/board-import.md) để import Trello. | TV1 & Trợ lý | 🟢 Hoàn thành |
| **MAN-03** | Khởi tạo Firebase Console | 1. Làm theo hướng dẫn từng bước tại [docs/firebase-setup-checklist.md](file:///d:/QLDAPM/docs/firebase-setup-checklist.md).<br>2. Tạo project `badminton-danang`, bật Auth (Google, Email/Password), tạo Firestore (Region: `asia-southeast1` Singapore).<br>3. Khung cấu hình đã sẵn sàng tại [src/config/firebase.ts](file:///d:/QLDAPM/src/config/firebase.ts), TV1 chỉ cần dán API Keys khi mở console. | TV1 | Chờ dán keys |
| **MAN-04** | TV2 thiết lập Figma & Môi trường Expo | 1. TV2 tạo Workspace trên Figma, khởi tạo file Design System & Prototype tương tác cho 4 module.<br>2. TV2 cài đặt môi trường Expo theo đúng hướng dẫn tại [docs/OWNERSHIP.md](file:///d:/QLDAPM/docs/OWNERSHIP.md) (lưu ý: KHÔNG chạy `create-expo-app .` đè lên `package.json` hiện tại). | TV2 | Chờ thực hiện |
| **MAN-05** | Khảo sát & Phỏng vấn host thật tại Đà Nẵng | 1. TV1 & TV2 đến 1–2 sân cầu lông (Kỳ Đồng / Tuyên Sơn / Quân Khu 5).<br>2. Phỏng vấn nhanh 2–3 chủ sân/host theo bảng giả định A1–A8.<br>3. Điền kết quả thu thập được vào file [docs/meetings/W01.md](file:///d:/QLDAPM/docs/meetings/W01.md). | TV1 & TV2 | Chờ thực hiện |
