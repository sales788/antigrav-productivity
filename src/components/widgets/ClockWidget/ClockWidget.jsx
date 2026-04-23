import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getQuote } from '../../../lib/quotes.js';

export default function ClockWidget() {
  const { t } = useTranslation();
  const [time, setTime] = useState(new Date());
  const [quote, setQuote] = useState({ text: '', author: '' });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    getQuote().then(setQuote);
  }, []);

  const hour = time.getHours();
  const greeting = hour < 6 ? t('dashboard.greeting.night')
    : hour < 12 ? t('dashboard.greeting.morning')
    : hour < 18 ? t('dashboard.greeting.afternoon')
    : t('dashboard.greeting.evening');

  const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = time.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="clock-widget card animate-fadeInUp">
      <div className="clock-greeting">{greeting} 👋</div>
      <div className="clock-time text-mono">{timeStr}</div>
      <div className="clock-date">{dateStr}</div>
      {quote.text && (
        <div className="clock-quote">
          <p className="quote-text">"{quote.text}"</p>
          <p className="quote-author">— {quote.author}</p>
        </div>
      )}
      <style>{`
        .clock-widget {
          background: linear-gradient(135deg, rgba(108,99,255,0.15), rgba(0,212,170,0.1));
          text-align: center;
          padding: 32px;
        }
        .clock-widget:hover { transform: translateY(-2px); }
        .clock-greeting {
          font-size: 1.1rem;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }
        .clock-time {
          font-size: 3.5rem;
          font-weight: 700;
          letter-spacing: 2px;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.2;
        }
        .clock-date {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-top: 4px;
          margin-bottom: 20px;
        }
        .clock-quote {
          border-top: 1px solid var(--border-color);
          padding-top: 16px;
          margin-top: 8px;
        }
        .quote-text {
          font-size: 0.9rem;
          font-style: italic;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 6px;
        }
        .quote-author {
          font-size: 0.8rem;
          color: var(--text-tertiary);
          font-weight: 500;
        }
        @media (max-width: 768px) {
          .clock-time { font-size: 2.5rem; }
        }
      `}</style>
    </div>
  );
}
