import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

function encodeBase64Utf8(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

const BasicAuthTool = memo(function BasicAuthTool() {
  const { t } = useTranslation();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');

  const header = useMemo(() => `Basic ${encodeBase64Utf8(`${username}:${password}`)}`, [username, password]);
  const full = `Authorization: ${header}`;
  const curl = `curl --header 'Authorization: ${header}' https://example.com`;

  return (
    <ToolLayout id="basic-auth" color="#f472b6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-[var(--color-text-muted)]">
          {t('tools.basic-auth.username')}
          <GlassInput aria-label={t('tools.basic-auth.username')} className="mt-2" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="off" />
        </label>
        <label className="text-sm text-[var(--color-text-muted)]">
          {t('tools.basic-auth.password')}
          <GlassInput aria-label={t('tools.basic-auth.password')} className="mt-2" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="off" />
        </label>
      </div>
      <div className="mt-5 grid gap-4">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">{t('tools.basic-auth.header')}</h2>
            <CopyButton value={full} />
          </div>
          <div className="glass-input mono-panel p-4">{full}</div>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">curl</h2>
            <CopyButton value={curl} />
          </div>
          <div className="glass-input mono-panel p-4">{curl}</div>
        </div>
      </div>
    </ToolLayout>
  );
});

export default BasicAuthTool;
