import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTasks } from '../../../hooks/useTasks.js';

export default function CalendarView() {
  const { t } = useTranslation();
  const { tasks } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const totalDays = daysInMonth(year, month);
  const offset = firstDayOfMonth(year, month);
  
  const days = [];
  for (let i = 0; i < offset; i++) days.push(null);
  for (let i = 1; i <= totalDays; i++) days.push(i);

  const getTasksForDay = (day) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter(t => t.deadline === dateStr);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="calendar-view card animate-fadeIn">
      <div className="calendar-header">
        <button type="button" className="nav-btn" onClick={prevMonth}>‹</button>
        <h2 className="month-year">
          {new Intl.DateTimeFormat('default', { month: 'long', year: 'numeric' }).format(currentDate)}
        </h2>
        <button type="button" className="nav-btn" onClick={nextMonth}>›</button>
      </div>

      <div className="calendar-grid">
        {weekDays.map(d => <div key={d} className="weekday">{d}</div>)}
        {days.map((day, i) => {
          const dayTasks = getTasksForDay(day);
          const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
          
          return (
            <div key={i} className={`calendar-day ${day ? '' : 'empty'} ${isToday ? 'today' : ''}`}>
              {day && (
                <>
                  <span className="day-number">{day}</span>
                  <div className="day-tasks">
                    {dayTasks.map(task => (
                      <div key={task.id} className={`task-dot ${task.priority}`} title={task.title} />
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="calendar-legend">
        <div className="legend-item"><span className="dot high" /> {t('tasks.high')}</div>
        <div className="legend-item"><span className="dot medium" /> {t('tasks.medium')}</div>
        <div className="legend-item"><span className="dot low" /> {t('tasks.low')}</div>
      </div>

      <style>{`
        .calendar-view {
          background: var(--bg-card);
          padding: 24px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
        }
        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .month-year {
          font-size: 1.25rem;
          font-weight: 700;
          text-transform: capitalize;
        }
        .nav-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid var(--border-color);
          background: var(--bg-input);
          color: var(--text-primary);
          cursor: pointer;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
        }
        .nav-btn:hover {
          background: var(--primary-glow);
          border-color: var(--primary-color);
        }
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
        }
        .weekday {
          text-align: center;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-tertiary);
          padding-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .calendar-day {
          aspect-ratio: 1;
          background: var(--bg-input);
          border-radius: var(--radius-md);
          padding: 8px;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          border: 1px solid transparent;
          transition: all var(--transition-fast);
        }
        .calendar-day:not(.empty):hover {
          border-color: var(--primary-color);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .calendar-day.empty {
          background: transparent;
        }
        .calendar-day.today {
          background: var(--primary-glow);
          border: 1px solid var(--primary-color);
        }
        .day-number {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .day-tasks {
          display: flex;
          flex-wrap: wrap;
          gap: 2px;
          justify-content: center;
          width: 100%;
        }
        .task-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
        .task-dot.high { background: #ff6b6b; }
        .task-dot.medium { background: #ffa726; }
        .task-dot.low { background: #00d4aa; }
        
        .calendar-legend {
          display: flex;
          gap: 16px;
          margin-top: 24px;
          justify-content: center;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .dot.high { background: #ff6b6b; }
        .dot.medium { background: #ffa726; }
        .dot.low { background: #00d4aa; }

        @media (max-width: 600px) {
          .calendar-grid { gap: 4px; }
          .calendar-day { padding: 4px; }
          .day-number { font-size: 0.75rem; }
        }
      `}</style>
    </div>
  );
}
