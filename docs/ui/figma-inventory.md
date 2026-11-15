# KIỂM KÊ THIẾT KẾ FIGMA (FIGMA INVENTORY)
**File Figma:** `tlSBaqyisLDYJerlkRLlHq` — Trang `0:1` (`Page 1`)  
**Người thực hiện:** Trợ lý kỹ thuật TV2 (QA Lead, UI/UX, Mobile Developer)  
**Ngày kiểm kê:** 2026-11-15  
**Nhánh Git:** `docs/tv2-figma-inventory`  
**Nguồn dữ liệu:** Đọc trực tiếp cấu trúc cây node qua Figma MCP `get_metadata(fileKey="tlSBaqyisLDYJerlkRLlHq", nodeId="0:1")` (tổng cộng **28 frame cấp cao nhất** chia thành 3 hàng trên canvas).

---

## 1. BẢNG KIỂM KÊ TOÀN BỘ 28 FRAME TRÊN TRANG `0:1`

> **Quy ước ưu tiên:**
> - **P0 (Bắt buộc cho MVP & Demo):** Đăng nhập/đăng ký, khai báo trình độ, hồ sơ, luồng tại sân 01–04, danh sách & chi tiết kèo, tạo kèo.
> - **P1 (Hoàn thiện trải nghiệm MVP):** Tìm đồng đội, lịch sử, thống kê, đồng đội ăn ý, thông báo, bảng xếp hạng.
> - **P2 (Ngoài phạm vi MVP):** Thanh toán/quyết toán quỹ cầu, giải đấu, đồng bộ đồng hồ thông minh, phân tích heatmap/nhịp tim, trung tâm trợ giúp sâu, các màn không có trong SRS.

### Hàng 1 (`y = -2836`): Xác thực, Onboarding, Cài đặt, Trợ giúp & Thông báo (8 frames)

