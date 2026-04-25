import express from 'express';
import { pool } from '../lib/neon.js';
import { authenticateToken } from '../middleware/auth.js';
import { generateChatCompletion } from '../lib/openai.js';

const router = express.Router();
const isDemoMode = !pool;

// Mastery levels
const MASTERY_LEVELS = {
  NOT_STARTED: 'not_started',
  ATTEMPTED: 'attempted',      // < 70% or dropped from familiar
  FAMILIAR: 'familiar',          // 70-85% or all correct on quiz
  PROFICIENT: 'proficient',      // 100% from familiar level
  MASTERED: 'mastered'           // 100% on unit test from proficient
};

// Demo exercises - comprehensive math problems
const demoExercises = {
  'ex-variables-1': {
    id: 'ex-variables-1',
    title: 'Introduction to Variables',
    skillName: 'Variables',
    type: 'exercise',
    questions: [
      {
        id: 'q1',
        question: 'If x = 5, what is the value of 3x?',
        options: ['8', '15', '35', '53'],
        correct: '15',
        hints: [
          '3x means 3 times x',
          'Substitute 5 for x: 3 × 5',
          '3 × 5 = 15'
        ],
        explanation: 'When we have 3x and x = 5, we multiply: 3 × 5 = 15'
      },
      {
        id: 'q2',
        question: 'If y = 7, what is the value of y + 12?',
        options: ['19', '712', '5', '84'],
        correct: '19',
        hints: [
          'Substitute 7 for y',
          'Calculate: 7 + 12',
          '7 + 12 = 19'
        ],
        explanation: 'Replace y with 7 and add: 7 + 12 = 19'
      },
      {
        id: 'q3',
        question: 'If a = 4, what is the value of 2a + 3?',
        options: ['9', '11', '7', '234'],
        correct: '11',
        hints: [
          'First, calculate 2a by substituting a = 4',
          '2 × 4 = 8',
          'Now add 3: 8 + 3 = 11'
        ],
        explanation: 'Substitute a = 4: 2(4) + 3 = 8 + 3 = 11. Remember to multiply before adding!'
      },
      {
        id: 'q4',
        question: 'Which expression represents "5 more than x"?',
        options: ['x + 5', '5x', 'x - 5', '5 - x'],
        correct: 'x + 5',
        hints: [
          '"More than" means addition',
          '"5 more than x" means we start with x and add 5',
          'The answer is x + 5'
        ],
        explanation: 'The phrase "5 more than x" translates to x + 5 in algebraic notation.'
      }
    ]
  },
  'ex-expressions-1': {
    id: 'ex-expressions-1',
    title: 'Evaluating Expressions',
    skillName: 'Expressions',
    type: 'exercise',
    questions: [
      {
        id: 'q1',
        question: 'Evaluate: 4x + 2y when x = 3 and y = 5',
        options: ['22', '32', '17', '42'],
        correct: '22',
        hints: [
          'Substitute x = 3 and y = 5 into the expression',
          'Calculate: 4(3) + 2(5)',
          '12 + 10 = 22'
        ],
        explanation: 'Replace variables with their values: 4(3) + 2(5) = 12 + 10 = 22'
      },
      {
        id: 'q2',
        question: 'Evaluate: 3a - 2b when a = 6 and b = 4',
        options: ['10', '14', '2', '18'],
        correct: '10',
        hints: [
          'Substitute a = 6 and b = 4',
          'Calculate: 3(6) - 2(4)',
          '18 - 8 = 10'
        ],
        explanation: 'Substitute values: 3(6) - 2(4) = 18 - 8 = 10'
      },
      {
        id: 'q3',
        question: 'Evaluate: x² + 3x when x = 4',
        options: ['28', '19', '16', '32'],
        correct: '28',
        hints: [
          'x² means x × x',
          'Calculate: 4² + 3(4)',
          '16 + 12 = 28'
        ],
        explanation: 'Substitute x = 4: (4)² + 3(4) = 16 + 12 = 28'
      },
      {
        id: 'q4',
        question: 'Evaluate: 2(m + n) when m = 5 and n = 3',
        options: ['16', '13', '11', '10'],
        correct: '16',
        hints: [
          'Substitute m = 5 and n = 3',
          'Calculate inside parentheses first: 5 + 3 = 8',
          'Then multiply by 2: 2 × 8 = 16'
        ],
        explanation: 'Substitute values: 2(5 + 3) = 2(8) = 16. Always evaluate inside parentheses first!'
      }
    ]
  },
  'ex-pemdas-1': {
    id: 'ex-pemdas-1',
    title: 'Order of Operations (PEMDAS)',
    skillName: 'Order of Operations',
    type: 'exercise',
    questions: [
      {
        id: 'q1',
        question: 'Evaluate: 8 + 4 × 2',
        options: ['24', '16', '14', '12'],
        correct: '16',
        hints: [
          'Remember PEMDAS: Multiplication comes before Addition',
          'First calculate: 4 × 2 = 8',
          'Then add: 8 + 8 = 16'
        ],
        explanation: 'Following PEMDAS, multiply first: 4 × 2 = 8, then add: 8 + 8 = 16'
      },
      {
        id: 'q2',
        question: 'Evaluate: (6 + 3) × 2',
        options: ['12', '18', '15', '9'],
        correct: '18',
        hints: [
          'Parentheses come first in PEMDAS',
          'Calculate inside parentheses: 6 + 3 = 9',
          'Then multiply: 9 × 2 = 18'
        ],
        explanation: 'Parentheses first: (6 + 3) = 9, then multiply: 9 × 2 = 18'
      },
      {
        id: 'q3',
        question: 'Evaluate: 20 - 12 ÷ 3',
        options: ['16', '2.67', '6', '4'],
        correct: '16',
        hints: [
          'Division comes before Subtraction in PEMDAS',
          'First divide: 12 ÷ 3 = 4',
          'Then subtract: 20 - 4 = 16'
        ],
        explanation: 'Division first: 12 ÷ 3 = 4, then subtract: 20 - 4 = 16'
      },
      {
        id: 'q4',
        question: 'Evaluate: 2³ + 4 × 3',
        options: ['30', '20', '72', '24'],
        correct: '20',
        hints: [
          'PEMDAS: Exponents first, then Multiplication, then Addition',
          'Calculate: 2³ = 8, and 4 × 3 = 12',
          'Finally add: 8 + 12 = 20'
        ],
        explanation: 'Exponents first: 2³ = 8. Then multiply: 4 × 3 = 12. Finally add: 8 + 12 = 20'
      },
      {
        id: 'q5',
        question: 'Evaluate: (10 - 2) ÷ 4 + 3',
        options: ['5', '1', '2.75', '8'],
        correct: '5',
        hints: [
          'Parentheses: 10 - 2 = 8',
          'Division: 8 ÷ 4 = 2',
          'Addition: 2 + 3 = 5'
        ],
        explanation: 'Step by step: (10 - 2) = 8, then 8 ÷ 4 = 2, finally 2 + 3 = 5'
      }
    ]
  }
};

