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


