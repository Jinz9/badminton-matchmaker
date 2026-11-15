# HỢP ĐỒNG DỮ LIỆU TOÀN HỆ THỐNG (DATA CONTRACT SPECIFICATION)

**Dự án:** Hệ thống ghép đội và cân bằng kèo cầu lông (Mobile App)  
**Tài liệu:** `docs/api/data-contract.md`  
**Phiên bản:** 1.0 (Ban hành chính thức Tuần 3 - Mốc M2)  
**Tác giả:** Đào Duy Nhật (TV1 - PM, Backend, Data & Algorithm)  
**Người nhận bàn giao:** Nguyễn Đức Đạt (TV2 - UI/UX, Mobile Developer, QA)  
**Nguyên tắc ban hành:** **ĐÓNG BĂNG HỢP ĐỒNG (Contract Freeze)**. TV2 sử dụng trực tiếp mock data và interface này để dựng UI; không tự ý đổi tên trường hoặc kiểu dữ liệu sau khi ban hành. Mọi thay đổi bắt buộc phải có Change Request (CR) và ghi vào Changelog.

---

## 1. QUY ƯỚC THIẾT KẾ DỮ LIỆU (DESIGN CONVENTIONS)

1. **Cú pháp đặt tên:**
   - Tên Collection: Dạng chữ thường số nhiều (`users`, `sessions`, `courts`, `requests`, `matches`, `notifications`).
   - Tên Trường (Field names): Tuân thủ nghiêm ngặt **camelCase** (ví dụ: `displayName`, `openSlotsTotal`, `isProvisional`, `courtCount`).
   - Tên Khóa chính (IDs): Dạng chuỗi string định danh duy nhất (`uid` của Firebase Auth, hoặc định danh dạng `session_20261118_01`).
2. **Kiểu thời gian (Date & Time):**
   - Trong Firestore Production: Lưu bằng kiểu `Timestamp` của Firestore.
   - Trong Mock JSON & TypeScript Client: Sử dụng chuỗi định dạng chuẩn **ISO 8601 UTC** (ví dụ: `"2026-11-18T18:00:00.000Z"`).
3. **Quản lý phiên bản Schema:** Mọi document chính (`users`, `sessions`) bắt buộc có trường `schemaVersion: number` (mặc định khởi đầu là `1`).
4. **Xóa mềm (Soft Delete):** Áp dụng trường `isDeleted: boolean` (mặc định `false`). Dữ liệu bị hủy hoặc xóa không xóa vật lý khỏi database để bảo toàn lịch sử thống kê Elo và audit log.
5. **Phi chuẩn hóa dữ liệu có kiểm soát (Denormalization):**
   - Tài liệu `sessions/{sessionId}` chứa mảng `courtSummaries` (tóm tắt dải trình độ, số suất trống của từng sân) và thông tin tóm tắt của Host (`hostName`, `hostAvatar`, `hostReputation`).
   - **Mục đích:** Khi người chơi lướt màn hình Sảnh chờ (Lobby), ứng dụng chỉ cần thực hiện đúng **1 lần đọc document cho mỗi kèo**, giảm $80\%$ chi phí đọc Firestore và tăng tốc độ tải trang xuống dưới $0.5$ giây.

---

## 2. BẢN ĐỒ CƠ SỞ DỮ LIỆU CLOUD FIRESTORE

```
/users/{uid}                                (Thông tin người chơi & Skill Profile)
/sessions/{sessionId}                       (Thông tin phòng kèo + tóm tắt các sân)
    ├── /courts/{courtId}                   (Chi tiết sân đấu: courtId là "1" hoặc "2", chứa Roster & Pairs)
    │       └── /requests/{requestId}       (Đơn xin tham gia & Hàng đợi Waitlist của sân)
    └── /matches/{matchId}                  (Lịch thi đấu, tỷ số từng set và thẻ đánh giá)
/ratings/{ratingId}                         (Nhật ký lịch sử biến động điểm Elo & uy tín)
/notifications/{notificationId}             (Thông báo đẩy gửi tới người dùng)
```

---

## 3. CHI TIẾT CÁC BẢNG DỮ LIỆU (COLLECTION SPECIFICATIONS)

---

### 3.1 Collection: `users/{uid}`
Lưu trữ thông tin cá nhân, chỉ số trình độ thể thao và thông số lối chơi của người dùng.

