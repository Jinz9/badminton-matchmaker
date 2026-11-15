/**
 * SCRIPT GÁN ROLE ADMIN / HOST QUA CUSTOM USER CLAIMS (FIREBASE ADMIN SDK)
 * Tác giả: Đào Duy Nhật (TV1 - PM & Backend Lead)
 *
 * ⚠️ LƯU Ý BẢO MẬT TUYỆT ĐỐI:
 * Script này sử dụng Service Account Key có quyền tối cao (Admin SDK).
 * Tuyệt đối KHÔNG commit file serviceAccountKey.json lên GitHub! (Đã cấu hình trong .gitignore)
 *
 * CÁCH DÙNG:
 * 1. Chạy trên Cloud Firebase thật:
 *    node scripts/set-admin.js <UID> <ROLE: admin | host | player>
 *
 * 2. Chạy trên Local Emulator:
 *    set FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
 *    set FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
 *    node scripts/set-admin.js <UID> <ROLE: admin | host | player>
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const SERVICE_ACCOUNT_FILE = path.resolve(__dirname, '../serviceAccountKey.json');
const VALID_ROLES = ['admin', 'host', 'player'];

async function main() {
  const args = process.argv.slice(2);
  const uid = args[0];
  const role = args[1]?.toLowerCase();

  if (!uid || !role) {
    console.log('\n================================================================');
    console.log('📌 HƯỚNG DẪN GÁN QUYỀN (ROLE ASSIGNMENT CLI)');
    console.log('================================================================');
    console.log('Cú pháp:');
    console.log('  node scripts/set-admin.js <UID> <ROLE: admin | host | player>\n');
    console.log('Ví dụ:');
    console.log('  node scripts/set-admin.js usr_nhat_01 admin');
    console.log('  node scripts/set-admin.js usr_dat_02 host');
    console.log('  node scripts/set-admin.js usr_guest_03 player');
    console.log('================================================================\n');
    process.exit(1);
  }

  if (!VALID_ROLES.includes(role)) {
    console.error(`❌ Lỗi: Role "${role}" không hợp lệ. Phải là một trong: ${VALID_ROLES.join(', ')}`);
    process.exit(1);
  }

  const isEmulator = Boolean(process.env.FIREBASE_AUTH_EMULATOR_HOST);

  if (isEmulator) {
    console.log(`[EMULATOR MODE] Đang kết nối tới Auth Emulator: ${process.env.FIREBASE_AUTH_EMULATOR_HOST}`);
    admin.initializeApp({
      projectId: process.env.GCLOUD_PROJECT || 'badminton-danang',
    });
  } else {
    if (!fs.existsSync(SERVICE_ACCOUNT_FILE)) {
      console.error('\n❌ KHÔNG TÌM THẤY FILE SERVICE ACCOUNT KEY!');
      console.error('----------------------------------------------------------------');
      console.error('⚠️ HƯỚNG DẪN THỦ CÔNG DÀNH CHO TV1:');
      console.error('1. Mở Firebase Console: https://console.firebase.google.com/project/badminton-danang/settings/serviceaccounts/adminsdk');
      console.error('2. Bấm nút "Generate new private key" (Tạo khóa riêng tư mới) và tải file JSON về.');
      console.error(`3. Đổi tên file vừa tải thành "serviceAccountKey.json" và đặt tại:`);
      console.error(`   ${SERVICE_ACCOUNT_FILE}`);
      console.error('4. Chạy lại lệnh này.');
      console.error('----------------------------------------------------------------\n');
      process.exit(1);
    }

    const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id || 'badminton-danang',
    });
    console.log(`[CLOUD MODE] Đã nạp Service Account cho project: ${serviceAccount.project_id}`);
  }

  try {
    console.log(`⏳ Đang tìm người dùng với UID: ${uid}...`);
    const userRecord = await admin.auth().getUser(uid);
    console.log(`✓ Đã tìm thấy tài khoản: ${userRecord.email || userRecord.displayName || uid}`);

    const customClaims = {
      role,
      admin: role === 'admin',
      host: role === 'host',
    };

    console.log(`⏳ Đang gán Custom Claims: ${JSON.stringify(customClaims)}...`);
    await admin.auth().setCustomUserClaims(uid, customClaims);
    console.log(`✓ Gán Custom Claims thành công!`);

    const firestore = admin.firestore();
    const userDocRef = firestore.collection('users').doc(uid);
    const docSnap = await userDocRef.get();

    if (docSnap.exists) {
      await userDocRef.update({
        role,
        updatedAt: new Date().toISOString(),
      });
      console.log(`✓ Đã cập nhật trường "role: ${role}" vào Firestore tài liệu /users/${uid}`);
    } else {
      console.log(`ℹ️ Lưu ý: Chưa có tài liệu Firestore /users/${uid} (sẽ được tạo khi người dùng hoàn tất Onboarding).`);
    }

    console.log('\n================================================================');
    console.log(`🎉 HOÀN THÀNH CẤP QUYỀN THÀNH CÔNG CHO USER: ${uid}`);
    console.log(`   - Email: ${userRecord.email || 'N/A'}`);
    console.log(`   - Role mới: ${role.toUpperCase()}`);
    console.log(`   - Ghi chú: Người chơi cần đăng xuất và đăng nhập lại trên App để token mới có hiệu lực.`);
    console.log('================================================================\n');
  } catch (error) {
    console.error(`❌ Thao tác thất bại: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
