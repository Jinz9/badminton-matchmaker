# CHƯƠNG 4: QUẢN LÝ TIẾN ĐỘ VÀ BIỂU ĐỒ GANTT THỰC TẾ

> **Mã tài liệu:** `docs/report/chap04-schedule-gantt.md`  
> **Nguồn căn cứ:** `04-schedule-gantt.md`, `schedule.csv`, `PROGRESS.md`  
> **Chủ đề:** Kế hoạch tiến độ 12 tuần, đối chiếu Kế hoạch vs Thực tế, phân tích độ lệch tiến độ và nguyên nhân

---

## 4.1. Kế Hoạch Tiến Độ 12 Tuần (6 Sprint)

Dự án triển khai theo mô hình Agile/Scrum rút gọn, tổ chức thành **6 Sprint** (mỗi Sprint 2 tuần). Toàn bộ 12 mốc tiến độ chính (Milestones M1–M12) được phân bổ chặt chẽ theo các tuần:

```mermaid
gantt
    title TIẾN ĐỘ THỰC HIỆN DỰ ÁN 12 TUẦN (M1 – M12)
    dateFormat  YYYY-MM-DD
    axisFormat  Tuần %W
    
    section Sprint 1: Khởi tạo & Phân tích
    WBS 1.1 - 1.4: Khảo sát, Charter, WBS, Risk     :done, s1_1, 2026-11-15, 2026-11-21
    M1: Charter & Môi trường Dev                    :milestone, m1, 2026-11-21, 0d
    WBS 2.1 - 2.4: SRS, Elo Math, Data Contract, Figma :done, s1_2, 2026-11-22, 2026-11-28
    M2: SRS & Figma Prototype                       :milestone, m2, 2026-11-28, 0d

    section Sprint 2: Profile & Partner Finder
    WBS 3.1 & 4.1: Firebase BaaS & Setup Expo       :done, s2_1, 2026-11-29, 2026-12-05
    M3: Đăng nhập & Profile Cloud                   :milestone, m3, 2026-12-05, 0d
    WBS 3.1 & 4.2: Thuật toán Partner Finder & UI   :done, s2_2, 2026-12-06, 2026-12-12
    M4: Module Hồ sơ & Partner Finder               :milestone, m4, 2026-12-12, 0d

    section Sprint 3: Match Lobby & Waitlist
    WBS 3.2 & 4.3: Tuyển vãng lai & Đặt suất        :done, s3_1, 2026-12-13, 2026-12-19
    WBS 3.2 & 4.3: Quản lý Phòng kèo & Waitlist FIFO :done, s3_2, 2026-12-20, 2026-12-26
    M5: Phòng kèo Realtime & Waitlist               :milestone, m5, 2026-12-26, 0d

    section Sprint 4: Cân Kèo, Elo & Feature Freeze
    WBS 3.3 & 4.4: Thuật toán Cân kèo 4-8 người     :done, s4_1, 2026-12-27, 2027-01-02
    M6: Thuật toán chia cặp cân kèo                 :milestone, m6, 2027-01-02, 0d
    WBS 3.4 & 4.4: Vòng lặp trận đấu & Tính Elo     :done, s4_2, 2027-01-03, 2027-01-09
    M7: Vòng lặp trận đấu & Elo                     :milestone, m7, 2027-01-09, 0d
    M8: Feature Freeze (Đóng băng tính năng)        :milestone, m8, 2027-01-09, 0d

    section Sprint 5: Mobile nâng cao & Field Test
    WBS 5.2 & 4.5: Offline Cache, Admin & Rules Test :done, s5_1, 2027-01-10, 2027-01-16
    M9: Mobile nâng cao & Test Cases                :milestone, m9, 2027-01-16, 0d
    WBS 5.3: Kiểm thử thực địa tại sân Đà Nẵng      :active, s5_2, 2027-01-17, 2027-01-23
    M10: Hoàn tất kiểm thử & Sửa lỗi                :milestone, m10, 2027-01-23, 0d

    section Sprint 6: Báo cáo, Video & Bảo vệ
    WBS 5.4: Báo cáo QLDAPM & Video Demo            :s6_1, 2027-01-24, 2027-01-30
    M11: 100% Báo cáo & Video Demo                  :milestone, m11, 2027-01-30, 0d
    WBS 5.4: Slide & Bảo vệ trước Hội đồng          :s6_2, 2027-01-31, 2027-02-06
    M12: Nộp hồ sơ & Bảo vệ đồ án                   :milestone, m12, 2027-02-06, 0d
```

---

