---
name: project-docs-vi
description: Mẫu và danh sách nội dung sẵn có bằng tiếng Việt cho hồ sơ quản trị dự án của đồ án app ghép đội cầu lông gồm Project Charter, danh sách yêu cầu chức năng (SRS), User Stories, Risk Register, biên bản họp tuần, báo cáo kiểm thử, kịch bản demo. Hãy dùng skill này bất cứ khi nào người dùng nhắc đến báo cáo, tài liệu, SRS, user story, charter, rủi ro, WBS, Gantt, biên bản họp, slide bảo vệ hoặc kịch bản demo, kể cả khi họ chỉ nói "viết giúp mình phần yêu cầu". Đọc kèm badminton-domain-rules để nội dung khớp luật nghiệp vụ.
---

# Tài liệu quản trị dự án (tiếng Việt)

Chỉ viết tài liệu **dựa trên luật trong `badminton-domain-rules`**. Nếu thấy mâu thuẫn, nêu ra, đừng tự thêm luật mới.
Khi người dùng yêu cầu file Word hoặc PDF, dùng skill tạo file tương ứng nếu có. Skill này chỉ quyết định nội dung.

## 1. Project Charter (một trang)

Các mục: tên đề tài, bối cảnh (cộng đồng đánh cầu vãng lai ở Đà Nẵng, lệch trình độ khi chia cặp, host thiếu người),
mục tiêu đo được, phạm vi MVP (xem mục 5 của skill luật), ngoài phạm vi, nhóm và vai trò, mốc thời gian 12 tuần,
ràng buộc (2 người, 1 học kỳ, backend dạng BaaS), tiêu chí thành công, các bên liên quan.

Mục tiêu đo được gợi ý:
- Host tạo kèo có sân thiếu người và duyệt đủ vãng lai trong dưới 2 phút.
- Chia cặp cho một sân 8 người mất dưới 1 giây và không quá 3 chạm.
- Tối thiểu 90% ca kiểm thử trong Test Plan đạt trước khi bảo vệ.

## 2. Yêu cầu chức năng (khởi tạo sẵn, đánh mã để truy vết vào test)

| Mã | Yêu cầu | Ưu tiên |
|---|---|---|
| FR-01 | Đăng ký, đăng nhập, khai báo hồ sơ và cấp tự khai | Cao |
| FR-02 | Host tạo kèo với 1 hoặc 2 sân, mỗi sân có nội dung (nam, nữ, nam nữ) và dải trình độ | Cao |
| FR-03 | Host thêm người mặc định, kể cả người chưa có tài khoản | Cao |
| FR-04 | Hệ thống tính số suất tuyển = min(4, 8 − số người mặc định) và chỉ mở tuyển khi còn suất | Cao |
| FR-05 | Người chơi xem danh sách kèo đang tuyển, lọc theo nội dung, khu vực, trình độ | Cao |
| FR-06 | Người chơi gửi yêu cầu đặt suất, hệ thống kiểm tra giới tính, trình độ, uy tín | Cao |
| FR-07 | Host xem thông tin người xin (trình độ, giới tính, vị trí, uy tín) rồi duyệt hoặc từ chối | Cao |
| FR-08 | Danh sách dự bị và đôn người khi có suất trống | Trung bình |
| FR-09 | Host xếp trước cặp đánh, hoặc người mặc định tự bắt cặp, hoặc để hệ thống xếp tự động | Cao |
| FR-10 | Hệ thống lập lịch trận cho một sân 4–8 người, người nghỉ xoay vòng | Cao |
| FR-11 | Host nhập tỷ số và chấm thẻ đánh giá sau trận | Cao |
| FR-12 | Hệ thống cập nhật điểm Elo và điểm uy tín sau trận | Cao |
| FR-13 | Lịch sử trận và thống kê, đồng đội ăn ý nhất | Trung bình |
| FR-14 | Thông báo đẩy: có yêu cầu, được duyệt, được đôn, nhắc giờ | Trung bình |
| FR-15 | Host chia cặp và nhập tỷ số được khi mất mạng, tự đồng bộ khi có mạng | Cao |

Yêu cầu phi chức năng: thao tác một tay, thời gian chia cặp dưới 1 giây, dữ liệu cá nhân tối thiểu,
phân quyền đúng vai trò, chạy trên Android và iOS.

