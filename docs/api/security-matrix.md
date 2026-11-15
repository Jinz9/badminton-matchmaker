# MA TRẬN PHÂN QUYỀN BẢO MẬT FIRESTORE (SECURITY RULES MATRIX)

**Dự án:** Hệ thống ghép đội và cân bằng kèo cầu lông (Mobile App - Đà Nẵng)  
**Tài liệu:** `docs/api/security-matrix.md`  
**Phiên bản:** 1.0 (Ban hành Tuần 3 - Nhánh `feat/security-rules`)  
**Tác giả:** Đào Duy Nhật (TV1 - PM, Backend, Data & Algorithm)  
**Tệp quy tắc:** [firestore.rules](file:///d:/QLDAPM/firestore.rules)  

---

## 1. NGUYÊN TẮC BẢO MẬT CỐT LÕI (CORE PRINCIPLES)

1. **Chặn mặc định (Deny by Default - Least Privilege):** Mọi collection hoặc đường dẫn không được khai báo rõ ràng đều bị chặn đọc và ghi (`match /{document=**} { allow read, write: if false; }`).
2. **Xác thực danh tính (Authentication First):** 100% tài nguyên yêu cầu người dùng phải đăng nhập (`isAuthenticated()`). Người dùng ẩn danh không thể đọc thông tin người chơi, sảnh kèo, hoặc tỷ số.
3. **Bất biến dữ liệu (Data Immutability):** Các trường định danh và thời gian khởi tạo (`uid`, `hostId`, `createdAt`, `userId`, `sessionId`, `courtId`) không được phép sửa đổi sau khi tạo.
4. **Chống leo thang đặc quyền (No Privilege Escalation):**
   - Người dùng thông thường không thể tự gán `role: "admin"` hoặc `role: "host"`.
   - Client không thể tự sửa điểm Elo (`skill.rating`), điểm uy tín (`skill.reliability`), hay cờ `ratingProcessed`.
5. **Kiểm soát tính toàn vẹn (Integrity & Domain Rules):**
   - Thang điểm Elo được chặn trong khoảng $[800, 2200]$.
   - Điểm uy tín trong khoảng $[0, 100]$.
   - Số người tối đa trong một sân $\le 8$ (`COURT_CAPACITY`).
   - Số sân tối đa của một kèo $\le 2$ (`courtCount in [1, 2]`).

---

## 2. MA TRẬN PHÂN QUYỀN (ROLE × COLLECTION × CRUD)

| Collection / Đường dẫn | Thao tác | Unauthenticated (Khách) | Player (Người chơi) | Host (Chủ kèo) | Admin (Quản trị viên) | Cloud Functions / Admin SDK | Điều kiện & Ràng buộc bảo mật |
|---|:---:|:---:|:---:|:---:|:---:|:---:|---|
| **`/users/{uid}`** | Đọc | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow | Yêu cầu đăng nhập. |
| | Tạo | ❌ Deny | ✅ Allow (chính mình) | ✅ Allow (chính mình) | ✅ Allow | ✅ Allow | `isOwner(uid)`, `role == 'player'`, `rating in [800..2200]`, `reliability == 100`, `matchesPlayed == 0`. |
| | Sửa | ❌ Deny | ⚠️ Chỉ info cá nhân | ⚠️ Chỉ info cá nhân | ✅ Toàn quyền | ✅ Toàn quyền | Không đổi `uid`, `role`, `createdAt`, `skill`, `isDeleted`. |
| | Xóa | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Soft Delete | ✅ Allow | Cấm xóa cứng từ client; chỉ Admin được đổi `isDeleted`. |
| **`/sessions/{sessionId}`** | Đọc | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow | Người đã đăng nhập xem được danh sách sảnh chờ. |
| | Tạo | ❌ Deny | ❌ Deny | ✅ Allow (kèo mình) | ✅ Allow | ✅ Allow | `hostId == auth.uid`, `courtCount in [1, 2]`, `title.size() in [3..100]`. |
| | Sửa | ❌ Deny | ❌ Deny | ✅ Allow (kèo mình) | ✅ Toàn quyền | ✅ Toàn quyền | Không đổi `hostId`, `createdAt`. `courtCount in [1, 2]`. |
| | Xóa | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | Xóa mềm hoặc Admin xóa. |
| **`.../courts/{courtId}`** | Đọc | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow | Xem danh sách thành viên sân. |
| | Tạo | ❌ Deny | ❌ Deny | ✅ Allow (kèo mình) | ✅ Allow | ✅ Allow | `courtId in ['1', '2']`, `roster.size() <= 8`, `levelMin <= levelMax`. |
| | Sửa | ❌ Deny | ⚠️ Chỉ hủy suất mình | ✅ Allow (kèo mình) | ✅ Toàn quyền | ✅ Toàn quyền | Host quản lý roster $\le 8$. Player chỉ xóa đúng key `auth.uid` khỏi `roster`. |
| | Xóa | ❌ Deny | ❌ Deny | ✅ Allow (kèo mình) | ✅ Allow | ✅ Allow | Host sở hữu kèo hoặc Admin. |
| **`.../requests/{requestId}`**| Đọc | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow | Xem trạng thái đơn. |
| | Tạo | ❌ Deny | ✅ Allow (đơn mình) | ✅ Allow (đơn mình) | ✅ Allow | ✅ Allow | `requestId == auth.uid`, `status in ['requested', 'waitlist']`. |
| | Sửa | ❌ Deny | ⚠️ Chỉ rút/hủy đơn | ✅ Duyệt/Từ chối | ✅ Toàn quyền | ✅ Toàn quyền | Player không tự chuyển `confirmed`. Host duyệt `confirmed`/`declined`. |
| | Xóa | ❌ Deny | ✅ Allow (đơn mình) | ✅ Allow (kèo mình) | ✅ Allow | ✅ Allow | Người nộp đơn hoặc Host hủy đơn. |
| **`.../matches/{matchId}`** | Đọc | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow | Xem lịch đấu và tỷ số. |
| | Tạo | ❌ Deny | ❌ Deny | ✅ Allow (kèo mình) | ✅ Allow | ✅ Allow | `ratingProcessed == false`. |
| | Sửa | ❌ Deny | ⚠️ Chỉ gửi thẻ cards | ✅ Nhập tỷ số set | ✅ Toàn quyền | ✅ Toàn quyền | Host không tự set `ratingProcessed = true`. Player chỉ sửa trường `cards`. |
| | Xóa | ❌ Deny | ❌ Deny | ✅ Allow (kèo mình) | ✅ Allow | ✅ Allow | Host của kèo hoặc Admin. |
| **`/ratings/{ratingId}`** | Đọc | ❌ Deny | ⚠️ Chỉ xem của mình | ⚠️ Chỉ xem của mình | ✅ Xem tất cả | ✅ Allow | `resource.data.userId == auth.uid` hoặc Admin. |
| | Tạo/Sửa/Xóa | ❌ Deny | ❌ CẤM TOÀN BỘ | ❌ CẤM TOÀN BỘ | ❌ CẤM CLIENT | ✅ Ghi duy nhất | Client không có đường ghi. Chỉ Backend Function / Admin SDK ghi. |
| **`/notifications/{id}`** | Đọc | ❌ Deny | ⚠️ Chỉ xem của mình | ⚠️ Chỉ xem của mình | ✅ Xem tất cả | ✅ Allow | `resource.data.userId == auth.uid`. |
| | Tạo | ❌ Deny | ❌ CẤM CLIENT | ❌ CẤM CLIENT | ❌ CẤM CLIENT | ✅ Ghi duy nhất | Tránh giả mạo thông báo hệ thống. |
| | Sửa | ❌ Deny | ⚠️ Chỉ đổi 'read' | ⚠️ Chỉ đổi 'read' | ✅ Toàn quyền | ✅ Toàn quyền | Người nhận chỉ đổi `read: true/false`. |
| | Xóa | ❌ Deny | ✅ Xóa của mình | ✅ Xóa của mình | ✅ Allow | ✅ Allow | Người nhận dọn dẹp hòm thư thông báo. |

---

## 3. CÁC QUY TẮC KHÔNG THỂ BIỂU DIỄN TRONG SECURITY RULES & CƠ CHẾ THỰC THI (TRANSACTIONS / FUNCTIONS)

Một số luật nghiệp vụ phức tạp của cầu lông không thể kiểm tra tĩnh bằng biểu thức Security Rules (do Firestore Rules không hỗ trợ vòng lặp mảng, không tính hàm mũ $1/(1+10^{\Delta/400})$, và không thể thực hiện đa truy vấn đồng thời). Các quy tắc này được xử lý thông qua **Firestore Transaction** và **Cloud Functions**:

| Mã Luật | Tên Quy Tắc | Vì sao Rules không diễn đạt được? | Cơ Chế Xử Lý Thay Thế | Nơi Đặt Mã Nguồn |
|---|---|---|---|---|
| **R1 (P14)** | **Đôn hàng đợi Waitlist tự động** khi có người hủy suất | Khi 1 người chơi hủy suất, hệ thống cần: tìm người đầu tiên trong subcollection `requests` có trạng thái `waitlist` thỏa mãn điều kiện giới tính và dải trình độ $\to$ chuyển thành `confirmed` $\to$ thêm vào `roster` $\to$ cập nhật `courtSummaries`. Rules không thể query và update nhiều document khác nhánh. | Sử dụng **Firestore Transaction** hoặc Cloud Function trigger `onCourtRosterChanged`. | `src/domain/matching/waitlistQueue.ts` / Cloud Functions |
| **R2** | **Tính toán biến động điểm Elo** ($K \times (S - E)$) | Công thức Elo sử dụng số thực lũy thừa $10^{\Delta/400}$, kiểm tra $N < 5$ trận để áp dụng $K=40$, và kẹp sàn 800 - trần 2200. Security Rules không hỗ trợ hàm toán học mũ `pow()`. | Client SDK thực hiện tính toán qua `calculateEloDelta()` và ghi nhận qua Firestore Transaction; hoặc Cloud Function `onMatchConfirmed` (nếu có Blaze). Rules bảo vệ bằng cách cấm sửa trực tiếp `skill` từ client thường. | `src/domain/rating/eloCalculator.ts` |
| **R3** | **Kiểm tra giới tính thể thức Đôi Nam Nữ (`mixed`)** | Sân `mixed` tối đa 4 nam và 4 nữ. Khi duyệt vãng lai, cần đếm số nam hiện có trong `roster` (Map của document). Rules không hỗ trợ lặp qua map value để đếm số phần tử có `gender == 'M'`. | Kiểm tra trong hàm nghiệp vụ `isGenderEligible()` trước khi gọi transaction ghi nhận vào `roster`. Rules hỗ trợ chặn bằng `roster.size() <= 8`. | `src/domain/matching/slotEligibility.ts` |
| **R4** | **Phạt điểm uy tín khi bùng kèo / hủy sát giờ** | Cần so sánh thời điểm hủy với `startsAt` của kèo (nếu $< 2$ tiếng phạt 5 điểm, bùng kèo phạt 15–20 điểm). Rules không thể tự động kích hoạt trừ điểm của user khi một document khác bị thay đổi. | Thực hiện qua Transaction trừ điểm kèm ghi log vào `/ratings`, có Admin can thiệp nếu khiếu nại. | `src/domain/rating/reliability.ts` |
| **R5** | **Đồng bộ CourtSummaries và OpenSlotsTotal** | Khi số lượng thành viên trong `roster` thay đổi, trường denormalized `courtSummaries` và `openSlotsTotal` trong `sessions/{sessionId}` phải được cập nhật tương ứng. | Bắt buộc gom chung thao tác cập nhật sân và cập nhật tóm tắt phòng kèo vào **một Firestore Transaction duy nhất**. | `src/domain/repositories.ts` |

---

## 4. KẾT QUẢ ĐÁNH GIÁ THEO CHECKLIST BẢO MẬT (SECURITY AUDITOR SCORE)

Áp dụng tiêu chuẩn từ skill `firebase-security-rules-auditor`:

1. **The Update Bypass:** ✅ PASS. Toàn bộ các rule `update` đều có đối chiếu với `resource.data` để khóa bất biến các trường nhạy cảm (`uid`, `role`, `skill`, `hostId`, `createdAt`, `ratingProcessed`).
2. **Authority Source:** ✅ PASS. Quyền hạn dựa trên `request.auth.uid`, custom claims `request.auth.token.role == 'admin'`, hoặc dữ liệu hiện có `resource.data.hostId`, không bao giờ tin cậy `request.resource.data.role` do client gửi lên.
3. **Storage Abuse & DoS:** ✅ PASS. Ràng buộc độ dài chuỗi (`displayName.size() <= 50`, `title.size() <= 100`), giới hạn kích thước map/array (`roster.size() <= 8`, `courtCount in [1, 2]`).
4. **Type Safety:** ✅ PASS. Kiểm tra kiểu `is string`, `is bool`, miền giá trị `in [1, 2]`, `in ['M', 'F']`, `in [1..6]`.
5. **Field-Level vs Identity-Level:** ✅ PASS. Kết hợp chặt chẽ giữa định danh (`request.auth.uid == resource.data.userId`) và giới hạn trường cho phép sửa (`affectedKeys().hasOnly(...)`).
6. **Điểm đánh giá dự kiến:** **5/5 (Secure - Comprehensive validation, strict ownership, and role-based access)**.
