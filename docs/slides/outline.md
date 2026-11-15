# DÀN Ý SLIDE THUYẾT TRÌNH BẢO VỆ ĐỒ ÁN (PRESENTATION SLIDE OUTLINE)

> **Mã tài liệu:** `docs/slides/outline.md`  
> **Đề tài:** Hệ Thống Ghép Đội và Cân Bằng Kèo Cầu Lông Phong Trào Tại TP. Đà Nẵng (Mobile App)  
> **Thời lượng thuyết trình:** 20 phút (15 phút trình bày + 5 phút demo trực tiếp) + 10 phút Q&A Hội đồng.  
> **Phân vai thuyết trình:**  
> - **TV1 (Đào Duy Nhật):** Quản trị dự án (PM, WBS, Gantt, Risk, CR) + Kiến trúc hệ thống + 3 Thuật toán cốt lõi.  
> - **TV2 (Nguyễn Đức Đạt):** UI/UX, Design System, Chiến lược kiểm thử & Bug Log + Điều khiển demo trực tiếp trên điện thoại.

---

## TỔNG QUAN PHÂN BỔ THỜI GIAN & NGƯỜI NÓI (20 PHÚT)

| Phần | Nội Dung Trọng Tâm | Slide | Người Thuyết Trình | Thời Lượng |
| :---: | :--- | :---: | :---: | :---: |
| **Phần 1** | Giới thiệu, Bối cảnh thực tế & Project Charter | Slide 1 – 4 | **TV1 (Đào Duy Nhật)** | 3 phút |
| **Phần 2** | Quy trình Quản trị Dự án (Scrum, WBS, Gantt, Risk, CR) | Slide 5 – 9 | **TV1 (Đào Duy Nhật)** | 4.5 phút |
| **Phần 3** | Kiến trúc Hệ thống & Ba Thuật Toán Cốt Lõi | Slide 10 – 13 | **TV1 (Đào Duy Nhật)** | 4 phút |
| **Phần 4** | Thiết Kế UI/UX & Chiến Lược Đảm Bảo Chất Lượng | Slide 14 – 16 | **TV2 (Nguyễn Đức Đạt)** | 3 phút |
| **Phần 5** | Demo Trực Tiếp Sản Phẩm Trên Thiết Bị Thật | Slide 17 | **TV2 (Thao tác) & TV1 (Dẫn)** | 4 phút |
| **Phần 6** | Kết Quả Dự Án, Bài Học Kinh Nghiệm & Hướng Phát Triển | Slide 18 – 20 | **TV1 & TV2** | 1.5 phút |

---

## CHI TIẾT TỪNG SLIDE (20 SLIDES)

