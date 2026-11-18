# DANH SÁCH CA KIỂM THỬ (TEST CASES) — 84 CA

**Tài liệu:** `docs/test/test-cases.md`  
**File dữ liệu chuẩn (CSV):** [test-cases.csv](file:///d:/QLDAPM/docs/test/test-cases.csv)  
**Quy ước:** Các cột **Kết quả thực tế**, **Người chạy**, **Ngày**, **Thiết bị** được **ĐỂ TRỐNG** (`[TV2 điền]`) để điền khi thực thi kiểm thử trên máy thật / Emulator.

---

## Tổng quan phân bổ 84 ca kiểm thử
| Nhóm / Module | Số lượng ca | Dải mã TC | Ghi chú phủ phạm vi |
|---|---|---|---|
| **Module 1: Xác thực & Hồ sơ** | 12 ca | `TC-001` – `TC-012` | Đăng ký, đăng nhập, OTP/khôi phục, 10 câu Onboarding, Profile, Provisional -> Chính thức |
| **Module 2a: Tìm đồng đội (Partner Finder)** | 6 ca | `TC-013` – `TC-018` | Lọc Đôi nam / Đôi nữ / Đôi nam nữ, rỗng, ca biên chênh **150** và **151** Elo |
| **Module 3: Phòng kèo & Suất tuyển (Lobby & Recruit)** | 22 ca | `TC-019` – `TC-040` | 1–2 sân, chặn sân thứ 3, Ghost, chặn người thứ 9, suất tuyển (0, 3, 4, 5, 8), E1–E13, Waitlist & đôn người, tranh suất cuối |
| **Module 2b: Chia cặp & Lịch đấu (Session Balancing)** | 14 ca | `TC-041` – `TC-054` | 4/5/6/7/8 người/sân, ca lẻ 5 & 7 nghỉ luân phiên, cùng điểm, điểm cực cao, cặp khóa, đổi tay, 2 sân độc lập |
| **Module 4: Tỷ số, Elo, Lịch sử & Admin** | 14 ca | `TC-055` – `TC-068` | Tỷ số BWF hợp lệ/sai, chấm thẻ 5s chặn tự chấm, thắng áp đảo/sát, idempotent bấm 2 lần, lịch sử, bạn ăn ý, Admin |
| **Offline Cache & Thông báo** | 7 ca | `TC-069` – `TC-075` | Snapshot, chia cặp & nhập tỷ số offline, hàng đợi backoff/idempotency, xung đột, nhắc lịch 1h & trung tâm thông báo |
| **Phi chức năng & Bảo mật giao diện/Rules** | 9 ca | `TC-076` – `TC-084` | `< 1s`, `<= 3 chạm`, một tay `>= 48dp`, tương phản/cỡ chữ, Android & iOS, chặn sửa Elo, ẩn nút Host, Rules |

---

## Chi tiết các ca kiểm thử trọng tâm (Xem đầy đủ 84 ca trong [test-cases.csv](file:///d:/QLDAPM/docs/test/test-cases.csv))

| Mã TC | FR/NFR | Tiền điều kiện | Bước & Dữ liệu vào | Kết quả mong đợi | Ưu tiên | KQ thực tế | Người chạy | Ngày | Thiết bị |
|---|---|---|---|---|---|---|---|---|---|
| `TC-001` | `FR-01` | Chưa đăng nhập | Mở app -> Đăng ký `an@dn.vn` / `123456` | Tạo tài khoản thành công, qua OTP/Onboarding | P0 | | | | |
| `TC-006` | `FR-02` | Chưa có hồ sơ | Trả lời 10 câu Onboarding mức 1 (tổng 10đ) | Tính Cấp 1 (Yếu), Elo = 1100 | P0 | | | | |
| `TC-017` | `FR-07` | Elo 1450 vs 1600 | Tìm đồng đội lệch mặc định 150 | Ứng viên 1600 ĐƯỢC hiển thị | P0 | | | | |
| `TC-018` | `FR-07` | Elo 1450 vs 1601 | Tìm đồng đội lệch mặc định 150 | Ứng viên 1601 BỊ LOẠI | P0 | | | | |
| `TC-022` | `FR-12;FR-14` | Form tạo kèo | Thử chọn `courtCount = 3` | Chặn vượt trần 2 sân/kèo | P0 | | | | |
| `TC-024` | `FR-15` | Sân đủ 8/8 | Thêm người mặc định thứ 9 | Chặn cứng vượt trần 8 người/sân | P0 | | | | |
| `TC-026`..`TC-030` | `FR-16` | Mặc định 4, 5, 8, 3 | Kiểm tra suất tuyển `min(4, 8 - core)` | Đúng số suất (4, 3, 0); mặc định `< 4` chặn mở tuyển | P0 | | | | |
| `TC-038` | `FR-19` | Còn 1 suất cuối | 2 thao tác duyệt đồng thời | Chỉ 1 thành công, 1 báo xung đột `version` | P0 | | | | |
| `TC-040` | `FR-20` | Đôi nam nữ thiếu Nữ | Waitlist `[Nam#1, Nữ#2]`, Nữ rời kèo | Bỏ qua Nam#1, đôn Nữ#2 | P1 | | | | |
| `TC-041`..`TC-045` | `FR-08;FR-10` | Sân 4, 5, 6, 7, 8 người | Chia kèo `auto` / `rotate` | Hợp lệ; ca 5 & 7 nghỉ luân phiên đều | P0 | | | | |
| `TC-047` | `FR-08` | 2000 vs 1100 Elo | Chia kèo chênh điểm cực lớn | Không crash, cảnh báo `UNBALANCED_MATCH` | P0 | | | | |
| `TC-055`..`TC-056` | `FR-22` | Trận đang đánh | Nhập `21-19` / `21-20` / `31-29` | Cho qua `21-19`; chặn `21-20`, `31-29` | P0 | | | | |
| `TC-057` | `FR-23` | Bước chấm thẻ 5s | Thử chấm chính mình | UI ẩn/chặn tự chấm, backend cũng chặn | P0 | | | | |
| `TC-061` | `FR-24` | Trận đã chốt | Bấm kết thúc 2 lần cùng `matchId` | Idempotent: lần 2 không cộng Elo | P0 | | | | |
| `TC-069`..`TC-072` | `FR-32..34;NFR-04` | Mất mạng giữa buổi | Chia kèo + nhập tỷ số offline -> có mạng lại | Lưu snapshot, đồng bộ FIFO, backoff & xử lý xung đột | P0 | | | | |
| `TC-076`..`TC-080` | `NFR-01..03;07` | Sân 8 người / Android & iOS | Đo thời gian, số chạm, nút 48dp, tương phản | `< 1s`, `<= 3 chạm`, một tay OK, 2 OS OK | P0 | | | | |
| `TC-081`..`TC-084` | `FR-28;NFR-06` | Tài khoản Player | Kiểm tra UI Hồ sơ, Phòng kèo & Security Rules | Không sửa được Elo, không thấy nút Host, Rules chặn | P0 | | | | |
