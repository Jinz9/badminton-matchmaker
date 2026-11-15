# Frame `01` (`1:3099`) & Frame `02` (`1:2724`) — Đối chiếu Figma Tại Sân (Chạm 1 & Chạm 2)

## 1. Frame `01 - Home Sân Đấu (Chạm 1)` (`1:3099`, `390 × 922`)

### Cấu trúc node từ Figma XML (`1:3099`) & Ảnh chụp 100%
1. **Header (`1:3267`, `390 × 64`)**
   - Tiêu đề sân: `Sân Cầu Lông Tiên Sơn - Đà Nẵng` (`1:3271`)
   - Trạng thái dưới tiêu đề (`1:3273`): chấm xanh + `TRỰC TIẾP TẠI SÂN`
   - Cụm nút phải (`1:3277`): `Button - Thông báo` (`44×44`, `1:3278`) + Avatar người dùng (`32×32`, `1:3281`)
2. **Layer 1: Header Thông Tin Kèo Context (`1:3102`, `358 × 90`)**
   - Tiêu đề phiên kèo: `Tối T3 • Sân Tiên Sơn`
   - Pill trạng thái phải: chấm xanh neon + `ĐANG HOẠT ĐỘNG`
   - Dòng phụ (`1:3111`):
     - Figma gốc: `16 VĐV có mặt • 4 sân sẵn sàng` (`PHIÊN #04`)
     - **Áp dụng CR-01 (`FIG-01`):** Tối đa **2 sân/kèo**, tối đa **8 người/sân** (hiển thị đúng số người có mặt thực tế của kèo từ Repository và tối đa `2 sân sẵn sàng`).
3. **Layer 2: Danh Sách Sân Đang Đánh (`1:3123`, `358 × 390`)**
   - **Sub-layer 2.1: Card Sân 01 (`1:3124`, `358 × 244` — Đang Trống, CTA Chạm 1):**
     - Header card (`1:3126`): chấm xanh neon + `SÂN 01` | Pill phải: `SÂN 01 • ĐANG TRỐNG`
     - Sơ đồ sân SVG (`1:3133`, `326 × 96`): đường kẻ sân SVG nét đứt + pill giữa sân `🏁 Sẵn sàng ghép cặp đấu mới`
     - Nút CTA lớn (`1:3143`, cao `58px`): nền xanh neon `#A3E636`, chữ đậm tối `⚡ CHIA KÈO SÂN 1 [CHẠM 1]`
   - **Sub-layer 2.2: Card Sân 02 (`1:3149`, `358 × 134` — Đang Thi Đấu):**
     - Header card (`1:3151`): chấm xanh dương + `SÂN 02` | Pill đồng hồ phải: `⏱ 14:20 • SET 1` (`SÂN 02 • ĐANG THI ĐẤU`)
     - Hàng Đội hình & Tỷ số trực tiếp (`1:3161`, `326 × 68`):
       - Đội A (chấm cyan): `Minh / Hùng` + badge `TB+`
       - Đội B (chấm cam/hổ phách): `Lan / Tuấn` + badge `TB+`
       - Cụm điểm trực tiếp (`Score Split Badge`, `1:3175`): `18` (xanh neon) `-` `15` (trắng)
   - **Quy tắc CR-01:** Tuyệt đối không hiển thị sân thứ 3 hoặc thứ 4.
4. **Layer 3: Bottom Hàng Đợi Chờ (`1:3184`, `358 × 226`)**
   - Header hàng đợi (`1:3186`): `⏳ Hàng đợi ưu tiên` | Nhãn phải: `SẮP XẾP: NGHỈ LÂU`
   - Lưới 6 chip người chơi nhanh (`1:3194`, 2 cột × 3 hàng, mỗi chip `174 × 56`):
     1. `HA` — `Hoàng Anh` (`Nghỉ 25p`) — badge `Khá` (tím)
     2. `TV` — `Thảo Vy` (`Nghỉ 22p`) — badge `TB-` (vàng)
     3. `ĐM` — `Đức Mạnh` (`Nghỉ 18p`) — badge `TB+` (xanh dương)
     4. `KL` — `Khánh Linh` (`Nghỉ 15p`) — badge `TB` (xanh lá)
     5. `TK` — `Tuấn Kiệt` (`Nghỉ 10p`) — badge `TB` (xanh lá)
     6. `BT` — `Bảo Trâm` (`Nghỉ 8p`) — badge `Newbie` (xám nhạt)
5. **Bottom Navigation (`1:3284`, `390 × 80`)**
   - 4 tab dưới: `SÂN ĐẤU` (Tại sân), `HÀNG ĐỢI` (Tìm bạn), `BẢNG ĐIỂM` (Lịch sử), `HỒ SƠ` (thay tab Thu tiền ngoài phạm vi bằng Hồ sơ theo `FIG-05`).

---

## 2. Frame `02 - Chọn Người & Cân Trình (Chạm 2)` (`1:2724`, `390 × 927`)

### Cấu trúc node từ Figma XML (`1:2724`) & Ảnh chụp 100%
1. **Header (`1:2966`, `390 × 64`)**
   - Nút `Button - Quay lại` (`44 × 44`, `1:2969`, kèm `hitSlop` >= 48dp)
   - Tiêu đề `Heading 1` (`1:2972`): `Chọn Người & Cân Trình`
   - Avatar góc phải (`32 × 32`, `1:2974`)
2. **Progress Bar (`1:2727`, `390 × 38`)**
   - Chấm xanh + `TIẾN TRÌNH CHIA SÂN` | Nhãn phải: `Chạm 2 / 3 Chạm`
   - Thanh tiến trình 66% (`2/3`)
