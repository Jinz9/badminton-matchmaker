# HƯỚNG DẪN ĐÓNG GÓP VÀ QUY TẮC LÀM VIỆC (CONTRIBUTING.md)

Chào mừng bạn đến với dự án **Hệ thống ghép đội và cân bằng kèo cầu lông (Mobile App)**.  
Để đảm bảo sự phối hợp trơn tru, không gây xung đột mã nguồn và kiểm soát chất lượng tuyệt đối giữa **TV1 (Đào Duy Nhật)** và **TV2 (Nguyễn Đức Đạt)**, tất cả các thành viên bắt buộc phải tuân thủ nghiêm ngặt các quy tắc dưới đây.

---

## 1. Chiến lược phân nhánh Git (Branching Strategy)

- **Nhánh `main`:** Nhánh phát hành ổn định, chỉ chứa các phiên bản đạt mốc Milestone (M1..M12). **Khóa không cho push trực tiếp**, mọi thay đổi vào `main` bắt buộc phải thông qua Pull Request (PR) có review và chấp thuận của cả 2 thành viên.
- **Nhánh `dev`:** Nhánh tích hợp chính của nhóm. Tất cả các nhánh tính năng đều tách ra từ `dev` và gộp trở lại vào `dev`.
- **Nhánh tính năng / tài liệu (Feature / Docs Branches):** Tách từ `dev` theo quy ước đặt tên chuẩn:
  - `feat/partner-finder`: Phát triển tính năng tìm bạn đánh đôi.
  - `feat/court-balancing`: Phát triển thuật toán chia cặp và xoay tua sân.
  - `feat/match-lobby`: Phát triển phòng chờ kèo, tuyển vãng lai và waitlist.
  - `feat/elo-functions`: Phát triển tính toán Elo và điểm uy tín sau trận.
  - `docs/<tên-tài-liệu>`: Soạn thảo hoặc cập nhật hồ sơ quản trị dự án.
  - `fix/<tên-lỗi>`: Sửa lỗi phát hiện trong quá trình kiểm thử.
  - `chore/<tên-task>`: Cấu hình môi trường, script, build tooling.

---

## 2. Quy chuẩn thông điệp Commit (Conventional Commits)

Mỗi commit phải nhỏ gọn, giải quyết trọn vẹn 1 ý và tuân theo định dạng:

```
<type>(<scope>): <mô tả ngắn gọn bằng tiếng Anh hoặc tiếng Việt>
```

### Các tiền tố `type` được chấp nhận:
- `feat`: Thêm tính năng mới (ví dụ: `feat(domain): compute slots function with unit tests`).
- `fix`: Sửa lỗi (ví dụ: `fix(balancing): resolve odd-player bye rotation issue for 7 players`).
- `docs`: Thêm hoặc sửa tài liệu (ví dụ: `docs(charter): project charter sign-off`).
- `test`: Thêm hoặc chỉnh sửa ca kiểm thử (ví dụ: `test(recruit): add edge test cases S1-S8`).
- `refactor`: Tái cấu trúc mã nguồn mà không làm thay đổi hành vi nghiệp vụ.
- `chore`: Cấu hình dự án, gói thư viện, gitignore (ví dụ: `chore(workspace): jest setup`).

---

## 3. Quy trình Kiểm tra chéo (Code Review) & Gộp mã nguồn

1. **Trước khi tạo Pull Request:**
   - Chạy kiểm thử cục bộ: lệnh `npm test` phải PASS 100%.
   - Không được để sót file tạm, `.env`, hoặc khóa bí mật chưa ignore.
2. **Tạo Pull Request (PR):**
   - Hướng PR vào nhánh `dev`.
   - Sử dụng đúng mẫu template tại `.github/pull_request_template.md`.
   - Tích chọn đầy đủ checklist theo luật nghiệp vụ cầu lông.
3. **Review chéo & Họp gộp mã nguồn tuần:**
   - TV1 và TV2 dành 30 phút trong cuộc họp đồng bộ **20:00 tối Chủ nhật hàng tuần** để rà soát các PR đang mở.
   - Thảo luận các điểm còn khúc mắc, giải quyết xung đột (nếu có) và nhấn nút Merge vào nhánh `dev`.

---

## 4. Các điều cấm tuyệt đối (Strict Prohibitions)

1. ❌ **Không push thẳng lên nhánh `main`:** Mọi commit trực tiếp vào `main` sẽ bị từ chối bởi hệ thống branch protection.
2. ❌ **Không đưa thông tin bảo mật vào Git:** Tuyệt đối không commit file `.env`, file service account json của Firebase, hoặc private key.
3. ❌ **Không vi phạm ranh giới thư mục:** TV1 không sửa vào `src/app/`, TV2 không sửa trực tiếp vào `src/domain/` khi chưa có sự thống nhất bằng văn bản.
4. ❌ **Không bịa dữ liệu thực tế:** Các thông tin biên bản họp, kết quả test thực tế tại sân nếu chưa có phải ghi rõ `[TV1 điền]` hoặc `[TV2 điền]`.