```carousel
### SLIDE 1: TRANG BÌA (TITLE SLIDE)
- **Mục tiêu:** Tạo ấn tượng chuyên nghiệp, nhận diện thương hiệu thể thao năng động.
- **Nội dung hiển thị:**
  - Tiêu đề: **HỆ THỐNG GHÉP ĐỘI & CÂN BẰNG KÈO CẦU LÔNG PHONG TRÀO TẠI ĐÀ NẴNG**
  - Học phần: Quản Trị Dự Án Phần Mềm (QLDAPM) | Học kỳ I, Năm học 2026 – 2027
  - GVHD: ThS. Nguyễn Thanh Tuấn
  - Nhóm sinh viên: Đào Duy Nhật (TV1 - PM & Backend) | Nguyễn Đức Đạt (TV2 - QA & Mobile)
- **Hình ảnh / Biểu đồ:** Logo trường Đại học Bách Khoa ĐN, mock-up điện thoại hiển thị app.
- **Người trình bày:** TV1 (0.5 phút)
- **Ghi chú người nói:** *"Kính thưa quý thầy cô trong Hội đồng chấm đồ án tốt nghiệp học phần Quản trị Dự án Phần mềm, em là Đào Duy Nhật, đại diện Nhóm 02 cùng bạn Nguyễn Đức Đạt xin phép được báo cáo đề tài..."*
<!-- slide -->
### SLIDE 2: BỐI CẢNH THỰC TẾ & BÀI TOÁN TẠI CÁC SÂN ĐÀ NẴNG
- **Mục tiêu:** Nêu bật tính cấp thiết và nỗi đau thực tế của cộng đồng cầu lông Đà Nẵng.
- **Nội dung hiển thị:**
  - 3 Nỗi đau nhức nhối tại sân Kỳ Đồng, Tuyên Sơn, Quân Khu 5:
    1. **Host thiếu chân:** $4 \dots 6$ người quen, thiếu $2 \dots 3$ chân vãng lai $\to$ gom người thủ công qua Zalo dễ quá tải hoặc thiếu người.
    2. **Lệch trình độ nghiêm trọng:** Đánh cảm tính, người mới ghép với bán chuyên $\to$ trận đấu một chiều, ức chế.
    3. **Bùng kèo & Mất sóng mạng:** Vãng lai bỏ kèo phút chót không chế tài; nhà thi đấu mái tôn sóng 4G rất kém.
- **Hình ảnh:** Infographic 3 nỗi đau, hình ảnh thực tế sân cầu lông Đà Nẵng.
- **Người trình bày:** TV1 (1 phút)
<!-- slide -->
### SLIDE 3: MỤC TIÊU DỰ ÁN & PROJECT CHARTER (SMART)
- **Mục tiêu:** Minh chứng mục tiêu đo lường được và cam kết trong Project Charter.
- **Nội dung hiển thị:**
  - **Mục tiêu SMART:**
    - Khép kín 4 module chức năng MVP cho nền tảng Mobile (Expo).
    - Thao tác chia cặp tại sân: **$\le 3$ chạm** trên điện thoại.
    - Thời gian tính toán thuật toán: **$< 1.000\text{ ms}$** (Thực tế đạt $< 0.1\text{ ms}$).
    - Khả năng **Offline-First**: Vận hành 100% khi mất mạng tại sân.
    - Kiểm thử tự động đạt **$\ge 90\%$** PASS (Thực tế đạt **100% - 278 tests**).
  - **Ranh giới:** In-scope (Giao lưu phong trào thường nhật, VietQR) vs Out-of-scope (Không làm web admin riêng, không can thiệp cổng thanh toán).
- **Người trình bày:** TV1 (1 phút)
<!-- slide -->
### SLIDE 4: PHÂN TÍCH BÊN LIÊN QUAN (STAKEHOLDERS)
- **Mục tiêu:** Trình bày ma trận Mendelow và chiến lược quản lý các bên liên quan.
- **Nội dung hiển thị:**
  - Ma trận Quyền lực - Mức độ quan tâm (Power - Interest Grid):
    - *Quản lý chặt chẽ:* GVHD, Chủ kèo (Host Đà Nẵng).
    - *Làm hài lòng:* Ban quản lý sân bãi.
    - *Cung cấp thông tin thường xuyên:* Người chơi vãng lai & Core members.
  - Khảo sát thực tế 2–3 Host tại sân Kỳ Đồng/Tuyên Sơn ngay từ Sprint 1 để kiểm chứng giả định A1–A8.
- **Hình ảnh:** Ma trận Mendelow 4 góc phần tư.
- **Người trình bày:** TV1 (0.5 phút)
<!-- slide -->
### SLIDE 5: QUY TRÌNH QUẢN TRỊ SCRUM 6 SPRINT (12 TUẦN)
- **Mục tiêu:** Thể hiện phương pháp luận quản trị dự án bài bản.
- **Nội dung hiển thị:**
  - Khung thời gian: 12 tuần | 6 Sprint (mỗi Sprint 2 tuần).
  - Các nghi thức Scrum: Họp đồng bộ tuần (Sync meeting 20:00 Chủ nhật), lập 11 biên bản họp W01–W11.
  - Phân chia vai trò rõ ràng: TV1 (Product Owner, Scrum Master, Backend) - TV2 (Development Team, QA Lead).
  - Cột mốc quyết định: **M8 Feature Freeze** tại cuối Sprint 4 (Tuần 8) để dồn toàn lực cho kiểm thử và tối ưu.
- **Hình ảnh:** Biểu đồ vòng lặp Sprint Agile/Scrum.
- **Người trình bày:** TV1 (1 phút)
<!-- slide -->
### SLIDE 6: PHÂN RÃ CÔNG VIỆC (WBS 21 GÓI) & MA TRẬN RACI
- **Mục tiêu:** Chứng minh khối lượng công việc được phân rã khoa học, không chồng chéo.
- **Nội dung hiển thị:**
  - Cấu trúc WBS 5 giai đoạn: Khởi tạo $\to$ Phân tích thiết kế $\to$ Backend & Thuật toán $\to$ Mobile Expo $\to$ QA & Nghiệm thu.
  - 21 Gói công việc (Level 2) có từ điển WBS rõ ràng.
  - Ma trận RACI: Phân định rạch ròi trách nhiệm (R), phê duyệt (A), tham vấn (C) và thông báo (I) giữa TV1, TV2 và GVHD.
  - Phân quyền cây thư mục: Merge Conflict $= 0\%$ trong suốt 12 tuần.
- **Hình ảnh:** Cây WBS và bảng ma trận RACI rút gọn.
- **Người trình bày:** TV1 (1 phút)
<!-- slide -->
### SLIDE 7: TIẾN ĐỘ THỰC TẾ SO VỚI KẾ HOẠCH (GANTT & VARIANCE)
- **Mục tiêu:** Đối chiếu tiến độ 12 cột mốc M1–M12, phân tích độ lệch.
- **Nội dung hiển thị:**
  - Biểu đồ Gantt 12 tuần thực tế.
  - Toàn bộ các mốc M1 $\to$ M11 đều hoàn thành đúng hạn (Schedule Variance $= 0$ ngày).
  - Điểm mấu chốt giữ vững tiến độ: Bàn giao Hợp đồng Dữ liệu Data Contract v1.0 từ Tuần 3 kèm Mock Data JSON để TV2 làm UI song song mà không phụ thuộc backend.
- **Hình ảnh:** Sơ đồ Gantt Mermaid và bảng mốc tiến độ M1–M12.
- **Người trình bày:** TV1 (1 phút)
<!-- slide -->
### SLIDE 8: QUẢN TRỊ RỦI RO (RISK REGISTER & HEATMAP)
- **Mục tiêu:** Chứng minh năng lực dự báo và ứng phó rủi ro chuyên nghiệp.
- **Nội dung hiển thị:**
  - Sổ theo dõi 14 rủi ro, phân loại ma trận 5x5 ($L \times I$).
  - **Hai rủi ro thực tế đã xảy ra & Ứng phó thành công:**
    1. *RK-03 (Mất mạng tại sân mái tôn - Điểm 20 Đỏ):* Ứng phó bằng hợp đồng Offline Cache, chạy in-memory $< 0.1\text{ ms}$, lưu AsyncStorage và đồng bộ Host-Authority.
    2. *RK-07 (Luật sân khác kế hoạch gốc - Điểm 9):* Khảo sát tuần 1 phát hiện ngay mâu thuẫn $\to$ Ban hành Change Request CR-01 kịp thời.
- **Hình ảnh:** Ma trận Risk Heatmap 5x5 màu sắc trực quan.
- **Người trình bày:** TV1 (1 phút)
<!-- slide -->
### SLIDE 9: QUẢN LÝ THAY ĐỔI (CR-01 & CR-02 ĐÃ DUYỆT)
- **Mục tiêu:** Nêu bật sự khác biệt giữa lý thuyết và thực tế sân bãi.
- **Nội dung hiển thị:**
  - **Change Request 01 (CR-01 - Bước ngoặt đồ án):**
    - *Kế hoạch cũ:* Chia cặp gom chung 8–16 người một lượt, ca lẻ 9, 11, 13 người.
    - *Luật thực tế (CR-01):* Mỗi sân tối đa 8 người, kèo tối đa 2 sân ($\le 16$ người). Thuật toán cân kèo chạy độc lập từng sân 4–8 người. Ca lẻ thực tế chỉ có 5 và 7 người xoay tua 1 người nghỉ.
  - **Change Request 02 (CR-02):** Phân định rõ Module Partner Finder (tìm bạn đánh cặp cố định) vs Match Lobby (tuyển vãng lai $\min(4, 8-\text{core})$).
  - Quyết định A1–A8: Host duyệt tay 100%, Hard block thêm core quá 8 người, thanh toán VietQR.
- **Người trình bày:** TV1 (1 phút)
<!-- slide -->
### SLIDE 10: KIẾN TRÚC HỆ THỐNG (EXPO + FIREBASE BAAS)
- **Mục tiêu:** Trình bày kiến trúc kỹ thuật hiện đại, bảo mật và chịu tải tốt.
- **Nội dung hiển thị:**
  - Mô hình Client - Backend-as-a-Service (BaaS) 3 lớp:
    1. *Mobile Client:* Expo React Native (TypeScript), UI một tay, bộ nhớ đệm Offline AsyncStorage.
    2. *Security Gate:* Firestore Security Rules 10 tầng, Firebase Auth (Google, Email).
    3. *Cloud Services:* Cloud Firestore tại Singapore (`asia-southeast1`), Cloud Functions V2 xử lý Elo Idempotent.
  - Chi phí vận hành: **0 VNĐ** (Tận dụng hạn mức miễn phí khổng lồ của Firebase Spark/Blaze).
- **Hình ảnh:** Sơ đồ khối kiến trúc hệ thống 3 tầng.
- **Người trình bày:** TV1 (1 phút)
<!-- slide -->
### SLIDE 11: THANG ĐO 6 CẤP & MÔ HÌNH TOÁN ELO ĐÔI ĐỘNG
- **Mục tiêu:** Giới thiệu giải pháp toán học cốt lõi phân hóa trình độ.
- **Nội dung hiển thị:**
  - Thang 6 cấp chuẩn hóa Đà Nẵng: Cấp 1 (Yếu) $\to$ Cấp 6 (Tốt/Bán chuyên). Sàn 800, trần 2200 Elo.
  - Công thức điểm kỳ vọng đôi: $E_A = \frac{1}{1 + 10^{(R_B - R_A)/400}}$.
  - Hệ số chênh lệch set đấu: Multiplier từ $1.0$ (thắng sát nút) đến $1.25$ (thắng áp đảo).
  - Trạng thái hiệu chỉnh Provisional (5 trận đầu dùng $K=40$, sau đó $K=24$).
  - Thẻ đánh giá chéo đồng thuận $\ge 2$ votes: Thưởng/phạt tối đa $\pm 10$ Elo.
- **Hình ảnh:** Đồ thị đường cong kỳ vọng Elo và bảng thang 6 cấp.
- **Người trình bày:** TV1 (1 phút)
<!-- slide -->
### SLIDE 12: THUẬT TOÁN CÂN KÈO SÂN ĐẤU (SESSION BALANCING - CR-01)
- **Mục tiêu:** Trình bày thuật toán Heuristic Greedy phân chia sân 4–8 người.
- **Nội dung hiển thị:**
  - Đơn vị chạy: 1 sân độc lập (4 đến 8 người có mặt).
  - Ca chuẩn 4 người: Ghép $(a+d)$ vs $(b+c)$ để độ chênh lệch Elo nhỏ nhất.
  - **Ca lẻ 5 và 7 người:** Ưu tiên 4 người có số trận ít nhất vào sân; người có số lần nghỉ ít nhất ngồi ngoài xoay tua; chênh lệch số trận giữa 2 người bất kỳ $\le 1$.
  - Cặp khóa (`self`, `host`): Bảo toàn tuyệt đối không tách cặp.
  - Hiệu năng thực tế đo đạc: **$0.02 \dots 0.11\text{ ms}$** (nhanh hơn chỉ tiêu 1.000 ms hơn 9.000 lần).
- **Ví dụ số minh họa:** 5 người [1600, 1550, 1450, 1400, 1350] $\to$ Hiệp 1: (1600+1400=3000) vs (1550+1450=3000) $\to$ diff = 0, người 1350 nghỉ. Hiệp 2 người 1350 chắc chắn vào sân.
- **Người trình bày:** TV1 (1 phút)
<!-- slide -->
### SLIDE 13: THUẬT TOÁN TÌM BẠN ĐÁNH CẶP (PARTNER FINDER)
- **Mục tiêu:** Giới thiệu thuật toán chấm điểm tương thích $[0 \dots 100]$.
- **Nội dung hiển thị:**
  - Điều kiện lọc cứng: Chênh lệch Elo $\le 150$ điểm.
  - Ma trận điểm thưởng tương thích:
    - Bù trừ vị trí Lưới (Front) + Công (Back): **+40 điểm**.
    - Phối hợp tay Trái (Left) + Phải (Right): **+25 điểm**.
    - Cùng chuyên lưới hoặc cùng chuyên công: **-30 điểm**.
  - Tối ưu truy vấn: Firestore Range Query $[R-150, R+150]$ kết hợp composite index, duyệt 1.000 ứng viên $< 40\text{ ms}$.
- **Người trình bày:** TV1 (1 phút)
<!-- slide -->
### SLIDE 14: THIẾT KẾ UI/UX DI ĐỘNG & TIÊU CHUẨN THỂ THAO
- **Mục tiêu:** Giới thiệu triết lý thiết kế giao diện cho người chơi cầu lông.
- **Nội dung hiển thị:**
  - **Triết lý Ergonomics một tay tại sân:**
    - Toàn bộ nút bấm thao tác chính (Chia cặp, Nhập điểm, Duyệt đơn) đặt ở nửa dưới màn hình (vùng ngón cái chạm tới).
    - Thao tác chia cặp chuẩn **3 chạm** nhanh gọn.
    - Màn hình nhập điểm với các phím bumper số lớn, chống bấm nhầm khi tay dính mồ hôi.
  - Design System: Bộ màu thể thao năng động (Navy `#0A192F`, Badminton Emerald `#10B981`), độ tương phản cao dưới ánh đèn sân.
  - 13 Màn hình hoàn chỉnh trên Figma và Expo Router.
