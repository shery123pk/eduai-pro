import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
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

const subjectColors = {
  Mathematics: { bg: 'bg-indigo-50', border: 'border-indigo-200', icon: 'bg-indigo-500', text: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-600' },
  Physics:     { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'bg-purple-500', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-600' },
  Chemistry:   { bg: 'bg-green-50',  border: 'border-green-200',  icon: 'bg-green-500',  text: 'text-green-700',  badge: 'bg-green-100 text-green-600' },
  Biology:     { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'bg-orange-500', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-600' },
  default:     { bg: 'bg-slate-50',  border: 'border-slate-200',  icon: 'bg-slate-500',  text: 'text-slate-700',  badge: 'bg-slate-100 text-slate-600' },
};

export default function CourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/curriculum/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const list = res.data?.courses || res.data || [];
      setCourses(Array.isArray(list) ? list : []);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        toast.error('Session expired — please log in again');
      } else {
        toast.error(`Failed to load courses (${status || 'network error'})`);
      }
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const subjects = ['all', ...new Set(courses.map(c => c.subject))];
  const visible = filter === 'all' ? courses : courses.filter(c => c.subject === filter);

  return (
    <div className="min-h-screen bg-ultra-modern">
      <Navbar />
      <div className="flex">
        <Sidebar links={sidebarLinks} />
        <main className="flex-1 p-5 md:p-8 overflow-auto">
          <div className="max-w-5xl mx-auto space-y-6">

            <div className="animate-slide-in">
              <h1 className="text-3xl font-black text-slate-900">Course Catalog</h1>
              <p className="text-slate-500 text-base mt-1 font-medium">
                Video lessons, exercises, and mastery-based progression
              </p>
            </div>

            {/* Subject filter */}
            <div className="flex flex-wrap gap-2">
              {subjects.map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                    filter === s
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-200'
                      : 'bg-white text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200'
                  }`}>
                  {s === 'all' ? 'All Subjects' : s}
                </button>
              ))}
            </div>

            {/* How it works */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-base font-black text-slate-900 mb-4">How Mastery-Based Learning Works</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { step: '1', label: 'Watch', desc: 'Video lesson for the concept', color: 'bg-indigo-500' },
                  { step: '2', label: 'Practice', desc: 'Interactive exercises with hints', color: 'bg-purple-500' },
                  { step: '3', label: 'Master', desc: 'Progress through 5 mastery levels', color: 'bg-orange-500' },
                  { step: '4', label: 'Advance', desc: 'Unlock the next unit', color: 'bg-green-500' },
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-7 h-7 ${s.color} rounded-lg flex items-center justify-center text-white text-xs font-black flex-shrink-0`}>{s.step}</div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{s.label}</p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Course grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="skeleton-modern h-40" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visible.map(course => {
                  const colors = subjectColors[course.subject] || subjectColors.default;
                  return (
                    <Link key={course.id} to={`/student/courses/${course.id}`}
                      className={`${colors.bg} border ${colors.border} rounded-2xl p-5 hover:shadow-lg transition-all group hover:-translate-y-1`}>
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 ${colors.icon} rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-md`}>
                          {course.thumbnail}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${colors.badge}`}>{course.subject}</span>
                          </div>
                          <h3 className={`font-black text-slate-900 group-hover:${colors.text} transition-colors text-base`}>
                            {course.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 font-medium line-clamp-2">{course.description}</p>
                          <div className="flex gap-4 mt-3 text-xs font-bold text-slate-400">
                            <span>📖 {course.totalUnits} units</span>
                            <span>⏱️ {course.estimatedHours}h</span>
                            <span>🎓 {course.level}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {!loading && visible.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                <div className="text-5xl mb-3">🔍</div>
                <p className="font-bold text-slate-700">No courses found for this subject.</p>
                <p className="text-sm text-slate-400 mt-1">Try selecting a different subject filter.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
