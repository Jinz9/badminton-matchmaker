---
name: badminton-testing
description: Bộ ca kiểm thử cho app ghép đội cầu lông gồm unit test cho tính suất tuyển, điều kiện đặt suất, xếp cặp, lịch đánh và Elo; test Security Rules bằng Firebase Emulator; kịch bản kiểm thử thực địa tại sân; ghi nhận lỗi. Hãy dùng skill này bất cứ khi nào người dùng nhắc đến test, kiểm thử, test case, ca biên, Jest, emulator, bug, lỗi, field test hoặc Test Plan, kể cả khi họ chỉ vừa viết xong một hàm và hỏi "kiểm tra giúp mình". Đọc kèm badminton-domain-rules.
---

# Kiểm thử

Công cụ gợi ý: Jest (kèm `jest-expo` cho phần có React Native) cho `src/domain/`;
Firebase Emulator Suite và `@firebase/rules-unit-testing` cho Security Rules. Kiểm tra phiên bản hiện hành trước khi cài.

Mỗi test case trong báo cáo cần: mã, mô tả, dữ liệu vào, kết quả mong đợi, kết quả thực tế, trạng thái.
Dùng đúng mã dưới đây để báo cáo khớp với code.

## 1. Tính suất (`computeSlots`)

| Mã | Người mặc định | Vãng lai đã duyệt | Kỳ vọng |
|---|---|---|---|
| S1 | 4 | 0 | total 4, open 4 |
| S2 | 4 | 4 | total 4, open 0 |
| S3 | 5 | 1 | total 3, open 2 |
| S4 | 6 | 2 | total 2, open 0 |
| S5 | 7 | 0 | total 1, open 1 |
| S6 | 8 | 0 | total 0, open 0, không mở tuyển |
| S7 | 6 | 3 | overbooked = true |
| S8 | 3 | 0 | bị chặn mở tuyển (A1) |

## 2. Điều kiện đặt suất

| Mã | Tình huống | Kỳ vọng |
|---|---|---|
| E1 | Đôi nam, người xin là nữ | `GENDER_NOT_ALLOWED` |
| E2 | Đôi nữ, người xin là nam | `GENDER_NOT_ALLOWED` |
| E3 | Đôi nam nữ, mặc định 3 nam + 1 nữ, xin là nam | Cho phép (nam thứ 4) |
| E4 | Như E3 nhưng đã có 1 nam vãng lai, xin thêm nam | `GENDER_NOT_ALLOWED` |
| E5 | Đôi nam nữ, mặc định 5 nam + 1 nữ, xin là nam | `GENDER_NOT_ALLOWED` |
| E6 | Đôi nam nữ, mặc định 5 nam + 1 nữ, xin là nữ | Cho phép |
| E7 | Rating thấp hơn cận dưới dải trình độ | `LEVEL_OUT_OF_RANGE` |
| E8 | Uy tín thấp hơn `minReliability` | `RELIABILITY_TOO_LOW` |
| E9 | Đã ở sân khác của cùng kèo | `ALREADY_IN_SESSION` |
| E10 | Hết suất nhưng đủ mọi điều kiện khác | Vào dự bị, không bị từ chối |
| E11 | Kèo đã khóa | `SESSION_CLOSED` |
| E12 | Hai thao tác duyệt cùng lúc cho suất cuối | Chỉ một thành công, người kia nhận lỗi version |
| E13 | Có người rời, người đầu dự bị không còn hợp giới tính | Bỏ qua, đôn người kế tiếp hợp lệ |

## 3. Xếp cặp và lịch (`session-balancing`)

