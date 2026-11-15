"""
SCRIPT XUẤT BẢN BÁO CÁO QLDAPM SANG ĐỊNH DẠNG MICROSOFT WORD (.DOCX)
Đồ án: Hệ thống ghép đội và cân bằng kèo cầu lông (Mobile App - Đà Nẵng)
Tác giả: Nhóm 02 (Đào Duy Nhật - TV1 & Nguyễn Đức Đạt - TV2)
"""

import os
import re
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

REPORT_DIR = os.path.join(os.path.dirname(__file__), "..", "docs", "report")
OUTPUT_MD_PATH = os.path.join(REPORT_DIR, "Bao-Cao-Tong-Ket-QLDAPM-Nhom-02.md")
OUTPUT_DOCX_PATH = os.path.join(REPORT_DIR, "Bao-Cao-Tong-Ket-QLDAPM-Nhom-02.docx")

CHAPTER_FILES = [
    "chap01-intro.md",
    "chap02-charter-stakeholders.md",
    "chap03-wbs-raci.md",
    "chap04-schedule-gantt.md",
    "chap05-risk-management.md",
    "chap06-system-design.md",
    "chap07-quality-management.md",
    "chap08-change-management.md",
    "chap09-communication-meetings.md",
    "chap10-project-results.md",
    "chap11-lessons-future-work.md",
    "chap12-appendices.md",
]

