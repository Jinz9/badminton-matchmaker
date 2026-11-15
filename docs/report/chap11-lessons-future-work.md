# CHƯƠNG 11: BÀI HỌC KINH NGHIỆM VÀ HƯỚNG PHÁT TRIỂN

> **Mã tài liệu:** `docs/report/chap11-lessons-future-work.md`  
> **Chủ đề:** Đúc kết kinh nghiệm quản trị dự án phần mềm, bài học kỹ thuật, các hạn chế còn tồn tại và lộ trình phát triển giai đoạn tiếp theo

---

## 11.1. Bài Học Kinh Nghiệm Trong Quản Trị Dự Án (PM Lessons Learned)

1. **Khảo sát thực địa sớm là yếu tố sống còn (Validate Assumptions Early):**
   - *Kinh nghiệm:* Ban đầu kế hoạch lý thuyết đặt ra quy mô chia cặp 8–16 người một lượt và các ca lẻ 9, 11, 13 người. Tuy nhiên, việc đi thực tế tại sân Kỳ Đồng và phỏng vấn các Host phong trào ngay từ Tuần 1 đã giúp nhóm nhận ra mâu thuẫn này. Nhóm kịp thời ban hành Change Request **CR-01** để chuyển sang mô hình độc lập từng sân 4–8 người, cứu dự án khỏi nguy cơ phải đập đi xây lại ở các sprint sau.
2. **Hợp đồng Dữ liệu (Data Contract) giải phóng sự phụ thuộc giữa Backend và Mobile Dev:**
   - *Kinh nghiệm:* Việc TV1 sớm ban hành `data-contract.md` v1.0 kèm bộ dữ liệu giả lập JSON độc lập tại tuần thứ 3 đã giúp TV2 có thể tự tin dựng toàn bộ giao diện Expo Router và State management mà không phải đợi backend deploy.
3. **Quy tắc phân định sở hữu thư mục (Ownership Boundary):**
   - *Kinh nghiệm:* Phân chia rạch ròi thư mục sở hữu (`docs/`, `src/domain/` cho TV1; `src/app/`, `src/components/` cho TV2) giúp nhóm đạt tỷ lệ xung đột mã nguồn (Merge Conflict) bằng **0%** trong suốt 12 tuần làm việc trên Git.
4. **Kỷ luật kiểm thử tự động (TDD & Automation):**
   - *Kinh nghiệm:* Viết test trước cho các hàm thuần nghiệp vụ giúp nhóm tự tin thực hiện tái cấu trúc (refactoring) và tích hợp liên tục mà không lo sợ phát sinh lỗi hồi quy.

---

## 11.2. Bài Học Kỹ Thuật (Technical Lessons Learned)

1. **Ưu tiên Hàm thuần (Pure Functions) cho logic nghiệp vụ lõi:**
   - Việc thiết kế thuật toán cân kèo `balanceCourt`, tính suất `computeSlots` và tính điểm `calculateMatchElo` dưới dạng hàm thuần túy (không dính dáng tới Firebase SDK hay React Native) giúp thuật toán có thể tái sử dụng linh hoạt: Chạy được ở Client khi mất mạng, chạy được trên Cloud Functions, và kiểm thử cực nhanh trên Jest ($< 0.05\text{ ms}$).
2. **Xử lý môi trường mạng yếu bằng kiến trúc Offline-First:**
   - Tại các sân mái tôn kín ở Đà Nẵng, sóng di động rất kém. Nhóm đã áp dụng chiến lược Snapshot + Action Queue kết hợp quy tắc **Host-Authority** để giải quyết xung đột, mang lại trải nghiệm mượt mà không độ trễ cho người dùng tại sân.
3. **Bảo mật đa tầng trên Backend BaaS:**
   - Cloud Firestore rất tiện lợi nhưng nếu không có Security Rules chặt chẽ thì người dùng có thể can thiệp sửa điểm hoặc duyệt đơn trái phép. Việc viết bộ test 60 ca trên Firebase Emulator giúp loại bỏ hoàn toàn các lỗ hổng phân quyền.

---

## 11.3. Các Hạn Chế Còn Tồn Tại (Known Limitations)

Mặc dù đã hoàn thành vượt mức các mục tiêu cam kết trong phạm vi MVP, dự án vẫn còn một số điểm giới hạn:
1. **Chỉ số Elo chung cho 3 nội dung:** Hiện tại hệ thống vẫn đang gộp chung 1 chỉ số Elo duy nhất cho cả Đôi nam, Đôi nữ và Đôi nam nữ (theo Giả định A6). Thực tế, phong độ và vai trò của một người chơi nam khi đánh đôi nam có sự khác biệt so với khi đánh đôi nam nữ.
2. **Cơ chế thanh toán tiền sân:** Ứng dụng mới dừng lại ở việc sinh mã VietQR để người chơi quét chuyển khoản ngân hàng thủ công; chưa tích hợp Webhook ngân hàng để tự động đối soát trạng thái "Đã chuyển tiền / Chưa chuyển".
3. **Phụ thuộc vào ý thức tự giác nhập điểm của Host:** Hiện tại kết quả trận đấu do Host nhập và xác nhận. Nếu Host nhập sai hoặc thiếu khách quan, hệ thống cần thêm thời gian để các người chơi khác gửi khiếu nại lên Admin.

---

## 11.4. Lộ Trình Phát Triển Tương Lai (Future Roadmap)

- **Giai đoạn 2 (Sau tốt nghiệp):**
  - Tách chỉ số thành **3 điểm Elo độc lập**: Elo Đôi Nam, Elo Đôi Nữ và Elo Đôi Nam Nữ.
  - Tích hợp cổng thanh toán tự động (VietQR Open Banking API) để tự động tick xác nhận người chơi đã đóng tiền sân.
  - Mở rộng phạm vi ra các tỉnh thành lân cận (Huế, Quảng Nam, TP. Hồ Chí Minh).
- **Giai đoạn 3 (Thương mại hóa & Mở rộng quy mô):**
  - Phát triển tính năng tổ chức Giải đấu phong trào (Tournament Bracket & Knockout).
  - Tích hợp tính năng Đặt sân trực tuyến (Booking court) liên kết trực tiếp với các nhà thi đấu cầu lông tại Đà Nẵng.

