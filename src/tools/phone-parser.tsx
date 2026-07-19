import { parsePhoneNumberFromString, getCountries, type CountryCode } from 'libphonenumber-js';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

const COUNTRIES = getCountries();

const PhoneParserTool = memo(function PhoneParserTool() {
  const { t } = useTranslation();
  const [input, setInput] = useState('+1 202 555 0173');
  const [country, setCountry] = useState<CountryCode>('US');

  const parsed = useMemo(() => {
    const trimmed = input.trim();
    if (!trimmed) return null;
    return parsePhoneNumberFromString(trimmed, country) ?? null;
  }, [input, country]);

  const rows: [string, string][] = parsed
    ? [
        [t('tools.phone-parser.valid'), parsed.isValid() ? '✓' : '✗'],
        [t('tools.phone-parser.country'), parsed.country ?? '—'],
        [t('tools.phone-parser.callingCode'), `+${parsed.countryCallingCode}`],
        [t('tools.phone-parser.type'), parsed.getType() ?? '—'],
        ['E.164', parsed.format('E.164')],
        [t('tools.phone-parser.international'), parsed.formatInternational()],
        [t('tools.phone-parser.national'), parsed.formatNational()],
        ['RFC 3966', parsed.format('RFC3966')],
      ]
    : [];

  return (
    <ToolLayout id="phone-parser" color="#818cf8">
      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div>
          <label className="mb-2 block font-semibold" htmlFor="phone-input">{t('tools.phone-parser.inputLabel')}</label>
          <GlassInput
            id="phone-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={t('tools.phone-parser.placeholder')}
          />
        </div>
        <div>
          <label className="mb-2 block font-semibold" htmlFor="phone-country">{t('tools.phone-parser.defaultCountry')}</label>
          <select
            id="phone-country"
            className="glass-select"
            value={country}
            onChange={(event) => setCountry(event.target.value as CountryCode)}
          >
            {COUNTRIES.map((code) => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
        </div>
      </div>
      {parsed ? (
        <div className="mono-panel divide-y divide-white/5">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <span className="shrink-0 text-sm text-[var(--color-text-muted)]">{label}</span>
              <span className="flex items-center gap-2 truncate font-mono text-sm">
                <span className="truncate">{value}</span>
                <CopyButton value={value} />
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--color-text-muted)]">{t('tools.phone-parser.empty')}</p>
      )}
    </ToolLayout>
  );
});

export default PhoneParserTool;
