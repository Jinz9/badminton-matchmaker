# CHƯƠNG 9: QUẢN LÝ GIAO TIẾP VÀ NHẬT KÝ HỌP ĐỒNG BỘ 11 TUẦN

> **Mã tài liệu:** `docs/report/chap09-communication-meetings.md`  
> **Nguồn căn cứ:** `docs/meetings/`, Biên bản họp tuần từ W01 đến W11  
> **Chủ đề:** Ma trận kế hoạch truyền thông, quy chế họp và bảng tổng hợp nội dung họp 11 tuần

---

## 9.1. Kế Hoạch Quản Lý Giao Tiếp (Communications Management Plan)

Để đảm bảo thông tin thông suốt giữa 2 thành viên và Giảng viên hướng dẫn trong suốt 12 tuần:

| Kênh Truyền Thông | Mục Đích Sử Dụng | Tần Suất | Người Chủ Trì | Thành Phần Tham Gia | Biên Bản Bàn Giao |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Họp đồng bộ tuần (Sync Meeting)** | Kiểm điểm tiến độ Sprint, rà soát rủi ro, giải quyết vướng mắc kỹ thuật. | 20:00 Tối Chủ nhật hàng tuần | TV1 (Chủ trì) | TV1, TV2 (Thư ký) | `docs/meetings/Wxx.md` |
| **Báo cáo Giảng viên hướng dẫn** | Báo cáo tiến độ Milestone, xin ý kiến định hướng chuyên môn QLDAPM. | Định kỳ theo mốc hoặc 2 tuần/lần | TV1 | TV1, TV2, ThS. Nguyễn Thanh Tuấn | Email / Báo cáo Sprint |
| **Nhóm Zalo / Chat nội bộ** | Trao đổi nhanh các vấn đề phát sinh hằng ngày, gửi ảnh chụp lỗi màn hình. | Hằng ngày (Khi cần) | TV1 / TV2 | TV1, TV2 | Tin nhắn / Issue GitHub |
| **GitHub Issues & PRs** | Giao việc theo mã WBS, kiểm tra chéo mã nguồn (Code review) trước khi merge. | Theo từng tác vụ | TV1 | TV1, TV2 | PR comments, Commit log |

---

## 9.2. Bảng Tổng Hợp Nhật Ký Họp Đồng Bộ 11 Tuần (W01 – W11)

*Quy định vai trò:* **TV1 (Đào Duy Nhật)** chủ trì cuộc họp; **TV2 (Nguyễn Đức Đạt)** làm thư ký ghi chép biên bản.  
*(Lưu ý nguyên tắc trung thực: Các chi tiết thảo luận thực tế tại hiện trường được giữ nguyên trạng thái `[TV2 điền]` để thư ký hoàn thiện).*

