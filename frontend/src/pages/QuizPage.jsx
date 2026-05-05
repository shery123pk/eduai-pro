import { useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const sidebarLinks = [
  { path: '/student', label: 'Home', icon: '🏠' },
  { path: '/student/courses', label: 'Courses', icon: '📚' },
  { path: '/student/mastery-coach', label: 'Mastery Coach', icon: '🧠' },
  { path: '/student/tools', label: 'AI Tools', icon: '🛠️' },
  { path: '/student/practice', label: 'AI Practice', icon: '🤖' },
  { path: '/student/chat', label: 'AI Chat', icon: '💬' },
  { path: '/student/homework', label: 'Homework', icon: '📝' },
  { path: '/student/quiz', label: 'Quizzes', icon: '📊' },
  { path: '/student/gamification', label: 'Achievements', icon: '🏆' },
  { path: '/student/videos', label: 'Videos', icon: '🎬' },
];

const subjects = [
  { label: 'Mathematics', icon: '📐', value: 'Mathematics' },
  { label: 'Physics',     icon: '⚡', value: 'Physics' },
  { label: 'Chemistry',   icon: '🧪', value: 'Chemistry' },
  { label: 'Biology',     icon: '🌿', value: 'Biology' },
  { label: 'English',     icon: '📖', value: 'English' },
  { label: 'General',     icon: '🎯', value: 'General' },
];

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

function parseQuizJSON(text) {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
  } catch {}
  return null;
}

