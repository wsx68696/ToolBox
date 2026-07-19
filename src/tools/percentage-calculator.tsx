import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

function fmt(value: number): string {
  return Number.isFinite(value) ? Number(value.toPrecision(10)).toString() : '—';
}

function NumField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <GlassInput aria-label={label} inputMode="decimal" className="w-28 text-center" value={value} onChange={(event) => onChange(event.target.value)} placeholder="0" />
  );
}

const PercentageCalculatorTool = memo(function PercentageCalculatorTool() {
  const { t } = useTranslation();
  const [a1, setA1] = useState('20');
  const [b1, setB1] = useState('150');
  const [a2, setA2] = useState('30');
  const [b2, setB2] = useState('150');
  const [a3, setA3] = useState('100');
  const [b3, setB3] = useState('125');

  const r1 = fmt((Number(a1) / 100) * Number(b1));
  const r2 = fmt((Number(a2) / Number(b2)) * 100);
  const r3 = fmt(((Number(b3) - Number(a3)) / Math.abs(Number(a3))) * 100);

  return (
    <ToolLayout id="percentage-calculator" color="#f472b6">
      <div className="grid gap-4">
        <div className="glass-input p-4">
          <div className="mb-3 text-sm text-[var(--color-text-muted)]">{t('tools.percentage-calculator.percentOf')}</div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <NumField label="X" value={a1} onChange={setA1} />
            <span>% ×</span>
            <NumField label="Y" value={b1} onChange={setB1} />
            <span>=</span>
            <code className="font-mono text-lg font-semibold">{r1}</code>
            <CopyButton value={r1} />
          </div>
        </div>
        <div className="glass-input p-4">
          <div className="mb-3 text-sm text-[var(--color-text-muted)]">{t('tools.percentage-calculator.whatPercent')}</div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <NumField label="X" value={a2} onChange={setA2} />
            <span>÷</span>
            <NumField label="Y" value={b2} onChange={setB2} />
            <span>=</span>
            <code className="font-mono text-lg font-semibold">{r2} %</code>
            <CopyButton value={r2} />
          </div>
        </div>
        <div className="glass-input p-4">
          <div className="mb-3 text-sm text-[var(--color-text-muted)]">{t('tools.percentage-calculator.change')}</div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <NumField label={t('tools.percentage-calculator.from')} value={a3} onChange={setA3} />
            <span>→</span>
            <NumField label={t('tools.percentage-calculator.to')} value={b3} onChange={setB3} />
            <span>=</span>
            <code className="font-mono text-lg font-semibold">{Number(r3) > 0 ? '+' : ''}{r3} %</code>
            <CopyButton value={r3} />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
});

export default PercentageCalculatorTool;
