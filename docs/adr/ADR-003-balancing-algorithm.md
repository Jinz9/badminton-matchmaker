# ADR-003: LỰA CHỌN THUẬT TOÁN CHIA KÈO VÀ XẾP CẶP CÂN BẰNG SÂN ĐẤU (SESSION BALANCING)

**Trạng thái:** Đã chấp thuận (Accepted)  
**Ngày quyết định:** 15/11/2026  
**Người quyết định:** TV1 (Đào Duy Nhật - PM, Thuật toán & Data) & TV2 (Nguyễn Đức Đạt)  
**Mã WBS & Milestone:** WBS 3.3 & M6 | Căn cứ: CR-01  

---

## 1. Ngữ cảnh và Vấn đề (Context & Problem Statement)

Trong hệ thống ghép đội cầu lông, việc xếp cặp 4–8 người trên một sân sao cho:
1. Tổng điểm Elo của 2 đội chênh lệch nhỏ nhất ($|\text{Rating}_A - \text{Rating}_B| \to \min$).
2. Ràng buộc giới tính đúng theo nội dung (`men`, `women`, `mixed`).
3. Luân phiên người nghỉ công bằng tuyệt đối cho ca lẻ 5 người và 7 người (chênh lệch số trận giữa 2 người bất kỳ $\le 1$).
4. Hỗ trợ cặp khóa (người chơi tự bắt cặp hoặc Host gán cố định).
5. Tốc độ phản hồi cực nhanh trên thiết bị di động (phải $< 1$ giây) ngay cả khi thiết bị mất mạng tại sân (Offline Heuristic).

Trong kế hoạch ban đầu, dự án có đề cập thuật toán phân nhánh và cắt tỉa (Branch and Bound) hoặc duyệt toàn bộ tổ hợp (Brute-force). Tuy nhiên, cần đánh giá độ phức tạp và tính khả thi trong khung thời gian 12 tuần của đồ án.

---

## 2. Các phương án xem xét (Options Considered)

### Phương án 1: Thuật toán Heuristic / Greedy cân bằng tổng điểm (Được chọn cho MVP)
- **Cơ chế:**
  - Với 4 người: Sắp xếp theo Elo $a \ge b \ge c \ge d$, thử 3 tổ hợp và chọn $(a + d)$ vs $(b + c)$ có độ lệch nhỏ nhất. Với `mixed`, ghép $(M_1 + F_2)$ vs $(M_2 + F_1)$.
  - Với ca lẻ 5 và 7 người: Lựa chọn 4 người thi đấu dựa trên hàng đợi ưu tiên người chơi ít trận nhất (`gamesPlayed` min) và luân phiên người nghỉ (`restCount`).
  - Cho phép Host hoán đổi thủ công (`swapPlayers`) trực tiếp trên màn hình di động, hệ thống tự động tính lại độ lệch và cảnh báo chứ không chặn quyền của Host.
- **Ưu điểm:**
  - Thời gian thực thi siêu nhanh ($< 5\text{ ms}$ trên mobile, $< 2\text{ ms}$ trong benchmark).
  - Thuật toán thuần túy, không phụ thuộc thư viện nặng, chạy offline $100\%$ mượt mà.
  - Dễ kiểm thử, dễ giải thích trong báo cáo và slide bảo vệ trước hội đồng.
- **Nhược điểm:**
  - Là thuật toán tham lam cục bộ cho từng set đấu, không đảm bảo tối ưu toàn cục (Global Optimum) qua 10–15 set.

### Phương án 2: Duyệt toàn bộ tổ hợp (Brute-force Combinatorial Search)
- **Cơ chế:** Với $n = 8$, duyệt toàn bộ $C_8^4 \times 3 = 105$ cách chia cho mỗi set và tối ưu hóa ma trận số trận đấu qua cả buổi.
- **Ưu điểm:** Đạt điểm cân bằng toán học tối ưu nhất.
- **Nhược điểm:** Phức tạp khi có ràng buộc `mixed` lệch giới tính hoặc các cặp khóa động; thời gian tính toán tăng mạnh khi số hiệp tăng lên; rủi ro trễ tiến độ tuần 7.

---

## 3. Quyết định (Decision)

Nhóm quyết định:
1. **Triển khai chính thức Phương án 1 (Heuristic / Greedy Balancing)** cho toàn bộ giai đoạn MVP và Milestone M6.
2. **Kế hoạch dự phòng (Contingency Plan):** Thuật toán Heuristic hiện tại đã đáp ứng hoàn hảo yêu cầu thực tế của sân cầu lông (thực thi $< 10\text{ ms}$, chênh lệch Elo thực tế luôn ở mức tối ưu $\le 50$ điểm với dải trình độ thông thường). Phương án duyệt tổ hợp toàn cục chỉ được xem xét nâng cấp ở giai đoạn mở rộng sau đồ án nếu cần thiết.
3. **Báo cáo trung thực:** Trong Báo cáo đồ án và Slide bảo vệ, TV1 sẽ ghi rõ đây là thuật toán Heuristic/Greedy thực tế, giải thích cơ chế bù trừ âm dương và xoay tua người nghỉ công bằng.

---

## 4. Hệ quả (Consequences)
- Đảm bảo Milestone M6 hoàn thành đúng hạn trong Tuần 7.
- Hiệu năng đo kiểm thực tế đạt $< 20\text{ ms}$ cho 100 lần chạy liên tiếp (vượt xa chỉ tiêu 1.000 ms).
- Giao diện TV2 dễ dàng tích hợp tính năng "Chia kèo 3 chạm" và kéo thả đổi người trực quan.
