# DANH SÁCH QUYẾT ĐỊNH CHỜ DUYỆT (DECISIONS-PENDING.md)
**Quản lý:** TV1 (PM & Technical Lead)  
**Mục đích:** Tập hợp các câu hỏi kiến trúc và luật nghiệp vụ cần TV1 trả lời hoặc xác nhận với các bên liên quan trước khi triển khai code.

---

## 1. Xác nhận các giả định nghiệp vụ (A1 – A8)
*(Nguồn: skill `badminton-domain-rules`)*

| Mã | Giả định hiện tại | Vấn đề / Câu hỏi cần TV1 quyết định | Lựa chọn đề xuất | Quyết định của TV1 |
|---|---|---|---|---|
| **A1** | Sân phải có ít nhất **4 người mặc định** mới được mở tuyển vãng lai. | Nếu host mới chỉ có 2 hoặc 3 người quen (chưa đủ 4) nhưng muốn thuê 1 sân và tuyển thêm 3–4 người vãng lai cho đủ thì có cho phép mở tuyển không? | **Lựa chọn A:** Bắt buộc tối thiểu 4 người mặc định.<br>**Lựa chọn B (Khuyên dùng):** Cho phép mở tuyển nếu có từ 1 người mặc định trở lên, miễn là tổng số người (mặc định + tuyển) không quá 8. | [Lựa chọn B] |
| **A2** | Người mặc định có thể chưa có tài khoản (thành viên "ghost"): host tự nhập tên, giới tính, trình độ tự khai; không cập nhật Elo. | Khi kết thúc buổi đánh, thành viên ghost có được chuyển đổi thành tài khoản thật nếu sau đó họ tải app không? | **Lựa chọn A (Khuyên dùng):** Giữ nguyên: ghost chỉ dùng để chia cặp trong buổi, không lưu vết Elo lâu dài.<br>**Lựa chọn B:** Cung cấp mã mời/QR để sau khi cài app, họ nhận lại lịch sử trận đấu. | [Lựa chọn B] |
| **A3** | Chỉ có **Host duyệt thủ công** vãng lai, chưa có tự động duyệt. | Có nên hỗ trợ chế độ "Tự động duyệt" (Auto-accept) nếu người xin vào đáp ứng đủ 100% điều kiện (đúng giới tính, đúng dải trình độ, điểm uy tín ≥ 80)? | **Lựa chọn A:** 100% duyệt tay bởi host.<br>**Lựa chọn B:** Thêm công tắc cấu hình cho host: "Duyệt thủ công" hoặc "Tự động duyệt người đủ chuẩn". | [Lựa chọn A] |
| **A4** | Nếu host thêm người mặc định làm vượt số chỗ (đã có vãng lai được duyệt): **Chặn thao tác**, host phải tự chọn 1 vãng lai đưa về dự bị. | Cách ứng xử này đã chuẩn UX chưa? Cần hệ thống gửi thông báo Notification gì cho người bị đưa về dự bị? | Giữ nguyên quy tắc chặn và bắt buộc có thông báo đẩy lý do trả về waitlist. | [nếu số lượng vãng lai được duyệt full ứng với số đã tuyển thì khóa tính năng adđ thêm người mặc định của host, nếu chưa còn slot duyệt vãng lai thì tính năng thêm người mặc định của host vẫn được mở] |
| **A5** | Host chọn dải trình độ cấp 1–6 cho từng sân. Mặc định = Cấp trung bình nhóm ± 1. | Có cho phép người chơi lệch quá 1 cấp nộp đơn xin vào không? | **Lựa chọn A (Khuyên dùng):** Chặn nộp đơn nếu nằm ngoài dải trình độ sân.<br>**Lựa chọn B:** Cho phép nộp nhưng gắn cờ cảnh báo "Lệch trình độ" cho host cân nhắc. | [Lựa chọn B] |
| **A6** | Dùng **1 điểm Elo duy nhất** cho cả 3 nội dung (đôi nam, đôi nữ, đôi nam nữ). | Việc gộp chung Elo có gây thiếu chính xác khi một bạn nam đánh đôi nam khác hoàn toàn khi đánh đôi nam nữ không? | **Giai đoạn MVP:** Dùng 1 Elo chung để đơn giản hóa thuật toán.<br>**Giai đoạn sau:** Tách thành 3 chỉ số Elo riêng. | [dùng 1 elo chung để đơn giản thuật toán] |
| **A7** | Quy tắc hủy và phạt uy tín (Theo skill `badminton-rating`): Hủy trước 2 tiếng: phạt nhẹ (-5 điểm); Hủy sát giờ hoặc bùng: phạt nặng (-20 điểm). | Mức phạt và mốc thời gian này đã phù hợp với văn hóa chơi cầu lông phong trào tại Đà Nẵng chưa? | Cần phỏng vấn thực tế 2–3 host để tinh chỉnh lại khung giờ phạt. | [phù hợp nhưng cần thêm tính năng hồi lại điểm uy tín nếu đi 1 buổi vậy được cộng hồi lại 1 điểm uy tín] |
| **A8** | **Thanh toán nằm ngoài ứng dụng:** Người chơi trả tiền mặt hoặc chuyển khoản ngân hàng trực tiếp cho host tại sân. | Trong app có cần hiển thị số tài khoản ngân hàng / mã QR VietQR của host trong phòng kèo không? | **Khuyên dùng:** Cho host nhập STK/Ngân hàng để app tự sinh mã VietQR trong phòng kèo, nhưng app không can thiệp cổng thanh toán. | [Cho host nhập STK/Ngân hàng để app tự sinh mã VietQR trong phòng kèo, nhưng app không can thiệp cổng thanh toán.] |

