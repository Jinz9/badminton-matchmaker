# CẨM NANG VÀ KỊCH BẢN KIỂM THỬ THỰC ĐỊA TẠI SÂN (FIELD TEST GUIDE)

> **Mã tài liệu:** `docs/test/field-test-guide.md`  
> **Áp dụng cho:** Milestone M10 - Kiểm thử thực tế tại sân cầu lông Đà Nẵng  
> **Người chủ trì thực địa:** TV1 (Đào Duy Nhật) & TV2 (Nguyễn Đức Đạt)  
> **Địa điểm dự kiến:** Sân Cầu Lông Kỳ Đồng (Quận Thanh Khê) hoặc Sân Tuyên Sơn (Quận Hải Châu), TP. Đà Nẵng  
> **Thời lượng buổi kiểm thử:** 1 buổi đánh thực tế (2 giờ, 17:30 - 19:30)

---

## 1. Mục Tiêu Kiểm Thử Thực Địa (Field Test Objectives)

1. **Kiểm tra tính tiện dụng (Usability - Thao tác một tay tại sân):**
   - Đánh giá khả năng Host vừa cầm vợt, tay dính mồ hôi, đứng tại sân vẫn thao tác trơn tru trên màn hình di động.
   - Đo lường số chạm ngón tay để thực hiện thao tác chia cặp (Mục tiêu: **$\le 3$ chạm**).
2. **Kiểm tra độ ổn định mạng thực tế (Network Resilience & Offline First):**
   - Nhà thi đấu mái tôn kín thường làm suy giảm sóng 4G/Wi-Fi. Ứng dụng phải tự động chuyển sang chế độ Offline Cache, chạy thuật toán `balanceCourt` ngay trên thiết bị ($< 1\text{ ms}$) và tự động đồng bộ khi có mạng lại.
3. **Kiểm chứng phản hồi của người chơi thật (Player Acceptance & SUS Score):**
   - Đánh giá mức độ hài lòng về tính công bằng khi xếp cặp, độ lệch trình độ giữa 2 đội, và trải nghiệm chấm điểm/gắn thẻ sau trận.

---

## 2. Kịch Bản Một Buổi Đánh Nhóm Thật (End-to-End Field Scenario)

### Giai đoạn 1: Chuẩn bị trước trận (Trước giờ đánh 2–4 tiếng)
- **Bước 1.1:** Host mở app, tạo một Kèo giao lưu mới (1 hoặc 2 sân, khung giờ 17:30 - 19:30, mức trình độ Cấp 3 - Cấp 4).
- **Bước 1.2:** Nhập 4 người chơi cố định (Core members) của nhóm.
- **Bước 1.3:** Bật chế độ "Mở tuyển vãng lai" cho các suất còn thiếu (Hệ thống tính suất tuyển: $\min(4, 8 - 4) = 4$ suất).
- **Bước 1.4:** 2 người chơi vãng lai tìm thấy kèo trên màn hình Danh sách kèo, bấm "Đăng ký tham gia". Host nhận thông báo và duyệt đơn.

### Giai đoạn 2: Điểm danh và Xếp cặp tại sân (17:25 - 17:40)
- **Bước 2.1 (Điểm danh nhanh):** Host mở màn hình Sân đấu, tích chọn nhanh những người đã có mặt tại sân (Ví dụ: 5 người có mặt, 1 người báo đến trễ 15 phút).
- **Bước 2.2 (Chia cặp 3 chạm):**
  - Chạm 1: Bấm vào sân đấu số 1.
  - Chạm 2: Kiểm tra danh sách 5 người có mặt.
  - Chạm 3: Bấm nút to **"Xếp cặp tự động"**.
  - *Kỳ vọng:* Hiển thị ngay lập tức Đội A vs Đội B kèm 1 người nghỉ xoay tua trong ca lẻ 5 người. Độ lệch Elo $< 100$ điểm.
