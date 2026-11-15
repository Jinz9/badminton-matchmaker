# KỊCH BẢN VIDEO DEMO VÀ BẢO VỆ ĐỒ ÁN (DEMO SCRIPT)

> **Mã tài liệu:** `docs/demo/script.md`  
> **Áp dụng cho:** Milestone M11 (Video Demo) & M12 (Demo trực tiếp trước Hội đồng)  
> **Người thực hiện:** TV1 (Đạo diễn nội dung & Thuật toán) & TV2 (Thao tác màn hình & Lồng tiếng)  
> **Tổng thời lượng mục tiêu:** `[TV1 điền: 4 – 5 phút]`  
> **Định dạng video:** 1080p Full HD (1920x1080), 60fps, âm thanh stereo rõ ràng không tạp âm.

---

## 1. Dữ Liệu Khởi Tạo & Chuẩn Bị Trước Khi Quay (Reset & Checklist)

### 1.1. Lệnh đưa hệ thống về trạng thái ban đầu (Reproducible Seed)
Trước khi bắt đầu quay video hoặc trước khi bước vào phòng bảo vệ, chạy lệnh sau để làm sạch và nạp dữ liệu mẫu phong trào Đà Nẵng:

```bash
# Nạp lại dữ liệu 24 người chơi (6 cấp độ), 4 kèo mẫu, waitlist và lịch sử đấu
npx ts-node scripts/seed.ts --reset
```

### 1.2. Checklist kỹ thuật trước khi bấm máy (Pre-flight Checklist)
- [ ] **Mạng & Thiết bị:** Pin điện thoại $> 80\%$, bật chế độ "Không làm phiền" (Do Not Disturb) để không bị thông báo tin nhắn chen ngang.
- [ ] **Tài khoản kiểm thử đã đăng nhập sẵn:**
  - Máy 1 (Điện thoại Host): Tài khoản `host_nhat@badminton.vn` (Cấp 4, 1580 Elo).
  - Máy 2 (Điện thoại Người chơi vãng lai): Tài khoản `player_dat@badminton.vn` (Cấp 3, 1420 Elo, Provisional $K=40$).
  - Máy 3 (hoặc giả lập): Tài khoản vãng lai nữ `player_linh@badminton.vn` (Cấp 3, 1380 Elo).
- [ ] **Giao diện:** Đặt độ sáng màn hình cố định $80\%$, kích thước font chữ chuẩn, làm sạch màn hình cảm ứng để kéo thả mượt mà.

---

## 2. Kịch Bản Video Chi Tiết Từng Cảnh (Step-by-Step Script)

