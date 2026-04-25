import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ links }) => {
  const location = useLocation();

  return (
    <div
      className="flex-shrink-0 min-h-screen flex flex-col"
      style={{
        width: '240px',
        background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
        boxShadow: '4px 0 24px rgba(79,70,229,0.15)',
      }}
    >
      {/* Top accent bar */}
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #818cf8, #a78bfa, #f472b6)' }} />

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 group relative overflow-hidden"
              style={
                isActive
                  ? {
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      color: '#ffffff',
                      boxShadow: '0 4px 15px rgba(99,102,241,0.4)',
                    }
                  : {
                      color: '#c7d2fe',
                    }
              }
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#c7d2fe';
                }
              }}
            >
              {/* Active left indicator */}
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full"
                  style={{ height: '60%', background: '#f472b6' }}
                />
              )}

              {/* Icon bubble */}
              <span
                className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0 transition-all"
                style={
                  isActive
                    ? { background: 'rgba(255,255,255,0.2)' }
                    : { background: 'rgba(255,255,255,0.06)' }
                }
              >
                {link.icon}
              </span>

              <span className="flex-1 leading-none">{link.label}</span>

              {isActive && (
                <span className="w-2 h-2 rounded-full bg-white opacity-60 flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom developer credit */}
      <div
        className="mx-3 mb-4 px-4 py-3 rounded-2xl"
        style={{ background: 'rgba(255,255,255,0.05)', borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        <p className="text-xs font-medium" style={{ color: '#818cf8' }}>Developed by</p>
        <p className="text-xs font-black mt-0.5" style={{ color: '#a5b4fc' }}>
          Asif Ali &amp; Sharmeen Asif
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
