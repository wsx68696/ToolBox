import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import NumberStepper from '../components/NumberStepper';
import ToolLayout from '../components/ToolLayout';

const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

function encodeTime(now: number): string {
  let time = now;
  let output = '';
  for (let i = 0; i < 10; i += 1) {
    const mod = time % 32;
    output = ENCODING[mod] + output;
    time = Math.floor(time / 32);
  }
  return output;
}

function encodeRandom(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let output = '';
  for (let i = 0; i < 16; i += 1) output += ENCODING[bytes[i] % 32];
  return output;
}

function generateUlid(now: number): string {
  return encodeTime(now) + encodeRandom();
}

const UlidTool = memo(function UlidTool() {
  const { t } = useTranslation();
  const [count, setCount] = useState(5);
  const [ulids, setUlids] = useState<string[]>(() => Array.from({ length: 5 }, () => generateUlid(Date.now())));

  const generate = () => {
    const now = Date.now();
    setUlids(Array.from({ length: Math.max(count, 1) }, () => generateUlid(now)));
  };

  return (
    <ToolLayout id="ulid" color="#fbbf24">
      <div className="mb-4 flex flex-wrap items-end gap-4">
        <div className="text-sm text-[var(--color-text-muted)]">
          <span className="mb-2 block">{t('tools.ulid.quantity')}</span>
          <NumberStepper aria-label={t('tools.ulid.quantity')} min={1} max={100} value={count} onChange={setCount} />
        </div>
        <GlassButton aria-label={t('tools.ulid.generate')} onClick={generate}>{t('tools.ulid.generate')}</GlassButton>
        <CopyButton value={ulids.join('\n')} />
      </div>
      <div className="glass-input mono-panel min-h-48 p-4">{ulids.join('\n')}</div>
      <p className="mt-3 text-xs text-[var(--color-text-muted)]">{t('tools.ulid.hint')}</p>
    </ToolLayout>
  );
});

export default UlidTool;
