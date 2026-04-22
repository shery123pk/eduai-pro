// Quiz API routes
import express from 'express';
import { authenticateToken, requireTeacher } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { generateChatCompletion } from '../lib/openai.js';
import { query } from '../lib/neon.js';

const router = express.Router();

// Generate quiz (Teacher only)
router.post('/generate', authenticateToken, requireTeacher, asyncHandler(async (req, res) => {
  const { courseId, topic, numberOfQuestions = 5, difficulty = 'medium' } = req.body;

  if (!courseId || !topic) {
    return res.status(400).json({ error: 'courseId and topic are required' });
  }

  // Verify teacher owns this course
  const courseCheck = await query(
    'SELECT id FROM courses WHERE id = $1 AND teacher_id = $2',
    [courseId, req.user.id]
  );

  if (courseCheck.rows.length === 0) {
    return res.status(403).json({ error: 'You do not have access to this course' });
  }

  // Generate quiz using GPT-4
  const prompt = `Generate ${numberOfQuestions} multiple choice questions about "${topic}".
Difficulty level: ${difficulty}.

Return ONLY a valid JSON array with this exact structure (no markdown, no code blocks):
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "Brief explanation of why this is correct"
  }
]

Make sure:
- Questions are clear and educational
- All options are plausible
- The "correct" field is the index (0-3) of the correct option
- Explanations are concise but helpful
- Return ONLY the JSON array, nothing else`;

  const response = await generateChatCompletion([
    { role: 'system', content: 'You are a quiz generator. Return ONLY valid JSON, no other text.' },
    { role: 'user', content: prompt }
  ], {
    temperature: 0.8,
    max_tokens: 2000
  });

  // Parse JSON response
  let questions;
  try {
    // Remove markdown code blocks if present
    const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    questions = JSON.parse(cleanedResponse);
  } catch (error) {
    console.error('Failed to parse quiz JSON:', response);
    return res.status(500).json({ error: 'Failed to generate valid quiz format' });
  }

  // Save quiz to database
  const result = await query(
    `INSERT INTO quizzes (course_id, title, topic, questions)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, topic, created_at`,
    [courseId, `${topic} Quiz`, topic, JSON.stringify(questions)]
  );

  res.json({
    success: true,
    quiz: {
      id: result.rows[0].id,
      title: result.rows[0].title,
      topic: result.rows[0].topic,
      questionCount: questions.length,
      createdAt: result.rows[0].created_at
    }
  });
}));

// Get all quizzes for a course
router.get('/course/:courseId', authenticateToken, asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const result = await query(
    `SELECT id, title, topic, created_at,
            jsonb_array_length(questions) as question_count
     FROM quizzes
     WHERE course_id = $1
     ORDER BY created_at DESC`,
    [courseId]
  );

  res.json({ quizzes: result.rows });
}));

// Get specific quiz
router.get('/:quizId', authenticateToken, asyncHandler(async (req, res) => {
  const { quizId } = req.params;

  const result = await query(
    'SELECT id, course_id, title, topic, questions, created_at FROM quizzes WHERE id = $1',
    [quizId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  const quiz = result.rows[0];

  // Remove correct answers and explanations for students
  if (req.user.role === 'student') {
    const questions = quiz.questions.map(q => ({
      question: q.question,
      options: q.options
    }));
    quiz.questions = questions;
  }

  res.json({ quiz });
}));

// Submit quiz (Student)
router.post('/:quizId/submit', authenticateToken, asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const { answers } = req.body; // Array of selected option indices

  if (!Array.isArray(answers)) {
    return res.status(400).json({ error: 'Answers must be an array' });
  }

  // Get quiz
  const quizResult = await query(
    'SELECT id, course_id, questions FROM quizzes WHERE id = $1',
    [quizId]
  );

  if (quizResult.rows.length === 0) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  const quiz = quizResult.rows[0];
  const questions = quiz.questions;

  // Calculate score
  let correctCount = 0;
  const results = questions.map((q, idx) => {
    const userAnswer = answers[idx];
    const isCorrect = userAnswer === q.correct;
    if (isCorrect) correctCount++;

    return {
      question: q.question,
      userAnswer,
      correctAnswer: q.correct,
      isCorrect,
      explanation: q.explanation
    };
  });

  const score = Math.round((correctCount / questions.length) * 100);

  // Save attempt
  await query(
    `INSERT INTO quiz_attempts (student_id, quiz_id, score, answers)
     VALUES ($1, $2, $3, $4)`,
    [req.user.id, quizId, score, JSON.stringify(answers)]
  );

  // Update weak areas
  const courseId = quiz.course_id;
  const courseInfo = await query('SELECT title FROM courses WHERE id = $1', [courseId]);
  const subject = courseInfo.rows[0]?.title || 'General';

  // Identify weak topics
  const weakQuestions = results.filter(r => !r.isCorrect);
  if (weakQuestions.length > 0) {
    // Simple weak area tracking - in production, this would be more sophisticated
    await query(
      `INSERT INTO weak_areas (student_id, subject, topic, score_avg, attempts)
       VALUES ($1, $2, $3, $4, 1)
       ON CONFLICT (student_id, subject, topic)
       DO UPDATE SET
         score_avg = ((weak_areas.score_avg * weak_areas.attempts) + $4) / (weak_areas.attempts + 1),
         attempts = weak_areas.attempts + 1,
         updated_at = NOW()`,
      [req.user.id, subject, quiz.topic || 'General', score]
    );
  }

  res.json({
    score,
    correctCount,
    totalQuestions: questions.length,
    results
  });
}));

// Get student's quiz history
router.get('/student/history', authenticateToken, asyncHandler(async (req, res) => {
  const studentId = req.user.id;

  const result = await query(
    `SELECT
       qa.id,
       qa.score,
       qa.completed_at,
       q.title,
       q.topic,
       c.title as course_title
     FROM quiz_attempts qa
     JOIN quizzes q ON qa.quiz_id = q.id
     JOIN courses c ON q.course_id = c.id
     WHERE qa.student_id = $1
     ORDER BY qa.completed_at DESC
     LIMIT 20`,
    [studentId]
  );

  res.json({ attempts: result.rows });
}));

export default router;
