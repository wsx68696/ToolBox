import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

interface DiffLine { type: 'same' | 'add' | 'del'; text: string }

const MAX_LINES = 2000;

function diffLines(aText: string, bText: string): DiffLine[] | null {
  const a = aText.split('\n');
  const b = bText.split('\n');
  if (a.length > MAX_LINES || b.length > MAX_LINES) return null;
  const n = a.length;
  const m = b.length;
  const width = m + 1;
  const dp = new Uint16Array((n + 1) * width);
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      dp[i * width + j] = a[i] === b[j]
        ? dp[(i + 1) * width + j + 1] + 1
        : Math.max(dp[(i + 1) * width + j], dp[i * width + j + 1]);
    }
  }
  const out: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { out.push({ type: 'same', text: a[i] }); i += 1; j += 1; }
    else if (dp[(i + 1) * width + j] >= dp[i * width + j + 1]) { out.push({ type: 'del', text: a[i] }); i += 1; }
    else { out.push({ type: 'add', text: b[j] }); j += 1; }
  }
  while (i < n) { out.push({ type: 'del', text: a[i] }); i += 1; }
  while (j < m) { out.push({ type: 'add', text: b[j] }); j += 1; }
  return out;
}

const rowStyles: Record<DiffLine['type'], string> = {
  same: 'text-[var(--color-text-muted)]',
  add: 'bg-green-500/10 text-green-700 dark:text-green-300',
  del: 'bg-red-500/10 text-red-700 dark:text-red-300',
};

const prefixes: Record<DiffLine['type'], string> = { same: ' ', add: '+', del: '-' };

const TextDiffTool = memo(function TextDiffTool() {
  const { t } = useTranslation();
  const [left, setLeft] = useState('The quick brown fox\njumps over\nthe lazy dog');
  const [right, setRight] = useState('The quick brown fox\nleaps over\nthe lazy dog\nand runs away');

  const diff = useMemo(() => diffLines(left, right), [left, right]);
  const stats = useMemo(() => {
    if (!diff) return null;
    return {
      added: diff.filter((line) => line.type === 'add').length,
      removed: diff.filter((line) => line.type === 'del').length,
    };
  }, [diff]);

  return (
    <ToolLayout id="text-diff" color="#4ade80">
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <h2 className="mb-2 font-semibold">{t('tools.text-diff.original')}</h2>
          <GlassInput multiline aria-label={t('tools.text-diff.original')} rows={10} value={left} onChange={(event) => setLeft(event.target.value)} placeholder={t('tools.text-diff.original')} />
        </div>
        <div>
          <h2 className="mb-2 font-semibold">{t('tools.text-diff.modified')}</h2>
          <GlassInput multiline aria-label={t('tools.text-diff.modified')} rows={10} value={right} onChange={(event) => setRight(event.target.value)} placeholder={t('tools.text-diff.modified')} />
        </div>
      </div>
      {!diff && <p className="mt-4 text-sm text-red-500 dark:text-red-300">{t('tools.text-diff.tooLarge')}</p>}
      {diff && stats && (
        <>
          <div className="mt-5 flex gap-4 text-sm">
            <span className="text-green-600 dark:text-green-300">+{stats.added} {t('tools.text-diff.added')}</span>
            <span className="text-red-600 dark:text-red-300">−{stats.removed} {t('tools.text-diff.removed')}</span>
          </div>
          <div className="mt-3 overflow-hidden rounded-2xl border border-[var(--color-border)]">
            <div className="max-h-[32rem] overflow-auto font-mono text-sm leading-6">
              {diff.map((line, index) => (
                <div key={index} className={`whitespace-pre-wrap break-all px-3 ${rowStyles[line.type]}`}>
                  <span className="mr-2 select-none opacity-60">{prefixes[line.type]}</span>
                  {line.text || ' '}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </ToolLayout>
  );
});

export default TextDiffTool;
