# TIẾN ĐỘ THỰC HIỆN VÀ BIỂU ĐỒ GANTT (SCHEDULE & GANTT)

**Dự án:** Hệ thống ghép đội, ghép đồng đội theo độ phù hợp trong lĩnh vực cầu lông (Mobile App)  
**Tài liệu:** Kế hoạch tiến độ 12 tuần, Biểu đồ Gantt & Phân tích đường găng  
**Thời gian:** 12 tuần | 6 Sprint x 2 tuần  
**Ngày ban hành:** 15/11/2026 | **Phiên bản:** 1.0  

---

## 1. Lịch trình chi tiết 12 tuần theo 6 Sprint

### 🔹 Sprint 1 (Tuần 1 – Tuần 2): Khởi tạo, Phân tích nghiệp vụ & Thiết kế Prototype
- **Mục tiêu Sprint:** Hoàn thành khung quản trị dự án, xác nhận giả định thực tế tại Đà Nẵng, chốt yêu cầu phần mềm SRS và bản mẫu thiết kế tương tác trên Figma.
- **Mốc bàn giao:** **M1** (Cuối tuần 1), **M2** (Cuối tuần 2).

| Tuần | Công việc của TV1 (PM, BA, Backend, Algo) | Công việc của TV2 (QA Lead, UI/UX, Mobile) | Mốc tiến độ | Tuần KH | Ngày bắt đầu KH | Ngày kết thúc KH | Thực tế hoàn thành |
|:---:|---|---|:---:|:---:|:---:|:---:|:---:|
| **Tuần 1** | - Khảo sát thực tế, phỏng vấn 2–3 host Đà Nẵng (WBS 1.1).<br>- Soạn thảo Project Charter & Stakeholders (WBS 1.2).<br>- Thiết lập WBS, RACI, Gantt & Risk Register (WBS 1.3, 1.4).<br>- Khởi tạo Git repo, cấu hình `.gitignore`, branch rules. | - Cùng TV1 tham gia phỏng vấn host để thấu hiểu người dùng (WBS 1.1).<br>- Chuẩn bị tài khoản Figma, khảo sát các app thể thao tương tự.<br>- Thiết lập môi trường lập trình local (Node, Expo CLI, VS Code). | **M1: Charter & Môi trường Dev** | Tuần 1 | 15/11/2026 | 21/11/2026 | [TV1 điền] |
| **Tuần 2** | - Xây dựng thang trình độ 6 cấp, mô hình toán Elo đôi (WBS 2.1).<br>- Viết tài liệu Đặc tả yêu cầu phần mềm SRS (WBS 2.2).<br>- Thiết kế lược đồ Firestore & soạn thảo Data Contract (WBS 2.3). | - Xây dựng Design System mobile (màu sắc, typography, icon) (WBS 2.4).<br>- Thiết kế Prototype tương tác Figma cho 4 module chính (WBS 2.4).<br>- Phản biện tính khả thi giao diện cùng TV1. | **M2: SRS & Figma Prototype** | Tuần 2 | 22/11/2026 | 28/11/2026 | [TV1 điền] |

---

### 🔹 Sprint 2 (Tuần 3 – Tuần 4): Nền tảng BaaS, Profile & Partner Finder
- **Mục tiêu Sprint:** Vận hành luồng đăng nhập, lưu trữ thông tin lên Cloud Firestore, triển khai thuật toán tìm bạn đánh cặp theo Elo và lối chơi.
- **Mốc bàn giao:** **M3** (Cuối tuần 3), **M4** (Cuối tuần 4).

