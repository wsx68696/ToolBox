import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

const UrlParserTool = memo(function UrlParserTool() {
  const { t } = useTranslation();
  const [input, setInput] = useState('https://user:pass@example.com:8080/path/to/page?q=toolbox&lang=zh#section');

  const parsed = useMemo(() => {
    try { return { url: new URL(input), error: false }; }
    catch { return { url: null, error: input.trim() !== '' }; }
  }, [input]);

  type PartKey = 'protocol' | 'username' | 'password' | 'hostname' | 'port' | 'path' | 'hash';
  const parts: { key: PartKey; value: string }[] = parsed.url ? [
    { key: 'protocol', value: parsed.url.protocol },
    { key: 'username', value: parsed.url.username },
    { key: 'password', value: parsed.url.password },
    { key: 'hostname', value: parsed.url.hostname },
    { key: 'port', value: parsed.url.port },
    { key: 'path', value: parsed.url.pathname },
    { key: 'hash', value: parsed.url.hash },
  ] : [];

  const params = parsed.url ? Array.from(parsed.url.searchParams.entries()) : [];

  return (
    <ToolLayout id="url-parser" color="#f87171">
      <GlassInput aria-label={t('tools.url-parser.inputPlaceholder')} className={parsed.error ? 'border-red-400/60' : ''} value={input} onChange={(event) => setInput(event.target.value)} placeholder="https://example.com/path?q=1" />
      {parsed.error && <p className="mt-3 text-sm text-red-500 dark:text-red-300">{t('tools.url-parser.invalid')}</p>}
      {parsed.url && (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {parts.map((part) => (
              <div key={part.key} className="glass-input flex items-center justify-between gap-3 p-3">
                <span className="text-sm text-[var(--color-text-muted)]">{t(`tools.url-parser.${part.key}`)}</span>
                <div className="flex min-w-0 items-center gap-2">
                  <code className="truncate font-mono text-sm">{part.value || '—'}</code>
                  {part.value && <CopyButton value={part.value} />}
                </div>
              </div>
            ))}
          </div>
          {params.length > 0 && (
            <>
              <h2 className="mb-3 mt-6 font-semibold">{t('tools.url-parser.queryParams')}</h2>
              <div className="overflow-hidden rounded-2xl border border-[var(--color-border)]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--color-surface)] text-[var(--color-text-muted)]">
                    <tr><th className="p-3">{t('tools.url-parser.key')}</th><th className="p-3">{t('tools.url-parser.value')}</th></tr>
                  </thead>
                  <tbody>
                    {params.map(([key, value], index) => (
                      <tr key={`${key}-${index}`} className="border-t border-[var(--color-border)]">
                        <td className="p-3 font-mono">{key}</td>
                        <td className="p-3 font-mono">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </ToolLayout>
  );
});

export default UrlParserTool;
