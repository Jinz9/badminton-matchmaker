# THANG TIÊU CHÍ ĐÁNH GIÁ TRÌNH ĐỘ VÀ THUẬT TOÁN ĐIỂM SỐ CẦU LÔNG PHONG TRÀO
*(Tài liệu chuẩn hóa WBS 2.1 - Mốc M2)*

**Dự án:** Hệ thống ghép đội, ghép đồng đội theo độ phù hợp trong lĩnh vực cầu lông (Mobile App)  
**Tài liệu:** Thang 6 cấp độ, Quy đổi Elo, Bảng câu hỏi Onboarding & Thông số lối chơi  
**Căn cứ nghiệp vụ:** Skill `badminton-rating` & `badminton-domain-rules`  
**Ngày ban hành:** 15/11/2026 | **Phiên bản:** 1.0 (Bản chốt chính thức)  
**Phê duyệt:** TV1 (Đào Duy Nhật - PM, Backend & Chuyên môn Cầu lông)  

---

## 1. Định nghĩa 6 Cấp độ Trình độ Phong trào (Đà Nẵng)

Hệ thống sử dụng hệ thống tên gọi thực tế, gần gũi với ngôn ngữ phong trào tại các cụm sân Đà Nẵng (Kỳ Đồng, Tuyên Sơn, Quân Khu 5,...). Bộ tiêu chí phân cấp dựa trên 6 kỹ năng kỹ thuật & thể lực cốt lõi: Giao cầu (Serve), Phông cầu (Clear), Đập cầu (Smash), Phòng thủ (Defense), Bộ chân di chuyển (Footwork), và Khả năng đọc trận đấu đôi (Court Vision / Rotation).

| Cấp | Tên cấp độ chính thức | Khoảng điểm Elo | Điểm khởi tạo (Default) | Dấu hiệu nhận biết thực tế trên sân (Dành cho vãng lai) | Chi tiết kỹ thuật & Thể lực |
|:---:|---|:---:|:---:|---|---|
| **1** | **Yếu (Mới chơi)** | 1000 – 1199 | **1100** | Cầm vợt chưa đúng cách (dễ bị cầm kiểu "chảo rán"), đánh trúng khung vợt nhiều, khó giữ cầu qua lưới quá 3 lần chạm. | - **Giao cầu:** Thường xuyên lỗi (quá cao, vướng lưới).<br>- **Phông cầu:** Không tới vạch cuối sân đối phương.<br>- **Đập/Thủ:** Chưa biết đập cầu; phản xạ né cầu khi bị đập.<br>- **Di chuyển:** Đứng chôn chân, hay quay lưng lại lưới.<br>- **Thể lực:** Đánh 1 set đã thở dốc, đuối sức. |
| **2** | **TB- (Cơ bản)** | 1200 – 1349 | **1275** | Đã biết luật và cách tính điểm, phát cầu qua lưới ổn định, đánh qua lại được nhưng đường cầu còn bổng và bị động. | - **Giao cầu:** Ổn định quả phát cầu ngắn hoặc bổng cơ bản.<br>- **Phông cầu:** Qua được 2/3 sân, thỉnh thoảng tới cuối sân.<br>- **Đập cầu:** Đập được cầu bổng nhưng thiếu lực và thiếu góc chìm.<br>- **Phòng thủ:** Đỡ được các quả đập nhẹ, gặp smash mạnh là bung ra ngoài.<br>- **Di chuyển:** Biết di chuyển tới lui nhưng bộ chân còn lóng ngóng. |
| **3** | **TB (Trung bình)** | 1350 – 1499 | **1425** | Đã có phông, gài lưới, đập cơ bản; biết đứng song song khi thủ và trước/sau khi công; đánh được các trận giao lưu có nhịp độ. | - **Giao cầu:** Ít lỗi, bắt đầu biết gài quả ngắn vào góc chữ T.<br>- **Phông/Gài:** Clear sâu cuối sân; gài lưới (drop shot) cơ bản.<br>- **Đập cầu:** Có lực khá, có hướng đập vào người đối thủ.<br>- **Phòng thủ:** Kê được quả smash vào giữa sân hoặc lưới.<br>- **Chiến thuật đôi:** Biết xoay vị trí cơ bản khi bạn cầu lùi đập. |
| **4** | **TB+ (Trung bình Khá)** | 1500 – 1649 | **1575** | Đánh đầm tay, chủ động tấn công ép cầu, kiểm soát lưới tốt; phản xạ bắt lưới nhanh; mắc ít lỗi tự đánh hỏng. | - **Giao cầu:** Biến hóa giữa phát ngắn và phát lao bất ngờ.<br>- **Tấn công:** Smash chìm, biết đổi góc đập (đập biên, đập thẳng nách).<br>- **Lưới:** Vồ cầu nhanh (net kill), gài cầu sát mép lưới.<br>- **Phòng thủ:** Phản tạt (drive) thoát thế bị động, tạt cầu chéo sân.<br>- **Bộ chân:** Di chuyển nhịp nhàng, bao quát tốt nửa sân của mình. |
| **5** | **Khá (Khá Giỏi)** | 1650 – 1799 | **1725** | Đánh có chiến thuật rõ rệt (khoét điểm yếu đối thủ, ép trái tay); smash uy lực và ổn định; thể lực bền bỉ đánh liên tục 3–4 set. | - **Kỹ thuật:** Hoàn thiện 100% các kỹ thuật đánh đôi (chém cầu, tạt, đẩy, chụp lưới).<br>- **Phòng thủ:** Thủ cầu bằng phản xạ cẳng tay cực tốt, kê góc hiểm.<br>- **Chiến thuật đôi:** Bọc lót cho đồng đội hoàn hảo, khai thác triệt để vị trí giữa hai người đối phương.<br>- **Tâm lý:** Điểm số sít sao vẫn thi đấu bình tĩnh, không tâm lý. |
| **6** | **Tốt / Bán chuyên** | 1800 – 2000 | **1900** | Cựu tuyển thủ năng khiếu, vđv bán chuyên hoặc top phong trào có tiếng tại Đà Nẵng; smash sấm sét, kiểm soát trận đấu hoàn toàn. | - **Kỹ thuật:** Trình độ đỉnh cao phong trào; tốc độ vung vợt và đập cầu > 250 km/h.<br>- **Thể lực & Tốc độ:** Khả năng bật nhảy smash liên tục (jump smash) và hồi phục cực nhanh.<br>- **Đọc trận đấu:** Đoán trước hướng đánh của đối thủ từ tư thế tiếp xúc cầu. |

