import { Download } from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import QRCode from 'qrcode';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';
import { useTheme } from '../contexts/ThemeContext';

const QrCodeTool = memo(function QrCodeTool() {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const [text, setText] = useState('https://toolbox.local');
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    const isDark = resolvedTheme === 'dark';
    void QRCode.toDataURL(text || ' ', {
      width: 320,
      margin: 2,
      color: { dark: isDark ? '#f1f5f9' : '#0a0a0f', light: isDark ? '#0a0a0f' : '#f1f5f9' },
    }).then(setDataUrl);
  }, [text, resolvedTheme]);

  return (
    <ToolLayout id="qrcode" color="#22d3ee">
      <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
        <div>
          <GlassInput multiline aria-label={t('tools.qrcode.inputPlaceholder')} rows={10} value={text} onChange={(event) => setText(event.target.value)} placeholder={t('tools.qrcode.inputPlaceholder')} />
          <div className="mt-4 flex flex-wrap gap-2">
            <CopyButton value={dataUrl} />
            <a href={dataUrl} download="toolbox-qrcode.png" aria-label={t('tools.qrcode.download')}>
              <GlassButton><Download size={16} /> {t('tools.qrcode.download')}</GlassButton>
            </a>
          </div>
        </div>
        <div className="glass-card grid min-h-80 place-items-center rounded-2xl p-5">
          {dataUrl && <img src={dataUrl} alt={t('tools.qrcode.name')} className="h-72 w-72 rounded-xl" />}
        </div>
      </div>
    </ToolLayout>
  );
});

export default QrCodeTool;
