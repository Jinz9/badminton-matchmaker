# BẢNG TỔNG HỢP CÁC HẠNG MỤC CẦN ĐIỀN THỰC TẾ (TODO-FILL CHECKLIST)

> **Mã tài liệu:** `docs/report/TODO-fill.md`  
> **Nguyên tắc học thuật:** **Tuyệt đối không bịa đặt số liệu thực tế ngoài đời thực.**  
> Bảng này liệt kê toàn bộ các vị trí được đánh dấu `[TV1 điền]` và `[TV2 điền]` trong toàn bộ 12 chương của Báo cáo Tổng kết Quản trị Dự án. Hai thành viên sử dụng checklist này để hoàn thiện dữ liệu thực tế trước khi xuất bản bản cứng/PDF nộp Hội đồng chấm đồ án.

---

## 1. Danh Sách Tác Vụ Dành Cho TV1 (Đào Duy Nhật - PM & Backend Lead)

- [ ] **Chương 2 (Project Charter):**
  - [ ] Hiệu chỉnh thông tin Giảng viên hướng dẫn (nếu có cập nhật học hàm/học vị).
- [ ] **Chương 4 (Quản lý Tiến độ & Gantt):**
  - [ ] Điền ngày hoàn thành thực tế của từng mốc M1 đến M12 trong Bảng 4.2.
  - [ ] Điền phân tích độ lệch tiến độ (Schedule Variance) và nguyên nhân gốc rễ (Root Cause) trong Mục 4.3 (nếu có gói công việc bị chậm).
- [ ] **Chương 5 (Quản trị Rủi ro):**
  - [ ] Điền các rủi ro đã thực sự xảy ra ngoài đời thực trong suốt 12 tuần (Mục 5.3).
  - [ ] Ghi lại biện pháp ứng phó thực tế đã áp dụng và đánh giá hiệu quả (Mục 5.3).
- [ ] **Chương 9 (Biên bản họp tuần):**
  - [ ] Bổ sung link Google Meet hoặc địa điểm họp thực tế vào các tuần W01–W11.
  - [ ] Điền nhận định kết quả khảo sát sơ bộ host tại Đà Nẵng trong Tuần 1.
- [ ] **Chương 10 (Kết quả dự án):**
  - [ ] Điền số liệu đo đạc thực tế tại buổi đánh kiểm thử thực địa (Field test tại sân Kỳ Đồng/Tuyên Sơn): Số hiệp đấu đã vận hành, thời gian trung bình Host hoàn thành chia cặp, điểm đánh giá tiện dụng System Usability Scale (SUS).
- [ ] **Tài liệu kiểm thử thực địa (`docs/test/field-test-guide.md`):**
  - [ ] Điền kết quả thực địa: Ngày tổ chức, địa điểm sân, số lượng người tham gia thực tế, số trận đấu, điểm SUS trung bình, phản hồi thực tế của người chơi A/B và sự cố (nếu có).

---

## 2. Danh Sách Tác Vụ Dành Cho TV2 (Nguyễn Đức Đạt - QA Lead & Mobile Dev)

- [ ] **Chương 9 (Biên bản họp tuần):**
  - [ ] Với vai trò Thư ký cuộc họp, TV2 hoàn thiện các đoạn tóm tắt tiến độ UI/UX của các tuần W02, W03, W04, W05, W06, W07, W09, W10.
  - [ ] Điền đường dẫn (link) Video Clip Demo Full HD đã biên tập và tải lên Drive/YouTube ở Tuần 11.
- [ ] **Chương 12 (Phụ lục Báo cáo):**
  - [ ] **Phụ lục A (Báo cáo kiểm thử thiết bị):** Tổng hợp số ca kiểm thử đã chạy trên thiết bị di động thật (Android/iOS), số ca PASS/FAIL, thiết bị cụ thể (iPhone / Samsung / Xiaomi) và nhận xét độ mượt mà khi thao tác một tay tại sân.
  - [ ] **Phụ lục B (Minh chứng Figma):** Cung cấp đường dẫn Prototype tương tác chính thức trên Figma; chèn ảnh chụp màn hình minh họa 13 màn hình ứng dụng tiêu biểu.
- [ ] **Tài liệu ca kiểm thử di động (`docs/test/test-cases-mobile.md`):**
  - [ ] Điền vào 3 cột: *Kết quả thực tế trên thiết bị*, *Đánh giá (PASS/FAIL)*, và *Ghi chú của TV2* cho 36 ca kiểm thử nghiệp vụ và ca biên.
- [ ] **Tài liệu Bug Log (`docs/test/bug-log.md`):**
  - [ ] Ghi nhận các lỗi giao diện hoặc tương tác phát hiện trong quá trình test máy thật (nếu có) kèm hình ảnh và các bước tái hiện.

---

## 3. Quy Trình Phối Hợp Hoàn Thiện Bản In Cuối Cùng

1. **Bước 1:** TV1 và TV2 mở checklist này và các file chương tương ứng trong thư mục `docs/report/`.
2. **Bước 2:** Nhập các số liệu thật vào đúng các vị trí có thẻ `[TV1 điền]` và `[TV2 điền]`.
3. **Bước 3:** Sau khi điền xong, xóa nhãn `[TV1 điền]` / `[TV2 điền]` và đánh dấu tick `[x]` vào checklist này.
4. **Bước 4:** Chạy lệnh xuất bản Pandoc hoặc dùng extension VS Code Markdown PDF (theo hướng dẫn tại `docs/report/README.md`) để tạo file Word `.docx` và file `.pdf` đóng bìa nộp cho Nhà trường.