---

## 2. Thang điểm số và Cơ chế vận hành Elo

### A. Thông số thang đo chính thức:
- **Điểm sàn tuyệt đối (Floor):** `800` điểm (không bao giờ tụt xuống dưới 800 dù thua nhiều).
- **Điểm trần tuyệt đối (Ceiling):** `2200` điểm.
- **Dải điểm chuẩn cho 6 cấp:** `1000` đến `2000` điểm.
- **Quy tắc làm tròn:** Tất cả các phép tính trung bình cộng hoặc cộng/trừ Elo đều làm tròn đến **số nguyên gần nhất** (`Math.round`).

### B. Cơ chế vùng đệm chống nhảy cấp liên tục (Hysteresis Buffer):
- Khi một người chơi ở sát ranh giới cấp (ví dụ giữa Cấp 3 và Cấp 4 là mốc 1500 điểm):
  - Để thăng cấp từ Cấp 3 lên Cấp 4: Cần đạt $\ge 1500$ điểm.
  - Sau khi đã lên Cấp 4, nếu bị thua trận làm tụt điểm: Áp dụng **vùng đệm 15 điểm** (chỉ tụt về Cấp 3 nếu điểm rơi xuống dưới $1485$). Tránh tình trạng người chơi bị nhảy cấp liên tục sau mỗi set đấu.

### C. Dải trình độ của sân (Court Range):
- Khi Host tạo sân, Host chọn `levelMin` và `levelMax` (từ 1 đến 6).
- Khoảng điểm hợp lệ để một vãng lai được nộp đơn đặt suất vào sân:
  $$\text{Dải điểm sân} = [\text{Cận dưới của } levelMin, \text{ Cận trên của } levelMax]$$
  *(Ví dụ: Host chọn sân Cấp 2 đến Cấp 4 ➔ Điểm cho phép từ 1200 đến 1649 điểm).*

---

## 3. Trọng số Tay thuận (Dominant Hand) trong Đánh đôi

### A. Phân loại:
- `right`: Thuận tay phải (khoảng 88% dân số).
- `left`: Thuận tay trái (khoảng 12% dân số).

