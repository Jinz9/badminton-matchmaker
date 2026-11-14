@echo off
echo ========================================================
echo  KHOI DONG FIREBASE EMULATOR SUITE CHO PROJECT QLDAPM
echo  Auth: 9099 ^| Firestore: 8080 ^| Functions: 5001 ^| UI: 4000
echo ========================================================
node scripts\sync-domain.js
npx firebase emulators:start
