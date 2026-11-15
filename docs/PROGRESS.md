# TIẾN ĐỘ THỰC HIỆN ĐỒ ÁN (PROGRESS.md)
**Cập nhật lần cuối:** 2026-11-15  
**Quản lý tiến độ:** TV1 (Đào Duy Nhật - PM, Backend, Data & Algorithm)

---

## 1. Bảng theo dõi các mốc tiến độ (Milestones M1–M12)

| Mốc | Tên mốc | Mô tả chi tiết | Trạng thái | Ghi chú |
|---|---|---|:---:|---|
| **M1** | Charter & Môi trường Dev | Ký duyệt Charter, thiết lập Git repo, bộ quy tắc, cấu trúc thư mục, môi trường Jest, Board quản lý | 🟢 Hoàn thành | Đã sẵn sàng toàn bộ tài liệu & hạ tầng kiểm thử |
| **M2** | SRS & Figma Prototype | Hoàn thành tài liệu yêu cầu SRS, Data Contract; TV2 hoàn thành Prototype Figma | 🟡 Đang thực hiện | TV1 hoàn tất SRS/Use Cases/Stories/Screens, sẵn sàng cho TV2 dựng Figma (WBS 2.4) |
| **M3** | Đăng nhập & Profile Cloud | Xác thực Firebase Auth, lưu thông tin User và hồ sơ cơ bản lên Firestore | 🟡 Đang thực hiện | Backend & Logic sẵn sàng 100% (WBS 3.1); Chờ TV2 dựng xong màn hình Đăng nhập & Onboarding (WBS 4.1) |
| **M4** | Module Hồ sơ & Tìm đồng đội | Triển khai thang 6 cấp, thuật toán Partner Finder (lệch ≤ 150 Elo, vị trí đánh) | 🟢 Hoàn thành | Hoàn thành hàm thuần `findPartners`, tối ưu Firestore query, 25 test cases PASS, đặc tả API cho TV2 |
| **M5** | Phòng kèo Realtime & Waitlist | Tạo kèo, tuyển vãng lai, cơ chế đặt suất chống race condition, hàng đợi dự bị | 🟢 Hoàn thành | Hoàn thành Quản lý Phòng kèo WBS 3.2 & M5 (CR-01, CR-02): Tạo kèo 1-2 sân, giao dịch atomic chống race-condition, hủy kèo & phạt uy tín (P16), tự động đôn Waitlist, 18 ca tests PASS (tổng 116 domain tests PASS 100%), hợp đồng realtime `match-lobby.md` |
| **M6** | Thuật toán chia cặp cân kèo | Thuật toán xếp cặp và xoay vòng 4–8 người/sân, hỗ trợ cặp khóa, unit test Jest | 🟢 Hoàn thành | Hoàn thành Thuật toán Cân kèo WBS 3.3 & M6 (CR-01): `balanceCourt` cho từng sân 4–8 người, xoay tua ca lẻ 5/7 người, `swapPlayers`, phân bổ 2 sân, benchmark 0.02ms, ADR-003, 16 ca tests PASS (tổng 132 domain tests PASS 100%), đặc tả `session-balancing.md` |
| **M7** | Vòng lặp trận đấu & Elo | Ghi nhận tỷ số, hàm cập nhật Elo đôi động và điểm uy tín | 🟢 Hoàn thành | Hoàn thành Module 4 - Elo Đôi Động & Điểm Uy Tín (WBS 3.4 & M7): Hàm thuần `calculateMatchElo`, multiplier set, K-factor 40/24, review cards consensus, kẹp sàn 800 trần 2200, BWF score validation, giao dịch nguyên tử IDEMPOTENT `confirmMatchResultTx`, 23 tests PASS (18 unit + 5 integration), hợp đồng `docs/api/finish-match.md` |
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
| 2026-11-15 | Hoàn thành bộ hồ sơ Đặc tả yêu cầu phần mềm: SRS (`07-srs.md`), 14 Use Cases (`08-use-cases.md`), 44 User Stories (`09-user-stories.md`, `user-stories.csv`), Danh mục 13 màn hình (`screens.md`), và Change Request (`CR-01-domain-refinements.md`) | `docs/srs` | `docs(srs): software requirements specification, use cases, user stories and screens` | TV1 & Trợ lý |
| 2026-11-15 | Soạn thảo bộ công cụ phỏng vấn kiểm chứng thực địa với Host Đà Nẵng: Kế hoạch phỏng vấn, form khảo sát, kịch bản phỏng vấn sâu A1–A8, bảng đối chiếu giả định (`docs/10-host-interview.md`) | `docs/host-validation` | `docs(interview): host validation interview guide, survey form and assumption matrix` | TV1 & Trợ lý |
| 2026-11-15 | Khởi tạo toàn diện hạ tầng Firebase: ADR-001 (Blaze + Functions tại Singapore), firebase.json, firestore.rules chặn mặc định, functions/ (TypeScript + Jest + chia sẻ domain logic), scripts/ điều khiển emulator, .env.example, hướng dẫn môi trường (`docs/firebase-env.md`), bộ test mẫu emulator đạt 34/34 PASS | `chore/firebase-init` | `chore(firebase): initialize firebase config, functions, emulators and env guide` | TV1 & Trợ lý |
| 2026-11-15 | Hoàn thành Ban hành Hợp đồng Dữ liệu Data Contract v1.0: `docs/api/data-contract.md`, `src/domain/types.ts`, `src/domain/repositories.ts`, `docs/api/repository-interfaces.md`, 7 file mock JSON mẫu, composite indexes `firestore.indexes.json`, gắn tag git `data-contract-v1` (41/41 tests PASS) | `docs/data-contract` | `feat(api): freeze data contract v1, domain types, repository interfaces and mock samples` | TV1 & Trợ lý |
| 2026-11-15 | Hoàn thành Bộ quy tắc bảo mật Firestore Production (`firestore.rules`), ma trận phân quyền chi tiết (`docs/api/security-matrix.md`), kịch bản kiểm thử tự động trên Firebase Emulator với 60/60 ca kiểm thử đạt 100% PASS (`test/firebase/securityRules.test.ts`) | `feat/security-rules` | `feat(security): production firestore rules, security matrix and comprehensive unit tests` | TV1 & Trợ lý |
| 2026-11-15 | Hoàn thành Backend Auth & Profile (WBS 3.1 & M3): ADR-002 (Google + Email/Password), `src/config/districts.ts` (7 quận & 10 sân ĐN), module `userProfile.ts` khởi tạo và validate hồ sơ, script `set-admin.js`, hướng dẫn tích hợp TV2 `auth-profile.md`, 26 unit & integration tests PASS (tổng 127 tests PASS 100%) | `feat/auth-profile` | `feat(auth): user onboarding, profile validation, admin cli, da nang districts and integration tests` | TV1 & Trợ lý |
| 2026-11-15 | Hoàn thành Thuật toán Tìm đồng đội cố định Partner Finder (WBS 3.1 & M4, CR-02): Hàm thuần `findPartners` (ma trận bù trừ vị trí, tay thuận, giới tính, Elo <= 150), tối ưu truy vấn Firestore phân trang `query.ts`, 25 ca unit tests (1000 ứng viên < 40ms), đặc tả API `docs/api/partner-finder.md` (toàn bộ 150 tests PASS 100%) | `feat/partner-finder` | `feat(partner-finder): implement partner finder matching algorithm, firestore query, comprehensive tests and api docs` | TV1 & Trợ lý |
| 2026-11-15 | Hoàn thành Cơ chế Tuyển vãng lai & Đặt suất (WBS 3.2, M5, CR-02): Hàm thuần `computeSlots`, `validateJoinEligibility` (8 mã lỗi), `genderAllowed` (R6), `computeRecruitFitScore` Heuristic 0..100, giao dịch Firestore `transactions.ts` chống race-condition & hard block tăng core (A4), tự động đôn Waitlist, 28 tests (25 domain + 3 transaction) PASS 100%, đặc tả `docs/api/recruit-slots.md` cho TV2 | `feat/recruit-slots` | `feat(recruit): implement slot calculation, eligibility validation, heuristic fit, atomic transactions and api docs` | TV1 & Trợ lý |
| 2026-11-15 | Hoàn thành Quản lý Phòng kèo Realtime & Waitlist (WBS 3.2 & M5, CR-01, CR-02): Hàm thuần `validateCreateSessionInput` (1-2 sân, $\le 8$/sân, $\le 16$/kèo, dải level, khu vực ĐN, startsAt $\ge 30$p), `calculateCancellationPenalty` (hạn chót 12h, phạt 0/5/15đ P16), `evaluateWaitlistPromotion` (đôn FIFO theo giới tính & uy tín), giao dịch `createSessionTx`, `cancelSessionByHostTx`, `leaveSessionWithPenaltyTx`, 18 ca tests PASS (13 domain + 5 concurrency/transactions), hợp đồng realtime `docs/api/match-lobby.md` | `feat/match-lobby` | `feat(lobby): implement match lobby management, waitlist promotion, cancellation penalties, realtime contract and concurrency tests` | TV1 & Trợ lý |
| 2026-11-15 | Hoàn thành Thuật toán Cân kèo & Xoay tua Sân đấu (WBS 3.3 & M6, CR-01): Hàm thuần `balanceCourt` chạy độc lập từng sân (4-8 người), xoay tua người nghỉ công bằng ca lẻ 5 và 7 người, phân đội Elo `(a+d) vs (b+c)`, hỗ trợ `mixed` 1 nam 1 nữ, kéo đổi thủ công `swapPlayers`, phân bổ 2 sân `distributePlayersToCourts`, benchmark thực tế 0.02ms (vượt xa chỉ tiêu < 1.000ms), ADR-003, 16 ca tests Jest PASS 100% (toàn bộ 132 domain tests PASS), đặc tả `docs/api/session-balancing.md` cho TV2 | `feat/court-balancing` | `feat(balancing): implement court balancing algorithm, 5/7 rotation, swap players, adr-003, benchmark and api docs` | TV1 & Trợ lý |
| 2026-11-15 | Hoàn thành Thuật toán Elo Đôi Động & Điểm Uy Tín (WBS 3.4 & M7): Hàm thuần `calculateMatchElo` (Expected score, Multiplier set margin, K-factor 40/24, Review cards consensus, kẹp sàn 800 trần 2200), hàm kiểm tra tỷ số BWF `validateMatchScores`, giao dịch nguyên tử IDEMPOTENT `confirmMatchResultTx` chặn gọi 2 lần, đồng bộ functions, 23 ca tests PASS (18 unit + 5 integration, tổng 150 domain tests PASS 100%), đặc tả API `docs/api/finish-match.md` cho TV2 | `feat/elo-functions` | `feat(elo): implement double elo dynamic calculation, score validation, idempotent transaction, tests and api docs` | TV1 & Trợ lý |

