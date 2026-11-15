# Ghi Chú Hiệu Năng — Chia Kèo Cân Bằng (`balanceCourt`)

## 1. Mục tiêu (Tiêu chuẩn Q06 / Test B15)
- Thời gian từ khi người dùng bấm **"Chia kèo"** (tính toán phương án bằng `balanceCourt` của TV1 và render ra Màn 03 `src/app/court/balance-confirm.tsx`) phải **dưới 1 giây (`< 1000 ms`)** cho mọi cấu hình sân `4–8` người (CR-01).

## 2. Môi trường & Phương pháp đo thực tế
- **Thời điểm đo:** 2026-11-16
- **Nhánh:** `feat/balance-confirm`
- **Bài test đo:** `test/components/balance-confirm.test.tsx` (hàm `balanceCourt` đo bằng `executionTimeMs` thực tế của thuật toán + tích hợp render RNTL trên Jest).
- **Lệnh chạy:** `npm run test:ui` (`jest --config jest.ui.config.js`)
- **Môi trường:** Windows, Node/Jest (JSDOM / React Native Testing Library).

## 3. Số liệu đo thực tế (Observed Output)
Log thu được từ lần chạy `npm run test:ui`:
```text
[PERF_BENCHMARK_BALANCE_COURT_MS] {"4":0,"5":1,"6":0,"7":0,"8":0}
```

| Số người trên sân (`n`) | Thời gian `balanceCourt` (`executionTimeMs`) | Ngưỡng mục tiêu | Kết quả |
| --- | --- | --- | --- |
| 4 người | `0 ms` | `< 1000 ms` | Đạt |
| 5 người (1 nghỉ) | `1 ms` | `< 1000 ms` | Đạt |
| 6 người | `0 ms` | `< 1000 ms` | Đạt |
| 7 người (3 nghỉ) | `0 ms` | `< 1000 ms` | Đạt |
| 8 người (4 nghỉ) | `0 ms` | `< 1000 ms` | Đạt |

## 4. Kết luận
- Thuật toán `balanceCourt` trên cấu hình tối đa `8 người/sân` (CR-01) hoàn thành trong `0–1 ms` (tức `< 10 ms`), nhỏ hơn rất nhiều so với ngưỡng `< 1000 ms` (1 giây) của bài kiểm thử B15.
- Khi kiểm thử thực địa trên thiết bị thật (Expo Go / Q15), tiếp tục theo dõi thêm thời gian chuyển màn hình (`navigation push`) và render SVG `CourtDiagram` để đảm bảo trải nghiệm mượt mà dưới 1 giây.
