import { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import ToolLayout from '../components/ToolLayout';

function toPem(buffer: ArrayBuffer, label: string): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  const base64 = btoa(binary);
  const lines = base64.match(/.{1,64}/g) ?? [];
  return `-----BEGIN ${label}-----\n${lines.join('\n')}\n-----END ${label}-----`;
}

async function generatePair(bits: number): Promise<{ publicPem: string; privatePem: string }> {
  const pair = await crypto.subtle.generateKey(
    { name: 'RSA-OAEP', modulusLength: bits, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    true,
    ['encrypt', 'decrypt'],
  );
  const [publicKey, privateKey] = await Promise.all([
    crypto.subtle.exportKey('spki', pair.publicKey),
    crypto.subtle.exportKey('pkcs8', pair.privateKey),
  ]);
  return { publicPem: toPem(publicKey, 'PUBLIC KEY'), privatePem: toPem(privateKey, 'PRIVATE KEY') };
}

const sizes = [2048, 3072, 4096];

const RsaKeyTool = memo(function RsaKeyTool() {
  const { t } = useTranslation();
  const [bits, setBits] = useState(2048);
  const [keys, setKeys] = useState<{ publicPem: string; privatePem: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const generate = useCallback((size: number) => {
    setBusy(true);
    void generatePair(size).then((pair) => { setKeys(pair); setBusy(false); });
  }, []);

  useEffect(() => { generate(2048); }, [generate]);

  return (
    <ToolLayout id="rsa-key" color="#fbbf24">
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {sizes.map((size) => (
          <GlassButton key={size} aria-label={`${size} bit`} onClick={() => setBits(size)} className={bits === size ? 'border-amber-300/40 bg-amber-300/10' : ''}>{size} bit</GlassButton>
        ))}
        <GlassButton aria-label={t('tools.rsa-key.generate')} onClick={() => generate(bits)} disabled={busy}>
          {busy ? t('tools.rsa-key.generating') : t('tools.rsa-key.generate')}
        </GlassButton>
      </div>
      {keys && (
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold">{t('tools.rsa-key.publicKey')}</h2>
              <CopyButton value={keys.publicPem} />
            </div>
            <div className="glass-input mono-panel max-h-96 overflow-auto p-4 text-xs">{keys.publicPem}</div>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold">{t('tools.rsa-key.privateKey')}</h2>
              <CopyButton value={keys.privatePem} />
            </div>
            <div className="glass-input mono-panel max-h-96 overflow-auto p-4 text-xs">{keys.privatePem}</div>
          </div>
        </div>
      )}
      <p className="mt-4 text-xs text-[var(--color-text-muted)]">{t('tools.rsa-key.hint')}</p>
    </ToolLayout>
  );
});

export default RsaKeyTool;
