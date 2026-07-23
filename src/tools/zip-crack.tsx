import { memo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dropzone from '../components/Dropzone';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

// Pure-JS ZIP password cracker for traditional ZipCrypto (store/deflate).
// Uses a progressive brute-force over a user alphabet + optional dictionary.

function crcTable(): Uint32Array {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
}
const CRC = crcTable();
const crc32byte = (crc: number, b: number) => (CRC[(crc ^ b) & 0xff] ^ (crc >>> 8)) >>> 0;

class ZipCrypto {
  private keys = new Uint32Array([0x12345678, 0x23456789, 0x34567890]);
  constructor(password: string) {
    for (let i = 0; i < password.length; i += 1) this.updateKeys(password.charCodeAt(i) & 0xff);
  }
  private updateKeys(b: number) {
    this.keys[0] = crc32byte(this.keys[0], b);
    this.keys[1] = (Math.imul(this.keys[1] + (this.keys[0] & 0xff), 134775813) + 1) >>> 0;
    this.keys[2] = crc32byte(this.keys[2], this.keys[1] >>> 24);
  }
  decrypt(data: Uint8Array): Uint8Array {
    const out = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i += 1) {
      const tmp = (this.keys[2] | 2) >>> 0;
      const c = data[i] ^ ((Math.imul(tmp, tmp ^ 1) >>> 8) & 0xff);
      out[i] = c;
      this.updateKeys(c);
    }
    return out;
  }
}

interface EncryptedEntry {
  name: string;
  method: number;
  flag: number;
  time: number;
  date: number;
  crc: number;
  compSize: number;
  uncompSize: number;
  data: Uint8Array;
}

function parseZip(buf: Uint8Array): EncryptedEntry | null {
  // Find first local file header that is encrypted.
  let offset = 0;
  while (offset + 30 < buf.length) {
    if (buf[offset] !== 0x50 || buf[offset + 1] !== 0x4b || buf[offset + 2] !== 0x03 || buf[offset + 3] !== 0x04) {
      // try scan next
      offset += 1;
      continue;
    }
    const view = new DataView(buf.buffer, buf.byteOffset + offset, buf.byteLength - offset);
    const flag = view.getUint16(6, true);
    const method = view.getUint16(8, true);
    const time = view.getUint16(10, true);
    const date = view.getUint16(12, true);
    const crc = view.getUint32(14, true);
    const compSize = view.getUint32(18, true);
    const uncompSize = view.getUint32(22, true);
    const nameLen = view.getUint16(26, true);
    const extraLen = view.getUint16(28, true);
    const nameBytes = buf.slice(offset + 30, offset + 30 + nameLen);
    const name = new TextDecoder().decode(nameBytes);
    const dataStart = offset + 30 + nameLen + extraLen;
    const data = buf.slice(dataStart, dataStart + compSize);
    if (flag & 0x1) {
      return { name, method, flag, time, date, crc, compSize, uncompSize, data };
    }
    offset = dataStart + compSize;
  }
  return null;
}

function checkPassword(entry: EncryptedEntry, password: string): boolean {
  if (entry.data.length < 12) return false;
  const crypto = new ZipCrypto(password);
  const decrypted = crypto.decrypt(entry.data.slice(0, 12));
  // Traditional PKZIP: last byte of 12-byte header equals high byte of CRC, or high byte of dos time when bit 3 of flag is set.
  const check = (entry.flag & 0x8) ? (entry.time >>> 8) & 0xff : (entry.crc >>> 24) & 0xff;
  return decrypted[11] === check;
}

async function* bruteForce(alphabet: string, maxLen: number, dict: string[]): AsyncGenerator<{ password: string; tried: number }, string | null> {
  let tried = 0;
  for (const word of dict) {
    tried += 1;
    yield { password: word, tried };
  }
  const chars = Array.from(new Set(alphabet.split('')));
  if (chars.length === 0) return null;
  for (let len = 1; len <= maxLen; len += 1) {
    const idx = new Array(len).fill(0);
    while (true) {
      const password = idx.map((i) => chars[i]).join('');
      tried += 1;
      yield { password, tried };
      let k = len - 1;
      while (k >= 0) {
        idx[k] += 1;
        if (idx[k] < chars.length) break;
        idx[k] = 0;
        k -= 1;
      }
      if (k < 0) break;
    }
  }
  return null;
}

