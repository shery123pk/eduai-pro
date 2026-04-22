@echo off
echo ========================================
echo Pushing EduAI Pro to GitHub
echo ========================================
echo.

git remote set-url origin https://github.com/shery123pk/eduai-pro.git
git branch -M main
git push -u origin main

echo.
echo ========================================
echo Done! Check: https://github.com/shery123pk/eduai-pro
echo ========================================
pause
