import { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

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

const demoStudents = [
  { id: 1,  name: 'Ahmed Hassan',     grade: 'Grade 10', subject: 'Mathematics', avatar: '👦', progress: 82, streak: 8,  quizzes: 14, xp: 2200, lastActive: '1h ago',   status: 'active'   },
  { id: 2,  name: 'Fatima Khan',      grade: 'Grade 11', subject: 'Biology',     avatar: '👧', progress: 91, streak: 12, quizzes: 18, xp: 3100, lastActive: '30m ago',  status: 'active'   },
  { id: 3,  name: 'Usman Ali',        grade: 'Grade 9',  subject: 'Physics',     avatar: '👦', progress: 58, streak: 3,  quizzes: 7,  xp: 900,  lastActive: '2d ago',   status: 'inactive' },
  { id: 4,  name: 'Ayesha Siddiqui',  grade: 'Grade 10', subject: 'Chemistry',   avatar: '👧', progress: 74, streak: 6,  quizzes: 11, xp: 1600, lastActive: '3h ago',   status: 'active'   },
  { id: 5,  name: 'Muhammad Bilal',   grade: 'Grade 11', subject: 'Mathematics', avatar: '👦', progress: 66, streak: 5,  quizzes: 9,  xp: 1250, lastActive: '5h ago',   status: 'active'   },
  { id: 6,  name: 'Sara Mahmood',     grade: 'Grade 9',  subject: 'English',     avatar: '👧', progress: 88, streak: 10, quizzes: 16, xp: 2700, lastActive: '1d ago',   status: 'inactive' },
  { id: 7,  name: 'Hamza Tariq',      grade: 'Grade 10', subject: 'Biology',     avatar: '👦', progress: 45, streak: 2,  quizzes: 5,  xp: 620,  lastActive: '3d ago',   status: 'inactive' },
  { id: 8,  name: 'Zainab Iqbal',     grade: 'Grade 11', subject: 'Physics',     avatar: '👧', progress: 79, streak: 7,  quizzes: 13, xp: 1980, lastActive: '4h ago',   status: 'active'   },
  { id: 9,  name: 'Ali Raza',         grade: 'Grade 9',  subject: 'Mathematics', avatar: '👦', progress: 52, streak: 1,  quizzes: 4,  xp: 450,  lastActive: '2d ago',   status: 'inactive' },
  { id: 10, name: 'Maryam Asif',      grade: 'Grade 10', subject: 'English',     avatar: '👧', progress: 95, streak: 15, quizzes: 22, xp: 3800, lastActive: '20m ago',  status: 'active'   },
];

const gradeColors = {
  'Grade 9':  'bg-blue-100 text-blue-700 border-blue-200',
  'Grade 10': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'Grade 11': 'bg-purple-100 text-purple-700 border-purple-200',
};
const subjectColors = {
  Mathematics: 'bg-indigo-50 text-indigo-700',
  Biology:     'bg-green-50 text-green-700',
  Physics:     'bg-purple-50 text-purple-700',
  Chemistry:   'bg-amber-50 text-amber-700',
  English:     'bg-pink-50 text-pink-700',
};

function progressColor(p) {
  if (p >= 80) return '#16a34a';
  if (p >= 60) return '#d97706';
  return '#dc2626';
}

export default function StudentManager() {
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('All');
  const [selected, setSelected] = useState(null);

  const grades = ['All', 'Grade 9', 'Grade 10', 'Grade 11'];

  const visible = demoStudents.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                        s.subject.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || s.grade === filter;
    return matchSearch && matchFilter;
  });

  const active   = demoStudents.filter(s => s.status === 'active').length;
  const avgProg  = Math.round(demoStudents.reduce((a, s) => a + s.progress, 0) / demoStudents.length);
  const avgStreak = Math.round(demoStudents.reduce((a, s) => a + s.streak, 0) / demoStudents.length);

  return (
    <div className="min-h-screen bg-ultra-modern">
      <Navbar />
      <div className="flex">
        <Sidebar links={sidebarLinks} />
        <main className="flex-1 p-5 md:p-8 overflow-auto">
          <div className="max-w-5xl mx-auto space-y-6">

            {/* Header */}
            <div>
              <h1 className="text-3xl font-black text-slate-900">👨‍🎓 My Students</h1>
              <p className="text-slate-500 font-medium mt-1">Track your students' progress and activity</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Students', value: demoStudents.length, icon: '👨‍🎓', color: '#6366f1' },
                { label: 'Active Today',   value: active,              icon: '🟢', color: '#16a34a' },
                { label: 'Avg Progress',   value: `${avgProg}%`,       icon: '📈', color: '#d97706' },
                { label: 'Avg Streak',     value: `${avgStreak} days`, icon: '🔥', color: '#dc2626' },
              ].map(s => (
                <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-xs font-bold text-slate-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Search + Filter */}
            <div className="flex flex-wrap gap-3 items-center">
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or subject..."
                className="flex-1 min-w-52 px-4 py-3 rounded-xl bg-white border-2 border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-indigo-400 transition-all placeholder:text-slate-400" />
              <div className="flex gap-2 flex-wrap">
                {grades.map(g => (
                  <button key={g} onClick={() => setFilter(g)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-black transition-all ${
                      filter === g
                        ? 'text-white shadow-md'
                        : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-indigo-300'
                    }`}
                    style={filter === g ? { background: 'linear-gradient(135deg, #6366f1, #4338ca)' } : {}}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Students Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visible.map(s => (
                <div key={s.id}
                  className={`bg-white border-2 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                    selected === s.id ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-slate-200 hover:border-indigo-200'
                  }`}
                  onClick={() => setSelected(selected === s.id ? null : s.id)}>

                  {/* Top row */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-3xl bg-slate-50 border border-slate-200 flex-shrink-0">
                      {s.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-black text-slate-900">{s.name}</h3>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${gradeColors[s.grade]}`}>{s.grade}</span>
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.status === 'active' ? 'bg-green-500' : 'bg-slate-300'}`} />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${subjectColors[s.subject] || 'bg-slate-50 text-slate-600'}`}>
                          {s.subject}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">Last active: {s.lastActive}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-slate-600">Overall Progress</span>
                      <span style={{ color: progressColor(s.progress) }}>{s.progress}%</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${s.progress}%`, background: `linear-gradient(90deg, ${progressColor(s.progress)}, ${progressColor(s.progress)}aa)` }} />
                    </div>
                  </div>

                  {/* Mini stats */}
                  <div className="flex gap-3">
                    {[
                      { icon: '🔥', val: `${s.streak}d`, label: 'Streak' },
                      { icon: '📊', val: s.quizzes,       label: 'Quizzes' },
                      { icon: '⭐', val: s.xp,            label: 'XP' },
                    ].map(stat => (
                      <div key={stat.label} className="flex-1 bg-slate-50 rounded-xl py-2 text-center border border-slate-100">
                        <div className="text-base">{stat.icon}</div>
                        <div className="text-sm font-black text-slate-800">{stat.val}</div>
                        <div className="text-xs text-slate-400 font-medium">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Expanded detail */}
                  {selected === s.id && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 animate-fade-scale">
                      <p className="text-xs font-black text-slate-500 uppercase tracking-wide mb-2">Detailed Stats</p>
                      {[
                        { label: 'Total XP Earned',    value: `${s.xp.toLocaleString()} XP` },
                        { label: 'Quizzes Completed',  value: `${s.quizzes} quizzes` },
                        { label: 'Current Streak',     value: `${s.streak} days` },
                        { label: 'Status',             value: s.status === 'active' ? '🟢 Active today' : '⚫ Inactive (2+ days)' },
                        { label: 'Primary Subject',    value: s.subject },
                      ].map(row => (
                        <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-slate-50">
                          <span className="text-xs font-bold text-slate-500">{row.label}</span>
                          <span className="text-xs font-black text-slate-800">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {visible.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                <div className="text-4xl mb-3">🔍</div>
                <p className="font-black text-slate-600">No students found for "{search}"</p>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
