# KẾ HOẠCH TẬP DƯỢT THUYẾT TRÌNH BẢO VỆ ĐỒ ÁN (REHEARSAL PLAN)
**Dự án:** Hệ thống Ghép Đội & Cân Bằng Kèo Cầu Lông (Mobile App)  
**Thời lượng chuẩn:** **20 Phút** (15 phút Thuyết trình Slide + 5 phút Trực tiếp Demo trên thiết bị thật) + 10 phút Trả lời phản biện (Q&A)  
**Địa điểm dự kiến:** Phòng Bảo vệ Đồ án Tốt nghiệp / Báo cáo Học phần QLDAPM  
**Nhóm sinh viên:**  
- **TV1:** Đào Duy Nhật (Trưởng nhóm / PM / Backend & Thuật toán)  
- **TV2:** Nguyễn Đức Đạt (Thành viên / Frontend / UI-UX & QA-Tester)  

---

## 1. MỤC TIÊU & TIÊU CHÍ ĐÁNH GIÁ BUỔI TẬP DƯỢT

### 1.1. Mục tiêu
1. Đảm bảo toàn bộ bài thuyết trình kết thúc trong khoảng **19:00 - 19:45 phút** (không bị cháy giáo án quá 20 phút và không kết thúc quá sớm dưới 17 phút).
2. Phân vai nhịp nhàng, liền mạch giữa TV1 và TV2: không ngắt lời nhau, không có khoảng lặng chết (dead air), phối hợp đồng bộ khi TV2 thao tác app trên màn chiếu và TV1 thuyết minh.
3. Làm chủ 100% kịch bản demo 5 bước và các câu hỏi phản biện chuyên sâu trong `docs/slides/qa-bank.md`.

### 1.2. Tiêu chí đánh giá buổi diễn tập
- **Kiểm soát thời gian:** Mỗi slide bám sát thời lượng định mức (dung sai cho phép $\pm 15$ giây/slide).
- **Ngôn ngữ hình thể & Giọng nói:** Tự tin, hướng mắt về phía Hội đồng, giọng nói to rõ, dứt khoát; không đọc nguyên văn từng chữ trên slide.
- **Thao tác Demo:** Dứt khoát, mượt mà, không lúng túng bấm nhầm, chuẩn bị sẵn dữ liệu sạch.

---

## 2. BẢNG PHÂN BỔ THỜI GIAN VÀ TIẾN ĐỘ TỪNG SLIDE (20 PHÚT)

