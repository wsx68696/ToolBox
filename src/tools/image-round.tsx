import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dropzone from '../components/Dropzone';
import GlassButton from '../components/GlassButton';
import ToolLayout from '../components/ToolLayout';
import { downloadDataUrl, fileToDataUrl, loadImage } from '../lib/image';

const ImageRoundTool = memo(function ImageRoundTool() {
  const { t } = useTranslation();
  const [src, setSrc] = useState('');
  const [result, setResult] = useState('');
  const [radius, setRadius] = useState(40);
  const [name, setName] = useState('image.png');
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    (async () => {
      const img = await loadImage(src);
      if (cancelled) return;
      setSize({ w: img.width, h: img.height });
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      const r = Math.min(radius, img.width / 2, img.height / 2);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.moveTo(r, 0);
      ctx.lineTo(canvas.width - r, 0);
      ctx.quadraticCurveTo(canvas.width, 0, canvas.width, r);
      ctx.lineTo(canvas.width, canvas.height - r);
      ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - r, canvas.height);
      ctx.lineTo(r, canvas.height);
      ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - r);
      ctx.lineTo(0, r);
      ctx.quadraticCurveTo(0, 0, r, 0);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 0, 0);
      setResult(canvas.toDataURL('image/png'));
    })();
    return () => { cancelled = true; };
  }, [src, radius]);

  const onFile = async (file: File) => {
    setSrc(await fileToDataUrl(file));
    setName(file.name || 'image.png');
  };

  const maxR = Math.floor(Math.min(size.w, size.h) / 2) || 200;

  return (
    <ToolLayout id="image-round" color="#f472b6">
      <div className="flex flex-col gap-4">
        <Dropzone label={t('tools.image-round.dropLabel')} inputLabel={t('tools.image-round.dropLabel')} onFile={onFile} />
        {src && (
          <>
            <label className="text-sm text-[var(--color-text-muted)]">
              {t('tools.image-round.radius')}: {radius}px
              <input type="range" min={0} max={maxR} value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="mt-2 w-full" />
            </label>
            <div className="grid gap-4 lg:grid-cols-2">
              <div><h3 className="mb-2 text-sm text-[var(--color-text-muted)]">{t('tools.image-round.original')}</h3><img src={src} alt="" className="max-h-80 rounded-lg border border-[var(--color-border)]" /></div>
              <div>
                <h3 className="mb-2 text-sm text-[var(--color-text-muted)]">{t('tools.image-round.result')}</h3>
                {result && <img src={result} alt="" className="max-h-80 rounded-lg border border-[var(--color-border)] bg-[repeating-conic-gradient(#80808020_0%_25%,transparent_0%_50%)] bg-[length:16px_16px]" />}
                {result && <GlassButton className="mt-3" onClick={() => downloadDataUrl(result, name.replace(/\.[^.]+$/, '') + '-round.png')}>{t('tools.image-round.download')}</GlassButton>}
              </div>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
});

export default ImageRoundTool;