## 3. User Story mẫu

Định dạng: "Là <vai trò>, tôi muốn <việc>, để <lợi ích>" kèm tiêu chí chấp nhận dạng Given/When/Then.

- Là host của sân thiếu người, tôi muốn chỉ mở tuyển khi sân chưa đủ 8 người, để không nhận dư người.
  Given sân có 6 người mặc định, When tôi mở tuyển, Then hệ thống hiển thị còn 2 suất.
- Là host, tôi muốn xếp trước cặp đánh sau khi xem thông tin người đặt suất, để các trận cân sức.
  Given 2 vãng lai đã được duyệt, When tôi ghép họ với 2 người mặc định, Then cặp được khóa và hiển thị chênh lệch điểm các trận.
- Là người chơi vãng lai nữ, tôi muốn chỉ thấy các sân phù hợp với giới tính và trình độ của mình, để không mất thời gian xin nhầm.
- Là host, tôi muốn chia lượt khi mất mạng, để buổi đánh không bị gián đoạn.

## 4. Risk Register (khởi tạo sẵn)

| Mã | Rủi ro | Khả năng / Tác động | Phương án |
|---|---|---|---|
| RK-01 | Người chơi khai trình độ cao hơn thực tế | Cao / Trung bình | Elo động, thẻ "đánh hay hơn khai báo", host xem trước khi duyệt |
| RK-02 | Vãng lai bùng kèo | Cao / Trung bình | Điểm uy tín, host thấy cảnh báo, danh sách dự bị |
| RK-03 | Mất mạng tại sân | Cao / Cao | Cache cục bộ, thuật toán chạy offline, hàng đợi đồng bộ |
| RK-04 | Thuật toán chia cặp tốn thời gian hơn dự kiến | Trung bình / Trung bình | Dùng heuristic tham lam trước, chỉ cải tiến nếu còn thời gian |
| RK-05 | Cloud Functions cần gói trả phí | Trung bình / Cao | Kiểm tra giá sớm (tuần 3), chốt phương án dự phòng |
| RK-06 | Hai người cùng nhận suất cuối | Trung bình / Cao | Transaction và trường `version` |
| RK-07 | Luật thực tế khác giả định A1–A8 | Trung bình / Trung bình | Khảo sát 2–3 host thật ở tuần 2, cập nhật skill luật |
| RK-08 | Lệch tiến độ giữa hai thành viên | Trung bình / Cao | Data Contract tuần 3, dữ liệu giả, họp 30 phút Chủ nhật |
| RK-09 | Thông báo đẩy khó cấu hình theo loại build | Trung bình / Trung bình | Thử sớm trên máy thật ở tuần 4–5 |

Mỗi rủi ro cần cột chủ sở hữu và trạng thái, cập nhật trong họp tuần.

## 5. Biên bản họp tuần (mẫu)

Ngày giờ, người tham dự; việc đã xong so với kế hoạch tuần; việc trễ và lý do; rủi ro mới hoặc đổi trạng thái;
quyết định; việc tuần tới (ai, hạn); các giả định đã xác nhận hoặc đổi.

## 6. Kịch bản demo (video và bảo vệ)

1. Host tạo kèo 2 sân (một đôi nam nữ, một đôi nam), nhóm mặc định 5 người ở sân đôi nam nữ.
2. Hệ thống hiển thị còn 3 suất, ghi rõ yêu cầu giới tính.
3. Hai người chơi vãng lai gửi yêu cầu, một người bị chặn vì ngoài dải trình độ (hiện rõ lý do).
4. Host duyệt, xếp trước một cặp khóa, để hệ thống xếp phần còn lại.
5. Bật chế độ máy bay, bấm "Chia", hệ thống ra lịch trận.
6. Nhập tỷ số, chấm thẻ, xem điểm Elo thay đổi.

## 7. Slide bảo vệ

Nhấn mạnh quy trình quản trị (Charter, WBS, rủi ro, họp tuần) và giải pháp nghiệp vụ (luật sân 8 người, suất tuyển, cặp khóa),
rồi demo. Trình bày thuật toán như một heuristic có chủ đích, kèm giới hạn đã biết.
