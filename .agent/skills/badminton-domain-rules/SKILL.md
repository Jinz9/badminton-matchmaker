---
name: badminton-domain-rules
description: Nguồn sự thật về luật nghiệp vụ của app ghép đội cầu lông (Đà Nẵng) gồm kèo, sân, host, người mặc định, vãng lai, suất tuyển, nội dung đánh đôi nam / đôi nữ / đôi nam nữ, cặp đánh cố định hay tự xếp. Hãy dùng skill này TRƯỚC KHI viết bất kỳ code, schema, màn hình, test hay tài liệu nào có liên quan đến kèo, sân, tuyển người, đặt suất, xếp cặp, kể cả khi người dùng chỉ hỏi một việc nhỏ như đặt tên trường dữ liệu hay vẽ một màn hình.
---

# Luật nghiệp vụ cầu lông (nguồn sự thật)

Mọi skill khác trong bộ này dựa vào file này. Nếu một yêu cầu mâu thuẫn với luật dưới đây,
**hãy nói rõ chỗ mâu thuẫn cho người dùng**, đừng âm thầm làm khác.

## 1. Thuật ngữ và tên trong code

| Tiếng Việt | Ý nghĩa | Tên trong code |
|---|---|---|
| Kèo / buổi đánh | Một buổi giao lưu tại một địa điểm, một khung giờ | `Session` |
| Sân | Một sân cầu trong kèo. Một kèo có 1 hoặc 2 sân | `Court` |
| Host / chủ kèo | Người tạo kèo, quyết định ai được vào | `host` |
| Người mặc định | Nhóm của host, đã chắc chắn đánh | `core` |
| Vãng lai | Người ngoài nhóm, host tuyển khi sân thiếu người | `recruit` |
| Suất | Một chỗ còn trống dành cho vãng lai | `slot` |
| Đôi nam | Cả sân là nam | `category = "men"` |
| Đôi nữ | Cả sân là nữ | `category = "women"` |
| Đôi nam nữ | Mỗi đội 1 nam + 1 nữ | `category = "mixed"` |
| Cặp | 2 người đánh cùng đội | `Pair` |
| Danh sách dự bị | Người đăng ký khi hết suất | `waitlist` |

## 2. Hằng số (đặt trong `src/config/rules.ts`, không rải số cứng)

```ts
export const RULES = {
  MAX_COURTS_PER_SESSION: 2,   // host chỉ làm tối đa 2 sân, tối đa 16 người / kèo
  COURT_CAPACITY: 8,           // mỗi sân tối đa 8 người cùng có mặt
  PLAYERS_PER_MATCH: 4,        // đánh đôi: 4 người trên sân cùng lúc, còn lại nghỉ xoay
  MAX_RECRUITS_PER_COURT: 4,   // tối đa 4 vãng lai / sân
  MIN_CORE_PER_COURT: 4,       // [giả định A1] mặc định có 4 người mặc định
  CATEGORIES: ["men", "women", "mixed"],
} as const;
```

## 3. Luật cứng

- **R1. Chỉ đánh đôi.** Không có đánh đơn trong MVP.
- **R2. Mỗi kèo có 1 hoặc 2 sân. Mỗi sân tối đa 8 người** (người mặc định + vãng lai).
- **R3. Host chỉ tuyển vãng lai khi sân chưa đủ 8 người.** Sân đã đủ 8 người mặc định thì không mở tuyển.
- **R4. Số suất tuyển = `min(4, 8 - số người mặc định)`.** Người mặc định tăng thì suất giảm.

| Người mặc định | Tổng suất tuyển |
|---|---|
| 4 | 4 |
| 5 | 3 |
| 6 | 2 |
| 7 | 1 |
| 8 | 0 (không mở tuyển) |

- **R5. Mỗi sân có một nội dung** (`men`, `women`, `mixed`). Hai sân trong cùng một kèo có thể khác nội dung.
- **R6. Ràng buộc giới tính theo nội dung:**
  - `men`: chỉ nam. `women`: chỉ nữ.
  - `mixed`: mục tiêu 4 nam + 4 nữ khi đủ 8 người. Vãng lai giới tính G chỉ được nhận nếu sau khi nhận,
    số người giới G trong sân không vượt `max(4, số người mặc định giới G)`.
- **R7. Một người chỉ ở một sân trong cùng một kèo.**
- **R8. Chỉ người đã `confirmed` mới tính vào sân.** Yêu cầu chờ duyệt (`requested`) và dự bị (`waitlist`) không chiếm suất.
- **R9. Vãng lai chỉ được vào khi host duyệt** (MVP không có tự động duyệt).
- **R10. Cặp đánh có 3 cách hình thành:**
  1. `self`: người mặc định tự bắt cặp với nhau.
  2. `host`: host xếp trước, sau khi xem thông tin người đã đặt suất (trình độ, giới tính, vị trí).
  3. `auto`: hệ thống xếp cân bằng (xem skill `session-balancing`).
  Cặp do `self` hoặc `host` là cặp **khóa**, hệ thống không được tách.

## 4. Vai trò

- **Người chơi**: xem kèo, đặt suất, hủy, chấm điểm sau trận.
- **Host**: tạo kèo và sân, thêm người mặc định, duyệt vãng lai, xếp cặp, chia lượt đánh, nhập tỷ số.
  Bất kỳ người chơi nào cũng có thể làm host cho kèo của mình.
- **Admin**: cùng một app, phân quyền theo `role`. Không có web admin riêng.

## 5. Ngoài phạm vi MVP

Đánh đơn, hơn 2 sân một kèo, thanh toán và chia tiền sân, giải đấu, tự động duyệt, chat, web admin.

## 6. Các giả định cần xác nhận với giảng viên hoặc host thật

| Mã | Giả định (mặc định đang dùng) |
|---|---|
| A1 | Sân phải có ít nhất 4 người mặc định mới được mở tuyển |
| A2 | Người mặc định có thể chưa có tài khoản: host nhập tên, giới tính, trình độ tự khai (gọi là thành viên "ghost"), không được cập nhật Elo |
| A3 | Chỉ host duyệt vãng lai, chưa có tự động duyệt |
| A4 | Nếu host thêm người mặc định làm vượt số chỗ trong khi đã có vãng lai được duyệt: chặn thao tác, host phải tự chọn một vãng lai để trả về dự bị và hệ thống báo cho người đó |
| A5 | Host chọn dải trình độ cấp 1–6 cho từng sân. Mặc định = cấp trung bình của nhóm ±1 |
| A6 | Một điểm Elo chung cho cả 3 nội dung |
| A7 | Quy tắc hủy và phạt uy tín như trong skill `badminton-rating` |
| A8 | Thanh toán nằm ngoài ứng dụng |

## 7. Cách dùng skill này

- Khi viết code: import hằng số từ `RULES`, không nhập số 8, 4, 2 trực tiếp.
- Khi viết UI: luôn hiển thị nội dung sân bằng chữ + biểu tượng, không chỉ bằng màu.
- Khi gặp tình huống chưa có trong file này: hỏi người dùng, rồi đề xuất bổ sung vào bảng giả định.
