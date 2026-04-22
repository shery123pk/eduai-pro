import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ links }) => {
  const location = useLocation();

  return (
    <div className="w-64 glassmorphism border-r border-slate-700 min-h-screen p-4">
      <nav className="space-y-2">
        {links.map((link) => {
          const isActive = location.pathname === link.path;

          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'gradient-primary text-white shadow-lg shadow-primary/30'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span className="text-xl">{link.icon}</span>
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
