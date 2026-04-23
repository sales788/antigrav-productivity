import { useTranslation } from 'react-i18next';
import HabitTracker from '../components/widgets/HabitTracker/HabitTracker.jsx';

export default function Habits() {
  const { t } = useTranslation();
  return (
    <div>
      <h1 className="page-title">{t('habits.title')}</h1>
      <p className="page-subtitle">{t('habits.subtitle')}</p>
      <HabitTracker compact={false} />
    </div>
  );
}
