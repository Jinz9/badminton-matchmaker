# CHƯƠNG 8: QUẢN LÝ THAY ĐỔI (CHANGE MANAGEMENT)

> **Mã tài liệu:** `docs/report/chap08-change-management.md`  
> **Nguồn căn cứ:** `CR-01-domain-refinements.md`, `PROJECT_CONTEXT.md`, `DECISIONS-PENDING.md`  
> **Chủ đề:** Quy trình kiểm soát thay đổi, chi tiết các Yêu cầu Thay đổi (Change Requests) và phân tích tác động

---

## 8.1. Quy Trình Quản Lý Thay Đổi (Change Control Process)

Trong các dự án phần mềm theo mô hình Agile kết hợp thực địa, việc phát sinh mâu thuẫn giữa kế hoạch ban đầu và thực tế môi trường là điều khó tránh khỏi. Nhóm tuân thủ nghiêm ngặt quy tắc quản trị:
1. **Không tự ý sửa mã nguồn hoặc thay đổi tài liệu khi phát hiện mâu thuẫn.**
2. Lập văn bản **Yêu Cầu Thay Đổi (Change Request - CR)** mô tả rõ: *Quy định ban đầu $\to$ Đề xuất điều chỉnh $\to$ Lý do thực tế $\to$ Phân tích tác động đến WBS, SRS, Database và Thuật toán*.
3. Thảo luận nội bộ giữa TV1 và TV2 trong buổi họp tuần; TV1 ký duyệt phê duyệt chính thức trước khi tiến hành cập nhật hệ thống.

---

## 8.2. Danh Mục Các Yêu Cầu Thay Đổi Đã Thực Hiện

### 8.2.1. Change Request 01 (CR-01): Điều Chỉnh Quy Mô Sân Đấu & Thuật Toán Cân Kèo
- **Mã yêu cầu:** `CR-01` | **Ngày ban hành:** 2026-11-15 | **Trạng thái:** **ĐÃ PHÊ DUYỆT & ÁP DỤNG 100%**
- **Quy định ban đầu trong Kế hoạch gốc:**
  - Thuật toán cân kèo gom chung 8–16 người một lượt trên toàn bộ các sân.
  - Phân tích các ca số lượng người lẻ gồm: $9, 11, 13$ người một lượt.
- **Nội dung điều chỉnh mới theo thực tế:**
  - **Đơn vị vận hành là từng sân độc lập:** Mỗi sân có tối đa 8 người. Mỗi buổi giao lưu ("kèo") có tối đa 2 sân (tổng số người tối đa toàn kèo $\le 16$ người).
  - Thuật toán cân kèo `balanceCourt` phải chạy riêng biệt cho từng sân với quy mô $4 \dots 8$ người.
  - Các ca lẻ thực tế tại sân chỉ gồm: **5 người** (4 người đánh, 1 người nghỉ xoay tua) và **7 người** (4 người đánh, 3 người nghỉ xoay tua). **Loại bỏ hoàn toàn các ca 9, 11, 13 người** vì vi phạm bất biến tối đa 8 người/sân của môn cầu lông.
- **Lý do thực tế & Giá trị nghiệp vụ:**
  - Tại các sân cầu lông Đà Nẵng (Kỳ Đồng, Tuyên Sơn), người chơi thuê sân theo ô riêng biệt. Không có chuyện 1 buổi đánh gom 13 người vào 1 sân, và cũng không đổi người liên tục qua lại giữa 2 sân cách xa nhau trong từng hiệp đấu.
- **Phân tích tác động:**
  - *Đến WBS:* Bổ sung gói WBS 3.3 thuật toán cân kèo độc lập từng sân.
  - *Đến Database:* Thêm cấu trúc `courts` con trong `sessions`, giới hạn `courtCount: 1 | 2`.
  - *Đến Kiểm thử:* Viết lại toàn bộ 16 ca test cân kèo cho sân 4–8 người.

---

### 8.2.2. Change Request 02 (CR-02): Phân Định Rõ Ranh Giới Partner Finder Và Match Lobby
- **Mã yêu cầu:** `CR-02` | **Ngày ban hành:** 2026-11-15 | **Trạng thái:** **ĐÃ PHÊ DUYỆT & ÁP DỤNG 100%**
- **Vấn đề ban đầu:**
  - Có sự chồng chéo giữa khái niệm "Tìm đồng đội" (Partner Finder) và "Tham gia phòng kèo" (Match Lobby).
