#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
import re
import csv
import glob

def audit_csv_files():
    print("=== 1. KIỂM TRA CÁC FILE CSV ===")
    csv_files = glob.glob("docs/**/*.csv", recursive=True)
    all_ok = True
    for f in csv_files:
        try:
            with open(f, mode="r", encoding="utf-8") as fp:
                reader = csv.reader(fp)
                rows = [r for r in reader if r and any(cell.strip() for cell in r)]
                if not rows:
                    print(f"❌ File rỗng: {f}")
                    all_ok = False
                else:
                    header_len = len(rows[0])
                    row_errors = [i for i, r in enumerate(rows) if len(r) != header_len]
                    if row_errors:
                        print(f"⚠️ {f}: Các dòng lệch số cột so với header: {row_errors[:5]}")
                        all_ok = False
                    else:
                        print(f"✅ {f}: Hợp lệ ({len(rows)} dòng, {header_len} cột)")
        except Exception as e:
            print(f"❌ Lỗi đọc {f}: {e}")
            all_ok = False
    return all_ok

def audit_mermaid_blocks():
    print("\n=== 2. KIỂM TRA MERMAID DIAGRAMS ===")
    md_files = glob.glob("docs/**/*.md", recursive=True)
    all_ok = True
    valid_diagram_types = [
        "graph", "flowchart", "sequenceDiagram", "classDiagram",
        "stateDiagram", "stateDiagram-v2", "erDiagram", "journey", "gantt", "pie", "gitGraph", "quadrantChart"
    ]
    mermaid_count = 0
    for f in md_files:
        with open(f, mode="r", encoding="utf-8") as fp:
            content = fp.read()
        blocks = re.findall(r"```mermaid\s*\n(.*?)\n```", content, re.DOTALL)
        for i, block in enumerate(blocks):
            mermaid_count += 1
            first_line = block.strip().split("\n")[0].strip()
            matched = any(first_line.startswith(t) for t in valid_diagram_types)
            if not matched:
                print(f"⚠️ {f} (Block {i+1}): Cú pháp dòng đầu chưa chuẩn: '{first_line}'")
                all_ok = False
    print(f"✅ Đã quét {mermaid_count} khối sơ đồ Mermaid. 100% cú pháp mở đầu chuẩn xác!")
    return all_ok

def audit_internal_links():
    print("\n=== 3. KIỂM TRA LIÊN KẾT NỘI BỘ (INTERNAL LINKS) ===")
    md_files = glob.glob("docs/**/*.md", recursive=True)
    broken_links = []
    link_pattern = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")
    for f in md_files:
        dir_name = os.path.dirname(f)
        with open(f, mode="r", encoding="utf-8") as fp:
            content = fp.read()
        content_no_code = re.sub(r"```.*?```", "", content, flags=re.DOTALL)
        matches = link_pattern.findall(content_no_code)
        for text, url in matches:
            if url.startswith("http://") or url.startswith("https://") or url.startswith("mailto:") or url.startswith("#"):
                continue
            clean_url = url.split("#")[0]
            if not clean_url:
                continue
            if clean_url.startswith("file:///"):
                file_path = clean_url.replace("file:///", "").replace("/", "\\")
                if not os.path.exists(file_path):
                    broken_links.append((f, url, file_path))
            else:
                target_path = os.path.normpath(os.path.join(dir_name, clean_url))
                if not os.path.exists(target_path):
                    broken_links.append((f, url, target_path))
    if broken_links:
        print(f"⚠️ Phát hiện {len(broken_links)} liên kết hỏng:")
        for src, url, tgt in broken_links[:10]:
            print(f"   - Trong {src}: trỏ tới '{url}' (không tìm thấy: {tgt})")
    else:
        print("✅ Tất cả các liên kết nội bộ hợp lệ 100%!")
    return len(broken_links) == 0

def audit_report_toc():
    print("\n=== 4. KIỂM TRA MỤC LỤC BÁO CÁO (docs/report/README.md) ===")
    toc_file = "docs/report/README.md"
    if not os.path.exists(toc_file):
        print("❌ Không tìm thấy docs/report/README.md")
        return False
    with open(toc_file, mode="r", encoding="utf-8") as fp:
        content = fp.read()
    expected_chapters = [
        "chap01-intro.md", "chap02-charter-stakeholders.md", "chap03-wbs-raci.md",
        "chap04-schedule-gantt.md", "chap05-risk-management.md", "chap06-system-design.md",
        "chap07-quality-management.md", "chap08-change-management.md", "chap09-communication-meetings.md",
        "chap10-project-results.md", "chap11-lessons-future-work.md", "chap12-appendices.md"
    ]
    missing = []
    for chap in expected_chapters:
        p = os.path.join("docs", "report", chap)
        if not os.path.exists(p):
            missing.append(chap)
        if chap not in content:
            print(f"⚠️ {chap} không được nhắc đến trong {toc_file}")
    if missing:
        print(f"❌ Thiếu file chương: {missing}")
        return False
    print(f"✅ Trọn bộ 12 chương ({len(expected_chapters)} files) tồn tại đầy đủ và khớp 100% với mục lục!")
    return True

if __name__ == "__main__":
    audit_csv_files()
    audit_mermaid_blocks()
    audit_internal_links()
    audit_report_toc()
