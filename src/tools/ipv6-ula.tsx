import { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

interface UlaResult {
  globalId: string;
  prefix48: string;
  prefix64: string;
  firstAddress: string;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function generateUla(seed: string): Promise<UlaResult> {
  // RFC 4193: SHA-1 of an EUI-64 seed + time, take the low 40 bits as the Global ID.
  const entropy = seed.trim() || toHex(crypto.getRandomValues(new Uint8Array(16)));
  const data = new TextEncoder().encode(entropy);
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-1', data));
  const globalId = toHex(digest.slice(digest.length - 5)); // 40 bits = 10 hex chars
  const g = globalId;
  const prefix48 = `fd${g.slice(0, 2)}:${g.slice(2, 6)}:${g.slice(6, 10)}`;
  const prefix64 = `${prefix48}:0000`;
  return {
    globalId: g,
    prefix48: `${prefix48}::/48`,
    prefix64: `${prefix64}::/64`,
    firstAddress: `${prefix64}:0000:0000:0000:0001`,
  };
}

const IPv6UlaTool = memo(function IPv6UlaTool() {
  const { t } = useTranslation();
  const [seed, setSeed] = useState('');
  const [result, setResult] = useState<UlaResult | null>(null);

  const generate = useCallback(async (value: string) => {
    setResult(await generateUla(value));
  }, []);

  useEffect(() => {
    void generate('');
  }, [generate]);

  if (!result) return <ToolLayout id="ipv6-ula" color="#4ade80"><div /></ToolLayout>;

  const rows: [string, string][] = [
    [t('tools.ipv6-ula.globalId'), result.globalId],
    [t('tools.ipv6-ula.prefix48'), result.prefix48],
    [t('tools.ipv6-ula.prefix64'), result.prefix64],
    [t('tools.ipv6-ula.firstAddress'), result.firstAddress],
  ];

  return (
    <ToolLayout id="ipv6-ula" color="#4ade80">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-2 block font-semibold" htmlFor="ula-seed">{t('tools.ipv6-ula.seedLabel')}</label>
          <GlassInput
            id="ula-seed"
            value={seed}
            onChange={(event) => setSeed(event.target.value)}
            placeholder={t('tools.ipv6-ula.seedPlaceholder')}
          />
        </div>
        <GlassButton onClick={() => void generate(seed)}>{t('tools.ipv6-ula.generate')}</GlassButton>
      </div>
      <div className="mono-panel divide-y divide-white/5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3 px-4 py-2.5">
            <span className="shrink-0 text-sm text-[var(--color-text-muted)]">{label}</span>
            <span className="flex items-center gap-2 truncate font-mono text-sm">
              <span className="truncate">{value}</span>
              <CopyButton value={value} />
            </span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-[var(--color-text-muted)]">{t('tools.ipv6-ula.hint')}</p>
    </ToolLayout>
  );
});

export default IPv6UlaTool;
