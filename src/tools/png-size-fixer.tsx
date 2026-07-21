import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dropzone from '../components/Dropzone';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

// CRC32 lookup table (same polynomial PNG uses: 0xEDB88320).
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

interface PngInfo {
  width: number;
  height: number;
  storedCrc: number;
  crcValid: boolean;
}

// Parse the IHDR chunk. Layout: 8B signature | 4B length | "IHDR" | 13B data | 4B CRC.
// CRC covers "IHDR" + the 13 data bytes = file bytes [12, 29). Width [16,20), height [20,24).
function parsePng(bytes: Uint8Array): PngInfo | null {
  if (bytes.length < 33) return null;
  for (let i = 0; i < 8; i += 1) if (bytes[i] !== PNG_SIGNATURE[i]) return null;
  if (bytes[12] !== 0x49 || bytes[13] !== 0x48 || bytes[14] !== 0x44 || bytes[15] !== 0x52) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const width = view.getUint32(16);
  const height = view.getUint32(20);
  const storedCrc = view.getUint32(29);
  const crcValid = crc32(bytes.slice(12, 29)) === storedCrc;
  return { width, height, storedCrc, crcValid };
}

// Produce a copy of the PNG with the width/height fields overwritten.
function patchDimensions(bytes: Uint8Array, width: number, height: number): Uint8Array {
  const out = bytes.slice();
  const view = new DataView(out.buffer);
  view.setUint32(16, width >>> 0);
  view.setUint32(20, height >>> 0);
  return out;
}

interface BruteResult {
  width: number;
  height: number;
}