| Mã | Tên đúng trong Figma | Node ID | Kích thước | Nhóm | Phần tử chính (từ metadata) | Trạng thái thể hiện | FR / WBS / SCR | Ưu tiên |
|---|---|---|---|---|---|---|---|:---:|
| **S01** | `22 - Trung Tâm Thông Báo & Lời Mời Ghép Trận Live` | `5:2` | `390×1608` | Thông báo | Top Tactical Quick Bar (`358×36`), Horizontal Scrollable Tabs (`108×34`..`161×34`), Section 1 Lời mời ghép trận (`Match Card 1: Urgent On-Court Doubles Match`, `Match Card 2: Solo 1v1 Ranked Challenge`), Section 2 Biến động Elo & Kết quả, Section 3 Thông báo quỹ cầu & sân bãi | Có tab lọc, thẻ lời mời live, thẻ kết quả | FR-35 / WBS 4.3 / `SCR-12` *(1 phần P2 vì có 1v1 & quỹ cầu)* | **P1** *(cắt 1v1 & quỹ)* |
| **S02** | `21 - Đăng Nhập & Khởi Tạo Elo Ban Đầu` | `5:268` | `390×1611` | Xác thực / Onboarding | Header, Profile Creation Card (`Avatar Upload Picker 326×80`, `Inputs Group`), `Interactive Skill & Elo Level Selector` (`4 Elo Option Cards`), `Home Badminton Club Selection` (Quick Club Chips), `Fair-Play K-Factor Banner`, `Sticky Thumb-Zone Bottom Action Dock` (`Primary Big Action Button 358×56`) | Idle / Đang chọn cấp độ | FR-02, FR-03 / WBS 4.1 / `SCR-02` *(lệch số cấp & không có 10 câu hỏi)* | **P0** |
| **S03** | `23 - Cài Đặt Ứng Dụng & Tài Khoản Cá Nhân` | `5:483` | `390×1659` | Hồ sơ / Cài đặt | `Section - Mini Profile Card` (`Avatar with VIP Badge 64×64`, `Edit Profile Action Button 326×44`), Section 1 On-Court Preferences, Section 2 Privacy & Analytics Visibility, Section 3 Hardware & Payment Integration, Section 4 System & Club Support, Section 5 Logout Action & Legal Note | Mặc định / Toggle cài đặt | FR-06 / WBS 4.1 / `SCR-03` (mở rộng) | **P1** |
| **S04** | `24 - Trung Tâm Trợ Giúp & Hướng Dẫn Elo` | `5:729` | `400×2359` | Khác | Header + `Search Input (56px)`, `Hotline BQL Tiên Sơn Card`, `4 Lối Tắt Thao Tác Nhanh (Bento Grid)`, `Cẩm Nang Cơ Chế Tính Điểm Elo (Accordion)`, `FAQ List`, `Form Gửi Yêu Cầu Hỗ Trợ` | Mặc định / Accordion | Ngoài SRS MVP | **P2** |
| **S05** | `25 - Đăng Nhập VĐV SmashCourt` | `5:997` | `390×1066` | Xác thực | Ambient Court Glow, `Mini Court Status Pulse Banner`, `Identifier Field (56px)`, `Password Field (56px)`, `Remember Me & Forgot Password Row`, `Main CTA: Sweat-Safe Sign-in Button (358×56)` | Mặc định *(chưa thấy rõ lỗi/loading từ metadata)* | FR-01 / WBS 4.1 / `SCR-01` | **P0** |
| **S06** | `26 - Đăng Ký Tài Khoản VĐV Mới` | `5:1153` | `390×1162` | Xác thực | `Header / Tactical Entry Badge`, `Step Track / On-Court Progress`, `Input 1: Full Name`, `Input 2: Phone with Dial Code`, `Input 3: Password + Strength Indicator`, `Input 4: Referral / Club Code`, `Terms & Fair-play Consent Checkbox`, `Primary Action 56px`, `Alternative Auth: Zalo Integration (358×56)` | Mặc định / Nhập liệu | FR-01 / WBS 4.1 / `SCR-01` *(dùng SĐT + Zalo thay vì Google/Email)* | **P0** |
| **S07** | `27 - Xác Thực OTP Kích Hoạt Tài Khoản` | `5:1308` | `390×948` | Xác thực | `Status Chip & Visual Hero Badge`, `Phone Number Badge with Edit Option`, `6-Digit OTP Interactive Boxes`, `Countdown & Resend Options`, `On-Court Safety Warning Card`, `Primary Athletic Confirm CTA (358×56)`, `Numeric Keypad (114×56)` | Đang nhập OTP / Đếm ngược | Ngoài quyết định `ADR-002` (đã bỏ Phone OTP) | **P2** *(cần chốt bỏ)* |
| **S08** | `28 - Khôi Phục Mật Khẩu & Tài Khoản VĐV` | `5:1437` | `390×1076` | Xác thực | `Glowing Restoration Emblem & Header`, `Recovery Mode Segmented Tabs (168×46, 170×46)`, `Input Form Module`, `Account Preview / Live Identity Verification Card`, `Primary Athletic Action Button (358×56)` | Chọn tab khôi phục / Xác minh | FR-01 (Quên mật khẩu) / WBS 4.1 / `SCR-01` | **P0** |

### Hàng 2 (`y = -3`): Luồng tại sân 01–04, Tài chính, BXH, Sơ đồ sân, Hồ sơ & Tạo kèo (12 frames)