- **Hình ảnh:** Mockup các màn hình tiêu biểu (`SCR-07`, `SCR-09`, `SCR-10`).
- **Người trình bày:** TV2 (1.5 phút)
<!-- slide -->
### SLIDE 15: CHIẾN LƯỢC KIỂM THỬ ĐA TẦNG & SỐ LIỆU CHẤT LƯỢNG THẬT
- **Mục tiêu:** Khẳng định chất lượng phần mềm qua các con số kiểm thử thực tế.
- **Nội dung hiển thị:**
  - Chiến lược kiểm thử 4 tầng: Domain pure functions $\to$ Rules emulator $\to$ E2E integration $\to$ Field test.
  - **Số liệu kiểm thử đo đạc thực tế:**
    - 15 Test Suites Domain: **196 / 196 tests PASS (100%)**.
    - Security Rules & Functions: **82 / 82 tests PASS (100%)**.
    - Tổng cộng: **278 ca kiểm thử tự động PASS 100%**.
  - Kiểm toán dữ liệu BaaS: 40 tài liệu mẫu, 0 lỗi, 0 cảnh báo (100% Sạch).
  - Quản lý lỗi: Quy trình Bug Log nghiêm ngặt, 0 lỗi nghiêm trọng còn mở.
- **Hình ảnh:** Ảnh chụp kết quả Jest xanh 100% và biểu đồ kiểm toán dữ liệu.
- **Người trình bày:** TV2 (1.5 phút)
<!-- slide -->
### SLIDE 16: KẾT QUẢ KIỂM THỬ THỰC ĐỊA TẠI SÂN ĐÀ NẴNG (FIELD TEST)
- **Mục tiêu:** Minh chứng phần mềm đã được kiểm nghiệm ngoài đời thực.
- **Nội dung hiển thị:**
  - Địa điểm: Sân Cầu Lông Kỳ Đồng (Thanh Khê) & Sân Tuyên Sơn (Hải Châu).
  - Thử nghiệm mất sóng 4G: Bật Airplane mode $\to$ Chia cặp vẫn chạy $< 0.1\text{ ms}$, tự động đồng bộ khi có mạng lại.
  - Khảo sát trải nghiệm người chơi:
    - Thời gian chia cặp trung bình: **~1.2 giây/hiệp**.
    - Điểm đánh giá tiện dụng System Usability Scale (SUS): **82.5 / 100 điểm** (Mức Xuất sắc).
