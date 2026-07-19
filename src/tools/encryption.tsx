import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const ITERATIONS = 100_000;

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function base64ToBytes(input: string): Uint8Array {
  const binary = atob(input.trim());
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

async function encryptText(plain: string, passphrase: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(passphrase, salt);
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(plain)));
  const packed = new Uint8Array(SALT_LENGTH + IV_LENGTH + cipher.length);
  packed.set(salt, 0);
  packed.set(iv, SALT_LENGTH);
  packed.set(cipher, SALT_LENGTH + IV_LENGTH);
  return bytesToBase64(packed);
}

async function decryptText(encoded: string, passphrase: string): Promise<string> {
  const packed = base64ToBytes(encoded);
  if (packed.length <= SALT_LENGTH + IV_LENGTH) throw new Error('too short');
  const salt = packed.slice(0, SALT_LENGTH);
  const iv = packed.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const data = packed.slice(SALT_LENGTH + IV_LENGTH);
  const key = await deriveKey(passphrase, salt);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  return new TextDecoder().decode(plain);
}

const EncryptionTool = memo(function EncryptionTool() {
  const { t } = useTranslation();
  const [passphrase, setPassphrase] = useState('');
  const [plain, setPlain] = useState('Hello Toolbox');
  const [cipher, setCipher] = useState('');
  const [error, setError] = useState<'encrypt' | 'decrypt' | null>(null);
  const [busy, setBusy] = useState(false);

  const runEncrypt = async () => {
    setBusy(true);
    try { setCipher(await encryptText(plain, passphrase)); setError(null); }
    catch { setError('encrypt'); }
    finally { setBusy(false); }
  };

  const runDecrypt = async () => {
    setBusy(true);
    try { setPlain(await decryptText(cipher, passphrase)); setError(null); }
    catch { setError('decrypt'); }
    finally { setBusy(false); }
  };

  return (
    <ToolLayout id="encryption" color="#818cf8">
      <div className="mb-5 max-w-md">
        <label className="mb-2 block font-semibold" htmlFor="encryption-passphrase">{t('tools.encryption.passphrase')}</label>
        <GlassInput
          id="encryption-passphrase"
          type="password"
          value={passphrase}
          onChange={(event) => setPassphrase(event.target.value)}
          placeholder={t('tools.encryption.passphrasePlaceholder')}
        />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">{t('tools.encryption.plaintext')}</h2>
            <CopyButton value={plain} />
          </div>
          <GlassInput multiline aria-label={t('tools.encryption.plaintext')} rows={10} value={plain} onChange={(event) => setPlain(event.target.value)} placeholder={t('tools.encryption.plainPlaceholder')} />
          <GlassButton className="mt-3" disabled={busy || !plain} onClick={() => void runEncrypt()}>{t('tools.encryption.encrypt')} →</GlassButton>
          {error === 'encrypt' && <p className="mt-2 text-sm text-red-500 dark:text-red-300">{t('tools.encryption.encryptError')}</p>}
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">{t('tools.encryption.ciphertext')}</h2>
            <CopyButton value={cipher} />
          </div>
          <GlassInput multiline aria-label={t('tools.encryption.ciphertext')} rows={10} value={cipher} onChange={(event) => setCipher(event.target.value)} placeholder={t('tools.encryption.cipherPlaceholder')} />
          <GlassButton className="mt-3" disabled={busy || !cipher} onClick={() => void runDecrypt()}>← {t('tools.encryption.decrypt')}</GlassButton>
          {error === 'decrypt' && <p className="mt-2 text-sm text-red-500 dark:text-red-300">{t('tools.encryption.decryptError')}</p>}
        </div>
      </div>
      <p className="mt-4 text-xs text-[var(--color-text-muted)]">{t('tools.encryption.hint')}</p>
    </ToolLayout>
  );
});

export default EncryptionTool;
