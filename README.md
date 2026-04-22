# 🎓 EduAI Pro

**Full-Stack AI Education Platform**
Built for BWAI Hackathon 2026 | DHA Suffa University, Karachi

## 👥 Team
- **Asif** - Full-Stack Developer
- **Sharmeen** - Full-Stack Developer

## 🚀 Features

### For Students
- 💬 **AI Chatbot** - RAG-powered course assistant
- 📝 **Homework Solver** - Upload photo, get step-by-step solution
- 🎯 **Smart Tutor** - Subject-specific AI tutor (Math, Science, English)
- 📊 **Quizzes** - AI-generated MCQ tests
- 📈 **Weak Area Analysis** - Personalized performance insights
- 🌐 **Multilingual** - Full English & Urdu support

### For Teachers
- 📚 **Upload Course Materials** - PDF/TXT upload for RAG
- ✨ **AI Quiz Generator** - Generate quizzes instantly
- 👨‍🎓 **Student Reports** - Track student performance

## 🛠️ Tech Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS
- KaTeX (Math rendering)
- Recharts (Data viz)

**Backend**
- Node.js + Express
- PostgreSQL (Neon) with pgvector
- OpenAI API (GPT-4o, Embeddings)
- HuggingFace API
- LangChain (RAG pipeline)

**Deployment**
- Vercel (Frontend & Backend)

## 📦 Installation

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Add your API keys to .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🌐 Environment Variables

### Backend (.env)
```
OPENAI_API_KEY=your_openai_key
HUGGINGFACE_API_KEY=your_hf_key
NEON_DATABASE_URL=your_neon_url
JWT_SECRET=eduaipro_super_secret_2026
PORT=5000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

## 🗄️ Database Setup

1. Sign up at [neon.tech](https://neon.tech)
2. Create database: `eduai_pro`
3. Run `backend/db/schema.sql`

## 🚀 Deployment

```bash
# Backend
cd backend
vercel --prod

# Frontend (update VITE_API_URL first)
cd frontend
vercel --prod
```

## 🎯 Demo Flow

1. Login as Student
2. Chat with AI about course
3. Upload homework photo → Get solution
4. Ask Smart Tutor a question
5. Take a quiz
6. View weak area report
7. Switch to Teacher → Generate quiz
8. Show live deployment URL

**Demo Time:** 6-7 minutes

## 📝 License

Built with ❤️ for BWAI Hackathon 2026
