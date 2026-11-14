---
name: badminton-rating
description: Thang trình độ cầu lông phong trào 6 cấp, điểm Elo động cho đánh đôi, điểm uy tín (đúng giờ / hủy / bùng kèo) và quy đổi cấp sang dải điểm cho sân. Hãy dùng skill này bất cứ khi nào người dùng nhắc đến trình độ, cấp độ, điểm, rating, Elo, độ uy tín, bùng kèo, chấm điểm sau trận, hoặc viết Cloud Function xử lý kết quả trận, kể cả khi họ không nói chữ "Elo". Đọc kèm badminton-domain-rules.
---

# Trình độ, Elo và uy tín

Mọi số dưới đây là **mặc định đề xuất**. Thành viên 1 (chuyên môn cầu lông) chỉnh trong `src/config/ratingConfig.ts`,
không rải số cứng trong code.

## 1. Thang 6 cấp

| Cấp | Tên | Điểm | Mô tả ngắn |
|---|---|---|---|
| 1 | Mới chơi | 1000–1199 | Còn khó giữ cầu qua lưới |
| 2 | Cơ bản | 1200–1349 | Đánh được cầu cao, phát cầu ổn định |
| 3 | Trung bình | 1350–1499 | Có clear, drop, smash cơ bản; biết xoay vị trí |
| 4 | Khá | 1500–1649 | Chủ động tấn công, kiểm soát lưới tốt |
| 5 | Giỏi | 1650–1799 | Đánh có chiến thuật, ít lỗi dễ |
| 6 | Rất giỏi | 1800–2000 | Trình độ bán chuyên phong trào |

- Điểm khởi tạo = điểm giữa của cấp tự khai (cấp 3 → 1425).
- Dưới 10 trận: gắn nhãn `provisional` trên UI.
- **Dải trình độ của sân**: host chọn `levelMin`, `levelMax` (cấp 1–6). Điểm cho phép = từ cận dưới của `levelMin`
  đến cận trên của `levelMax`. Hàm quy đổi `levelToRange(level)` đặt trong `ratingConfig.ts`.

## 2. Hồ sơ người chơi

`users/{uid}`: `gender` ("M"|"F"), `position` ("front"|"back"|"both"), `dominantHand`,
và nhóm `skill: { rating, matchesPlayed, reliability }`.

`skill.*` và `role` **chỉ do Cloud Function / Admin SDK ghi**. Client không được ghi trực tiếp (ghi rõ trong Security Rules).
Thành viên ghost (giả định A2) không có hồ sơ nên **không bị cập nhật Elo**.

## 3. Elo sau trận đôi

Chạy khi trận chuyển sang `confirmed`.

```
teamRating = trung bình rating 2 người trong đội
E_A = 1 / (1 + 10 ^ ((teamRating_B - teamRating_A) / 400))
delta_A = K * (S_A - E_A)         // S = 1 thắng, 0 thua
```

- Cả hai người trong đội nhận cùng `delta` đội, nhưng mỗi người dùng K riêng:
  `K = 40` nếu `matchesPlayed < 10`, ngược lại `K = 24`.
- Ghost vẫn góp rating tự khai vào `teamRating` để tính kỳ vọng, nhưng không nhận `delta`.
- Hệ số tỷ số (tùy chọn, bật bằng cờ): nhân `delta` với `1 + (chênh điểm set / 21) * 0.25`, tối đa 1.25.
- Thẻ đánh giá chéo ("Đúng trình", "Đánh hay hơn khai báo", "Thái độ tốt"): chỉ chỉnh tối đa ±5 điểm mỗi trận,
  và chỉ tính khi có ít nhất 2 người khác nhau cùng đánh giá. Giảm việc bạn bè chấm tâng bốc nhau.
- Giới hạn điểm trong khoảng cấu hình, mặc định 800–2200.
- Chạy trong transaction và đánh dấu `ratingProcessed = true` trên trận. Gọi hàm hai lần không được cộng điểm hai lần.
- Một điểm Elo chung cho 3 nội dung (giả định A6).

## 4. Điểm uy tín

| Sự kiện | Thay đổi |
|---|---|
| Có mặt đúng giờ (check-in) | +2 |
| Hủy từ 12 tiếng trước giờ đánh | 0 |
| Hủy trong vòng 12 tiếng | -5 |
| Bùng kèo (không đến, không báo) | -15 |

Khoảng 0–100, mặc định 80. Host đặt `minReliability` cho sân (mặc định 0). Dưới 40 thì host thấy cảnh báo khi duyệt,
không tự động chặn.

## 5. Việc cần làm khi dùng skill

- Hằng số vào `ratingConfig.ts`. Hàm tính là hàm thuần, test bằng Jest.
- Test tối thiểu: thắng đối thủ mạnh hơn, thắng đối thủ yếu hơn, người mới (K=40), chạm trần/sàn,
  gọi hàm hai lần cùng `matchId`, trận có thành viên ghost.
- Cloud Functions thường yêu cầu gói Firebase trả phí (Blaze). Kiểm tra trên trang giá hiện hành của Firebase
  và báo người dùng trước khi dựa vào nó. Phương án dự phòng phải được bàn rõ, không âm thầm chuyển phần tính điểm xuống client.
