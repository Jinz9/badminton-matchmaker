# DANH MỤC MÀN HÌNH ỨNG DỤNG (APP SCREENS SPECIFICATION)

**Dự án:** Hệ thống ghép đội và cân bằng kèo cầu lông (Mobile App)  
**Tài liệu:** `docs/screens.md`  
**Phiên bản:** 1.0 (Bàn giao kỹ thuật cho TV2 dựng Prototype Figma - WBS 2.4)  
**Tác giả:** Đào Duy Nhật (TV1 - PM, BA, Backend & Thuật toán)  
**Người nhận bàn giao:** Nguyễn Đức Đạt (TV2 - UI/UX & Mobile Developer)  
**Tài liệu liên quan:** `docs/07-srs.md`, `docs/08-use-cases.md`, `docs/09-user-stories.md`  

---

## 1. QUY CHUẨN THIẾT KẾ UI/UX TẠI SÂN (COURT-READY UX PRINCIPLES)

Để TV2 thiết kế nguyên mẫu Figma đạt chuẩn vận hành thực tế tại các cụm sân cầu lông Đà Nẵng, toàn bộ màn hình phải tuân thủ nghiêm ngặt 4 nguyên tắc sau:
1. **Thiết kế một tay (One-thumb Zone):** Mọi nút bấm hành động chính (Primary CTA) như "Chia cặp", "Lưu điểm", "Duyệt", "Xin tham gia" phải nằm ở $1/3$ phía dưới màn hình, vừa tầm với của ngón tay cái mà không cần rướn tay hoặc dùng 2 tay.
2. **Kích thước vùng chạm tối thiểu:** Kích thước tương tác tối thiểu là **$48 \times 48\text{ dp}$** (đặc biệt là các nút bấm nhập điểm $+1 / -1$ và chọn người chơi), tránh bấm trượt khi tay ướt mồ hôi.
3. **Độ tương phản cao (High Contrast / Dark Mode):** Sử dụng nền tối (Dark Theme: Slate/Dark Navy) kết hợp với màu điểm nhấn tương phản mạnh (Xanh lá thể thao `#10B981`, Xanh Cyan `#06B6D4`, Cam cảnh báo `#F59E0B`, Đỏ `#EF4444`) để nhìn rõ dưới ánh đèn halogen/LED công suất lớn chói sáng của nhà thi đấu.
4. **Nhận diện bằng Chữ + Biểu tượng:** Không chỉ dùng màu sắc để phân biệt thể thức (Đôi nam, Đôi nữ, Đôi nam nữ) hay trạng thái (Đã duyệt, Chờ duyệt), luôn kết hợp icon và nhãn chữ rõ ràng (chuẩn WCAG Accessibility).

---

## 2. DANH SÁCH 13 MÀN HÌNH CHÍNH (MAIN SCREENS INVENTORY)