### B. Cơ sở nghiệp vụ cầu lông:
1. **Cặp "1 Tay Phải + 1 Tay Trái" (Cặp đôi vàng):**
   - Hai tay vợt có tay thuận ở hai phía đối lập, giúp mở rộng góc bao quát sân cực lớn.
   - Khi đứng song song thủ cầu, hai tay thuận đều hướng ra ngoài biên hoặc cùng hướng vào giữa trục sân, hạn chế tối đa tình trạng "tranh chấp cầu giữa sân" hoặc bị vướng vợt nhau.
   - Các quả ve trái tay (backhand) của đối thủ sẽ rơi thẳng vào tay thuận của 1 trong 2 người.
2. **Cặp "2 Tay Phải":** Phổ biến nhất trong phong trào, phối hợp tiêu chuẩn.
3. **Cặp "2 Tay Trái":** Đã quen thích ứng trong đánh đôi, vẫn phối hợp tốt theo bài bản.

### C. Trọng số tương thích (Hand Compatibility Weight) chính thức:
Trong thuật toán tìm đồng đội ăn ý (Partner Finder):
- Ghép `Right` + `Left`: **Cộng thưởng +25 điểm tương thích** (Thang 100).
- Ghép `Right` + `Right`: **0 điểm** (Mức chuẩn trung tính).
- Ghép `Left` + `Left`: **0 điểm** (Mức chuẩn trung tính).

---

## 4. Trọng số Vị trí Cầu trước và Cầu sau (Play Style)

### A. Định nghĩa 3 phong cách thi đấu:
1. **Chuyên lưới / Cầu trước (`front`):**
   - Sở trường: Đè lưới, bỏ nhỏ sát lưới, gài cầu chữ T, chụp cầu (net kill), phản xạ chặn cầu cự ly gần.
   - Nhược điểm: Thể lực bật đập cầu cuối sân không mạnh, gặp cầu phông bổng sâu dễ bị đuối.
2. **Chuyên công / Cầu sau (`back`):**
   - Sở trường: Bật nhảy đập cầu (smash uy lực), ve cầu sâu, phông cầu cao, bao quát 2 góc cuối sân.
   - Nhược điểm: Phản xạ tì đè cự ly ngắn trên lưới chậm hơn, dễ bị đối thủ đẩy cầu khó.
3. **Toàn diện / Linh hoạt (`both`):**
   - Đánh tốt cả trước lẫn sau, biết xoay chuyển công - thủ nhịp nhàng theo vị trí quả cầu.

### B. Cấu trúc lưu trữ thông số lối chơi (PlayStyle Schema):
```typescript
export interface PlayStyle {
  preferredPosition: "front" | "back" | "both"; // Vị trí sở trường
  smashPower?: number; // Tự đánh giá lực đập (1-5)
  netPlay?: number;    // Tự đánh giá bắt lưới (1-5)
  defense?: number;    // Tự đánh giá phòng thủ (1-5)
}
```

### C. Cơ chế bù trừ trong Partner Finder (P12):
Partner Finder tính toán điểm tương thích bổ trợ vị trí giữa Người A và Người B:

| Người A | Người B | Mức độ tương thích vị trí | Điểm cộng tương thích chính thức |
|:---:|:---:|:---:|:---:|
| `front` (Cầu trước) | `back` (Cầu sau) | **Hoàn hảo (Bù trừ âm - dương)** | **+40 điểm** |
| `back` (Cầu sau) | `front` (Cầu trước) | **Hoàn hảo (Bù trừ âm - dương)** | **+40 điểm** |
| `both` (Linh hoạt) | `front` hoặc `back` | **Rất tốt** | **+25 điểm** |
| `both` (Linh hoạt) | `both` (Linh hoạt) | **Tốt (Dễ xoay vị trí)** | **+20 điểm** |
| `front` (Cầu trước) | `front` (Cầu trước) | **Kém (Dễ thiếu người công cuối sân)** | **-30 điểm** |
| `back` (Cầu sau) | `back` (Cầu sau) | **Kém (Dễ tranh nhau lùi, hở lưới)** | **-30 điểm** |

---

## 5. Bảng câu hỏi tự đánh giá ban đầu (Onboarding Questionnaire)

Gồm **10 câu trắc nghiệm khách quan**, mỗi câu có 4 mức độ (A: 1 điểm, B: 2 điểm, C: 3 điểm, D: 4 điểm). Tổng điểm dao động từ 10 đến 40 điểm, dùng để tự động quy đổi ra Cấp độ ban đầu và Điểm Elo khởi tạo:

### 10 Câu hỏi trắc nghiệm chuẩn hóa:

