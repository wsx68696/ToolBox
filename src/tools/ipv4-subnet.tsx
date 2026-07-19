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
    result = (result << 8) | n;
  }
  return result >>> 0;
}

function toIp(value: number): string {
  return [24, 16, 8, 0].map((shift) => (value >>> shift) & 255).join('.');
}

interface Result {
  network: string;
  broadcast: string;
  firstHost: string;
  lastHost: string;
  netmask: string;
  wildcard: string;
  hostCount: number;
  cidr: number;
}

function compute(input: string): Result | null {
  const match = input.trim().match(/^(\d{1,3}(?:\.\d{1,3}){3})(?:\/(\d{1,2}))?$/);
  if (!match) return null;
  const ip = parseIp(match[1]);
  if (ip === null) return null;
  const cidr = match[2] !== undefined ? Number(match[2]) : 24;
  if (cidr < 0 || cidr > 32) return null;

  const mask = cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
  const network = (ip & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const usable = cidr >= 31 ? 0 : broadcast - network - 1;
  return {
    network: toIp(network),
    broadcast: toIp(broadcast),
    firstHost: cidr >= 31 ? toIp(network) : toIp(network + 1),
    lastHost: cidr >= 31 ? toIp(broadcast) : toIp(broadcast - 1),
    netmask: toIp(mask),
    wildcard: toIp(~mask >>> 0),
    hostCount: usable,
    cidr,
  };
}

const Ipv4SubnetTool = memo(function Ipv4SubnetTool() {
  const { t } = useTranslation();
  const [input, setInput] = useState('192.168.1.100/24');
  const result = useMemo(() => compute(input), [input]);

  const rows: { label: string; value: string }[] = result ? [
    { label: t('tools.ipv4-subnet.network'), value: `${result.network}/${result.cidr}` },
    { label: t('tools.ipv4-subnet.netmask'), value: result.netmask },
    { label: t('tools.ipv4-subnet.wildcard'), value: result.wildcard },
    { label: t('tools.ipv4-subnet.broadcast'), value: result.broadcast },
    { label: t('tools.ipv4-subnet.firstHost'), value: result.firstHost },
    { label: t('tools.ipv4-subnet.lastHost'), value: result.lastHost },
    { label: t('tools.ipv4-subnet.hostCount'), value: result.hostCount.toLocaleString() },
  ] : [];

  return (
    <ToolLayout id="ipv4-subnet" color="#4ade80">
      <GlassInput aria-label={t('tools.ipv4-subnet.inputPlaceholder')} className={!result && input.trim() ? 'border-red-400/60' : ''} value={input} onChange={(event) => setInput(event.target.value)} placeholder="192.168.1.0/24" />
      {!result && input.trim() && <p className="mt-3 text-sm text-red-500 dark:text-red-300">{t('tools.ipv4-subnet.invalid')}</p>}
      {result && (
        <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--color-border)]">
          <table className="w-full text-left text-sm">
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t border-[var(--color-border)] first:border-t-0">
                  <td className="p-3 text-[var(--color-text-muted)]">{row.label}</td>
                  <td className="p-3 font-mono">{row.value}</td>
                  <td className="w-px p-2"><CopyButton value={row.value} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ToolLayout>
  );
});

export default Ipv4SubnetTool;
