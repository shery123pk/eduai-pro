// Gamification API - Points, Streaks, Achievements, Leaderboard
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { query, pool } from '../lib/neon.js';

const router = express.Router();
const isDemoMode = !pool;

// Mock data for demo mode
const demoUserStats = {
  totalPoints: 1250,
  currentStreak: 7,
  longestStreak: 12,
  rank: 'Gold',
  level: 5,
  achievements: [
    { id: 1, name: '🔥 Week Warrior', description: '7 day streak', unlocked: true, date: '2026-04-15' },
    { id: 2, name: '💯 Perfect Score', description: 'Score 100% on quiz', unlocked: true, date: '2026-04-18' },
    { id: 3, name: '📚 Bookworm', description: 'Complete 10 lessons', unlocked: true, date: '2026-04-20' },
    { id: 4, name: '🎯 Sharp Shooter', description: 'Answer 50 questions correctly', unlocked: true, date: '2026-04-21' },
    { id: 5, name: '⚡ Speed Demon', description: 'Complete quiz in under 5 mins', unlocked: false },
    { id: 6, name: '🏆 Champion', description: 'Reach Gold rank', unlocked: true, date: '2026-04-22' }
  ],
  badges: [
    { icon: '🔥', name: 'Streak Master', count: 7 },
    { icon: '⭐', name: 'Star Student', count: 1250 },
    { icon: '🏆', name: 'Gold Rank', count: 1 }
  ]
};

const demoLeaderboard = [
  { rank: 1, name: 'Ahmad Khan', points: 2150, streak: 15, avatar: '🥇' },
  { rank: 2, name: 'Sara Ali', points: 1890, streak: 12, avatar: '🥈' },
  { rank: 3, name: 'You', points: 1250, streak: 7, avatar: '🥉', isCurrentUser: true },
  { rank: 4, name: 'Hassan Raza', points: 1100, streak: 9, avatar: '👤' },
  { rank: 5, name: 'Fatima Shah', points: 980, streak: 6, avatar: '👤' },
  { rank: 6, name: 'Ali Ahmed', points: 850, streak: 5, avatar: '👤' },
  { rank: 7, name: 'Ayesha Khan', points: 720, streak: 4, avatar: '👤' },
  { rank: 8, name: 'Bilal Hassan', points: 650, streak: 3, avatar: '👤' }
];

// Get user gamification stats
router.get('/stats', authenticateToken, asyncHandler(async (req, res) => {
  const studentId = req.user.id;

  if (isDemoMode) {
    return res.json(demoUserStats);
  }

  // PRODUCTION: Query database
  const result = await query(
    'SELECT * FROM user_gamification WHERE student_id = $1',
    [studentId]
  );

  res.json(result.rows[0] || { totalPoints: 0, currentStreak: 0, level: 1 });
}));

// Award points for activity
router.post('/award-points', authenticateToken, asyncHandler(async (req, res) => {
  const { points, activity } = req.body;
  const studentId = req.user.id;

  if (!points || !activity) {
    return res.status(400).json({ error: 'Points and activity required' });
  }

  if (isDemoMode) {
    return res.json({
      success: true,
      pointsAwarded: points,
      newTotal: demoUserStats.totalPoints + points,
      message: `+${points} points for ${activity}! 🎉`,
      levelUp: points >= 100
    });
  }

  // PRODUCTION: Update database
  const result = await query(
    'UPDATE user_gamification SET total_points = total_points + $1 WHERE student_id = $2 RETURNING *',
    [points, studentId]
  );

  res.json({
    success: true,
    pointsAwarded: points,
    newTotal: result.rows[0].total_points
  });
}));

// Update streak
router.post('/update-streak', authenticateToken, asyncHandler(async (req, res) => {
  const studentId = req.user.id;

  if (isDemoMode) {
    const newStreak = demoUserStats.currentStreak + 1;
    return res.json({
      success: true,
      currentStreak: newStreak,
      message: newStreak % 7 === 0 ? `🔥 ${newStreak} day streak! You're on fire!` : `Day ${newStreak} streak!`,
      bonus: newStreak % 7 === 0 ? 100 : 0
    });
  }

  // PRODUCTION: Update database
  const result = await query(
    'UPDATE user_gamification SET current_streak = current_streak + 1, last_activity = NOW() WHERE student_id = $1 RETURNING *',
    [studentId]
  );

  res.json({
    success: true,
    currentStreak: result.rows[0].current_streak
  });
}));