1. **Thời gian bạn đã chơi cầu lông phong trào liên tục:**
   - A. Dưới 6 tháng, mới bắt đầu làm quen (1 điểm).
   - B. Từ 6 tháng đến dưới 2 năm (2 điểm).
   - C. Từ 2 năm đến 5 năm, đánh đều đặn hàng tuần (3 điểm).
   - D. Trên 5 năm hoặc từng tập luyện bài bản tại các lò năng khiếu (4 điểm).

2. **Kỹ thuật phát cầu (Giao cầu) trong đánh đôi của bạn:**
   - A. Thường xuyên đánh trúng khung, phát cầu cao dễ bị đối thủ đập chết (1 điểm).
   - B. Đã phát qua lưới an toàn, nhưng bóng còn cao và chưa gài được góc (2 điểm).
   - C. Phát cầu ngắn sát mép lưới ổn định vào chữ T hoặc góc chữ I (3 điểm).
   - D. Phát biến hóa linh hoạt (giao ngắn, đẩy lao nhanh, gài góc khó) (4 điểm).

3. **Khả năng phông cầu (Clear) từ vạch cuối sân của mình:**
   - A. Cầu chỉ bay đến giữa sân đối phương, khó đánh cao sâu (1 điểm).
   - B. Đánh cầu bay tới được nửa sau sân, nhưng đường cầu chưa cắm sâu (2 điểm).
   - C. Đánh cầu bổng cao sâu chạm vạch trắng cuối sân đối phương dễ dàng (3 điểm).
   - D. Phông cầu đảo góc biến hóa cả thuận tay lẫn ve trái tay sâu cuối sân (4 điểm).

4. **Kỹ thuật đập cầu (Smash tấn công):**
   - A. Chưa biết đập cầu hoặc chỉ vung tay chạm cầu bay ngang (1 điểm).
   - B. Đập được những quả cầu bổng, nhưng lực nhẹ và đường bay chưa chìm (2 điểm).
   - C. Đập cầu có lực khá mạnh, biết chọn hướng đập vào nách hoặc người đối thủ (3 điểm).
   - D. Bật nhảy smash (jump smash) uy lực, đập chéo sân hiểm hóc tốc độ cao (4 điểm).

5. **Kỹ năng kiểm soát cầu trên lưới (Drop / Net play):**
   - A. Khó kiểm soát lực, cầu hay rúc lưới hoặc bổng cao trên mép lưới (1 điểm).
   - B. Biết bỏ nhỏ cơ bản nhưng chưa ép sát được mép lưới (2 điểm).
   - C. Bỏ nhỏ gài lưới sắc bén, biết chụp cầu (net kill) khi đối thủ trả cầu lỏng (3 điểm).
   - D. Bắt lưới chớp nhoáng, vê cầu quay tròn trên lưới, làm bóng tuyệt vời cho bạn đập (4 điểm).

6. **Kỹ năng phòng thủ khi đối phương smash:**
   - A. Né cầu hoặc đưa vợt chạm cầu bung ra ngoài sân (1 điểm).
   - B. Đỡ được các quả đập vừa tầm, nhưng thường trả cầu bổng lưng chừng sân (2 điểm).
   - C. Kê lưới hoặc tạt cầu chéo sân thoát thế bị động chuẩn xác (3 điểm).
   - D. Phản tạt đôi công (drive) lại ngay quả smash của đối phương bằng cẳng tay (4 điểm).

7. **Bộ chân di chuyển (Footwork):**
   - A. Di chuyển bản năng, thường bị chậm nhịp hoặc vấp chân (1 điểm).
   - B. Biết chạy các bước cơ bản nhưng xoay sở tiến thoái còn nặng nề (2 điểm).
   - C. Di chuyển bước đuổi, bước trượt nhịp nhàng, bao quát tốt nửa sân (3 điểm).
   - D. Bộ chân thanh thoát, di chuyển đón cầu trước khi đối thủ ra tay (4 điểm).

8. **Hiểu biết về chiến thuật xoay vị trí trong đánh đôi:**
   - A. Chưa biết, thường hai người chạy loạn hoặc tranh cầu của nhau (1 điểm).
   - B. Biết sơ bộ: khi bạn lùi đập thì mình giữ lưới, nhưng hay bị giẫm chân (2 điểm).
   - C. Hiểu rõ quy tắc: Đứng song song khi thủ, đứng trước - sau khi tấn công (3 điểm).
   - D. Bọc lót vị trí mượt mà, tự động hoán đổi khi bạn cầu bị ép góc (4 điểm).