- **Nội dung điều chỉnh mới:**
  - **Module 2.1 (Partner Finder):** Là tính năng tìm kiếm bạn đánh cặp cố định theo cặp 2 người (dựa trên chênh lệch Elo $\le 150$, lối chơi bù trừ công-thủ, tay thuận trái-phải).
  - **Module 2.2 (Match Lobby & Suất tuyển):** Là tính năng tổ chức buổi đánh của Host. Host mở tuyển suất vãng lai khi sân thiếu chân. Hệ thống tính số suất tuyển tự động: $\text{suất tuyển} = \min(4, 8 - \text{core})$.
- **Lý do thực tế & Giá trị nghiệp vụ:**
  - Tách bạch rõ 2 hành vi của người chơi: (1) Muốn tìm một người bạn hợp rơ để tập luyện lâu dài, và (2) Muốn tìm một sân đang thiếu người để xách vợt đi đánh ngay trong chiều nay.
- **Phân tích tác động:**
  - *Đến SRS:* Tách thành 2 nhóm Use Case độc lập (`UC-03` và `UC-04..08`).
  - *Đến UI/UX:* TV2 dựng 2 màn hình riêng biệt: Màn hình Tìm bạn chơi và Màn hình Danh sách phòng kèo.

---

### 8.2.3. Các Quyết Định Nghiệp Vụ Quan Trọng Đã Được Phê Duyệt (A1 – A8)

| Mã Giả Định | Nội Dung Ban Đầu | Quyết Định Phê Duyệt Của TV1 (Chuyên Môn Cầu Lông) | Cơ Sở Thực Tế Tại Đà Nẵng |
| :---: | :--- | :--- | :--- |
| **A1** | Sân phải có đủ 4 người mặc định mới được mở tuyển. | **Đã sửa:** Cho phép mở tuyển nếu có từ 1 người mặc định trở lên, miễn là tổng không quá 8 người/sân. | Giúp 1–2 người bạn vẫn có thể tạo kèo và tuyển thêm vãng lai để đánh. |
| **A2** | Người mặc định chưa có tài khoản ("ghost user"). | **Đã duyệt:** Cho phép Host nhập thành viên ghost (tên, giới tính, cấp độ tự khai) để chia cặp; không cập nhật lịch sử Elo cho ghost. | Phù hợp thực tế có nhiều người lớn tuổi hoặc bạn bè không dùng app. |
| **A3** | Cơ chế duyệt người xin tham gia. | **Đã duyệt:** Host duyệt thủ công 100% (không dùng tự động duyệt). | Host cần nắm toàn quyền quyết định ai được vào sân của mình. |
| **A4** | Host thêm người mặc định khi đã duyệt vãng lai. | **Đã duyệt (Hard Block):** Khóa chức năng thêm người mặc định nếu đã nhận đủ vãng lai chạm mốc 8 người/sân. | Bảo vệ quyền lợi của người chơi vãng lai đã được duyệt. |
| **A5** | Dải trình độ tuyển vãng lai của sân. | **Đã duyệt:** Cho phép người chơi lệch cấp nộp đơn nhưng hệ thống gắn cờ cảnh báo "Lệch trình độ" để Host cân nhắc. | Tôn trọng sự linh hoạt của Host trong các buổi giao lưu vui vẻ. |
| **A6** | Chỉ số Elo trong đánh đôi. | **Đã duyệt:** Sử dụng 1 chỉ số Elo chung cho giai đoạn MVP để đơn giản hóa thuật toán. | Tránh làm người dùng bị rối bởi quá nhiều chỉ số điểm. |
| **A7** | Hủy kèo và Phục hồi điểm uy tín. | **Đã duyệt:** Hủy trước 12h: không phạt; Hủy trong 12h: trừ 5đ; Bùng kèo sát giờ: trừ 15đ; Đi đánh đủ 1 buổi được cộng hồi phục +2đ uy tín. | Răn đe bùng kèo nhưng có cơ chế hoàn lương cho người chơi tích cực. |
| **A8** | Thanh toán tiền sân. | **Đã duyệt:** App không can thiệp cổng thanh toán; Host nhập STK/Ngân hàng để app tự sinh mã VietQR hiển thị trong phòng kèo. | Không vướng thủ tục pháp lý ví điện tử, thanh toán trực tiếp qua ngân hàng. |

