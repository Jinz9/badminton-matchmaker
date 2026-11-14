# PHÂN ĐỊNH RANH GIỚI THƯ MỤC VÀ SỞ HỮU MÃ NGUỒN (OWNERSHIP.md)

**Dự án:** Hệ thống ghép đội và cân bằng kèo cầu lông (Mobile App)  
**Tài liệu:** Quy định sở hữu thư mục (Code Ownership) & Hướng dẫn tích hợp  
**Áp dụng cho:** TV1 (Đào Duy Nhật) và TV2 (Nguyễn Đức Đạt)  

---

## 1. Bảng phân định quyền sở hữu thư mục

Để đảm bảo hai thành viên có thể làm việc song song mà không bao giờ xảy ra tình trạng ghi đè hoặc xung đột mã nguồn (merge conflict), toàn bộ cây thư mục dự án được phân chia chủ quyền rõ ràng như sau:

| Thư mục / Tập tin | Thành viên sở hữu chính | Quyền hạn | Mô tả trách nhiệm |
|---|:---:|:---:|---|
| `docs/` | **TV1** | Toàn quyền Read/Write | Toàn bộ tài liệu quản trị: Charter, WBS, Gantt, Risk, Meeting, SRS, Data Contract. |
| `functions/` | **TV1** | Toàn quyền Read/Write | Cloud Functions backend (nếu có dùng). |
| `firebase.json` | **TV1** | Toàn quyền Read/Write | Cấu hình triển khai hạ tầng Firebase. |
| `firestore.rules` | **TV1** | Toàn quyền Read/Write | Bộ quy tắc bảo mật Cloud Firestore Security Rules. |
| `firestore.indexes.json` | **TV1** | Toàn quyền Read/Write | Cấu hình chỉ mục phức hợp (Composite Indexes). |
| `scripts/` | **TV1** | Toàn quyền Read/Write | Các script tạo dữ liệu mẫu (seed data), script kiểm tra tự động. |
| `src/domain/` | **TV1** | Toàn quyền Read/Write | **Lõi nghiệp vụ thuần túy:** Thuật toán tính slot, thuật toán cân kèo, mô hình toán Elo đôi, điểm uy tín (Pure TypeScript). |
| `src/config/` | **TV1** | Toàn quyền Read/Write | Khởi tạo cấu hình Firebase SDK, hằng số nghiệp vụ toàn cục. |
| `src/app/` | **TV2** | Toàn quyền Read/Write | **Giao diện di động:** Toàn bộ màn hình và file-based routing của Expo Router. |
| `src/components/` | **TV2** | Toàn quyền Read/Write | Các thành phần giao diện tái sử dụng (Button, Card, Modal, CourtView...). |
| `src/theme/` | **TV2** | Toàn quyền Read/Write | Bảng màu, typography, khoảng cách, design tokens theo bản vẽ Figma. |
| `src/mocks/` | **TV2** | Toàn quyền Read/Write | Dữ liệu giả lập phía client để TV2 dựng UI độc lập trước khi có backend. |
| `src/data/` (phần UI) | **TV2** | Toàn quyền Read/Write | Các Custom Hooks (React Query / SWR / Context) kết nối giữa UI và Data. |
| `test/domain/` | **TV1 & TV2** | Đồng sở hữu | TV1 viết unit test logic; TV2 (QA Lead) bổ sung các ca kiểm thử biên (Edge cases). |

---

## 2. Hướng dẫn quan trọng dành cho TV2 khi khởi tạo Expo App

TV2 phụ trách phần phát triển ứng dụng di động với **Expo (React Native)**. Để **KHÔNG GHI ĐÈ** các cấu hình backend và kiểm thử mà TV1 đã thiết lập, TV2 cần thực hiện theo các bước sau:

### ⚠️ QUY TẮC BẢO TOÀN DỰ ÁN:
1. **KHÔNG chạy lệnh `npx create-expo-app .` trực tiếp trong thư mục gốc:** Lệnh này có thể ghi đè file `package.json`, `.gitignore` và `README.md` đã có.
2. **Quy trình đúng để TV2 bổ sung Expo:**
   - **Bước 1:** Cài đặt các thư viện Expo và React Native vào dự án hiện tại bằng lệnh:
     ```bash
     npm install expo react react-native expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar
     ```
   - **Bước 2:** Bổ sung trường `"main": "expo-router/entry"` vào file `package.json` (chỉ thêm, không xóa các scripts test hiện có).
   - **Bước 3:** Tạo file cấu hình `app.json` cho Expo ở thư mục gốc:
     ```json
     {
       "expo": {
         "name": "BadmintonMatchmaker",
         "slug": "badminton-matchmaker",
         "scheme": "badminton",
         "version": "1.0.0",
         "orientation": "portrait",
         "userInterfaceStyle": "light",
         "plugins": ["expo-router"]
       }
     }
     ```
   - **Bước 4:** Tạo thư mục `src/app` và bắt đầu dựng các route đầu tiên (`_layout.tsx`, `index.tsx`).

---

## 3. Quy chuẩn giao tiếp giữa hai thành viên (Data Contract)

- Mọi luồng dữ liệu giữa Backend/Thuật toán của TV1 và Màn hình Mobile của TV2 phải thông qua file **`docs/api/data-contract.ts`**.
- TV1 cam kết: Cung cấp đầy đủ các Type/Interface và hàm domain thuần túy.
- TV2 cam kết: Sử dụng đúng các Interface này, không tự ý đổi tên trường dữ liệu (ví dụ: không đổi `reputationScore` thành `reputationPoint` hay `rating`).
- Nếu cần thêm trường mới trên giao diện: Hai thành viên cùng thống nhất và cập nhật vào Data Contract trước khi viết code.
