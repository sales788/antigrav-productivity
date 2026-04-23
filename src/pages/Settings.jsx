import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h1 className="page-title">{t('settings.title')}</h1>
      <p className="page-subtitle">{t('settings.subtitle')}</p>

      <div className="settings-grid">
        {/* Profile */}
        <div className="card animate-fadeInUp">
          <div className="card-title"><span className="icon">👤</span> {t('settings.profile')}</div>
          <div className="input-group">
            <label className="input-label">{t('auth.email')}</label>
            <input className="input" value={user?.email || 'demo@antigrav.app'} disabled />
          </div>
          <div className="input-group" style={{ marginTop: 12 }}>
            <label className="input-label">{t('auth.name')}</label>
            <input className="input" defaultValue={user?.user_metadata?.display_name || 'Demo User'} />
          </div>
        </div>

        {/* Appearance */}
        <div className="card animate-fadeInUp">
          <div className="card-title"><span className="icon">🎨</span> {t('settings.theme')}</div>
          <div className="settings-toggle-group">
            <button className={`settings-toggle ${theme === 'dark' ? 'active' : ''}`} onClick={() => theme !== 'dark' && toggleTheme()}>
              🌙 {t('settings.dark')}
            </button>
            <button className={`settings-toggle ${theme === 'light' ? 'active' : ''}`} onClick={() => theme !== 'light' && toggleTheme()}>
              ☀️ {t('settings.light')}
            </button>
          </div>

          <div className="card-title" style={{ marginTop: 20 }}><span className="icon">🌐</span> {t('settings.language')}</div>
          <div className="settings-toggle-group">
            <button className={`settings-toggle ${i18n.language === 'en' ? 'active' : ''}`} onClick={() => i18n.changeLanguage('en')}>
              🇬🇧 English
            </button>
            <button className={`settings-toggle ${i18n.language === 'ru' ? 'active' : ''}`} onClick={() => i18n.changeLanguage('ru')}>
              🇷🇺 Русский
            </button>
          </div>
        </div>

        {/* API Keys */}
        <div className="card animate-fadeInUp">
          <div className="card-title"><span className="icon">🔑</span> API</div>
          <div className="input-group">
            <label className="input-label">OpenAI API Key</label>
            <input className="input" type="password" placeholder="sk-..." defaultValue={import.meta.env.VITE_OPENAI_API_KEY || ''} />
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 8 }}>
            Set in .env file or enter here for this session
          </p>
        </div>
      </div>

      <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={handleSave}>
        {saved ? `✓ ${t('settings.saved')}` : t('settings.save')}
      </button>

      <style>{`
        .settings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
        .settings-toggle-group { display: flex; gap: 8px; }
        .settings-toggle {
          flex: 1; padding: 12px; border: 1px solid var(--border-color);
          background: var(--bg-input); border-radius: var(--radius-md);
          cursor: pointer; font-weight: 500; font-size: 0.9rem;
          transition: all var(--transition-fast); color: var(--text-secondary);
        }
        .settings-toggle:hover { border-color: var(--accent-primary); }
        .settings-toggle.active {
          border-color: var(--accent-primary); background: var(--accent-primary-glow);
          color: var(--accent-primary); font-weight: 600;
        }
      `}</style>
    </div>
  );
}
