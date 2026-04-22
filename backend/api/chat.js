// Chat API routes
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { ragQuery, generateFollowUpQuestions } from '../lib/ragPipeline.js';
import { query } from '../lib/neon.js';

const router = express.Router();

// Send message and get AI response
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
  const { courseId, message, language = 'english' } = req.body;
  const studentId = req.user.id;

  if (!courseId || !message) {
    return res.status(400).json({ error: 'courseId and message are required' });
  }

  // Verify course exists
  const courseResult = await query(
    'SELECT id, title FROM courses WHERE id = $1',
    [courseId]
  );

  if (courseResult.rows.length === 0) {
    return res.status(404).json({ error: 'Course not found' });
  }

  // Get or create chat history
  let chatResult = await query(
    'SELECT id, messages FROM chat_history WHERE student_id = $1 AND course_id = $2',
    [studentId, courseId]
  );

  let chatId;
  let messages = [];

  if (chatResult.rows.length === 0) {
    // Create new chat history
    const newChat = await query(
      'INSERT INTO chat_history (student_id, course_id, messages) VALUES ($1, $2, $3) RETURNING id, messages',
      [studentId, courseId, JSON.stringify([])]
    );
    chatId = newChat.rows[0].id;
  } else {
    chatId = chatResult.rows[0].id;
    messages = chatResult.rows[0].messages || [];
  }

  // Run RAG pipeline
  const { answer, sources } = await ragQuery(message, courseId, language);

  // Update chat history
  const newMessage = {
    role: 'user',
    content: message,
    timestamp: new Date().toISOString()
  };

  const aiResponse = {
    role: 'assistant',
    content: answer,
    sources: sources.map(s => s.filename),
    timestamp: new Date().toISOString()
  };

  messages.push(newMessage, aiResponse);

  await query(
    'UPDATE chat_history SET messages = $1, updated_at = NOW() WHERE id = $2',
    [JSON.stringify(messages), chatId]
  );

  res.json({
    answer,
    sources,
    chatId
  });
}));

// Get chat history for a course
router.get('/:courseId', authenticateToken, asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const studentId = req.user.id;

  const result = await query(
    'SELECT id, messages, updated_at FROM chat_history WHERE student_id = $1 AND course_id = $2',
    [studentId, courseId]
  );

  if (result.rows.length === 0) {
    return res.json({ messages: [] });
  }

  res.json({
    chatId: result.rows[0].id,
    messages: result.rows[0].messages || [],
    updatedAt: result.rows[0].updated_at
  });
}));

// Get all courses for student
router.get('/courses/available', authenticateToken, asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT c.id, c.title, c.description, u.name as teacher_name
     FROM courses c
     JOIN users u ON c.teacher_id = u.id
     ORDER BY c.created_at DESC`
  );

  res.json({ courses: result.rows });
}));

export default router;
