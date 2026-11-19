# CHECKLIST QUAY VIDEO DEMO THỰC TẾ (TV2)

**Tài liệu:** `docs/demo/tv2-recording-checklist.md`  
**Kịch bản gốc:** [script.md](file:///d:/QLDAPM/docs/demo/script.md)  
**Người thao tác:** Nguyễn Đức Đạt (TV2) | **Đạo diễn & Dẫn chuyện:** Đào Duy Nhật (TV1)

---

## 1. Checklist chuẩn bị thiết bị trước khi bấm quay
- [ ] **Pin & Nhiệt độ:** Pin điện thoại $\ge 80\%$, rút sạc nếu quay cầm tay để thao tác gọn.
- [ ] **Thông báo & Cuộc gọi:** Bật chế độ **Không làm phiền (Do Not Disturb)** trên cả Android và iPhone; tắt thông báo Messenger/Zalo/Telegram để không che khung hình.
- [ ] **Màn hình & Bộ nhớ:** Độ sáng màn hình cố định ~80% (tắt Auto-Brightness), giữ cỡ chữ hệ thống chuẩn, xóa bớt ảnh/video thừa để trống tối thiểu **2 GB** bộ nhớ.
- [ ] **Giữ sáng màn hình:** App đã tích hợp sẵn `useCourtKeepAwake` ở 3 màn tại sân (`select-players`, `balance-confirm`, `score`) để không tắt màn hình giữa chừng.

---

## 2. Cách quay màn hình điện thoại (1080p, 60fps)
- **Trên iPhone (iOS):**
  1. Vuốt từ góc trên phải xuống mở **Trung tâm điều khiển (Control Center)**.
  2. Nhấn giữ nút **Ghi màn hình (Screen Recording)** $\to$ tắt/bật **Micrô** tùy việc thu tiếng trực tiếp hay lồng tiếng sau $\to$ bấm **Bắt đầu ghi**.
- **Trên Android (Samsung / Xiaomi / Pixel):**
  1. Vuốt thanh trạng thái xuống mở **Quick Settings** $\to$ chọn **Trình ghi màn hình (Screen Recorder)**.
  2. Chọn độ phân giải **1080p (Full HD)**, **60fps**, nguồn âm thanh **Không âm thanh** (nếu lồng tiếng riêng) hoặc **Micrô**.

---

## 3. Đặt lại dữ liệu sạch trước mỗi lần quay (Reset Seed)
- **Chế độ Mock (khuyên dùng để quay mượt, không phụ thuộc mạng):**
  1. Đảm bảo [.env](file:///d:/QLDAPM/.env) có `EXPO_PUBLIC_DATA_SOURCE=mock`.
  2. Vào tab **Cá nhân** $\to$ **[DEV] Mở UI Kit** $\to$ bấm **"Đặt lại dữ liệu mẫu"** (hoặc đăng nhập nhanh 1 chạm `host@badminton.vn` / `player@badminton.vn`).
- **Chế độ Firebase thật / Emulator:**
  ```powershell
  npx ts-node scripts/seed.ts --reset
  ```

---

## 4. Thứ tự thao tác & Thời lượng mục tiêu (~4 phút – 4 phút 30 giây)

| Cảnh | Luồng thao tác chính | Thời lượng mục tiêu | Điểm nhấn cần quay rõ |
|---|---|---:|---|
| **Cảnh 1** | Tạo kèo 1 sân Đôi nam nữ + 4 người mặc định (có 1 Ghost) $\to$ Mở tuyển | `45s` | Công thức `min(4, 8 - 4) = 4` suất, chặn > 2 sân |
| **Cảnh 2** | Player xin vào $\to$ Host duyệt $\to$ Đủ 8/8 người vào Waitlist $\to$ Hủy để đôn | `55s` | Duyệt tay 100%, tự động đôn Waitlist |
| **Cảnh 3** | Home Sân Đấu $\to$ Chọn 5 người (ca lẻ) $\to$ Chia kèo 3 chạm $\to$ Đổi tay | `65s` | `BalanceMeter`, người nghỉ luân phiên, `<= 3` chạm |
| **Cảnh 4** | Nhập tỷ số thử `21-20` (bị chặn) $\to$ Sửa `22-20` $\to$ Chấm thẻ 5 giây | `40s` | Bảng điểm 1 tay, chặn tự chấm chính mình |
| **Cảnh 5** | Xem Elo tăng/giảm, Lịch sử trận, Đồng đội ăn ý & Bật Chế độ máy bay | `50s` | Offline Cache + Queue tự đồng bộ khi có mạng |

---

## 5. Mẹo tránh lỗi mạng khi quay
- Nếu Wi-Fi yếu hoặc Emulator hay gián đoạn, bật **`EXPO_PUBLIC_DATA_SOURCE=mock`** và chạy `npx expo start --tunnel -c` để quay mượt toàn bộ 5 cảnh trong một lượt.
- Riêng đoạn minh họa **Offline-first** ở Cảnh 5, có thể dùng trực tiếp công tắc **Ngoại tuyến giả** trong `/dev/ui-kit` hoặc bật **Chế độ máy bay** ngay trên điện thoại.