| Mã màn hình | Tên màn hình (Tiếng Việt & Code) | Mục đích nghiệp vụ | Yêu cầu chức năng (FR) | Gói WBS |
|---|---|---|---|:---:|
| **SCR-01** | **Đăng ký & Đăng nhập** (`AuthScreen`) | Xác thực người dùng bằng Google hoặc Email/Password | FR-01 | WBS 4.1 |
| **SCR-02** | **Khảo sát Onboarding Trình độ** (`OnboardingQuizScreen`) | Khảo sát 10 câu trắc nghiệm xác định Cấp độ (1–6) và Elo ban đầu | FR-02, FR-03 | WBS 4.1 |
| **SCR-03** | **Hồ sơ cá nhân & Player Card** (`ProfileScreen`) | Hiển thị thẻ người chơi, điểm Elo, điểm uy tín, tay thuận, lối chơi | FR-03, FR-04, FR-06 | WBS 4.1 |
| **SCR-04** | **Tìm đồng đội ăn ý** (`PartnerFinderScreen`) | Lọc và gợi ý các tay vợt bù trừ lối chơi, lệch $\le 150$ Elo | FR-07, FR-26 | WBS 4.2 |
| **SCR-05** | **Sảnh chờ & Danh sách kèo** (`SessionLobbyScreen`) | Lướt, tìm kiếm và lọc các kèo đang mở tuyển vãng lai tại Đà Nẵng | FR-16, FR-17 | WBS 4.3 |
| **SCR-06** | **Chi tiết phòng kèo** (`SessionDetailScreen`) | Xem chi tiết sân, danh sách người có mặt, gửi đơn xin hoặc vào Waitlist | FR-15, FR-18, FR-19, FR-20, FR-21 | WBS 4.3 |
| **SCR-07** | **Tạo & Cấu hình phòng kèo** (`CreateSessionScreen`) | Host tạo kèo 1–2 sân, chọn địa điểm sân Đà Nẵng, đặt dải trình độ | FR-14, FR-12 | WBS 4.3 |
| **SCR-08** | **Bàn điều khiển sân & Chia cặp** (`CourtBalancingScreen`) | Sơ đồ sân đấu 2 đội, nút chia cặp 1 chạm, hoán đổi thủ công, cặp khóa | FR-08, FR-09, FR-10, FR-11, FR-32, FR-33 | WBS 4.4a |
| **SCR-09** | **Nhập tỷ số & Chấm thẻ sau trận** (`ScoreReviewScreen`) | Nhập điểm set đấu nhanh, chấm 3 thẻ đánh giá bạn chơi trong 5 giây | FR-22, FR-23, FR-34 | WBS 4.4b |
| **SCR-10** | **Lịch sử thi đấu & Thống kê** (`MatchHistoryScreen`) | Xem chi tiết các set đấu đã đánh, tỷ số, biến động Elo từng trận | FR-24, FR-25, FR-27 | WBS 4.5 |
| **SCR-11** | **Danh sách Đồng đội ăn ý** (`BestPartnersScreen`) | Vinh danh bạn đánh đôi có tỷ lệ thắng $\ge 60\%$, nút mời đánh nhanh | FR-26 | WBS 4.5 |
| **SCR-12** | **Trung tâm thông báo** (`NotificationsScreen`) | Hiển thị thông báo duyệt đơn, đôn người từ waitlist, nhắc giờ thi đấu | FR-35 | WBS 4.3 |
| **SCR-13** | **Bảng Quản trị viên in-app** (`AdminDashboardScreen`) | Admin khóa tài khoản bùng kèo, duyệt hoàn uy tín, duyệt sân mới | FR-28, FR-29, FR-30, FR-31 | WBS 4.5 |

---

## 3. ĐẶC TẢ CHI TIẾT TỪNG MÀN HÌNH (DETAILED SCREEN SPECIFICATIONS)

---

### SCR-01: ĐĂNG KÝ & ĐĂNG NHẬP (`AuthScreen`)
- **Mục đích:** Xác thực danh tính người dùng khi bắt đầu sử dụng app.
- **Thành phần giao diện chính (UI Components):**
  - Logo ứng dụng: Hình ảnh vợt cầu lông cách điệu + Tên thương hiệu.
  - Nút lớn nổi bật: "Tiếp tục với Google" (Google Icon, nền trắng chữ đen, chiều cao $52\text{ dp}$).
  - Khung đăng nhập Email: Input Email, Input Mật khẩu (có icon ẩn/hiện mật khẩu).
  - Nút phụ: "Đăng nhập", "Đăng ký tài khoản mới", "Quên mật khẩu?".
- **Trạng thái UI (States):**
  - Mặc định / Đang tải (Spinner) / Báo lỗi (Đỏ: "Sai mật khẩu hoặc tài khoản chưa đăng ký").

---

### SCR-02: KHẢO SÁT ONBOARDING TRÌNH ĐỘ (`OnboardingQuizScreen`)
- **Mục đích:** Hướng dẫn người dùng mới thực hiện trắc nghiệm 10 câu để phân loại cấp độ.
- **Thành phần giao diện chính (UI Components):**
  - Thanh tiến trình ngang (Step 1/10 $\to$ 10/10) trên đầu màn hình.
  - Tiêu đề câu hỏi to, rõ ràng (ví dụ: *"Khi đối thủ đập cầu mạnh về phía bạn, bạn xử lý thế nào?"*).
  - 4 thẻ lựa chọn đáp án dạng nút bấm lớn xếp dọc ($A, B, C, D$):
    - Mỗi thẻ có văn bản mô tả cụ thể mức độ thuần thục.
    - Hiệu ứng chạm: Viền sáng đổi sang màu xanh lục khi được chọn.
  - Khung chọn nhanh thông số lối chơi (ở bước cuối):
    - Chọn tay thuận: 2 nút toggle "Tay Phải" / "Tay Trái".
    - Chọn vị trí: 3 nút icon "Chuyên lưới" / "Linh hoạt" / "Chuyên công sau".
    - Chọn Quận/Huyện quen thuộc tại Đà Nẵng (Dropdown / Chips chọn nhanh).
  - Nút "Tiếp tục" / "Hoàn thành" ghim cố định ở đáy màn hình (Bottom Sticky CTA).

