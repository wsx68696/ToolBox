import { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Decode(input: string): Uint8Array | null {
  const clean = input.toUpperCase().replace(/[\s=-]/g, '');
  if (!clean || [...clean].some((ch) => !BASE32.includes(ch))) return null;
  let bits = 0;
  let buffer = 0;
  const bytes: number[] = [];
  for (const ch of clean) {
    buffer = (buffer << 5) | BASE32.indexOf(ch);
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }
  return new Uint8Array(bytes);
}

function base32Encode(bytes: Uint8Array): string {
  let bits = 0;
  let buffer = 0;
  let output = '';
  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      output += BASE32[(buffer >> bits) & 31];
    }
  }
  if (bits > 0) output += BASE32[(buffer << (5 - bits)) & 31];
  return output;
}

async function totp(secret: Uint8Array, counter: number): Promise<string> {
  const key = await crypto.subtle.importKey('raw', secret.buffer as ArrayBuffer, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
  const message = new ArrayBuffer(8);
  new DataView(message).setBigUint64(0, BigInt(counter));
  const digest = new Uint8Array(await crypto.subtle.sign('HMAC', key, message));
  const offset = digest[digest.length - 1] & 0xf;
  const code = (((digest[offset] & 0x7f) << 24) | (digest[offset + 1] << 16) | (digest[offset + 2] << 8) | digest[offset + 3]) % 1_000_000;
  return String(code).padStart(6, '0');
}

const PERIOD = 30;

const TotpTool = memo(function TotpTool() {
  const { t } = useTranslation();
  const [secret, setSecret] = useState('JBSWY3DPEHPK3PXP');
  const [codes, setCodes] = useState<{ prev: string; current: string; next: string } | null>(null);
  const [remaining, setRemaining] = useState(PERIOD);
  const [error, setError] = useState(false);

  const randomSecret = useCallback(() => {
    const bytes = crypto.getRandomValues(new Uint8Array(20));
    setSecret(base32Encode(bytes));
  }, []);

  useEffect(() => {
    let cancelled = false;
    let lastCounter = -1;

    const tick = async () => {
      const now = Date.now();
      setRemaining(PERIOD - Math.floor((now / 1000) % PERIOD));
      const counter = Math.floor(now / 1000 / PERIOD);
      const bytes = base32Decode(secret);
      if (!bytes || bytes.length === 0) {
        if (!cancelled) { setError(true); setCodes(null); }
        return;
      }
      if (counter === lastCounter) return;
      lastCounter = counter;
      try {
        const [prev, current, next] = await Promise.all([totp(bytes, counter - 1), totp(bytes, counter), totp(bytes, counter + 1)]);
        if (!cancelled) { setError(false); setCodes({ prev, current, next }); }
      } catch {
        if (!cancelled) { setError(true); setCodes(null); }
      }
    };

    void tick();
    const interval = window.setInterval(() => void tick(), 500);
    return () => { cancelled = true; window.clearInterval(interval); };
  }, [secret]);

  const otpauth = `otpauth://totp/Toolbox:demo?secret=${secret.replace(/\s/g, '')}&issuer=Toolbox&algorithm=SHA1&digits=6&period=30`;

  return (
    <ToolLayout id="totp" color="#f472b6">
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-64 flex-1 text-sm text-[var(--color-text-muted)]">
          {t('tools.totp.secret')}
          <GlassInput aria-label={t('tools.totp.secret')} className={`mt-2 ${error ? 'border-red-400/60' : ''}`} value={secret} onChange={(event) => setSecret(event.target.value)} placeholder="JBSWY3DPEHPK3PXP" autoComplete="off" />
        </label>
        <GlassButton aria-label={t('tools.totp.random')} onClick={randomSecret}>{t('tools.totp.random')}</GlassButton>
      </div>
      {error && <p className="mt-3 text-sm text-red-500 dark:text-red-300">{t('tools.totp.invalid')}</p>}
      {codes && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <CodeCard label={t('tools.totp.previous')} code={codes.prev} muted />
            <CodeCard label={t('tools.totp.current')} code={codes.current} />
            <CodeCard label={t('tools.totp.next')} code={codes.next} muted />
          </div>
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-[var(--color-text-muted)]">
              <span>{t('tools.totp.expiresIn')}</span>
              <span>{remaining}s</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--color-surface-active)]">
              <div className="h-full rounded-full bg-pink-500 transition-all dark:bg-pink-300" style={{ width: `${(remaining / PERIOD) * 100}%` }} />
            </div>
          </div>
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold">otpauth URL</h2>
              <CopyButton value={otpauth} />
            </div>
            <div className="glass-input mono-panel p-3 text-xs">{otpauth}</div>
          </div>
        </>
      )}
    </ToolLayout>
  );
});

function CodeCard({ label, code, muted = false }: { label: string; code: string; muted?: boolean }) {
  return (
    <div className={`glass-input p-4 text-center ${muted ? 'opacity-60' : ''}`}>
      <div className="mb-1 text-xs uppercase tracking-wider text-[var(--color-text-muted)]">{label}</div>
      <div className="flex items-center justify-center gap-2">
        <span className="font-mono text-2xl font-semibold tracking-widest">{code}</span>
        {!muted && <CopyButton value={code} />}
      </div>
    </div>
  );
}

export default TotpTool;
