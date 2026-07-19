import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

function parseIp(ip: string): number | null {
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

function toIp(value: number): string {
  return [24, 16, 8, 0].map((shift) => (value >>> shift) & 255).join('.');
}

interface RangeResult {
  start: string;
  end: string;
  count: number;
  cidrs: string[];
}

function rangeToCidrs(start: number, end: number): string[] {
  const cidrs: string[] = [];
  let current = start;
  while (current <= end) {
    // 起始地址的低位 0 决定它能作为多大对齐块的基址（最大 host 位数）
    const alignBits = current === 0 ? 32 : Math.min(31 - Math.clz32(current & -current), 32);
    // 剩余地址数量能容纳的最大块（host 位数）
    const remainingBits = Math.floor(Math.log2(end - current + 1));
    const hostBits = Math.min(alignBits, remainingBits);
    cidrs.push(`${toIp(current)}/${32 - hostBits}`);
    const next = current + 2 ** hostBits;
    if (next > 0xffffffff) break;
    current = next;
  }
  return cidrs;
}

function compute(input: string): RangeResult | null {
  const parts = input.split('-').map((p) => p.trim());
  if (parts.length !== 2) return null;
  const start = parseIp(parts[0]);
  const end = parseIp(parts[1]);
  if (start === null || end === null || start > end) return null;
  return { start: toIp(start), end: toIp(end), count: end - start + 1, cidrs: rangeToCidrs(start, end) };
}

const Ipv4RangeTool = memo(function Ipv4RangeTool() {
  const { t } = useTranslation();
  const [input, setInput] = useState('192.168.1.10 - 192.168.1.200');
  const result = useMemo(() => compute(input), [input]);

  return (
    <ToolLayout id="ipv4-range" color="#4ade80">
      <GlassInput aria-label={t('tools.ipv4-range.inputPlaceholder')} className={!result && input.trim() ? 'border-red-400/60' : ''} value={input} onChange={(event) => setInput(event.target.value)} placeholder="192.168.1.10 - 192.168.1.200" />
      {!result && input.trim() && <p className="mt-3 text-sm text-red-500 dark:text-red-300">{t('tools.ipv4-range.invalid')}</p>}
      {result && (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Info label={t('tools.ipv4-range.start')} value={result.start} />
            <Info label={t('tools.ipv4-range.end')} value={result.end} />
            <Info label={t('tools.ipv4-range.count')} value={result.count.toLocaleString()} />
          </div>
          <div className="mt-5 flex items-center justify-between">
            <h2 className="font-semibold">{t('tools.ipv4-range.cidrBlocks')} ({result.cidrs.length})</h2>
            <CopyButton value={result.cidrs.join('\n')} />
          </div>
          <div className="mt-3 glass-input mono-panel max-h-72 overflow-auto p-4 text-sm">{result.cidrs.join('\n')}</div>
        </>
      )}
    </ToolLayout>
  );
});

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-input p-3">
      <div className="mb-1 text-xs uppercase tracking-wider text-[var(--color-text-muted)]">{label}</div>
      <div className="font-mono text-sm">{value}</div>
    </div>
  );
}

export default Ipv4RangeTool;
