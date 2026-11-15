# CHƯƠNG 5: QUẢN TRỊ RỦI RO DỰ ÁN (RISK MANAGEMENT)

> **Mã tài liệu:** `docs/report/chap05-risk-management.md`  
> **Nguồn căn cứ:** `05-risk-register.md`, Báo cáo rà soát rủi ro hàng tuần (W01–W11)  
> **Chủ đề:** Khung quản trị rủi ro định lượng, sổ theo dõi 14 rủi ro, đánh giá rủi ro thực tế phát sinh và hiệu quả ứng phó

---

## 5.1. Khung Quản Trị Rủi Ro Định Lượng

Dự án áp dụng phương pháp định lượng rủi ro theo chuẩn quản trị dự án phần mềm quốc tế:

$$\text{Điểm Rủi Ro (Risk Score)} = \text{Khả Năng Xảy Ra (Likelihood: 1–5)} \times \text{Mức Độ Tác Động (Impact: 1–5)}$$

- **Phân cấp ưu tiên:**
  - **20 – 25 (Đỏ - Critical):** Nguy cấp, bắt buộc kích hoạt phương án dự phòng ngay lập tức.
  - **12 – 19 (Cam - High):** Cao, có kế hoạch giảm thiểu gắn chặt với từng gói WBS.
  - **6 – 11 (Vàng - Medium):** Trung bình, theo dõi định kỳ trong các buổi họp tuần.
  - **1 – 5 (Xanh - Low):** Thấp, ghi nhận và chấp nhận rủi ro.

---

## 5.2. Sổ Đăng Ký Rủi Ro Bản Cuối (Detailed Risk Register - 14 Rủi Ro)

