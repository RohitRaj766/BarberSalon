@echo off
REM Test Barber Shop API

setlocal enabledelayedexpansion

set BASE_URL=http://localhost:3000

echo.
echo ===== Testing Barber Shop API =====
echo.

REM Test 1: Slots API
echo Testing /api/slots...
curl -s "%BASE_URL%/api/slots" > slots_response.txt
findstr /M "success" slots_response.txt >nul
if %errorlevel% equ 0 (
    echo [OK] Slots API working
    type slots_response.txt
) else (
    echo [FAILED] Slots API failed
    type slots_response.txt
)
echo.

REM Test 2: Queue API
echo Testing /api/queue...
curl -s "%BASE_URL%/api/queue" > queue_response.txt
findstr /M "success" queue_response.txt >nul
if %errorlevel% equ 0 (
    echo [OK] Queue API working
    type queue_response.txt
) else (
    echo [FAILED] Queue API failed
    type queue_response.txt
)
echo.

REM Test 3: Book API
echo Testing /api/book (validation)...
curl -s -X POST "%BASE_URL%/api/book" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"\",\"phone\":\"\"}" > book_response.txt
findstr /M "success" book_response.txt >nul
if %errorlevel% equ 0 (
    echo [OK] Book API validation working
    type book_response.txt
) else (
    echo [FAILED] Book API validation failed
    type book_response.txt
)
echo.

REM Test 4: Admin Login
echo Testing /api/admin/login...
curl -s -X POST "%BASE_URL%/api/admin/login" ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}" > login_response.txt
findstr /M "success" login_response.txt >nul
if %errorlevel% equ 0 (
    echo [OK] Admin Login API working
    type login_response.txt
) else (
    echo [FAILED] Admin Login API failed
    type login_response.txt
)
echo.

REM Cleanup
del slots_response.txt queue_response.txt book_response.txt login_response.txt

echo Testing complete!
pause
