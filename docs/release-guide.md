# HƯỚNG DẪN PHÁT HÀNH & BẢN DỰ PHÒNG BẢO VỆ (RELEASE GUIDE)

**Mã tài liệu:** `docs/release-guide.md`  
**Nhánh:** `chore/release`  
**Phương án đã chốt:** **Expo Go qua EAS Update / mã QR (chi phí 0 đồng, chạy cả iOS & Android)** + cấu hình sẵn [eas.json](file:///d:/QLDAPM/eas.json) (`preview`) để đóng gói APK Android dự phòng khi cần.  
**Tài liệu liên quan:** [build-guide.md](file:///d:/QLDAPM/docs/demo/build-guide.md), [firebase-env.md](file:///d:/QLDAPM/docs/firebase-env.md)

---

## 1. Kiểm tra trước khi phát hành (Pre-Release Checklist)

1. **Biến môi trường (`.env`):**
   - Bản kết nối Firebase thật:
     - `EXPO_PUBLIC_DATA_SOURCE=firebase`
     - `EXPO_PUBLIC_USE_FIREBASE_EMULATOR=false`
     - Đủ 6 biến `EXPO_PUBLIC_FIREBASE_*` của project `badminton-danang`.
   - **Bản dự phòng bảo vệ (Mock offline):**
     - `EXPO_PUBLIC_DATA_SOURCE=mock`
2. **An toàn bí mật & Khóa:**
   - Kiểm tra `.gitignore` có `.env`, `.env*.local`, `*serviceAccount*.json` (tuyệt đối không commit `.env` hay private key lên Git).
   - Chạy `git status` xác nhận không có file bí mật nào đang staged.
3. **Kiểm tra cấu hình & kiểm thử tự động:**
   - Chạy `npx expo-doctor` (kiểm tra schema [app.json](file:///d:/QLDAPM/app.json)).
   - Chạy `npm run test:all` (đạt 100% PASS cho Domain + Data + UI RNTL).

---

## 2. Quy trình phát hành & cài đặt theo phương án đã chọn

### Cách A: Chạy qua Expo Go (Mã QR / Tunnel — Dùng chính cho iOS & Android)
1. Trên máy tính phát triển:
   ```powershell
   npx expo start --tunnel -c
   ```
2. **Trên iPhone:** Mở app **Camera** quét mã QR (hoặc nhập URL `exp://...` vào **Expo Go**).
3. **Trên Android:** Mở app **Expo Go** $\to$ **Scan QR code**.

### Cách B: Phát hành bản tĩnh qua EAS Update (Mở không cần bật laptop)
1. Cài `eas-cli` và đăng nhập tài khoản Expo (`expo.dev`).
2. Xuất bản bundle lên kênh `preview`:
   ```powershell
   npx eas update --branch preview --message "Release demo QLDAPM v1.0.0"
   ```
3. Người nhận mở **Expo Go** $\to$ đăng nhập cùng tài khoản / quét link cập nhật để chạy bản đã xuất bản.

---

## 3. Cách Rollback khi gặp sự cố sau phát hành
1. **Rollback bản EAS Update:**
   ```powershell
   # Xem danh sách các bản update đã đẩy trên nhánh preview
   npx eas update:list --branch preview

   # Đẩy lại bản ổn định trước đó hoặc revert về commit ổn định
   npx eas update:republish --group <GROUP_ID_CU>
   ```
2. **Rollback mã nguồn tại chỗ (khi chạy Expo Go trực tiếp):**
   ```powershell
   git checkout <commit_on_dinh>
   npx expo start --tunnel -c
   ```

---

## 4. ⚠️ THỦ CÔNG: Đăng nhập Expo/EAS, Build APK dự phòng & Cài lên máy

*(Chưa chạy build thật cho tới khi bạn chủ động xác nhận thực hiện các bước dưới đây.)*

1. **Đăng ký & Đăng nhập tài khoản Expo (Miễn phí tại `https://expo.dev`):**
   ```powershell
   npm install -g eas-cli
   eas login
   ```
2. **Liên kết dự án với tài khoản Expo (chỉ chạy 1 lần):**
   ```powershell
   eas init
   ```
   *(Lệnh này sẽ tự thêm `extra.eas.projectId` vào `app.json`.)*
3. **Build file Android `.apk` cài trực tiếp (Profile `preview` trong [eas.json](file:///d:/QLDAPM/eas.json)):**
   ```powershell
   eas build -p android --profile preview
   ```
   - Chờ EAS Cloud build (~10–15 phút), tải file `.apk` từ link Expo cung cấp.
   - Gửi file `.apk` vào điện thoại Android, bật **"Cài đặt từ nguồn này"** để cài độc lập không cần Expo Go.
4. ***(Tùy chọn nâng cao — Có phí)*** **Nếu sau này đưa lên Store / TestFlight iOS:**
   - **Google Play Console:** Phí đăng ký 1 lần **\$25 USD** $\to$ dùng profile `production` (`eas build -p android --profile production` $\to$ `eas submit -p android`).
   - **Apple Developer Program:** Phí **\$99 USD/năm** $\to$ `eas build -p ios --profile production` $\to$ `eas submit -p ios` để phát hành TestFlight cho iPhone.

---

## 5. Bản Dự Phòng Bảo Vệ Đồ Án (Khi mạng hội trường yếu / mất sóng)

Luôn chuẩn bị sẵn **1 phương án dự phòng chạy 100% không cần mạng Internet tới Firebase**:

1. Chuyển [.env](file:///d:/QLDAPM/.env) sang chế độ dữ liệu mẫu:
   ```env
   EXPO_PUBLIC_DATA_SOURCE=mock
   ```
2. Chạy lại Metro với cờ xóa cache (`-c`) trước khi vào phòng bảo vệ để bundle nhúng sẵn toàn bộ dữ liệu mẫu (`src/mocks/*.json`) và thuật toán `src/domain/`:
   ```powershell
   npx expo start -c
   ```
   *(Hoặc dùng `--tunnel -c` nếu Wi-Fi trường chặn LAN, và luôn chuẩn bị sẵn 4G phát hotspot từ điện thoại dự phòng.)*
3. Tài khoản đăng nhập 1 chạm sẵn có trên màn Đăng nhập (`mock`):
   - **Host:** `host@badminton.vn` / `123456`
   - **Người chơi:** `player@badminton.vn` / `123456`
   - **Mã OTP giả lập:** `123456`
4. Ngay cả khi bật **Chế độ máy bay** trong lúc demo chia kèo và chấm điểm, app vẫn chia cặp (`balanceCourt` $< 1\text{ ms}$), nhập tỷ số và lưu hàng đợi offline bình thường.
