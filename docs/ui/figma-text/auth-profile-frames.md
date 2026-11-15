# NỘI DUNG CHỮ TRÍCH TỪ FIGMA — NHÓM XÁC THỰC & HỒ SƠ

**File Figma:** `tlSBaqyisLDYJerlkRLlHq` — trang `0:1`
**Cách thu thập:** Subagent trình duyệt mở Figma ở **chế độ khách (chỉ xem)**, zoom 100%, chép lại từng dòng chữ hiển thị. Figma MCP bị giới hạn gói Starter nên không dùng được `get_screenshot` / `get_design_context`; chế độ khách khóa Inspect nên **không đọc được mã HEX/font nguyên bản** (chỉ quan sát trực quan, màu dùng lại bảng đã đo ở `docs/ui/design-tokens.md`).
**Ảnh chụp gốc (đường dẫn trong thư mục brain của subagent `5f645e2a…`):** `.system_generated/steps/117` (25), `153` (26–28), `174` (21), `202` (23), `222` (09).

> Ghi chú: các mục đánh dấu **[LỆCH]** là chỗ bản dựng cố ý khác Figma theo quyết định đã duyệt (ADR-002, FIG-03, FIG-04, luật nghiệp vụ). Chi tiết ở `docs/ui/ui-diff.md` mục "Xác thực & Hồ sơ".

---

## 25 — Đăng Nhập VĐV SmashCourt (`5:997`)
- Header: `←` | `SMASHCOURT DN` | avatar tròn xanh neon.
- Hero: badge `HỆ THỐNG GIẢI ĐẤU & KÈO ĐẤU ĐÀ NẴNG`; tiêu đề `CHÀO MỪNG VĐV` / `TRỞ LẠI SÂN ĐẤU`; mô tả `Đăng nhập để vào sân ghi điểm Elo, ghép kèo giao hữu và nạp quỹ cầu thi đấu tức thì.` **[LỆCH: "nạp quỹ cầu" thuộc P2]**
- Status bar: `● 12 SÂN ĐANG TRANH TÀI` | `Cụm Tiên Sơn • QK5` **[LỆCH: số liệu giả, bỏ]**
- Form: `SỐ ĐIỆN THOẠI / EMAIL VĐV` (`bắt buộc`), placeholder `0905 123 456 hoặc name@clb.vn` **[LỆCH: chỉ email — ADR-002]**; `MẬT KHẨU SÂN` (`6+ ký tự`); checkbox `Ghi nhớ đăng nhập`; link `QUÊN MẬT KHẨU?`; nút `ĐĂNG NHẬP VÀO SÂN →`.
- Divider `HOẶC ĐĂNG NHẬP NHANH VỚI`; nút `Zalo CLB` | `Apple ID` **[LỆCH: thay bằng `Tiếp tục với Google` theo ADR-002]**.
- Card `Quét Mã Tại Sân` (QR check-in) **[LỆCH: ngoài SRS, bỏ]**; Live check-in `14 VĐV Vừa Check-in` **[bỏ: dữ liệu giả]**.
- Footer: `Chưa có tài khoản VĐV?` `ĐĂNG KÝ THÀNH VIÊN MỚI NGAY`; `BWF Grade Sync • Đà Nẵng Badminton Hub`.

