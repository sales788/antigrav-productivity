import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTasks } from '../../../hooks/useTasks.js';

const PRIORITY_CONFIG = {
  high: { color: '#ff6b6b', label: 'tasks.high', icon: '🔴' },
  medium: { color: '#ffa726', label: 'tasks.medium', icon: '🟡' },
  low: { color: '#00d4aa', label: 'tasks.low', icon: '🟢' },
};

export default function TaskManager({ compact = false }) {
  const { t } = useTranslation();
  const { tasks, projects, loading, addTask, deleteTask, toggleTask, getSubtasks } = useTasks();
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState('all');
  const [viewDate, setViewDate] = useState('today'); // 'today' or 'tomorrow'
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium', deadline: '', project_id: '', description: '' });

  const getDate = (view) => {
    const d = new Date();
    if (view === 'tomorrow') d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const targetDate = getDate(viewDate);

  const handleAdd = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!newTask.title.trim() || submitting) return;
    
    setSubmitting(true);
    setError(null);
    try {
      await addTask({ ...newTask, parent_task_id: null });
      setNewTask({ title: '', priority: 'medium', deadline: '', project_id: '', description: '' });
      setShowAdd(false);
    } catch (err) {
      console.error('Failed to add task:', err);
      setError(t('common.error') || 'Failed to add task');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="card skeleton" style={{ height: 200 }} />;

  const allTasks = tasks || [];
  const rootTasks = allTasks.filter(t => t && !t.parent_task_id);
  let filteredTasks = rootTasks;

  if (compact) {
    filteredTasks = rootTasks.filter(t => t && t.deadline === targetDate);
  } else {
    if (filter === 'pending') filteredTasks = rootTasks.filter(t => t && !t.is_completed);
    if (filter === 'completed') filteredTasks = rootTasks.filter(t => t && t.is_completed);
    if (filter === 'overdue') filteredTasks = rootTasks.filter(t => t && !t.is_completed && t.deadline && new Date(t.deadline) < new Date());
  }

  const displayTasks = compact ? filteredTasks.slice(0, 5) : filteredTasks;
  const totalCount = compact ? filteredTasks.length : allTasks.length;
  const completedCount = compact ? filteredTasks.filter(t => t && t.is_completed).length : allTasks.filter(t => t && t.is_completed).length;

  const isOverdue = (deadline) => deadline && new Date(deadline) < new Date();
  const formatDeadline = (d) => {
    if (!d) return '';
    const date = new Date(d);
    const now = new Date();
    now.setHours(0,0,0,0);
    const diff = Math.ceil((date - now) / 86400000);
    if (diff === 0) return t('common.today');
    if (diff === 1) return '1d';
    if (diff < 0) return `${Math.abs(diff)}d ${t('tasks.overdue').toLowerCase()}`;
    return `${diff}d`;
  };

  return (
    <div className="task-manager card animate-fadeInUp">
      <div className="card-title">
        <span className="icon">✅</span>
        {t('tasks.title')}
        <span className="task-count-badge">{completedCount}/{totalCount}</span>
        <button type="button" className="btn btn-sm btn-primary" style={{ marginLeft: 'auto' }} onClick={() => setShowAdd(!showAdd)}>+ {t('common.add')}</button>
      </div>

      {/* Date Toggle for Dashboard */}
      {compact && (
        <div className="task-date-toggle">
          <button type="button" className={`date-btn ${viewDate === 'today' ? 'active' : ''}`} onClick={() => setViewDate('today')}>
            {t('common.today')}
          </button>
          <button type="button" className={`date-btn ${viewDate === 'tomorrow' ? 'active' : ''}`} onClick={() => setViewDate('tomorrow')}>
            {t('common.tomorrow')}
          </button>
        </div>
      )}

      {/* Filters */}
      {!compact && (
        <div className="tabs" style={{ marginBottom: 16 }}>
          {['all', 'pending', 'completed', 'overdue'].map(f => (
            <button key={f} type="button" className={`tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}>
              {f === 'all' ? '📋' : f === 'pending' ? '⏳' : f === 'completed' ? '✅' : '⚠️'} {t(`tasks.${f === 'all' ? 'title' : f}`)}
            </button>
          ))}
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <form className="task-add-form animate-slideUp">
          {error && <div className="error-message" style={{ color: '#ff6b6b', fontSize: '0.8rem', marginBottom: '8px', padding: '8px', background: 'rgba(255,107,107,0.1)', borderRadius: '4px' }}>{error}</div>}
          <input className="input" placeholder={t('tasks.name')} value={newTask.title}
            disabled={submitting}
            onChange={e => setNewTask({ ...newTask, title: e.target.value })}
          />
          <div className="task-add-row">
            <select className="input select" value={newTask.priority}
              disabled={submitting}
              onChange={e => setNewTask({ ...newTask, priority: e.target.value })}>
              {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.icon} {t(cfg.label)}</option>
              ))}
            </select>
            <input className="input" type="date" value={newTask.deadline}
              disabled={submitting}
              onChange={e => setNewTask({ ...newTask, deadline: e.target.value })} />
            <button type="button" className="btn btn-primary btn-sm" disabled={submitting || !newTask.title.trim()} onClick={handleAdd}>
              {submitting ? '...' : t('common.add')}
            </button>
          </div>
        </form>
      )}

      {/* Tasks list */}
      <div className="tasks-list stagger-children">
        {displayTasks.length === 0 && (
          <div className="empty-state"><span className="icon">📝</span><p>{t('tasks.noTasks')}</p></div>
        )}
        {displayTasks.map(task => {
          const subtasks = getSubtasks(task.id);
          const cfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
          const overdue = isOverdue(task.deadline) && !task.is_completed;
          return (
            <div key={task.id} className={`task-item ${task.is_completed ? 'completed' : ''} ${overdue ? 'overdue' : ''}`}>
              <div className="checkbox-wrapper" onClick={() => toggleTask(task.id)}>
                <div className={`checkbox ${task.is_completed ? 'checked' : ''}`} />
              </div>
              <div className="task-info">
                <div className="task-name-row">
                  <span className="task-name" style={{ textDecoration: task.is_completed ? 'line-through' : 'none', opacity: task.is_completed ? 0.5 : 1 }}>
                    {task.title}
                  </span>
                  <span className={`badge badge-${task.priority}`}>{cfg.icon} {t(cfg.label)}</span>
                </div>
                <div className="task-meta">
                  {task.deadline && (
                    <span className={`task-deadline ${overdue ? 'overdue-text' : ''}`}>
                      📅 {formatDeadline(task.deadline)}
                    </span>
                  )}
                  {subtasks.length > 0 && (
                    <span className="task-subtasks">📎 {subtasks.filter(s => s.is_completed).length}/{subtasks.length}</span>
                  )}
                </div>
              </div>
              {!compact && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => deleteTask(task.id)}>✕</button>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .task-count-badge {
          font-size: 0.75rem;
          background: rgba(0,212,170,0.15);
          color: var(--accent-secondary);
          padding: 2px 10px;
          border-radius: var(--radius-full);
          font-weight: 700;
          font-family: var(--font-mono);
        }
        .task-date-toggle {
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
        .task-add-form {
          display: flex; flex-direction: column; gap: 8px;
          margin-bottom: 16px; padding: 14px;
          background: var(--bg-input); border-radius: var(--radius-md);
        }
        .task-add-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .task-add-row .select, .task-add-row input[type="date"] { flex: 1; min-width: 120px; }
        .tasks-list { display: flex; flex-direction: column; gap: 4px; }
        .task-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px; border-radius: var(--radius-md);
          transition: all var(--transition-fast);
          border-left: 3px solid transparent;
        }
        .task-item:hover { background: var(--bg-input); }
        .task-item.overdue { border-left-color: var(--accent-warning); }
        .task-info { flex: 1; display: flex; flex-direction: column; gap: 4px; }
        .task-name-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .task-name { font-size: 0.9rem; font-weight: 500; transition: all var(--transition-fast); }
        .task-meta { display: flex; gap: 12px; font-size: 0.75rem; color: var(--text-tertiary); }
        .overdue-text { color: var(--accent-warning) !important; font-weight: 600; }
      `}</style>
    </div>
  );
}
