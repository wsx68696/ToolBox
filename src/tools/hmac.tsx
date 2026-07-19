import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

const algorithms = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const;
type Algorithm = (typeof algorithms)[number];

async function hmac(message: string, secret: string, algorithm: Algorithm): Promise<{ hex: string; base64: string }> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: algorithm }, false, ['sign']);
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(message)));
  const hex = Array.from(signature, (byte) => byte.toString(16).padStart(2, '0')).join('');
  let binary = '';
  signature.forEach((byte) => { binary += String.fromCharCode(byte); });
  return { hex, base64: btoa(binary) };
}

const HmacTool = memo(function HmacTool() {
  const { t } = useTranslation();
  const [message, setMessage] = useState('The quick brown fox jumps over the lazy dog');
  const [secret, setSecret] = useState('key');
  const [algorithm, setAlgorithm] = useState<Algorithm>('SHA-256');
  const [result, setResult] = useState<{ hex: string; base64: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!secret) { setResult(null); return; }
    void hmac(message, secret, algorithm).then((value) => { if (!cancelled) setResult(value); });
    return () => { cancelled = true; };
  }, [message, secret, algorithm]);

  return (
    <ToolLayout id="hmac" color="#22d3ee">
      <div className="mb-4 flex flex-wrap gap-2">
        {algorithms.map((algo) => (
          <GlassButton key={algo} aria-label={algo} onClick={() => setAlgorithm(algo)} className={algorithm === algo ? 'border-cyan-300/40 bg-cyan-300/10' : ''}>{algo}</GlassButton>
        ))}
      </div>
      <div className="grid gap-4">
        <label className="text-sm text-[var(--color-text-muted)]">
          {t('tools.hmac.message')}
          <GlassInput multiline aria-label={t('tools.hmac.message')} className="mt-2" rows={5} value={message} onChange={(event) => setMessage(event.target.value)} placeholder={t('tools.hmac.message')} />
        </label>
        <label className="text-sm text-[var(--color-text-muted)]">
          {t('tools.hmac.secret')}
          <GlassInput aria-label={t('tools.hmac.secret')} className="mt-2" value={secret} onChange={(event) => setSecret(event.target.value)} placeholder={t('tools.hmac.secret')} autoComplete="off" />
        </label>
      </div>
      {!secret && <p className="mt-3 text-sm text-[var(--color-text-muted)]">{t('tools.hmac.emptySecret')}</p>}
      {result && (
        <div className="mt-5 grid gap-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Hex</h2>
              <CopyButton value={result.hex} />
            </div>
            <div className="glass-input mono-panel p-3 text-sm">{result.hex}</div>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Base64</h2>
              <CopyButton value={result.base64} />
            </div>
            <div className="glass-input mono-panel p-3 text-sm">{result.base64}</div>
          </div>
        </div>
      )}
    </ToolLayout>
  );
});

export default HmacTool;
