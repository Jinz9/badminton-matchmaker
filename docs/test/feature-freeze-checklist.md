# BẢN KIỂM TRA ĐÓNG BĂNG TÍNH NĂNG (FEATURE FREEZE CHECKLIST)
## HỆ THỐNG GHÉP ĐỘI VÀ CÂN BẰNG KÈO CẦU LÔNG (PHIÊN BẢN MVP v0.8)

**Mốc dự án:** Milestone M8 (Feature Freeze) | Kế hoạch Tuần 8 (Sprint 4)  
**Thời điểm đóng băng:** `[TV1 điền: 2026-11-15]`  
**Người phê duyệt:** Đào Duy Nhật (TV1 - PM, BA, Backend & Data Architecture)  
**Đối tượng áp dụng:** Toàn bộ thành viên dự án (TV1 & TV2 - Nguyễn Đức Đạt)  

---

## 1. Mục tiêu và Ý nghĩa của Feature Freeze (M8)

> [!IMPORTANT]
> **NGUYÊN TẮC BẤT BIẾN SAU FEATURE FREEZE:**
> 1. **Đóng băng tính năng mới (Zero New Features):** Tuyệt đối không bổ sung thêm bất kỳ tính năng, trường dữ liệu hoặc thuật toán mới nào vào mã nguồn backend và data contract.
> 2. **Chỉ sửa lỗi (Bug Fixes Only):** Mọi commit từ nay đến khi kết thúc Milestone M10 chỉ được phép phục vụ việc sửa lỗi phát sinh, vá lỗ hổng bảo mật, và hỗ trợ TV2 hoàn thiện luồng trải nghiệm trên Mobile Expo.
> 3. **Không đổi Hợp đồng âm thầm:** Nếu TV2 phát hiện bất cập khi dựng UI thực tế, hai bên bắt buộc phải họp thống nhất, lập Change Request (CR) hoặc biên bản điều chỉnh tài liệu trước khi sửa code.

---

## 2. Bảng kiểm tra tính đầy đủ của 4 Module Chức năng Cốt lõi

### Module 1: Xác thực & Hồ sơ Trình độ VĐV (WBS 3.1 & Milestone M3)
- [x] **FR-01 (Đăng ký/Đăng nhập):** Firebase Auth (Google Sign-In + Email/Password) theo ADR-002.
- [x] **FR-02 & FR-04 (Khai báo trình độ):** Bảng 10 câu hỏi trắc nghiệm khách quan tính điểm khởi tạo `calculateInitialRatingFromAnswers`, thang 6 cấp (1000–2000 Elo), cờ `isProvisional: true` (K=40 cho 5 trận đầu).
- [x] **FR-03 (Hồ sơ cá nhân):** Họ tên, giới tính, quận/huyện tại Đà Nẵng (7 quận/huyện chuẩn), cụm sân ưa thích, tay thuận, vị trí sở trường (lưới/công/linh hoạt).
- [x] **Bảo mật:** Chặn người dùng tự sửa điểm Elo, điểm uy tín hoặc tự gán quyền `admin` (`test/firebase/securityRules.test.ts`).

### Module 2: Tìm đồng đội cố định & Tuyển vãng lai (WBS 3.1, 3.2 & Milestone M4, M5)
- [x] **FR-07 (Partner Finder - CR-02):** Thuật toán tìm bạn đánh cặp cố định với độ lệch Elo $\le 150$ điểm, bù trừ vị trí (Công + Thủ: +40đ), tay thuận (Trái + Phải: +25đ), cùng quận (+10đ).
- [x] **FR-15 & FR-16 (Suất tuyển vãng lai):** Công thức chuẩn: $\text{Suất tuyển} = \min(4, 8 - \text{Core})$. Không vượt quá 8 người/sân và 2 sân/kèo. Hỗ trợ thành viên Ghost (A2).
- [x] **FR-18 & FR-19 (Duyệt đơn & Đặt suất):** Kiểm tra điều kiện nộp đơn `validateJoinEligibility` (8 mã lỗi), host duyệt tay 100% (A3), giao dịch Firestore chống đặt trùng chỗ (Race condition).
- [x] **Giả định A4 (Hard Block):** Chặn thao tác khi Host tăng người mặc định làm vượt quá trần 8 người trên sân đã có vãng lai được duyệt.

