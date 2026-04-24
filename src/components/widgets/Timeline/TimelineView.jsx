import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTasks } from '../../../hooks/useTasks.js';
import { useHabits } from '../../../hooks/useHabits.js';

export default function TimelineView() {
  const { t } = useTranslation();
  const { tasks, toggleTask } = useTasks();
  const { habits, isHabitCompleted, toggleHabitLog } = useHabits();
  const [period, setPeriod] = useState('day'); // 'day', 'week', 'month', 'year'

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredContent = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    
    let start, end;
    
    if (period === 'day') {
      start = new Date(startOfDay);
      end = new Date(startOfDay);
      end.setHours(23, 59, 59, 999);
    } else if (period === 'week') {
      const day = startOfDay.getDay();
      start = new Date(startOfDay);
      start.setDate(startOfDay.getDate() - day);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else if (period === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (period === 'year') {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    }

    const filteredTasks = tasks.filter(task => {
      if (!task.deadline) return period === 'day' && !task.is_completed; // Show undated in Day view if not completed
      const d = new Date(task.deadline);
      return d >= start && d <= end;
    });

    const filteredHabits = period === 'day' ? habits : []; // Habits only in Day view for now as per request

    return { tasks: filteredTasks, habits: filteredHabits };
  }, [tasks, habits, period]);

  const periods = [
    { id: 'day', label: 'analytics.day', icon: '☀️' },
    { id: 'week', label: 'analytics.week', icon: '📅' },
    { id: 'month', label: 'analytics.month', icon: '🗓️' },
    { id: 'year', label: 'analytics.year', icon: '⏳' }
  ];

  const getTaskCount = (periodId) => {
    const tasksInPeriod = tasks.filter(task => {
      if (!task.deadline) return periodId === 'day' && !task.is_completed;
      const d = new Date(task.deadline);
      const now = new Date();
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      let s, e;
      if (periodId === 'day') {
        s = new Date(startOfDay); e = new Date(startOfDay); e.setHours(23,59,59,999);
      } else if (periodId === 'week') {
        const day = startOfDay.getDay();
        s = new Date(startOfDay); s.setDate(startOfDay.getDate() - day);
        e = new Date(s); e.setDate(s.getDate() + 6); e.setHours(23,59,59,999);
      } else if (periodId === 'month') {
        s = new Date(now.getFullYear(), now.getMonth(), 1);
        e = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23,59,59,999);
      } else if (periodId === 'year') {
        s = new Date(now.getFullYear(), 0, 1);
        e = new Date(now.getFullYear(), 11, 31, 23,59,59,999);
      }
      return d >= s && d <= e;
    });
    return tasksInPeriod.length;
  };

  return (
    <div className="timeline-view animate-fadeIn">
      <div className="period-tabs">
        {periods.map(p => {
          const count = getTaskCount(p.id);
          return (
            <button 
              key={p.id} 
              className={`period-tab ${period === p.id ? 'active' : ''}`}
              onClick={() => setPeriod(p.id)}
            >
              <span className="period-icon">{p.icon}</span>
              {t(p.label)}
              {count > 0 && <span className="tab-count">{count}</span>}
            </button>
          );
        })}
      </div>

      <div className="timeline-sections stagger-children">
        {period === 'day' && filteredContent.habits.length > 0 && (
          <section className="timeline-section">
            <h3 className="section-title">🔄 {t('habits.title')}</h3>
            <div className="items-list">
              {filteredContent.habits.map(habit => (
                <div key={habit.id} className={`timeline-item habit ${isHabitCompleted(habit.id) ? 'completed' : ''}`}>
                  <div className="checkbox-wrapper" onClick={() => toggleHabitLog(habit.id)}>
                    <div className={`checkbox ${isHabitCompleted(habit.id) ? 'checked' : ''}`} style={{ background: isHabitCompleted(habit.id) ? habit.color : 'transparent', borderColor: habit.color }} />
                  </div>
                  <div className="item-info">
                    <span className="item-name">{habit.title}</span>
                    <span className="item-meta">{t(`habits.${habit.frequency}`)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="timeline-section">
          <h3 className="section-title">✅ {t('tasks.title')}</h3>
          <div className="items-list">
            {filteredContent.tasks.length === 0 ? (
              <div className="empty-state">{t('tasks.noTasks')}</div>
            ) : (
              filteredContent.tasks.map(task => (
                <div key={task.id} className={`timeline-item task ${task.is_completed ? 'completed' : ''}`}>
                  <div className="checkbox-wrapper" onClick={() => toggleTask(task.id)}>
                    <div className={`checkbox ${task.is_completed ? 'checked' : ''}`} />
                  </div>
                  <div className="item-info">
                    <span className="item-name">{task.title}</span>
                    <div className="item-meta">
                      {task.deadline && <span>📅 {task.deadline}</span>}
                      <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <style>{`
        .period-tabs {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          overflow-x: auto;
          padding-bottom: 8px;
        }
        .period-tab {
          padding: 10px 20px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-full);
          color: var(--text-secondary);
          cursor: pointer;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          transition: all var(--transition-fast);
        }
        .period-tab:hover {
          border-color: var(--primary-color);
          color: var(--text-primary);
        }
        .period-tab.active {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
          box-shadow: 0 4px 12px var(--primary-glow);
        }
        .tab-count {
          font-size: 0.7rem;
          background: rgba(255,255,255,0.2);
          color: white;
          padding: 2px 6px;
          border-radius: 10px;
          min-width: 20px;
          text-align: center;
        }
        .period-tab:not(.active) .tab-count {
          background: var(--primary-glow);
          color: var(--primary-color);
        }
        .timeline-sections {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }
        .timeline-section {
          background: var(--bg-card);
          padding: 20px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
        }
        .section-title {
          font-size: 1.1rem;
          margin-bottom: 16px;
          color: var(--text-primary);
        }
        .items-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .timeline-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--bg-input);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }
        .timeline-item:hover {
          transform: translateX(4px);
          background: rgba(255,255,255,0.05);
        }
        .timeline-item.completed {
          opacity: 0.6;
        }
        .item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .item-name {
          font-weight: 500;
          font-size: 0.95rem;
        }
        .item-meta {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .empty-state {
          text-align: center;
          padding: 20px;
          color: var(--text-tertiary);
          font-style: italic;
        }
        .checkbox {
          width: 20px;
          height: 20px;
          border: 2px solid var(--border-color);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .checkbox.checked {
          background: var(--primary-color);
          border-color: var(--primary-color);
          position: relative;
        }
        .checkbox.checked::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}
