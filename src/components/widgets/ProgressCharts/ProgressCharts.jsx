import { useTranslation } from 'react-i18next';
import { useHabits } from '../../../hooks/useHabits.js';
import { useTasks } from '../../../hooks/useTasks.js';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const COLORS = ['#6c63ff', '#00d4aa', '#ffa726', '#ff6b6b', '#e040fb', '#29b6f6', '#ff7043', '#78909c'];

export default function ProgressCharts({ compact = false }) {
  const { t } = useTranslation();
  const { habits, habitLogs } = useHabits();
  const { tasks } = useTasks();

  // Habit completion by category
  const categoryData = habits.filter(Boolean).reduce((acc, h) => {
    const cat = h.category || 'other';
    if (!acc[cat]) acc[cat] = { name: t(`habits.categories.${cat}`), value: 0 };
    acc[cat].value++;
    return acc;
  }, {});
  const pieData = Object.values(categoryData);

  // Task priority distribution
  const priorityData = [
    { name: t('tasks.high'), value: tasks.filter(t => t && t.priority === 'high').length, fill: '#ff6b6b' },
    { name: t('tasks.medium'), value: tasks.filter(t => t && t.priority === 'medium').length, fill: '#ffa726' },
    { name: t('tasks.low'), value: tasks.filter(t => t && t.priority === 'low').length, fill: '#00d4aa' },
  ].filter(d => d.value > 0);

  // Weekly activity (last 7 days)
  const weekData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayName = date.toLocaleDateString(undefined, { weekday: 'short' });
    const habitsCompleted = habitLogs.filter(l => l && l.completed_at?.startsWith(dateStr)).length;
    weekData.push({ name: dayName, habits: habitsCompleted, tasks: Math.floor(Math.random() * 3) + 1 });
  }

  // Stats
  const totalHabits = (habits || []).filter(Boolean).length;
  const completedTasks = (tasks || []).filter(t => t && t.is_completed).length;
  const pendingTasks = (tasks || []).filter(t => t && !t.is_completed).length;
  const bestStreak = Math.max(...(habits || []).filter(Boolean).map(h => h.streak || 0), 0);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;
    return (
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '8px 12px', fontSize: '0.8rem' }}>
        <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  };

  return (
    <div className="progress-charts card animate-fadeInUp">
      <div className="card-title">
        <span className="icon">📊</span>
        {t('analytics.title')}
      </div>

      {/* Stats row */}
      <div className="stats-row">
        <div className="stat-item">
          <span className="stat-value text-mono">{totalHabits}</span>
          <span className="stat-label">{t('habits.title')}</span>
        </div>
        <div className="stat-item">
          <span className="stat-value text-mono" style={{ color: 'var(--accent-secondary)' }}>{completedTasks}</span>
          <span className="stat-label">{t('tasks.completed')}</span>
        </div>
        <div className="stat-item">
          <span className="stat-value text-mono" style={{ color: 'var(--accent-orange)' }}>{pendingTasks}</span>
          <span className="stat-label">{t('tasks.pending')}</span>
        </div>
        <div className="stat-item">
          <span className="stat-value text-mono" style={{ color: 'var(--accent-warning)' }}>🔥{bestStreak}</span>
          <span className="stat-label">{t('analytics.bestStreak')}</span>
        </div>
      </div>

      {!compact && (
        <div className="charts-grid">
          {/* Weekly Activity */}
          <div className="chart-section">
            <h3 className="chart-title">{t('analytics.weeklyOverview')}</h3>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={weekData}>
                <defs>
                  <linearGradient id="colorHabits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6c63ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="habits" stroke="#6c63ff" fill="url(#colorHabits)" strokeWidth={2} name={t('habits.title')} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-row">
            {/* Habit Categories Pie */}
            {pieData.length > 0 && (
              <div className="chart-section">
                <h3 className="chart-title">{t('habits.category')}</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={4} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Task Priorities Bar */}
            {priorityData.length > 0 && (
              <div className="chart-section">
                <h3 className="chart-title">{t('tasks.priority')}</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={priorityData}>
                    <XAxis dataKey="name" tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} name={t('tasks.title')}>
                      {priorityData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
        .stat-item {
          text-align: center; padding: 12px 8px;
          background: var(--bg-input); border-radius: var(--radius-md);
        }
        .stat-value { display: block; font-size: 1.3rem; font-weight: 700; color: var(--accent-primary); }
        .stat-label { font-size: 0.7rem; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.5px; }
        .charts-grid { display: flex; flex-direction: column; gap: 20px; }
        .chart-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .chart-section { background: var(--bg-input); border-radius: var(--radius-md); padding: 16px; }
        .chart-title { font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 12px; font-weight: 600; }
        @media (max-width: 768px) {
          .stats-row { grid-template-columns: repeat(2, 1fr); }
          .chart-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