| Tuần | Công việc của TV1 (PM, BA, Backend, Algo) | Công việc của TV2 (QA Lead, UI/UX, Mobile) | Mốc tiến độ | Tuần KH | Ngày bắt đầu KH | Ngày kết thúc KH | Thực tế hoàn thành |
|:---:|---|---|:---:|:---:|:---:|:---:|:---:|
| **Tuần 3** | - Cấu hình Firebase Project, bật Auth & Cloud Firestore (WBS 3.1).<br>- **Bàn giao Data Contract chính thức cho TV2** (WBS 2.3).<br>- Viết Firestore Security Rules cơ bản cho User collection. | - Khởi tạo project Expo với Expo Router (WBS 4.1).<br>- Thiết lập bộ nhận diện Theme, Navigation Tabs chuẩn.<br>- Tạo Mock Data theo Data Contract của TV1 để dựng UI. | **M3: Đăng nhập & Lưu Profile Cloud** | Tuần 3 | 29/11/2026 | 05/12/2026 | [TV1 điền] |
| **Tuần 4** | - Cài đặt thuật toán Partner Finder (lệch ≤ 150 Elo, vị trí đánh).<br>- Viết Unit test Jest cho Partner Finder.<br>- Viết API handler truy vấn danh sách người chơi phù hợp. | - Xây dựng màn hình Đăng nhập / Đăng ký (Google / Email) (WBS 4.2).<br>- Xây dựng màn hình Hồ sơ cá nhân (thông tin, tay thuận, cấp độ) (WBS 4.2).<br>- Dựng giao diện màn hình Tìm đồng đội (Partner Finder). | **M4: Module Hồ sơ & Partner Finder** | Tuần 4 | 06/12/2026 | 12/12/2026 | [TV1 điền] |

---

### 🔹 Sprint 3 (Tuần 5 – Tuần 6): Match Lobby, Tuyển vãng lai & Waitlist
- **Mục tiêu Sprint:** Hoàn thiện cơ chế tạo kèo 1–2 sân, tuyển vãng lai bằng atomic transaction chống đặt trùng suất và hàng đợi dự bị tự động.
- **Mốc bàn giao:** **M5** (Cuối tuần 6).

| Tuần | Công việc của TV1 (PM, BA, Backend, Algo) | Công việc của TV2 (QA Lead, UI/UX, Mobile) | Mốc tiến độ | Tuần KH | Ngày bắt đầu KH | Ngày kết thúc KH | Thực tế hoàn thành |
|:---:|---|---|:---:|:---:|:---:|:---:|:---:|
| **Tuần 5** | - Cài đặt hàm tính suất tuyển `computeSlots` (WBS 3.2).<br>- Cài đặt hàm kiểm tra điều kiện đặt suất `canRequestSlot` (WBS 3.2).<br>- Viết test suite Jest cho kiểm tra điều kiện (S1–S8, E1–E13). | - Xây dựng màn hình Tạo kèo mới (chọn 1–2 sân, dải trình độ, nội dung) (WBS 4.3).<br>- Dựng danh sách kèo mở ngoài trang chủ kèm bộ lọc khu vực/trình độ. | — | Tuần 5 | 13/12/2026 | 19/12/2026 | [TV1 điền] |
| **Tuần 6** | - Cài đặt Transaction đặt suất nguyên tử trên Firestore (chống race condition).<br>- Logic đôn người tự động từ waitlist khi có người hủy.<br>- Viết Firestore Rules cho requests và session. | - Xây dựng màn hình Chi tiết phòng kèo (Match Lobby) realtime (WBS 4.3).<br>- Xây dựng màn hình Duyệt vãng lai dành cho Host (WBS 4.3).<br>- Hiển thị hàng đợi dự bị (Waitlist tag). | **M5: Phòng kèo Realtime có Waitlist** | Tuần 6 | 20/12/2026 | 26/12/2026 | [TV1 điền] |

---

### 🔹 Sprint 4 (Tuần 7 – Tuần 8): Thuật toán chia cặp, Vòng lặp trận đấu & Elo
- **Mục tiêu Sprint:** Hoàn thành thuật toán cân kèo sân 4–8 người (offline-ready), khép kín vòng lặp nhập điểm, cập nhật Elo và đóng băng tính năng.
- **Mốc bàn giao:** **M6** (Tuần 7), **M7** & **M8** (Cuối tuần 8 - Feature Freeze).

