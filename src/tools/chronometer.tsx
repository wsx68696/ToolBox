import { memo, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GlassButton from '../components/GlassButton';
import ToolLayout from '../components/ToolLayout';

function formatTime(ms: number): string {
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  const centis = Math.floor((ms % 1000) / 10);
  const pad = (n: number) => String(n).padStart(2, '0');
  const base = `${pad(minutes)}:${pad(seconds)}.${pad(centis)}`;
  return hours > 0 ? `${pad(hours)}:${base}` : base;
}

const ChronometerTool = memo(function ChronometerTool() {
  const { t } = useTranslation();
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const baseRef = useRef(0);
  const startRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setElapsed(baseRef.current + performance.now() - startRef.current);
    }, 31);
    return () => window.clearInterval(id);
  }, [running]);

  const toggle = () => {
    if (running) {
      baseRef.current = baseRef.current + performance.now() - startRef.current;
      setElapsed(baseRef.current);
      setRunning(false);
    } else {
      startRef.current = performance.now();
      setRunning(true);
    }
  };

  const reset = () => {
    baseRef.current = 0;
    setElapsed(0);
    setLaps([]);
    setRunning(false);
  };

  const lap = () => {
    setLaps((current) => [...current, baseRef.current + performance.now() - startRef.current]);
  };

  return (
    <ToolLayout id="chronometer" color="#fbbf24">
      <div className="flex flex-col items-center gap-6 py-6">
        <div className="font-mono text-6xl tabular-nums tracking-tight sm:text-7xl">{formatTime(elapsed)}</div>
        <div className="flex gap-3">
          <GlassButton onClick={toggle}>{running ? t('tools.chronometer.pause') : elapsed > 0 ? t('tools.chronometer.resume') : t('tools.chronometer.start')}</GlassButton>
          <GlassButton onClick={lap} disabled={!running}>{t('tools.chronometer.lap')}</GlassButton>
          <GlassButton onClick={reset} disabled={elapsed === 0 && laps.length === 0}>{t('tools.chronometer.reset')}</GlassButton>
        </div>
      </div>
      {laps.length > 0 && (
        <div className="mono-panel divide-y divide-white/5">
          {laps.map((time, index) => (
            <div key={index} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
              <span className="text-[var(--color-text-muted)]">{t('tools.chronometer.lapLabel', { index: index + 1 })}</span>
              <span className="flex gap-6 font-mono tabular-nums">
                <span className="text-[var(--color-text-muted)]">+{formatTime(time - (laps[index - 1] ?? 0))}</span>
                <span>{formatTime(time)}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </ToolLayout>
  );
});

export default ChronometerTool;
