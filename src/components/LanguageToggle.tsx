import { useTranslation } from 'react-i18next';
import GlassButton from './GlassButton';
import type { Language } from '../i18n';

export default function LanguageToggle() {
  const { i18n, t } = useTranslation();

  const toggle = () => {
    const next: Language = i18n.language === 'zh' ? 'en' : 'zh';
    void i18n.changeLanguage(next);
  };

  return (
    <div className="inline-flex items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
      <GlassButton
        onClick={toggle}
        aria-label={t('common.language.zh')}
        className="h-9 min-h-0 min-w-9 border-transparent bg-transparent px-3 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
      >
        {i18n.language === 'zh' ? 'EN' : '中文'}
      </GlassButton>
    </div>
  );
}
