// Homework solver API routes
import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { analyzeImage } from '../lib/openai.js';
import { query } from '../lib/neon.js';

const router = express.Router();

// Configure multer for image upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Solve homework from image
router.post('/solve', authenticateToken, upload.single('image'), asyncHandler(async (req, res) => {
  const { subject = 'general', language = 'english' } = req.body;
  const studentId = req.user.id;

  if (!req.file) {
    return res.status(400).json({ error: 'Image file is required' });
  }

  // Convert image to base64
  const imageBase64 = req.file.buffer.toString('base64');

  // Create prompt based on subject and language
  const prompts = {
    english: {
      mathematics: `You are an expert Mathematics teacher. Analyze this homework problem and:
1. First, clearly state what the question is asking
2. Solve it step-by-step with detailed explanations for each step
3. Show all work and calculations
4. Provide the final answer
5. If it involves formulas, show them clearly

Format your response as:
**Question:** [state the problem]

**Solution:**
Step 1: [explanation]
Step 2: [explanation]
...

**Final Answer:** [answer]`,
      physics: `You are an expert Physics teacher. Analyze this homework problem and:
1. Identify what physics concept is being tested
2. List the given information
3. Solve step-by-step with clear explanations
4. Show formulas and calculations
5. Include units in your answer

Format your response clearly with numbered steps.`,
      chemistry: `You are an expert Chemistry teacher. Analyze this homework problem and:
1. Identify the chemical concept
2. Solve step-by-step with explanations
3. Show chemical equations if applicable
4. Provide the final answer with proper notation`,
      english: `You are an expert English teacher. Analyze this homework and:
1. Identify what is being asked (grammar, writing, comprehension, etc.)
2. Provide the correct answer with detailed explanation
3. If it's a writing task, give an example response
4. Explain why this is the correct approach`,
      general: `You are an expert teacher. Analyze this homework problem and:
1. Identify the subject and what's being asked
2. Provide a clear, step-by-step solution
3. Explain your reasoning
4. Give the final answer`
    },
    urdu: {
      mathematics: `آپ ریاضی کے ماہر استاد ہیں۔ اس ہوم ورک کا تجزیہ کریں اور:
1. پہلے واضح کریں کہ سوال میں کیا پوچھا جا رہا ہے
2. قدم بہ قدم تفصیلی وضاحت کے ساتھ حل کریں
3. تمام کام اور حسابات دکھائیں
4. حتمی جواب فراہم کریں

اپنا جواب اس ترتیب میں دیں:
**سوال:** [مسئلہ بیان کریں]

**حل:**
قدم 1: [وضاحت]
قدم 2: [وضاحت]
...

**حتمی جواب:** [جواب]`,
      physics: `آپ طبیعیات کے ماہر استاد ہیں۔ اس مسئلے کو حل کریں اور قدم بہ قدم وضاحت دیں۔`,
      chemistry: `آپ کیمسٹری کے ماہر استاد ہیں۔ اس مسئلے کو حل کریں اور قدم بہ قدم وضاحت دیں۔`,
      english: `آپ انگریزی کے ماہر استاد ہیں۔ اس ہوم ورک کا تجزیہ کریں اور تفصیلی جواب دیں۔`,
      general: `آپ ماہر استاد ہیں۔ اس ہوم ورک کو حل کریں اور قدم بہ قدم وضاحت دیں۔`
    }
  };

  const prompt = prompts[language]?.[subject.toLowerCase()] || prompts[language]?.general || prompts.english.general;

  // Analyze image with OpenAI Vision
  const solution = await analyzeImage(imageBase64, prompt);

  // Save to database
  await query(
    `INSERT INTO homework_submissions (student_id, subject, ai_solution, created_at)
     VALUES ($1, $2, $3, NOW())`,
    [studentId, subject, solution]
  );

  res.json({
    success: true,
    solution,
    subject
  });
}));

// Get homework history
router.get('/history', authenticateToken, asyncHandler(async (req, res) => {
  const studentId = req.user.id;

  const result = await query(
    `SELECT id, subject, question_detected, ai_solution, created_at
     FROM homework_submissions
     WHERE student_id = $1
     ORDER BY created_at DESC
     LIMIT 20`,
    [studentId]
  );

  res.json({ submissions: result.rows });
}));

export default router;
