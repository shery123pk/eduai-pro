# 🚀 EduAI Pro - Setup & Launch Guide

**BWAI Hackathon 2026 | Team: Asif & Sharmeen**

## 📋 Quick Start Checklist

### Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (if npm install fails, use --legacy-peer-deps)
cd ../frontend
npm install --legacy-peer-deps
```

### Step 2: Database Setup (Neon PostgreSQL)

1. **Sign up at** [neon.tech](https://neon.tech) (Free tier)
2. **Create database:** `eduai_pro`
3. **Run schema:**
   - Copy contents of `backend/db/schema.sql`
   - Paste in Neon SQL Editor and execute
4. **Optional:** Run `backend/db/seed.sql` for demo data

### Step 3: Environment Variables

#### Backend `.env`
Create `backend/.env`:
```env
OPENAI_API_KEY=sk-your-key-here
HUGGINGFACE_API_KEY=hf_your-key-here
NEON_DATABASE_URL=postgresql://user:pass@host/eduai_pro?sslmode=require
JWT_SECRET=eduaipro_super_secret_2026
PORT=5000
NODE_ENV=development
```

#### Frontend `.env`
Already created at `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
```

### Step 4: Get API Keys

#### OpenAI API Key
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create account / Login
3. Navigate to API Keys
4. Create new secret key
5. Copy and paste into `backend/.env`

#### HuggingFace API Token
1. Go to [huggingface.co](https://huggingface.co)
2. Sign up / Login
3. Go to Settings → Access Tokens
4. Create new token (Read access)
5. Copy and paste into `backend/.env`

### Step 5: Run the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Backend runs on http://localhost:5000

# Terminal 2 - Frontend
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

### Step 6: Access the Application

Open browser: **http://localhost:5173**

**Demo Login Credentials:**
- **Student:** `ali@student.com` / `student123`
- **Teacher:** `ahmad.khan@eduai.com` / `teacher123`

---

## 📁 Project Structure

```
eduai-pro/
├── backend/
│   ├── api/              # API routes
│   ├── lib/              # Core libraries (OpenAI, Neon, RAG)
│   ├── middleware/       # Auth & error handling
│   ├── db/               # Database schema & seeds
│   ├── server.js         # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/        # React pages
│   │   ├── components/   # Reusable components
│   │   ├── context/      # Auth context
│   │   ├── utils/        # API, helpers
│   │   ├── App.jsx       # Main app with routing
│   │   └── main.jsx      # Entry point
│   ├── package.json
│   └── vercel.json
├── AGENTS.md             # Agent build instructions
├── SOUL.md               # Agent philosophy
└── README.md             # Project documentation
```

---

## 🎯 Core Features Implemented

### ✅ For Students
1. **AI Chatbot** - RAG-powered course Q&A
2. **Homework Solver** - Upload image → Get step-by-step solution
3. **Smart Tutor** - Subject-specific AI tutor
4. **Quizzes** - AI-generated MCQ tests
5. **Weak Area Analysis** - Performance insights
6. **Multilingual** - English & Urdu support

### ✅ For Teachers
1. **Course Management** - Create/manage courses
2. **Upload Materials** - PDF/TXT → RAG pipeline
3. **AI Quiz Generator** - Auto-generate quizzes
4. **Student Reports** - Track performance

---

## 🔧 Troubleshooting

### Issue: npm install fails
**Solution:**
```bash
cd frontend
npm install --legacy-peer-deps
```

### Issue: Backend can't connect to database
**Solution:**
- Check `NEON_DATABASE_URL` in `.env`
- Ensure database exists in Neon
- Verify schema.sql was executed

### Issue: OpenAI errors
**Solution:**
- Verify `OPENAI_API_KEY` is correct
- Check you have credits in OpenAI account
- Ensure API key has correct permissions

### Issue: Frontend can't reach backend
**Solution:**
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in `frontend/.env`
- Verify CORS is enabled in backend

---

## 🚀 Deployment to Vercel

### Backend Deployment
```bash
cd backend
vercel --prod
# Copy the deployment URL
```

### Frontend Deployment
```bash
cd frontend
# Update .env with production backend URL
# VITE_API_URL=https://your-backend.vercel.app
npm run build
vercel --prod
```

---

## 🎤 Demo Script (6-7 minutes)

1. **Login** (30s) - Show student login
2. **Chatbot** (1min) - Ask course question, show RAG sources
3. **Homework Solver** (1min) - Upload math problem → Solution
4. **Smart Tutor** (1min) - Ask Math question → LaTeX solution
5. **Take Quiz** (1min) - Complete MCQ quiz
6. **Weak Areas** (30s) - Show performance heatmap
7. **Teacher View** (1min) - Generate quiz in 5 seconds
8. **Live URL** (30s) - Show deployed version

**Key Points to Emphasize:**
- AI-powered features (RAG, Vision, Classification)
- Multilingual support (English/Urdu)
- Production-ready (deployed, working)
- Solves real education problems

---

## 📊 Tech Stack Highlights

- **Frontend:** React 19, Vite, Tailwind CSS, KaTeX
- **Backend:** Node.js, Express
- **Database:** Neon PostgreSQL with pgvector
- **AI/ML:** OpenAI GPT-4o, Embeddings, Vision
- **NLP:** HuggingFace Transformers
- **Deployment:** Vercel
- **Authentication:** JWT

---

## ⚡ Performance Notes

- RAG pipeline uses pgvector for fast similarity search
- Frontend optimized with Vite for instant hot reload
- Lazy loading for components
- Optimized API calls with axios interceptors

---

## 🎓 Team

**Built by:** Asif & Sharmeen
**University:** DHA Suffa University, Karachi
**Event:** BWAI Hackathon 2026 (April 25-26)

---

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Review error messages in browser console / terminal
3. Verify all API keys are set correctly
4. Ensure all dependencies are installed

---

**Good luck with your demo! You've got this! 🏆**
