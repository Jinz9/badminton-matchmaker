# PHÂN TÍCH CÁC BÊN LIÊN QUAN (STAKEHOLDER ANALYSIS)

**Dự án:** Hệ thống ghép đội, ghép đồng đội theo độ phù hợp trong lĩnh vực cầu lông (Mobile App)  
**Tài liệu:** Phân tích các bên liên quan & Đầu vào cho SRS  
**Ngày ban hành:** 15/11/2026  
**Người thực hiện:** TV1 (PM & BA Lead)  

---

## 1. Bảng phân tích các bên liên quan (Stakeholder Register)

| Bên liên quan | Vai trò trong hệ thống | Kỳ vọng chính | Mức ảnh hưởng (Power) | Mức quan tâm (Interest) | Chiến lược & Kênh giao tiếp |
|---|---|---|---|---|---|
| **Chủ kèo / Người tổ chức (Host)** | - Người tạo kèo giao lưu (1–2 sân).<br>- Nhập danh sách người mặc định (core).<br>- Duyệt/từ chối vãng lai.<br>- Xếp cặp trước hoặc kích hoạt chia tự động.<br>- Nhập tỷ số trận đấu. | - Tạo kèo nhanh, tuyển đủ người thiếu trong vài phút.<br>- Không bị bùng kèo phút chót.<br>- Chia cặp cân sức, không phải giải thích nhiều với người chơi.<br>- Thao tác 1 tay nhanh gọn ngay tại sân. | **Cao** *(Người dùng trung tâm, quyết định tần suất sử dụng app)* | **Cao** | **Phối hợp chặt chẽ (Manage Closely):**<br>- Phỏng vấn trực tiếp tại sân.<br>- Thử nghiệm Prototype sớm.<br>- Thu thập phản hồi hàng tuần. |
| **Người chơi vãng lai (Recruit Player)** | - Tìm kiếm các kèo cầu lông mở tại Đà Nẵng.<br>- Đặt suất tham gia khi thấy phù hợp.<br>- Được xếp trận, thi đấu và cập nhật điểm Elo, điểm uy tín. | - Tìm được sân gần nhà, đúng khung giờ và đúng trình độ của mình.<br>- Trận đấu ngang tài ngang sức, không bị "bán độ" hay chênh lệch quá xa.<br>- Minh bạch về trạng thái duyệt/dự bị.<br>- Trải nghiệm mượt mà, dễ dùng. | **Trung bình** *(Tạo nên thanh khoản mạng lưới của app)* | **Cao** | **Luôn thông báo & Lắng nghe (Keep Informed):**<br>- Gửi thông báo đẩy (Push notification) về trạng thái đặt suất/duyệt.<br>- Khảo sát trải nghiệm sau trận đấu. |
| **Quản trị viên hệ thống (Admin in-app)** | - Vận hành hệ thống chung qua quyền `role: "admin"` ngay trong mobile app.<br>- Xử lý khiếu nại bùng kèo/hủy kèo.<br>- Khóa/mở tài khoản vi phạm.<br>- Duyệt danh mục sân cầu lông tại Đà Nẵng. | - Có công cụ xem báo cáo tổng quan.<br>- Dễ dàng tra cứu lịch sử trận đấu để giải quyết tranh chấp điểm uy tín.<br>- Hệ thống ổn định, dữ liệu nhất quán. | **Cao** *(Quyền hạn can thiệp dữ liệu hệ thống)* | **Trung bình** | **Tham vấn định kỳ (Keep Satisfied):**<br>- Dashboard báo cáo tóm tắt trong app.<br>- Logs tra cứu hành vi. |
| **Giảng viên hướng dẫn** | - Định hướng phương pháp luận nghiên cứu và quản trị dự án.<br>- Đánh giá chất lượng học thuật và mã nguồn đồ án.<br>- Quyết định điều kiện nghiệm thu và cho phép bảo vệ. | - Nhóm tuân thủ đúng quy trình Agile/Scrum và WBS 12 tuần.<br>- Đồ án giải quyết bài toán thực tế có cơ sở khoa học (thuật toán cân kèo, mô hình Elo).<br>- Báo cáo, slide, mã nguồn chỉn chu, trung thực. | **Rất cao** *(Quyết định sự thành công và điểm số đồ án)* | **Cao** | **Báo cáo & Phê duyệt chặt chẽ (Manage Closely):**<br>- Họp báo cáo định kỳ (Weekly review).<br>- Gửi biên bản họp và tiến độ Milestone (M1–M12). |
| **Nhóm phát triển (TV1 & TV2)** | - **TV1:** Quản lý dự án, đặc tả nghiệp vụ, kiến trúc dữ liệu, Cloud Backend, thuật toán lõi.<br>- **TV2:** Thiết kế UI/UX Figma, lập trình ứng dụng di động React Native / Expo. | - Ranh giới công việc rõ ràng theo Data Contract.<br>- Hoàn thành sản phẩm đúng hạn 12 tuần.<br>- Đạt điểm số xuất sắc và tích lũy kinh nghiệm thực tế. | **Cao** *(Trực tiếp xây dựng sản phẩm)* | **Rất cao** | **Hợp tác liên tục (Collaborate Daily):**<br>- Đồng bộ mã nguồn qua Git (`dev`, feature branches).<br>- Họp 30 phút vào Chủ nhật hàng tuần. |
| **Chủ sân / Ban quản lý cụm sân cầu lông** *(Bên ngoài)* | - Cung cấp địa điểm thi đấu vật lý tại Đà Nẵng (sân Quân Khu 5, Kỳ Đồng, Tuyên Sơn...).<br>- Duy trì ánh sáng, thảm sân và lưới. | - Sân luôn kín lịch thuê, có thêm khách hàng mới đến giao lưu.<br>- Giảm thiểu tranh chấp, mất an ninh trật tự tại sân. | **Thấp** *(Không dùng trực tiếp app trong bản MVP)* | **Thấp** | **Giám sát tối thiểu (Monitor):**<br>- Khảo sát thông tin địa chỉ, số lượng sân, bảng giá để cập nhật vào dữ liệu hệ thống. |