| Tuần | Công việc của TV1 (PM, BA, Backend, Algo) | Công việc của TV2 (QA Lead, UI/UX, Mobile) | Mốc tiến độ | Tuần KH | Ngày bắt đầu KH | Ngày kết thúc KH | Thực tế hoàn thành |
|:---:|---|---|:---:|:---:|:---:|:---:|:---:|
| **Tuần 7** | - Phát triển thuật toán Session Balancing (WBS 3.3): cặp khóa, xoay tua người nghỉ ca 5 & 7 người.<br>- Chạy và kiểm tra 100% ca test B1–B15 trên Jest.<br>- Đảm bảo hàm thuần chạy offline mượt mà dưới 100ms. | - Xây dựng màn hình Điều khiển sân đấu dành cho Host (WBS 4.4).<br>- Giao diện thao tác kéo/thả khóa cặp đánh (`self`, `host`).<br>- Nút bấm "Chia cặp tự động" gọi hàm của TV1. | **M6: Thuật toán chia cặp cân kèo** | Tuần 7 | 27/12/2026 | 02/01/2027 | [TV1 điền] |
| **Tuần 8** | - Cài đặt hàm tính Elo đôi và điểm uy tín sau trận (WBS 3.4).<br>- Viết test R1–R7 cho Elo & phạt bùng kèo.<br>- **Thực hiện Feature Freeze:** Rà soát toàn bộ chức năng, đóng nhánh thêm tính năng mới. | - Xây dựng màn hình Nhập tỷ số set đấu và Chấm thẻ đánh giá sau trận (WBS 4.4).<br>- Giao diện hiển thị biến động điểm Elo sau trận.<br>- Kiểm tra luồng dữ liệu khép kín từ tạo kèo đến kết thúc. | **M7: Vòng lặp trận đấu & Elo**<br>**M8: Feature Freeze** | Tuần 8 | 03/01/2027 | 09/01/2027 | [TV1 điền] |

---

### 🔹 Sprint 5 (Tuần 9 – Tuần 10): Mobile nâng cao, Kiểm thử thực địa & Sửa lỗi
- **Mục tiêu Sprint:** Tối ưu hóa UI một tay tại sân, cache offline, chạy kiểm thử thực địa tại sân cầu lông Đà Nẵng và sửa 100% bug nghiêm trọng.
- **Mốc bàn giao:** **M9** (Cuối tuần 9), **M10** (Cuối tuần 10).

| Tuần | Công việc của TV1 (PM, BA, Backend, Algo) | Công việc của TV2 (QA Lead, UI/UX, Mobile) | Mốc tiến độ | Tuần KH | Ngày bắt đầu KH | Ngày kết thúc KH | Thực tế hoàn thành |
|:---:|---|---|:---:|:---:|:---:|:---:|:---:|
| **Tuần 9** | - Xây dựng bộ test Security Rules trên Firebase Emulator (WBS 5.2).<br>- Chạy audit bảo mật bằng `firebase-security-rules-auditor`.<br>- Hỗ trợ TV2 hoàn thiện truy vấn thống kê bạn đánh ăn ý. | - Hoàn thiện màn hình Lịch sử đấu & Bạn đánh ăn ý (WBS 4.5).<br>- Xây dựng giao diện Quản trị viên (Admin in-app) (WBS 4.5).<br>- Tối ưu hóa UI một tay (nút bấm to ở nửa dưới màn hình) & Cache AsyncStorage. | **M9: Mobile nâng cao & Test Cases** | Tuần 9 | 10/01/2027 | 16/01/2027 | [TV1 điền] |
| **Tuần 10** | - **Cùng TV2 mang bản build ra sân cầu lông thực tế tại Đà Nẵng** (WBS 5.3).<br>- Thu thập log lỗi, đo thời gian xử lý khi mất mạng tại sân.<br>- Sửa toàn bộ lỗi logic, tối ưu hóa transaction backend. | - **Chủ trì ca kiểm thử thực địa (Field test) tại sân** (WBS 5.3).<br>- Lập biên bản lỗi bug log theo mẫu chuẩn `badminton-testing`.<br>- Fix lỗi giao diện, căn chỉnh font chữ to rõ dưới đèn sân. | **M10: Hoàn tất kiểm thử & Sửa lỗi** | Tuần 10 | 17/01/2027 | 23/01/2027 | [TV1 điền] |