| STT | Slide | Tiêu đề nội dung | Người nói | Thời lượng | Mốc tích lũy (Phút:Giây) | Ghi chú chuyển tiếp / Hành động |
|:---:|:-----:|:---|:---:|:---:|:---:|:---|
| 1 | Slide 01 | Bìa: Hệ thống Ghép Đội Cầu Lông | TV1 | 0:45 | **00:45** | Chào Hội đồng, giới thiệu 2 thành viên và vai trò. |
| 2 | Slide 02 | Bối cảnh bài toán cầu lông phong trào | TV1 | 1:00 | **01:45** | Nêu 3 nỗi đau: lệch trình, thiếu người, chia cặp cãi nhau. |
| 3 | Slide 03 | Mục tiêu & Phạm vi dự án (Charter) | TV1 | 0:45 | **02:30** | Nhấn mạnh 4 mục tiêu SMART đã cam kết. |
| 4 | Slide 04 | Khách hàng & Các bên liên quan | TV1 | 0:45 | **03:15** | Host sân Kỳ Đồng/Tuyên Sơn, người chơi vãng lai. |
| 5 | Slide 05 | Quy trình Scrum & Tổ chức nhóm | TV1 | 1:00 | **04:15** | 6 Sprint 12 tuần, Velocity 22-26 SP/sprint. |
| 6 | Slide 06 | Phân rã WBS & Ma trận RACI | TV1 | 1:00 | **05:15** | 21 gói công việc, trách nhiệm A/R/C/I rạch ròi. |
| 7 | Slide 07 | Tiến độ Gantt & Xử lý độ lệch | TV1 | 1:00 | **06:15** | Giải thích xử lý lệch +3 ngày tại Sprint 3 bằng Fast-Tracking. |
| 8 | Slide 08 | Quản trị rủi ro (Risk Heatmap 5x5) | TV1 | 1:00 | **07:15** | Điểm nhấn rủi ro R-04 ghi đồng thời và Firestore Transaction. |
| 9 | Slide 09 | Quản trị thay đổi: CR-01 & CR-02 | TV1 | 1:15 | **08:30** | Bước ngoặt luật 8 người/sân và quy trình xử lý CR. |
| 10 | Slide 10 | Kiến trúc tổng thể: Expo + Firebase BaaS | TV1 | 1:00 | **09:30** | 2 lớp bảo vệ (Rules + Functions), chi phí $0 Spark Plan. |
| 11 | Slide 11 | Nghiệp vụ: Thang 6 cấp & Elo đôi | TV1 | 1:00 | **10:30** | Công thức kỳ vọng đôi, hệ số K=40/20, chống gian lận. |
| 12 | Slide 12 | Thuật toán Session Balancing (CR-01) | TV1 | 1:15 | **11:45** | Heuristic Greedy < 5ms, giải bài toán ca lẻ 5/7 người. |
| 13 | Slide 13 | Thuật toán Partner Finder & Đề xuất | TV1 | 0:45 | **12:30** | Công thức trọng số đa tiêu chí, match score $\ge 75$. |
| - | - | **CHUYỂN GIAO LỜI NÓI CHO TV2** | TV1 $\rightarrow$ TV2 | 0:15 | **12:45** | TV1 giới thiệu TV2 trình bày phần UI/UX & Kiểm thử. |
| 14 | Slide 14 | Thiết kế UI/UX thực địa một tay | TV2 | 1:15 | **14:00** | Thumb Zone, chia cặp 3 chạm, Stepper nhập điểm, Dark mode. |
| 15 | Slide 15 | Chiến lược kiểm thử & Số liệu thực tế | TV2 | 1:00 | **15:00** | 4 tầng kiểm thử, **278 tests PASS 100%**, quy trình Bug Log. |
| 16 | Slide 16 | Kết quả Field Test tại Đà Nẵng | TV2 | 0:45 | **15:45** | 12 người thật sân Kỳ Đồng/Tuyên Sơn, điểm **SUS 82.5**. |
| 17 | Slide 17 | **TRỰC TIẾP DEMO 5 BƯỚC** | TV2 + TV1 | 5:00 | **20:45** | TV2 trực tiếp bấm điện thoại, TV1 dẫn dắt kịch bản. |
| 18 | Slide 18 | Đối chiếu kết quả với Project Charter | TV1 | 0:45 | **21:30** | Hoàn thành 100% chỉ tiêu KPI đã cam kết. |
| 19 | Slide 19 | Đánh giá, Bài học & Hướng phát triển | TV1 & TV2 | 1:00 | **22:30** | Mỗi người phát biểu 1 bài học lớn, 3 hướng mở rộng. |
| 20 | Slide 20 | Lời cảm ơn & Phiên phản biện Q&A | Cả hai | 0:30 | **23:00** | Mời Thầy/Cô và Hội đồng đặt câu hỏi phản biện. |

*(Ghi chú: Mục tiêu thời gian nói trên slide là 15:45 phút + 4:15 phút demo = tổng 20:00 phút. Giữ nhịp thở đều, không vội vàng).*

---

## 3. KỊCH BẢN PHỐI HỢP CHI TIẾT TRONG PHẦN LIVE DEMO (SLIDE 17 - 5 PHÚT)

Phần Live Demo là "trái tim" của buổi báo cáo. Cần sự ăn ý tuyệt đối giữa người bấm máy và người nói:

### Phân công vai trò:
- **TV2 (Nguyễn Đức Đạt):** Cầm điện thoại kết nối màn chiếu (hoặc chiếu qua máy tính/Scrcpy/AirPlay), thao tác dứt khoát theo hiệu lệnh.
- **TV1 (Đào Duy Nhật):** Đứng trước bục/màn hình, dùng mic thuyết minh từng thao tác của TV2, giải thích rõ nghiệp vụ và logic hệ thống đang diễn ra ngầm.

### Kịch bản 5 bước thao tác:

#### Cảnh 1: Tạo kèo có số suất tuyển vãng lai (01:00)
- **Lời dẫn (TV1):** *"Kính thưa Hội đồng, TV2 đang vào vai Host Nam Hải tạo buổi đánh tối nay tại Sân Kỳ Đồng. Buổi chơi gồm 2 sân, 10 người cố định và mở tuyển 4 suất vãng lai trình độ TB1-TB2."*
- **Thao tác (TV2):** Mở app $\rightarrow$ Bấm nút `+ Tạo kèo` $\rightarrow$ Chọn Sân Kỳ Đồng, 2 sân, giờ $18:00 - 20:00$, số suất vãng lai: 4 $\rightarrow$ Bấm `Đăng kèo`. Kèo xuất hiện ngay lập tức trên màn hình chính.

