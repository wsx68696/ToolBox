import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import NumberStepper from '../components/NumberStepper';
import ToolLayout from '../components/ToolLayout';

const BROWSERS = ['Mozilla/5.0', 'AppleWebKit/537.36', 'Chrome/90.0.4430.85', 'Safari/537.36'];
const OSES = ['Windows NT 10.0; Win64; x64', 'Macintosh; Intel Mac OS X 10_15_7', 'X11; Linux x86_64'];
const VERSIONS = ['rv:11.0', 'KHTML, like Gecko', 'Edge/17.17134'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomUa(): string {
  return `${pick(BROWSERS)} (compatible; ${pick(OSES)}) ${pick(VERSIONS)}`;
}

const RandomUaTool = memo(function RandomUaTool() {
  const { t } = useTranslation();
  const [count, setCount] = useState(20);
  const [uas, setUas] = useState<string[]>(() => Array.from({ length: 20 }, randomUa));

  const generate = useCallback((n: number) => {
    setUas(Array.from({ length: Math.max(1, n) }, randomUa));
  }, []);

  return (
    <ToolLayout id="random-ua" color="#f87171">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <NumberStepper value={count} min={1} max={500} onChange={(v) => { setCount(v); generate(v); }} />
          <GlassButton onClick={() => generate(count)}>{t('tools.random-ua.regenerate')}</GlassButton>
          <CopyButton value={uas.join('\n')} />
        </div>
        <div className="flex flex-col gap-2 font-mono text-xs">
          {uas.map((ua, i) => <div key={i} className="glass-card px-3 py-1.5">{ua}</div>)}
        </div>
        <p className="text-xs text-[var(--color-text-muted)]">{t('tools.random-ua.hint')}</p>
      </div>
    </ToolLayout>
  );
});

export default RandomUaTool;
