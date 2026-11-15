# Danh Sách Ca Kiểm Thử Nghiệp Vụ & Ca Biên Cho Mobile App (TV2)

> **Mã tài liệu:** `docs/test/test-cases-mobile.md`  
> **Người biên soạn:** TV1 (Backend / Domain Lead)  
> **Người thực hiện kiểm thử:** TV2 (Mobile / Frontend Lead)  
> **Thiết bị mục tiêu:** Thiết bị Android & iOS thật (hoặc Expo Go / Dev Client)  
> **Quy ước đánh giá:**  
> - **PASS:** Chức năng hoạt động chính xác theo kỳ vọng  
> - **FAIL:** Sai lệch kết quả hoặc văng ứng dụng (crash)  
> - **BLOCKED:** Bị chặn do lỗi khác hoặc thiếu điều kiện  
> *(Lưu ý: TV2 trực tiếp điền vào các cột **Kết quả thực tế**, **Đánh giá**, và **Ghi chú của TV2** trong quá trình chạy thử nghiệm).*

---

## 1. Module 1: Thuật Toán Ghép Cặp (Partner Finder - P12)

Kiểm thử hàm chấm điểm độ phù hợp (`calculatePartnerScore`) và bộ lọc tìm bạn chơi.

| Mã Ca | Tên Ca Kiểm Thử / Tình Huống | Dữ Liệu Đầu Vào / Thao Tác | Kết Quả Kỳ Vọng (Backend Rules) | Kết Quả Thực Tế (Thiết bị) | Đánh Giá (PASS/FAIL) | Ghi Chú Của TV2 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-PF-01** | Độ lệch Elo đúng ngưỡng 150 | Người A: 1350đ, Người B: 1500đ (lệch đúng 150đ) | Được cộng điểm tương thích Elo tối đa (100đ điểm chênh lệch). | | | |
| **TC-PF-02** | Độ lệch Elo vượt ngưỡng 151 | Người A: 1350đ, Người B: 1501đ (lệch 151đ) | Điểm chênh lệch Elo giảm theo độ dốc tuyến tính, không bị loại bỏ hoàn toàn. | | | |
| **TC-PF-03** | Cặp bài trùng Thuận tay Trái + Phải | Người A: Tay Trái (LEFT), Người B: Tay Phải (RIGHT) | Cộng thêm điểm thưởng phối hợp tay: **+25 điểm**. | | | |
| **TC-PF-04** | Cặp bài trùng Công + Thủ (Vị trí) | Người A: Cầu Sau (BACK), Người B: Cầu Trước (FRONT) | Cộng thêm điểm thưởng vị trí bù trừ: **+40 điểm**. | | | |
| **TC-PF-05** | Hai người cùng cầu trước hoặc cùng tay trái | Người A: FRONT, Người B: FRONT | Không cộng điểm thưởng vị trí bù trừ (0đ cộng thêm). | | | |
| **TC-PF-06** | Lọc theo giới tính cho kèo Đôi Nam Nữ | Kèo: MIXED_DOUBLES. Người A: Nam | Danh sách gợi ý chỉ hiện người chơi Nữ (hoặc ưu tiên tối đa giới tính đối ngẫu). | | | |
| **TC-PF-07** | Lọc theo dải trình độ (Cấp 3–4) | Người dùng chọn bộ lọc: [1200 - 1599] | Chỉ hiển thị các tay vợt nằm trong khoảng điểm Cấp 3 và Cấp 4. | | | |

---

## 2. Module 2: Quản Lý Phòng & Tuyển Vãng Lai (Match Lobby & Slots - P14/P15)

Kiểm thử các quy tắc tuyển người theo CR-01, CR-02 và các giả định A1–A5.

| Mã Ca | Tên Ca Kiểm Thử / Tình Huống | Dữ Liệu Đầu Vào / Thao Tác | Kết Quả Kỳ Vọng (Backend Rules) | Kết Quả Thực Tế (Thiết bị) | Đánh Giá (PASS/FAIL) | Ghi Chú Của TV2 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-SLOT-01** | Sân 4 người mặc định (Core) | Host tạo sân có 4 người mặc định. Bật mở tuyển vãng lai. | Suất tuyển tối đa: $\min(4, 8 - 4) = 4$ suất. Nút "Mở tuyển" sáng. | | | |
| **TC-SLOT-02** | Sân 6 người mặc định (Core) | Host tạo sân có 6 người mặc định. Bật mở tuyển vãng lai. | Suất tuyển tối đa: $\min(4, 8 - 6) = 2$ suất. Không cho phép tuyển 3 hay 4. | | | |
| **TC-SLOT-03** | Sân 8 người mặc định (Đủ tải) | Host tạo sân có 8 người mặc định. | Số suất tuyển $= 0$. Nút mở tuyển bị disable hoặc báo "Sân đã đủ người". | | | |
| **TC-SLOT-04** | Chặn tăng core làm quá 8 người (A4) | Sân có 5 core + 2 vãng lai đã nhận ($=7$). Host cố gắng thêm 2 core nữa ($=9$). | **Hard Block:** Ứng dụng chặn thao tác, thông báo lỗi *"Không thể thêm thành viên cố định vì vượt quá 8 người/sân"*. | | | |
| **TC-SLOT-05** | Đăng ký khi hết suất $\implies$ Vào Waitlist | Kèo đã nhận đủ suất tuyển. Người chơi B bấm "Đăng ký tham gia". | Tự động chuyển vào danh sách chờ (Waitlist) với vị trí số 1 (FIFO). | | | |
| **TC-SLOT-06** | Đôn Waitlist tự động khi có người hủy | Thành viên vãng lai A bấm "Hủy tham gia". | Người đứng đầu Waitlist (FIFO) tự động được đôn lên danh sách tham gia chính thức. | | | |
| **TC-SLOT-07** | Bỏ qua người Waitlist bị trùng giờ | Người đứng đầu Waitlist đã tham gia một kèo khác cùng khung giờ. | Hệ thống bỏ qua người này, đôn người tiếp theo trong hàng đợi. | | | |
| **TC-SLOT-08** | Giới hạn số sân của kèo (CR-01) | Host cố gắng chọn số sân $= 3$ khi tạo kèo. | Giao diện chặn hoặc báo lỗi: Kèo giao lưu chỉ cho phép 1 hoặc 2 sân ($1 \le \text{courts} \le 2$). | | | |

