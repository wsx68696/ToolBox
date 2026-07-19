import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] ?? char));
}

function highlightJson(json: string) {
  return escapeHtml(json).replace(/("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
    let cls = 'text-cyan-600 dark:text-cyan-300';
    if (/^"/.test(match)) cls = /:$/.test(match) ? 'text-pink-600 dark:text-pink-300' : 'text-green-600 dark:text-green-300';
    else if (/true|false/.test(match)) cls = 'text-amber-600 dark:text-amber-300';
    else if (/null/.test(match)) cls = 'text-slate-500 dark:text-slate-400';
    return `<span class="${cls}">${match}</span>`;
  });
}

const JsonTool = memo(function JsonTool() {
  const { t } = useTranslation();
  const [input, setInput] = useState('{\n  "name": "Toolbox",\n  "private": true\n}');
  const [output, error] = useMemo<[string, string]>(() => {
    try {
      return [JSON.stringify(JSON.parse(input), null, 2), ''];
    } catch (err) {
      return ['', err instanceof Error ? err.message : 'Invalid JSON'];
    }
  }, [input]);

  const transform = (kind: 'format' | 'minify' | 'escape') => {
    try {
      const parsed = JSON.parse(input);
      if (kind === 'format') setInput(JSON.stringify(parsed, null, 2));
      if (kind === 'minify') setInput(JSON.stringify(parsed));
      if (kind === 'escape') setInput(JSON.stringify(JSON.stringify(parsed)));
    } catch {
      return;
    }
  };

  return (
    <ToolLayout id="json" color="#4ade80">
      <div className="mb-4 flex flex-wrap gap-2">
        <GlassButton aria-label={t('tools.json.format')} onClick={() => transform('format')}>{t('tools.json.format')}</GlassButton>
        <GlassButton aria-label={t('tools.json.minify')} onClick={() => transform('minify')}>{t('tools.json.minify')}</GlassButton>
        <GlassButton aria-label={t('tools.json.escape')} onClick={() => transform('escape')}>{t('tools.json.escape')}</GlassButton>
        <CopyButton value={output || input} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <GlassInput multiline aria-label={t('tools.json.inputPlaceholder')} rows={18} value={input} onChange={(event) => setInput(event.target.value)} placeholder={t('tools.json.inputPlaceholder')} />
        <div className="glass-input min-h-[28rem] overflow-auto p-4 font-mono text-sm">
          {error ? <span className="text-red-500 dark:text-red-300">{error}</span> : <pre className="m-0" dangerouslySetInnerHTML={{ __html: highlightJson(output) }} />}
        </div>
      </div>
    </ToolLayout>
  );
});

export default JsonTool;
