import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dropzone from '../components/Dropzone';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';
import { downloadDataUrl, fileToDataUrl, loadImage } from '../lib/image';

const ImageWatermarkTool = memo(function ImageWatermarkTool() {
  const { t } = useTranslation();
  const [src, setSrc] = useState('');
  const [result, setResult] = useState('');
  const [text, setText] = useState('Toolbox');
  const [fontSize, setFontSize] = useState(24);
  const [opacity, setOpacity] = useState(0.25);
  const [gap, setGap] = useState(120);
  const [name, setName] = useState('image.png');
  const [color, setColor] = useState('#000000');

  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    (async () => {
      const img = await loadImage(src);
      if (cancelled) return;
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = color;
      ctx.font = `${fontSize}px sans-serif`;
      ctx.rotate((-20 * Math.PI) / 180);
      const metrics = ctx.measureText(text || ' ');
      const stepX = Math.max(gap, metrics.width + 40);
      const stepY = Math.max(gap, fontSize * 3);
      for (let y = -canvas.height; y < canvas.height * 2; y += stepY) {
        for (let x = -canvas.width; x < canvas.width * 2; x += stepX) {
          ctx.fillText(text, x, y);
        }
      }
      ctx.restore();
      if (!cancelled) setResult(canvas.toDataURL('image/png'));
    })();
    return () => { cancelled = true; };
  }, [src, text, fontSize, opacity, gap, color]);

  return (
    <ToolLayout id="image-watermark" color="#22d3ee">
      <div className="flex flex-col gap-4">
        <Dropzone label={t('tools.image-watermark.dropLabel')} inputLabel={t('tools.image-watermark.dropLabel')} onFile={async (f) => { setSrc(await fileToDataUrl(f)); setName(f.name || 'image.png'); }} />
        {src && (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="text-sm text-[var(--color-text-muted)]">{t('tools.image-watermark.text')}<GlassInput className="mt-1" value={text} onChange={(e) => setText(e.target.value)} /></label>
              <label className="text-sm text-[var(--color-text-muted)]">{t('tools.image-watermark.fontSize')}: {fontSize}<input type="range" min={10} max={96} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="mt-2 w-full" /></label>
              <label className="text-sm text-[var(--color-text-muted)]">{t('tools.image-watermark.opacity')}: {Math.round(opacity * 100)}%<input type="range" min={0.05} max={0.8} step={0.05} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="mt-2 w-full" /></label>
              <label className="text-sm text-[var(--color-text-muted)]">{t('tools.image-watermark.gap')}: {gap}<input type="range" min={40} max={300} value={gap} onChange={(e) => setGap(Number(e.target.value))} className="mt-2 w-full" /></label>
            </div>
            <label className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
              {t('tools.image-watermark.color')}
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 w-12 cursor-pointer rounded border border-[var(--color-border)] bg-transparent" />
            </label>
            <div className="grid gap-4 lg:grid-cols-2">
              <div><h3 className="mb-2 text-sm text-[var(--color-text-muted)]">{t('tools.image-watermark.original')}</h3><img src={src} alt="" className="max-h-80 rounded-lg border border-[var(--color-border)]" /></div>
              <div>
                <h3 className="mb-2 text-sm text-[var(--color-text-muted)]">{t('tools.image-watermark.result')}</h3>
                {result && <img src={result} alt="" className="max-h-80 rounded-lg border border-[var(--color-border)]" />}
                {result && <GlassButton className="mt-3" onClick={() => downloadDataUrl(result, name.replace(/\.[^.]+$/, '') + '-wm.png')}>{t('tools.image-watermark.download')}</GlassButton>}
              </div>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
});

export default ImageWatermarkTool;
