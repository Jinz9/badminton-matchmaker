# ĐỐI CHIẾU TRỰC QUAN UI KIT VỚI 4 MÀN HÌNH LÕI FIGMA (`ui-diff.md`)

**Nhánh:** `feat/ui-kit` (WBS Q02)  
**Nguồn đối chiếu:** 4 ảnh chụp PNG zoom 100% từ Figma (`01` `1:3099`, `02` `1:2724`, `03` `1:3440`, `04` `1:3306`) và màn hình xem thử `/dev/ui-kit` (Tab `2. Xem thử 4 màn lõi`).

---

## 1. Bảng đối chiếu chi tiết 4 màn hình lõi

| Màn hình lõi Figma | Thành phần đã dựng bằng UI Kit | Điểm khớp với Figma | Điểm lệch / Ghi chú tinh chỉnh ở bước dựng màn hình |
|---|---|---|---|
| **01 - Home Sân Đấu (Chạm 1)** (`1:3099`) | `Header`, `StatusPill`, `CourtDiagram` (trống), `NeonCTAButton` (`58px`) | Nền `#0B1326`, CTA neon `#A3E636` cao `58px` đặt cuối màn hình vùng ngón cái, badge trạng thái `ĐANG TRỐNG`. | 1. Figma có câu `"16 VĐV có mặt • 4 sân sẵn sàng"` $\rightarrow$ đã chốt `FIG-01` giới hạn tối đa **2 sân/kèo**, 4–8 người/sân.<br>2. Figma có `Overlay+Blur` ambient glow phía sau card Sân 02; trên React Native / Expo Go thay bằng `SHADOWS.neonGlow` / viền sáng nhẹ để đảm bảo 60fps trên máy tầm trung. |
| **02 - Chọn Người & Cân Trình (Chạm 2)** (`1:2724`) | `Header` (nút Quay lại `44×44` + `hitSlop` >= 48dp), `ProgressBar` (`Chạm 2/3`), `BalanceMeter`, `PlayerChip`, `BottomSheet` (Modal hồ sơ), `NeonCTAButton` (`58px`) | Tiến trình `Chạm 2/3`, avatar chữ cái 2 ký tự, dấu tích chọn `✓` + viền neon, thanh cân bằng trực tiếp, BottomSheet nền `#131B2E`. | 1. Figma bố trí 6 nút chọn nhanh dạng lưới 2–3 cột (`>= 80×64px`), còn `PlayerChip` bản cơ sở đang xếp danh sách dọc đầy đủ thông tin (tên + cấp + Elo) để hỗ trợ cỡ chữ hệ thống lớn (`1.4x`). Khi dựng màn `SCR-08` sẽ hỗ trợ thêm chế độ lưới 2 cột cho màn hình rộng.<br>2. Figma có `4 ô chọn sẵn` (Top Preview 4 Slot) phía trên — sẽ ghép ở `SCR-08` bằng `PlayerChip` dạng thu gọn. |
| **03 - Xác Nhận Kèo Cân Bằng (Chạm 3)** (`1:3440`) | `ProgressDots` (`Chạm 3/3`), `BalanceMeter` (`51% vs 49%`), `TeamCard` Đội A (`#7BD0FF`), `TeamCard` Đội B (`#FFB783`), `SecondaryButton` (`Xáo lại`), `NeonCTAButton` (`VÀO SÂN NGAY`) | Đúng mã màu Đội A cyan & Đội B hổ phách, pill `Elo TB`, phần trăm cân kèo, nút đổi chỗ và CTA `VÀO SÂN NGAY [CHẠM 3]`. | 1. Figma có nút `VS` đổi chéo đặt ngay giữa 2 card Đội A và Đội B (`Divider VS_Icon_Swap`); hiện UI Kit đặt nút đổi chỗ ở góc header từng `TeamCard` — sẽ thêm `VS Swap Divider` ở giữa 2 card khi ráp `SCR-08`.<br>2. Cỡ chữ phần trăm `51% vs 49%` trong `BalanceMeter` đang dùng `12px` để gọn trong card; trên `SCR-08` cần nâng lên `heroTitle` (`24px`) như Figma. |
| **04 - Chấm Điểm & Kết Thúc Trận** (`1:3306`) | `Header` (`Sân Cầu Lông Tiên Sơn`), `StatusPill` (`ĐANG ĐẤU`), `ScoreBox` Đội A & Đội B, `SecondaryButton` (`Hoàn tác`, `+1 Quả cầu`, `KẾT THÚC & TRẢ SÂN` `#93010B`) | Bảng điểm 2 cột lớn chạm 1 tay, nút `+ ĐỘI A +1` (`#00A6E0`), `+ ĐỘI B +1` (`#8E4700`), nút `KẾT THÚC & TRẢ SÂN` màu đỏ `#93010B`. | 1. Figma có chiều cao vùng chạm điểm cố định `256px`; UI Kit đặt `minHeight: 200px` để vừa màn hình nhỏ (iPhone SE / Android 5.5") mà không che mất 2 nút thao tác dưới.<br>2. Bổ sung **pop-up 3 thẻ đánh giá 5 giây** sau khi bấm `KẾT THÚC & TRẢ SÂN` theo SRS (`FR-33` / `FIG-06`) vì Figma bản gốc đang thiếu. |

---

## 2. Kiểm tra quy tắc truy cập (Accessibility & Expo Go)
- **Vùng chạm tối thiểu `>= 48×48dp`:** Đạt trên toàn bộ `NeonCTAButton` (`58px`), `SecondaryButton` (`52px`), `PlayerChip` (`>= 64px`), `ScoreBox` (`>= 200px`), `BottomTabBar` (`52px`), `IconButton` (`44px` + `hitSlop >= 4px` mỗi phía).
- **Không dựa vào màu đơn thuần:** `PlayerChip` luôn kèm dấu tích `✓`, `LevelBadge` luôn kèm chữ (`Cấp 1 · Yếu`..`Cấp 6 · Tốt`), `StatusPill` luôn kèm chấm + chữ tiếng Việt.
- **Hỗ trợ cỡ chữ hệ thống lớn:** Tất cả chữ dùng `allowFontScaling` với `maxFontSizeMultiplier` (`1.4` cho chữ thường, `1.2` cho số điểm cực lớn) và dùng `minHeight` thay `height` cứng cho các nút có chữ.
- **Tương thích Expo Go (SDK 58):** Toàn bộ icon dựng bằng `react-native-svg`, font Inter tải qua `expo-font` + `@expo-google-fonts/inter`, rung xúc giác qua `expo-haptics` (có thể bật/tắt).

---

## 3. Đối chiếu nhóm màn hình Xác thực & Hồ sơ (`feat/auth-profile-ui` / Q04)

| Màn hình Figma | Route đã dựng | Điểm khớp với Figma | Tinh chỉnh theo Luật nghiệp vụ / ADR-002 |
|---|---|---|---|
| **25 - Đăng Nhập VĐV SmashCourt** (`5:997`) | `src/app/(auth)/login.tsx` | Hero card `SMASHCOURT DN`, tiêu đề `CHÀO MỪNG VĐV / TRỞ LẠI SÂN ĐẤU`, ô nhập, checkbox `Ghi nhớ đăng nhập`, link `QUÊN MẬT KHẨU?`, nút `ĐĂNG NHẬP VÀO SÂN →` (`58px`). | Thay nhãn đăng nhập bằng SĐT thành **Email/Mật khẩu** theo `ADR-002` và bảng ràng buộc Expo Go; thêm 2 pill tài khoản mẫu 1 chạm (`host@badminton.vn`, `player@badminton.vn`) để kiểm thử nhanh. |
| **26 - Đăng Ký Tài Khoản VĐV Mới** (`5:1153`) | `src/app/(auth)/register.tsx` | Header `Bước 1/2: Thông tin đăng ký`, `Tạo Tài Khoản VĐV Mới`, thanh độ mạnh mật khẩu 4 nấc, checkbox `Quy chế Fair-Play & Cân trình Elo`, nút `TIẾP TỤC & NHẬN MÃ OTP →`. | Bổ sung trường **Email đăng nhập** (bắt buộc theo `ADR-002`) và giữ **Số điện thoại** là tùy chọn để Host liên hệ tại sân. |
| **27 - Xác Thực OTP Kích Hoạt Tài Khoản** (`5:1308`) | `src/app/(auth)/otp.tsx` | 6 ô nhập OTP (`OtpInput`), đồng hồ đếm ngược, hộp cảnh báo `LƯU Ý TRỌNG TÀI SÂN SMASH`, bàn phím số 1 tay (`NumericKeypad`), nút `XÁC NHẬN & VÀO BƯỚC CÂN TRÌNH ELO →`. | Gắn nhãn rõ trong code & UI `"chờ phương án đăng nhập thật theo ADR-002"`, dùng mã OTP giả lập cố định `MOCK_OTP_CODE = "123456"` (hiển thị tại `/dev/ui-kit`). |
| **28 - Khôi Phục Mật Khẩu & Tài Khoản VĐV** (`5:1437`) | `src/app/(auth)/forgot-password.tsx` | Segmented switcher (`Qua Email` / `Qua SĐT`), thẻ `HỒ SƠ NHẬN DIỆN TỰ ĐỘNG` (`Đào Duy Nhật • 1601 ELO • Hải Châu`), quy trình bảo vệ 2 bước, đặt lại mật khẩu mới. | Dùng mã OTP giả lập `123456` và cập nhật mật khẩu trực tiếp trong `MockAuthService` (`AsyncStorage`). |
| **21 - Đăng Nhập & Khởi Tạo Elo Ban Đầu** (`5:268`) | `src/app/(auth)/onboarding.tsx` | Chọn tay thuận, vị trí (`Cầu trước` / `Cầu sau` / `Linh hoạt`), nội dung đánh (`Đôi nam` / `Đôi nữ` / `Đôi nam nữ`), khu vực Đà Nẵng (`DA_NANG_DISTRICTS`), hộp giải thích `Provisional K = 40 (5 trận đầu)`, nút `HOÀN TẤT & VÀO SÂN ĐẤU BWF →`. | Thay 4 mức tự chọn cảm tính trong Figma (`Tập Sự 1000`..`Chuyên Nghiệp 1950+`) bằng **10 câu hỏi tự đánh giá nguyên văn từ `docs/06-rating-scale.md`** và tính điểm bằng `calculateInitialRatingFromAnswers` + `levelToRange` của TV1 (`1100–1900`, 6 cấp). |
| **09 - Tổng quan & 23 - Cài Đặt Tài Khoản** (`9:1903`, `5:483`) | `src/app/(tabs)/profile.tsx` | Thẻ hộ chiếu VĐV với avatar chữ cái, tên, `LevelBadge` kèm khoảng điểm, điểm Elo, điểm Uy tín (`98/100`), 3 ô thống kê (`Tỷ lệ thắng`, `Trận đã đấu`, `Uy tín Fair-Play`), nút `✎ CHỈNH SỬA HỒ SƠ VĐV` và `⎋ ĐĂNG XUẤT TÀI KHOẢN`. | `BottomSheet` chỉnh sửa hồ sơ **chỉ cho phép sửa các trường hợp lệ theo Security Rules** (`displayName`, `phoneNumber`, `gender`, `dominantHand`, `position`, `areaLabel`) và khóa cứng `skill.rating` / `skill.level` / `skill.reliability`. |

---

## 4. Đối chiếu nhóm màn hình Tại Sân: Home Sân Đấu & Chọn Người (`feat/court-home-select` / Q05)

| Màn hình Figma | Route đã dựng | Điểm khớp với Figma | Tinh chỉnh theo Luật nghiệp vụ (`CR-01`) |
|---|---|---|---|
| **01 - Home Sân Đấu (Chạm 1)** (`1:3099`) | `src/app/court/index.tsx` & `src/app/(tabs)/index.tsx` | Header `Sân Cầu Lông Tiên Sơn - Đà Nẵng`, trạng thái `TRỰC TIẾP TẠI SÂN`, thông báo, avatar; Context `Tối T3 • Sân Tiên Sơn` + `LIVE • ĐANG HOẠT ĐỘNG`; Card Sân 01 trống kèm `CourtDiagram` SVG + CTA `58px` `CHIA KÈO SÂN 1 [CHẠM 1]`; Card Sân 02 đang đấu (`Minh / Hùng` vs `Lan / Tuấn`, tỷ số `18 - 15`); `Hàng đợi ưu tiên` 6 chip người chơi nhanh; 4 tab điều hướng dưới. | Áp dụng **CR-01** (`RULES.MAX_COURTS_PER_SESSION = 2`, `RULES.COURT_CAPACITY = 8`): thay `"4 sân sẵn sàng"` của Figma gốc bằng tối đa **2 sân/kèo**, tuyệt đối không hiển thị sân thứ 3; thay tab `Thu tiền` ngoài phạm vi bằng tab `Hồ sơ`. |
| **02 - Chọn Người & Cân Trình (Chạm 2)** (`1:2724`) | `src/app/court/select-players.tsx` | Header nút Quay lại (`44×44` + `hitSlop >= 48dp`), `ProgressBar` `"Chạm 2/3"`, 4 ô xếp hàng đã chọn (xóa từng ô `✕` & nút `Xóa hết`), đồng hồ cân bằng trực tiếp `BalanceMeter` gọi thẳng `balanceCourt`, lưới chọn nhanh `>= 80×64px` vùng ngón cái, pill `Ghi chú cho người điều phối`, thanh hành động cố định dưới (`58px` `NeonCTAButton`), `BottomSheet` Modal hồ sơ VĐV (`75%`, `18`, `6`, độ ổn định, lịch sử 3 trận, nút `THU GỌN`). | Hỗ trợ đầy đủ dải **4–8 người/sân** (`RULES.COURT_CAPACITY = 8`), hiển thị danh sách **Người nghỉ luân phiên** khi chọn ca lẻ **5 hoặc 7 người** (và 6/8 người); chặn chọn quá 8 người/sân bằng thông báo lỗi thân thiện tiếng Việt; tích hợp `tapCounter` (`Chạm 1..3`) hiển thị tại `/dev/ui-kit` phục vụ Field Test (`Q15`). |
| **03 - Xác Nhận Kèo Cân Bằng (Chạm 3)** (`1:3440`) | `src/app/court/balance-confirm.tsx` | Huy hiệu `"ĐỀ XUẤT CHIA CẶP TỐI ƯU"`, `ProgressBar` `"Chạm 3/3"`, tỷ lệ dự đoán (`51% vs 49%`), chỉ số cân bằng & `BalanceMeter`, thẻ Đội A (cyan) và Đội B (hổ phách) mỗi đội 2 VĐV (avatar, tên, `LevelBadge`, Elo), nút `VS` đổi chéo hai đội, sơ đồ sân `CourtDiagram` 4 người/sân, nút `Xáo lại` và `58px` `NeonCTAButton` `"VÀO SÂN NGAY [CHẠM 3]"`. | Gọi `balanceCourt` theo từng sân (`4–8` người), hiển thị danh sách **Người nghỉ luân phiên** (ca 5, 6, 7, 8 người); đổi thủ công 2 người qua `swapPlayers` (chạm 2 người bất kỳ giữa Đội A/B/Nghỉ); cảnh báo khi chênh lệch Elo lớn (`> 200`) hoặc sai lệch giới tính `mixed` nhưng **không chặn Host**; chuyển `Sân 01 ↔ Sân 02` cho kèo 2 sân (CR-01); xác nhận lưu trận qua `getRepository().createMatch(...)` sang `/court/score` (Q07). |
| **04 - Chấm Điểm & Kết Thúc Trận** (`1:3306`) | `src/app/court/score.tsx` | Header sân LIVE + đồng hồ trận `⏱ mm:ss`, thẻ đội hình 2 bên (`Matchup Lineup Card`), bảng điểm khổng lồ 1 tay (`ScoreBox` Đội A cyan & Đội B hổ phách), thanh công cụ nhanh (`Hoàn tác điểm` & `+1 Quả cầu` / `Shuttle Tracker Pill`), nút `KẾT THÚC & TRẢ SÂN` ở vùng ngón cái dưới cùng. | Bổ sung bộ chọn Set theo luật BWF (`1 Set` hoặc `Best of 3`), kiểm tra tỷ số qua `validateMatchScores` trước khi cho kết thúc; undo stack đa bước hoàn tác đúng thứ tự Đội A/B; lưu nháp `AsyncStorage` chống mất điểm khi xoay máy/app nền; BottomSheet **Chấm điểm 5 giây** (`Đúng trình`, `Đánh hay hơn`, `Thái độ tốt`, `Khai khống`) **chặn tự chấm mình**; chống bấm 2 lần + hàng đợi offline (`offlineMatchQueue.ts`) và màn **Tổng kết Elo trước → sau + Uy tín** của cả 4 VĐV bằng `calculateMatchElo`. |

---

## 5. Đối chiếu nhóm màn hình Sảnh chờ, Tạo kèo & Phòng kèo (`feat/lobby-ui` / Q08)

> **Ghi chú:** Theo `docs/ui/figma-inventory.md`, Figma hiện **thiếu** `SCR-05` (Danh sách kèo) & `SCR-06` (Chi tiết phòng kèo), còn `12 - Tạo Kèo Thách Đấu 1v1 2v2` (`1:5615`) sai thể thức 1v1. Thực hiện theo phê duyệt dùng **UI Kit** (`src/theme`, `src/components`) kết hợp luật `CR-01` & `CR-02`.

| Màn hình SRS | Route đã dựng | Thành phần UI Kit sử dụng | Tuân thủ Luật (`CR-01`, `CR-02`, `badminton-domain-rules`) |
|---|---|---|---|
| **SCR-05 - Danh sách kèo giao lưu** | `src/app/lobby/index.tsx` | `Header`, chips lọc quận Đà Nẵng (`DA_NANG_DISTRICTS`), nội dung (`👨 Đôi nam`, `👩 Đôi nữ`, `🤝 Đôi nam nữ`), ngày & `Chỉ kèo còn chỗ`, `RefreshControl`, `StatusPill`, `LevelBadge`, `Skeleton`, `EmptyState`, `NeonCTAButton`. | Hiển thị tối đa 2 sân/kèo (`CR-01`), nội dung luôn có chữ + icon + màu, cập nhật realtime qua `useLobbies()` (`subscribe("sessions")`). |
| **SCR-06 - Chi tiết phòng kèo & Waitlist** | `src/app/lobby/[id].tsx` | `Header`, tab chuyển `Sân 01` / `Sân 02`, `StatusPill`, `LevelBadge`, `SecondaryButton`, `NeonCTAButton`, `BottomSheet` xác nhận hủy & thêm Ghost, `Toast` + banner đôn Waitlist. | Tính suất `computeSlots` (`min(4, 8 - coreCount)`), chặn mở tuyển khi đủ 8 hoặc `< 4` core, Host thêm người mặc định chưa có TK (`Ghost`), duyệt/từ chối đơn (`requested`), tự động vào Waitlist kèm vị trí `#N` khi đầy, hủy cảnh báo phạt uy tín (`< 12h` trừ `-5đ`) và đôn Waitlist kèm thông báo in-app. |
| **SCR-07 - Form Tạo kèo mới** | `src/app/lobby/create.tsx` | `Header`, chọn nhanh cụm sân Đà Nẵng (`DA_NANG_VENUES`), quận (`DA_NANG_DISTRICTS`), chọn số sân (`1` hoặc `2`), stepper số người mặc định `4–8`, `LevelBadge`, `NeonCTAButton`. | Ràng buộc cứng tối đa **2 sân/kèo**, mỗi sân **4–8 người** (tổng tối đa **16 người**), tự tính suất tuyển `min(4, 8 - coreCount)` và báo lỗi tiếng Việt nếu vượt ngưỡng. |

---

## 6. Đối chiếu màn Tìm Đồng Đội Ăn Ý & BXH Elo CLB (`feat/partner-finder-ui` / Q09)

| Màn hình SRS / Figma | Route đã dựng | Thành phần UI Kit sử dụng | Tuân thủ Luật (`badminton-rating`, `partner-finder.md`) |
|---|---|---|---|
| **SCR-04 - Tìm đồng đội ăn ý** (Figma thiếu, dựng theo UI Kit) & **07 - Bảng Xếp Hạng Elo CLB** (`1:4175`, P1) | `src/app/(tabs)/partners.tsx` | `Header`, 2 tab chuyển `Tìm Đồng Đội` / `BXH Elo CLB`, chips lọc khoảng lệch Elo (`≤ 80`, `≤ 150`, `≤ 200`), nội dung (`Đôi nam`, `Đôi nữ`, `Đôi nam nữ`), quận Đà Nẵng (`DA_NANG_DISTRICTS`), `LevelBadge`, `StatusPill`, `BottomSheet` xem hồ sơ VĐV, nút `Gửi lời mời`, `Tải thêm đồng đội` (phân trang), `Skeleton`, `EmptyState`. | Gọi trực tiếp `findPartners` của TV1, mặc định `PARTNER_FINDER_MAX_ELO_DIFF = 150`, hiển thị điểm phù hợp, độ lệch Elo, lý do bù trừ cầu trước/cầu sau & tay thuận, uy tín; tách biệt hoàn toàn khỏi luồng tuyển vãng lai/waitlist phòng kèo (Q08). |

---

## 7. Đối chiếu nhóm màn hình Thống kê, Đồng đội ăn ý & Điều hướng (`feat/history-stats-ui` / Q10 / M8)

| Màn hình Figma / SRS | Route đã dựng | Thành phần & Biểu đồ | Loại trừ P2 theo `figma-inventory.md` |
|---|---|---|---|
| **SCR-10 - Lịch sử đấu** & **SCR-11 - Thống kê & Đồng đội ăn ý** (`09 - tổng quan` `9:1903`, `16 - Lịch sử đối đầu` `1:6149`) | `src/app/(tabs)/history.tsx` | 3 tab con: `Lịch sử đấu` (lọc `Tất cả`/`7 ngày`/`30 ngày` & nội dung, phân trang `5` trận/lần, đồng đội, đối thủ, tỷ số set, `+Elo`), `Thống kê & Elo` (tỷ lệ thắng tổng & theo nội dung, biểu đồ đường Elo bằng `react-native-svg`, biểu đồ Radar 5 trục kỹ năng BWF bằng `react-native-svg`), `Đồng đội ăn ý` (gọi `computeBestPartners` chỉ hiện cặp `>= 5` trận & `winRate >= 60%`). | Loại bỏ các phần **P2** theo `figma-inventory.md`: `Smash Velocity` trên frame `09`, `14` (Heatmap), `15` (Nhịp tim), `17` (Apple Watch/Garmin), `18/19/20` (Giải đấu Mini CLB). |
| **Sơ đồ điều hướng toàn app** | [navigation-map.md](file:///d:/QLDAPM/docs/ui/navigation-map.md) | Mermaid `flowchart TD` nối toàn bộ luồng P0/P1 (`/(auth)/*` → `/(tabs)/*`, `/court/*`, `/lobby/*`, `/dev/ui-kit`) + nút `🌐 Kèo Giao Lưu` trên Home Sân Đấu + Deep link scheme `badminton://`. | Đảm bảo 100% màn P0/P1 có đường đi & nút quay lại, không có màn chết. |



