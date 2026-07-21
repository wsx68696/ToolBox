import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import NumberStepper from '../components/NumberStepper';
import ToolLayout from '../components/ToolLayout';

function randomIp(): string {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');
}

const RandomIpTool = memo(function RandomIpTool() {
  const { t } = useTranslation();
  const [count, setCount] = useState(20);
  const [ips, setIps] = useState<string[]>(() => Array.from({ length: 20 }, randomIp));

  const generate = useCallback((n: number) => {
    setIps(Array.from({ length: Math.max(1, n) }, randomIp));
  }, []);

  return (
    <ToolLayout id="random-ip" color="#fbbf24">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <NumberStepper value={count} min={1} max={1000} onChange={(v) => { setCount(v); generate(v); }} />
          <GlassButton onClick={() => generate(count)}>{t('tools.random-ip.regenerate')}</GlassButton>
          <CopyButton value={ips.join('\n')} />
        </div>
        <div className="grid grid-cols-2 gap-2 font-mono text-sm sm:grid-cols-3 md:grid-cols-4">
          {ips.map((ip, i) => (
            <div key={i} className="glass-card px-3 py-1.5 text-center">{ip}</div>
          ))}
        </div>
        <p className="text-xs text-[var(--color-text-muted)]">{t('tools.random-ip.hint')}</p>
      </div>
    </ToolLayout>
  );
});

export default RandomIpTool;