| Tên trường | Kiểu dữ liệu | Bắt buộc | Ví dụ mẫu | Ý nghĩa nghiệp vụ | Quyền ghi |
|---|---|:---:|---|---|---|
| `uid` | `string` | Có | `"usr_nhat_01"` | Mã định danh người dùng từ Firebase Authentication | System |
| `displayName` | `string` | Có | `"Đào Duy Nhật"` | Tên hiển thị công khai trên ứng dụng | Chính mình / Admin |
| `gender` | `"M" \| "F"` | Có | `"M"` | Giới tính sinh học (M: Nam, F: Nữ) để kiểm tra thể thức sân | Chính mình |
| `phoneNumber` | `string` | Không | `"0905123456"` | Số điện thoại liên hệ (chỉ hiển thị khi đã chung sân) | Chính mình |
| `avatarUrl` | `string` | Không | `"https://cdn.../avt.jpg"` | Đường dẫn ảnh đại diện | Chính mình |
| `areaLabel` | `string` | Có | `"Hải Châu"` | Quận/Huyện hoạt động tại Đà Nẵng (chọn từ danh mục) | Chính mình |
| `position` | `"front" \| "back" \| "both"` | Có | `"back"` | Vị trí sở trường: `front` (lưới), `back` (công sau), `both` (linh hoạt) | Chính mình |
| `dominantHand` | `"right" \| "left"` | Có | `"right"` | Tay thuận cầm vợt (right: tay phải, left: tay trái) | Chính mình |
| `selfDeclaredLevel`| `1 \| 2 \| 3 \| 4 \| 5 \| 6`| Có | `3` | Cấp độ tự khai ban đầu từ bài trắc nghiệm Onboarding | Chính mình (1 lần) |
| `role` | `"player" \| "host" \| "admin"` | Có | `"player"` | Quyền hạn tài khoản trong hệ thống | Chỉ Admin SDK |
| `skill` | `map` | Có | `{ ... }` | Đối tượng chứa chỉ số trình độ & phong độ | Chỉ Backend / Admin |
| `skill.rating` | `number` | Có | `1425` | Điểm Elo hiện tại (Sàn 800, Trần 2200) | Chỉ Backend / Admin |
| `skill.matchesPlayed` | `number` | Có | `4` | Tổng số trận đấu hợp lệ đã tham gia | Chỉ Backend / Admin |
| `skill.reliability` | `number` | Có | `100` | Điểm uy tín văn hóa thể thao ($0–100$) | Chỉ Backend / Admin |
| `skill.isProvisional`| `boolean`| Có | `true` | `true` nếu $< 5$ trận (K=40); `false` nếu $\ge 5$ trận (K=24) | Chỉ Backend / Admin |
| `fcmTokens` | `string[]` | Có | `["fcm_tok_..."]` | Danh sách Push Token thiết bị để nhận thông báo | Chính mình |
| `schemaVersion` | `number` | Có | `1` | Phiên bản schema | System |
| `isDeleted` | `boolean` | Có | `false` | Cờ xóa mềm tài khoản | Admin |
| `createdAt` | `Timestamp` | Có | `"2026-11-15T08:00:00Z"`| Thời điểm tạo tài khoản | System |
| `updatedAt` | `Timestamp` | Có | `"2026-11-15T08:00:00Z"`| Thời điểm cập nhật hồ sơ gần nhất | System |

---

### 3.2 Collection: `sessions/{sessionId}`
Lưu trữ thông tin buổi đánh giao lưu do một Host khởi tạo.

