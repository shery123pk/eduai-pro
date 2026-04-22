@echo off
echo ========================================
echo Starting EduAI Pro Locally
echo ========================================
echo.

echo Starting Backend Server...
start "EduAI Backend" cmd /k "cd backend && npm run dev"

timeout /t 3

echo Starting Frontend Server...
start "EduAI Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Servers Starting!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Wait a few seconds, then open:
echo http://localhost:5173
echo.
pause
