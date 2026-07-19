import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

type Unit = 'celsius' | 'fahrenheit' | 'kelvin' | 'rankine';

function toCelsius(value: number, from: Unit): number {
  switch (from) {
    case 'celsius': return value;
    case 'fahrenheit': return (value - 32) * 5 / 9;
    case 'kelvin': return value - 273.15;
    case 'rankine': return (value - 491.67) * 5 / 9;
  }
}

function fromCelsius(celsius: number, to: Unit): number {
  switch (to) {
    case 'celsius': return celsius;
    case 'fahrenheit': return celsius * 9 / 5 + 32;
    case 'kelvin': return celsius + 273.15;
    case 'rankine': return (celsius + 273.15) * 9 / 5;
  }
}

const units: { key: Unit; symbol: string }[] = [
  { key: 'celsius', symbol: '°C' },
  { key: 'fahrenheit', symbol: '°F' },
  { key: 'kelvin', symbol: 'K' },
  { key: 'rankine', symbol: '°R' },
];

function round(value: number): string {
  return Number.isFinite(value) ? String(Math.round(value * 100) / 100) : '';
}

const TemperatureTool = memo(function TemperatureTool() {
  const { t } = useTranslation();
  const [celsius, setCelsius] = useState(20);
  const [editing, setEditing] = useState<Unit | null>(null);
  const [draft, setDraft] = useState('');

  const onChange = (unit: Unit, raw: string) => {
    setEditing(unit);
    setDraft(raw);
    const value = Number(raw);
    if (raw.trim() !== '' && Number.isFinite(value)) setCelsius(toCelsius(value, unit));
  };

  const display = (unit: Unit) => (editing === unit ? draft : round(fromCelsius(celsius, unit)));

  return (
    <ToolLayout id="temperature" color="#f87171">
      <div className="grid gap-4 sm:grid-cols-2">
        {units.map((unit) => (
          <label key={unit.key} className="text-sm text-[var(--color-text-muted)]">
            <span className="mb-2 flex items-center gap-2">
              {t(`tools.temperature.${unit.key}`)}
              <span className="font-mono text-xs">{unit.symbol}</span>
            </span>
            <GlassInput
              aria-label={t(`tools.temperature.${unit.key}`)}
              inputMode="decimal"
              value={display(unit.key)}
              onChange={(event) => onChange(unit.key, event.target.value)}
              onBlur={() => setEditing(null)}
            />
          </label>
        ))}
      </div>
    </ToolLayout>
  );
});

export default TemperatureTool;
