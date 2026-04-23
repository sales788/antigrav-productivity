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
  const [newHabit, setNewHabit] = useState({ title: '', category: 'health', frequency: 'daily' });

  const today = new Date().toISOString().split('T')[0];
  const completedToday = habits.filter(h => isHabitCompleted(h.id, today)).length;
  const completionRate = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0;

  const handleAdd = () => {
    if (!newHabit.title.trim()) return;
    addHabit({ ...newHabit, color: CATEGORY_COLORS[newHabit.category] });
    setNewHabit({ title: '', category: 'health', frequency: 'daily' });
    setShowAdd(false);
  };

  if (loading) return <div className="card skeleton" style={{ height: 200 }} />;

  const displayHabits = compact ? habits.slice(0, 5) : habits;

  return (
    <div className="habit-tracker card animate-fadeInUp">
      <div className="card-title">
        <span className="icon">🔄</span>
        {t('habits.title')}
        <span className="habit-progress-badge">{completionRate}%</span>
        <button className="btn btn-sm btn-primary" style={{ marginLeft: 'auto' }} onClick={() => setShowAdd(!showAdd)}>+ {t('common.add')}</button>
      </div>

      {/* Progress bar */}
      <div className="habit-progress-bar">
        <div className="habit-progress-fill" style={{ width: `${completionRate}%` }} />
      </div>
      <div className="habit-progress-label">{completedToday}/{habits.length} {t('common.today')}</div>

      {/* Add form */}
      {showAdd && (
        <div className="habit-add-form animate-slideUp">
          <input className="input" placeholder={t('habits.name')} value={newHabit.title}
            onChange={e => setNewHabit({ ...newHabit, title: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && handleAdd()} />
          <div className="habit-add-row">
            <select className="input select" value={newHabit.category}
              onChange={e => setNewHabit({ ...newHabit, category: e.target.value })}>
              {Object.keys(CATEGORY_EMOJIS).map(cat => (
                <option key={cat} value={cat}>{CATEGORY_EMOJIS[cat]} {t(`habits.categories.${cat}`)}</option>
              ))}
            </select>
            <select className="input select" value={newHabit.frequency}
              onChange={e => setNewHabit({ ...newHabit, frequency: e.target.value })}>
              <option value="daily">{t('habits.daily')}</option>
              <option value="weekly">{t('habits.weekly')}</option>
              <option value="monthly">{t('habits.monthly')}</option>
              <option value="yearly">{t('habits.yearly')}</option>
            </select>
            <button className="btn btn-primary btn-sm" onClick={handleAdd}>{t('common.add')}</button>
          </div>
        </div>
      )}

      {/* Habits list */}
      <div className="habits-list stagger-children">
        {displayHabits.length === 0 && (
          <div className="empty-state"><span className="icon">🎯</span><p>{t('habits.noHabits')}</p></div>
        )}
        {displayHabits.map(habit => {
          const completed = isHabitCompleted(habit.id, today);
          return (
            <div key={habit.id} className={`habit-item ${completed ? 'completed' : ''}`}>
              <div className="checkbox-wrapper" onClick={() => toggleHabitLog(habit.id, today)}>
                <div className={`checkbox ${completed ? 'checked' : ''}`} style={{ borderColor: completed ? habit.color : undefined, background: completed ? habit.color : undefined }} />
              </div>
              <div className="habit-info">
                <span className="habit-name" style={{ textDecoration: completed ? 'line-through' : 'none', opacity: completed ? 0.6 : 1 }}>
                  {CATEGORY_EMOJIS[habit.category]} {habit.title}
                </span>
                <span className="habit-meta">
                  {t(`habits.${habit.frequency}`)} · 🔥 {habit.streak || 0} {t('common.days')}
                </span>
              </div>
              {!compact && (
                <button className="btn btn-ghost btn-sm" onClick={() => deleteHabit(habit.id)}>✕</button>
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
