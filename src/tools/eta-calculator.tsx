import type { TFunction } from 'i18next';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

type TimeUnit = 'seconds' | 'minutes' | 'hours';

const UNIT_SECONDS: Record<TimeUnit, number> = { seconds: 1, minutes: 60, hours: 3600 };

function formatDuration(totalSeconds: number, t: TFunction): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '—';
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.round(totalSeconds % 60);
  const parts: string[] = [];
  if (days > 0) parts.push(t('tools.eta-calculator.dayUnit', { count: days }));
  if (hours > 0) parts.push(t('tools.eta-calculator.hourUnit', { count: hours }));
  if (minutes > 0) parts.push(t('tools.eta-calculator.minuteUnit', { count: minutes }));
  if (seconds > 0 || parts.length === 0) parts.push(t('tools.eta-calculator.secondUnit', { count: seconds }));
  return parts.join(' ');
}

const EtaCalculatorTool = memo(function EtaCalculatorTool() {
  const { t } = useTranslation();
  const [total, setTotal] = useState('100');
  const [done, setDone] = useState('25');
  const [elapsed, setElapsed] = useState('30');
  const [unit, setUnit] = useState<TimeUnit>('minutes');

  const result = useMemo(() => {
    const totalNum = Number(total);
    const doneNum = Number(done);
    const elapsedSeconds = Number(elapsed) * UNIT_SECONDS[unit];
    if (!Number.isFinite(totalNum) || !Number.isFinite(doneNum) || !Number.isFinite(elapsedSeconds)) return null;
    if (totalNum <= 0 || doneNum <= 0 || elapsedSeconds <= 0 || doneNum > totalNum) return null;
    const rate = doneNum / elapsedSeconds;
    const remainingSeconds = (totalNum - doneNum) / rate;
    const totalSeconds = totalNum / rate;
    return {
      ratePerHour: rate * 3600,
      remainingSeconds,
      totalSeconds,
      eta: new Date(Date.now() + remainingSeconds * 1000),
      progress: doneNum / totalNum,
    };
  }, [total, done, elapsed, unit]);

  const units: { key: TimeUnit; label: string }[] = [
    { key: 'seconds', label: t('tools.eta-calculator.unitSeconds') },
    { key: 'minutes', label: t('tools.eta-calculator.unitMinutes') },
    { key: 'hours', label: t('tools.eta-calculator.unitHours') },
  ];

  const rows: [string, string][] = result
    ? [
        [t('tools.eta-calculator.speed'), t('tools.eta-calculator.speedValue', { value: result.ratePerHour >= 10 ? Math.round(result.ratePerHour) : result.ratePerHour.toFixed(2) })],
        [t('tools.eta-calculator.remaining'), formatDuration(result.remainingSeconds, t)],
        [t('tools.eta-calculator.totalDuration'), formatDuration(result.totalSeconds, t)],
        [t('tools.eta-calculator.eta'), result.eta.toLocaleString()],
      ]
    : [];

  return (
    <ToolLayout id="eta-calculator" color="#22d3ee">
      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block text-sm text-[var(--color-text-muted)]">
          {t('tools.eta-calculator.total')}
          <GlassInput aria-label={t('tools.eta-calculator.total')} type="number" min={1} value={total} onChange={(event) => setTotal(event.target.value)} className="mt-2" />
        </label>
        <label className="block text-sm text-[var(--color-text-muted)]">
          {t('tools.eta-calculator.done')}
          <GlassInput aria-label={t('tools.eta-calculator.done')} type="number" min={0} value={done} onChange={(event) => setDone(event.target.value)} className="mt-2" />
        </label>
        <label className="block text-sm text-[var(--color-text-muted)]">
          {t('tools.eta-calculator.elapsed')}
          <GlassInput aria-label={t('tools.eta-calculator.elapsed')} type="number" min={0} value={elapsed} onChange={(event) => setElapsed(event.target.value)} className="mt-2" />
        </label>
        <label className="block text-sm text-[var(--color-text-muted)]">
          {t('tools.eta-calculator.unit')}
          <select className="glass-select mt-2 w-full" value={unit} onChange={(event) => setUnit(event.target.value as TimeUnit)} aria-label={t('tools.eta-calculator.unit')}>
            {units.map(({ key, label }) => <option key={key} value={key}>{label}</option>)}
          </select>
        </label>
      </div>
      {result ? (
        <>
          <div className="mb-5">
            <div className="mb-2 flex justify-between text-sm text-[var(--color-text-muted)]">
              <span>{t('tools.eta-calculator.progress')}</span>
              <span>{Math.round(result.progress * 100)}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[var(--color-surface-active)]">
              <div className="h-full rounded-full bg-cyan-500 transition-all dark:bg-cyan-300" style={{ width: `${result.progress * 100}%` }} />
            </div>
          </div>
          <div className="mono-panel divide-y divide-white/5">
            {rows.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <span className="shrink-0 text-sm text-[var(--color-text-muted)]">{label}</span>
                <span className="truncate font-mono text-sm">{value}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm text-[var(--color-text-muted)]">{t('tools.eta-calculator.invalid')}</p>
      )}
    </ToolLayout>
  );
});

export default EtaCalculatorTool;
