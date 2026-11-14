---
name: firebase-data-model
description: Thiết kế cấu trúc Cloud Firestore, Security Rules, transaction và hàm Cloud Functions cho app ghép đội cầu lông gồm users, sessions, courts, roster, requests, pairs, matches. Hãy dùng skill này bất cứ khi nào người dùng nhắc đến Firestore, collection, schema, cấu trúc dữ liệu, rules, quyền ghi, phân quyền host / người chơi / admin, transaction, chống đặt trùng suất, Cloud Function hoặc Firebase Authentication, kể cả khi họ chỉ hỏi "lưu cái này ở đâu". Đọc kèm badminton-domain-rules. Dùng cùng các skill chính thức firebase-auth-basics, firebase-firestore-basics, firebase-security-rules-auditor nếu đã cài.
---

# Mô hình dữ liệu Firebase

Chi tiết từng trường nằm trong `references/schema.md`. File này giữ nguyên tắc và những chỗ dễ sai.
Cú pháp Security Rules và lệnh Firebase CLI: hãy dựa vào skill chính thức `firebase-firestore-basics`,
và chạy `firebase-security-rules-auditor` sau **mỗi lần** sửa rules.

## 1. Bản đồ collection

```
users/{uid}
sessions/{sessionId}                       thông tin kèo + tóm tắt từng sân để hiện danh sách
sessions/{sid}/courts/{courtId}            courtId là "1" hoặc "2" (tối đa 2 sân)
sessions/{sid}/courts/{cid}/requests/{uid} yêu cầu xin vào, dự bị
sessions/{sid}/matches/{matchId}           lịch và kết quả từng trận
```

**Quyết định then chốt:** danh sách người trong sân (`roster`) và các cặp (`pairs`) nằm **trong chính tài liệu sân**
dưới dạng map, không tách thành subcollection. Vì sân có tối đa 8 người nên tài liệu rất nhỏ, và nhờ vậy
transaction của Firestore đọc và ghi toàn bộ danh sách sân một cách nguyên tử. Client SDK không chạy được
truy vấn đếm bên trong transaction, nên không dùng cách "đếm subcollection để biết còn chỗ không".

`requests` là subcollection vì số yêu cầu không bị chặn trên.

## 2. Bất biến dữ liệu (phải luôn đúng)

- I1: `roster` có tối đa 8 phần tử (`RULES.COURT_CAPACITY`).
- I2: số phần tử `type = "recruit"` trong `roster` tối đa 4.
- I3: mỗi kèo có tối đa 2 tài liệu sân.
- I4: `genderAllowed(...)` đúng với mọi phần tử (luật R6).
- I5: một `uid` chỉ xuất hiện ở một sân trong cùng kèo.
- I6: `sessions/{sid}.courtSummaries` khớp với `courts` (cập nhật cùng transaction).
- I7: `ratingProcessed` chỉ chuyển từ `false` sang `true`.

Viết các bất biến này thành hàm `assertCourtInvariants(court)` trong `src/domain/` và gọi trong test.

## 3. Ai được ghi gì

| Dữ liệu | Người chơi | Host của kèo | Admin | Cloud Function |
|---|---|---|---|---|
| `users/{uid}`: tên, giới tính, vị trí, khu vực | Chính mình | | Có | |
| `users/{uid}.skill.*`, `role` | **Không** | Không | Có | Có |
| `sessions/*`, `courts/*` (tạo, sửa) | Không | Có | Có | |
| `roster`, `pairs` | Chỉ xóa chính mình khỏi roster khi hủy | Có (qua transaction) | Có | |
| `requests/{uid}` | Tạo, rút lại yêu cầu của chính mình | Đổi trạng thái | Có | |
| `matches/*` tỷ số | Không | Có | Có | |
| `matches/*.ratingProcessed` | Không | Không | Không | Có |

Gợi ý kỹ thuật cho rules (kiểm tra cú pháp bằng skill Firebase chính thức):
- Dùng `request.resource.data.diff(resource.data).affectedKeys().hasOnly([...])` để giới hạn trường được sửa.
- Với map `roster`, dùng `.diff()` trên map để cho phép người chơi chỉ **xóa đúng khóa của mình**.
- Quyền host: `get(/databases/$(database)/documents/sessions/$(sid)).data.hostId == request.auth.uid`.

## 4. Transaction bắt buộc

Mọi thao tác thay đổi `roster` phải là **một transaction** gồm: đọc tài liệu sân → kiểm tra lại luật
(`recruit-slot-matching`, mục 2) → ghi sân → cập nhật `courtSummaries` của kèo. Gồm: duyệt vãng lai,
thêm hoặc xóa người mặc định, người chơi hủy, đôn dự bị.

Thêm trường `version` (số nguyên tăng dần) vào tài liệu sân. Màn hình host luôn gửi lên `version` đã thấy;
transaction từ chối nếu khác, UI báo "dữ liệu vừa thay đổi, vui lòng xem lại".

## 5. Cloud Functions (tối thiểu)

Chỉ làm những việc client không được phép làm:
- `onMatchConfirmed`: tính Elo, uy tín, cập nhật `skill` (xem `badminton-rating`), có kiểm tra `ratingProcessed`.
- (Tùy chọn) gửi thông báo FCM khi `requests` hoặc `roster` thay đổi.

Cloud Functions thường cần gói Firebase trả phí. Hãy kiểm tra giá hiện hành của Firebase và báo người dùng
trước khi dựa vào chúng. Nếu nhóm không dùng gói trả phí, đề xuất phương án khác và ghi rõ vào Risk Register.

## 6. Việc cần làm khi dùng skill

- Thêm Firebase Emulator Suite vào dự án, viết test rules (xem `badminton-testing`).
- Ghi tài liệu **Data Contract** (tên bảng, tên trường, kiểu) và chốt ở tuần 3 theo kế hoạch.
  Thành viên 2 dựng UI theo Data Contract đó, dùng dữ liệu giả cùng cấu trúc trong lúc chờ.
- Không bao giờ lưu số điện thoại, ảnh giấy tờ hay vị trí chính xác của người chơi nếu app không cần.
