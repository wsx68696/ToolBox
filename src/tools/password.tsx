import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import GlassCheckbox from '../components/GlassCheckbox';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

const sets = { upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', lower: 'abcdefghijklmnopqrstuvwxyz', numbers: '0123456789', symbols: '!@#$%^&*()_+-=[]{};:,.<>?' };

const PasswordTool = memo(function PasswordTool() {
  const { t } = useTranslation();
  const [length, setLength] = useState(20);
  const [enabled, setEnabled] = useState({ upper: true, lower: true, numbers: true, symbols: true });
  const alphabet = Object.entries(enabled).filter(([, value]) => value).map(([key]) => sets[key as keyof typeof sets]).join('');
  const [password, setPassword] = useState('');
  const entropy = useMemo(() => alphabet ? Math.round(length * Math.log2(alphabet.length)) : 0, [alphabet, length]);
  const generate = () => {
    if (!alphabet) return;
    const bytes = crypto.getRandomValues(new Uint32Array(length));
    setPassword(Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join(''));
  };

  const strength = entropy < 40 ? t('tools.password.weak') : entropy < 60 ? t('tools.password.fair') : entropy < 80 ? t('tools.password.good') : t('tools.password.strong');

  return (
    <ToolLayout id="password" color="#f472b6">
      <div className="grid gap-5 lg:grid-cols-[18rem_1fr]">
        <div className="space-y-4">
          <label className="block text-sm text-[var(--color-text-muted)]">
            {t('tools.password.length')}
            <GlassInput aria-label={t('tools.password.length')} type="number" min={6} max={128} value={length} onChange={(event) => setLength(Number(event.target.value))} className="mt-2" />
          </label>
          {
            [
              { key: 'upper' as const, label: t('tools.password.uppercase') },
              { key: 'lower' as const, label: t('tools.password.lowercase') },
              { key: 'numbers' as const, label: t('tools.password.numbers') },
              { key: 'symbols' as const, label: t('tools.password.symbols') },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 text-sm">
                <GlassCheckbox
                  aria-label={label}
                  checked={enabled[key]}
                  onChange={(event) => setEnabled((current) => ({ ...current, [key]: event.target.checked }))}
                />
                {label}
              </label>
            ))
          }
          <GlassButton aria-label={t('tools.password.regenerate')} onClick={generate}>{t('tools.password.regenerate')}</GlassButton>
        </div>
        <div>
          <div className="mb-2 flex justify-end"><CopyButton value={password} /></div>
          <div className="glass-input mono-panel min-h-28 p-4 text-lg">{password || t('tools.password.regenerate')}</div>
          <div className="mt-4">
            <div className="mb-2 flex justify-between text-sm text-[var(--color-text-muted)]">
              <span>{t('tools.password.entropy')}</span>
              <span>{entropy} {t('tools.password.bits')}</span>
            </div>
            <div className="mb-1 flex justify-between text-sm text-[var(--color-text-muted)]">
              <span>{t('tools.password.strength')}</span>
              <span>{strength}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[var(--color-surface-active)]">
              <div className="h-full rounded-full bg-pink-500 transition-all dark:bg-pink-300" style={{ width: `${Math.min(entropy, 128) / 128 * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
});

export default PasswordTool;
