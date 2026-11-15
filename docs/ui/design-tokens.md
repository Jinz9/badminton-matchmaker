# DESIGN TOKENS — HỆ THỐNG GHÉP ĐỘI CẦU LÔNG (FIGMA → EXPO)
**Nguồn trích xuất:** Figma `tlSBaqyisLDYJerlkRLlHq` (4 màn hình lõi `01` `1:3099`, `02` `1:2724`, `03` `1:3440`, `04` `1:3306`)  
**Phương pháp thu thập:**
- **Kích thước, bố cục, khoảng cách, vùng chạm:** Đọc trực tiếp từ cây node `get_metadata(0:1)`.
- **Bảng màu (`#HEX`):** Đo trực tiếp giá trị pixel trên ảnh PNG render 100% từ Figma canvas (do Figma MCP Starter Plan hết quota `get_design_context` và chế độ khách chưa mở khóa bảng Inspect CSS).
- **Font family, border-radius & shadow chi tiết:** Ghi nhận theo quan sát trực quan trên ảnh PNG; cần xác nhận lại trong bảng Inspect khi đăng nhập Figma nếu muốn thông số CSS nguyên bản 100%.

---

## 1. BẢNG MÀU (COLOR PALETTE)

### 1.1. Nền tối & Bề mặt (Dark Navy / Slate Surfaces)
| Token đề xuất | Mã `#HEX` thật (từ PNG) | Vai trò sử dụng trong Figma |
|---|---|---|
| `bg.canvas` | `#0B1326` | Nền chính toàn màn hình (tương phản cao dưới ánh đèn sân) |
| `bg.deep` | `#060E20` | Nền sâu (thanh công cụ / khu vực nhấn tối hơn) |
| `surface.card` | `#131B2E` | Thẻ nội dung cấp 1 (Card Đội A, Đội B, Sân 02, Modal nền) |
| `surface.elevated` | `#171F33` | Thẻ nổi / Header card / Khung chứa cấp 2 (`Card Sân 01`, `Bảng Điểm`) |
| `surface.interactive` | `#222A3D` / `#232B3E` | Nền ô chỉ số phụ, nút phụ (`Hoàn tác`, `+1 Quả cầu`, ô tỷ số `18 - 15`) |
| `border.subtle` | `#2E354A` | Viền mảnh thẻ, đường chia (divider), khung nét đứt sân trống |

### 1.2. Màu điểm nhấn chính (Neon Lime — Hành động & Trạng thái Live)
| Token đề xuất | Mã `#HEX` thật (từ PNG) | Vai trò sử dụng trong Figma |
|---|---|---|
| `brand.neonLime` | `#A3E636` | Nút CTA chính (`CHIA KÈO SÂN 1 [CHẠM 1]`, `VÀO SÂN NGAY [CHẠM 3]`) |
| `brand.neonGlow` | `#CCFF80` | Chữ/icon neon nổi bật, thanh tiến trình kỹ năng, chấm `ĐANG HOẠT ĐỘNG`, `+15 Elo` |
| `brand.neonTextDark` | `#416400` / `#0B1326` | Chữ & icon đậm đặt trên nền nút `#A3E636` (đạt tương phản cao) |
| `brand.neonSurface` | `#19262A` | Nền badge trạng thái xanh lá (`TIÊU CHUẨN`, badge `TB`) |

### 1.3. Màu phân biệt 2 đội & Trạng thái (Team A / Team B / Danger)
| Token đề xuất | Mã `#HEX` thật (từ PNG) | Vai trò sử dụng trong Figma |
|---|---|---|
| `teamA.cyan` | `#7BD0FF` | Chữ/số điểm lớn Đội A (`18`), chấm tròn Đội A, chữ `51%`, thanh tiến trình Đội A |
| `teamA.button` | `#00A6E0` | Nút bấm `+ ĐỘI A +1`, avatar `HA`, thanh kỹ năng phòng thủ |
| `teamA.surface` | `#0E5579` / `#1B435E` / `#1D3F5B` | Nền pill `Elo TB: 1450`, huy hiệu hạng `TB+` |
| `teamB.amber` | `#FFB783` / `#FFC7A1` | Chữ/số điểm lớn Đội B (`17`), chấm tròn Đội B, chữ `49%`, thanh tiến trình Đội B |
| `teamB.button` | `#8E4700` | Nút bấm `+ ĐỘI B +1` (tương phản ấm với nền tối) |
| `teamB.surface` | `#3B2B24` / `#43322B` | Nền pill `Elo TB: 1435`, nền huy hiệu hạng `TB-` |
| `status.danger` | `#93010B` | Nút CTA kết thúc trận (`KẾT THÚC & TRẢ SÂN`) |

### 1.4. Màu huy hiệu & Văn bản (Badges & Text)
| Token đề xuất | Mã `#HEX` thật (từ PNG) | Vai trò sử dụng trong Figma |
|---|---|---|
| `badge.purpleBg` | `#2E2B5A` | Nền huy hiệu cấp độ `Khá` |
| `text.primary` | `#DAE2FD` | Văn bản chính (tiêu đề, tên VĐV, số điểm Elo) |
| `text.secondary` | `#C2CAB0` | Văn bản phụ, mô tả lối chơi, thời gian |

