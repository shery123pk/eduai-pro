# 🚀 Deploy EduAI Pro to Your Accounts

**Your Accounts:**
- GitHub: https://github.com/shery123pk
- Vercel: https://vercel.com/shery123pks-projects

---

## ⚡ Quick Deploy (Follow These Steps)

### Step 1: Create GitHub Repository (2 minutes)

1. Go to: https://github.com/new
2. Repository name: **eduai-pro**
3. Description: **AI-Powered Education Platform - BWAI Hackathon 2026**
4. **Keep it PUBLIC** (or Private if you prefer)
5. **DO NOT** initialize with README (we already have one)
6. Click **"Create repository"**

### Step 2: Push Code to GitHub (1 minute)

Open terminal in project folder and run:

```bash
git remote add origin https://github.com/shery123pk/eduai-pro.git
git branch -M main
git push -u origin main
```

✅ Your code is now on GitHub!

### Step 3: Get API Keys (15 minutes)

#### OpenAI API Key
1. Go to: https://platform.openai.com/api-keys
2. Sign up or login
3. Click **"Create new secret key"**
4. Name: **EduAI Pro**
5. **Copy the key** (starts with sk-...)
6. **Save it somewhere safe!**

#### HuggingFace Token
1. Go to: https://huggingface.co/settings/tokens
2. Sign up or login
3. Click **"New token"**
4. Type: **Read**
5. Name: **EduAI Pro**
6. **Copy the token** (starts with hf_...)

#### Neon Database
1. Go to: https://neon.tech
2. Sign up (**FREE tier**)
3. Create new project: **eduai_pro**
4. Go to **Dashboard → Connection Details**
5. **Copy the connection string**

**Setup Database:**
1. In Neon dashboard, click **"SQL Editor"**
2. Open file: `D:\SheryEducate\backend\db\schema.sql`
3. **Copy ALL** the contents
4. Paste in Neon SQL Editor
5. Click **"Run"**
6. ✅ Database created!

### Step 4: Deploy Backend to Vercel (5 minutes)

```bash
# Login to Vercel
vercel login
# It will open browser - login with your account

# Deploy backend
cd backend
vercel --prod

# When prompted:
# - Set up and deploy? → YES
# - Which scope? → shery123pks-projects
# - Link to existing project? → NO
# - Project name? → eduai-pro-backend
# - Directory? → ./ (just press Enter)
# - Override settings? → NO
```

**Copy the deployment URL!** (Example: `https://eduai-pro-backend.vercel.app`)

### Step 5: Add Environment Variables to Backend

1. Go to: https://vercel.com/shery123pks-projects
2. Click: **eduai-pro-backend**
3. Go to: **Settings → Environment Variables**
4. Add these (click "Add" for each):

```
Name: OPENAI_API_KEY
Value: [paste your OpenAI key starting with sk-...]

Name: HUGGINGFACE_API_KEY
Value: [paste your HuggingFace token starting with hf_...]

Name: NEON_DATABASE_URL
Value: [paste your Neon connection string]

Name: JWT_SECRET
Value: eduaipro_super_secret_2026_hackathon

Name: NODE_ENV
Value: production
```

5. Click **"Save"** for each
6. Go to **"Deployments"** tab
7. Click **"..."** → **"Redeploy"**

✅ Backend is live with API keys!

### Step 6: Update Frontend with Backend URL

```bash
cd ../frontend

# Edit .env file
# Replace with your actual backend URL from Step 4
```

Update `frontend/.env`:
```env
VITE_API_URL=https://eduai-pro-backend.vercel.app
```
(Replace with YOUR actual backend URL!)

### Step 7: Deploy Frontend (5 minutes)

```bash
# Rebuild with new API URL
npm run build

# Deploy to Vercel
vercel --prod

# When prompted:
# - Set up and deploy? → YES
# - Which scope? → shery123pks-projects
# - Link to existing project? → NO
# - Project name? → eduai-pro-frontend
# - Directory? → ./ (just press Enter)
# - Override settings? → NO
```

**Copy the deployment URL!** (Example: `https://eduai-pro-frontend.vercel.app`)

---

## 🎉 SUCCESS! Your App is Live!

### Your Live URLs:
- **Frontend:** https://eduai-pro-frontend.vercel.app
- **Backend:** https://eduai-pro-backend.vercel.app
- **GitHub:** https://github.com/shery123pk/eduai-pro

### Test It:
1. Open your frontend URL
2. Login with: **ali@student.com** / **student123**
3. Explore all features!

---

## 🧪 Create Demo Data (Optional)

To make your demo impressive:

1. Login as teacher: **ahmad.khan@eduai.com** / **teacher123**
2. Create a course: "Introduction to Algebra"
3. Upload a sample PDF (any math textbook PDF)
4. Generate a quiz (topic: "Basic Algebra")
5. Logout
6. Login as student: **ali@student.com** / **student123**
7. Try chat feature (ask about the course)
8. Upload homework (any math problem image)
9. Take the quiz
10. View weak areas

---

## 📱 Share Your Project

**For Hackathon Judges:**
```
🎓 EduAI Pro - AI-Powered Education Platform

Live Demo: https://eduai-pro-frontend.vercel.app
GitHub: https://github.com/shery123pk/eduai-pro

Features:
✅ RAG-powered AI Chatbot
✅ Homework Solver with Vision AI
✅ Multi-subject Smart Tutor
✅ AI Quiz Generator
✅ Performance Analytics
✅ Bilingual (English/Urdu)

Tech: React, Node.js, PostgreSQL, OpenAI, HuggingFace
Team: Asif & Sharmeen | DHA Suffa University
```

---

## 🔧 If Something Goes Wrong

### Backend errors?
- Check environment variables in Vercel
- Verify all 5 variables are set correctly
- Redeploy backend

### Frontend can't reach backend?
- Check VITE_API_URL in frontend/.env
- Make sure it matches your backend URL exactly
- Rebuild: `npm run build`
- Redeploy: `vercel --prod`

### Database errors?
- Check if schema.sql was run in Neon
- Verify connection string is correct
- Make sure it includes `?sslmode=require`

---

## 📞 Quick Commands Reference

```bash
# Push to GitHub
git add -A
git commit -m "Update"
git push

# Deploy backend
cd backend
vercel --prod

# Deploy frontend
cd frontend
npm run build
vercel --prod

# View logs
vercel logs [deployment-url]
```

---

## ⏱️ Time Estimate

- Create GitHub repo: **2 min**
- Push code: **1 min**
- Get API keys: **15 min**
- Deploy backend: **5 min**
- Configure env vars: **5 min**
- Deploy frontend: **5 min**

**Total: ~30 minutes to go live! ⚡**

---

## 🎯 You're Ready!

Everything is set up and ready to deploy. Just follow the steps above and you'll have a live, working AI education platform in 30 minutes!

**Good luck at BWAI Hackathon 2026! 🏆**

---

Built with ❤️ by Asif & Sharmeen
DHA Suffa University, Karachi
