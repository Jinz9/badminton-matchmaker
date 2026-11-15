# ĐẶC TẢ GIAO DIỆN TRUY CẬP DỮ LIỆU (REPOSITORY INTERFACES SPECIFICATION)

**Dự án:** Hệ thống ghép đội và cân bằng kèo cầu lông (Mobile App)  
**Tài liệu:** `docs/api/repository-interfaces.md`  
**Phiên bản:** 1.0 (Ban hành Tuần 3)  
**Tác giả:** Đào Duy Nhật (TV1 - PM & Backend)  
**Tài liệu liên quan:** `src/domain/repositories.ts`, `docs/api/data-contract.md`  

---

## 1. MỤC ĐÍCH & KIẾN TRÚC REPOSITORY (OVERVIEW)

Để TV2 có thể phát triển giao diện Mobile (Expo) hoàn toàn độc lập với việc kết nối backend Firebase thật, hệ thống áp dụng kiến trúc **Repository Pattern**:
- Mọi màn hình UI tuyệt đối không gọi trực tiếp các lệnh SDK Firebase (`doc()`, `getDoc()`, `setDoc()`) rải rác trong component.
- UI chỉ tương tác thông qua các interface trong `src/domain/repositories.ts`.
- TV2 có thể cắm `MockRepository` (đọc dữ liệu từ `docs/api/mock-samples/`) trong giai đoạn dựng UI, sau đó chuyển sang `FirebaseRepository` mà không cần sửa đổi bất kỳ dòng code giao diện nào!

---

## 2. BẢNG MÃ LỖI CHUẨN TOÀN HỆ THỐNG (ERROR CODES)

Mọi phương thức khi gặp lỗi nghiệp vụ sẽ ném ngoại lệ (`throw new DomainError(code, message)`):

| Mã lỗi (Error Code) | Tên lỗi & Ý nghĩa | Cách xử lý trên UI |
|---|---|---|
| `SLOT_FULL` | Sân đã đủ suất tuyển vãng lai chính thức. | Gợi ý người dùng đăng ký vào Hàng đợi dự bị (Waitlist). |
| `GENDER_MISMATCH` | Giới tính không khớp với thể thức sân (ví dụ: Nam xin vào sân Đôi nữ). | Hiển thị thông báo lỗi màu đỏ, chặn bấm xin tham gia. |
| `RATING_OUT_OF_RANGE` | Trình độ lệch khỏi dải sân yêu cầu. | Bật pop-up cảnh báo nhưng vẫn cho nộp đơn nếu người chơi muốn. |
| `LOW_REPUTATION` | Điểm uy tín của người chơi $< 50$ (do tiền sử bùng kèo). | Chặn nộp đơn, thông báo liên hệ Admin để giải quyết. |
| `ALREADY_JOINED` | Người chơi đã có tên trong sân này hoặc sân khác cùng giờ. | Báo lỗi trùng lặp lịch thi đấu. |
| `PAIR_LOCKED` | Cặp đấu đã bị khóa cố định không được tách. | Yêu cầu Host bấm mở khóa trước khi đổi người thủ công. |
| `SESSION_CLOSED` | Kèo đã bị hủy hoặc đã kết thúc. | Không cho phép thực hiện thao tác. |
| `CONCURRENCY_CONFLICT`| Dữ liệu phiên bản sân vừa thay đổi trên máy khác. | Tải lại dữ liệu mới nhất và yêu cầu Host thao tác lại. |

---

## 3. ĐẶC TẢ CHI TIẾT CÁC REPOSITORY INTERFACES

---

### 3.1 `ISessionRepository` - Quản lý Kèo đấu

#### 1. `listSessions(filter?: SessionFilterOptions): Promise<SessionDoc[]>`
- **Mục đích:** Lấy danh sách các kèo mở tuyển cho màn hình Sảnh chờ (Lobby).
- **Đầu vào:**
  - `district` *(tùy chọn)*: Lọc theo Quận/Huyện tại Đà Nẵng (Hải Châu, Thanh Khê,...).
  - `category` *(tùy chọn)*: Thể thức sân (`men`, `women`, `mixed`).
  - `onlyOpenSlots` *(tùy chọn)*: `true` nếu chỉ tìm kèo còn chỗ trống.