const DEMO_QUESTIONS = {
  Mathematics: [
    { id:1, question:'What is the result of 2 + 3 × 4 using BODMAS?', options:['14','20','24','10'], correct:0, explanation:'BODMAS: Multiplication before Addition. 3 × 4 = 12, then 2 + 12 = 14.' },
    { id:2, question:'Evaluate: 8 + 4 × 2', options:['24','16','14','12'], correct:1, explanation:'Multiply first: 4 × 2 = 8, then add: 8 + 8 = 16.' },
    { id:3, question:'Solve: 2x + 6 = 18. What is x?', options:['4','5','6','7'], correct:2, explanation:'2x = 18 − 6 = 12, so x = 6.' },
    { id:4, question:'What is 15% of 200?', options:['25','30','35','20'], correct:1, explanation:'15% of 200 = 0.15 × 200 = 30.' },
    { id:5, question:'What is the Pythagorean theorem?', options:['a²+b²=c²','a+b=c','a²−b²=c','2a+b=c²'], correct:0, explanation:'The Pythagorean theorem states a² + b² = c² for right triangles.' },
  ],
  Physics: [
    { id:1, question:'What is the unit of force?', options:['Newton','Joule','Watt','Pascal'], correct:0, explanation:'Force is measured in Newtons (N) in the SI system.' },
    { id:2, question:'What is the speed of light in a vacuum?', options:['3×10⁸ m/s','3×10⁶ m/s','3×10¹⁰ m/s','1×10⁸ m/s'], correct:0, explanation:'The speed of light is approximately 3×10⁸ m/s.' },
    { id:3, question:'Which law states F = ma?', options:["Newton's 2nd Law","Newton's 1st Law","Newton's 3rd Law",'Ohm\'s Law'], correct:0, explanation:'F = ma is Newton\'s Second Law of Motion.' },
    { id:4, question:'What is the SI unit of energy?', options:['Joule','Watt','Newton','Volt'], correct:0, explanation:'Energy is measured in Joules (J).' },
    { id:5, question:'What type of wave is sound?', options:['Longitudinal','Transverse','Electromagnetic','Surface'], correct:0, explanation:'Sound is a longitudinal (compression) wave.' },
  ],
  Chemistry: [
    { id:1, question:'What is the chemical symbol for Gold?', options:['Au','Go','Gd','Ag'], correct:0, explanation:'Gold\'s symbol Au comes from the Latin "Aurum".' },
    { id:2, question:'How many elements are in the periodic table?', options:['118','110','108','120'], correct:0, explanation:'The periodic table currently has 118 confirmed elements.' },
    { id:3, question:'What is the pH of pure water?', options:['7','0','14','5'], correct:0, explanation:'Pure water is neutral with a pH of 7.' },
    { id:4, question:'What is the chemical formula of water?', options:['H₂O','HO₂','H₂O₂','OH'], correct:0, explanation:'Water is H₂O — two hydrogen atoms and one oxygen atom.' },
    { id:5, question:'What type of bond involves sharing electrons?', options:['Covalent','Ionic','Metallic','Hydrogen'], correct:0, explanation:'Covalent bonds form when atoms share electron pairs.' },
  ],
  Biology: [
    { id:1, question:'What is the powerhouse of the cell?', options:['Mitochondria','Nucleus','Ribosome','Golgi body'], correct:0, explanation:'Mitochondria produce ATP through cellular respiration.' },
    { id:2, question:'What is the basic unit of life?', options:['Cell','Atom','Molecule','Tissue'], correct:0, explanation:'The cell is the fundamental structural unit of all living organisms.' },
    { id:3, question:'Which molecule carries genetic information?', options:['DNA','RNA','Protein','Lipid'], correct:0, explanation:'DNA (deoxyribonucleic acid) stores genetic information.' },
    { id:4, question:'How many chromosomes do humans have?', options:['46','23','92','48'], correct:0, explanation:'Humans have 46 chromosomes (23 pairs) in each somatic cell.' },
    { id:5, question:'What process do plants use to make food?', options:['Photosynthesis','Respiration','Digestion','Fermentation'], correct:0, explanation:'Photosynthesis converts light, CO₂, and water into glucose.' },
  ],
  English: [
    { id:1, question:'Which is a correct definition of a noun?', options:['A person, place, or thing','An action word','A describing word','A connecting word'], correct:0, explanation:'Nouns name people, places, things, or ideas.' },
    { id:2, question:'What is a synonym for "happy"?', options:['Joyful','Sad','Angry','Tired'], correct:0, explanation:'"Joyful" and "happy" share the same meaning — they are synonyms.' },
    { id:3, question:'Which sentence uses the correct form of "their/there/they\'re"?', options:['"They\'re going to the park"','"Their going to the park"','"There going to the park"','"Theyre going to the park"'], correct:0, explanation:'"They\'re" is the contraction of "they are".' },
    { id:4, question:'What is the past tense of "run"?', options:['Ran','Runned','Run','Ranned'], correct:0, explanation:'"Run" is an irregular verb; its past tense is "ran".' },
    { id:5, question:'What figure of speech is "The wind whispered"?', options:['Personification','Simile','Metaphor','Alliteration'], correct:0, explanation:'Giving the wind a human action (whispering) is personification.' },
  ],
  General: [
    { id:1, question:'What is the capital of Pakistan?', options:['Islamabad','Karachi','Lahore','Peshawar'], correct:0, explanation:'Islamabad became Pakistan\'s capital in 1966.' },
    { id:2, question:'How many continents are there on Earth?', options:['7','6','5','8'], correct:0, explanation:'Earth has 7 continents: Africa, Antarctica, Asia, Australia, Europe, North America, South America.' },
    { id:3, question:'What is the largest ocean on Earth?', options:['Pacific','Atlantic','Indian','Arctic'], correct:0, explanation:'The Pacific Ocean is the largest, covering about 165 million km².' },
    { id:4, question:'Who invented the telephone?', options:['Alexander Graham Bell','Thomas Edison','Nikola Tesla','James Watt'], correct:0, explanation:'Alexander Graham Bell is credited with inventing the telephone in 1876.' },
    { id:5, question:'In what year did Pakistan gain independence?', options:['1947','1948','1945','1950'], correct:0, explanation:'Pakistan gained independence on 14 August 1947.' },
  ],
};

function getDemoQuiz(subject, numQ) {
  const pool = DEMO_QUESTIONS[subject] || DEMO_QUESTIONS.General;
  return { questions: pool.slice(0, Math.min(numQ, pool.length)) };
}