---

## 3. Module 3: Cân Kèo & Xếp Lượt Đánh (Court Balancing - P15)

Kiểm thử thuật toán `balanceCourt` trên các ca số lượng người có mặt tại sân.

| Mã Ca | Tên Ca Kiểm Thử / Tình Huống | Dữ Liệu Đầu Vào / Thao Tác | Kết Quả Kỳ Vọng (Backend Rules) | Kết Quả Thực Tế (Thiết bị) | Đánh Giá (PASS/FAIL) | Ghi Chú Của TV2 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-BAL-01** | Ca chuẩn 4 người có mặt | Sân có 4 người: [1600, 1550, 1400, 1350] | Chia đúng 1 trận đôi: Đội A (1600 + 1350 = 2950) vs Đội B (1550 + 1400 = 2950). Độ lệch = 0. Không ai nghỉ. | | | |
| **TC-BAL-02** | Ca lẻ 5 người (Vòng 1) | Sân có 5 người. Chưa ai có lịch sử nghỉ đấu. | Xếp 1 trận 4 người. Đúng 1 người có điểm nghỉ cao nhất được chọn nghỉ luân phiên. | | | |
| **TC-BAL-03** | Ca lẻ 5 người (Vòng 2 - Xoay tua) | Chạy tiếp vòng 2 sau khi người X đã nghỉ ở Vòng 1. | Người X **bắt buộc được vào sân đánh**, người khác chưa nghỉ sẽ được chọn nghỉ. | | | |
| **TC-BAL-04** | Ca 6 người (Xoay vòng 2 người nghỉ) | Sân có 6 người có mặt. | 4 người thi đấu, 2 người nghỉ luân phiên công bằng. | | | |
| **TC-BAL-05** | Ca lẻ 7 người (3 người nghỉ luân phiên) | Sân có 7 người có mặt. | 4 người thi đấu, 3 người nghỉ xoay tua. | | | |
| **TC-BAL-06** | Ca tối đa 8 người (2 trận song song) | Sân có đủ 8 người có mặt. | Xếp đủ 2 trận đấu song song (Trận 1 và Trận 2), không có người nào phải ngồi ngoài. | | | |
| **TC-BAL-07** | Hoán đổi người chơi (Swap players) | Host kéo thả đổi vị trí giữa Người A (Đội 1) và Người B (Đội 2). | Cặp đấu cập nhật tức thì trên giao diện, tính lại tổng điểm và độ chênh lệch. | | | |
| **TC-BAL-08** | Cảnh báo chênh lệch điểm quá lớn | 4 người: [2100, 2000, 850, 800]. Độ lệch dù chia tối ưu vẫn $> 300$đ. | Giao diện hiển thị icon cảnh báo (Warning Badge) *"Kèo chênh lệch trình độ cao"*. | | | |

---

## 4. Module 4: Tính Điểm Elo & Độ Uy Tín (Rating & Settlement - P16)

Kiểm thử nhập tỷ số và cập nhật điểm sau trận đấu.

