import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

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
      // Redirect based on role
      navigate(user.role === 'teacher' ? '/teacher' : '/student');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <div className="gradient-primary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/50">
            <span className="text-white font-bold text-3xl">E</span>
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">EduAI Pro</h1>
          <p className="text-slate-400">AI-Powered Learning Platform</p>
        </div>

        {/* Login form */}
        <div className="glassmorphism rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">Welcome Back</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="student@eduai.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:text-primary/80 font-semibold">
                Register here
              </Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-xs text-slate-500 mb-2">Demo Credentials:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="glassmorphism p-2 rounded">
                <p className="text-slate-400">Student:</p>
                <p className="text-slate-300">ali@student.com</p>
              </div>
              <div className="glassmorphism p-2 rounded">
                <p className="text-slate-400">Teacher:</p>
                <p className="text-slate-300">ahmad.khan@eduai.com</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Password: student123 / teacher123</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-slate-500 text-sm">
          <p>Built for BWAI Hackathon 2026</p>
          <p className="mt-1">DHA Suffa University, Karachi</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
