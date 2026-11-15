# CHƯƠNG 2: PROJECT CHARTER VÀ PHÂN TÍCH BÊN LIÊN QUAN

> **Mã tài liệu:** `docs/report/chap02-charter-stakeholders.md`  
> **Nguồn căn cứ:** `01-project-charter.md`, `02-stakeholders.md`  
> **Chủ đề:** Điều lệ dự án chính thức, mục tiêu đo lường, phạm vi, ràng buộc và phân tích ma trận Stakeholders

---

## 2.1. Điều Lệ Dự Án (Project Charter)

Điều lệ dự án là văn bản cấp cao chính thức xác lập sự tồn tại của dự án, ủy quyền cho nhóm phát triển và định hình ranh giới phạm vi, thời gian, ngân sách và tiêu chí thành công.

### 2.1.1. Thông tin chung
- **Tên dự án:** Hệ thống ghép đội, ghép đồng đội theo độ phù hợp trong lĩnh vực cầu lông (Mobile App).
- **Mã dự án:** `QLDAPM-BM-2026`
- **Khách hàng mục tiêu:** Cộng đồng người chơi cầu lông phong trào, các câu lạc bộ và chủ sân tại TP. Đà Nẵng.
- **Thời lượng:** 12 tuần (Từ 15/11/2026 đến 06/02/2027), chia thành 6 Sprint (mỗi Sprint 2 tuần).

### 2.1.2. Mục tiêu dự án có thể đo lường được (SMART Objectives)
1. **Mục tiêu tính năng:**
   - Hoàn thành đầy đủ 4 module chức năng cốt lõi (Hồ sơ & Đánh giá trình độ; Quản lý Kèo & Đặt suất; Ghép cặp & Cân bằng sân đấu; Lịch sử đấu & Đồng đội ăn ý).
   - Tối thiểu **90%** ca kiểm thử trong Test Plan đạt trạng thái PASS trước khi bảo vệ trước Hội đồng.
2. **Mục tiêu hiệu năng & Trải nghiệm (UX):**
   - **Chia cặp 3 chạm:** Host hoàn thành việc chọn người có mặt và chia cặp trong không quá **3 chạm** trên màn hình điện thoại.
   - **Thời gian xử lý thuật toán:** Thuật toán chia cặp chạy trên thiết bị di động mất dưới **1.000 ms** (Thực tế đạt $< 0.1\text{ ms}$).
   - **Khả năng ngoại tuyến:** 100% chức năng chia cặp và ghi nhận tỷ số hoạt động bình thường khi thiết bị mất kết nối mạng tại sân.
3. **Mục tiêu quản trị dự án:**
   - 100% tài liệu quản trị (WBS, Gantt, Risk Register, SRS, Bug Log, Biên bản họp 11 tuần) tuân thủ quy chuẩn học phần QLDAPM.
   - Độ lệch tiến độ (Schedule Variance) cuối kỳ không vượt quá $\pm 5\%$.

### 2.1.3. Ranh giới phạm vi dự án (Project Scope)
- **Thuộc phạm vi (In-Scope - MVP):**
  - Đăng ký, đăng nhập (Google, Email/Password), hồ sơ trình độ 6 cấp và phong cách thi đấu (cầu trước, cầu sau, tay thuận).
  - Thuật toán tìm bạn đánh cặp cố định (Partner Finder) lệch $\le 150$ Elo, bù trừ công thủ.
  - Quản lý phòng kèo ($1 \dots 2$ sân, $\le 8$ người/sân, $\le 16$ người/kèo theo CR-01), tuyển vãng lai $\min(4, 8 - \text{core})$, giao dịch đặt suất chống race-condition, hàng đợi Waitlist tự động đôn người.
  - Thuật toán cân kèo sân 4–8 người, ca lẻ 5 và 7 người xoay tua công bằng, cặp khóa cố định, hoán đổi kéo thả.
  - Vòng lặp trận đấu, kiểm tra tỷ số chuẩn BWF, tính điểm Elo đôi động ($K=40/24$), trừ điểm uy tín khi bùng kèo (-15đ), tích hợp mã thanh toán VietQR.
  - Giao diện Admin in-app quản lý tài khoản và cụm sân tại Đà Nẵng.