| Mã | Tên đúng trong Figma | Node ID | Kích thước | Nhóm | Phần tử chính (từ metadata) | Trạng thái thể hiện | FR / WBS / SCR | Ưu tiên |
|---|---|---|---|---|---|---|---|:---:|
| **S09** | `01 - Home Sân Đấu (Chạm 1)` | `1:3099` | `390×922` | Tại sân | Header `Sân Cầu Lông Tiên Sơn - Đà Nẵng (64px)`, `Layer 1: Header Thong Tin Keo Context`, `Card Sân 01 (Đang Trống - CTA Chạm 1, nút 326×58)`, `Card Sân 02 (Đang Thi Đấu, Match Roster & Live Score)`, `Layer 3: Bottom Hang Doi Cho` (`6 Priority Players Quick Selector Chips`) | Sân trống (Empty State) + Sân đang đấu + Hàng đợi | FR-08, FR-10, FR-12 / WBS 4.4a / `SCR-08` | **P0** |
| **S10** | `02 - Chọn Người & Cân Trình (Chạm 2)` | `1:2724` | `390×927` | Tại sân | Header + `Quay lại (44×44)`, `Progress Bar (Chạm 2 / 3 Chạm)`, `Top Hero Visual`, `Section 1: Top_Preview_4_Slot` (4 ô chọn sẵn), `Live Balance Meter`, `Section 2: Grid_Chon_Nhanh_Ngon_Cai` (6 nút chọn lớn `>= 80×64px`), `Coordinator Tactile Notes Pill`, `Bottom_Action_Dock` (`Massive Neon CTA Button 358×58`) *(ghi chú đề bài có modal hồ sơ)* | Đang chọn người / Live balance preview | FR-08, FR-09, FR-11 / WBS 4.4a / `SCR-08` | **P0** |
| **S11** | `03 - Xác Nhận Kèo Cân Bằng (Chạm 3)` | `1:3440` | `390×883` | Tại sân | `LAYER 1: Header_Ket_Qua` (`Badge Thuat Toan Toi Uu`, `Ty Le Du Doan & Metric Balance`, `Mini Progress Gauge`), `LAYER 2: Doi_A_Card (Electric Cyan Deck)`, `LAYER 3: Divider VS_Icon_Swap` (nút đổi chéo), `LAYER 4: Doi_B_Card (Kinetic Amber / Coral Neon Deck)`, `Realtime Venue & Court Dispatch Status Pill`, `Bottom_Confirm_Dock`: `Vao San Ngay [Cham 3] (358×58)` + `Xao Lai Doi Hinh Khac (358×52)` | Xác nhận / Hoán đổi chéo | FR-08, FR-11 / WBS 4.4a / `SCR-08` | **P0** |
| **S12** | `04 - Chấm Điểm & Kết Thúc Trận` | `1:3306` | `390×884` | Tại sân | Header `Sân Cầu Lông Tiên Sơn (64px)`, `Layer 1: Header Sân 01 Live & Match Meta`, `Matchup Lineup Card`, `Layer 2: Bảng Điểm Lớn 1 Tay` (`Touch Area Đội A 173×256` & `Touch Area Đội B 173×256`), `Layer 3: Thanh Công Cụ Nhanh` (`Hoàn Tác Điểm 166×56`, `Đổi Cầu Mới 170×56`, `Shuttle Tracker Pill`), `Layer 4: Button CTA End (KẾT THÚC & TRẢ SÂN 358×56)` | Đang chấm điểm trực tiếp *(chưa có pop-up 3 thẻ đánh giá 5 giây)* | FR-22, FR-33 / WBS 4.4b / `SCR-09` | **P0** |
| **S13** | `06 - Mã QR Thanh Toán Nhanh VietQR` | `1:3606` | `390×1142` | Khác | `Tactical Header Bar`, `Cost Breakdown Segment`, `High-Contrast VietQR Module` (`Club Badge & Bank ID`, `Amount Hero Badge`, `Transfer Message`, `VietQR Frame 300×306`), `Button Neon Lime (358×58)` + `Cash Confirmation Alternative (358×56)` | Hiển thị mã QR / Chờ xác nhận | Ngoài phạm vi MVP chính (A8 chỉ cho xem VietQR đơn giản trong phòng kèo) | **P2** *(cần hỏi)* |
| **S14** | `05 - Quản Lý Thu Tiền & Quỹ Cầu` | `1:3901` | `390×1460` | Khác | `Split Mode Selector`, `Top Session Summary Card`, `Visual Live Collection Gauge` (`Neon Segmented Progress Bar`), `Member Payment List` (Paid VietQR, Paid Bank Transfer, Unpaid Quick Action Card, Unpaid Waiting QR), `Sticky Bottom Command Dock` | Theo dõi thu tiền từng người | Ngoài phạm vi MVP (`badminton-domain-rules` mục 5: Không thanh toán/chia tiền sân) | **P2** *(bỏ / cần chốt)* |
| **S15** | `07 - Bảng Xếp Hạng Elo CLB` | `1:4175` | `390×1262` | Thống kê | `Title & Monthly Season Banner`, `Tactical Category Pill Filters`, `Quick Club Stats Row`, `Top 3 Podium Layout`, `Leaderboard List Section` (`4: Thảo Vy Current User Focus`) | Mặc định / Lọc theo thể thức | Không có FR riêng trong SRS (bổ trợ cộng đồng) | **P1** *(hoặc P2)* |
| **S16** | `08 - Sơ Đồ Trực Tiếp 4 Sân Đấu` | `1:4473` | `390×1702` | Tại sân | `Top Match Session Tactical Strip`, `High Velocity Live Metrics Banner`, `Interactive 4-Court Badminton Grid` (`SÂN 01 ĐANG TRỐNG`, `SÂN 02 ĐANG THI ĐẤU 18-15`, `SÂN 03 MATCH POINT 20-19`, ... nút `56px`) | Trống / Đang đấu / Match Point | **TRÁI LUẬT R2 / CR-01** (hiện 4 sân thay vì tối đa 2 sân) | **P2** *(hoặc sửa về 2 sân)* |
| **S17** | `09 - tổng quan` | `9:1903` | `390×1694` | Hồ sơ | `TOP ATHLETE PASSPORT BANNER` (Avatar, Rank, Live Status, Gear & Tags), `ATHLETE QUICK SNAPSHOT (3 Tiles: Winrate, Monthly Workload, Smash Velocity)`, `HUB & SPOKE DEEP DIVE NAVIGATION (4 Portals)`, `BWF RADAR & 5-AXIS ATHLETE SKILL DIAGRAM` | Mặc định | FR-04 / WBS 4.1 / `SCR-03` *(có phần Smash Velocity thuộc P2)* | **P0** *(bỏ Smash Velocity)* |
| **S18** | `10 - Đánh Giá Kỹ Năng & Nâng Hạng Elo` | `1:5055` | `390×1812` | Hồ sơ | Header + `Quay lại (44×44)`, `Hero Progression Card`, `Visual Badminton Action Banner`, `Hệ Thống 5 Cấp Bậc CLB Tiên Sơn`, `Bốn Tiêu Chí Sát Hạch Thực Chiến`, `Khuyến Nghị Ban Chuyên Môn / HLV`, `Test Match (≥56px)` & `Share via Zalo (≥56px)` | Xem tiến trình nâng hạng | **LỆCH LUẬT** (5 cấp bậc thay vì 6 cấp bậc chuẩn `06-rating-scale.md`) | **P2** *(hoặc sửa theo 6 cấp)* |
| **S19** | `11 - Lịch Sử Đấu Timeline & Biến Động Elogiải` | `1:5288` | `390×1528` | Thống kê | `Top Athlete Insight Header`, `Filter Pills (114×40..92×40)`, `Interactive SVG Elo Chart Card` (`Live Streak Callout`, `Vector Curve Chart`), `Weekly Quick Performance Stats`, `Timeline Match Cards Section` (`Match 1: WIN`) | Xem biểu đồ / Lọc lịch sử | FR-24, FR-25 / WBS 4.5 / `SCR-10` | **P1** |
| **S20** | `12 - Tạo Kèo Thách Đấu & Ghép Trận 1v1 2v2` | `1:5615` | `390×1463` | Phòng kèo | `Top Hero Court Bannerette`, `Section 1: Thể thức thách đấu (Segmented Control 3 nút 114×48)`, `Section 2: Sơ đồ mô phỏng 2 bên thách đấu` (Cards Grid + Center VS + Balance Progress), `Section 3: Điều kiện kèo đấu (Match Stakes & Rules)` | Chọn 1v1/2v2 / Cấu hình kèo | **TRÁI LUẬT R1** (có 1v1 đánh đơn; thiếu chọn 1–2 sân, người mặc định, dải level) | **P0** *(phải sửa theo SRS SCR-07)* |

