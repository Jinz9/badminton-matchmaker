# NỘI DUNG SLIDE PHẦN TV2 (UI/UX, KIỂM THỬ & DEMO)

**Tài liệu:** `docs/slides/tv2-section.md`  
**Bám sát cấu trúc:** [outline.md](file:///d:/QLDAPM/docs/slides/outline.md) (Slides 14 – 17 & phần TV2 ở Slide 18 – 20)  
**Người trình bày:** Nguyễn Đức Đạt (TV2 — UI/UX, Mobile Dev & QA Lead)

---

### SLIDE 14: QUY TRÌNH THIẾT KẾ UI/UX & DESIGN SYSTEM
- **Nội dung hiển thị:**
  1. **Khảo sát tham khảo (Tuần 1):** Đối chiếu 2–3 ứng dụng thể thao/đặt sân ([benchmark-apps.md](file:///d:/QLDAPM/docs/ui/benchmark-apps.md)) $\to$ nhận diện khoảng trống về chia cặp 4–8 người & thao tác tại sân.
  2. **Wireframe & Figma Prototype:** Thiết kế hệ thống màn hình lõi (`1:3099`, `1:2724`, `1:3440`, `1:3306`, Auth/Profile), đối chiếu chặt với Data Contract (`ui-diff.md`).
  3. **Design Tokens & UI Kit (`/dev/ui-kit`):** Xây dựng 18+ component dùng chung (`NeonCTAButton`, `PlayerChip`, `TeamCard`, `BalanceMeter`, `ScoreBox`, `CourtDiagram`, `OfflineBanner`).
- **Minh chứng:** Ảnh Figma từ `docs/ui/figma-export/` và ảnh chụp `/dev/ui-kit` trên Expo Go.
- **Ghi chú người nói (TV2 — ~1 phút):**
  *"Kính thưa Hội đồng, phần thiết kế giao diện của nhóm đi theo quy trình 4 bước: khảo sát các app thể thao hiện có, lên Prototype Figma, chuẩn hóa Design Tokens và đóng gói thành UI Kit độc lập trên Expo. Nhờ tách bạch UI Kit và mock data theo hợp đồng của TV1, em có thể dựng song song toàn bộ màn hình mà không phải chờ backend hoàn tất."*

---

### SLIDE 15: NGUYÊN TẮC UX ĐẶC THÙ TẠI SÂN CẦU LÔNG
- **Nội dung hiển thị:**
  - **Thao tác một tay & Vùng ngón cái (Thumb Zone):** Toàn bộ nút hành động chính (`58px`) đặt ở cạnh dưới màn hình.
  - **Vùng chạm lớn `>= 48dp` & Chống chạm nhầm:** `PlayerChip >= 64px`, bảng điểm `ScoreBox >= 200px`, giữ sáng màn hình bằng `expo-keep-awake`.
  - **Tương phản cao ngoài trời nắng:** Nền tối `#0B1326` + neon `#A3E636` / cyan / hổ phách; kết hợp **chữ + biểu tượng + màu** (không phụ thuộc màu đơn thuần).
  - **Chia kèo $\le 3$ chạm & Offline-first:** Chạm 1 (Chọn sân) $\to$ Chạm 2 (Chọn người) $\to$ Chạm 3 (Xác nhận vào sân); mất mạng vẫn chia kèo & chấm điểm bình thường.
- **Ghi chú người nói (TV2 — ~1 phút):**
  *"Khi ra sân cầu lông thực tế, người dùng thường tay cầm vợt, tay dính mồ hôi và sân mái tôn thường bị mất sóng. Vì vậy tụi em thiết kế mọi nút chính nằm trong vùng ngón cái dưới màn hình, cao tối thiểu 48dp, dùng nền tối tương phản cao và rút gọn luồng chia kèo xuống đúng 3 chạm."*

---

### SLIDE 16: KẾT QUẢ KIỂM THỬ TỰ ĐỘNG, HIỆU NĂNG & FIELD TEST
- **Nội dung hiển thị (Số liệu thật từ [test-report.md](file:///d:/QLDAPM/docs/test/test-report.md)):**
  - **Bộ ca kiểm thử:** **84 Test Cases** (`TC-001`–`084`) truy vết 100% `FR-01`..`FR-35` & `NFR-01`..`NFR-09`.
  - **Kiểm thử tự động (`npm run test:all`):**
    - Domain + Config + Data: **20/20 suites, 210/210 tests PASS**.
    - Giao diện & Bảo mật UI (RNTL): **11/11 suites PASS**.
    - Phiếu chạy tự động: **76/84 ca PASS**, 0 FAIL; còn **8 ca** kiểm thử máy thật & Emulator (`[TV2 điền sau khi chạy đủ]`).
  - **Hiệu năng đo thực tế:** `balanceCourt` **`0–1 ms`** (`< 1000 ms`), render lưới 8 `PlayerChip` **`240 ms`**, chạm chọn **`36 ms`**.
  - **Field Test tại sân & Điểm SUS:** `[TV2 điền: số chạm trung bình, thời gian chia kèo, điểm SUS / 100]`.
- **Ghi chú người nói (TV2 — ~1 phút):**
  *"Về đảm bảo chất lượng, nhóm xây dựng 84 ca kiểm thử và chạy tự động bằng Jest kết hợp React Native Testing Library. Toàn bộ 210 unit/data test và 11 suite UI đều đạt 100%, thuật toán chia kèo phản hồi dưới 1 mili-giây. Khi thử nghiệm thực tế trên iPhone Expo Go, nhóm phát hiện và sửa ngay lỗi điều hướng GO_BACK trên màn hình xác thực."*

---

### SLIDE 17: DEMO TRỰC TIẾP TRÊN ĐIỆN THOẠI (EXPO GO)
- **Nội dung hiển thị:**
  - 5 bước live demo: Tạo kèo (`CR-01`) $\to$ Duyệt & Waitlist (`CR-02`) $\to$ Chia kèo 3 chạm (ca lẻ 5 người) $\to$ Bật chế độ máy bay chấm điểm BWF $\to$ Xem Elo & Lịch sử.
- **Ghi chú người nói & điều phối (TV2 thao tác — TV1 dẫn — 4 phút):**
  *"Em xin phép trình bày trực tiếp trên điện thoại chạy Expo Go. Đầu tiên ở vai trò Host, em chọn Sân 1... (bấm đủ 3 chạm)... Bây giờ em bật Chế độ máy bay để mô phỏng mất sóng trong nhà thi đấu nhưng vẫn chia lượt và nhập tỷ số bình thường."*

---

### SLIDE 18–20 (PHẦN TV2): BÀI HỌC KINH NGHIỆM UI/UX & QA
- **Nội dung hiển thị:**
  1. Thiết kế **UI Kit + Data Contract** giúp phát triển song song Frontend & Backend không bị nghẽn.
  2. Kiểm thử sớm trên **thiết bị thật (Android/iOS)** giúp phát hiện lỗi điều hướng (`GO_BACK`), vùng an toàn (SafeArea) và mạng LAN/Firewall mà giả lập không thấy.
  3. `[TV2 điền thêm cảm nhận cá nhân từ buổi Field Test thực tế tại sân Đà Nẵng]`.
- **Ghi chú người nói (TV2 — ~0.5 phút):**
  *"Bài học lớn nhất của em ở vai trò Mobile & QA là phải đặt người dùng tại sân làm trung tâm: giao diện đẹp thôi chưa đủ, mà phải bấm được một tay, chịu được mất mạng và được kiểm chứng bằng dữ liệu test thực tế."*
