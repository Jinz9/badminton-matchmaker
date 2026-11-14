#!/usr/bin/env bash
# Copy bộ skill vào .agent/skills của thư mục hiện tại (hoặc đường dẫn truyền vào).
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
DEST="${1:-.agent/skills}"
mkdir -p "$DEST"
cp -R "$HERE/skills/." "$DEST/"
echo "Đã copy các skill vào: $DEST"
ls "$DEST"
echo
echo "Việc tiếp theo:"
echo "  1. Khởi động lại phiên agent trong Antigravity."
echo "  2. Cài skill Firebase chính thức:"
echo "       npx skills add firebase/agent-skills --agent=antigravity"
echo "  3. Xem README.md để biết các skill bên ngoài khác và cách kiểm tra chúng trước khi cài."
