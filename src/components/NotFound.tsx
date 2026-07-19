import { ArrowLeft, SearchX } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import GlassCard from './GlassCard';

const NotFound = memo(function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-12 sm:px-6">
      <GlassCard className="w-full p-8 text-center sm:p-12" themeColor="#f87171">
        <SearchX size={42} className="mx-auto text-[var(--color-text-muted)]" aria-hidden="true" />
        <p className="mt-5 font-mono text-sm text-[var(--color-text-muted)]">404</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">{t('notFound.title')}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--color-text-muted)] sm:text-base">
          {t('notFound.description')}
        </p>
        <Link to="/" className="glass-button mt-7 inline-flex" aria-label={t('notFound.backHome')}>
          <ArrowLeft size={16} /> {t('notFound.backHome')}
        </Link>
      </GlassCard>
    </div>
  );
});

export default NotFound;
