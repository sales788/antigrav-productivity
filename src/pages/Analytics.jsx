import { useTranslation } from 'react-i18next';
import ProgressCharts from '../components/widgets/ProgressCharts/ProgressCharts.jsx';

export default function Analytics() {
  const { t } = useTranslation();
  return (
    <div>
      <h1 className="page-title">{t('analytics.title')}</h1>
      <p className="page-subtitle">{t('analytics.subtitle')}</p>
      <ProgressCharts compact={false} />
    </div>
  );
}