9. **Thể lực và sức bền trong một buổi đánh:**
   - A. Đánh xong 1 set 21 điểm là đuối sức, thở dốc (1 điểm).
   - B. Đánh được 2 set liên tục, set 3 bắt đầu di chuyển chậm (2 điểm).
   - C. Duy trì thể lực ổn định suốt buổi đánh 2 tiếng (khoảng 4–5 set) (3 điểm).
   - D. Thể lực dồi dào, đánh liên tục cường độ cao không bị hụt hơi (4 điểm).

10. **Kinh nghiệm tham gia các giải đấu phong trào:**
    - A. Chưa từng thi đấu giải, chỉ đánh vui gia đình / công ty (1 điểm).
    - B. Từng tham gia giải phong trào nội bộ công ty / khoa trường (2 điểm).
    - C. Từng đánh giải phong trào mở rộng cấp CLB hoặc quận / thành phố (3 điểm).
    - D. Từng đạt huy chương tại các giải phong trào mở rộng hoặc cựu năng khiếu (4 điểm).

---

### B. Công thức quy đổi Điểm trắc nghiệm sang Cấp độ & Elo khởi tạo:

$$\text{Tổng điểm trắc nghiệm} = \sum_{i=1}^{10} \text{Điểm câu } i \quad (10 \le \text{Tổng} \le 40)$$

| Tổng điểm trắc nghiệm | Cấp độ suy ra | Khoảng Elo tương ứng | Điểm Elo khởi tạo ($Rating_0$) |
|:---:|:---:|:---:|:---:|
| **10 – 14 điểm** | **Cấp 1 (Yếu)** | 1000 – 1199 | **1100** |
| **15 – 20 điểm** | **Cấp 2 (TB-)** | 1200 – 1349 | **1275** |
| **21 – 27 điểm** | **Cấp 3 (TB)** | 1350 – 1499 | **1425** |
| **28 – 33 điểm** | **Cấp 4 (TB+)** | 1500 – 1649 | **1575** |
| **34 – 38 điểm** | **Cấp 5 (Khá)** | 1650 – 1799 | **1725** |
| **39 – 40 điểm** | **Cấp 6 (Tốt / Bán chuyên)** | 1800 – 2000 | **1900** |

---

### C. Cơ chế xử lý "Khai trình độ ảo" (Chống gian lận rank ban đầu):

1. **Giai đoạn hiệu chỉnh (Provisional Period - $N = 5$ trận đầu):**
   - Trong **05 trận đầu tiên**:
     - Gắn nhãn `provisional` trên hồ sơ.
     - **Hệ số biến động cao $K = 40$** (thay vì $K = 24$): Giúp người chơi nếu thắng đối thủ mạnh sẽ vọt điểm rất nhanh, và nếu khai khống bị thua trận sẽ nhanh chóng bị kéo điểm về đúng thực lực chỉ sau 2–3 trận.
2. **Thẻ đánh giá sau trận (Post-match Feedback Tags):**
   - Sau khi kết thúc trận, Host và bạn chơi có thể bấm gắn thẻ:
     - 🌟 *"Đúng trình"*: Xác nhận trình độ đúng với điểm số hiện tại.
     - 🚀 *"Đánh hay hơn khai báo"*: Cộng điểm thưởng hiệu chỉnh (+5 điểm).
     - ⚠️ *"Đánh dưới sức / Khai ảo"*: Trừ điểm hiệu chỉnh (-5 điểm).
   - **Quy tắc chống bạn bè tâng bốc nhau:** Thẻ điều chỉnh điểm chỉ có hiệu lực khi có **ít nhất 02 người chơi khác nhau** trong trận cùng gắn thẻ.

---

## 6. Quy tắc Phân loại Giới tính khi Ghép cặp

Căn cứ theo Điều luật cứng **R5, R6** trong `badminton-domain-rules`:

1. **Nội dung Đôi Nam (`category = "men"`):**
   - 100% người chơi trên sân phải có `gender = "M"`.
   - Thuật toán cân kèo xếp 4 nam vào 2 cặp đấu.
2. **Nội dung Đôi Nữ (`category = "women"`):**
   - 100% người chơi trên sân phải có `gender = "F"`.
   - Thuật toán cân kèo xếp 4 nữ vào 2 cặp đấu.
3. **Nội dung Đôi Nam Nữ (`category = "mixed"`):**
   - Sân chuẩn khi đủ 8 người: **4 Nam + 4 Nữ**.
   - **Ràng buộc cặp đấu:** Mỗi cặp bắt buộc gồm **1 Nam + 1 Nữ** (không được phép xếp cặp 2 nam đấu với 2 nữ trong nội dung mixed).
   - **Ràng buộc nhận vãng lai (R6):** Vãng lai giới tính $G$ chỉ được duyệt nếu sau khi duyệt, số lượng giới $G$ trên sân không vượt quá $\max(4, \text{số người mặc định giới } G)$.