---

## 2. Phương án hạ tầng Firebase & Cloud Functions

- **Bối cảnh:** Thuật toán tính toán Elo và xử lý bùng kèo cần được bảo vệ ở backend để tránh gian lận.
- **Vấn đề:** 
  - Gói **Spark (Miễn phí):** Không cho phép Cloud Functions gọi ra Internet ngoài và bị hạn chế triển khai Functions ở một số khu vực.
  - Gói **Blaze (Pay-as-you-go):** Cần thẻ Visa/Mastercard để kích hoạt (vẫn được miễn phí trong hạn mức hàng tháng rất lớn: 2 triệu lượt gọi/tháng).
- **Câu hỏi cần quyết định:** Nhóm sẽ sử dụng gói nào?
  - **Phương án 1 (Khuyên dùng):** Đăng ký gói **Blaze** (không mất phí nếu dùng trong phạm vi đồ án sinh viên) để viết Cloud Functions V2 xử lý cập nhật Elo, bảo đảm an toàn dữ liệu.
  - **Phương án 2:** Dùng gói **Spark miễn phí**, chuyển toàn bộ logic tính Elo về hàm thuần ở Client và khóa chặt bằng Firestore Security Rules (có rủi ro bảo mật hơn nhưng không cần thẻ).
- **Quyết định của TV1:** `[Spark (Miễn phí), Phương án 1 (Khuyên dùng)]`

---

## 3. Phương thức xác thực người dùng (Firebase Authentication)

- **Vấn đề:** Chọn phương thức đăng nhập cho người dùng tại Đà Nẵng.
- **Các phương án:**
  - **Phương án A (Google Sign-In + Email/Password):** Triển khai nhanh nhất, hoàn toàn miễn phí, không tốn chi phí SMS OTP, dễ tạo tài khoản ảo để kiểm thử tính năng ghép đội.
  - **Phương án B (Số điện thoại - Phone OTP):** Sát thực tế người đi đánh cầu lông nhất, nhưng Firebase chỉ miễn phí 10 số điện thoại test và có hạn mức SMS miễn phí giới hạn.
- **Đề xuất:** Dùng **Google Sign-In kết hợp Email/Password** cho giai đoạn Dev & Test đồ án.
- **Quyết định của TV1:** `[Phương án A (Google Sign-In + Email/Password)]`

---

## 4. Danh sách khu vực & Cụm sân cầu lông tại Đà Nẵng

- **Phạm vi địa lý (Quận/Huyện):**
  - Hải Châu, Thanh Khê, Sơn Trà, Ngũ Hành Sơn, Cẩm Lệ, Liên Chiểu, Hòa Vang.
- **Câu hỏi:** Có cần tạo sẵn danh mục khoảng 10–15 sân cầu lông nổi tiếng ở Đà Nẵng kèm tọa độ GPS để người dùng chọn nhanh không? *(Ví dụ: Sân Quân Khu 5, Sân Tuyên Sơn, Sân Kỳ Đồng, Sân Trương Vĩnh Ký, Sân Bưu Điện,...)*
- **Quyết định của TV1:** `[có]`

---

## 5. Phạm vi quyền hạn của Quản trị viên (Admin Role) trong App

- **Bối cảnh:** Đồ án không có Web Admin riêng; Admin đăng nhập trực tiếp trên app với `role: "admin"`.
- **Câu hỏi:** Admin trong app có những quyền năng cụ thể nào?
  - [có] Khóa / Mở khóa tài khoản người dùng vi phạm quy tắc cộng đồng.
  - [có] Can thiệp duyệt khiếu nại và hoàn trả điểm uy tín cho người bị báo cáo oan.
  - [có] Duyệt danh sách sân cầu lông mới do người dùng đóng góp.
  - [có] Xem màn hình thống kê tổng quan (Dashboard: số user, số kèo đã tạo, số trận đấu).
