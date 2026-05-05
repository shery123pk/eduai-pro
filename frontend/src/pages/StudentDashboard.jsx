import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import axios from 'axios';

const ANNOUNCEMENTS_KEY = 'teacher_announcements';
const ASSIGNMENTS_KEY   = 'teacher_assignments';

const priorityStyles = {
  info:      { bg: 'bg-indigo-50 border-indigo-200', icon: 'ℹ️', text: 'text-indigo-800' },
  important: { bg: 'bg-amber-50 border-amber-200',   icon: '⚠️', text: 'text-amber-800'  },
  urgent:    { bg: 'bg-red-50 border-red-200',        icon: '🚨', text: 'text-red-800'    },
};

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
  { path: '/student/psych-test',    label: 'PAT Assessment', icon: '🧬' },
  { path: '/student/gamification', label: 'Achievements',   icon: '🏆' },
  { path: '/student/videos',        label: 'Videos',          icon: '🎬' },
  { path: '/student/tutorial-lab', label: 'Tutorial Lab',    icon: '🖥️' },
];

const features = [
  { title: 'Course Catalog',  subtitle: 'Video lessons & mastery',       icon: '📚', path: '/student/courses',        from: '#6366f1', to: '#4338ca' },
  { title: 'Mastery Coach',   subtitle: "Bloom's 5-level journey",        icon: '🧠', path: '/student/mastery-coach',   from: '#ec4899', to: '#be185d' },
  { title: 'AI Tools',        subtitle: 'Explainer, flashcards & more',   icon: '🛠️', path: '/student/tools',           from: '#f97316', to: '#dc2626' },
  { title: 'AI Practice',     subtitle: 'Generate exercises instantly',   icon: '🤖', path: '/student/practice',        from: '#10b981', to: '#047857' },
  { title: 'AI Chat',         subtitle: 'Ask any question, get answers',  icon: '💬', path: '/student/chat',            from: '#0ea5e9', to: '#1d4ed8' },
  { title: 'Homework Help',   subtitle: 'Step-by-step AI solutions',      icon: '📝', path: '/student/homework',        from: '#a855f7', to: '#6d28d9' },
  { title: 'PAT Assessment',  subtitle: 'Your psychological learning profile', icon: '🧬', path: '/student/psych-test',      from: '#0891b2', to: '#0e7490' },
  { title: 'Tutorial Lab',   subtitle: 'Watch & practice MS Word live',      icon: '🖥️', path: '/student/tutorial-lab',    from: '#16a34a', to: '#15803d' },
];

const continueLearning = [
  { subject: 'Algebra 1',         lesson: 'Introduction to Variables', icon: '📐', courseId: 'math-algebra-1',    progress: 75, from: '#6366f1', to: '#4338ca' },
  { subject: 'Physics Mechanics', lesson: 'Motion in One Dimension',   icon: '⚡', courseId: 'physics-mechanics', progress: 45, from: '#a855f7', to: '#6d28d9' },
  { subject: 'Chemistry Basics',  lesson: 'The Periodic Table',        icon: '🧪', courseId: 'chemistry-basics',  progress: 30, from: '#10b981', to: '#047857' },
];

