import { Download } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import NumberStepper from '../components/NumberStepper';
import ToolLayout from '../components/ToolLayout';

function safeColor(value: string, fallback: string): string {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim()) ? value.trim() : fallback;
}

const SvgPlaceholderTool = memo(function SvgPlaceholderTool() {
  const { t } = useTranslation();
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(400);
  const [background, setBackground] = useState('#cbd5e1');
  const [foreground, setForeground] = useState('#334155');
  const [text, setText] = useState('');

  const { svg, dataUri } = useMemo(() => {
    const bg = safeColor(background, '#cbd5e1');
    const fg = safeColor(foreground, '#334155');
    const label = text || `${width}×${height}`;
    const fontSize = Math.max(10, Math.round(Math.min(width, height) / 5));
    const source = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="${bg}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="${fontSize}" fill="${fg}">${label.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text></svg>`;
    return { svg: source, dataUri: `data:image/svg+xml,${encodeURIComponent(source)}` };
  }, [width, height, background, foreground, text]);

  return (
    <ToolLayout id="svg-placeholder" color="#818cf8">
      <div className="grid gap-5 lg:grid-cols-[1fr_24rem]">
        <div>
          <div className="flex flex-wrap gap-4">
            <div className="text-sm text-[var(--color-text-muted)]">
              <span className="mb-2 block">{t('tools.svg-placeholder.width')}</span>
              <NumberStepper aria-label={t('tools.svg-placeholder.width')} min={16} max={4000} step={10} value={width} onChange={setWidth} />
            </div>
            <div className="text-sm text-[var(--color-text-muted)]">
              <span className="mb-2 block">{t('tools.svg-placeholder.height')}</span>
              <NumberStepper aria-label={t('tools.svg-placeholder.height')} min={16} max={4000} step={10} value={height} onChange={setHeight} />
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-[var(--color-text-muted)]">
              {t('tools.svg-placeholder.background')}
              <GlassInput aria-label={t('tools.svg-placeholder.background')} className="mt-2 font-mono" value={background} onChange={(event) => setBackground(event.target.value)} placeholder="#cbd5e1" />
            </label>
            <label className="text-sm text-[var(--color-text-muted)]">
              {t('tools.svg-placeholder.foreground')}
              <GlassInput aria-label={t('tools.svg-placeholder.foreground')} className="mt-2 font-mono" value={foreground} onChange={(event) => setForeground(event.target.value)} placeholder="#334155" />
            </label>
          </div>
          <label className="mt-4 block text-sm text-[var(--color-text-muted)]">
            {t('tools.svg-placeholder.text')}
            <GlassInput aria-label={t('tools.svg-placeholder.text')} className="mt-2" value={text} onChange={(event) => setText(event.target.value)} placeholder={`${width}×${height}`} />
          </label>
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold">SVG</h2>
              <CopyButton value={svg} />
            </div>
            <div className="glass-input mono-panel max-h-40 overflow-auto p-3 text-xs">{svg}</div>
          </div>
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Data URI</h2>
              <CopyButton value={dataUri} />
            </div>
            <div className="glass-input mono-panel max-h-24 overflow-auto p-3 text-xs">{dataUri}</div>
          </div>
          <a className="mt-4 inline-block" href={dataUri} download="placeholder.svg" aria-label={t('tools.svg-placeholder.download')}>
            <GlassButton><Download size={16} /> {t('tools.svg-placeholder.download')}</GlassButton>
          </a>
        </div>
        <div className="glass-card grid min-h-64 place-items-center overflow-hidden rounded-2xl p-5">
          <img src={dataUri} alt={t('tools.svg-placeholder.name')} className="max-h-72 max-w-full rounded-lg" />
        </div>
      </div>
    </ToolLayout>
  );
});

export default SvgPlaceholderTool;
