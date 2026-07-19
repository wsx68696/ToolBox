import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

const gmailDomains = new Set(['gmail.com', 'googlemail.com']);

interface Normalized {
  email: string;
  normalized: string;
  local: string;
  domain: string;
  hasPlusTag: boolean;
  tag: string;
}

function normalizeEmail(raw: string): Normalized | null {
  const email = raw.trim().toLowerCase();
  const at = email.lastIndexOf('@');
  if (at <= 0 || at === email.length - 1) return null;
  let local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (!/^[^\s@]+$/.test(local) || !/^[^\s@]+\.[^\s@]+$/.test(domain)) return null;

  const plusIndex = local.indexOf('+');
  const tag = plusIndex >= 0 ? local.slice(plusIndex + 1) : '';
  let base = plusIndex >= 0 ? local.slice(0, plusIndex) : local;

  if (gmailDomains.has(domain)) base = base.replace(/\./g, '');
  const normalizedDomain = domain === 'googlemail.com' ? 'gmail.com' : domain;
  local = base;

  return {
    email,
    normalized: `${base}@${normalizedDomain}`,
    local,
    domain: normalizedDomain,
    hasPlusTag: plusIndex >= 0,
    tag,
  };
}

const EmailNormalizerTool = memo(function EmailNormalizerTool() {
  const { t } = useTranslation();
  const [input, setInput] = useState('John.Doe+newsletter@Googlemail.com');
  const result = useMemo(() => normalizeEmail(input), [input]);

  return (
    <ToolLayout id="email-normalizer" color="#f472b6">
      <GlassInput aria-label={t('tools.email-normalizer.inputPlaceholder')} className={!result && input.trim() ? 'border-red-400/60' : ''} value={input} onChange={(event) => setInput(event.target.value)} placeholder="John.Doe+tag@gmail.com" autoComplete="off" />
      {!result && input.trim() && <p className="mt-3 text-sm text-red-500 dark:text-red-300">{t('tools.email-normalizer.invalid')}</p>}
      {result && (
        <>
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold">{t('tools.email-normalizer.normalized')}</h2>
              <CopyButton value={result.normalized} />
            </div>
            <div className="glass-input mono-panel p-4 text-lg">{result.normalized}</div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Row label={t('tools.email-normalizer.local')} value={result.local} />
            <Row label={t('tools.email-normalizer.domain')} value={result.domain} />
            <Row label={t('tools.email-normalizer.tag')} value={result.hasPlusTag ? result.tag : '—'} />
          </div>
          <p className="mt-4 text-xs text-[var(--color-text-muted)]">{t('tools.email-normalizer.hint')}</p>
        </>
      )}
    </ToolLayout>
  );
});

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-input flex items-center justify-between gap-3 p-3">
      <span className="text-sm text-[var(--color-text-muted)]">{label}</span>
      <code className="truncate font-mono text-sm">{value}</code>
    </div>
  );
}

export default EmailNormalizerTool;