function StudyKidsIllustration() {
  return (
    <svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      {/* Background decorative circles */}
      <circle cx="14" cy="38" r="10" fill="rgba(255,255,255,0.12)" />
      <circle cx="286" cy="155" r="18" fill="rgba(255,255,255,0.08)" />
      <circle cx="150" cy="12" r="7" fill="rgba(255,255,255,0.15)" />
      <circle cx="270" cy="40" r="5" fill="rgba(255,255,255,0.2)" />

      {/* Sparkles & stars */}
      <text x="18" y="95" fontSize="13" fill="rgba(255,255,255,0.7)">✦</text>
      <text x="267" y="62" fontSize="9"  fill="rgba(255,255,255,0.6)">★</text>
      <text x="132" y="188" fontSize="11" fill="rgba(255,255,255,0.5)">✦</text>
      <text x="258" y="118" fontSize="15" fill="rgba(255,255,255,0.45)">★</text>
      <text x="5"  y="58"  fontSize="11" fill="rgba(255,255,255,0.5)">✦</text>

      {/* Floating subject icons */}
      <text x="118" y="52"  fontSize="19">📖</text>
      <text x="172" y="172" fontSize="15">✏️</text>
      <text x="248" y="158" fontSize="17">🔭</text>
      <text x="38"  y="168" fontSize="15">🔢</text>

      {/* Math symbols */}
      <text x="107" y="142" fontSize="22" fill="rgba(255,255,255,0.45)" fontWeight="bold">+</text>
      <text x="278" y="92"  fontSize="17" fill="rgba(255,255,255,0.35)" fontWeight="bold">π</text>
      <text x="4"   y="138" fontSize="17" fill="rgba(255,255,255,0.35)" fontWeight="bold">∑</text>

      {/* ══ KID 1 — Boy reading book (left) ══ */}
      <ellipse cx="65" cy="186" rx="30" ry="7" fill="rgba(0,0,0,0.13)" />
      {/* Legs */}
      <rect x="47" y="150" width="14" height="30" rx="7" fill="#1e3a8a" />
      <rect x="70" y="150" width="14" height="30" rx="7" fill="#1e3a8a" />
      {/* Shoes */}
      <ellipse cx="54"  cy="180" rx="12" ry="6" fill="#1e293b" />
      <ellipse cx="77"  cy="180" rx="12" ry="6" fill="#1e293b" />
      {/* Body */}
      <rect x="38" y="98" width="54" height="55" rx="13" fill="#3b82f6" />
      {/* Collar stripe */}
      <path d="M 55 98 L 65 112 L 75 98" fill="#60a5fa" />
      {/* Arms holding book */}
      <rect x="18" y="116" width="24" height="13" rx="6.5" fill="#fde68a" />
      <rect x="88" y="116" width="24" height="13" rx="6.5" fill="#fde68a" />
      {/* Open book */}
      <rect x="22" y="127" width="33" height="23" rx="3" fill="#1d4ed8" />
      <rect x="57" y="127" width="33" height="23" rx="3" fill="#2563eb" />
      <line x1="57" y1="127" x2="57" y2="150" stroke="white" strokeWidth="2" />
      <line x1="27" y1="133" x2="52" y2="133" stroke="rgba(255,255,255,0.45)" strokeWidth="1" />
      <line x1="27" y1="137" x2="52" y2="137" stroke="rgba(255,255,255,0.45)" strokeWidth="1" />
      <line x1="27" y1="141" x2="52" y2="141" stroke="rgba(255,255,255,0.45)" strokeWidth="1" />
      <line x1="62" y1="133" x2="87" y2="133" stroke="rgba(255,255,255,0.45)" strokeWidth="1" />
      <line x1="62" y1="137" x2="87" y2="137" stroke="rgba(255,255,255,0.45)" strokeWidth="1" />
      {/* Neck */}
      <rect x="57" y="91" width="16" height="9" rx="4" fill="#fde68a" />
      {/* Head */}
      <circle cx="65" cy="72" r="26" fill="#fde68a" />
      {/* Hair */}
      <ellipse cx="65" cy="52" rx="26" ry="13" fill="#92400e" />
      <rect x="39" y="52" width="52" height="14" rx="4" fill="#92400e" />
      {/* Ears */}
      <ellipse cx="39" cy="72" rx="6" ry="8" fill="#fde68a" />
      <ellipse cx="91" cy="72" rx="6" ry="8" fill="#fde68a" />
      {/* Eyes */}
      <circle cx="55" cy="70" r="5" fill="white" />
      <circle cx="75" cy="70" r="5" fill="white" />
      <circle cx="56" cy="71" r="3" fill="#1e293b" />
      <circle cx="76" cy="71" r="3" fill="#1e293b" />
      <circle cx="57" cy="70" r="1.2" fill="white" />
      <circle cx="77" cy="70" r="1.2" fill="white" />
      {/* Eyebrows */}
      <path d="M 50 63 Q 55 60 60 63" stroke="#92400e" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 70 63 Q 75 60 80 63" stroke="#92400e" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Smile */}
      <path d="M 54 80 Q 65 90 76 80" stroke="#c2410c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Cheeks */}
      <ellipse cx="47" cy="78" rx="7" ry="5" fill="#fca5a5" opacity="0.5" />
      <ellipse cx="83" cy="78" rx="7" ry="5" fill="#fca5a5" opacity="0.5" />

      {/* ══ KID 2 — Girl with lightbulb (right) ══ */}
      <ellipse cx="225" cy="186" rx="30" ry="7" fill="rgba(0,0,0,0.13)" />
      {/* Legs */}
      <rect x="207" y="150" width="14" height="30" rx="7" fill="#be185d" />
      <rect x="230" y="150" width="14" height="30" rx="7" fill="#be185d" />
      {/* Shoes */}
      <ellipse cx="214" cy="180" rx="12" ry="6" fill="#1e293b" />
      <ellipse cx="237" cy="180" rx="12" ry="6" fill="#1e293b" />
      {/* Skirt flare */}
      <ellipse cx="225" cy="150" rx="32" ry="10" fill="#f472b6" />
      {/* Body */}
      <rect x="198" y="98" width="54" height="55" rx="13" fill="#f9a8d4" />
      {/* Arms — left down, right raised */}
      <rect x="176" y="112" width="25" height="12" rx="6" fill="#fde68a" transform="rotate(-20 176 112)" />
      <rect x="249" y="96"  width="25" height="12" rx="6" fill="#fde68a" transform="rotate(50 249 96)" />
      {/* Neck */}
      <rect x="217" y="91" width="16" height="9" rx="4" fill="#fde68a" />
      {/* Head */}
      <circle cx="225" cy="72" r="26" fill="#fde68a" />
      {/* Hair body */}
      <ellipse cx="225" cy="52" rx="26" ry="13" fill="#1e293b" />
      <rect x="199" y="52" width="52" height="14" rx="4" fill="#1e293b" />
      {/* Pigtails */}
      <ellipse cx="199" cy="62" rx="10" ry="14" fill="#1e293b" />
      <ellipse cx="251" cy="62" rx="10" ry="14" fill="#1e293b" />
      {/* Ribbons */}
      <circle cx="199" cy="52" r="7" fill="#f43f5e" />
      <circle cx="251" cy="52" r="7" fill="#f43f5e" />
      {/* Ears */}
      <ellipse cx="199" cy="72" rx="6" ry="8" fill="#fde68a" />
      <ellipse cx="251" cy="72" rx="6" ry="8" fill="#fde68a" />
      {/* Eyes (happy squint arcs) */}
      <path d="M 215 68 Q 219 63 223 68" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 227 68 Q 231 63 235 68" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Cheeks */}
      <ellipse cx="207" cy="78" rx="7" ry="5" fill="#fca5a5" opacity="0.6" />
      <ellipse cx="243" cy="78" rx="7" ry="5" fill="#fca5a5" opacity="0.6" />
      {/* Big smile */}
      <path d="M 212 82 Q 225 95 238 82" stroke="#c2410c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Lightbulb */}
      <circle cx="225" cy="35" r="17" fill="#fbbf24" />
      <circle cx="225" cy="35" r="12" fill="#fef08a" />
      <rect x="219" y="50" width="12" height="5" rx="2" fill="#d97706" />
      <rect x="220" y="54" width="10" height="3" rx="1.5" fill="#b45309" />
      {/* Filament */}
      <path d="M 220 35 Q 225 29 230 35 Q 225 41 220 35" stroke="#f97316" strokeWidth="1.5" fill="none" />
      {/* Light rays */}
      <line x1="225" y1="16" x2="225" y2="10" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="209" y1="21" x2="205" y2="16" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
      <line x1="241" y1="21" x2="245" y2="16" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
      <line x1="202" y1="35" x2="196" y2="35" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
      <line x1="248" y1="35" x2="254" y2="35" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function StudentDashboard() {
  const [stats, setStats] = useState({
    totalPoints: 1250, currentStreak: 7, level: 5, todayXP: 50, dailyGoal: 100
  });
  const [user, setUser] = useState({});

  // Teacher announcements & assignments from localStorage
  const announcements = (() => {
    try { return JSON.parse(localStorage.getItem(ANNOUNCEMENTS_KEY) || '[]').slice(0, 3); } catch { return []; }
  })();
  const assignments = (() => {
    try {
      return JSON.parse(localStorage.getItem(ASSIGNMENTS_KEY) || '[]')
        .filter(a => !a.closed)
        .slice(0, 4);
    } catch { return []; }
  })();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(stored);
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/gamification/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(prev => ({ ...prev, ...res.data }));
    } catch {}
  };

  const dailyPct  = Math.min((stats.todayXP / stats.dailyGoal) * 100, 100);
  const levelPct  = ((stats.totalPoints % 500) / 500) * 100;

  return (
    <div className="min-h-screen bg-ultra-modern">
      <Navbar />
      <div className="flex">
        <Sidebar links={sidebarLinks} />

        <main className="flex-1 overflow-auto">

          {/* ─── Hero Banner ─── */}
          <div className="relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4f46e5 45%, #7c3aed 100%)' }}>
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white opacity-5 -translate-y-1/3 translate-x-1/4 pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full bg-white opacity-5 translate-y-1/2 pointer-events-none" />
            <div className="absolute top-1/2 left-0 w-48 h-48 rounded-full bg-white opacity-5 -translate-x-1/2 pointer-events-none" />

            {/* Vision ribbon at very top */}
            <div className="relative w-full py-2.5 px-6 text-center" style={{ background: 'rgba(255,255,255,0.07)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="text-sm font-bold tracking-wide" style={{ color: '#fde68a' }}>
                ✨ <span className="text-white">Ms Sharmeen Asif's Vision:</span>
                &nbsp;"Empowering every student with Advanced AI · IT · CS Education — for All"
              </p>
            </div>

            <div className="relative max-w-5xl mx-auto px-6 py-8 flex items-center justify-between gap-6">
              {/* Left — text + stat pills */}
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-2 bg-white/20 rounded-2xl px-4 py-1.5 mb-4">
                  <span className="text-base">👋</span>
                  <span className="text-white font-bold text-sm">Welcome back, {user.name || 'Student'}!</span>
                </div>

                <h1 className="text-5xl md:text-6xl font-black text-white leading-none tracking-tight">
                  AI Student<br />
                  <span className="text-yellow-300">Tutor</span>
                </h1>

                {/* Vision card */}
                <div className="mt-4 max-w-sm rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🎓</span>
                    <span className="text-xs font-black text-yellow-300 uppercase tracking-widest">Founder's Vision</span>
                  </div>
                  <p className="text-white font-black text-sm leading-relaxed">
                    Ms Sharmeen Asif
                  </p>
                  <p className="text-indigo-200 text-xs font-medium mt-1 leading-relaxed">
                    Making Advanced AI, IT &amp; Computer Science education accessible to every student — regardless of background or location.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 mt-6">
                  {[
                    { icon: '🔥', value: stats.currentStreak,              label: 'Day Streak' },
                    { icon: '⭐', value: stats.totalPoints.toLocaleString(), label: 'Total XP'  },
                    { icon: '🎯', value: `Lv ${stats.level}`,               label: 'Level'     },
                  ].map((s, i) => (
                    <div key={i} className="bg-white/20 backdrop-blur rounded-2xl px-4 py-2.5 flex items-center gap-2.5">
                      <span className="text-2xl">{s.icon}</span>
                      <div>
                        <div className="text-white font-black text-base leading-none">{s.value}</div>
                        <div className="text-indigo-200 text-xs font-medium mt-0.5">{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — SVG illustration */}
              <div className="hidden md:block flex-shrink-0" style={{ width: 280, height: 200 }}>
                <StudyKidsIllustration />
              </div>
            </div>
          </div>

          {/* ─── Main content ─── */}
          <div className="p-5 md:p-8">
            <div className="max-w-5xl mx-auto space-y-8">

              {/* Feature Flashcards */}
              <div>
                <h2 className="text-2xl font-black text-slate-900 mb-5">Learn &amp; Practice</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {features.map((f, i) => (
                    <Link key={i} to={f.path}
                      className="rounded-3xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group"
                      style={{ background: `linear-gradient(135deg, ${f.from}, ${f.to})` }}>
                      <div className="text-5xl mb-4">{f.icon}</div>
                      <div className="text-white font-black text-lg leading-tight">{f.title}</div>
                      <div className="text-white/75 text-sm mt-1.5 font-medium">{f.subtitle}</div>
                      <div className="mt-5 flex items-center gap-1 text-white/55 text-xs font-bold group-hover:text-white/90 transition-colors">
                        <span>Start now</span>
                        <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Progress bars */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-slate-800">⚡ Daily Goal</span>
                    <span className="text-sm font-bold text-indigo-600">{stats.todayXP} / {stats.dailyGoal} XP</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${dailyPct}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
                  </div>
                  <p className="text-xs text-slate-400 mt-2 font-medium">
                    {dailyPct >= 100 ? '🎉 Goal complete!' : `${stats.dailyGoal - stats.todayXP} XP remaining`}
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-slate-800">🎯 Level {stats.level} Progress</span>
                    <span className="text-sm font-bold text-purple-600">{stats.xpToNextLevel || 250} XP to next</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${levelPct}%`, background: 'linear-gradient(90deg, #8b5cf6, #ec4899)' }} />
                  </div>
                  <p className="text-xs text-slate-400 mt-2 font-medium">Level {stats.level} → {stats.level + 1}</p>
                </div>
              </div>

              {/* Continue Learning */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-black text-slate-900">Continue Learning</h2>
                  <Link to="/student/courses" className="text-sm text-indigo-600 hover:text-indigo-700 font-bold transition-colors">
                    View all courses →
                  </Link>
                </div>
                <div className="space-y-3">
                  {continueLearning.map((c, i) => (
                    <Link key={i} to={`/student/courses/${c.courseId}`}
                      className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 hover:border-indigo-300 hover:shadow-md transition-all group">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-md"
                        style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}>
                        {c.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-black text-slate-900 group-hover:text-indigo-700 transition-colors truncate">{c.subject}</div>
                        <div className="text-xs text-slate-500 font-medium truncate">{c.lesson}</div>
                        <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${c.progress}%`, background: `linear-gradient(90deg, ${c.from}, ${c.to})` }} />
                        </div>
                      </div>
                      <div className="text-sm font-black flex-shrink-0" style={{ color: c.from }}>{c.progress}%</div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* ── Teacher Announcements ── */}
              {announcements.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-2xl font-black text-slate-900">📢 Class Announcements</h2>
                  {announcements.map(a => {
                    const st = priorityStyles[a.priority] || priorityStyles.info;
                    return (
                      <div key={a.id} className={`border-2 rounded-2xl px-5 py-4 ${st.bg}`}>
                        <div className="flex items-start gap-3">
                          <span className="text-xl flex-shrink-0 mt-0.5">{st.icon}</span>
                          <div>
                            <p className={`font-black text-base ${st.text}`}>{a.title}</p>
                            <p className="text-slate-600 text-sm font-medium mt-1 leading-relaxed">{a.message}</p>
                            <p className="text-xs text-slate-400 font-bold mt-2">
                              {new Date(a.createdAt).toLocaleString('en-PK', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── Assignments ── */}
              {assignments.length > 0 && (
                <div>
                  <h2 className="text-2xl font-black text-slate-900 mb-4">📋 My Assignments</h2>
                  <div className="space-y-3">
                    {assignments.map(a => {
                      const due = new Date(a.dueDate);
                      const isOverdue = due < new Date();
                      const doneKey = `assignment_done_${a.id}`;
                      const isDone = localStorage.getItem(doneKey) === '1';
                      return (
                        <div key={a.id} className={`bg-white border-2 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm ${
                          isDone ? 'border-green-200 opacity-60' : isOverdue ? 'border-red-200' : 'border-slate-200'
                        }`}>
                          <div className="flex-1 min-w-0">
                            <p className={`font-black text-slate-900 ${isDone ? 'line-through text-slate-500' : ''}`}>{a.title}</p>
                            <div className="flex gap-3 mt-1 text-xs font-bold">
                              <span className="text-indigo-600">{a.subject}</span>
                              <span className={isOverdue && !isDone ? 'text-red-500' : 'text-slate-400'}>
                                Due: {due.toLocaleDateString('en-PK', { day:'numeric', month:'short' })}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              localStorage.setItem(doneKey, isDone ? '0' : '1');
                              window.location.reload();
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex-shrink-0 ${
                              isDone
                                ? 'bg-green-100 text-green-700 border-2 border-green-200'
                                : 'text-white shadow-sm'
                            }`}
                            style={isDone ? {} : { background: 'linear-gradient(135deg, #6366f1, #4338ca)' }}>
                            {isDone ? '✓ Done' : 'Mark Done'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Daily Challenges */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-5">🏆 Daily Challenges</h2>
                <div className="space-y-4">
                  {[
                    { task: 'Complete 3 lessons',   current: 1, target: 3, from: '#6366f1', to: '#4338ca', icon: '📚' },
                    { task: 'Score 90%+ on a quiz', current: 0, target: 1, from: '#10b981', to: '#047857', icon: '🎯' },
                    { task: 'Ask AI 5 questions',   current: 3, target: 5, from: '#a855f7', to: '#6d28d9', icon: '💬' },
                  ].map((c, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-md"
                        style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}>
                        {c.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="font-bold text-slate-700">{c.task}</span>
                          <span className="font-bold text-slate-400">{c.current}/{c.target}</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${(c.current / c.target) * 100}%`, background: `linear-gradient(90deg, ${c.from}, ${c.to})` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