#### Cảnh 2: Người chơi xin tham gia, duyệt và xử lý Waitlist (01:00)
- **Lời dẫn (TV1):** *"Bây giờ, TV2 đổi sang tài khoản của bạn Tuấn (TB1) vừa tìm thấy kèo trên trang chủ nhờ gợi ý Partner Finder. Tuấn bấm xin tham gia. Do kèo đã có 4 người đặt trước, hệ thống tự động thông báo hết suất và đưa Tuấn vào hàng đợi Waitlist vị trí #1."*
- **Thao tác (TV2):** Bấm `Tham gia` $\rightarrow$ Modal hiển thị `Bạn đang ở vị trí dự bị #1` $\rightarrow$ Quay lại tài khoản Host bấm hủy 1 khách có việc bận $\rightarrow$ Hệ thống tự động đôn Tuấn từ Waitlist lên danh sách chính thức trong vòng 1 giây.

#### Cảnh 3: Chia cặp tự động tại sân theo luật CR-01 (01:00)
- **Lời dẫn (TV1):** *"Đến giờ ra sân, Host điểm danh có 7 người trên Sân số 1 (ca số lẻ 7 người). Host chỉ cần 1 chạm bấm 'Chia cặp tự động'. Thuật toán Heuristic Greedy ngay lập tức xếp 4 người vào sân với điểm Elo cân bằng, và chọn ra 3 người nghỉ ngơi với cam kết không ai nghỉ 2 lượt liên tiếp."*
- **Thao tác (TV2):** Vào chi tiết buổi chơi $\rightarrow$ Tab `Quản lý sân` $\rightarrow$ Bấm `Chia tự động lượt 1`. Màn hình hiển thị ngay Cặp 1 vs Cặp 2 và danh sách 3 người nghỉ.

#### Cảnh 4: Nhập tỷ số set đấu bằng 1 tay (00:45)
- **Lời dẫn (TV1):** *"Sau hiệp đấu gay cấn, Host dùng một tay bấm Stepper tăng điểm $21-19$ và bấm 'Xác nhận kết quả'."*
- **Thao tác (TV2):** Bấm vào trận đấu $\rightarrow$ Bấm nút `+` điểm để thành $21-19$ $\rightarrow$ Bấm `Lưu tỷ số`. Trạng thái chuyển sang `Đã kết thúc`.

#### Cảnh 5: Cập nhật Elo động, thống kê và Đồng đội ăn ý (01:15)
- **Lời dẫn (TV1):** *"Ngay lập tức, Cloud Function kích hoạt tính toán Elo: Đội thắng được cộng điểm thích nghi theo hệ số K, điểm uy tín được cộng tự động. TV2 mở trang cá nhân: Biểu đồ lịch sử Elo nhảy nấc mới và chỉ số 'Đồng đội ăn ý nhất' tự động cập nhật."*
- **Thao tác (TV2):** Chuyển sang Tab `Cá nhân` $\rightarrow$ Kéo vuốt làm mới $\rightarrow$ Hiển thị Elo tăng $+16$ điểm $\rightarrow$ Cuộn xuống mục `Đồng đội ăn ý nhất` hiển thị bạn đánh cặp với tỷ lệ thắng $75\%$.

---

## 4. LỊCH TRÌNH 3 BUỔI TẬP DƯỢT (REHEARSAL SCHEDULE)

Nhóm cam kết thực hiện nghiêm túc **3 buổi tập dượt** trước ngày bảo vệ chính thức:

### Buổi 1: Rà soát khớp nội dung & Giọng điệu (Dry Run 1)
- **Thời gian:** 3 ngày trước lễ bảo vệ (Buổi tối, 2 tiếng).
- **Mục tiêu:** 
  - Từng thành viên nói thử toàn bộ phần của mình mà không bật đồng hồ áp lực.
  - Sửa các câu từ dài dòng, tối nghĩa, ngập ngừng ("ờ, à").
  - Góp ý chéo về cách chuyển tiếp lời nói giữa TV1 và TV2.

### Buổi 2: Bấm giờ nghiêm ngặt & Phối hợp Demo (Dry Run 2)
- **Thời gian:** 2 ngày trước lễ bảo vệ (Buổi chiều, 2 tiếng).
- **Mục tiêu:**
  - Bật đồng hồ đếm ngược 20:00 phút trên màn hình lớn.
  - Chạy toàn bộ slide kết hợp TV2 thao tác app thật kết nối màn hình ngoài.
  - Đo đạc thời gian từng slide so với bảng định mức. Ghi chú các slide bị lố thời gian để cắt ngắn lời thoại.

### Buổi 3: Tổng duyệt Trang phục & Thử nghiệm Sự cố (Dress Rehearsal)
- **Thời gian:** 1 ngày trước lễ bảo vệ (Buổi sáng, 1.5 tiếng).
- **Mục tiêu:**
  - Mặc trang phục chỉnh tề (Áo sơ mi, quần tây/váy công sở).
  - Diễn tập mô phỏng tình huống ngắt kết nối mạng bất ngờ (rút dây mạng / tắt wifi) để kích hoạt kịch bản dự phòng.
  - Bốc thăm ngẫu nhiên 5 câu hỏi trong `docs/slides/qa-bank.md` để người kia trả lời phản xạ nhanh.

