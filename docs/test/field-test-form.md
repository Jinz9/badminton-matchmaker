# PHIẾU KIỂM THỬ THỰC ĐỊA TẠI SÂN (FIELD TEST FORM)

**Mã tài liệu:** `docs/test/field-test-form.md`  
**Hướng dẫn kịch bản nền:** [field-test-guide.md](file:///d:/QLDAPM/docs/test/field-test-guide.md)  
**Thông tin buổi đánh:**
- **Ngày giờ:** `[TV2 điền: YYYY-MM-DD, HH:MM - HH:MM]`
- **Sân cầu lông:** `[TV2 điền: Tên sân tại Đà Nẵng]`
- **Số lượng người tham gia:** `[TV2 điền: VD 6-12 người]`
- **Thiết bị Host / Người chơi sử dụng:** `[TV2 điền]`

---

## 1. Phiếu Đồng Ý Tham Gia Ẩn Danh (Informed Consent)

> **Mục đích:** Nhóm sinh viên thực hiện buổi đánh thực nghiệm nhằm đánh giá tính tiện dụng của ứng dụng di động **"Hệ thống ghép đội và cân bằng kèo cầu lông (Badminton Matchmaker)"** trong điều kiện thực tế tại sân.  
> **Cam kết bảo mật:**
> - Toàn bộ số liệu đo đạc (thời gian thao tác, số lần chạm, điểm khảo sát SUS và góp ý) được ghi nhận **ẩn danh** (mã người tham gia `P-01`, `P-02`, ...), không công khai số điện thoại hay dữ liệu cá nhân.
> - Kết quả chỉ phục vụ mục đích đánh giá và hoàn thiện đồ án môn học. Người tham gia có quyền dừng trải nghiệm bất kỳ lúc nào.

| Mã người tham gia (Ẩn danh) | Vai trò trong buổi (Host / Mặc định / Vãng lai) | Thiết bị (Android / iOS) | Xác nhận đồng ý tham gia |
|---|---|---|---|
| `P-01` | | | `[ ] Đồng ý` |
| `P-02` | | | `[ ] Đồng ý` |
| `P-03` | | | `[ ] Đồng ý` |
| `P-04` | | | `[ ] Đồng ý` |
| `P-05` | | | `[ ] Đồng ý` |
| `P-06` | | | `[ ] Đồng ý` |
| `P-07` | | | `[ ] Đồng ý` |
| `P-08` | | | `[ ] Đồng ý` |

---

## 2. Kịch bản & Bảng đo trực tiếp tại sân (Quan sát của TV2)

### Kịch bản thực hành trên sân
1. **Trước giờ đánh:** Host tạo kèo, thêm người mặc định, mở tuyển suất trống; vãng lai xin tham gia, Host duyệt.
2. **Tại sân (chia kèo):** Host mở Home Sân Đấu $\to$ chọn người có mặt $\to$ bấm Chia kèo $\to$ xác nhận vào sân.
3. **Thử thách thực tế:**
   - Bật **Chế độ máy bay** giữa buổi $\to$ chia lượt tiếp theo & nhập tỷ số $\to$ tắt Chế độ máy bay để đồng bộ.
   - Thử thao tác **bằng một tay** khi tay cầm vợt / có mồ hôi dưới ánh sáng sân.
4. **Kết thúc:** Chấm thẻ đánh giá 5 giây và kiểm tra biến động Elo.

### Bảng ghi số liệu đo thực tế *(Để trống — TV2 bấm giờ & đếm khi chạy)*
| Lần đo / Tình huống | Số chạm để chia kèo (Mục tiêu $\le 3$) | Thời gian từ bắt đầu đến khi có cặp đấu (giây) | Số lần bấm nhầm | Tình trạng mạng (Online / Máy bay) | Ghi chú quan sát |
|---|---|---|---|---|---|
| Lượt 1 (Mở buổi) | | | | | |
| Lượt 2 (Ca lẻ / Đổi người) | | | | | |
| Lượt 3 (Bật chế độ máy bay) | | | | | |
| Lượt 4 (Có mạng đồng bộ lại) | | | | | |

---

## 3. Phiếu Khảo Sát Tính Khả Dụng Hệ Thống (SUS — 10 câu tiếng Việt)

> Thang điểm mỗi câu: **1** = Hoàn toàn không đồng ý | **2** = Không đồng ý | **3** = Trung lập | **4** = Đồng ý | **5** = Hoàn toàn đồng ý.  
> **Công thức tính SUS:** Với câu lẻ ($1,3,5,7,9$) lấy `(điểm - 1)`; với câu chẵn ($2,4,6,8,10$) lấy `(5 - điểm)`. Cộng 10 giá trị rồi nhân `2.5` (thang `0–100`, đạt khi trung bình $\ge 75$).

| STT | Nội dung câu hỏi (Tiếng Việt) | P-01 | P-02 | P-03 | P-04 | P-05 | P-06 |
|---:|---|---:|---:|---:|---:|---:|---:|
| 1 | Tôi nghĩ rằng mình sẽ muốn sử dụng ứng dụng này thường xuyên khi đi đánh cầu lông. | | | | | | |
| 2 | Tôi thấy ứng dụng này phức tạp một cách không cần thiết. | | | | | | |
| 3 | Tôi thấy ứng dụng này dễ sử dụng tại sân. | | | | | | |
| 4 | Tôi nghĩ rằng mình cần người hỗ trợ kỹ thuật mới dùng được ứng dụng này. | | | | | | |
| 5 | Tôi thấy các chức năng trong ứng dụng được kết nối với nhau rất mượt mà. | | | | | | |
| 6 | Tôi thấy ứng dụng có quá nhiều điểm thiếu nhất quán. | | | | | | |
| 7 | Tôi nghĩ đa số người chơi cầu lông sẽ học cách dùng ứng dụng này rất nhanh. | | | | | | |
| 8 | Tôi thấy ứng dụng cồng kềnh, khó thao tác khi đang đứng ở sân. | | | | | | |
| 9 | Tôi cảm thấy rất tự tin khi sử dụng ứng dụng này. | | | | | | |
| 10 | Tôi phải tìm hiểu rất nhiều thứ trước khi có thể sử dụng được ứng dụng này. | | | | | | |
| | **Điểm SUS từng người (`0–100`)** | | | | | | |

**Điểm SUS trung bình cả nhóm:** `[TV2 điền]`

---

## 4. Câu hỏi mở thu thập phản hồi người dùng thật
1. **Bạn thích nhất điểm nào khi dùng app tại sân hôm nay?**
   - `[TV2 ghi câu trả lời thực tế]`
2. **Bạn gặp khó khăn, bấm nhầm hoặc chậm ở bước nào?**
   - `[TV2 ghi câu trả lời thực tế]`
3. **Kèo được chia hôm nay có cân bằng và hợp lý không? Vì sao?**
   - `[TV2 ghi câu trả lời thực tế]`
4. **Nếu cải thiện 1 điều trước khi dùng cho các buổi đánh tiếp theo, bạn muốn sửa gì?**
   - `[TV2 ghi câu trả lời thực tế]`
