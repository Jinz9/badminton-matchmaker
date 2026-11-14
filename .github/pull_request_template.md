## 📌 Mô tả thay đổi (Description)
<!-- Tóm tắt ngắn gọn những gì PR này thực hiện -->

## 🔗 Liên kết WBS & Issue
- Mã WBS: `[Ví dụ: WBS 3.2, WBS 4.3]`
- Liên kết Issue / Task: `#[Số Issue]`
- Mốc liên quan: `[M1..M12]`

## 🧪 Loại thay đổi (Type of Change)
- [ ] `feat`: Tính năng mới
- [ ] `fix`: Sửa lỗi
- [ ] `docs`: Tài liệu
- [ ] `test`: Ca kiểm thử
- [ ] `refactor`: Tái cấu trúc
- [ ] `chore`: Cấu hình / Hạ tầng

---

## ✅ Checklist Kiểm tra Nghiệp vụ Cầu lông (Domain Rules Check)
> *Dựa trên nguồn sự thật `badminton-domain-rules`*

- [ ] **R1 (Chỉ đánh đôi):** Không có tính năng thi đấu đơn trong PR này.
- [ ] **R2 (Quy mô sân):** Giới hạn tối đa **8 người / sân** và tối đa **2 sân / kèo**.
- [ ] **R3 & R4 (Suất vãng lai):** Công thức tính slot tuyển tuân thủ chuẩn $\text{slot} = \min(4, 8 - \text{core})$.
- [ ] **R6 (Ràng buộc giới tính):** Kiểm tra chặt chẽ điều kiện giới tính theo nội dung sân (đôi nam, đôi nữ, đôi nam nữ).
- [ ] **R9 (Duyệt vãng lai):** Không có cơ chế tự động duyệt ngoài ý muốn; quyền duyệt thuộc về Host.
- [ ] **R10 (Bảo vệ cặp khóa):** Cặp bắt buộc (`self` hoặc `host`) không bao giờ bị tách rời bởi thuật toán.
- [ ] **Xoay tua công bằng:** Đối với ca lẻ (5 người, 7 người), người nghỉ được xoay vòng đều giữa các trận.

---

## 🛡️ Checklist Kỹ thuật & Chất lượng (Engineering Quality)
- [ ] Đã chạy lệnh kiểm thử cục bộ: `npm test` ra kết quả **PASS 100%**.
- [ ] Không có file `.env`, credentials, service account nào bị commit nhầm.
- [ ] Không vi phạm phân quyền thư mục quy định tại `docs/OWNERSHIP.md`.
- [ ] Nếu có thay đổi kiểu dữ liệu (Schema), đã cập nhật tài liệu Data Contract tương ứng.
- [ ] Đã kiểm tra tính năng chạy được khi mất kết nối mạng (Offline simulation).
