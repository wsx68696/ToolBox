import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

const ibanLengths: Record<string, number> = {
  AD: 24, AE: 23, AL: 28, AT: 20, AZ: 28, BA: 20, BE: 16, BG: 22, BH: 22, BR: 29,
  BY: 28, CH: 21, CR: 22, CY: 28, CZ: 24, DE: 22, DK: 18, DO: 28, EE: 20, EG: 29,
  ES: 24, FI: 18, FO: 18, FR: 27, GB: 22, GE: 22, GI: 23, GL: 18, GR: 27, GT: 28,
  HR: 21, HU: 28, IE: 22, IL: 23, IS: 26, IT: 27, JO: 30, KW: 30, KZ: 20, LB: 28,
  LC: 32, LI: 21, LT: 20, LU: 20, LV: 21, MC: 27, MD: 24, ME: 22, MK: 19, MR: 27,
  MT: 31, MU: 30, NL: 18, NO: 15, PK: 24, PL: 28, PS: 29, PT: 25, QA: 29, RO: 24,
  RS: 22, SA: 24, SC: 31, SE: 24, SI: 19, SK: 24, SM: 27, TN: 24, TR: 26, UA: 29,
  VA: 22, VG: 24, XK: 20,
};

function mod97(input: string): number {
  let remainder = 0;
  for (const ch of input) {
    remainder = (remainder * 10 + Number(ch)) % 97;
  }
  return remainder;
}

interface Result {
  valid: boolean;
  country: string;
  checkDigits: string;
  bban: string;
  lengthOk: boolean;
  knownCountry: boolean;
}

function validate(raw: string): Result | null {
  const iban = raw.replace(/[\s-]/g, '').toUpperCase();
  if (!/^[A-Z0-9]+$/.test(iban) || iban.length < 4) return null;
  const country = iban.slice(0, 2);
  const checkDigits = iban.slice(2, 4);
  const bban = iban.slice(4);
  if (!/^[A-Z]{2}$/.test(country) || !/^\d{2}$/.test(checkDigits)) return null;
  const knownCountry = country in ibanLengths;
  const lengthOk = knownCountry ? iban.length === ibanLengths[country] : true;
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, (ch) => String(ch.charCodeAt(0) - 55));
  const valid = lengthOk && mod97(numeric) === 1;
  return { valid, country, checkDigits, bban, lengthOk, knownCountry };
}

function formatIban(raw: string): string {
  return raw.replace(/[\s-]/g, '').toUpperCase().replace(/(.{4})/g, '$1 ').trim();
}

const IbanValidatorTool = memo(function IbanValidatorTool() {
  const { t } = useTranslation();
  const [input, setInput] = useState('DE89 3704 0044 0532 0130 00');
  const result = useMemo(() => validate(input), [input]);

  return (
    <ToolLayout id="iban-validator" color="#fbbf24">
      <GlassInput aria-label={t('tools.iban-validator.inputPlaceholder')} className="font-mono" value={input} onChange={(event) => setInput(event.target.value)} placeholder="DE89 3704 0044 0532 0130 00" />
      {input.trim() && !result && <p className="mt-3 text-sm text-red-500 dark:text-red-300">{t('tools.iban-validator.malformed')}</p>}
      {result && (
        <>
          <div className={`mt-5 flex items-center gap-3 rounded-2xl border p-4 ${result.valid ? 'border-green-500/40 bg-green-500/10' : 'border-red-500/40 bg-red-500/10'}`}>
            <span className={`text-lg font-semibold ${result.valid ? 'text-green-600 dark:text-green-300' : 'text-red-600 dark:text-red-300'}`}>
              {result.valid ? t('tools.iban-validator.valid') : t('tools.iban-validator.invalid')}
            </span>
          </div>
          <div className="mt-5 grid gap-3">
            <Row label={t('tools.iban-validator.country')} value={result.country + (result.knownCountry ? '' : ` (${t('tools.iban-validator.unknownCountry')})`)} />
            <Row label={t('tools.iban-validator.checkDigits')} value={result.checkDigits} />
            <Row label={t('tools.iban-validator.bban')} value={result.bban} />
            <Row label={t('tools.iban-validator.formatted')} value={formatIban(input)} copyable />
          </div>
        </>
      )}
    </ToolLayout>
  );
});

function Row({ label, value, copyable }: { label: string; value: string; copyable?: boolean }) {
  return (
    <div className="glass-input flex items-center justify-between gap-3 p-3">
      <span className="w-32 shrink-0 text-sm text-[var(--color-text-muted)]">{label}</span>
      <code className="flex-1 truncate font-mono text-sm">{value}</code>
      {copyable && <CopyButton value={value} />}
    </div>
  );
}

export default IbanValidatorTool;
