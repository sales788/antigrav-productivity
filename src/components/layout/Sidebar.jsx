import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext.jsx';

export default function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { signOut } = useAuth();

  const menuItems = [
    { path: '/', icon: '📊', label: t('dashboard.title') },
    { path: '/habits', icon: '🔁', label: t('habits.title') },
    { path: '/tasks', icon: '✅', label: t('tasks.title') },
    { path: '/analytics', icon: '📈', label: t('analytics.title') },
    { path: '/settings', icon: '⚙️', label: t('settings.title') },
  ];

  return (
    <aside className="sidebar glass">
      <div className="sidebar-logo">
        <span className="logo-icon">⚡</span>
        <span className="logo-text">Antigrav</span>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={() => signOut()}>
          <span>🚪</span> {t('auth.signOut')}
        </button>
      </div>

      <style>{`
        .sidebar {
          width: 280px;
          height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 32px 20px;
          position: sticky;
          top: 0;
          border-right: 1px solid var(--border-color);
        }
        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 12px;
          margin-bottom: 48px;
        }
        .logo-icon {
          font-size: 1.5rem;
          background: var(--primary-color);
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
          color: white;
        }
        .logo-text {
          font-size: 1.4rem;
          font-weight: 700;
          letter-spacing: -0.5px;
        }
        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 16px;
          text-decoration: none;
          color: var(--text-secondary);
          border-radius: var(--radius-md);
          transition: var(--transition-fast);
          font-weight: 500;
        }
        .nav-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
        }
        .nav-item.active {
          background: var(--primary-glow);
          color: var(--primary-color);
        }
        .nav-icon {
          font-size: 1.2rem;
        }
        .sidebar-footer {
          padding-top: 20px;
          border-top: 1px solid var(--border-color);
        }
        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: none;
          border: none;
          color: var(--danger);
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
          transition: var(--transition-fast);
          border-radius: var(--radius-sm);
        }
        .logout-btn:hover {
          background: rgba(255, 75, 92, 0.1);
        }

        @media (max-width: 768px) {
          .sidebar {
            width: 100%;
            height: auto;
            position: fixed;
            bottom: 0;
            top: auto;
            left: 0;
            flex-direction: row;
            padding: 12px 16px;
            z-index: 1000;
            border-right: none;
            border-top: 1px solid var(--border-color);
            background: rgba(26, 26, 46, 0.95);
          }
          .sidebar-logo {
            display: none;
          }
          .sidebar-nav {
            flex-direction: row;
            justify-content: space-around;
            width: 100%;
          }
          .nav-item {
            flex-direction: column;
            gap: 4px;
            padding: 8px;
            font-size: 0.7rem;
            flex: 1;
            text-align: center;
          }
          .nav-icon {
            font-size: 1.4rem;
          }
          .nav-label {
            display: block;
          }
          .sidebar-footer {
            display: none; /* Hide logout on mobile nav, move it to settings? */
          }
        }
      `}</style>
    </aside>
  );
}
