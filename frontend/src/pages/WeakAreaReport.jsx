import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { weakAreaAPI } from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const WeakAreaReport = () => {
  const [weakAreas, setWeakAreas] = useState([]);
  const [stats, setStats] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeakAreas();
    fetchHeatmap();
  }, []);

  const fetchWeakAreas = async () => {
    try {
      const response = await weakAreaAPI.get();
      setWeakAreas(response.data.weakAreas);
      setStats(response.data.stats);
      setRecommendations(response.data.recommendations || []);
    } catch (error) {
      toast.error('Failed to load weak areas');
    } finally {
      setLoading(false);
    }
  };

  const fetchHeatmap = async () => {
    try {
      const response = await weakAreaAPI.getHeatmap();
      setHeatmap(response.data.heatmap || []);
    } catch (error) {
      console.error('Failed to load heatmap:', error);
    }
  };

  const getColorForScore = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTextColorForScore = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Prepare chart data
  const chartData = weakAreas.slice(0, 5).map((area) => ({
    subject: area.subject.substring(0, 15),
    score: Math.round(area.score_avg),
    fullName: area.subject
  }));

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto p-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Performance Analysis</h1>
          <p className="text-slate-400">Track your progress and identify areas for improvement</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" message="Analyzing performance..." />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="glassmorphism p-6 rounded-xl">
                <p className="text-slate-400 text-sm mb-1">Total Quizzes</p>
                <p className="text-4xl font-bold text-white">{stats?.totalQuizzes || 0}</p>
              </div>
              <div className="glassmorphism p-6 rounded-xl">
                <p className="text-slate-400 text-sm mb-1">Average Score</p>
                <p className={`text-4xl font-bold ${getTextColorForScore(stats?.averageScore || 0)}`}>
                  {stats?.averageScore || 0}%
                </p>
              </div>
              <div className="glassmorphism p-6 rounded-xl">
                <p className="text-slate-400 text-sm mb-1">Weak Areas</p>
                <p className="text-4xl font-bold text-red-400">{stats?.weakAreaCount || 0}</p>
              </div>
            </div>

            {/* Subject Performance Chart */}
            {chartData.length > 0 && (
              <div className="glassmorphism p-6 rounded-xl mb-8">
                <h3 className="text-xl font-bold text-white mb-6">Subject Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="subject" stroke="#94A3B8" />
                    <YAxis stroke="#94A3B8" domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1E293B',
                        border: '1px solid #475569',
                        borderRadius: '8px',
                        color: '#F1F5F9'
                      }}
                      labelStyle={{ color: '#94A3B8' }}
                    />
                    <Bar dataKey="score" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Performance Heatmap */}
            {heatmap.length > 0 && (
              <div className="glassmorphism p-6 rounded-xl mb-8">
                <h3 className="text-xl font-bold text-white mb-6">Topic Heatmap</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {heatmap.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg ${
                        item.level === 'strong'
                          ? 'bg-green-500/20 border border-green-500/30'
                          : item.level === 'average'
                          ? 'bg-yellow-500/20 border border-yellow-500/30'
                          : 'bg-red-500/20 border border-red-500/30'
                      }`}
                    >
                      <p className="text-sm font-semibold text-white mb-1">{item.topic}</p>
                      <p className="text-xs text-slate-400 mb-2">{item.subject}</p>
                      <div className="flex items-center justify-between">
                        <span className={`text-2xl font-bold ${getTextColorForScore(item.score)}`}>
                          {item.score}%
                        </span>
                        <span className="text-xs text-slate-500">{item.attempts} attempts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Recommendations */}
            {recommendations.length > 0 && (
              <div className="glassmorphism p-6 rounded-xl mb-8">
                <h3 className="text-xl font-bold text-white mb-4">📚 AI Study Recommendations</h3>
                <div className="space-y-3">
                  {recommendations.map((rec, idx) => (
                    <div key={idx} className="flex gap-3 p-4 bg-slate-700/50 rounded-lg">
                      <span className="text-2xl">{idx === 0 ? '🎯' : idx === 1 ? '💡' : '✨'}</span>
                      <p className="text-slate-300 leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weak Areas Detail */}
            {weakAreas.length > 0 ? (
              <div className="glassmorphism p-6 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Areas Needing Attention</h3>
                <div className="space-y-4">
                  {weakAreas.map((area, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">{area.topic}</h4>
                        <p className="text-sm text-slate-400">{area.subject}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${getTextColorForScore(area.score_avg)}`}>
                            {Math.round(area.score_avg)}%
                          </p>
                          <p className="text-xs text-slate-500">{area.attempts} attempts</p>
                        </div>
                        <div className="w-24 bg-slate-700 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${getColorForScore(area.score_avg)}`}
                            style={{ width: `${area.score_avg}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="glassmorphism p-16 rounded-xl text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-xl font-bold text-white mb-2">Great Job!</h3>
                <p className="text-slate-400">No weak areas detected. Keep up the excellent work!</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default WeakAreaReport;
