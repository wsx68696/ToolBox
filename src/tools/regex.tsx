import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

const presets = [
  { label: 'Email', value: '[\\w.%+-]+@[\\w.-]+\\.[A-Za-z]{2,}' },
  { label: 'URL', value: 'https?:\\/\\/[^\\s]+' },
  { label: 'IPv4', value: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b' },
];

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] ?? char));
}

const RegexTool = memo(function RegexTool() {
  const { t } = useTranslation();
  const [pattern, setPattern] = useState('[A-Z][a-z]+');
  const [flags, setFlags] = useState('g');
  const [text, setText] = useState('Toolbox ships practical React tools for Alice and Bob.');
  const result = useMemo(() => {
    try {
      const regex = new RegExp(pattern, flags.includes('g') ? flags : `${flags}g`);
      const matches = Array.from(text.matchAll(regex));
      let last = 0;
      const html = matches.map((match) => {
        const index = match.index ?? 0;
        const segment = `${escapeHtml(text.slice(last, index))}<mark class="rounded bg-green-300/25 px-1 text-green-800 dark:text-green-100">${escapeHtml(match[0])}</mark>`;
        last = index + match[0].length;
        return segment;
      }).join('') + escapeHtml(text.slice(last));
      return { html, matches: matches.map((match) => match[0]), error: '' };
    } catch (err) {
      return { html: escapeHtml(text), matches: [], error: err instanceof Error ? err.message : t('tools.regex.invalid') };
    }
  }, [flags, pattern, text, t]);

  return (
    <ToolLayout id="regex" color="#4ade80">
      <div className="mb-4 flex flex-wrap gap-2">
        {presets.map((preset) => (
          <GlassButton key={preset.label} aria-label={`${t('tools.regex.presets')}: ${preset.label}`} onClick={() => setPattern(preset.value)}>
            {preset.label}
          </GlassButton>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_8rem]">
        <GlassInput aria-label={t('tools.regex.pattern')} value={pattern} onChange={(event) => setPattern(event.target.value)} placeholder={t('tools.regex.pattern')} />
        <GlassInput aria-label={t('tools.regex.flags')} value={flags} onChange={(event) => setFlags(event.target.value)} placeholder={t('tools.regex.flags')} />
      </div>
      <GlassInput multiline aria-label={t('tools.regex.testText')} className="mt-4" rows={8} value={text} onChange={(event) => setText(event.target.value)} placeholder={t('tools.regex.testText')} />
      {result.error && <p className="mt-3 text-sm text-red-500 dark:text-red-300">{result.error}</p>}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="glass-input min-h-48 p-4 leading-7" dangerouslySetInnerHTML={{ __html: result.html }} />
        <div>
          <div className="mb-2 flex justify-end"><CopyButton value={result.matches.join('\n')} /></div>
          <div className="glass-input mono-panel min-h-48 p-4">{result.matches.join('\n') || t('tools.regex.noMatches')}</div>
        </div>
      </div>
    </ToolLayout>
  );
});

export default RegexTool;
