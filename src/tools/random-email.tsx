import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import NumberStepper from '../components/NumberStepper';
import ToolLayout from '../components/ToolLayout';

const CHARSETS = [
  { name: 'number', value: '0123456789' },
  { name: 'lower', value: 'abcdefghijklmnopqrstuvwxyz' },
  { name: 'upper', value: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' },
] as const;

function generateLocal(charset: string, lenFrom: number, lenTo: number): string {
  let result = '';
  if (lenFrom <= lenTo && charset.length > 0 && lenFrom >= 0) {
    const len = Math.round(Math.random() * (lenTo - lenFrom) + lenFrom);
    while (result.length < len) result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

const RandomEmailTool = memo(function RandomEmailTool() {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useState<Record<string, boolean>>({ number: true, lower: true, upper: false });
  const [minLen, setMinLen] = useState(8);
  const [maxLen, setMaxLen] = useState(16);
  const [suffix, setSuffix] = useState('gmail.com');
  const [count, setCount] = useState(10);
  const [emails, setEmails] = useState<string[]>([]);

  const charset = useMemo(() => CHARSETS.filter((c) => enabled[c.name]).map((c) => c.value).join(''), [enabled]);

  const generate = useCallback(() => {
    if (!charset) { setEmails([]); return; }
    const lo = Math.min(minLen, maxLen);
    const hi = Math.max(minLen, maxLen);
    setEmails(Array.from({ length: Math.max(1, count) }, () => `${generateLocal(charset, lo, hi)}@${suffix}`));
  }, [charset, minLen, maxLen, suffix, count]);

  return (
    <ToolLayout id="random-email" color="#f472b6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {CHARSETS.map((c) => (
            <label key={c.name} className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="glass-checkbox" checked={enabled[c.name]} onChange={(e) => setEnabled((prev) => ({ ...prev, [c.name]: e.target.checked }))} />
              {t(`tools.random-email.${c.name}`)}
            </label>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <label className="text-sm text-[var(--color-text-muted)]">{t('tools.random-email.minLen')}<div className="mt-1"><NumberStepper value={minLen} min={1} max={64} onChange={setMinLen} /></div></label>
          <label className="text-sm text-[var(--color-text-muted)]">{t('tools.random-email.maxLen')}<div className="mt-1"><NumberStepper value={maxLen} min={1} max={64} onChange={setMaxLen} /></div></label>
          <label className="text-sm text-[var(--color-text-muted)]">{t('tools.random-email.count')}<div className="mt-1"><NumberStepper value={count} min={1} max={500} onChange={setCount} /></div></label>
          <label className="text-sm text-[var(--color-text-muted)]">{t('tools.random-email.suffix')}<GlassInput aria-label={t('tools.random-email.suffix')} value={suffix} onChange={(e) => setSuffix(e.target.value)} className="mt-1 w-40" /></label>
        </div>
        <div className="flex items-center gap-3">
          <GlassButton onClick={generate}>{t('tools.random-email.generate')}</GlassButton>
          {emails.length > 0 && <CopyButton value={emails.join('\n')} />}
        </div>
        {emails.length > 0 && (
          <div className="grid grid-cols-1 gap-2 font-mono text-sm sm:grid-cols-2 md:grid-cols-3">
            {emails.map((e, i) => <div key={i} className="glass-card truncate px-3 py-1.5">{e}</div>)}
          </div>
        )}
      </div>
    </ToolLayout>
  );
});

export default RandomEmailTool;
