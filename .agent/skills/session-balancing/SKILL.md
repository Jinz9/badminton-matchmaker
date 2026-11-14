---
name: session-balancing
description: Xếp cặp và lập lịch lượt đánh đôi cho MỘT sân có 4–8 người (người mặc định + vãng lai đã được duyệt), có hỗ trợ cặp khóa do người mặc định tự bắt cặp hoặc do host xếp trước, cặp tự động cân bằng, người nghỉ xoay vòng, và ràng buộc đôi nam / đôi nữ / đôi nam nữ. Hãy dùng skill này bất cứ khi nào người dùng nhắc đến chia cặp, chia kèo, xếp cặp, bắt cặp, ghép đôi, cân kèo, lượt đánh, xoay vòng, người nghỉ, lịch đấu trong sân, hoặc kéo đổi người giữa các cặp, kể cả khi họ chỉ nói "chia cho công bằng". Đọc kèm badminton-domain-rules.
---

# Xếp cặp và lịch đánh cho một sân

**Đơn vị là một sân, không phải cả kèo.** Một sân có tối đa 8 người, mỗi trận 4 người đánh, những người còn lại nghỉ.
Kèo có 2 sân thì chạy hàm này hai lần, độc lập. Không đổi người giữa hai sân trong MVP.

Viết thành **hàm thuần** trong `src/domain/balancing/`, không import Firebase hay React Native.
Dữ liệu lấy từ cache cục bộ của buổi đánh hiện tại nên chia được cả khi mất mạng. Phản hồi dưới 1 giây (với n ≤ 8 là dư sức).

## 1. Kiểu dữ liệu

```ts
type Member = {
  id: string;                 // uid hoặc "ghost_xxx"
  rating: number;
  gender: "M" | "F";
  position?: "front" | "back" | "both";
  gamesPlayed?: number;       // mang theo nếu chia lại giữa buổi
};

type LockedPair = { id: string; a: string; b: string; source: "self" | "host" };

type Input = {
  category: "men" | "women" | "mixed";
  members: Member[];                 // chỉ người đã confirmed và đang có mặt, 4..8 người
  lockedPairs: LockedPair[];
  mode: "auto" | "rotate";           // auto: cặp cố định, rotate: đổi cặp mỗi trận
  targetMatches?: number;            // mặc định: số người (mỗi người đánh khoảng 4 trận)
  seed?: number;                     // cùng đầu vào + cùng seed → cùng kết quả
};

type MatchPlan = { index: number; teamA: [string, string]; teamB: [string, string];
                   resting: string[]; diff: number };

type Output = { pairs: Pair[]; matches: MatchPlan[]; warnings: Warning[] };
```

## 2. Kiểm tra đầu vào (trả lỗi rõ ràng, không đoán bừa)

- Số người từ 4 đến 8. Ngoài khoảng đó trả `INVALID_SIZE`.
- Nội dung `men` mà có nữ (hoặc ngược lại): `CATEGORY_MISMATCH`.
- Cặp khóa: cả hai người phải có trong danh sách, không trùng ai, và với `mixed` phải là 1 nam + 1 nữ.
- Không dùng `Math.random()` trực tiếp. Dùng bộ sinh số theo `seed` khi cần phá hòa.

## 3. Chế độ `auto`: cặp cố định, đấu vòng tròn giữa các cặp

Dùng khi `n` chẵn. Nếu `n` lẻ, chuyển sang chế độ `rotate` và thêm cảnh báo `FELL_BACK_TO_ROTATE`.

1. Bắt đầu từ các cặp khóa (người mặc định tự bắt cặp, hoặc host xếp trước).
2. Những người còn lại ("tự do") được xếp cặp tự động, **đều theo hướng cân điểm tổng giữa các cặp**:
   - `men` / `women`: sắp xếp giảm dần theo rating rồi ghép người thứ `i` với người thứ `m-1-i`
     (mạnh nhất ghép yếu nhất).
   - `mixed`: nam sắp xếp giảm dần, nữ sắp xếp tăng dần, ghép nam thứ `i` với nữ thứ `i`.
   Nếu số nam và nữ tự do không bằng nhau: ghép cùng giới với cảnh báo `MIXED_IMBALANCE`.