- **Ngoài phạm vi (Out-of-Scope):**
  - Không xây dựng Web Admin riêng (Admin thao tác trực tiếp trên app di động).
  - Không can thiệp cổng trung gian thanh toán trực tuyến (chỉ hiển thị mã VietQR để người dùng chuyển khoản trực tiếp).
  - Không hỗ trợ tổ chức giải đấu chuyên nghiệp nhiều vòng bảng (chỉ tập trung vào kèo giao lưu phong trào thường nhật).

### 2.1.4. Ràng buộc và Giả định chính
- **Ràng buộc:** Nhóm gồm đúng 2 thành viên; thời gian cố định 12 tuần; kinh phí hạ tầng $0 VNĐ (sử dụng gói miễn phí Spark/Blaze free-tier của Firebase).
- **Giả định cốt lõi (A1–A8):** Sân tối đa 8 người; người mặc định có thể là "ghost user" chưa có tài khoản; Host duyệt tay 100%; dải điểm Elo từ 800 đến 2200; hệ thống sử dụng 1 chỉ số Elo chung cho giai đoạn MVP.

---

## 2.2. Phân Tích Các Bên Liên Quan (Stakeholder Analysis)

### 2.2.1. Danh mục các bên liên quan chính
Dự án xác định 6 nhóm bên liên quan chủ chốt:
1. **Giảng viên hướng dẫn (ThS. Nguyễn Thanh Tuấn):** Đóng vai trò Sponsor / Advisor học thuật, định hướng phương pháp luận quản trị và nghiệm thu chất lượng sản phẩm.
2. **Nhóm phát triển (TV1 - Đào Duy Nhật & TV2 - Nguyễn Đức Đạt):** Chịu trách nhiệm toàn diện về kỹ thuật, tiến độ, chất lượng và bảo vệ đồ án.
3. **Chủ sân / Chủ kèo (Host tại Đà Nẵng):** Người dùng quyền lực nhất tại sân, quyết định việc ứng dụng có được đưa vào sử dụng thực tế hay không.
4. **Người chơi cầu lông phong trào (Core & Vãng lai):** Người hưởng lợi trực tiếp từ việc được ghép cặp cân bằng và tìm kèo nhanh chóng.
5. **Chủ sân bãi cho thuê:** Bên liên quan gián tiếp, hưởng lợi từ việc sân được lấp đầy chỗ trống.
6. **Hội đồng chấm bảo vệ đồ án:** Đánh giá kết quả cuối kỳ theo chuẩn đầu ra của môn học.

### 2.2.2. Ma trận Quyền lực - Mức độ quan tâm (Power - Interest Matrix)

```mermaid
quadrantChart
    title Ma trận Quyền lực - Mức độ quan tâm (Mendelow Matrix)
    x-axis "Mức độ quan tâm (Interest)" : "Thấp" --> "Cao"
    y-axis "Mức độ quyền lực (Power)" : "Thấp" --> "Cao"
    quadrant-1 "Quản lý chặt chẽ (Manage Closely)"
    quadrant-2 "Làm hài lòng (Keep Satisfied)"
    quadrant-3 "Giám sát tối thiểu (Monitor)"
    quadrant-4 "Cung cấp thông tin (Keep Informed)"
    "GVHD & Hội đồng chấm": [0.85, 0.90]
    "Chủ kèo (Host Đà Nẵng)": [0.90, 0.75]
    "Nhóm phát triển (TV1, TV2)": [0.95, 0.85]
    "Người chơi vãng lai & Core": [0.85, 0.35]
    "Chủ sân bãi cho thuê": [0.30, 0.25]
```

### 2.2.3. Chiến lược quản lý và cam kết bên liên quan
- **Quản lý chặt chẽ (Manage Closely - Nhóm Quyền lực cao / Quan tâm cao):**
  - *GVHD & Hội đồng chấm:* Báo cáo tiến độ hàng tuần qua biên bản họp (W01–W11), bám sát yêu cầu đề cương, nghiệm thu theo từng Milestone.
  - *Chủ kèo (Host Đà Nẵng):* Phỏng vấn sâu ngay từ Sprint 1, kiểm chứng bộ giả định A1–A8, mời tham gia trải nghiệm trực tiếp trong đợt kiểm thử thực địa tại sân (Milestone M10).
- **Cung cấp thông tin thường xuyên (Keep Informed - Người chơi phong trào):**
  - Cung cấp giao diện trực quan, dễ hiểu, minh bạch cách tính điểm Elo và lý do được xếp cặp / ngồi nghỉ, phát phiếu khảo sát trải nghiệm (SUS form).