```carousel
### CẢNH 1: TẠO KÈO GIAO LƯU & THIẾT LẬP SUẤT TUYỂN
- **Thời lượng:** 40 – 50 giây | **Người thao tác:** Host (Máy 1)
- **Dữ liệu chuẩn bị sẵn:** Tài khoản Host Nhật, Sân Tuyên Sơn (Hải Châu, Đà Nẵng).
- **Thao tác trên màn hình:**
  1. Host mở app, tại trang chủ bấm nút **"Tạo kèo mới"**.
  2. Chọn cụm sân: *Sân Cầu Lông Tuyên Sơn*, khung giờ: *17:30 – 19:30*.
  3. Chọn số sân: **1 sân** (CR-01). Nội dung: **Đôi nam nữ (Mixed Doubles)**.
  4. Chọn dải trình độ tuyển: **Cấp 2 đến Cấp 4 (TB- đến TB+)**.
  5. Nhập 4 thành viên mặc định (Core): Gồm Host + 3 bạn quen (có 1 thành viên ghost chưa cài app).
  6. Hệ thống hiển thị tự động: **"Số suất tuyển vãng lai: 4 chỗ"** ($\min(4, 8 - 4) = 4$).
  7. Bấm **"Mở tuyển vãng lai"**.
- **Lời dẫn tiếng Việt (Voice-over):**
  *"Xin chào thầy cô và các bạn! Trong vai trò một Chủ kèo tại Đà Nẵng cần duy trì sân cố định nhưng hôm nay nhóm chỉ có 4 người, tôi mở app để tuyển thêm thành viên vãng lai. Hệ thống tự động tính toán suất tuyển theo công thức $\min(4, 8 - \text{số người mặc định})$ chuẩn xác là 4 suất, đảm bảo không bao giờ nhận vượt quá 8 người trên một sân. Kèo giao lưu được tạo thành công ngay tức thì!"*
- **Điểm nhấn nghiệp vụ:** Bất biến CR-01 ($1 \dots 2$ sân, $\le 8$ người/sân), hỗ trợ thành viên ghost (A2), tính suất tuyển tự động.
<!-- slide -->
### CẢNH 2: NGƯỜI CHƠI XIN THAM GIA, DUYỆT TAY & HÀNG ĐỢI WAITLIST
- **Thời lượng:** 50 – 60 giây | **Người thao tác:** Người chơi Đạt (Máy 2) & Host (Máy 1)
- **Dữ liệu chuẩn bị sẵn:** Kèo vừa tạo ở Cảnh 1.
- **Thao tác trên màn hình:**
  1. Máy 2 (Player Đạt): Mở tab "Tìm kèo", dùng bộ lọc tìm sân tại quận Hải Châu.
  2. Thấy kèo Tuyên Sơn còn chỗ, bấm **"Đăng ký tham gia"**.
  3. Máy 1 (Host Nhật): Nhận thông báo có đơn mới. Host mở màn hình duyệt đơn, xem hồ sơ Đạt (Cấp 3, đánh Cầu sau, uy tín 82đ) $\to$ Host bấm **"Duyệt tham gia"**.
  4. Mô phỏng tình huống suất tuyển đã đủ 4/4 người: Một người chơi thứ 5 bấm xin vào $\to$ Hệ thống tự động chuyển vào **Danh sách dự bị (Waitlist)** vị trí số 1.
  5. Một thành viên vãng lai bấm hủy kèo $\to$ Người đứng đầu Waitlist **tự động được đôn lên danh sách chính thức** trong giao dịch Firestore nguyên tử.
- **Lời dẫn tiếng Việt (Voice-over):**
  *"Về phía người chơi vãng lai, Đạt dễ dàng lọc và tìm thấy kèo đấu phù hợp tại quận Hải Châu. Khi Đạt bấm tham gia, Host kiểm tra hồ sơ uy tín và duyệt thủ công 100% theo đúng quy tắc A3. Đặc biệt, khi phòng đã đủ tải 8 người, người đăng ký sau sẽ được xếp vào hàng đợi Waitlist tự động. Ngay khi có người hủy, hệ thống sử dụng giao dịch nguyên tử đôn người dự bị lên mà không sợ bị trùng suất!"*
- **Điểm nhấn nghiệp vụ:** Duyệt tay 100% (A3), phòng chống Race Condition khi đặt suất, cơ chế đôn Waitlist FIFO.
<!-- slide -->
### CẢNH 3: ĐIỂM DANH & CHIA CẶP CÂN KÈO 3 CHẠM TẠI SÂN
- **Thời lượng:** 60 – 70 giây | **Người thao tác:** Host (Máy 1)
- **Dữ liệu chuẩn bị sẵn:** 5 thành viên đã có mặt tại Sân 1 (ca lẻ 5 người thực tế).
- **Thao tác trên màn hình:**
  1. Host mở màn hình điều khiển sân đấu số 1.
  2. Tích chọn nhanh 5 người đã có mặt (Chạm 1 & 2).
  3. Bấm nút to **"Chia cặp tự động"** (Chạm 3).
  4. Thuật toán chạy in-memory hiển thị kết quả ngay tức thì ($< 0.1\text{ ms}$):
     - Đội A vs Đội B (mỗi đội 2 người, tổng điểm Elo cân bằng lệch $< 50$ điểm).
     - Hiển thị rõ **1 người nghỉ xoay tua** trong hiệp này.
  5. Thao tác hoán đổi người: Host kéo thả đổi người từ Đội A sang Đội B $\to$ Hệ thống tính lại độ chênh lệch điểm và hiển thị cảnh báo nếu lệch quá ngưỡng khuyến nghị.
- **Lời dẫn tiếng Việt (Voice-over):**
  *"Đến giờ thi đấu tại sân Tuyên Sơn, hôm nay có 5 bạn có mặt sớm. Đúng với tiêu chí thiết kế một tay tại sân, Host chỉ mất đúng 3 chạm để chia cặp. Thuật toán Heuristic Greedy phân chia 2 đội có tổng điểm Elo cực kỳ cân bằng, đồng thời tự động chỉ định 1 người nghỉ xoay tua công bằng. Ở hiệp đấu tiếp theo, người vừa nghỉ chắc chắn sẽ được vào sân, đảm bảo số trận đánh chênh lệch giữa các thành viên không quá 1 trận!"*
- **Điểm nhấn nghiệp vụ:** Thao tác 3 chạm, cân kèo Heuristic $< 1\text{ ms}$, xoay tua ca lẻ 5 người công bằng (CR-01), kéo thả đổi người linh hoạt.
<!-- slide -->
### CẢNH 4: NHẬP TỶ SỐ SET ĐẤU CHUẨN BWF & CHẶN SAI LUẬT
- **Thời lượng:** 30 – 40 giây | **Người thao tác:** Host (Máy 1) hoặc Người nghỉ
- **Thao tác trên màn hình:**
  1. Trận đấu kết thúc, bấm vào hiệp đấu để nhập điểm.
  2. Thử nghiệm ca biên tỷ số sai luật: Nhập `21 - 20` rồi bấm Lưu $\to$ Ứng dụng báo lỗi: *"Tỷ số chưa cách biệt 2 điểm theo luật BWF"*.
  3. Sửa lại tỷ số đúng: `22 - 20` (hoặc deuce chạm trần `30 - 29`) $\to$ Ứng dụng chấp nhận kết quả hợp lệ.
  4. Bấm **"Xác nhận kết quả hiệp đấu"**.
- **Lời dẫn tiếng Việt (Voice-over):**
  *"Sau khi hiệp đấu kết thúc, người ngồi nghỉ cầm điện thoại nhập tỷ số. Giao diện với các nút bumper số lớn giúp thao tác cực nhanh kể cả khi tay dính mồ hôi. Ứng dụng được tích hợp bộ kiểm tra tính hợp lệ tỷ số theo chuẩn Liên đoàn Cầu lông Thế giới BWF, lập tức chặn các tỷ số nhập sai luật như 21-20 và chỉ chấp nhận khi đạt cách biệt 2 điểm hoặc chạm trần 30!"*
- **Điểm nhấn nghiệp vụ:** Bumper buttons số lớn cho người chơi thể thao, bộ quy tắc kiểm tra tỷ số BWF chặt chẽ.
<!-- slide -->
### CẢNH 5: CẬP NHẬT ELO ĐÔI ĐỘNG, ĐIỂM UY TÍN & VIETQR
- **Thời lượng:** 50 – 60 giây | **Người thao tác:** Cả 2 máy
- **Thao tác trên màn hình:**
  1. Máy 1 (Host): Bấm **"Kết thúc buổi đánh"**.
  2. Màn hình tổng kết hiển thị biến động điểm Elo của 4 người chơi:
     - Đội thắng được cộng điểm, đội thua bị trừ điểm.
     - Người chơi Đạt đang ở trạng thái Provisional (5 trận đầu) nhận hệ số $K=40$, biến động điểm mạnh hơn để kéo về thực lực.
  3. Cả 4 thành viên được cộng **+2 điểm uy tín** vì tham gia đầy đủ buổi đánh.
  4. Màn hình Chấm thẻ đánh giá chéo: Các thành viên bầu chọn thẻ *"Đúng trình"* và *"Thái độ tốt"* $\to$ Đồng thuận $\ge 2$ votes giúp kích hoạt điểm thưởng Elo.
  5. Màn hình thanh toán: Hiển thị mã **VietQR** tự động sinh từ số tài khoản của Host kèm số tiền chia theo đầu người, người chơi mở app ngân hàng quét mã chuyển tiền sân trong 5 giây!
- **Lời dẫn tiếng Việt (Voice-over):**
  *"Khi buổi đánh kết thúc, hệ thống kích hoạt giao dịch nguyên tử Idempotent tính toán Elo đôi động. Điểm thưởng và phạt được điều chỉnh công bằng theo hiệu số set, hệ số K và thẻ đánh giá chéo đồng thuận. Đồng thời, app tự sinh mã VietQR để các thành viên thanh toán tiền sân sòng phẳng mà app không cần can thiệp cổng trung gian phức tạp!"*
- **Điểm nhấn nghiệp vụ:** Elo đôi động kẹp biên $[800, 2200]$, thẻ đánh giá chéo consensus $\ge 2$ votes, cộng điểm uy tín phục hồi (+2đ), thanh toán VietQR (A8).
<!-- slide -->
### CẢNH BONUS 1: TÌM BẠN ĐÁNH CẶP ĂN Ý (PARTNER FINDER)
- **Thời lượng:** 25 – 30 giây | **Người thao tác:** Player Đạt (Máy 2)
- **Thao tác trên màn hình:**
  1. Mở màn hình "Tìm bạn đánh cặp" (Partner Finder).
  2. Đạt là tay vợt Cầu sau (Back), thuận tay phải, 1420 Elo.
  3. Hệ thống gợi ý bạn nữ Linh (1380 Elo, Cầu trước, thuận tay trái):
     - Độ tương thích Elo tối đa (lệch 40đ $\le 150$).
     - Điểm thưởng bù trừ vị trí Lưới + Công: **+40 điểm**.
     - Điểm thưởng phối hợp tay Trái + Phải: **+25 điểm**.
     - Tổng điểm phù hợp đạt **98/100 điểm (Rất hợp rơ)**!
- **Lời dẫn tiếng Việt:**
  *"Ngoài tính năng ghép kèo, app còn có tính năng Partner Finder giúp người chơi tìm bạn đánh cặp cố định ăn ý. Ma trận thuật toán bù trừ công - thủ và cặp tay trái - phải giúp tìm ra đối tác hoàn hảo nhất!"*
<!-- slide -->
### CẢNH BONUS 2: CHIA CẶP NGOẠI TUYẾN KHI MẤT MẠNG TẠI SÂN (OFFLINE RESILIENCE)
- **Thời lượng:** 20 – 25 giây | **Người thao tác:** Host (Máy 1)
- **Thao tác trên màn hình:**
  1. Host vuốt thanh điều khiển xuống, **bật Chế độ máy bay (Airplane Mode)**.
  2. Bấm "Xếp cặp hiệp tiếp theo" $\to$ Thuật toán chạy in-memory, kết quả hiện ra ngay lập tức ($< 0.1\text{ ms}$), hiện badge cam: *"Đang offline tại sân"*.
  3. Tắt Chế độ máy bay $\to$ Badge đổi sang xanh: *"Đã đồng bộ dữ liệu lên máy chủ"*.
- **Lời dẫn tiếng Việt:**
  *"Đặc biệt, để khắc phục tình trạng mất sóng 4G tại các nhà thi đấu mái tôn kín ở Đà Nẵng, thuật toán chia cặp là hàm thuần túy chạy ngoại tuyến 100% trên thiết bị. Mọi dữ liệu được lưu cache và tự động đồng bộ ngay khi ra khỏi sân!"*
```