| Tên trường | Kiểu dữ liệu | Bắt buộc | Ví dụ mẫu | Ý nghĩa nghiệp vụ | Quyền ghi |
|---|---|:---:|---|---|---|
| `id` | `string` | Có | `"session_kd_01"` | Mã định danh phòng kèo | System |
| `hostId` | `string` | Có | `"usr_nhat_01"` | `uid` của Host tạo kèo | Host tạo |
| `hostName` | `string` | Có | `"Đào Duy Nhật"` | Tên Host (denormalized) để hiển thị nhanh ở sảnh | Host tạo |
| `hostAvatar` | `string` | Không | `"https://cdn.../avt.jpg"`| Avatar Host (denormalized) | Host tạo |
| `hostReputation` | `number` | Có | `98` | Điểm uy tín của Host tại thời điểm tạo kèo | Host tạo |
| `title` | `string` | Có | `"Kèo giao lưu tối T4 Sân Kỳ Đồng"` | Tiêu đề buổi đánh | Host |
| `venueName` | `string` | Có | `"Sân Cầu Lông Kỳ Đồng"` | Tên cụm sân thi đấu | Host |
| `address` | `string` | Có | `"49 Kỳ Đồng, Thanh Khê, Đà Nẵng"` | Địa chỉ cụ thể của sân | Host |
| `district` | `string` | Có | `"Thanh Khê"` | Quận/Huyện tại Đà Nẵng (dùng để lọc tìm kiếm) | Host |
| `startsAt` | `Timestamp` | Có | `"2026-11-18T18:00:00Z"`| Giờ bắt đầu thi đấu | Host |
| `durationMin` | `number` | Có | `120` | Thời lượng buổi đánh (phút, ví dụ 120 = 2 tiếng) | Host |
| `costPerPlayer` | `number` | Có | `50000` | Tiền sân chia sẻ ước tính (VNĐ/người) | Host |
| `status` | `string` | Có | `"open"` | Trạng thái: `open`, `full`, `in_progress`, `completed`, `cancelled` | Host / System |
| `courtCount` | `1 \| 2` | Có | `1` | Số lượng sân thuộc kèo (Tối đa 2 sân) | Host |
| `courtSummaries` | `map[]` | Có | `[ { ... } ]` | Tóm tắt thông số các sân để vẽ danh sách sảnh chờ | Host / Transaction |
| `openSlotsTotal` | `number` | Có | `2` | Tổng số suất tuyển vãng lai còn trống của cả kèo | Host / Transaction |
| `vietQrInfo` | `map` | Không | `{ bankId: "MB", ... }`| Thông tin tài khoản ngân hàng của Host tạo mã VietQR | Host |
| `schemaVersion` | `number` | Có | `1` | Phiên bản schema | System |
| `isDeleted` | `boolean` | Có | `false` | Cờ xóa mềm | Host / Admin |
| `createdAt` | `Timestamp` | Có | `"2026-11-15T09:00:00Z"`| Thời điểm tạo phòng kèo | System |
| `updatedAt` | `Timestamp` | Có | `"2026-11-15T09:00:00Z"`| Thời điểm cập nhật phòng kèo | System |

---

### 3.3 Subcollection: `sessions/{sessionId}/courts/{courtId}`
Lưu trữ chi tiết sân đấu, danh sách vận động viên trong sân (`roster`) và các cặp đấu cố định (`pairs`). `courtId` có giá trị là `"1"` hoặc `"2"`.

> [!IMPORTANT]
> **QUYẾT ĐỊNH KIẾN TRÚC: ROSTER NẰM TRONG DOCUMENT SÂN**  
> `roster` và `pairs` được lưu trực tiếp dưới dạng Map/Array trong document `courts/{courtId}` thay vì tách subcollection vì:
> 1. Mỗi sân chỉ có tối đa **8 người** (`COURT_CAPACITY`). Kích thước document chỉ khoảng $1.5\text{ KB}$, chỉ chiếm **0.15%** giới hạn $1\text{ MB}$ của Firestore.
> 2. Cho phép **Firestore Transaction nguyên tử**: Đọc sân $\to$ kiểm tra số suất và giới tính $\to$ ghi nhận thành viên mới $\to$ tăng `version` trong đúng 1 transaction duy nhất mà không bị race-condition.

