import express from 'express';
import { pool } from '../lib/neon.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const isDemoMode = !pool;

// Demo curriculum data
const demoCurriculum = {
  courses: [
    {
      id: 'math-algebra-1',
      title: 'Algebra 1',
      description: 'Master the fundamentals of algebra with comprehensive lessons and practice',
      subject: 'Mathematics',
      level: 'High School',
      totalUnits: 12,
      estimatedHours: 40,
      thumbnail: '🔢',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'physics-mechanics',
      title: 'Physics - Classical Mechanics',
      description: 'Explore motion, forces, energy, and momentum',
      subject: 'Physics',
      level: 'High School',
      totalUnits: 8,
      estimatedHours: 35,
      thumbnail: '⚡',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'chemistry-basics',
      title: 'Chemistry Fundamentals',
      description: 'Learn about atoms, molecules, chemical reactions, and the periodic table',
      subject: 'Chemistry',
      level: 'High School',
      totalUnits: 10,
      estimatedHours: 30,
      thumbnail: '🧪',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'biology-cells',
      title: 'Biology - Cell Biology',
      description: 'Discover the building blocks of life and how cells function',
      subject: 'Biology',
      level: 'High School',
      totalUnits: 6,
      estimatedHours: 25,
      thumbnail: '🧬',
      color: 'from-yellow-500 to-orange-500'
    }
  ],
  units: {
    'math-algebra-1': [
      {
        id: 'unit-1',
        courseId: 'math-algebra-1',
        title: 'Foundations of Algebra',
        description: 'Learn the basic building blocks of algebraic thinking',
        order: 1,
        totalLessons: 8,
        skills: ['Variables', 'Expressions', 'Order of Operations', 'Properties of Numbers']
      },
      {
        id: 'unit-2',
        courseId: 'math-algebra-1',
        title: 'Solving Linear Equations',
        description: 'Master techniques for solving equations with one variable',
        order: 2,
        totalLessons: 10,
        skills: ['One-step equations', 'Multi-step equations', 'Variables on both sides', 'Word problems']
      },
      {
        id: 'unit-3',
        courseId: 'math-algebra-1',
        title: 'Linear Functions',
        description: 'Understand linear relationships and graphing',
        order: 3,
        totalLessons: 12,
        skills: ['Slope', 'Y-intercept', 'Graphing lines', 'Writing equations', 'Parallel/perpendicular lines']
      }
    ],
    'physics-mechanics': [
      {
        id: 'unit-1',
        courseId: 'physics-mechanics',
        title: 'Motion in One Dimension',
        description: 'Study position, velocity, and acceleration',
        order: 1,
        totalLessons: 7,
        skills: ['Distance vs Displacement', 'Speed vs Velocity', 'Acceleration', 'Kinematic equations']
      },
      {
        id: 'unit-2',
        courseId: 'physics-mechanics',
        title: 'Forces and Newton\'s Laws',
        description: 'Explore the fundamental laws of motion',
        order: 2,
        totalLessons: 9,
        skills: ['Newton\'s First Law', 'Newton\'s Second Law', 'Newton\'s Third Law', 'Free body diagrams']
      }
    ]
  },
  lessons: {
    'unit-1': [
      {
        id: 'lesson-1',
        unitId: 'unit-1',
        title: 'Introduction to Variables',
        description: 'Learn what variables are and how to use them in algebra',
        order: 1,
        type: 'video',
        duration: 7,
        // The Organic Chemistry Tutor - Introduction to Variables - allows embedding
        videoUrl: 'https://www.youtube.com/embed/NybHckSEQBI',
        youtubeId: 'NybHckSEQBI',
        transcript: 'A variable is a symbol (usually a letter) that represents an unknown value. For example, in the expression 3x + 5, the letter x is the variable. Variables allow us to write general rules that work for any number. When we substitute a specific number for x, we call that "evaluating" the expression.',
        hasExercise: true,
        exerciseId: 'ex-variables-1'
      },
      {
        id: 'lesson-2',
        unitId: 'unit-1',
        title: 'Evaluating Expressions',
        description: 'Substitute values into algebraic expressions and simplify',
        order: 2,
        type: 'video',
        duration: 9,
        // The Organic Chemistry Tutor - Evaluating Algebraic Expressions
        videoUrl: 'https://www.youtube.com/embed/Vd_2aKiMxMQ',
        youtubeId: 'Vd_2aKiMxMQ',
        transcript: 'To evaluate an algebraic expression, substitute the given value(s) for the variable(s) and then simplify using the order of operations. For example, if x = 3, then 2x + 4 = 2(3) + 4 = 6 + 4 = 10.',
        hasExercise: true,
        exerciseId: 'ex-expressions-1'
      },
      {
        id: 'lesson-3',
        unitId: 'unit-1',
        title: 'Order of Operations (PEMDAS)',
        description: 'Master PEMDAS to correctly solve multi-step expressions',
        order: 3,
        type: 'video',
        duration: 10,
        // The Organic Chemistry Tutor - Order of Operations
        videoUrl: 'https://www.youtube.com/embed/dAgfnK528RA',
        youtubeId: 'dAgfnK528RA',
        transcript: 'PEMDAS stands for Parentheses, Exponents, Multiplication, Division, Addition, Subtraction. Always evaluate expressions in this exact order. Parentheses first, then exponents, then multiplication and division (left to right), then addition and subtraction (left to right).',
        hasExercise: true,
        exerciseId: 'ex-pemdas-1'
      }
    ]
  }
};

