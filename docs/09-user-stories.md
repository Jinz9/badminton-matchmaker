# DANH SÁCH CÂU CHUYỆN NGƯỜI DÙNG (USER STORIES)

**Dự án:** Hệ thống ghép đội và cân bằng kèo cầu lông (Mobile App)  
**Tài liệu:** `docs/09-user-stories.md`  
**Phiên bản:** 1.0 (Phục vụ lập kế hoạch Sprint 1–6)  
**Tác giả:** Đào Duy Nhật (TV1 - PM, BA, Backend & Thuật toán)  
**Tài liệu liên quan:** `docs/07-srs.md`, `docs/08-use-cases.md`, `docs/user-stories.csv`  

---

## 1. QUY ƯỚC ĐỊNH DẠNG USER STORY

Mỗi câu chuyện người dùng được cấu trúc chuẩn hóa theo cú pháp Agile:
- **Tiêu đề:** Là `[Vai trò người dùng]`, tôi muốn `[Hành động / Tính năng]`, để `[Giá trị / Lợi ích mang lại]`.
- **Mã FR:** Liên kết tới Yêu cầu chức năng trong [docs/07-srs.md](file:///d:/QLDAPM/docs/07-srs.md).
- **Mục WBS:** Gói công việc chịu trách nhiệm theo [docs/03-wbs-raci.md](file:///d:/QLDAPM/docs/03-wbs-raci.md).
- **Mức ưu tiên:** Must Have (M), Should Have (S), Could Have (C).
- **Điểm ước lượng (Story Points - SP):** Ước lượng độ phức tạp theo dãy Fibonacci ($1, 2, 3, 5, 8, 13$).
- **Tiêu chí chấp nhận (Acceptance Criteria):** Viết theo chuẩn BDD (Behavior-Driven Development):  
  - **Given** [Bối cảnh / Tiền điều kiện ban đầu]  
  - **When** [Hành động kích hoạt của người dùng]  
  - **Then** [Kết quả kỳ vọng hệ thống trả về]  

---

## 2. BẢNG CHI TIẾT USER STORIES (44 STORIES)

---

### PHÂN HỆ 1: HỒ SƠ & ĐÁNH GIÁ TRÌNH ĐỘ BAN ĐẦU (MODULE 1)

#### US-01: Đăng nhập nhanh bằng tài khoản Google
- **User Story:** Là **người chơi mới**, tôi muốn **đăng nhập nhanh bằng tài khoản Google sẵn có trên điện thoại**, để **không mất thời gian nhập mật khẩu phức tạp**.
- **Mã FR:** FR-01 | **Mục WBS:** WBS 3.2, 4.1 | **Ưu tiên:** Must Have | **Điểm ước lượng:** 2 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Ứng dụng đang ở màn hình Đăng nhập và thiết bị có kết nối mạng.
  - *When:* Người dùng bấm nút "Tiếp tục với Google" và chọn tài khoản Google cá nhân.
  - *Then:* Firebase Authentication xác thực thành công, hệ thống tự động tạo bản ghi `users/{uid}` nếu chưa có và chuyển tiếp vào app trong vòng dưới 2 giây.

#### US-02: Đăng ký tài khoản bằng Email và Mật khẩu
- **User Story:** Là **người chơi không dùng Google**, tôi muốn **đăng ký tài khoản bằng Email và mật khẩu riêng**, để **chủ động quản lý tài khoản**.
- **Mã FR:** FR-01 | **Mục WBS:** WBS 3.2, 4.1 | **Ưu tiên:** Must Have | **Điểm ước lượng:** 3 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Người dùng ở màn hình Đăng ký tài khoản.
  - *When:* Người dùng nhập Email hợp lệ và mật khẩu từ 6 ký tự trở lên rồi bấm "Đăng ký".
  - *Then:* Hệ thống gửi email xác thực, tạo tài khoản và chuyển người dùng vào bước Onboarding tiếp theo.

#### US-03: Trắc nghiệm Onboarding 10 câu tự đánh giá trình độ
- **User Story:** Là **người chơi mới**, tôi muốn **trả lời bảng câu hỏi trắc nghiệm 10 câu về kỹ thuật và kinh nghiệm cầu lông**, để **hệ thống xác định trình độ phong trào của tôi một cách khách quan nhất**.
- **Mã FR:** FR-02 | **Mục WBS:** WBS 2.1, 3.1, 4.1 | **Ưu tiên:** Must Have | **Điểm ước lượng:** 5 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Người chơi vừa tạo tài khoản và chưa có điểm Elo.
  - *When:* Người chơi hoàn thành trả lời 10 câu hỏi với các mức từ 1 đến 4 điểm.
  - *Then:* Hệ thống tính tổng điểm ($10–40$) và hiển thị Cấp độ phong trào từ Cấp 1 đến Cấp 6 theo đúng quy chuẩn Đà Nẵng (Yếu, TB-, TB, TB+, Khá, Tốt / Bán chuyên).

#### US-04: Khởi tạo điểm Elo và gán nhãn Đang hiệu chỉnh (Provisional)
- **User Story:** Là **hệ thống**, tôi muốn **gán mức điểm Elo khởi tạo tương ứng với cấp độ và bật cờ provisional**, để **thuật toán có thể hiệu chỉnh nhanh điểm số trong các trận đầu tiên**.
- **Mã FR:** FR-02, FR-05 | **Mục WBS:** WBS 3.1 | **Ưu tiên:** Must Have | **Điểm ước lượng:** 2 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Người chơi vừa hoàn thành khảo sát và được xếp vào Cấp 3 (TB).
  - *When:* Hệ thống lưu dữ liệu hồ sơ.
  - *Then:* Điểm Elo được khởi tạo là $1425$, trường `isProvisional` mang giá trị `true`, hệ số $K = 40$ và điểm uy tín khởi tạo là $100$.

#### US-05: Khai báo tay thuận, lối chơi và khu vực hoạt động
- **User Story:** Là **người chơi**, tôi muốn **chọn tay thuận (Trái/Phải), vị trí sở trường (Lưới/Công/Linh hoạt) và Quận/Huyện tại Đà Nẵng**, để **hệ thống tìm kiếm các kèo và bạn chơi bù trừ lối đánh phù hợp nhất**.
- **Mã FR:** FR-03 | **Mục WBS:** WBS 3.2, 4.1 | **Ưu tiên:** Must Have | **Điểm ước lượng:** 3 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Người chơi đang ở bước hoàn thiện hồ sơ.
  - *When:* Người chơi chọn "Tay trái", "Chuyên lưới (front)", và khu vực "Hải Châu" rồi bấm "Lưu".
  - *Then:* Thông tin được lưu vào hồ sơ cá nhân và hiển thị huy hiệu trực quan trên Player Card.

#### US-06: Xem Thẻ thông tin cá nhân (Player Card) và Chỉ số uy tín
- **User Story:** Là **người chơi**, tôi muốn **xem thẻ hồ sơ của mình gồm Cấp độ, Điểm Elo, Điểm uy tín và Tỷ lệ thắng**, để **theo dõi sự tiến bộ và khẳng định uy tín thể thao của bản thân**.
- **Mã FR:** FR-04 | **Mục WBS:** WBS 4.1 | **Ưu tiên:** Must Have | **Điểm ước lượng:** 3 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Người chơi mở tab Hồ sơ cá nhân.
  - *When:* Màn hình tải xong dữ liệu.
  - *Then:* Hiển thị đầy đủ Avatar, Tên, Cấp độ, Thanh đo điểm uy tín (màu xanh nếu $\ge 80$, vàng nếu $50–79$, đỏ nếu $< 50$) và tổng số trận thắng/thua.

#### US-07: Tự động chuyển đổi tài khoản sang Chính thức sau 5 trận
- **User Story:** Là **người chơi**, tôi muốn **tài khoản của mình được công nhận chính thức sau 5 trận đấu**, để **điểm số Elo ổn định và đáng tin cậy hơn trong mắt các chủ kèo**.
- **Mã FR:** FR-05 | **Mục WBS:** WBS 3.1 | **Ưu tiên:** Must Have | **Điểm ước lượng:** 2 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Người chơi đang có 4 trận đấu hợp lệ (`isProvisional == true`).
  - *When:* Người chơi hoàn thành trận đấu thứ 5 và tỷ số được xác nhận.
  - *Then:* Hệ thống tự động gỡ cờ provisional (`isProvisional = false`), chuyển hệ số biến động sang $K = 24$ và hiển thị huy hiệu "Đã xác thực trình độ".

#### US-08: Chỉnh sửa thông tin hồ sơ và cấu hình mã thanh toán VietQR
- **User Story:** Là **người chơi / Host**, tôi muốn **cập nhật số điện thoại, biệt danh và thông tin tài khoản ngân hàng để tạo mã VietQR**, để **bạn chơi tiện liên hệ và chuyển khoản tiền sân**.
- **Mã FR:** FR-06 | **Mục WBS:** WBS 4.1 | **Ưu tiên:** Should Have | **Điểm ước lượng:** 3 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Người dùng ở màn hình Chỉnh sửa hồ sơ.
  - *When:* Nhập Số tài khoản "123456789", chọn Ngân hàng "MB Bank" và bấm "Lưu".
  - *Then:* Hệ thống kiểm tra hợp lệ, lưu vào Firestore và tự động hiển thị mã VietQR mẫu xem trước.

---

### PHÂN HỆ 2: GHÉP ĐỒNG ĐỘI & CHIA CẶP CÂN KÈO (MODULE 2)

#### US-09: Tìm kiếm đồng đội theo dải Elo tương thích (<= 150 điểm)
- **User Story:** Là **người chơi tự do**, tôi muốn **tìm bạn đánh đôi có trình độ lệch không quá 150 điểm Elo so với tôi**, để **trận đấu ngang sức và không bị lệch nhịp thi đấu**.
- **Mã FR:** FR-07 | **Mục WBS:** WBS 3.3, 4.2 | **Ưu tiên:** Must Have | **Điểm ước lượng:** 5 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Tôi có Elo là $1400$ điểm.
  - *When:* Tôi mở tính năng Partner Finder và chọn dải trình độ phù hợp.
  - *Then:* Danh sách kết quả chỉ hiển thị những người chơi có Elo từ $1250$ đến $1550$ điểm.

#### US-10: Gợi ý ghép đôi bù trừ lối chơi và tay thuận
- **User Story:** Là **người chơi chuyên lưới và thuận tay trái**, tôi muốn **hệ thống ưu tiên gợi ý người chuyên công thuận tay phải**, để **tạo thành cặp đôi công thủ toàn diện**.
- **Mã FR:** FR-07 | **Mục WBS:** WBS 3.3, 4.2 | **Ưu tiên:** Must Have | **Điểm ước lượng:** 5 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Tôi có thông số `hand: "left"`, `playStyle: "front"`.
  - *When:* Hệ thống tính toán điểm tương thích Partner Finder.
  - *Then:* Ứng viên có `hand: "right"`, `playStyle: "back"` được cộng $+40$ điểm vị trí và $+25$ điểm tay thuận, xếp ở nhóm đầu danh sách gợi ý kèm nhãn "Cực kỳ ăn ý (95%)".

#### US-11: Chia cặp tự động cân bằng Elo cho sân đấu trong 1 giây
- **User Story:** Là **Host tại sân**, tôi muốn **bấm 1 nút để hệ thống tự động chia 4–8 người thành các cặp đấu cân bằng nhất**, để **không mất thời gian tính toán đau đầu giữa các set**.
- **Mã FR:** FR-08 | **Mục WBS:** WBS 3.3, 4.4a | **Ưu tiên:** Must Have | **Điểm ước lượng:** 8 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Sân đang có 8 người chơi được tick chọn có mặt.
  - *When:* Host bấm nút "Chia cặp tự động".
  - *Then:* Hệ thống phân bổ thành 2 cặp đấu thi đấu set đầu tiên sao cho $|\text{Elo}_{\text{Đội 1}} - \text{Elo}_{\text{Đội 2}}|$ là nhỏ nhất có thể, thời gian hiển thị kết quả $< 1.0$ giây.

#### US-12: Ràng buộc giới tính theo thể thức sân khi chia cặp
- **User Story:** Là **Host của sân Đôi nam nữ (Mixed)**, tôi muốn **mỗi cặp đấu luôn gồm đúng 1 Nam và 1 Nữ**, để **đúng luật thi đấu và công bằng thể lực**.
- **Mã FR:** FR-08 | **Mục WBS:** WBS 3.3, 4.4a | **Ưu tiên:** Must Have | **Điểm ước lượng:** 5 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Sân có thể thức `category: "mixed"` gồm 4 Nam và 4 Nữ.
  - *When:* Host bấm chia cặp.
  - *Then:* $100\%$ các cặp đấu được sinh ra đều là 1 Nam + 1 Nữ; không có cặp nào gồm 2 Nam hoặc 2 Nữ.

#### US-13: Khóa cặp đánh cố định không cho hệ thống tách rời
- **User Story:** Là **Host**, tôi muốn **khóa cố định một cặp đôi đã bắt cặp với nhau**, để **họ luôn thi đấu cùng nhau trong suốt buổi đánh**.
- **Mã FR:** FR-09 | **Mục WBS:** WBS 3.3, 4.4a | **Ưu tiên:** Must Have | **Điểm ước lượng:** 3 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Host chọn Bạn A và Bạn B và bấm biểu tượng ổ khóa (`isLocked: true`).
  - *When:* Host bấm chia cặp tự động hoặc chuyển set tiếp theo.
  - *Then:* Bạn A và Bạn B luôn nằm chung một đội, thuật toán chỉ ghép và xoay các đối thủ đối diện.

#### US-14: Xoay vòng lượt nghỉ công bằng cho ca 5 hoặc 7 người chơi
- **User Story:** Là **người chơi trong sân có 5 người**, tôi muốn **số set được vào sân thi đấu được chia đều cho tất cả mọi người**, để **không ai bị cho ra rìa hoặc phải ngồi ngoài quá lâu**.
- **Mã FR:** FR-10 | **Mục WBS:** WBS 3.3, 4.4a | **Ưu tiên:** Must Have | **Điểm ước lượng:** 5 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Sân có 5 người chơi và set 1 Người E đã ngồi nghỉ.
  - *When:* Host bấm chia set 2.
  - *Then:* Người E chắc chắn được vào sân thi đấu; một trong 4 người vừa đánh ở set 1 sẽ ra nghỉ luân phiên.

#### US-15: Hiển thị sơ đồ sân thi đấu trực quan và danh sách nghỉ
- **User Story:** Là **người chơi tại sân**, tôi muốn **nhìn vào màn hình điện thoại của Host để biết ngay set này tôi đánh với ai, gặp ai và ai đang nghỉ**, để **nhanh chóng vào đúng vị trí trên sân**.
- **Mã FR:** FR-10 | **Mục WBS:** WBS 4.4a | **Ưu tiên:** Must Have | **Điểm ước lượng:** 5 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Host vừa hoàn tất chia cặp cho set đấu.
  - *When:* Màn hình hiển thị Sơ đồ sân đấu.
  - *Then:* Giao diện mô phỏng thảm sân cầu lông với Đội Xanh (2 người) ở nửa sân trên, Đội Đỏ (2 người) ở nửa sân dưới kèm Cấp độ/Elo, và danh sách những người đang nghỉ ở hàng dưới cùng.

#### US-16: Hoán đổi vị trí người chơi thủ công bằng 2 lần chạm
- **User Story:** Là **Host**, tôi muốn **chạm vào 2 người chơi bất kỳ để đổi chỗ cho nhau**, để **linh hoạt xử lý khi có người mệt xin nghỉ đột xuất hoặc muốn đổi đối thủ**.
- **Mã FR:** FR-11 | **Mục WBS:** WBS 4.4a | **Ưu tiên:** Must Have | **Điểm ước lượng:** 3 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Sơ đồ sân đang hiển thị 4 người đánh và 2 người nghỉ.
  - *When:* Host chạm vào Người A (đang đánh) rồi chạm vào Người B (đang nghỉ).
  - *Then:* Vị trí hai người lập tức hoán đổi cho nhau, hệ thống tính toán lại độ lệch Elo mới trong vòng 0.2 giây.

#### US-17: Quản lý kèo 2 sân độc lập trong cùng một buổi đánh
- **User Story:** Là **Host thuê 2 sân cùng lúc**, tôi muốn **chuyển đổi qua lại giữa Sân 1 và Sân 2 trên cùng một màn hình**, để **dễ dàng điều phối tối đa 16 người chơi**.
- **Mã FR:** FR-12 | **Mục WBS:** WBS 3.3, 4.3 | **Ưu tiên:** Should Have | **Điểm ước lượng:** 5 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Kèo có cấu hình 2 sân.
  - *When:* Host bấm vào Tab "Sân 2 (Đôi nam)".
  - *Then:* Màn hình chuyển sang hiển thị đúng danh sách 8 người và sơ đồ thi đấu riêng của Sân 2 mà không làm ảnh hưởng tới Sân 1.

#### US-18: Chuyển đổi sang Chế độ ghép cặp giao lưu ngẫu nhiên (Fun Mode)
- **User Story:** Là **Host của buổi đánh vui vẻ cuối tuần**, tôi muốn **bật chế độ ghép cặp ngẫu nhiên**, để **mọi người được giao lưu chéo với nhau mà không quá đặt nặng điểm số thắng thua**.
- **Mã FR:** FR-13 | **Mục WBS:** WBS 3.3 | **Ưu tiên:** Could Have | **Điểm ước lượng:** 2 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Host đang ở màn hình chia cặp.
  - *When:* Bật công tắc "Chế độ Giao lưu (Fun Match)".
  - *Then:* Thuật toán ưu tiên ghép những người chưa từng bắt cặp với nhau, giảm trọng số chênh lệch Elo.

---

### PHÂN HỆ 3: QUẢN LÝ KÈO & TUYỂN SUẤT VÃNG LAI (MODULE 3)

#### US-19: Tạo phòng kèo mới chọn sân nhanh từ danh mục Đà Nẵng
- **User Story:** Là **Host**, tôi muốn **tạo kèo mới và chọn nhanh sân cầu quen thuộc (ví dụ Sân Kỳ Đồng, Tuyên Sơn)**, để **không phải gõ lại địa chỉ phức tạp**.
- **Mã FR:** FR-14 | **Mục WBS:** WBS 3.2, 4.3 | **Ưu tiên:** Must Have | **Điểm ước lượng:** 3 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Host ở màn hình Tạo kèo.
  - *When:* Gõ chữ "Kỳ" vào ô địa điểm $\to$ gợi ý "Sân cầu lông Kỳ Đồng - 49 Kỳ Đồng, Thanh Khê" xuất hiện $\to$ Host chọn.
  - *Then:* Địa chỉ sân và vị trí bản đồ được tự động điền vào form tạo kèo.

#### US-20: Cấu hình dải trình độ và chi phí chia sẻ tiền sân
- **User Story:** Là **Host**, tôi muốn **đặt yêu cầu trình độ sân từ Cấp 2 đến Cấp 4 và ghi rõ tiền sân 50k/người**, để **người chơi vãng lai biết trước có phù hợp với mình hay không**.
- **Mã FR:** FR-14 | **Mục WBS:** WBS 3.2, 4.3 | **Ưu tiên:** Must Have | **Điểm ước lượng:** 3 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Host đang cấu hình Sân 1 trong form tạo kèo.
  - *When:* Chọn dải trình độ `minLevel: 2`, `maxLevel: 4` và nhập `costPerPlayer: 50000`.
  - *Then:* Thông tin hiển thị rõ ràng trên thẻ kèo công khai ngoài sảnh chờ: "Cấp TB- đến TB+ | 50.000đ/người".

#### US-21: Thêm người mặc định vào sân trước khi mở tuyển
- **User Story:** Là **Host**, tôi muốn **thêm 5 người bạn quen trong nhóm vào sân trước**, để **hệ thống biết nhóm cố định đã có bao nhiêu người**.
- **Mã FR:** FR-15 | **Mục WBS:** WBS 3.2, 4.3 | **Ưu tiên:** Must Have | **Điểm ước lượng:** 3 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Phòng kèo vừa được tạo với sân trống.
  - *When:* Host tìm và thêm 5 tài khoản bạn bè vào nhóm mặc định.
  - *Then:* Danh sách roster cập nhật 5 người có nhãn `Core`, trạng thái `confirmed`.

#### US-22: Thêm thành viên "ghost" chưa có tài khoản app
- **User Story:** Là **Host**, tôi muốn **nhập tên, giới tính và trình độ ước lượng cho bạn chơi chưa cài app**, để **vẫn đưa họ vào sơ đồ chia cặp tại sân**.
- **Mã FR:** FR-15 | **Mục WBS:** WBS 3.2, 4.3 | **Ưu tiên:** Must Have | **Điểm ước lượng:** 3 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Bạn chơi của Host không dùng smartphone hoặc chưa cài app.
  - *When:* Host bấm "Thêm thành viên ghost", nhập tên "Anh Tuấn", chọn "Nam", Cấp độ "3 (TB)".
  - *Then:* Thành viên "Anh Tuấn" xuất hiện trên sân với nhãn `Ghost`, tham gia chia cặp bình thường nhưng không lưu Elo cá nhân.

#### US-23: Tự động tính số suất tuyển vãng lai theo công thức min(4, 8 - Core)
- **User Story:** Là **hệ thống**, tôi muốn **tự động tính số suất tuyển = min(4, 8 - Core)**, để **đảm bảo số lượng người trong sân không bao giờ vượt quá 8 người**.
- **Mã FR:** FR-16 | **Mục WBS:** WBS 3.1, 4.3 | **Ưu tiên:** Must Have | **Điểm ước lượng:** 2 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Sân có 5 người mặc định.
  - *When:* Hệ thống tính toán số suất tuyển.
  - *Then:* Số suất hiển thị là $3$ suất ($\min(4, 8 - 5) = 3$). Nếu thêm 1 người mặc định nữa ($Core = 6$), suất tự động giảm còn $2$.

#### US-24: Xem danh sách các kèo đang mở tuyển tại Đà Nẵng
- **User Story:** Là **người chơi vãng lai**, tôi muốn **lướt danh sách các kèo đang tuyển người trong ngày**, để **tìm sân tham gia giao lưu buổi tối**.
- **Mã FR:** FR-17 | **Mục WBS:** WBS 4.3 | **Ưu tiên:** Must Have | **Điểm ước lượng:** 3 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Người chơi mở ứng dụng ở tab "Kèo cầu".
  - *When:* Màn hình tải danh sách.
  - *Then:* Danh sách các phòng kèo hiển thị rõ ràng: Tên sân, Giờ đánh, Số suất còn trống, Thể thức, Avatar Host và Huy hiệu uy tín của Host.

#### US-25: Bộ lọc kèo theo Quận/Huyện, Thể thức và Trình độ
- **User Story:** Là **người chơi vãng lai**, tôi muốn **lọc kèo ở Quận Hải Châu hoặc Thanh Khê và đúng trình độ của tôi**, để **không mất thời gian bấm vào các sân quá xa hoặc quá chênh lệch**.
- **Mã FR:** FR-17 | **Mục WBS:** WBS 4.3 | **Ưu tiên:** Must Have | **Điểm ước lượng:** 3 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Người chơi đang ở sảnh chờ.
  - *When:* Chọn bộ lọc: Khu vực = "Hải Châu", Thể thức = "Đôi nam", Khớp trình độ của tôi = "Bật".
  - *Then:* Danh sách chỉ trả về các kèo thỏa mãn đúng toàn bộ các tiêu chí đã chọn.

#### US-26: Gửi yêu cầu đặt suất tham gia kèo
- **User Story:** Là **người chơi vãng lai**, tôi muốn **bấm "Xin tham gia" vào một sân còn suất trống**, để **gửi hồ sơ của tôi cho Host xem xét**.
- **Mã FR:** FR-18 | **Mục WBS:** WBS 3.2, 4.3 | **Ưu tiên:** Must Have | **Điểm ước lượng:** 3 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Sân 1 còn 2 suất trống và tôi đáp ứng đúng điều kiện giới tính/uy tín.
  - *When:* Tôi bấm nút "Xin tham gia".
  - *Then:* Trạng thái chuyển thành "Đã gửi yêu cầu (Chờ duyệt)", hệ thống gửi thông báo tức thời tới Host.

#### US-27: Host xem hồ sơ và bấm Duyệt / Từ chối ứng viên
- **User Story:** Là **Host**, tôi muốn **xem Cấp độ, Điểm uy tín và Tỷ lệ thắng của người xin trước khi bấm Duyệt**, để **chọn được người chơi phù hợp nhất với nhóm**.
- **Mã FR:** FR-19 | **Mục WBS:** WBS 3.2, 4.3 | **Ưu tiên:** Must Have | **Điểm ước lượng:** 5 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Có 1 đơn xin tham gia mới.
  - *When:* Host mở Player Card của ứng viên, thấy điểm uy tín $95$, trình độ Cấp 3 (hợp lệ) $\to$ bấm "Duyệt".
  - *Then:* Người chơi được chuyển sang trạng thái `confirmed`, số suất trống của sân giảm 1, người chơi nhận được thông báo mừng.

#### US-28: Đăng ký vào Hàng đợi dự bị (Waitlist) khi sân đã hết chỗ
- **User Story:** Là **người chơi đến sau**, tôi muốn **đăng ký vào danh sách dự bị khi sân đã đủ người**, để **có cơ hội được đôn lên nếu có ai đó bận hủy phút chót**.
- **Mã FR:** FR-20 | **Mục WBS:** WBS 3.2 | **Ưu tiên:** Must Have | **Điểm ước lượng:** 3 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Sân đã đủ $4/4$ vãng lai được duyệt (0 suất trống).
  - *When:* Người chơi bấm "Đăng ký vào Hàng đợi dự bị".
  - *Then:* Hệ thống lưu vào danh sách `waitlist` kèm số thứ tự hàng đợi (ví dụ: "Dự bị số 1").

#### US-29: Tự động đôn người từ Waitlist khi có người hủy suất
- **User Story:** Là **người chơi trong danh sách dự bị**, tôi muốn **hệ thống tự động đôn tôi lên suất chính thức ngay khi có người hủy**, để **tôi kịp chuẩn bị đồ đạc đến sân**.
- **Mã FR:** FR-20 | **Mục WBS:** WBS 3.2 | **Ưu tiên:** Must Have | **Điểm ước lượng:** 5 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Tôi là người đứng đầu danh sách Waitlist hợp lệ.
  - *When:* Một vãng lai chính thức bấm "Hủy tham gia".
  - *Then:* Hệ thống tự động chuyển tôi thành `confirmed`, gửi Push Notification khẩn cấp báo tôi đã có suất chính thức.

#### US-30: Cơ chế hủy tham gia và phạt điểm uy tín theo mốc thời gian
- **User Story:** Là **hệ thống**, tôi muốn **phạt trừ điểm uy tín khi người chơi hủy tham gia (trừ 5 điểm nếu trước 2h, trừ 20 điểm nếu sát giờ)**, để **răn đe hành vi thiếu trách nhiệm làm hỏng buổi đánh của nhóm**.
- **Mã FR:** FR-21 | **Mục WBS:** WBS 3.1, 3.2 | **Ưu tiên:** Must Have | **Điểm ước lượng:** 3 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Buổi đánh bắt đầu lúc 18:00.
  - *When:* Người chơi bấm hủy lúc 17:00 (còn 1 tiếng).
  - *Then:* Hệ thống cảnh báo phạt $-20$ điểm uy tín; khi xác nhận, điểm uy tín của user giảm $20$ điểm và lưu vết "Hủy sát giờ".

---

### PHÂN HỆ 4: LỊCH SỬ THI ĐẤU & VÒNG LẶP ELO (MODULE 4)

#### US-31: Nhập tỷ số set đấu bằng nút bấm lớn tại sân
- **User Story:** Là **Host**, tôi muốn **nhập tỷ số các set đấu bằng các nút bấm to rõ ràng**, để **thao tác nhanh chóng ngay tại sân dù tay ướt mồ hôi**.
- **Mã FR:** FR-22 | **Mục WBS:** WBS 4.4b | **Ưu tiên:** Must Have | **Điểm ước lượng:** 3 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Trận đấu vừa kết thúc.
  - *When:* Host mở màn hình nhập điểm, bấm nút $+1$ để tăng điểm hoặc gõ "21 - 18" rồi bấm "Lưu".
  - *Then:* Điểm số được lưu vào set đấu và hiển thị ngay trên bảng lịch sử set của buổi đánh.

#### US-32: Chấm thẻ đánh giá bạn chơi nhanh trong 5 giây
- **User Story:** Là **người chơi**, tôi muốn **chấm nhanh 3 thẻ đánh giá (Đúng trình, Đánh hay, Thái độ tốt) cho các bạn chơi**, để **đóng góp xây dựng cộng đồng văn minh mà không tốn thời gian**.
- **Mã FR:** FR-23 | **Mục WBS:** WBS 4.4b | **Ưu tiên:** Must Have | **Điểm ước lượng:** 3 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Trận đấu vừa xong hoặc kết thúc buổi đánh.
  - *When:* Pop-up hiện ra $\to$ tôi chạm vào icon "Đúng trình" cho Bạn A và "Thái độ tốt" cho Bạn B trong 3 giây.
  - *Then:* Thẻ đánh giá được ghi nhận vào hồ sơ bạn chơi; huy hiệu khen thưởng của họ tăng lên.

#### US-33: Tính toán và cập nhật biến động Elo đôi tự động
- **User Story:** Là **người chơi**, tôi muốn **điểm Elo của mình tăng khi thắng và giảm khi thua theo đúng chênh lệch trình độ**, để **phản ánh chính xác phong độ thi đấu**.
- **Mã FR:** FR-24 | **Mục WBS:** WBS 3.1, 3.4 | **Ưu tiên:** Must Have | **Điểm ước lượng:** 5 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Đội A (Elo TB $1300$) thắng Đội B (Elo TB $1500$).
  - *When:* Buổi đánh kết thúc và kích hoạt cập nhật Elo.
  - *Then:* Do thắng đội mạnh hơn nhiều, Đội A được cộng số điểm lớn (ví dụ $+18$ điểm), Đội B bị trừ số điểm tương ứng ($-18$ điểm), điểm sàn/trần bảo toàn $800–2200$.

#### US-34: Xem chi tiết lịch sử các trận đấu đã tham gia
- **User Story:** Là **người chơi**, tôi muốn **xem lại danh sách các trận đã đấu, tỷ số từng set và bạn đánh cặp cùng**, để **nhớ lại những pha cầu đẹp và xem lại thành tích**.
- **Mã FR:** FR-25 | **Mục WBS:** WBS 4.5 | **Ưu tiên:** Must Have | **Điểm ước lượng:** 3 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Người chơi mở tab "Lịch sử thi đấu".
  - *When:* Chọn một trận đấu cụ thể trong danh sách.
  - *Then:* Hiển thị chi tiết: Ngày giờ, Tên sân, Đồng đội, Đối thủ, Tỷ số set (ví dụ 21-17, 21-19) và số điểm Elo biến động ($+14$).

#### US-35: Vinh danh và gợi ý danh sách "Đồng đội ăn ý" (Best Partners)
- **User Story:** Là **người chơi**, tôi muốn **thấy danh sách những người bạn tôi hay thắng nhất khi đánh cặp**, để **dễ dàng mời họ lập team đi đánh giải**.
- **Mã FR:** FR-26 | **Mục WBS:** WBS 3.3, 4.5 | **Ưu tiên:** Should Have | **Điểm ước lượng:** 3 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Tôi và Bạn X đã đánh cặp cùng nhau 5 trận và thắng 4 trận (tỷ lệ thắng $80\% \ge 60\%$).
  - *When:* Tôi mở mục "Bạn ăn ý" trong Profile.
  - *Then:* Thẻ Bạn X hiển thị ở vị trí nổi bật với huy hiệu "Đồng đội ăn ý (80% Win rate)" kèm nút "Rủ đánh kèo mới".

#### US-36: Cộng hoàn lại điểm uy tín sau khi hoàn thành buổi đánh
- **User Story:** Là **người chơi từng bị trừ uy tín do việc bận đột xuất**, tôi muốn **được tích lũy lại điểm uy tín khi tham gia đánh đầy đủ và đúng giờ**, để **sớm khôi phục lại tài khoản uy tín cao**.
- **Mã FR:** FR-27 | **Mục WBS:** WBS 3.1 | **Ưu tiên:** Should Have | **Điểm ước lượng:** 2 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Điểm uy tín của tôi hiện tại là $75$.
  - *When:* Tôi tham gia trọn vẹn 1 buổi đánh, không hủy và không bị báo cáo bùng kèo.
  - *Then:* Hệ thống tự động cộng $+1$ điểm uy tín, nâng điểm lên $76$ (tối đa không quá 100).

---

### PHÂN HỆ 5: QUẢN TRỊ VIÊN IN-APP (ADMIN IN-APP)

#### US-37: Nhận diện vai trò Admin và hiển thị Menu Quản trị
- **User Story:** Là **Quản trị viên hệ thống**, tôi muốn **thấy tab Quản trị ngay trên ứng dụng di động**, để **tiện theo dõi và xử lý việc khẩn cấp mọi lúc mọi nơi**.
- **Mã FR:** FR-28 | **Mục WBS:** WBS 3.2, 4.5 | **Ưu tiên:** Must Have | **Điểm ước lượng:** 2 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Tài khoản đăng nhập có trường `role: "admin"` trong Firestore.
  - *When:* Ứng dụng khởi động xong.
  - *Then:* Thanh điều hướng hiển thị thêm biểu tượng "Quản trị" (người chơi thường có `role: "player"` hoàn toàn không nhìn thấy tab này).

#### US-38: Khóa tài khoản thành viên bùng kèo hoặc gian lận
- **User Story:** Là **Admin**, tôi muốn **khóa tài khoản của người dùng bị nhiều Host báo cáo bùng kèo hoặc khai ảo quá mức**, để **bảo vệ môi trường sinh hoạt lành mạnh cho cộng đồng**.
- **Mã FR:** FR-29 | **Mục WBS:** WBS 4.5 | **Ưu tiên:** Must Have | **Điểm ước lượng:** 3 SP
- **Tiêu chí chấp nhận:**
  - *Given:* User X bị 3 Host khác nhau báo cáo bùng kèo trong tuần.
  - *When:* Admin vào chi tiết User X và bấm "Khóa tài khoản 30 ngày".
  - *Then:* Trạng thái user chuyển thành `banned`, User X bị đăng xuất ngay lập tức và không thể đặt suất tham gia bất kỳ kèo nào.

#### US-39: Tiếp nhận và xử lý khiếu nại hoàn trả điểm uy tín
- **User Story:** Là **Admin**, tôi muốn **xem xét minh chứng khiếu nại của người chơi và bấm hoàn lại điểm uy tín**, để **đảm bảo công bằng cho người chơi gặp sự cố khách quan**.
- **Mã FR:** FR-30 | **Mục WBS:** WBS 4.5 | **Ưu tiên:** Should Have | **Điểm ước lượng:** 3 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Người chơi gửi khiếu nại kèm hình ảnh sự cố giao thông khiến họ đến trễ.
  - *When:* Admin bấm "Duyệt khiếu nại".
  - *Then:* Hệ thống tự động cộng hoàn lại $+20$ điểm uy tín đã bị trừ nhầm cho người chơi đó.

#### US-40: Phê duyệt danh mục địa điểm sân cầu lông tại Đà Nẵng
- **User Story:** Là **Admin**, tôi muốn **duyệt các sân cầu mới do người dùng đề xuất**, để **làm phong phú danh mục sân cho toàn thể cộng đồng**.
- **Mã FR:** FR-31 | **Mục WBS:** WBS 4.5 | **Ưu tiên:** Should Have | **Điểm ước lượng:** 3 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Có 1 địa điểm sân mới được đề xuất: "Sân Cầu Lông Bưu Điện - Nguyễn Du".
  - *When:* Admin bấm "Duyệt địa điểm".
  - *Then:* Sân xuất hiện ngay trong danh mục chọn nhanh khi các Host khác tạo kèo.

---

### PHÂN HỆ 6: NỀN TẢNG DI ĐỘNG & VẬN HÀNH NGOẠI TUYẾN (MOBILE & OFFLINE)

#### US-41: Tự động lưu trữ bộ đệm cục bộ (Offline Cache) phòng kèo
- **User Story:** Là **Host**, tôi muốn **toàn bộ dữ liệu phòng kèo được lưu trong máy**, để **khi bước vào sân cầu bị mất sóng 4G vẫn mở được ứng dụng**.
- **Mã FR:** FR-32 | **Mục WBS:** WBS 4.4a, 4.4b | **Ưu tiên:** Must Have | **Điểm ước lượng:** 3 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Điện thoại bật Chế độ máy bay (mất mạng hoàn toàn).
  - *When:* Host mở ứng dụng vào phòng kèo buổi đánh hôm nay.
  - *Then:* Danh sách người chơi và các thông số sân hiển thị đầy đủ từ bộ đệm cục bộ mà không bị báo lỗi kết nối.

#### US-42: Vận hành chia cặp và ghi nhận tỷ số trơn tru khi mất mạng
- **User Story:** Là **Host**, tôi muốn **bấm chia cặp và ghi điểm set đấu bình thường dù không có mạng**, để **buổi đánh diễn ra liên tục không bị gián đoạn**.
- **Mã FR:** FR-33 | **Mục WBS:** WBS 4.4a, 4.4b | **Ưu tiên:** Must Have | **Điểm ước lượng:** 5 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Thiết bị không có kết nối Internet tại sân đấu.
  - *When:* Host bấm "Chia cặp tự động" và nhập tỷ số các set.
  - *Then:* Màn hình sơ đồ cập nhật ngay lập tức ($< 0.5$s), kết quả set được ghi vào cơ sở dữ liệu cục bộ không một lỗi phát sinh.

#### US-43: Tự động đồng bộ dữ liệu lên Cloud khi có mạng trở lại
- **User Story:** Là **hệ thống**, tôi muốn **tự động đẩy toàn bộ kết quả set đấu từ hàng đợi cục bộ lên Cloud khi có sóng**, để **không bị thất lạc dữ liệu thi đấu của buổi đánh**.
- **Mã FR:** FR-34 | **Mục WBS:** WBS 3.2, 4.4b | **Ưu tiên:** Must Have | **Điểm ước lượng:** 5 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Có 4 kết quả set đấu đang nằm trong `sync_queue` cục bộ.
  - *When:* Điện thoại kết nối lại Wi-Fi hoặc 4G.
  - *Then:* Hệ thống tự động đồng bộ toàn bộ dữ liệu lên Cloud Firestore trong vòng dưới 3 giây mà không cần người dùng bấm gì thêm.

#### US-44: Nhận thông báo đẩy nhắc lịch thi đấu trước 1 giờ
- **User Story:** Là **người chơi**, tôi muốn **nhận thông báo đẩy trên điện thoại trước giờ đánh 1 tiếng**, để **tôi chủ động sắp xếp thời gian di chuyển đến sân đúng giờ**.
- **Mã FR:** FR-35 | **Mục WBS:** WBS 3.4, 4.3 | **Ưu tiên:** Should Have | **Điểm ước lượng:** 3 SP
- **Tiêu chí chấp nhận:**
  - *Given:* Kèo đấu bắt đầu lúc 18:00 và tôi đã được `confirmed`.
  - *When:* Đồng hồ hệ thống điểm 17:00.
  - *Then:* Điện thoại nhận được thông báo: "Nhắc nhở: Bạn có lịch đánh tại Sân Kỳ Đồng lúc 18:00. Hãy chuẩn bị đồ nghề nhé!".

---

## 3. TỔNG HỢP ĐIỂM ƯỚC LƯỢNG THEO PHÂN HỆ VÀ SPRINT

| Phân hệ / Module | Số lượng Stories | Tổng Story Points (SP) | Tỷ lệ Must / Should / Could | Kế hoạch Sprint triển khai |
|---|:---:|:---:|:---:|:---:|
| **Module 1: Hồ sơ & Trình độ ban đầu** | 8 | 25 SP | 6M / 2S / 0C | Sprint 1 & Sprint 2 |
| **Module 2: Ghép đôi & Chia cặp cân kèo**| 10 | 46 SP | 8M / 1S / 1C | Sprint 2 & Sprint 4 |
| **Module 3: Quản lý kèo & Tuyển suất** | 12 | 39 SP | 11M / 1S / 0C | Sprint 3 |
| **Module 4: Lịch sử thi đấu & Vòng lặp Elo**| 6 | 19 SP | 4M / 2S / 0C | Sprint 4 |
| **Phân hệ Quản trị viên In-App** | 4 | 11 SP | 2M / 2S / 0C | Sprint 5 |
| **Nền tảng Di động & Offline Cache** | 4 | 16 SP | 3M / 1S / 0C | Sprint 4 & Sprint 5 |
| **TỔNG CỘNG TOÀN DỰ ÁN** | **44 Stories** | **156 SP** | **34M / 9S / 1C** | **Sprint 1 $\to$ Sprint 6** |