| Tên trường | Kiểu dữ liệu | Bắt buộc | Ví dụ mẫu | Ý nghĩa nghiệp vụ | Quyền ghi |
|---|---|:---:|---|---|---|
| `id` | `string` | Có | `"1"` | Mã định danh sân (`"1"` hoặc `"2"`) | System |
| `sessionId` | `string` | Có | `"session_kd_01"` | Mã phòng kèo cha | System |
| `courtNumber` | `1 \| 2` | Có | `1` | Số thứ tự sân | Host |
| `category` | `"men" \| "women" \| "mixed"` | Có | `"mixed"` | Thể thức thi đấu: Đôi nam (`men`), Đôi nữ (`women`), Đôi nam nữ (`mixed`) | Host |
| `levelMin` | `number` | Có | `2` | Cấp độ tối thiểu nhận vào sân (1–6) | Host |
| `levelMax` | `number` | Có | `4` | Cấp độ tối đa nhận vào sân (1–6) | Host |
| `minReliability` | `number` | Có | `50` | Điểm uy tín tối thiểu để được xin vào (mặc định: 50) | Host |
| `pairingMode` | `"auto" \| "rotate"` | Có | `"auto"` | Chế độ chia cặp: `auto` (cân bằng Elo) hoặc `rotate` (xoay vòng) | Host |
| `recruitOpen` | `boolean` | Có | `true` | Công tắc mở tuyển vãng lai của Host | Host |
| `roster` | `map` | Có | `{ [memberId]: { ... } }`| Danh sách thành viên trong sân (Tối đa 8 người) | Transaction |
| `roster.*.type` | `"core" \| "recruit"` | Có | `"core"` | Vai trò: `core` (mặc định) hoặc `recruit` (vãng lai đã duyệt) | Transaction |
| `roster.*.displayName`| `string` | Có | `"Nguyễn Văn A"` | Tên hiển thị người chơi | Transaction |
| `roster.*.gender` | `"M" \| "F"` | Có | `"M"` | Giới tính (phải khớp ràng buộc thể thức sân) | Transaction |
| `roster.*.rating` | `number` | Có | `1450` | Điểm Elo chụp tại thời điểm vào sân | Transaction |
| `roster.*.level` | `number` | Có | `3` | Cấp độ tại thời điểm vào sân | Transaction |
| `roster.*.position` | `"front" \| "back" \| "both"`| Có | `"back"` | Vị trí sở trường | Transaction |
| `roster.*.dominantHand`| `"right" \| "left"` | Có | `"right"` | Tay thuận | Transaction |
| `roster.*.isGhost` | `boolean` | Có | `false` | `true` nếu là người chơi chưa có app (do host nhập tay) | Transaction |
| `roster.*.checkedIn`| `boolean` | Có | `true` | Trạng thái đã có mặt tại sân hay chưa | Host |
| `roster.*.joinedAt` | `Timestamp` | Có | `"2026-11-15T09:30:00Z"`| Thời điểm vào sân | Transaction |
| `pairs` | `map[]` | Có | `[ { id, a, b, source } ]`| Danh sách cặp khóa cố định (nguồn `self` hoặc `host`) | Host |
| `version` | `number` | Có | `5` | Số nguyên tăng dần để kiểm soát khóa lạc quan (Optimistic Lock) | Transaction |
| `updatedAt` | `Timestamp` | Có | `"2026-11-15T10:00:00Z"`| Thời điểm cập nhật trạng thái sân gần nhất | Transaction |

---

### 3.4 Subcollection: `sessions/{sessionId}/courts/{courtId}/requests/{requestId}`
Lưu trữ các đơn xin đặt suất vãng lai và danh sách hàng đợi dự bị (Waitlist).

| Tên trường | Kiểu dữ liệu | Bắt buộc | Ví dụ mẫu | Ý nghĩa nghiệp vụ | Quyền ghi |
|---|---|:---:|---|---|---|
| `id` | `string` | Có | `"usr_dat_02"` | Thường đặt bằng `uid` của người gửi yêu cầu | System |
| `courtId` | `string` | Có | `"1"` | Mã sân nộp đơn | System |
| `sessionId` | `string` | Có | `"session_kd_01"` | Mã phòng kèo | System |
| `userId` | `string` | Có | `"usr_dat_02"` | `uid` của người chơi nộp đơn | Người chơi tạo |
| `status` | `string` | Có | `"requested"` | Trạng thái: `requested`, `waitlist`, `confirmed`, `declined`, `withdrawn`, `cancelled` | Người chơi / Host / System |
| `snapshot` | `map` | Có | `{ displayName, gender, rating, level, position, reliability }` | Ảnh chụp thông tin người chơi tại thời điểm xin vào | Người chơi tạo |
| `note` | `string` | Không | `"Mình đánh công tốt, xin giao lưu nhé"` | Lời nhắn gửi tới Host | Người chơi |
| `waitlistPosition` | `number` | Không | `1` | Thứ tự trong hàng đợi dự bị (1, 2, 3...) nếu sân đã hết suất | System |
| `createdAt` | `Timestamp` | Có | `"2026-11-15T10:15:00Z"`| Thời điểm nộp đơn | System |
| `decidedAt` | `Timestamp` | Không | `"2026-11-15T10:30:00Z"`| Thời điểm Host duyệt hoặc từ chối | Host |

---

### 3.5 Subcollection: `sessions/{sessionId}/matches/{matchId}`
Lưu trữ thông tin các set đấu, tỷ số và thẻ đánh giá sau trận.