### Hàng 3 (`y = 2307`): Thống kê sâu, Đánh giá đồng đội, Thiết bị đeo & Giải đấu (8 frames)

| Mã | Tên đúng trong Figma | Node ID | Kích thước | Nhóm | Phần tử chính (từ metadata) | Trạng thái thể hiện | FR / WBS / SCR | Ưu tiên |
|---|---|---|---|---|---|---|---|:---:|
| **S21** | `13 - Thống Kê Số Liệu Bản Thân: Tổng Quan & KPI VĐV` | `1:5842` | `390×1521` | Thống kê | `Time Range Filter Pills`, `Player Quick Identity Banner`, `2x2 Core KPI Grid` (`Win Rate`, `Max Smash Speed`, `Elo Gain`, `Court Hours`), `Hexagon Radar Skill Visualisation` + `AI Tactical Insight Card`, `Form Trend & Clutch Momentum (Last 10 Matches)` | Lọc theo thời gian | FR-25 / WBS 4.5 / `SCR-10` (mở rộng) | **P1** *(cắt Smash Speed/AI nếu ngoài scope)* |
| **S22** | `16 - Lịch Sử Đối Đầu, Khắc Tinh & Cặp Đôi Ăn Ý` | `1:6149` | `390×1838` | Tìm đồng đội / Thống kê | `Title & Tactical Summary Header`, `Horizontal Scrollable Tactical Filters (40px)`, `Breakdown List: Key Rivals in Club` (`Nemesis`, `Favorite Prey >80%`, `Elo Bounty`), `Partner Chemistry Section (Who Complements You Best)` | Lọc đối thủ / Đồng đội ăn ý | FR-26 (và bổ trợ FR-07) / WBS 4.5 / `SCR-11` | **P1** |
| **S23** | `14 - Phân Tích Cú Đánh, Tốc Độ Smash & Heatmap Sân` | `1:6464` | `390×2067` | Khác | `Tablist - Format Switcher (3 nút 114×56)`, `Interactive Badminton Court Heatmap Module` (`Court Vector Graphic with Heat Clusters`), `Shot Distribution Breakdown` (`Smash`, `Drive`, ...) | Chuyển thể thức / Xem heatmap | Ngoài phạm vi SRS MVP | **P2** |
| **S24** | `15 - Thể Lực, Nhịp Tim & Cường Độ Di Chuyển` | `1:6747` | `390×1989` | Khác | `Device Connection Pill`, `Session Load & Recovery` (`Calories`, `Quãng đường`, `Nhịp tim`, `Tốc độ bứt tốc`), `Heart Rate Zones Graph` (Waveform SVG + Zone Bar), `Fatigue Index & Set Drop-off`, `Vertical Jumps & Footwork Court Map` | Đang kết nối thiết bị | Ngoài phạm vi SRS MVP | **P2** |
| **S25** | `17 - Cài Đặt Kết Nối Thiết Bị Apple Watch & Garmin` | `1:7139` | `390×1617` | Khác | `Bluetooth Live Status Bar`, `Active Device Card: Apple Watch Ultra 2`, `Special Badminton Sensors` (`Yonex Smart Sensor`, `Garmin Forerunner 965`, `Whoop 4.0`), `Cloud Sync Integration`, `On-Court Measurement Tactical Configurations` | Đã kết nối Bluetooth | Ngoài phạm vi SRS MVP | **P2** |
| **S26** | `18 - Danh Sách & Tạo Giải Đấu Mini CLB` | `1:7407` | `390×1433` | Khác | `Segment Filter Chips (34px)`, `Tournament Rule & Standard Mini-CLB Box`, `Featured Live Tournament Hero Card` (`Live Status Pill`, `Reward Banner Box`, `Tournament Progress Bar`, `Link Bracket Button 326×48`) | Đang diễn ra / Lọc giải | Ngoài phạm vi MVP (`badminton-domain-rules` mục 5: Không tổ chức giải đấu) | **P2** |
| **S27** | `19 - Cây Nhánh Đấu Trực Quan & Tỷ Số Live` | `1:7631` | `390×1380` | Khác | `TOURNAMENT IDENTITY & LIVE BANNER`, `Ticker Court Alert`, `ROUND SWITCHER (3 nút 113×51)`, `INTERACTIVE TOURNAMENT TREE (Horizontal Bracket Scroller)`, `COMMUNITY WIN PROBABILITY`, `COURT PHOTO SPOTLIGHT` | Live bracket / Chuyển vòng | Ngoài phạm vi MVP (giải đấu loại trực tiếp) | **P2** |
| **S28** | `20 - Bảng Tổng Kết & Trao Giải Vinh Danh` | `1:7998` | `390×1661` | Khác | `Status Banner & Tournament Summary`, `Interactive Hall of Fame Podium`, `Photo Moment Cards`, `Special Individual Awards` (`Smash King`, `Best Defense`, `Best Chemistry`), `Elo Rating Delta Matrix (16 Teams)` | Tổng kết giải đấu | Ngoài phạm vi MVP (giải đấu) | **P2** |

