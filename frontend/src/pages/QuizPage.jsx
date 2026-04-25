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
        toast.error('Could not generate quiz. Try a different topic.');
      }
    } catch {
      toast.error('Failed to generate quiz. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (qIdx, optIdx) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const submitQuiz = () => {
    if (Object.keys(answers).length < questions.length) {
      toast.error(`Please answer all ${questions.length} questions first`);
      return;
    }
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correct) correct++;
    });
    setScore(Math.round((correct / questions.length) * 100));
    setSubmitted(true);
    setMode('result');
  };

  const resetQuiz = () => {
    setMode('setup');
    setQuestions([]);
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setTopic('');
    setImageFile(null);
    setImagePreview('');
  };

  // RESULT VIEW
  if (mode === 'result') {
    const correct = questions.filter((q, i) => answers[i] === q.correct).length;
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
                const isCorrect = answers[i] === q.correct;
                return (
                  <div key={i} className={`bg-white border-2 rounded-2xl p-5 shadow-sm ${isCorrect ? 'border-green-300' : 'border-red-300'}`}>
                    <div className="flex gap-3 mb-4">
                      <span className="text-2xl">{isCorrect ? '✅' : '❌'}</span>
                      <h3 className="text-lg font-black text-slate-900">Q{i+1}: {q.question}</h3>
                    </div>
                    <div className="space-y-2 mb-4">
                      {q.options.map((opt, oi) => {
                        const isRight = oi === q.correct;
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
              <button onClick={submitQuiz}
                className="w-full py-5 rounded-2xl font-black text-white text-xl shadow-xl transition-all"
                style={{ background: 'linear-gradient(135deg, #059669, #047857)', boxShadow: '0 8px 25px rgba(5,150,105,0.4)' }}>
                ✅ Submit Quiz ({Object.keys(answers).length}/{questions.length} answered)
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
