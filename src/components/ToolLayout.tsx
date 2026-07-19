import { ArrowLeft } from 'lucide-react';
import { memo, type ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';
import RelatedTools from './RelatedTools';
import { useRecentTools } from '../App';
import type { ToolId } from '../data/tools';

interface ToolLayoutProps {
  id: ToolId;
  color: string;
  children: ReactNode;
}

const ToolLayout = memo(function ToolLayout({ id, color, children }: ToolLayoutProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { markRecent } = useRecentTools();

  useEffect(() => {
    markRecent(id);
  }, [id, markRecent]);

  return (
    <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <GlassButton className="mb-8" aria-label={t('common.back')} onClick={() => navigate('/')}>
        <ArrowLeft size={16} /> {t('common.back')}
      </GlassButton>
      <div className="mb-7">
        <div className="mb-3 h-1 w-12 rounded-full" style={{ background: color }} />
        <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">{t(`tools.${id}.name`)}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">{t(`tools.${id}.description`)}</p>
      </div>
      <GlassCard className="p-4 sm:p-6" themeColor={color}>{children}</GlassCard>
      <RelatedTools currentId={id} />
    </div>
  );
});

export default ToolLayout;
