import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

const initialUrl = 'https://example.com/search?q=toolbox&theme=dark';

const UrlTool = memo(function UrlTool() {
  const { t } = useTranslation();
  const [decoded, setDecoded] = useState(initialUrl);
  const [encoded, setEncoded] = useState(() => encodeURIComponent(initialUrl));
  const [invalid, setInvalid] = useState(false);

  const changeDecoded = (value: string) => {
    setDecoded(value);
    try { setEncoded(encodeURIComponent(value)); } catch { setEncoded(''); }
    setInvalid(false);
  };

  const changeEncoded = (value: string) => {
    setEncoded(value);
    try {
      setDecoded(decodeURIComponent(value));
      setInvalid(false);
    } catch {
      setInvalid(true);
    }
  };

  const params = useMemo(() => {
    try {
      const source = decoded.includes('?') ? new URL(decoded).searchParams : new URLSearchParams(decoded);
      return Array.from(source.entries());
    } catch {
      return Array.from(new URLSearchParams(decoded).entries());
    }
  }, [decoded]);

  return (
    <ToolLayout id="url" color="#f87171">
      <div className="grid gap-5 lg:grid-cols-2">
        <Pane title={t('tools.url.decoded')} value={decoded} onChange={changeDecoded} placeholder={t('tools.url.inputPlaceholder')} />
        <Pane title={t('tools.url.encoded')} value={encoded} onChange={changeEncoded} placeholder={t('tools.url.encodedPlaceholder')} error={invalid ? t('tools.url.invalid') : ''} />
      </div>
      <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--color-border)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--color-surface)] text-[var(--color-text-muted)]">
            <tr>
              <th className="p-3">{t('tools.url.key')}</th>
              <th className="p-3">{t('tools.url.value')}</th>
            </tr>
          </thead>
          <tbody>
            {params.length ? params.map(([key, value], index) => (
              <tr key={`${key}-${index}`} className="border-t border-[var(--color-border)]">
                <td className="p-3 font-mono">{key}</td>
                <td className="p-3 font-mono">{value}</td>
              </tr>
            )) : (
              <tr>
                <td className="p-3 text-[var(--color-text-muted)]" colSpan={2}>{t('tools.url.noParameters')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ToolLayout>
  );
});

interface PaneProps {
  title: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
}

function Pane({ title, value, onChange, placeholder, error }: PaneProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        <CopyButton value={value} />
      </div>
      <GlassInput multiline aria-label={title} rows={6} className={error ? 'border-red-400/60' : ''} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      {error && <p className="mt-2 text-sm text-red-500 dark:text-red-300">{error}</p>}
    </div>
  );
}

export default UrlTool;