---

## 3. Phương Án Dự Phòng Khi Demo Trực Tiếp Bị Sự Cố (Contingency Plan)

Khi thuyết trình trực tiếp trước Hội đồng chấm đồ án, nếu xảy ra sự cố kỹ thuật ngoài ý muốn, nhóm kích hoạt ngay 3 phương án dự phòng theo thứ tự ưu tiên:

| Tình Huống Sự Cố | Nguyên Nhân Khả Dĩ | Phương Án Ứng Phó Tức Thì (Contingency Action) |
| :--- | :--- | :--- |
| **Wi-Fi phòng bảo vệ bị mất hoặc chập chờn** | Quá tải mạng hội trường | **Kích hoạt Chế độ Offline:** App tự động dùng cache AsyncStorage cục bộ và chạy thuật toán in-memory chia cặp bình thường. Trình bày đây chính là tính năng chống mất sóng tại sân của app! |
| **Lỗi kết nối Firebase SDK hoặc trễ mạng** | Mạng 4G bị bóp băng thông | **Chuyển sang Bộ Video Demo quay sẵn (Backup Video Full HD):** Mở video demo 1080p đã chuẩn bị sẵn trên laptop, tiếp tục thuyết minh trực tiếp theo kịch bản. |
| **Thiết bị di động bị sập nguồn / đơ máy** | Lỗi phần cứng điện thoại | **Sử dụng Bộ Ảnh Chụp Từng Bước (Walkthrough Slides):** Trình chiếu chuỗi ảnh chụp màn hình 13 bước trong slide PowerPoint đã chuẩn bị ở Phụ lục B. |
| **Dữ liệu demo bị xáo trộn do thao tác nhầm** | Thao tác thử trước giờ bảo vệ | Mở terminal gõ: `npx ts-node scripts/seed.ts --reset` $\implies$ Toàn bộ database trở về trạng thái sạch sẽ chuẩn mực trong đúng **2 giây**! |

---

## 4. Checklist Quay Và Đóng Gói Video Demo (Production Checklist)

- [ ] **Độ phân giải & Tỉ lệ khung hình:** Full HD 1080p (1920x1080) hoặc 4K, 60fps, khung hình tỉ lệ 16:9 (chèn điện thoại dọc ở giữa, hai bên là thông tin slide / điểm nhấn tính năng).
- [ ] **Âm thanh (Audio):** Giọng đọc tiếng Việt to rõ, truyền cảm, khử tiếng ồn nền (noise gate). Nhạc nền âm lượng nhỏ ($10\% - 15\%$), sử dụng nhạc bản quyền miễn phí (YouTube Audio Library).
- [ ] **Quy ước đặt tên file:** `DEMO_QLDAPM_Nhom02_BadmintonMatchmaker_FullHD.mp4`.
- [ ] **Lưu trữ & Bàn giao:**
  - Tải lên Google Drive (chế độ Public xem được).
  - Tải lên YouTube (chế độ Không công khai - Unlisted) để nhúng link vào slide và báo cáo.
  - Sao chép 1 bản offline vào USB của TV1 và TV2 khi đi bảo vệ.
