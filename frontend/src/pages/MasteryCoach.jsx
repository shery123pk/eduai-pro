import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const BLOOM_LEVELS = [
  { id: 1, name: 'Remember', desc: 'Recall facts and basic concepts', color: '#6b7280', bg: '#1f2937', border: '#374151', example: 'Define, List, Name, Identify' },
  { id: 2, name: 'Understand', desc: 'Explain ideas or concepts', color: '#16a34a', bg: '#14532d', border: '#15803d', example: 'Explain, Summarize, Classify' },
  { id: 3, name: 'Apply', desc: 'Use information in new situations', color: '#2563eb', bg: '#1e3a8a', border: '#1d4ed8', example: 'Solve, Use, Demonstrate' },
  { id: 4, name: 'Analyze', desc: 'Draw connections among ideas', color: '#7c3aed', bg: '#312e81', border: '#6d28d9', example: 'Compare, Contrast, Examine' },
  { id: 5, name: 'Evaluate', desc: 'Justify a decision or course of action', color: '#dc2626', bg: '#7f1d1d', border: '#b91c1c', example: 'Judge, Argue, Critique' }
];

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

const QUESTIONS_PER_LEVEL = 5;

export default function MasteryCoach() {
  const [phase, setPhase] = useState('setup'); // setup | playing | badge
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [grade, setGrade] = useState('Grade 9');
  const [currentLevel, setCurrentLevel] = useState(0); // 0-4 (Bloom levels)
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [levelResults, setLevelResults] = useState(Array(5).fill(null)); // null | 'passed' | 'failed'
  const [score, setScore] = useState(0);

  const generateLevelQuestions = async (levelIndex) => {
    setLoading(true);
    const bloom = BLOOM_LEVELS[levelIndex];
    const prompt = `Generate exactly ${QUESTIONS_PER_LEVEL} multiple-choice questions about "${topic}" for ${subject}, ${grade}.

These questions must test Bloom's Taxonomy level: "${bloom.name}" - ${bloom.desc}

Return ONLY valid JSON:
{
  "questions": [
    {
      "id": "q1",
      "question": "...",
      "options": ["A. option", "B. option", "C. option", "D. option"],
      "correct": "A. option",
      "feedback": "Explanation of WHY this answer is correct and what the concept means"
    }
  ]
}

Rules:
- Questions must match exactly the "${bloom.name}" cognitive level
- Options MUST start with "A.", "B.", "C.", "D."
- feedback must be educational and help the student understand the concept
- Make questions unique and thought-provoking
- No trivial or trick questions`;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/api/exercises/generate`, {
        topic: `${topic} - Bloom Level: ${bloom.name}`,
        subject, difficulty: levelIndex < 2 ? 'easy' : levelIndex < 4 ? 'medium' : 'hard',
        numQuestions: QUESTIONS_PER_LEVEL,
        _rawPrompt: prompt
      }, { headers: { Authorization: `Bearer ${token}` } });

      const qs = res.data.exercise?.questions || [];
      setQuestions(qs);
      setCurrentQ(0);
      setSelectedAnswer(null);
      setAnswered(false);
      setScore(0);
    } catch (err) {
      toast.error('Failed to generate questions. Check your API key.');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    if (!topic.trim()) { toast.error('Enter a topic'); return; }
    setCurrentLevel(0);
    setLevelResults(Array(5).fill(null));
    setPhase('playing');
    await generateLevelQuestions(0);
  };

  const handleAnswer = (option) => {
    if (answered) return;
    const q = questions[currentQ];
    const correct = option === q.correct;
    setSelectedAnswer(option);
    setAnswered(true);
    setIsCorrect(correct);
    setFeedback(q.explanation || q.feedback || 'Great attempt! Review the concept and try again.');
    if (correct) setScore(s => s + 1);
  };

  const handleNext = async () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(q => q + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      setIsCorrect(false);
      setFeedback('');
    } else {
      // Level complete
      const passed = score + (isCorrect ? 1 : 0) >= Math.ceil(QUESTIONS_PER_LEVEL * 0.6);
      const newResults = [...levelResults];
      newResults[currentLevel] = passed ? 'passed' : 'failed';
      setLevelResults(newResults);

      if (passed && currentLevel < 4) {
        toast.success(`Level ${currentLevel + 1} passed! Moving to ${BLOOM_LEVELS[currentLevel + 1].name}`);
        const nextLevel = currentLevel + 1;
        setCurrentLevel(nextLevel);
        await generateLevelQuestions(nextLevel);
      } else if (passed && currentLevel === 4) {
        setPhase('badge');
      } else {
        toast.error('Score below 60%. Try this level again with new questions!');
        await generateLevelQuestions(currentLevel);
        setScore(0);
      }
    }
  };

  const bloom = BLOOM_LEVELS[currentLevel];

  // ---- SETUP SCREEN ----
  if (phase === 'setup') {
    return (
      <div className="min-h-screen bg-ultra-modern">
        <Navbar />
        <div className="flex">
          <Sidebar links={sidebarLinks} />
          <main className="flex-1 p-6 md:p-8">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="animate-slide-in">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center text-xl">🧠</div>
                  <h1 className="text-3xl font-bold text-slate-800">Concept Mastery Coach</h1>
                </div>
                <p className="text-slate-400 ml-13">Master any topic through Bloom's Taxonomy — 5 progressive levels of thinking</p>
              </div>

              {/* Bloom's Levels Preview */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Your Learning Journey</h2>
                <div className="space-y-2">
                  {BLOOM_LEVELS.map((level, idx) => (
                    <div key={level.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: level.bg, borderLeft: `3px solid ${level.border}` }}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ backgroundColor: level.color }}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-white text-sm">{level.name}</span>
                        <span className="text-slate-400 text-xs ml-2">— {level.desc}</span>
                      </div>
                      <span className="text-xs text-slate-500 hidden md:block">{level.example}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-3">Pass each level (60%+) to advance. New questions generated on every retry.</p>
              </div>

              {/* Setup Form */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-lg font-semibold text-slate-800">Start Your Session</h2>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Topic *</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleStart()}
                    placeholder="e.g. Photosynthesis, Quadratic equations, World War II..."
                    className="w-full px-4 py-2.5 rounded-lg bg-white border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Subject</label>
                    <select
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-white border-2 border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-400 text-sm"
                    >
                      {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'English', 'Computer Science'].map(s => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Grade</label>
                    <select
                      value={grade}
                      onChange={e => setGrade(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-white border-2 border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-400 text-sm"
                    >
                      {['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'University'].map(g => (
                        <option key={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleStart}
                  disabled={!topic.trim()}
                  className="w-full py-3 rounded-lg font-semibold text-white text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: topic.trim() ? '#7c3aed' : undefined }}
                >
                  Begin Mastery Journey →
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ---- BADGE / COMPLETION SCREEN ----
  if (phase === 'badge') {
    return (
      <div className="min-h-screen bg-ultra-modern">
        <Navbar />
        <div className="flex">
          <Sidebar links={sidebarLinks} />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="max-w-lg w-full text-center space-y-6 animate-fade-scale">
              <div className="bg-white rounded-2xl p-10 border border-slate-200 shadow-sm">
                <div className="text-7xl mb-6">🏅</div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Mastery Badge Earned!</h1>
                <p className="text-slate-400 mb-2">You have mastered:</p>
                <div className="inline-block px-5 py-2 rounded-lg bg-purple-900 border border-purple-700 text-purple-200 font-bold text-lg mb-6">
                  {topic}
                </div>

                <div className="grid grid-cols-5 gap-2 mb-8">
                  {BLOOM_LEVELS.map((level, idx) => (
                    <div key={level.id} className="text-center">
                      <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center text-green-400 border-2 border-green-600 bg-green-900 mb-1">
                        ✓
                      </div>
                      <div className="text-xs text-slate-400">{level.name}</div>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-slate-500 mb-6">
                  All 5 Bloom's Taxonomy levels completed · {new Date().toLocaleDateString()}
                </div>

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => { setPhase('setup'); setTopic(''); }}
                    className="px-5 py-2.5 rounded-lg font-semibold text-white text-sm bg-purple-700 hover:bg-purple-600 transition-colors"
                  >
                    Master Another Topic
                  </button>
                  <Link to="/student" className="px-5 py-2.5 rounded-lg font-semibold text-slate-600 text-sm bg-slate-100 border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                    Back to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ---- PLAYING SCREEN ----
  const q = questions[currentQ];

  return (
    <div className="min-h-screen bg-ultra-modern">
      <Navbar />
      <div className="flex">
        <Sidebar links={sidebarLinks} />
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-3xl mx-auto space-y-4">

            {/* Level Progress Header */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Topic: {topic}</div>
                  <div className="text-sm font-semibold text-slate-700">
                    Level {currentLevel + 1} of 5 —
                    <span className="ml-1" style={{ color: bloom.color }}>{bloom.name}</span>
                  </div>
                  <div className="text-xs text-slate-500">{bloom.desc}</div>
                </div>
                <div className="text-right text-sm">
                  <div className="text-slate-800 font-bold">Q {currentQ + 1}/{questions.length}</div>
                  <div className="text-slate-500">Score: {score}/{currentQ}</div>
                </div>
              </div>

              {/* Level dots */}
              <div className="flex items-center gap-2">
                {BLOOM_LEVELS.map((level, idx) => (
                  <div key={level.id} className="flex items-center gap-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                      idx < currentLevel
                        ? 'bg-green-700 border-green-600 text-green-200'
                        : idx === currentLevel
                        ? 'border-2 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`} style={idx === currentLevel ? { backgroundColor: bloom.bg, borderColor: bloom.border, color: bloom.color } : {}}>
                      {idx < currentLevel ? '✓' : idx + 1}
                    </div>
                    {idx < 4 && <div className={`h-0.5 w-6 rounded ${idx < currentLevel ? 'bg-green-500' : 'bg-slate-300'}`} />}
                  </div>
                ))}
              </div>

              {/* Q progress bar */}
              <div className="mt-3 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${((currentQ) / questions.length) * 100}%`, backgroundColor: bloom.color }}
                />
              </div>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="bg-white rounded-xl p-16 border border-slate-200 shadow-sm text-center">
                <div className="loader-modern mx-auto mb-4"></div>
                <p className="text-slate-400 text-sm">Generating {bloom.name} questions with AI...</p>
              </div>
            ) : q ? (
              <>
                {/* Question Card */}
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm animate-fade-scale"
                  style={{ borderLeft: `4px solid ${bloom.border}` }}>
                  <div className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: bloom.color }}>
                    {bloom.name} — Question {currentQ + 1}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 leading-relaxed mb-6">
                    {q.question}
                  </h3>

                  {/* Options */}
                  <div className="space-y-3">
                    {q.options.map((option, idx) => {
                      let style = 'bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50';
                      if (answered) {
                        if (option === q.correct) {
                          style = 'bg-green-900 border-green-600 text-green-200';
                        } else if (option === selectedAnswer && option !== q.correct) {
                          style = 'bg-red-900 border-red-600 text-red-200';
                        } else {
                          style = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                        }
                      } else if (option === selectedAnswer) {
                        style = 'border-2 text-white';
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleAnswer(option)}
                          disabled={answered}
                          className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-all ${style} disabled:cursor-default`}
                          style={!answered && option === selectedAnswer ? { borderColor: bloom.color, backgroundColor: bloom.bg } : {}}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Feedback */}
                {answered && (
                  <div className={`rounded-xl p-5 border animate-slide-in ${
                    isCorrect ? 'bg-green-900 border-green-700' : 'bg-red-900 border-red-700'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className="text-xl flex-shrink-0">{isCorrect ? '✅' : '❌'}</div>
                      <div>
                        <div className={`font-semibold mb-1 ${isCorrect ? 'text-green-300' : 'text-red-300'}`}>
                          {isCorrect ? 'Correct!' : `Incorrect. The answer was: ${q.correct}`}
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">
                          {feedback || q.explanation || q.feedback}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleNext}
                      className="mt-4 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
                      style={{ backgroundColor: bloom.color }}
                    >
                      {currentQ < questions.length - 1 ? 'Next Question →' : 'Complete Level →'}
                    </button>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
