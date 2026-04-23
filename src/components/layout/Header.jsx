import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'ru' ? 'en' : 'ru';
    i18n.changeLanguage(nextLang);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return t('dashboard.greeting.night');
    if (hour < 12) return t('dashboard.greeting.morning');
    if (hour < 18) return t('dashboard.greeting.afternoon');
    return t('dashboard.greeting.evening');
  };

  const menuItems = [
    { path: '/', label: t('nav.dashboard'), icon: '📊' },
    { path: '/habits', label: t('nav.habits'), icon: '🔁' },
    { path: '/tasks', label: t('nav.tasks'), icon: '✅' },
    { path: '/analytics', label: t('nav.analytics'), icon: '📈' },
  ];

  return (
    <header className="header animate-fadeIn">
      <div className="header-info desktop-only">
        <h2 className="greeting">{getGreeting()}, {user?.user_metadata?.display_name || 'User'}</h2>
        <p className="date">{new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      <div className="mobile-nav-container">
        <nav className="mobile-menu">
          {menuItems.map(item => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`mobile-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="mobile-icon">{item.icon}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="header-actions">
        <button className="lang-btn" onClick={toggleLanguage}>
          {i18n.language === 'ru' ? 'RU' : 'EN'}
        </button>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      <style>{`
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          z-index: 1000;
        }
        .desktop-only { display: block; }
        .mobile-nav-container { display: none; }
        
        .greeting { font-size: 1.5rem; margin-bottom: 4px; }
        .date { color: var(--text-secondary); font-size: 0.9rem; }
        
        .header-actions { display: flex; align-items: center; gap: 12px; }
        
        .lang-btn {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 6px 10px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-weight: 600;
          font-size: 0.8rem;
        }

        .theme-toggle {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (max-width: 768px) {
          .header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: var(--bg-color);
            padding: 12px 16px;
            margin-bottom: 0;
            border-bottom: 1px solid var(--border-color);
            backdrop-filter: blur(10px);
          }
          .desktop-only { display: none; }
          .mobile-nav-container { 
            display: flex;
            flex: 1;
            justify-content: center;
            margin-right: 12px;
          }
          .mobile-menu {
            display: flex;
            gap: 12px;
            background: var(--card-bg);
            padding: 4px 12px;
            border-radius: 100px;
            border: 1px solid var(--border-color);
          }
          .mobile-link {
            padding: 6px;
            font-size: 1.2rem;
            text-decoration: none;
            opacity: 0.5;
            transition: 0.2s;
          }
          .mobile-link.active {
            opacity: 1;
            transform: scale(1.1);
          }
        }
      `}</style>
    </header>
  );
}
