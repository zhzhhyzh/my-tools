@echo off
echo ============================================
echo    PDF Tools Suite - Starting All Services
echo ============================================
echo.

echo [1/3] Starting Python Processing Service (port 5000)...
start "PDF-Processing" cmd /k "cd /d %~dp0processing && python -m uvicorn main:app --host 0.0.0.0 --port 5000"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Node.js Backend (port 3001)...
start "PDF-Backend" cmd /k "cd /d %~dp0backend && node index.js"

timeout /t 2 /nobreak >nul

echo [3/3] Starting React Frontend (port 3000)...
start "PDF-Frontend" cmd /k "cd /d %~dp0frontend && npx vite --port 3000"

echo.
echo ============================================
echo    All services started!
echo    Frontend:   http://localhost:3000
echo    Backend:    http://localhost:3001
echo    Processing: http://localhost:5000
echo ============================================
echo.
echo Press any key to exit this window...
pause >nul
