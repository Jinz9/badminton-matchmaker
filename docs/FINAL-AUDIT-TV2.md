# BÁO CÁO KIỂM TOÁN CUỐI CÙNG PHẦN TV2 (FINAL AUDIT)

**Mã tài liệu:** `docs/FINAL-AUDIT-TV2.md`  
**Nhánh Git:** `chore/tv2-final-audit`  
**Ngày kiểm toán:** `2026-11-20`  
**Người thực hiện:** TV2 (Nguyễn Đức Đạt) & Trợ lý kỹ thuật  
**Nguyên tắc:** Chỉ báo cáo số liệu thật đã chạy và quan sát trực tiếp; không bịa số liệu thủ công.

---

## 1. Ma trận hoàn thành WBS của TV2

| Mã WBS | Hạng mục công việc | Sản phẩm chính | Đường dẫn bằng chứng | Trạng thái |
|---|---|---|---|---|
| **1.4** *(hỗ trợ)* | Khảo sát app mẫu & chuẩn bị Figma | Khung so sánh 3 app thể thao/đặt sân | [benchmark-apps.md](file:///d:/QLDAPM/docs/ui/benchmark-apps.md) | 🟡 Khung xong, chờ `[TV2 điền]` |
| **2.4** | Design System, Figma Inventory & UI Diff | Kiểm kê 28 frame, tokens, đối chiếu UI | [figma-inventory.md](file:///d:/QLDAPM/docs/ui/figma-inventory.md), [design-tokens.md](file:///d:/QLDAPM/docs/ui/design-tokens.md), [ui-diff.md](file:///d:/QLDAPM/docs/ui/ui-diff.md) | 🟢 Xong khung; chờ xuất PNG vào `docs/ui/figma-export/` |
| **4.1** | Khung Expo Router, Theme & UI Kit | 24 component UI Kit, `/dev/ui-kit`, `OfflineBanner` | `src/components/*`, [ui-kit.tsx](file:///d:/QLDAPM/src/app/dev/ui-kit.tsx) | 🟢 Xong |
| **4.2** | Auth, Profile, Onboarding 10 câu & Partner Finder | Login, Register, OTP giả lập, Forgot PW, Onboarding, Profile, Partners | `src/app/(auth)/*`, `src/app/(tabs)/profile.tsx`, `partners.tsx` | 🟢 Xong |
| **4.3** | Tạo kèo, Danh sách kèo & Match Lobby | Tạo kèo 1–2 sân, lọc ĐN, duyệt tay, Ghost, Waitlist | `src/app/lobby/index.tsx`, `create.tsx`, `[id].tsx` | 🟢 Xong |
| **4.4** | Tại sân 3 chạm, Chia kèo, Chấm điểm BWF & Elo | Home Sân, Chọn 4–8 người, Cân kèo & Swap, Bảng điểm 1 tay & Thẻ 5s | `src/app/court/index.tsx`, `select-players.tsx`, `balance-confirm.tsx`, `score.tsx` | 🟢 Xong |
| **4.5** | Lịch sử, Thống kê, Firebase, Offline & Thông báo | History, Best Partners, `FirebaseRepository`, Offline Cache/Queue, Local 1h & `/notifications` | `src/app/(tabs)/history.tsx`, `src/data/*`, `src/app/notifications.tsx` | 🟢 Xong |
| **5.1** | Test Plan, 84 Test Cases, Traceability & RNTL | Test Plan, CSV/MD 84 ca, ma trận truy vết, `npm run test:all` | [test-plan.md](file:///d:/QLDAPM/docs/test/test-plan.md), [test-cases.csv](file:///d:/QLDAPM/docs/test/test-cases.csv), [traceability.md](file:///d:/QLDAPM/docs/test/traceability.md) | 🟢 Xong |
| **5.2** | Thực thi Test, Bug Log & Field Test Form | Phiếu chạy 76/84 ca tự động PASS; 8 ca chờ máy thật/Emulator | [execution-sheet.md](file:///d:/QLDAPM/docs/test/execution-sheet.md), [bug-log.md](file:///d:/QLDAPM/docs/test/bug-log.md), [field-test-form.md](file:///d:/QLDAPM/docs/test/field-test-form.md) | 🟡 Tự động xong; chờ TV2 chạy máy thật & sân thật |
| **5.4** *(hỗ trợ)* | Tài liệu báo cáo, Slide TV2, Demo & Q&A | Index họp W01–W11, Test Report, Slide TV2, Checklist quay & 15 Q&A | [tv2-contribution.md](file:///d:/QLDAPM/docs/report/tv2-contribution.md), [tv2-section.md](file:///d:/QLDAPM/docs/slides/tv2-section.md), [tv2-recording-checklist.md](file:///d:/QLDAPM/docs/demo/tv2-recording-checklist.md) | 🟡 Khung xong; chờ quay Video & điền `[TV2 điền]` |

---

## 2. Độ phủ giao diện theo `figma-inventory.md` & SRS

- **Màn P0 (Bắt buộc MVP & Demo — 100% đã dựng):**
  - Xác thực & Onboarding: `login.tsx`, `register.tsx`, `otp.tsx` (giả lập theo `ADR-002`), `forgot-password.tsx`, `onboarding.tsx` (10 câu `06-rating-scale.md`), `profile.tsx` (`9:1903`).
  - Tại sân 01–04: `court/index.tsx` (`1:3099`), `select-players.tsx` (`1:2724`), `balance-confirm.tsx` (`1:3440`), `score.tsx` (`1:3306` + pop-up thẻ 5s).
  - Sảnh kèo & Tạo kèo (Figma thiếu/lệch 1v1 nên dựng theo UI Kit + `CR-01`/`CR-02`): `lobby/index.tsx`, `lobby/create.tsx`, `lobby/[id].tsx`.
- **Màn P1 (Hoàn thiện MVP — Đã dựng đủ):**
  - `partners.tsx` (Tìm đồng đội + BXH), `history.tsx` (Lịch sử + Biểu đồ Elo + Đồng đội ăn ý `1:5288`, `1:6149`), `notifications.tsx` (Trung tâm thông báo `5:2`).
- **Màn P2 (Bỏ có lý do rõ ràng):**
  - `05 - Thu tiền & Quỹ cầu` (`1:3901`), `06 - VietQR` (`1:3606`), `08 - 4 sân đấu` (`1:4473` trái `CR-01`), `10 - 5 cấp bậc` (`1:5055` lệch 6 cấp), `14/15/17` (Heatmap/Apple Watch/Garmin), `18/19/20` (Giải đấu loại trực tiếp), `24 - Trợ giúp` (`5:729`) $\to$ **đã loại khỏi MVP** theo `badminton-domain-rules` mục 5 và `CR-01`.

---

## 3. Kết quả kiểm tra kỹ thuật thật (`2026-11-20`)

| Công cụ / Lệnh kiểm tra | Kết quả quan sát trực tiếp | Ghi chú |
|---|---|---|
| `npm run test:all` | **PASS 100%: 31/31 suites, 260/260 tests** | Domain+Config+Data: `20/20` (`210` tests); UI RNTL: `11/11` (`50` tests) |
| `npx tsc --noEmit` | **FAIL (`TS5095`)** | `tsconfig.json` kế thừa `expo/tsconfig.base` (`moduleResolution: "bundler"`) nhưng ghi đè `"module": "commonjs"` |
| `npx eslint` | **Chưa cấu hình cục bộ** | Chưa có config `.eslintrc` và gói `eslint` chưa cài trong `devDependencies` |
| `npx expo-doctor` | **18/20 checks passed** | Còn 2 cảnh báo: thiếu `react-native-worklets` trong `package.json`, lệch version nhỏ SDK 58 / Jest 29 / TS 5.9 |
| `npx expo install --check` | **7 gói lệch version** | `expo`, `expo-router`, `react`, `@types/jest`, `jest`, `jest-expo`, `typescript` |
| `npx expo start --tunnel -c` | **Đã xác nhận chạy trên iPhone Expo Go** | Chế độ `mock` ổn định; chế độ `firebase` Cloud thật nối tới Login (cần đăng ký tài khoản thật hoặc bật Emulator) |

---

## 4. Quét luật nghiệp vụ, Bảo mật Git & Dữ liệu bịa

1. **Quét luật (`CR-01`, `CR-02`):**
   - Tìm kiếm `8-16`, `8–16`, `ca lẻ 9/11/13` trên toàn bộ `src/` và `test/`: **0 vi phạm**. Giới hạn `2 sân/kèo`, `8 người/sân`, ca lẻ `5` và `7`, suất tuyển `min(4, 8 - mặc định)` đồng bộ xuyên suốt.
2. **Quét bảo mật Git (`git ls-files`):**
   - **0 file bí mật** (`.env`, `*serviceAccount*`, `private*key`, `.pem`, `.p12`) bị track trong Git.
   - Code client chỉ sử dụng `EXPO_PUBLIC_*`; [.env.example](file:///d:/QLDAPM/.env.example) đầy đủ biến mẫu.
3. **Quét dữ liệu chưa điền (`[TV2 điền]`):**
   - Tuyệt đối không có số liệu test máy thật, biên bản, hay điểm SUS bịa.
   - Tổng số vị trí đánh dấu `[TV2 điền]` còn lại nằm trong: `docs/meetings/INDEX.md` & `W02..W11.md`, `docs/report/tv2-contribution.md`, `docs/ui/benchmark-apps.md`, `docs/test/test-plan.md`, `field-test-form.md`, `test-report.md` — toàn bộ đã liệt kê tại [TODO-fill-TV2.md](file:///d:/QLDAPM/docs/report/TODO-fill-TV2.md).

---

## 5. Phối hợp với TV1 (`docs/api` & `REQUESTS-FROM-TV2.md`)
- Các màn UI và `FirebaseRepository` đã bám sát Data Contract v1 trong `src/domain/types.ts` và `firestore.rules`.
- Các điểm backend còn chờ TV1 xử lý (đã ghi tại [REQUESTS-FROM-TV2.md](file:///d:/QLDAPM/docs/api/REQUESTS-FROM-TV2.md)):
  1. Export Cloud Functions callable `finishMatch`, `cancelParticipation` trong `functions/src/index.ts`.
  2. Đồng bộ đường dẫn subcollection trong `src/domain/elo/transactions.ts` & `recruit/transactions.ts` theo `firestore.rules`.
  3. Bổ sung rule `collectionGroup` cho `matches` để `getUserMatches` đọc trực tiếp khi chạy Firebase thật.

---

## 6. Gói nộp phần TV2 & Kết luận

### Checklist gói nộp
- [x] Mã nguồn Mobile App (Expo SDK 58, 4 module + Offline + Thông báo)
- [x] Cấu hình phát hành ([app.json](file:///d:/QLDAPM/app.json), [eas.json](file:///d:/QLDAPM/eas.json), [release-guide.md](file:///d:/QLDAPM/docs/release-guide.md)) & Bản dự phòng `mock`
- [x] Hồ sơ kiểm thử ([test-plan.md](file:///d:/QLDAPM/docs/test/test-plan.md), [test-cases.csv](file:///d:/QLDAPM/docs/test/test-cases.csv), [traceability.md](file:///d:/QLDAPM/docs/test/traceability.md), [execution-sheet.md](file:///d:/QLDAPM/docs/test/execution-sheet.md), [test-report.md](file:///d:/QLDAPM/docs/test/test-report.md))
- [x] Minh chứng Figma & Khảo sát ([design-evidence.md](file:///d:/QLDAPM/docs/ui/design-evidence.md), [benchmark-apps.md](file:///d:/QLDAPM/docs/ui/benchmark-apps.md))
- [x] Biên bản họp (`W01`–`W11`, [INDEX.md](file:///d:/QLDAPM/docs/meetings/INDEX.md)), Slide TV2 ([tv2-section.md](file:///d:/QLDAPM/docs/slides/tv2-section.md)), Q&A ([qa-bank.md](file:///d:/QLDAPM/docs/slides/qa-bank.md)), Checklist quay Video ([tv2-recording-checklist.md](file:///d:/QLDAPM/docs/demo/tv2-recording-checklist.md))

### Kết luận tổng thể phần TV2
- **Mức độ hoàn thành hiện tại:** **~90%** (100% mã nguồn giao diện/dữ liệu/offline/thông báo, 100% test tự động `260/260 PASS`, 100% khung tài liệu QA/Báo cáo/Slide).
- **10% công việc thủ công cuối cùng (cần TV2 thực hiện để đạt 100% & M12 cùng TV1):**
  1. Chạy **8 ca còn lại** trên máy Android/iPhone thật & Firebase Emulator và chụp ảnh vào `docs/test/evidence/`.
  2. Tổ chức **Field Test** tại sân Đà Nẵng, thu phiếu SUS & điền [field-test-form.md](file:///d:/QLDAPM/docs/test/field-test-form.md).
  3. Quay **Video Demo 1080p** theo [tv2-recording-checklist.md](file:///d:/QLDAPM/docs/demo/tv2-recording-checklist.md) và xuất PNG Figma vào `docs/ui/figma-export/`.
  4. Điền nốt các mục `[TV2 điền]` trong [TODO-fill-TV2.md](file:///d:/QLDAPM/docs/report/TODO-fill-TV2.md) và gửi cho TV1 gộp bản cuối.
