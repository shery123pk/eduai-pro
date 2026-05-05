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
      totalUnits: 3,
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
      totalUnits: 2,
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
      totalUnits: 2,
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
      totalUnits: 2,
      estimatedHours: 25,
      thumbnail: '🧬',
      color: 'from-yellow-500 to-orange-500'
    }
  ],
  units: {
    'math-algebra-1': [
      {
        id: 'math-unit-1',
        courseId: 'math-algebra-1',
        title: 'Foundations of Algebra',
        description: 'Learn the basic building blocks of algebraic thinking',
        order: 1,
        totalLessons: 3,
        skills: ['Variables', 'Expressions', 'Order of Operations', 'Properties of Numbers']
      },
      {
        id: 'math-unit-2',
        courseId: 'math-algebra-1',
        title: 'Solving Linear Equations',
        description: 'Master techniques for solving equations with one variable',
        order: 2,
        totalLessons: 3,
        skills: ['One-step equations', 'Multi-step equations', 'Variables on both sides', 'Word problems']
      },
      {
        id: 'math-unit-3',
        courseId: 'math-algebra-1',
        title: 'Linear Functions & Graphing',
        description: 'Understand linear relationships and graphing',
        order: 3,
        totalLessons: 3,
        skills: ['Slope', 'Y-intercept', 'Graphing lines', 'Writing equations']
      }
    ],
    'physics-mechanics': [
      {
        id: 'physics-unit-1',
        courseId: 'physics-mechanics',
        title: 'Motion in One Dimension',
        description: 'Study position, velocity, and acceleration with kinematic equations',
        order: 1,
        totalLessons: 3,
        skills: ['Distance vs Displacement', 'Speed vs Velocity', 'Acceleration', 'Kinematic equations']
      },
      {
        id: 'physics-unit-2',
        courseId: 'physics-mechanics',
        title: "Forces and Newton's Laws",
        description: 'Explore the fundamental laws governing all motion',
        order: 2,
        totalLessons: 3,
        skills: ["Newton's First Law", "Newton's Second Law", "Newton's Third Law", 'Free body diagrams']
      }
    ],
    'chemistry-basics': [
      {
        id: 'chem-unit-1',
        courseId: 'chemistry-basics',
        title: 'Atomic Structure & The Periodic Table',
        description: 'Understand atoms, electrons, and how elements are organised',
        order: 1,
        totalLessons: 3,
        skills: ['Protons, Neutrons, Electrons', 'Atomic Number & Mass', 'Electron Configuration', 'Periodic Trends']
      },
      {
        id: 'chem-unit-2',
        courseId: 'chemistry-basics',
        title: 'Chemical Bonding & Reactions',
        description: 'Learn how atoms combine and transform in chemical reactions',
        order: 2,
        totalLessons: 3,
        skills: ['Ionic Bonds', 'Covalent Bonds', 'Balancing Equations', 'Types of Reactions']
      }
    ],
    'biology-cells': [
      {
        id: 'bio-unit-1',
        courseId: 'biology-cells',
        title: 'Cell Structure & Function',
        description: 'Discover the organelles inside cells and their roles',
        order: 1,
        totalLessons: 3,
        skills: ['Prokaryotic vs Eukaryotic', 'Cell Organelles', 'Cell Membrane', 'Diffusion & Osmosis']
      },
      {
        id: 'bio-unit-2',
        courseId: 'biology-cells',
        title: 'Cell Division & Genetics',
        description: 'Understand how cells reproduce and pass on genetic information',
        order: 2,
        totalLessons: 3,
        skills: ['Mitosis', 'Meiosis', 'DNA Structure', 'Protein Synthesis']
      }
    ]
  },
  lessons: {
    // ── Mathematics ────────────────────────────────────────────────────
    'math-unit-1': [
      {
        id: 'math-l1',
        unitId: 'math-unit-1',
        title: 'Introduction to Variables',
        description: 'Learn what variables are and how to use them in algebra',
        order: 1, type: 'video', duration: 7,
        videoUrl: 'https://www.youtube.com/embed/NybHckSEQBI',
        youtubeId: 'NybHckSEQBI',
        transcript: 'A variable is a symbol (usually a letter) that represents an unknown value. For example, in 3x + 5, the letter x is the variable. Variables allow us to write general rules for any number.',
        hasExercise: true, exerciseId: 'ex-variables-1'
      },
      {
        id: 'math-l2',
        unitId: 'math-unit-1',
        title: 'Evaluating Algebraic Expressions',
        description: 'Substitute values into algebraic expressions and simplify',
        order: 2, type: 'video', duration: 9,
        videoUrl: 'https://www.youtube.com/embed/Vd_2aKiMxMQ',
        youtubeId: 'Vd_2aKiMxMQ',
        transcript: 'To evaluate an algebraic expression, substitute the given value for the variable and simplify. If x = 3, then 2x + 4 = 2(3) + 4 = 10.',
        hasExercise: true, exerciseId: 'ex-expressions-1'
      },
      {
        id: 'math-l3',
        unitId: 'math-unit-1',
        title: 'Order of Operations (PEMDAS)',
        description: 'Master PEMDAS to correctly solve multi-step expressions',
        order: 3, type: 'video', duration: 10,
        videoUrl: 'https://www.youtube.com/embed/dAgfnK528RA',
        youtubeId: 'dAgfnK528RA',
        transcript: 'PEMDAS: Parentheses, Exponents, Multiplication/Division, Addition/Subtraction. Always follow this order to get the correct answer.',
        hasExercise: true, exerciseId: 'ex-pemdas-1'
      }
    ],
    'math-unit-2': [
      {
        id: 'math-l4',
        unitId: 'math-unit-2',
        title: 'Solving One-Step Equations',
        description: 'Use inverse operations to isolate the variable',
        order: 1, type: 'video', duration: 8,
        videoUrl: 'https://www.youtube.com/embed/rUZ2Zy-gzGY',
        youtubeId: 'rUZ2Zy-gzGY',
        transcript: 'To solve a one-step equation, apply the inverse operation to both sides. To solve x + 5 = 12, subtract 5 from both sides: x = 7.',
        hasExercise: true, exerciseId: 'ex-one-step-1'
      },
      {
        id: 'math-l5',
        unitId: 'math-unit-2',
        title: 'Solving Multi-Step Equations',
        description: 'Combine like terms and use multiple steps to find x',
        order: 2, type: 'video', duration: 11,
        videoUrl: 'https://www.youtube.com/embed/Z-ZkmpQBIFo',
        youtubeId: 'Z-ZkmpQBIFo',
        transcript: 'Multi-step equations require combining like terms and performing multiple inverse operations. Always simplify each side first, then isolate the variable.',
        hasExercise: true, exerciseId: 'ex-multi-step-1'
      },
      {
        id: 'math-l6',
        unitId: 'math-unit-2',
        title: 'Equations with Variables on Both Sides',
        description: 'Collect variables on one side and constants on the other',
        order: 3, type: 'video', duration: 10,
        videoUrl: 'https://www.youtube.com/embed/xKE_-ywFbec',
        youtubeId: 'xKE_-ywFbec',
        transcript: 'When variables appear on both sides, move them to one side by adding or subtracting the variable term. Then solve as usual.',
        hasExercise: true, exerciseId: 'ex-vars-both-sides-1'
      }
    ],
    'math-unit-3': [
      {
        id: 'math-l7',
        unitId: 'math-unit-3',
        title: 'Understanding Slope',
        description: 'Calculate and interpret the slope of a line',
        order: 1, type: 'video', duration: 9,
        videoUrl: 'https://www.youtube.com/embed/HetNrqzLhqs',
        youtubeId: 'HetNrqzLhqs',
        transcript: 'Slope = rise / run = (y₂ − y₁) / (x₂ − x₁). A positive slope rises left to right; a negative slope falls. Zero slope means horizontal; undefined slope means vertical.',
        hasExercise: true, exerciseId: 'ex-slope-1'
      },
      {
        id: 'math-l8',
        unitId: 'math-unit-3',
        title: 'Slope-Intercept Form (y = mx + b)',
        description: 'Write and graph linear equations using slope and y-intercept',
        order: 2, type: 'video', duration: 10,
        videoUrl: 'https://www.youtube.com/embed/IL3UCuXrUzE',
        youtubeId: 'IL3UCuXrUzE',
        transcript: 'In y = mx + b, m is the slope and b is the y-intercept (where the line crosses the y-axis). Plot the y-intercept, then use the slope to find a second point.',
        hasExercise: true, exerciseId: 'ex-slope-intercept-1'
      },
      {
        id: 'math-l9',
        unitId: 'math-unit-3',
        title: 'Graphing Linear Equations',
        description: 'Plot straight lines from equations using a table of values or intercepts',
        order: 3, type: 'video', duration: 8,
        videoUrl: 'https://www.youtube.com/embed/MXV65i9g1Xg',
        youtubeId: 'MXV65i9g1Xg',
        transcript: 'To graph a linear equation, find two points by substituting values for x, plot them, then draw a straight line through them.',
        hasExercise: true, exerciseId: 'ex-graphing-1'
      }
    ],

    // ── Physics ────────────────────────────────────────────────────────
    'physics-unit-1': [
      {
        id: 'phys-l1',
        unitId: 'physics-unit-1',
        title: 'Distance vs Displacement',
        description: 'Understand the difference between scalar distance and vector displacement',
        order: 1, type: 'video', duration: 8,
        videoUrl: 'https://www.youtube.com/embed/4MRYHxJxpDU',
        youtubeId: '4MRYHxJxpDU',
        transcript: 'Distance is the total path length travelled (scalar). Displacement is the straight-line change in position from start to finish (vector). A runner completing a full lap has large distance but zero displacement.',
        hasExercise: true, exerciseId: 'ex-distance-1'
      },
      {
        id: 'phys-l2',
        unitId: 'physics-unit-1',
        title: 'Speed, Velocity & Acceleration',
        description: 'Distinguish speed from velocity and learn how acceleration changes motion',
        order: 2, type: 'video', duration: 10,
        videoUrl: 'https://www.youtube.com/embed/DRp2oI3zFKk',
        youtubeId: 'DRp2oI3zFKk',
        transcript: 'Speed = distance / time (scalar). Velocity = displacement / time (vector). Acceleration = change in velocity / time. Positive acceleration means speeding up; negative means slowing down (deceleration).',
        hasExercise: true, exerciseId: 'ex-velocity-1'
      },
      {
        id: 'phys-l3',
        unitId: 'physics-unit-1',
        title: 'Kinematic Equations',
        description: 'Use the four kinematic equations to solve motion problems',
        order: 3, type: 'video', duration: 13,
        videoUrl: 'https://www.youtube.com/embed/FOkQszg1-j8',
        youtubeId: 'FOkQszg1-j8',
        transcript: 'The four kinematic equations link displacement (s), initial velocity (u), final velocity (v), acceleration (a), and time (t). Choose the equation that contains the three known variables and the one unknown you need.',
        hasExercise: true, exerciseId: 'ex-kinematics-1'
      }
    ],
    'physics-unit-2': [
      {
        id: 'phys-l4',
        unitId: 'physics-unit-2',
        title: "Newton's First Law – Inertia",
        description: 'An object at rest stays at rest unless acted on by a net force',
        order: 1, type: 'video', duration: 7,
        videoUrl: 'https://www.youtube.com/embed/fn-0NkFnOQE',
        youtubeId: 'fn-0NkFnOQE',
        transcript: "Newton's First Law: an object will remain at rest or in uniform motion unless a net external force acts on it. This property is called inertia. A heavier object has more inertia.",
        hasExercise: true, exerciseId: 'ex-newtons1-1'
      },
      {
        id: 'phys-l5',
        unitId: 'physics-unit-2',
        title: "Newton's Second Law – F = ma",
        description: 'Calculate the net force, mass, or acceleration in any scenario',
        order: 2, type: 'video', duration: 11,
        videoUrl: 'https://www.youtube.com/embed/kKKM8Y-u7ds',
        youtubeId: 'kKKM8Y-u7ds',
        transcript: "Newton's Second Law: F = ma. The net force on an object equals its mass times its acceleration. If you double the force, acceleration doubles. If you double the mass, acceleration halves.",
        hasExercise: true, exerciseId: 'ex-newtons2-1'
      },
      {
        id: 'phys-l6',
        unitId: 'physics-unit-2',
        title: "Newton's Third Law & Free Body Diagrams",
        description: 'Every action has an equal and opposite reaction; draw FBDs to analyse forces',
        order: 3, type: 'video', duration: 10,
        videoUrl: 'https://www.youtube.com/embed/BY-jFkCsEZo',
        youtubeId: 'BY-jFkCsEZo',
        transcript: "Newton's Third Law: for every action force there is an equal and opposite reaction force. Free body diagrams show all forces acting on a single object as arrows; the net force determines acceleration.",
        hasExercise: true, exerciseId: 'ex-newtons3-1'
      }
    ],

    // ── Chemistry ──────────────────────────────────────────────────────
    'chem-unit-1': [
      {
        id: 'chem-l1',
        unitId: 'chem-unit-1',
        title: 'Atomic Structure – Protons, Neutrons & Electrons',
        description: 'Explore what atoms are made of and how sub-atomic particles differ',
        order: 1, type: 'video', duration: 9,
        videoUrl: 'https://www.youtube.com/embed/Rz2TLZtMs2I',
        youtubeId: 'Rz2TLZtMs2I',
        transcript: 'Atoms consist of a nucleus (protons + neutrons) surrounded by electrons in shells. Atomic number = number of protons. Mass number = protons + neutrons. Neutral atoms have equal protons and electrons.',
        hasExercise: true, exerciseId: 'ex-atomic-1'
      },
      {
        id: 'chem-l2',
        unitId: 'chem-unit-1',
        title: 'The Periodic Table & Periodic Trends',
        description: 'Understand how elements are arranged and how properties change across periods',
        order: 2, type: 'video', duration: 11,
        videoUrl: 'https://www.youtube.com/embed/UMsGkQf89FE',
        youtubeId: 'UMsGkQf89FE',
        transcript: 'Elements are arranged by increasing atomic number. Groups (columns) share valence electrons; periods (rows) share the same highest energy level. Trends include atomic radius, ionisation energy, and electronegativity.',
        hasExercise: true, exerciseId: 'ex-periodic-1'
      },
      {
        id: 'chem-l3',
        unitId: 'chem-unit-1',
        title: 'Electron Configuration',
        description: 'Write electron configurations using the aufbau principle',
        order: 3, type: 'video', duration: 10,
        videoUrl: 'https://www.youtube.com/embed/x5OZBWGgbGI',
        youtubeId: 'x5OZBWGgbGI',
        transcript: 'Electrons fill orbitals from lowest to highest energy (aufbau principle). Use the order: 1s, 2s, 2p, 3s, 3p, 4s, 3d … Each s can hold 2 electrons, p can hold 6, d can hold 10.',
        hasExercise: true, exerciseId: 'ex-electron-config-1'
      }
    ],
    'chem-unit-2': [
      {
        id: 'chem-l4',
        unitId: 'chem-unit-2',
        title: 'Ionic and Covalent Bonds',
        description: 'Learn how atoms transfer or share electrons to form compounds',
        order: 1, type: 'video', duration: 10,
        videoUrl: 'https://www.youtube.com/embed/KVNG23PxVV0',
        youtubeId: 'KVNG23PxVV0',
        transcript: 'Ionic bonds form when one atom transfers electrons to another, creating oppositely charged ions that attract. Covalent bonds form when atoms share electron pairs. Metals + non-metals → ionic; non-metal + non-metal → covalent.',
        hasExercise: true, exerciseId: 'ex-bonds-1'
      },
      {
        id: 'chem-l5',
        unitId: 'chem-unit-2',
        title: 'Balancing Chemical Equations',
        description: 'Apply the law of conservation of mass to balance reactions',
        order: 2, type: 'video', duration: 12,
        videoUrl: 'https://www.youtube.com/embed/RnGe9kQqMpQ',
        youtubeId: 'RnGe9kQqMpQ',
        transcript: 'In a balanced equation, the number of each type of atom is the same on both sides. Change coefficients (never subscripts) to balance. Start with the most complex molecule and leave H₂ and O₂ for last.',
        hasExercise: true, exerciseId: 'ex-balancing-1'
      },
      {
        id: 'chem-l6',
        unitId: 'chem-unit-2',
        title: 'Types of Chemical Reactions',
        description: 'Identify synthesis, decomposition, single & double displacement, and combustion',
        order: 3, type: 'video', duration: 10,
        videoUrl: 'https://www.youtube.com/embed/2KPHiNfPjGk',
        youtubeId: '2KPHiNfPjGk',
        transcript: 'Synthesis: A + B → AB. Decomposition: AB → A + B. Single displacement: A + BC → AC + B. Double displacement: AB + CD → AD + CB. Combustion: fuel + O₂ → CO₂ + H₂O.',
        hasExercise: true, exerciseId: 'ex-rxn-types-1'
      }
    ],

    // ── Biology ────────────────────────────────────────────────────────
    'bio-unit-1': [
      {
        id: 'bio-l1',
        unitId: 'bio-unit-1',
        title: 'Cell Structure – Organelles & Their Functions',
        description: 'Tour the organelles inside a eukaryotic cell and learn what each one does',
        order: 1, type: 'video', duration: 11,
        videoUrl: 'https://www.youtube.com/embed/URUJD5NEXC8',
        youtubeId: 'URUJD5NEXC8',
        transcript: 'Eukaryotic cells contain membrane-bound organelles. The nucleus holds DNA. Mitochondria produce ATP. The ribosome builds proteins. The endoplasmic reticulum transports materials. The Golgi apparatus packages and ships proteins.',
        hasExercise: true, exerciseId: 'ex-organelles-1'
      },
      {
        id: 'bio-l2',
        unitId: 'bio-unit-1',
        title: 'Cell Membrane & Transport',
        description: 'Understand how the fluid mosaic membrane controls what enters and exits the cell',
        order: 2, type: 'video', duration: 9,
        videoUrl: 'https://www.youtube.com/embed/Qqsf2-Ru7io',
        youtubeId: 'Qqsf2-Ru7io',
        transcript: 'The cell membrane is a phospholipid bilayer with embedded proteins (fluid mosaic model). Passive transport (diffusion, osmosis) moves substances down a concentration gradient without energy. Active transport requires ATP to move against the gradient.',
        hasExercise: true, exerciseId: 'ex-membrane-1'
      },
      {
        id: 'bio-l3',
        unitId: 'bio-unit-1',
        title: 'Prokaryotic vs Eukaryotic Cells',
        description: 'Compare the two fundamental types of cells found in living things',
        order: 3, type: 'video', duration: 8,
        videoUrl: 'https://www.youtube.com/embed/Pumfo_4aPg0',
        youtubeId: 'Pumfo_4aPg0',
        transcript: 'Prokaryotic cells (bacteria) lack a nucleus and membrane-bound organelles; their DNA floats freely. Eukaryotic cells (animals, plants, fungi) have a true nucleus and specialised organelles. Plant cells also have a cell wall, chloroplasts, and a large vacuole.',
        hasExercise: true, exerciseId: 'ex-cell-types-1'
      }
    ],
    'bio-unit-2': [
      {
        id: 'bio-l4',
        unitId: 'bio-unit-2',
        title: 'Mitosis – Cell Division',
        description: 'Follow a cell through the four stages of mitosis to produce two identical daughter cells',
        order: 1, type: 'video', duration: 10,
        videoUrl: 'https://www.youtube.com/embed/L0k-setFQMY',
        youtubeId: 'L0k-setFQMY',
        transcript: 'Mitosis produces two genetically identical daughter cells from one parent cell. Stages: Prophase (chromosomes condense), Metaphase (line up at centre), Anaphase (pulled apart), Telophase (new nuclei form). Followed by cytokinesis to split the cytoplasm.',
        hasExercise: true, exerciseId: 'ex-mitosis-1'
      },
      {
        id: 'bio-l5',
        unitId: 'bio-unit-2',
        title: 'DNA Structure & Replication',
        description: 'Discover the double-helix structure of DNA and how it copies itself',
        order: 2, type: 'video', duration: 11,
        videoUrl: 'https://www.youtube.com/embed/o_-6JXLYS-k',
        youtubeId: 'o_-6JXLYS-k',
        transcript: 'DNA is a double helix made of nucleotides (sugar + phosphate + base). Base pairing: A–T and G–C. During replication, the helix unzips and each strand acts as a template for a new complementary strand (semi-conservative replication).',
        hasExercise: true, exerciseId: 'ex-dna-1'
      },
      {
        id: 'bio-l6',
        unitId: 'bio-unit-2',
        title: 'Protein Synthesis – Transcription & Translation',
        description: 'Trace the path from DNA → mRNA → protein',
        order: 3, type: 'video', duration: 12,
        videoUrl: 'https://www.youtube.com/embed/2zAGAmTkZNY',
        youtubeId: '2zAGAmTkZNY',
        transcript: 'Transcription: DNA is read and a complementary mRNA strand is made in the nucleus. Translation: the mRNA travels to a ribosome where tRNA brings amino acids matching each codon, building a protein chain.',
        hasExercise: true, exerciseId: 'ex-protein-synth-1'
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