const ZipCrackTool = memo(function ZipCrackTool() {
  const { t } = useTranslation();
  const [fileName, setFileName] = useState('');
  const [entry, setEntry] = useState<EncryptedEntry | null>(null);
  const [alphabet, setAlphabet] = useState('0123456789');
  const [maxLen, setMaxLen] = useState(4);
  const [dictText, setDictText] = useState('123456\npassword\nadmin\n12345678\nqwerty');
  const [status, setStatus] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const cancelRef = useRef(false);

  const onFile = async (file: File) => {
    setFileName(file.name);
    setResult('');
    setError('');
    const buf = new Uint8Array(await file.arrayBuffer());
    const e = parseZip(buf);
    if (!e) {
      setEntry(null);
      setError(t('tools.zip-crack.noEncrypted'));
      return;
    }
    setEntry(e);
    setStatus(t('tools.zip-crack.loaded', { name: e.name, method: e.method }));
  };

  const start = async () => {
    if (!entry) return;
    setBusy(true);
    cancelRef.current = false;
    setResult('');
    setError('');
    const dict = dictText.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    let found: string | null = null;
    let lastReport = 0;
    let stopped = false;
    for await (const step of bruteForce(alphabet, maxLen, dict)) {
      if (!step) break;
      if (cancelRef.current) { setStatus(t('tools.zip-crack.cancelled')); stopped = true; break; }
      if (checkPassword(entry, step.password)) { found = step.password; break; }
      if (step.tried - lastReport >= 500) {
        lastReport = step.tried;
        setStatus(t('tools.zip-crack.progress', { tried: step.tried, current: step.password }));
        await new Promise((r) => setTimeout(r, 0));
      }
    }
    if (found) {
      setResult(found);
      setStatus(t('tools.zip-crack.found', { password: found }));
    } else if (!stopped) {
      setError(t('tools.zip-crack.notFound'));
      setStatus('');
    }
    setBusy(false);
  };

  return (
    <ToolLayout id="zip-crack" color="#f87171">
      <div className="flex flex-col gap-4">
        <Dropzone label={t('tools.zip-crack.dropLabel')} inputLabel={t('tools.zip-crack.dropLabel')} onFile={(f) => void onFile(f)} />
        {fileName && <p className="text-sm text-[var(--color-text-muted)]">{fileName}{entry ? ` · ${entry.name}` : ''}</p>}
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm text-[var(--color-text-muted)]">
            {t('tools.zip-crack.alphabet')}
            <GlassInput className="mt-1 font-mono" value={alphabet} onChange={(e) => setAlphabet(e.target.value)} />
          </label>
          <label className="text-sm text-[var(--color-text-muted)]">
            {t('tools.zip-crack.maxLen')}
            <GlassInput type="number" min={1} max={8} className="mt-1" value={maxLen} onChange={(e) => setMaxLen(Math.max(1, Math.min(8, Number(e.target.value) || 1)))} />
          </label>
        </div>
        <label className="text-sm text-[var(--color-text-muted)]">
          {t('tools.zip-crack.dict')}
          <GlassInput multiline rows={5} className="mt-1 font-mono text-sm" value={dictText} onChange={(e) => setDictText(e.target.value)} />
        </label>
        <div className="flex gap-2">
          <GlassButton disabled={!entry || busy} onClick={() => void start()}>{busy ? t('tools.zip-crack.working') : t('tools.zip-crack.start')}</GlassButton>
          {busy && <GlassButton onClick={() => { cancelRef.current = true; }}>{t('tools.zip-crack.cancel')}</GlassButton>}
        </div>
        {status && <p className="text-sm text-[var(--color-text-muted)]">{status}</p>}
        {result && <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{t('tools.zip-crack.found', { password: result })}</p>}
        {error && <p className="text-sm text-red-500 dark:text-red-300">{error}</p>}
        <p className="text-xs text-[var(--color-text-muted)]">{t('tools.zip-crack.hint')}</p>
      </div>
    </ToolLayout>
  );
});

export default ZipCrackTool;