---

### SCR-03: HỒ SƠ CÁ NHÂN & PLAYER CARD (`ProfileScreen`)
- **Mục đích:** Thể hiện "Căn cước công dân thể thao" của tay vợt.
- **Thành phần giao diện chính (UI Components):**
  - **Player Card trung tâm:**
    - Ảnh đại diện (Avatar), Tên hiển thị, Huy hiệu Cấp độ (Ví dụ: `Cấp 3: TB` hoặc `Cấp 4: TB+`).
    - Điểm Elo hiện tại (Ví dụ: `1,425 Elo`) kèm nhãn `Đang hiệu chỉnh` hoặc `Chính thức`.
    - Thanh đo Điểm uy tín ($0–100$) có màu sắc chỉ báo ($95/100$ - Rất uy tín).
  - **Hàng chỉ số thể thao:**
    - Chip thông số: `Tay Trái` | `Chuyên Lưới` | `Khu vực: Thanh Khê`.
  - **Thống kê tóm tắt:**
    - Tổng số trận đã đấu, Tỷ lệ thắng (Win rate %), Số lần được khen (Đúng trình: 12, Đánh hay: 5, Thái độ tốt: 18).
  - Nút bấm: "Chỉnh sửa hồ sơ", "Cài đặt VietQR", "Đăng xuất".

---

### SCR-04: TÌM ĐỒNG ĐỘI ĂN Ý (`PartnerFinderScreen`)
- **Mục đích:** Gợi ý danh sách các tay vợt bù trừ lối chơi và tương đương trình độ.
- **Thành phần giao diện chính (UI Components):**
  - Thanh lọc trên cùng: Chọn Quận/Huyện tại Đà Nẵng, Chọn thể thức (Đôi nam / Đôi nam nữ).
  - Danh sách thẻ người chơi (Card List):
    - Mỗi thẻ gồm: Avatar, Tên, Cấp độ, Điểm Elo, Chỉ số tương thích (Ví dụ: `95% Ăn ý` - Viền xanh lá).
    - Lý do bù trừ: Nhãn icon nhỏ (Ví dụ: `+40đ Bù trừ Lưới - Công`, `+25đ Cặp Trái - Phải`).
  - Nút hành động trên từng thẻ: "Xem hồ sơ" và "Rủ đánh chung" (Nút to ở góc phải thẻ).

---

### SCR-05: SẢNH CHỜ & DANH SÁCH KÈO (`SessionLobbyScreen`)
- **Mục đích:** Màn hình chính sau khi đăng nhập, hiển thị các buổi đánh đang mở tuyển vãng lai.
- **Thành phần giao diện chính (UI Components):**
  - Thanh tìm kiếm & Bộ lọc nhanh dạng thanh ngang (Horizontal Chips): "Hôm nay", "Ngày mai", "Hải Châu", "Thanh Khê", "Khớp trình độ tôi".
  - Danh sách thẻ kèo thi đấu (Session Cards):
    - Tiêu đề kèo (Ví dụ: *Kèo giao lưu buổi tối Sân Kỳ Đồng*).
    - Khung giờ: $18:00 - 20:00$ | Thứ Tư, 18/11.
    - Huy hiệu thể thức: `Đôi nam nữ (Mixed)` hoặc `Đôi nam (Men)`.
    - Huy hiệu số suất: **`Còn 2 suất`** (Màu xanh lục nổi bật) hoặc `Waitlist (Dự bị)`.
    - Dải trình độ yêu cầu: `Cấp 2 đến Cấp 4 (TB- đến TB+)`.
    - Avatar Host kèm Điểm uy tín của Host ($98/100$).
  - Nút Floating Action Button (FAB) tròn lớn ở góc dưới bên phải: Icon dấu `+` ("Tạo kèo mới" dành cho Host).

