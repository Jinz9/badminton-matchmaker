# HƯỚNG DẪN THIẾT LẬP VÀ NHẬP BẢNG CÔNG VIỆC TRELLO / JIRA (BOARD-IMPORT.MD)

Tài liệu này hướng dẫn chi tiết cách thiết lập bảng quản lý công việc (Kanban Board) từ dữ liệu tại [docs/schedule.csv](file:///d:/QLDAPM/docs/schedule.csv) lên **Trello** hoặc **Jira Software**, phục vụ cho việc theo dõi tiến độ giữa TV1 và TV2.

---

## 1. Cấu trúc chuẩn của Bảng Kanban (5 Cột)

Dù sử dụng Trello hay Jira, bảng công việc của nhóm phải được chia thành **05 cột (Lists / Columns)** đại diện cho luồng công việc Agile:

```
┌───────────────┐   ┌────────────────┐   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  1. Backlog   │ ➔ │ 2. Sprint Back │ ➔ │   3. Doing    │ ➔ │   4. Review   │ ➔ │    5. Done    │
│               │   │                │   │               │   │               │   │               │
│ Toàn bộ 21 WBS│   │ Các task của   │   │ Đang code     │   │ Đang mở PR    │   │ Đã merge dev  │
│ của 12 tuần   │   │ Sprint hiện tại│   │ (Tối đa 2     │   │ chờ đối tác   │   │ test chạy PASS│
│               │   │                │   │ task/người)   │   │ review chéo   │   │               │
└───────────────┘   └────────────────┘   └───────────────┘   └───────────────┘   └───────────────┘
```

---

## 2. Hệ thống Nhãn công việc (Labels & Tags)

Để dễ lọc và phân loại công việc theo cơ cấu WBS và các mốc Milestone:

### A. Nhãn theo Gói WBS (Màu sắc gợi ý):
- 🟣 `WBS-1`: Khởi tạo và Quản trị dự án (WBS 1.1 – 1.4)
- 🔵 `WBS-2`: Phân tích nghiệp vụ & Thiết kế hệ thống (WBS 2.1 – 2.4)
- 🟠 `WBS-3`: Backend BaaS & Thuật toán lõi (WBS 3.1 – 3.4)
- 🟢 `WBS-4`: Giao diện Mobile Expo & Tích hợp (WBS 4.1 – 4.5)
- 🔴 `WBS-5`: Kiểm thử, Thực địa & Bảo vệ đồ án (WBS 5.1 – 5.4)

### B. Nhãn theo Phụ trách & Mốc Milestone:
- `TV1` (Đào Duy Nhật) | `TV2` (Nguyễn Đức Đạt) | `Cả hai`
- `M1`, `M2`, `M3`, `M4`, `M5`, `M6`, `M7`, `M8` (Feature Freeze), `M9`, `M10`, `M11`, `M12`.

---

## 3. Hướng dẫn nhập công việc vào TRELLO

Trello là công cụ nhẹ, trực quan và rất phù hợp cho nhóm 2 người:

### Cách 1: Sử dụng Trello Power-Up "CSV Import" (Tự động - Khuyên dùng)
1. Đăng nhập vào [Trello.com](https://trello.com) và tạo một Board mới tên: **"QLDAPM - Cầu Lông Đà Nẵng"**.
2. Thêm thành viên TV2 (`[TV1 điền]` email của TV2) vào Board.
3. Bấm vào **Power-Ups** ➔ Tìm kiếm và bật tiện ích **"Import to Trello"** (hoặc "CSV Import").
4. Tải file [docs/schedule.csv](file:///d:/QLDAPM/docs/schedule.csv) lên.
5. Ánh xạ các trường:
   - *Card Title (Tiêu đề):* Chọn cột `Tên việc` (ghép thêm mã `WBS` ở đầu).
   - *List (Cột):* Đưa toàn bộ vào cột `1. Backlog`.
   - *Members (Thành viên):* Ánh xạ cột `Người phụ trách` (TV1 / TV2).
   - *Labels (Nhãn):* Chọn cột `Mốc` và `WBS`.
6. Nhấn **Import** để hoàn tất.

### Cách 2: Tạo thẻ nhanh bằng Copy-Paste danh sách
Nếu không dùng Power-Up, có thể tạo nhanh 21 thẻ trong 30 giây:
1. Mở file [docs/schedule.csv](file:///d:/QLDAPM/docs/schedule.csv).
2. Copy cột tên công việc kèm mã WBS:
   ```text
   [WBS 1.1] Khảo sát bối cảnh và phỏng vấn host Đà Nẵng
   [WBS 1.2] Xây dựng Điều lệ dự án (Charter) và phân tích Stakeholders
   [WBS 1.3] Thiết lập cơ cấu WBS RACI và tiến độ Gantt
   [WBS 1.4] Thiết lập Risk Register và môi trường phát triển Git
   [WBS 2.1] Xây dựng thang trình độ 6 cấp và mô hình toán Elo đôi
   [WBS 2.2] Đặc tả yêu cầu phần mềm SRS và Use Cases chi tiết
   [WBS 2.3] Thiết kế dữ liệu NoSQL Firestore và soạn thảo Data Contract
   [WBS 2.4] Thiết kế hệ thống Design System và Prototype trên Figma
   [WBS 3.1] Cấu hình Firebase project và CRUD User Profile
   [WBS 4.1] Khởi tạo khung app Expo Router và Theme hệ thống
   [WBS 3.2a] Phát triển thuật toán tìm kiếm bạn chơi Partner Finder
   [WBS 4.2] Phát triển giao diện Auth Profile và Partner Finder
   [WBS 3.2b] Phát triển hàm tính suất tuyển và kiểm tra điều kiện đặt suất
   [WBS 4.3a] Phát triển giao diện Tạo kèo và Danh sách kèo mở
   [WBS 3.2c] Cài đặt Transaction đặt suất nguyên tử và tự động đôn Waitlist
   [WBS 4.3b] Phát triển giao diện Match Lobby realtime và duyệt vãng lai
   [WBS 3.3] Phát triển thuật toán chia cặp cân kèo sân 4-8 người (Session Balancing)
   [WBS 4.4a] Phát triển giao diện Điều khiển sân đấu và Khóa cặp đánh
   [WBS 3.4] Phát triển Module Đánh giá sau trận và tính toán Elo đôi
   [WBS 4.4b] Phát triển giao diện Nhập tỷ số set đấu và Chấm thẻ đánh giá
   [M8] Feature Freeze đóng băng toàn bộ tính năng mới
   [WBS 4.5] Phát triển giao diện Lịch sử thi đấu Bạn ăn ý và Admin in-app
   [WBS 5.1] Xây dựng Test Plan toàn diện (S E B R X) và Unit test domain
   [WBS 5.2] Kiểm thử tích hợp hệ thống và kiểm thử Security Rules Emulator
   [WBS 5.3] Kiểm thử thực địa (Field test) tại sân cầu lông Đà Nẵng và sửa lỗi
   [WBS 5.4a] Tổng hợp hoàn thiện Báo cáo tổng kết đồ án
   [WBS 5.4b] Quay dựng và biên tập Video clip demo thực tế
   [WBS 5.4c] Thiết kế Slide thuyết trình đóng gói mã nguồn và tổng duyệt
   [M12] Nộp toàn bộ hồ sơ đồ án và bảo vệ trước Hội đồng
   ```
3. Tại cột `1. Backlog` trên Trello, bấm **Add a card** ➔ Dán toàn bộ danh sách trên vào ➔ Trello sẽ tự động hỏi: *"Bạn có muốn tạo 29 thẻ riêng biệt không?"* ➔ Chọn **Create 29 Cards**.
4. Gán Member (TV1/TV2) và Label cho từng thẻ theo bảng `schedule.csv`.

---

## 4. Hướng dẫn nhập công việc vào JIRA SOFTWARE

Đối với các nhóm sử dụng Jira để quản lý Sprint chuyên nghiệp:
1. Đăng nhập [Jira Software Cloud](https://www.atlassian.com/software/jira) và tạo project dạng **Scrum** hoặc **Kanban**.
2. Vào **Project Settings** ➔ **Import Data** ➔ Chọn **CSV**.
3. Tải lên file [docs/schedule.csv](file:///d:/QLDAPM/docs/schedule.csv).
4. Ánh xạ các trường dữ liệu của Jira:
   - `Summary` ➔ Cột `Tên việc`
   - `Issue Id / WBS` ➔ Cột `WBS`
   - `Assignee` ➔ Cột `Người phụ trách`
   - `Fix Version / Milestone` ➔ Cột `Mốc`
   - `Labels` ➔ Cột `WBS`
5. Bấm **Begin Import** để Jira tự động tạo backlog.

