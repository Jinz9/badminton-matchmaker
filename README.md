# Hệ Thống Ghép Đội và Cân Bằng Kèo Cầu Lông (Badminton Matchmaker)
> **Đồ án Quản trị Dự án Phần mềm (QLDAPM) - Nhóm 2 thành viên**  
> **Khu vực áp dụng:** Thành phố Đà Nẵng  
> **Nền tảng:** Mobile App (React Native / Expo SDK) + Google Firebase (BaaS)

---

## 🏸 1. Giới thiệu đề tài

Hệ thống hỗ trợ các nhóm chơi và chủ sân (Host) cầu lông phong trào tại Đà Nẵng tổ chức các buổi giao lưu ("kèo"), mở tuyển thêm khách vãng lai khi sân thiếu người, và tự động xếp cặp thi đấu cân bằng trình độ cho từng sân 4–8 người (hỗ trợ cả các ca lẻ 5 người, 7 người xoay tua công bằng).

### 4 Module cốt lõi:
1. **Module 1: Hồ sơ & Trình độ động:** Thang trình độ 6 cấp phong trào, cập nhật điểm Elo đôi sau mỗi trận đấu, chấm điểm uy tín chống bùng kèo.
2. **Module 2: Ghép đồng đội & Cân kèo (Matching & Balancing):** Partner Finder tìm bạn đánh đôi lệch $\le 150$ Elo; thuật toán Session Balancing xếp cặp và lập lịch cho từng sân đấu (hoạt động offline mượt mà).
3. **Module 3: Quản lý kèo & Danh sách dự bị (Match Lobby & Waitlist):** Tạo kèo 1–2 sân, tuyển vãng lai theo công thức $\text{slot} = \min(4, 8 - \text{core})$, transaction đặt suất chống race condition, tự động đôn người từ waitlist.
4. **Module 4: Lịch sử & Đồng đội ăn ý:** Lưu lịch sử đấu, biểu đồ biến động Elo, tỷ lệ thắng theo cặp, gắn nhãn danh hiệu "Đồng đội ăn ý".

---

## 👥 2. Phân công trách nhiệm nhóm 2 người

- **Thành viên 1 (Đào Duy Nhật - TV1):** Trưởng nhóm (PM), Phân tích nghiệp vụ (BA), Backend Cloud (Firebase), Kiến trúc Dữ liệu NoSQL Firestore, Thuật toán pure domain (slot, balancing, elo rating).
- **Thành viên 2 (Nguyễn Đức Đạt - TV2):** QA Lead, Thiết kế UI/UX Figma, Lập trình Mobile App (React Native / Expo), Xây dựng UI Components & kết nối API theo Data Contract.

👉 *Xem chi tiết ranh giới thư mục tại [docs/OWNERSHIP.md](file:///d:/QLDAPM/docs/OWNERSHIP.md).*

---

## 🚀 3. Hướng dẫn cài đặt và Chạy thử nghiệm

### A. Yêu cầu hệ thống:
- **Node.js:** Phiên bản LTS (v18.x hoặc v20.x).
- **Trình quản lý gói:** `npm` (hoặc `yarn`).
- **Git:** Đã cấu hình username và email.

### B. Cài đặt môi trường kiểm thử Domain:
```bash
# 1. Cài đặt các gói phụ thuộc (Jest, TypeScript, ts-jest)
npm install

# 2. Chạy bộ kiểm thử tự động cho các hàm nghiệp vụ thuần túy (Domain logic)
npm test

# 3. Chạy test ở chế độ theo dõi (Watch mode)
npm run test:watch
```

---

## 📁 4. Cấu trúc thư mục chính

```
D:\QLDAPM\
├── docs/                      # Toàn bộ tài liệu quản trị (Charter, WBS, Gantt, Risk, Meeting)
│   ├── 01-project-charter.md  # Điều lệ dự án
│   ├── 03-wbs-raci.md         # Phân rã công việc & Ma trận trách nhiệm
│   ├── 04-schedule-gantt.md   # Tiến độ 12 tuần & Biểu đồ Gantt
│   ├── 05-risk-register.md    # Sổ tay theo dõi 14 rủi ro
│   ├── OWNERSHIP.md           # Ranh giới phân quyền thư mục TV1 vs TV2
│   └── PROGRESS.md            # Nhật ký tiến độ và các tác vụ thủ công
├── src/
│   ├── domain/                # Hàm thuần nghiệp vụ (tính slot, cân kèo, Elo) [TV1]
│   └── config/                # Cấu hình Firebase & constants nghiệp vụ [TV1]
├── test/
│   └── domain/                # Bộ test Jest cho domain logic [TV1 & TV2]
├── .agent/skills/             # 22 kỹ năng chuyên biệt cho AI Agent
└── package.json               # Cấu hình kiểm thử TypeScript & Jest
```

---

## 📜 5. Quy tắc đóng góp và Quy trình làm việc

- Không bao giờ push code trực tiếp lên nhánh `main` hoặc `dev`.
- Mỗi tính năng thực hiện trên 1 nhánh riêng: `feat/...`, `fix/...`, `docs/...`.
- Đọc kỹ [CONTRIBUTING.md](file:///d:/QLDAPM/CONTRIBUTING.md) và [docs/PROJECT_CONTEXT.md](file:///d:/QLDAPM/docs/PROJECT_CONTEXT.md) trước khi bắt đầu bất kỳ tác vụ nào.
