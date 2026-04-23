import { useTranslation } from 'react-i18next';
import ClockWidget from '../components/widgets/ClockWidget/ClockWidget.jsx';
import HabitTracker from '../components/widgets/HabitTracker/HabitTracker.jsx';
import TaskManager from '../components/widgets/TaskManager/TaskManager.jsx';
import AIRecommendations from '../components/widgets/AIRecommendations/AIRecommendations.jsx';
import ProgressCharts from '../components/widgets/ProgressCharts/ProgressCharts.jsx';

export default function Dashboard() {
  const { t } = useTranslation();
  return (
    <div className="dashboard-page">
      <div className="page-header desktop-only">
        <h1 className="page-title">{t('dashboard.title')}</h1>
        <p className="page-subtitle">{t('dashboard.subtitle')}</p>
      </div>
      <div className="dashboard-grid">
        <div className="dashboard-col-left">
          <ClockWidget />
          <HabitTracker compact />
          <AIRecommendations />
        </div>
        <div className="dashboard-col-right">
          <ProgressCharts compact />
          <TaskManager compact />
        </div>
      </div>
      <style>{`
        .dashboard-grid { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 24px; 
        }
        .dashboard-col-left, .dashboard-col-right { 
          display: flex; 
          flex-direction: column; 
          gap: 24px; 
        }
        @media (max-width: 1024px) { 
          .dashboard-grid { 
            grid-template-columns: 1fr; 
          } 
        }
        @media (max-width: 768px) {
          .dashboard-grid {
            gap: 16px;
          }
          .dashboard-col-left, .dashboard-col-right {
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
}
