import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassCheckbox from '../components/GlassCheckbox';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

const who = ['owner', 'group', 'others'] as const;
const perms = ['read', 'write', 'execute'] as const;
const bits = [4, 2, 1];

function toSymbolic(mode: number): string {
  return [mode >> 6, (mode >> 3) & 7, mode & 7]
    .map((digit) => `${digit & 4 ? 'r' : '-'}${digit & 2 ? 'w' : '-'}${digit & 1 ? 'x' : '-'}`)
    .join('');
}

const ChmodCalculatorTool = memo(function ChmodCalculatorTool() {
  const { t } = useTranslation();
  const [mode, setMode] = useState(0o755);
  const [draft, setDraft] = useState('755');

  const octal = mode.toString(8).padStart(3, '0');
  const symbolic = toSymbolic(mode);
  const command = `chmod ${octal} path/to/file`;

  const toggle = (whoIndex: number, permIndex: number) => {
    const bit = bits[permIndex] << ((2 - whoIndex) * 3);
    const next = mode ^ bit;
    setMode(next);
    setDraft(next.toString(8).padStart(3, '0'));
  };

  const onOctal = (raw: string) => {
    setDraft(raw);
    if (/^[0-7]{3}$/.test(raw.trim())) setMode(parseInt(raw.trim(), 8));
  };

  const invalid = !/^[0-7]{3}$/.test(draft.trim());

  return (
    <ToolLayout id="chmod-calculator" color="#4ade80">
      <div className="overflow-hidden rounded-2xl border border-[var(--color-border)]">
        <table className="w-full text-center text-sm">
          <thead className="bg-[var(--color-surface)] text-[var(--color-text-muted)]">
            <tr>
              <th className="p-3 text-left" />
              {perms.map((perm) => <th key={perm} className="p-3 font-medium">{t(`tools.chmod-calculator.${perm}`)}</th>)}
            </tr>
          </thead>
          <tbody>
            {who.map((role, whoIndex) => (
              <tr key={role} className="border-t border-[var(--color-border)]">
                <td className="p-3 text-left text-[var(--color-text-muted)]">{t(`tools.chmod-calculator.${role}`)}</td>
                {perms.map((perm, permIndex) => {
                  const bit = bits[permIndex] << ((2 - whoIndex) * 3);
                  return (
                    <td key={perm} className="p-3">
                      <GlassCheckbox
                        aria-label={`${t(`tools.chmod-calculator.${role}`)} ${t(`tools.chmod-calculator.${perm}`)}`}
                        checked={(mode & bit) !== 0}
                        onChange={() => toggle(whoIndex, permIndex)}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-[var(--color-text-muted)]">
          {t('tools.chmod-calculator.octal')}
          <GlassInput aria-label={t('tools.chmod-calculator.octal')} className={`mt-2 ${invalid ? 'border-red-400/60' : ''}`} value={draft} onChange={(event) => onOctal(event.target.value)} placeholder="755" />
        </label>
        <div className="text-sm text-[var(--color-text-muted)]">
          {t('tools.chmod-calculator.symbolic')}
          <div className="glass-input mono-panel mt-2 p-2">{symbolic}</div>
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">{t('tools.chmod-calculator.command')}</h2>
          <CopyButton value={command} />
        </div>
        <div className="glass-input mono-panel p-4">{command}</div>
      </div>
    </ToolLayout>
  );
});

export default ChmodCalculatorTool;
