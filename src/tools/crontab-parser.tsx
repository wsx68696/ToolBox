import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

const macros: Record<string, string> = {
  '@yearly': '0 0 1 1 *',
  '@annually': '0 0 1 1 *',
  '@monthly': '0 0 1 * *',
  '@weekly': '0 0 * * 0',
  '@daily': '0 0 * * *',
  '@midnight': '0 0 * * *',
  '@hourly': '0 * * * *',
};

const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const dowNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function resolveName(token: string, names: string[], offset: number): string {
  const index = names.indexOf(token.toUpperCase());
  return index === -1 ? token : String(index + offset);
}

function parseField(expr: string, min: number, max: number, names: string[] = [], nameOffset = 0): Set<number> | null {
  const values = new Set<number>();
  for (const part of expr.split(',')) {
    const stepMatch = part.match(/^(.+?)(?:\/(\d+))?$/);
    if (!stepMatch) return null;
    const range = stepMatch[1];
    const step = stepMatch[2] !== undefined ? Number(stepMatch[2]) : 1;
    if (!Number.isInteger(step) || step < 1) return null;
    let start: number;
    let end: number;
    if (range === '*') {
      start = min; end = max;
    } else {
      const bounds = range.split('-');
      if (bounds.length > 2) return null;
      const low = resolveName(bounds[0], names, nameOffset);
      if (!/^\d+$/.test(low)) return null;
      start = Number(low);
      if (bounds.length === 2) {
        const high = resolveName(bounds[1], names, nameOffset);
        if (!/^\d+$/.test(high)) return null;
        end = Number(high);
      } else {
        end = start;
      }
    }
    if (start < min || end > max + (max === 6 ? 1 : 0) || start > end) return null;
    for (let v = start; v <= end; v += step) values.add(v === 7 && max === 6 ? 0 : v);
  }
  return values.size ? values : null;
}

interface Parsed {
  minute: Set<number>;
  hour: Set<number>;
  dom: Set<number>;
  month: Set<number>;
  dow: Set<number>;
  domRestricted: boolean;
  dowRestricted: boolean;
}

function parseCron(raw: string): Parsed | null {
  const input = macros[raw.trim().toLowerCase()] ?? raw.trim();
  const fields = input.split(/\s+/);
  if (fields.length !== 5) return null;
  const minute = parseField(fields[0], 0, 59);
  const hour = parseField(fields[1], 0, 23);
  const dom = parseField(fields[2], 1, 31);
  const month = parseField(fields[3], 1, 12, monthNames, 1);
  const dow = parseField(fields[4], 0, 6, dowNames, 0);
  if (!minute || !hour || !dom || !month || !dow) return null;
  return {
    minute, hour, dom, month, dow,
    domRestricted: !fields[2].startsWith('*'),
    dowRestricted: !fields[4].startsWith('*'),
  };
}

function matches(parsed: Parsed, date: Date): boolean {
  if (!parsed.minute.has(date.getMinutes())) return false;
  if (!parsed.hour.has(date.getHours())) return false;
  if (!parsed.month.has(date.getMonth() + 1)) return false;
  const domOk = parsed.dom.has(date.getDate());
  const dowOk = parsed.dow.has(date.getDay());
  if (parsed.domRestricted && parsed.dowRestricted) return domOk || dowOk;
  if (parsed.domRestricted) return domOk;
  if (parsed.dowRestricted) return dowOk;
  return true;
}

function nextRuns(parsed: Parsed, count: number): Date[] {
  const runs: Date[] = [];
  const cursor = new Date();
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1);
  const limit = 2 * 366 * 24 * 60;
  for (let i = 0; i < limit && runs.length < count; i += 1) {
    if (matches(parsed, cursor)) runs.push(new Date(cursor));
    cursor.setMinutes(cursor.getMinutes() + 1);
  }
  return runs;
}

const fieldKeys = ['minute', 'hour', 'dom', 'month', 'dow'] as const;

function describeSet(values: Set<number>, min: number, max: number): string {
  if (values.size === max - min + 1) return '*';
  const list = Array.from(values).sort((a, b) => a - b);
  if (list.length > 12) return `${list.slice(0, 12).join(', ')} …`;
  return list.join(', ');
}

const CrontabParserTool = memo(function CrontabParserTool() {
  const { t } = useTranslation();
  const [input, setInput] = useState('*/15 9-17 * * 1-5');

  const parsed = useMemo(() => parseCron(input), [input]);
  const runs = useMemo(() => (parsed ? nextRuns(parsed, 5) : []), [parsed]);

  const ranges: Record<(typeof fieldKeys)[number], [Set<number>, number, number]> | null = parsed ? {
    minute: [parsed.minute, 0, 59],
    hour: [parsed.hour, 0, 23],
    dom: [parsed.dom, 1, 31],
    month: [parsed.month, 1, 12],
    dow: [parsed.dow, 0, 6],
  } : null;

  return (
    <ToolLayout id="crontab-parser" color="#4ade80">
      <GlassInput aria-label={t('tools.crontab-parser.inputPlaceholder')} className={!parsed && input.trim() ? 'border-red-400/60' : ''} value={input} onChange={(event) => setInput(event.target.value)} placeholder="*/15 9-17 * * 1-5" />
      <p className="mt-2 text-xs text-[var(--color-text-muted)]">{t('tools.crontab-parser.hint')}</p>
      {!parsed && input.trim() && <p className="mt-3 text-sm text-red-500 dark:text-red-300">{t('tools.crontab-parser.invalid')}</p>}
      {parsed && ranges && (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {fieldKeys.map((key) => (
              <div key={key} className="glass-input p-3">
                <div className="mb-1 text-xs uppercase tracking-wider text-[var(--color-text-muted)]">{t(`tools.crontab-parser.${key}`)}</div>
                <div className="font-mono text-sm">{describeSet(...ranges[key])}</div>
              </div>
            ))}
          </div>
          <h2 className="mb-3 mt-6 font-semibold">{t('tools.crontab-parser.nextRuns')}</h2>
          {runs.length ? (
            <ol className="grid gap-2">
              {runs.map((run) => (
                <li key={run.getTime()} className="glass-input mono-panel p-3 text-sm">{run.toLocaleString()}</li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-[var(--color-text-muted)]">{t('tools.crontab-parser.noUpcoming')}</p>
          )}
        </>
      )}
    </ToolLayout>
  );
});

export default CrontabParserTool;
