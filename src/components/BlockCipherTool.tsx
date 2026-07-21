import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CryptoJS from 'crypto-js';
import CopyButton from './CopyButton';
import GlassInput from './GlassInput';
import ToolLayout from './ToolLayout';
import type { ToolId } from '../data/tools';

const MODES = ['CBC', 'CFB', 'OFB', 'CTR', 'ECB'] as const;
const PADDINGS = ['Pkcs7', 'ZeroPadding', 'AnsiX923', 'Iso10126', 'Iso97971', 'NoPadding'] as const;
const ENCODINGS = ['Base64', 'Hex'] as const;

type Mode = (typeof MODES)[number];
type Padding = (typeof PADDINGS)[number];
type Encoding = (typeof ENCODINGS)[number];

interface BlockCipherToolProps {
  id: ToolId;
  color: string;
  algorithm: 'DES' | 'TripleDES';
  keyBytes: number[];
}

const BlockCipherTool = memo(function BlockCipherTool({ id, color, algorithm, keyBytes }: BlockCipherToolProps) {
  const { t } = useTranslation();
  const raw = t as unknown as (key: string) => string;
  const tk = (key: string) => raw(`tools.${id}.${key}`);

  const [method, setMethod] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [key, setKey] = useState('');
  const [iv, setIv] = useState('');
  const [mode, setMode] = useState<Mode>('CBC');
  const [padding, setPadding] = useState<Padding>('Pkcs7');
  const [encoding, setEncoding] = useState<Encoding>('Base64');
  const [input, setInput] = useState('');

  const cipher = algorithm === 'DES' ? CryptoJS.DES : CryptoJS.TripleDES;

  const { output, error } = useMemo(() => {
    if (!key || !input) return { output: '', error: '' };
    const keyWa = CryptoJS.enc.Utf8.parse(key);
    if (!keyBytes.includes(keyWa.sigBytes)) return { output: '', error: tk('keyError') };
    if (mode !== 'ECB' && CryptoJS.enc.Utf8.parse(iv).sigBytes !== 8) return { output: '', error: tk('ivError') };

    const cfg = {
      iv: mode !== 'ECB' ? CryptoJS.enc.Utf8.parse(iv) : undefined,
      mode: CryptoJS.mode[mode],
      padding: CryptoJS.pad[padding],
    };

    try {
      if (method === 'encrypt') {
        const encrypted = cipher.encrypt(CryptoJS.enc.Utf8.parse(input), keyWa, cfg);
        return { output: encoding === 'Base64' ? encrypted.toString() : encrypted.ciphertext.toString(), error: '' };
      }
      const ciphertext = encoding === 'Base64' ? CryptoJS.enc.Base64.parse(input) : CryptoJS.enc.Hex.parse(input);
      const decrypted = cipher.decrypt(CryptoJS.lib.CipherParams.create({ ciphertext }), keyWa, cfg);
      const text = decrypted.toString(CryptoJS.enc.Utf8);
      if (!text) return { output: '', error: tk('decryptError') };
      return { output: text, error: '' };
    } catch {
      return { output: '', error: method === 'encrypt' ? tk('encryptError') : tk('decryptError') };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, iv, input, mode, padding, encoding, method, algorithm]);

  return (
    <ToolLayout id={id} color={color}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-3">
          <label className="text-sm text-[var(--color-text-muted)]">
            {tk('method')}
            <select className="glass-select mt-1 block" value={method} onChange={(e) => setMethod(e.target.value as 'encrypt' | 'decrypt')}>
              <option value="encrypt">{tk('encrypt')}</option>
              <option value="decrypt">{tk('decrypt')}</option>
            </select>
          </label>
          <label className="text-sm text-[var(--color-text-muted)]">
            {tk('mode')}
            <select className="glass-select mt-1 block" value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
              {MODES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
          <label className="text-sm text-[var(--color-text-muted)]">
            {tk('padding')}
            <select className="glass-select mt-1 block" value={padding} onChange={(e) => setPadding(e.target.value as Padding)}>
              {PADDINGS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          <label className="text-sm text-[var(--color-text-muted)]">
            {tk('encoding')}
            <select className="glass-select mt-1 block" value={encoding} onChange={(e) => setEncoding(e.target.value as Encoding)}>
              {ENCODINGS.map((en) => <option key={en} value={en}>{en}</option>)}
            </select>
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm text-[var(--color-text-muted)]">
            {tk('key')} <span className="opacity-70">({keyBytes.join('/')} {tk('bytes')})</span>
            <GlassInput aria-label={tk('key')} value={key} onChange={(e) => setKey(e.target.value)} className="mt-1 font-mono" />
          </label>
          <label className="text-sm text-[var(--color-text-muted)]">
            {tk('iv')} <span className="opacity-70">(8 {tk('bytes')})</span>
            <GlassInput aria-label={tk('iv')} value={iv} disabled={mode === 'ECB'} onChange={(e) => setIv(e.target.value)} className="mt-1 font-mono" />
          </label>
        </div>
        <div>
          <h2 className="mb-2 font-semibold">{method === 'encrypt' ? tk('plaintext') : tk('ciphertext')}</h2>
          <GlassInput multiline aria-label="input" rows={6} className="font-mono" value={input} onChange={(e) => setInput(e.target.value)} placeholder={tk('inputPlaceholder')} />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">{method === 'encrypt' ? tk('ciphertext') : tk('plaintext')}</h2>
            <CopyButton value={output} />
          </div>
          <GlassInput multiline readOnly aria-label="output" rows={6} className={`font-mono break-all ${error ? 'border-red-400/60' : ''}`} value={error ? '' : output} onChange={() => {}} />
          {error && <p className="mt-2 text-sm text-red-500 dark:text-red-300">{error}</p>}
        </div>
        <p className="text-xs text-[var(--color-text-muted)]">{tk('hint')}</p>
      </div>
    </ToolLayout>
  );
});

export default BlockCipherTool;