- **Hình ảnh:** Ảnh chụp thực địa tại sân cầu lông và bảng điểm khảo sát SUS.
- **Người trình bày:** TV2 (1 phút)
<!-- slide -->
### SLIDE 17: DEMO TRỰC TIẾP TRÊN THIẾT BỊ THẬT (LIVE DEMO)
- **Mục tiêu:** Trình diễn sản phẩm trực tiếp trước Hội đồng theo kịch bản 5 bước.
- **Quy trình phối hợp:** TV2 trực tiếp thao tác điện thoại kết nối màn hình chiếu; TV1 dẫn dắt nghiệp vụ.
- **5 Bước demo trực tiếp (4 phút):**
  1. *Host tạo kèo:* Chọn sân Tuyên Sơn, 1 sân, Đôi nam nữ, 4 core $\to$ Tự động mở tuyển 4 suất.
  2. *Vãng lai nộp đơn & Duyệt:* Đạt nộp đơn $\to$ Host duyệt tay. Người thứ 5 vào Waitlist; vãng lai hủy $\to$ đôn Waitlist FIFO.
  3. *Chia cặp 3 chạm:* Điểm danh 5 người $\to$ Bấm chia cặp ra kết quả tức thì kèm 1 người nghỉ. Kéo thả đổi người.
  4. *Nhập tỷ số chuẩn BWF:* Thử nhập sai luật 21-20 bị chặn $\to$ Nhập đúng 22-20.
  5. *Tổng kết Elo & Quét VietQR:* Điểm Elo cập nhật $K=40$, cộng +2đ uy tín, chấm thẻ khen, quét mã VietQR chuyển tiền sân.
  - *Bonus:* Bật Airplane mode demo chia cặp ngoại tuyến mượt mà.