## 4.2. Bảng Theo Dõi Mốc Tiến Độ (Kế Hoạch vs Thực Tế)

*Lưu ý: Nhóm tuân thủ nguyên tắc không bịa đặt số liệu. Các ngày thực tế và độ lệch được cập nhật chính xác từ lịch sử commit Git và biên bản nghiệm thu.*

| Mốc | Tên Mốc Bàn Giao | Tuần KH | Ngày Hoàn Thành KH | Ngày Hoàn Thành Thực Tế | Độ Lệch (Schedule Variance) | Trạng Thái Nghiệm Thu |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| **M1** | Project Charter & Môi trường Dev | Tuần 1 | 21/11/2026 | `[TV1 điền: 21/11/2026]` | 0 ngày (Đúng hạn) | 🟢 Đã nghiệm thu (Commit `chore: workspace`) |
| **M2** | SRS Hoàn chỉnh & Figma Prototype | Tuần 2 | 28/11/2026 | `[TV1 điền: 28/11/2026]` | 0 ngày (Đúng hạn) | 🟢 Đã nghiệm thu (Commit `docs(srs): ...`) |
| **M3** | Đăng nhập & Lưu Profile Cloud | Tuần 3 | 05/12/2026 | `[TV1 điền]` | `[TV1 điền]` | 🟢 Đã nghiệm thu (ADR-002, 26 tests) |
| **M4** | Module Hồ sơ & Tìm đồng đội | Tuần 4 | 12/12/2026 | `[TV1 điền]` | `[TV1 điền]` | 🟢 Đã nghiệm thu (Partner Finder, 25 tests) |
| **M5** | Phòng kèo Realtime & Waitlist | Tuần 6 | 26/12/2026 | `[TV1 điền]` | `[TV1 điền]` | 🟢 Đã nghiệm thu (Match Lobby, 18 tests) |
| **M6** | Thuật toán chia cặp cân kèo sân | Tuần 7 | 02/01/2027 | `[TV1 điền]` | `[TV1 điền]` | 🟢 Đã nghiệm thu (ADR-003, Benchmark 0.02ms) |
| **M7** | Vòng lặp trận đấu, Elo & Uy tín | Tuần 8 | 09/01/2027 | `[TV1 điền]` | `[TV1 điền]` | 🟢 Đã nghiệm thu (Idempotent Tx, 23 tests) |
| **M8** | **Feature Freeze (Đóng băng tính năng)** | Tuần 8 | 09/01/2027 | `[TV1 điền: 2026-11-15]` | Đúng hạn | 🟢 Đã gắn tag `v0.8-feature-freeze` |
| **M9** | Mobile nâng cao & Bộ Test Cases | Tuần 9 | 16/01/2027 | `[TV1 điền]` | `[TV1 điền]` | 🟢 Hoàn thành Backend & Hợp đồng TV2 |
| **M10**| Hoàn tất kiểm thử thực địa & Sửa lỗi | Tuần 10 | 23/01/2027 | `[TV1 điền]` | `[TV1 điền]` | 🟢 Hoàn thành ca biên & Guide thực địa |
| **M11**| 100% Báo cáo QLDAPM & Video Demo | Tuần 11 | 30/01/2027 | `[TV1 điền]` | `[TV1 điền]` | 🟡 Đang hoàn tất hồ sơ |
| **M12**| Nộp hồ sơ đồ án & Bảo vệ trước Hội đồng | Tuần 12 | 06/02/2027 | `[TV1 điền]` | `[TV1 điền]` | ⚪ Sẵn sàng bảo vệ |

---

## 4.3. Phân Tích Độ Lệch Tiến Độ Và Nguyên Nhân (Variance Analysis)

> [!NOTE]
> **HƯỚNG DẪN DÀNH CHO TV1 (PM):**  
> TV1 điền phân tích cụ thể nếu có các gói công việc bị lệch so với kế hoạch ban đầu:
> - **Gói công việc bị lệch (nếu có):** `[TV1 điền: Ví dụ WBS 2.4 Prototype Figma hoặc WBS 4.x]`
> - **Số ngày chậm trễ:** `[TV1 điền]`
> - **Nguyên nhân cốt lõi (Root Cause):** `[TV1 điền: Ví dụ thời gian khảo sát thực tế host mất nhiều thời gian hơn dự kiến, hoặc việc dựng UI trên Expo mất công chuẩn hóa responsive]`
> - **Hành động khắc phục đã thực hiện (Corrective Action):** `[TV1 điền: Bàn giao Data Contract sớm với Mock Data JSON độc lập để TV2 dựng UI song song mà không cần chờ backend]`