---

### SCR-06: CHI TIẾT PHÒNG KÈO (`SessionDetailScreen`)
- **Mục đích:** Nơi người chơi xem danh sách người có mặt, gửi đơn xin tham gia; Host duyệt người và quản lý suất.
- **Thành phần giao diện chính (UI Components):**
  - Header: Tên sân, Địa chỉ, Khung giờ, Chi phí chia sẻ tiền sân (50.000đ/người) kèm nút "Xem mã VietQR của Host".
  - Tab chuyển đổi sân (nếu kèo có 2 sân): `Sân 1 (Đôi nam nữ)` | `Sân 2 (Đôi nam)`.
  - Danh sách thành viên trong sân (Court Roster - Tối đa 8 người):
    - Phân nhóm rõ ràng: Nhóm Mặc định (`Core` / `Ghost`) và Nhóm Vãng lai (`Recruit`).
    - Mỗi dòng hiển thị: Avatar, Tên, Cấp độ, Tay thuận, Lối chơi, Biểu tượng ổ khóa (nếu cặp bị khóa).
  - Khu vực dành riêng cho Host:
    - Danh sách đơn xin tham gia (`Requested`): Hiển thị hồ sơ ứng viên kèm nút "Duyệt" (Xanh) và "Từ chối" (Đỏ).
    - Danh sách hàng đợi dự bị (`Waitlist`).
  - Khu vực dành cho Người chơi vãng lai (Bottom Bar cố định):
    - Nút lớn: **"Xin tham gia Sân 1"** (Nếu còn suất) hoặc **"Đăng ký vào Hàng đợi dự bị"** (Nếu đã đầy suất).
    - Nếu đã được duyệt: Nút "Hủy tham gia" (Kèm cảnh báo phạt uy tín).

---

### SCR-07: TẠO & CẤU HÌNH PHÒNG KÈO (`CreateSessionScreen`)
- **Mục đích:** Biểu mẫu cho Host khởi tạo buổi đánh mới.
- **Thành phần giao diện chính (UI Components):**
  - Input tiêu đề buổi đánh.
  - Ô chọn địa điểm: Input có gợi ý tự động (Autocomplete) các sân cầu nổi tiếng Đà Nẵng (Kỳ Đồng, Tuyên Sơn, Quân Khu 5, Trương Vĩnh Ký...).
  - Bộ chọn Ngày và Giờ (Date & Time Picker).
  - Chọn số sân: Radio Button "1 Sân" hoặc "2 Sân".
  - Khung cấu hình từng sân:
    - Thể thức: 3 nút chọn `Đôi nam` / `Đôi nữ` / `Đôi nam nữ`.
    - Dải trình độ: Slider 2 đầu chọn từ Cấp $X$ đến Cấp $Y$ (hoặc 2 dropdown).
  - Ô nhập chi phí ước tính mỗi người (VNĐ).
  - Nút lớn ở đáy: "Khởi tạo phòng kèo" (Bottom Sticky CTA).

---

### SCR-08: BÀN ĐIỀU KHIỂN SÂN & CHIA CẶP TẠI SÂN (`CourtBalancingScreen`)
- **Mục đích:** Màn hình cốt lõi của Host tại sân - chia cặp cân kèo trong 3 chạm và dưới 1 giây.
- **Thành phần giao diện chính (UI Components):**
  - **Sơ đồ sân đấu trực quan (Court Visualizer):**
    - Đồ họa mô phỏng thảm sân cầu lông góc nhìn từ trên xuống (Top-down view).
    - **Nửa sân trên (Đội 1):** 2 ô vị trí chứa 2 thẻ người chơi (Avatar, Tên, Cấp) + Tổng Elo Đội 1.
    - **Nửa sân dưới (Đội 2):** 2 ô vị trí chứa 2 thẻ người chơi (Avatar, Tên, Cấp) + Tổng Elo Đội 2.
    - Chỉ báo cân bằng: $\Delta \text{Elo} = |\text{Elo}_1 - \text{Elo}_2|$ (Xanh: Cân bằng $\le 50$; Vàng: Tương đối $\le 100$; Đỏ: Lệch $> 100$).
  - **Khu vực hàng ghế nghỉ (Resting Bench):**
    - Hàng ngang chứa các thẻ người chơi đang nghỉ xoay vòng trong set này.
  - **Thao tác thủ công (Manual Swap):**
    - Bấm chạm vào 1 người trên sân rồi chạm vào 1 người ở đội khác hoặc người đang nghỉ để hoán đổi tức thời.
    - Biểu tượng ổ khóa ở giữa 2 người cùng đội để bật/tắt cặp khóa (`isLocked`).
  - **Cụm nút điều khiển đáy màn hình (Bottom Thumb Zone):**
    - Nút lớn trung tâm: **"CHIA CẶP TỰ ĐỘNG"** (Màu xanh lục, nổi bật nhất).
    - Nút phụ bên cạnh: "Bắt đầu set" hoặc "Chuyển sang Sân 2".
    - Biểu tượng chỉ báo trạng thái mạng: Icon Online (Xanh) hoặc Offline (Cam - "Đang chạy ngoại tuyến").

