@echo off
echo ============================================
echo    PDF Tools Suite - Starting...
echo ============================================
echo.

:: Start Python Processing Service
echo [1/2] Starting Processing Engine (port 5000)...
start "" /min cmd /c "cd /d "%~dp0processing" && python -m uvicorn main:app --host 127.0.0.1 --port 5000"

:: Wait for Python to start
timeout /t 3 /nobreak >nul

:: Start Node.js Backend (serves frontend + API)
echo [2/2] Starting PDF Tools Server (port 3001)...
start "" /min cmd /c "cd /d "%~dp0backend" && node index.js"

:: Wait and open browser
timeout /t 2 /nobreak >nul
echo.
echo ============================================
echo    PDF Tools is running!
echo    Opening http://localhost:3001 ...
echo ============================================
echo.
start http://localhost:3001

echo Press any key to STOP all services...
pause >nul

:: Kill services
echo Stopping services...
taskkill /f /fi "WINDOWTITLE eq PDF-Processing*" >nul 2>&1
for /f "tokens=5" %%p in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do taskkill /f /pid %%p >nul 2>&1
for /f "tokens=5" %%p in ('netstat -aon ^| findstr :3001 ^| findstr LISTENING') do taskkill /f /pid %%p >nul 2>&1
echo Done.
