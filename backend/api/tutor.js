// Smart Tutor API routes
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { generateChatCompletion } from '../lib/openai.js';
import { classifySubject } from '../lib/huggingface.js';

const router = express.Router();

// Ask tutor a question
router.post('/ask', authenticateToken, asyncHandler(async (req, res) => {
  const { subject, question, language = 'english' } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  // Auto-detect subject if not provided
  let detectedSubject = subject || 'general';
  if (!subject) {
    const classification = await classifySubject(question);
    detectedSubject = classification.subject;
  }

  const urduBase = `آپ صرف پاکستانی اردو استعمال کریں۔ ہندی یا ہندوستانی الفاظ سے مکمل پرہیز کریں۔ "خوش آمدید" کہیں نہ کہ "سواگت"، "براہ کرم" کہیں نہ کہ "کرپیا"، "بالکل" یا "ضرور" کہیں، "شکریہ" کہیں نہ کہ "دھنیہ واد"۔ ہر جواب مکمل پاکستانی اردو میں دیں۔\n\n`;

  // Create specialized prompts based on subject
  const systemPrompts = {
    mathematics: language === 'urdu'
      ? urduBase + `آپ ریاضی کے ماہر استاد ہیں۔ طالب علم کے سوال کا جواب دیں:
- قدم بہ قدم حل دکھائیں
- ہر قدم کی وضاحت کریں
- LaTeX استعمال کریں جہاں ضروری ہو
- حتمی جواب واضح طور پر دیں`
      : `You are an expert Mathematics tutor. Answer the student's question:
- Provide step-by-step solution
- Explain each step clearly
- Use LaTeX notation for mathematical expressions (wrap in $ or $$)
- Give the final answer clearly
- Include examples if helpful`,

    physics: language === 'urdu'
      ? urduBase + `آپ طبیعیات کے ماہر استاد ہیں۔ واضح وضاحت دیں اور حقیقی دنیا کی مثالیں استعمال کریں۔`
      : `You are an expert Physics tutor. Explain concepts clearly:
- Break down complex topics into simple terms
- Use real-world examples and analogies
- Show formulas and how to apply them
- Include diagrams descriptions when relevant`,

    chemistry: language === 'urdu'
      ? urduBase + `آپ کیمسٹری کے ماہر استاد ہیں۔ کیمیائی تصورات کو آسان بنائیں۔`
      : `You are an expert Chemistry tutor. Make chemistry accessible:
- Explain reactions and concepts clearly
- Show chemical equations properly
- Relate to everyday examples
- Highlight important patterns`,

    english: language === 'urdu'
      ? urduBase + `آپ انگریزی کے ماہر استاد ہیں۔ گرامر اور تحریر میں مدد کریں۔`
      : `You are an expert English tutor. Help with language skills:
- For grammar: explain the rule and give examples
- For writing: provide feedback and suggestions
- For vocabulary: give definitions and usage examples
- Highlight corrections in a clear format`,

    biology: language === 'urdu'
      ? urduBase + `آپ حیاتیات کے ماہر استاد ہیں۔ حیاتیاتی تصورات کو سمجھائیں۔`
      : `You are an expert Biology tutor. Explain biological concepts:
- Use clear terminology with explanations
- Relate to living systems
- Include processes and functions
- Make connections between concepts`,

    'computer science': language === 'urdu'
      ? urduBase + `آپ کمپیوٹر سائنس کے ماہر استاد ہیں۔ پروگرامنگ اور الگورتھم سمجھائیں۔`
      : `You are an expert Computer Science tutor. Teach programming and algorithms:
- Explain logic clearly
- Show code examples when relevant
- Break down complex algorithms
- Relate to practical applications`,

    general: language === 'urdu'
      ? urduBase + `آپ ایک مفید اور دوستانہ پاکستانی استاد ہیں۔ طالب علم کے سوال کا واضح جواب دیں۔`
      : `You are a helpful and friendly tutor. Answer the student's question clearly and thoroughly.`
  };

  const systemPrompt = req.body.systemPrompt || systemPrompts[detectedSubject] || systemPrompts.general;
  const maxTokens = req.body.systemPrompt ? 3000 : 1500;

  // Generate response
  const answer = await generateChatCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: question }
  ], {
    max_tokens: maxTokens,
    temperature: 0.7
  });

  res.json({
    answer,
    subject: detectedSubject,
    language
  });
}));

// Get tutor conversation history (optional feature)
router.get('/history', authenticateToken, asyncHandler(async (req, res) => {
  // This could be implemented to store tutor conversations
  // For now, return empty array
  res.json({ conversations: [] });
}));

export default router;