## 26 — Đăng Ký Tài Khoản VĐV Mới (`5:1153`)
- Badge `● GIA NHẬP CỘNG ĐỒNG CẦU LÔNG ĐÀ NẴNG`; tiêu đề `Tạo Tài Khoản VĐV Mới`.
- Mô tả: `Nhận ngay mức Elo xuất phát 1000 và đặc quyền ghép sân tự động tại 24+ cụm sân Đà Nẵng.` **[LỆCH: Elo xuất phát do 10 câu trắc nghiệm quyết định, không cố định 1000]**
- Step track: `Bước 1/2: Thông tin đăng ký` | `TIẾP: CHỌN TRÌNH ĐỘ`.
- `HỌ VÀ TÊN VĐV` (`Bắt buộc`, `vd: Nguyễn Hoàng Anh`); `SỐ ĐIỆN THOẠI (ZALO NHẬN OTP)` (`+84 ⌄`, `0905 xxx xxx`) **[LỆCH: SĐT tùy chọn, không dùng đăng nhập — ADR-002; thêm ô Email bắt buộc]**; `MẬT KHẨU MỚI` (`Tối thiểu 8 ký tự`) **[LỆCH: tối thiểu 6 ký tự theo Firebase/`auth-profile.md`]**; thanh `✓ Độ bảo mật: Tốt`; `MÃ GIỚI THIỆU / CLB` + `⚡ Tặng +20 Elo` **[LỆCH: bỏ — Elo chỉ đổi theo luật Elo/trận]**.
- Checkbox điều khoản: `Tôi đồng ý với Điều Khoản VĐV, Quy Chuẩn Tính Điểm Elo BWF và Cam Kết Tinh Thần Fair-Play không tiêu cực trên sân thi đấu SmashCourt.`
- Nút `TIẾP TỤC & NHẬN MÃ OTP →`; divider `HOẶC ĐĂNG KÝ NHANH`; `Đăng ký nhanh liên kết tài khoản Zalo` **[LỆCH: bỏ Zalo — FIG-04]**; `Xác Thực Chuẩn VĐV SmashCourt`; footer `Đã có tài khoản VĐV? ĐĂNG NHẬP NGAY`.

## 27 — Xác Thực OTP Kích Hoạt Tài Khoản (`5:1308`)
- Badge `● BẢO MẬT HÀNG ĐẦU ĐÀ NẴNG`; tiêu đề `Xác Thực Mã OTP`; mô tả `Mã bảo mật gồm 6 chữ số đã được gửi qua tin nhắn Zalo / SMS đến số:` **[LỆCH: gửi tới email — OTP giả lập, chờ ADR-002]**; pill `+84 905 123 456` + link `ĐỔI SỐ`.
- 6 ô OTP; `Gửi lại mã sau: 00:45`; `GỬI LẠI QUA ZALO` • `GỌI ĐỌC MÃ` **[LỆCH: chỉ giữ gửi lại]**.
- Cảnh báo `LƯU Ý TRỌNG TÀI SÂN SMASH`: `Mã OTP bảo vệ tài khoản điểm Elo và số dư Quỹ Cầu của bạn. Tuyệt đối không chia sẻ mã này cho bất kỳ ai kể cả trọng tài sân.` **[bỏ "số dư Quỹ Cầu" (P2)]**
- Nút `XÁC NHẬN & VÀO BƯỚC CÂN TRÌNH ELO →`; bàn phím số `1-9`, `XÓA HẾT`, `0`, `⌫`.

## 28 — Khôi Phục Mật Khẩu & Tài Khoản VĐV (`5:1437`)
- Badge `● HỆ THỐNG VĐV ĐÀ NẴNG`; tiêu đề `KHÔI PHỤC MẬT KHẨU`; mô tả `Nhập số điện thoại hoặc email đã đăng ký để nhận liên kết đặt lại mật khẩu và bảo lưu toàn bộ lịch sử Elo VĐV.`
- Tab: `Số ĐT / Zalo` (active) | `Email Đã Đăng Ký` **[LỆCH: Email là tab hoạt động, tab SĐT bị khóa]**.
- Input `SỐ ĐIỆN THOẠI VĐV` + `✓ Hợp lệ trên hệ thống`.
- Card `● HỒ SƠ NHẬN DIỆN TỰ ĐỘNG` (`MÃ: #DN-8842`, tên, `1,540 Elo`, `CLB Tiên Sơn Đà Nẵng`) + `✓ Tài khoản đã xác thực cấp độ thi đấu. Bạn sẽ nhận mã OTP bảo mật đặt lại mật khẩu và giữ nguyên điểm thi đấu.` **[LỆCH: chỉ hiện email đã che + tên; không lộ Elo]**
- Nút `GỬI MÃ KHÔI PHỤC QUA ZALO / SMS` **[LỆCH: qua email]**; card `Không thể truy cập số điện thoại cũ?` ...; footer `← Quay lại Đăng nhập`.

