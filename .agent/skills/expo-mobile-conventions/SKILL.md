---
name: expo-mobile-conventions
description: Quy ước dựng app di động Expo (React Native) cho app ghép đội cầu lông gồm cấu trúc thư mục, danh sách màn hình, quy tắc UI một tay tại sân, lưu cache offline, dữ liệu giả để làm song song với backend, và nơi đặt logic nghiệp vụ. Hãy dùng skill này bất cứ khi nào người dùng nhắc đến màn hình, giao diện, component, navigation, Expo, React Native, thông báo đẩy, offline, mất mạng ở sân, hoặc tích hợp Firebase SDK vào app, kể cả khi họ chỉ nhờ "làm màn hình tạo kèo". Đọc kèm badminton-domain-rules và firebase-data-model.
---

# Quy ước app Expo

Công nghệ Expo và Firebase thay đổi nhanh. Trước khi viết code cấu hình (thư viện, quyền, build), hãy đối chiếu
tài liệu hiện hành của Expo và Firebase, hoặc dùng skill `expo/skills` và `mobile-developer` nếu đã cài,
đừng dựa vào trí nhớ.

## 1. Cấu trúc thư mục gợi ý

```
src/
  app/                  # màn hình và điều hướng (Expo Router nếu dự án dùng)
  components/           # thành phần giao diện dùng chung
  domain/               # LOGIC NGHIỆP VỤ thuần: recruit/, balancing/, rating/
  config/               # rules.ts, ratingConfig.ts, matchingConfig.ts
  data/                 # truy cập Firebase, mapper dữ liệu, cache offline
  mocks/                # dữ liệu giả cùng cấu trúc Data Contract
  theme/                # màu, cỡ chữ, khoảng cách
```

Quy tắc: **không viết logic nghiệp vụ trong component.** Component chỉ gọi hàm trong `domain/` và hiển thị kết quả.
Nhờ vậy `domain/` test được bằng Jest mà không cần giả lập giao diện.

## 2. Danh sách màn hình MVP

1. Đăng nhập / Đăng ký
2. Khai báo hồ sơ (giới tính, vị trí, tay thuận, cấp tự khai)
3. Trang chủ: danh sách kèo, lọc theo nội dung (nam / nữ / nam nữ), khu vực, trình độ
4. Chi tiết kèo: các sân, số suất còn lại theo giới, nút "Xin tham gia"
5. Tạo kèo (host): địa điểm, giờ, số sân (1–2), nội dung từng sân, dải trình độ
6. Quản lý sân (host): người mặc định (thêm cả người chưa có tài khoản), yêu cầu chờ duyệt, nút bật tắt tuyển
7. Xếp cặp (host): kéo thả tạo cặp khóa, xem tổng điểm từng cặp và chênh lệch các trận
8. Chia lượt tại sân: tick người có mặt, bấm "Chia", lịch trận, người nghỉ
9. Nhập tỷ số và chấm thẻ đánh giá sau trận (trong 5 giây)
10. Hồ sơ và thống kê: điểm, lịch sử, đồng đội ăn ý
11. Thông báo

## 3. Quy tắc giao diện tại sân

- Thao tác một tay: nút chính nằm ở nửa dưới màn hình, chiều cao chạm tối thiểu 48 dp.
- Tương phản cao, chữ lớn, dùng được ngoài trời nắng. Kiểm tra bằng cách hạ độ sáng màn hình khi thử.
- Nội dung sân thể hiện bằng **chữ + biểu tượng + màu**, không chỉ bằng màu.
- Bắt đầu chia lượt không quá 3 chạm từ màn hình chính.
- Mọi danh sách có đủ 3 trạng thái: đang tải, trống, lỗi (kèm nút thử lại).
- Văn bản tiếng Việt, đặt trong một file chuỗi để dễ sửa. Không viết chuỗi cứng trong component.
- Lỗi nghiệp vụ hiển thị lý do cụ thể từ mã lỗi (ví dụ `LEVEL_OUT_OF_RANGE` → "Trình độ của bạn nằm ngoài dải của sân này").

Với phần thẩm mỹ, dùng skill `frontend-design` hoặc skill thiết kế UI mà bạn đã cài. Nhớ yêu cầu rõ các ràng buộc ở trên trong prompt.

## 4. Offline tại sân

- Mục tiêu: host vẫn **chia cặp và nhập tỷ số** được khi mất mạng.
- Đừng giả định Firestore tự lưu offline bền vững trên React Native. Kiểm tra tài liệu hiện hành về cache của SDK bạn dùng.
  Dù thế nào cũng nên tự cache **dữ liệu buổi đánh hiện tại** (sân, danh sách người, cặp, lịch, tỷ số) bằng
  AsyncStorage hoặc expo-sqlite.
- Hàng đợi ghi: khi mất mạng, tỷ số và check-in được xếp hàng cục bộ rồi đồng bộ khi có mạng.
  Chỉ host ghi các dữ liệu này nên xung đột hầu như không xảy ra, vẫn cần `version` để phát hiện lệch.
- Hiển thị biểu tượng "đang offline" và số thao tác đang chờ đồng bộ.
- Thuật toán chia cặp là hàm thuần nên chạy được hoàn toàn offline.

## 5. Làm song song bằng dữ liệu giả

Thành viên 2 dựng màn hình bằng JSON trong `src/mocks/` có **đúng cấu trúc** của `references/schema.md`
(trong skill `firebase-data-model`). Tầng `data/` có một interface, hai bản cài đặt (mock và Firebase),
chỉ đổi một dòng cấu hình để chuyển nguồn dữ liệu.

## 6. Thông báo đẩy

Kiểm tra tài liệu Expo hiện hành về `expo-notifications` và thiết lập FCM, vì phần này phụ thuộc vào loại build.
Danh sách sự kiện cần gửi nằm ở skill `recruit-slot-matching`, mục 5. Phải thử trên thiết bị thật, không chỉ trình giả lập.

## 7. Git

Không đẩy thẳng lên `main`. Mỗi tính năng một nhánh (`feat/recruit-slots`, `feat/session-balancing`), kiểm tra chéo
rồi gộp vào `dev` vào tối Chủ nhật.
