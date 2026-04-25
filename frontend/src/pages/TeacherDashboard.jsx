import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const sidebarLinks = [
  { path: '/teacher',               label: 'Dashboard',     icon: '🏠' },
  { path: '/teacher/students',      label: 'My Students',   icon: '👨‍🎓' },
  { path: '/teacher/assignments',   label: 'Assignments',   icon: '📋' },
  { path: '/teacher/announcements', label: 'Announcements', icon: '📢' },
  { path: '/student/videos',        label: 'Video Library', icon: '🎬' },
  { path: '/student/tools',         label: 'AI Tools',      icon: '🛠️' },
  { path: '/student/quiz',          label: 'AI Quiz',       icon: '📊' },
  { path: '/student/homework',      label: 'Homework',      icon: '📝' },
  { path: '/student/chat',          label: 'AI Chat',       icon: '💬' },
];

const quickTools = [
  { title: 'My Students',       desc: 'View all student progress & activity',         icon: '👨‍🎓', path: '/teacher/students',      from: '#6366f1', to: '#4338ca' },
  { title: 'Assignments',       desc: 'Create and manage student assignments',         icon: '📋', path: '/teacher/assignments',   from: '#059669', to: '#047857' },
  { title: 'Announcements',     desc: 'Post class messages visible to all students',  icon: '📢', path: '/teacher/announcements', from: '#d97706', to: '#b45309' },
  { title: 'Video Library',     desc: 'Add & remove educational videos for students', icon: '🎬', path: '/student/videos',        from: '#0891b2', to: '#0e7490' },
  { title: 'AI Tools Hub',      desc: 'Concept explainer, flashcards, lesson planner',icon: '🛠️', path: '/student/tools',         from: '#ec4899', to: '#be185d' },
  { title: 'AI Quiz Generator', desc: 'Generate MCQ quizzes on any topic instantly',  icon: '📊', path: '/student/quiz',          from: '#7c3aed', to: '#4c1d95' },
  { title: 'Homework Solver',   desc: 'AI step-by-step solutions for any problem',    icon: '📝', path: '/student/homework',      from: '#dc2626', to: '#b91c1c' },
  { title: 'AI Chat Tutor',     desc: '24/7 bilingual AI tutoring in English & Urdu', icon: '💬', path: '/student/chat',          from: '#f97316', to: '#c2410c' },
];

const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'General'];