---

### 🔹 Sprint 6 (Tuần 11 – Tuần 12): Báo cáo đồ án, Video Demo & Bảo vệ
- **Mục tiêu Sprint:** Hoàn thiện 100% hồ sơ quản trị dự án, quay video clip demo sắc nét, hoàn thành slide thuyết trình và bảo vệ thành công trước hội đồng.
- **Mốc bàn giao:** **M11** (Cuối tuần 11), **M12** (Tuần 12).

| Tuần | Công việc của TV1 (PM, BA, Backend, Algo) | Công việc của TV2 (QA Lead, UI/UX, Mobile) | Mốc tiến độ | Tuần KH | Ngày bắt đầu KH | Ngày kết thúc KH | Thực tế hoàn thành |
|:---:|---|---|:---:|:---:|:---:|:---:|:---:|
| **Tuần 11** | - Viết Báo cáo tổng kết đồ án toàn diện theo chuẩn QLDAPM (WBS 5.4).<br>- Tổng hợp báo cáo kiểm thử và ma trận truy vết yêu cầu (Traceability Matrix).<br>- Soạn thảo kịch bản demo 6 bước chi tiết. | - Hỗ trợ chụp ảnh màn hình minh họa cho báo cáo.<br>- Quay video clip demo thực tế theo kịch bản 6 bước của TV1.<br>- Dựng và biên tập video demo chất lượng Full HD (WBS 5.4). | **M11: 100% Báo cáo & Video Demo** | Tuần 11 | 24/01/2027 | 30/01/2027 | [TV1 điền] |
| **Tuần 12** | - Thiết kế Slide thuyết trình bảo vệ đồ án (PowerPoint) (WBS 5.4).<br>- Đóng gói mã nguồn sạch, tài liệu bàn giao lên Git repository.<br>- Nghiệm thu chính thức với GVHD & Bảo vệ trước Hội đồng. | - Cùng TV1 tổng duyệt thuyết trình thử (Rehearsal).<br>- Chuẩn bị thiết bị di động thật đã cài app để sẵn sàng demo trực tiếp.<br>- Tham gia bảo vệ đồ án trước Hội đồng (WBS 5.4). | **M12: Nộp hồ sơ & Bảo vệ đồ án** | Tuần 12 | 31/01/2027 | 06/02/2027 | [TV1 điền] |

---

## 2. Biểu đồ tiến độ Gantt (Mermaid Gantt Chart)

