import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import NumberStepper from '../components/NumberStepper';
import ToolLayout from '../components/ToolLayout';

type Case = 'upper' | 'lower';

function randomByte(): number {
  const [value] = crypto.getRandomValues(new Uint8Array(1));
  return value;
}

function generate(prefix: string, separator: string, casing: Case): string {
  const clean = prefix.replace(/[^0-9a-fA-F]/g, '');
  const prefixBytes: string[] = [];
  for (let i = 0; i + 2 <= clean.length && prefixBytes.length < 6; i += 2) {
    prefixBytes.push(clean.slice(i, i + 2));
  }
  const bytes = [...prefixBytes];
  while (bytes.length < 6) bytes.push(randomByte().toString(16).padStart(2, '0'));
  const mac = bytes.slice(0, 6).join(separator);
  return casing === 'upper' ? mac.toUpperCase() : mac.toLowerCase();
}

const MacAddressTool = memo(function MacAddressTool() {
  const { t } = useTranslation();
  const [count, setCount] = useState(3);
  const [prefix, setPrefix] = useState('');
  const [separator, setSeparator] = useState(':');
  const [casing, setCasing] = useState<Case>('lower');
  const [result, setResult] = useState<string[]>(() => Array.from({ length: 3 }, () => generate('', ':', 'lower')));

  const run = () => setResult(Array.from({ length: Math.max(count, 1) }, () => generate(prefix, separator, casing)));

  const separators = [
    { key: ':', label: 'AA:BB:CC' },
    { key: '-', label: 'AA-BB-CC' },
    { key: '.', label: 'AA.BB.CC' },
    { key: '', label: 'AABBCC' },
  ];

  return (
    <ToolLayout id="mac-address" color="#22d3ee">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="text-sm text-[var(--color-text-muted)]">
          <span className="mb-2 block">{t('tools.mac-address.quantity')}</span>
          <NumberStepper aria-label={t('tools.mac-address.quantity')} min={1} max={50} value={count} onChange={setCount} />
        </div>
        <label className="text-sm text-[var(--color-text-muted)]">
          <span className="mb-2 block">{t('tools.mac-address.prefix')}</span>
          <GlassInput aria-label={t('tools.mac-address.prefix')} value={prefix} onChange={(event) => setPrefix(event.target.value)} placeholder="64:16:7F" />
        </label>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {separators.map((sep) => (
          <GlassButton key={sep.key || 'none'} aria-label={sep.label} onClick={() => setSeparator(sep.key)} className={separator === sep.key ? 'border-cyan-300/40 bg-cyan-300/10' : ''}>{sep.label}</GlassButton>
        ))}
        <span className="mx-1 h-6 w-px bg-[var(--color-border)]" />
        <GlassButton aria-label={t('tools.mac-address.lower')} onClick={() => setCasing('lower')} className={casing === 'lower' ? 'border-cyan-300/40 bg-cyan-300/10' : ''}>{t('tools.mac-address.lower')}</GlassButton>
        <GlassButton aria-label={t('tools.mac-address.upper')} onClick={() => setCasing('upper')} className={casing === 'upper' ? 'border-cyan-300/40 bg-cyan-300/10' : ''}>{t('tools.mac-address.upper')}</GlassButton>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <GlassButton aria-label={t('tools.mac-address.generate')} onClick={run}>{t('tools.mac-address.generate')}</GlassButton>
        <CopyButton value={result.join('\n')} />
      </div>
      <div className="mt-4 glass-input mono-panel min-h-32 p-4 text-lg">{result.join('\n')}</div>
    </ToolLayout>
  );
});

export default MacAddressTool;