---

## 2. ĐỐI CHIẾU CHÊNH LỆCH GIỮA FIGMA VÀ SRS / `docs/screens.md`

### 2.1. Màn hình SRS & `docs/screens.md` CẦN nhưng Figma ĐANG THIẾU (hoặc chưa đúng luồng)

| Mã màn hình chuẩn | Tên màn hình cần có | FR liên quan | Thực trạng trên Figma hiện tại | Mức độ ảnh hưởng |
|---|---|---|---|---|
| **SCR-02** | **Khảo sát Onboarding 10 câu hỏi** (`OnboardingQuizScreen`) | FR-02, FR-03 | `21 - Đăng Nhập & Khởi Tạo Elo Ban Đầu` (`5:268`) chỉ có **4 thẻ chọn Elo**, thiếu luồng 10 câu trắc nghiệm, tay thuận (`right/left`), vị trí (`front/back/both`) và quận Đà Nẵng. | **Cao (P0)** |
| **SCR-04** | **Tìm đồng đội ăn ý** (`PartnerFinderScreen`) | FR-07 | Chỉ có `16 - Lịch Sử Đối Đầu...` (`1:6149`) thiên về thống kê sau trận; **thiếu hẳn màn hình lọc & gợi ý bạn đánh cặp cố định** theo quận ĐN, độ lệch $\le 150$ Elo và điểm bù trừ Lưới/Công/Tay thuận. | **Cao (P1/P0)** |
| **SCR-05** | **Sảnh chờ & Danh sách kèo** (`SessionLobbyScreen`) | FR-16, FR-17 | **HOÀN TOÀN CHƯA CÓ** trên Figma. Thiếu danh sách kèo đang mở tuyển tại Đà Nẵng, bộ lọc quận/thể thức/trình độ, hiển thị `Còn X suất` / `Waitlist` và nút FAB `+` tạo kèo. | **Rất cao (P0)** |
| **SCR-06** | **Chi tiết phòng kèo, Duyệt đơn & Waitlist** (`SessionDetailScreen`) | FR-15, FR-18, FR-19, FR-20, FR-21 | **HOÀN TOÀN CHƯA CÓ** trên Figma. Thiếu danh sách `Core` / `Ghost` / `Recruit` tối đa 8 người, nút `Xin tham gia` / `Vào Waitlist`, giao diện Host duyệt/từ chối đơn và cảnh báo phạt uy tín khi hủy. | **Rất cao (P0)** |
| **SCR-07** | **Form Tạo & Cấu hình phòng kèo 1–2 sân** (`CreateSessionScreen`) | FR-14, FR-12 | `12 - Tạo Kèo Thách Đấu 1v1 2v2` (`1:5615`) thiết kế theo dạng kèo thách đấu 1v1/2v2; **thiếu** chọn địa điểm sân Đà Nẵng, chọn số sân (1 hoặc 2), thể thức riêng từng sân (`men/women/mixed`), dải trình độ cấp 1–6 và nhập người mặc định. | **Rất cao (P0)** |
| **SCR-09 (phần 2)** | **Pop-up Chấm thẻ đánh giá 5 giây** (`ScoreReviewScreen` - Post-match Review) | FR-23 | `04 - Chấm Điểm & Kết Thúc Trận` (`1:3306`) mới có phần bảng điểm 1 tay; **thiếu** bảng pop-up chấm 3 thẻ (`Đúng trình`, `Đánh hay`, `Thái độ tốt`) và nút báo cáo khai ảo/bùng kèo sau khi bấm Kết thúc. | **Cao (P0)** |
| **SCR-13** | **Bảng Quản trị viên in-app** (`AdminDashboardScreen`) | FR-28..FR-31 | **HOÀN TOÀN CHƯA CÓ** trên Figma (khóa tài khoản, hoàn uy tín, duyệt sân mới). | **Trung bình (P1)** |
| *(Trạng thái)* | **Trạng thái Loading / Empty / Error + Offline Banner** | FR-32..FR-34, NFR-04 | Chưa thấy màn hình/component chuyên biệt cho trạng thái mất mạng tại sân (`Offline Sync Queue`) và các trạng thái lỗi nghiệp vụ cụ thể. | **Cao (P0)** |