- **Đầu ra:** Mảng `SessionDoc[]` sắp xếp theo thời gian bắt đầu `startsAt ASC`.

#### 2. `createSession(sessionData): Promise<string>`
- **Mục đích:** Host tạo một phòng kèo mới (1 hoặc 2 sân).
- **Đầu vào:** Đối tượng `SessionDoc` (chưa có id, createdAt, updatedAt).
- **Đầu ra:** `sessionId` vừa được tạo.

#### 3. `cancelSession(sessionId: string, reason: string): Promise<void>`
- **Mục đích:** Host hủy toàn bộ buổi đánh do sự cố bất khả kháng.
- **Xử lý:** Chuyển trạng thái `status: "cancelled"`, gửi thông báo cho toàn bộ người chơi trong sân.

---

### 3.2 `ICourtRepository` - Quản lý Sân & Danh sách vận động viên

#### 1. `getCourt(sessionId: string, courtId: string): Promise<CourtDoc | null>`
- **Mục đích:** Lấy thông tin chi tiết một sân (chứa `roster` và `pairs`).
- **Đầu ra:** Đối tượng `CourtDoc` hoặc `null` nếu không tìm thấy.

#### 2. `addCoreMember(sessionId, courtId, member): Promise<void>`
- **Mục đích:** Host thêm người quen có tài khoản app vào danh sách mặc định.
- **Kiểm tra luật:** Tổng số người $\le 8$, số vãng lai đã tuyển không bị vượt quá giới hạn.

#### 3. `addGhostMember(sessionId, courtId, ghostData): Promise<string>`
- **Mục đích:** Host nhập tên, giới tính và trình độ ước lượng cho người chưa cài app.
- **Đầu ra:** `memberId` tự sinh (dạng `ghost_<timestamp>`).

#### 4. `updateLockedPairs(sessionId, courtId, pairs): Promise<void>`
- **Mục đích:** Lưu danh sách các cặp đấu cố định do Host hoặc người chơi tự bắt.

---

### 3.3 `IRequestRepository` - Đặt suất & Xử lý Hàng đợi Waitlist

#### 1. `submitJoinRequest(sessionId, courtId, userId, note?): Promise<JoinRequestResult>`
- **Mục đích:** Người chơi vãng lai bấm "Xin tham gia" một sân.
- **Đầu ra:**
  - Nếu sân còn suất: `{ status: "confirmed", message: "Đã gửi yêu cầu tới Host" }`.
  - Nếu sân đã hết suất: `{ status: "waitlist", waitlistPosition: 2, message: "Đã đưa vào hàng đợi dự bị số 2" }`.
- **Ném lỗi:** `GENDER_MISMATCH`, `LOW_REPUTATION`, `ALREADY_JOINED`.

#### 2. `reviewRequest(sessionId, courtId, requestId, action): Promise<void>`
- **Mục đích:** Host duyệt (`action: "approve"`) hoặc từ chối (`action: "decline"`).
- **Xử lý Transaction:** Khi duyệt, chuyển người chơi vào `roster` của sân, giảm suất tuyển của kèo.

#### 3. `cancelParticipation(sessionId, courtId, userId): Promise<{ penalty: number, promotedUser?: string }>`
- **Mục đích:** Người chơi đã được duyệt bấm "Hủy tham gia".
- **Xử lý:**
  - Tính phạt uy tín: Hủy trước 2 tiếng: phạt 5 điểm; Hủy sát giờ: phạt 20 điểm.
  - Tự động quét `waitlist` lấy người dự bị đầu tiên đôn lên thay thế (`promotedUser`).

---

### 3.4 `IMatchRepository` - Ghi nhận Tỷ số & Đánh giá

#### 1. `saveMatchScore(matchId: string, sets: MatchSetScore[]): Promise<void>`
- **Mục đích:** Nhập tỷ số các set đấu tại sân (hoạt động được khi mất mạng).

#### 2. `confirmMatchResult(matchId, hostId, cards?): Promise<void>`
- **Mục đích:** Host xác nhận kết thúc set đấu và gửi kèm các thẻ đánh giá bạn chơi (`correct_level`, `plays_better`, `good_attitude`).
