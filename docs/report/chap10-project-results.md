# CHƯƠNG 10: KẾT QUẢ DỰ ÁN VÀ ĐỐI CHIẾU MỤC TIÊU CHARTER

> **Mã tài liệu:** `docs/report/chap10-project-results.md`  
> **Nguồn căn cứ:** `01-project-charter.md`, `PROGRESS.md`, Kết quả Benchmark và Test Execution  
> **Chủ đề:** Đánh giá mức độ hoàn thành tính năng, đối chiếu mục tiêu ban đầu của Charter và số liệu đo đạc thực tế

---

## 10.1. Đối Chiếu Kết Quả Thực Hiện So Với Mục Tiêu Project Charter

Nhóm tiến hành đối chiếu nghiêm túc các kết quả thực tế đạt được so với từng cam kết ban đầu trong Điều lệ dự án:

| STT | Mục Tiêu Cam Kết Trong Project Charter | Tiêu Chí Đo Lường (Metrics) | Kết Quả Thực Tế Đạt Được | Đánh Giá Mức Độ Hoàn Thành |
| :---: | :--- | :---: | :---: | :---: |
| **1** | **Hoàn thành 4 Module chức năng cốt lõi (MVP)** | 100% User Stories cốt lõi | Đã khép kín toàn diện 4 module: Hồ sơ & Trình độ; Tuyển vãng lai & Phòng kèo; Thuật toán Cân kèo sân; Lịch sử & Bạn ăn ý. | 🟢 **Đạt 100%** |
| **2** | **Thao tác chia cặp nhanh tại sân** | $\le 3$ chạm trên điện thoại | Thao tác 3 chạm: Mở sân $\to$ Tích chọn người có mặt $\to$ Bấm "Chia cặp". | 🟢 **Đạt 100%** |
| **3** | **Thời gian xử lý thuật toán chia cặp** | Dưới $1.000\text{ ms}$ (1 giây) | Đo kiểm Benchmark P15: Trung bình đạt **$0.01 \dots 0.11\text{ ms}$** (Nhanh hơn chỉ tiêu $> 9.000$ lần). | 🟢 **Vượt chỉ tiêu** |
| **4** | **Khả năng hoạt động ngoại tuyến (Offline-First)** | Chia cặp và nhập điểm khi mất mạng | Hàm thuần chạy in-memory; lưu Snapshot vào AsyncStorage; tự động đồng bộ khi có mạng lại. | 🟢 **Đạt 100%** |
| **5** | **Tỷ lệ kiểm thử tự động đạt yêu cầu** | Tối thiểu $\ge 90\%$ test PASS | 278 ca kiểm thử tự động (196 domain tests + 82 rules/functions tests) đạt **100% PASS**. | 🟢 **Vượt chỉ tiêu** |
| **6** | **Chống đặt trùng suất (Race Condition)** | 0 trường hợp nhận quá 8 người | Áp dụng Cloud Firestore Atomic Transactions và Optimistic Locking; 0 lỗi race-condition. | 🟢 **Đạt 100%** |
| **7** | **Chuẩn hóa thang trình độ phong trào Đà Nẵng** | Thang 6 cấp, Elo sàn 800 trần 2200 | Thang 6 cấp (Yếu đến Tốt/Bán chuyên), thuật toán Elo đôi động $K=40/24$, trừ bùng kèo -15đ. | 🟢 **Đạt 100%** |
| **8** | **Tuân thủ quy chuẩn Quản trị dự án (QLDAPM)** | 100% tài liệu theo chuẩn | Hoàn thành đầy đủ Charter, Stakeholders, WBS 21 gói, RACI, Gantt, Risk Register, SRS, Bug Log, 11 biên bản họp tuần. | 🟢 **Đạt 100%** |

---

## 10.2. Bảng Thống Kê Số Liệu Kỹ Thuật Đo Đạc Thực Tế

### 10.2.1. Số liệu Hiệu năng Thuật toán (Benchmark Performance)
- **Tác vụ `generateNextRound` (Xếp 1 hiệp tức thì):** **0.0091 ms** (~110.000 phép tính/giây).
- **Tác vụ `rebalanceTwoCourts` (Tái cân bằng 2 sân):** **0.0021 ms** (~474.000 phép tính/giây).
- **Tác vụ `balanceCourt` sân 4 người:** **0.1065 ms**.
- **Tác vụ `balanceCourt` ca lẻ 5 người (5 hiệp xoay tua):** **0.0200 ms**.
- **Tác vụ `balanceCourt` ca lẻ 7 người (7 hiệp xoay tua):** **0.0670 ms**.
- **Tác vụ `balanceCourt` sân 8 người (8 hiệp):** **0.0347 ms**.
- **Tác vụ phân bổ và cân cả 2 sân (16 người):** **0.1076 ms**.

### 10.2.2. Số liệu Kiểm toán Dữ liệu (BaaS Data Audit)
- Quét toàn bộ 40 tài liệu mẫu phong trào Đà Nẵng qua công cụ `scripts/audit-data.ts`:
  - **Số lỗi phát hiện (Errors):** 0
  - **Số cảnh báo phát hiện (Warnings):** 0
  - **Độ chính xác dữ liệu biên:** 100% Sạch (Clean).

### 10.2.3. Số liệu Trải nghiệm Thực địa (Field Test Usability)
- **Địa điểm thử nghiệm:** Sân Cầu Lông Kỳ Đồng / Tuyên Sơn, TP. Đà Nẵng.
- **Số lượng hiệp đấu vận hành thử nghiệm:** `[TV1 điền: Ví dụ 5 hiệp đấu]`
- **Thời gian trung bình Host hoàn thành chia cặp:** `[TV1 điền: ~1.2 giây]`
- **Điểm đánh giá tiện dụng System Usability Scale (SUS):** `[TV1 điền: Ví dụ 82.5 / 100 điểm]` (Mức Tốt / Xuất sắc).

