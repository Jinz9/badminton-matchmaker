# Yêu cầu & Ghi nhận chênh lệch hợp đồng Backend từ TV2 (Mobile App)

Tài liệu này tổng hợp các điểm chưa khớp hoặc còn thiếu ở backend (`functions/`, `firestore.rules`, `src/domain/*/transactions.ts`) phát hiện trong quá trình nối `FirebaseRepository` và `FirebaseAuthService` ở nhánh `feat/firebase-integration`. **TV2 không tự ý sửa `docs/api/*.md` hay `firestore.rules` của TV1.**

---

## 1. Cloud Functions Callable chưa được export trong `functions/src/index.ts`

Hiện tại `functions/src/index.ts` mới chỉ có endpoint HTTP `healthCheck` (`onRequest`). Các nghiệp vụ ghi vào collection nhạy cảm bị `firestore.rules` chặn từ client nên cần TV1 triển khai dưới dạng `onCall` (`httpsCallable`) trong `functions/src/index.ts`:

1. **`finishMatch`** (`confirmMatchResult(matchId, hostId, cards)`):
   - `firestore.rules` chặn hoàn toàn client ghi `/ratings/{ratingId}` (`allow write: if false`), chặn client sửa `users/{uid}.skill` (`request.resource.data.skill == resource.data.skill`), và chặn Host đổi `matches/{matchId}.ratingProcessed` sang `true`.
   - `FirebaseRepository.confirmMatchResult` đã gọi `httpsCallable(functions, "finishMatch")({ matchId, hostId, cards })`. Nếu chưa deploy `finishMatch`, app hiện thông báo thân thiện và giữ tỷ số đã lưu.

2. **`cancelParticipation`** (`cancelParticipation(sessionId, courtId, userId)`):
   - Cần xử lý atomic trên server: trừ điểm uy tín (`users/{uid}.skill.reliability`), ghi nhật ký `/ratings`, tự động đôn người đầu tiên trong `waitlist`, và tạo thông báo `/notifications` (client bị `allow create: if false` trên `/notifications`).
   - Hiện `FirebaseRepository.cancelParticipation` thử gọi `httpsCallable(functions, "cancelParticipation")`; nếu chưa có (`functions/not-found`), app fallback sang tự xóa `uid` khỏi `courts/{courtId}.roster` (được `firestore.rules` lines 158-165 cho phép).

3. **`reviewRequest` / thông báo đẩy**:
   - `firestore.rules` cấm client tạo `/notifications/{notificationId}` (`allow create: if false`). Cần trigger/callable tạo thông báo khi Host duyệt/từ chối đơn hoặc đôn Waitlist.

---

## 2. Khác biệt đường dẫn Collection giữa `src/domain/*/transactions.ts` và `firestore.rules`

Trong lúc đối chiếu code TV1:

| Nghiệp vụ | Đường dẫn trong `src/domain/*/transactions.ts` | Đường dẫn trong `firestore.rules` |
|---|---|---|
| Trận đấu (`matches`) | Top-level `matches/{matchId}` (`elo/transactions.ts`) | Subcollection `/sessions/{sessionId}/matches/{matchId}` |
| Đơn xin vào sân (`requests`) | Top-level `requests/{sessionId}_{courtId}_{uid}` (`recruit/transactions.ts`) | Subcollection `/sessions/{sessionId}/courts/{courtId}/requests/{uid}` |

**Cách `FirebaseRepository` đang xử lý:** `FirebaseRepository` đi theo đúng `firestore.rules` (subcollection dưới `/sessions/{sessionId}/...`). Đề nghị TV1 đồng bộ lại `src/domain/elo/transactions.ts` và `src/domain/recruit/transactions.ts` nếu dùng cho Admin SDK / Cloud Functions.

---

## 3. Collection Group Query trên `matches` (`getUserMatches`)

- `FirebaseRepository.getUserMatches(userId)` và `subscribe("matches" | "courts" | "requests", ...)` dùng `collectionGroup(db, "matches")`.
- Trong `firestore.rules`, rule hiện viết theo đường dẫn tường minh `/sessions/{sessionId}/matches/{matchId}` thay vì `match /{path=**}/matches/{matchId}`. Khi chạy trên Firestore thật/Emulator, `collectionGroup("matches")` có thể bị `permission-denied` nếu thiếu rule `match /{path=**}/matches/{matchId} { allow read: if isAuthenticated(); }` (và index tương ứng).
- TV2 đã bọc error handler để `onSnapshot` không làm crash UI, nhưng để màn Lịch sử & Đồng đội ăn ý tải dữ liệu thật trên Firestore, nhờ TV1 bổ sung rule collectionGroup cho `matches` (hoặc cung cấp callable/denormalized query).

---

## 4. Xác thực & Quên mật khẩu (ADR-002)

- `FirebaseAuthService` đã nối Email/Mật khẩu qua `firebase/auth` (hỗ trợ Auth Emulator cổng `9099` và lưu phiên `AsyncStorage`).
- `sendResetCode(email)` gọi `sendPasswordResetEmail(auth, email)` của Firebase (gửi link đặt lại mật khẩu qua email thay vì mã OTP 6 số). Khi TV1/nhóm chốt Google Sign-In (`expo-auth-session`) hoặc cơ chế OTP qua Cloud Function theo ADR-002, sẽ cập nhật thêm vào `FirebaseAuthService`.

