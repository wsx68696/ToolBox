import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import NumberStepper from '../components/NumberStepper';
import ToolLayout from '../components/ToolLayout';

const bases = [
  { label: 'BIN (2)', radix: 2 },
  { label: 'OCT (8)', radix: 8 },
  { label: 'DEC (10)', radix: 10 },
  { label: 'HEX (16)', radix: 16 },
];

const digitset = '0123456789abcdefghijklmnopqrstuvwxyz';

function parseInBase(raw: string, radix: number): bigint | null {
  const trimmed = raw.trim().toLowerCase().replace(/^0[box]/, '').replace(/[\s_]/g, '');
  if (!trimmed) return null;
  const digits = digitset.slice(0, radix);
  if (![...trimmed].every((ch) => digits.includes(ch))) return null;
  let result = 0n;
  const big = BigInt(radix);
  for (const ch of trimmed) result = result * big + BigInt(digits.indexOf(ch));
  return result;
}

const NumberBaseTool = memo(function NumberBaseTool() {
  const { t } = useTranslation();
  const [value, setValue] = useState<bigint>(42n);
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState('');
  const [custom, setCustom] = useState(36);

  const display = (radix: number) => (editing === radix ? draft : value.toString(radix));
  const invalid = editing !== null && parseInBase(draft, editing) === null && draft.trim() !== '';

  const onEdit = (radix: number, raw: string) => {
    setEditing(radix);
    setDraft(raw);
    const parsed = parseInBase(raw, radix);
    if (parsed !== null) setValue(parsed);
  };

  const customRadix = Math.min(Math.max(custom, 2), 36);

  return (
    <ToolLayout id="number-base" color="#818cf8">
      <div className="grid gap-4">
        {bases.map((base) => (
          <label key={base.radix} className="text-sm text-[var(--color-text-muted)]">
            <span className="mb-2 flex items-center justify-between">
              {base.label}
              <CopyButton value={value.toString(base.radix)} />
            </span>
            <GlassInput
              aria-label={base.label}
              className={editing === base.radix && invalid ? 'border-red-400/60' : ''}
              value={display(base.radix)}
              onChange={(event) => onEdit(base.radix, event.target.value)}
              onBlur={() => setEditing(null)}
              placeholder="0"
            />
          </label>
        ))}
        <div className="mt-2 grid gap-3 sm:grid-cols-[12rem_1fr]">
          <div className="text-sm text-[var(--color-text-muted)]">
            <span className="mb-2 block">{t('tools.number-base.customBase')}</span>
            <NumberStepper aria-label={t('tools.number-base.customBase')} min={2} max={36} value={custom} onChange={setCustom} />
          </div>
          <div className="text-sm text-[var(--color-text-muted)]">
            <span className="mb-2 flex items-center justify-between">
              {t('tools.number-base.result')}
              <CopyButton value={value.toString(customRadix)} />
            </span>
            <div className="glass-input mono-panel min-h-[2.25rem] p-2">{value.toString(customRadix)}</div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
});

export default NumberBaseTool;