- **Quyết định của TV1:** `[có cả 4 ý trên ]`

---

## 6. Tiêu chí xác định "Đồng đội ăn ý" (Module 4)

- **Vấn đề:** Khi nào một cặp người chơi được hệ thống gợi ý hoặc gắn nhãn "Đồng đội ăn ý"?
- **Đề xuất:**
  - Số trận tối thiểu đánh cùng nhau: **≥ 3 trận** (hoặc ≥ 5 trận).
  - Tỷ lệ chiến thắng khi bắt cặp cùng nhau: **≥ 60%** (hoặc ≥ 66%).
- **Quyết định của TV1:** `[Tỷ lệ chiến thắng khi bắt cặp cùng nhau: **≥ 60%** (hoặc ≥ 66%).]`

---

## 7. Phương thức phát hành và bàn giao bản build cho TV2 & Kiểm thử

- **Phương án:**
  - Trong quá trình code Sprint 1–4: Chạy live reload qua **Expo Go** (nhẹ, nhanh, quét QR là chạy).
  - Giai đoạn kiểm thử thực địa Sprint 5 (M9–M10): Build file **Android APK độc lập** qua `eas build --platform android --profile preview` để cài trực tiếp vào máy các tay vợt tại sân mà không cần máy tính.
- **Quyết định của TV1:** `[Trong quá trình code Sprint 1–4: Chạy live reload qua **Expo Go** (nhẹ, nhanh, quét QR là chạy).]`

---

## 8. Các quyết định về Thang trình độ & Thuật toán Elo (WBS 2.1)
*(Chờ TV1 - Chuyên môn Cầu lông duyệt trước khi chốt bản chính thức)*

| Hạng mục | Phương án đề xuất hiện tại (Dự thảo) | Cơ sở / Lý do đề xuất | Quyết định của TV1 |
|---|---|---|:---:|
| **1. Tên 6 Cấp độ** | **Phương án A (Theo skill):** Mới chơi, Cơ bản, Trung bình, Khá, Giỏi, Rất giỏi.<br>**Phương án B (Theo dân phong trào Đà Nẵng):** Yếu, TB-, TB, TB+, Khá, Bán chuyên. | Phương án B gần gũi với ngôn ngữ các cụm sân Đà Nẵng (Kỳ Đồng, Tuyên Sơn); Phương án A mang tính học thuật trung tính hơn. | `[TV1 điền]` |
| **2. Khoảng điểm Elo & Điểm khởi tạo** | - Cấp 1: 1000–1199 (Khởi tạo: 1100)<br>- Cấp 2: 1200–1349 (Khởi tạo: 1275)<br>- Cấp 3: 1350–1499 (Khởi tạo: 1425)<br>- Cấp 4: 1500–1649 (Khởi tạo: 1575)<br>- Cấp 5: 1650–1799 (Khởi tạo: 1725)<br>- Cấp 6: 1800–2000 (Khởi tạo: 1900) | Điểm sàn 800, trần 2200. Mỗi cấp rộng 150–200 điểm Elo, đủ để phân hóa rõ trình độ giữa 2 người chơi. | `[TV1 điền]` |
| **3. Trọng số Tay thuận (Partner Finder)** | - Phải + Trái: **+25 điểm thưởng** tương thích.<br>- Phải + Phải: **0 điểm** (trung tính).<br>- Trái + Trái: **-10 điểm** (dễ hở biên phải). | Cặp 1 phải + 1 trái bao quát hai biên và trục giữa sân tốt nhất trong đánh đôi. | `[TV1 điền]` |
| **4. Trọng số Vị trí (Partner Finder)** | - Lưới (Front) + Công (Back): **+40 điểm**.<br>- Linh hoạt (Both) + Bất kỳ: **+20 đến +25 điểm**.<br>- Cùng Lưới + Lưới hoặc cùng Công + Công: **-30 điểm**. | Bù trừ công thủ âm - dương là nguyên tắc cốt lõi giúp đôi không bị giẫm chân nhau. | `[TV1 điền]` |
| **5. Số trận hiệu chỉnh $N$ (Provisional)** | **Đề xuất: N = 5 trận** (Dùng $K=40$, gắn nhãn provisional).<br>*(Skill badminton-rating mặc định là N = 10 trận)*. | Trong giải phong trào và đồ án sinh viên, 10 trận là quá dài đối với người chơi vãng lai; 5 trận là vừa đủ để kéo điểm về đúng thực lực nếu khai ảo. | `[TV1 điền]` |


