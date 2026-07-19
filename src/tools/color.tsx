import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

interface Rgb { r: number; g: number; b: number }
interface Hsl { h: number; s: number; l: number }

function clamp(value: number, min: number, max: number) { return Math.min(Math.max(value, min), max); }
function rgbToHex({ r, g, b }: Rgb) { return `#${[r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('')}`; }
function hexToRgb(hex: string): Rgb | null {
  const normalized = hex.replace('#', '').trim();
  const full = normalized.length === 3 ? normalized.split('').map((c) => c + c).join('') : normalized;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return { r: parseInt(full.slice(0, 2), 16), g: parseInt(full.slice(2, 4), 16), b: parseInt(full.slice(4, 6), 16) };
}
function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const nr = r / 255, ng = g / 255, nb = b / 255;
  const max = Math.max(nr, ng, nb), min = Math.min(nr, ng, nb);
  let h = 0; const l = (max + min) / 2; const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d) {
    if (max === nr) h = 60 * (((ng - nb) / d) % 6);
    if (max === ng) h = 60 * ((nb - nr) / d + 2);
    if (max === nb) h = 60 * ((nr - ng) / d + 4);
  }
  return { h: Math.round((h + 360) % 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}
function hslToRgb({ h, s, l }: Hsl): Rgb {
  const sn = s / 100, ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;
  const [r, g, b] =
    h < 60 ? [c, x, 0] :
    h < 120 ? [x, c, 0] :
    h < 180 ? [0, c, x] :
    h < 240 ? [0, x, c] :
    h < 300 ? [x, 0, c] : [c, 0, x];
  return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) };
}
function parseRgbString(value: string): Rgb | null {
  const numbers = value.match(/-?\d+(?:\.\d+)?/g);
  if (!numbers || numbers.length !== 3) return null;
  const [r, g, b] = numbers.map(Number);
  if ([r, g, b].some((part) => part < 0 || part > 255)) return null;
  return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
}
function parseHslString(value: string): Hsl | null {
  const numbers = value.match(/-?\d+(?:\.\d+)?/g);
  if (!numbers || numbers.length !== 3) return null;
  const [h, s, l] = numbers.map(Number);
  if (h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100) return null;
  return { h, s, l };
}

function formatRgb({ r, g, b }: Rgb) { return `rgb(${r}, ${g}, ${b})`; }
function formatHsl({ h, s, l }: Hsl) { return `hsl(${h} ${s}% ${l}%)`; }
function formatFields(rgb: Rgb) {
  return { hex: rgbToHex(rgb), rgb: formatRgb(rgb), hsl: formatHsl(rgbToHsl(rgb)) };
}

type ColorField = 'hex' | 'rgb' | 'hsl';

const parsers: Record<ColorField, (value: string) => Rgb | null> = {
  hex: hexToRgb,
  rgb: parseRgbString,
  hsl: (value) => { const hsl = parseHslString(value); return hsl ? hslToRgb(hsl) : null; },
};

const initialColor: Rgb = { r: 34, g: 211, b: 238 };

const ColorTool = memo(function ColorTool() {
  const { t } = useTranslation();
  const [color, setColor] = useState<Rgb>(initialColor);
  const [fields, setFields] = useState(() => formatFields(initialColor));

  const update = (kind: ColorField, value: string) => {
    const parsed = parsers[kind](value);
    if (parsed) {
      setColor(parsed);
      const next = formatFields(parsed);
      next[kind] = value;
      setFields(next);
    } else {
      setFields((current) => ({ ...current, [kind]: value }));
    }
  };

  const cleanHex = rgbToHex(color);
  const outputs = [`HEX ${cleanHex}`, `RGB ${formatRgb(color)}`, `HSL ${formatHsl(rgbToHsl(color))}`, `Tailwind arbitrary bg-[${cleanHex}] text-[${cleanHex}]`].join('\n');

  return (
    <ToolLayout id="color" color="#818cf8">
      <div className="grid gap-5 lg:grid-cols-[1fr_18rem]">
        <div>
          <div className="grid gap-3">
            <Field label={t('tools.color.hex')} value={fields.hex} invalid={!parsers.hex(fields.hex)} onChange={(value) => update('hex', value)} placeholder={t('tools.color.inputPlaceholder')} />
            <Field label={t('tools.color.rgb')} value={fields.rgb} invalid={!parsers.rgb(fields.rgb)} onChange={(value) => update('rgb', value)} placeholder="rgb(34, 211, 238)" />
            <Field label={t('tools.color.hsl')} value={fields.hsl} invalid={!parsers.hsl(fields.hsl)} onChange={(value) => update('hsl', value)} placeholder="hsl(188 86% 53%)" />
          </div>
          <div className="glass-input mt-4 flex items-center justify-between gap-3 p-3">
            <span className="text-sm text-[var(--color-text-muted)]">{t('tools.color.tailwind')}</span>
            <code className="font-mono text-sm">{`bg-[${cleanHex}] text-[${cleanHex}]`}</code>
          </div>
          <div className="mt-4"><CopyButton value={outputs} /></div>
        </div>
        <div className="glass-card min-h-64 rounded-2xl border-[var(--color-border)]" style={{ background: cleanHex }} aria-label={t('tools.color.hex')} />
      </div>
    </ToolLayout>
  );
});

function Field({ label, value, onChange, invalid, placeholder }: { label: string; value: string; onChange: (value: string) => void; invalid: boolean; placeholder?: string }) {
  return (
    <label className="text-sm text-[var(--color-text-muted)]">
      {label}
      <GlassInput aria-label={label} className={`mt-2 ${invalid ? 'border-red-400/60' : ''}`} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

export default ColorTool;