| Tên trường | Kiểu dữ liệu | Bắt buộc | Ví dụ mẫu | Ý nghĩa nghiệp vụ | Quyền ghi |
|---|---|:---:|---|---|---|
| `id` | `string` | Có | `"match_01"` | Mã set đấu | System |
| `sessionId` | `string` | Có | `"session_kd_01"` | Mã phòng kèo | System |
| `courtId` | `string` | Có | `"1"` | Mã sân đấu | Host |
| `index` | `number` | Có | `1` | Thứ tự set đấu trong buổi đánh (1, 2, 3...) | Host |
| `teamA` | `string[2]` | Có | `["usr_nhat_01", "usr_dat_02"]` | Cặp đấu Đội A (mảng 2 `memberId`) | Host / System |
| `teamB` | `string[2]` | Có | `["usr_minh_03", "ghost_tuan_01"]` | Cặp đấu Đội B (mảng 2 `memberId`) | Host / System |
| `sets` | `map[]` | Có | `[ { setNumber: 1, scoreA: 21, scoreB: 18 } ]` | Tỷ số từng set đấu | Host |
| `status` | `string` | Có | `"confirmed"` | Trạng thái: `planned`, `playing`, `finished`, `confirmed` | Host |
| `confirmedBy` | `string` | Không | `"usr_nhat_01"` | `uid` của Host xác nhận kết quả | Host |
| `ratingProcessed` | `boolean` | Có | `false` | Cờ chỉ báo đã cập nhật Elo (chỉ chuyển `false` $\to$ `true`) | Backend / Host |
| `cards` | `map[]` | Không | `[ { fromUserId, toUserId, tag } ]` | Danh sách thẻ đánh giá bạn chơi sau trận | Người chơi |
| `createdAt` | `Timestamp` | Có | `"2026-11-18T18:30:00Z"`| Thời điểm bắt đầu set đấu | System |
| `updatedAt` | `Timestamp` | Có | `"2026-11-18T18:50:00Z"`| Thời điểm kết thúc và lưu điểm | System |

---

### 3.6 Collection: `ratings/{ratingId}`
Lịch sử biến động điểm Elo và điểm uy tín của từng người chơi sau mỗi sự kiện.

| Tên trường | Kiểu dữ liệu | Bắt buộc | Ví dụ mẫu | Ý nghĩa nghiệp vụ | Quyền ghi |
|---|---|:---:|---|---|---|
| `id` | `string` | Có | `"rate_log_001"` | Mã định danh bản ghi | System |
| `userId` | `string` | Có | `"usr_nhat_01"` | `uid` người chơi được cập nhật điểm | Backend / Admin |
| `matchId` | `string` | Không | `"match_01"` | Mã trận đấu kích hoạt biến động (nếu có) | Backend / Admin |
| `sessionId` | `string` | Không | `"session_kd_01"` | Mã phòng kèo | Backend / Admin |
| `oldRating` | `number` | Có | `1425` | Điểm Elo trước khi tính | Backend / Admin |
| `newRating` | `number` | Có | `1441` | Điểm Elo mới sau khi tính | Backend / Admin |
| `delta` | `number` | Có | `16` | Số điểm tăng/giảm (+16) | Backend / Admin |
| `kFactor` | `number` | Có | `40` | Hệ số K áp dụng (40 hoặc 24) | Backend / Admin |
| `oldReliability` | `number` | Có | `100` | Điểm uy tín trước đó | Backend / Admin |
| `newReliability` | `number` | Có | `100` | Điểm uy tín mới | Backend / Admin |
| `reason` | `string` | Có | `"match_result"` | Lý do: `match_result`, `cancel_penalty`, `attendance_reward`, `admin_adjustment` | Backend / Admin |
| `createdAt` | `Timestamp` | Có | `"2026-11-18T19:00:00Z"`| Thời điểm ghi nhận biến động | System |

---

### 3.7 Collection: `notifications/{notificationId}`
Lưu trữ thông báo đẩy gửi tới thiết bị của người dùng.