### Module 3: Quản lý Phòng kèo Realtime & Cân kèo Sân đấu (WBS 3.2, 3.3 & Milestone M5, M6)
- [x] **FR-12 & FR-14 (Tạo & Quản lý Phòng kèo):** Kèo tối đa 2 sân (CR-01), $\le 8$ người/sân, $\le 16$ người/kèo. Hỗ trợ VietQR payment info (A8).
- [x] **FR-20 (Hàng đợi dự bị - Waitlist):** Tự động đưa vào Waitlist khi hết chỗ. Giao dịch nguyên tử tự động đôn người FIFO theo giới tính khi có thành viên hủy kèo.
- [x] **FR-21 (Hủy kèo & Phạt uy tín):** Hạn chót hủy trước 12 tiếng. Hủy sát giờ phạt $-5$ điểm, bùng kèo phạt $-15$ điểm. Điểm uy tín hồi phục dần $+2$ điểm khi đánh đủ trận.
- [x] **FR-08 & FR-10 (Cân kèo từng sân - CR-01):** Thuật toán Heuristic Greedy chạy độc lập từng sân 4–8 người, ca lẻ 5 và 7 người xoay tua công bằng (độ lệch số trận $\le 1$). Hoán đổi thủ công `swapPlayers`. Hiệu năng $< 0.03\text{ ms}$.

### Module 4: Vòng lặp trận đấu, Elo Đôi Động & Lịch sử/Thống kê (WBS 3.4 & Milestone M7)
- [x] **FR-22 (Kiểm tra tỷ số BWF):** Thắng chuẩn 21 điểm, cách biệt $\ge 2$ điểm, không hòa, trần tối đa 30 điểm (Golden Point 30-29). Hỗ trợ 1 set hoặc Best of 3.
- [x] **FR-24 (Elo Đôi Động & Điểm uy tín):** Expected Score đôi theo Elo trung bình, Score Margin Multiplier (1.00–1.25), K-factor phân tầng (40/24), kẹp sàn 800 trần 2200. Thành viên Ghost $\Delta = 0$.
- [x] **FR-23 (Thẻ đánh giá chéo Consensus):** Thẻ `plays_better` (+4 Elo) và `fake_level` (-5 Elo, -2 uy tín) bắt buộc đạt $\ge 2$ votes đồng thuận. Chặn tự vote. Trần điều chỉnh thẻ $\pm 5$ Elo/trận.
- [x] **Tính chất Bắt buộc Idempotent:** Cờ `ratingProcessed: true` trong giao dịch `confirmMatchResultTx` chặn tuyệt đối việc bấm 2 lần cộng điểm 2 lần.
- [x] **FR-25 & FR-26 (Lịch sử đấu & Thống kê):** Lọc theo ngày/nội dung, phân trang cursor, chuỗi thời gian biểu đồ Elo.
- [x] **Chỉ số "Đồng đội ăn ý nhất":** Đã chốt ngưỡng $\ge 5$ trận, winRate $\ge 60\%$, tie-break `winRate DESC -> matchesCount DESC -> lastPlayedAt DESC`.

---

## 3. Báo cáo Số liệu Kiểm thử Thực tế (Verification Metrics)

Toàn bộ các bộ ca kiểm thử đã được chạy và xác nhận độc lập:

| Nhóm Kiểm thử | Số Suite | Số Test thực tế | Đạt (Pass) | Trượt (Fail) | Tỷ lệ thành công |
|---|:---:|:---:|:---:|:---:|:---:|
| **Jest Domain Unit Tests** (`test/domain/`) | 10 | 165 | 165 | 0 | **100%** |
| **Kịch bản E2E Toàn diện** (`test/domain/e2eFlow.test.ts`) | 1 | 1 (34 assertions) | 1 | 0 | **100%** |
| **Firestore Security Rules Tests** (`test/firebase/securityRules.test.ts`) | 1 | 60 | 60 | 0 | **100%** |
| **Firebase Integration & Concurrency** (`test/firebase/*.test.ts`) | 5 | 22 | 22 | 0 | **100%** |
| **Tổng cộng toàn dự án** | **17** | **248** | **248** | **0** | **100% PASS** |

