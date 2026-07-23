import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dropzone from '../components/Dropzone';
import GlassButton from '../components/GlassButton';
import NumberStepper from '../components/NumberStepper';
import ToolLayout from '../components/ToolLayout';
import { fileToDataUrl, loadImage } from '../lib/image';

const ImageSplitTool = memo(function ImageSplitTool() {
  const { t } = useTranslation();
  const [src, setSrc] = useState('');
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [tiles, setTiles] = useState<string[]>([]);
  const [name, setName] = useState('image');

  const split = async () => {
    if (!src) return;
    const img = await loadImage(src);
    const tileW = Math.floor(img.width / cols);
    const tileH = Math.floor(img.height / rows);
    const out: string[] = [];
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const canvas = document.createElement('canvas');
        canvas.width = tileW;
        canvas.height = tileH;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, c * tileW, r * tileH, tileW, tileH, 0, 0, tileW, tileH);
        out.push(canvas.toDataURL('image/png'));
      }
    }
    setTiles(out);
  };

  const downloadAll = () => {
    tiles.forEach((url, i) => {
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name}-${i + 1}.png`;
      a.click();
    });
  };

  return (
    <ToolLayout id="image-split" color="#818cf8">
      <div className="flex flex-col gap-4">
        <Dropzone label={t('tools.image-split.dropLabel')} inputLabel={t('tools.image-split.dropLabel')} onFile={async (f) => { setSrc(await fileToDataUrl(f)); setName((f.name || 'image').replace(/\.[^.]+$/, '')); setTiles([]); }} />
        {src && (
          <>
            <div className="flex flex-wrap items-end gap-4">
              <label className="text-sm text-[var(--color-text-muted)]">{t('tools.image-split.rows')}<div className="mt-1"><NumberStepper value={rows} min={1} max={10} onChange={setRows} /></div></label>
              <label className="text-sm text-[var(--color-text-muted)]">{t('tools.image-split.cols')}<div className="mt-1"><NumberStepper value={cols} min={1} max={10} onChange={setCols} /></div></label>
              <GlassButton onClick={split}>{t('tools.image-split.split')}</GlassButton>
              {tiles.length > 0 && <GlassButton onClick={downloadAll}>{t('tools.image-split.downloadAll')}</GlassButton>}
            </div>
            <img src={src} alt="" className="max-h-64 self-start rounded-lg border border-[var(--color-border)]" />
            {tiles.length > 0 && (
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                {tiles.map((url, i) => (
                  <a key={i} href={url} download={`${name}-${i + 1}.png`} className="block overflow-hidden rounded border border-[var(--color-border)]">
                    <img src={url} alt={`tile ${i + 1}`} className="h-full w-full object-cover" />
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  );
});

export default ImageSplitTool;
