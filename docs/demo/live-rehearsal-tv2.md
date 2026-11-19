# KỊCH BẢN TẬP DƯỢT DEMO TRỰC TIẾP TRÊN ĐIỆN THOẠI (TV2)

**Tài liệu:** `docs/demo/live-rehearsal-tv2.md`  
**Tổng thời lượng demo:** **4 phút** (khớp Slide 17 trong `outline.md`)  
**Vai trò:** TV2 (Thao tác điện thoại & Chiếu màn hình) | TV1 (Thuyết minh nghiệp vụ)

---

## 1. Phân bổ thời gian & Bước thao tác chi tiết

| Mốc thời gian | Bước thao tác của TV2 trên điện thoại | Lời dẫn phối hợp với TV1 |
|---|---|---|
| `0:00 – 0:45` | Mở app (đã đăng nhập `host@badminton.vn`) $\to$ vào Sảnh kèo $\to$ Tạo kèo 1 sân Đôi nam nữ (5 người mặc định) $\to$ Chỉ vào số suất tuyển = `3`. | Giải thích `CR-01` (tối đa 2 sân, 8 người/sân) và `CR-02` (`min(4, 8-5) = 3`). |
| `0:45 – 1:35` | Mở Chi tiết kèo $\to$ xem đơn xin vào & Waitlist $\to$ bấm **Duyệt**. | Nhấn mạnh duyệt tay & chống trùng suất. |
| `1:35 – 2:30` | Vào **Home Sân Đấu** (Chạm 1) $\to$ Chọn 5 người (Chạm 2) $\to$ Bấm **Xem kèo cân bằng** (Chạm 3) $\to$ Đổi tay 2 VĐV trên sơ đồ sân. | Nhấn mạnh thao tác **3 chạm**, ca lẻ 5 người nghỉ luân phiên, cân kèo `< 1 ms`. |
| `2:30 – 3:25` | Bật **Chế độ máy bay** (hoặc `Ngoại tuyến giả`) $\to$ thấy biểu ngữ cam `"Đang ngoại tuyến"` $\to$ bấm vào trận nhập `21-20` (bị chặn) $\to$ sửa `22-20` $\to$ chấm thẻ 5 giây (không tự chấm mình). | Minh chứng **Offline-first** và luật tỷ số BWF. |
| `3:25 – 4:00` | Tắt Chế độ máy bay $\to$ app tự đồng bộ (biểu ngữ xanh/biến mất) $\to$ mở tab **Lịch sử** xem biến động Elo & **Đồng đội ăn ý**. | Chốt vòng lặp trận đấu khép kín. |

---

## 2. Phương án xử lý sự cố & Người dự phòng

| Sự cố có thể xảy ra tại hội trường | Phương án xử lý tức thì | Người phụ trách |
|---|---|---|
| **Mạng Wi-Fi trường chặn cổng / mất mạng hoàn toàn** | 1. Chuyển ngay sang bản dự phòng **`EXPO_PUBLIC_DATA_SOURCE=mock`** đã nạp sẵn trên máy (hoặc phát hotspot 4G cá nhân).<br>2. Nếu Expo Go không tải được bundle, phát ngay **Video Demo 1080p** quay sẵn (`5.4b`). | **TV2** (chính) & **TV1** (dự phòng phát 4G / mở video trên laptop) |
| **App đứng hoặc lỗi màn hình bất ngờ** | Mở tab phụ / reload nhanh bằng lắc máy, hoặc chuyển sang điện thoại dự phòng thứ 2 đã mở sẵn cùng màn hình. | **TV2** |
| **Quá giờ thuyết trình (> 4 phút)** | Rút gọn Cảnh 1 & Cảnh 2 (mở sẵn kèo mẫu), tập trung demo trực tiếp **Chia kèo 3 chạm + Offline Chế độ máy bay + Bảng điểm 1 tay**. | **TV1** điều phối thời gian |