- **Bước 2.3 (Kéo thả đổi người nếu cần):** Host thử kéo thả đổi 1 người từ Đội A sang Đội B để kiểm tra độ nhạy cảm ứng và tính toán lại chênh lệch điểm.
- **Bước 2.4 (Thử nghiệm Offline):** Bật chế độ máy bay (Airplane Mode) trên điện thoại Host. Bấm "Xếp cặp lượt tiếp theo". Kiểm tra xem thuật toán có chạy mượt mà không bị treo hay không.

### Giai đoạn 3: Diễn biến thi đấu và Nhập kết quả (17:40 - 19:20)
- **Bước 3.1 (Người đến muộn):** Thành viên thứ 6 đến sân. Host bấm "Tiếp nhận người đến muộn". Hệ thống cập nhật danh sách thành 6 người và ưu tiên người này vào sân ở lượt tiếp theo.
- **Bước 3.2 (Nhập tỷ số set):** Kết thúc Hiệp 1 (21 - 18), Host hoặc người nghỉ ghi nhanh điểm số trên màn hình số lớn (Bumper buttons).
- **Bước 3.3 (Thử nghiệm ca biên tỷ số):** Thử nhập tỷ số sai luật (21 - 20) xem app có chặn không; sau đó nhập đúng (22 - 20).
- **Bước 3.4 (Người về sớm):** 1 thành viên bị căng cơ xin về sớm lúc 18:45. Host bấm "Thành viên rời sân". Hệ thống tự động chuyển sân từ 6 người về ca lẻ 5 người xoay tua mà không làm mất lịch sử các hiệp trước.

### Giai đoạn 4: Tổng kết và Đánh giá (19:20 - 19:30)
- **Bước 4.1:** Host bấm "Kết thúc buổi đánh".
- **Bước 4.2:** Các thành viên mở app xem biến động điểm Elo mới và cộng điểm uy tín (+2đ).
- **Bước 4.3:** Thành viên bình chọn thẻ đánh giá chéo cho đồng đội ("Đúng trình", "Đánh hay hơn khai báo", "Thái độ tốt").
- **Bước 4.4:** Quét mã VietQR trên app để thanh toán tiền sân/tiền cầu cho Host.
- **Bước 4.5:** Phát phiếu khảo sát trải nghiệm (SUS Form) cho các thành viên tham gia.

---

## 3. Thước Đo Định Lượng Nghiệm Thu (Quantitative Metrics)

| Chỉ Số Đánh Giá | Mục Tiêu Kỹ Thuật (Target) | Kết Quả Đo Đạc Thực Tế | Đánh Giá (ĐẠT / CHƯA) | Ghi Chú |
| :--- | :---: | :---: | :---: | :--- |
| **Số chạm để chia cặp** | $\le 3$ chạm | `[TV1 điền]` | `[TV1 điền]` | Đo từ lúc mở app đến khi có danh sách cặp đấu |
| **Thời gian tính toán thuật toán** | $< 1.000\text{ ms}$ (Offline) | `[TV1 điền: ~0.03 ms]` | `[TV1 điền]` | Đo bằng performance API |
| **Thời gian đồng bộ khi có mạng** | $< 2.000\text{ ms}$ | `[TV1 điền]` | `[TV1 điền]` | Thời gian đẩy action queue lên Firestore |
| **Tỷ lệ văng ứng dụng (Crash rate)** | $0\%$ (Không crash) | `[TV1 điền]` | `[TV1 điền]` | Kiểm tra logcat / Sentry / console |
| **Độ lệch điểm trung bình giữa 2 đội**| $< 150$ điểm Elo | `[TV1 điền]` | `[TV1 điền]` | Đảm bảo tính cân bằng kèo |
| **Tỷ lệ đồng thuận thẻ đánh giá** | $\ge 2$ votes | `[TV1 điền]` | `[TV1 điền]` | Tránh tình trạng gian lận thẻ ảo |

---

## 4. Phiếu Khảo Sát Trải Nghiệm Người Dùng (System Usability Scale - SUS)

