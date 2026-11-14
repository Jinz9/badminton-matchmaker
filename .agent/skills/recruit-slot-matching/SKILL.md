---
name: recruit-slot-matching
description: Tính số suất tuyển vãng lai còn lại của một sân, kiểm tra người chơi có đủ điều kiện đặt suất không (giới tính theo nội dung đôi nam / đôi nữ / đôi nam nữ, dải trình độ, uy tín), xử lý duyệt, từ chối, hủy, danh sách dự bị và đôn người, và chấm điểm độ phù hợp để gợi ý kèo cho người chơi hoặc gợi ý người cho host. Hãy dùng skill này bất cứ khi nào người dùng nhắc đến tuyển người, vãng lai, đặt suất, xin tham gia, duyệt người, còn mấy chỗ, hết chỗ, waitlist, dự bị, gợi ý kèo hoặc ghép đồng đội, kể cả khi họ chỉ nói "người chơi bấm tham gia thì sao". Đọc kèm badminton-domain-rules.
---

# Tuyển vãng lai và đặt suất

Đây là phần "ghép đồng đội theo độ phù hợp" của đồ án. Tất cả hàm viết dưới dạng **hàm thuần** trong
`src/domain/recruit/`, không gọi Firebase bên trong, để test được và dùng lại được khi offline.

## 1. Tính suất còn lại

```ts
import { RULES } from "@/config/rules";

export function computeSlots(coreCount: number, recruitConfirmed: number) {
  const total = Math.max(0, Math.min(RULES.MAX_RECRUITS_PER_COURT, RULES.COURT_CAPACITY - coreCount));
  const open = total - recruitConfirmed;
  return { total, open: Math.max(0, open), overbooked: open < 0 };
}
```

- `overbooked = true` là trạng thái lỗi dữ liệu (xem giả định A4). Không được xảy ra nếu mọi thao tác đi qua transaction.
- Sân chỉ nhận đăng ký mới khi `recruitOpen && open > 0` và kèo đang `open`.
- Sân có dưới `MIN_CORE_PER_COURT` người mặc định: không cho bật `recruitOpen` (giả định A1).

## 2. Kiểm tra đủ điều kiện

Chạy theo thứ tự, dừng ở lỗi đầu tiên và trả **mã lỗi** để UI hiển thị lý do bằng tiếng Việt.

| Thứ tự | Mã lỗi | Điều kiện |
|---|---|---|
| 1 | `SESSION_CLOSED` | Kèo phải ở trạng thái `open` |
| 2 | `RECRUIT_CLOSED` | Sân đang mở tuyển |
| 3 | `ALREADY_IN_SESSION` | Người chơi chưa ở sân nào của kèo này (R7) |
| 4 | `GENDER_NOT_ALLOWED` | Đúng luật R6 |
| 5 | `LEVEL_OUT_OF_RANGE` | Rating nằm trong dải trình độ của sân |
| 6 | `RELIABILITY_TOO_LOW` | `reliability >= minReliability` |
| 7 | `NO_SLOT` | Còn suất. **Nếu chỉ lỗi này thì cho vào dự bị** thay vì từ chối |

Lỗi 4 cần chú ý nhất:

```ts
export function genderAllowed(category: Category, gender: "M" | "F", roster: Member[]): boolean {
  if (category === "men") return gender === "M";
  if (category === "women") return gender === "F";
  const coreG = roster.filter(m => m.type === "core" && m.gender === gender).length;
  const nowG = roster.filter(m => m.gender === gender).length;
  return nowG + 1 <= Math.max(4, coreG);
}
```

Ví dụ: đôi nam nữ, nhóm mặc định 3 nam + 1 nữ → còn tối đa 1 nam và 3 nữ. Nhóm mặc định 5 nam + 1 nữ → chỉ còn nhận nữ.
Hiển thị trên thẻ kèo: "Còn 2 suất: 1 nam, 1 nữ" (tính bằng cách thử `genderAllowed` cho từng giới).

## 3. Vòng đời yêu cầu

```
requested ──duyệt──▶ confirmed ──hủy──▶ cancelled
    │                    
    ├──từ chối──▶ declined
    └──hết suất──▶ waitlist ──có suất trống──▶ requested/confirmed (host duyệt)
```

- Người chơi gửi yêu cầu: tạo `requests/{uid}` với ảnh chụp (snapshot) giới tính, rating, vị trí, uy tín tại thời điểm đó.
- Host duyệt: **một transaction duy nhất** đọc tài liệu sân, kiểm tra lại toàn bộ mục 2, rồi thêm người vào `roster`
  và cập nhật `courtSummaries` của kèo. Không duyệt dựa trên số liệu đã đọc từ trước.
- Khi có người rời hoặc host giảm người mặc định: duyệt vào chỗ trống người đứng đầu dự bị **vẫn còn đủ điều kiện**
  (giới tính cho phép có thể đã thay đổi). Gửi thông báo cho người được đôn (FCM) và để host xác nhận.
- Người đã `confirmed` hủy: tính phạt uy tín theo `badminton-rating`, rồi chạy bước đôn dự bị.
- Đóng kèo khi sát giờ: yêu cầu còn `requested` hoặc `waitlist` chuyển thành `declined`, báo cho người chơi.

## 4. Gợi ý độ phù hợp

**Cho host** (xếp hạng người xin tham gia):

```
fit = levelScore (0-40) + positionScore (0-25) + reliabilityScore (0-25) + earlyScore (0-10)
levelScore       = 40 * (1 - |rating - avgRatingCuaNhom| / 200), kẹp 0..40
positionScore    = 25 nếu vị trí người xin bù đúng vị trí nhóm đang thiếu (front/back),
                   12 nếu "both", 0 nếu trùng vị trí nhóm đã thừa
reliabilityScore = reliability / 100 * 25
earlyScore       = 10 cho người gửi sớm nhất, giảm dần theo thứ tự
```

**Cho người chơi** (danh sách kèo gợi ý): lọc cứng theo mục 2, rồi sắp xếp theo thời gian bắt đầu,
cùng khu vực trước, rồi theo `levelScore`. Hiện lý do vì sao kèo hợp ("trình độ khớp, nhóm đang thiếu người đánh lưới").

Các trọng số đặt trong `src/config/matchingConfig.ts`. Đừng tuyên bố đây là thuật toán tối ưu trong báo cáo, đây là heuristic.

## 5. Sự kiện thông báo (FCM)

`request_received` (cho host), `request_confirmed`, `request_declined`, `waitlist_promoted` (cho người chơi),
`court_full` (cho host), `reminder_1h` (cho tất cả người đã `confirmed`).

## 6. Test tối thiểu

Xem bảng đầy đủ trong skill `badminton-testing`. Bắt buộc có: `computeSlots` cho người mặc định từ 4 đến 8,
`genderAllowed` với nhóm mặc định lệch giới, hai thao tác duyệt chồng nhau cho suất cuối cùng (chỉ một thành công),
và đôn dự bị khi người đứng đầu không còn hợp giới tính.