---

## 2. Ma trận Quyền lực – Mức độ quan tâm (Power-Interest Matrix)

Ma trận phân bổ các bên liên quan theo mức độ quyền lực (Power/Influence) và mức độ quan tâm (Interest):

```
       QUYỀN LỰC (POWER)
             ▲
             │
      Cao    │   [GIỮ HÀI LÒNG - Keep Satisfied]     │   [QUẢN LÝ CHẶT CHẼ - Manage Closely]
             │   - Quản trị viên hệ thống (Admin)     │   - Giảng viên hướng dẫn (`[TV1 điền]`)
             │                                        │   - Chủ kèo / Người tổ chức (Host)
             │                                        │   - Thành viên 1 (PM & Backend Lead)
             ├────────────────────────────────────────┼────────────────────────────────────────
             │   [GIÁM SÁT TỐI THIỂU - Monitor]       │   [LUÔN THÔNG BÁO - Keep Informed]
             │   - Chủ sân / Quản lý cụm sân vật lý   │   - Người chơi vãng lai (Recruits)
      Thấp   │                                        │   - Thành viên 2 (Mobile Dev & UI/UX)
             │                                        │
             └────────────────────────────────────────┴────────────────────────────────────────►
                         Thấp                                       Cao
                                          MỨC ĐỘ QUAN TÂM (INTEREST)
```

### Chiến lược ứng xử chi tiết:
1. **Nhóm "Quản lý chặt chẽ" (High Power - High Interest):**
   - **Giảng viên hướng dẫn:** Gửi báo cáo tiến độ theo từng Milestone (M1–M12), xin ý kiến sớm về phạm vi và cấu trúc đề tài.
   - **Chủ kèo (Host):** Phỏng vấn sâu 2–3 host thực tế tại Đà Nẵng ngay trong Sprint 1 để tinh chỉnh các giả định A1–A8; cho dùng thử ứng dụng ngay từ bản Alpha/Beta.
   - **Thành viên 1:** Duy trì nhịp độ Sprint, giám sát chặt rủi ro và Data Contract.
2. **Nhóm "Giữ hài lòng" (High Power - Low Interest):**
   - **Admin:** Thiết kế luồng thao tác đơn giản, báo cáo cô đọng ngay trên ứng dụng di động.
3. **Nhóm "Luôn thông báo" (Low Power - High Interest):**
   - **Người chơi vãng lai:** Tối ưu thông báo đẩy theo thời gian thực (khi được duyệt, khi có người hủy để đôn lên, khi có kết quả trận đấu).
   - **Thành viên 2:** Thảo luận và thống nhất Data Contract trước khi TV2 code màn hình.