---

## 4. HƯỚNG DẪN BÀN GIAO DATA CONTRACT CHO TV2 (UI/UX & MOBILE DEV)

> [!IMPORTANT]
> **THÔNG BÁO CHO TV2 (NGUYỄN ĐỨC ĐẠT):**  
> Hợp đồng dữ liệu **Data Contract v1.0** đã chính thức được đóng băng (Freeze) và gắn tag git `data-contract-v1`. TV2 có thể sử dụng hoàn toàn độc lập để dựng Prototype Figma (WBS 2.4) và phát triển giao diện Expo Mobile (WBS 4.x) mà không sợ backend thay đổi cấu trúc dữ liệu.

### Cách TV2 sử dụng bộ tài nguyên này:
1. **Tra cứu tài liệu:** Đọc [docs/api/data-contract.md](file:///d:/QLDAPM/docs/api/data-contract.md) để nắm rõ tên collection, tên trường, kiểu dữ liệu và ý nghĩa nghiệp vụ.
2. **Sử dụng Type Definitions:** Toàn bộ kiểu dữ liệu và enum đã định nghĩa chuẩn tại [src/domain/types.ts](file:///d:/QLDAPM/src/domain/types.ts). TV2 chỉ cần `import { UserProfile, SessionDoc, CourtDoc, ... } from "../domain/types"`.
3. **Sử dụng Dữ liệu giả lập (Mock Data):** TV2 sao chép các file JSON trong thư mục [docs/api/mock-samples/](file:///d:/QLDAPM/docs/api/mock-samples/) sang thư mục `src/mocks/` của Expo app để hiển thị dữ liệu lên giao diện.
4. **Giao diện Repository:** Khi xây dựng màn hình, gọi dữ liệu thông qua các interface trong [src/domain/repositories.ts](file:///d:/QLDAPM/src/domain/repositories.ts) theo hướng dẫn tại [docs/api/repository-interfaces.md](file:///d:/QLDAPM/docs/api/repository-interfaces.md).
5. **Quy tắc thay đổi:** Backend cam kết không tự ý đổi schema. Nếu có yêu cầu thay đổi từ phía UI, hai thành viên sẽ thảo luận trong buổi họp tuần và ghi nhận vào Changelog.

---

## 3. Danh sách tác vụ ⚠️ THỦ CÔNG đang chờ xử lý

| Mã | Hạng mục | Hướng dẫn từng bước cụ thể | Người phụ trách | Trạng thái |
|---|---|---|:---:|:---:|
| **MAN-01** | Tạo GitHub Repo & Bật Branch Protection | 1. Đã tạo repo: https://github.com/Jinz9/badminton-matchmaker<br>2. Đã mời TV2 (`Dat2204`) làm Collaborator quyền Write.<br>3. Đã bật Branch Protection Rule cho nhánh `main` (Bắt buộc PR trước khi merge, yêu cầu ít nhất 1 review approval). | TV1 & Trợ lý | 🟢 Hoàn thành |
| **MAN-02** | Tạo Kanban Board trên GitHub / Trello / Jira | 1. Đã tự động tạo 29 Issues chuẩn WBS trực tiếp trên GitHub: https://github.com/Jinz9/badminton-matchmaker/issues<br>2. TV1/TV2 có thể bật tab Projects trên GitHub hoặc làm theo hướng dẫn tại [docs/board-import.md](file:///d:/QLDAPM/docs/board-import.md) để import Trello. | TV1 & Trợ lý | 🟢 Hoàn thành |
| **MAN-03** | Khởi tạo Firebase Console & Mời TV2 | 1. Đã tạo project `badminton-danang` trên Firebase Console (Gói Spark miễn phí).<br>2. Đã kích hoạt Cloud Firestore tại vị trí `asia-southeast1` (Singapore).<br>3. Đã kích hoạt Firebase Authentication (Google & Email/Password).<br>4. Đã lấy `firebaseConfig` chính thức và đồng bộ vào `.env` cùng `src/config/firebase.ts`.<br>5. Đã mời TV2 (`Dat2204`) vào Project settings $\to$ Users and permissions với quyền Editor. | TV1 & Trợ lý | 🟢 Hoàn thành |
| **MAN-04** | TV2 thiết lập Figma & Môi trường Expo | 1. TV2 tạo Workspace trên Figma, khởi tạo file Design System & Prototype tương tác cho 4 module.<br>2. TV2 cài đặt môi trường Expo theo đúng hướng dẫn tại [docs/OWNERSHIP.md](file:///d:/QLDAPM/docs/OWNERSHIP.md) (lưu ý: KHÔNG chạy `create-expo-app .` đè lên `package.json` hiện tại). | TV2 | Chờ thực hiện |
| **MAN-05** | Khảo sát & Phỏng vấn host thật tại Đà Nẵng | **Hướng dẫn từng bước cho TV1:**<br>1. Mở file [docs/10-host-interview.md](file:///d:/QLDAPM/docs/10-host-interview.md).<br>2. Chọn tiếp cận 2–3 Host tại sân (Kỳ Đồng, Tuyên Sơn, Quân Khu 5...) hoặc gửi link Google Form (nội dung Phần 3).<br>3. Hỏi các câu hỏi trong Kịch bản phỏng vấn sâu (Phần 4) xoay quanh A1–A8, cách chia cặp 5/7 người, bùng kèo, thang 6 cấp.<br>4. Điền trực tiếp kết quả thật vào Phần 5 (Hồ sơ HOST-01, HOST-02) và Phần 6 (Bảng đối chiếu A1–A8).<br>5. Báo cho Trợ lý AI để cập nhật SRS, Rating Scale hoặc mở Change Request nếu có mâu thuẫn. | TV1 & TV2 | Đang thực hiện |
