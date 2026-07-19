import { Download } from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import QRCode from 'qrcode';
import GlassButton from '../components/GlassButton';
import GlassCheckbox from '../components/GlassCheckbox';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';
import { useTheme } from '../contexts/ThemeContext';

type Encryption = 'WPA' | 'WEP' | 'nopass';

function escapeWifi(value: string): string {
  return value.replace(/([\\;,:"])/g, '\\$1');
}

const WifiQrcodeTool = memo(function WifiQrcodeTool() {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const [ssid, setSsid] = useState('MyNetwork');
  const [password, setPassword] = useState('');
  const [encryption, setEncryption] = useState<Encryption>('WPA');
  const [hidden, setHidden] = useState(false);
  const [dataUrl, setDataUrl] = useState('');

  const payload = `WIFI:T:${encryption};S:${escapeWifi(ssid)};${encryption === 'nopass' ? '' : `P:${escapeWifi(password)};`}${hidden ? 'H:true;' : ''};`;

  useEffect(() => {
    const isDark = resolvedTheme === 'dark';
    void QRCode.toDataURL(ssid ? payload : ' ', {
      width: 320,
      margin: 2,
      color: { dark: isDark ? '#f1f5f9' : '#0a0a0f', light: isDark ? '#0a0a0f' : '#f1f5f9' },
    }).then(setDataUrl);
  }, [payload, ssid, resolvedTheme]);

  const encryptions: { key: Encryption; label: string }[] = [
    { key: 'WPA', label: 'WPA/WPA2' },
    { key: 'WEP', label: 'WEP' },
    { key: 'nopass', label: t('tools.wifi-qrcode.nopass') },
  ];

  return (
    <ToolLayout id="wifi-qrcode" color="#4ade80">
      <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
        <div>
          <label className="block text-sm text-[var(--color-text-muted)]">
            SSID
            <GlassInput aria-label="SSID" className="mt-2" value={ssid} onChange={(event) => setSsid(event.target.value)} placeholder={t('tools.wifi-qrcode.ssidPlaceholder')} />
          </label>
          <label className="mt-4 block text-sm text-[var(--color-text-muted)]">
            {t('tools.wifi-qrcode.password')}
            <GlassInput aria-label={t('tools.wifi-qrcode.password')} className="mt-2" value={password} onChange={(event) => setPassword(event.target.value)} disabled={encryption === 'nopass'} autoComplete="off" />
          </label>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {encryptions.map((option) => (
              <GlassButton key={option.key} aria-label={option.label} onClick={() => setEncryption(option.key)} className={encryption === option.key ? 'border-green-300/40 bg-green-300/10' : ''}>{option.label}</GlassButton>
            ))}
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm">
            <GlassCheckbox checked={hidden} onChange={(event) => setHidden(event.target.checked)} />
            {t('tools.wifi-qrcode.hidden')}
          </label>
          <div className="mt-5">
            <h2 className="mb-2 text-sm font-semibold">{t('tools.wifi-qrcode.payload')}</h2>
            <div className="glass-input mono-panel p-3 text-xs">{payload}</div>
          </div>
          {dataUrl && ssid && (
            <a className="mt-4 inline-block" href={dataUrl} download="wifi-qrcode.png" aria-label={t('tools.wifi-qrcode.download')}>
              <GlassButton><Download size={16} /> {t('tools.wifi-qrcode.download')}</GlassButton>
            </a>
          )}
        </div>
        <div className="glass-card grid min-h-80 place-items-center rounded-2xl p-5">
          {dataUrl && ssid ? (
            <img src={dataUrl} alt={t('tools.wifi-qrcode.name')} className="h-72 w-72 rounded-xl" />
          ) : (
            <p className="text-sm text-[var(--color-text-muted)]">{t('tools.wifi-qrcode.ssidPlaceholder')}</p>
          )}
        </div>
      </div>
    </ToolLayout>
  );
});

export default WifiQrcodeTool;
