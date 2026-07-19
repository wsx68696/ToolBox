import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

interface Analysis {
  length: number;
  poolSize: number;
  entropy: number;
  onlineSeconds: number;
  offlineSeconds: number;
}

const ONLINE_GUESSES = 1e4;
const OFFLINE_GUESSES = 1e10;

function analyze(password: string): Analysis {
  let pool = 0;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/[0-9]/.test(password)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(password)) pool += 33;
  const length = [...password].length;
  const entropy = pool > 0 ? length * Math.log2(pool) : 0;
  const combinations = 2 ** entropy;
  return {
    length,
    poolSize: pool,
    entropy: Math.round(entropy),
    onlineSeconds: combinations / 2 / ONLINE_GUESSES,
    offlineSeconds: combinations / 2 / OFFLINE_GUESSES,
  };
}

const SECOND = 1;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const YEAR = 365 * DAY;
const CENTURY = 100 * YEAR;

function useCrackTimeFormatter() {
  const { t } = useTranslation();
  return (seconds: number): string => {
    if (seconds < 1) return t('tools.password-strength.instant');
    if (seconds < MINUTE) return t('tools.password-strength.seconds', { count: Math.round(seconds) });
    if (seconds < HOUR) return t('tools.password-strength.minutes', { count: Math.round(seconds / MINUTE) });
    if (seconds < DAY) return t('tools.password-strength.hours', { count: Math.round(seconds / HOUR) });
    if (seconds < YEAR) return t('tools.password-strength.days', { count: Math.round(seconds / DAY) });
    if (seconds < CENTURY) return t('tools.password-strength.years', { count: Math.round(seconds / YEAR) });
    if (seconds < CENTURY * 1e6) return t('tools.password-strength.centuries', { count: Math.round(seconds / CENTURY) });
    return t('tools.password-strength.forever');
  };
}

const PasswordStrengthTool = memo(function PasswordStrengthTool() {
  const { t } = useTranslation();
  const formatCrackTime = useCrackTimeFormatter();
  const [password, setPassword] = useState('');
  const analysis = useMemo(() => analyze(password), [password]);

  const level = analysis.entropy < 40 ? 0 : analysis.entropy < 60 ? 1 : analysis.entropy < 80 ? 2 : 3;
  const levelLabel = [
    t('tools.password-strength.weak'),
    t('tools.password-strength.fair'),
    t('tools.password-strength.good'),
    t('tools.password-strength.strong'),
  ][level];
  const levelColor = ['#f87171', '#fbbf24', '#4ade80', '#22d3ee'][level];

  const rows: [string, string][] = [
    [t('tools.password-strength.length'), String(analysis.length)],
    [t('tools.password-strength.poolSize'), String(analysis.poolSize)],
    [t('tools.password-strength.entropy'), `${analysis.entropy} ${t('tools.password-strength.bits')}`],
    [t('tools.password-strength.online'), formatCrackTime(analysis.onlineSeconds)],
    [t('tools.password-strength.offline'), formatCrackTime(analysis.offlineSeconds)],
  ];

  return (
    <ToolLayout id="password-strength" color="#4ade80">
      <div className="mb-5">
        <label className="mb-2 block font-semibold" htmlFor="password-strength-input">{t('tools.password-strength.inputLabel')}</label>
        <GlassInput
          id="password-strength-input"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={t('tools.password-strength.placeholder')}
          autoComplete="off"
        />
      </div>
      {password && (
        <>
          <div className="mb-5">
            <div className="mb-2 flex justify-between text-sm text-[var(--color-text-muted)]">
              <span>{t('tools.password-strength.strength')}</span>
              <span style={{ color: levelColor }}>{levelLabel}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[var(--color-surface-active)]">
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(analysis.entropy, 128) / 128 * 100}%`, background: levelColor }} />
            </div>
          </div>
          <div className="mono-panel divide-y divide-white/5">
            {rows.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <span className="shrink-0 text-sm text-[var(--color-text-muted)]">{label}</span>
                <span className="truncate font-mono text-sm">{value}</span>
              </div>
            ))}
          </div>
        </>
      )}
      <p className="mt-4 text-xs text-[var(--color-text-muted)]">{t('tools.password-strength.hint')}</p>
    </ToolLayout>
  );
});

export default PasswordStrengthTool;
