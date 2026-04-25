import { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const sidebarLinks = [
  { path: '/student',            label: 'Home',          icon: '🏠' },
  { path: '/student/courses',    label: 'Courses',        icon: '📚' },
  { path: '/student/mastery-coach', label: 'Mastery Coach', icon: '🧠' },
  { path: '/student/tools',      label: 'AI Tools',       icon: '🛠️' },
  { path: '/student/practice',   label: 'AI Practice',    icon: '🤖' },
  { path: '/student/chat',       label: 'AI Chat',        icon: '💬' },
  { path: '/student/homework',   label: 'Homework',       icon: '📝' },
  { path: '/student/quiz',       label: 'Quizzes',        icon: '📊' },
  { path: '/student/psych-test', label: 'PAT Assessment', icon: '🧬' },
  { path: '/student/gamification', label: 'Achievements', icon: '🏆' },
  { path: '/student/videos',     label: 'Videos',         icon: '🎬' },
];

const STEPS = [
  { id: 1, label: "Today's Activity",  icon: '📅' },
  { id: 2, label: 'Feelings',          icon: '💭' },
  { id: 3, label: 'Challenges',        icon: '🎯' },
  { id: 4, label: 'Plans',             icon: '🚀' },
  { id: 5, label: 'PAT Questions',     icon: '🧬' },
];

const subjectChips = ['Mathematics','Physics','Chemistry','Biology','English','Computer Science','History','General'];
const activityChips = ['Watched Videos','Read Notes','Solved Problems','Took a Quiz','Used AI Chat','Did Homework','Revised Old Topics','Group Study'];
const motivationOptions = ['Get good grades','Pursue my passion','Make my family proud','Build a career','Enjoy learning','Pass exams'];
const supportOptions = ['More practice problems','Video explanations','Step-by-step guidance','Quiz myself more','One-on-one tutoring','Better time management tips'];

function MeterBar({ label, score, color, icon }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
          <span>{icon}</span>{label}
        </span>
        <span className="text-sm font-black" style={{ color }}>{score}/100</span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );
}

