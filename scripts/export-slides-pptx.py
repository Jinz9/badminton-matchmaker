#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script xuất bản bài thuyết trình PowerPoint (.pptx) chuẩn 16:9
Dự án: Hệ thống Ghép Đội & Cân Bằng Kèo Cầu Lông (Mobile App)
Môn học: Quản trị Dự án Phần mềm (QLDAPM)
Sinh viên: Đào Duy Nhật (TV1) & Nguyễn Đức Đạt (TV2)
"""

import sys
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE
from pptx.dml.color import RGBColor

# Bảng màu thể thao công nghệ (Dark Theme High-Tech)
COLOR_BG_DARK = RGBColor(11, 19, 43)        # #0B132B (Deep Navy)
COLOR_SURFACE = RGBColor(30, 41, 59)        # #1E293B (Card Dark Slate)
COLOR_SURFACE_LIGHT = RGBColor(51, 65, 85)  # #334155 (Border/Accent Surface)
COLOR_EMERALD = RGBColor(16, 185, 129)      # #10B981 (Badminton Emerald)
COLOR_CYAN = RGBColor(6, 182, 212)          # #06B6D4 (Electric Cyan)
COLOR_AMBER = RGBColor(245, 158, 11)        # #F59E0B (Accent Amber)
COLOR_TEXT_WHITE = RGBColor(248, 250, 252)  # #F8FAFC (Pure White)
COLOR_TEXT_MUTED = RGBColor(148, 163, 184)  # #94A3B8 (Silver Muted)
COLOR_TEXT_DARK = RGBColor(15, 23, 42)

def set_slide_background(slide, color):
    """Vẽ một hình chữ nhật phủ toàn bộ slide làm nền màu phẳng"""
    rect = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
    rect.fill.solid()
    rect.fill.fore_color.rgb = color
    rect.line.fill.background()
    return rect

def add_header(slide, title_text, category_text, presenter_tag):
    """Tạo Header chuẩn cho các slide nội dung"""
    # Category tag & Presenter Tag
    tag_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.733), Inches(0.4))
    tf_tag = tag_box.text_frame
    tf_tag.word_wrap = True
    p_tag = tf_tag.paragraphs[0]
    p_tag.text = f"{category_text.upper()}  •  {presenter_tag}"
    p_tag.font.size = Pt(11)
    p_tag.font.bold = True
    p_tag.font.color.rgb = COLOR_CYAN

    # Main Title
    title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.75), Inches(11.733), Inches(0.8))
    tf_title = title_box.text_frame
    tf_title.word_wrap = True
    p_title = tf_title.paragraphs[0]
    p_title.text = title_text
    p_title.font.size = Pt(24)
    p_title.font.bold = True
    p_title.font.color.rgb = COLOR_TEXT_WHITE

    # Đường kẻ phân cách Emerald
    line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.55), Inches(11.733), Inches(0.04))
    line.fill.solid()
    line.fill.fore_color.rgb = COLOR_EMERALD
    line.line.fill.background()

def add_speaker_note(slide, notes_text):
    """Thêm speaker notes vào slide"""
    notes_slide = slide.notes_slide
    tf = notes_slide.notes_text_frame
    tf.text = notes_text

def add_card(slide, left, top, width, height, title, items, border_color=COLOR_EMERALD):
    """Tạo card nội dung chuẩn với viền màu nổi bật"""
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    card.fill.solid()
    card.fill.fore_color.rgb = COLOR_SURFACE
    card.line.color.rgb = border_color
    card.line.width = Pt(1.5)

    tf = card.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.25)
    tf.margin_right = Inches(0.25)
    tf.margin_top = Inches(0.2)
    tf.margin_bottom = Inches(0.2)

    # Tiêu đề card
    p_title = tf.paragraphs[0]
    p_title.text = title
    p_title.font.size = Pt(16)
    p_title.font.bold = True
    p_title.font.color.rgb = border_color
    p_title.space_after = Pt(10)

    # Các gạch đầu dòng
    for item in items:
        p = tf.add_paragraph()
        p.text = f"• {item}"
        p.font.size = Pt(12)
        p.font.color.rgb = COLOR_TEXT_WHITE
        p.space_after = Pt(6)

def add_metric_card(slide, left, top, width, height, number_text, label_text, sub_text, color=COLOR_EMERALD):
    """Tạo ô số liệu thống kê lớn ấn tượng"""
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    card.fill.solid()
    card.fill.fore_color.rgb = COLOR_SURFACE
    card.line.color.rgb = color
    card.line.width = Pt(1.5)

    tf = card.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.2)
    tf.margin_right = Inches(0.2)
    tf.margin_top = Inches(0.15)
    tf.margin_bottom = Inches(0.15)

    p_num = tf.paragraphs[0]
    p_num.text = number_text
    p_num.alignment = PP_ALIGN.CENTER
    p_num.font.size = Pt(28)
    p_num.font.bold = True
    p_num.font.color.rgb = color

    p_lbl = tf.add_paragraph()
    p_lbl.text = label_text
    p_lbl.alignment = PP_ALIGN.CENTER
    p_lbl.font.size = Pt(12)
    p_lbl.font.bold = True
    p_lbl.font.color.rgb = COLOR_TEXT_WHITE

    p_sub = tf.add_paragraph()
    p_sub.text = sub_text
    p_sub.alignment = PP_ALIGN.CENTER
    p_sub.font.size = Pt(10)
    p_sub.font.color.rgb = COLOR_TEXT_MUTED

def build_presentation(output_path):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_slide_layout = prs.slide_layouts[6]

    # =========================================================================
    # SLIDE 01: BÌA BÁO CÁO
    # =========================================================================
    s1 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s1, COLOR_BG_DARK)

    # Subtitle / Department
    tb = s1.shapes.add_textbox(Inches(1.0), Inches(1.2), Inches(11.333), Inches(0.5))
    p = tb.text_frame.paragraphs[0]
    p.text = "BÁO CÁO BẢO VỆ ĐỒ ÁN HỌC PHẦN QUẢN TRỊ DỰ ÁN PHẦN MỀM"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = COLOR_CYAN

    # Main Project Title
    tb_title = s1.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(11.333), Inches(1.8))
    p2 = tb_title.text_frame.paragraphs[0]
    p2.text = "HỆ THỐNG GHÉP ĐỘI & CÂN BẰNG KÈO CẦU LÔNG"
    p2.font.size = Pt(36)
    p2.font.bold = True
    p2.font.color.rgb = COLOR_TEXT_WHITE
    p2_sub = tb_title.text_frame.add_paragraph()
    p2_sub.text = "Nền tảng di động hỗ trợ host sân và người chơi phong trào tại Đà Nẵng (Expo + Firebase BaaS)"
    p2_sub.font.size = Pt(18)
    p2_sub.font.color.rgb = COLOR_EMERALD

    # Card thông tin sinh viên & giảng viên
    add_card(s1, Inches(1.0), Inches(4.2), Inches(5.4), Inches(2.3), "NHÓM SINH VIÊN THỰC HIỆN", [
        "Đào Duy Nhật (TV1 - Trưởng nhóm): PM, Kiến trúc BaaS, Thuật toán",
        "Nguyễn Đức Đạt (TV2): UI/UX Design, Frontend Expo, QA/Tester",
        "Lớp: Quản trị Dự án Phần mềm  •  Năm học: 2025 - 2026",
    ], COLOR_CYAN)

    add_card(s1, Inches(6.9), Inches(4.2), Inches(5.4), Inches(2.3), "THÔNG TIN ĐỒ ÁN & CÔNG NGHỆ", [
        "Quy trình quản trị: Agile / Scrum (6 Sprint - 12 tuần)",
        "Nền tảng: Mobile App React Native Expo (SDK 52) + Firebase BaaS",
        "Thời lượng bảo vệ: 20 Phút (15 phút Báo cáo + 5 phút Live Demo)",
    ], COLOR_EMERALD)

    add_speaker_note(s1, "Kính chào Thầy/Cô trong Hội đồng và các bạn. Chúng em là nhóm phát triển đồ án 'Hệ thống Ghép Đội và Cân Bằng Kèo Cầu Lông'. Em là Đào Duy Nhật - PM kiêm phụ trách kiến trúc và thuật toán. Đồng hành cùng em là bạn Nguyễn Đức Đạt phụ trách UI/UX và Kiểm thử chất lượng. Hôm nay nhóm xin trình bày quy trình quản trị 12 tuần và sản phẩm thực tế của dự án.")

    # =========================================================================
    # SLIDE 02: BỐI CẢNH BÀI TOÁN CẦU LÔNG
    # =========================================================================
    s2 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s2, COLOR_BG_DARK)
    add_header(s2, "Bối Cảnh Bài Toán: Cầu Lông Phong Trào Tại Đà Nẵng", "01. MỞ ĐẦU", "TV1: Đào Duy Nhật")

    add_card(s2, Inches(0.8), Inches(1.8), Inches(3.6), Inches(5.0), "1. THIẾU NGƯỜI & HỦY KÈO", [
        "Sân cầu phong trào thường thiếu 1-2 người mỗi buổi do bận đột xuất.",
        "Host phải nhắn tin gom người trên các nhóm Zalo/Facebook rất thủ công.",
        "Nguy cơ 'bùng kèo' (no-show) khiến host phải chịu lỗ tiền sân.",
        "Chưa có cơ chế hàng đợi dự bị (Waitlist) tự động đôn người.",
    ], COLOR_AMBER)

    add_card(s2, Inches(4.8), Inches(1.8), Inches(3.6), Inches(5.0), "2. LỆCH TRÌNH ĐỘ NGHIÊM TRỌNG", [
        "Người chơi tự khai trình độ mơ hồ ('đánh tàm tạm', 'giao lưu vui').",
        "Khi vào sân, trận đấu chênh lệch 21-3 gây chán nản cho cả hai bên.",
        "Thiếu thang đánh giá chuẩn hóa cho phong trào Việt Nam.",
        "Chưa có hệ thống điểm động (Elo) phản ánh đúng phong độ thực tế.",
    ], COLOR_CYAN)

    add_card(s2, Inches(8.8), Inches(1.8), Inches(3.7), Inches(5.0), "3. TRANH CÃI CHIA CẶP TẠI SÂN", [
        "Một sân thường có 5 đến 8 người sinh hoạt xoay vòng.",
        "Chia cặp bằng mắt thường dễ gây thiên vị, người lạ bị ngồi ngoài nhiều.",
        "Không tối ưu hóa thời gian nghỉ ngơi công bằng cho ca lẻ (5, 7 người).",
        "Mất từ 5-10 phút bàn cãi giữa mỗi set đấu, giảm trải nghiệm chơi cầu.",
    ], COLOR_EMERALD)

    add_speaker_note(s2, "Xuất phát từ thực tế phong trào cầu lông bùng nổ tại Đà Nẵng, chúng em nhận thấy 3 nỗi đau nhức nhối: thứ nhất là thiếu người nhưng lại sợ bùng kèo; thứ hai là lệch trình độ đánh mất vui; và thứ ba là cảnh chia cặp lúng túng tại sân dẫn đến tranh cãi. Dự án của chúng em sinh ra để giải quyết triệt để 3 bài toán này.")

    # =========================================================================
    # SLIDE 03: MỤC TIÊU & PHẠM VI DỰ ÁN (PROJECT CHARTER)
    # =========================================================================
    s3 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s3, COLOR_BG_DARK)
    add_header(s3, "Mục Tiêu SMART & Phạm Vi Ranh Giới Dự Án", "02. DỰ ÁN", "TV1: Đào Duy Nhật")

    add_card(s3, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.2), "MỤC TIÊU DỰ ÁN THEO CHUẨN SMART", [
        "S (Specific): Xây dựng app di động chuyên biệt ghép đội và cân bằng kèo cầu lông phong trào tại Đà Nẵng.",
        "M (Measurable): Thuật toán chia cặp < 1s; độ lệch Elo giữa 2 đội < 100 điểm; đạt chỉ số hài lòng SUS >= 75/100.",
        "A (Achievable): Hoàn thành trong 12 tuần với nhóm 2 người nhờ kiến trúc Firebase BaaS và Expo SDK 52.",
        "R (Relevant): Giải quyết trực tiếp nhu cầu sinh hoạt thực tế của các CLB và host sân cầu lông phong trào.",
        "T (Time-bound): Đóng băng tính năng tuần 10, kiểm thử thực địa tuần 11, nghiệm thu bảo vệ tuần 12.",
    ], COLOR_EMERALD)

    add_card(s3, Inches(6.8), Inches(1.8), Inches(5.7), Inches(4.2), "RANH GIỚI PHẠM VI (SCOPE BOUNDARIES)", [
        "TRONG PHẠM VI (IN-SCOPE):",
        "• Quản lý kèo đánh, số suất tuyển vãng lai (CR-01), hàng đợi Waitlist.",
        "• Thang trình độ 6 cấp và thuật toán tính điểm Elo đôi thích nghi.",
        "• Thuật toán chia cặp tự động hỗ trợ số người linh hoạt (5-8 người/sân).",
        "• Hệ thống chấm điểm uy tín và chống bùng kèo tự động.",
        "--------------------------------------------------",
        "NGOÀI PHẠM VI (OUT-OF-SCOPE):",
        "• Thanh toán trực tuyến tự động qua ngân hàng (dùng QR chuyển khoản).",
        "• Quản lý đặt sân vật lý và tính tiền giờ với chủ cụm sân.",
    ], COLOR_CYAN)

    add_metric_card(s3, Inches(0.8), Inches(6.1), Inches(2.7), Inches(1.1), "12 Tuần", "Thời Gian", "6 Sprint 2 tuần")
    add_metric_card(s3, Inches(3.8), Inches(6.1), Inches(2.7), Inches(1.1), "2 Người", "Nguồn Lực", "TV1 & TV2")
    add_metric_card(s3, Inches(6.8), Inches(6.1), Inches(2.7), Inches(1.1), "140 SP", "Quy Mô", "Story Points")
    add_metric_card(s3, Inches(9.8), Inches(6.1), Inches(2.7), Inches(1.1), "SUS >= 75", "Mục Tiêu UX", "Hài lòng người dùng")

    add_speaker_note(s3, "Tại Project Charter, nhóm xác định rõ mục tiêu SMART: bàn giao app di động có thuật toán chia cặp dưới 1 giây, độ lệch Elo dưới 100 điểm và chỉ số hài lòng SUS từ 75 trở lên. Đồng thời nhóm xác định ranh giới phạm vi rõ ràng: tập trung vào ghép đội, cân kèo và tính điểm; chưa mở rộng sang cổng thanh toán ngân hàng tự động để đảm bảo tính khả thi trong 12 tuần.")

    # =========================================================================
    # SLIDE 04: PHÂN TÍCH KHÁCH HÀNG & STAKEHOLDERS
    # =========================================================================
    s4 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s4, COLOR_BG_DARK)
    add_header(s4, "Khách Hàng Mục Tiêu & Ma Trận Phân Tích Stakeholders", "03. STAKEHOLDERS", "TV1: Đào Duy Nhật")

    add_card(s4, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.2), "CHÂN DUNG KHÁCH HÀNG MỤC TIÊU", [
        "1. HOST SÂN (CHỦ KÈO PHONG TRÀO):",
        "• Người đứng ra thuê sân cố định hàng tháng tại Kỳ Đồng, Tuyên Sơn...",
        "• Nỗi đau: Phải bù tiền khi thiếu người, mệt mỏi vì chia cặp thủ công.",
        "• Mong muốn: Đủ người đánh, người tham gia đúng trình, chia cặp 1 chạm.",
        "",
        "2. VẬN ĐỘNG VIÊN VÃNG LAI (GUEST PLAYERS):",
        "• Người chơi muốn tìm kèo giao lưu theo ngày, vị trí gần nhà.",
        "• Nỗi đau: Sợ vào nhóm quá mạnh hoặc quá yếu, sợ bị phân biệt đối xử.",
        "• Mong muốn: Biết trước trình độ sân, được đánh đều trận, ghi nhận Elo.",
    ], COLOR_CYAN)

    add_card(s4, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.2), "MA TRẬN QUẢN LÝ QUAN HỆ (POWER / INTEREST)", [
        "NHÓM QUAN TÂM CAO - QUYỀN HẠN CAO (Manage Closely):",
        "• Giảng viên hướng dẫn & Hội đồng bảo vệ: Quyết định chất lượng đồ án.",
        "• Host sân đối tác thử nghiệm (Sân Kỳ Đồng, Tuyên Sơn): Đưa ra phản hồi thực tế định hình Change Request CR-01.",
        "",
        "NHÓM QUAN TÂM CAO - QUYỀN HẠN THẤP (Keep Informed):",
        "• Người chơi phong trào tham gia Field Test: Đóng góp ý kiến UX.",
        "",
        "NHÓM QUAN TÂM THẤP - QUYỀN HẠN CAO (Keep Satisfied):",
        "• Chủ cụm sân cầu lông vật lý: Cần đảm bảo ứng dụng không xung đột với giờ đặt sân cố định của họ.",
    ], COLOR_AMBER)

    add_speaker_note(s4, "Về phân tích các bên liên quan, chúng em tập trung phục vụ 2 nhóm người dùng chính: Host sân và Người chơi vãng lai. Trong ma trận Power/Interest, chúng em quản lý chặt chẽ phản hồi từ các host sân tại Đà Nẵng, chính những trao đổi thực tế này đã giúp nhóm phát hiện lỗ hổng nghiệp vụ ban đầu để đưa ra Change Request CR-01 cực kỳ thành công.")

    # =========================================================================
    # SLIDE 05: QUY TRÌNH SCRUM 6 SPRINT & VẬN TỐC
    # =========================================================================
    s5 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s5, COLOR_BG_DARK)
    add_header(s5, "Quy Trình Phát Triển Scrum: 6 Sprint / 12 Tuần", "04. AGILE / SCRUM", "TV1: Đào Duy Nhật")

    add_card(s5, Inches(0.8), Inches(1.8), Inches(5.6), Inches(3.9), "LỘ TRÌNH 6 SPRINT CHI TIẾT", [
        "Sprint 1 (T1-T2): Khởi tạo dự án, Charter, SRS, Data Contract & Repo.",
        "Sprint 2 (T3-T4): Auth, Hồ sơ 6 cấp trình độ, CRUD Sân đấu cơ bản.",
        "Sprint 3 (T5-T6): CR-01 (Luật 8 người/sân), Waitlist, Slot Matching.",
        "Sprint 4 (T7-T8): Session Balancer (ca 5-8 người), Nhập điểm, Elo đôi.",
        "Sprint 5 (T9-T10): Lịch sử đấu, Best Teammate, E2E Test & Feature Freeze.",
        "Sprint 6 (T11-T12): Field Test thực địa tại sân, Báo cáo & Đóng gói.",
    ], COLOR_EMERALD)

    add_card(s5, Inches(6.8), Inches(1.8), Inches(5.7), Inches(3.9), "NGHI THỨC SCRUM TRONG NHÓM 2 NGƯỜI", [
        "• Daily Standup: 15 phút mỗi sáng qua Discord / Chat (Làm gì? Sẽ làm gì? Có bị block không?).",
        "• Sprint Planning & Review: Đánh giá backlog vào đầu/cuối mỗi 2 tuần.",
        "• Sprint Retrospective: Rút kinh nghiệm, cải tiến quy trình phối hợp.",
        "• Branching Git Flow: Nhánh 'main' (Production) -> 'dev' -> các nhánh 'feat/*', 'fix/*' độc lập, 100% PR được review chéo.",
    ], COLOR_CYAN)

    add_metric_card(s5, Inches(0.8), Inches(5.9), Inches(3.6), Inches(1.2), "23.3 SP", "Vận Tốc Trung Bình", "Velocity ổn định 22-26 SP")
    add_metric_card(s5, Inches(4.8), Inches(5.9), Inches(3.6), Inches(1.2), "100% PR", "Kiểm Tra Chéo", "Tất cả PR đều được review")
    add_metric_card(s5, Inches(8.8), Inches(5.9), Inches(3.7), Inches(1.2), "0 Rollback", "Độ Ổn Định Git", "Không xung đột nhánh dev")

    add_speaker_note(s5, "Dự án được triển khai qua 6 Sprint trong 12 tuần với nhịp độ 2 tuần/sprint. Dù nhóm chỉ có 2 người, chúng em vẫn thực hiện đầy đủ các nghi thức Scrum: Standup hàng ngày, Retrospective sau mỗi sprint và tuân thủ Git Flow nghiêm ngặt. Vận tốc trung bình của nhóm đạt 23.3 Story Points/sprint, rất đồng đều và ổn định.")

    # =========================================================================
    # SLIDE 06: PHÂN RÃ CÔNG VIỆC WBS & MA TRẬN RACI
    # =========================================================================
    s6 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s6, COLOR_BG_DARK)
    add_header(s6, "Cấu Trúc Phân Rã Công Việc WBS & Ma Trận RACI", "05. WBS & RACI", "TV1: Đào Duy Nhật")

    add_card(s6, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.2), "CẤU TRÚC PHÂN RÃ CÔNG VIỆC (21 GÓI CÔNG VIỆC)", [
        "WBS Level 1: Hệ thống Ghép Đội Cầu Lông (12 tuần)",
        "",
        "WBS 1.0 - Khởi tạo & Quản trị: Charter, WBS, Kế hoạch, Rủi ro.",
        "WBS 2.0 - Phân tích & Thiết kế: SRS, Data Contract, Thuật toán, UI UX.",
        "WBS 3.0 - Phát triển Core Backend: BaaS Firebase, Rules, 3 Thuật toán.",
        "WBS 4.0 - Phát triển Mobile Client: 14 màn hình Expo, Offline Cache.",
        "WBS 5.0 - Tích hợp & Kiểm thử: Unit test, Rules test, E2E, Field test.",
        "WBS 6.0 - Đóng gói & Nghiệm thu: Tài liệu kỹ thuật, Slide, Demo.",
    ], COLOR_CYAN)

    add_card(s6, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.2), "MA TRẬN PHÂN ĐỊNH TRÁCH NHIỆM RACI", [
        "R: Responsible  |  A: Accountable  |  C: Consulted  |  I: Informed",
        "",
        "• Quản trị dự án & Kế hoạch (WBS 1.0): TV1 (A/R) - TV2 (C/I)",
        "• Thiết kế Kiến trúc & Data Contract: TV1 (A/R) - TV2 (C/I)",
        "• Ba thuật toán cốt lõi & Cloud Functions: TV1 (A/R) - TV2 (I)",
        "• Thiết kế Giao diện UI/UX Mobile (WBS 4.0): TV2 (A/R) - TV1 (C/I)",
        "• Triển khai Frontend Expo (WBS 4.0): TV2 (A/R) - TV1 (C)",
        "• Kiểm thử Tự động & Quản lý Bug Log: TV2 (A/R) - TV1 (R/C)",
        "• Kiểm thử Thực địa tại sân (Field Test): Cả hai cùng thực hiện (A/R)",
    ], COLOR_EMERALD)

    add_speaker_note(s6, "Chúng em bóc tách toàn bộ dự án thành 21 gói công việc cụ thể đến cấp độ công số 4-16 giờ. Ma trận RACI thể hiện sự phân công rạch ròi: Em (TV1) chịu trách nhiệm chính về kiến trúc, backend và thuật toán; Bạn Đạt (TV2) chịu trách nhiệm chính về UI/UX di động, giao diện Expo và quản lý chất lượng. Hai bên liên tục trao đổi qua Data Contract để không bao giờ bị nghẽn việc.")

    # =========================================================================
    # SLIDE 07: TIẾN ĐỘ GANTT & XỬ LÝ ĐỘ LỆCH
    # =========================================================================
    s7 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s7, COLOR_BG_DARK)
    add_header(s7, "Tiến Độ Thực Tế So Với Kế Hoạch & Xử Lý Độ Lệch", "06. TIẾN ĐỘ GANTT", "TV1: Đào Duy Nhật")

    add_card(s7, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.0), "BIẾN ĐỘNG TIẾN ĐỘ & NGUYÊN NHÂN", [
        "• Sprint 1 - Sprint 2: Tiến độ bám sát 100% kế hoạch ban đầu.",
        "• Sprint 3 (Milestone M4-M5): LỆCH TIẾN ĐỘ +3 NGÀY.",
        "  - Nguyên nhân: Phát sinh Change Request CR-01 (Luật 8 người/sân).",
        "  - Tác động: Phải cấu trúc lại schema Firestore và viết lại logic tính toán số suất tuyển vãng lai.",
        "• Sprint 4: Bắt đầu thu hẹp độ lệch về +1 ngày nhờ phối hợp linh hoạt.",
        "• Sprint 5: Đạt mốc Feature Freeze đúng thời hạn cam kết.",
    ], COLOR_AMBER)

    add_card(s7, Inches(6.8), Inches(1.8), Inches(5.7), Inches(4.0), "GIẢI PHÁP ĐIỀU CHỈNH CỦA DỰ ÁN", [
        "1. KỸ THUẬT FAST-TRACKING (LÀM SONG SONG):",
        "• TV2 sử dụng Mock Data dựa trên hợp đồng Data Contract mới để dựng trước màn hình, không phải chờ backend hoàn thiện.",
        "",
        "2. TẬN DỤNG TIME BUFFER (KHOẢNG ĐỆM DỰ PHÒNG):",
        "• Dự án có phân bổ 4 ngày đệm trước cột mốc Feature Freeze, hấp thụ hoàn toàn độ trễ 3 ngày mà không làm vỡ hạn chót cuối cùng.",
        "",
        "3. TẬP TRUNG TÍNH NĂNG CỐT LÕI (SCOPE ADJUSTMENT):",
        "• Hoãn Push Notification sang phase sau, tập trung 100% cho thuật toán.",
    ], COLOR_CYAN)

    add_metric_card(s7, Inches(0.8), Inches(6.0), Inches(3.6), Inches(1.2), "+3 Ngày", "Độ Lệch Lớn Nhất", "Tại Sprint 3 do CR-01")
    add_metric_card(s7, Inches(4.8), Inches(6.0), Inches(3.6), Inches(1.2), "4 Ngày", "Khoảng Đệm Dự Phòng", "Time Buffer hấp thụ trễ")
    add_metric_card(s7, Inches(8.8), Inches(6.0), Inches(3.7), Inches(1.2), "0 Ngày", "Trễ Hạn Bàn Giao", "Bàn giao đúng hạn tuần 12")

    add_speaker_note(s7, "Về tiến độ thực tế, thách thức lớn nhất diễn ra ở Sprint 3 khi nhóm tiếp nhận CR-01 khiến dự án bị chậm 3 ngày. Nhóm đã áp dụng ngay kỹ thuật Fast-tracking: TV2 dùng Mock Data dựng giao diện song song khi TV1 cập nhật backend, kết hợp khoảng đệm dự phòng 4 ngày để đưa dự án trở lại đúng đường ray và đóng băng tính năng đúng hạn.")

    # =========================================================================
    # SLIDE 08: QUẢN TRỊ RỦI RO (RISK REGISTER)
    # =========================================================================
    s8 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s8, COLOR_BG_DARK)
    add_header(s8, "Quản Trị Rủi Ro: Ma Trận 5x5 & Kế Hoạch Ứng Phó", "07. RỦI RO", "TV1: Đào Duy Nhật")

    add_card(s8, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.2), "TOP 3 RỦI RO ĐIỂM CAO NHẤT (MA TRẬN 5x5)", [
        "1. R-04: Xung đột ghi đồng thời khi đặt suất cuối cùng (Score: 20)",
        "• Khả năng: 4 (Cao) | Tác động: 5 (Nghiêm trọng).",
        "• Hậu quả: Overbooking, host phải từ chối khách tại sân.",
        "",
        "2. R-07: Người chơi khai gian trình độ khi tạo tài khoản (Score: 16)",
        "• Khả năng: 4 (Cao) | Tác động: 4 (Lớn).",
        "• Hậu quả: Lệch kèo, gây ức chế cho người chơi cùng sân.",
        "",
        "3. R-02: Mất kết nối mạng tại sân mái tôn ở Đà Nẵng (Score: 15)",
        "• Khả năng: 5 (Rất cao) | Tác động: 3 (Vừa).",
        "• Hậu quả: Ứng dụng bị đơ, không chia cặp hoặc nhập điểm được.",
    ], COLOR_AMBER)

    add_card(s8, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.2), "BIỆN PHÁP ỨNG PHÓ HIỆU QUẢ", [
        "GIẢI PHÁP CHO R-04 (RACE CONDITION):",
        "• Sử dụng Firestore RunTransaction với Optimistic Locking, đảm bảo việc kiểm tra và trừ suất là nguyên tử (Atomic). Tự động đẩy vào Waitlist khi hết chỗ.",
        "",
        "GIẢI PHÁP CHO R-07 (CHỐNG GIAN LẬN TRÌNH ĐỘ):",
        "• Áp dụng hệ số thích nghi K=40 cho 10 trận đầu (Provisional Elo), kết hợp đánh giá ẩn danh sau trận để thuật toán tự động cân bằng lại điểm.",
        "",
        "GIẢI PHÁP CHO R-02 (OFFLINE-FIRST RESILIENCE):",
        "• Bật Local Cache của Firestore SDK, lưu danh sách buổi chơi vào bộ nhớ máy, cho phép chia cặp và nhập điểm offline, tự đồng bộ khi có mạng.",
    ], COLOR_EMERALD)

    add_speaker_note(s8, "Trong bảng quản trị 14 rủi ro, nhóm nhận diện rủi ro lớn nhất là tranh chấp ghi dữ liệu khi nhiều người cùng đặt suất cuối (R-04) và mất mạng tại sân (R-02). Nhóm đã ứng phó bằng Firestore Transaction xử lý giao dịch nguyên tử và cơ chế Offline Cache giúp ứng dụng chạy mượt mà ngay cả khi mất sóng.")

    # =========================================================================
    # SLIDE 09: QUẢN TRỊ THAY ĐỔI: CR-01 & CR-02
    # =========================================================================
    s9 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s9, COLOR_BG_DARK)
    add_header(s9, "Quản Trị Thay Đổi: Bước Ngoặt Nghiệp Vụ CR-01 & CR-02", "08. CHANGE MANAGEMENT", "TV1: Đào Duy Nhật")

    add_card(s9, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.2), "CHANGE REQUEST CR-01: LUẬT 8 NGƯỜI/SÂN", [
        "BỐI CẢNH & PHÁT HIỆN:",
        "• Thiết kế ban đầu: 1 sân nhận cố định 4 người.",
        "• Thực tế sân Đà Nẵng: 1 sân luôn có 6 đến 8 người để xoay tua nghỉ ngơi. Nếu chỉ 4 người thì tiền sân quá đắt và kiệt sức.",
        "",
        "NỘI DUNG THAY ĐỔI:",
        "• Cấu trúc lại schema `sessions` thành danh sách các `courts` con.",
        "• Cho phép cấu hình số người cố định và số suất tuyển vãng lai riêng biệt cho từng sân (tổng từ 4 đến 8 người/sân).",
        "• Nâng cấp thuật toán chia cặp hỗ trợ xoay tua nghỉ ngơi cho cả ca chẵn (6, 8) và ca lẻ (5, 7 người).",
    ], COLOR_EMERALD)

    add_card(s9, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.2), "QUY TRÌNH QUẢN TRỊ THAY ĐỔI BÀI BẢN", [
        "1. ĐỀ XUẤT (SUBMISSION):",
        "• Ghi nhận nhu cầu qua biểu mẫu CR-01 chính thức.",
        "",
        "2. ĐÁNH GIÁ TÁC ĐỘNG (IMPACT ANALYSIS):",
        "• Đánh giá ảnh hưởng đến Database, Thuật toán, UI và Tiến độ (+3 ngày).",
        "",
        "3. PHÊ DUYỆT & CẬP NHẬT TÀI LIỆU (APPROVAL):",
        "• Cả 2 thành viên thống nhất phê duyệt. Cập nhật Data Contract trước khi tiến hành viết code.",
        "",
        "CHANGE REQUEST CR-02 (WAITLIST & PUSH NOTICE):",
        "• Thêm hàng đợi dự bị tự động đôn người khi có khách hủy suất.",
        "• Thay Push Notification phức tạp bằng In-App Alert tức thời.",
    ], COLOR_CYAN)

    add_speaker_note(s9, "Change Request CR-01 là bước ngoặt thành công nhất của dự án. Nhờ đi thực tế phỏng vấn các host sân tại Đà Nẵng, chúng em phát hiện sân cầu thực tế luôn có từ 6-8 người. Quy trình quản trị thay đổi bài bản từ ghi nhận, đánh giá tác động đến sửa tài liệu hợp đồng trước khi code đã giúp biến sự thay đổi này thành tính năng đắt giá nhất của sản phẩm.")

    # =========================================================================
    # SLIDE 10: KIẾN TRÚC TỔNG THỂ: EXPO + FIREBASE BAAS
    # =========================================================================
    s10 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s10, COLOR_BG_DARK)
    add_header(s10, "Kiến Trúc Hệ Thống: Expo Client + Firebase BaaS", "09. KIẾN TRÚC", "TV1: Đào Duy Nhật")

    add_card(s10, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.2), "TẦNG CLIENT DI ĐỘNG (EXPO SDK 52)", [
        "• Công nghệ: React Native, Expo Router (File-based Routing), TypeScript.",
        "• Quản lý trạng thái: React Context API kết hợp Firestore Realtime Listener (`onSnapshot`).",
        "• Offline Resilience: Local Persistence Cache lưu trữ tức thời.",
        "• UI Component: Thiết kế High-Contrast chuẩn Native, tối ưu thao tác 1 tay.",
    ], COLOR_CYAN)

    add_card(s10, Inches(6.8), Inches(1.8), Inches(5.7), Inches(4.2), "TẦNG BACKEND-AS-A-SERVICE (FIREBASE)", [
        "• Firebase Authentication: Xác thực OTP SMS và Email/Password an toàn.",
        "• Cloud Firestore: CSDL NoSQL thời gian thực, đánh chỉ mục Composite Index tối ưu chi phí truy vấn.",
        "• Cloud Functions: Chạy ngầm các logic nhạy cảm (Tính điểm Elo, Xử lý bùng kèo, Đôn Waitlist).",
        "• Firestore Security Rules: 2 tầng bảo vệ dữ liệu chống client giả mạo.",
    ], COLOR_EMERALD)

    add_metric_card(s10, Inches(0.8), Inches(6.1), Inches(3.6), Inches(1.1), "$0 / Tháng", "Chi Phí Hạ Tầng", "100% trong Spark Plan")
    add_metric_card(s10, Inches(4.8), Inches(6.1), Inches(3.6), Inches(1.1), "< 100ms", "Độ Trễ Realtime", "Firestore onSnapshot")
    add_metric_card(s10, Inches(8.8), Inches(6.1), Inches(3.7), Inches(1.1), "2 Lớp", "Bảo Mật An Toàn", "Rules + Cloud Functions")

    add_speaker_note(s10, "Về mặt kiến trúc, chúng em lựa chọn mô hình Serverless với Firebase BaaS kết hợp React Native Expo. Kiến trúc này giúp nhóm 2 người cắt giảm tối đa chi phí quản trị server VPS, đồng thời đảm bảo tính năng realtime cực nhạy và bảo mật 2 lớp: chặn quyền từ Security Rules và thực thi tính toán logic nặng trên Cloud Functions.")

    # =========================================================================
    # SLIDE 11: NGHIỆP VỤ: THANG 6 CẤP & ELO ĐÔI
    # =========================================================================
    s11 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s11, COLOR_BG_DARK)
    add_header(s11, "Thang Trình Độ 6 Cấp & Thuật Toán Elo Đôi Động", "10. THUẬT TOÁN 1", "TV1: Đào Duy Nhật")

    add_card(s11, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.2), "THANG 6 CẤP CHUẨN PHONG TRÀO VIỆT NAM", [
        "• Y1 (Yếu 1: 800 - 999): Mới tập chơi, đánh hụt cầu, chưa biết luật.",
        "• Y2 (Yếu 2: 1000 - 1199): Đánh qua lưới, phát cầu cơ bản, ít di chuyển.",
        "• TB1 (Trung bình 1: 1200 - 1399): Đánh đều tay, biết đập cầu cơ bản.",
        "• TB2 (Trung bình 2: 1400 - 1599): Phông cầu sâu, cắt cầu, bắt đầu có chiến thuật.",
        "• K1 (Khá 1: 1600 - 1799): Thể lực tốt, đập cầu uy lực, di chuyển linh hoạt.",
        "• K2 (Khá 2: 1800 - 2000): Trình độ bán chuyên, điều cầu biến hóa.",
        "",
        "Ý NGHĨA: Gần gũi với ngôn ngữ phong trào, ánh xạ trực tiếp sang dải điểm Elo khởi tạo.",
    ], COLOR_CYAN)

    add_card(s11, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.2), "CÔNG THỨC ELO ĐÔI THÍCH NGHI", [
        "1. ĐIỂM TRUNG BÌNH ĐỘI: R_team = (R_player1 + R_player2) / 2",
        "",
        "2. XÁC SUẤT KỲ VỌNG THẮNG: E_1 = 1 / (1 + 10^((R_team2 - R_team1)/400))",
        "",
        "3. CẬP NHẬT ĐIỂM DỰA TRÊN HỆ SỐ K THÍCH NGHI:",
        "   Delta_R = K * (Actual_Score - Expected_Score)",
        "• K = 40: Dành cho người mới (< 10 trận) giúp điểm nhanh chóng hội tụ về đúng trình độ thật.",
        "• K = 20: Dành cho người chơi ổn định (>= 10 trận).",
        "",
        "CƠ CHẾ TỰ CÂN BẰNG: Đánh giá chéo ẩn danh sau trận giúp phát hiện và điều chỉnh người khai gian trình độ.",
    ], COLOR_EMERALD)

    add_speaker_note(s11, "Về thuật toán xếp hạng, nhóm chuẩn hóa văn hóa cầu lông Việt Nam thành thang 6 cấp từ Y1 đến K2, ánh xạ sang điểm Elo từ 800 đến 2000. Điểm của đội là trung bình cộng 2 tay vợt. Chúng em áp dụng hệ số K thích nghi: người mới có K=40 để điểm nhanh về đúng thực lực, người chơi lâu năm có K=20 để đảm bảo tính ổn định.")

    # =========================================================================
    # SLIDE 12: THUẬT TOÁN CÂN KÈO SESSION BALANCING
    # =========================================================================
    s12 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s12, COLOR_BG_DARK)
    add_header(s12, "Thuật Toán Cân Kèo Session Balancing (Hỗ Trợ CR-01)", "11. THUẬT TOÁN 2", "TV1: Đào Duy Nhật")

    add_card(s12, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.2), "MỤC TIÊU & RÀNG BUỘC THUẬT TOÁN", [
        "ĐẦU VÀO: 1 sân có từ 5 đến 8 người (Người cố định + Vãng lai đã duyệt).",
        "",
        "RÀNG BUỘC BẮT BUỘC (HARD CONSTRAINTS):",
        "1. Mỗi lượt chọn đúng 4 người vào sân (2 cặp đánh đôi).",
        "2. Công bằng số lượt chơi: Chênh lệch số trận giữa mọi người <= 1.",
        "3. Không ai phải ngồi nghỉ 2 lượt liên tiếp (Ưu tiên người vừa nghỉ).",
        "4. Tôn trọng Cặp cố định (Fixed Pair) nếu người chơi có yêu cầu.",
        "",
        "MỤC TIÊU TỐI ƯU (OBJECTIVE):",
        "• Tối thiểu hóa chênh lệch điểm Elo trung bình giữa 2 đội trong mỗi trận: min |R_team1 - R_team2|.",
    ], COLOR_AMBER)

    add_card(s12, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.2), "VÍ DỤ SỐ MINH HỌA THỰC TẾ (SÂN 7 NGƯỜI)", [
        "Danh sách 7 người: A(1450), B(1420), C(1380), D(1350), E(1300), F(1250), G(1200)",
        "",
        "LƯỢT 1: Thuật toán chọn 4 người vào sân, 3 người nghỉ (E, F, G).",
        "• Đội 1: A(1450) + D(1350) -> R_tb = 1400",
        "• Đội 2: B(1420) + C(1380) -> R_tb = 1400",
        "-> Độ lệch Elo = 0 điểm! Cặp đấu cân bằng tuyệt đối.",
        "",
        "LƯỢT 2: 3 người nghỉ (E, F, G) BẮT BUỘC vào sân. Chọn thêm A.",
        "• Đội 1: A(1450) + G(1200) -> R_tb = 1325",
        "• Đội 2: E(1300) + F(1250) -> R_tb = 1275",
        "-> Độ lệch Elo = 50 điểm (Rất cân bằng). Không ai bị bỏ rơi!",
    ], COLOR_EMERALD)

    add_speaker_note(s12, "Thuật toán Session Balancing là giải pháp giải quyết triệt để vấn đề chia cặp. Bằng giải thuật Heuristic Greedy chạy dưới 5ms, thuật toán chọn ra cặp đấu có độ lệch Elo nhỏ nhất, đồng thời cam kết không ai phải ngồi nghỉ 2 lượt liên tiếp kể cả trong các ca số người lẻ như 5 hay 7 người. Ví dụ trên slide cho thấy ở Lượt 1 độ lệch chỉ là 0 điểm, và ở Lượt 2 những người vừa nghỉ lập tức được ưu tiên vào sân.")

    # =========================================================================
    # SLIDE 13: THUẬT TOÁN PARTNER FINDER & ĐỀ XUẤT KÈO
    # =========================================================================
    s13 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s13, COLOR_BG_DARK)
    add_header(s13, "Thuật Toán Partner Finder & Gợi Ý Kèo Phù Hợp", "12. THUẬT TOÁN 3", "TV1: Đào Duy Nhật")

    add_card(s13, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.2), "CÔNG THỨC CHẤM ĐIỂM ĐA TIÊU CHÍ", [
        "Điểm phù hợp Match Score S in [0, 100]:",
        "S = 0.40 * S_skill + 0.25 * S_distance + 0.20 * S_reputation + 0.15 * S_time",
        "",
        "• S_skill (40%): Độ khớp giữa Elo người chơi và dải trình độ của kèo.",
        "• S_distance (25%): Khoảng cách địa lý tính theo công thức Haversine (tối ưu bán kính 5km tại Đà Nẵng).",
        "• S_reputation (20%): Điểm uy tín của Host và nhóm chơi.",
        "• S_time (15%): Khung giờ sinh hoạt quen thuộc của người chơi.",
    ], COLOR_CYAN)

    add_card(s13, Inches(6.8), Inches(1.8), Inches(5.7), Inches(4.2), "LỢI ÍCH NGHIỆP VỤ THỰC TẾ", [
        "• Tiết kiệm thời gian tìm kiếm: Kèo phù hợp nhất (S >= 75) được gắn huy hiệu 'Kèo Hoàn Hảo' và đưa lên đầu trang chủ.",
        "• Giảm tỷ lệ từ chối: Người chơi chỉ thấy những kèo mình đủ điều kiện, tránh trường hợp xin vào rồi bị host từ chối do lệch trình.",
        "• Thúc đẩy kết nối cộng đồng: Gợi ý các tay vợt đồng hương hoặc cùng khu vực quận Hải Châu, Thanh Khê, Sơn Trà.",
    ], COLOR_EMERALD)

    add_metric_card(s13, Inches(0.8), Inches(6.1), Inches(3.6), Inches(1.1), "4 Tiêu Chí", "Mô Hình Chấm Điểm", "Trình độ, Vị trí, Uy tín, Giờ")
    add_metric_card(s13, Inches(4.8), Inches(6.1), Inches(3.6), Inches(1.1), "S >= 75", "Ngưỡng Gợi Ý Cao", "Hiển thị Top Match trang chủ")
    add_metric_card(s13, Inches(8.8), Inches(6.1), Inches(3.7), Inches(1.1), "< 50ms", "Tốc Độ Tính Toán", "Query trên Composite Index")

    add_speaker_note(s13, "Thuật toán thứ ba là Partner Finder chấm điểm đa tiêu chí dựa trên trình độ, khoảng cách địa lý, uy tín và thời gian. Các kèo có điểm trên 75 sẽ được ưu tiên đề xuất lên trang chủ. Tiếp theo đây, em xin trân trọng kính mời bạn Nguyễn Đức Đạt trình bày phần Thiết kế UI/UX và Chiến lược Đảm bảo chất lượng kiểm thử của dự án.")

    # =========================================================================
    # SLIDE 14: THIẾT KẾ UI/UX THỰC ĐỊA MỘT TAY
    # =========================================================================
    s14 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s14, COLOR_BG_DARK)
    add_header(s14, "Thiết Kế UI/UX Thực Địa: Triết Lý 'Thao Tác Một Tay Tại Sân'", "13. UI / UX DESIGN", "TV2: Nguyễn Đức Đạt")

    add_card(s14, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.2), "ĐẶC THÙ MÔI TRƯỜNG THỰC ĐỊA TẠI SÂN", [
        "• Người chơi một tay cầm vợt dính mồ hôi, một tay cầm điện thoại.",
        "• Ánh sáng đèn LED cao áp công suất lớn dễ làm lóa màn hình.",
        "• Vừa đánh xong rất mệt, không thể tập trung đọc các form chữ nhỏ.",
        "",
        "3 NGUYÊN TẮC THIẾT KẾ ĐỘT PHÁ CỦA NHÓM:",
        "1. VÙNG NGÓN CÁI (THUMB ZONE):",
        "Toàn bộ nút quan trọng (Tạo kèo, Chia cặp, Lưu điểm) nằm ở 1/3 dưới màn hình.",
        "2. QUY TẮC 'CHIA CẶP 3 CHẠM':",
        "Mở app -> Vào chi tiết sân -> Bấm 'Chia tự động' là có ngay trận.",
        "3. NHẬP ĐIỂM DẠNG STEPPER NÚT LỚN:",
        "Bấm nút + / - to rõ để tăng giảm điểm, không cần mở bàn phím ảo.",
    ], COLOR_EMERALD)

    add_card(s14, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.2), "HỆ THỐNG DESIGN SYSTEM TƯƠNG PHẢN CAO", [
        "• Dark Mode chủ đạo: Nền Deep Navy (#0B132B) chống lóa mắt dưới ánh đèn sân cầu lông.",
        "• Màu điểm nhấn thể thao: Xanh Ngọc Cầu Lông (#10B981) và Cyan (#06B6D4) kích thích năng lượng.",
        "• Kích thước chữ số hiển thị tỷ số: 24sp - 32sp in đậm, đứng cách xa 1 mét vẫn nhìn rõ kết quả.",
        "• Huy hiệu nhận diện vai trò: Host (Vương miện vàng), Thành viên cố định (Xanh ngọc), Khách vãng lai (Tím), Waitlist (Cam).",
    ], COLOR_CYAN)

    add_speaker_note(s14, "Kính thưa Thầy/Cô, em là Nguyễn Đức Đạt. Khi thiết kế app cho người chơi cầu lông, em luôn đặt câu hỏi: 'Người dùng thao tác như thế nào khi tay đang ướt mồ hôi và cầm vợt?'. Đó là lý do em áp dụng triết lý Thao tác một tay: mọi hành động nằm trong vùng ngón cái, chia cặp chỉ mất đúng 3 chạm, và nhập điểm bằng nút cộng trừ lớn không cần gõ phím.")

    # =========================================================================
    # SLIDE 15: CHIẾN LƯỢC KIỂM THỬ & SỐ LIỆU THỰC TẾ
    # =========================================================================
    s15 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s15, COLOR_BG_DARK)
    add_header(s15, "Chiến Lược Kiểm Thử 4 Tầng & Số Liệu Thực Tế", "14. KIỂM THỬ PHẦN MỀM", "TV2: Nguyễn Đức Đạt")

    add_card(s15, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.0), "CHIẾN LƯỢC KIỂM THỬ 4 TẦNG TOÀN DIỆN", [
        "• Tầng 1 - Unit Test (Jest): Kiểm thử logic thuần túy (Elo đôi, Balancer cho ca 4, 5, 6, 7, 8 người, Partner Finder, Best Teammate).",
        "• Tầng 2 - Security Rules Test (Firebase Emulator): 16 ca test ma trận phân quyền Host, Player và Unauthenticated.",
        "• Tầng 3 - Integration & E2E Test (scripts/e2e-flow): Luồng tích hợp tự động toàn hệ thống từ Đăng ký -> Tạo kèo -> Vào sân -> Nhập điểm.",
        "• Tầng 4 - Field Test: Kiểm thử thực địa tại sân cầu lông với người thật.",
    ], COLOR_CYAN)

    add_card(s15, Inches(6.8), Inches(1.8), Inches(5.7), Inches(4.0), "QUY TRÌNH BUG LOG & SỬA LỖI THEO TDD", [
        "• Nhóm duy trì tài liệu `docs/test/bug-log.md` ghi nhận toàn bộ lỗi thực tế.",
        "• Nguyên tắc sửa lỗi TDD nghiêm ngặt:",
        "  1. Viết Unit Test tái hiện chính xác lỗi (Test ĐỎ - Failed).",
        "  2. Tiến hành sửa mã nguồn thuật toán/giao diện.",
        "  3. Chạy lại test suite đảm bảo xanh 100% (Test XANH - Passed).",
        "  4. Commit nhỏ theo chuẩn Conventional Commits (`fix(scope): ...`).",
    ], COLOR_EMERALD)

    add_metric_card(s15, Inches(0.8), Inches(6.0), Inches(2.7), Inches(1.2), "278 Tests", "Tổng Ca Kiểm Thử", "Jest + Rules + E2E")
    add_metric_card(s15, Inches(3.8), Inches(6.0), Inches(2.7), Inches(1.2), "100%", "Tỷ Lệ Đạt (Pass)", "0 lỗi tồn đọng")
    add_metric_card(s15, Inches(6.8), Inches(6.0), Inches(2.7), Inches(1.2), "> 88%", "Độ Bao Phủ Code", "Core Business Logic")
    add_metric_card(s15, Inches(9.8), Inches(6.0), Inches(2.7), Inches(1.2), "0 Defect", "Lỗi Nghiêm Trọng", "Tại Feature Freeze")

    add_speaker_note(s15, "Về đảm bảo chất lượng, nhóm xây dựng mô hình kim tự tháp kiểm thử 4 tầng với 278 ca kiểm thử tự động, tỷ lệ PASS đạt 100%. Mọi lỗi phát sinh đều được em ghi nhận vào Bug Log và sửa theo quy trình TDD: viết test đỏ tái hiện trước, sửa code cho test xanh rồi mới commit, đảm bảo không có lỗi hồi quy.")

    # =========================================================================
    # SLIDE 16: KẾT QUẢ FIELD TEST TẠI ĐÀ NẴNG
    # =========================================================================
    s16 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s16, COLOR_BG_DARK)
    add_header(s16, "Kết Quả Kiểm Thử Thực Địa Tại Các Sân Cầu Lông Đà Nẵng", "15. FIELD TEST", "TV2: Nguyễn Đức Đạt")

    add_card(s16, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.0), "ĐỊA ĐIỂM & QUY MÔ THỰC NGHIỆM THỰC TẾ", [
        "• Địa điểm thực địa: Sân Cầu Lông Kỳ Đồng (Q. Thanh Khê) và Sân Tuyên Sơn (Q. Hải Châu).",
        "• Thành phần tham gia: 12 người thật (3 host sân phong trào + 9 tay vợt vãng lai đa dạng trình độ từ Y2 đến K1).",
        "• Kịch bản thử nghiệm: Tổ chức 1 buổi sinh hoạt trọn vẹn 2 tiếng, dùng app thật để nhận người, chia 6 lượt đánh và nhập điểm số.",
    ], COLOR_AMBER)

    add_card(s16, Inches(6.8), Inches(1.8), Inches(5.7), Inches(4.0), "ĐÁNH GIÁ CHỈ SỐ HÀI LÒNG SUS (CHUẨN QUỐC TẾ)", [
        "• Thang đo chuẩn System Usability Scale (SUS 10 câu hỏi).",
        "• Điểm số thực nghiệm đạt: 82.5 / 100 điểm (Hạng A - Excellent).",
        "• Vượt xa mục tiêu cam kết ban đầu trong Charter (>= 75 điểm).",
        "• Phản hồi được khen ngợi nhiều nhất: 'Chia cặp rất nhanh, không mất thời gian cãi nhau xem ai đánh với ai; app chạy mượt kể cả khi sân mất sóng 4G'.",
    ], COLOR_EMERALD)

    add_metric_card(s16, Inches(0.8), Inches(6.0), Inches(3.6), Inches(1.2), "82.5 / 100", "Điểm SUS Đạt Được", "Phân hạng A - Xuất sắc")
    add_metric_card(s16, Inches(4.8), Inches(6.0), Inches(3.6), Inches(1.2), "12 Người", "Người Dùng Thật", "3 Host + 9 Vãng lai")
    add_metric_card(s16, Inches(8.8), Inches(6.0), Inches(3.7), Inches(1.2), "100%", "Hoàn Thành Buổi Chơi", "Không xảy ra gián đoạn")

    add_speaker_note(s16, "Minh chứng rõ nhất cho chất lượng sản phẩm là kết quả Field Test tại Sân Kỳ Đồng và Tuyên Sơn với 12 người dùng thật. Chúng em cho chạy thử buổi đánh 2 tiếng và thu về điểm đánh giá tiện dụng SUS đạt 82.5/100 điểm, thuộc phân hạng A xuất sắc. Các host đánh giá cực cao tính năng chia cặp vì giúp họ giải phóng khỏi cảnh tranh cãi tại sân.")

    # =========================================================================
    # SLIDE 17: KỊCH BẢN TRỰC TIẾP DEMO 5 BƯỚC
    # =========================================================================
    s17 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s17, COLOR_BG_DARK)
    add_header(s17, "Kịch Bản Trực Tiếp Demo Sản Phẩm Trên Thiết Bị Thật (5 Phút)", "16. LIVE DEMO", "TV2 Thao Tác - TV1 Thuyết Minh")

    add_card(s17, Inches(0.8), Inches(1.8), Inches(11.733), Inches(5.2), "5 BƯỚC THAO TÁC TRỰC TIẾP TRÊN ỨNG DỤNG DI ĐỘNG", [
        "BƯỚC 1: TẠO KÈO TUYỂN VÃNG LAI (01:00)",
        "• Host Nam Hải tạo buổi đánh Sân Kỳ Đồng: 2 sân, 10 người cố định, mở tuyển 4 suất vãng lai TB1-TB2.",
        "",
        "BƯỚC 2: NGƯỜI CHƠI XIN SUẤT & TỰ ĐỘNG ĐÔN WAITLIST (01:00)",
        "• Bạn Tuấn (TB1) đặt suất -> Hết chỗ, tự động vào Waitlist #1 -> Host hủy 1 người bận -> Hệ thống tự động đôn Tuấn vào danh sách chính thức tức thời.",
        "",
        "BƯỚC 3: ĐIỂM DANH & CHIA CẶP TỰ ĐỘNG THEO LUẬT CR-01 (01:00)",
        "• Sân 1 có 7 người (ca số lẻ) -> Host bấm 'Chia tự động lượt 1' trong 1 chạm -> Xếp ngay 2 cặp cân bằng Elo và 3 người nghỉ ngơi hợp lý.",
        "",
        "BƯỚC 4: NHẬP TỶ SỐ HIỆP ĐẤU BẰNG 1 TAY (00:45)",
        "• Dùng nút Stepper tăng điểm 21-19 nhanh chóng, bấm xác nhận kết quả trận đấu.",
        "",
        "BƯỚC 5: CẬP NHẬT ELO ĐỘNG & XEM ĐỒNG ĐỘI ĂN Ý NHẤT (01:15)",
        "• Cloud Function tính điểm Elo -> Biểu đồ cá nhân tăng nấc mới -> Mở trang thống kê xem huy hiệu 'Đồng đội ăn ý nhất' với Win Rate >= 60%.",
    ], COLOR_CYAN)

    add_speaker_note(s17, "Và ngay sau đây, nhóm xin chuyển sang phần Live Demo trực tiếp 5 bước trên điện thoại. Bạn Đạt sẽ trực tiếp thao tác trên màn chiếu và em sẽ thuyết minh luồng nghiệp vụ. Kính mời Thầy/Cô cùng theo dõi màn hình.")

    # =========================================================================
    # SLIDE 18: ĐỐI CHIẾU KẾT QUẢ VỚI PROJECT CHARTER
    # =========================================================================
    s18 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s18, COLOR_BG_DARK)
    add_header(s18, "Đối Chiếu Kết Quả Nghiệm Thu Với Project Charter", "17. NGHIỆM THU", "TV1: Đào Duy Nhật")

    add_card(s18, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.2), "CAM KẾT BAN ĐẦU TRONG PROJECT CHARTER", [
        "1. Xây dựng hoàn chỉnh app mobile ghép đội cầu lông:",
        "• Cam kết: Hỗ trợ tạo kèo, nhận người, phân quyền host/guest.",
        "",
        "2. Thuật toán cân bằng cặp đấu:",
        "• Cam kết: Chia cặp < 1 giây; chênh lệch điểm Elo < 100.",
        "",
        "3. Đảm bảo chất lượng kiểm thử:",
        "• Cam kết: 100% ca kiểm thử cốt lõi PASS, không còn lỗi nghiêm trọng.",
        "",
        "4. Đánh giá tính tiện dụng của người dùng thực tế:",
        "• Cam kết: Chỉ số SUS >= 75 điểm.",
    ], COLOR_AMBER)

    add_card(s18, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.2), "KẾT QUẢ THỰC TẾ ĐẠT ĐƯỢC (HOÀN THÀNH 100%)", [
        "1. Ứng dụng chạy mượt mà trên Expo SDK 52:",
        "• Đạt 100%: 14 màn hình hoàn chỉnh, hỗ trợ offline cache tại sân.",
        "",
        "2. Hiệu năng thuật toán vượt kỳ vọng:",
        "• Đạt 100%: Chia cặp chỉ mất < 5ms (nhanh gấp 200 lần chuẩn 1s); độ lệch Elo trung bình chỉ từ 0 - 50 điểm.",
        "",
        "3. Chất lượng kiểm thử xuất sắc:",
        "• Đạt 100%: 278/278 tests PASS tuyệt đối; 0 lỗi tại Feature Freeze.",
        "",
        "4. Trải nghiệm người dùng vượt mục tiêu:",
        "• Đạt 100%: Điểm SUS đạt 82.5 / 100 điểm (Vượt xa mục tiêu 75).",
    ], COLOR_EMERALD)

    add_speaker_note(s18, "Đối chiếu lại với các cam kết trong Project Charter ban đầu, chúng em tự hào báo cáo với Hội đồng rằng dự án đã hoàn thành 100% tất cả các chỉ tiêu KPI, từ hiệu năng thuật toán, chất lượng kiểm thử cho đến mức độ hài lòng của người dùng thực tế.")

    # =========================================================================
    # SLIDE 19: ĐÁNH GIÁ, BÀI HỌC & HƯỚNG PHÁT TRIỂN
    # =========================================================================
    s19 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s19, COLOR_BG_DARK)
    add_header(s19, "Bài Học Kinh Nghiệm Quản Trị & Hướng Phát Triển", "18. BÀI HỌC & TƯƠNG LAI", "TV1 & TV2")

    add_card(s19, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.2), "BÀI HỌC KINH NGHIỆM ĐẮT GIÁ", [
        "BÀI HỌC CỦA TV1 (VỀ QUẢN TRỊ DỰ ÁN):",
        "• Quản trị thay đổi (Change Management) là chìa khóa sống còn. Nhờ quy trình CR-01 bài bản, sự thay đổi lớn về luật 8 người/sân không làm vỡ dự án mà trở thành tính năng giá trị nhất.",
        "• Hợp đồng API (Data Contract) đi trước mã nguồn giúp 2 thành viên làm việc độc lập mà không bao giờ bị conflict.",
        "",
        "BÀI HỌC CỦA TV2 (VỀ THIẾT KẾ & KIỂM THỬ):",
        "• Thiết kế phải đặt trong bối cảnh thực tế: Ra sân cầu lông mới thấy một tay và nút bấm to quan trọng thế nào.",
        "• Kiểm thử thực địa (Field Test) sớm giúp phát hiện ra các lỗi mà phòng lab máy lạnh không bao giờ thấy được.",
    ], COLOR_CYAN)

    add_card(s19, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.2), "3 HƯỚNG PHÁT TRIỂN TIẾP THEO (POST-CAPSTONE)", [
        "1. TÍCH HỢP CỔNG THANH TOÁN TỰ ĐỘNG (THÁNG 1):",
        "• Tích hợp PayOS/SePay tự động giữ cọc khi đặt suất, triệt tiêu 100% tình trạng bùng kèo.",
        "",
        "2. MÔ-ĐUN GIẢI ĐẤU CLB MINI (THÁNG 2):",
        "• Hỗ trợ các CLB phong trào tự tổ chức giải đấu nội bộ theo thể thức vòng tròn hoặc loại trực tiếp.",
        "",
        "3. TRỢ LÝ AI GỢI Ý CHIẾN THUẬT (THÁNG 3):",
        "• Ứng dụng AI phân tích lịch sử trận đấu để gợi ý chiến thuật phối hợp điểm mạnh/yếu giữa 2 tay vợt.",
    ], COLOR_EMERALD)

    add_speaker_note(s19, "Sau 12 tuần thực hiện đồ án, bài học lớn nhất chúng em nhận được là sự phối hợp ăn ý thông qua Data Contract, quy trình quản trị thay đổi nghiêm túc và tinh thần hướng đến người dùng thực tế. Trong tương lai, nhóm sẽ mở rộng thêm tính năng thanh toán cọc tự động và tổ chức giải đấu mini cho các CLB.")

    # =========================================================================
    # SLIDE 20: LỜI CẢM ƠN & PHIÊN PHẢN BIỆN Q&A
    # =========================================================================
    s20 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s20, COLOR_BG_DARK)

    # Big Thank you text
    tb_thank = s20.shapes.add_textbox(Inches(1.0), Inches(1.5), Inches(11.333), Inches(1.5))
    p_th = tb_thank.text_frame.paragraphs[0]
    p_th.alignment = PP_ALIGN.CENTER
    p_th.text = "XIN TRÂN TRỌNG CẢM ƠN HỘI ĐỒNG!"
    p_th.font.size = Pt(36)
    p_th.font.bold = True
    p_th.font.color.rgb = COLOR_TEXT_WHITE

    p_th_sub = tb_thank.text_frame.add_paragraph()
    p_th_sub.alignment = PP_ALIGN.CENTER
    p_th_sub.text = "Kính chúc Quý Thầy/Cô nhiều sức khỏe và thành công"
    p_th_sub.font.size = Pt(18)
    p_th_sub.font.color.rgb = COLOR_EMERALD

    add_card(s20, Inches(1.5), Inches(3.4), Inches(10.333), Inches(3.2), "PHIÊN HỎI & ĐÁP (Q&A SESSION)", [
        "Nhóm sinh viên thực hiện: Đào Duy Nhật (TV1) & Nguyễn Đức Đạt (TV2)",
        "Đề tài: Hệ thống Ghép Đội & Cân Bằng Kèo Cầu Lông (Mobile App)",
        "--------------------------------------------------------------------------------------------------",
        "Tài liệu dự án sẵn sàng tra cứu phục vụ phản biện:",
        "• Ngân hàng 35 câu hỏi & đáp án chuyên sâu: docs/slides/qa-bank.md",
        "• 12 chương Báo cáo Quản trị Dự án hoàn chỉnh: docs/report/",
        "• Hợp đồng API & Kiến trúc hệ thống: docs/api/ & docs/decisions/",
        "• Báo cáo kiểm thử 278 tests & Bug Log: docs/test/",
    ], COLOR_CYAN)

    add_speaker_note(s20, "Nhóm chúng em xin trân trọng cảm ơn Quý Thầy/Cô trong Hội đồng đã chú ý lắng nghe phần trình bày của nhóm. Chúng em đã sẵn sàng tiếp thu các ý kiến đóng góp quý báu và giải đáp các câu hỏi phản biện của Quý Thầy/Cô. Em xin cảm ơn!")

    # Lưu file
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    prs.save(output_path)
    print(f"[SUCCESS] Đã tạo thành công bài thuyết trình PowerPoint: {output_path}")

if __name__ == "__main__":
    out_file = os.path.abspath("docs/slides/Slide-Bao-Ve-Do-An-QLDAPM.pptx")
    build_presentation(out_file)

