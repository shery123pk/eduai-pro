# ⚡ Quick Deploy Commands

Copy and paste these commands in order:

## 1️⃣ Login to Vercel
```bash
vercel login
```

## 2️⃣ Deploy Backend
```bash
cd backend
vercel --prod
# Note the URL!
```

## 3️⃣ Add Environment Variables
Go to: https://vercel.com/dashboard
- Select: eduai-pro-backend
- Settings → Environment Variables
- Add:
  - OPENAI_API_KEY
  - HUGGINGFACE_API_KEY
  - NEON_DATABASE_URL
  - JWT_SECRET
  - NODE_ENV=production
- Redeploy!

## 4️⃣ Update Frontend API URL
```bash
cd ../frontend
# Edit .env file:
echo "VITE_API_URL=https://your-backend-url.vercel.app" > .env
```

## 5️⃣ Deploy Frontend
```bash
npm run build
vercel --prod
# Note the URL!
```

## 6️⃣ Test
Open: `https://your-frontend-url.vercel.app`

---

## 📝 API Keys Needed

Get these first:
- OpenAI: https://platform.openai.com/api-keys
- HuggingFace: https://huggingface.co/settings/tokens
- Neon DB: https://neon.tech

---

## ✅ Done!

Your app is live! 🎉