---

## 7. 05 Hồ sơ Mẫu Tính toán Minh họa (Examples)

### 👤 Hồ sơ 1: Bạn Nam (Sinh viên mới tập chơi 2 tháng)
- **Thông tin:** Nam (`M`), Tay phải (`right`), Thích công cầu sau (`back`).
- **Kết quả trả lời trắc nghiệm:** $1+1+2+1+1+1+1+1+2+1 = 12$ điểm.
- **Quy đổi ban đầu:** Thuộc **Cấp 1 (Yếu)**.
- **Điểm Elo khởi tạo ($Rating_0$):** **1100 điểm** (Nhãn: `provisional`, $K=40$, trong 5 trận đầu).
- **Điểm uy tín ban đầu:** **80 điểm**.

### 👤 Hồ sơ 2: Bạn Nữ (Nhân viên văn phòng, thích bắt lưới)
- **Thông tin:** Nữ (`F`), Tay phải (`right`), Sở trường cầu trước (`front`).
- **Kết quả trả lời trắc nghiệm:** $3+3+2+2+3+2+2+3+2+1 = 23$ điểm.
- **Quy đổi ban đầu:** Thuộc **Cấp 3 (TB)**.
- **Điểm Elo khởi tạo ($Rating_0$):** **1425 điểm** (Nhãn: `provisional`, $K=40$).
- **Gợi ý Partner Finder:** Tìm kiếm các bạn Nam đánh Cấp 3 (Elo $1425 \pm 150$), sở trường Cầu sau (`back`) và ưu tiên Thuận tay trái (`left`) để ghép nội dung đôi nam nữ hoàn hảo (+25 điểm tay thuận, +40 điểm vị trí).

### 👤 Hồ sơ 3: Bạn Nam (Tay vợt phong trào lâu năm, thuận tay trái)
- **Thông tin:** Nam (`M`), Tay trái (`left`), Toàn diện linh hoạt (`both`).
- **Kết quả trả lời trắc nghiệm:** $3+3+3+3+3+3+3+3+3+2 = 29$ điểm.
- **Quy đổi ban đầu:** Thuộc **Cấp 4 (TB+)**.
- **Điểm Elo khởi tạo ($Rating_0$):** **1575 điểm** (Nhãn: `provisional`, $K=40$).
- **Ưu thế ghép đôi:** Nhận điểm thưởng tương thích +25 điểm khi ghép cặp với các tay vợt thuận tay phải.

### 👤 Hồ sơ 4: Bạn Nam (Vận động viên năng khiếu Đà Nẵng)
- **Thông tin:** Nam (`M`), Tay phải (`right`), Chuyên công cầu sau (`back`).
- **Kết quả trả lời trắc nghiệm:** $4+4+4+4+4+4+4+4+4+4 = 40$ điểm.
- **Quy đổi ban đầu:** Thuộc **Cấp 6 (Tốt / Bán chuyên)**.
- **Điểm Elo khởi tạo ($Rating_0$):** **1900 điểm** (Nhãn: `provisional`, $K=40$).

### 👤 Hồ sơ 5: Trường hợp "Khai ảo" và cơ chế tự hiệu chỉnh
- **Diễn biến:**
  - Người chơi tự khai điểm trắc nghiệm 35 điểm ➔ Được cấp **Cấp 5 (Khá - Elo 1725)**.
  - **Trận 1:** Ghép đánh cùng một bạn Elo 1500 gặp đôi đối thủ Elo 1650. Do đánh yếu thực tế, đôi thua đậm $8-21$.
  - Tính toán Elo: Với $K=40$, kỳ vọng thắng ban đầu cao, khi thua đậm người chơi bị trừ $-28$ điểm.
  - **Trận 2:** Tiếp tục thua một đôi Cấp 3 (1400 điểm) ➔ Bị trừ tiếp $-34$ điểm.
  - Đồng thời nhận 3 thẻ *"Đánh dưới sức so với khai báo"* (-5 điểm/trận).
  - **Kết quả:** Chỉ sau 2 trận, điểm số rơi nhanh từ $1725 \rightarrow 1653$ điểm và tiếp tục rớt thẳng về Cấp 3–4 (TB/TB+) thực tế mà không cần Admin can thiệp.
