import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

// Names/abbreviations for the 33 non-printable control characters (0-31, 127).
const CONTROL_NAMES: Record<number, string> = {
  0: 'NUL', 1: 'SOH', 2: 'STX', 3: 'ETX', 4: 'EOT', 5: 'ENQ', 6: 'ACK', 7: 'BEL',
  8: 'BS', 9: 'HT', 10: 'LF', 11: 'VT', 12: 'FF', 13: 'CR', 14: 'SO', 15: 'SI',
  16: 'DLE', 17: 'DC1', 18: 'DC2', 19: 'DC3', 20: 'DC4', 21: 'NAK', 22: 'SYN', 23: 'ETB',
  24: 'CAN', 25: 'EM', 26: 'SUB', 27: 'ESC', 28: 'FS', 29: 'GS', 30: 'RS', 31: 'US',
  127: 'DEL',
};

interface Row {
  dec: number;
  hex: string;
  oct: string;
  bin: string;
  glyph: string;
  isControl: boolean;
}

const ROWS: Row[] = Array.from({ length: 128 }, (_, dec) => {
  const isControl = dec < 32 || dec === 127;
  return {
    dec,
    hex: dec.toString(16).toUpperCase().padStart(2, '0'),
    oct: dec.toString(8).padStart(3, '0'),
    bin: dec.toString(2).padStart(8, '0'),
    glyph: isControl ? (CONTROL_NAMES[dec] ?? '') : (dec === 32 ? 'SP' : String.fromCharCode(dec)),
    isControl,
  };
});

const AsciiTableTool = memo(function AsciiTableTool() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ROWS;
    return ROWS.filter((r) =>
      String(r.dec) === q ||
      r.hex.toLowerCase() === q ||
      r.hex.toLowerCase() === q.replace(/^0x/, '') ||
      r.glyph.toLowerCase() === q ||
      r.glyph.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <ToolLayout id="ascii-table" color="#22d3ee">
      <div className="flex flex-col gap-4">
        <GlassInput
          aria-label={t('tools.ascii-table.search')}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('tools.ascii-table.searchPlaceholder')}
          className="sm:max-w-xs"
        />
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-[var(--color-text-muted)]">
                <th className="border-b border-[var(--color-border)] px-3 py-2 font-medium">{t('tools.ascii-table.char')}</th>
                <th className="border-b border-[var(--color-border)] px-3 py-2 font-medium">{t('tools.ascii-table.dec')}</th>
                <th className="border-b border-[var(--color-border)] px-3 py-2 font-medium">{t('tools.ascii-table.hex')}</th>
                <th className="border-b border-[var(--color-border)] px-3 py-2 font-medium">{t('tools.ascii-table.oct')}</th>
                <th className="border-b border-[var(--color-border)] px-3 py-2 font-medium">{t('tools.ascii-table.bin')}</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {rows.map((r) => (
                <tr key={r.dec} className="hover:bg-[var(--color-surface-hover)]">
                  <td className={`border-b border-[var(--color-border)] px-3 py-1.5 ${r.isControl ? 'text-[var(--color-text-muted)]' : 'font-semibold'}`}>{r.glyph}</td>
                  <td className="border-b border-[var(--color-border)] px-3 py-1.5">{r.dec}</td>
                  <td className="border-b border-[var(--color-border)] px-3 py-1.5">0x{r.hex}</td>
                  <td className="border-b border-[var(--color-border)] px-3 py-1.5">{r.oct}</td>
                  <td className="border-b border-[var(--color-border)] px-3 py-1.5">{r.bin}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="px-3 py-4 text-sm text-[var(--color-text-muted)]">{t('tools.ascii-table.noResults')}</p>}
        </div>
      </div>
    </ToolLayout>
  );
});

export default AsciiTableTool;
