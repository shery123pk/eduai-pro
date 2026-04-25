import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const LearningPath = () => {
  const [learningPath, setLearningPath] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    currentLevel: 'Beginner',
    targetLevel: 'Intermediate',
    weakAreas: []
  });
  const [completedDays, setCompletedDays] = useState([]);

  const sidebarLinks = [
    { path: '/student', label: 'Home', icon: '🏠' },
    { path: '/student/chat', label: 'AI Chat', icon: '💬' },
    { path: '/student/homework', label: 'Homework Solver', icon: '📝' },
    { path: '/student/tutor', label: 'Smart Tutor', icon: '🎯' },
    { path: '/student/quiz', label: 'Quizzes', icon: '📊' },
    { path: '/student/learning-path', label: 'Learning Path', icon: '🗺️' },
    { path: '/student/weak-areas', label: 'Weak Areas', icon: '📈' },
    { path: '/student/gamification', label: 'Achievements', icon: '🏆' },
    { path: '/student/videos', label: 'Videos', icon: '🎬' },
  ];

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formData.subject) {
      toast.error('Please enter a subject');
      return;
    }

    setGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/learning-path/generate`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLearningPath(response.data.learningPath);
      setCompletedDays([]);
      toast.success('Learning path generated! 🎉');
    } catch (error) {
      console.error('Error generating path:', error);
      toast.error('Failed to generate learning path');
    } finally {
      setGenerating(false);
    }
  };

  const handleCompleteDay = async (day) => {
    if (completedDays.includes(day)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/learning-path/complete-day`,
        { day, points: 50 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCompletedDays([...completedDays, day]);
      toast.success(`Day ${day} completed! +50 points! 🎉`, { duration: 3000 });
    } catch (error) {
      console.error('Error completing day:', error);
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      Easy: 'from-green-500 to-emerald-500',
      Medium: 'from-blue-500 to-cyan-500',
      Hard: 'from-orange-500 to-red-500',
      Expert: 'from-purple-500 to-pink-500'
    };
    return colors[difficulty] || 'from-gray-500 to-slate-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      <div className="flex">
        <Sidebar links={sidebarLinks} />

        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl">
                  <span className="text-3xl">🗺️</span>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Personalized Learning Path
                  </h1>
                  <p className="text-slate-400">AI-generated roadmap to mastery</p>
                </div>
              </div>
            </div>

            {!learningPath ? (
              /* Generate Form */
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
                <div className="max-w-2xl mx-auto">
                  <div className="text-center mb-8">
                    <div className="text-6xl mb-4">🎯</div>
                    <h2 className="text-2xl font-bold text-white mb-2">Create Your Learning Journey</h2>
                    <p className="text-slate-400">
                      Tell us what you want to learn, and AI will create a personalized 7-day path
                    </p>
                  </div>

                  <form onSubmit={handleGenerate} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        What subject do you want to master?
                      </label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="e.g., Algebra, Physics, Chemistry..."
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Current Level
                        </label>
                        <select
                          value={formData.currentLevel}
                          onChange={(e) => setFormData({ ...formData, currentLevel: e.target.value })}
                          className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option>Beginner</option>
                          <option>Intermediate</option>
                          <option>Advanced</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Target Level
                        </label>
                        <select
                          value={formData.targetLevel}
                          onChange={(e) => setFormData({ ...formData, targetLevel: e.target.value })}
                          className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option>Intermediate</option>
                          <option>Advanced</option>
                          <option>Expert</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={generating}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {generating ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span>Generating Your Path...</span>
                        </>
                      ) : (
                        <>
                          <span>✨ Generate My Learning Path</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              /* Display Learning Path */
              <div className="space-y-6">
                {/* Path Overview */}
                <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-2xl p-8 relative overflow-hidden">
                  <div className="relative z-10">
                    <h2 className="text-3xl font-bold text-white mb-2">{learningPath.title}</h2>
                    <div className="flex flex-wrap gap-4 text-white/90">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">📅</span>
                        <span>{learningPath.totalDays} Days</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">⏱️</span>
                        <span>{learningPath.estimatedHours} Hours</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🎯</span>
                        <span>{completedDays.length}/{learningPath.totalDays} Completed</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                </div>

                {/* Progress Bar */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-400 text-sm">Overall Progress</span>
                    <span className="text-white font-semibold">
                      {Math.round((completedDays.length / learningPath.totalDays) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-4">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${(completedDays.length / learningPath.totalDays) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Daily Plan */}
                <div className="space-y-4">
                  {learningPath.days?.map((dayPlan, idx) => {
                    const isCompleted = completedDays.includes(dayPlan.day);
                    const isCurrent = !isCompleted && completedDays.length + 1 === dayPlan.day;

                    return (
                      <div
                        key={idx}
                        className={`bg-slate-800/50 backdrop-blur-sm border rounded-xl p-6 transition-all duration-300 ${
                          isCompleted
                            ? 'border-green-500/50 bg-green-500/5'
                            : isCurrent
                            ? 'border-purple-500/50 ring-2 ring-purple-500/20'
                            : 'border-slate-700/50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold ${
                                isCompleted
                                  ? 'bg-green-500 text-white'
                                  : isCurrent
                                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                                  : 'bg-slate-700 text-slate-400'
                              }`}
                            >
                              {isCompleted ? '✓' : dayPlan.day}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-white">{dayPlan.title}</h3>
                              <div className="flex items-center gap-3 mt-1">
                                <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${getDifficultyColor(dayPlan.difficulty)} text-white`}>
                                  {dayPlan.difficulty}
                                </span>
                                <span className="text-sm text-slate-400">
                                  ⏱️ {dayPlan.estimatedMinutes} mins
                                </span>
                                <span className="text-sm text-slate-400">
                                  📝 {dayPlan.exercises} exercises
                                </span>
                              </div>
                            </div>
                          </div>

                          {!isCompleted && isCurrent && (
                            <button
                              onClick={() => handleCompleteDay(dayPlan.day)}
                              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-300"
                            >
                              Mark Complete
                            </button>
                          )}

                          {isCompleted && (
                            <span className="text-green-400 font-semibold flex items-center gap-2">
                              <span>✓</span>
                              <span>Completed!</span>
                            </span>
                          )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-300 mb-2">📚 Topics</h4>
                            <ul className="space-y-1">
                              {dayPlan.topics?.map((topic, i) => (
                                <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                                  <span className="text-purple-400">•</span>
                                  <span>{topic}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="text-sm font-semibold text-slate-300 mb-2">🎯 Key Concepts</h4>
                            <ul className="space-y-1">
                              {dayPlan.concepts?.map((concept, i) => (
                                <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                                  <span className="text-pink-400">•</span>
                                  <span>{concept}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Milestones */}
                {learningPath.milestones && learningPath.milestones.length > 0 && (
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <span>🏆</span>
                      <span>Milestones & Rewards</span>
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      {learningPath.milestones.map((milestone, idx) => {
                        const isUnlocked = completedDays.length >= milestone.day;
                        return (
                          <div
                            key={idx}
                            className={`p-4 rounded-xl border ${
                              isUnlocked
                                ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50'
                                : 'bg-slate-700/30 border-slate-600'
                            }`}
                          >
                            <div className="text-3xl mb-2">{isUnlocked ? '🏆' : '🔒'}</div>
                            <h4 className="font-semibold text-white mb-1">{milestone.achievement}</h4>
                            <p className="text-sm text-slate-400">Day {milestone.day}</p>
                            <p className="text-sm font-semibold text-yellow-400 mt-2">
                              +{milestone.reward} points
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setLearningPath(null)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-xl transition-all"
                  >
                    Generate New Path
                  </button>
                  <Link
                    to="/student"
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl transition-all text-center"
                  >
                    Back to Dashboard
                  </Link>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default LearningPath;
