import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHabits } from '../../../hooks/useHabits.js';

const CATEGORY_EMOJIS = {
  health: '❤️', fitness: '💪', education: '📚', work: '💼',
  mindfulness: '🧘', social: '👥', creativity: '🎨', other: '📌'
};

const CATEGORY_COLORS = {
  health: '#ff6b6b', fitness: '#00d4aa', education: '#ffa726', work: '#6c63ff',
  mindfulness: '#e040fb', social: '#29b6f6', creativity: '#ff7043', other: '#78909c'
};

export default function HabitTracker({ compact = false }) {
  const { t } = useTranslation();
  const { habits, loading, addHabit, deleteHabit, toggleHabitLog, isHabitCompleted } = useHabits();
  const [showAdd, setShowAdd] = useState(false);
  const [newHabit, setNewHabit] = useState({ title: '', category: 'health', frequency: 'daily', days_of_week: [0,1,2,3,4,5,6] });
  const [submitting, setSubmitting] = useState(false);
  const [viewDate, setViewDate] = useState('today'); // 'today' or 'tomorrow'

  const getDate = (view) => {
    const d = new Date();
    if (view === 'tomorrow') d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const getDayOfWeek = (view) => {
    const d = new Date();
    if (view === 'tomorrow') d.setDate(d.getDate() + 1);
    return d.getDay();
  };

  const targetDate = getDate(viewDate);
  const targetDay = getDayOfWeek(viewDate);

  const filteredHabits = (habits || []).filter(h => {
    if (!h) return false;
    if (!h.days_of_week) return true; // Default to all days if not specified
    return h.days_of_week.includes(targetDay);
  });

  const completedCount = filteredHabits.filter(h => h && isHabitCompleted(h.id, targetDate)).length;
  const completionRate = filteredHabits.length > 0 ? Math.round((completedCount / filteredHabits.length) * 100) : 0;

  const handleAdd = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!newHabit.title.trim() || submitting) return;
    
    setSubmitting(true);
    try {
      await addHabit({ ...newHabit, color: CATEGORY_COLORS[newHabit.category] });
      setNewHabit({ title: '', category: 'health', frequency: 'daily', days_of_week: [0,1,2,3,4,5,6] });
      setShowAdd(false);
    } catch (err) {
      console.error('Failed to add habit:', err);
      alert(t('common.error') || 'Failed to add habit');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleDay = (day, e) => {
    if (e) e.preventDefault();
    const current = newHabit.days_of_week || [];
    if (current.includes(day)) {
      setNewHabit({ ...newHabit, days_of_week: current.filter(d => d !== day) });
    } else {
      setNewHabit({ ...newHabit, days_of_week: [...current, day].sort() });
    }
  };

  if (loading) return <div className="card skeleton" style={{ height: 200 }} />;

  const displayHabits = compact ? filteredHabits.slice(0, 5) : filteredHabits;
  const days = [
    { id: 1, label: 'mon' }, { id: 2, label: 'tue' }, { id: 3, label: 'wed' },
    { id: 4, label: 'thu' }, { id: 5, label: 'fri' }, { id: 6, label: 'sat' }, { id: 0, label: 'sun' }
  ];

  return (
    <div className="habit-tracker card animate-fadeInUp">
      <div className="card-title">
        <span className="icon">🔄</span>
        {t('habits.title')}
        <span className="habit-progress-badge">{completionRate}%</span>
        <button type="button" className="btn btn-sm btn-primary" style={{ marginLeft: 'auto' }} onClick={() => setShowAdd(!showAdd)}>+ {t('common.add')}</button>
      </div>

      {/* Date Toggle for Dashboard */}
      {compact && (
        <div className="habit-date-toggle">
          <button type="button" className={`date-btn ${viewDate === 'today' ? 'active' : ''}`} onClick={() => setViewDate('today')}>
            {t('common.today')}
          </button>
          <button type="button" className={`date-btn ${viewDate === 'tomorrow' ? 'active' : ''}`} onClick={() => setViewDate('tomorrow')}>
            {t('common.tomorrow')}
          </button>
        </div>
      )}

      {/* Progress bar */}
      <div className="habit-progress-bar">
        <div className="habit-progress-fill" style={{ width: `${completionRate}%` }} />
      </div>
      <div className="habit-progress-label">{completedCount}/{filteredHabits.length} {viewDate === 'today' ? t('common.today') : t('common.tomorrow')}</div>

      {/* Add form */}
      {showAdd && (
        <form className="habit-add-form animate-slideUp" onSubmit={handleAdd}>
          <input 
            className="input" 
            placeholder={t('habits.name')} 
            value={newHabit.title}
            disabled={submitting}
            onChange={e => setNewHabit({ ...newHabit, title: e.target.value })}
          />
          
          <div className="day-selector">
            {days.map(day => (
              <button key={day.id} 
                type="button"
                disabled={submitting}
                className={`day-btn ${newHabit.days_of_week.includes(day.id) ? 'active' : ''}`}
                onClick={(e) => toggleDay(day.id, e)}>
                {t(`daysShort.${day.label}`).charAt(0)}
              </button>
            ))}
          </div>

          <div className="habit-add-row">
            <select className="input select" value={newHabit.category}
              disabled={submitting}
              onChange={e => setNewHabit({ ...newHabit, category: e.target.value })}>
              {Object.keys(CATEGORY_EMOJIS).map(cat => (
                <option key={cat} value={cat}>{CATEGORY_EMOJIS[cat]} {t(`habits.categories.${cat}`)}</option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting || !newHabit.title.trim()}>
              {submitting ? '...' : t('common.add')}
            </button>
          </div>
        </form>
      )}

      {/* Habits list */}
      <div className="habits-list stagger-children">
        {displayHabits.length === 0 && (
          <div className="empty-state"><span className="icon">🎯</span><p>{t('habits.noHabits')}</p></div>
        )}
        {displayHabits.map(habit => {
          const completed = isHabitCompleted(habit.id, targetDate);
          return (
            <div key={habit.id} className={`habit-item ${completed ? 'completed' : ''}`}>
              <div className="checkbox-wrapper" onClick={() => toggleHabitLog(habit.id, targetDate)}>
                <div className={`checkbox ${completed ? 'checked' : ''}`} style={{ borderColor: completed ? habit.color : undefined, background: completed ? habit.color : undefined }} />
              </div>
              <div className="habit-info">
                <span className="habit-name" style={{ textDecoration: completed ? 'line-through' : 'none', opacity: completed ? 0.6 : 1 }}>
                  {CATEGORY_EMOJIS[habit.category]} {habit.title}
                </span>
                <span className="habit-meta">
                  {habit.days_of_week && habit.days_of_week.length === 7 ? t('habits.daily') : t('habits.weekly')} · 🔥 {habit.streak || 0} {t('common.days')}
                </span>
              </div>
              {!compact && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => deleteHabit(habit.id)}>✕</button>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .habit-progress-badge {
          font-size: 0.75rem;
          background: var(--accent-primary-glow);
          color: var(--accent-primary);
          padding: 2px 10px;
          border-radius: var(--radius-full);
          font-weight: 700;
          font-family: var(--font-mono);
        }
        .habit-progress-bar {
          height: 6px;
          background: var(--bg-input);
          border-radius: var(--radius-full);
          overflow: hidden;
          margin-bottom: 6px;
        }
        .habit-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
          border-radius: var(--radius-full);
          transition: width 0.5s cubic-bezier(0.4,0,0.2,1);
        }
        .habit-progress-label {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          margin-bottom: 16px;
          font-family: var(--font-mono);
        }
        .habit-date-toggle {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          background: var(--bg-input);
          padding: 4px;
          border-radius: var(--radius-md);
        }
        .date-btn {
          flex: 1;
          padding: 6px;
          border: none;
          background: none;
          color: var(--text-secondary);
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 600;
          transition: all var(--transition-fast);
        }
        .date-btn.active {
          background: var(--bg-card);
          color: var(--primary-color);
          box-shadow: var(--shadow-sm);
        }
        .day-selector {
          display: flex;
          justify-content: center;
          gap: 6px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        .day-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid var(--border-color);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .day-btn:hover {
          border-color: var(--primary-color);
          color: var(--primary-color);
        }
        .day-btn.active {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
          box-shadow: 0 4px 8px var(--primary-glow);
        }
        .habit-add-form {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
          padding: 14px;
          background: var(--bg-input);
          border-radius: var(--radius-md);
        }
        .habit-add-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .habit-add-row .select { flex: 1; min-width: 120px; }
        .habits-list { display: flex; flex-direction: column; gap: 4px; }
        .habit-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }
        .habit-item:hover { background: var(--bg-input); }
        .habit-item.completed { opacity: 0.8; }
        .habit-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .habit-name { font-size: 0.9rem; font-weight: 500; transition: all var(--transition-fast); }
        .habit-meta { font-size: 0.75rem; color: var(--text-tertiary); }
      `}</style>
    </div>
  );
}
