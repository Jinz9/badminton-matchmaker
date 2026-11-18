# PHIẾU CHẠY KIỂM THỬ THỰC TẾ (TEST EXECUTION SHEET)

**Mã tài liệu:** `docs/test/execution-sheet.md`  
**Bộ ca kiểm thử đối chiếu:** [test-cases.csv](file:///d:/QLDAPM/docs/test/test-cases.csv) (`TC-001` – `TC-084`)  
**Bảng lỗi liên kết:** [bug-log.md](file:///d:/QLDAPM/docs/test/bug-log.md)  
**Thư mục minh chứng:** `docs/test/evidence/`

> [!IMPORTANT]
> **Nguyên tắc trung thực:** Phiếu này để trống để TV2 chạy thật trên Android, iOS (Expo Go) và Emulator rồi điền kết quả. Tuyệt đối không điền sẵn `PASS`/`FAIL` khi chưa chạy thực tế.

---

## 1. Hướng dẫn chụp màn hình & đặt tên minh chứng (`docs/test/evidence/`)
1. **Khi chụp màn hình trên thiết bị thật:**
   - **Android:** Nhấn `Nguồn + Giảm âm lượng`, sau đó gửi qua USB/Zalo/Drive vào thư mục `docs/test/evidence/`.
   - **iOS (iPhone):** Nhấn `Side Button + Tăng âm lượng` (hoặc `Home + Nguồn`), chuyển ảnh vào `docs/test/evidence/`.
2. **Quy ước đặt tên file:**
   - Ca kiểm thử: `<MãTC>_<ThiếtBị>_<PASS|FAIL>.png` (Ví dụ: `TC-042_AND_PASS.png`, `TC-078_IOS_PASS.png`).
   - Lỗi phát sinh: `<MãBug>_<ThiếtBị>_<MôTảNgắn>.png` (Ví dụ: `BUG-001_AND_keyboard-overlap.png`).
3. **Thông tin môi trường mỗi đợt chạy:**
   - **Phiên bản App / Expo Go:** `[TV2 điền: VD Expo Go SDK 58 / commit ...]`
   - **Thiết bị Android:** `[TV2 điền: Tên máy, Android XX]`
   - **Thiết bị iOS:** `[TV2 điền: Tên iPhone, iOS XX]`
   - **Nguồn dữ liệu:** `[TV2 điền: Mock / Firebase Emulator / Firebase Cloud]`

---

## 2. Kịch bản kiểm thử Android & iOS trên Expo Go

### 2.1. Kiểm tra theo luồng P0 & từng màn hình chính
- [ ] **Luồng A (Auth & Onboarding):** Đăng ký $\to$ OTP (mã dev `123456` ở mock) $\to$ Khảo sát 10 câu $\to$ Hồ sơ cá nhân.
- [ ] **Luồng B (Tạo kèo & Tuyển vãng lai):** Tạo kèo 2 sân $\to$ Thêm người mặc định & Ghost $\to$ Mở tuyển $\to$ Tài khoản khác xin vào $\to$ Host duyệt / Waitlist.
- [ ] **Luồng C (Chia kèo 3 chạm tại sân):** Home Sân Đấu $\to$ Chọn 4..8 người $\to$ Xác nhận kèo cân bằng $\to$ Đổi tay 2 người $\to$ Vào sân.
- [ ] **Luồng D (Chấm điểm & Elo):** Cộng điểm một tay $\to$ Kết thúc & chấm thẻ 5 giây $\to$ Xem Lịch sử & Đồng đội ăn ý.

### 2.2. Kiểm tra tương thích giao diện trên cả Android và iOS
| Hạng mục kiểm tra | Cách thực hiện trên máy thật | Kỳ vọng | Android | iOS |
|---|---|---|---|---|
| **Xoay ngang / dọc màn hình** | Xoay máy khi đang ở màn Nhập tỷ số (`/court/score`) | Không mất điểm số đang nhập (nhờ AsyncStorage draft), giao diện không bị cắt | `[ ]` | `[ ]` |
| **Bàn phím ảo (Keyboard)** | Bấm vào ô nhập ở Đăng nhập, Tạo kèo, Ghi chú xin vào kèo | Bàn phím không che nút CTA chính; cuộn/tự đẩy lên mượt | `[ ]` | `[ ]` |
| **Vùng an toàn (SafeArea)** | Quan sát tai thỏ / Dynamic Island / thanh điều hướng dưới cùng | Header không đè đồng hồ/pin; BottomTabBar & CTA không bị thanh home che | `[ ]` | `[ ]` |
| **Cỡ chữ hệ thống lớn** | Tăng Font Size lên mức lớn trong Cài đặt Android / iOS | Chữ không bị tràn khỏi badge/thẻ nhờ `maxFontSizeMultiplier` | `[ ]` | `[ ]` |
| **Nền tối ngoài trời nắng** | Mang máy ra ngoài trời sáng hoặc giảm độ sáng màn hình | Nút bấm `>= 48dp`, chữ và badge trạng thái đọc rõ | `[ ]` | `[ ]` |

---

## 3. Kịch bản giả lập mất mạng tại sân (Offline Resilience — theo Q12)

1. **Mất mạng khi đang chia kèo:**
   - Mở phòng kèo khi còn mạng (để lưu `SessionSnapshot`).
   - Bật **Chế độ máy bay (Airplane Mode)** (hoặc bật công tắc `Ngoại tuyến giả` trong màn `/dev/ui-kit`).
   - Chọn 5 người $\to$ bấm Chia kèo $\to$ đổi thủ công 2 người $\to$ bấm Vào sân.
   - *Kỳ vọng:* Biểu ngữ cam `"Đang ngoại tuyến"` hiện ở đầu màn hình, đếm đúng số thao tác chờ; `balanceCourt` chạy ngay không treo.
2. **Mất mạng khi đang nhập tỷ số & kết thúc trận:**
   - Đang ở màn `/court/score` trong trạng thái Chế độ máy bay.
   - Bấm cộng điểm đến `21-19` $\to$ bấm Kết thúc trận $\to$ chấm thẻ 5s $\to$ Xác nhận.
   - *Kỳ vọng:* Không crash; kết quả được lưu vào `ActionQueue` với khóa `idempotencyKey`, số thao tác chờ đồng bộ tăng lên.
3. **Mạng yếu / chập chờn & mạng quay lại:**
   - Thử bật lại Wi-Fi/4G nhưng giới hạn băng thông (hoặc tắt rồi bật lại ngay).
   - *Kỳ vọng:* Hàng đợi tự động đồng bộ FIFO khi có mạng ổn định, không gửi trùng 2 lần, biểu ngữ biến mất khi đồng bộ xong (`0 thao tác chờ`).

---

## 4. Phiếu ghi kết quả chạy 84 Ca kiểm thử (`TC-001` – `TC-084`)

> Ghi chú trạng thái: `PASS` (Đạt) | `FAIL` (Trượt — mở kèm mã `BUG-xxx` trong `bug-log.md`) | `BLOCKED` (Bị chặn).

| Mã TC | Mô tả ngắn | Mức | Kết quả (PASS/FAIL/BLOCKED) | Thiết bị | Phiên bản App | Ảnh minh chứng | Ghi chú |
|---|---|---:|---|---|---|---|---|
| `TC-001` | Đăng ký email/mật khẩu hợp lệ | P0 | | | | | |
| `TC-002` | Chặn email sai định dạng | P1 | | | | | |
| `TC-003` | Đăng nhập & giữ phiên AsyncStorage | P0 | | | | | |
| `TC-004` | Đăng nhập sai mật khẩu báo lỗi thân thiện | P0 | | | | | |
| `TC-005` | Quên mật khẩu gửi mã/email khôi phục | P2 | | | | | |
| `TC-006` | Onboarding 10 câu mức thấp nhất -> Cấp 1 (1100) | P0 | | | | | |
| `TC-007` | Onboarding 10 câu mức cao nhất -> Cấp 6 (1900) | P1 | | | | | |
| `TC-008` | Khai báo tay thuận, vị trí, khu vực Đà Nẵng | P0 | | | | | |
| `TC-009` | Chặn tên hiển thị < 2 ký tự | P1 | | | | | |
| `TC-010` | Hiển thị Player Card, Elo, Tập sự | P0 | | | | | |
| `TC-011` | Đủ 5 trận chuyển sang Chính thức (K=24) | P1 | | | | | |
| `TC-012` | Sửa hồ sơ & đổi khu vực thành công | P1 | | | | | |
| `TC-013` | Tìm đồng đội xếp theo điểm phù hợp | P0 | | | | | |
| `TC-014` | Lọc Tìm đồng đội nội dung Đôi nam | P0 | | | | | |
| `TC-015` | Lọc Tìm đồng đội nội dung Đôi nam nữ | P0 | | | | | |
| `TC-016` | EmptyState khi không có đồng đội phù hợp | P1 | | | | | |
| `TC-017` | Biên Partner Finder lệch đúng 150 Elo (hiện) | P0 | | | | | |
| `TC-018` | Biên Partner Finder lệch đúng 151 Elo (loại) | P0 | | | | | |
| `TC-019` | Tạo kèo 1 sân thành công | P0 | | | | | |
| `TC-020` | Chặn tạo kèo tiêu đề ngắn / giờ quá khứ | P1 | | | | | |
| `TC-021` | Tạo kèo 2 sân độc lập | P0 | | | | | |
| `TC-022` | Chặn tạo sân thứ 3 (CR-01) | P0 | | | | | |
| `TC-023` | Thêm thành viên Ghost chưa có tài khoản | P0 | | | | | |
| `TC-024` | Chặn thêm người thứ 9 vào sân (8/8) | P0 | | | | | |
| `TC-025` | Xóa người mặc định khỏi roster | P1 | | | | | |
| `TC-026` | Suất tuyển: 4 mặc định -> 4 suất (S1) | P0 | | | | | |
| `TC-027` | Suất tuyển: 4 mặc định + 4 vãng lai -> 0 suất (S2) | P0 | | | | | |
| `TC-028` | Suất tuyển: 5 mặc định + 1 vãng lai -> còn 2 (S3) | P0 | | | | | |
| `TC-029` | Suất tuyển: 8 mặc định -> 0 suất (S6) | P0 | | | | | |
| `TC-030` | Suất tuyển: < 4 mặc định chặn mở tuyển (S8/A1) | P0 | | | | | |
| `TC-031` | Nữ xin vào Đôi nam bị chặn (E1) | P0 | | | | | |
| `TC-032` | Nam xin vào Đôi nữ bị chặn (E2) | P0 | | | | | |
| `TC-033` | Đôi nam nữ 3M+1F cho phép thêm 1 Nam (E3) | P0 | | | | | |
| `TC-034` | Đôi nam nữ 4M+1F chặn thêm Nam thứ 5 (E4) | P0 | | | | | |
| `TC-035` | Chặn trình độ ngoài dải / uy tín thấp (E7/E8) | P0 | | | | | |
| `TC-036` | Host duyệt đơn -> cập nhật realtime < 1.5s | P0 | | | | | |
| `TC-037` | Hết suất tự động vào Waitlist (E10) | P0 | | | | | |
| `TC-038` | Hai người tranh suất cuối -> khóa version (E12) | P0 | | | | | |
| `TC-039` | Hủy suất -> tự động đôn Waitlist | P0 | | | | | |
| `TC-040` | Đôn Waitlist bỏ qua người sai giới tính (E13) | P1 | | | | | |
| `TC-041` | Chia cặp sân 4 người (B1) | P0 | | | | | |
| `TC-042` | Chia cặp ca lẻ 5 người nghỉ luân phiên (B6) | P0 | | | | | |
| `TC-043` | Chia cặp sân 6 người (B7) | P0 | | | | | |
| `TC-044` | Chia cặp ca lẻ 7 người nghỉ luân phiên (B5) | P0 | | | | | |
| `TC-045` | Chia cặp sân 8 người vòng tròn (B2) | P0 | | | | | |
| `TC-046` | Mọi người cùng điểm Elo (diff=0, seed) (B8) | P1 | | | | | |
| `TC-047` | Một người điểm cực cao -> cảnh báo lệch (B9) | P0 | | | | | |
| `TC-048` | Cặp khóa chênh điểm lớn -> giữ cặp + cảnh báo (B10) | P0 | | | | | |
| `TC-049` | Chặn danh sách 3 hoặc 9 người (B12) | P0 | | | | | |
| `TC-050` | Giữ nguyên 2 cặp khóa khi chia kèo | P0 | | | | | |
| `TC-051` | Đổi thủ công 2 người cập nhật cân bằng ngay | P0 | | | | | |
| `TC-052` | Đổi lệch > 200 điểm chỉ cảnh báo không chặn | P0 | | | | | |
| `TC-053` | Vận hành 2 sân độc lập không đè dữ liệu | P0 | | | | | |
| `TC-054` | Chế độ Fun Match xoay tua đa dạng | P2 | | | | | |
| `TC-055` | Tỷ số set chuẩn BWF hợp lệ (21-19, 22-20, 30-29) | P0 | | | | | |
| `TC-056` | Chặn tỷ số set chưa hợp lệ (21-20, 31-29, 15-10) | P0 | | | | | |
| `TC-057` | Chặn tự chấm thẻ đánh giá chính mình | P0 | | | | | |
| `TC-058` | Chấm thẻ 5s sau trận cho đồng đội/đối thủ | P0 | | | | | |
| `TC-059` | Elo: đội yếu thắng áp đảo -> delta cao | P0 | | | | | |
| `TC-060` | Elo: đội mạnh thắng sát nút -> delta thấp | P1 | | | | | |
| `TC-061` | Bấm kết thúc trận 2 lần -> Idempotent (R4) | P0 | | | | | |
| `TC-062` | Bùng kèo trừ 15 uy tín, không âm, hồi dần | P1 | | | | | |
| `TC-063` | Lịch sử trận đấu hiện tỷ số & +/- Elo | P0 | | | | | |
| `TC-064` | Lọc lịch sử theo thời gian | P1 | | | | | |
| `TC-065` | Đồng đội ăn ý (>= 3 trận, >= 60% thắng) | P1 | | | | | |
| `TC-066` | Admin khóa/mở tài khoản vi phạm | P2 | | | | | |
| `TC-067` | Admin xử lý khiếu nại hoàn uy tín | P2 | | | | | |
| `TC-068` | Admin thêm danh mục sân Đà Nẵng | P2 | | | | | |
| `TC-069` | Offline: lưu SessionSnapshot trước khi mất mạng | P0 | | | | | |
| `TC-070` | Offline: chia kèo & nhập tỷ số khi mất mạng | P0 | | | | | |
| `TC-071` | Offline: tự đồng bộ FIFO khi có mạng lại | P0 | | | | | |
| `TC-072` | Offline: backoff khi lỗi mạng & xử lý xung đột | P0 | | | | | |
| `TC-073` | Thông báo cục bộ nhắc lịch trước 1h & hủy khi rời | P1 | | | | | |
| `TC-074` | Trung tâm thông báo cập nhật realtime | P1 | | | | | |
| `TC-075` | Chạm thông báo -> đánh dấu đọc & mở đúng kèo | P1 | | | | | |
| `TC-076` | NFR: Thời gian chia kèo 8 người < 1 giây | P0 | | | | | |
| `TC-077` | NFR: Tối đa 3 chạm từ Home đến phương án chia | P0 | | | | | |
| `TC-078` | NFR: Thao tác một tay, nút >= 48dp | P0 | | | | | |
| `TC-079` | NFR: Độ tương phản nền tối & cỡ chữ lớn | P1 | | | | | |
| `TC-080` | NFR: Tương thích Android & iOS (Expo Go) | P0 | | | | | |
| `TC-081` | Security UI: Player không sửa được Elo/role | P0 | | | | | |
| `TC-082` | Security UI: Non-host không thấy nút quản lý kèo | P0 | | | | | |
| `TC-083` | Security Rules: Chặn sửa Elo/role trên Emulator | P0 | | | | | |
| `TC-084` | Security Rules: Chặn duyệt đơn hộ / sửa ratingProcessed | P0 | | | | | |

---

## 5. Tổng hợp kết quả chạy *(Điền sau khi TV2 chạy xong)*
- **Tổng số ca đã chạy:** `[Chờ TV2 điền]` / 84
- **Số ca Đạt (PASS):** `[Chờ TV2 điền]`
- **Số ca Trượt (FAIL):** `[Chờ TV2 điền]`
- **Số ca Bị chặn (BLOCKED):** `[Chờ TV2 điền]`
- **Tổng số lỗi phát sinh theo mức nghiêm trọng:** Blocker: `[ ]` | Critical: `[ ]` | Major: `[ ]` | Minor: `[ ]` | Trivial: `[ ]`
