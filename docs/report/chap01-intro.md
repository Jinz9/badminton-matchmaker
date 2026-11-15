# CHƯƠNG 1: TỔNG QUAN VÀ BỐI CẢNH BÀI TOÁN

> **Mã tài liệu:** `docs/report/chap01-intro.md`  
> **Nguồn căn cứ:** `PROJECT_CONTEXT.md`, Khảo sát thực địa các cụm sân cầu lông Đà Nẵng  
> **Chủ đề:** Giới thiệu bài toán, đối tượng sử dụng, tính cấp thiết và giải pháp công nghệ

---

## 1.1. Bối Cảnh Thực Tế Phong Trào Cầu Lông Tại TP. Đà Nẵng

Cầu lông là một trong những môn thể thao phong trào phát triển mạnh mẽ nhất tại TP. Đà Nẵng. Toàn thành phố hiện có hàng chục nhà thi đấu và cụm sân tập trung đông đúc người chơi từ sáng sớm đến tối muộn, tiêu biểu như:
- Sân Cầu Lông Kỳ Đồng (Quận Thanh Khê)
- Trung tâm Thể thao Tuyên Sơn (Quận Hải Châu)
- Sân Cầu Lông Quân Khu 5 (Quận Hải Châu)
- Sân Trình Trung, Sân Trương Vĩnh Ký (Quận Cẩm Lệ)
- Sân Bưu Điện, Sân Chi Lăng, v.v.

Mặc dù nhu cầu vận động và giao lưu thể thao rất lớn, quy trình tổ chức và vận hành các buổi đánh ("kèo") hiện nay vẫn diễn ra hoàn toàn thủ công thông qua các nhóm mạng xã hội (Facebook Groups, Zalo chat). Điều này dẫn đến **3 bài toán nan giải** sau:

1. **Host đau đầu khi thiếu chân & Quản lý người mặc định (Core) vs Vãng lai:**
   - Để duy trì sân cố định theo tháng, nhóm thường có $4 \dots 6$ thành viên ruột ("người mặc định"). Tuy nhiên, vào các buổi trong tuần, một vài người bận đột xuất khiến sân bị thiếu người (chỉ có $2 \dots 3$ người), không đủ để đánh đôi liên tục.
   - Host phải đăng bài tuyển vãng lai lên các nhóm Zalo/Facebook. Việc đếm chỗ trống, nhận tin nhắn xin tham gia rất lộn xộn, dễ xảy ra tình trạng "nhận thừa người" (quá tải $> 8$ người/sân) hoặc "nhận thiếu người", làm tăng gánh nặng tiền sân cho các thành viên còn lại.
2. **Lệch trình độ nghiêm trọng khi ghép đôi:**
   - Người chơi phong trào thường tự nhận xét trình độ mang tính cảm tính ("đánh tàm tạm", "trình trung bình"). Khi vào sân, việc ghép người mới tập chơi chung với tay vợt bán chuyên/nâng cao tạo ra sự chênh lệch lớn: trận đấu một chiều, kém hấp dẫn, người yếu dễ nản lòng và người mạnh không được vận động hết sức.
3. **Mất công bằng trong xoay tua và bùng kèo phút chót:**
   - Khi sân có số lượng người lẻ ($5$ hoặc $7$ người), việc xếp ai đánh với ai và ai phải ngồi ngoài nghỉ thường gây tranh cãi và thiếu minh bạch.
   - Nạn "bùng kèo" (đăng ký nhưng không đến) hoặc "hủy sát giờ" mà không có chế tài xử phạt khiến Host phải bù tiền sân, gây ức chế lớn cho cộng đồng.
4. **Môi trường sân bãi đặc thù (Nhà thi đấu mái tôn kín):**
   - Hầu hết các nhà thi đấu cầu lông tại Đà Nẵng có kết cấu khung thép mái tôn dày, khiến sóng 4G/Wi-Fi rất chập chờn hoặc mất mạng hoàn toàn. Mọi giải pháp ứng dụng đòi hỏi kết nối Internet liên tục đều bị thất bại tại sân.

---

## 1.2. Mục Tiêu Của Đề Tài Đồ Án

Hệ thống được xây dựng nhằm giải quyết triệt để các vấn đề trên thông qua nền tảng di động thông minh (Mobile App) kết hợp Backend Cloud BaaS (Firebase):

- **Xây dựng Thang đo trình độ 6 cấp chuẩn hóa:** Phù hợp với ngôn ngữ phong trào Đà Nẵng (từ Cấp 1: Yếu đến Cấp 6: Tốt / Bán chuyên), tích hợp thuật toán cập nhật điểm **Elo đôi động** sau mỗi trận đấu và điểm **Uy tín (Reliability)** chống bùng kèo.
- **Tự động hóa tuyển suất & Quản lý phòng giao lưu:** Tự động tính toán số suất tuyển vãng lai theo luật $\min(4, 8 - \text{số người mặc định})$, giao dịch nguyên tử chống đặt trùng suất, và hàng đợi dự bị (Waitlist) tự động đôn người khi có biến động.
- **Thuật toán chia cặp cân bằng (Session Balancing):** Chạy in-memory cực nhanh ($< 1\text{ ms}$), hỗ trợ đầy đủ các ca lẻ $5$ và $7$ người luân phiên nghỉ công bằng, hỗ trợ cặp khóa và hoán đổi vị trí kéo thả một tay.
- **Khả năng Offline-First:** Cho phép Host xếp cặp, chấm điểm set đấu mượt mà ngay cả khi mất sóng hoàn toàn trong nhà thi đấu mái tôn, tự động đồng bộ khi có kết nối mạng trở lại.

---

## 1.3. Đối Tượng Sử Dụng & Phạm Vi Áp Dụng

### 1. Đối tượng sử dụng chính:
- **Chủ kèo (Host):** Người đứng ra thuê sân cố định, tổ chức buổi đánh, tuyển thêm người vãng lai khi thiếu chân, điều phối thứ tự các trận đấu và thu tiền sân.
- **Thành viên mặc định (Core Members):** Những người chơi cố định trong nhóm của Host (có thể đã cài app hoặc thành viên "ghost" do Host nhập hộ).
- **Người chơi vãng lai (Casual Players):** Những tay vợt có nhu cầu tìm sân giao lưu đột xuất trong ngày theo khu vực và khung giờ phù hợp.
- **Quản trị viên (Admin):** Vận hành hệ thống, giám sát báo cáo vi phạm, chuẩn hóa danh mục sân đấu.

### 2. Phạm vi địa lý & Kỹ thuật:
- **Địa bàn triển khai:** 7 quận/huyện TP. Đà Nẵng (Hải Châu, Thanh Khê, Sơn Trà, Ngũ Hành Sơn, Cẩm Lệ, Liên Chiểu, Hòa Vang).
- **Nền tảng công nghệ:** Ứng dụng di động thuần túy trên iOS và Android sử dụng framework **Expo (React Native)**, cơ sở dữ liệu **Google Cloud Firestore (BaaS)** và Cloud Functions tại Singapore (`asia-southeast1`).