function ScoreRing({ score, label }) {
  const r = 42, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="flex flex-col items-center">
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle cx="55" cy="55" r={r} fill="none"
          stroke="url(#ring)" strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`}
          strokeDashoffset={circ * 0.25}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1.2s ease' }} />
        <defs>
          <linearGradient id="ring" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <text x="55" y="50" textAnchor="middle" fontSize="22" fontWeight="900" fill="#1e293b">{score}</text>
        <text x="55" y="67" textAnchor="middle" fontSize="10" fill="#94a3b8">/ 100</text>
      </svg>
      <p className="text-sm font-black text-slate-700 mt-1">{label}</p>
    </div>
  );
}

export default function PsychTest() {
  const [step, setStep]       = useState(0); // 0 = intro
  const [answers, setAnswers] = useState({
    subjects: [],
    studyHours: '',
    activities: [],
    feeling: '',
    challenge: '',
    confidence: 5,
    motivation: '',
    nextPlan: '',
    weeklyGoal: '',
    support: '',
  });
  const [loading, setLoading] = useState(false);
  const [report,  setReport]  = useState(null);

  const toggle = (field, value) => {
    setAnswers(a => ({
      ...a,
      [field]: a[field].includes(value)
        ? a[field].filter(x => x !== value)
        : [...a[field], value],
    }));
  };

  const set = (field, value) => setAnswers(a => ({ ...a, [field]: value }));

  const canNext = () => {
    if (step === 1) return answers.subjects.length > 0 && answers.studyHours;
    if (step === 2) return answers.feeling;
    if (step === 3) return answers.challenge.trim().length > 2;
    if (step === 4) return answers.nextPlan.trim().length > 2;
    if (step === 5) return answers.motivation && answers.support;
    return true;
  };

  const generateReport = async () => {
    setLoading(true);
    const prompt = `You are a student psychologist and learning specialist. Based on this student's Personal Assessment Test (PAT) responses, create a detailed psychological learning profile.

Student PAT Data:
- Subjects studied recently: ${answers.subjects.join(', ') || 'Not specified'}
- Study hours today: ${answers.studyHours}
- Learning activities done: ${answers.activities.join(', ') || 'None mentioned'}
- Current emotional feeling about studies: ${answers.feeling}
- Biggest learning challenge: ${answers.challenge}
- Self-confidence level (1-10): ${answers.confidence}
- Main motivation to study: ${answers.motivation}
- Next study plan: ${answers.nextPlan}
- Weekly goal: ${answers.weeklyGoal || 'Not specified'}
- Support needed: ${answers.support}

Respond ONLY with valid JSON in this exact format:
{
  "learningStyle": { "type": "Visual / Auditory / Reading-Writing / Kinesthetic", "description": "2 sentence explanation", "score": 75 },
  "motivation": { "level": "High / Medium / Low", "score": 72, "insight": "2 sentence insight about their motivation" },
  "emotional": { "status": "Excellent / Good / Needs Attention", "score": 68, "message": "Supportive 2 sentence message" },
  "focus": { "level": "High / Medium / Low", "score": 80, "tip": "One specific focus improvement tip" },
  "consistency": { "score": 65, "feedback": "One sentence about study consistency" },
  "recommendations": ["Specific tip 1", "Specific tip 2", "Specific tip 3", "Specific tip 4"],
  "nextPlan": "Specific 2-sentence personalized study plan for next session",
  "encouragement": "A warm, personal encouragement message for this student (2-3 sentences)",
  "overallScore": 74,
  "personalityType": "The Determined Achiever / The Creative Thinker / The Steady Learner / The Curious Explorer / The Goal-Setter"
}`;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/api/tutor/ask`, {
        question: prompt,
        subject: 'general',
        language: 'english',
      }, { headers: { Authorization: `Bearer ${token}` } });

      const raw = res.data.answer;
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON');
      const parsed = JSON.parse(jsonMatch[0]);
      setReport(parsed);
      setStep(6);
    } catch {
      toast.error('Could not generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const restart = () => {
    setStep(0);
    setReport(null);
    setAnswers({ subjects: [], studyHours: '', activities: [], feeling: '', challenge: '', confidence: 5, motivation: '', nextPlan: '', weeklyGoal: '', support: '' });
  };

  const feelingOptions = [
    { emoji: '😩', label: 'Stressed',    value: 'stressed and overwhelmed' },
    { emoji: '😐', label: 'Neutral',     value: 'neutral, just going through the motions' },
    { emoji: '🙂', label: 'Okay',        value: 'okay and doing fine' },
    { emoji: '😊', label: 'Good',        value: 'good and positive about learning' },
    { emoji: '🤩', label: 'Excellent',   value: 'excellent and very motivated' },
  ];

  return (
    <div className="min-h-screen bg-ultra-modern">
      <Navbar />
      <div className="flex">
        <Sidebar links={sidebarLinks} />
        <main className="flex-1 overflow-auto">

          {/* Hero */}
          <div className="relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4f46e5 50%, #7c3aed 100%)' }}>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white opacity-5 -translate-y-1/3 translate-x-1/4" />
              <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full bg-white opacity-5 translate-y-1/2" />
            </div>
            <div className="relative max-w-4xl mx-auto px-6 py-8">
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-2xl px-4 py-1.5 mb-3">
                <span>🧬</span>
                <span className="text-white font-bold text-sm">PAT — Personal Assessment Test</span>
              </div>
              <h1 className="text-4xl font-black text-white">Student Psychological</h1>
              <h1 className="text-4xl font-black text-yellow-300">Learning Analysis</h1>
              <p className="text-indigo-200 mt-2 font-medium text-sm max-w-xl">
                Understand your learning style, emotional wellness, motivation and get a personalized AI report based on your study activities.
              </p>
            </div>
          </div>

          <div className="max-w-3xl mx-auto px-5 py-8 space-y-6">

            {/* ── INTRO ── */}
            {step === 0 && (
              <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                <div className="p-8 text-center">
                  <div className="text-7xl mb-4">🧠</div>
                  <h2 className="text-2xl font-black text-slate-900 mb-2">How does PAT work?</h2>
                  <p className="text-slate-500 font-medium max-w-md mx-auto mb-8">
                    Answer 5 short steps about your learning activities, feelings and plans. Our AI will generate your personal psychological learning profile.
                  </p>
                  <div className="grid grid-cols-5 gap-3 mb-8">
                    {STEPS.map((s, i) => (
                      <div key={s.id} className="flex flex-col items-center gap-1.5">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md"
                          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                          {s.icon}
                        </div>
                        <p className="text-xs font-bold text-slate-600 text-center leading-tight">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setStep(1)}
                    className="px-10 py-4 rounded-2xl font-black text-white text-lg shadow-xl"
                    style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                    Start My Assessment 🚀
                  </button>
                </div>
              </div>
            )}

            {/* Progress bar (steps 1-5) */}
            {step >= 1 && step <= 5 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-black text-slate-700">Step {step} of 5 — {STEPS[step-1].label}</span>
                  <span className="text-sm font-bold text-indigo-600">{step * 20}%</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${step * 20}%`, background: 'linear-gradient(90deg, #6366f1, #a855f7)' }} />
                </div>
                <div className="flex justify-between mt-2">
                  {STEPS.map(s => (
                    <div key={s.id} className={`text-lg ${step >= s.id ? 'opacity-100' : 'opacity-25'}`}>{s.icon}</div>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 1: Today's Activity ── */}
            {step === 1 && (
              <div className="bg-white rounded-3xl shadow-lg p-7 space-y-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-1">📅 What did you study recently?</h3>
                  <p className="text-slate-400 text-sm font-medium">Select all subjects you studied today or this week</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {subjectChips.map(s => (
                      <button key={s} onClick={() => toggle('subjects', s)}
                        className="px-4 py-2 rounded-xl text-sm font-bold transition-all border-2"
                        style={answers.subjects.includes(s)
                          ? { background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', border: 'none' }
                          : { background: '#f8fafc', color: '#475569', borderColor: '#e2e8f0' }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-1">⏱️ How many hours did you study today?</h3>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {['Less than 1 hr', '1-2 hrs', '2-3 hrs', '3-4 hrs', '4+ hrs'].map(h => (
                      <button key={h} onClick={() => set('studyHours', h)}
                        className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-2"
                        style={answers.studyHours === h
                          ? { background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', border: 'none' }
                          : { background: '#f8fafc', color: '#475569', borderColor: '#e2e8f0' }}>
                        {h}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-1">🛠️ What activities did you do? <span className="text-slate-400 font-medium text-sm">(optional)</span></h3>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {activityChips.map(a => (
                      <button key={a} onClick={() => toggle('activities', a)}
                        className="px-3 py-2 rounded-xl text-xs font-bold transition-all border-2"
                        style={answers.activities.includes(a)
                          ? { background: '#e0e7ff', color: '#4338ca', borderColor: '#818cf8' }
                          : { background: '#f8fafc', color: '#64748b', borderColor: '#e2e8f0' }}>
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: Feelings ── */}
            {step === 2 && (
              <div className="bg-white rounded-3xl shadow-lg p-7 space-y-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-1">💭 How do you feel about your studies right now?</h3>
                  <p className="text-slate-400 text-sm font-medium">Be honest — this helps the AI give you better insights</p>
                  <div className="grid grid-cols-5 gap-3 mt-5">
                    {feelingOptions.map(f => (
                      <button key={f.value} onClick={() => set('feeling', f.value)}
                        className="flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all"
                        style={answers.feeling === f.value
                          ? { background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', borderColor: 'transparent' }
                          : { background: '#f8fafc', borderColor: '#e2e8f0' }}>
                        <span className="text-4xl">{f.emoji}</span>
                        <span className={`text-xs font-black ${answers.feeling === f.value ? 'text-white' : 'text-slate-600'}`}>{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-1">💪 How confident do you feel? <span className="text-indigo-600 font-black">{answers.confidence}/10</span></h3>
                  <input type="range" min="1" max="10" value={answers.confidence}
                    onChange={e => set('confidence', Number(e.target.value))}
                    className="w-full mt-3 accent-indigo-600" />
                  <div className="flex justify-between text-xs text-slate-400 font-medium mt-1">
                    <span>Not at all</span><span>Very confident</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: Challenges ── */}
            {step === 3 && (
              <div className="bg-white rounded-3xl shadow-lg p-7 space-y-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-1">🎯 What is your biggest learning challenge right now?</h3>
                  <p className="text-slate-400 text-sm font-medium">Describe in your own words — be as specific as you like</p>
                  <textarea value={answers.challenge}
                    onChange={e => set('challenge', e.target.value)}
                    rows={4} placeholder="e.g. I find it hard to concentrate, I struggle with algebra formulas, I get confused during exams..."
                    className="w-full mt-4 px-4 py-3 rounded-2xl border-2 border-slate-200 text-slate-800 font-medium text-sm focus:outline-none focus:border-indigo-400 resize-none transition-all" />
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-1">⭐ What are you best at in your studies?</h3>
                  <input value={answers.strength || ''}
                    onChange={e => set('strength', e.target.value)}
                    placeholder="e.g. I'm good at memorizing, I understand concepts quickly..."
                    className="w-full mt-3 px-4 py-3 rounded-2xl border-2 border-slate-200 text-slate-800 font-medium text-sm focus:outline-none focus:border-indigo-400 transition-all" />
                </div>
              </div>
            )}

            {/* ── STEP 4: Plans ── */}
            {step === 4 && (
              <div className="bg-white rounded-3xl shadow-lg p-7 space-y-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-1">🚀 What will you study in your next session?</h3>
                  <input value={answers.nextPlan}
                    onChange={e => set('nextPlan', e.target.value)}
                    placeholder="e.g. I will revise Newton's Laws and solve 10 practice problems..."
                    className="w-full mt-3 px-4 py-3 rounded-2xl border-2 border-slate-200 text-slate-800 font-medium text-sm focus:outline-none focus:border-indigo-400 transition-all" />
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-1">🏆 What is your main goal this week?</h3>
                  <input value={answers.weeklyGoal}
                    onChange={e => set('weeklyGoal', e.target.value)}
                    placeholder="e.g. Complete Chapter 5, score above 80% on the quiz..."
                    className="w-full mt-3 px-4 py-3 rounded-2xl border-2 border-slate-200 text-slate-800 font-medium text-sm focus:outline-none focus:border-indigo-400 transition-all" />
                </div>
              </div>
            )}

            {/* ── STEP 5: PAT Questions ── */}
            {step === 5 && (
              <div className="bg-white rounded-3xl shadow-lg p-7 space-y-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-1">💡 What motivates you most to study?</h3>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {motivationOptions.map(m => (
                      <button key={m} onClick={() => set('motivation', m)}
                        className="px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all"
                        style={answers.motivation === m
                          ? { background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', border: 'none' }
                          : { background: '#f8fafc', color: '#475569', borderColor: '#e2e8f0' }}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-1">🛟 What kind of support do you need most?</h3>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {supportOptions.map(s => (
                      <button key={s} onClick={() => set('support', s)}
                        className="px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all"
                        style={answers.support === s
                          ? { background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', border: 'none' }
                          : { background: '#f8fafc', color: '#475569', borderColor: '#e2e8f0' }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            {step >= 1 && step <= 5 && (
              <div className="flex gap-3">
                <button onClick={() => setStep(s => s - 1)}
                  className="px-6 py-3 rounded-2xl font-black text-slate-700 border-2 border-slate-200 hover:border-indigo-300 transition-all text-sm">
                  ← Back
                </button>
                {step < 5 ? (
                  <button onClick={() => canNext() && setStep(s => s + 1)} disabled={!canNext()}
                    className="flex-1 py-3 rounded-2xl font-black text-white text-sm shadow-lg transition-all disabled:opacity-40"
                    style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                    Next Step →
                  </button>
                ) : (
                  <button onClick={() => canNext() && generateReport()} disabled={!canNext() || loading}
                    className="flex-1 py-3 rounded-2xl font-black text-white text-sm shadow-lg transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                    style={{ background: loading ? '#94a3b8' : 'linear-gradient(135deg, #059669, #047857)' }}>
                    {loading ? (
                      <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Analyzing your profile...</>
                    ) : (
                      <><span>🧬</span> Generate My PAT Report</>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* ── STEP 6: REPORT ── */}
            {step === 6 && report && (
              <div className="space-y-5">

                {/* Overall Score */}
                <div className="bg-white rounded-3xl shadow-lg p-7 text-center">
                  <p className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-4">Your PAT Report is Ready</p>
                  <div className="flex items-center justify-center gap-8 flex-wrap">
                    <ScoreRing score={report.overallScore} label="Overall Score" />
                    <div className="text-left">
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Personality Type</p>
                      <p className="text-xl font-black text-slate-900">{report.personalityType}</p>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-3 mb-1">Learning Style</p>
                      <p className="text-lg font-black" style={{ color: '#4f46e5' }}>{report.learningStyle?.type}</p>
                      <p className="text-slate-500 text-sm font-medium mt-1 max-w-xs">{report.learningStyle?.description}</p>
                    </div>
                  </div>
                </div>

                {/* Meter bars */}
                <div className="bg-white rounded-3xl shadow-lg p-7">
                  <h3 className="text-xl font-black text-slate-900 mb-5">📊 Psychological Profile</h3>
                  <MeterBar label="Motivation Level"     score={report.motivation?.score    || 0} color="#6366f1" icon="💡" />
                  <MeterBar label="Emotional Wellness"   score={report.emotional?.score     || 0} color="#ec4899" icon="💚" />
                  <MeterBar label="Focus & Concentration" score={report.focus?.score        || 0} color="#0ea5e9" icon="🎯" />
                  <MeterBar label="Study Consistency"    score={report.consistency?.score   || 0} color="#f97316" icon="📅" />
                  <MeterBar label="Learning Style Match" score={report.learningStyle?.score || 0} color="#10b981" icon="🧠" />
                </div>

                {/* Insights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5">
                    <p className="text-xs font-black text-indigo-500 uppercase mb-2">💡 Motivation</p>
                    <p className="text-sm font-black text-slate-900">{report.motivation?.level}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">{report.motivation?.insight}</p>
                  </div>
                  <div className="bg-pink-50 border border-pink-200 rounded-2xl p-5">
                    <p className="text-xs font-black text-pink-500 uppercase mb-2">💚 Emotional State</p>
                    <p className="text-sm font-black text-slate-900">{report.emotional?.status}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">{report.emotional?.message}</p>
                  </div>
                  <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5">
                    <p className="text-xs font-black text-sky-500 uppercase mb-2">🎯 Focus</p>
                    <p className="text-sm font-black text-slate-900">{report.focus?.level}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">{report.focus?.tip}</p>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-white rounded-3xl shadow-lg p-7">
                  <h3 className="text-xl font-black text-slate-900 mb-4">✅ Personalized Recommendations</h3>
                  <div className="space-y-3">
                    {(report.recommendations || []).map((tip, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>{i + 1}</div>
                        <p className="text-sm font-medium text-slate-700 leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Session Plan */}
                <div className="rounded-3xl p-7" style={{ background: 'linear-gradient(135deg, #1e1b4b, #4f46e5)' }}>
                  <h3 className="text-xl font-black text-white mb-2">🚀 Your Next Session Plan</h3>
                  <p className="text-indigo-200 font-medium text-sm leading-relaxed">{report.nextPlan}</p>
                  <div className="mt-5 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <p className="text-xs font-black text-yellow-300 uppercase tracking-wider mb-1">✨ Encouragement</p>
                    <p className="text-white font-medium text-sm leading-relaxed">{report.encouragement}</p>
                  </div>
                </div>

                <button onClick={restart}
                  className="w-full py-4 rounded-2xl font-black text-white text-base shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                  🔄 Take Assessment Again
                </button>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