---

### SCR-09: NHẬP TỶ SỐ & CHẤM THẺ SAU TRẬN (`ScoreReviewScreen`)
- **Mục đích:** Ghi nhận tỷ số set đấu và đánh giá nhanh bạn chơi trong 5 giây.
- **Thành phần giao diện chính (UI Components):**
  - Khung nhập tỷ số lớn:
    - Đội 1 (Xanh) vs Đội 2 (Đỏ).
    - Nút bấm tăng giảm $+1 / -1$ to bản ($60 \times 60\text{ dp}$) cho mỗi đội, hoặc gõ trực tiếp vào ô số điểm (ví dụ $21 - 18$).
  - Nút "Lưu kết quả set đấu".
  - **Bảng pop-up chấm thẻ nhanh 5 giây (Post-match Review):**
    - Danh sách 3 bạn chơi cùng trận.
    - Dưới mỗi người có 3 nút icon 1 chạm:
      - 🟢 **Đúng trình** (Thẻ xanh lá).
      - 🔵 **Đánh hay** (Thẻ xanh dương).
      - ⭐ **Thái độ tốt** (Thẻ vàng sao).
    - Nút nhỏ góc dưới: "Báo cáo khai ảo / Bùng kèo" (Màu xám/đỏ).
    - Nút "Xong & Sang set tiếp theo" (Tự động đóng sau 5 giây nếu không chọn).

---

### SCR-10: LỊCH SỬ THI ĐẤU & THỐNG KÊ (`MatchHistoryScreen`)
- **Mục đích:** Người chơi xem lại toàn bộ các buổi đánh và các trận đấu trong quá khứ.
- **Thành phần giao diện chính (UI Components):**
  - Bộ lọc: "Tất cả", "Trận thắng", "Trận thua".
  - Thẻ trận đấu (Match Card):
    - Ngày đánh, Tên sân, Buổi sáng/tối.
    - Cặp đôi của tôi vs Cặp đối thủ.
    - Tỷ số set: Ví dụ `21 - 19, 18 - 21, 21 - 15` (Nhãn `THẮNG` viền xanh hoặc `THUA` viền đỏ).
    - Biến động Elo hiển thị to rõ: `+16 Elo` (Xanh lá) hoặc `-12 Elo` (Đỏ).

---

### SCR-11: DANH SÁCH ĐỒNG ĐỘI ĂN Ý (`BestPartnersScreen`)
- **Mục đích:** Thống kê và kết nối lại với những tay vợt đánh hợp cạ nhất.
- **Thành phần giao diện chính (UI Components):**
  - Tiêu chí xét duyệt hiển thị rõ ở đầu trang: "Đánh cùng nhau $\ge 3$ trận và Tỷ lệ thắng $\ge 60\%$".
  - Danh sách thẻ Bạn ăn ý:
    - Avatar, Tên, Cấp độ hiện tại.
    - Huy hiệu tỷ lệ thắng: `Thắng 80% (4/5 trận)` - Viền vàng nổi bật.
    - Nút bấm nhanh: "Mời vào kèo mới".

---

