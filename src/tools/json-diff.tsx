import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

type ChangeType = 'added' | 'removed' | 'changed';
interface Change { path: string; type: ChangeType; before?: string; after?: string }

function preview(value: unknown): string {
  if (typeof value === 'string') return JSON.stringify(value);
  if (value === null || typeof value !== 'object') return String(value);
  return Array.isArray(value) ? `[${(value as unknown[]).length}]` : `{${Object.keys(value as object).length}}`;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function diff(a: unknown, b: unknown, path: string, out: Change[]): void {
  if (Object.is(a, b)) return;
  if (isObject(a) && isObject(b)) {
    const keys = Array.from(new Set([...Object.keys(a), ...Object.keys(b)])).sort();
    for (const key of keys) {
      const childPath = path ? `${path}.${key}` : key;
      if (!(key in a)) out.push({ path: childPath, type: 'added', after: preview(b[key]) });
      else if (!(key in b)) out.push({ path: childPath, type: 'removed', before: preview(a[key]) });
      else diff(a[key], b[key], childPath, out);
    }
    return;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    const max = Math.max(a.length, b.length);
    for (let i = 0; i < max; i += 1) {
      const childPath = `${path}[${i}]`;
      if (i >= a.length) out.push({ path: childPath, type: 'added', after: preview(b[i]) });
      else if (i >= b.length) out.push({ path: childPath, type: 'removed', before: preview(a[i]) });
      else diff(a[i], b[i], childPath, out);
    }
    return;
  }
  if (JSON.stringify(a) !== JSON.stringify(b)) {
    out.push({ path: path || '(root)', type: 'changed', before: preview(a), after: preview(b) });
  }
}

function parse(text: string): { value: unknown; error: boolean } {
  if (!text.trim()) return { value: undefined, error: false };
  try { return { value: JSON.parse(text), error: false }; }
  catch { return { value: undefined, error: true }; }
}

const badge: Record<ChangeType, string> = {
  added: 'bg-green-500/15 text-green-700 dark:text-green-300',
  removed: 'bg-red-500/15 text-red-700 dark:text-red-300',
  changed: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
};

const JsonDiffTool = memo(function JsonDiffTool() {
  const { t } = useTranslation();
  const [left, setLeft] = useState('{\n  "name": "Toolbox",\n  "version": 1,\n  "tags": ["a", "b"]\n}');
  const [right, setRight] = useState('{\n  "name": "Toolbox",\n  "version": 2,\n  "tags": ["a", "c"],\n  "new": true\n}');

  const leftParsed = useMemo(() => parse(left), [left]);
  const rightParsed = useMemo(() => parse(right), [right]);

  const changes = useMemo(() => {
    if (leftParsed.error || rightParsed.error || leftParsed.value === undefined || rightParsed.value === undefined) return null;
    const out: Change[] = [];
    diff(leftParsed.value, rightParsed.value, '', out);
    return out;
  }, [leftParsed, rightParsed]);

  return (
    <ToolLayout id="json-diff" color="#22d3ee">
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <h2 className="mb-2 font-semibold">A</h2>
          <GlassInput multiline aria-label="JSON A" rows={12} className={leftParsed.error ? 'border-red-400/60' : ''} value={left} onChange={(event) => setLeft(event.target.value)} placeholder="{ }" />
        </div>
        <div>
          <h2 className="mb-2 font-semibold">B</h2>
          <GlassInput multiline aria-label="JSON B" rows={12} className={rightParsed.error ? 'border-red-400/60' : ''} value={right} onChange={(event) => setRight(event.target.value)} placeholder="{ }" />
        </div>
      </div>
      {(leftParsed.error || rightParsed.error) && <p className="mt-4 text-sm text-red-500 dark:text-red-300">{t('tools.json-diff.invalid')}</p>}
      {changes && (
        <div className="mt-5">
          <h2 className="mb-3 font-semibold">{changes.length ? t('tools.json-diff.changes', { count: changes.length }) : t('tools.json-diff.identical')}</h2>
          <div className="grid gap-2">
            {changes.map((change, index) => (
              <div key={index} className="glass-input flex flex-wrap items-center gap-3 p-3">
                <span className={`rounded px-2 py-0.5 text-xs font-semibold uppercase ${badge[change.type]}`}>{t(`tools.json-diff.${change.type}`)}</span>
                <code className="font-mono text-sm">{change.path}</code>
                <span className="flex-1" />
                {change.before !== undefined && <code className="font-mono text-xs text-red-600 line-through dark:text-red-300">{change.before}</code>}
                {change.after !== undefined && <code className="font-mono text-xs text-green-600 dark:text-green-300">{change.after}</code>}
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolLayout>
  );
});

export default JsonDiffTool;