### 2.2. Màn hình Figma CÓ nhưng SRS / MVP KHÔNG CÓ (11 màn hình P2 + phần thừa)

| Node ID | Tên màn hình trên Figma | Lý do ngoài phạm vi SRS / MVP | Đề xuất xử lý |
|---|---|---|---|
| `1:3901` | `05 - Quản Lý Thu Tiền & Quỹ Cầu` | SRS mục 1.2 & `badminton-domain-rules` mục 5 loại trừ tính năng thanh toán/chia tiền sân. | Ghi vào `DECISIONS-PENDING.md`, đề xuất bỏ khỏi MVP. |
| `1:3606` | `06 - Mã QR Thanh Toán Nhanh VietQR` | A8 chỉ cho Host nhập STK để hiển thị QR đơn giản trong phòng kèo, không làm luồng thu chi/xác nhận thanh toán độc lập. | Chuyển thành modal đơn giản trong `SCR-06` hoặc bỏ. |
| `1:4175` | `07 - Bảng Xếp Hạng Elo CLB` | Không có FR trong SRS (chỉ có trong ý tưởng mở rộng cộng đồng). | Xếp P1/P2, chỉ làm nếu còn thời gian. |
| `1:6464` | `14 - Phân Tích Cú Đánh, Tốc Độ Smash & Heatmap` | Cần cảm biến vợt / AI camera, ngoài phạm vi đồ án 12 tuần. | Xếp P2 (bỏ khỏi MVP). |
| `1:6747` | `15 - Thể Lực, Nhịp Tim & Cường Độ Di Chuyển` | Cần thiết bị đeo y tế/thể thao, ngoài phạm vi MVP. | Xếp P2 (bỏ khỏi MVP). |
| `1:7139` | `17 - Cài Đặt Kết Nối Apple Watch & Garmin` | Cần native BLE SDK (không chạy trên Expo Go), ngoài phạm vi MVP. | Xếp P2 (bỏ khỏi MVP). |
| `1:7407`, `1:7631`, `1:7998` | `18`, `19`, `20` (Giải đấu Mini CLB, Nhánh đấu, Trao giải) | SRS mục 1.2 & `badminton-domain-rules` mục 5 cấm rõ: **Không tổ chức giải đấu / Tournament bracket**. | Xếp P2 (bỏ khỏi MVP). |
| `5:729` | `24 - Trung Tâm Trợ Giúp & Hướng Dẫn Elo` | Không có FR trong SRS (có hotline BQL Tiên Sơn + ticket hỗ trợ). | Xếp P2. |
| `5:1308` | `27 - Xác Thực OTP Kích Hoạt Tài Khoản` | Đã chốt `ADR-002`: dùng Google + Email/Password, **không dùng Phone OTP**. | Xếp P2 (đề xuất bỏ). |

