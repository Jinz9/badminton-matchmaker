/**
 * Script đồng bộ mã nguồn Domain & Config sang thư mục functions/
 * Đảm bảo Single Source of Truth tại src/domain và src/config
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const srcDomain = path.join(rootDir, 'src', 'domain');
const srcConfig = path.join(rootDir, 'src', 'config');

const targetDomain = path.join(rootDir, 'functions', 'src', 'domain');
const targetConfig = path.join(rootDir, 'functions', 'src', 'config');

function copyDirRecursive(source, target) {
  if (!fs.existsSync(source)) {
    return;
  }
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const entries = fs.readdirSync(source, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(source, entry.name);
    const destPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('[sync-domain] Đang đồng bộ domain logic sang functions/src/domain...');
copyDirRecursive(srcDomain, targetDomain);

console.log('[sync-domain] Đang đồng bộ config sang functions/src/config...');
copyDirRecursive(srcConfig, targetConfig);

console.log('[sync-domain] Đồng bộ hoàn tất thành công!');