| Mã Rủi Ro | Tên Rủi Ro & Mô Tả | Khả Năng (L) | Tác Động (I) | Điểm Ban Đầu | Biện Pháp Phòng Ngừa & Giảm Thiểu | Điểm Còn Lại (Residual) | Chủ Sở Hữu |
| :---: | :--- | :---: | :---: | :---: | :--- | :---: | :---: |
| **RK-01** | **Người chơi khai trình độ ảo** (Khai Cấp 4–5 nhưng thực tế Cấp 2). | 4 | 4 | **16 (Cam)** | Thuật toán Elo đôi tự động kéo điểm về thực lực sau mỗi trận; hệ số $K=40$ trong 5 trận đầu (provisional); cơ chế đánh giá chéo bằng thẻ sau trận. | 8 (Vàng) | TV1 |
| **RK-02** | **Vãng lai bùng kèo hoặc hủy muộn** làm Host phải bù tiền sân. | 4 | 4 | **16 (Cam)** | Hệ thống Điểm Uy Tín (Reliability: 0–100); phạt trừ điểm nặng khi bùng kèo (-15đ); cảnh báo uy tín thấp khi xin vào; hàng đợi Waitlist tự động đôn người thay thế. | 8 (Vàng) | TV1 |
| **RK-03** | **Mất mạng tại sân cầu lông mái tôn** khiến app không dùng được. | 5 | 4 | **20 (Đỏ)** | Kiến trúc Offline-First: Hàm thuần `balanceCourt` chạy hoàn toàn ở client ($< 1\text{ ms}$); lưu Snapshot cục bộ vào AsyncStorage; đồng bộ khi có mạng lại. | 8 (Vàng) | TV1 & TV2 |
| **RK-04** | **Thuật toán chia cặp tốn thời gian** làm gián đoạn buổi đánh. | 3 | 3 | **9 (Vàng)** | Sử dụng thuật toán Heuristic Greedy phân chia in-memory; đo kiểm benchmark P15 đạt 0.01 - 0.11 ms (nhanh hơn chỉ tiêu 1.000 ms hơn 9.000 lần). | 3 (Xanh) | TV1 |
| **RK-05** | **Cloud Functions cần chi phí trả phí** phát sinh ngoài ý muốn. | 3 | 4 | **12 (Cam)** | Chọn phương án Blaze Pay-as-you-go với hạn mức miễn phí 2 triệu lượt gọi/tháng (chi phí thực tế $0); logic nghiệp vụ viết hàm thuần độc lập có thể chạy ở cả Client và Cloud. | 4 (Xanh) | TV1 |
| **RK-06** | **Hai người cùng nhận suất cuối** gây quá tải sân (Race Condition). | 3 | 4 | **12 (Cam)** | Áp dụng Cloud Firestore Atomic Transactions; kiểm tra phiên bản dữ liệu `version` trước khi commit; người chậm chân tự động chuyển vào Waitlist. | 4 (Xanh) | TV1 |
| **RK-07** | **Luật thực tế khác giả định ban đầu** (mâu thuẫn A1–A8). | 3 | 3 | **9 (Vàng)** | Tiến hành phỏng vấn sâu 2–3 Host tại sân Kỳ Đồng/Tuyên Sơn ngay từ Tuần 1; ban hành quy trình Change Request (CR-01, CR-02) kịp thời. | 3 (Xanh) | TV1 |
| **RK-08** | **Lệch tiến độ giữa 2 thành viên** (UI chờ Backend hoặc ngược lại). | 3 | 4 | **12 (Cam)** | Ban hành Hợp đồng Dữ liệu Data Contract v1.0 sớm (Tuần 3); tạo 7 bộ mock JSON độc lập tại `src/mocks/` để TV2 dựng UI song song. | 4 (Xanh) | TV1 & TV2 |
| **RK-09** | **Push Notification FCM cấu hình phức tạp** trên thiết bị thật. | 2 | 3 | **6 (Vàng)** | Chuẩn bị phương án dự phòng Local Scheduled Notifications qua `expo-notifications` kích hoạt ngay khi nhận sự kiện. | 3 (Xanh) | TV2 |
| **RK-10** | **Quá tải sân bãi khi tạo kèo 2 sân** (quá 8 người/sân). | 3 | 3 | **9 (Vàng)** | Bất biến dữ liệu cứng (I1–I5): Chặn tuyệt đối ở cả Client, Domain và Firestore Security Rules không cho phép sân $> 8$ người hoặc kèo $> 2$ sân. | 3 (Xanh) | TV1 |
| **RK-11** | **Màn hình khó nhìn dưới ánh đèn sân** hoặc thao tác tay dính mồ hôi. | 4 | 3 | **12 (Cam)** | Thiết kế UI một tay (One-handed Ergonomics): Các nút bấm điều khiển to ở nửa dưới màn hình; độ tương phản màu sắc cao (High Contrast theme). | 6 (Vàng) | TV2 |
| **RK-12** | **Lỗ hổng phân quyền dữ liệu** (Người chơi tự sửa điểm hoặc duyệt đơn). | 3 | 3 | **9 (Vàng)** | Bộ quy tắc Firestore Security Rules 10 tầng; kiểm thử tự động 60 ca test trên Firebase Emulator đạt 100% PASS. | 3 (Xanh) | TV1 |
| **RK-13** | **Xung đột mã nguồn khi merge** trên Git repository. | 3 | 4 | **12 (Cam)** | Phân quyền cây thư mục độc lập (`docs/`, `src/domain/` cho TV1; `src/app/`, `components/` cho TV2); bật Branch Protection trên nhánh `main`. | 4 (Xanh) | TV1 & TV2 |
| **RK-14** | **Không đủ thiết bị di động thật để kiểm thử** đa nền tảng. | 3 | 4 | **12 (Cam)** | Sử dụng Expo Go kiểm thử chéo tức thì; kết hợp mượn thiết bị Android và iPhone của người chơi thật trong đợt Field Test. | 4 (Xanh) | TV2 |

---

## 5.3. Đánh Giá Rủi Ro Thực Tế Phát Sinh Và Hiệu Quả Ứng Phó

> [!IMPORTANT]
> **HƯỚNG DẪN DÀNH CHO TV1 (PM):**  
> TV1 rà soát và điền thực tế diễn biến các rủi ro trong suốt 12 tuần thực hiện dự án:
> 
> 1. **Rủi ro nào đã thực sự xảy ra trong quá trình làm dự án?**  
>    - `[TV1 điền: Ví dụ RK-03 (Mất mạng tại sân thi đấu khi đem máy ra thử nghiệm thực tế) và RK-07 (Phát hiện kế hoạch gốc chia 8-16 người một lượt mâu thuẫn luật sân thực tế)]`
> 2. **Biện pháp ứng phó nhóm đã áp dụng trên thực tế là gì?**  
>    - `[TV1 điền: Kích hoạt ngay bản hợp đồng Offline Cache docs/api/offline-contract.md cho TV2 bundle hàm thuần balanceCourt vào client; ban hành Change Request CR-01 điều chỉnh thuật toán chạy riêng từng sân 4-8 người]`
> 3. **Hiệu quả của biện pháp ứng phó:**  
>    - `[TV1 điền: Buổi đánh thực địa diễn ra trơn tru, chia cặp tức thì dưới 0.1ms mà không bị treo khi mất sóng; thuật toán phù hợp 100% với văn hóa đánh cầu thực tế tại Đà Nẵng]`