| Mã Ca | Tên Ca Kiểm Thử / Tình Huống | Dữ Liệu Đầu Vào / Thao Tác | Kết Quả Kỳ Vọng (Backend Rules) | Kết Quả Thực Tế (Thiết bị) | Đánh Giá (PASS/FAIL) | Ghi Chú Của TV2 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-ELO-01** | Tỷ số hợp lệ thông thường | Đội A thắng Đội B: Set 1 (21-17), Set 2 (21-19). | Chấp nhận kết quả. Đội A được cộng Elo, Đội B bị trừ Elo tương ứng. | | | |
| **TC-ELO-02** | Tỷ số Deuce hợp lệ (29-29 lên 30) | Đội A thắng Set 1 với tỷ số 30-29. | Hợp lệ theo luật cầu lông thế giới BWF (chạm 30 trước là thắng dù cách 1 điểm). | | | |
| **TC-ELO-03** | Tỷ số không hợp lệ (Chưa cách 2 điểm) | Host nhập tỷ số 21-20 mà không đấu tiếp. | Ứng dụng báo lỗi: *"Tỷ số set không hợp lệ (cách 1 điểm tại 21, phải đánh tiếp chạm 2 điểm hoặc đến 30)"*. | | | |
| **TC-ELO-04** | Kẹp trần sàn Elo (Min 800, Max 2200) | Người chơi thua có 805 điểm, thua trận tính ra trừ 10 điểm. | Điểm Elo mới bị kẹp ở mức tối thiểu: **800 điểm** (không tụt xuống 795). | | | |
| **TC-ELO-05** | Người mặc định chưa có tài khoản (Ghost User) | Đội A gồm: 1 user thật + 1 ghost user (tạo bởi host). | User thật nhận điểm Elo bình thường. Ghost user không phát sinh bản ghi cập nhật rating. | | | |
| **TC-ELO-06** | Đánh giá chéo có đồng thuận ($\ge 2$ votes) | 2 người chơi khác cùng gắn thẻ "Đúng trình" cho Người A. | Người A được áp dụng hệ số đánh giá chéo hợp lệ (không bị phạt trần). | | | |
| **TC-ELO-07** | Trừ điểm uy tín khi bùng kèo (No-show) | Host xác nhận thành viên B không đến sân mà không báo trước. | Điểm uy tín của B bị trừ **-15 điểm**. Lưu vào lịch sử uy tín. | | | |
| **TC-ELO-08** | Thao tác nhập điểm trùng lặp (Idempotency) | Host vô tình ấn nút "Xác nhận kết quả" 2 lần liên tiếp nhanh. | Giao dịch chỉ xử lý đúng 1 lần, không bị cộng/trừ 2 lần điểm Elo. | | | |

---

## 5. Kiểm Thử Môi Trường Thực Địa Tại Sân Cầu Lông (Field Tests - Đà Nẵng)

Kiểm thử độ ổn định khi mất mạng, chập chờn 4G và thao tác đồng thời.

| Mã Ca | Kịch Bản Thực Địa | Điều Kiện Thử Nghiệm | Tiêu Chí Đạt (Acceptance Criteria) | Kết Quả Thực Tế | Đánh Giá | Ghi Chú Của TV2 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-FIELD-01** | **Mất mạng hoàn toàn tại sân mái tôn** | Bật chế độ máy bay (Airplane Mode) khi đang ở màn hình xếp cặp. | - Host bấm "Xếp cặp vòng tiếp theo" vẫn chạy ra kết quả ngay lập tức.<br>- Badge "Đang offline" hiển thị trên UI.<br>- Ứng dụng không bị đơ hoặc văng (crash). | | | |
| **TC-FIELD-02** | **Đồng bộ tự động khi ra khỏi sân (Có mạng lại)** | Tắt chế độ máy bay khi rời sân. | - Hàng đợi action tự động đẩy lên Firestore.<br>- Dữ liệu trên server khớp chính xác với kết quả đã xếp offline.<br>- Badge offline biến mất. | | | |
| **TC-FIELD-03** | **Hai thành viên bấm Đăng ký cùng một thời điểm** | 2 điện thoại cùng ấn "Tham gia" khi kèo chỉ còn đúng 1 suất cuối. | - Đúng 1 người được duyệt vào suất chính thức.<br>- Người thứ 2 được thông báo hết chỗ và hỏi có muốn vào Waitlist không. | | | |
| **TC-FIELD-04** | **Host hủy toàn bộ kèo trước giờ đánh** | Kèo có 6 người tham gia. Host bấm "Hủy buổi đánh". | - Tất cả 6 thành viên nhận được thông báo trạng thái CANCELLED.<br>- Không ai bị trừ điểm uy tín.<br>- Kèo đóng lại. | | | |
| **TC-FIELD-05** | **Quét mã VietQR chuyển tiền sân** | Màn hình chi tiết kèo hiển thị mã VietQR thanh toán tiền sân. | Ứng dụng ngân hàng quét mã hiển thị đúng số tài khoản, tên ngân hàng và số tiền chia theo đầu người. | | | |

---

## 6. Hướng Dẫn Dành Cho TV2 Khi Điền Báo Cáo

1. **Khi gặp lỗi (FAIL):**
   - Chụp màn hình (screenshot) hoặc copy logcat / console log.
   - Ghi rõ mã ca kiểm thử (ví dụ: `TC-SLOT-04`) và thiết bị thử nghiệm (ví dụ: `iPhone 13 iOS 17.4` hoặc `Samsung Galaxy A53 Android 13`).
   - Tạo issue trên GitHub repository hoặc nhắn tin cho TV1 kèm payload lỗi để đối soát.
2. **Khi hoàn thành:**
   - Cập nhật file này và lưu vào báo cáo nghiệm thu kiểm thử của đồ án.