---

## 3. ĐỐI CHIẾU LUẬT NGHIỆP VỤ (`badminton-domain-rules` & `CR-01`)

Qua kiểm tra cấu trúc và tên thành phần trên trang `0:1`, phát hiện **5 điểm mâu thuẫn / trái luật** cần báo TV1 & TV2 thống nhất (không tự ý sửa Figma):

1. **Vi phạm R2 / CR-01 (Quy mô sân):** Frame `1:4473` (`08 - Sơ Đồ Trực Tiếp 4 Sân Đấu`) thiết kế lưới **4 sân đấu** trong một buổi; ngoài ra ngay trên Frame `1:3099` (`01 - Home Sân Đấu`), dòng phụ đề cũng ghi **`"16 VĐV có mặt • 4 sân sẵn sàng"`**. Luật cứng **R2** và **CR-01** quy định mỗi kèo chỉ có **1 hoặc tối đa 2 sân** (mỗi sân 4–8 người, tối đa 16 người/kèo).
2. **Vi phạm R1 (Thể thức thi đấu):** Frame `1:5615` (`12 - Tạo Kèo Thách Đấu & Ghép Trận 1v1 2v2`) và Frame `5:2` (`Match Card 2: Solo 1v1 Ranked Challenge`) có thể thức **1v1 (đánh đơn)**. Luật cứng **R1** quy định **chỉ đánh đôi**, không có đánh đơn trong MVP.
3. **Mâu thuẫn thang trình độ:** Frame `1:5055` (`10 - Đánh Giá Kỹ Năng & Nâng Hạng Elo`) ghi **"Hệ Thống 5 Cấp Bậc CLB Tiên Sơn"**, trong khi chuẩn nghiệp vụ đã chốt (`06-rating-scale.md`, `DECISIONS-PENDING.md` Mục 8) là **thang 6 cấp** (`Yếu`, `TB-`, `TB`, `TB+`, `Khá`, `Tốt / Bán chuyên`).
4. **Mâu thuẫn luồng Onboarding (FR-02):** Frame `5:268` (`21 - Đăng Nhập & Khởi Tạo Elo Ban Đầu`) dùng **4 thẻ tự chọn mức Elo**, thay vì **bộ 10 câu hỏi khảo sát** tính điểm tự động theo `calculateInitialRatingFromAnswers()`.
5. **Mâu thuẫn phương thức xác thực (ADR-002):** Frame `5:1153` và `5:1308` (`26`, `27`) thiết kế đăng ký SĐT + **OTP SMS** + **Zalo**, trái với quyết định đã duyệt (`Google Sign-In + Email/Password`).

