// EduAI Pro Backend Server
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';

// Import API routes
import authRoutes from './api/auth.js';
import chatRoutes from './api/chat.js';
import homeworkRoutes from './api/homework.js';
import tutorRoutes from './api/tutor.js';
import quizRoutes from './api/quiz.js';
import weakareaRoutes from './api/weakarea.js';
import uploadRoutes from './api/upload.js';
import coursesRoutes from './api/courses.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'EduAI Pro API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      chat: '/api/chat',
      homework: '/api/homework',
      tutor: '/api/tutor',
      quiz: '/api/quiz',
      weakarea: '/api/weakarea',
      upload: '/api/upload',
      courses: '/api/courses'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/homework', homeworkRoutes);
app.use('/api/tutor', tutorRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/weakarea', weakareaRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/courses', coursesRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🚀 EduAI Pro Backend Server');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log('═══════════════════════════════════════════════════════════');
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Rejection:', error);
  process.exit(1);
});

export default app;
