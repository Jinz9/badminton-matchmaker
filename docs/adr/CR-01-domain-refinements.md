# YÊU CẦU THAY ĐỔI NGHIỆP VỤ (CHANGE REQUEST - CR-01)

**Dự án:** Hệ thống ghép đội và cân bằng kèo cầu lông (Mobile App)  
**Mã tài liệu:** `CR-01-domain-refinements`  
**Ngày đề xuất:** 2026-11-15  
**Người đề xuất & Phê duyệt:** Đào Duy Nhật (TV1 - PM, BA, Backend & Thuật toán)  
**Trạng thái:** 🟢 ĐÃ PHÊ DUYỆT (Approved)  
**Căn cứ phê duyệt:** [docs/DECISIONS-PENDING.md](file:///d:/QLDAPM/docs/DECISIONS-PENDING.md)  

---

## 1. BỐI CẢNH & LÝ DO THAY ĐỔI
Trong quá trình soạn thảo Đặc tả Yêu cầu Phần mềm (SRS - WBS 2.2) và chuẩn hóa Thang đo trình độ (WBS 2.1), khi đối chiếu giữa lý thuyết thiết kế ban đầu trong các skill mẫu (`badminton-domain-rules`, `badminton-rating`) với thực tế sinh hoạt cầu lông phong trào tại các cụm sân Đà Nẵng (Kỳ Đồng, Tuyên Sơn, Quân Khu 5), nhóm phát hiện một số điểm chưa tối ưu cần điều chỉnh để tăng tính khả thi và trải nghiệm người dùng (UX).

---

## 2. BẢNG SO SÁNH NỘI DUNG THAY ĐỔI

| Hạng mục | Quy định ban đầu trong Skill mẫu | Nội dung điều chỉnh mới (CR-01) | Lý do & Giá trị nghiệp vụ |
|---|---|---|---|
| **Giả định A1 (Số người mở tuyển)** | Sân phải có tối thiểu **4 người mặc định** mới được phép mở tuyển vãng lai. | Cho phép mở tuyển khi có từ **1 người mặc định trở lên**, miễn tổng số người trong sân không quá 8. | Nhiều trường hợp chỉ có 1–2 người quen muốn thuê sân và tuyển thêm 2–3 vãng lai; quy tắc cũ quá cứng nhắc sẽ hạn chế nhu cầu tạo kèo của host. |
| **Giả định A4 (Host thêm người khi đã tuyển vãng lai)** | Nếu host thêm người mặc định làm vượt chỗ: Chặn thao tác, host phải tự chọn 1 vãng lai đưa về dự bị. | **Khóa nút thêm người mặc định** nếu số vãng lai được duyệt đã đủ suất. Nếu chưa đủ suất, host vẫn thêm được người mặc định và hệ thống tự động trừ giảm số suất tuyển tương ứng. | Bảo vệ quyền lợi của người chơi vãng lai đã được duyệt trước đó, tránh việc host tùy tiện đẩy người ta về dự bị gây bức xúc và giảm uy tín hệ thống. |
| **Giả định A5 (Cảnh báo lệch trình độ)** | Chặn hoàn toàn không cho người chơi lệch dải trình độ nộp đơn. | Cho phép nộp đơn nhưng hệ thống gắn nhãn cảnh báo nổi bật **"Lệch trình độ"** cho Host cân nhắc. | Giúp tăng độ linh hoạt khi host thiếu người gấp chấp nhận người chơi lệch trình độ vào giao lưu. |
| **Giả định A7 (Phục hồi điểm uy tín)** | Chỉ có quy định trừ điểm uy tín khi hủy/bùng kèo, không có cơ chế hồi phục. | Bổ sung cơ chế: Tham gia trọn vẹn 1 buổi đánh (không bùng, đúng giờ) được **cộng hoàn lại $+1$ điểm uy tín** (tối đa 100). | Tạo động lực và khuyến khích người chơi có ý thức tích lũy, sửa sai và gắn bó lâu dài với ứng dụng. |
| **Số trận hiệu chỉnh ban đầu ($N$)** | Skill mẫu mặc định $N = 10$ trận với $K = 40$. | Rút ngắn xuống **$N = 5$ trận đầu** với $K = 40$, sau đó chuyển về $K = 24$. | Đối với app phong trào sinh viên, 10 trận là quá dài đối với người chơi vãng lai; 5 trận là vừa đủ để kéo điểm về thực lực thực tế. |
| **Trọng số cặp 2 tay trái** | Skill mẫu trừ $-10$ điểm vì lý do dễ hở biên. | Điều chỉnh về **0 điểm (mức trung tính)**, không trừ điểm. | Trong đánh đôi phong trào, việc trừ điểm người chơi thuận tay trái khi bắt cặp với nhau tạo cảm giác phân biệt và không cần thiết. |

---

## 3. TÁC ĐỘNG HỆ THỐNG & KẾT QUẢ ĐỒNG BỘ
- **Tài liệu SRS (`docs/07-srs.md`):** Đã cập nhật toàn bộ các giả định A1, A4, A5, A7 và thang điểm theo nội dung mới của CR-01.
- **Mã nguồn Domain (`src/domain/` & `src/config/`):**
  - `src/config/rating.ts`: Cấu hình $N=5$, trọng số tay trái = 0.
  - `src/domain/rating/initialRating.ts`: Thang điểm 6 cấp phong trào Đà Nẵng.
- **Kế hoạch kiểm thử (`WBS 5.1`):** Cập nhật các ca kiểm thử biên (boundary test) phản ánh đúng các quy tắc mới.
