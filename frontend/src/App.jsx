import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ChatBot from './pages/ChatBot';
import HomeworkSolver from './pages/HomeworkSolver';
import SmartTutor from './pages/SmartTutor';
import QuizPage from './pages/QuizPage';
import WeakAreaReport from './pages/WeakAreaReport';

// Protected Route Component
const ProtectedRoute = ({ children, requireRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requireRole && user?.role !== requireRole) {
    const redirectPath = user?.role === 'teacher' ? '/teacher' : '/student';
    return <Navigate to={redirectPath} />;
  }

  return children;
};

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={user?.role === 'teacher' ? '/teacher' : '/student'} /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to={user?.role === 'teacher' ? '/teacher' : '/student'} /> : <Register />}
      />

      {/* Student routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute requireRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/chat"
        element={
          <ProtectedRoute requireRole="student">
            <ChatBot />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/homework"
        element={
          <ProtectedRoute requireRole="student">
            <HomeworkSolver />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/tutor"
        element={
          <ProtectedRoute requireRole="student">
            <SmartTutor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/quiz"
        element={
          <ProtectedRoute requireRole="student">
            <QuizPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/weak-areas"
        element={
          <ProtectedRoute requireRole="student">
            <WeakAreaReport />
          </ProtectedRoute>
        }
      />

      {/* Teacher routes */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute requireRole="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-900">
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1E293B',
                color: '#F1F5F9',
                border: '1px solid #475569'
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#F1F5F9'
                }
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#F1F5F9'
                }
              }
            }}
          />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
