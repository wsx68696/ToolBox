import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

interface ParsedDate {
  date: Date | null;
  error: boolean;
}

function parseInput(input: string): ParsedDate {
  const trimmed = input.trim();
  if (!trimmed) return { date: null, error: false };
  // Unix seconds or milliseconds
  if (/^-?\d+$/.test(trimmed)) {
    const num = Number(trimmed);
    const ms = trimmed.length > 11 ? num : num * 1000;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? { date: null, error: true } : { date, error: false };
  }
  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? { date: null, error: true } : { date, error: false };
}

function pad(value: number, length = 2): string {
  return String(value).padStart(length, '0');
}

function formatRelative(date: Date, now: number): string {
  const diff = date.getTime() - now;
  const abs = Math.abs(diff);
  const units: [number, Intl.RelativeTimeFormatUnit][] = [
    [1000 * 60 * 60 * 24 * 365, 'year'],
    [1000 * 60 * 60 * 24 * 30, 'month'],
    [1000 * 60 * 60 * 24, 'day'],
    [1000 * 60 * 60, 'hour'],
    [1000 * 60, 'minute'],
    [1000, 'second'],
  ];
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  for (const [size, unit] of units) {
    if (abs >= size || unit === 'second') {
      return rtf.format(Math.round(diff / size), unit);
    }
  }
  return '';
}

const DateConverterTool = memo(function DateConverterTool() {
  const { t } = useTranslation();
  const now = useMemo(() => Date.now(), []);
  const [input, setInput] = useState(() => new Date(now).toISOString());
  const parsed = useMemo(() => parseInput(input), [input]);

  const rows = useMemo(() => {
    const date = parsed.date;
    if (!date) return [] as [string, string][];
    return [
      ['ISO 8601', date.toISOString()],
      ['ISO 8601 (local)', `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`],
      ['UTC', date.toUTCString()],
      ['Unix (s)', String(Math.floor(date.getTime() / 1000))],
      ['Unix (ms)', String(date.getTime())],
      ['RFC 2822', date.toString()],
      ['Local', date.toLocaleString()],
      [t('tools.date-converter.relative'), formatRelative(date, now)],
    ] as [string, string][];
  }, [parsed.date, now, t]);

  return (
    <ToolLayout id="date-converter" color="#fbbf24">
      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">{t('tools.date-converter.inputLabel')}</h2>
          <CopyButton value={input} />
        </div>
        <GlassInput
          aria-label={t('tools.date-converter.inputLabel')}
          className={parsed.error ? 'border-red-400/60' : ''}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={t('tools.date-converter.placeholder')}
        />
        {parsed.error && <p className="mt-2 text-sm text-red-500 dark:text-red-300">{t('tools.date-converter.invalid')}</p>}
      </div>
      {rows.length > 0 && (
        <div className="mono-panel divide-y divide-white/5">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <span className="shrink-0 text-sm text-[var(--color-text-muted)]">{label}</span>
              <span className="flex items-center gap-2 truncate font-mono text-sm">
                <span className="truncate">{value}</span>
                <CopyButton value={value} />
              </span>
            </div>
          ))}
        </div>
      )}
      <p className="mt-4 text-xs text-[var(--color-text-muted)]">{t('tools.date-converter.hint')}</p>
    </ToolLayout>
  );
});

export default DateConverterTool;
