import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

function words(input: string): string[] {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_\-.]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();

const transforms = [
  { key: 'lower', fn: (s: string) => s.toLowerCase() },
  { key: 'upper', fn: (s: string) => s.toUpperCase() },
  { key: 'camel', fn: (s: string) => words(s).map((w, i) => (i === 0 ? w.toLowerCase() : cap(w))).join('') },
  { key: 'pascal', fn: (s: string) => words(s).map(cap).join('') },
  { key: 'snake', fn: (s: string) => words(s).map((w) => w.toLowerCase()).join('_') },
  { key: 'constant', fn: (s: string) => words(s).map((w) => w.toUpperCase()).join('_') },
  { key: 'kebab', fn: (s: string) => words(s).map((w) => w.toLowerCase()).join('-') },
  { key: 'train', fn: (s: string) => words(s).map(cap).join('-') },
  { key: 'title', fn: (s: string) => words(s).map(cap).join(' ') },
  { key: 'sentence', fn: (s: string) => { const w = words(s).map((x) => x.toLowerCase()); return w.length ? cap(w[0]) + (w.length > 1 ? ' ' + w.slice(1).join(' ') : '') : ''; } },
] as const;

const CaseConverterTool = memo(function CaseConverterTool() {
  const { t } = useTranslation();
  const [text, setText] = useState('hello world example');

  const results = useMemo(() => transforms.map((tr) => ({ key: tr.key, value: tr.fn(text) })), [text]);

  return (
    <ToolLayout id="case-converter" color="#22d3ee">
      <GlassInput multiline aria-label={t('tools.case-converter.inputPlaceholder')} rows={4} value={text} onChange={(event) => setText(event.target.value)} placeholder={t('tools.case-converter.inputPlaceholder')} />
      <div className="mt-5 grid gap-3">
        {results.map((result) => (
          <div key={result.key} className="glass-input flex items-center justify-between gap-3 p-3">
            <span className="w-28 shrink-0 text-sm text-[var(--color-text-muted)]">{t(`tools.case-converter.${result.key}`)}</span>
            <code className="flex-1 truncate font-mono text-sm">{result.value}</code>
            <CopyButton value={result.value} />
          </div>
        ))}
      </div>
    </ToolLayout>
  );
});

export default CaseConverterTool;
