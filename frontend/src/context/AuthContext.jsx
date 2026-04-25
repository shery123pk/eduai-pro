import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Demo mode — works without backend
    const demoAccounts = {
      'student@test.com': { id: 'demo-student', name: 'Demo Student', email: 'student@test.com', role: 'student' },
      'teacher@test.com': { id: 'demo-teacher', name: 'Demo Teacher', email: 'teacher@test.com', role: 'teacher' },
    };
    if (demoAccounts[email] && password === 'demo123') {
      const newUser = demoAccounts[email];
      const newToken = 'demo-token-' + newUser.role;
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      toast.success(`Welcome back, ${newUser.name}!`);
      return newUser;
    }

    try {
      const response = await authAPI.login({ email, password });
      const { token: newToken, user: newUser } = response.data;

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));

      setToken(newToken);
      setUser(newUser);

      toast.success(`Welcome back, ${newUser.name}!`);
      return newUser;
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const register = async (name, email, password, role) => {
    // Demo mode — create account locally without backend
    if (!import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL === 'http://localhost:5000') {
      const newUser = { id: `demo-${Date.now()}`, name, email, role };
      const newToken = 'demo-token-' + role + '-' + Date.now();
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      toast.success(`Welcome to Pak AI Tutor, ${name}!`);
      return newUser;
    }

    try {
      const response = await authAPI.register({ name, email, password, role });
      const { token: newToken, user: newUser } = response.data;

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));

      setToken(newToken);
      setUser(newUser);

      toast.success(`Welcome to Pak AI Tutor, ${newUser.name}!`);
      return newUser;
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token && !!user,
    isTeacher: user?.role === 'teacher',
    isStudent: user?.role === 'student'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
