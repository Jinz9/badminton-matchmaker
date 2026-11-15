# CHƯƠNG 12: PHỤ LỤC VÀ MA TRẬN TRUY VẾT YÊU CẦU (RTM)

> **Mã tài liệu:** `docs/report/chap12-appendices.md`  
> **Chủ đề:** Báo cáo kiểm thử thiết bị (TV2), minh chứng thiết kế Figma, danh mục tài liệu toàn dự án và Ma trận truy vết yêu cầu (Requirements Traceability Matrix - RTM)

---

## 12.1. Phụ Lục A: Báo Cáo Kiểm Thử Trên Thiết Bị Di Động Thật (Mobile Test Report)

> [!NOTE]
> **DÀNH CHO TV2 (NGUYỄN ĐỨC ĐẠT):**  
> TV2 tổng hợp kết quả chạy kiểm thử thực tế trên các thiết bị Android và iOS từ file [docs/test/test-cases-mobile.md](file:///d:/QLDAPM/docs/test/test-cases-mobile.md):
> - **Tổng số ca kiểm thử trên thiết bị:** `[TV2 điền: Ví dụ 36 ca kiểm thử]`
> - **Số ca đạt (PASS):** `[TV2 điền]`
> - **Số ca không đạt (FAIL):** `[TV2 điền: 0 ca nghiêm trọng]`
> - **Thiết bị thử nghiệm:** `[TV2 điền: Ví dụ iPhone 13 iOS 17.4 và Samsung Galaxy A53 Android 13]`
> - **Nhận xét về độ mượt mà và thao tác một tay:** `[TV2 điền]`

---

## 12.2. Phụ Lục B: Minh Chứng Thiết Kế Giao Diện Figma (Figma Prototype)

- **Đường dẫn Prototype tương tác chính thức:** `[TV2 điền: Link Figma Prototype]`
- **Danh mục 13 màn hình giao diện đã thiết kế:**
  1. `SCR-01`: Đăng ký / Đăng nhập (`AuthScreen`)
  2. `SCR-02`: Thiết lập hồ sơ & Cấp độ tự khai ban đầu (`OnboardingScreen`)
  3. `SCR-03`: Hồ sơ cá nhân & Thống kê (`ProfileScreen`)
  4. `SCR-04`: Tìm bạn đánh cặp (`PartnerFinderScreen`)
  5. `SCR-05`: Danh sách kèo giao lưu (`SessionListScreen`)
  6. `SCR-06`: Tạo kèo mới (`CreateSessionScreen`)
  7. `SCR-07`: Chi tiết phòng kèo & Chỗ trống realtime (`MatchLobbyScreen`)
  8. `SCR-08`: Duyệt đơn xin tham gia & Hàng đợi Waitlist (`RecruitApprovalScreen`)
  9. `SCR-09`: Bảng điều khiển sân & Chia cặp 3 chạm (`CourtControlScreen`)
  10. `SCR-10`: Nhập tỷ số set đấu & Bumper score (`ScoreEntryScreen`)
  11. `SCR-11`: Thẻ đánh giá chéo đồng đội sau trận (`ReviewCardScreen`)
  12. `SCR-12`: Lịch sử đấu & Bạn đánh ăn ý (`MatchHistoryScreen`)
  13. `SCR-13`: Bảng điều khiển Quản trị viên (`AdminDashboardScreen`)

*(TV2 chèn hình ảnh minh họa các màn hình giao diện tiêu biểu vào mục này khi xuất bản báo cáo chính thức).*

---

## 12.3. Phụ Lục C: Ma Trận Truy Vết Yêu Cầu (Requirements Traceability Matrix - RTM)

Bảng truy vết chứng minh 100% Yêu cầu Chức năng (SRS) đều được hiện thực hóa qua Use Cases, Thiết kế dữ liệu, Màn hình giao diện và Ca kiểm thử tự động:

| Mã Yêu Cầu (FR) | Tên Yêu Cầu Chức Năng | Use Case | Thiết Kế Dữ Liệu | Màn Hình Giao Diện | Test Case Kiểm Chứng | Trạng Thái Bàn Giao |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| **FR-01** | Đăng ký, đăng nhập & Khai báo hồ sơ ban đầu | `UC-01`, `UC-02` | `users` | `SCR-01`, `SCR-02`, `SCR-03` | `test/domain/initialRating.test.ts`<br>`test/domain/authProfile.test.ts` | 🟢 Hoàn thành |
| **FR-02** | Tìm bạn đánh cặp cố định (lệch $\le 150$ Elo) | `UC-03` | `users` | `SCR-04` | `test/domain/partnerFinder.test.ts` (25 tests) | 🟢 Hoàn thành |
| **FR-03** | Host tạo kèo (1–2 sân, dải cấp, nội dung) | `UC-04` | `sessions`, `courts` | `SCR-05`, `SCR-06` | `test/domain/matchLobby.test.ts` | 🟢 Hoàn thành |
| **FR-04** | Tính số suất tuyển $\min(4, 8 - \text{core})$ | `UC-05` | `courts.slots` | `SCR-06`, `SCR-07` | `test/domain/slot.test.ts` (9 tests) | 🟢 Hoàn thành |
| **FR-05** | Người chơi xem danh sách kèo, lọc quận/cấp | `UC-05` | `sessions` | `SCR-05` | `test/domain/matchLobby.test.ts` | 🟢 Hoàn thành |
| **FR-06** | Đặt suất tham gia & Kiểm tra điều kiện nộp | `UC-06` | `requests` | `SCR-07` | `test/domain/recruitSlots.test.ts` (28 tests) | 🟢 Hoàn thành |
| **FR-07** | Host xem thông tin & Duyệt/Từ chối thủ công | `UC-07` | `requests`, `courts` | `SCR-08` | `test/domain/recruitSlots.test.ts` | 🟢 Hoàn thành |
| **FR-08** | Hàng đợi Waitlist & Tự động đôn người FIFO | `UC-08` | `requests` | `SCR-07`, `SCR-08` | `test/domain/matchLobby.test.ts` | 🟢 Hoàn thành |
| **FR-09** | Xếp trước cặp khóa (`self`, `host`) | `UC-09` | `courts.lockedPairs`| `SCR-09` | `test/domain/courtBalancing.test.ts` | 🟢 Hoàn thành |
| **FR-10** | Cân kèo sân 4–8 người & Xoay tua ca lẻ 5/7 | `UC-10` | In-memory / pure | `SCR-09` | `test/domain/courtBalancing.test.ts`<br>`test/domain/dynamicBalancing.test.ts` | 🟢 Hoàn thành |
| **FR-11** | Nhập tỷ số set chuẩn BWF & Thẻ đánh giá | `UC-11` | `matches` | `SCR-10`, `SCR-11` | `test/domain/calculateElo.test.ts` | 🟢 Hoàn thành |
| **FR-12** | Tính Elo đôi động ($K=40/24$) & Trừ uy tín | `UC-12` | `users`, `ratings` | `SCR-10`, `SCR-11` | `test/domain/calculateElo.test.ts` (23 tests) | 🟢 Hoàn thành |
| **FR-13** | Lịch sử đấu, Chuỗi thời gian & Bạn ăn ý | `UC-13` | `matches`, `userStats`| `SCR-12` | `test/domain/historyStats.test.ts` (15 tests) | 🟢 Hoàn thành |
| **FR-14** | Bảng điều khiển Quản trị viên in-app | `UC-14` | `users`, `courts` | `SCR-13` | `test/firebase/securityRules.test.ts` | 🟢 Hoàn thành |
| **FR-15** | Hoạt động Offline-First khi mất mạng tại sân | `UC-10`, `UC-11` | AsyncStorage cache | `SCR-09`, `SCR-10` | `test/domain/dynamicBalancing.test.ts`<br>`test/domain/benchmark.test.ts` | 🟢 Hoàn thành |

---

## 12.4. Phụ Lục D: Danh Mục Tài Liệu Toàn Diện Của Đồ Án

1. **Khởi tạo & Quản trị:** `01-project-charter.md`, `02-stakeholders.md`, `03-wbs-raci.md`, `04-schedule-gantt.md`, `05-risk-register.md`, `OWNERSHIP.md`, `PROGRESS.md`, `PROJECT_CONTEXT.md`.
2. **Nghiệp vụ & Thiết kế:** `06-rating-scale.md`, `07-srs.md`, `08-use-cases.md`, `09-user-stories.md`, `screens.md`, `10-host-interview.md`, `chap-design.md`.
3. **Quyết định kiến trúc & Thay đổi:** `ADR-001-backend-approach.md`, `ADR-002-auth-methods.md`, `ADR-003-balancing-algorithm.md`, `CR-01-domain-refinements.md`, `DECISIONS-PENDING.md`.
4. **Hợp đồng API & Realtime:** `data-contract.md`, `repository-interfaces.md`, `security-matrix.md`, `match-lobby.md`, `partner-finder.md`, `recruit-slots.md`, `session-balancing.md`, `finish-match.md`, `history-stats.md`, `notifications.md`, `offline-contract.md`.
5. **Kiểm thử & Báo cáo chất lượng:** `bug-log.md`, `feature-freeze-checklist.md`, `test-cases-mobile.md`, `field-test-guide.md`, 15 bộ test suites domain và rules.
6. **Biên bản họp tuần:** `docs/meetings/W01.md` đến `W11.md`.