- **Đo kiểm Hiệu năng (Benchmark):**
  - Thuật toán Cân kèo 4–8 người: **$0.02\text{ ms} / \text{lượt}$** (Chỉ tiêu SRS: $< 1.000\text{ ms} \implies$ Nhanh hơn 50.000 lần).
  - Thuật toán Tìm đồng đội 1.000 ứng viên: **$< 40\text{ ms}$** (Chỉ tiêu SRS: $< 200\text{ ms}$).

---

## 4. Danh sách Tài liệu API Hợp đồng bàn giao cho TV2

Toàn bộ 9 tài liệu API đã được rà soát và đối chiếu khớp 100% với mã nguồn:

1. [docs/api/data-contract.md](file:///d:/QLDAPM/docs/api/data-contract.md) (Phiên bản v1.1 - Nguồn sự thật toàn hệ thống).
2. [docs/api/auth-profile.md](file:///d:/QLDAPM/docs/api/auth-profile.md) (Hướng dẫn Onboarding, Đăng nhập, Quận/Huyện ĐN).
3. [docs/api/partner-finder.md](file:///d:/QLDAPM/docs/api/partner-finder.md) (Thuật toán và truy vấn tìm đồng đội).
4. [docs/api/recruit-slots.md](file:///d:/QLDAPM/docs/api/recruit-slots.md) (Công thức suất tuyển, điều kiện đặt suất, 8 mã lỗi).
5. [docs/api/match-lobby.md](file:///d:/QLDAPM/docs/api/match-lobby.md) (Hợp đồng Realtime Firestore phòng kèo, Waitlist, hủy kèo).
6. [docs/api/session-balancing.md](file:///d:/QLDAPM/docs/api/session-balancing.md) (Giao diện 3 chạm cân kèo từng sân, đổi người).
7. [docs/api/finish-match.md](file:///d:/QLDAPM/docs/api/finish-match.md) (Chấm điểm 5 giây, kiểm tra BWF, biến động Elo).
8. [docs/api/history-stats.md](file:///d:/QLDAPM/docs/api/history-stats.md) (Lịch sử đấu, biểu đồ đường, đồng đội ăn ý).
9. [docs/api/security-matrix.md](file:///d:/QLDAPM/docs/api/security-matrix.md) (Ma trận phân quyền và bảo mật).

---

## 5. Danh sách Việc tồn đọng Kỹ thuật (Technical Debt / Backlog cho v1.0)

Các hạng mục dưới đây là phi cốt lõi (non-critical), không ảnh hưởng đến luồng chạy chính của MVP, được chuyển sang giai đoạn hoàn thiện sản phẩm thương mại hoặc giai đoạn bảo vệ:

1. **Push Notification Native:** Hiện tại hệ thống ghi document vào collection `notifications`; việc kích hoạt Expo Push Notification Service gửi đến APNs (iOS) / FCM (Android) thật trên máy vật lý sẽ thực hiện ở Sprint 5 cùng TV2.
2. **VietQR Dynamic Generator:** Sinh mã QR chuyển khoản động kèm sẵn số tiền sân `costPerPlayer` và cú pháp chuyển khoản tự động.
3. **Admin Web Dashboard:** Xây dựng giao diện web React riêng cho quản trị viên (hiện tại Admin thao tác trực tiếp qua app di động với `role: "admin"`).
4. **Cache Offline SQLite (WatermelonDB / Redux Persist):** TV2 sẽ tích hợp bộ nhớ đệm offline trên ứng dụng Expo ở Sprint 5.

---

## 6. Kết luận & Phê duyệt Đóng băng Tính năng

Hệ thống đã đáp ứng đầy đủ 100% phạm vi chức năng của 4 Module theo Đề cương chi tiết đồ án và Kế hoạch WBS/Gantt.  
Chính thức kích hoạt trạng thái **FEATURE FREEZE (MILESTONE M8)** từ ngày: **`[TV1 điền: 2026-11-15]`**.

| Vai trò | Họ và tên | Chữ ký xác nhận | Ngày ký |
|---|---|:---:|:---:|
| **PM & Technical Lead (TV1)** | Đào Duy Nhật | *(Đã ký duyệt)* | `[TV1 điền: 2026-11-15]` |
| **Mobile Dev & UI/UX (TV2)** | Nguyễn Đức Đạt | *(Chờ tiếp nhận)* | `[TV2 điền]` |
