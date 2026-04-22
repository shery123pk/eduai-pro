@echo off
echo ========================================
echo Deploying EduAI Pro to Vercel
echo ========================================
echo.

echo Step 1: Login to Vercel
echo ------------------------
vercel login
echo.

echo Step 2: Deploy Backend
echo ------------------------
cd backend
vercel --prod
cd ..
echo.
echo IMPORTANT: Copy the backend URL!
echo.
pause

echo Step 3: Deploy Frontend
echo ------------------------
cd frontend
npm run build
vercel --prod
cd ..
echo.
echo IMPORTANT: Copy the frontend URL!
echo.

echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Next Steps:
echo 1. Add environment variables in Vercel dashboard
echo 2. Test your live app!
echo.
pause
