import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-slate-200 px-5 py-3 shadow-sm sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <Link to={user?.role === 'teacher' ? '/teacher' : '/student'} className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
            <span className="text-white font-black text-sm">P</span>
          </div>
          <div className="flex flex-col leading-none">
            <div className="flex items-baseline gap-0.5">
              <span className="text-3xl font-black text-slate-900">Pak AI</span>
              <span className="text-3xl font-black text-indigo-600">Tutor</span>
            </div>
            <span className="text-sm font-normal mt-0.5"><span className="text-slate-400">Developed by </span><span style={{ color: '#1d4ed8' }}>Asif Ali &amp; Sharmeen Asif</span></span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {user && (
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800 leading-tight">{user.name}</p>
              <p className="text-xs text-indigo-500 capitalize font-medium">{user.role}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 text-sm font-semibold border border-slate-200 hover:border-red-200 transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
