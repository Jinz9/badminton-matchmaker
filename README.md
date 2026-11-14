# Bộ skill Antigravity cho đồ án "Ghép đội và cân kèo cầu lông" (Expo + Firebase)

Bộ này **thay thế** hai skill `badminton-rating` và `session-balancing` bản trước, vì luật nghiệp vụ đã được làm rõ:
mỗi sân tối đa 8 người, host chỉ tuyển vãng lai khi sân thiếu người, chỉ đánh đôi.

## Gồm những gì

| Skill | Việc của nó |
|---|---|
| `badminton-domain-rules` | **Gốc của cả bộ.** Luật sân 8 người, suất tuyển, nội dung đôi nam / nữ / nam nữ, cặp khóa, danh sách giả định |
| `badminton-rating` | Thang 6 cấp, Elo đôi, điểm uy tín, quy đổi cấp sang dải điểm |
| `recruit-slot-matching` | Tính suất còn lại, kiểm tra đủ điều kiện đặt suất, duyệt, dự bị, gợi ý độ phù hợp |
| `session-balancing` | Xếp cặp và lập lịch trận cho một sân 4–8 người, hỗ trợ cặp khóa do host xếp hoặc người mặc định tự bắt |
| `firebase-data-model` | Cấu trúc Firestore, ai được ghi gì, transaction chống đặt trùng, Cloud Function tối thiểu |
| `expo-mobile-conventions` | Cấu trúc thư mục, màn hình, UI một tay, offline, dữ liệu giả |
| `badminton-testing` | Bảng ca kiểm thử có mã (S, E, B, R, X), field test, mẫu bug log |
| `project-docs-vi` | Charter, FR/User Story, Risk Register, kịch bản demo bằng tiếng Việt |

Quan hệ phụ thuộc: mọi skill đọc `badminton-domain-rules` trước. `recruit-slot-matching` và `session-balancing`
là hai hàm thuần trong `src/domain/`. `firebase-data-model` cho chúng chỗ lưu. `badminton-testing` kiểm tra tất cả.

## Cách đưa vào dự án

Antigravity đọc skill ở `.agent/skills/` trong dự án (hoặc `~/.gemini/antigravity/skills` để dùng chung).

macOS / Linux / Git Bash:
```bash
bash install.sh            # copy vào .agent/skills của thư mục hiện tại
```

Windows PowerShell:
```powershell
New-Item -ItemType Directory -Force .agent\skills
Copy-Item -Recurse -Force skills\* .agent\skills\
```

Sau đó **khởi động lại phiên agent** để Antigravity nhận skill mới.

## Skill bên ngoài nên cài kèm

| Skill | Dùng cho | Lệnh | Mức xác minh |
|---|---|---|---|
| Firebase chính thức (`firebase-auth-basics`, `firebase-firestore-basics`, `firebase-security-rules-auditor`...) | Auth, Firestore, kiểm tra Rules | `npx skills add firebase/agent-skills --agent=antigravity` | Lệnh lấy từ tài liệu Firebase |
| `mobile-developer` (sickn33/antigravity-awesome-skills) | Expo, offline, build | `npx skills add https://github.com/sickn33/antigravity-awesome-skills --skill mobile-developer` | Lệnh lấy từ trang skill |
| `expo/skills` | React Native / Expo theo hướng dẫn của Expo | `npx skills add expo/skills` | Repo có trong danh sách skill chính thức, **hãy kiểm tra README của repo để chắc tên skill và lệnh** |
| `github-workflow-automation`, `code-review-checklist` (sickn33) | Quy trình nhánh và review chéo | `npx skills add https://github.com/sickn33/antigravity-awesome-skills --skill <tên>` | Tên có trong danh sách bộ sưu tập, chưa kiểm tra nội dung |
| `obra/superpowers` | Debug có hệ thống, TDD | `npx skills add obra/superpowers` | Repo có trong danh sách, **hãy kiểm tra README** |

Skill của cộng đồng có thể kèm script mà agent sẽ chạy. **Hãy đọc `SKILL.md` và thư mục `scripts/` trước khi cài.**

## Dùng thế nào trong Antigravity (ví dụ câu lệnh)

- "Dùng `badminton-domain-rules` và `recruit-slot-matching`, viết `computeSlots`, `genderAllowed` và test theo bảng S1–S8, E1–E13."
- "Dùng `session-balancing`, viết hàm xếp cặp cho một sân, test B1–B15."
- "Dùng `firebase-data-model` và `firebase-firestore-basics`, viết Security Rules cho courts và requests, rồi chạy auditor."
- "Dùng `expo-mobile-conventions`, dựng màn hình Quản lý sân bằng dữ liệu giả."

## Khớp với WBS trong kế hoạch 12 tuần

| WBS | Skill chính |
|---|---|
| 1.x Khởi tạo, Charter, Risk | `project-docs-vi` |
| 2.1 Thang trình độ | `badminton-rating`, `badminton-domain-rules` |
| 2.2 SRS, Use Case | `project-docs-vi`, `badminton-domain-rules` |
| 2.3 Lược đồ dữ liệu, Rules | `firebase-data-model` |
| 2.4 UI/UX | `expo-mobile-conventions` (và skill thiết kế giao diện nếu cài) |
| 3.1 Auth, hồ sơ | `firebase-data-model`, skill Firebase chính thức |
| 3.2 Partner Finder (nay là tuyển vãng lai và đặt suất) | `recruit-slot-matching` |
| 3.3 Session Balancing | `session-balancing` |
| 3.4 Elo và uy tín | `badminton-rating` |
| 4.x Giao diện mobile | `expo-mobile-conventions` |
| 5.x Kiểm thử | `badminton-testing` |

## Điều cần làm sớm (tuần 2–3)

1. Hỏi 2–3 host thật để xác nhận các giả định A1–A8 trong `badminton-domain-rules`, rồi sửa file đó.
2. Kiểm tra giá Cloud Functions của Firebase và chốt phương án cho phần cập nhật Elo.
3. Chốt Data Contract từ `firebase-data-model/references/schema.md`.

## Những điểm đã thay đổi so với bản trước

- Chia cặp tính **theo từng sân 4–8 người**, không còn chia cả 8–16 người một lượt.
- `Partner Finder` được thay bằng `recruit-slot-matching` (tuyển vãng lai, đặt suất, dự bị).
- Thêm cặp khóa (người mặc định tự bắt hoặc host xếp trước) và chế độ xoay cặp.
- Thêm thành viên "ghost" (người mặc định chưa có tài khoản), giả định A2, cần xác nhận.
