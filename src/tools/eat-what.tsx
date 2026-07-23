import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

const DEFAULT = '黄焖鸡\n牛肉粉\n老乡鸡\nKFC\n牛腩饭\n鳗鱼饭\n袁记云饺\n麻辣烫\n汉堡\n拉面';

const EatWhatTool = memo(function EatWhatTool() {
  const { t } = useTranslation();
  const [list, setList] = useState(DEFAULT);
  const [pick, setPick] = useState('');
  const [spinning, setSpinning] = useState(false);

  const roll = () => {
    const options = list.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    if (options.length === 0) { setPick(''); return; }
    setSpinning(true);
    let i = 0;
    const timer = window.setInterval(() => {
      setPick(options[Math.floor(Math.random() * options.length)]);
      i += 1;
      if (i > 12) {
        window.clearInterval(timer);
        setPick(options[Math.floor(Math.random() * options.length)]);
        setSpinning(false);
      }
    }, 60);
  };

  return (
    <ToolLayout id="eat-what" color="#f87171">
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <h2 className="mb-2 font-semibold">{t('tools.eat-what.list')}</h2>
          <GlassInput multiline aria-label={t('tools.eat-what.list')} rows={14} value={list} onChange={(e) => setList(e.target.value)} placeholder={t('tools.eat-what.listPlaceholder')} />
        </div>
        <div className="flex flex-col items-center justify-center gap-4">
          <div className={`glass-card flex min-h-40 w-full items-center justify-center p-6 text-center text-3xl font-semibold ${spinning ? 'animate-pulse' : ''}`}>
            {pick || t('tools.eat-what.waiting')}
          </div>
          <GlassButton onClick={roll} disabled={spinning}>{t('tools.eat-what.roll')}</GlassButton>
        </div>
      </div>
    </ToolLayout>
  );
});

export default EatWhatTool;
