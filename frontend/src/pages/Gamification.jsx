import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Gamification = () => {
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [rankInfo, setRankInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const sidebarLinks = [
    { path: '/student', label: 'Home', icon: '🏠' },
    { path: '/student/chat', label: 'AI Chat', icon: '💬' },
    { path: '/student/homework', label: 'Homework Solver', icon: '📝' },
    { path: '/student/tutor', label: 'Smart Tutor', icon: '🎯' },
    { path: '/student/quiz', label: 'Quizzes', icon: '📊' },
    { path: '/student/learning-path', label: 'Learning Path', icon: '🗺️' },
    { path: '/student/gamification', label: 'Achievements', icon: '🏆' },
    { path: '/student/videos', label: 'Videos', icon: '🎬' },
  ];

  useEffect(() => {
    fetchGamificationData();
  }, []);

  const fetchGamificationData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [statsRes, leaderboardRes, challengesRes, rankRes] = await Promise.all([
        axios.get(`${API_URL}/api/gamification/stats`, config),
        axios.get(`${API_URL}/api/gamification/leaderboard`, config),
        axios.get(`${API_URL}/api/gamification/daily-challenges`, config),
        axios.get(`${API_URL}/api/gamification/rank-info`, config)
      ]);

      setStats(statsRes.data);
      setLeaderboard(leaderboardRes.data.leaderboard);
      setChallenges(challengesRes.data.challenges);
      setRankInfo(rankRes.data);
    } catch (error) {
      console.error('Error fetching gamification data:', error);
      toast.error('Failed to load gamification data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading your achievements..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      <div className="flex">
        <Sidebar links={sidebarLinks} />

        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-3 rounded-xl">
                <span className="text-3xl">🏆</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Achievements & Rewards
                </h1>
                <p className="text-slate-400">Track your progress and compete with others</p>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:scale-105 transition-transform">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-slate-400 text-sm">Total Points</h3>
                  <span className="text-3xl">⭐</span>
                </div>
                <p className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  {stats?.totalPoints || 0}
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:scale-105 transition-transform">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-slate-400 text-sm">Current Streak</h3>
                  <span className="text-3xl">🔥</span>
                </div>
                <p className="text-4xl font-bold text-orange-400">{stats?.currentStreak || 0} days</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:scale-105 transition-transform">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-slate-400 text-sm">Current Rank</h3>
                  <span className="text-3xl">{rankInfo?.currentRank?.icon}</span>
                </div>
                <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {rankInfo?.currentRank?.name || 'Bronze'}
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:scale-105 transition-transform">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-slate-400 text-sm">Level</h3>
                  <span className="text-3xl">📊</span>
                </div>
                <p className="text-4xl font-bold text-blue-400">{stats?.level || 1}</p>
              </div>
            </div>

            {/* Rank Progress */}
            {rankInfo && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Rank Progress</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400">
                    {rankInfo.currentRank?.name} → {rankInfo.nextRank?.name}
                  </span>
                  <span className="text-white font-semibold">
                    {rankInfo.pointsToNextRank} points to go
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-4">
                  <div
                    className={`bg-gradient-to-r ${rankInfo.currentRank?.color} h-4 rounded-full transition-all duration-500`}
                    style={{
                      width: `${
                        ((stats?.totalPoints - rankInfo.currentRank?.minPoints) /
                          (rankInfo.nextRank?.minPoints - rankInfo.currentRank?.minPoints)) *
                        100
                      }%`
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Daily Challenges */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Daily Challenges</h3>
                <span className="text-sm text-slate-400">Resets in {challenges[0]?.resetIn || '24 hours'}</span>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {challenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className={`p-4 rounded-xl border ${
                      challenge.completed
                        ? 'bg-green-500/10 border-green-500/50'
                        : 'bg-slate-700/30 border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-white mb-1">{challenge.title}</h4>
                        <p className="text-sm text-slate-400">{challenge.description}</p>
                      </div>
                      {challenge.completed && <span className="text-2xl">✅</span>}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 bg-slate-700 rounded-full h-2 mr-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-slate-400">
                        {challenge.progress}/{challenge.target}
                      </span>
                    </div>
                    <div className="mt-2 text-sm font-semibold text-yellow-400">
                      Reward: +{challenge.reward} points
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Achievements */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Achievements</h3>
                <div className="space-y-3">
                  {stats?.achievements?.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg flex items-start gap-3 ${
                        achievement.unlocked
                          ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30'
                          : 'bg-slate-700/30 opacity-50'
                      }`}
                    >
                      <span className="text-2xl">{achievement.unlocked ? achievement.name.split(' ')[0] : '🔒'}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">{achievement.name}</h4>
                        <p className="text-sm text-slate-400">{achievement.description}</p>
                        {achievement.unlocked && achievement.date && (
                          <p className="text-xs text-green-400 mt-1">
                            Unlocked: {new Date(achievement.date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leaderboard */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Leaderboard</h3>
                <div className="space-y-2">
                  {leaderboard.map((user) => (
                    <div
                      key={user.rank}
                      className={`p-4 rounded-lg flex items-center gap-4 ${
                        user.isCurrentUser
                          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50'
                          : 'bg-slate-700/30 hover:bg-slate-700/50'
                      } transition-all`}
                    >
                      <div className="text-2xl font-bold w-8">{user.rank <= 3 ? user.avatar : user.rank}</div>
                      <div className="flex-1">
                        <p className={`font-semibold ${user.isCurrentUser ? 'text-purple-400' : 'text-white'}`}>
                          {user.name}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                          <span>⭐ {user.points}</span>
                          <span>🔥 {user.streak} days</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Earned Badges</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {stats?.badges?.map((badge, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600 rounded-xl p-4 text-center hover:scale-110 transition-transform"
                  >
                    <div className="text-4xl mb-2">{badge.icon}</div>
                    <p className="text-sm font-semibold text-white mb-1">{badge.name}</p>
                    <p className="text-xs text-slate-400">×{badge.count}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Gamification;
