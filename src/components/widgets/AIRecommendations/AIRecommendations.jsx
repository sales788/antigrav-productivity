import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAIRecommendations } from '../../../lib/openai.js';
import { useHabits } from '../../../hooks/useHabits.js';
import { useTasks } from '../../../hooks/useTasks.js';

export default function AIRecommendations() {
  const { t, i18n } = useTranslation();
  const { habits } = useHabits();
  const { tasks } = useTasks();
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const recs = await getAIRecommendations(habits, tasks, i18n.language);
      setRecommendations(Array.isArray(recs) ? recs : recs.recommendations || []);
    } catch (e) {
      setError(t('ai.error'));
    }
    setLoading(false);
  };

  return (
    <div className="ai-widget card animate-fadeInUp">
      <div className="card-title">
        <span className="icon">🤖</span>
        {t('ai.title')}
      </div>

      {!recommendations && !loading && (
        <div className="ai-prompt">
          <p className="ai-description">{t('ai.subtitle')}</p>
          <button className="btn btn-primary" onClick={generate} style={{ width: '100%' }}>
            ✨ {t('ai.generate')}
          </button>
        </div>
      )}

      {loading && (
        <div className="ai-loading">
          <div className="ai-loading-dots">
            <span></span><span></span><span></span>
          </div>
          <p>{t('ai.loading')}</p>
        </div>
      )}

      {error && <div className="auth-error">{error}</div>}

      {recommendations && (
        <div className="ai-results stagger-children">
          {recommendations.map((rec, i) => (
            <div key={i} className="ai-rec-card">
              <div className="ai-rec-title">{rec.title}</div>
              <div className="ai-rec-desc">{rec.description}</div>
            </div>
          ))}
          <button className="btn btn-secondary btn-sm" onClick={generate} style={{ marginTop: 8 }}>
            🔄 {t('ai.generate')}
          </button>
        </div>
      )}

      <style>{`
        .ai-prompt { text-align: center; padding: 20px 0; }
        .ai-description { color: var(--text-secondary); margin-bottom: 16px; font-size: 0.9rem; }
        .ai-loading { text-align: center; padding: 30px 0; }
        .ai-loading p { color: var(--text-secondary); margin-top: 12px; font-size: 0.9rem; }
        .ai-loading-dots { display: flex; gap: 6px; justify-content: center; }
        .ai-loading-dots span {
          width: 10px; height: 10px; border-radius: 50%;
          background: var(--accent-primary);
          animation: pulse 1.4s infinite;
        }
        .ai-loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .ai-loading-dots span:nth-child(3) { animation-delay: 0.4s; }
        .ai-results { display: flex; flex-direction: column; gap: 10px; }
        .ai-rec-card {
          padding: 14px; background: var(--bg-input);
          border-radius: var(--radius-md); border-left: 3px solid var(--accent-primary);
          transition: all var(--transition-fast);
        }
        .ai-rec-card:hover { background: var(--bg-card-hover); transform: translateX(4px); }
        .ai-rec-title { font-weight: 600; font-size: 0.9rem; margin-bottom: 4px; }
        .ai-rec-desc { font-size: 0.82rem; color: var(--text-secondary); line-height: 1.5; }
      `}</style>
    </div>
  );
}
