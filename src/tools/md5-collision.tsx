import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CryptoJS from 'crypto-js';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';
import { loadEmscriptenModule } from '../lib/emscripten';

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function md5OfBytes(bytes: Uint8Array): string {
  // crypto-js WordArray from raw bytes
  const words: number[] = [];
  for (let i = 0; i < bytes.length; i += 1) {
    words[i >>> 2] |= bytes[i] << (24 - (i % 4) * 8);
  }
  const wa = CryptoJS.lib.WordArray.create(words, bytes.length);
  return CryptoJS.MD5(wa).toString();
}

const Md5CollisionTool = memo(function Md5CollisionTool() {
  const { t } = useTranslation();
  const [prefix, setPrefix] = useState('');
  const [dst1, setDst1] = useState('');
  const [dst2, setDst2] = useState('');
  const [md5, setMd5] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const run = async () => {
    setBusy(true);
    setError('');
    setDst1('');
    setDst2('');
    setMd5('');
    setStatus(t('tools.md5-collision.loading'));
    try {
      const mod = await loadEmscriptenModule('/wasm/fastcoll.js');
      setStatus(t('tools.md5-collision.working'));
      // Yield so the UI can paint the "working" state before the blocking ccall.
      await new Promise((r) => setTimeout(r, 30));

      const arr = new TextEncoder().encode(prefix);
      const padLen = arr.length % 64 === 0 ? 0 : 64 - (arr.length % 64);
      const padding = new Uint8Array(padLen);

      const ptr = mod.ccall('collision', 'number', ['array', 'number'], [arr, arr.byteLength]) as number;
      if (typeof ptr !== 'number' || ptr <= 0) throw new Error(t('tools.md5-collision.error'));

      const dst1arr = new Uint8Array(arr.length + padding.length + 128);
      const dst2arr = new Uint8Array(arr.length + padding.length + 128);
      dst1arr.set(arr, 0);
      dst2arr.set(arr, 0);
      dst1arr.set(padding, arr.length);
      dst2arr.set(padding, arr.length);
      dst1arr.set(mod.HEAPU8.subarray(ptr, ptr + 128), arr.length + padding.length);
      dst2arr.set(mod.HEAPU8.subarray(ptr + 128, ptr + 256), arr.length + padding.length);

      setDst1(bytesToHex(dst1arr));
      setDst2(bytesToHex(dst2arr));
      setMd5(md5OfBytes(dst1arr));
      setStatus(t('tools.md5-collision.done'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('tools.md5-collision.error'));
      setStatus('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolLayout id="md5-collision" color="#f87171">
      <div className="flex flex-col gap-4">
        <label className="text-sm text-[var(--color-text-muted)]">
          {t('tools.md5-collision.prefix')}
          <GlassInput
            multiline
            rows={4}
            className="mt-1 font-mono text-sm"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            placeholder={t('tools.md5-collision.prefixPlaceholder')}
          />
        </label>
        <GlassButton disabled={busy} onClick={() => void run()}>
          {busy ? t('tools.md5-collision.working') : t('tools.md5-collision.start')}
        </GlassButton>
        {status && <p className="text-sm text-[var(--color-text-muted)]">{status}</p>}
        {error && <p className="text-sm text-red-500 dark:text-red-300">{error}</p>}
        {dst1 && (
          <>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-semibold">{t('tools.md5-collision.msg1')}</h2>
                <CopyButton value={dst1} />
              </div>
              <GlassInput multiline readOnly rows={4} className="font-mono text-xs break-all" value={dst1} onChange={() => {}} />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-semibold">{t('tools.md5-collision.msg2')}</h2>
                <CopyButton value={dst2} />
              </div>
              <GlassInput multiline readOnly rows={4} className="font-mono text-xs break-all" value={dst2} onChange={() => {}} />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-semibold">{t('tools.md5-collision.hash')}</h2>
                <CopyButton value={md5} />
              </div>
              <GlassInput readOnly className="font-mono" value={md5} onChange={() => {}} />
            </div>
          </>
        )}
        <p className="text-xs text-[var(--color-text-muted)]">{t('tools.md5-collision.hint')}</p>
      </div>
    </ToolLayout>
  );
});

export default Md5CollisionTool;