## 21 — Đăng Nhập & Khởi Tạo Elo Ban Đầu (`5:268`)
- Header `ONBOARDING ĐĂNG KÝ`; badge `● SMASHCOURT ĐÀ NẴNG • HỆ THỐNG VĐV`; tiêu đề `Khởi Tạo Hồ Sơ & Cân Trình Elo`; mô tả `Điền thông tin và tự đánh giá kinh nghiệm để nhận điểm Elo xuất phát phù hợp với các cụm sân Tiên Sơn, Quân Khu 5.`
- Card avatar `Ảnh đại diện thẻ VĐV` / `Hiển thị trên bảng điểm LED & Livescore` + `CHỌN FILE ẢNH` **[LỆCH: avatar chữ cái theo yêu cầu, không upload]**.
- `HỌ VÀ TÊN VĐV`; `SỐ ĐIỆN THOẠI / ZALO KẾT NỐI`; `TAY THUẬN` (`Tay Phải`); `VỢT CHÍNH` (`Astrox 88D`) **[bỏ: không có trong Data Contract]**.
- `Mức Độ Kinh Nghiệm & Trình Cầu` — 4 thẻ Elo: `Hạng Yếu / Mới Chơi (Novice)` 1,000; `Hạng Trung Bình Yếu` 1,250 (`PHỔ BIẾN NHẤT`); `Hạng Trung Bình Khá (Intermediate+)` 1,450; `Hạng Khá / Bán Chuyên (Advanced)` 1,650 **[LỆCH — FIG-03: thay bằng 10 câu trắc nghiệm + thang 6 cấp]**.
- `Cụm Sân Sinh Hoạt Chính Tại Đà Nẵng` (chips `Sân Tiên Sơn`, `Sân Quân Khu 5`, `Sân Sông Hàn`, `Sân Kỳ Đồng`, `Sân Thanh Khê`) **[LỆCH: dùng 7 quận/huyện từ `districts.ts`]**.
- Banner `Fair-Play K-Factor` (cơ chế Elo minh bạch) → giữ dạng giải thích giai đoạn hiệu chỉnh (K=40, 5 trận).
- Nút `HOÀN TẤT & VÀO SÂN ĐẤU BWF`.

## 23 — Cài Đặt Ứng Dụng & Tài Khoản Cá Nhân (`5:483`, phần Mini Profile + Logout)
- Header `CÀI ĐẶT ỨNG DỤNG TÀI KHOẢN CÁ NHÂN`; Mini Profile: avatar + badge `VIP`, `Hoàng Anh (Smash Master)`, `#DN-8842 • Tiên Sơn Arena`, `1,540 Elo • Hạng B+ Đà Nẵng`, nút `CHỈNH SỬA HỒ SƠ VĐV`.
- Cuối trang: nút viền đỏ `ĐĂNG XUẤT TÀI KHOẢN`; footer `CLB Cầu Lông Tiên Sơn • SmashCourt Đà Nẵng Platform`.

## 09 — tổng quan / Hồ sơ VĐV (`9:1903`, phần Passport + Snapshot)
- Header `CLB CẦU LÔNG TIÊN SƠN • ĐÀ NẴNG`.
- Passport: avatar chữ `HN`; `Hoàng Nam`; badge `#1 TIÊN SƠN`; `TOP 1% CLB`; `1,520` `+45`; `HẠNG: KHÁ (BWF TIER B)`; `Sân Tiên Sơn • 28T • Tay Phải`; chips `Yonex Astrox 88D Pro`, `Đôi Nam & Đôi Nam Nữ`, `● Sẵn Sàng Đấu Sân Số 1`.
- Snapshot 3 ô: `TỶ LỆ THẮNG 75%` (`18W - 6L (Streak 4)`), `CÀY ẢI 42 Set`, `SMASH KỶ LỤC 312 km/h` **[LỆCH: ô thứ 3 (Smash/IoT) thuộc P2 → thay bằng `ĐỘ UY TÍN`; ô 2 thay bằng `SỐ TRẬN`]**.
- Khối `Phân Hệ Thống Kê Chuyên Sâu` M13–M16 + radar 5 trục: ngoài phạm vi màn Hồ sơ MVP (P1/P2).