| Mã | Tình huống | Kỳ vọng |
|---|---|---|
| B1 | n = 4, đôi nam | 1 trận, không ai nghỉ |
| B2 | n = 8, đôi nam, không cặp khóa, auto | 4 cặp, 6 trận, mỗi cặp đấu mọi cặp khác đúng 1 lần |
| B3 | n = 8, đôi nam nữ 4 nam + 4 nữ | Mọi cặp là 1 nam + 1 nữ |
| B4 | n = 8, 2 cặp khóa do host xếp, 4 người tự do | Cặp khóa giữ nguyên trong mọi trận |
| B5 | n = 7, rotate | Chênh lệch số trận giữa hai người bất kỳ không quá 1 |
| B6 | n = 5, rotate | Mỗi người nghỉ gần như đều nhau |
| B7 | n = 6, auto | 3 cặp, 3 trận, mỗi cặp đánh 2 trận |
| B8 | Mọi người cùng điểm | `diff = 0`, kết quả giống nhau với cùng `seed` |
| B9 | Chênh điểm cực lớn (1000 và 2000) | Không lỗi, có cảnh báo `UNBALANCED_MATCH` nếu vượt ngưỡng |
| B10 | Cặp khóa chênh điểm nhiều | Không tách cặp, chỉ cảnh báo |
| B11 | Đôi nam nữ, 5 nam + 3 nữ | Có cảnh báo `MIXED_IMBALANCE`, không lỗi |
| B12 | n = 3 hoặc n = 9 | Lỗi `INVALID_SIZE` |
| B13 | Đôi nam có một nữ trong danh sách | `CATEGORY_MISMATCH` |
| B14 | Người vắng giữa buổi (n từ 8 xuống 7) | Chạy lại, giữ `gamesPlayed`, không đổi trận đã đánh |
| B15 | Hiệu năng n = 8 | Dưới 1 giây trên điện thoại tầm trung |

## 4. Elo và uy tín (`badminton-rating`)

| Mã | Tình huống | Kỳ vọng |
|---|---|---|
| R1 | Đội yếu thắng đội mạnh hơn nhiều | `delta` lớn hơn của đội mạnh thắng đội yếu |
| R2 | Người dưới 10 trận | Dùng K = 40 |
| R3 | Điểm chạm trần hoặc sàn | Bị kẹp đúng khoảng cấu hình |
| R4 | Gọi xử lý hai lần cùng `matchId` | Lần hai không đổi điểm |
| R5 | Có thành viên ghost | Ghost không bị đổi điểm, điểm tự khai vẫn góp vào `teamRating` |
| R6 | Thẻ đánh giá chỉ có 1 người | Không điều chỉnh |
| R7 | Bùng kèo | Uy tín giảm 15, không xuống dưới 0 |

## 5. Security Rules (chạy trên Emulator)

| Mã | Hành động | Kỳ vọng |
|---|---|---|
| X1 | Người chơi sửa `skill.rating` của chính mình | Bị từ chối |
| X2 | Người chơi tự đặt `role = "admin"` | Bị từ chối |
| X3 | Người chơi thêm chính mình vào `roster` | Bị từ chối |
| X4 | Người chơi xóa đúng khóa của mình khỏi `roster` khi hủy | Được phép |
| X5 | Người chơi xóa khóa của người khác | Bị từ chối |
| X6 | Người không phải host duyệt vãng lai | Bị từ chối |
| X7 | Host sửa sân của kèo do người khác tạo | Bị từ chối |
| X8 | Người chơi đổi `ratingProcessed` | Bị từ chối |
| X9 | Ghi `roster` quá 8 phần tử | Bị từ chối hoặc transaction thất bại |
| X10 | Người chưa đăng nhập đọc `users/{uid}` | Bị từ chối |

Chạy `firebase-security-rules-auditor` (nếu đã cài) sau mỗi lần đổi rules, và ghi kết quả vào báo cáo.

## 6. Kiểm thử thực địa (tuần 10)

Một buổi đánh thật với nhóm thật, ghi lại theo kịch bản:
tạo kèo → đăng ký vãng lai → duyệt → xếp cặp (thử cả cặp tự bắt và cặp host xếp) → chia lượt → nhập tỷ số → xem Elo thay đổi.
Thêm các tình huống: bật chế độ máy bay giữa buổi, một người đến muộn, một người về sớm, ánh nắng chiếu vào màn hình,
chơi bằng một tay. Ghi thời gian từng thao tác và lời nhận xét của người dùng thật.

## 7. Thiết bị

Tối thiểu 1 máy Android và 1 máy iPhone thật. Ghi model và phiên bản hệ điều hành vào báo cáo.

## 8. Mẫu ghi lỗi (Bug Log)

| Mã lỗi | Mô tả | Các bước tái hiện | Mức độ (nghiêm trọng / vừa / nhẹ) | Người sửa | Trạng thái | Kiểm thử lại |
|---|---|---|---|---|---|---|
