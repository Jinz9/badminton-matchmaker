# PHẦN ĐÓNG GÓP CỦA TV2 CHO BÁO CÁO QUẢN TRỊ DỰ ÁN

**Thành viên:** Nguyễn Đức Đạt (TV2 — UI/UX, Mobile Developer & QA Lead)  
**Tài liệu:** `docs/report/tv2-contribution.md` *(Gửi TV1 để tổng hợp vào Báo cáo tổng kết P21)*

---

## 1. Tổng hợp đóng góp của TV2 trong dự án (Theo WBS)

| Mã WBS | Hạng mục công việc | Nhánh Git / Minh chứng | Trạng thái |
|---|---|---|---|
| **1.4 / 2.4** | Khảo sát app mẫu (`benchmark-apps.md`), thiết kế Design System & Prototype Figma (`design-tokens.md`, `figma-inventory.md`) | `feat/ui-kit`, `docs/ui/` | Hoàn thành khung & UI Kit |
| **4.1** | Khởi tạo Expo Router, Theme tối tương phản cao, 18+ component UI Kit (`/dev/ui-kit`), `OfflineBanner` | `feat/ui-kit` | Hoàn thành |
| **4.2** | Nhóm màn Xác thực & Hồ sơ (Login, Register, OTP giả lập, Quên MK, Onboarding 10 câu Elo, Profile), Partner Finder | `feat/auth-profile-ui`, `feat/partner-finder-ui` | Hoàn thành |
| **4.3a / 4.3b** | Tạo kèo 1–2 sân, Danh sách kèo & lọc Đà Nẵng, Chi tiết phòng kèo, duyệt vãng lai, Waitlist & Ghost | `feat/lobby-ui` | Hoàn thành |
| **4.4a / 4.4b** | Home Sân Đấu, Chọn người & Cân trình (4–8 người), Xác nhận kèo & Swap, Bảng điểm BWF 1 tay, Chấm thẻ 5s & Elo | `feat/court-home-select`, `feat/balance-confirm`, `feat/post-match-rating` | Hoàn thành |
| **4.5** | Lịch sử trận, Thống kê & Đồng đội ăn ý, Tích hợp Firebase SDK, Offline Cache & Queue, Thông báo cục bộ & Trung tâm thông báo | `feat/history-stats-ui`, `feat/firebase-integration`, `feat/offline-cache`, `feat/notifications` | Hoàn thành |
| **5.1 / 5.2 / 5.3** | Test Plan, 84 Test Cases (`CSV`/`MD`), Traceability Matrix, Test RNTL & Data (`npm run test:all`), Execution Sheet, Field Test Form & Tối ưu hiệu năng/a11y | `docs/test-plan`, `test/execution`, `fix/perf-polish-a11y`, `chore/release` | Hoàn thành tự động 76/84 ca; còn 8 ca máy thật/Emulator |

---

## 2. Thời gian thực tế so với kế hoạch (`schedule.csv`)

| Mã WBS | Tên gói công việc | Tuần kế hoạch | Thời gian thực tế (giờ / ngày) | Độ lệch (Variance) | Ghi chú nguyên nhân (nếu lệch) |
|---|---|---:|---|---|---|
| `2.4` | Thiết kế Design System & Prototype Figma | Tuần 2 | `[TV2 điền]` | `[TV2 điền]` | `[TV2 điền]` |
| `4.1` | Khởi tạo Expo Router & UI Kit | Tuần 3 | `[TV2 điền]` | `[TV2 điền]` | `[TV2 điền]` |
| `4.2` | UI Auth, Profile & Partner Finder | Tuần 4 | `[TV2 điền]` | `[TV2 điền]` | `[TV2 điền]` |
| `4.3` | UI Tạo kèo, Danh sách kèo & Lobby realtime | Tuần 5–6 | `[TV2 điền]` | `[TV2 điền]` | `[TV2 điền]` |
| `4.4` | UI Chia kèo 3 chạm, Chấm điểm & Elo | Tuần 7–8 | `[TV2 điền]` | `[TV2 điền]` | `[TV2 điền]` |
| `4.5` | Lịch sử, Thống kê, Firebase, Offline & Thông báo | Tuần 9 | `[TV2 điền]` | `[TV2 điền]` | `[TV2 điền]` |
| `5.1` | Test Plan, 84 Test Cases, Traceability & RNTL | Tuần 9 | `[TV2 điền]` | `[TV2 điền]` | `[TV2 điền]` |
| `5.2` | Kiểm thử trên Android/iOS thật & Emulator | Tuần 10 | `[TV2 điền]` | `[TV2 điền]` | `[TV2 điền]` |

---

## 3. Bài học kinh nghiệm phía UI/UX & QA *(TV2 tự đúc kết)*
1. **Phối hợp theo hợp đồng (Data Contract & MockRepository):** `[TV2 điền]`
2. **Thiết kế theo ngữ cảnh thực tế tại sân (1 tay, nắng, mất mạng):** `[TV2 điền]`
3. **Kiểm thử tự động kết hợp thiết bị thật (RNTL + Expo Go):** `[TV2 điền]`
