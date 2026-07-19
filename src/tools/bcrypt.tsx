import { compare, hash } from 'bcryptjs';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import NumberStepper from '../components/NumberStepper';
import ToolLayout from '../components/ToolLayout';

const BcryptTool = memo(function BcryptTool() {
  const { t } = useTranslation();
  const [password, setPassword] = useState('password123');
  const [rounds, setRounds] = useState(10);
  const [digest, setDigest] = useState('');
  const [busy, setBusy] = useState(false);

  const [checkPassword, setCheckPassword] = useState('password123');
  const [checkHash, setCheckHash] = useState('');
  const [match, setMatch] = useState<boolean | null>(null);

  const generate = () => {
    setBusy(true);
    void hash(password, rounds).then((result) => { setDigest(result); setBusy(false); });
  };

  useEffect(() => {
    let cancelled = false;
    if (!checkHash.trim()) { setMatch(null); return; }
    void compare(checkPassword, checkHash.trim())
      .then((result) => { if (!cancelled) setMatch(result); })
      .catch(() => { if (!cancelled) setMatch(false); });
    return () => { cancelled = true; };
  }, [checkPassword, checkHash]);

  return (
    <ToolLayout id="bcrypt" color="#f87171">
      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 font-semibold">{t('tools.bcrypt.hashTitle')}</h2>
          <label className="block text-sm text-[var(--color-text-muted)]">
            {t('tools.bcrypt.password')}
            <GlassInput aria-label={t('tools.bcrypt.password')} className="mt-2" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="off" />
          </label>
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <div className="text-sm text-[var(--color-text-muted)]">
              <span className="mb-2 block">{t('tools.bcrypt.rounds')}</span>
              <NumberStepper aria-label={t('tools.bcrypt.rounds')} min={4} max={15} value={rounds} onChange={setRounds} />
            </div>
            <GlassButton aria-label={t('tools.bcrypt.generate')} onClick={generate} disabled={busy}>
              {busy ? t('tools.bcrypt.hashing') : t('tools.bcrypt.generate')}
            </GlassButton>
          </div>
          {digest && (
            <div className="mt-4">
              <div className="mb-2 flex justify-end"><CopyButton value={digest} /></div>
              <div className="glass-input mono-panel p-3 text-sm">{digest}</div>
            </div>
          )}
        </section>
        <section>
          <h2 className="mb-4 font-semibold">{t('tools.bcrypt.compareTitle')}</h2>
          <label className="block text-sm text-[var(--color-text-muted)]">
            {t('tools.bcrypt.password')}
            <GlassInput aria-label={`${t('tools.bcrypt.compareTitle')} ${t('tools.bcrypt.password')}`} className="mt-2" value={checkPassword} onChange={(event) => setCheckPassword(event.target.value)} autoComplete="off" />
          </label>
          <label className="mt-4 block text-sm text-[var(--color-text-muted)]">
            {t('tools.bcrypt.hashLabel')}
            <GlassInput multiline aria-label={t('tools.bcrypt.hashLabel')} className="mt-2 font-mono text-sm" rows={3} value={checkHash} onChange={(event) => setCheckHash(event.target.value)} placeholder="$2b$10$..." />
          </label>
          {match !== null && (
            <div className={`mt-4 rounded-2xl border p-4 text-lg font-semibold ${match ? 'border-green-500/40 bg-green-500/10 text-green-600 dark:text-green-300' : 'border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-300'}`}>
              {match ? t('tools.bcrypt.match') : t('tools.bcrypt.noMatch')}
            </div>
          )}
        </section>
      </div>
      <p className="mt-6 text-xs text-[var(--color-text-muted)]">{t('tools.bcrypt.hint')}</p>
    </ToolLayout>
  );
});

export default BcryptTool;