export default function QuizPage() {
  const [mode, setMode] = useState('setup'); // setup | quiz | result
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [numQ, setNumQ] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) { toast.error('Please select an image'); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const generateQuiz = async () => {
    if (!topic.trim() && !imageFile) {
      toast.error('Please upload a photo OR enter a topic');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const topicText = topic.trim() || (imageFile ? `${subject} topic from the uploaded image` : subject);

      const prompt = `Generate exactly ${numQ} multiple-choice quiz questions about "${topicText}" for ${subject} subject.

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "id": 1,
      "question": "Clear question text here?",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "correct": 0,
      "explanation": "Brief explanation of why the correct answer is right"
    }
  ]
}

Rules:
- "correct" is the index (0,1,2,3) of the correct option in the options array
- Make questions educational and accurate for ${subject}
- Options should be plausible but only one correct
- Include explanation for each answer`;

      const res = await axios.post(`${API_URL}/api/tutor/ask`, {
        question: prompt,
        subject: subject,
        systemPrompt: 'You are an expert quiz creator. Always respond with valid JSON only. No extra text.'
      }, { headers: { Authorization: `Bearer ${token}` } });

      const text = res.data.answer || res.data.response || res.data.message || '';
      const parsed = parseQuizJSON(text);

      if (parsed?.questions?.length > 0) {
        setQuestions(parsed.questions);
        setAnswers({});
        setSubmitted(false);
        setScore(0);
        setMode('quiz');
        toast.success(`${parsed.questions.length} questions generated!`);
      } else {
        // AI unavailable — load demo questions for this subject
        const demo = getDemoQuiz(subject, numQ);
        setQuestions(demo.questions);
        setAnswers({});
        setSubmitted(false);
        setScore(0);
        setMode('quiz');
        toast.success(`${demo.questions.length} sample questions loaded!`);
      }
    } catch {
      // Network error — still load demo questions
      const demo = getDemoQuiz(subject, numQ);
      setQuestions(demo.questions);
      setAnswers({});
      setSubmitted(false);
      setScore(0);
      setMode('quiz');
      toast.success(`${demo.questions.length} sample questions loaded!`);
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (qIdx, optIdx) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const submitQuiz = async () => {
    if (Object.keys(answers).length < questions.length) {
      toast.error(`Please answer all ${questions.length} questions first`);
      return;
    }

    setVerifying(true);
    const token = localStorage.getItem('token');

    // Build list of question + selected answer text pairs
    const pairs = questions.map((q, i) => ({
      id: i,
      question: q.question,
      options: q.options,
      selected: q.options[answers[i]] ?? ''
    }));

    const verifyPrompt = `You are a strict answer checker. For each item below, decide if the selected option is correct.
Return ONLY a valid JSON array — no markdown, no extra text:
[{"id":0,"isCorrect":true,"correctAnswer":"exact text of correct option","explanation":"one sentence why"}]

Items:
${JSON.stringify(pairs)}`;

    try {
      const res = await axios.post(`${API_URL}/api/tutor/ask`, {
        question: verifyPrompt,
        subject,
        systemPrompt: 'You are an answer verification engine. Respond with ONLY a valid JSON array. No markdown.'
      }, { headers: { Authorization: `Bearer ${token}` } });

      const text = res.data.answer || '';
      const match = text.match(/\[[\s\S]*\]/);

      if (match) {
        const results = JSON.parse(match[0]);
        let correctCount = 0;
        const verified = questions.map((q, i) => {
          const r = results.find(x => x.id === i);
          const isCorrect = r?.isCorrect ?? (answers[i] === q.correct);
          if (isCorrect) correctCount++;
          return {
            ...q,
            aiVerified: !!r,
            aiCorrect: isCorrect,
            aiCorrectAnswer: r?.correctAnswer ?? q.options[q.correct],
            explanation: r?.explanation || q.explanation
          };
        });
        setQuestions(verified);
        setScore(Math.round((correctCount / questions.length) * 100));
        setSubmitted(true);
        setMode('result');
        return;
      }
    } catch { /* fall through to index fallback */ }

    // Fallback: index comparison when AI is unavailable
    let correct = 0;
    questions.forEach((q, i) => { if (answers[i] === q.correct) correct++; });
    setScore(Math.round((correct / questions.length) * 100));
    setSubmitted(true);
    setMode('result');
    setVerifying(false);
  };

  const resetQuiz = () => {
    setMode('setup');
    setQuestions([]);
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setVerifying(false);
    setTopic('');
    setImageFile(null);
    setImagePreview('');
  };

  // RESULT VIEW
  if (mode === 'result') {
    const correct = questions.filter((q, i) => q.aiVerified ? q.aiCorrect : answers[i] === q.correct).length;
    return (
      <div className="min-h-screen bg-ultra-modern">
        <Navbar />
        <div className="flex">
          <Sidebar links={sidebarLinks} />
          <main className="flex-1 p-5 md:p-8 overflow-auto">
            <div className="max-w-3xl mx-auto space-y-5">

              {/* Score card */}
              <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 text-center shadow-sm">
                <div className="text-6xl mb-4">{score >= 80 ? '🏆' : score >= 60 ? '⭐' : '📚'}</div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">Quiz Complete!</h2>
                <div className="text-7xl font-black mt-4 mb-2"
                  style={{ color: score >= 80 ? '#16a34a' : score >= 60 ? '#d97706' : '#dc2626' }}>
                  {score}%
                </div>
                <p className="text-slate-500 font-bold text-lg">{correct} out of {questions.length} correct</p>
                <div className="flex gap-3 justify-center mt-6">
                  <button onClick={resetQuiz}
                    className="px-8 py-3 rounded-2xl font-black text-white text-base shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #1d4ed8, #4338ca)' }}>
                    Try New Quiz
                  </button>
                  <button onClick={() => { setSubmitted(true); setMode('quiz'); }}
                    className="px-8 py-3 rounded-2xl font-black text-slate-700 text-base border-2 border-slate-200 bg-white hover:border-indigo-300 transition-all">
                    Review Answers
                  </button>
                </div>
              </div>

              {/* Q&A review */}
              {questions.map((q, i) => {
                const isCorrect = q.aiVerified ? q.aiCorrect : answers[i] === q.correct;
                const correctAnswerText = q.aiCorrectAnswer ?? q.options[q.correct];
                return (
                  <div key={i} className={`bg-white border-2 rounded-2xl p-5 shadow-sm ${isCorrect ? 'border-green-300' : 'border-red-300'}`}>
                    <div className="flex gap-3 mb-4">
                      <span className="text-2xl">{isCorrect ? '✅' : '❌'}</span>
                      <div className="flex-1">
                        <h3 className="text-lg font-black text-slate-900">Q{i+1}: {q.question}</h3>
                        {q.aiVerified && (
                          <span className="text-xs font-bold text-indigo-500 mt-0.5 inline-block">AI-verified</span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      {q.options.map((opt, oi) => {
                        const isRight = opt === correctAnswerText;
                        const isSelected = answers[i] === oi;
                        return (
                          <div key={oi} className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 font-bold text-base ${
                            isRight ? 'bg-green-50 border-green-400 text-green-800'
                            : isSelected && !isRight ? 'bg-red-50 border-red-300 text-red-700'
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                          }`}>
                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${
                              isRight ? 'bg-green-500 text-white'
                              : isSelected ? 'bg-red-400 text-white'
                              : 'bg-slate-200 text-slate-500'
                            }`}>{OPTION_LABELS[oi]}</span>
                            <span className="flex-1">{opt}</span>
                            {isRight && <span className="text-green-600 font-black text-sm">✓ Correct</span>}
                          </div>
                        );
                      })}
                    </div>
                    {q.explanation && (
                      <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3">
                        <span className="text-xs font-black text-indigo-600 uppercase tracking-wide">Explanation: </span>
                        <span className="text-sm font-medium text-slate-700">{q.explanation}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // QUIZ VIEW
  if (mode === 'quiz') {
    return (
      <div className="min-h-screen bg-ultra-modern">
        <Navbar />
        <div className="flex">
          <Sidebar links={sidebarLinks} />
          <main className="flex-1 p-5 md:p-8 overflow-auto">
            <div className="max-w-3xl mx-auto space-y-4">

              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-black text-slate-900">📊 Quiz — {subject}</h1>
                <button onClick={resetQuiz} className="text-sm font-bold text-slate-500 hover:text-red-600 transition-colors">
                  ✕ New Quiz
                </button>
              </div>

              {/* Progress bar */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between text-sm font-bold text-slate-600 mb-2">
                  <span>{Object.keys(answers).length} / {questions.length} answered</span>
                  <span>{Math.round((Object.keys(answers).length / questions.length) * 100)}% done</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%`, background: 'linear-gradient(90deg, #1d4ed8, #4338ca)' }} />
                </div>
              </div>

              {/* All questions */}
              {questions.map((q, i) => (
                <div key={i} className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-lg font-black text-slate-900 mb-4">Q{i+1}. {q.question}</h3>
                  <div className="space-y-3">
                    {q.options.map((opt, oi) => (
                      <button key={oi} onClick={() => selectAnswer(i, oi)}
                        className={`w-full text-left flex items-center gap-3 px-5 py-4 rounded-xl border-2 font-bold text-base transition-all ${
                          answers[i] === oi
                            ? 'border-indigo-500 text-white shadow-md'
                            : 'border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 bg-slate-50'
                        }`}
                        style={answers[i] === oi ? { background: 'linear-gradient(135deg, #1d4ed8, #4338ca)' } : {}}>
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${
                          answers[i] === oi ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>{OPTION_LABELS[oi]}</span>
                        <span>{opt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Submit */}
              <button onClick={submitQuiz} disabled={verifying}
                className="w-full py-5 rounded-2xl font-black text-white text-xl shadow-xl transition-all disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #059669, #047857)', boxShadow: '0 8px 25px rgba(5,150,105,0.4)' }}>
                {verifying
                  ? '🤖 AI is checking your answers…'
                  : `✅ Submit Quiz (${Object.keys(answers).length}/${questions.length} answered)`}
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // SETUP VIEW
  return (
    <div className="min-h-screen bg-ultra-modern">
      <Navbar />
      <div className="flex">
        <Sidebar links={sidebarLinks} />
        <main className="flex-1 p-5 md:p-8 overflow-auto">
          <div className="max-w-3xl mx-auto space-y-5">

            <div>
              <h1 className="text-3xl font-black text-slate-900">📊 AI Quiz Generator</h1>
              <p className="text-slate-500 font-medium mt-1">Upload a photo OR type a topic — AI will generate quiz with highlighted correct answers</p>
            </div>

            {/* Photo upload */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-6 pt-5 pb-3 border-b border-slate-100">
                <h3 className="text-xl font-black text-slate-900">📷 Upload Photo (Optional)</h3>
                <p className="text-slate-500 font-medium mt-0.5">Upload a page, diagram, or photo to generate quiz from it</p>
              </div>
              <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                className={`m-5 border-2 border-dashed rounded-2xl transition-all cursor-pointer ${
                  dragActive ? 'border-indigo-400 bg-indigo-50' : 'border-slate-300 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/50'
                }`} style={{ minHeight: '180px' }}>
                {imagePreview ? (
                  <div className="p-4 flex flex-col items-center">
                    <img src={imagePreview} alt="Preview" className="max-h-52 w-auto rounded-xl shadow object-contain" />
                    <button onClick={() => { setImageFile(null); setImagePreview(''); }}
                      className="mt-3 px-4 py-2 bg-red-50 text-red-600 border border-red-200 font-bold text-sm rounded-xl">
                      ✕ Remove
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-full py-10 cursor-pointer">
                    <span className="text-5xl mb-3">📷</span>
                    <p className="font-black text-slate-600 mb-1">Drag & drop a photo here</p>
                    <p className="text-slate-400 text-sm mb-4 font-medium">or click to browse</p>
                    <div className="px-6 py-2.5 rounded-xl font-black text-white text-sm"
                      style={{ background: 'linear-gradient(135deg, #1d4ed8, #4338ca)' }}>
                      Choose Photo
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
                  </label>
                )}
              </div>
            </div>

            {/* Topic & settings */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-xl font-black text-slate-900">⚙️ Quiz Settings</h3>

              <div>
                <label className="block text-base font-black text-slate-700 mb-2">Topic / Chapter Name</label>
                <input value={topic} onChange={e => setTopic(e.target.value)}
                  placeholder="e.g. Photosynthesis, Newton's Laws, Fractions, WW2..."
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-medium text-base placeholder-slate-400 focus:outline-none focus:border-indigo-400 transition-all" />
              </div>

              <div>
                <label className="block text-base font-black text-slate-700 mb-3">Subject</label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {subjects.map(s => (
                    <button key={s.value} onClick={() => setSubject(s.value)}
                      className={`py-3 px-2 rounded-xl font-black text-sm transition-all flex flex-col items-center gap-1.5 ${
                        subject === s.value ? 'text-white shadow-md' : 'bg-slate-50 border-2 border-slate-200 text-slate-600 hover:border-blue-400'
                      }`}
                      style={subject === s.value ? { background: 'linear-gradient(135deg, #1d4ed8, #4338ca)', border: 'none' } : {}}>
                      <span className="text-2xl">{s.icon}</span>
                      <span className="text-xs">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-base font-black text-slate-700 mb-2">Number of Questions</label>
                <div className="flex gap-2">
                  {[3, 5, 7, 10].map(n => (
                    <button key={n} onClick={() => setNumQ(n)}
                      className={`px-5 py-2.5 rounded-xl font-black text-base transition-all ${
                        numQ === n ? 'text-white shadow-md' : 'bg-slate-50 border-2 border-slate-200 text-slate-600 hover:border-blue-400'
                      }`}
                      style={numQ === n ? { background: 'linear-gradient(135deg, #1d4ed8, #4338ca)' } : {}}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate button */}
            <button onClick={generateQuiz} disabled={loading || (!topic.trim() && !imageFile)}
              className="w-full py-5 rounded-2xl font-black text-xl shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #4338ca 100%)', color: 'white', boxShadow: '0 8px 25px rgba(29,78,216,0.4)' }}>
              {loading ? (<><LoadingSpinner size="sm" /><span>Generating Quiz...</span></>) : (<><span className="text-2xl">⚡</span><span>Generate Quiz with AI</span></>)}
            </button>

          </div>
        </main>
      </div>
    </div>
  );
}
