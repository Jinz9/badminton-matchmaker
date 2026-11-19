# BÁO CÁO KẾT QUẢ KIỂM THỬ (TEST REPORT)

**Mã tài liệu:** `docs/test/test-report.md`  
**Phụ trách QA:** Nguyễn Đức Đạt (TV2)  
**Nguồn số liệu thực tế:** [execution-sheet.md](file:///d:/QLDAPM/docs/test/execution-sheet.md), [bug-log.md](file:///d:/QLDAPM/docs/test/bug-log.md), [perf-notes.md](file:///d:/QLDAPM/docs/test/perf-notes.md)

> [!NOTE]
> Toàn bộ số liệu dưới đây được trích xuất **trung thực 100%** từ kết quả chạy tự động (`npm run test:all`) và các file đã ghi nhận. Các mục kiểm thử trên thiết bị thật & Field Test giữ nguyên `[TV2 điền]`.

---

## 1. Tổng quan & Phạm vi kiểm thử
- **Mục tiêu:** Đảm bảo 35 yêu cầu chức năng (`FR-01`–`FR-35`) và 9 yêu cầu phi chức năng (`NFR-01`–`NFR-09`) đạt chuẩn trước khi bảo vệ đồ án.
- **Môi trường đã chạy tự động:** Windows 11, Node.js, Jest 29 (`ts-jest`), `jest-expo` 58, React Native Testing Library 14.
- **Môi trường chờ hoàn tất thủ công:** Thiết bị Android & iPhone thật (Expo Go SDK 58), Firebase Emulator Suite (`Auth:9099`, `Firestore:8080`, `Functions:5001`).

---

## 2. Bảng tổng hợp kết quả theo Module (`execution-sheet.md`)

| Nhóm / Module | Tổng số ca | Đạt (`PASS` tự động) | Trượt (`FAIL`) | Chờ máy thật / Emulator | Ghi chú |
|---|---:|---:|---:|---:|---|
| **M1: Xác thực & Hồ sơ** (`TC-001`–`012`) | 12 | 12 | 0 | 0 | Phủ Jest + RNTL `auth-profile.test.tsx` |
| **M2a: Tìm đồng đội** (`TC-013`–`018`) | 6 | 6 | 0 | 0 | Phủ biên 150 vs 151 Elo |
| **M3: Phòng kèo & Suất tuyển** (`TC-019`–`040`) | 22 | 21 | 0 | 1 (`TC-038`) | `TC-038` (tranh suất cuối Emulator) chờ chạy |
| **M2b: Chia cặp & Lịch đấu** (`TC-041`–`054`) | 14 | 14 | 0 | 0 | Đủ 4/5/6/7/8 người, ca lẻ, cặp khóa, 2 sân |
| **M4: Tỷ số, Elo, Lịch sử & Admin** (`TC-055`–`068`) | 14 | 12 | 0 | 2 (`TC-066`, `067`) | 2 ca Admin Rules chờ chạy trên Emulator |
| **Offline Cache & Thông báo** (`TC-069`–`075`) | 7 | 7 | 0 | 0 | Snapshot, queue backoff, idempotency, local 1h |
| **Phi chức năng & Bảo mật** (`TC-076`–`084`) | 9 | 4 | 0 | 5 (`TC-078`–`080`, `083`–`084`) | 3 ca máy thật + 2 ca Rules Emulator chờ chạy |
| **TỔNG CỘNG (`TC-001`–`TC-084`)** | **84** | **76** | **0** | **8** | Tỷ lệ tự động đạt **76/76 (100%)** |

---

## 3. Kết quả kiểm thử tự động & Hiệu năng (`npm run test:all`)
- **Bộ Domain + Config + Data:** **20/20 suites, 210/210 tests PASS**.
- **Bộ UI (RNTL):** **11/11 suites** (gồm [perf-a11y.test.tsx](file:///d:/QLDAPM/test/components/perf-a11y.test.tsx) và [security-ui.test.tsx](file:///d:/QLDAPM/test/components/security-ui.test.tsx)), tất cả tests PASS.
- **Đo hiệu năng thực tế ([perf-notes.md](file:///d:/QLDAPM/docs/test/perf-notes.md)):**
  - `balanceCourt` (4–8 người/sân): **`0–1 ms`** (chỉ tiêu `< 1000 ms`).
  - Render lưới 8 `PlayerChip`: **`240 ms`**, chạm đổi chọn: **`36 ms`**.

---

## 4. Thống kê lỗi theo mức nghiêm trọng (`bug-log.md`)
- **Tổng số lỗi ghi nhận:** `0` lỗi hoạt động trong `docs/test/bug-log.md` (`BUG-001`, `BUG-002` là mẫu chờ điền).
  - *Blocker / Critical / Major / Minor / Trivial:* `0 / 0 / 0 / 0 / 0` *(cập nhật bổ sung sau khi chạy thực địa: `[TV2 điền]`)*.
- **Lỗi phát hiện & đã sửa nóng khi chạy thử trên iPhone Expo Go:**
  - Lỗi điều hướng `GO_BACK` không có màn trước ở `otp.tsx`, `register.tsx`, `forgot-password.tsx` $\to$ đã sửa bằng `router.canGoBack()` (commits `ebd5f54`, `03742d0`, `052b9f1`), hồi quy `auth-profile.test.tsx` PASS **4/4**.

---

## 5. Đánh giá chất lượng, Rủi ro tồn đọng & Kết luận
- **Kết quả kiểm thử thực địa (Field Test & SUS):** `[TV2 điền sau buổi đánh thật từ field-test-form.md]`.
- **Rủi ro tồn đọng:**
  1. 8 ca (`TC-038`, `066`, `067`, `078`–`080`, `083`, `084`) chưa có số liệu từ máy thật Android/iOS & Emulator.
  2. Cloud Functions callable (`finishMatch`, `cancelParticipation`) đang chờ TV1 export trong `functions/src/index.ts` theo [REQUESTS-FROM-TV2.md](file:///d:/QLDAPM/docs/api/REQUESTS-FROM-TV2.md).
- **Kết luận:** Phần tự động đạt 100% tiêu chí kỹ thuật; sẵn sàng cho bước chạy 8 ca thực tế trên điện thoại & Field Test để chốt hoàn toàn Mốc **M10**: `[TV2 điền ĐẠT / CHƯA ĐẠT sau khi test thật]`.