### SCR-12: TRUNG TÂM THÔNG BÁO (`NotificationsScreen`)
- **Mục đích:** Quản lý toàn bộ thông báo hệ thống và sự kiện kèo cầu.
- **Thành phần giao diện chính (UI Components):**
  - Danh sách thông báo theo thứ tự thời gian:
    - 🔔 *Được duyệt:* "Host Nam đã duyệt bạn vào Sân 1 - Sân Kỳ Đồng lúc 18:00".
    - 🚀 *Đôn người:* "Tin vui! Bạn đã được đôn từ dự bị lên suất chính thức Sân 2!".
    - ⏰ *Nhắc giờ:* "Còn 1 tiếng nữa là đến giờ đánh tại Sân Tuyên Sơn. Chuẩn bị nhé!".
    - ⚠️ *Cảnh báo uy tín:* "Bạn bị trừ 5 điểm uy tín do hủy kèo trước 2 giờ".
  - Chạm vào thông báo để chuyển thẳng tới phòng kèo tương ứng.

---

### SCR-13: BẢNG QUẢN TRỊ VIÊN IN-APP (`AdminDashboardScreen`)
- **Mục đích:** Phân hệ quản trị dành riêng cho tài khoản có `role: "admin"`.
- **Thành phần giao diện chính (UI Components):**
  - Chỉ số tổng quan (KPI Cards): Tổng số người dùng tại Đà Nẵng, Số kèo đang mở hôm nay, Số báo cáo bùng kèo cần xử lý.
  - Tab 1: **Xử lý vi phạm:** Danh sách người dùng bị báo cáo $\to$ Nút "Khóa 30 ngày", "Khóa vĩnh viễn", "Bỏ qua".
  - Tab 2: **Giải quyết khiếu nại:** Danh sách đơn xin hoàn uy tín $\to$ Xem ảnh minh chứng $\to$ Nút "Hoàn lại uy tín".
  - Tab 3: **Duyệt sân mới:** Danh sách địa điểm sân do cộng đồng gửi lên $\to$ Nút "Duyệt đưa vào danh mục".

---

## 4. BẢNG CHECKLIST BÀN GIAO CHO TV2 (FIGMA DESIGN CHECKLIST)

Khi thiết kế file Figma, TV2 cần đánh dấu hoàn thành cho từng màn hình và trạng thái:

- [ ] **SCR-01 AuthScreen:** Đủ 2 luồng Google Sign-In và Email; có trạng thái lỗi sai mật khẩu.
- [ ] **SCR-02 OnboardingQuizScreen:** Thiết kế đủ 10 câu hỏi trắc nghiệm, thanh tiến trình, và bước chọn lối chơi/tay thuận.
- [ ] **SCR-03 ProfileScreen:** Player Card có cấp độ phong trào Đà Nẵng, thanh đo uy tín, và huy hiệu khen thưởng.
- [ ] **SCR-04 PartnerFinderScreen:** Thẻ ứng viên có điểm tương thích %, nhãn bù trừ lối chơi Lưới/Công.
- [ ] **SCR-05 SessionLobbyScreen:** Danh sách kèo hiển thị số suất trống, thể thức, FAB tạo kèo to ở đáy.
- [ ] **SCR-06 SessionDetailScreen:** Roster hiển thị rõ người mặc định/vãng lai/ghost, nút xin tham gia / waitlist.
- [ ] **SCR-07 CreateSessionScreen:** Form tạo kèo 1–2 sân, chọn địa điểm sân Đà Nẵng, chọn dải cấp độ.
- [ ] **SCR-08 CourtBalancingScreen:** Sơ đồ sân đấu 2 đội, hàng ghế nghỉ, nút CHIA CẶP TỰ ĐỘNG cực to ở Thumb Zone, icon cặp khóa.
- [ ] **SCR-09 ScoreReviewScreen:** Bàn phím số / nút $+1/-1$ to bản, pop-up chấm thẻ 3 icon nhanh trong 5 giây.
- [ ] **SCR-10 MatchHistoryScreen:** Lịch sử set đấu, tỷ số, chỉ số tăng/giảm Elo xanh/đỏ rõ ràng.
- [ ] **SCR-11 BestPartnersScreen:** Danh sách bạn ăn ý có tỷ lệ thắng $\ge 60\%$.
- [ ] **SCR-12 NotificationsScreen:** Danh sách thông báo chia loại rõ ràng (duyệt, đôn, phạt, nhắc giờ).
- [ ] **SCR-13 AdminDashboardScreen:** Màn hình quản trị in-app (khóa user, hoàn uy tín, duyệt sân).
