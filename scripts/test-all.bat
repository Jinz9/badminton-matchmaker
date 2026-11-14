@echo off
echo ========================================================
echo  CHAY TOAN BO TEST SUITE (DOMAIN + CONFIG + FUNCTIONS)
echo ========================================================
call npm test
if %errorlevel% neq 0 exit /b %errorlevel%

echo --------------------------------------------------------
echo  CHAY TEST CLOUD FUNCTIONS
echo --------------------------------------------------------
node scripts\sync-domain.js
cd functions
call npm test
cd ..
