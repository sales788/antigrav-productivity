import { useTranslation } from 'react-i18next';
import TaskManager from '../components/widgets/TaskManager/TaskManager.jsx';

export default function Tasks() {
  const { t } = useTranslation();
  return (
    <div>
      <h1 className="page-title">{t('tasks.title')}</h1>
      <p className="page-subtitle">{t('tasks.subtitle')}</p>
      <TaskManager compact={false} />
    </div>
  );
}