*(Ghi chú đồng bộ `src/theme/colors.ts`: Nền tối `#0B1326` khớp gần tuyệt đối với `#0B132B` hiện có; có thể bổ sung ngay các token `#131B2E`, `#171F33`, `#A3E636`, `#CCFF80`, `#7BD0FF`, `#00A6E0`, `#FFB783`, `#8E4700`, `#93010B` vào `src/theme/colors.ts` ở bước Q02).*

---

## 2. KÍCH THƯỚC, KHOẢNG CÁCH & VÙNG CHẠM (ĐO TỪ `get_metadata`)

| Hạng mục | Giá trị thật (`px` / `dp`) | Bằng chứng từ node Figma |
|---|---|---|
| **Chiều rộng khung màn hình chuẩn** | `390 px` | Toàn bộ màn hình `01..28` (riêng `24` là `400 px`) |
| **Lề ngang màn hình (`paddingHorizontal`)** | `16 px` | Frame `390 px` chứa container `358 px` $\rightarrow$ `(390 - 358) / 2 = 16` |
| **Lề trong thẻ (`cardPadding`)** | `16 px` | Card `358 px` chứa nội dung `326 px` $\rightarrow$ `(358 - 326) / 2 = 16` |
| **Khoảng cách dọc giữa các section (`gap`)** | `8 px` – `16 px` | Chênh lệch wrapper `:margin` (`390` vs `374` = `16 px`, `168` vs `160` = `8 px`) |
| **Chiều cao Header bar** | `64 px` | `Header (390×64)` trên màn `01`, `02`, `04`, `10` |
| **Nút Quay lại (`Back Button`)** | `44 × 44 px` | `Button - Quay lại (44×44)` trên màn `02`, `10` |
| **Chiều cao CTA chính tại sân (Thumb-Zone)** | **`58 px`** | `Button - High-Ergonomic CTA: 58px` (`01`), `Massive Neon CTA (58px)` (`02`), `Vào Sân Ngay (58px)` (`03`), `Neon Lime CTA (58px)` (`06`) |
| **Chiều cao CTA phụ / màn hình ngoài sân** | `52 px` – `56 px` | `Xáo lại đội hình (52px)` (`03`), `Hoàn tác / +1 Quả cầu / Kết thúc (56px)` (`04`), nút màn `21`, `25`–`28` (`56px`) |
| **Vùng chạm chọn người chơi tại sân** | `≥ 80 × 64 px` | `Grid_Chon_Nhanh_Ngon_Cai (>= 80x64px per item)` trên màn `02` |
| **Vùng chạm bảng điểm 1 tay** | `173 × 256 px` | `Touch Area Doi A (173×256)` & `Touch Area Doi B (173×256)` trên màn `04` |
| **Vùng chạm tối thiểu (NFR-03)** | `≥ 48 × 48 dp` | Đạt chuẩn cho tất cả nút tại sân (riêng nút Back Header là `44×44`, nên mở rộng hitSlop lên `48×48` khi code) |

---

## 3. TYPOGRAPHY, BO GÓC & BÓNG (QUAN SÁT TRỰC QUAN — CẦN INSPECT NẾU CHỐT TUYỆT ĐỐI)

> Do Figma ở chế độ khách khóa bảng Inspect/Dev Mode, các thông số CSS dưới đây được ước lượng từ ảnh PNG 100% zoom để TV2 dùng tham chiếu khi dựng `src/theme/`:

- **Font chữ (Typography):**
  - Font không chân hiện đại dạng `Inter` / `System Sans` (chữ số rõ nét kiểu tabular cho `18 - 15`, `1,520 Elo`, `51% vs 49%`).
  - Phân cấp ước lượng:
    - Số điểm bảng tỷ số (`18`, `17`): `48–56 px`, Bold (`700–800`).
    - Tiêu đề màn hình / Phần trăm cân kèo (`51% vs 49%`, `Tối T3 • Sân Tiên Sơn`): `22–26 px`, Bold (`700`).
    - Tiêu đề Card / CTA chính (`CHIA KÈO SÂN 1`, `Hoàng Anh`): `16–18 px`, Bold (`700`).
    - Nội dung chi tiết / mô tả lối chơi: `13–14 px`, Regular/Medium (`400–500`).
    - Nhãn nhỏ / Badge (`P-Elo`, `TB+`, `PHẦN #04`): `11–12 px`, SemiBold (`600–700`).
- **Bo góc (`borderRadius` ước lượng từ ảnh):**
  - Card lớn (`Sân 01`, `Đội A`, `Đội B`, `Bảng điểm`): `16 px`.
  - Nút CTA lớn (`56–58 px`): `12–14 px`.
  - Pill trạng thái / Badge nhỏ (`SÂN 01 • ĐANG TRỐNG`, `VS`, `Khá`): `8–999 px` (pill tròn cho status bar, bo `6–8 px` cho badge hạng).
- **Bóng & Hiệu ứng (`shadow` / `blur`):**
  - Metadata xác nhận có sử dụng `:shadow` trên các nút CTA chính (`02`, `04`, `21`, `27`, `28`) và card nổi (`01` Sân 02, `06` VietQR, `09` Radar, `13` Hexagon, `20` Podium), cùng `Overlay+Blur` (`112×112`, `128×128`, `144×144`) tạo ánh sáng neon nền nhẹ (ambient glow) sau các card tiêu điểm.