```carousel
### TUẦN 01 (W01): Khởi động dự án & Thiết lập môi trường (Đạt Mốc M1)
- **Thời gian:** 20:00 – 20:30, Tối Chủ nhật, Ngày: 21/11/2026 | Hình thức: Google Meet
- **Nội dung chính:**
  1. Thống nhất và ký duyệt Project Charter, phân công trách nhiệm RACI theo 21 gói WBS.
  2. Khởi tạo Git repo, cấu hình `.gitignore`, branch protection và bộ test Jest.
  3. Đánh giá kết quả khảo sát sơ bộ các cụm sân Kỳ Đồng, Tuyên Sơn: `[TV1 điền]`
- **Quyết định:** Duyệt hoàn thành Mốc M1; áp dụng 100% quy tắc phân chia thư mục tại `OWNERSHIP.md`.
<!-- slide -->
### TUẦN 02 (W02): Thống nhất SRS, Thang 6 cấp & Prototype Figma (Đạt Mốc M2)
- **Thời gian:** 20:00 – 20:30, Tối Chủ nhật, Ngày: 28/11/2026 | Thư ký: TV2
- **Nội dung chính:**
  1. TV1 trình bày dự thảo SRS, 14 Use Cases và Thang đo trình độ 6 cấp (Yếu đến Tốt/Bán chuyên).
  2. TV2 demo bản phác thảo Design System và Prototype Figma 4 module: `[TV2 điền]`
  3. Thảo luận về các giả định A1–A8 với ý kiến đóng góp từ các Host tại Đà Nẵng.
- **Quyết định:** Ban hành Change Request CR-01 (sân tối đa 8 người); duyệt hoàn thành Mốc M2.
<!-- slide -->
### TUẦN 03 (W03): Bàn giao Data Contract v1.0 & Nền tảng Firebase (Đạt Mốc M3)
- **Thời gian:** 20:00 – 20:30, Tối Chủ nhật, Ngày: 05/12/2026 | Thư ký: TV2
- **Nội dung chính:**
  1. TV1 bàn giao Hợp đồng Dữ liệu `data-contract.md` kèm 7 bộ mock JSON mẫu cho TV2.
  2. Cấu hình Firebase Authentication (Google + Email) và Cloud Firestore tại Singapore.
  3. TV2 báo cáo tiến độ khởi tạo project Expo Router: `[TV2 điền]`
- **Quyết định:** Duyệt hoàn thành Mốc M3; TV2 bắt đầu ráp giao diện với Mock Data độc lập.
<!-- slide -->
### TUẦN 04 (W04): Hoàn thành Thuật toán Partner Finder & Profile UI (Đạt Mốc M4)
- **Thời gian:** 20:00 – 20:30, Tối Chủ nhật, Ngày: 12/12/2026 | Thư ký: TV2
- **Nội dung chính:**
  1. TV1 hoàn thành thuật toán Partner Finder (lệch $\le 150$ Elo, bù trừ công thủ) kèm 25 test cases PASS.
  2. TV2 hoàn thành màn hình Đăng nhập và Hồ sơ cá nhân: `[TV2 điền]`
  3. Rà soát rủi ro RK-01 (Khai ảo trình độ) và giải pháp hệ số $K=40$ trong 5 trận đầu.
- **Quyết định:** Duyệt hoàn thành Mốc M4.
<!-- slide -->
### TUẦN 05 (W05): Xây dựng Module Tuyển vãng lai & Đặt suất
- **Thời gian:** 20:00 – 20:30, Tối Chủ nhật, Ngày: 19/12/2026 | Thư ký: TV2
- **Nội dung chính:**
  1. Cài đặt hàm tính suất tuyển $\min(4, 8 - \text{core})$ và kiểm tra điều kiện giới tính/trình độ/uy tín.
  2. TV2 xây dựng màn hình Tạo kèo mới (chọn 1–2 sân, dải trình độ, nội dung đánh): `[TV2 điền]`
  3. Xử lý kịch bản Host thêm người mặc định khi đã duyệt vãng lai (quy tắc Hard Block A4).
- **Quyết định:** Thống nhất cơ chế duyệt tay 100% của Host (theo Giả định A3).
<!-- slide -->
### TUẦN 06 (W06): Vận hành Match Lobby Realtime & Waitlist Tự động (Đạt Mốc M5)
- **Thời gian:** 20:00 – 20:30, Tối Chủ nhật, Ngày: 26/12/2026 | Thư ký: TV2
- **Nội dung chính:**
  1. Hoàn thành Firestore Atomic Transactions chống race-condition khi 2 người cùng đặt suất cuối.
  2. Logic tự động đôn người từ hàng đợi dự bị (Waitlist) khi có thành viên hủy kèo.
  3. TV2 demo màn hình Phòng kèo realtime hiển thị số chỗ trống: `[TV2 điền]`
- **Quyết định:** Duyệt hoàn thành Mốc M5 (Phòng kèo Realtime & Waitlist).
<!-- slide -->
### TUẦN 07 (W07): Thuật toán Cân kèo Sân đấu & Xoay tua Ca lẻ (Đạt Mốc M6)
- **Thời gian:** 20:00 – 20:30, Tối Chủ nhật, Ngày: 02/01/2027 | Thư ký: TV2
- **Nội dung chính:**
  1. TV1 hoàn thành thuật toán `balanceCourt` cho sân 4–8 người, xoay tua ca lẻ 5/7 người công bằng.
  2. Đo kiểm hiệu năng benchmark đạt 0.02 ms (vượt xa chỉ tiêu $< 1.000\text{ ms}$).
  3. TV2 tích hợp giao diện điều khiển sân đấu, kéo thả đổi người: `[TV2 điền]`
- **Quyết định:** Ban hành ADR-003 lựa chọn thuật toán Heuristic Greedy; duyệt hoàn thành Mốc M6.
<!-- slide -->
### TUẦN 08 (W08): Khép kín Vòng lặp Trận đấu, Elo & Feature Freeze (Đạt Mốc M7 & M8)
- **Thời gian:** 20:00 – 20:30, Tối Chủ nhật, Ngày: 09/01/2027 | Thư ký: TV2
- **Nội dung chính:**
  1. Hoàn thành hàm tính Elo đôi động, kiểm tra tỷ số BWF và giao dịch idempotent `confirmMatchResultTx`.
  2. Kịch bản E2E toàn diện 9 bước (`scripts/e2e-flow.ts`, 34 assertions PASS).
  3. Rà soát danh mục chức năng và kích hoạt **Đóng băng tính năng (Feature Freeze)**.
- **Quyết định:** Ký duyệt Checklist Feature Freeze; gắn tag git `v0.8-feature-freeze`.
<!-- slide -->
### TUẦN 09 (W09): Nâng cao Mobile, Offline Cache & Dữ liệu Seed (Đạt Mốc M9)
- **Thời gian:** 20:00 – 20:30, Tối Chủ nhật, Ngày: 16/01/2027 | Thư ký: TV2
- **Nội dung chính:**
  1. TV1 bàn giao công cụ kiểm toán dữ liệu `audit-data.ts` và bộ seed data 24 người chơi Đà Nẵng.
  2. Ban hành Hợp đồng Push Notification (`notifications.md`) và Hợp đồng Offline Cache (`offline-contract.md`).
  3. TV2 tối ưu hóa giao diện một tay và lưu cache AsyncStorage: `[TV2 điền]`
- **Quyết định:** Duyệt hoàn thành Mốc M9; sẵn sàng mang app ra sân thực tế.
<!-- slide -->
### TUẦN 10 (W10): Kiểm thử Thực địa tại Sân Cầu Lông Đà Nẵng (Đạt Mốc M10)
- **Thời gian:** 20:00 – 20:30, Tối Chủ nhật, Ngày: 23/01/2027 | Thư ký: TV2
- **Nội dung chính:**
  1. Tổng kết buổi đánh thử nghiệm thực tế tại sân Kỳ Đồng / Tuyên Sơn: `[TV1 & TV2 điền]`
  2. Đánh giá tính năng chia cặp ngoại tuyến khi mất sóng 4G trong nhà thi đấu mái tôn.
  3. Thu thập kết quả khảo sát mức độ hài lòng SUS từ các tay vợt tham gia: `[TV2 điền]`
  4. Rà soát Bug Log và xác nhận xử lý xong 100% ca biên thuật toán.
- **Quyết định:** Duyệt hoàn thành Mốc M10 (Hoàn tất kiểm thử và sửa lỗi).
<!-- slide -->
### TUẦN 11 (W11): Tổng kết Hồ sơ Báo cáo QLDAPM & Video Demo (Đạt Mốc M11)
- **Thời gian:** 20:00 – 20:30, Tối Chủ nhật, Ngày: 30/01/2027 | Thư ký: TV2
- **Nội dung chính:**
  1. TV1 hoàn thiện bản thảo Báo cáo tổng kết 12 chương theo chuẩn QLDAPM.
  2. TV2 hoàn thành quay và dựng video clip demo Full HD theo kịch bản 6 bước: `[TV2 điền link video]`
  3. Chuẩn bị slide thuyết trình và phân công nhiệm vụ bảo vệ đồ án (Milestone M12).
- **Quyết định:** Duyệt hoàn thành Mốc M11; sẵn sàng nộp đồ án cho Giảng viên hướng dẫn.
```

