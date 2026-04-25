import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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

const masteryInfo = {
  not_started: { label: 'Not Started', color: 'text-slate-400',  dot: 'bg-slate-300' },
  attempted:   { label: 'Attempted',   color: 'text-red-500',    dot: 'bg-red-400' },
  familiar:    { label: 'Familiar',    color: 'text-yellow-600', dot: 'bg-yellow-400' },
  proficient:  { label: 'Proficient',  color: 'text-blue-600',   dot: 'bg-blue-500' },
  mastered:    { label: 'Mastered',    color: 'text-green-600',  dot: 'bg-green-500' },
};

const subjectGradients = {
  Mathematics: 'from-indigo-500 to-blue-600',
  Physics:     'from-purple-500 to-violet-600',
  Chemistry:   'from-green-500 to-emerald-600',
  Biology:     'from-orange-400 to-red-500',
  default:     'from-slate-500 to-slate-700',
};

export default function CourseViewer() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLessons, setLoadingLessons] = useState(false);

  useEffect(() => { fetchCourse(); }, [courseId]);
  useEffect(() => { if (selectedUnit) fetchLessons(selectedUnit.id); }, [selectedUnit]);

  const fetchCourse = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/curriculum/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourse(res.data.course);
      setUnits(res.data.units);
      if (res.data.units.length > 0) setSelectedUnit(res.data.units[0]);
    } catch { toast.error('Failed to load course'); }
    finally { setLoading(false); }
  };

  const fetchLessons = async (unitId) => {
    setLoadingLessons(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/curriculum/units/${unitId}/lessons`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLessons(res.data.lessons);
    } catch { toast.error('Failed to load lessons'); }
    finally { setLoadingLessons(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ultra-modern flex items-center justify-center">
        <div className="loader-modern"></div>
      </div>
    );
  }

  const gradient = subjectGradients[course?.subject] || subjectGradients.default;

  return (
    <div className="min-h-screen bg-ultra-modern">
      <Navbar />
      <div className="flex">
        <Sidebar links={sidebarLinks} />
        <main className="flex-1 overflow-auto">

          {/* Course Hero */}
          {course && (
            <div className={`relative bg-gradient-to-r ${gradient} p-6 md:p-8`}>
              <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-2 text-xs text-white/70 mb-3 font-medium">
                  <Link to="/student/courses" className="hover:text-white transition-colors">Courses</Link>
                  <span>/</span>
                  <span className="text-white font-bold">{course.title}</span>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-4xl flex-shrink-0 shadow-lg">
                    {course.thumbnail}
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-black text-white">{course.title}</h1>
                    <p className="text-white/80 text-sm mt-1 font-medium max-w-2xl">{course.description}</p>
                    <div className="flex gap-4 mt-3 text-xs font-bold text-white/70">
                      <span className="bg-white/15 px-3 py-1 rounded-full">{course.subject}</span>
                      <span className="bg-white/15 px-3 py-1 rounded-full">📖 {course.totalUnits} units</span>
                      <span className="bg-white/15 px-3 py-1 rounded-full">⏱️ {course.estimatedHours}h</span>
                      <span className="bg-white/15 px-3 py-1 rounded-full">🎓 {course.level}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-5 md:p-8">
            <div className="max-w-5xl mx-auto">

              {/* Mastery legend */}
              <div className="flex flex-wrap gap-3 mb-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <span className="text-xs font-black text-slate-700 mr-1">Mastery Levels:</span>
                {Object.entries(masteryInfo).map(([level, info]) => (
                  <div key={level} className="flex items-center gap-1.5 text-xs">
                    <div className={`w-2.5 h-2.5 rounded-full ${info.dot}`} />
                    <span className={`${info.color} font-semibold`}>{info.label}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Units list */}
                <div className="space-y-2">
                  <h2 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-3">Units</h2>
                  {units.map((unit, idx) => (
                    <button key={unit.id} onClick={() => setSelectedUnit(unit)}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                        selectedUnit?.id === unit.id
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 border-indigo-400 text-white shadow-lg shadow-indigo-200'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:shadow-md'
                      }`}>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-black w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          selectedUnit?.id === unit.id ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-600'
                        }`}>{idx + 1}</span>
                        <div className="min-w-0">
                          <div className="text-sm font-black truncate">{unit.title}</div>
                          <div className={`text-xs mt-0.5 font-medium ${selectedUnit?.id === unit.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {unit.totalLessons} lessons
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Lessons panel */}
                <div className="lg:col-span-2 space-y-4">
                  {selectedUnit && (
                    <>
                      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <h2 className="text-lg font-black text-slate-900">{selectedUnit.title}</h2>
                        <p className="text-slate-500 text-sm mt-1 font-medium">{selectedUnit.description}</p>
                        {selectedUnit.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {selectedUnit.skills.map(skill => (
                              <span key={skill} className="text-xs font-bold px-3 py-1 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {loadingLessons ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map(i => <div key={i} className="skeleton-modern h-20" />)}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {lessons.map((lesson, idx) => (
                            <Link key={lesson.id} to={`/student/lessons/${lesson.id}`}
                              className="flex items-center gap-4 p-4 rounded-2xl bg-white border-2 border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all group">
                              <span className="text-xs font-black text-slate-400 w-5 flex-shrink-0">{idx + 1}</span>
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                                lesson.type === 'video' ? 'bg-indigo-100' : 'bg-green-100'
                              }`}>
                                {lesson.type === 'video' ? '🎬' : '📖'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-black text-slate-900 group-hover:text-indigo-700 transition-colors truncate">
                                  {lesson.title}
                                </div>
                                <div className="text-xs text-slate-400 font-medium mt-0.5 truncate">{lesson.description}</div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {lesson.duration && (
                                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">{lesson.duration}m</span>
                                )}
                                {lesson.hasExercise && (
                                  <span className="text-xs font-bold px-2 py-1 rounded-lg bg-indigo-100 text-indigo-600">
                                    + Practice
                                  </span>
                                )}
                                <span className="text-slate-300 group-hover:text-indigo-500 transition-colors">→</span>
                              </div>
                            </Link>
                          ))}
                          {lessons.length === 0 && (
                            <div className="text-center py-10 bg-white rounded-2xl border border-slate-200">
                              <div className="text-4xl mb-2">📭</div>
                              <p className="text-slate-500 text-sm font-medium">No lessons in this unit yet.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
