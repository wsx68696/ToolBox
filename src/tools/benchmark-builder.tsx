import { Plus, Trash2 } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

interface Suite {
  id: number;
  title: string;
  values: string;
}

let counter = 0;
const nextId = () => { counter += 1; return counter; };

interface Stats {
  id: number;
  title: string;
  size: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  stddev: number;
}

function parseValues(raw: string): number[] {
  return raw
    .split(/[\s,;]+/)
    .map((token) => Number(token))
    .filter((value) => Number.isFinite(value));
}

function computeStats(suite: Suite): Stats | null {
  const values = parseValues(suite.values);
  if (values.length === 0) return null;
  const size = values.length;
  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((sum, value) => sum + value, 0) / size;
  const median = size % 2 === 0 ? (sorted[size / 2 - 1] + sorted[size / 2]) / 2 : sorted[(size - 1) / 2];
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / size;
  return { id: suite.id, title: suite.title, size, mean, median, min: sorted[0], max: sorted[size - 1], stddev: Math.sqrt(variance) };
}

function format(value: number): string {
  if (Math.abs(value) >= 1000 || value === 0) return value.toFixed(0);
  return value.toPrecision(4).replace(/\.?0+$/, '');
}

const BenchmarkBuilderTool = memo(function BenchmarkBuilderTool() {
  const { t } = useTranslation();
  const [unit, setUnit] = useState('ms');
  const [suites, setSuites] = useState<Suite[]>(() => [
    { id: nextId(), title: 'Implementation A', values: '12 13 11 12.5 14 12 13' },
    { id: nextId(), title: 'Implementation B', values: '18 19 17 20 18.5 19 18' },
  ]);

  const stats = useMemo(() => suites.map(computeStats).filter((entry): entry is Stats => entry !== null), [suites]);
  const fastest = useMemo(() => (stats.length ? stats.reduce((best, entry) => (entry.mean < best.mean ? entry : best)) : null), [stats]);

  const patch = (id: number, update: Partial<Suite>) =>
    setSuites((current) => current.map((s) => (s.id === id ? { ...s, ...update } : s)));

  const summary = useMemo(() => {
    if (!stats.length || !fastest) return '';
    return stats
      .slice()
      .sort((a, b) => a.mean - b.mean)
      .map((entry) => {
        const factor = entry.mean / fastest.mean;
        const label = entry.id === fastest.id ? t('tools.benchmark-builder.fastest') : `${factor.toFixed(2)}× ${t('tools.benchmark-builder.slower')}`;
        return `${entry.title}: ${format(entry.mean)} ${unit} (${label})`;
      })
      .join('\n');
  }, [stats, fastest, unit, t]);

  return (
    <ToolLayout id="benchmark-builder" color="#fbbf24">
      <div className="mb-5 flex flex-wrap items-end gap-3">
        <label className="block text-sm text-[var(--color-text-muted)]">
          {t('tools.benchmark-builder.unit')}
          <GlassInput aria-label={t('tools.benchmark-builder.unit')} value={unit} onChange={(event) => setUnit(event.target.value)} className="mt-2 w-24" placeholder="ms" />
        </label>
        <GlassButton onClick={() => setSuites((current) => [...current, { id: nextId(), title: `Implementation ${String.fromCharCode(65 + current.length)}`, values: '' }])}>
          <Plus size={16} /> {t('tools.benchmark-builder.addSuite')}
        </GlassButton>
      </div>

      <div className="space-y-3">
        {suites.map((suite) => (
          <div key={suite.id} className="glass-input space-y-2 p-4">
            <div className="flex items-center gap-2">
              <GlassInput aria-label={t('tools.benchmark-builder.title')} value={suite.title} onChange={(event) => patch(suite.id, { title: event.target.value })} placeholder={t('tools.benchmark-builder.title')} />
              <button type="button" aria-label={t('tools.benchmark-builder.remove')} className="glass-button shrink-0 px-2" onClick={() => setSuites((current) => current.filter((s) => s.id !== suite.id))}><Trash2 size={16} /></button>
            </div>
            <GlassInput multiline rows={2} aria-label={t('tools.benchmark-builder.values')} value={suite.values} onChange={(event) => patch(suite.id, { values: event.target.value })} placeholder={t('tools.benchmark-builder.valuesPlaceholder')} className="font-mono text-sm" />
          </div>
        ))}
      </div>

      {stats.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-[var(--color-text-muted)]">
                <th className="px-3 py-2 font-medium">{t('tools.benchmark-builder.title')}</th>
                <th className="px-3 py-2 text-right font-medium">n</th>
                <th className="px-3 py-2 text-right font-medium">{t('tools.benchmark-builder.mean')}</th>
                <th className="px-3 py-2 text-right font-medium">{t('tools.benchmark-builder.median')}</th>
                <th className="px-3 py-2 text-right font-medium">{t('tools.benchmark-builder.min')}</th>
                <th className="px-3 py-2 text-right font-medium">{t('tools.benchmark-builder.max')}</th>
                <th className="px-3 py-2 text-right font-medium">σ</th>
                <th className="px-3 py-2 text-right font-medium">{t('tools.benchmark-builder.relative')}</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {stats.slice().sort((a, b) => a.mean - b.mean).map((entry) => (
                <tr key={entry.id} className={`border-t border-white/5 ${fastest && entry.id === fastest.id ? 'text-emerald-600 dark:text-emerald-300' : ''}`}>
                  <td className="px-3 py-2 font-sans">{entry.title}</td>
                  <td className="px-3 py-2 text-right">{entry.size}</td>
                  <td className="px-3 py-2 text-right">{format(entry.mean)}</td>
                  <td className="px-3 py-2 text-right">{format(entry.median)}</td>
                  <td className="px-3 py-2 text-right">{format(entry.min)}</td>
                  <td className="px-3 py-2 text-right">{format(entry.max)}</td>
                  <td className="px-3 py-2 text-right">{format(entry.stddev)}</td>
                  <td className="px-3 py-2 text-right">{fastest && entry.id === fastest.id ? '1.00×' : `${(entry.mean / (fastest?.mean ?? 1)).toFixed(2)}×`}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">{t('tools.benchmark-builder.summary')}</h3>
            <CopyButton value={summary} />
          </div>
          <pre className="mono-panel mt-2 overflow-x-auto px-4 py-3 font-mono text-sm whitespace-pre-wrap">{summary}</pre>
        </div>
      )}
      <p className="mt-4 text-xs text-[var(--color-text-muted)]">{t('tools.benchmark-builder.hint')}</p>
    </ToolLayout>
  );
});

export default BenchmarkBuilderTool;
