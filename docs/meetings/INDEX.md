# TỔNG HỢP BIÊN BẢN HỌP TUẦN (W01 – W11)

**Thư ký tổng hợp:** TV2 (Nguyễn Đức Đạt - QA Lead & Mobile Dev)  
**Chủ trì:** TV1 (Đào Duy Nhật - PM & Backend Lead)  
**Mẫu chuẩn:** [TEMPLATE.md](file:///d:/QLDAPM/docs/meetings/TEMPLATE.md)

---

## 1. Danh mục 11 Biên bản họp tuần

| Tuần | File biên bản | Mốc liên quan | Trọng tâm theo kế hoạch (`schedule.csv`) | Trạng thái điền thực tế |
|---|---|---|---|---|
| **W01** | [W01.md](file:///d:/QLDAPM/docs/meetings/W01.md) | `M1` | Khảo sát bối cảnh, Charter, Stakeholders, WBS/RACI, Risk Register | Chờ bổ sung link Meet & KQ phỏng vấn |
| **W02** | [W02.md](file:///d:/QLDAPM/docs/meetings/W02.md) | `M2` | Thang 6 cấp Elo, SRS, Data Contract, Figma Design System (`2.4`) | `[TV2 điền]` diễn biến UI/Figma |
| **W03** | [W03.md](file:///d:/QLDAPM/docs/meetings/W03.md) | `M3` | Cấu hình Firebase (`3.1`), Khung Expo Router & Theme (`4.1`) | `[TV2 điền]` diễn biến Expo |
| **W04** | [W04.md](file:///d:/QLDAPM/docs/meetings/W04.md) | `M4` | Partner Finder (`3.2a`), Auth/Profile/Partner UI (`4.2`) | `[TV2 điền]` diễn biến UI |
| **W05** | [W05.md](file:///d:/QLDAPM/docs/meetings/W05.md) | `M5` | Tính suất tuyển (`3.2b`), Tạo kèo & Danh sách kèo (`4.3a`) | `[TV2 điền]` diễn biến UI |
| **W06** | [W06.md](file:///d:/QLDAPM/docs/meetings/W06.md) | `M5` | Transaction đặt suất & Waitlist (`3.2c`), Lobby realtime (`4.3b`) | `[TV2 điền]` diễn biến UI |
| **W07** | [W07.md](file:///d:/QLDAPM/docs/meetings/W07.md) | `M6` | Session Balancing 4–8 người (`3.3`), Màn chia cặp (`4.4a`) | `[TV2 điền]` diễn biến UI |
| **W08** | [W08.md](file:///d:/QLDAPM/docs/meetings/W08.md) | `M7`, `M8` | Elo sau trận (`3.4`), Chấm điểm 5s (`4.4b`), **Feature Freeze (`M8`)** | Đã chốt đóng băng tính năng |
| **W09** | [W09.md](file:///d:/QLDAPM/docs/meetings/W09.md) | `M9` | Lịch sử & Bạn ăn ý (`4.5`), Test Plan (`5.1`), Offline & Notify | `[TV2 điền]` tiến độ test |
| **W10** | [W10.md](file:///d:/QLDAPM/docs/meetings/W10.md) | `M10` | Kiểm thử Emulator (`5.2`), Field Test tại sân Đà Nẵng (`5.3`) | `[TV2 điền]` kết quả sân thật |
| **W11** | [W11.md](file:///d:/QLDAPM/docs/meetings/W11.md) | `M11` | Hoàn thiện Báo cáo (`5.4a`), Video Demo (`5.4b`), chuẩn bị bảo vệ | `[TV2 điền]` link Video Demo |

---

## 2. Tổng hợp các Quyết định Kỹ thuật & Nghiệp vụ cốt lõi

1. **`CR-01` (Giới hạn sân/kèo):** Mỗi kèo chỉ tối đa **2 sân**, mỗi sân tối đa **8 người** (`4–8` người/sân, bỏ giả định `8–16` người/lượt).
2. **`CR-02` (Suất tuyển vãng lai):** `open = min(4, 8 - coreCount)`, chỉ mở tuyển khi sân thiếu người và có tối thiểu 4 người mặc định (`A1`).
3. **`ADR-001` (Backend):** Dùng Firebase BaaS (Singapore `asia-southeast1`), Security Rules kiểm soát quyền ghi điểm Elo/uy tín.
4. **`ADR-002` (Xác thực Expo Go):** Hỗ trợ Email/Mật khẩu trên Expo Go; màn OTP/quên mật khẩu dùng mã giả lập `123456` ở chế độ mock.
5. **Phát hành & Thông báo trên Expo Go:** Dùng **Expo Go (QR / EAS Update)** kèm bản dự phòng `EXPO_PUBLIC_DATA_SOURCE=mock` khi bảo vệ; thông báo dùng Local Reminder 1h + Trung tâm thông báo realtime (chưa dùng FCM Push cần EAS Development Build).

---

## 3. Các hành động còn mở (Open Actions)
- [ ] **TV1 & TV2:** Bổ sung link Google Meet và kết quả phỏng vấn thực tế tại sân vào `W01.md`..`W11.md`.
- [ ] **TV2:** Điền diễn biến thực tế phần UI/QA vào các tuần `W02`–`W07`, `W09`–`W11` và gắn link Video Demo Full HD.
- [ ] **TV1:** Xử lý các mục backend trong [REQUESTS-FROM-TV2.md](file:///d:/QLDAPM/docs/api/REQUESTS-FROM-TV2.md) (`finishMatch`, `cancelParticipation` callable, collectionGroup rule cho `matches`).
- [ ] **TV1 & TV2:** Hoàn tất 8 ca kiểm thử máy thật/Emulator và Field Test tại sân Đà Nẵng (`MAN-08`, `MAN-09`).
