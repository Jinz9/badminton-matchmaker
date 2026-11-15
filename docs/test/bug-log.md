# BẢNG THEO DÕI VÀ XỬ LÝ LỖI (BUG LOG)

> **Mã tài liệu:** `docs/test/bug-log.md`  
> **Áp dụng cho:** Toàn bộ hệ thống (Mobile App TV2 & Backend/Domain TV1)  
> **Nguyên tắc ghi nhận:**  
> - Dữ liệu lỗi được ghi nhận từ kiểm thử thực tế của TV2 trên thiết bị, từ kết quả chạy test tự động, hoặc từ phản hồi thực địa.  
> - **Tuyệt đối không bịa lỗi:** Chỉ ghi nhận các lỗi thực tế phát sinh trong quá trình tích hợp và kiểm thử.  
> - Quy trình sửa lỗi: *Tạo test tái hiện (Đỏ) $\to$ Sửa mã nguồn $\to$ Test hồi quy thành công (Xanh) $\to$ Đóng lỗi*.

---

## 1. Định Nghĩa Mức Độ Nghiêm Trọng (Severity Levels)

| Mức Độ | Ký Hiệu | Định Nghĩa | Thời Gian Xử Lý Mục Tiêu |
| :--- | :---: | :--- | :---: |
| **Blocker** | 🔴 | Làm sập ứng dụng (crash), mất dữ liệu, hoặc chặn đứng hoàn toàn luồng nghiệp vụ chính (không thể đăng nhập, không thể tạo kèo). | Trong vòng 4 giờ |
| **Critical** | 🟠 | Lỗi nghiệp vụ nghiêm trọng (tính sai điểm Elo, chia sân vi phạm luật 8 người/sân, nhận vượt quá số suất tuyển). | Trong vòng 12 giờ |
| **Major** | 🟡 | Tính năng hoạt động không đúng kỳ vọng nhưng có giải pháp thay thế tạm thời (lọc danh sách sai thứ tự, giao diện không hiển thị cảnh báo chênh lệch). | Trong vòng 24 giờ |
| **Minor** | 🔵 | Lỗi nhỏ về hiển thị, giao diện bị tràn chữ trên màn hình nhỏ, định dạng ngày giờ chưa chuẩn tiếng Việt. | Trong vòng 48 giờ |
| **Trivial** | ⚪ | Lỗi chính tả, màu sắc icon lệch nhẹ so với design token, đề xuất cải tiến nhỏ. | Cuối sprint |

---

## 2. Bảng Theo Dõi Lỗi (Bug Tracking Table)

*Ghi chú trạng thái: `OPEN` (Mới phát hiện) | `IN_PROGRESS` (Đang sửa) | `RESOLVED` (Đã sửa & có test) | `VERIFIED` (TV2 đã xác nhận trên máy thật) | `CLOSED` (Hoàn tất)*

| Mã Bug | Tiêu Đề / Mô Tả Tóm Tắt | Module | Mức Độ | Người Báo | Phụ Trách | Trạng Thái | Commit Sửa / Test Hồi Quy | Kết Quả Xác Minh |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :--- | :--- |
| **BUG-001** | *(Chờ TV2 ghi nhận khi test thiết bị)* | Mobile | Minor | TV2 | TV2 | OPEN | `[Chờ commit]` | `[TV2 điền]` |
| **BUG-002** | *(Chờ TV2 ghi nhận khi test thiết bị)* | Backend | Critical | TV2 | TV1 | OPEN | `[Chờ commit]` | `[TV2 điền]` |

---

## 3. Biểu Mẫu Ghi Nhận Lỗi Dành Cho TV2 (Bug Report Template)

Khi phát hiện lỗi trên ứng dụng di động hoặc trong quá trình gọi API/Domain, TV2 copy mẫu dưới đây để thêm vào bảng:

```markdown
### [MÃ BUG] - Tên ngắn gọn của lỗi
- **Ngày phát hiện:** YYYY-MM-DD
- **Thiết bị thử nghiệm:** (Ví dụ: iPhone 13 iOS 17.4 / Samsung Galaxy A53 Android 13)
- **Module:** (Auth / PartnerFinder / RecruitSlots / MatchLobby / CourtBalancing / EloRating / Stats)
- **Mức độ nghiêm trọng:** Blocker / Critical / Major / Minor / Trivial
- **Các bước tái hiện (Steps to Reproduce):**
  1. Bước 1...
  2. Bước 2...
  3. Bước 3...
- **Kết quả thực tế (Actual Result):** Ứng dụng báo lỗi X / văng app / tính ra Y
- **Kết quả kỳ vọng (Expected Result):** Phải hiển thị Z / tính ra đúng luật W
- **Hình ảnh / Video / Log đính kèm:** (Đường dẫn hoặc ảnh màn hình)
```

---

## 4. Thống Kê Lỗi Hệ Thống (Bug Metrics)

- **Tổng số lỗi ghi nhận:** 0 lỗi hoạt động (Chờ TV2 điền kết quả thực tế từ đợt kiểm thử thiết bị M9/M10).
- **Lỗi Blocker / Critical:** 0
- **Lỗi đã giải quyết (Resolved/Closed):** 0
- **Tỷ lệ đóng lỗi:** 100%