// User progress tracking (in-memory for demo)
const userProgress = {};

// GET /api/exercises/:exerciseId - Get exercise details
router.get('/:exerciseId', authenticateToken, async (req, res) => {
  try {
    const { exerciseId } = req.params;

    if (isDemoMode) {
      const exercise = demoExercises[exerciseId];
      if (!exercise) {
        return res.status(404).json({ error: 'Exercise not found' });
      }

      // Get user's mastery level for this exercise
      const userId = req.user.id;
      const userKey = `${userId}-${exerciseId}`;
      const progress = userProgress[userKey] || {
        masteryLevel: MASTERY_LEVELS.NOT_STARTED,
        attempts: 0,
        bestScore: 0,
        lastAttemptDate: null
      };

      return res.json({
        exercise: {
          ...exercise,
          // Don't send hints/explanations/correct answers initially
          questions: exercise.questions.map(q => ({
            id: q.id,
            question: q.question,
            options: q.options
          }))
        },
        progress
      });
    }

    // Production mode - fetch from database
    const result = await pool.query('SELECT * FROM exercises WHERE id = $1', [exerciseId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    res.json({ exercise: result.rows[0] });
  } catch (error) {
    console.error('Error fetching exercise:', error);
    res.status(500).json({ error: 'Failed to fetch exercise' });
  }
});

// POST /api/exercises/:exerciseId/submit - Submit exercise answers
router.post('/:exerciseId/submit', authenticateToken, async (req, res) => {
  try {
    const { exerciseId } = req.params;
    const { answers, hintsUsed } = req.body; // answers: { questionId: answer }

    if (isDemoMode) {
      const exercise = demoExercises[exerciseId];
      if (!exercise) {
        return res.status(404).json({ error: 'Exercise not found' });
      }

      // Calculate score
      const results = exercise.questions.map(q => {
        const userAnswer = answers[q.id];
        const isCorrect = userAnswer === q.correct;
        const usedHint = hintsUsed && hintsUsed[q.id];

        return {
          questionId: q.id,
          correct: isCorrect,
          userAnswer,
          correctAnswer: q.correct,
          explanation: q.explanation,
          usedHint
        };
      });

      const correctCount = results.filter(r => r.correct && !r.usedHint).length;
      const totalQuestions = exercise.questions.length;
      const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

      // Update mastery level
      const userId = req.user.id;
      const userKey = `${userId}-${exerciseId}`;
      const currentProgress = userProgress[userKey] || {
        masteryLevel: MASTERY_LEVELS.NOT_STARTED,
        attempts: 0,
        bestScore: 0
      };

      let newMasteryLevel = currentProgress.masteryLevel;
      let masteryPoints = 0;

      // Mastery progression logic
      if (scorePercentage === 100 && correctCount === totalQuestions) {
        // Perfect score: advance based on current level
        if (currentProgress.masteryLevel === MASTERY_LEVELS.NOT_STARTED) {
          newMasteryLevel = MASTERY_LEVELS.PROFICIENT; // First perfect = jump 2 levels
          masteryPoints = 80;
        } else if (currentProgress.masteryLevel === MASTERY_LEVELS.ATTEMPTED) {
          newMasteryLevel = MASTERY_LEVELS.FAMILIAR; // Recovering, go up 1
          masteryPoints = 50;
        } else if (currentProgress.masteryLevel === MASTERY_LEVELS.FAMILIAR) {
          newMasteryLevel = MASTERY_LEVELS.PROFICIENT; // Go up 1
          masteryPoints = 80;
        }
        // PROFICIENT stays until unit test (handled separately)
      } else if (scorePercentage >= 70) {
        // 70-99%: reach or stay at familiar
        if ([MASTERY_LEVELS.NOT_STARTED, MASTERY_LEVELS.ATTEMPTED].includes(currentProgress.masteryLevel)) {
          newMasteryLevel = MASTERY_LEVELS.FAMILIAR;
          masteryPoints = 50;
        }
      } else {
        // Below 70%: drop to attempted
        if ([MASTERY_LEVELS.NOT_STARTED, MASTERY_LEVELS.FAMILIAR, MASTERY_LEVELS.PROFICIENT].includes(currentProgress.masteryLevel)) {
          newMasteryLevel = MASTERY_LEVELS.ATTEMPTED;
          masteryPoints = 0;
        }
      }

      // Update progress
      userProgress[userKey] = {
        masteryLevel: newMasteryLevel,
        attempts: currentProgress.attempts + 1,
        bestScore: Math.max(currentProgress.bestScore, scorePercentage),
        lastAttemptDate: new Date(),
        lastScore: scorePercentage
      };

      return res.json({
        results,
        score: scorePercentage,
        correctCount,
        totalQuestions,
        masteryLevel: newMasteryLevel,
        masteryPoints,
        previousMasteryLevel: currentProgress.masteryLevel,
        message: getMasteryMessage(newMasteryLevel, scorePercentage)
      });
    }

    // Production mode
    res.status(501).json({ error: 'Production mode not implemented yet' });
  } catch (error) {
    console.error('Error submitting exercise:', error);
    res.status(500).json({ error: 'Failed to submit exercise' });
  }
});

// GET /api/exercises/:exerciseId/hint - Get hint for a question
router.post('/:exerciseId/hint', authenticateToken, async (req, res) => {
  try {
    const { exerciseId } = req.params;
    const { questionId, hintLevel } = req.body; // hintLevel: 0, 1, 2, etc.

    if (isDemoMode) {
      const exercise = demoExercises[exerciseId];
      if (!exercise) {
        return res.status(404).json({ error: 'Exercise not found' });
      }

      const question = exercise.questions.find(q => q.id === questionId);
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }

      const hint = question.hints[hintLevel];
      const isLastHint = hintLevel >= question.hints.length - 1;

      return res.json({
        hint,
        hintLevel,
        totalHints: question.hints.length,
        isLastHint,
        message: isLastHint ? 'This is the final hint showing the complete solution.' : 'Need more help? Click for the next hint.'
      });
    }

    res.status(501).json({ error: 'Production mode not implemented yet' });
  } catch (error) {
    console.error('Error fetching hint:', error);
    res.status(500).json({ error: 'Failed to fetch hint' });
  }
});

// POST /api/exercises/generate - AI-generate a practice exercise on any topic
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { topic, subject, difficulty, numQuestions = 4 } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const prompt = `Generate ${numQuestions} multiple-choice practice questions about "${topic}" for ${subject || 'general education'} at ${difficulty || 'medium'} difficulty.

Return ONLY valid JSON with this exact structure:
{
  "title": "Practice: ${topic}",
  "skillName": "${topic}",
  "questions": [
    {
      "id": "q1",
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correct": "A",
      "hints": ["hint 1", "hint 2", "hint 3"],
      "explanation": "..."
    }
  ]
}

Rules:
- Questions must be clear and educational
- Options must be distinct and plausible
- Hints should be progressive (each hint gives more info)
- Explanation must teach the concept, not just state the answer
- All 4 options must be reasonable (no trick answers)`;

    const messages = [
      { role: 'system', content: 'You are an expert educational content creator. Generate high-quality practice questions. Always return valid JSON only, no extra text.' },
      { role: 'user', content: prompt }
    ];

    const response = await generateChatCompletion(messages, { temperature: 0.7, max_tokens: 2000 });

    let exercise;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      exercise = JSON.parse(jsonMatch ? jsonMatch[0] : response);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return res.status(500).json({ error: 'Failed to generate exercise. Try again.' });
    }

    // Assign IDs if missing
    if (exercise.questions) {
      exercise.questions = exercise.questions.map((q, idx) => ({
        ...q,
        id: q.id || `q${idx + 1}`
      }));
    }

    exercise.id = `ai-generated-${Date.now()}`;
    exercise.type = 'exercise';

    // Cache the generated exercise in memory for submission
    demoExercises[exercise.id] = exercise;

    return res.json({ exercise, message: 'AI-generated exercise ready!' });
  } catch (error) {
    console.error('Error generating exercise:', error);
    res.status(500).json({ error: 'Failed to generate exercise' });
  }
});

// Helper function for mastery messages
function getMasteryMessage(level, score) {
  switch (level) {
    case MASTERY_LEVELS.MASTERED:
      return '🎉 Mastered! You\'ve achieved complete mastery of this skill!';
    case MASTERY_LEVELS.PROFICIENT:
      return '⭐ Proficient! Great job! Complete a unit test to reach Mastered level.';
    case MASTERY_LEVELS.FAMILIAR:
      return '👍 Familiar! Keep practicing to become proficient.';
    case MASTERY_LEVELS.ATTEMPTED:
      return '💪 Keep trying! Review the lessons and try again.';
    default:
      return `You scored ${score}%. Keep learning!`;
  }
}

export default router;
