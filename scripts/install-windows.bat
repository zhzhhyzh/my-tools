@echo off
setlocal enabledelayedexpansion
echo ============================================
echo    PDF Tools Suite - Windows Installer
echo ============================================
echo.

:: Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed.
    echo         Download from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do echo [OK] Node.js %%v

:: Check Python
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed.
    echo         Download from: https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('python --version') do echo [OK] %%v

echo.
echo [1/3] Installing Node.js backend dependencies...
cd /d "%~dp0backend"
call npm install --production
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install backend dependencies.
    pause
    exit /b 1
)
echo [OK] Backend dependencies installed.

echo.
echo [2/3] Installing Python processing dependencies...
cd /d "%~dp0processing"
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install Python dependencies.
    pause
    exit /b 1
)
echo [OK] Python dependencies installed.

echo.
echo [3/3] Building frontend...
cd /d "%~dp0frontend"
call npm install
call npx vite build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build frontend.
    pause
    exit /b 1
)
echo [OK] Frontend built.

echo.
echo ============================================
echo    Installation complete!
echo    Run "run.bat" to start PDF Tools.
echo ============================================
echo.

:: Optional dependencies notice
echo.
echo [OPTIONAL] For full functionality, also install:
echo   - LibreOffice (Office conversions): https://www.libreoffice.org/
echo   - Poppler (PDF to image):  install via: choco install poppler
echo   - Tesseract OCR:           install via: choco install tesseract
echo   - wkhtmltopdf (HTML-PDF):  https://wkhtmltopdf.org/
echo.
pause
