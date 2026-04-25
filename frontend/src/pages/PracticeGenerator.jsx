import { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ExerciseInterface from '../components/ExerciseInterface';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const subjects    = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'English', 'Computer Science'];
const difficulties = ['easy', 'medium', 'hard'];

const popularTopics = [
  { topic: "Quadratic Equations", subject: "Mathematics",      icon: "📐" },
  { topic: "Newton's Laws",       subject: "Physics",          icon: "⚡" },
  { topic: "Photosynthesis",      subject: "Biology",          icon: "🌿" },
  { topic: "Chemical Bonding",    subject: "Chemistry",        icon: "🧪" },
  { topic: "World War II",        subject: "History",          icon: "🌍" },
  { topic: "Python Functions",    subject: "Computer Science", icon: "💻" },
  { topic: "Fractions",           subject: "Mathematics",      icon: "🔢" },
  { topic: "Cell Division",       subject: "Biology",          icon: "🧬" },
];

const sidebarLinks = [
  { path: '/student',              label: 'Home',          icon: '🏠' },
  { path: '/student/courses',      label: 'Courses',       icon: '📚' },
  { path: '/student/practice',     label: 'AI Practice',   icon: '🤖' },
  { path: '/student/chat',         label: 'AI Chat',       icon: '💬' },
  { path: '/student/homework',     label: 'Homework',      icon: '📝' },
  { path: '/student/tutor',        label: 'Smart Tutor',   icon: '🎯' },
  { path: '/student/quiz',         label: 'Quizzes',       icon: '📊' },
  { path: '/student/gamification', label: 'Achievements',  icon: '🏆' },
  { path: '/student/videos',       label: 'Videos',        icon: '🎬' },
];

const difficultyStyle = {
  easy:   'bg-green-100 text-green-700 border-green-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  hard:   'bg-red-100 text-red-700 border-red-200',
};

export default function PracticeGenerator() {
  const [topic,        setTopic]        = useState('');
  const [subject,      setSubject]      = useState('Mathematics');
  const [difficulty,   setDifficulty]   = useState('medium');
  const [numQuestions, setNumQuestions] = useState(4);
  const [generating,   setGenerating]   = useState(false);
  const [exercise,     setExercise]     = useState(null);
  const [score,        setScore]        = useState(null);

  const generateExercise = async (topicOverride) => {
    const finalTopic = topicOverride || topic;
    if (!finalTopic.trim()) { toast.error('Please enter a topic'); return; }

    setGenerating(true);
    setExercise(null);
    setScore(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/exercises/generate`,
        { topic: finalTopic, subject, difficulty, numQuestions },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExercise(response.data.exercise);
      if (topicOverride) setTopic(topicOverride);
      toast.success('Exercise generated! Start practicing!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to generate. Check backend connection.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-ultra-modern">
      <Navbar />
      <div className="flex">
        <Sidebar links={sidebarLinks} />
        <main className="flex-1 p-5 md:p-8 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6">

            {/* Header */}
            <div>
              <h1 className="text-3xl font-black text-slate-900">🤖 AI Practice Generator</h1>
              <p className="text-slate-500 font-medium mt-1">Generate personalized practice exercises on any topic, powered by GPT-4</p>
            </div>

            {/* Generator Form */}
            <div className="bg-white border-2 border-indigo-100 rounded-2xl p-6 shadow-sm space-y-5">
              <h2 className="text-xl font-black text-slate-900">Generate Your Practice Set</h2>

              {/* Topic Input */}
              <div>
                <label className="block text-sm font-black text-slate-700 mb-1.5">Topic *</label>
                <input
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && generateExercise()}
                  placeholder="e.g. Quadratic equations, Photosynthesis, Newton's Laws..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-400 transition-all placeholder:text-slate-400 text-base"
                />
              </div>

              {/* Subject / Difficulty / Questions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-black text-slate-700 mb-1.5">Subject</label>
                  <select value={subject} onChange={e => setSubject(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-800 font-semibold focus:outline-none focus:border-indigo-400 transition-all">
                    {subjects.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-700 mb-1.5">Difficulty</label>
                  <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-800 font-semibold focus:outline-none focus:border-indigo-400 transition-all">
                    {difficulties.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-700 mb-1.5">Questions</label>
                  <select value={numQuestions} onChange={e => setNumQuestions(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-800 font-semibold focus:outline-none focus:border-indigo-400 transition-all">
                    {[3, 4, 5, 6, 8].map(n => <option key={n} value={n}>{n} questions</option>)}
                  </select>
                </div>
              </div>

              <button
                onClick={() => generateExercise()}
                disabled={generating || !topic.trim()}
                className="w-full py-4 rounded-2xl font-black text-white text-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                style={!generating && topic.trim() ? { background: 'linear-gradient(135deg, #6366f1, #4338ca)' } : { background: '#94a3b8' }}>
                {generating ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Generating with AI...
                  </>
                ) : '⚡ Generate Practice Exercise'}
              </button>
            </div>

            {/* Popular Topics */}
            {!exercise && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-black text-slate-900 mb-4">🔥 Popular Topics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {popularTopics.map(({ topic: t, subject: s, icon }) => (
                    <button key={t}
                      onClick={() => { setSubject(s); generateExercise(t); }}
                      disabled={generating}
                      className="bg-slate-50 hover:bg-indigo-50 border-2 border-slate-200 hover:border-indigo-300 rounded-2xl p-4 text-left transition-all group disabled:opacity-50">
                      <div className="text-3xl mb-2">{icon}</div>
                      <div className="font-black text-sm text-slate-800 group-hover:text-indigo-700 transition-colors leading-tight">{t}</div>
                      <div className="text-xs text-slate-500 font-medium mt-1">{s}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Exercise Display */}
            {exercise && (
              <div className="space-y-4 animate-fade-scale">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h2 className="text-2xl font-black text-slate-900">{exercise.title}</h2>
                  <button
                    onClick={() => { setExercise(null); setScore(null); }}
                    className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors border-2 border-indigo-200 hover:border-indigo-400 px-4 py-2 rounded-xl">
                    ← Generate New
                  </button>
                </div>

                {/* Info bar */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap gap-4 shadow-sm">
                  {[
                    { icon: '📚', label: subject },
                    { icon: '⚡', label: difficulty.charAt(0).toUpperCase() + difficulty.slice(1), badge: difficultyStyle[difficulty] },
                    { icon: '❓', label: `${exercise.questions?.length || numQuestions} questions` },
                    { icon: '🤖', label: 'AI Generated', className: 'text-green-700 font-bold' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                      <span>{item.icon}</span>
                      {item.badge ? (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${item.badge}`}>{item.label}</span>
                      ) : (
                        <span className={item.className || ''}>{item.label}</span>
                      )}
                    </div>
                  ))}
                </div>

                <ExerciseInterface exerciseId={exercise.id} onComplete={setScore} />
              </div>
            )}

            {/* How It Works */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <span className="text-4xl flex-shrink-0">🎯</span>
                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-3">How AI Practice Works</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      { num: '1', color: 'text-indigo-600', text: 'Enter any topic you want to practice' },
                      { num: '2', color: 'text-purple-600', text: 'GPT-4 generates unique questions with hints' },
                      { num: '3', color: 'text-green-600',  text: 'Answer questions and use hints when stuck' },
                      { num: '4', color: 'text-amber-600',  text: 'Get instant feedback and explanations' },
                    ].map(item => (
                      <div key={item.num} className="flex items-start gap-2 text-sm">
                        <span className={`font-black ${item.color} flex-shrink-0`}>{item.num}.</span>
                        <span className="text-slate-600 font-medium">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
