// Weak Area Analysis API routes
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { generateChatCompletion } from '../lib/openai.js';
import { query } from '../lib/neon.js';

const router = express.Router();

// Get weak areas for a student
router.get('/:studentId?', authenticateToken, asyncHandler(async (req, res) => {
  const studentId = req.params.studentId || req.user.id;

  // Students can only view their own data, teachers can view any student
  if (req.user.role === 'student' && studentId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Get weak areas from database
  const weakAreasResult = await query(
    `SELECT subject, topic, score_avg, attempts, updated_at
     FROM weak_areas
     WHERE student_id = $1
     ORDER BY score_avg ASC, attempts DESC`,
    [studentId]
  );

  // Get quiz history
  const quizHistory = await query(
    `SELECT
       qa.score,
       qa.completed_at,
       q.topic,
       c.title as subject
     FROM quiz_attempts qa
     JOIN quizzes q ON qa.quiz_id = q.id
     JOIN courses c ON q.course_id = c.id
     WHERE qa.student_id = $1
     ORDER BY qa.completed_at DESC
     LIMIT 10`,
    [studentId]
  );

  // Calculate overall statistics
  const stats = {
    totalQuizzes: quizHistory.rows.length,
    averageScore: quizHistory.rows.length > 0
      ? Math.round(quizHistory.rows.reduce((sum, q) => sum + q.score, 0) / quizHistory.rows.length)
      : 0,
    weakAreaCount: weakAreasResult.rows.filter(wa => wa.score_avg < 70).length
  };

  // Generate AI recommendations for weak areas
  let recommendations = [];
  if (weakAreasResult.rows.length > 0) {
    const weakAreasText = weakAreasResult.rows
      .slice(0, 5) // Top 5 weak areas
      .map(wa => `${wa.subject} - ${wa.topic}: Average score ${wa.score_avg}%, ${wa.attempts} attempts`)
      .join('\n');

    const prompt = `A student is struggling with these topics:

${weakAreasText}

Provide 3-5 specific, actionable study tips to help them improve. Keep each tip concise (1-2 sentences).

Format as:
1. [Tip for first weak area]
2. [Tip for second weak area]
...`;

    try {
      const aiResponse = await generateChatCompletion([
        { role: 'system', content: 'You are an educational advisor helping students improve their weak areas.' },
        { role: 'user', content: prompt }
      ], { max_tokens: 500 });

      recommendations = aiResponse.split('\n').filter(line => line.trim().match(/^\d+\./));
    } catch (error) {
      console.error('Error generating recommendations:', error);
    }
  }

  res.json({
    weakAreas: weakAreasResult.rows,
    recentQuizzes: quizHistory.rows,
    stats,
    recommendations
  });
}));

// Get performance heatmap data
router.get('/:studentId/heatmap', authenticateToken, asyncHandler(async (req, res) => {
  const studentId = req.params.studentId || req.user.id;

  if (req.user.role === 'student' && studentId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Get all quiz attempts grouped by subject and topic
  const result = await query(
    `SELECT
       c.title as subject,
       q.topic,
       AVG(qa.score) as avg_score,
       COUNT(*) as attempt_count
     FROM quiz_attempts qa
     JOIN quizzes q ON qa.quiz_id = q.id
     JOIN courses c ON q.course_id = c.id
     WHERE qa.student_id = $1
     GROUP BY c.title, q.topic
     ORDER BY c.title, q.topic`,
    [studentId]
  );

  // Format for heatmap
  const heatmapData = result.rows.map(row => ({
    subject: row.subject,
    topic: row.topic,
    score: Math.round(row.avg_score),
    attempts: parseInt(row.attempt_count),
    level: row.avg_score >= 80 ? 'strong' :
           row.avg_score >= 60 ? 'average' : 'weak'
  }));

  res.json({ heatmap: heatmapData });
}));

export default router;
