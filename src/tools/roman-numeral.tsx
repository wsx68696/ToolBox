import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

const numerals: [number, string][] = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
  [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
];

function toRoman(n: number): string {
  let result = '';
  for (const [value, symbol] of numerals) {
    while (n >= value) { result += symbol; n -= value; }
  }
  return result;
}

function fromRoman(input: string): number | null {
  const roman = input.trim().toUpperCase();
  if (!/^[MDCLXVI]+$/.test(roman)) return null;
  let result = 0;
  let index = 0;
  for (const [value, symbol] of numerals) {
    while (roman.startsWith(symbol, index)) { result += value; index += symbol.length; }
  }
  if (index !== roman.length) return null;
  return toRoman(result) === roman ? result : null;
}

const RomanNumeralTool = memo(function RomanNumeralTool() {
  const { t } = useTranslation();
  const [arabic, setArabic] = useState('2024');
  const [roman, setRoman] = useState('MMXXIV');
  const [arabicError, setArabicError] = useState(false);
  const [romanError, setRomanError] = useState(false);

  const onArabic = (raw: string) => {
    setArabic(raw);
    const n = Number(raw);
    if (raw.trim() === '' ) { setRoman(''); setArabicError(false); return; }
    if (!Number.isInteger(n) || n < 1 || n > 3999) { setArabicError(true); return; }
    setArabicError(false); setRomanError(false);
    setRoman(toRoman(n));
  };

  const onRoman = (raw: string) => {
    setRoman(raw);
    if (raw.trim() === '') { setArabic(''); setRomanError(false); return; }
    const n = fromRoman(raw);
    if (n === null) { setRomanError(true); return; }
    setRomanError(false); setArabicError(false);
    setArabic(String(n));
  };

  return (
    <ToolLayout id="roman-numeral" color="#fbbf24">
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">{t('tools.roman-numeral.arabic')}</h2>
            <CopyButton value={arabic} />
          </div>
          <GlassInput aria-label={t('tools.roman-numeral.arabic')} className={arabicError ? 'border-red-400/60' : ''} inputMode="numeric" value={arabic} onChange={(event) => onArabic(event.target.value)} placeholder="1 – 3999" />
          {arabicError && <p className="mt-2 text-sm text-red-500 dark:text-red-300">{t('tools.roman-numeral.rangeError')}</p>}
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">{t('tools.roman-numeral.roman')}</h2>
            <CopyButton value={roman} />
          </div>
          <GlassInput aria-label={t('tools.roman-numeral.roman')} className={romanError ? 'border-red-400/60' : ''} value={roman} onChange={(event) => onRoman(event.target.value)} placeholder="MMXXIV" />
          {romanError && <p className="mt-2 text-sm text-red-500 dark:text-red-300">{t('tools.roman-numeral.invalid')}</p>}
        </div>
      </div>
    </ToolLayout>
  );
});

export default RomanNumeralTool;
