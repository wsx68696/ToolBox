import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import Dropzone from '../components/Dropzone';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

function rotateLeft(value: number, shift: number) { return (value << shift) | (value >>> (32 - shift)); }
function md5(input: Uint8Array) {
  const s = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21];
  const k = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32));
  const bitLen = input.length * 8;
  const padded = new Uint8Array((((input.length + 8) >> 6) + 1) * 64);
  padded.set(input);
  padded[input.length] = 0x80;
  new DataView(padded.buffer).setUint32(padded.length - 8, bitLen, true);
  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
  for (let i = 0; i < padded.length; i += 64) {
    const view = new DataView(padded.buffer, i, 64);
    let a = a0, b = b0, c = c0, d = d0;
    for (let j = 0; j < 64; j += 1) {
      let f = 0, g = 0;
      if (j < 16) { f = (b & c) | (~b & d); g = j; }
      else if (j < 32) { f = (d & b) | (~d & c); g = (5 * j + 1) % 16; }
      else if (j < 48) { f = b ^ c ^ d; g = (3 * j + 5) % 16; }
      else { f = c ^ (b | ~d); g = (7 * j) % 16; }
      const temp = d;
      d = c; c = b;
      b = (b + rotateLeft((a + f + k[j] + view.getUint32(g * 4, true)) >>> 0, s[j])) >>> 0;
      a = temp;
    }
    a0 = (a0 + a) >>> 0; b0 = (b0 + b) >>> 0; c0 = (c0 + c) >>> 0; d0 = (d0 + d) >>> 0;
  }
  return [a0, b0, c0, d0].map((n) => n.toString(16).padStart(8, '0').match(/../g)?.reverse().join('') ?? '').join('');
}

async function sha(bytes: Uint8Array, algorithm: AlgorithmIdentifier) {
  const digest = await crypto.subtle.digest(algorithm, bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

const HashTool = memo(function HashTool() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [fileHashes, setFileHashes] = useState<Record<string, string>>({});
  const textBytes = useMemo(() => new TextEncoder().encode(input), [input]);
  const [shaHashes, setShaHashes] = useState<Record<string, string>>({});

  useMemo(() => {
    void Promise.all([sha(textBytes, 'SHA-1'), sha(textBytes, 'SHA-256'), sha(textBytes, 'SHA-512')]).then(([sha1, sha256, sha512]) => setShaHashes({ sha1, sha256, sha512 }));
  }, [textBytes]);

  const values = { md5: md5(textBytes), ...shaHashes };
  const hashFile = async (file: File) => {
    const bytes = new Uint8Array(await file.arrayBuffer());
    setFileHashes({ md5: md5(bytes), sha1: await sha(bytes, 'SHA-1'), sha256: await sha(bytes, 'SHA-256'), sha512: await sha(bytes, 'SHA-512') });
  };

  return (
    <ToolLayout id="hash" color="#22d3ee">
      <GlassInput multiline aria-label={t('tools.hash.inputPlaceholder')} rows={7} value={input} onChange={(event) => setInput(event.target.value)} placeholder={t('tools.hash.inputPlaceholder')} />
      <HashList values={values} />
      <Dropzone className="mt-5" label={t('tools.hash.dropzone')} inputLabel={t('tools.hash.uploadLabel')} onFile={(file) => void hashFile(file)} />
      {Object.keys(fileHashes).length > 0 && (
        <div className="mt-5">
          <h2 className="mb-3 font-semibold">{t('tools.hash.fileHashes')}</h2>
          <HashList values={fileHashes} />
        </div>
      )}
    </ToolLayout>
  );
});

function HashList({ values }: { values: Record<string, string> }) {
  return (
    <div className="mt-4 grid gap-3">
      {Object.entries(values).map(([key, value]) => (
        <div key={key} className="glass-input p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold uppercase text-cyan-600 dark:text-cyan-200">{key}</span>
            <CopyButton value={value} />
          </div>
          <div className="mono-panel text-sm">{value}</div>
        </div>
      ))}
    </div>
  );
}

export default HashTool;
