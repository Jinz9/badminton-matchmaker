# CẨM NANG KHỞI CHẠY & KIỂM THỬ TRÊN EXPO GO (EXPO GO GUIDE)
**Dự án:** Hệ thống Ghép Đội & Cân Bằng Kèo Cầu Lông (Mobile App - Đà Nẵng)  
**Tài liệu:** `docs/expo-go-guide.md`  
**Áp dụng cho:** Cả hai thành viên (TV1: Đào Duy Nhật & TV2: Nguyễn Đức Đạt)  
**Phiên bản Expo:** SDK 52 (Expo Router v4, React Native 0.76.9)

---

## 1. QUYẾT ĐỊNH KIẾN TRÚC ADR-101: RÀNG BUỘC PHÁT HÀNH QUA EXPO GO

### 1.1. Bối cảnh
- Đồ án cần thử nghiệm tính năng nhanh chóng trên thiết bị thật của cả 2 thành viên và tại các cụm sân cầu lông Đà Nẵng (Sân Kỳ Đồng, Tuyên Sơn).
- Đăng ký tài khoản Apple Developer Program cá nhân tốn $99 USD/năm và Google Play Console tốn $25 USD, không khả thi trong phạm vi đồ án sinh viên.

### 1.2. Quyết định
- Sử dụng **100% nền tảng Expo Go** trong suốt quá trình phát triển, kiểm thử thực địa (Field Test) và buổi báo cáo trước Hội đồng bảo vệ đồ án.

### 1.3. Bảng phân tích ràng buộc kỹ thuật của Expo Go (ADR-101 Matrix)

| Tiêu chí | Khả năng của Expo Go (SDK 52) | Ràng buộc / Giới hạn kỹ thuật | Giải pháp khắc phục của nhóm |
|:---|:---:|:---|:---|
| **Hỗ trợ hệ điều hành** | Cả iOS & Android | Phụ thuộc phiên bản runtime của app Expo Go trên App Store / Google Play | Ghim cố định Expo SDK 52 tương thích 100% với bản Expo Go hiện hành |
| **Giao diện & Điều hướng** | Đầy đủ 100% | Expo Router, Tab Bar, Modal, Gestures, Reanimated hoạt động mượt mà | Tuân thủ triết lý One-thumb Zone tại sân cầu lông |
| **Thư viện Native tùy chỉnh** | Hạn chế | Không thể cài đặt các thư viện đòi hỏi cấu hình mã nguồn native C++/Java riêng (`@react-native-firebase`, SDK ZaloPay/MoMo native) | Sử dụng Firebase JS SDK v10/v11 chuẩn Web/React Native, dùng VietQR ngân hàng thay cho cổng thanh toán native |
| **Mạng & Kết nối tại sân** | Cần kết nối Metro | Wi-Fi công cộng tại sân hoặc hội trường trường học chặn cổng kết nối nội bộ LAN giữa máy tính và điện thoại | **Bắt buộc sử dụng chế độ Tunnel (`--tunnel`)** vượt tường lửa qua Cloudflare / Ngrok |
| **Chạy ngoại tuyến (Offline)** | Hỗ trợ qua Cache | Mất kết nối Metro bundler nếu tắt máy tính | Lưu sẵn cache bundle tĩnh trên điện thoại qua `@react-native-async-storage/async-storage` |

---

## 2. HƯỚNG DẪN TỪNG BƯỚC KHỞI CHẠY DÀNH CHO CẢ HAI THÀNH VIÊN

### Bước 1: Cài đặt ứng dụng Expo Go trên điện thoại thật
- **Đối với điện thoại Android (Samsung, Xiaomi, Oppo...):**
  - Mở **Google Play Store** $\to$ Tìm kiếm từ khóa **"Expo Go"** $\to$ Bấm **Cài đặt**.
- **Đối với điện thoại iPhone (iOS):**
  - Mở **App Store** $\to$ Tìm kiếm từ khóa **"Expo Go"** $\to$ Bấm **Nhận / Tải về**.
- *(Không bắt buộc phải tạo tài khoản hay đăng nhập Expo trong app Expo Go).*

---

### Bước 2: Khởi chạy máy chủ phát triển (Trên máy tính Laptop)
1. Mở cửa sổ Terminal (PowerShell hoặc CMD) tại thư mục gốc dự án:
   ```powershell
   cd D:\QLDAPM
   ```
2. Nếu gặp lỗi bảo mật `PSSecurityException` trên PowerShell, gõ lệnh cấp quyền cho phiên làm việc:
   ```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   ```
3. **Chạy lệnh khởi động Expo Server ở chế độ Tunnel:**
   ```powershell
   npx.cmd expo start --tunnel
   ```
   *(Hoặc gõ `npm start -- --tunnel`).*

