import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

const sample = '{\n  "name": "Toolbox",\n  "tags": ["react", "vite"],\n  "nested": { "private": true, "count": 3 }\n}';

function parseJson(text: string): { value: unknown; error: boolean } {
  if (!text.trim()) return { value: undefined, error: false };
  try { return { value: JSON.parse(text), error: false }; }
  catch { return { value: undefined, error: true }; }
}

function toMinified(text: string): string | null {
  const parsed = parseJson(text);
  if (parsed.error || parsed.value === undefined) return null;
  return JSON.stringify(parsed.value);
}

function toPretty(text: string): string | null {
  const parsed = parseJson(text);
  if (parsed.error || parsed.value === undefined) return null;
  return JSON.stringify(parsed.value, null, 2);
}

const JsonMinifyTool = memo(function JsonMinifyTool() {
  const { t } = useTranslation();
  const [pretty, setPretty] = useState(sample);
  const [minified, setMinified] = useState(() => toMinified(sample) || '');

  const prettyParsed = useMemo(() => parseJson(pretty), [pretty]);
  const minifiedParsed = useMemo(() => parseJson(minified), [minified]);

  const changePretty = (value: string) => {
    setPretty(value);
    const next = toMinified(value);
    if (next !== null) setMinified(next);
  };

  const changeMinified = (value: string) => {
    setMinified(value);
    const next = toPretty(value);
    if (next !== null) setPretty(next);
  };

  const stats = useMemo(() => {
    if (!minified || minifiedParsed.error) return null;
    const originalBytes = new Blob([pretty]).size;
    const minifiedBytes = new Blob([minified]).size;
    const saved = originalBytes > 0 ? Math.round((1 - minifiedBytes / originalBytes) * 100) : 0;
    return { original: originalBytes, minified: minifiedBytes, saved };
  }, [pretty, minified, minifiedParsed.error]);

  return (
    <ToolLayout id="json-minify" color="#22d3ee">
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">{t('tools.json-minify.input')}</h2>
            <CopyButton value={pretty} />
          </div>
          <GlassInput multiline aria-label={t('tools.json-minify.input')} rows={16} className={prettyParsed.error ? 'border-red-400/60' : ''} value={pretty} onChange={(event) => changePretty(event.target.value)} placeholder={t('tools.json-minify.placeholder')} />
          {prettyParsed.error && <p className="mt-2 text-sm text-red-500 dark:text-red-300">{t('tools.json-minify.invalid')}</p>}
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">{t('tools.json-minify.output')}</h2>
            <CopyButton value={minified} />
          </div>
          <GlassInput multiline aria-label={t('tools.json-minify.output')} rows={16} className={`font-mono text-sm ${minifiedParsed.error ? 'border-red-400/60' : ''}`} value={minified} onChange={(event) => changeMinified(event.target.value)} placeholder={t('tools.json-minify.placeholder')} />
          {minifiedParsed.error && <p className="mt-2 text-sm text-red-500 dark:text-red-300">{t('tools.json-minify.invalid')}</p>}
        </div>
      </div>
      {stats && (
        <p className="mt-4 text-xs text-[var(--color-text-muted)]">
          {t('tools.json-minify.stats', stats)}
        </p>
      )}
    </ToolLayout>
  );
});

export default JsonMinifyTool;