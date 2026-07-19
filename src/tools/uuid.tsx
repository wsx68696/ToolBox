import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import NumberStepper from '../components/NumberStepper';
import ToolLayout from '../components/ToolLayout';

const UuidTool = memo(function UuidTool() {
  const { t } = useTranslation();
  const [count, setCount] = useState(10);
  const [uuids, setUuids] = useState<string[]>(() => Array.from({ length: 10 }, () => crypto.randomUUID()));
  const generate = () => setUuids(Array.from({ length: Math.min(Math.max(count, 1), 100) }, () => crypto.randomUUID()));
  const output = uuids.join('\n');

  return (
    <ToolLayout id="uuid" color="#fbbf24">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
          {t('tools.uuid.count')}
          <NumberStepper aria-label={t('tools.uuid.count')} min={1} max={100} value={count} onChange={setCount} />
        </div>
        <GlassButton aria-label={t('tools.uuid.generate')} onClick={generate}>{t('tools.uuid.generate')}</GlassButton>
        <CopyButton value={output} />
      </div>
      <div className="glass-input mono-panel min-h-96 p-4">{output}</div>
    </ToolLayout>
  );
});

export default UuidTool;
