# BÁO CÁO TỔNG KẾT QUẢN TRỊ DỰ ÁN PHẦN MỀM (PROJECT MANAGEMENT FINAL REPORT)

> **Tên đề tài:** Hệ Thống Ghép Đội và Cân Bằng Kèo Cầu Lông Phong Trào Tại TP. Đà Nẵng (Mobile App)  
> **Học phần:** Quản Trị Dự Án Phần Mềm (QLDAPM)  
> **Nhóm thực hiện:** Nhóm 02 Thành Viên  
> - **TV1 (Trưởng nhóm / PM, BA, Backend & Thuật toán):** Đào Duy Nhật  
> - **TV2 (Thành viên / QA Lead, UI/UX & Mobile Dev):** Nguyễn Đức Đạt  
> **Giảng viên hướng dẫn:** ThS. Nguyễn Thanh Tuấn `[TV1 điền nếu cần hiệu chỉnh]`  
> **Thời gian thực hiện:** Học kỳ I, Năm học 2026 – 2027 (12 Tuần | 6 Sprint)  
> **Kho lưu trữ mã nguồn:** [badminton-matchmaker (GitHub)](https://github.com/Jinz9/badminton-matchmaker)

---

## 1. Mục Lục Báo Cáo Tổng Hợp

Báo cáo được cấu trúc thành 12 chương chuyên đề và các tài liệu phụ lục, phản ánh toàn diện vòng đời quản trị dự án từ khởi tạo, lập kế hoạch, thực thi, kiểm soát chất lượng đến kết thúc bàn giao:

| Chương | Tên Chương | Tài Liệu Nguồn Căn Cứ | Trạng Thái |
| :---: | :--- | :--- | :---: |
| **01** | [Chương 1: Tổng Quan & Bối Cảnh Bài Toán](file:///d:/QLDAPM/docs/report/chap01-intro.md) | `PROJECT_CONTEXT.md`, Khảo sát Đà Nẵng | 🟢 Hoàn thành |
| **02** | [Chương 2: Project Charter & Phân Tích Bên Liên Quan](file:///d:/QLDAPM/docs/report/chap02-charter-stakeholders.md) | `01-project-charter.md`, `02-stakeholders.md` | 🟢 Hoàn thành |
| **03** | [Chương 3: Phân Rã Công Việc (WBS) & Ma Trận Trách Nhiệm (RACI)](file:///d:/QLDAPM/docs/report/chap03-wbs-raci.md) | `03-wbs-raci.md`, Từ điển WBS | 🟢 Hoàn thành |
| **04** | [Chương 4: Quản Lý Tiến Độ & Biểu Đồ Gantt Thực Tế](file:///d:/QLDAPM/docs/report/chap04-schedule-gantt.md) | `04-schedule-gantt.md`, `PROGRESS.md` | 🟡 Có phần TV1 điền |
| **05** | [Chương 5: Quản Trị Rủi Ro Dự Án (Risk Management)](file:///d:/QLDAPM/docs/report/chap05-risk-management.md) | `05-risk-register.md`, 14 rủi ro, ma trận 5x5 | 🟡 Có phần TV1 điền |
| **06** | [Chương 6: Phân Tích & Thiết Kế Hệ Thống Toàn Diện](file:///d:/QLDAPM/docs/report/chap06-system-design.md) | `07-srs.md`, `chap-design.md`, 3 thuật toán, Rules | 🟢 Hoàn thành |
| **07** | [Chương 7: Quản Lý Chất Lượng & Chiến Lược Kiểm Thử](file:///d:/QLDAPM/docs/report/chap07-quality-management.md) | `bug-log.md`, Test Suite 266 tests, CI/CD | 🟢 Hoàn thành |
| **08** | [Chương 8: Quản Lý Thay Đổi (Change Management)](file:///d:/QLDAPM/docs/report/chap08-change-management.md) | `CR-01`, `CR-02`, Giả định A1–A8, Decisions | 🟢 Hoàn thành |
| **09** | [Chương 9: Quản Lý Giao Tiếp & Nhật Ký Họp Tuần W01–W11](file:///d:/QLDAPM/docs/report/chap09-communication-meetings.md) | `docs/meetings/`, Biên bản 11 tuần họp | 🟡 Có phần TV2 điền |
| **10** | [Chương 10: Kết Quả Dự Án & Đối Chiếu Mục Tiêu Charter](file:///d:/QLDAPM/docs/report/chap10-project-results.md) | Số liệu đo đạc thật, Benchmark P15 | 🟢 Hoàn thành |
| **11** | [Chương 11: Bài Học Kinh Nghiệm & Hướng Phát Triển](file:///d:/QLDAPM/docs/report/chap11-lessons-future-work.md) | Đúc kết kinh nghiệm quản trị và kỹ thuật | 🟢 Hoàn thành |
| **12** | [Chương 12: Phụ Lục & Ma Trận Truy Vết Yêu Cầu (RTM)](file:///d:/QLDAPM/docs/report/chap12-appendices.md) | Test Report TV2, Minh chứng Figma, RTM | 🟡 Có phần TV2 điền |

---

## 2. Bảng Theo Dõi Các Vị Trí Cần Bổ Sung Dữ Liệu Thực Tế (Checklist Điền)

Để đảm bảo tính trung thực tuyệt đối trong hồ sơ học thuật, các số liệu thực tế ngoài đời thực (kết quả test trên máy thật, biên bản họp, ý kiến phỏng vấn thực địa) **không được bịa đặt**. Toàn bộ các vị trí cần thành viên tự điền đã được tổng hợp tại:
👉 [**Bảng Tổng Hợp Tác Vụ Cần Điền (TODO-fill.md)**](file:///d:/QLDAPM/docs/report/TODO-fill.md)

---

## 3. Hướng Dẫn Xuất Bản Báo Cáo Sang Định Dạng Word (.docx) và PDF

Báo cáo được viết hoàn toàn bằng định dạng Markdown tiêu chuẩn GitHub (`.md`). Để xuất bản thành file Word hoặc PDF nộp cho Hội đồng chấm đồ án, thực hiện theo một trong các phương án sau:

### Phương án 1: Sử dụng công cụ Pandoc (Khuyên dùng - Chất lượng xuất bản cao nhất)
Cài đặt Pandoc và chạy lệnh ghép toàn bộ các chương thành 1 tài liệu duy nhất:

```bash
# Ghép tất cả các chương theo thứ tự
pandoc docs/report/chap01-intro.md \
       docs/report/chap02-charter-stakeholders.md \
       docs/report/chap03-wbs-raci.md \
       docs/report/chap04-schedule-gantt.md \
       docs/report/chap05-risk-management.md \
       docs/report/chap06-system-design.md \
       docs/report/chap07-quality-management.md \
       docs/report/chap08-change-management.md \
       docs/report/chap09-communication-meetings.md \
       docs/report/chap10-project-results.md \
       docs/report/chap11-lessons-future-work.md \
       docs/report/chap12-appendices.md \
       -o "Bao-Cao-Tong-Ket-QLDAPM-Nhom-02.docx" \
       --toc --toc-depth=3 --number-sections
```

### Phương án 2: Sử dụng Extension trong Visual Studio Code
1. Cài đặt extension **Markdown PDF** hoặc **Markdown Preview Enhanced**.
2. Mở file `.md` trong VS Code.
3. Nhấp chuột phải chọn **Markdown PDF: Export (pdf)** hoặc **Markdown PDF: Export (docx)**.
4. Trình xuất bản sẽ tự động định dạng bảng biểu, code blocks và biểu đồ Mermaid sang văn bản in ấn chuẩn mực.
