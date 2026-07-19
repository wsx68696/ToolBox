import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

function decodePart(part: string) {
  const normalized = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=');
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(normalized), (char) => char.charCodeAt(0)))) as Record<string, unknown>;
}

const JwtTool = memo(function JwtTool() {
  const { t } = useTranslation();
  const [token, setToken] = useState('');
  const decoded = useMemo(() => {
    const parts = token.split('.');
    if (parts.length !== 3) return { error: token ? t('tools.jwt.invalidFormat') : '', header: '', payload: '', signature: '' };
    try {
      const header = decodePart(parts[0]);
      const payload = decodePart(parts[1]);
      return { error: '', header: JSON.stringify(header, null, 2), payload: JSON.stringify(payload, null, 2), signature: parts[2], exp: typeof payload.exp === 'number' ? new Date(payload.exp * 1000) : null };
    } catch {
      return { error: t('tools.jwt.unable'), header: '', payload: '', signature: '' };
    }
  }, [token, t]);

  return (
    <ToolLayout id="jwt" color="#f472b6">
      <GlassInput multiline aria-label={t('tools.jwt.inputPlaceholder')} rows={5} value={token} onChange={(event) => setToken(event.target.value)} placeholder={t('tools.jwt.inputPlaceholder')} />
      {decoded.error && <p className="mt-3 text-sm text-red-500 dark:text-red-300">{decoded.error}</p>}
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Panel title={t('tools.jwt.header')} value={decoded.header} />
        <Panel
          title={t('tools.jwt.payload')}
          value={decoded.payload}
          footer={decoded.exp ? `${t('tools.jwt.expires')}: ${decoded.exp.toLocaleString()} (${decoded.exp.getTime() < Date.now() ? t('tools.jwt.expired') : t('tools.jwt.valid')})` : undefined}
        />
        <Panel title={t('tools.jwt.signature')} value={decoded.signature} />
      </div>
    </ToolLayout>
  );
});

function Panel({ title, value, footer }: { title: string; value: string; footer?: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        <CopyButton value={value} />
      </div>
      <div className="glass-input mono-panel min-h-48 p-4 text-sm">{value}</div>
      {footer && <p className="mt-2 text-xs text-[var(--color-text-muted)]">{footer}</p>}
    </div>
  );
}

export default JwtTool;
