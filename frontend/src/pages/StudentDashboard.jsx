import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { quizAPI, weakAreaAPI, coursesAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const StudentDashboard = () => {
  const [stats, setStats] = useState({
    quizzesTaken: 0,
    avgScore: 0,
    coursesJoined: 0
  });
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const sidebarLinks = [
    { path: '/student', label: 'Home', icon: '🏠' },
    { path: '/student/chat', label: 'AI Chat', icon: '💬' },
    { path: '/student/homework', label: 'Homework Solver', icon: '📝' },
    { path: '/student/tutor', label: 'Smart Tutor', icon: '🎯' },
    { path: '/student/quiz', label: 'Quizzes', icon: '📊' },
    { path: '/student/weak-areas', label: 'Weak Areas', icon: '📈' }
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [quizHistory, weakAreaData, coursesData] = await Promise.all([
        quizAPI.getHistory(),
        weakAreaAPI.get(),
        coursesAPI.getAll()
      ]);

      setRecentQuizzes(quizHistory.data.attempts.slice(0, 5));
      setCourses(coursesData.data.courses);

      setStats({
        quizzesTaken: quizHistory.data.attempts.length,
        avgScore: weakAreaData.data.stats.averageScore || 0,
        coursesJoined: coursesData.data.courses.length
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex">
        <Sidebar links={sidebarLinks} />

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold gradient-text mb-2">Student Dashboard</h1>
              <p className="text-slate-400">Welcome back! Ready to learn?</p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" message="Loading dashboard..." />
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="glassmorphism p-6 rounded-xl card-hover">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Quizzes Taken</p>
                        <p className="text-3xl font-bold text-white">{stats.quizzesTaken}</p>
                      </div>
                      <div className="text-4xl">📊</div>
                    </div>
                  </div>

                  <div className="glassmorphism p-6 rounded-xl card-hover">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Average Score</p>
                        <p className="text-3xl font-bold text-primary">{stats.avgScore}%</p>
                      </div>
                      <div className="text-4xl">🎯</div>
                    </div>
                  </div>

                  <div className="glassmorphism p-6 rounded-xl card-hover">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Courses Joined</p>
                        <p className="text-3xl font-bold text-white">{stats.coursesJoined}</p>
                      </div>
                      <div className="text-4xl">📚</div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <Link
                    to="/student/chat"
                    className="glassmorphism p-6 rounded-xl card-hover group"
                  >
                    <div className="text-4xl mb-3">💬</div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:gradient-text transition-all">
                      Chat with AI
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Ask questions about your courses using RAG-powered AI
                    </p>
                  </Link>

                  <Link
                    to="/student/homework"
                    className="glassmorphism p-6 rounded-xl card-hover group"
                  >
                    <div className="text-4xl mb-3">📝</div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:gradient-text transition-all">
                      Solve Homework
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Upload a photo of your homework and get step-by-step solutions
                    </p>
                  </Link>

                  <Link
                    to="/student/tutor"
                    className="glassmorphism p-6 rounded-xl card-hover group"
                  >
                    <div className="text-4xl mb-3">🎯</div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:gradient-text transition-all">
                      Smart Tutor
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Get personalized help from AI tutors in Math, Science & more
                    </p>
                  </Link>

                  <Link
                    to="/student/quiz"
                    className="glassmorphism p-6 rounded-xl card-hover group"
                  >
                    <div className="text-4xl mb-3">📊</div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:gradient-text transition-all">
                      Take a Quiz
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Test your knowledge with AI-generated quizzes
                    </p>
                  </Link>

                  <Link
                    to="/student/weak-areas"
                    className="glassmorphism p-6 rounded-xl card-hover group"
                  >
                    <div className="text-4xl mb-3">📈</div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:gradient-text transition-all">
                      Weak Areas
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Analyze your performance and get improvement tips
                    </p>
                  </Link>
                </div>

                {/* Recent Activity */}
                <div className="glassmorphism p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-white mb-4">Recent Quizzes</h3>

                  {recentQuizzes.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">
                      No quizzes taken yet. Take your first quiz to get started!
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {recentQuizzes.map((quiz) => (
                        <div
                          key={quiz.id}
                          className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                        >
                          <div>
                            <p className="font-semibold text-white">{quiz.title}</p>
                            <p className="text-sm text-slate-400">{quiz.course_title}</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-2xl font-bold ${quiz.score >= 70 ? 'text-green-400' : 'text-yellow-400'}`}>
                              {quiz.score}%
                            </p>
                            <p className="text-xs text-slate-500">
                              {new Date(quiz.completed_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
