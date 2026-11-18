# DANH SÁCH CA BIÊN GỬI TV1 ĐỐI CHIẾU (BOUNDARY REVIEW)

**Tài liệu:** `docs/test/boundary-review.md`  
**Người gửi:** TV2 (Nguyễn Đức Đạt)  
**Người đối chiếu:** TV1 (Đào Duy Nhật)  
**Căn cứ:** Skill `badminton-testing`, `badminton-domain-rules`, `badminton-rating`, `session-balancing`, `recruit-slot-matching`

---

## 1. Ca biên Sức chứa & Suất tuyển (CR-01, CR-02)
| Mã chuẩn | Tình huống biên | Kỳ vọng theo luật | Mã TC đối ứng | Trạng thái TV1 đối chiếu |
|---|---|---|---|---|
| `S1` | Sân 4 mặc định, 0 vãng lai | `total = 4`, `open = 4`, hợp lệ mở tuyển | `TC-026` | `[TV1 xác nhận]` |
| `S2` | Sân 4 mặc định, 4 vãng lai đã duyệt | `total = 4`, `open = 0`, sân đầy (8/8) | `TC-027` | `[TV1 xác nhận]` |
| `S3` | Sân 5 mặc định, 1 vãng lai đã duyệt | `total = 3`, `open = 2` | `TC-028` | `[TV1 xác nhận]` |
| `S6` | Sân 8 mặc định, 0 vãng lai | `total = 0`, `open = 0`, không mở tuyển | `TC-029` | `[TV1 xác nhận]` |
| `S8` | Sân 0 hoặc 3 mặc định (< 4 người) | Chặn mở tuyển vãng lai theo giả định A1 | `TC-030` | `[TV1 xác nhận]` |
| `CR-01` | Kèo có 1 hoặc 2 sân; thử tạo 3 sân | Chặn tạo sân thứ 3 (`MAX_COURTS_PER_SESSION = 2`) | `TC-021`, `TC-022` | `[TV1 xác nhận]` |
| `B12 / X9` | Thêm người thứ 9 vào 1 sân | Chặn thêm quá 8 người/sân (`COURT_CAPACITY = 8`) | `TC-024`, `TC-049` | `[TV1 xác nhận]` |

## 2. Ca biên Điều kiện đặt suất & Waitlist
| Mã chuẩn | Tình huống biên | Kỳ vọng theo luật | Mã TC đối ứng | Trạng thái TV1 đối chiếu |
|---|---|---|---|---|
| `E1 / E2` | Nữ xin vào Đôi nam; Nam xin vào Đôi nữ | Chặn với `GENDER_NOT_ALLOWED` | `TC-031`, `TC-032` | `[TV1 xác nhận]` |
| `E3 / E4` | Đôi nam nữ: 3 nam + 1 nữ mặc định; xin thêm nam thứ 4 cho phép, nam thứ 5 chặn | Đảm bảo đủ cặp nam-nữ | `TC-033`, `TC-034` | `[TV1 xác nhận]` |
| `E10` | Sân đã hết suất (8/8) nhưng đủ điều kiện khác | Tự vào Waitlist, hiển thị vị trí dự bị | `TC-037` | `[TV1 xác nhận]` |
| `E12` | Hai người cùng tranh suất cuối cùng | Transaction/version: chỉ 1 người được duyệt, người kia nhận lỗi xung đột | `TC-038` | `[TV1 xác nhận]` |
| `E13` | Người chơi hủy suất, đôn người đầu Waitlist; nếu người đầu không hợp giới tính thì bỏ qua | Đôn đúng người kế tiếp hợp lệ | `TC-039`, `TC-040` | `[TV1 xác nhận]` |

## 3. Ca biên Chia cặp & Tìm đồng đội
| Mã chuẩn | Tình huống biên | Kỳ vọng theo luật | Mã TC đối ứng | Trạng thái TV1 đối chiếu |
|---|---|---|---|---|
| `B1..B7` | Chia cặp với số người `4, 5, 6, 7, 8` | Chạy hợp lệ; ca lẻ `5` và `7` xoay vòng người nghỉ đều nhau (`chênh lệch <= 1`) | `TC-041`..`TC-045` | `[TV1 xác nhận]` |
| `B8` | Mọi người cùng điểm Elo | `diff = 0`, kết quả nhất quán theo `seed` | `TC-046` | `[TV1 xác nhận]` |
| `B9` | Một người điểm cực cao (VD 2000 vs 1100) | Không crash, có cảnh báo `UNBALANCED_MATCH` nếu lệch vượt ngưỡng | `TC-047` | `[TV1 xác nhận]` |
| `B10` | Cặp khóa chênh điểm lớn | Giữ nguyên cặp khóa, chỉ cảnh báo không tự tách | `TC-048` | `[TV1 xác nhận]` |
| `PF-150 / 151` | Partner Finder: độ lệch Elo đúng `150` vs `151` | `150` hiển thị trong kết quả; `151` bị loại | `TC-017`, `TC-018` | `[TV1 xác nhận]` |

## 4. Ca biên Tỷ số, Elo & Bảo mật
| Mã chuẩn | Tình huống biên | Kỳ vọng theo luật | Mã TC đối ứng | Trạng thái TV1 đối chiếu |
|---|---|---|---|---|
| `BWF-Score` | Set hợp lệ (`21-19`, `22-20`, `30-29`) vs không hợp lệ (`21-20`, `31-29`, `15-10`) | Chặn kết thúc trận khi tỷ số chưa hợp lệ | `TC-055`, `TC-056` | `[TV1 xác nhận]` |
| `R1` | Đội yếu thắng áp đảo vs thắng sát | `delta` thắng đội mạnh lớn hơn thắng đội yếu; set thắng cách biệt có multiplier cao hơn | `TC-059`, `TC-060` | `[TV1 xác nhận]` |
| `R4` | Bấm kết thúc trận 2 lần cùng `matchId` | Idempotent: lần 2 bị chặn, không cộng Elo 2 lần | `TC-061` | `[TV1 xác nhận]` |
| `Self-Card` | Người chơi tự chấm thẻ cho chính mình | Chặn ở UI lẫn backend | `TC-057` | `[TV1 xác nhận]` |
| `X1 / X6` | Người chơi sửa điểm Elo; người không phải host thấy/bấm quản lý kèo | Security Rules chặn & UI ẩn nút quản lý/duyệt của Host | `TC-081`..`TC-084` | `[TV1 xác nhận]` |

> **Lưu ý từ TV2:** Các điểm chênh lệch giữa `src/domain/*/transactions.ts` và `firestore.rules` (hàm `finishMatch` chưa export trên Cloud Functions) đã được ghi chi tiết tại [REQUESTS-FROM-TV2.md](file:///d:/QLDAPM/docs/api/REQUESTS-FROM-TV2.md) để TV1 rà soát cùng bảng ca biên này.
