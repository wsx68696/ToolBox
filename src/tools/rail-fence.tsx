import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

function numChar(n: number, c: string) {
  return c.repeat(Math.max(0, n));
}

/** Columnar "W" / row-fill rail fence. */
function enRailFence(data: string, width: number): string {
  data = data.replace(/\s/g, '');
  const dummy = (width - (data.length % width)) % width;
  data += numChar(dummy, '@');
  const height = data.length / width;
  let out = '';
  for (let i = 0; i < width; i += 1) {
    for (let j = 0; j < height; j += 1) out += data.charAt(j * width + i);
  }
  return out;
}

function deRailFence(data: string, height: number): string {
  data = data.replace(/\s/g, '');
  const dummy = (height - (data.length % height)) % height;
  data += numChar(dummy, '@');
  const width = data.length / height;
  let out = '';
  for (let i = 0; i < width; i += 1) {
    for (let j = 0; j < height; j += 1) out += data.charAt(j * width + i);
  }
  return out.replace(/@+$/, '');
}

/** Zigzag rail fence. */
function enRailFenceW(text: string, line: number): string {
  text = text.replace(/\s/g, '');
  if (line <= 1) return text;
  const cycle = (line - 1) * 2;
  const rows = new Array(line).fill('') as string[];
  for (let pos = 0; pos < text.length; pos += 1) {
    const rowIdx = line - 1 - Math.abs(cycle / 2 - (pos % cycle));
    rows[rowIdx] += text[pos];
  }
  return rows.join('');
}

function deRailFenceW(text: string, line: number): string {
  text = text.replace(/\s/g, '');
  if (line <= 1) return text;
  const cycle = (line - 1) * 2;
  const plaintext = new Array(text.length);
  let j = 0;
  for (let y = 0; y < line; y += 1) {
    for (let x = 0; x < text.length; x += 1) {
      if ((y + x) % cycle === 0 || (y - x) % cycle === 0) plaintext[x] = text[j++];
    }
  }
  return plaintext.join('');
}

const RailFenceTool = memo(function RailFenceTool() {
  const { t } = useTranslation();
  const [input, setInput] = useState('WEAREDISCOVEREDFLEEATONCE');
  const [rails, setRails] = useState(3);
  const [columnar, setColumnar] = useState('');
  const [zigzag, setZigzag] = useState('');

  const n = Math.max(2, Math.min(100, rails || 2));

  return (
    <ToolLayout id="rail-fence" color="#4ade80">
      <div className="flex flex-col gap-4">
        <label className="text-sm text-[var(--color-text-muted)]">
          {t('tools.rail-fence.rails')}
          <GlassInput type="number" min={2} max={100} className="mt-1 w-28" value={rails} onChange={(e) => setRails(Number(e.target.value) || 2)} />
        </label>
        <div>
          <h2 className="mb-2 font-semibold">{t('tools.rail-fence.input')}</h2>
          <GlassInput multiline rows={5} className="font-mono" value={input} onChange={(e) => setInput(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          <GlassButton onClick={() => { setColumnar(enRailFence(input, n)); setZigzag(enRailFenceW(input, n)); }}>{t('tools.rail-fence.encrypt')}</GlassButton>
          <GlassButton onClick={() => { setColumnar(deRailFence(input, n)); setZigzag(deRailFenceW(input, n)); }}>{t('tools.rail-fence.decrypt')}</GlassButton>
          <GlassButton onClick={() => {
            const a: string[] = [];
            const b: string[] = [];
            for (let i = 2; i < Math.min(input.replace(/\s/g, '').length, 40); i += 1) {
              a.push(`${i}: ${deRailFence(input, i)}`);
              b.push(`${i}: ${deRailFenceW(input, i)}`);
            }
            setColumnar(a.join('\n'));
            setZigzag(b.join('\n'));
          }}>{t('tools.rail-fence.enumerate')}</GlassButton>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold">{t('tools.rail-fence.columnar')}</h2>
              <CopyButton value={columnar} />
            </div>
            <GlassInput multiline readOnly rows={10} className="font-mono text-sm" value={columnar} onChange={() => {}} />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold">{t('tools.rail-fence.zigzag')}</h2>
              <CopyButton value={zigzag} />
            </div>
            <GlassInput multiline readOnly rows={10} className="font-mono text-sm" value={zigzag} onChange={() => {}} />
          </div>
        </div>
        <p className="text-xs text-[var(--color-text-muted)]">{t('tools.rail-fence.hint')}</p>
      </div>
    </ToolLayout>
  );
});

export default RailFenceTool;