*(Ghi chú: Đã kiểm tra không thấy cụm từ "8–16 người một lượt" hay ca lẻ `9, 11, 13` trong tên các frame/layer của Figma).*

---

## 4. GHI CHÚ TRÍCH XUẤT DESIGN TOKENS

- Từ `get_metadata`, đã xác nhận kích thước thiết kế chuẩn:
  - Khung màn hình chính: **`390×...`** (iPhone 14/15 width, riêng `24` là `400px`).
  - Chiều cao nút CTA chính (Primary Thumb-Zone CTA): **`58px`** ở các màn hình tại sân lõi (`01`, `02`, `03`, `06`) và **`56px`** ở các màn hình phụ/xác thực (`04`, `08`, `10`, `21`, `25`, `26`, `27`, `28`).
  - Nút quay lại Header: **`44×44px`**, Header bar cao **`64px`**, ô chọn nhanh người chơi `>= 80×64px`.
- **Phần đã trích xuất thêm từ ảnh PNG & `get_metadata`:** Đã đo được bảng màu `#HEX` thật trực tiếp từ ảnh render 100% của 4 màn hình lõi (`#0B1326`, `#131B2E`, `#171F33`, `#222A3D`, `#A3E636`, `#CCFF80`, `#7BD0FF`, `#00A6E0`, `#FFB783`, `#8E4700`, `#93010B`, `#2E2B5A`, `#DAE2FD`) và toàn bộ kích thước thật (`390px`, padding `16px`, CTA `58px`/`56px`) tại [docs/ui/design-tokens.md](file:///d:/QLDAPM/docs/ui/design-tokens.md). Riêng tên font và giá trị `borderRadius`/`boxShadow` CSS gốc vẫn ghi chú là ước lượng trực quan do Figma chế độ khách khóa bảng Inspect.

