# Schema Firestore chi tiết

Kiểu dữ liệu viết theo TypeScript. `Timestamp` là Firestore Timestamp.

## Mục lục
1. users
2. sessions
3. courts (roster, pairs)
4. requests
5. matches
6. Ví dụ tài liệu sân

## 1. `users/{uid}`

```ts
{
  displayName: string,
  gender: "M" | "F",
  areaLabel: string,                 // khu vực chơi, chọn từ danh sách cấu hình, không nhập tự do
  position: "front" | "back" | "both",
  dominantHand: "right" | "left",
  selfDeclaredLevel: 1 | 2 | 3 | 4 | 5 | 6,
  role: "user" | "admin",            // chỉ Admin SDK / admin ghi
  skill: {                           // chỉ Cloud Function / admin ghi
    rating: number,
    matchesPlayed: number,
    reliability: number              // 0..100
  },
  fcmTokens: string[],
  createdAt: Timestamp
}
```

## 2. `sessions/{sessionId}`

```ts
{
  hostId: string,
  title: string,
  venueName: string,
  areaLabel: string,
  startsAt: Timestamp,
  durationMin: number,
  status: "draft" | "open" | "locked" | "in_progress" | "finished" | "cancelled",
  courtCount: 1 | 2,
  courtSummaries: Array<{            // để vẽ danh sách kèo mà không phải đọc từng sân
    courtId: "1" | "2",
    category: "men" | "women" | "mixed",
    levelMin: number, levelMax: number,
    openSlots: number,
    openByGender: { M: number, F: number },
    recruitOpen: boolean
  }>,
  openSlotsTotal: number,
  createdAt: Timestamp
}
```

Truy vấn danh sách kèo: `status == "open"`, `openSlotsTotal > 0`, sắp theo `startsAt`.
Có thể cần composite index, Firestore sẽ báo link tạo index khi chạy lần đầu.

## 3. `sessions/{sid}/courts/{courtId}`

```ts
{
  category: "men" | "women" | "mixed",
  levelMin: number,                  // cấp 1..6
  levelMax: number,
  minReliability: number,            // mặc định 0
  pairingMode: "auto" | "rotate",
  recruitOpen: boolean,              // công tắc của host; hiệu lực = recruitOpen && openSlots > 0
  roster: {
    [memberId: string]: {            // uid thật hoặc "ghost_<random>"
      type: "core" | "recruit",
      displayName: string,
      gender: "M" | "F",
      rating: number,                // ảnh chụp tại thời điểm vào sân
      level: number,
      position: "front" | "back" | "both",
      isGhost: boolean,
      checkedIn: boolean,
      joinedAt: Timestamp
    }
  },
  pairs: Array<{
    id: string,
    a: string, b: string,            // memberId
    source: "self" | "host"          // cặp khóa; cặp auto không lưu, tính lúc chia
  }>,
  version: number
}
```

## 4. `sessions/{sid}/courts/{cid}/requests/{uid}`

```ts
{
  status: "requested" | "waitlist" | "declined" | "withdrawn",
  snapshot: { displayName, gender, rating, level, position, reliability },
  note?: string,
  createdAt: Timestamp,
  decidedAt?: Timestamp
}
```

Khi được duyệt, tài liệu này bị xóa (hoặc đổi `status` thành `approved` nếu muốn giữ lịch sử)
và người đó xuất hiện trong `roster` của sân, trong cùng một transaction.

## 5. `sessions/{sid}/matches/{matchId}`

```ts
{
  courtId: "1" | "2",
  index: number,                     // thứ tự trong lịch của sân
  teamA: [string, string],
  teamB: [string, string],
  sets: Array<{ a: number, b: number }>,
  status: "planned" | "playing" | "finished" | "confirmed",
  confirmedBy?: string,              // hostId
  ratingProcessed: boolean,          // chỉ Cloud Function được đổi false → true
  cards?: Array<{ from: string, to: string, tag: "ontrinh" | "danhhay" | "thaido" }>
}
```

## 6. Ví dụ tài liệu sân (đôi nam nữ, 4 người mặc định + 1 vãng lai)

```json
{
  "category": "mixed",
  "levelMin": 3, "levelMax": 4,
  "minReliability": 0,
  "pairingMode": "auto",
  "recruitOpen": true,
  "roster": {
    "uid_a": { "type": "core", "gender": "M", "rating": 1450, "level": 3, "position": "back", "isGhost": false, "checkedIn": false },
    "uid_b": { "type": "core", "gender": "F", "rating": 1380, "level": 3, "position": "front", "isGhost": false, "checkedIn": false },
    "ghost_x1": { "type": "core", "gender": "M", "rating": 1425, "level": 3, "position": "both", "isGhost": true, "checkedIn": false },
    "ghost_x2": { "type": "core", "gender": "F", "rating": 1425, "level": 3, "position": "both", "isGhost": true, "checkedIn": false },
    "uid_c": { "type": "recruit", "gender": "F", "rating": 1500, "level": 4, "position": "front", "isGhost": false, "checkedIn": false }
  },
  "pairs": [ { "id": "p1", "a": "uid_a", "b": "uid_b", "source": "self" } ],
  "version": 7
}
```

Ở đây số người mặc định là 4 nên tổng suất tuyển là 4, đã duyệt 1, còn 3 suất.
Đôi nam nữ với 2 nam + 2 nữ mặc định: còn nhận tối đa 2 nam và 2 nữ.
