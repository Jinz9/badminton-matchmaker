# KẾ HOẠCH KIỂM THỬ (TEST PLAN) — BADMINTON MATCHMAKER ĐÀ NẴNG

**Mã tài liệu:** `docs/test/test-plan.md`  
**Phiên bản:** 1.0 (WBS 5.1)  
**Phụ trách QA & Mobile:** Nguyễn Đức Đạt (TV2)  
**Phối hợp Backend & Thuật toán:** Đào Duy Nhật (TV1)  
**Tài liệu căn cứ:** [PROJECT_CONTEXT.md](file:///d:/QLDAPM/docs/PROJECT_CONTEXT.md), [07-srs.md](file:///d:/QLDAPM/docs/07-srs.md), [08-use-cases.md](file:///d:/QLDAPM/docs/08-use-cases.md), [09-user-stories.md](file:///d:/QLDAPM/docs/09-user-stories.md)

---

## 1. MỤC TIÊU KIỂM THỬ
1. Đảm bảo toàn bộ **35 yêu cầu chức năng (`FR-01`..`FR-35`)** và **9 yêu cầu phi chức năng (`NFR-01`..`NFR-09`)** hoạt động đúng luật cầu lông phong trào Đà Nẵng.
2. Xác minh các bất biến hệ thống: tối đa **2 sân/kèo**, tối đa **8 người/sân**, suất tuyển $min(4, 8 - \text{mặc định})$, chặn tự chấm điểm, xử lý kết quả trận đấu **idempotent** (bấm 2 lần không cộng Elo 2 lần).
3. Kiểm chứng hiệu năng và trải nghiệm tại sân: chia cặp `< 1 giây`, thao tác chính **tối đa 3 chạm**, dùng **một tay** (`>= 48dp`), chạy ổn định khi **mất mạng (Offline-first)** trên Android & iOS (Expo Go).
4. Đạt tối thiểu **90% ca kiểm thử trong Test Plan PASS** và điểm **SUS $\ge 75$** trong kiểm thử thực địa trước khi bảo vệ đồ án.

---

## 2. PHẠM VI KIỂM THỬ (SCOPE)
- **Trong phạm vi (In-Scope):**
  - **Module 1 (Auth & Profile):** Đăng ký, đăng nhập, OTP/khôi phục mật khẩu (mock/Firebase), khảo sát 10 câu tính `initialRating`, cập nhật hồ sơ, hiển thị cấp độ & Elo.
  - **Module 2 (Partner Finder & Session Balancing):** Lọc đồng đội (độ lệch $\le 150$), chia cặp 4–8 người/sân (`auto` / `rotate`), cặp khóa (`self` / `host`), xoay vòng nghỉ ca lẻ 5 & 7, đổi người thủ công (`swapPlayers`), kèo 2 sân độc lập.
  - **Module 3 (Match Lobby & Recruit Slots):** Tạo kèo 1–2 sân, thêm người mặc định & ghost, tính suất tuyển, kiểm tra điều kiện giới tính/trình độ/uy tín, duyệt/từ chối, Waitlist & đôn người tự động, chống tranh chấp suất cuối.
  - **Module 4 (Post-match, Elo & History):** Nhập tỷ số set chuẩn BWF, chấm thẻ 5 giây (chặn tự chấm), cập nhật Elo đôi & uy tín, lịch sử trận đấu, Đồng đội ăn ý ($\ge 3$ trận, thắng $\ge 60\%$).
  - **Hỗ trợ vận hành sân:** Offline Cache (`SessionSnapshot`, `ActionQueue`, `NetInfo` banner, đồng bộ lại khi có mạng), Thông báo cục bộ nhắc trước 1 giờ & Trung tâm thông báo realtime, Phân quyền UI & Security Rules.
- **Ngoài phạm vi (Out-of-Scope):** Đánh đơn, kèo $> 2$ sân ($> 16$ người), thanh toán trực tuyến, chat in-app, giải đấu bracket, Push từ xa FCM qua EAS Development Build (đã chốt chỉ chạy local reminder + trung tâm thông báo trên Expo Go).

---

## 3. CHIẾN LƯỢC KIỂM THỬ (4 TẦNG)
1. **Kiểm thử Đơn vị (Unit Testing):**
   - Dùng `Jest` (`ts-jest`, môi trường `node`) cho toàn bộ hàm thuần trong `src/domain/**` (`slot`, `recruit`, `balancing`, `elo`, `partnerFinder`, `history`, `rating`) và tầng `src/data/**` (`MockRepository`, `FirebaseRepository` mocked, `offlineCacheSync`, `notifications`).
2. **Kiểm thử Tích hợp (Integration Testing):**
   - Dùng `@firebase/rules-unit-testing` + **Firebase Emulator Suite** (`Auth: 9099`, `Firestore: 8080`, `Functions: 5001`) kiểm tra Security Rules (`X1`–`X10`), giao dịch đặt suất đồng thời (`E12`), và `confirmMatchResultTx`.
   - Kiểm thử luồng component + hook + repository bằng **React Native Testing Library (RNTL)** và `jest-expo`.
3. **Kiểm thử Hệ thống (System & E2E Testing):**
   - Chạy kịch bản E2E xuyên suốt 4 module (`test/domain/e2eFlow.test.ts` và điều hướng RNTL).
   - Kiểm thử phi chức năng: đo thời gian `balanceCourt` (`< 1000ms`), đếm số chạm (`<= 3`), bật/tắt `"Ngoại tuyến giả"` và chế độ máy bay.
4. **Kiểm thử Chấp nhận tại sân (Field / UAT Testing):**
   - Tổ chức đánh thật tại sân cầu lông ở Đà Nẵng (Tuần 10) theo [field-test-guide.md](file:///d:/QLDAPM/docs/test/field-test-guide.md), kiểm tra dưới ánh nắng/đèn sân, thao tác một tay, đo SUS.

---

## 4. MÔI TRƯỜNG & MA TRẬN THIẾT BỊ
- **Môi trường phát triển & tự động:** Windows 11, Node.js, Jest 29, `jest-expo` 58, React Native Testing Library 14, Firebase Emulator Suite.
- **Môi trường chạy app:** **Expo Go (SDK 58)** trên Android & iOS, kết nối Mock hoặc Firebase Emulator qua LAN (`EXPO_PUBLIC_EMULATOR_HOST`).

| Mã thiết bị | Hệ điều hành | Tên máy / Trình giả lập | Độ phân giải | Vai trò kiểm thử | Ghi chú |
|---|---|---|---|---|---|
| `DEV-AND-01` | Android | `[TV2 điền]` | `[TV2 điền]` | Thiết bị thật Android (Expo Go) | Test một tay, ánh nắng, chế độ máy bay |
| `DEV-IOS-01` | iOS | `[TV2 điền]` | `[TV2 điền]` | Thiết bị thật iOS (Expo Go) | Test tương thích UI, SafeArea, thao tác |
| `EMU-AND-01` | Android Emulator | Pixel / AVD (`10.0.2.2`) | 1080×2400 | Giả lập Android + Firebase Emulator | Test luồng tích hợp |
| `EMU-FB-01` | Local Server | Firebase Emulator Suite | N/A | `Auth:9099`, `Firestore:8080`, `UI:4000` | Test Rules & Transaction |

---

## 5. TIÊU CHÍ VÀO / RA (ENTRY & EXIT CRITERIA)
- **Entry Criteria (Điều kiện bắt đầu):**
  - Đã đóng băng tính năng (Milestone M8) và đồng bộ Data Contract v1.
  - Tài liệu `docs/07-srs.md`, `docs/api/*.md`, `firestore.rules` đã chốt.
  - Bộ test domain của TV1 chạy xanh 100%.
- **Exit Criteria (Điều kiện kết thúc / Đạt):**
  - `npm run test:all` (Domain + Data + UI RNTL) PASS **100%**, không bỏ qua assertion.
  - Tất cả ca ưu tiên **P0** (Must) đạt **100% PASS**; tổng tỷ lệ PASS trên `test-cases.csv` đạt **$\ge 90\%$**.
  - Không còn lỗi mức độ **Blocker / Critical** mở trong [bug-log.md](file:///d:/QLDAPM/docs/test/bug-log.md).

---

## 6. RỦI RO KIỂM THỬ & BIỆN PHÁP GIẢM THIỂU
| Rủi ro | Mức độ | Biện pháp giảm thiểu |
|---|---|---|
| Sóng yếu/mất mạng tại sân khi field test | Cao | Dùng Offline Snapshot + Queue (`NetInfo`), kiểm thử trước bằng công tắc "Ngoại tuyến giả" |
| Tường lửa chặn Expo Go kết nối Firebase Emulator | Trung bình | Mở cổng `4000, 8080, 9099, 5001` và bind `0.0.0.0` theo [firebase-env.md](file:///d:/QLDAPM/docs/firebase-env.md) |
| Chênh lệch màn hình Android vs iOS (SafeArea, font scale) | Trung bình | Dùng `SafeAreaView`, `maxFontSizeMultiplier`, test trên cả 2 nền tảng |
| Thiếu Cloud Functions callable trên server khi test thật | Cao | Ghi nhận rõ trong [REQUESTS-FROM-TV2.md](file:///d:/QLDAPM/docs/api/REQUESTS-FROM-TV2.md), có fallback an toàn ở client |

---

## 7. VAI TRÒ, LỊCH TRÌNH (TUẦN 9–10) & CÔNG CỤ
- **Vai trò:**
  - **TV2 (Nguyễn Đức Đạt — QA Lead & Mobile):** Lập Test Plan, viết ≥ 80 Test Cases, viết test RNTL & Data/Offline/Notifications, chạy test trên thiết bị thật Android/iOS và ghi nhận kết quả vào `test-cases.csv` & `bug-log.md`.
  - **TV1 (Đào Duy Nhật — Backend & Domain Lead):** Duy trì Unit test `src/domain/`, chạy Firebase Emulator Security Rules test, đối chiếu ca biên (`boundary-review.md`) và xử lý bug backend.
- **Lịch thực hiện:**
  - **Tuần 9:** Hoàn thiện `test-plan.md`, `test-cases.csv` ($\ge 80$ ca), `traceability.md`, bổ sung RNTL test P0 và chạy `npm run test:all`.
  - **Tuần 10:** Thực hiện kiểm thử tích hợp Emulator, field test thực địa tại sân cầu lông Đà Nẵng, điền kết quả thực tế và fix 100% bug nghiêm trọng.
- **Công cụ:** Jest, `ts-jest`, `jest-expo`, `@testing-library/react-native`, `@firebase/rules-unit-testing`, Firebase Emulator Suite, Expo Go.
