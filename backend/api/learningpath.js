// Learning Path API - Personalized AI-driven study plans
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { generateChatCompletion } from '../lib/openai.js';
import { query, pool } from '../lib/neon.js';

const router = express.Router();
const isDemoMode = !pool;

// Generate personalized learning path based on weak areas
router.post('/generate', authenticateToken, asyncHandler(async (req, res) => {
  const { subject, currentLevel, targetLevel, weakAreas } = req.body;
  const studentId = req.user.id;

  if (!subject) {
    return res.status(400).json({ error: 'Subject is required' });
  }

  // DEMO MODE: Return mock learning path with AI-generated content
  if (isDemoMode) {
    const prompt = `Create a personalized 7-day learning path for a student studying ${subject}.

Current Level: ${currentLevel || 'Beginner'}
Target Level: ${targetLevel || 'Intermediate'}
Weak Areas: ${weakAreas?.join(', ') || 'General understanding'}

Generate a detailed daily study plan with:
- Daily topics to cover
- Specific concepts to master
- Practice exercises
- Time estimates
- Difficulty progression

Format as JSON with this structure:
{
  "title": "7-Day ${subject} Mastery Path",
  "totalDays": 7,
  "estimatedHours": 14,
  "days": [
    {
      "day": 1,
      "title": "Day title",
      "topics": ["topic1", "topic2"],
      "concepts": ["concept1", "concept2"],
      "exercises": 5,
      "estimatedMinutes": 120,
      "difficulty": "Easy"
    }
  ],
  "milestones": [
    {
      "day": 3,
      "achievement": "Achievement name",
      "reward": 100
    }
  ]
}`;

    try {
      const response = await generateChatCompletion([
        { role: 'system', content: 'You are an expert education planner. Always respond with valid JSON only.' },
        { role: 'user', content: prompt }
      ], { temperature: 0.7, max_tokens: 2000 });

      // Parse AI response
      let learningPath;
      try {
        learningPath = JSON.parse(response);
      } catch (e) {
        // If AI didn't return pure JSON, extract it
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        learningPath = jsonMatch ? JSON.parse(jsonMatch[0]) : createFallbackPath(subject);
      }

      return res.json({
        learningPath,
        createdAt: new Date().toISOString(),
        message: 'Personalized learning path generated successfully!'
      });
    } catch (error) {
      console.error('Error generating learning path:', error);
      return res.json({ learningPath: createFallbackPath(subject) });
    }
  }

  // PRODUCTION MODE: Store in database
  try {
    const aiResponse = await generateChatCompletion([
      { role: 'system', content: 'You are an expert education planner.' },
      { role: 'user', content: `Create a personalized learning path for ${subject}...` }
    ]);

    const result = await query(
      'INSERT INTO learning_paths (student_id, subject, path_data, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [studentId, subject, JSON.stringify(aiResponse)]
    );

    res.json({ learningPath: result.rows[0] });
  } catch (error) {
    throw error;
  }
}));

// Get current learning path for student
router.get('/current', authenticateToken, asyncHandler(async (req, res) => {
  const studentId = req.user.id;

  if (isDemoMode) {
    return res.json({
      hasPath: false,
      message: 'Generate your first learning path to get started!'
    });
  }

  const result = await query(
    'SELECT * FROM learning_paths WHERE student_id = $1 ORDER BY created_at DESC LIMIT 1',
    [studentId]
  );

  res.json({
    hasPath: result.rows.length > 0,
    path: result.rows[0] || null
  });
}));

// Mark day as completed
router.post('/complete-day', authenticateToken, asyncHandler(async (req, res) => {
  const { day, points } = req.body;
  const studentId = req.user.id;

  // Award points for completion
  const pointsEarned = points || 50;

  return res.json({
    success: true,
    message: `Day ${day} completed! +${pointsEarned} points earned! 🎉`,
    pointsEarned,
    nextDay: day + 1
  });
}));

// Fallback learning path if AI fails
function createFallbackPath(subject) {
  return {
    title: `7-Day ${subject} Mastery Path`,
    totalDays: 7,
    estimatedHours: 14,
    days: [
      {
        day: 1,
        title: `${subject} Fundamentals`,
        topics: ['Introduction', 'Basic Concepts', 'Core Principles'],
        concepts: ['Understanding basics', 'Key terminology', 'Foundation building'],
        exercises: 5,
        estimatedMinutes: 120,
        difficulty: 'Easy'
      },
      {
        day: 2,
        title: 'Building Core Knowledge',
        topics: ['Intermediate Concepts', 'Practice Problems', 'Real Examples'],
        concepts: ['Applying basics', 'Problem solving', 'Pattern recognition'],
        exercises: 8,
        estimatedMinutes: 150,
        difficulty: 'Medium'
      },
      {
        day: 3,
        title: 'Advanced Techniques',
        topics: ['Complex Problems', 'Advanced Methods', 'Optimization'],
        concepts: ['Strategic thinking', 'Advanced applications', 'Efficiency'],
        exercises: 10,
        estimatedMinutes: 180,
        difficulty: 'Medium'
      },
      {
        day: 4,
        title: 'Practical Applications',
        topics: ['Real-world Problems', 'Case Studies', 'Projects'],
        concepts: ['Implementation', 'Integration', 'Best practices'],
        exercises: 12,
        estimatedMinutes: 200,
        difficulty: 'Hard'
      },
      {
        day: 5,
        title: 'Mastery & Review',
        topics: ['Comprehensive Review', 'Challenge Problems', 'Assessment'],
        concepts: ['Synthesis', 'Critical thinking', 'Mastery'],
        exercises: 15,
        estimatedMinutes: 180,
        difficulty: 'Hard'
      },
      {
        day: 6,
        title: 'Expert Level Practice',
        topics: ['Expert Challenges', 'Competitive Problems', 'Innovation'],
        concepts: ['Excellence', 'Creativity', 'Innovation'],
        exercises: 10,
        estimatedMinutes: 200,
        difficulty: 'Expert'
      },
      {
        day: 7,
        title: 'Final Assessment',
        topics: ['Comprehensive Test', 'Portfolio Review', 'Next Steps'],
        concepts: ['Self-evaluation', 'Goal setting', 'Continuous learning'],
        exercises: 20,
        estimatedMinutes: 240,
        difficulty: 'Expert'
      }
    ],
    milestones: [
      { day: 3, achievement: '🔥 Halfway Hero', reward: 100 },
      { day: 5, achievement: '⭐ Knowledge Master', reward: 150 },
      { day: 7, achievement: '🏆 Learning Champion', reward: 300 }
    ]
  };
}

export default router;
