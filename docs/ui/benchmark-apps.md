# KHẢO SÁT CÁC ỨNG DỤNG THỂ THAO & ĐẶT SÂN THAM KHẢO (BENCHMARK APPS)

**Mã tài liệu:** `docs/ui/benchmark-apps.md`  
**Giai đoạn kế hoạch:** Tuần 1 (WBS 1.4 — TV2 thực hiện)  
**Mục đích:** Tham khảo bố cục giao diện, luồng tạo kèo và thao tác tại sân từ 2–3 ứng dụng thể thao/đặt sân đang có trên thị trường để thiết kế Prototype Figma.

> [!NOTE]
> Nội dung nhận xét chi tiết dưới đây do **TV2 trực tiếp trải nghiệm ứng dụng và điền** vào các ô `[TV2 điền]`.

---

## 1. Bộ tiêu chí so sánh gợi ý
1. **Tìm kiếm & Lọc kèo:** Tốc độ lọc theo khu vực, giờ chơi, trình độ và số chỗ trống.
2. **Quản lý suất & Trình độ:** Cách hiển thị thang trình độ và kiểm soát người chơi vào kèo.
3. **Thao tác tại sân (Chia cặp & Bảng điểm):** Có hỗ trợ chia cặp cân bằng 4–8 người hay bảng điểm bấm 1 tay không.
4. **Trải nghiệm mạng yếu / Ngoài trời:** Độ tương phản màu sắc và khả năng dùng khi mất mạng.

---

## 2. Bảng đối chiếu 3 ứng dụng tham khảo

| Hạng mục | Ứng dụng 1: `[TV2 điền — VD: Reclub / Playtomic]` | Ứng dụng 2: `[TV2 điền — VD: Đặt sân cầu lông VN / AloSân]` | Ứng dụng 3: `[TV2 điền — Tùy chọn]` |
|---|---|---|---|
| **Nền tảng** | `[TV2 điền: iOS / Android]` | `[TV2 điền: iOS / Android]` | `[TV2 điền]` |
| **Điểm mạnh** | `[TV2 điền]` | `[TV2 điền]` | `[TV2 điền]` |
| **Điểm yếu** | `[TV2 điền]` | `[TV2 điền]` | `[TV2 điền]` |
| **Bố cục đáng học** | `[TV2 điền]` | `[TV2 điền]` | `[TV2 điền]` |
| **Áp dụng vào Badminton Matchmaker** | `[TV2 điền — VD: Thẻ kèo gọn, badge trình độ rõ]` | `[TV2 điền — VD: Lọc quận tại Đà Nẵng]` | `[TV2 điền]` |

---

## 3. Kết luận rút ra cho thiết kế Figma của nhóm
- **Điểm giữ lại / kế thừa:** `[TV2 điền]`
- **Điểm cải tiến riêng cho cầu lông Đà Nẵng (giá trị cốt lõi của đồ án):**
  - Bổ sung quy tắc **2 sân/kèo, 4–8 người/sân (`CR-01`)** và công thức suất tuyển **`min(4, 8 - mặc định)` (`CR-02`)** mà các app đặt sân thuần túy chưa giải quyết.
  - Bổ sung màn **Chia kèo 3 chạm & Chấm điểm 1 tay Offline** phục vụ sân mái tôn sóng yếu.
