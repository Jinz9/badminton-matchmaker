# NGÂN HÀNG CÂU HỎI & ĐÁP ÁN BẢO VỆ ĐỒ ÁN (Q&A BANK)
**Dự án:** Hệ thống Ghép Đội & Cân Bằng Kèo Cầu Lông (Mobile App)  
**Nhóm sinh viên:** Đào Duy Nhật (TV1 - PM/Backend/Thuật toán) & Nguyễn Đức Đạt (TV2 - Frontend/Tester/UI-UX)  
**Tài liệu tham chiếu:** `docs/report/` (12 chương báo cáo), `docs/api/`, `docs/test/`, `docs/decisions/`  

---

## MỤC LỤC CÁC NHÓM CÂU HỎI
- [Nhóm 1: Quản Trị Dự Án & Quy Trình Phát Triển (8 câu)](#nhóm-1-quản-trị-dự-án--quy-trình-phát-triển)
- [Nhóm 2: Kiến Trúc Hệ Thống & Công Nghệ BaaS (6 câu)](#nhóm-2-kiến-trúc-hệ-thống--công-nghệ-baas)
- [Nhóm 3: Nghiệp Vụ Cầu Lông & Ba Thuật Toán Cốt Lõi (9 câu)](#nhóm-3-nghiệp-vụ-cầu-lông--ba-thuật-toán-cốt-lõi)
- [Nhóm 4: Thiết Kế UI/UX & Tối Ưu Môi Trường Thực Địa (5 câu)](#nhóm-4-thiết-kế-uiux--tối-ưu-môi-trường-thực-địa)
- [Nhóm 5: Đảm Bảo Chất Lượng & Kiểm Thử Phần Mềm (4 câu)](#nhóm-5-đảm-bảo-chất-lượng--kiểm-thử-phần-mềm)
- [Nhóm 6: Giới Hạn, Bài Học & Hướng Phát Triển Tương Lai (4 câu)](#nhóm-6-giới-hạn-bài-học--hướng-phát-triển-tương-lai)

---

## NHÓM 1: QUẢN TRỊ DỰ ÁN & QUY TRÌNH PHÁT TRIỂN

### Câu 1: Tại sao nhóm chỉ có 2 người nhưng lại chọn mô hình Agile/Scrum mà không dùng mô hình Thác nước (Waterfall)?
- **Người trả lời chính:** TV1 (Đào Duy Nhật).
- **Đáp án gợi ý:**
  - *Đặc thù bài toán phong trào:* Yêu cầu nghiệp vụ ghép đội cầu lông mang tính thực địa cao, không thể "đóng băng" yêu cầu từ ngày đầu. Nếu dùng Waterfall, khi mang ứng dụng ra sân thử nghiệm ở tuần thứ 6 và phát hiện luật 8 người/sân (CR-01), toàn bộ kiến trúc và thiết kế sẽ bị đổ vỡ với chi phí sửa chữa cực lớn.
  - *Sprint 2 tuần linh hoạt:* Chia 12 tuần thành 6 Sprint cho phép nhóm chuyển giao tính năng chạy được (working software) sau mỗi 2 tuần, sớm lấy phản hồi từ các host sân tại Đà Nẵng (sân Kỳ Đồng, Tuyên Sơn).
  - *Kiểm soát rủi ro và tích hợp liên tục:* Nhóm duy trì nhịp Standup hàng ngày, Retrospective cuối sprint để tối ưu hóa phối hợp 2 người, đo vận tốc (Velocity ~22-26 SP/sprint) giúp lập kế hoạch chính xác.
- **Tài liệu tham chiếu:** `docs/report/chap01-intro-charter.md`, `docs/report/chap04-schedule-gantt.md`.

---

### Câu 2: Trong quá trình phát triển, nhóm đã xử lý độ lệch tiến độ (Schedule Variance) như thế nào?
- **Người trả lời chính:** TV1.
- **Đáp án gợi ý:**
  - Tại Sprint 3 (Milestone M4 & M5), khi tiếp nhận yêu cầu thay đổi nghiệp vụ CR-01 (luật 8 người/sân và phân bổ vãng lai), dự án bị trễ +3 ngày so với kế hoạch ban đầu.
  - *Biện pháp điều chỉnh:*
    1. Áp dụng kỹ thuật *Fast-Tracking*: Cho phép TV2 tiến hành dựng khung màn hình với Mock Data song song khi TV1 tái cấu trúc schema Firestore và thuật toán Session Balancing.
    2. *Tận dụng Time Buffer (Khoảng đệm dự phòng):* Dự án có phân bổ 4 ngày đệm trước cột mốc Feature Freeze (Sprint 5) nên sự cố chậm tiến độ không làm ảnh hưởng đến hạn chót bàn giao cuối cùng.
    3. Hợp lý hóa phạm vi: Tạm hoãn tính năng phụ (Push Notification nâng cao qua OneSignal) sang giai đoạn phát triển mở rộng để tập trung 100% cho luồng nghiệp vụ cốt lõi.
- **Tài liệu tham chiếu:** `docs/report/chap04-schedule-gantt.md`, `docs/meetings/sprint-retrospective-03.md`.

---

### Câu 3: Nguồn gốc của Change Request CR-01 là gì và quy trình quản trị thay đổi đã diễn ra như thế nào?
- **Người trả lời chính:** TV1.
- **Đáp án gợi ý:**
  - *Nguồn gốc:* Ban đầu nhóm thiết kế mỗi sân nhận tối đa 4-6 người và cố định số suất tuyển theo công thức đơn giản. Sau khi phỏng vấn 3 host sân phong trào tại Đà Nẵng, nhóm phát hiện thực tế một sân cầu lông thường sinh hoạt từ 6 đến 8 người để xoay tua nghỉ ngơi (đánh 4, nghỉ 2-4). Nếu chỉ cho nhận 4 người thì chi phí tiền sân trên mỗi người quá đắt, không thực tế.
  - *Quy trình xử lý:*
    1. Ghi nhận đề xuất vào Change Request form (CR-01).
    2. Đánh giá tác động (Impact Analysis): Ảnh hưởng đến Schema `sessions/{id}/courts/{courtId}`, thuật toán Session Balancing (phải hỗ trợ nghỉ luân phiên 5, 6, 7, 8 người), và giao diện chọn số suất tuyển của TV2.
    3. Trình phê duyệt: Cả 2 thành viên thống nhất phê duyệt và điều chỉnh WBS, cập nhật Data Contract API trước khi sửa mã nguồn.
- **Tài liệu tham chiếu:** `docs/report/chap08-change-management.md`, `docs/decisions/CR-01-slot-court-redesign.md`.

---

### Câu 4: Ma trận RACI và Bảng phân chia công việc (WBS) phát huy hiệu quả gì trong một nhóm chỉ có 2 thành viên?
- **Người trả lời chính:** TV1.
- **Đáp án gợi ý:**
  - Trong nhóm nhỏ, rủi ro lớn nhất là *"cha chung không ai khóc"* hoặc một người bị quá tải trong khi người kia thiếu việc.
  - *WBS 21 gói công việc (4 cấp độ):* Giúp bóc tách chi tiết từng đầu việc đến cấp độ công số (4-16 giờ), không bị sót việc tích hợp, kiểm thử hay viết tài liệu.
  - *RACI phân định trách nhiệm rõ ràng:* 
    - TV1 là **Accountable (A)** và **Responsible (R)** cho Kiến trúc, Thuật toán, Backend Firebase, Data Contract và Quản trị dự án. TV2 đóng vai trò **Consulted (C)** và **Informed (I)** để đảm bảo API dễ dùng cho Mobile.
    - TV2 là **Accountable (A)** và **Responsible (R)** cho Giao diện Expo, UX luồng thực địa, Test Execution và Quản lý Bug Log. TV1 đóng vai trò hỗ trợ và review.
    - Nhờ đó, quy trình Git Code Review đạt tỷ lệ 100% PR được kiểm tra chéo trước khi merge vào nhánh `dev`.
- **Tài liệu tham chiếu:** `docs/report/chap03-wbs-raci.md`, `docs/report/chap07-quality-management.md`.

---

### Câu 5: Nhóm quản trị rủi ro như thế nào? Rủi ro nào có điểm số cao nhất trong Risk Register và đã ứng phó ra sao?
- **Người trả lời chính:** TV1.
- **Đáp án gợi ý:**
  - Nhóm lập Ma trận Rủi ro 5x5 với 14 rủi ro được nhận diện ngay từ Sprint 1, theo dõi qua từng Sprint Retrospective.
  - *Rủi ro có điểm rủi ro cao nhất (Score = 20/25):* **R-04: Xung đột ghi đồng thời (Race Condition) khi nhiều vãng lai cùng bấm xin suất cuối cùng.**
    - *Khả năng xảy ra:* 4 (Cao - do các kèo "hot" mở suất thường có nhiều người cùng vào đặt chỗ).
    - *Mức độ tác động:* 5 (Rất nghiêm trọng - gây overbooking, host phải từ chối người chơi trực tiếp tại sân, phá vỡ niềm tin vào ứng dụng).
    - *Biện pháp ứng phó:* Sử dụng `Firestore RunTransaction` với cơ chế Optimistic Concurrency Control, khóa bản ghi kèo và kiểm tra nguyên tử `currentParticipants < maxParticipants`. Nếu hết suất, tự động chuyển người chơi vào hàng đợi `waitlist` với trạng thái minh bạch.
- **Tài liệu tham chiếu:** `docs/report/chap05-risk-register.md`, `docs/report/chap06-design-architecture.md`.

---

### Câu 6: Làm thế nào nhóm đảm bảo các quyết định kỹ thuật và thay đổi hợp đồng API không gây vỡ code của nhau?
- **Người trả lời chính:** TV2 (Nguyễn Đức Đạt) & TV1.
- **Đáp án gợi ý:**
  - *Nguyên tắc "Contract-First" (Hợp đồng đi trước mã nguồn):* Mọi API giữa BaaS và Mobile đều được mô tả thành tài liệu Markdown trong thư mục `docs/api/` (bao gồm schema request/response JSON, mã lỗi, điều kiện tiên quyết).
  - *Cơ chế Change Request cho API:* Không thành viên nào được tự ý đổi tên trường hoặc kiểu dữ liệu trong Firestore. Khi cần thay đổi, phải tạo PR sửa tài liệu `docs/api/` trước, được thành viên kia approve mới được sửa code.
  - *Mock Data & Fixtures:* TV2 sử dụng bộ Mock Data sinh ra từ `docs/api/` để dựng UI độc lập, không bị block khi backend đang xây dựng.
- **Tài liệu tham chiếu:** `docs/api/README.md`, `docs/report/chap07-quality-management.md`.

---

### Câu 7: Báo cáo của nhóm có các chỉ số tiến độ EVM (Earned Value Management) không, và nó thể hiện điều gì?
- **Người trả lời chính:** TV1.
- **Đáp án gợi ý:**
  - Nhóm theo dõi tiến độ dựa trên Story Points tương đương giá trị công việc hoàn thành:
    - Kế hoạch tổng thể: 140 Story Points qua 6 Sprint.
    - Chỉ số hiệu suất tiến độ SPI (Schedule Performance Index) đạt xấp xỉ 0.98 ở giữa dự án (Sprint 3 do CR-01) và phục hồi đạt 1.00 tại Sprint 5 khi đóng băng tính năng (Feature Freeze).
    - Chỉ số hiệu suất chi phí CPI (Cost Performance Index) xấp xỉ 1.0 do chi phí hạ tầng Firebase nằm hoàn toàn trong gói miễn phí Spark Plan ($0 phát sinh).
- **Tài liệu tham chiếu:** `docs/report/chap04-schedule-gantt.md`, `docs/report/chap09-cost-procurement.md`.

---

### Câu 8: Dự án đã đạt được bao nhiêu phần trăm so với mục tiêu đặt ra trong Project Charter ban đầu?
- **Người trả lời chính:** TV1.
- **Đáp án gợi ý:**
  - Dự án hoàn thành **100% mục tiêu cốt lõi** cam kết trong Project Charter:
    1. Giải quyết bài toán ghép đội vãng lai theo 6 cấp trình độ và nội dung đánh đôi.
    2. Cân bằng cặp đấu tự động dưới 1 giây với thuật toán thích nghi số người linh hoạt (5-8 người/sân).
    3. Hệ thống tính điểm Elo đôi động và chấm điểm uy tín tự động sau trận.
    4. Ứng dụng di động thao tác một tay mượt mà tại sân cầu lông, đạt chỉ số hài lòng SUS 82.5/100 (vượt mục tiêu $\ge 75$).
- **Tài liệu tham chiếu:** `docs/report/chap01-intro-charter.md`, `docs/report/chap11-project-evaluation.md`.

---

## NHÓM 2: KIẾN TRÚC HỆ THỐNG & CÔNG NGHỆ BAAS

### Câu 9: Tại sao nhóm chọn kiến trúc Firebase Serverless (BaaS) thay vì dựng backend Node.js/NestJS với PostgreSQL?
- **Người trả lời chính:** TV1.
- **Đáp án gợi ý:**
  - *Tối ưu hóa nguồn lực nhóm 2 người:* Thời gian dự án chỉ có 12 tuần. Nếu dựng backend truyền thống, nhóm phải mất 3-4 tuần cấu hình VPS, Docker, CI/CD, migration DB, quản lý xác thực JWT, bảo mật socket. Firebase BaaS cung cấp sẵn Auth, Realtime Firestore, Cloud Functions và Security Rules giúp nhóm tập trung 100% vào logic nghiệp vụ và thuật toán.
  - *Đặc thù Realtime của ứng dụng thể thao:* Người chơi tại sân cần cập nhật tức thời khi có người xin vào kèo, hủy suất hoặc cập nhật tỷ số trận đấu. Firestore có cơ chế `onSnapshot` lắng nghe thời gian thực cực kỳ nhẹ nhàng và tiết kiệm pin.
  - *Chi phí $0:* Toàn bộ dự án hoạt động ổn định trên Firebase Spark Plan trong suốt quá trình thử nghiệm và kiểm thử.
- **Tài liệu tham chiếu:** `docs/report/chap06-design-architecture.md`, `docs/decisions/ADR-01-firebase-baas.md`.

---

### Câu 10: Việc dùng BaaS có làm logic nghiệp vụ bị phụ thuộc vào client, gây mất an toàn dữ liệu không?
- **Người trả lời chính:** TV1.
- **Đáp án gợi ý:**
  - *Hoàn toàn không, nhờ nguyên tắc phân tách 2 lớp bảo vệ:*
    1. **Firestore Security Rules (Lớp chặn quyền trực tiếp):** Nhóm đã viết bộ quy tắc bảo mật chặt chẽ (`firestore.rules`), cấm client tự ý sửa điểm Elo, điểm uy tín, hoặc sửa danh sách người tham gia nếu không phải host. Các thao tác này chỉ được thực hiện thông qua Cloud Functions hoặc transaction có điều kiện.
    2. **Cloud Functions (Lớp xử lý nghiệp vụ nhạy cảm):** Các logic quan trọng như: cập nhật điểm Elo sau trận đấu, xử lý trừ điểm uy tín khi bùng kèo, và tự động đôn người từ Waitlist đều chạy trên môi trường Node.js Backend an toàn của Cloud Functions với Admin SDK, client không thể can thiệp.
- **Tài liệu tham chiếu:** `docs/report/chap06-design-architecture.md`, `firestore.rules`.

---

### Câu 11: Làm thế nào ứng dụng hoạt động được khi người chơi ở trong sân cầu lông có sóng 3G/4G chập chờn hoặc mất mạng?
- **Người trả lời chính:** TV2.
- **Đáp án gợi ý:**
  - Các sân cầu lông tại Việt Nam thường có mái tôn dày gây suy hao sóng di động nghiêm trọng.
  - Nhóm áp dụng chiến lược **Offline-First Resilience**:
    1. Bật tính năng `enableIndexedDbPersistence` / Local Cache của Firestore SDK trên thiết bị di động.
    2. Dữ liệu danh sách người chơi và lịch thi đấu của buổi hôm đó được tải sẵn vào bộ nhớ cục bộ (AsyncStorage/WatermelonDB cache).
    3. Khi mất mạng tại sân, host vẫn thực hiện chia cặp và nhập tỷ số bình thường trên máy.
    4. Khi có kết nối mạng trở lại, Firestore SDK tự động đồng bộ hóa ngầm dữ liệu lên đám mây mà không làm gián đoạn trải nghiệm của người dùng.
- **Tài liệu tham chiếu:** `docs/report/chap06-design-architecture.md`, `docs/report/chap10-testing-qa.md`.

---

### Câu 12: Nhóm đã tối ưu hóa chi phí đọc/ghi (Read/Write) của Firestore như thế nào để tránh vượt ngưỡng miễn phí?
- **Người trả lời chính:** TV1.
- **Đáp án gợi ý:**
  - *Kỹ thuật Denormalization (Phi chuẩn hóa có kiểm soát):* Thay vì mỗi lần xem danh sách kèo phải query sang collection `users` để lấy tên và avatar của từng người, nhóm nhúng trực tiếp thông tin tóm tắt (`displayName`, `avatarUrl`, `level`, `elo`) vào mảng `participants` của document `sessions`.
  - *Lưu trữ số liệu thống kê tổng hợp (Pre-aggregated Stats):* Thay vì query toàn bộ lịch sử hàng trăm trận đấu để đếm số trận thắng/thua mỗi lần vào trang cá nhân, thông tin này được tính toán và lưu sẵn ở document `user_stats/{userId}` ngay khi có kết quả trận đấu mới.
  - *Composite Index tối ưu:* Cấu hình chính xác các bộ chỉ mục kép trong `firestore.indexes.json` để mọi truy vấn lọc theo ngày, trạng thái và khu vực đều thực hiện trực tiếp trên index, giảm thời gian query xuống < 100ms.
- **Tài liệu tham chiếu:** `docs/report/chap06-design-architecture.md`, `firestore.indexes.json`.

---

### Câu 13: Khi có 2 vãng lai cùng bấm nút "Đặt suất" vào mili-giây cuối cùng, hệ thống xử lý tranh chấp (Concurrency) như thế nào?
- **Người trả lời chính:** TV1.
- **Đáp án gợi ý:**
  - Hệ thống sử dụng `Firestore Transaction` (`runTransaction` API):
    - Khi người chơi bấm đặt chỗ, transaction đọc trạng thái mới nhất của session: `slotsRemaining = maxSlots - currentRoster.length`.
    - Nếu `slotsRemaining > 0`, transaction tiến hành append người chơi vào `roster` và giảm `slotsRemaining` đi 1, sau đó commit nguyên tử.
    - Nếu trong lúc đó có người khác đã commit trước, transaction của người thứ hai sẽ phát hiện dữ liệu đã thay đổi (optimistic locking), tự động rollback và thực hiện đọc lại. Khi đó `slotsRemaining == 0`, hệ thống trả về thông báo hết suất và hỏi người chơi có muốn chuyển vào hàng đợi `waitlist` hay không.
- **Tài liệu tham chiếu:** `docs/report/chap06-design-architecture.md`, `docs/api/session-management.md`.

---

### Câu 14: Tại sao nhóm không sử dụng Push Notification qua Apple APNs / Google FCM mà lại hiển thị In-App Alert?
- **Người trả lời chính:** TV2.
- **Đáp án gợi ý:**
  - Trong phạm vi đồ án học phần (Sprint 1 đến Sprint 5), việc cấu hình tài khoản Apple Developer ($99/năm) và chứng chỉ APNs/FCM trên bản build Expo Development Client gặp rào cản về chi phí và môi trường thử nghiệm của sinh viên.
  - Nhóm sử dụng cơ chế lắng nghe Firestore Snapshot (`onSnapshot`) kết hợp với thông báo In-App qua `react-native-toast-message` và Modal Alert native. Giải pháp này đáp ứng 100% kịch bản thông báo tức thời khi đang mở ứng dụng tại sân (được duyệt tham gia, có lượt đánh mới, đối thủ nhập tỷ số).
  - Kiến trúc đã thiết kế sẵn cổng tích hợp Expo Notifications cho giai đoạn đưa lên Store thương mại.
- **Tài liệu tham chiếu:** `docs/report/chap08-change-management.md`, `docs/demo/build-guide.md`.

---

## NHÓM 3: NGHIỆP VỤ CẦU LÔNG & BA THUẬT TOÁN CỐT LÕI

### Câu 15: Tại sao hệ thống lại xây dựng thang trình độ 6 cấp (Y1, Y2, TB1, TB2, K1, K2) mà không dùng thang điểm số tự do từ 1 đến 10?
- **Người trả lời chính:** TV1.
- **Đáp án gợi ý:**
  - *Phù hợp với văn hóa phong trào Việt Nam:* Các nhóm cầu lông phong trào (đặc biệt tại Đà Nẵng và Hà Nội/TP.HCM) quen dùng thuật ngữ "Yếu", "Trung bình", "Khá" (mỗi nhóm chia 2 mức cộng/trừ) để tự đánh giá khi giao lưu.
  - *Trực quan và dễ tự đánh giá:* Người chơi rất khó phân biệt giữa 6.5 và 7.0 điểm, nhưng rất dễ nhận biết mình thuộc nhóm TB1 (đánh đều cầu, biết đập nhưng chưa biến hóa) hay TB2 (bắt đầu biết cắt cầu, di chuyển bài bản).
  - *Khung điểm Elo ánh xạ tương ứng:* Thang 6 cấp được ánh xạ sang các dải điểm Elo chuẩn (Y1: 800-999, Y2: 1000-1199, TB1: 1200-1399, TB2: 1400-1599, K1: 1600-1799, K2: 1800-2000), làm giá trị khởi tạo chính xác cho hệ thống tính điểm động sau này.
- **Tài liệu tham chiếu:** `docs/report/chap06-design-architecture.md`, `docs/domain/badminton-skill-levels.md`.

---

### Câu 16: Giải thích công thức tính điểm Elo đánh đôi? Tại sao một người thắng trận nhưng vẫn có thể bị tăng ít điểm hơn đồng đội?
- **Người trả lời chính:** TV1.
- **Đáp án gợi ý:**
  - *Công thức Elo đôi:* Điểm của mỗi đội $A$ và $B$ là trung bình cộng điểm của 2 vận động viên: $R_{Team1} = (R_{A1} + R_{A2}) / 2$.
  - Xác suất kỳ vọng thắng của Đội 1: $E_1 = \frac{1}{1 + 10^{(R_{Team2} - R_{Team1}) / 400}}$.
  - *Hệ số K-factor thích nghi:*
    - Người chơi mới ($< 10$ trận): $K = 40$ (để điểm nhanh chóng tiệm cận trình độ thực tế).
    - Người chơi ổn định: $K = 20$.
  - *Hiện tượng tăng điểm khác nhau:* Nếu người chơi A1 là người mới ($K=40$) đánh cặp cùng người chơi A2 đã ổn định ($K=20$), khi thắng cùng một trận đấu, người A1 sẽ được cộng số điểm gấp đôi người A2 ($\Delta R_1 = 40 \times (1 - E_1)$ so với $\Delta R_2 = 20 \times (1 - E_1)$). Điều này hoàn toàn công bằng và chuẩn xác theo lý thuyết xếp hạng thể thao.
- **Tài liệu tham chiếu:** `docs/report/chap06-design-architecture.md`, `functions/src/algorithms/eloCalculator.ts`.

---

### Câu 17: Làm sao hệ thống ngăn chặn việc người dùng "khai gian" trình độ khi mới đăng ký tài khoản (smurfing / over-claiming)?
- **Người trả lời chính:** TV1.
- **Đáp án gợi ý:**
  - Nhóm áp dụng **Cơ chế Tự Cân Bằng Đa Tầng**:
    1. *Khởi tạo có bảo lưu (Provisional Rating):* 10 trận đầu tiên của người dùng mới có hệ số $K=40$. Nếu người chơi tự khai là "Khá 1" (1600) nhưng vào sân bị thua liên tục trước các đối thủ "Trung bình", điểm Elo sẽ tụt cực nhanh về đúng thực lực chỉ sau 3-5 trận.
    2. *Đánh giá chéo sau buổi đánh (Review Consensus):* Sau mỗi buổi giao lưu, host và người chơi cùng sân được gửi card đánh giá nhanh (Ẩn danh): "Trình độ bạn này có đúng như khai báo không?" (Cao hơn / Đúng / Thấp hơn). Nếu $\ge 60\%$ nhận xét "Thấp hơn", thuật toán kích hoạt điều chỉnh dải điểm khuyến nghị.
    3. *Kèo có dải trình độ giới hạn:* Host có quyền đặt điều kiện chỉ nhận người chơi trong khoảng TB1-TB2, loại bỏ nguy cơ lệch trình độ quá lớn.
- **Tài liệu tham chiếu:** `docs/report/chap06-design-architecture.md`, `docs/decisions/ADR-04-rating-anti-fraud.md`.

---

### Câu 18: Trình bày thuật toán Session Balancing? Tại sao chọn giải thuật Heuristic Greedy thay vì vét cạn (Brute-force) hay Di truyền (Genetic Algorithm)?
- **Người trả lời chính:** TV1.
- **Đáp án gợi ý:**
  - *Mục tiêu thuật toán:* Trong một buổi đánh 2 tiếng gồm $N$ người (5 đến 8 người trên 1 sân), chia ra các lượt đấu sao cho:
    1. Số trận mỗi người được thi đấu là bằng nhau (độ lệch số trận chơi $\le 1$).
    2. Người nghỉ ở lượt trước được ưu tiên vào sân ở lượt sau (không ai phải ngồi nghỉ 2 lượt liên tiếp).
    3. Chênh lệch điểm Elo trung bình giữa 2 đội trong mỗi trận là nhỏ nhất: $\min |\bar{R}_{Team1} - \bar{R}_{Team2}|$.
  - *Tại sao chọn Heuristic Greedy:*
    - Số lượng người trên 1 sân nhỏ ($N \le 8$), không gian trạng thái xếp cặp trong một lượt chỉ là tổ hợp chọn 4 người từ $N$ ($C_8^4 = 70$ cách).
    - Giải thuật Heuristic tham lam tính toán theo từng lượt chỉ mất thời gian **< 5ms** trên chip di động, đảm bảo thời gian phản hồi tức thì (< 1 giây theo yêu cầu phi chức năng).
    - Các thuật toán Di truyền (GA) hay Tối ưu toàn cục đòi hỏi tài nguyên tính toán lớn và khó dự đoán thời gian dừng, không cần thiết cho bài toán quy mô sân đơn.
- **Tài liệu tham chiếu:** `docs/report/chap06-design-architecture.md`, `functions/src/algorithms/sessionBalancer.ts`.

---

### Câu 19: Trong trường hợp một sân có số người lẻ như 5 người hoặc 7 người, thuật toán xếp lịch nghỉ như thế nào để đảm bảo công bằng?
- **Người trả lời chính:** TV1.
- **Đáp án gợi ý:**
  - Đây chính là giải pháp nâng cấp trong **CR-01**:
  - *Với 5 người (mỗi lượt 4 người đánh, 1 người nghỉ):*
    - Thuật toán duy trì mảng đếm số lần nghỉ `restCount` cho từng người chơi.
    - Tại mỗi lượt mới, người có `restCount` thấp nhất sẽ được đưa vào danh sách nghỉ. Sau 5 lượt đấu, mỗi người đều được đánh chính xác 4 trận và nghỉ 1 trận. Chu kỳ lặp lại hoàn hảo $5/5$.
  - *Với 7 người (mỗi lượt 4 người đánh, 3 người nghỉ):*
    - Lượt 1: 4 người đánh, 3 người nghỉ (ví dụ: A, B, C nghỉ).
    - Lượt 2: 3 người vừa nghỉ (A, B, C) **bắt buộc phải vào sân**, chỉ cần chọn thêm 1 người từ nhóm 4 người vừa đánh xong (người có số trận nhiều nhất hoặc mệt nhất sẽ nghỉ).
    - Đảm bảo không người chơi nào phải ngồi ngoài 2 lượt liên tiếp, triệt tiêu hoàn toàn cảm giác "bị bỏ rơi" ở sân vãng lai.
- **Tài liệu tham chiếu:** `docs/report/chap06-design-architecture.md`, `tests/unit/sessionBalancer.test.ts`.

---

### Câu 20: Thuật toán Partner Finder (Gợi ý kèo & Tìm bạn chơi) dựa trên những tiêu chí nào và công thức chấm điểm ra sao?
- **Người trả lời chính:** TV1.
- **Đáp án gợi ý:**
  - Điểm phù hợp (Match Score $S \in [0, 100]$) giữa một người chơi $P$ và một kèo $M$ được tính theo hàm trọng số đa tiêu chí:
    $$S = 0.4 \times S_{skill} + 0.25 \times S_{distance} + 0.2 \times S_{reputation} + 0.15 \times S_{time}$$
    - $S_{skill}$: Mức độ tương đồng trình độ (nếu điểm Elo nằm ngay giữa dải yêu cầu của kèo thì đạt điểm tối đa 100, giảm dần nếu lệch).
    - $S_{distance}$: Khoảng cách địa lý từ vị trí người chơi đến sân đấu (tính theo công thức Haversine, tối ưu trong bán kính 5km tại Đà Nẵng).
    - $S_{reputation}$: Điểm uy tín của host và nhóm chơi hiện tại.
    - $S_{time}$: Độ tương thích về khung giờ thói quen của người chơi.
  - Các kèo có $S \ge 75$ được gắn nhãn "Kèo phù hợp cao" (Top Match) trên trang chủ.
- **Tài liệu tham chiếu:** `docs/report/chap06-design-architecture.md`, `functions/src/algorithms/partnerFinder.ts`.

---

### Câu 21: Nếu hai người chơi trong sân là vợ chồng hoặc một đôi bạn thân muốn luôn luôn đánh cặp cùng nhau thì thuật toán có hỗ trợ không?
- **Người trả lời chính:** TV1.
- **Đáp án gợi ý:**
  - Có. Thuật toán Session Balancing hỗ trợ tính năng **Cặp Cố Định (Fixed Pair / Locked Pair)**:
    - Host có thể ghim 2 người chơi thành một cặp trước khi chia tự động.
    - Khi chia cặp, thuật toán coi cặp này như một "thực thể duy nhất" có điểm Elo bằng trung bình cộng 2 người. Thuật toán sẽ tìm trong những người còn lại một cặp đối thủ có tổng điểm Elo cân bằng nhất để ghép trận thi đấu cùng họ.
    - Khi đến lượt nghỉ, cả cặp cố định sẽ cùng nghỉ hoặc cùng vào sân.
- **Tài liệu tham chiếu:** `docs/domain/badminton-pairing-rules.md`, `functions/src/algorithms/sessionBalancer.ts`.

---

### Câu 22: Điểm uy tín (Reputation Score) được tính như thế nào? Xử lý hành vi "bùng kèo" (No-show) ra sao?
- **Người trả lời chính:** TV1.
- **Đáp án gợi ý:**
  - Mỗi tài khoản khởi tạo với **100 điểm uy tín**.
  - *Quy tắc cộng trừ:*
    - Tham gia đúng giờ và hoàn thành buổi chơi: $+2$ điểm (tối đa 100).
    - Hủy slot trước giờ thi đấu $> 4$ tiếng: $0$ điểm (cho phép vì host kịp tìm người thay thế).
    - Hủy slot gấp sát giờ ($< 2$ tiếng): Trừ $-10$ điểm.
    - "Bùng kèo" không đến và không báo (No-show do host xác nhận): Trừ $-25$ điểm.
  - *Chế tài tự động:* Nếu điểm uy tín $< 70$, người chơi bị giới hạn chỉ được đặt tối đa 1 kèo đang chờ duyệt tại một thời điểm. Nếu điểm uy tín $< 50$, tài khoản bị tạm khóa quyền đặt suất vãng lai trong 7 ngày.
- **Tài liệu tham chiếu:** `docs/domain/badminton-reputation-rules.md`, `functions/src/triggers/onSessionComplete.ts`.

---

### Câu 23: Làm thế nào tính toán chỉ số "Đồng đội ăn ý nhất" (Best Teammate) trên trang thống kê cá nhân?
- **Người trả lời chính:** TV1.
- **Đáp án gợi ý:**
  - Tiêu chí lọc đồng đội ăn ý:
    1. Số trận đánh cặp cùng nhau $\ge 3$ trận (ngưỡng tối thiểu để loại trừ yếu tố may mắn ngẫu nhiên).
    2. Tỷ lệ thắng (Win Rate) khi đánh cùng nhau $\ge 60\%$.
  - Thuật toán sắp xếp ưu tiên: Sắp xếp theo Tỷ lệ thắng giảm dần; nếu tỷ lệ thắng bằng nhau, ưu tiên người có tổng số trận đánh chung nhiều hơn.
  - Nếu người dùng chưa có ai đủ điều kiện, giao diện hiển thị thông điệp khuyến khích giao lưu thêm trận để mở khóa danh hiệu này.
- **Tài liệu tham chiếu:** `docs/api/history-stats.md`, `tests/unit/bestTeammate.test.ts`.

---

## NHÓM 4: THIẾT KẾ UI/UX & TỐI ƯU MÔI TRƯỜNG THỰC ĐỊA

### Câu 24: Hãy giải thích triết lý "Thiết kế một tay tại sân" (One-Handed On-Court UX) của ứng dụng?
- **Người trả lời chính:** TV2.
- **Đáp án gợi ý:**
  - *Bối cảnh thực tế tại sân cầu lông:* Tay thuận của người chơi thường cầm vợt dính mồ hôi hoặc quấn cán, tay còn lại cầm điện thoại. Môi trường sân ồn ào, vận động viên thở dốc giữa hiệp nên không thể thao tác các form nhập liệu phức tạp.
  - *Giải pháp thiết kế của nhóm:*
    1. **Quy tắc Vùng ngón cái (Thumb Zone):** Toàn bộ nút hành động chính (Tạo trận, Chia cặp, Xác nhận tỷ số) được đặt ở 1/3 dưới cùng màn hình (Bottom Sheets, Floating Action Buttons).
    2. **Chia cặp trong "3 Chạm":** Mở app $\rightarrow$ Bấm "Vào sân" $\rightarrow$ Bấm "Chia tự động" là có ngay danh sách trận đấu.
    3. **Tương tác dạng Nút bấm lớn (Stepper/Tally):** Nhập tỷ số bằng nút bấm to cộng/trừ điểm set đấu ($21-19$), không yêu cầu mở bàn phím ảo che khuất màn hình.
- **Tài liệu tham chiếu:** `docs/report/chap06-design-architecture.md`, `docs/design/mobile-ux-guidelines.md`.

---

### Câu 25: Ứng dụng đã xử lý vấn đề hiển thị ngoài trời hoặc dưới ánh đèn công suất lớn của sân cầu lông như thế nào?
- **Người trả lời chính:** TV2.
- **Đáp án gợi ý:**
  - Các sân cầu lông thường dùng đèn LED cao áp công suất lớn (chiếu rọi trực diện) gây lóa màn hình điện thoại.
  - Nhóm áp dụng bảng màu tương phản cao (High-contrast Design System):
    - Màu nền tối tương phản mạnh (Dark Navy `#0A192F` kết hợp Card Surface `#112240`).
    - Màu điểm nhấn thể thao nổi bật: Xanh Ngọc Cầu Lông (Badminton Emerald `#10B981`) và Xanh Dương Sáng (`#0EA5E9`).
    - Phông chữ hệ thống nét đậm, kích thước tối thiểu cho văn bản hiển thị tỷ số và tên sân là 18sp - 24sp, đảm bảo người chơi đứng cách xa 1 mét vẫn đọc được kết quả lượt đánh.
- **Tài liệu tham chiếu:** `docs/report/chap06-design-architecture.md`, `docs/report/chap10-testing-qa.md`.

---

### Câu 26: Người chơi làm sao phân biệt được các vai trò khác nhau (Host, Khách cố định, Khách vãng lai) trong màn hình chi tiết kèo?
- **Người trả lời chính:** TV2.
- **Đáp án gợi ý:**
  - Giao diện sử dụng hệ thống huy hiệu (Badges) và màu sắc nhận diện trực quan:
    - **Host (Chủ sân):** Huy hiệu Vương miện vàng kèm tag "Host" nổi bật, có toàn quyền quản trị (duyệt người, đổi sân, chia cặp, nhập điểm).
    - **Thành viên cố định (Default/Regular):** Tag màu xanh lam nhạt, không cần chờ duyệt mỗi buổi.
    - **Khách vãng lai (Guest):** Tag màu tím, hiển thị trạng thái "Đã duyệt" hoặc "Chờ duyệt".
    - **Hàng đợi dự bị (Waitlist):** Nằm ở tab riêng màu vàng cam, thể hiện rõ số thứ tự ưu tiên đôn lên khi có người hủy.
- **Tài liệu tham chiếu:** `docs/domain/badminton-roster-roles.md`, `docs/report/chap06-design-architecture.md`.

---

### Câu 27: Điểm số Đánh giá Tính Tiện Dụng (SUS - System Usability Scale) của ứng dụng đạt bao nhiêu và được đo đạc như thế nào?
- **Người trả lời chính:** TV2.
- **Đáp án gợi ý:**
  - Nhóm tiến hành Field Test thực địa tại sân cầu lông Kỳ Đồng và Tuyên Sơn (Đà Nẵng) với 12 người tham gia thực tế (gồm 3 host sân và 9 người chơi phong trào).
  - Sau khi trải nghiệm đầy đủ luồng Tạo kèo $\rightarrow$ Đặt suất $\rightarrow$ Chia cặp $\rightarrow$ Nhập điểm, người dùng điền bảng khảo sát chuẩn quốc tế SUS 10 câu hỏi.
  - Kết quả đạt **82.5 / 100 điểm** (thuộc phân hạng A - "Excellent", vượt xa mức chuẩn chấp nhận được là 68 điểm). Điểm mạnh nhất được khen ngợi là thao tác chia cặp nhanh và không mất thời gian cãi nhau về việc ai đánh với ai tại sân.
- **Tài liệu tham chiếu:** `docs/report/chap10-testing-qa.md`, `docs/test/field-test-guide.md`.

---

### Câu 28: Thiết kế ứng dụng có tương thích tốt trên cả hai hệ điều hành iOS và Android không?
- **Người trả lời chính:** TV2.
- **Đáp án gợi ý:**
  - Nhờ sử dụng nền tảng **Expo React Native**, ứng dụng chia sẻ hơn 95% mã nguồn giao diện giữa iOS và Android.
  - Các thành phần điều hướng tuân thủ chuẩn Native: sử dụng Safe Area Insets để tránh tai thỏ (Notch / Dynamic Island) trên iPhone, đồng thời hỗ trợ nút Back phần cứng và cử chỉ vuốt (Gesture Navigation) mượt mà trên Android.
- **Tài liệu tham chiếu:** `docs/report/chap06-design-architecture.md`.

---

## NHÓM 5: ĐẢM BẢO CHẤT LƯỢNG & KIỂM THỬ PHẦN MỀM

### Câu 29: Chiến lược kiểm thử của nhóm gồm những tầng nào? Tỷ lệ bao phủ kiểm thử (Test Coverage) đạt bao nhiêu?
- **Người trả lời chính:** TV2 & TV1.
- **Đáp án gợi ý:**
  - Nhóm xây dựng chiến lược kiểm thử 4 tầng toàn diện:
    1. **Tầng 1 - Unit Test (Kiểm thử đơn vị thuần túy):** Kiểm thử logic nghiệp vụ độc lập không phụ thuộc mạng (Tính toán Elo, Session Balancer cho ca 4, 5, 6, 7, 8 người, Partner Finder, Best Teammate).
    2. **Tầng 2 - Security Rules Test (Firebase Emulator):** Kiểm thử ma trận phân quyền 16 ca kiểm thử trên bộ giả lập Firebase local, xác minh quyền đọc/ghi của Host, Player, Unauthenticated.
    3. **Tầng 3 - Integration & E2E Test (`scripts/e2e-flow`):** Kịch bản tích hợp tự động toàn luồng từ Tạo tài khoản $\rightarrow$ Khai trình độ $\rightarrow$ Tạo kèo $\rightarrow$ Đặt chỗ $\rightarrow$ Waitlist $\rightarrow$ Chia cặp $\rightarrow$ Nhập tỷ số $\rightarrow$ Cập nhật thống kê.
    4. **Tầng 4 - Field Test (Kiểm thử thực địa tại sân):** Đánh giá tính tiện dụng thực tế với người dùng thật.
  - **Số liệu kiểm thử thực tế:** **278 ca kiểm thử tự động, tỷ lệ PASS 100% (0 fail)**. Độ bao phủ mã nguồn nghiệp vụ lõi đạt $> 88\%$.
- **Tài liệu tham chiếu:** `docs/report/chap07-quality-management.md`, `docs/report/chap10-testing-qa.md`.

---

### Câu 30: Trong quá trình kiểm thử, lỗi nghiêm trọng nhất nhóm từng gặp phải là gì và đã giải quyết như thế nào?
- **Người trả lời chính:** TV2 (ghi nhận Bug Log) & TV1 (sửa mã nguồn).
- **Đáp án gợi ý:**
  - *Mã lỗi trong Bug Log:* **BUG-02 (Mức độ: Critical).**
  - *Mô tả lỗi:* Khi một sân có 5 người, sau 3 lượt đấu liên tiếp, thuật toán vô tình xếp một người chơi phải ngồi nghỉ 2 lượt liên tiếp trong khi một người khác được đánh liên tục không nghỉ.
  - *Nguyên nhân:* Mảng đếm lượt nghỉ `restHistory` không được cập nhật trạng thái đồng bộ khi có một người xin đổi cặp thủ công bằng tay.
  - *Quy trình khắc phục theo TDD:*
    1. TV1 viết một unit test tái hiện chính xác ca lỗi này (test ban đầu FAILED - màu đỏ).
    2. Cập nhật lại logic ưu tiên nghỉ: luôn gán trọng số ưu tiên tối cao cho người vừa ngồi ngoài ở lượt trước đó $t-1$.
    3. Chạy lại test suite $\rightarrow$ PASSED (màu xanh).
    4. Commit với chuẩn `fix(balancer): prevent consecutive rest rounds for odd-player courts`.
- **Tài liệu tham chiếu:** `docs/test/bug-log.md`, `docs/report/chap07-quality-management.md`.

---

### Câu 31: Tại sao nhóm lại kiểm thử Security Rules trên Firebase Emulator mà không kiểm thử trực tiếp trên Cloud Firebase Console?
- **Người trả lời chính:** TV1.
- **Đáp án gợi ý:**
  - *Tốc độ và tính cô lập:* Chạy trên Local Emulator Suite chỉ mất vài giây cho hàng chục test case, không chịu độ trễ mạng Internet và không làm ô nhiễm cơ sở dữ liệu trên cloud.
  - *Bảo mật và an toàn:* Thử nghiệm các hành vi giả mạo (spoofing uid), cố ý ghi đè trường nhạy cảm có thể gây rò rỉ hoặc lỗi dữ liệu nếu chạy trên dự án thật.
  - *Tích hợp CI/CD tự động:* Bộ test giả lập có thể chạy tự động bằng lệnh `firebase emulators:exec "npm test"` trong quy trình kiểm thử trước khi commit code.
- **Tài liệu tham chiếu:** `docs/report/chap07-quality-management.md`, `tests/rules/firestore-rules.test.ts`.

---

### Câu 32: Nhóm đã thực hiện các biện pháp nào để kiểm tra tính toàn vẹn dữ liệu (Data Integrity)?
- **Người trả lời chính:** TV1.
- **Đáp án gợi ý:**
  - Nhóm xây dựng công cụ kiểm tra tự động `scripts/audit-data.ts`:
    - Quét toàn bộ database để phát hiện: điểm Elo nằm ngoài thang (dưới 0 hoặc trên 3000), điểm uy tín $> 100$, kèo có số lượng người thực tế vượt quá `maxSlots`, hoặc dữ liệu thống kê không khớp với tổng số trận trong lịch sử.
    - Script hoạt động ở chế độ Read-Only, xuất báo cáo cảnh báo chi tiết giúp phát hiện lỗi nghiệp vụ ngầm mà không tự ý làm sai lệch dữ liệu gốc.
- **Tài liệu tham chiếu:** `docs/report/chap07-quality-management.md`, `scripts/audit-data.ts`.

---

## NHÓM 6: GIỚI HẠN, BÀI HỌC & HƯỚNG PHÁT TRIỂN TƯƠNG LAI

### Câu 33: Điểm hạn chế lớn nhất của ứng dụng hiện tại là gì?
- **Người trả lời chính:** TV1 & TV2.
- **Đáp án gợi ý:**
  - *Hạn chế 1 (Thanh toán tự động):* Hiện tại ứng dụng mới chỉ hỗ trợ tính toán chia tiền sân/tiền cầu tự động cho mỗi người và hiển thị mã QR chuyển khoản ngân hàng của Host, chưa tích hợp cổng thanh toán trực tuyến (MoMo/VNPay) do yêu cầu pháp nhân doanh nghiệp.
  - *Hạn chế 2 (Một chỉ số Elo chung):* Hiện tại một vận động viên chỉ có 1 chỉ số Elo tổng hợp cho cả 3 thể loại (Đôi nam, Đôi nữ, Đôi nam nữ). Trong tương lai có thể tách thành 3 chỉ số chuyên biệt để độ chính xác cân kèo đạt tuyệt đối.
  - *Hạn chế 3 (Môi trường phát hành):* Ứng dụng hiện đang chạy thử nghiệm qua Expo Go / APK nội bộ, chưa xuất bản chính thức lên Google Play Store và Apple App Store.
- **Tài liệu tham chiếu:** `docs/report/chap11-project-evaluation.md`, `docs/report/chap12-conclusion.md`.

---

### Câu 34: Nếu có thêm 3 tháng nữa để tiếp tục dự án, nhóm sẽ phát triển những tính năng gì tiếp theo?
- **Người trả lời chính:** TV1 & TV2.
- **Đáp án gợi ý:**
  - **Tháng 1:** Tích hợp cổng thanh toán trực tuyến (SePay / PayOS) để tự động hóa việc đặt cọc giữ chỗ khi vãng lai tham gia kèo, hạn chế tối đa bùng kèo.
  - **Tháng 2:** Phát triển mô-đun Giải đấu mini (Tournament Bracket): hỗ trợ các câu lạc bộ tự tổ chức giải nội bộ theo thể thức vòng tròn hoặc loại trực tiếp, tự động cập nhật bảng xếp hạng.
  - **Tháng 3:** Ứng dụng AI phân tích phong độ: gợi ý chiến thuật đánh dựa trên điểm mạnh/yếu của đối thủ và đồng đội từ lịch sử các set đấu đã lưu.
- **Tài liệu tham chiếu:** `docs/report/chap12-conclusion.md`.

---

### Câu 35: Bài học kinh nghiệm lớn nhất mà mỗi thành viên rút ra được sau môn học Quản trị Dự án Phần mềm là gì?
- **Người trả lời chính:** 
  - **TV1 (Đào Duy Nhật):** *"Bài học lớn nhất là tầm quan trọng của việc quản trị thay đổi (Change Management) và Data Contract. Việc dành thời gian thảo luận kỹ luật 8 người/sân (CR-01) và thống nhất tài liệu API trước khi viết code đã cứu dự án khỏi nguy cơ đập đi xây lại ở những tuần cuối cùng."*
  - **TV2 (Nguyễn Đức Đạt):** *"Bài học lớn nhất là triết lý thiết kế hướng người dùng thực tế (User-Centric Design). Một tính năng viết bằng thuật toán rất phức tạp nhưng nếu ra sân cầu lông chói mắt, tay dính mồ hôi mà thao tác quá 3 chạm thì người dùng sẽ lập tức bỏ app để dùng sổ tay hoặc chat Zalo. Kiểm thử thực địa (Field Test) là chìa khóa then chốt cho sản phẩm di động."*
- **Tài liệu tham chiếu:** `docs/report/chap11-project-evaluation.md`, `docs/report/chap12-conclusion.md`.

---

> [!TIP]
> **Lời khuyên khi trả lời Hội đồng:**
> - Luôn trả lời tự tin, đúng trọng tâm câu hỏi, không lan man.
> - Khi giảng viên hỏi về mặt kỹ thuật/thuật toán, TV1 chủ động đứng lên trả lời và trỏ vào sơ đồ/công thức trên slide.
> - Khi giảng viên hỏi về trải nghiệm người dùng, lỗi phát sinh thực tế hay kết quả kiểm thử, TV2 trả lời và có thể mở điện thoại thao tác minh họa trực tiếp.
> - Luôn cảm ơn câu hỏi của Thầy/Cô trước khi trả lời.

