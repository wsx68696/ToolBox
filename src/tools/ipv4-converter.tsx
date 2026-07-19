import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

function dottedToLong(ip: string): number | null {
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return null;
  let result = 0;
  for (const part of parts) {
    if (!/^\d+$/.test(part)) return null;
    const n = Number(part);
    if (n < 0 || n > 255) return null;
    result = result * 256 + n;
  }
  return result >>> 0;
}

function longToDotted(value: number): string {
  return [24, 16, 8, 0].map((shift) => (value >>> shift) & 255).join('.');
}

interface Formats {
  dotted: string;
  decimal: string;
  hex: string;
  binary: string;
  ipv6: string;
}

function computeFrom(long: number): Formats {
  const dotted = longToDotted(long);
  return {
    dotted,
    decimal: String(long),
    hex: '0x' + long.toString(16).padStart(8, '0').toUpperCase(),
    binary: dotted.split('.').map((part) => Number(part).toString(2).padStart(8, '0')).join('.'),
    ipv6: '::ffff:' + dotted.split('.').map((part) => Number(part).toString(16).padStart(2, '0')).join('').replace(/(.{4})/, '$1:'),
  };
}

function parseAny(raw: string): number | null {
  const value = raw.trim();
  if (value === '') return null;
  if (value.includes('.')) return dottedToLong(value);
  if (/^0x[0-9a-fA-F]+$/.test(value)) { const n = parseInt(value, 16); return n >= 0 && n <= 0xffffffff ? n >>> 0 : null; }
  if (/^\d+$/.test(value)) { const n = Number(value); return n >= 0 && n <= 0xffffffff ? n >>> 0 : null; }
  return null;
}

const initial = computeFrom(dottedToLong('192.168.1.1') as number);

const Ipv4ConverterTool = memo(function Ipv4ConverterTool() {
  const { t } = useTranslation();
  const [input, setInput] = useState('192.168.1.1');
  const [formats, setFormats] = useState<Formats | null>(initial);

  const onChange = (raw: string) => {
    setInput(raw);
    const long = parseAny(raw);
    setFormats(long === null ? null : computeFrom(long));
  };

  const rows: { key: keyof Formats; label: string }[] = [
    { key: 'dotted', label: t('tools.ipv4-converter.dotted') },
    { key: 'decimal', label: t('tools.ipv4-converter.decimal') },
    { key: 'hex', label: t('tools.ipv4-converter.hex') },
    { key: 'binary', label: t('tools.ipv4-converter.binary') },
    { key: 'ipv6', label: t('tools.ipv4-converter.ipv6') },
  ];

  return (
    <ToolLayout id="ipv4-converter" color="#22d3ee">
      <GlassInput aria-label={t('tools.ipv4-converter.inputPlaceholder')} className={!formats && input.trim() ? 'border-red-400/60' : ''} value={input} onChange={(event) => onChange(event.target.value)} placeholder={t('tools.ipv4-converter.inputPlaceholder')} />
      {!formats && input.trim() && <p className="mt-3 text-sm text-red-500 dark:text-red-300">{t('tools.ipv4-converter.invalid')}</p>}
      {formats && (
        <div className="mt-5 grid gap-3">
          {rows.map((row) => (
            <div key={row.key} className="glass-input flex items-center justify-between gap-3 p-3">
              <span className="w-32 shrink-0 text-sm text-[var(--color-text-muted)]">{row.label}</span>
              <code className="flex-1 truncate font-mono text-sm">{formats[row.key]}</code>
              <CopyButton value={formats[row.key]} />
            </div>
          ))}
        </div>
      )}
    </ToolLayout>
  );
});

export default Ipv4ConverterTool;