3. Gọi `k = n/2` là số cặp (2, 3 hoặc 4). Các trận là mọi cách chọn 2 cặp khác nhau: `k=2` có 1 trận,
   `k=3` có 3 trận, `k=4` có 6 trận (mỗi cặp đấu mọi cặp còn lại đúng một lần).
4. **Sắp thứ tự trận** bằng tham lam: ở mỗi bước chọn trận chưa đấu sao cho
   (a) ít cặp trùng với trận ngay trước đó nhất, (b) cặp đã chơi ít trận nhất được ưu tiên,
   (c) `diff` nhỏ hơn, (d) phá hòa theo seed. Với `k=4`, hai chỗ nối giữa các lượt vẫn có cặp đánh liền 2 trận,
   đó là giới hạn toán học, không phải lỗi.
5. Tính `diff = |tổng rating đội A - tổng rating đội B|` cho từng trận.
   Nếu `diff > MATCH_DIFF_WARN` (mặc định 200) thì thêm cảnh báo `UNBALANCED_MATCH`.
   **Cặp khóa không bao giờ bị tách**, chỉ cảnh báo, để host tự quyết định (host có thể cố tình ghép mạnh với yếu).

## 4. Chế độ `rotate`: đổi cặp mỗi trận

Dùng khi n lẻ (5, 7), khi host muốn đổi cặp liên tục, hoặc khi sân chưa có cặp khóa nào và `n` không chia hết 2.
Với `n = 4` luôn chỉ có một trận cố định.

Với mỗi trận:
1. Chọn 4 người có `gamesPlayed` thấp nhất. Hòa thì ưu tiên người vừa nghỉ trận trước, rồi theo seed.
   `mixed` thì chọn 2 nam + 2 nữ theo cách này trong từng giới. Nếu không đủ: cảnh báo `MIXED_IMBALANCE`.
2. Chia đội: với `men` / `women`, sắp `a ≥ b ≥ c ≥ d` và thử cả 3 cách chia, chọn cách có
   `diff + 100 * (số cặp đồng đội đã từng đánh cùng nhau)` nhỏ nhất. Cách chia mặc định hay thắng là `(a + d)` đấu `(b + c)`.
   Với `mixed`, mỗi đội 1 nam + 1 nữ, thử 2 cách chia, tính điểm như trên.
3. Cặp khóa (nếu có) luôn đánh cùng nhau. Chỉ chọn trận chứa trọn cả cặp hoặc không chứa ai trong cặp.
4. Tăng `gamesPlayed` của 4 người đã đánh. Những người còn lại vào `resting`.

Kết quả mong đợi: chênh lệch số trận giữa hai người bất kỳ không quá 1.

## 5. Người vắng hoặc thay đổi giữa buổi

Host bỏ tick người vắng hoặc thêm người đến muộn, rồi chạy lại hàm với danh sách mới, truyền `gamesPlayed` hiện tại.
Các trận đã đánh xong không bị thay đổi. Nếu một người trong cặp khóa vắng, cặp đó hủy,
người còn lại trở thành người tự do. UI báo rõ trước khi xác nhận.

## 6. Việc cần làm khi dùng skill

- Chủ kèo kéo đổi thủ công hai người: tính lại `diff` ngay và hiển thị, không chặn.
- Màn hình "chia nhanh tại sân" phải đạt thao tác 3 chạm: mở sân → kiểm tra người có mặt → bấm "Chia".
- Test bắt buộc xem `badminton-testing`. Bảng ca biên gồm n = 4..8, cả ba nội dung, có và không có cặp khóa.
- Khi báo cáo cho người dùng: đây là heuristic tham lam, không đảm bảo tối ưu toàn cục. Đủ cho MVP và có thể ghi
  thẳng vào mục quản lý rủi ro của đồ án.
