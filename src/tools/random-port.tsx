import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import NumberStepper from '../components/NumberStepper';
import ToolLayout from '../components/ToolLayout';

function randomPorts(count: number): number[] {
  const min = 1024;
  const max = 65535;
  const ports = new Set<number>();
  while (ports.size < count) {
    const [value] = crypto.getRandomValues(new Uint32Array(1));
    ports.add(min + (value % (max - min + 1)));
  }
  return Array.from(ports);
}

const RandomPortTool = memo(function RandomPortTool() {
  const { t } = useTranslation();
  const [count, setCount] = useState(3);
  const [ports, setPorts] = useState<number[]>(() => randomPorts(3));

  return (
    <ToolLayout id="random-port" color="#fbbf24">
      <div className="mb-4 flex flex-wrap items-end gap-4">
        <div className="text-sm text-[var(--color-text-muted)]">
          <span className="mb-2 block">{t('tools.random-port.quantity')}</span>
          <NumberStepper aria-label={t('tools.random-port.quantity')} min={1} max={50} value={count} onChange={setCount} />
        </div>
        <GlassButton aria-label={t('tools.random-port.generate')} onClick={() => setPorts(randomPorts(count))}>{t('tools.random-port.generate')}</GlassButton>
        <CopyButton value={ports.join('\n')} />
      </div>
      <div className="glass-input mono-panel min-h-32 p-4 text-lg">{ports.join('\n')}</div>
      <p className="mt-3 text-sm text-[var(--color-text-muted)]">{t('tools.random-port.hint')}</p>
    </ToolLayout>
  );
});

export default RandomPortTool;
