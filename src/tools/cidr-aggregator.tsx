import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

const intToIp = (n: number): string =>
  [Math.floor(n / 16777216) % 256, Math.floor(n / 65536) % 256, Math.floor(n / 256) % 256, n % 256].join('.');

function parseToken(token: string): [number, number] | null {
  const [ipPart, prefixPart] = token.split('/');
  const octets = ipPart.split('.');
  if (octets.length !== 4) return null;
  let ip = 0;
  for (const o of octets) {
    if (!/^\d{1,3}$/.test(o)) return null;
    const v = Number(o);
    if (v > 255) return null;
    ip = ip * 256 + v;
  }
  let prefix = 32;
  if (prefixPart !== undefined) {
    if (!/^\d{1,2}$/.test(prefixPart)) return null;
    prefix = Number(prefixPart);
    if (prefix > 32) return null;
  }
  const size = 2 ** (32 - prefix);
  const network = Math.floor(ip / size) * size;
  return [network, network + size - 1];
}

// Split an inclusive [start, end] range into the minimal set of aligned CIDR blocks.
function rangeToCidrs(start: number, end: number): string[] {
  const out: string[] = [];
  let cur = start;
  while (cur <= end) {
    let step = 1;
    let prefix = 32;
    while (prefix > 0) {
      const size = step * 2;
      if (cur % size !== 0 || cur + size - 1 > end) break;
      step = size;
      prefix -= 1;
    }
    out.push(`${intToIp(cur)}/${prefix}`);
    cur += step;
  }
  return out;
}

function aggregate(input: string): { result: string; count: number; invalid: string[] } {
  const tokens = input.split(/[\s,]+/).filter(Boolean);
  const ranges: [number, number][] = [];
  const invalid: string[] = [];
  for (const token of tokens) {
    const range = parseToken(token);
    if (range) ranges.push(range);
    else invalid.push(token);
  }
  if (ranges.length === 0) return { result: '', count: 0, invalid };
  ranges.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [ranges[0].slice() as [number, number]];
  for (let i = 1; i < ranges.length; i += 1) {
    const last = merged[merged.length - 1];
    if (ranges[i][0] <= last[1] + 1) last[1] = Math.max(last[1], ranges[i][1]);
    else merged.push(ranges[i].slice() as [number, number]);
  }
  const cidrs = merged.flatMap(([s, e]) => rangeToCidrs(s, e));
  return { result: cidrs.join('\n'), count: cidrs.length, invalid };
}

const CidrAggregatorTool = memo(function CidrAggregatorTool() {
  const { t } = useTranslation();
  const [input, setInput] = useState('192.168.0.0/24\n192.168.1.0/24\n10.0.0.1\n10.0.0.2\n10.0.0.3');

  const { result, count, invalid } = useMemo(() => aggregate(input), [input]);

  return (
    <ToolLayout id="cidr-aggregator" color="#4ade80">
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <h2 className="mb-2 font-semibold">{t('tools.cidr-aggregator.input')}</h2>
          <GlassInput multiline aria-label={t('tools.cidr-aggregator.input')} rows={14} className="font-mono" value={input} onChange={(e) => setInput(e.target.value)} placeholder={t('tools.cidr-aggregator.inputPlaceholder')} />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">{t('tools.cidr-aggregator.output', { count })}</h2>
            <CopyButton value={result} />
          </div>
          <GlassInput multiline readOnly aria-label={t('tools.cidr-aggregator.output', { count })} rows={14} className="font-mono" value={result} onChange={() => {}} />
          {invalid.length > 0 && <p className="mt-2 text-sm text-red-500 dark:text-red-300">{t('tools.cidr-aggregator.invalid', { items: invalid.join(', ') })}</p>}
        </div>
      </div>
      <p className="mt-4 text-xs text-[var(--color-text-muted)]">{t('tools.cidr-aggregator.hint')}</p>
    </ToolLayout>
  );
});

export default CidrAggregatorTool;