// Get leaderboard
router.get('/leaderboard', authenticateToken, asyncHandler(async (req, res) => {
  const { timeframe = 'all' } = req.query; // all, week, month

  if (isDemoMode) {
    return res.json({
      leaderboard: demoLeaderboard,
      currentUserRank: 3,
      totalUsers: 150,
      message: 'Top students this week!'
    });
  }

  // PRODUCTION: Query database
  const result = await query(
    `SELECT
      ROW_NUMBER() OVER (ORDER BY total_points DESC) as rank,
      u.name,
      ug.total_points as points,
      ug.current_streak as streak
     FROM user_gamification ug
     JOIN users u ON ug.student_id = u.id
     ORDER BY total_points DESC
     LIMIT 100`
  );

  res.json({
    leaderboard: result.rows,
    totalUsers: result.rowCount
  });
}));

// Unlock achievement
router.post('/unlock-achievement', authenticateToken, asyncHandler(async (req, res) => {
  const { achievementId } = req.body;
  const studentId = req.user.id;

  if (!achievementId) {
    return res.status(400).json({ error: 'Achievement ID required' });
  }

  if (isDemoMode) {
    const achievement = demoUserStats.achievements.find(a => a.id === achievementId);
    return res.json({
      success: true,
      achievement: achievement || { name: '🎉 New Achievement', description: 'You did it!' },
      pointsAwarded: 50,
      message: 'Achievement unlocked! 🎉'
    });
  }

  // PRODUCTION: Update database
  res.json({ success: true });
}));

// Get daily challenges
router.get('/daily-challenges', authenticateToken, asyncHandler(async (req, res) => {
  const challenges = [
    {
      id: 1,
      title: '🎯 Quiz Master',
      description: 'Complete 3 quizzes today',
      progress: 1,
      target: 3,
      reward: 100,
      completed: false
    },
    {
      id: 2,
      title: '💬 Ask 5 Questions',
      description: 'Use AI chat 5 times',
      progress: 3,
      target: 5,
      reward: 50,
      completed: false
    },
    {
      id: 3,
      title: '📚 Study Streak',
      description: 'Maintain your streak',
      progress: 7,
      target: 7,
      reward: 75,
      completed: true
    },
    {
      id: 4,
      title: '🏆 Perfect Score',
      description: 'Get 100% on any quiz',
      progress: 0,
      target: 1,
      reward: 200,
      completed: false
    }
  ];

  res.json({ challenges, resetIn: '18 hours' });
}));

// Get rank information
router.get('/rank-info', authenticateToken, asyncHandler(async (req, res) => {
  const ranks = [
    { name: 'Bronze', minPoints: 0, maxPoints: 499, color: 'from-orange-600 to-orange-800', icon: '🥉' },
    { name: 'Silver', minPoints: 500, maxPoints: 999, color: 'from-gray-400 to-gray-600', icon: '🥈' },
    { name: 'Gold', minPoints: 1000, maxPoints: 1999, color: 'from-yellow-400 to-yellow-600', icon: '🥇' },
    { name: 'Platinum', minPoints: 2000, maxPoints: 3999, color: 'from-cyan-400 to-blue-500', icon: '💎' },
    { name: 'Diamond', minPoints: 4000, maxPoints: 9999, color: 'from-purple-400 to-pink-500', icon: '💠' },
    { name: 'Legend', minPoints: 10000, maxPoints: 999999, color: 'from-red-500 to-orange-500', icon: '👑' }
  ];

  const currentPoints = demoUserStats.totalPoints;
  const currentRank = ranks.find(r => currentPoints >= r.minPoints && currentPoints <= r.maxPoints);
  const nextRank = ranks.find(r => r.minPoints > currentPoints);

  res.json({
    currentRank,
    nextRank,
    pointsToNextRank: nextRank ? nextRank.minPoints - currentPoints : 0,
    allRanks: ranks
  });
}));

export default router;