def set_cell_background(cell, fill_hex):
    """Đặt màu nền cho cell trong bảng"""
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Đặt khoảng đệm padding cho cell"""
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def set_table_borders(table, color="D3D3D3"):
    """Đặt đường viền mảnh trang nhã cho bảng"""
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="4" w:space="0" w:color="{color}"/>'
        f'<w:bottom w:val="single" w:sz="6" w:space="0" w:color="{color}"/>'
        f'<w:insideH w:val="single" w:sz="4" w:space="0" w:color="{color}"/>'
        f'<w:insideV w:val="none"/>'
        f'<w:left w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def add_styled_paragraph(doc, text, style='Normal', space_after=4, bold_prefix=None):
    p = doc.add_paragraph(style=style)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = 1.15

    # Xử lý inline bold Markdown: **text**
    parts = re.split(r'(\*\*.*?\*\*)', text)
    for part in parts:
        if part.startswith('**') and part.endswith('**'):
            run = p.add_run(part[2:-2])
            run.bold = True
        elif part.startswith('*') and part.endswith('*'):
            run = p.add_run(part[1:-1])
            run.italic = True
        elif part.startswith('`') and part.endswith('`'):
            run = p.add_run(part[1:-1])
            run.font.name = 'Consolas'
            run.font.size = Pt(10.5)
            run.font.color.rgb = RGBColor(180, 40, 40)
        else:
            p.add_run(part)
    return p

def create_title_page(doc):
    """Tạo trang bìa học thuật trang trọng chuẩn Đại học"""
    # Header đơn vị
    p_uni = doc.add_paragraph()
    p_uni.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_uni = p_uni.add_run("BỘ GIÁO DỤC VÀ ĐÀO TẠO\nTRƯỜNG ĐẠI HỌC BÁCH KHOA - ĐẠI HỌC ĐÀ NẴNG\nKHOA CÔNG NGHỆ THÔNG TIN\n")
    r_uni.bold = True
    r_uni.font.size = Pt(13)
    r_uni.font.color.rgb = RGBColor(0, 51, 102)

    # Đường kẻ ngang trang trí
    p_line = doc.add_paragraph()
    p_line.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_line.add_run("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n\n").font.color.rgb = RGBColor(0, 102, 204)

    # Tiêu đề báo cáo
    p_rep = doc.add_paragraph()
    p_rep.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_rep = p_rep.add_run("BÁO CÁO TỔNG KẾT HỌC PHẦN\nQUẢN TRỊ DỰ ÁN PHẦN MỀM (QLDAPM)\n\n")
    r_rep.bold = True
    r_rep.font.size = Pt(16)
    r_rep.font.color.rgb = RGBColor(180, 0, 0)

    # Tên đề tài
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_title = p_title.add_run("ĐỀ TÀI:\n\"HỆ THỐNG GHÉP ĐỘI VÀ CÂN BẰNG KÈO CẦU LÔNG PHONG TRÀO TẠI TP. ĐÀ NẴNG (MOBILE APP)\"\n\n\n")
    r_title.bold = True
    r_title.font.size = Pt(18)
    r_title.font.color.rgb = RGBColor(0, 51, 102)

    # Khung thông tin sinh viên & giảng viên
    table = doc.add_table(rows=4, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    info_data = [
        ("Giảng viên hướng dẫn:", "ThS. Nguyễn Thanh Tuấn"),
        ("Học phần:", "Quản trị Dự án Phần mềm (Mã HP: QLDAPM)"),
        ("Sinh viên thực hiện:", "1. Đào Duy Nhật (TV1 - PM, Backend & Thuật toán)\n2. Nguyễn Đức Đạt (TV2 - QA Lead, UI/UX & Mobile)"),
        ("Thời gian thực hiện:", "Học kỳ I - Năm học 2026 – 2027 (12 Tuần | 6 Sprint)")
    ]

    for i, (label, val) in enumerate(info_data):
        row = table.rows[i]
        cell_lbl, cell_val = row.cells[0], row.cells[1]
        cell_lbl.width = Inches(2.2)
        cell_val.width = Inches(4.2)
        
        r_lbl = cell_lbl.paragraphs[0].add_run(label)
        r_lbl.bold = True
        r_lbl.font.size = Pt(11.5)
        
        r_v = cell_val.paragraphs[0].add_run(val)
        r_v.font.size = Pt(11.5)
        
        set_cell_margins(cell_lbl, top=80, bottom=80)
        set_cell_margins(cell_val, top=80, bottom=80)

    # Footer địa danh
    p_foot = doc.add_paragraph()
    p_foot.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_foot.paragraph_format.space_before = Pt(80)
    r_foot = p_foot.add_run("ĐÀ NẴNG, NĂM 2027")
    r_foot.bold = True
    r_foot.font.size = Pt(12)

    doc.add_page_break()

def convert_markdown_to_docx():
    print(f"Bắt đầu xuất bản Báo cáo Tổng kết...")
    doc = Document()

    # Cấu hình lề trang (A4 chuẩn: Top/Bottom: 2cm, Left: 3cm, Right: 2cm)
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(1.1)
        section.right_margin = Inches(0.8)

    # 1. Tạo trang bìa
    create_title_page(doc)

    # 2. Đọc và ghép nối 12 chương
    concatenated_content = []

    for idx, chap_file in enumerate(CHAPTER_FILES):
        file_path = os.path.join(REPORT_DIR, chap_file)
        if not os.path.exists(file_path):
            print(f"Cảnh báo: Không tìm thấy file {chap_file}")
            continue

        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        concatenated_content.append(f"\n\n<!-- PAGE_BREAK -->\n\n{content}")

        # Thêm ngắt trang giữa các chương
        if idx > 0:
            doc.add_page_break()

        lines = content.split("\n")
        in_code_block = False
        code_lines = []
        in_table = False
        table_rows = []

        for line in lines:
            line_str = line.strip()

            # Xử lý code block
            if line_str.startswith("```"):
                if not in_code_block:
                    in_code_block = True
                    code_lines = []
                else:
                    in_code_block = False
                    # Ghi code block
                    code_text = "\n".join(code_lines)
                    p = doc.add_paragraph()
                    p.paragraph_format.space_before = Pt(4)
                    p.paragraph_format.space_after = Pt(6)
                    p.paragraph_format.left_indent = Inches(0.3)
                    run = p.add_run(code_text)
                    run.font.name = "Consolas"
                    run.font.size = Pt(9.5)
                    run.font.color.rgb = RGBColor(60, 60, 60)
                continue

            if in_code_block:
                code_lines.append(line)
                continue

            # Xử lý bảng Markdown
            if line_str.startswith("|") and line_str.endswith("|"):
                # Bỏ qua dòng phân cách |---|---|
                if re.match(r"^\|(\s*[-:]+\s*\|)+$", line_str):
                    continue
                cells = [c.strip() for c in line_str[1:-1].split("|")]
                table_rows.append(cells)
                in_table = True
                continue
            else:
                if in_table and len(table_rows) > 0:
                    # Tạo bảng Word
                    num_rows = len(table_rows)
                    num_cols = max(len(r) for r in table_rows)
                    tbl = doc.add_table(rows=num_rows, cols=num_cols)
                    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
                    set_table_borders(tbl)

                    for r_idx, row_data in enumerate(table_rows):
                        row = tbl.rows[r_idx]
                        is_header = (r_idx == 0)
                        for c_idx, cell_value in enumerate(row_data):
                            if c_idx < len(row.cells):
                                cell = row.cells[c_idx]
                                cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
                                set_cell_margins(cell, top=70, bottom=70, left=100, right=100)
                                if is_header:
                                    set_cell_background(cell, "EBF3FA")
                                    p = cell.paragraphs[0]
                                    run = p.add_run(cell_value)
                                    run.bold = True
                                    run.font.size = Pt(10)
                                    run.font.color.rgb = RGBColor(0, 51, 102)
                                else:
                                    if r_idx % 2 == 1:
                                        set_cell_background(cell, "FBFDFF")
                                    p = cell.paragraphs[0]
                                    # Format inline bold/code
                                    add_styled_paragraph(doc, cell_value) # helper
                                    p.text = "" # reset
                                    # Inline format
                                    parts = re.split(r'(\*\*.*?\*\*)', cell_value)
                                    for part in parts:
                                        if part.startswith('**') and part.endswith('**'):
                                            p.add_run(part[2:-2]).bold = True
                                        elif part.startswith('`') and part.endswith('`'):
                                            r = p.add_run(part[1:-1])
                                            r.font.name = "Consolas"
                                            r.font.size = Pt(9.5)
                                        else:
                                            p.add_run(part)
                                    p.paragraph_format.space_after = Pt(2)
                                    for run in p.runs:
                                        run.font.size = Pt(9.5)
                    table_rows = []
                    in_table = False
                    doc.add_paragraph().paragraph_format.space_after = Pt(2)

            if not line_str:
                continue

            # Tiêu đề Heading 1 (#)
            if line_str.startswith("# "):
                title_text = line_str[2:].strip()
                p = doc.add_paragraph(style='Heading 1')
                p.paragraph_format.space_before = Pt(14)
                p.paragraph_format.space_after = Pt(6)
                p.paragraph_format.keep_with_next = True
                run = p.add_run(title_text)
                run.bold = True
                run.font.size = Pt(16)
                run.font.color.rgb = RGBColor(0, 51, 102)
                continue

            # Tiêu đề Heading 2 (##)
            if line_str.startswith("## "):
                title_text = line_str[3:].strip()
                p = doc.add_paragraph(style='Heading 2')
                p.paragraph_format.space_before = Pt(10)
                p.paragraph_format.space_after = Pt(4)
                p.paragraph_format.keep_with_next = True
                run = p.add_run(title_text)
                run.bold = True
                run.font.size = Pt(13.5)
                run.font.color.rgb = RGBColor(0, 80, 150)
                continue

            # Tiêu đề Heading 3 (###)
            if line_str.startswith("### "):
                title_text = line_str[4:].strip()
                p = doc.add_paragraph(style='Heading 3')
                p.paragraph_format.space_before = Pt(8)
                p.paragraph_format.space_after = Pt(3)
                p.paragraph_format.keep_with_next = True
                run = p.add_run(title_text)
                run.bold = True
                run.font.size = Pt(12)
                run.font.color.rgb = RGBColor(30, 30, 30)
                continue

            # Blockquote (> )
            if line_str.startswith("> "):
                quote_text = line_str[2:].strip()
                p = doc.add_paragraph()
                p.paragraph_format.left_indent = Inches(0.3)
                p.paragraph_format.space_after = Pt(4)
                run = p.add_run(quote_text)
                run.italic = True
                run.font.color.rgb = RGBColor(100, 100, 100)
                continue

            # Bullet items (- hoặc *)
            if line_str.startswith("- ") or line_str.startswith("* "):
                bullet_text = line_str[2:].strip()
                p = doc.add_paragraph(style='List Bullet')
                p.paragraph_format.space_after = Pt(3)
                p.paragraph_format.line_spacing = 1.15
                add_styled_paragraph(doc, bullet_text)
                # Xóa paragraph rỗng vừa tạo bởi add_styled_paragraph
                # Thay bằng xử lý inline trực tiếp
                p.text = ""
                parts = re.split(r'(\*\*.*?\*\*)', bullet_text)
                for part in parts:
                    if part.startswith('**') and part.endswith('**'):
                        p.add_run(part[2:-2]).bold = True
                    elif part.startswith('`') and part.endswith('`'):
                        r = p.add_run(part[1:-1])
                        r.font.name = "Consolas"
                        r.font.size = Pt(10)
                        r.font.color.rgb = RGBColor(180, 40, 40)
                    else:
                        p.add_run(part)
                continue

            # Numbered items (1. 2.)
            num_match = re.match(r"^(\d+)\.\s+(.*)$", line_str)
            if num_match:
                num_text = num_match.group(2)
                p = doc.add_paragraph(style='List Number')
                p.paragraph_format.space_after = Pt(3)
                p.paragraph_format.line_spacing = 1.15
                parts = re.split(r'(\*\*.*?\*\*)', num_text)
                for part in parts:
                    if part.startswith('**') and part.endswith('**'):
                        p.add_run(part[2:-2]).bold = True
                    elif part.startswith('`') and part.endswith('`'):
                        r = p.add_run(part[1:-1])
                        r.font.name = "Consolas"
                        r.font.size = Pt(10)
                        r.font.color.rgb = RGBColor(180, 40, 40)
                    else:
                        p.add_run(part)
                continue

            # Đoạn văn thông thường
            p = doc.add_paragraph()
            p.paragraph_format.space_after = Pt(4)
            p.paragraph_format.line_spacing = 1.15
            parts = re.split(r'(\*\*.*?\*\*)', line_str)
            for part in parts:
                if part.startswith('**') and part.endswith('**'):
                    p.add_run(part[2:-2]).bold = True
                elif part.startswith('*') and part.endswith('*'):
                    p.add_run(part[1:-1]).italic = True
                elif part.startswith('`') and part.endswith('`'):
                    r = p.add_run(part[1:-1])
                    r.font.name = "Consolas"
                    r.font.size = Pt(10)
                    r.font.color.rgb = RGBColor(180, 40, 40)
                else:
                    p.add_run(part)

    # 3. Lưu file Markdown ghép nối
    with open(OUTPUT_MD_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(concatenated_content))
    print(f"✔ Đã tạo file Markdown tổng hợp: {OUTPUT_MD_PATH}")

    # 4. Lưu file Word (.docx)
    doc.save(OUTPUT_DOCX_PATH)
    print(f"✔ ĐÃ XUẤT BẢN THÀNH CÔNG FILE WORD (.DOCX): {OUTPUT_DOCX_PATH}")

if __name__ == "__main__":
    convert_markdown_to_docx()
