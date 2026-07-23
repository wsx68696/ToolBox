import { memo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import Dropzone from '../components/Dropzone';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';
import { fileToDataUrl, loadImage } from '../lib/image';

interface Sample {
  x: number;
  y: number;
  hex: string;
  rgb: string;
  r: number;
  g: number;
  b: number;
}

function toHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

const ColorPickerTool = memo(function ColorPickerTool() {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = useState<Sample | null>(null);
  const [picked, setPicked] = useState<Sample | null>(null);
  const [manual, setManual] = useState('#22d3ee');
  const [hasImage, setHasImage] = useState(false);

  const sampleAt = (clientX: number, clientY: number): Sample | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(canvas.width - 1, Math.floor((clientX - rect.left) * (canvas.width / rect.width))));
    const y = Math.max(0, Math.min(canvas.height - 1, Math.floor((clientY - rect.top) * (canvas.height / rect.height))));
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
    return { x, y, r, g, b, hex: toHex(r, g, b), rgb: `rgb(${r}, ${g}, ${b})` };
  };

  const onFile = async (file: File) => {
    const url = await fileToDataUrl(file);
    const img = await loadImage(url);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const maxW = 720;
    const scale = Math.min(1, maxW / img.width);
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    setHasImage(true);
    setHover(null);
    setPicked(null);
  };

  const current = picked ?? hover;

  return (
    <ToolLayout id="color-picker" color="#818cf8">
      <div className="flex flex-col gap-5">
        <Dropzone label={t('tools.color-picker.dropLabel')} inputLabel={t('tools.color-picker.dropLabel')} onFile={onFile} />
        <div className="grid gap-5 lg:grid-cols-[1fr_16rem]">
          <div className="overflow-auto">
            <canvas
              ref={canvasRef}
              className={`max-w-full rounded-lg border border-[var(--color-border)] ${hasImage ? 'cursor-crosshair' : 'hidden'}`}
              onMouseMove={(e) => setHover(sampleAt(e.clientX, e.clientY))}
              onMouseLeave={() => setHover(null)}
              onClick={(e) => {
                const s = sampleAt(e.clientX, e.clientY);
                if (s) { setPicked(s); setManual(s.hex); }
              }}
            />
            {!hasImage && <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] text-sm text-[var(--color-text-muted)]">{t('tools.color-picker.empty')}</div>}
          </div>
          <div className="flex flex-col gap-3">
            <div className="h-24 rounded-xl border border-[var(--color-border)]" style={{ background: current?.hex ?? manual }} />
            {current && (
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between gap-2"><span className="font-mono">{current.hex}</span><CopyButton value={current.hex} /></div>
                <div className="flex items-center justify-between gap-2"><span className="font-mono">{current.rgb}</span><CopyButton value={current.rgb} /></div>
                <p className="text-xs text-[var(--color-text-muted)]">x={current.x}, y={current.y}</p>
              </div>
            )}
            <label className="text-sm text-[var(--color-text-muted)]">
              {t('tools.color-picker.manual')}
              <div className="mt-1 flex items-center gap-2">
                <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(manual) ? manual : '#000000'} onChange={(e) => { setManual(e.target.value); setPicked(null); setHover({ x: 0, y: 0, r: 0, g: 0, b: 0, hex: e.target.value, rgb: '' }); }} className="h-10 w-12 cursor-pointer rounded border border-[var(--color-border)] bg-transparent" />
                <GlassInput aria-label={t('tools.color-picker.manual')} value={manual} onChange={(e) => setManual(e.target.value)} className="font-mono" />
              </div>
            </label>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
});

export default ColorPickerTool;