4. **Nhóm "Giám sát tối thiểu" (Low Power - Low Interest):**
   - **Chủ sân cầu lông:** Cập nhật chính xác danh sách sân bãi tại Đà Nẵng để tăng tính thực tế cho đồ án.

---

## 3. Nhu cầu cốt lõi của từng nhóm – Đầu vào cho Đặc tả Yêu cầu (SRS)

Bảng tổng hợp nhu cầu làm căn cứ trực tiếp để xây dựng danh sách Yêu cầu Chức năng (Functional Requirements - FR) và Phi chức năng (NFR) trong tài liệu SRS:

### A. Nhu cầu của Chủ kèo (Host):
1. **Tạo kèo linh hoạt:**
   - Tạo buổi đánh với 1 hoặc 2 sân; gán nội dung (đôi nam, đôi nữ, đôi nam nữ) và dải trình độ (cấp 1–6) cho từng sân.
   - Thêm danh sách bạn bè mặc định (kể cả bạn chưa có tài khoản - thành viên "ghost").
2. **Kiểm soát tuyển vãng lai:**
   - Hệ thống tự động tính số suất trống theo quy tắc `min(4, 8 - core)`.
   - Xem hồ sơ người xin tham gia: Cấp độ tự khai, Elo thực tế, điểm uy tín, vị trí đánh (cầu trước/cầu sau) trước khi bấm Duyệt hoặc Từ chối.
3. **Chia cặp cân kèo & Thao tác tại sân:**
   - Cho phép khóa cặp đánh định sẵn (cặp tự bắt hoặc host chỉ định).
   - Bấm 1 nút để hệ thống tự động chia các cặp còn lại và xếp lịch lượt đánh, xoay tua người nghỉ công bằng (ca 5 người, 7 người).
   - Hoạt động mượt mà khi mất kết nối mạng tại nhà thi đấu.
4. **Nhập kết quả & Quản lý kỷ luật:**
   - Nhập tỷ số set đấu nhanh; gắn thẻ phản hồi về thái độ/trình độ người chơi; báo cáo bùng kèo để trừ điểm uy tín.

### B. Nhu cầu của Người chơi vãng lai (Recruits):
1. **Tìm kèo thông minh (Discovery):**
   - Lọc danh sách kèo theo: Khu vực/Quận huyện tại Đà Nẵng, thời gian thi đấu, trình độ yêu cầu, nội dung đôi nam/nữ/nam nữ.
   - Ứng dụng tự động cảnh báo hoặc chặn nếu bản thân không đủ điều kiện (lệch giới tính, lệch dải trình độ sân, điểm uy tín dưới ngưỡng).
2. **Theo dõi trạng thái tham gia:**
   - Nhận thông báo tức thì khi được Host duyệt hoặc bị từ chối.
   - Nếu vào danh sách dự bị (waitlist): Tự động đôn lên suất chính thức khi có người phía trước rút lui.
3. **Phát triển trình độ & Đối tác ăn ý:**
   - Xem biểu đồ tăng trưởng điểm Elo sau mỗi trận đấu.
   - Nhận diện bạn chơi ăn ý nhất để kết bạn hoặc rủ đi đánh cặp cố định ở các kèo sau.

### C. Nhu cầu của Quản trị viên (Admin):
1. **Duyệt và làm giàu dữ liệu:**
   - Quản lý danh mục các cụm sân cầu lông tại Đà Nẵng (tên sân, địa chỉ, số sân).
2. **Giám sát & Hỗ trợ:**
   - Xem danh sách người dùng có điểm uy tín thấp (< 60 điểm); xử lý các khiếu nại báo cáo bùng kèo nhầm để khôi phục điểm uy tín.

### D. Nhu cầu của Giảng viên & Hội đồng nghiệm thu:
1. **Tính hoàn thiện và kỷ luật:**
   - Có đầy đủ tài liệu quản trị: Charter, SRS, Data Contract, Test Plan, Báo cáo rủi ro.
   - Mã nguồn tuân thủ kiến trúc phân tầng sạch (Clean Architecture): Tách biệt logic nghiệp vụ thuần (`src/domain/`) với hạ tầng (`functions/`, `src/app/`).
2. **Tính ứng dụng & Sáng tạo:**
   - Giải quyết bài toán thực tế của địa phương (Đà Nẵng).
   - Thuật toán cân bằng trình độ có cơ sở toán học rõ ràng và bộ test case chứng minh tính đúng đắn.

