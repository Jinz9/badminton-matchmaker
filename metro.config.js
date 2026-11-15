// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Cấu hình bỏ qua thư mục functions/ và docs/ để tránh bundling conflict
config.resolver.blockList = [
  /functions\/.*/,
  /docs\/.*/,
  /\.git\/.*/
];

module.exports = config;
