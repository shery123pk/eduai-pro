import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'teacher' ? '/teacher' : '/student');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (type) => {
    setEmail(type === 'student' ? 'student@test.com' : 'teacher@test.com');
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#eef2ff' }}>
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 p-10" style={{ background: 'linear-gradient(160deg, #4f46e5 0%, #7c3aed 50%, #2563eb 100%)' }}>
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white font-black text-xl shadow-lg">P</div>
            <div>
              <span className="text-2xl font-black text-white">Pak AI</span>
              <span className="text-2xl font-black text-indigo-200">Tutor</span>
            </div>
          </div>

          <h1 className="text-4xl font-black text-white leading-tight mb-4" style={{ color: 'white' }}>
            Learn Smarter with<br />
            <span className="text-indigo-200">AI-Powered</span> Education
          </h1>
          <p className="text-indigo-100 text-lg leading-relaxed font-medium">
            Courses, mastery coaching, AI practice, and 6 learning tools — all in one platform.
          </p>
        </div>

        <div className="space-y-4">
          {[
            { icon: '📚', title: 'Structured Courses', text: 'Video lessons with mastery tracking' },
            { icon: '🧠', title: 'Mastery Coach', text: "Bloom's Taxonomy 5-level journey" },
            { icon: '🛠️', title: '6 AI Tools', text: 'Explainer, flashcards, planner & more' },
            { icon: '🤖', title: 'AI Practice', text: 'Generate exercises on any topic' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl p-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl flex-shrink-0">{item.icon}</div>
              <div>
                <p className="text-white font-bold text-sm">{item.title}</p>
                <p className="text-indigo-200 text-xs">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black shadow-md">P</div>
            <div>
              <span className="text-xl font-black text-slate-900">Pak AI</span>
              <span className="text-xl font-black text-indigo-600">Tutor</span>
            </div>
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-1">Welcome back!</h2>
          <p className="text-slate-500 text-sm mb-8">Sign in to continue your learning journey</p>

          {/* Demo Quick Fill */}
          <div className="flex gap-2 mb-6">
            <button onClick={() => fillDemo('student')}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-all">
              🎓 Demo Student
            </button>
            <button onClick={() => fillDemo('teacher')}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-all">
              👨‍🏫 Demo Teacher
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-white border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 text-sm transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl bg-white border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 text-sm transition-all font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-black text-white text-base transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            No account?{' '}
            <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors">
              Create one free
            </Link>
          </p>

          <p className="text-center text-xs text-slate-400 mt-6 bg-white rounded-lg p-2.5 border border-slate-100">
            Demo mode — any email/password works
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
