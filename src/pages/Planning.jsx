import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import TimelineView from '../components/widgets/Timeline/TimelineView.jsx';
import CalendarView from '../components/widgets/Calendar/CalendarView.jsx';

export default function Planning() {
  const { t } = useTranslation();
  const [view, setView] = useState('timeline'); // 'timeline' or 'calendar'

  return (
    <div className="planning-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('nav.planning')}</h1>
          <p className="page-subtitle">{t('dashboard.subtitle')}</p>
        </div>
        <div className="view-toggle glass">
          <button 
            className={`toggle-btn ${view === 'timeline' ? 'active' : ''}`}
            onClick={() => setView('timeline')}
          >
            🕒 {t('analytics.week')}
          </button>
          <button 
            className={`toggle-btn ${view === 'calendar' ? 'active' : ''}`}
            onClick={() => setView('calendar')}
          >
            📅 {t('analytics.month')}
          </button>
        </div>
      </div>

      <div className="planning-content">
        {view === 'timeline' ? <TimelineView /> : <CalendarView />}
      </div>

      <style>{`
        .planning-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .view-toggle {
          display: flex;
          padding: 4px;
          border-radius: var(--radius-lg);
          gap: 4px;
        }
        .toggle-btn {
          padding: 8px 16px;
          border: none;
          background: none;
          color: var(--text-secondary);
          border-radius: var(--radius-md);
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .toggle-btn:hover {
          color: var(--text-primary);
          background: rgba(255,255,255,0.05);
        }
        .toggle-btn.active {
          background: var(--primary-glow);
          color: var(--primary-color);
        }
        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .view-toggle {
            width: 100%;
          }
          .toggle-btn {
            flex: 1;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