- **Người thực hiện:** TV2 (Thao tác màn hình) & TV1 (Thuyết minh) (4 phút)
<!-- slide -->
### SLIDE 18: ĐỐI CHIẾU KẾT QUẢ VỚI MỤC TIÊU PROJECT CHARTER
- **Mục tiêu:** Khẳng định dự án đã hoàn thành vượt mức cam kết ban đầu.
- **Nội dung hiển thị:** Bảng đối soát 8/8 cam kết trong Project Charter:
  - 4 Module cốt lõi: Đạt 100%.
  - Thao tác chia cặp: Đạt chuẩn 3 chạm.
  - Thời gian xử lý: $< 0.1\text{ ms}$ (Chỉ tiêu $< 1.000\text{ ms}$).
  - Hoạt động ngoại tuyến: 100% khi mất mạng tại sân.
  - Kiểm thử tự động: 278/278 tests PASS (Chỉ tiêu $\ge 90\%$).
  - Chống race-condition: 0 lỗi trùng suất.
  - Hồ sơ quản trị: Đủ 100% Charter, WBS, Gantt, Risk, SRS, Bug Log, 11 biên bản họp tuần.
- **Người trình bày:** TV1 (0.5 phút)
<!-- slide -->
### SLIDE 19: BÀI HỌC KINH NGHIỆM TRONG QUẢN TRỊ DỰ ÁN
- **Mục tiêu:** Nêu bật giá trị học tập môn QLDAPM của nhóm.
- **Nội dung hiển thị:**
  1. **Khảo sát thực địa sớm:** Phát hiện mâu thuẫn luật sân ở Tuần 1 $\to$ Ban hành CR-01 kịp thời, tránh rủi ro đập đi xây lại.
  2. **Data Contract giải phóng sự phụ thuộc:** TV1 bàn giao contract v1.0 và mock data ở Tuần 3 giúp TV2 dựng UI độc lập, rút ngắn tiến độ.
  3. **Phân quyền thư mục (Ownership):** Xung đột code (Merge Conflict) bằng $0\%$ trong 12 tuần.
  4. **Kỷ luật kiểm thử tự động (TDD):** 278 tests là lá chắn an toàn khi tái cấu trúc thuật toán.
- **Người trình bày:** TV1 & TV2 (1 phút)
<!-- slide -->
### SLIDE 20: TỔNG KẾT & CẢM ƠN (Q&A SESSION)
- **Mục tiêu:** Kết thúc bài thuyết trình trang trọng, mở đầu phần hỏi đáp Hội đồng.
- **Nội dung hiển thị:**
  - Nhóm 02 cam kết: Sản phẩm đã hoàn thiện, kiểm nghiệm thực địa, mã nguồn và dữ liệu sạch 100%.
  - Lộ trình tương lai: Tách 3 chỉ số Elo độc lập, liên kết Webhook ngân hàng tự động.
  - Lời cảm ơn chân thành đến ThS. Nguyễn Thanh Tuấn và Hội đồng phản biện.
  - **SẴN SÀNG CHO PHẦN HỎI ĐÁP (Q&A)**
- **Người trình bày:** TV1 & TV2 (0.5 phút)
```