---

## 5. PHƯƠNG ÁN DỰ PHÒNG RỦI RO & SỰ CỐ (CONTINGENCY PLANS)

| Tình huống sự cố | Xác suất | Tác động | Phương án xử lý dự phòng tức thời |
|:---|:---:|:---:|:---|
| **Sự cố 1: Mạng Wi-Fi phòng bảo vệ mất hoặc sóng 4G quá yếu** | Cao | Nghiêm trọng | - Điện thoại TV2 đã bật sẵn tính năng Offline Cache của app.<br>- Chuẩn bị sẵn 1 điện thoại thứ ba phát Hotspot 4G tốc độ cao riêng cho điện thoại demo và laptop trình chiếu. |
| **Sự cố 2: Điện thoại không thể kết nối AirPlay/HDMI lên máy chiếu** | Trung bình | Nghiêm trọng | - **Phương án B1:** Sử dụng phần mềm phản chiếu có dây `scrcpy` cắm cáp USB trực tiếp vào laptop trình chiếu.<br>- **Phương án B2:** Nếu cáp hỏng, TV1 lập tức mở file video quay sẵn chất lượng cao 1080p (`docs/demo/backup-video.mp4`) đã lưu trên máy, TV1 thuyết minh theo video. |
| **Sự cố 3: Dữ liệu demo bị lỗi hoặc có người thao tác sai trước giờ G** | Thấp | Trung bình | - Chạy script reset dữ liệu trong 3 giây: `npm run seed:demo` để đưa cơ sở dữ liệu Firebase về trạng thái mẫu nguyên bản trước khi bước vào phòng. |
| **Sự cố 4: TV1 hoặc TV2 bị mất giọng hoặc gặp sự cố sức khỏe đột xuất** | Thấp | Cực lớn | - Cả hai thành viên đã học chéo nội dung của nhau.<br>- Nếu TV1 không nói được: TV2 thuyết trình toàn bộ slide, TV1 điều khiển bấm slide và demo.<br>- Nếu TV2 không nói được: TV1 thuyết trình toàn bộ và tự thao tác demo trên điện thoại đặt tại bục. |
| **Sự cố 5: Hội đồng ngắt lời, yêu cầu bỏ qua phần lý thuyết để vào demo ngay** | Trung bình | Thấp | - TV1 bình tĩnh mỉm cười: *"Dạ vâng, em xin phép Hội đồng chuyển ngay sang Slide 17 để trực tiếp demo sản phẩm hoạt động thực tế trên điện thoại."* Bấm nhảy slide và bắt đầu ngay kịch bản demo. |

---

## 6. CHECKLIST KỸ THUẬT TRƯỚC GIỜ BƯỚC VÀO PHÒNG BẢO VỆ (T-60 PHÚT)

- [ ] **Laptop trình chiếu:**
  - [ ] Pin sạc đầy 100% + cắm sẵn adapter nguồn.
  - [ ] File Slide PowerPoint `.pptx` và bản PDF dự phòng đã copy ra màn hình Desktop.
  - [ ] File video demo dự phòng `backup-video.mp4` sẵn sàng mở bằng VLC.
  - [ ] Tắt toàn bộ thông báo Zalo, Facebook, Email, Teams trên laptop.
  - [ ] Bật chế độ "Do Not Disturb" và chỉnh cài đặt màn hình không bao giờ tự tắt (Never sleep).
- [ ] **Thiết bị di động demo (Điện thoại TV2):**
  - [ ] Pin $\ge 80\%$.
  - [ ] Màn hình đã lau sạch vân tay và mồ hôi.
  - [ ] Bật độ sáng màn hình mức tối đa (100%).
  - [ ] Đặt thời gian tự tắt màn hình là "Không bao giờ" (Never timeout).
  - [ ] Đăng nhập sẵn tài khoản Host Nam Hải.
  - [ ] Đã chạy lệnh seed dữ liệu sạch mới nhất.
  - [ ] Đã tắt chuông và toàn bộ thông báo ứng dụng mạng xã hội.
- [ ] **Trang thiết bị kết nối:**
  - [ ] Cáp chuyển đổi Type-C / Lightning sang HDMI / VGA.
  - [ ] Bút laser trình chiếu (Presenter clicker) đã lắp pin mới.
  - [ ] Cáp USB kết nối máy tính để dự phòng chạy `scrcpy`.
- [ ] **Tài liệu bản cứng:**
  - [ ] In sẵn 3 bộ Báo cáo Đồ án hoàn chỉnh (từ file xuất Word/PDF) để kính gửi Hội đồng nếu được yêu cầu.
  - [ ] In sẵn 1 bản `docs/slides/qa-bank.md` để hai thành viên xem nhanh trước giờ G.