```mermaid
gantt
    title LỊCH TRÌNH 12 TUẦN - DỰ ÁN CẦN KÈO CẦU LÔNG
    dateFormat  YYYY-MM-DD
    axisFormat  %d/%m
    
    section Sprint 1: Khởi tạo & Thiết kế
    WBS 1.1 Khảo sát & Phỏng vấn host     :done, w11, 2026-11-15, 4d
    WBS 1.2 Charter & Stakeholders         :done, w12, 2026-11-16, 4d
    WBS 1.3 WBS, RACI & Gantt             :active, w13, 2026-11-17, 4d
    WBS 1.4 Risk Register & Git Setup     :w14, 2026-11-19, 3d
    M1: Charter & Môi trường Dev           :milestone, m1, 2026-11-21, 0d
    WBS 2.1 Thang 6 cấp & Mô hình Elo đôi :w21, after m1, 4d
    WBS 2.2 Đặc tả SRS & Use Cases        :w22, after m1, 6d
    WBS 2.3 Firestore Schema & Contract   :crit, w23, after w21, 4d
    WBS 2.4 Prototype & Design Figma      :w24, after m1, 7d
    M2: SRS & Figma Prototype             :milestone, m2, 2026-11-28, 0d

    section Sprint 2: BaaS & Partner Finder
    WBS 3.1 Firebase Setup & Auth Backend :w31, after m2, 5d
    WBS 4.1 Khung app Expo Router & Theme :w41, after m2, 5d
    M3: Đăng nhập & Profile Cloud         :milestone, m3, 2026-12-05, 0d
    WBS 3.2a Logic Partner Finder         :w32a, after m3, 5d
    WBS 4.2 UI Profile & Partner Finder   :w42, after w41, 6d
    M4: Module Hồ sơ & Partner Finder     :milestone, m4, 2026-12-12, 0d

    section Sprint 3: Match Lobby & Waitlist
    WBS 3.2b Thuật toán Slot & Kiểm tra   :crit, w32b, after m4, 6d
    WBS 4.3a UI Tạo kèo & Trang chủ       :w43a, after m4, 6d
    WBS 3.2c Transaction Đặt suất & Waitlist:crit, w32c, after w32b, 6d
    WBS 4.3b UI Lobby & Hàng đợi Waitlist :w43b, after w43a, 6d
    M5: Match Lobby Realtime có Waitlist  :milestone, m5, 2026-12-26, 0d

    section Sprint 4: Cân kèo, Trận đấu & Elo
    WBS 3.3 Thuật toán Session Balancing  :crit, w33, after m5, 6d
    WBS 4.4a UI Điều khiển sân & Khóa cặp :w44a, after m5, 6d
    M6: Thuật toán chia cặp cân kèo       :milestone, m6, 2027-01-02, 0d
    WBS 3.4 Logic Kết quả trận & Elo đôi  :crit, w34, after m6, 5d
    WBS 4.4b UI Nhập điểm & Chấm thẻ      :w44b, after w44a, 6d
    M7: Vòng lặp trận đấu & Elo           :milestone, m7, 2027-01-09, 0d
    M8: Feature Freeze                    :milestone, m8, 2027-01-09, 0d

    section Sprint 5: Test nâng cao & Field test
    WBS 4.5 UI Lịch sử, Chemistry & Admin :w45, after m8, 6d
    WBS 5.1 Test Plan (S, E, B, R, X)     :w51, after m8, 5d
    WBS 5.2 Test tích hợp & Emulator      :w52, after w51, 5d
    M9: Mobile nâng cao & Test Cases      :milestone, m9, 2027-01-16, 0d
    WBS 5.3 Field test tại sân Đà Nẵng    :crit, w53, after m9, 7d
    M10: Hoàn tất kiểm thử & Sửa lỗi      :milestone, m10, 2027-01-23, 0d

    section Sprint 6: Báo cáo & Bảo vệ
    WBS 5.4a Soạn thảo Báo cáo đồ án      :crit, w54a, after m10, 6d
    WBS 5.4b Quay & Biên tập Video Demo   :w54b, after m10, 6d
    M11: 100% Báo cáo & Video Demo        :milestone, m11, 2027-01-30, 0d
    WBS 5.4c Thiết kế Slide & Tổng duyệt  :crit, w54c, after m11, 5d
    M12: Nộp hồ sơ & Bảo vệ đồ án         :milestone, m12, 2027-02-06, 0d
```

---

## 3. Phân tích Đường găng (Critical Path Analysis)

Đường găng là chuỗi các công việc có tính phụ thuộc liên tục, không có thời gian dự trữ (slack/float = 0). Nếu bất kỳ công việc nào trên đường găng bị chậm tiến độ thì toàn bộ ngày bảo vệ đồ án sẽ bị trễ:

```
[WBS 1.1 Khảo sát] ➔ [WBS 1.2 Charter] ➔ [WBS 2.2 SRS] ➔ [WBS 2.3 Data Contract] ➔
[WBS 3.2b Thuật toán Slot] ➔ [WBS 3.2c Transaction Đặt suất] ➔ 
[WBS 3.3 Thuật toán Session Balancing] ➔ [WBS 3.4 Logic Elo đôi] ➔ 
[WBS 5.3 Kiểm thử thực địa tại sân] ➔ [WBS 5.4a Báo cáo đồ án] ➔ [WBS 5.4c Slide & Bảo vệ]
```

