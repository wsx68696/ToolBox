import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import bcrypt from 'bcryptjs';
import apacheMd5 from 'apache-md5';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

type Method = 'bcrypt' | 'apr1' | 'sha' | 'plain';

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function sha1Base64(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(text));
  return bytesToBase64(new Uint8Array(digest));
}

const HtpasswdTool = memo(function HtpasswdTool() {
  const { t } = useTranslation();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [method, setMethod] = useState<Method>('bcrypt');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const generate = async () => {
    if (!username.trim()) { setError(t('tools.htpasswd.userRequired')); return; }
    if (!password) { setError(t('tools.htpasswd.passRequired')); return; }
    setBusy(true);
    setError('');
    try {
      let hash = '';
      if (method === 'bcrypt') {
        hash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
      } else if (method === 'apr1') {
        hash = apacheMd5(password);
      } else if (method === 'sha') {
        hash = `{SHA}${await sha1Base64(password)}`;
      } else {
        hash = password;
      }
      setResult(`${username.trim()}:${hash}`);
    } catch {
      setError(t('tools.htpasswd.error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolLayout id="htpasswd" color="#f472b6">
      <div className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm text-[var(--color-text-muted)]">
            {t('tools.htpasswd.username')}
            <GlassInput aria-label={t('tools.htpasswd.username')} value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1" />
          </label>
          <label className="text-sm text-[var(--color-text-muted)]">
            {t('tools.htpasswd.password')}
            <GlassInput type="password" aria-label={t('tools.htpasswd.password')} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" />
          </label>
        </div>
        <label className="text-sm text-[var(--color-text-muted)]">
          {t('tools.htpasswd.method')}
          <select className="glass-select mt-1 block" value={method} onChange={(e) => setMethod(e.target.value as Method)}>
            <option value="bcrypt">bcrypt</option>
            <option value="apr1">apr1 (MD5)</option>
            <option value="sha">SHA-1</option>
            <option value="plain">plain</option>
          </select>
        </label>
        <GlassButton disabled={busy} onClick={generate}>{busy ? t('tools.htpasswd.working') : t('tools.htpasswd.generate')}</GlassButton>
        {error && <p className="text-sm text-red-500 dark:text-red-300">{error}</p>}
        {result && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold">{t('tools.htpasswd.result')}</h2>
              <CopyButton value={result} />
            </div>
            <GlassInput readOnly aria-label={t('tools.htpasswd.result')} className="font-mono" value={result} onChange={() => {}} />
          </div>
        )}
        <pre className="mono-panel glass-card p-3 text-xs text-[var(--color-text-muted)]">{t('tools.htpasswd.nginxHint')}</pre>
      </div>
    </ToolLayout>
  );
});

export default HtpasswdTool;
