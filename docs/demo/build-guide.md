# HƯỚNG DẪN ĐÓNG GÓI VÀ PHÁT HÀNH BẢN BUILD ỨNG DỤNG (BUILD GUIDE)

> **Mã tài liệu:** `docs/demo/build-guide.md`  
> **Nền tảng:** Expo React Native (Expo Go / EAS)  
> **Phương án phát hành chính thức đã duyệt:** **Phương án 100% Expo Go** (Hoàn toàn miễn phí, hỗ trợ cả iOS và Android, quét mã QR mở tức thì, không tốn chi phí tài khoản nhà phát triển).  
> **Phân công trách nhiệm:**  
> - **Người thực hiện chính:** TV2 (Nguyễn Đức Đạt - Mobile Dev phụ trách khởi chạy máy chủ development và chia sẻ QR)  
> - **Người hỗ trợ kỹ thuật:** TV1 (Đào Duy Nhật - Hỗ trợ biến môi trường `.env`, cấu hình Firebase và kiểm thử kết nối mạng)

---

## 1. Quyết Định Lựa Chọn Phương Án Phát Hành (Chính Thức)

Nhóm đã thống nhất phê duyệt lựa chọn **Phương án 100% Expo Go**:
- **Lý do lựa chọn:**
  1. **Chi phí $0 VNĐ:** Không yêu cầu đăng ký tài khoản Apple Developer Program cá nhân ($99 USD/năm) hay Google Play Developer Console ($25 USD).
  2. **Đa nền tảng tức thì:** Cả Giảng viên hướng dẫn, Hội đồng chấm đồ án và các tay vợt tại sân cầu lông dù dùng iPhone (iOS) hay Samsung/Xiaomi (Android) đều có thể tải app **Expo Go** miễn phí từ kho ứng dụng chính thức và quét mã QR để mở app trong 10 giây.
  3. **Không vướng rào cản bảo mật:** Không cần người dùng phải bật tùy chọn nguy hiểm *"Cài đặt ứng dụng từ nguồn không xác định"* trên Android, không bị chặn bởi chứng chỉ doanh nghiệp trên iOS.
  4. **Cập nhật mã nguồn tức thì (Fast Refresh):** Nếu phát hiện lỗi giao diện nhỏ trong lúc chuẩn bị, TV2 có thể sửa code và màn hình trên điện thoại tự động làm mới ngay lập tức mà không cần mất 15–20 phút chờ build lại gói cài đặt.

---

## 2. Hướng Dẫn Từng Bước ⚠️ THỦ CÔNG Dành Cho TV2 (Khởi Chạy Bản Demo)

### Bước 1: Cài đặt ứng dụng Expo Go trên thiết bị thử nghiệm
- **Trên iPhone / iPad (iOS):** Mở App Store $\to$ Tìm kiếm **"Expo Go"** $\to$ Tải về miễn phí.
- **Trên điện thoại Android:** Mở Google Play Store $\to$ Tìm kiếm **"Expo Go"** $\to$ Tải về miễn phí.

### Bước 2: Chuẩn bị máy tính phát triển (Laptop của TV2)
1. Đảm bảo đã kéo mã nguồn mới nhất từ nhánh `dev`:
   ```bash
   git pull origin dev
   ```
2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```
3. Kiểm tra tệp `.env` đã có đầy đủ cấu hình Firebase chính thức từ TV1 (`EXPO_PUBLIC_FIREBASE_API_KEY`, `EXPO_PUBLIC_FIREBASE_PROJECT_ID`,...).

### Bước 3: Khởi chạy Expo Server ở chế độ Tunnel (Vượt tường lửa trường học)
Khi demo tại hội trường bảo vệ đồ án hoặc tại sân cầu lông, Wi-Fi công cộng thường chặn kết nối mạng cục bộ LAN giữa máy tính và điện thoại. TV2 **bắt buộc sử dụng cờ `--tunnel`**:

```bash
# Khởi chạy server ở chế độ Tunnel qua Cloudflare / Ngrok
npx expo start --tunnel --clear
```

### Bước 4: Kết nối và mở ứng dụng trên điện thoại
- **Đối với thiết bị Android:** Mở ứng dụng Expo Go $\to$ Chọn **"Scan QR code"** $\to$ Quét mã QR hiển thị trên màn hình terminal máy tính.
- **Đối với thiết bị iOS (iPhone):** Mở ứng dụng **Camera mặc định** của iPhone $\to$ Hướng vào mã QR trên terminal $\to$ Nhấp vào thông báo vàng *"Open in Expo Go"*.
- Ứng dụng sẽ tự động tải JavaScript bundle trong khoảng $5 - 10$ giây và hiển thị màn hình Đăng nhập `SCR-01` mượt mà.

---

## 3. Phương Án Dự Phòng Khi Máy Tính Mất Kết Nối Mạng

Trong trường hợp tại phòng bảo vệ đồ án không có mạng Internet để chạy tunnel:
1. **Phương án phát hành qua Expo Publish (EAS Update):**
   - TV2 chạy lệnh xuất bản bundle tĩnh lên máy chủ Expo trước ngày bảo vệ:
     ```bash
     npx eas update --branch preview --message "Bản build bảo vệ đồ án"
     ```
   - Người dùng đăng nhập tài khoản Expo trên app Expo Go là có thể mở bản build offline đã lưu trong máy.
2. **Phương án đóng gói Android APK dự phòng:**
   - TV2 vẫn chuẩn bị sẵn 1 tệp `badminton-matchmaker.apk` (tạo qua `eas build -p android --profile preview`) lưu trong thẻ nhớ / USB để cài trực tiếp nếu điện thoại Android mất kết nối hoàn toàn.

---

## 4. Checklist Bàn Giao Bản Build Cho Buổi Bảo Vệ

- [ ] Đã quét mã QR và mở thành công ứng dụng trên ít nhất 1 máy iPhone và 1 máy Android.
- [ ] Ứng dụng khởi động không bị crash, hiển thị đầy đủ icon và splash screen chuẩn.
- [ ] Đăng nhập được bằng cả tài khoản Google và tài khoản Email/Password của Host và Player.
- [ ] Kiểm tra tính năng chạy ngoại tuyến khi bật Chế độ máy bay (Airplane mode) trên điện thoại.
- [ ] Máy tính của TV2 được cắm sạc đầy đủ và đã cài sẵn công cụ Expo CLI mới nhất.

---

## 2. Hướng Dẫn Từng Bước ⚠️ THỦ CÔNG Cho TV2 (Người Chạy Build)

### 2.1. Phương Án 1: Đóng gói Android APK độc lập (EAS Build Preview)

Đây là phương án tối ưu nhất cho đồ án sinh viên: Tạo ra file `.apk` cài trực tiếp vào máy của các tay vợt tại sân cầu lông Đà Nẵng.

#### Bước 1: Cài đặt và đăng nhập EAS CLI (TV2 thực hiện)
```bash
# Cài đặt công cụ Expo Application Services toàn cục
npm install -g eas-cli