| Tên trường | Kiểu dữ liệu | Bắt buộc | Ví dụ mẫu | Ý nghĩa nghiệp vụ | Quyền ghi |
|---|---|:---:|---|---|---|
| `id` | `string` | Có | `"notif_001"` | Mã thông báo | System |
| `userId` | `string` | Có | `"usr_dat_02"` | `uid` người nhận thông báo | System / Backend |
| `type` | `string` | Có | `"request_approved"` | Loại: `request_received`, `request_approved`, `waitlist_promoted`, `match_reminder`, `reputation_penalty` | System / Backend |
| `title` | `string` | Có | `"Đơn xin tham gia đã được duyệt!"` | Tiêu đề thông báo | System / Backend |
| `body` | `string` | Có | `"Host Nhật đã duyệt bạn vào Sân 1 - Sân Kỳ Đồng."` | Nội dung chi tiết thông báo | System / Backend |
| `data` | `map` | Không | `{ sessionId: "session_kd_01", courtId: "1" }` | Payload điều hướng màn hình khi người dùng bấm vào | System / Backend |
| `read` | `boolean` | Có | `false` | Trạng thái đã đọc hay chưa | Chính mình |
| `createdAt` | `Timestamp` | Có | `"2026-11-15T10:30:00Z"`| Thời điểm gửi thông báo | System |

---

## 4. BẢNG TRUY VẾT DỮ LIỆU ĐẾN YÊU CẦU CHỨC NĂNG (DATA TO FR TRACEABILITY)

Bảng đối chiếu đảm bảo mọi trường dữ liệu đều phục vụ một hoặc nhiều Yêu cầu chức năng trong [docs/07-srs.md](file:///d:/QLDAPM/docs/07-srs.md):

| Nhóm Dữ liệu / Collection | Các trường dữ liệu chính | Mã Yêu cầu Chức năng (FR) |
|---|---|---|
| `users` | `displayName`, `gender`, `areaLabel`, `phoneNumber` | FR-01, FR-03, FR-04 |
| `users` | `selfDeclaredLevel`, `skill.rating`, `skill.isProvisional` | FR-02, FR-04, FR-05 |
| `users` | `dominantHand`, `position` (PlayStyle) | FR-03, FR-07 (Partner Finder bù trừ) |
| `users` | `skill.reliability` (Điểm uy tín) | FR-04, FR-21, FR-27 |
| `users` | `role` (player, host, admin) | FR-28, FR-29 |
| `sessions` | `title`, `venueName`, `address`, `district`, `startsAt`, `durationMin` | FR-14, FR-17 |
| `sessions` | `costPerPlayer`, `vietQrInfo` | FR-14, Giả định A8 (VietQR) |
| `sessions` | `courtCount`, `courtSummaries`, `openSlotsTotal` | FR-12 (2 sân), FR-16 (Công thức slot), FR-17 (Lọc) |
| `courts` | `category` (men, women, mixed), `levelMin`, `levelMax`, `minReliability` | FR-14, FR-18 (Kiểm tra điều kiện đặt suất) |
| `courts` | `roster` (`core`, `recruit`, `isGhost`, `checkedIn`) | FR-15 (Core & Ghost), FR-16 (Suất tuyển), FR-08 (Chia cặp) |
| `courts` | `pairs` (`source: "self" \| "host"`) | FR-09 (Cặp khóa cố định) |
| `courts` | `version` | NFR-04, NFR-06 (Chống race-condition Transaction) |
| `requests` | `status` (`requested`, `waitlist`, `confirmed`, `cancelled`), `snapshot` | FR-18 (Xin tham gia), FR-19 (Host duyệt), FR-20 (Waitlist) |
| `matches` | `courtId`, `index`, `teamA`, `teamB`, `status` | FR-08 (Chia cặp), FR-10 (Xoay vòng người nghỉ) |
| `matches` | `sets` (`scoreA`, `scoreB`) | FR-22 (Nhập tỷ số tại sân) |
| `matches` | `cards` (`tag: "correct_level" \| "plays_better" \| "good_attitude"`) | FR-23 (Chấm thẻ sau trận 5 giây) |
| `matches` | `ratingProcessed` | FR-24 (Cập nhật Elo an toàn) |
| `ratings` | `oldRating`, `newRating`, `delta`, `kFactor`, `reason` | FR-24, FR-25 (Lịch sử đấu và biến động Elo) |
| `notifications` | `type`, `title`, `body`, `data`, `read` | FR-35 (Push Notification) |

---

## 5. LỊCH SỬ THAY ĐỔI & NHẬT KÝ BAN HÀNH (CHANGELOG)

- **2026-11-15 (v1.0 - Gốc):** Ban hành bản chính thức Data Contract đầu tiên phục vụ Sprint 1–3 (TV2 dựng mock data và UI).