export default function TeacherDashboard() {
  const { user } = useAuth();

  // Dynamic stats from localStorage
  const videoCount = (() => {
    try { return (JSON.parse(localStorage.getItem('eduai_videos') || '[]')).length; } catch { return 24; }
  })();
  const assignmentCount = (() => {
    try { return (JSON.parse(localStorage.getItem('teacher_assignments') || '[]')).length; } catch { return 0; }
  })();
  const announcementCount = (() => {
    try { return (JSON.parse(localStorage.getItem('teacher_announcements') || '[]')).length; } catch { return 0; }
  })();

  const stats = [
    { label: 'Total Students',  value: '10',               icon: '👨‍🎓', color: '#6366f1', path: '/teacher/students'      },
    { label: 'Videos Library',  value: String(videoCount), icon: '🎬', color: '#0891b2', path: '/student/videos'         },
    { label: 'Assignments',     value: String(assignmentCount),   icon: '📋', color: '#059669', path: '/teacher/assignments'   },
    { label: 'Announcements',   value: String(announcementCount), icon: '📢', color: '#d97706', path: '/teacher/announcements' },
  ];

  // Recent announcements preview
  const recentAnnouncements = (() => {
    try { return (JSON.parse(localStorage.getItem('teacher_announcements') || '[]')).slice(0, 3); } catch { return []; }
  })();

  // Recent assignments preview
  const recentAssignments = (() => {
    try { return (JSON.parse(localStorage.getItem('teacher_assignments') || '[]')).slice(0, 3); } catch { return []; }
  })();

  const [quizTopic, setQuizTopic] = useState('');
  const [quizSubject, setQuizSubject] = useState('Mathematics');

  const handleGoToQuiz = () => {
    if (!quizTopic.trim()) { toast.error('Enter a quiz topic first'); return; }
    window.location.href = '/student/quiz';
  };

  const priorityIcon = { info: 'ℹ️', important: '⚠️', urgent: '🚨' };

  return (
    <div className="min-h-screen bg-ultra-modern">
      <Navbar />
      <div className="flex">
        <Sidebar links={sidebarLinks} />
        <main className="flex-1 p-5 md:p-8 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-6">

            {/* ── Header ── */}
            <div className="rounded-2xl p-6 text-white flex items-center justify-between gap-4 flex-wrap"
              style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4f46e5 60%, #7c3aed 100%)' }}>
              <div>
                <p className="text-indigo-200 text-sm font-bold mb-1">Pak AI Tutor · GDG Hackathon 2026</p>
                <h1 className="text-3xl font-black">👩‍🏫 Teacher Dashboard</h1>
                <p className="text-indigo-200 font-medium mt-1">
                  Welcome, <span className="text-yellow-300 font-black">{user?.name || 'Teacher'}</span> — manage your class from one place
                </p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Link to="/teacher/announcements"
                  className="px-5 py-2.5 rounded-xl font-black text-white text-sm border-2 border-white/30 hover:bg-white/10 transition-all">
                  📢 Post Announcement
                </Link>
                <Link to="/teacher/assignments"
                  className="px-5 py-2.5 rounded-xl font-black text-sm shadow-md"
                  style={{ background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)' }}>
                  📋 New Assignment
                </Link>
              </div>
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map(s => (
                <Link key={s.label} to={s.path}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center hover:shadow-md hover:border-indigo-200 transition-all group">
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <div className="text-3xl font-black group-hover:scale-110 transition-transform" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-xs font-bold text-slate-500 mt-1">{s.label}</div>
                </Link>
              ))}
            </div>

            {/* ── Quick Quiz Generator ── */}
            <div className="bg-white border-2 border-indigo-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">⚡</span>
                <h2 className="text-lg font-black text-slate-900">Quick AI Quiz Generator</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select value={quizSubject} onChange={e => setQuizSubject(e.target.value)}
                  className="px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-800 font-semibold focus:outline-none focus:border-indigo-400">
                  {subjects.map(s => <option key={s}>{s}</option>)}
                </select>
                <input value={quizTopic} onChange={e => setQuizTopic(e.target.value)}
                  placeholder="Topic (e.g. Newton's Laws)"
                  className="px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-800 font-semibold focus:outline-none focus:border-indigo-400 placeholder:text-slate-400" />
                <button onClick={handleGoToQuiz}
                  className="py-3 rounded-xl font-black text-white text-sm shadow-md hover:opacity-90 transition-all"
                  style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}>
                  ✅ Generate Quiz
                </button>
              </div>
            </div>

            {/* ── All Tools Grid ── */}
            <div>
              <h2 className="text-xl font-black text-slate-900 mb-4">🛠️ All Teacher Tools</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {quickTools.map(tool => (
                  <Link key={tool.title} to={tool.path}
                    className="bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 shadow-sm"
                      style={{ background: `linear-gradient(135deg, ${tool.from}, ${tool.to})` }}>
                      {tool.icon}
                    </div>
                    <h3 className="font-black text-slate-900 text-sm group-hover:text-indigo-700 transition-colors">{tool.title}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-1 leading-snug">{tool.desc}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* ── Recent Announcements + Assignments ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Recent Announcements */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-black text-slate-900">📢 Recent Announcements</h2>
                  <Link to="/teacher/announcements" className="text-xs font-black text-indigo-600 hover:text-indigo-700">View all →</Link>
                </div>
                {recentAnnouncements.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm font-bold text-slate-400">No announcements yet</p>
                    <Link to="/teacher/announcements" className="text-xs text-indigo-500 font-bold mt-1 block">Post your first →</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentAnnouncements.map(a => (
                      <div key={a.id} className="flex gap-3 py-2 border-b border-slate-50 last:border-0">
                        <span className="text-lg flex-shrink-0">{priorityIcon[a.priority] || 'ℹ️'}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-800 truncate">{a.title}</p>
                          <p className="text-xs text-slate-500 font-medium truncate">{a.message}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{new Date(a.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Assignments */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-black text-slate-900">📋 Recent Assignments</h2>
                  <Link to="/teacher/assignments" className="text-xs font-black text-indigo-600 hover:text-indigo-700">View all →</Link>
                </div>
                {recentAssignments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm font-bold text-slate-400">No assignments yet</p>
                    <Link to="/teacher/assignments" className="text-xs text-indigo-500 font-bold mt-1 block">Create first assignment →</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentAssignments.map(a => {
                      const due = new Date(a.dueDate);
                      const isOverdue = !a.closed && due < new Date();
                      return (
                        <div key={a.id} className="flex gap-3 py-2 border-b border-slate-50 last:border-0">
                          <span className="text-lg flex-shrink-0">📋</span>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-slate-800 truncate">{a.title}</p>
                            <p className="text-xs text-slate-500 font-medium">{a.subject}</p>
                            <p className={`text-xs font-bold mt-0.5 ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
                              Due: {due.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* ── Vision Banner ── */}
            <div className="rounded-2xl p-5 text-white"
              style={{ background: 'linear-gradient(135deg, #4338ca 0%, #7c3aed 60%, #be185d 100%)' }}>
              <div className="flex items-start gap-4">
                <span className="text-3xl flex-shrink-0">💡</span>
                <div>
                  <h3 className="text-lg font-black mb-1">Ms Sharmeen Asif's Vision</h3>
                  <p className="text-white/90 text-sm font-medium leading-relaxed">
                    "Empowering every student with Advanced AI, IT and Computer Science Education — for All,
                    regardless of background or location. Every student deserves a patient, always-available tutor."
                  </p>
                  <p className="text-white/55 text-xs font-bold mt-2">— Founder & Visionary · Pak AI Tutor · GDG Hackathon 2026</p>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