const PngSizeFixerTool = memo(function PngSizeFixerTool() {
  const { t } = useTranslation();
  const [bytes, setBytes] = useState<Uint8Array | null>(null);
  const [fileName, setFileName] = useState('image.png');
  const [info, setInfo] = useState<PngInfo | null>(null);
  const [notPng, setNotPng] = useState(false);
  const [originalUrl, setOriginalUrl] = useState('');
  const [fixedUrl, setFixedUrl] = useState('');
  const [result, setResult] = useState<BruteResult | null>(null);

  const [maxDim, setMaxDim] = useState(8192);
  const [deepScan, setDeepScan] = useState(false);
  const [working, setWorking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [notFound, setNotFound] = useState(false);

  const [manualWidth, setManualWidth] = useState('');
  const [manualHeight, setManualHeight] = useState('');

  const cancelledRef = useRef(false);
  const originalUrlRef = useRef('');
  const fixedUrlRef = useRef('');

  const revoke = (ref: React.MutableRefObject<string>) => {
    if (ref.current) {
      URL.revokeObjectURL(ref.current);
      ref.current = '';
    }
  };

  useEffect(() => () => { revoke(originalUrlRef); revoke(fixedUrlRef); }, []);

  const setFixedFrom = useCallback((patched: Uint8Array) => {
    revoke(fixedUrlRef);
    const url = URL.createObjectURL(new Blob([patched], { type: 'image/png' }));
    fixedUrlRef.current = url;
    setFixedUrl(url);
  }, []);

  const onFile = useCallback((picked: File) => {
    cancelledRef.current = true;
    const reader = new FileReader();
    reader.onload = () => {
      const buffer = new Uint8Array(reader.result as ArrayBuffer);
      const parsed = parsePng(buffer);
      revoke(originalUrlRef);
      revoke(fixedUrlRef);
      setFixedUrl('');
      setResult(null);
      setNotFound(false);
      setProgress(0);
      setWorking(false);
      if (!parsed) {
        setBytes(null);
        setInfo(null);
        setNotPng(true);
        setOriginalUrl('');
        return;
      }
      setNotPng(false);
      setBytes(buffer);
      setFileName(picked.name || 'image.png');
      setInfo(parsed);
      setManualWidth(String(parsed.width));
      setManualHeight(String(parsed.height));
      const url = URL.createObjectURL(new Blob([buffer], { type: 'image/png' }));
      originalUrlRef.current = url;
      setOriginalUrl(url);
    };
    reader.readAsArrayBuffer(picked);
  }, []);

  const startBrute = useCallback(async () => {
    if (!bytes || !info) return;
    cancelledRef.current = false;
    setWorking(true);
    setNotFound(false);
    setResult(null);
    setProgress(0);

    // Region the CRC is computed over: "IHDR" + 13 data bytes. Mutating this
    // standalone copy leaves the original file untouched during the search.
    const region = bytes.slice(12, 29);
    const view = new DataView(region.buffer);
    const target = info.storedCrc;
    const limit = Math.max(1, Math.min(0x7fffffff, Math.floor(maxDim)));
    const total = limit * 2 + (deepScan ? limit * limit : 0);
    let done = 0;

    const yieldNow = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

    let found: BruteResult | null = null;

    // Phase 1: keep the detected width, sweep the height.
    view.setUint32(4, info.width);
    for (let h = 1; h <= limit; h += 1) {
      view.setUint32(8, h);
      if (crc32(region) === target) { found = { width: info.width, height: h }; break; }
      done += 1;
      if ((h & 0x3ff) === 0) {
        if (cancelledRef.current) { setWorking(false); return; }
        setProgress(done / total);
        await yieldNow();
      }
    }

    // Phase 2: keep the detected height, sweep the width.
    if (!found) {
      view.setUint32(8, info.height);
      for (let w = 1; w <= limit; w += 1) {
        view.setUint32(4, w);
        if (crc32(region) === target) { found = { width: w, height: info.height }; break; }
        done += 1;
        if ((w & 0x3ff) === 0) {
          if (cancelledRef.current) { setWorking(false); return; }
          setProgress(done / total);
          await yieldNow();
        }
      }
    }

    // Phase 3 (opt-in): full 2D sweep when a single dimension is not enough.
    if (!found && deepScan) {
      outer: for (let w = 1; w <= limit; w += 1) {
        view.setUint32(4, w);
        for (let h = 1; h <= limit; h += 1) {
          view.setUint32(8, h);
          if (crc32(region) === target) { found = { width: w, height: h }; break outer; }
          done += 1;
          if ((done & 0x3ffff) === 0) {
            if (cancelledRef.current) { setWorking(false); return; }
            setProgress(done / total);
            await yieldNow();
          }
        }
      }
    }

    setProgress(1);
    setWorking(false);
    if (found) {
      setResult(found);
      setManualWidth(String(found.width));
      setManualHeight(String(found.height));
      setFixedFrom(patchDimensions(bytes, found.width, found.height));
    } else {
      setNotFound(true);
    }
  }, [bytes, info, maxDim, deepScan, setFixedFrom]);

  const cancel = useCallback(() => { cancelledRef.current = true; }, []);

  const applyManual = useCallback(() => {
    if (!bytes) return;
    const w = Number.parseInt(manualWidth, 10);
    const h = Number.parseInt(manualHeight, 10);
    if (!Number.isFinite(w) || !Number.isFinite(h) || w < 1 || h < 1) return;
    setResult({ width: w, height: h });
    setNotFound(false);
    setFixedFrom(patchDimensions(bytes, w, h));
  }, [bytes, manualWidth, manualHeight, setFixedFrom]);

  const download = useCallback(() => {
    if (!fixedUrl) return;
    const anchor = document.createElement('a');
    anchor.href = fixedUrl;
    const dot = fileName.lastIndexOf('.');
    const base = dot > 0 ? fileName.slice(0, dot) : fileName;
    anchor.download = `${base}-fixed.png`;
    anchor.click();
  }, [fixedUrl, fileName]);

  const percent = Math.round(progress * 100);

  return (
    <ToolLayout id="png-size-fixer" color="#f472b6">
      <div className="flex flex-col gap-6">
        <Dropzone
          label={t('tools.png-size-fixer.dropLabel')}
          inputLabel={t('tools.png-size-fixer.dropLabel')}
          onFile={onFile}
        />
        {notPng && <p className="text-sm text-red-500 dark:text-red-300">{t('tools.png-size-fixer.notPng')}</p>}

        {info && (
          <>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <span className="text-[var(--color-text-muted)]">{t('tools.png-size-fixer.detected')}</span>
              <span><span className="text-[var(--color-text-muted)]">{t('tools.png-size-fixer.width')}: </span>{info.width}</span>
              <span><span className="text-[var(--color-text-muted)]">{t('tools.png-size-fixer.height')}: </span>{info.height}</span>
              <span className="font-mono"><span className="text-[var(--color-text-muted)]">{t('tools.png-size-fixer.crc')}: </span>0x{info.storedCrc.toString(16).padStart(8, '0')}</span>
              {info.crcValid && <span className="text-emerald-600 dark:text-emerald-400">{t('tools.png-size-fixer.crcValid')}</span>}
            </div>

            <section className="grid gap-5 lg:grid-cols-2">
              {/* Auto brute-force */}
              <div className="flex flex-col gap-3">
                <h2 className="font-semibold">{t('tools.png-size-fixer.autoTitle')}</h2>
                <label className="text-sm text-[var(--color-text-muted)]">
                  {t('tools.png-size-fixer.maxDim')}
                  <GlassInput
                    type="number"
                    min={1}
                    aria-label={t('tools.png-size-fixer.maxDim')}
                    value={maxDim}
                    onChange={(event) => setMaxDim(Math.max(1, Number(event.target.value) || 1))}
                    className="mt-2"
                  />
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="glass-checkbox" checked={deepScan} onChange={(event) => setDeepScan(event.target.checked)} />
                  {t('tools.png-size-fixer.deepScan')}
                </label>
                <div className="flex gap-2">
                  <GlassButton disabled={working} onClick={startBrute}>{t('tools.png-size-fixer.start')}</GlassButton>
                  {working && <GlassButton onClick={cancel}>{t('tools.png-size-fixer.cancel')}</GlassButton>}
                </div>
                {working && (
                  <div className="flex flex-col gap-1">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface)]">
                      <div className="h-full rounded-full transition-[width] duration-150" style={{ width: `${percent}%`, background: '#f472b6' }} />
                    </div>
                    <span className="text-xs text-[var(--color-text-muted)]">{t('tools.png-size-fixer.working', { percent })}</span>
                  </div>
                )}
                {result && <p className="text-sm text-emerald-600 dark:text-emerald-400">{t('tools.png-size-fixer.found', { width: result.width, height: result.height })}</p>}
                {notFound && <p className="text-sm text-red-500 dark:text-red-300">{t('tools.png-size-fixer.notFound')}</p>}
              </div>

              {/* Manual override */}
              <div className="flex flex-col gap-3">
                <h2 className="font-semibold">{t('tools.png-size-fixer.manualTitle')}</h2>
                <p className="text-sm text-[var(--color-text-muted)]">{t('tools.png-size-fixer.manualHint')}</p>
                <div className="flex gap-3">
                  <label className="flex-1 text-sm text-[var(--color-text-muted)]">
                    {t('tools.png-size-fixer.width')}
                    <GlassInput type="number" min={1} aria-label={t('tools.png-size-fixer.width')} value={manualWidth} onChange={(event) => setManualWidth(event.target.value)} className="mt-2" />
                  </label>
                  <label className="flex-1 text-sm text-[var(--color-text-muted)]">
                    {t('tools.png-size-fixer.height')}
                    <GlassInput type="number" min={1} aria-label={t('tools.png-size-fixer.height')} value={manualHeight} onChange={(event) => setManualHeight(event.target.value)} className="mt-2" />
                  </label>
                </div>
                <GlassButton onClick={applyManual}>{t('tools.png-size-fixer.apply')}</GlassButton>
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-2">
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-[var(--color-text-muted)]">{t('tools.png-size-fixer.originalPreview')}</h3>
                {originalUrl && <img src={originalUrl} alt="original" className="max-h-80 w-auto self-start rounded-lg border border-[var(--color-border)]" />}
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-[var(--color-text-muted)]">{t('tools.png-size-fixer.fixedPreview')}</h3>
                {fixedUrl
                  ? <img src={fixedUrl} alt="fixed" className="max-h-80 w-auto self-start rounded-lg border border-[var(--color-border)]" />
                  : <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">—</div>}
                {fixedUrl && <GlassButton className="self-start" onClick={download}>{t('tools.png-size-fixer.download')}</GlassButton>}
              </div>
            </section>
          </>
        )}

        <p className="text-xs text-[var(--color-text-muted)]">{t('tools.png-size-fixer.hint')}</p>
      </div>
    </ToolLayout>
  );
});

export default PngSizeFixerTool;
