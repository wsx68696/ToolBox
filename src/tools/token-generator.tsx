import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import GlassCheckbox from '../components/GlassCheckbox';
import NumberStepper from '../components/NumberStepper';
import ToolLayout from '../components/ToolLayout';

const sets = { upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', lower: 'abcdefghijklmnopqrstuvwxyz', numbers: '0123456789', symbols: '!@#$%^&*()_+-=[]{};:,.<>?' };

function generateToken(alphabet: string, length: number): string {
  const bytes = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('');
}

const TokenGeneratorTool = memo(function TokenGeneratorTool() {
  const { t } = useTranslation();
  const [length, setLength] = useState(32);
  const [count, setCount] = useState(5);
  const [nonce, setNonce] = useState(0);
  const [enabled, setEnabled] = useState({ upper: true, lower: true, numbers: true, symbols: false });
  const alphabet = Object.entries(enabled).filter(([, value]) => value).map(([key]) => sets[key as keyof typeof sets]).join('');

  const tokens = useMemo(() => {
    void nonce;
    if (!alphabet) return [];
    return Array.from({ length: Math.max(count, 1) }, () => generateToken(alphabet, Math.max(length, 1)));
  }, [alphabet, length, count, nonce]);

  return (
    <ToolLayout id="token-generator" color="#4ade80">
      <div className="grid gap-5 lg:grid-cols-[18rem_1fr]">
        <div className="space-y-4">
          <div className="block text-sm text-[var(--color-text-muted)]">
            {t('tools.token-generator.length')}
            <NumberStepper aria-label={t('tools.token-generator.length')} min={1} max={512} value={length} onChange={setLength} className="mt-2" />
          </div>
          <div className="block text-sm text-[var(--color-text-muted)]">
            {t('tools.token-generator.count')}
            <NumberStepper aria-label={t('tools.token-generator.count')} min={1} max={100} value={count} onChange={setCount} className="mt-2" />
          </div>
          {
            [
              { key: 'upper' as const, label: t('tools.token-generator.uppercase') },
              { key: 'lower' as const, label: t('tools.token-generator.lowercase') },
              { key: 'numbers' as const, label: t('tools.token-generator.numbers') },
              { key: 'symbols' as const, label: t('tools.token-generator.symbols') },
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
          <GlassButton aria-label={t('tools.token-generator.regenerate')} onClick={() => setNonce((n) => n + 1)}>{t('tools.token-generator.regenerate')}</GlassButton>
        </div>
        <div>
          <div className="mb-2 flex justify-end"><CopyButton value={tokens.join('\n')} /></div>
          <div className="mono-panel max-h-96 space-y-1 overflow-auto p-4 text-sm">
            {tokens.length === 0 && <p className="text-[var(--color-text-muted)]">{t('tools.token-generator.empty')}</p>}
            {tokens.map((token, index) => (
              <div key={index} className="flex items-center justify-between gap-3">
                <span className="truncate font-mono">{token}</span>
                <CopyButton value={token} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
});

export default TokenGeneratorTool;