# Đăng nhập tài khoản Expo (tạo miễn phí tại expo.dev)
eas login
```

#### Bước 2: Cấu hình tệp `eas.json` trong thư mục gốc
TV2 tạo tệp `eas.json` với cấu hình build APK không dùng App Bundle (`.aab`):

```json
{
  "cli": {
    "version": ">= 7.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

#### Bước 3: Kiểm tra biến môi trường và cấu hình Firebase
- TV1 hỗ trợ TV2 kiểm tra tệp `google-services.json` (tải từ Firebase Console) đã được đặt đúng trong thư mục `android/app/` hoặc khai báo trong `app.json`.
- Kiểm tra các biến môi trường Firebase API Key trong `.env` đã được cấu hình vào EAS Secrets:
  ```bash
  eas secret:push
  ```

#### Bước 4: Kích hoạt lệnh Build trên EAS Cloud
```bash
# Chạy build profile preview để sinh file APK
eas build --platform android --profile preview
```
- Quá trình build diễn ra trên hạ tầng đám mây của Expo (mất khoảng 10–15 phút).
- Khi hoàn tất, terminal sẽ trả về đường dẫn tải file: `https://expo.dev/artifacts/eas/...apk`.

#### Bước 5: Cài đặt lên điện thoại Android thực tế
- Dùng điện thoại quét mã QR hoặc mở link tải file `.apk` về máy.
- Bật tùy chọn *"Cho phép cài đặt ứng dụng từ nguồn không xác định"*.
- Mở app, cấp quyền Thông báo và bắt đầu chạy thử nghiệm tại sân!

---

### 2.2. Phương Án 2: Chạy trực tiếp qua Expo Go (Cho cả iOS và Android)

Dành cho kịch bản thuyết trình bảo vệ trước Hội đồng nếu Giảng viên dùng iPhone:

1. **Trên điện thoại (iOS / Android):** Cài đặt ứng dụng **Expo Go** từ App Store hoặc Google Play.
2. **Trên máy tính của TV2:** Chạy lệnh start chế độ tunnel để vượt qua tường lửa mạng trường:
   ```bash
   npx expo start --tunnel
   ```
3. **Kết nối:** Mở camera iPhone hoặc Expo Go trên Android quét mã QR trên terminal máy tính để tải bundle ứng dụng trong 10 giây!

---

### 2.3. Phương Án 3: Đóng gói TestFlight cho iOS (Chỉ dùng khi có tài khoản Apple Developer)

> [!CAUTION]
> **Yêu cầu bắt buộc:** Tài khoản Apple Developer Program cá nhân hoặc tổ chức (phí thường niên 99 USD/năm). Nếu nhóm không có tài khoản này, **tuyệt đối không chọn phương án này** để tránh phát sinh chi phí.

1. Đăng ký Apple Developer tại `developer.apple.com` (cần thẻ tín dụng quốc tế và CCCD xác minh danh tính).
2. Chạy lệnh: `eas build --platform ios --profile preview` (EAS sẽ tự động sinh Certificate và Provisioning Profile).
3. Đẩy bản build lên App Store Connect: `eas submit -p ios`.
4. Mời email của Giảng viên và bạn bè vào danh sách Tester trên TestFlight.

---

## 3. Checklist Bàn Giao Bản Build Cuối Cùng (Release Checklist)

- [ ] File APK đã được cài thử thành công trên ít nhất 2 thiết bị Android khác nhau.
- [ ] Ứng dụng khởi động không bị crash, hiển thị đúng logo biểu tượng và splash screen.
- [ ] Đăng nhập được bằng cả tài khoản Google và tài khoản Email/Password.
- [ ] Chạy mượt mà khi bật Chế độ máy bay (Offline mode) tại sân.
- [ ] File APK được lưu sẵn vào Google Drive và USB dự phòng của TV1 và TV2 khi đi bảo vệ đồ án.