3. **Top Hero Visual (`1:2737`, `390 × 112`)**
   - Banner thông tin nhanh sân đang chọn (`Sân 01 • Đang chọn đội hình 4–8 VĐV có mặt tại sân`)
4. **Section 1: `Top_Preview_4_Slot` — 4 Ô Xếp Hàng Đã Chọn (`1:2753`, `390 × 168`)**
   - Header (`1:2755`): `ĐỘI HÌNH RA SÂN (4 Ô ĐÃ CHỌN)` + nút phải `Xóa hết` (`1:2760`)
   - Lưới `4 Horizontal Compact Slots` (`1:2765`, 2 cột × 2 hàng, mỗi ô `175 × 64`):
     - `Slot 1` (`1:2766`): Avatar chữ cái + Tên + LevelBadge + Elo + nút `Button - Xóa slot 1` (`×`)
     - `Slot 2` (`1:2782`): Avatar chữ cái + Tên + LevelBadge + Elo + nút `Button - Xóa slot 2` (`×`)
     - `Slot 3` (`1:2798`): Avatar chữ cái + Tên + LevelBadge + Elo + nút `Button - Xóa slot 3` (`×`)
     - `Slot 4` (`1:2814`): Avatar chữ cái + Tên + LevelBadge + Elo + nút `Button - Xóa slot 4` (`×`)
   - Khi sân có 5–8 người (đặc biệt ca lẻ **5 người** và **7 người** theo `CR-01`), hiển thị rõ danh sách **Người nghỉ luân phiên hiệp 1** (`restingMembers` từ hàm thuần `balanceCourt`).
5. **Section — Live Balance Meter (`1:2830`, `390 × 86`)**
   - Đồng hồ cân bằng trực tiếp cập nhật tức thì mỗi khi chọn/bỏ chọn người chơi (gọi hàm thuần `balanceCourt` của TV1 ở chế độ xem trước khi số người đã chọn `>= 4`).
   - Hiển thị tỷ lệ cân bằng (`51% vs 49%`), độ lệch Elo (`ΔElo`), trạng thái cân kèo, và danh sách đội A / đội B / người nghỉ xoay vòng dự kiến.
6. **Section 2: `Grid_Chon_Nhanh_Ngon_Cai` — Lưới Chọn Nhanh Vùng Ngón Cái (`1:2845`, mỗi ô `174 × 76` >= `80 × 64px`)**
   - Header (`1:2847`): `CHỌN NHANH VÙNG NGÓN CÁI` + số lượng đã chọn (`Đã chọn X/8 VĐV`)
   - Lưới 2 cột các nút chọn lớn (`174 × 76px`), có viền trái xanh neon `6px` + dấu tích `✓` khi đang chọn, nút xem nhanh hồ sơ `ⓘ` để mở modal hồ sơ VĐV.
   - Cưỡng chế giới hạn **4 đến 8 người/sân** (`RULES.COURT_CAPACITY = 8`): nếu bấm chọn người thứ 9 thì chặn lại và báo lỗi thân thiện tiếng Việt.
7. **Coordinator Tactile Notes Pill (`1:2940`, `358 × 37`)**
   - Ghi chú nhanh cho người điều phối (ví dụ: `"Ghi chú điều phối: Ưu tiên ghép người nghỉ lâu & xoay vòng công bằng"` — có thể chạm để đổi ghi chú nhanh hoặc nhập ghi chú).
8. **Section 3: `Bottom_Action_Dock` (`1:2949`, `390 × 94`)**
   - `Status micro bar` (`1:2950`): trạng thái đủ người / thời gian tính toán `< 1ms`
   - `Massive Neon CTA Button (Chạm 2, 58px Height)` (`1:2958`): `XEM KÈO CÂN BẰNG [CHẠM 2]`
9. **Modal Hồ Sơ Người Chơi (`Overlay+OverlayBlur`, `1:2977`, `390 × 648`)**
   - Header hồ sơ (`1:2979`): Avatar chữ cái `48×48` (`HA`), tên `Hoàng Anh`, badge `KHÁ`, `1,520 Elo • CLB Cầu Lông Đêm`, nút đóng `×` (`1:2994`)
   - 3 ô thống kê (`1:2998`):
     - `75%` — `TỶ LỆ THẮNG`
     - `18` — `TRẬN THẮNG`
     - `6` — `TRẬN THUA`
   - Khối `CHỈ SỐ KỸ NĂNG & THỂ LỰC` (`1:3015`) + độ ổn định (`Phong độ cao` / Uy tín & Độ ổn định):
     - `Tấn công đập cầu` (`88 km/h`)
     - `Phòng thủ & Điều cầu` (`82%`)
     - `Thể lực & Độ bền` (`90%`)
   - Khối `LỊCH SỬ 3 TRẬN GẦN NHẤT` (`1:3046`):
     - `W` `21 - 19 (vs Đức Mạnh / Khánh Linh)` • `12 phút trước • Sân 01` • `+15 Elo`
     - `W` `21 - 17 (vs Tuấn Kiệt / Bảo Trâm)` • `35 phút trước • Sân 02` • `+12 Elo`
     - `L` `19 - 21 (vs Minh / Hùng)` • `Hôm qua • Sân 01` • `-10 Elo`
   - Hàng 2 nút dưới (`1:3092`):
     - Nút trái (`1:3093`): `ĐÓNG` (Thu gọn modal)
     - Nút phải (`1:3095`, xanh neon): `⚡ XẾP SÂN KẾ TIẾP` (Chọn/Bỏ chọn người chơi vào sân)