Thang đo tiêu chuẩn 10 câu hỏi (Chấm điểm từ 1: Hoàn toàn không đồng ý $\to$ 5: Hoàn toàn đồng ý):

1. Tôi nghĩ rằng mình sẽ thích sử dụng ứng dụng này thường xuyên khi đi đánh cầu lông. `[ 1 | 2 | 3 | 4 | 5 ]`
2. Tôi thấy ứng dụng này phức tạp không cần thiết. `[ 1 | 2 | 3 | 4 | 5 ]`
3. Tôi thấy ứng dụng rất dễ sử dụng, thao tác chia cặp rất nhanh. `[ 1 | 2 | 3 | 4 | 5 ]`
4. Tôi nghĩ rằng tôi cần sự hỗ trợ của một chuyên gia kỹ thuật để có thể dùng được ứng dụng này. `[ 1 | 2 | 3 | 4 | 5 ]`
5. Tôi thấy các chức năng trong ứng dụng này được tích hợp rất tốt và mượt mà. `[ 1 | 2 | 3 | 4 | 5 ]`
6. Tôi thấy có quá nhiều điều không nhất quán trong ứng dụng này. `[ 1 | 2 | 3 | 4 | 5 ]`
7. Tôi nghĩ rằng hầu hết mọi người đi chơi cầu lông sẽ học được cách sử dụng ứng dụng này rất nhanh. `[ 1 | 2 | 3 | 4 | 5 ]`
8. Tôi thấy ứng dụng này rất cồng kềnh và khó thao tác khi ở trên sân. `[ 1 | 2 | 3 | 4 | 5 ]`
9. Tôi cảm thấy rất tự tin khi sử dụng ứng dụng này để xếp cặp và xem điểm Elo. `[ 1 | 2 | 3 | 4 | 5 ]`
10. Tôi cần phải học rất nhiều điều trước khi có thể bắt đầu sử dụng ứng dụng này. `[ 1 | 2 | 3 | 4 | 5 ]`

*Điểm SUS mục tiêu của đồ án:* **$\ge 75 / 100$ điểm** (Xếp loại Good / Excellent).

---

## 5. ⚠️ HẠNG MỤC THỦ CÔNG: BẢNG GHI NHẬN KẾT QUẢ THỰC ĐỊA

> [!CAUTION]
> **HƯỚNG DẪN DÀNH CHO TV1 (ĐÀO DUY NHẬT):**  
> Đây là tác vụ thực địa ngoài đời thực tại TP. Đà Nẵng. Agent không được tự bịa số liệu. TV1 tổ chức buổi đánh thật, ghi chép số liệu thật và điền trực tiếp vào các ô `[TV1 điền]` dưới đây trước khi đưa vào báo cáo nghiệm thu đồ án.

- **Ngày tổ chức thực tế:** `[TV1 điền: YYYY-MM-DD]`
- **Địa điểm sân:** `[TV1 điền: Ví dụ Sân Kỳ Đồng, 215 Kỳ Đồng, Thanh Khê, Đà Nẵng]`
- **Số lượng người tham gia thực tế:** `[TV1 điền: Ví dụ 6 người (4 nam, 2 nữ)]`
- **Số trận đấu đã tổ chức:** `[TV1 điền: Ví dụ 5 hiệp]`
- **Thời gian chia cặp trung bình quan sát được:** `[TV1 điền: Ví dụ 1.2 giây/hiệp]`
- **Điểm SUS trung bình tính được:** `[TV1 điền: Ví dụ 82.5 / 100 điểm]`
- **Phản hồi tiêu biểu từ người chơi:**
  - *Người chơi A (Cấp 4):* `"[TV1 điền phản hồi thật]"`
  - *Người chơi B (Vãng lai):* `"[TV1 điền phản hồi thật]"`
- **Vấn đề / Sự cố phát hiện tại sân (nếu có):**
  - `[TV1 điền hoặc ghi: "Không phát sinh sự cố, ứng dụng chạy ổn định"]`

