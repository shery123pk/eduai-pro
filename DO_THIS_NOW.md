# 🚀 Deploy EduAI Pro - Step by Step

## ✅ You Created: https://github.com/shery123pk/eduai-pro

Great! Now let's deploy in 3 easy steps:

---

## Step 1️⃣: Push Code to GitHub (2 minutes)

### Option A: Double-click this file ⚡
```
PUSH_TO_GITHUB.bat
```

### Option B: Run manually
```bash
git remote set-url origin https://github.com/shery123pk/eduai-pro.git
git push -u origin main
```

**✅ Done! Your code is on GitHub!**

Check: https://github.com/shery123pk/eduai-pro

---

## Step 2️⃣: Get API Keys (15 minutes)

You need these 3 API keys:

### A. OpenAI API Key
1. Go to: https://platform.openai.com/api-keys
2. Sign up or login
3. Click **"Create new secret key"**
4. Name: **EduAI Pro**
5. **COPY THE KEY** (starts with `sk-...`)
6. Save it somewhere!

### B. HuggingFace Token
1. Go to: https://huggingface.co/settings/tokens
2. Sign up or login
3. Click **"New token"**
4. Type: **Read**
5. Name: **EduAI Pro**
6. **COPY THE TOKEN** (starts with `hf_...`)

### C. Neon Database
1. Go to: https://neon.tech
2. Sign up (FREE)
3. Create project: **eduai_pro**
4. Go to **Dashboard** → **Connection Details**
5. **COPY** the connection string
6. Should look like: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/eduai_pro?sslmode=require`

### Setup Database Schema:
1. In Neon dashboard, click **"SQL Editor"**
2. Open: `D:\SheryEducate\backend\db\schema.sql`
3. Copy ALL the contents
4. Paste in Neon SQL Editor
5. Click **"Run"**
6. ✅ Database ready!

---

## Step 3️⃣: Deploy to Vercel (10 minutes)

### Option A: Double-click this file ⚡
```
DEPLOY_TO_VERCEL.bat
```

This will:
1. Login to Vercel (browser will open)
2. Deploy backend automatically
3. Deploy frontend automatically

### Option B: Manual deployment

```bash
# Login to Vercel
vercel login

# Deploy backend
cd backend
vercel --prod
# COPY THE URL!

# Deploy frontend
cd ../frontend
npm run build
vercel --prod
# COPY THE URL!
```

---

## Step 4️⃣: Add Environment Variables

After backend deployment:

1. Go to: https://vercel.com/shery123pks-projects
2. Click: **eduai-pro-backend**
3. Go to: **Settings** → **Environment Variables**
4. Add these 5 variables:

```
Name: OPENAI_API_KEY
Value: sk-your-actual-key-here

Name: HUGGINGFACE_API_KEY
Value: hf_your-actual-token-here

Name: NEON_DATABASE_URL
Value: postgresql://your-neon-connection-string

Name: JWT_SECRET
Value: eduaipro_super_secret_2026_hackathon

Name: NODE_ENV
Value: production
```

5. **Save** each one
6. Go to **Deployments** tab
7. Click **"..."** → **"Redeploy"**

---

## Step 5️⃣: Update Frontend API URL

After backend is deployed and has env vars:

1. Edit: `D:\SheryEducate\frontend\.env`
2. Update with your backend URL:
```env
VITE_API_URL=https://eduai-pro-backend.vercel.app
```
(Replace with YOUR backend URL)

3. Rebuild and redeploy:
```bash
cd frontend
npm run build
vercel --prod
```

---

## 🎉 DONE! Your App is Live!

### Your URLs:
- **Frontend:** `https://eduai-pro-frontend.vercel.app`
- **Backend:** `https://eduai-pro-backend.vercel.app`
- **GitHub:** https://github.com/shery123pk/eduai-pro

### Test It:
1. Open your frontend URL
2. Login: `ali@student.com` / `student123`
3. Try all features!

---

## 🧪 Create Demo Data (Optional)

Make your demo impressive:

1. Login as teacher: `ahmad.khan@eduai.com` / `teacher123`
2. Create course: "Introduction to Algebra"
3. Upload a PDF (any math textbook)
4. Generate quiz (topic: "Basic Algebra")
5. Logout
6. Login as student: `ali@student.com` / `student123`
7. Chat, upload homework, take quiz!

---

## 🎤 7-Minute Demo Script

1. **[1 min]** Show login → Dashboard
2. **[1.5 min]** AI Chat → Ask question → Show RAG
3. **[1.5 min]** Upload homework → Show solution
4. **[1 min]** Smart Tutor → Ask question
5. **[1 min]** Take quiz → Show results
6. **[30s]** Analytics dashboard
7. **[30s]** Teacher: Generate quiz

**Key Points:**
- "RAG with pgvector"
- "GPT-4 Vision"
- "Bilingual support"
- "Production-ready"

---

## 🔧 Troubleshooting

### Backend errors?
- Check all 5 env vars in Vercel
- Redeploy after adding env vars

### Frontend can't reach backend?
- Check `VITE_API_URL` in frontend/.env
- Rebuild: `npm run build`
- Redeploy: `vercel --prod`

### Database errors?
- Run schema.sql in Neon SQL Editor
- Check connection string

---

## ⏱️ Time Estimate

- ✅ Code ready (already done!)
- Push to GitHub: **2 min**
- Get API keys: **15 min**
- Deploy: **10 min**
- Configure: **5 min**

**Total: ~30 minutes**

---

## 📞 Quick Commands

```bash
# Push to GitHub
git push

# Deploy backend
cd backend && vercel --prod

# Deploy frontend
cd frontend && npm run build && vercel --prod
```

---

## 🏆 You're Almost There!

**What's done:**
- ✅ Code complete
- ✅ Build successful
- ✅ GitHub repo created
- ✅ Everything committed

**What's left:**
- ⏳ Push code (2 min)
- ⏳ Get API keys (15 min)
- ⏳ Deploy (10 min)

**Total: 27 minutes to live!**

---

**🚀 START NOW! Double-click `PUSH_TO_GITHUB.bat` 🚀**

Good luck! 🏆