> **Vì sao phải dùng `--tunnel`?**  
> Chế độ Tunnel tạo một đường hầm mã hóa an toàn qua Internet. Nhờ đó, điện thoại của bạn dù dùng 4G/5G Viettel/VinaPhone, hay dùng Wi-Fi khác với máy tính, đều quét mã QR và tải app bình thường mà không lo bị tường lửa chặn IP nội bộ.

---

### Bước 3: Quét mã QR để mở ứng dụng trên điện thoại

Khi terminal khởi chạy thành công, một **mã QR lớn** sẽ xuất hiện trực tiếp trên màn hình:

- **Cách quét trên điện thoại Android:**
  1. Mở ứng dụng **Expo Go**.
  2. Bấm vào nút **"Scan QR code"**.
  3. Hướng camera vào mã QR trên màn hình máy tính $\to$ App sẽ tự động tải JavaScript Bundle (hiển thị thanh `Building JavaScript bundle... 100%`) và mở ngay màn hình chính.
- **Cách quét trên điện thoại iPhone (iOS):**
  1. Mở ứng dụng **Camera mặc định** của iPhone (không cần mở app Expo Go trước).
  2. Hướng camera vào mã QR trên màn hình máy tính.
  3. Một thông báo màu vàng có biểu tượng Expo sẽ hiện ra: **"Open in Expo Go"** $\to$ Nhấp vào thông báo đó để mở app.

---

## 3. CÁC PHÍM TẮT HỮU ÍCH TRONG QUÁ TRÌNH THỬ NGHIỆM

Khi app đang chạy trên điện thoại hoặc terminal máy tính:

- **Phím `r` trên terminal:** Tải lại ứng dụng ngay lập tức (Reload JavaScript bundle).
- **Phím `m` trên terminal:** Bật/Tắt Menu nhà phát triển (Developer Menu).
- **Phím `c` trên terminal:** Xóa cache Metro và khởi động lại sạch sẽ.
- **Lắc nhẹ điện thoại (Shake Gesture):** Mở Developer Menu trên điện thoại để:
  - Bật / Tắt chế độ Fast Refresh.
  - Xem thông báo lỗi chi tiết (Show Inspector).

---

## 4. CHECKLIST KHẮC PHỤC CÁC SỰ CỐ THƯỜNG GẶP (TROUBLESHOOTING)

| Hiện tượng lỗi | Nguyên nhân | Cách xử lý tức thời |
|:---|:---|:---|
| **Lỗi `PSSecurityException` trên PowerShell** | Windows chặn chạy script `.ps1` | Chạy lệnh `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` hoặc dùng `npx.cmd` |
| **Quét mã QR nhưng báo "Could not connect to server"** | Mạng LAN bị chặn hoặc máy tính tắt mạng | Bật cờ `--tunnel`: `npx.cmd expo start --tunnel -c` |
| **Cảnh báo `@expo/ngrok` khi chạy `--tunnel` lần đầu** | Chưa có gói tạo tunnel | Nhấn phím `y` rồi gõ `Enter` để terminal tự cài đặt gói ngrok an toàn |
| **Cổng 8081 bị chiếm dụng** | Một tiến trình Node.js cũ chưa tắt | Expo sẽ tự hỏi: *"Port 8081 is being used, use another port?"* $\to$ Nhấn `Y` để chuyển sang cổng 8082 |
| **Giao diện trên điện thoại không cập nhật khi sửa code** | Mất kết nối Metro socket | Nhấn phím `r` trên terminal hoặc vuốt 3 ngón tay xuống trên màn hình điện thoại để reload |

---

## 5. CẤU TRÚC 4 TAB CHÍNH HIỂN THỊ TRÊN APP

Khi mở ứng dụng, thanh điều hướng dưới cùng (Bottom Tab Bar) gồm 4 tab tương ứng với 4 module cốt lõi của đồ án:

1. 🏸 **Kèo Đấu (`SCR-05`):** Sảnh chờ hiển thị các kèo mở tuyển tại Đà Nẵng (Sân Kỳ Đồng, Tuyên Sơn), số suất còn lại, dải trình độ, nút đặt suất.
2. 👥 **Tìm Bạn (`SCR-04`):** Gợi ý đồng đội bù trừ vị trí thi đấu (Lưới - Công, Trái - Phải), độ lệch Elo $\le 150$.
3. 📊 **Lịch Sử (`SCR-10` & `SCR-11`):** Lịch sử các set đấu đã đánh, tỷ số, biến động Elo từng trận và danh hiệu **Đồng đội ăn ý nhất** (Win Rate $\ge 60\%$).
4. 👤 **Cá Nhân (`SCR-03`):** Thẻ tay vợt thể thao (Player Card) hiển thị điểm Elo 1,601, độ uy tín 98/100, cấp độ TB+, tay thuận và vị trí sở trường.
