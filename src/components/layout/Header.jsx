import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';

export default function Header() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return t('common.goodNight');
    if (hour < 12) return t('common.goodMorning');
    if (hour < 18) return t('common.goodAfternoon');
    return t('common.goodEvening');
  };

  return (
    <header className="header animate-fadeIn">
      <div className="header-info">
        <h2 className="greeting">{getGreeting()}, {user?.user_metadata?.display_name || 'User'}</h2>
        <p className="date">{new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>
      <div className="header-actions">
        <button className="theme-toggle" onClick={toggleTheme} title={t('settings.theme')}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <div className="user-badge">
          <div className="avatar">
            {user?.email?.[0].toUpperCase() || 'U'}
          </div>
        </div>
      </div>
      <style>{`
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }
        .greeting {
          font-size: 1.5rem;
          margin-bottom: 4px;
        }
        .date {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .theme-toggle {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          transition: var(--transition-fast);
        }
        .theme-toggle:hover {
          background: var(--border-color);
        }
        .user-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 4px 4px 4px 12px;
          background: var(--card-bg);
          border-radius: 100px;
          border: 1px solid var(--border-color);
        }
        .avatar {
          width: 32px;
          height: 32px;
          background: var(--primary-color);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
      `}</style>
    </header>
  );
}