### Các mắt xích phụ thuộc then chốt cần kiểm soát:
1. **Mắt xích Data Contract (WBS 2.3 - Tuần 3):** Chặn toàn bộ công tác ghép nối UI của TV2. Nếu Data Contract chưa xong, TV2 chỉ có thể vẽ UI tĩnh chứ không thể liên kết luồng dữ liệu.
2. **Mắt xích Thuật toán chia cặp (WBS 3.3 - Tuần 7):** Chặn việc phát triển vòng lặp ghi nhận kết quả và cập nhật Elo (WBS 3.4) cũng như màn hình điều khiển sân đấu (WBS 4.4).
3. **Mắt xích Feature Freeze (M8 - Cuối tuần 8):** Bắt buộc phải đóng băng mọi thay đổi tính năng để TV2 và TV1 có trọn vẹn 2 tuần (Sprint 5) chạy kiểm thử thực tế tại sân.

---

## 4. Quy tắc kiểm soát tiến độ & Ngưỡng kích hoạt phương án dự phòng

### A. Cơ chế kiểm soát tiến độ định kỳ:
1. **Họp đồng bộ tuần (Weekly Sync):** Cố định **30 phút vào lúc 20:00 tối Chủ nhật hàng tuần** qua Google Meet.
   - Nội dung họp: Kiểm điểm việc đã hoàn thành so với kế hoạch; kiểm tra các việc bị trễ; cập nhật trạng thái bảng rủi ro (Risk Register); phân công nhiệm vụ tuần kế tiếp.
2. **Checkpoint hằng tuần (Progress Checkpoint):** Cuối mỗi tuần, TV1 có trách nhiệm cập nhật trạng thái mốc và điền nhật ký công việc vào file `docs/PROGRESS.md`.
3. **Quy tắc làm việc trên Git:** Mỗi tính năng triển khai trên 1 nhánh riêng biệt (`feat/...`, `docs/...`, `fix/...`), tạo Pull Request và review chéo trước khi merge vào `dev`. Không push trực tiếp lên nhánh `main`.

### B. Ngưỡng kích hoạt phương án dự phòng (Contingency Thresholds & Fallbacks):

| Tình huống rủi ro | Ngưỡng kích hoạt (Trigger Threshold) | Phương án xử lý dự phòng (Contingency Action) | Người quyết định |
|---|---|---|:---:|
| **Thuật toán chia cặp (Session Balancing) bị chậm** | Nếu đến giữa Tuần 7 mà thuật toán tối ưu đa tiêu chí chưa đạt độ hội tụ hoặc quá chậm. | **Kích hoạt Heuristic tham lam (Greedy):** Sử dụng thuật toán chia cặp tham lam ghép lần lượt đôi mạnh nhất với đôi yếu nhất theo Elo để đảm bảo có kết quả ngay; hoãn thuật toán tối ưu nâng cao sang giai đoạn sau. | TV1 |
| **Hạ tầng Cloud Functions Firebase gặp rào cản gói cước** | Không kích hoạt được gói Blaze (thiếu thẻ quốc tế) trước Tuần 5. | **Chuyển giao logic về Client:** Chuyển toàn bộ hàm cập nhật Elo và đôn waitlist về hàm thuần chạy trực tiếp trên app di động của Host, đồng thời siết chặt Security Rules của Firestore để phòng chống gian lận. | TV1 |
| **Giao diện mobile của TV2 bị chậm tiến độ** | Tiến độ màn hình bị trễ hơn kế hoạch quá 4 ngày làm việc. | **Sử dụng Component tối giản:** TV2 lược bỏ các hiệu ứng animation phức tạp, sử dụng các component native có sẵn của React Native để đảm bảo đủ luồng tính năng phục vụ kiểm thử. | TV2 & TV1 |
| **Khó khăn khi kiểm thử thực địa tại sân** | Sân cầu lông quá đông hoặc mất kết nối 4G hoàn toàn trong buổi test Tuần 10. | **Kiểm thử tại chỗ kết hợp Offline Simulation:** Chuyển thiết bị sang Chế độ máy bay (Airplane Mode) để kiểm tra tính năng chạy offline của thuật toán balancing; mời các tay vợt trải nghiệm ngay tại quán cafe cạnh sân. | TV1 & TV2 |
