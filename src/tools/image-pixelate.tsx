import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dropzone from '../components/Dropzone';
import GlassButton from '../components/GlassButton';
import ToolLayout from '../components/ToolLayout';
import { canvasFromImage, downloadDataUrl, fileToDataUrl, loadImage } from '../lib/image';

function pixelate(src: string, block: number): Promise<string> {
  return loadImage(src).then((img) => {
    const canvas = canvasFromImage(img);
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    const { width, height } = canvas;
    const data = ctx.getImageData(0, 0, width, height);
    const out = ctx.createImageData(width, height);
    for (let y = 0; y < height; y += block) {
      for (let x = 0; x < width; x += block) {
        const bw = Math.min(block, width - x);
        const bh = Math.min(block, height - y);
        let r = 0, g = 0, b = 0, a = 0, n = 0;
        for (let dy = 0; dy < bh; dy += 1) {
          for (let dx = 0; dx < bw; dx += 1) {
            const i = ((y + dy) * width + (x + dx)) * 4;
            r += data.data[i]; g += data.data[i + 1]; b += data.data[i + 2]; a += data.data[i + 3]; n += 1;
          }
        }
        r /= n; g /= n; b /= n; a /= n;
        for (let dy = 0; dy < bh; dy += 1) {
          for (let dx = 0; dx < bw; dx += 1) {
            const i = ((y + dy) * width + (x + dx)) * 4;
            out.data[i] = r; out.data[i + 1] = g; out.data[i + 2] = b; out.data[i + 3] = a;
          }
        }
      }
    }
    ctx.putImageData(out, 0, 0);
    return canvas.toDataURL('image/png');
  });
}

const ImagePixelateTool = memo(function ImagePixelateTool() {
  const { t } = useTranslation();
  const [src, setSrc] = useState('');
  const [result, setResult] = useState('');
  const [block, setBlock] = useState(12);
  const [name, setName] = useState('image.png');

  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    pixelate(src, Math.max(1, block)).then((url) => { if (!cancelled) setResult(url); });
    return () => { cancelled = true; };
  }, [src, block]);

  return (
    <ToolLayout id="image-pixelate" color="#fbbf24">
      <div className="flex flex-col gap-4">
        <Dropzone label={t('tools.image-pixelate.dropLabel')} inputLabel={t('tools.image-pixelate.dropLabel')} onFile={async (f) => { setSrc(await fileToDataUrl(f)); setName(f.name || 'image.png'); }} />
        {src && (
          <>
            <label className="text-sm text-[var(--color-text-muted)]">
              {t('tools.image-pixelate.block')}: {block}px
              <input type="range" min={2} max={64} value={block} onChange={(e) => setBlock(Number(e.target.value))} className="mt-2 w-full" />
            </label>
            <div className="grid gap-4 lg:grid-cols-2">
              <div><h3 className="mb-2 text-sm text-[var(--color-text-muted)]">{t('tools.image-pixelate.original')}</h3><img src={src} alt="" className="max-h-80 rounded-lg border border-[var(--color-border)]" /></div>
              <div>
                <h3 className="mb-2 text-sm text-[var(--color-text-muted)]">{t('tools.image-pixelate.result')}</h3>
                {result && <img src={result} alt="" className="max-h-80 rounded-lg border border-[var(--color-border)]" />}
                {result && <GlassButton className="mt-3" onClick={() => downloadDataUrl(result, name.replace(/\.[^.]+$/, '') + '-pixel.png')}>{t('tools.image-pixelate.download')}</GlassButton>}
              </div>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
});

export default ImagePixelateTool;
