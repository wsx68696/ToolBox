import { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

const PRESETS = [60, 120, 180, 300, 600, 900, 1800, 3600, 7200, 86400] as const;

function pad(n: number) {
  return String(Math.max(0, Math.floor(n))).padStart(2, '0');
}

function formatRemaining(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  if (days > 0) return `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

const CountdownTool = memo(function CountdownTool() {
  const { t } = useTranslation();
  const [endAt, setEndAt] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [customMin, setCustomMin] = useState('5');

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(id);
  }, [running]);

  const remaining = endAt == null ? 0 : Math.max(0, endAt - now);
  const done = endAt != null && remaining === 0;

  useEffect(() => {
    if (done && running) setRunning(false);
  }, [done, running]);

  const start = (seconds: number) => {
    setEndAt(Date.now() + seconds * 1000);
    setRunning(true);
    setNow(Date.now());
  };

  const label = useMemo(() => {
    if (endAt == null) return '00:00:00';
    return formatRemaining(remaining);
  }, [endAt, remaining]);

  return (
    <ToolLayout id="countdown" color="#fbbf24">
      <div className="flex flex-col items-center gap-6">
        <div className={`font-mono text-5xl tracking-wider sm:text-6xl ${done ? 'text-emerald-500' : ''}`}>{label}</div>
        {done && <p className="text-sm text-emerald-600 dark:text-emerald-400">{t('tools.countdown.done')}</p>}
        <div className="flex flex-wrap justify-center gap-2">
          {PRESETS.map((s) => (
            <GlassButton key={s} onClick={() => start(s)}>
              {s < 60 ? `${s}s` : s < 3600 ? t('tools.countdown.minutes', { n: s / 60 }) : t('tools.countdown.hours', { n: s / 3600 })}
            </GlassButton>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-sm text-[var(--color-text-muted)]">
            {t('tools.countdown.custom')}
            <GlassInput type="number" min={1} aria-label={t('tools.countdown.custom')} value={customMin} onChange={(e) => setCustomMin(e.target.value)} className="mt-1 w-28" />
          </label>
          <GlassButton onClick={() => start(Math.max(1, Number(customMin) || 1) * 60)}>{t('tools.countdown.start')}</GlassButton>
          {running && <GlassButton onClick={() => setRunning(false)}>{t('tools.countdown.pause')}</GlassButton>}
          {!running && endAt != null && remaining > 0 && <GlassButton onClick={() => { setEndAt(Date.now() + remaining); setRunning(true); }}>{t('tools.countdown.resume')}</GlassButton>}
          <GlassButton onClick={() => { setEndAt(null); setRunning(false); }}>{t('tools.countdown.reset')}</GlassButton>
        </div>
      </div>
    </ToolLayout>
  );
});

export default CountdownTool;