// GET /api/curriculum/courses - Get all available courses
router.get('/courses', authenticateToken, async (req, res) => {
  try {
    if (isDemoMode) {
      return res.json({ courses: demoCurriculum.courses });
    }

    // Production mode - fetch from database
    const result = await pool.query(`
      SELECT id, title, description, subject, level, total_units, estimated_hours, thumbnail, color
      FROM courses
      ORDER BY subject, level
    `);
    res.json({ courses: result.rows });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// GET /api/curriculum/courses/:courseId - Get course details
router.get('/courses/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;

    if (isDemoMode) {
      const course = demoCurriculum.courses.find(c => c.id === courseId);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }
      const units = demoCurriculum.units[courseId] || [];
      return res.json({ course, units });
    }

    // Production mode
    const courseResult = await pool.query('SELECT * FROM courses WHERE id = $1', [courseId]);
    if (courseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const unitsResult = await pool.query(
      'SELECT * FROM units WHERE course_id = $1 ORDER BY order_num',
      [courseId]
    );

    res.json({
      course: courseResult.rows[0],
      units: unitsResult.rows
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ error: 'Failed to fetch course details' });
  }
});

// GET /api/curriculum/units/:unitId/lessons - Get lessons for a unit
router.get('/units/:unitId/lessons', authenticateToken, async (req, res) => {
  try {
    const { unitId } = req.params;

    if (isDemoMode) {
      const lessons = demoCurriculum.lessons[unitId] || [];
      return res.json({ lessons });
    }

    // Production mode
    const result = await pool.query(
      'SELECT * FROM lessons WHERE unit_id = $1 ORDER BY order_num',
      [unitId]
    );
    res.json({ lessons: result.rows });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

// GET /api/curriculum/lessons/:lessonId - Get lesson details
router.get('/lessons/:lessonId', authenticateToken, async (req, res) => {
  try {
    const { lessonId } = req.params;

    if (isDemoMode) {
      // Find lesson in demo data
      let foundLesson = null;
      for (const unitLessons of Object.values(demoCurriculum.lessons)) {
        const lesson = unitLessons.find(l => l.id === lessonId);
        if (lesson) {
          foundLesson = lesson;
          break;
        }
      }

      if (!foundLesson) {
        return res.status(404).json({ error: 'Lesson not found' });
      }

      return res.json({ lesson: foundLesson });
    }

    // Production mode
    const result = await pool.query('SELECT * FROM lessons WHERE id = $1', [lessonId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    res.json({ lesson: result.rows[0] });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
});

export default router;
