import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

const MS_DAY = 86_400_000;
const DEFAULT_LIFE_YEARS = 80;

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

const LifeGridTool = memo(function LifeGridTool() {
  const { t } = useTranslation();
  const [birthday, setBirthday] = useState('2000-01-01');
  const [lifeYears, setLifeYears] = useState(DEFAULT_LIFE_YEARS);

  const stats = useMemo(() => {
    const birth = new Date(birthday);
    if (Number.isNaN(birth.getTime())) return null;
    const birthMs = startOfDay(birth);
    const nowMs = startOfDay(new Date());
    const livedDays = Math.max(0, Math.floor((nowMs - birthMs) / MS_DAY));
    const totalDays = Math.max(livedDays + 1, Math.round(lifeYears * 365.25));
    const remaining = Math.max(0, totalDays - livedDays);
    const livedYears = livedDays / 365.25;
    const percent = Math.min(100, (livedDays / totalDays) * 100);
    // Weekly grid: one cell = one week.
    const totalWeeks = Math.ceil(totalDays / 7);
    const livedWeeks = Math.min(totalWeeks, Math.floor(livedDays / 7));
    return { livedDays, remaining, livedYears, percent, totalWeeks, livedWeeks, totalDays };
  }, [birthday, lifeYears]);

  return (
    <ToolLayout id="life-grid" color="#22d3ee">
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-end gap-4">
          <label className="text-sm text-[var(--color-text-muted)]">
            {t('tools.life-grid.birthday')}
            <GlassInput type="date" aria-label={t('tools.life-grid.birthday')} value={birthday} onChange={(e) => setBirthday(e.target.value)} className="mt-1" />
          </label>
          <label className="text-sm text-[var(--color-text-muted)]">
            {t('tools.life-grid.lifeYears')}
            <GlassInput type="number" min={1} max={120} aria-label={t('tools.life-grid.lifeYears')} value={lifeYears} onChange={(e) => setLifeYears(Math.max(1, Number(e.target.value) || 1))} className="mt-1 w-28" />
          </label>
        </div>
        {stats && (
          <>
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="glass-card p-3 text-center"><div className="text-xs text-[var(--color-text-muted)]">{t('tools.life-grid.lived')}</div><div className="text-xl font-semibold">{stats.livedDays}</div></div>
              <div className="glass-card p-3 text-center"><div className="text-xs text-[var(--color-text-muted)]">{t('tools.life-grid.remaining')}</div><div className="text-xl font-semibold">{stats.remaining}</div></div>
              <div className="glass-card p-3 text-center"><div className="text-xs text-[var(--color-text-muted)]">{t('tools.life-grid.years')}</div><div className="text-xl font-semibold">{stats.livedYears.toFixed(1)}</div></div>
              <div className="glass-card p-3 text-center"><div className="text-xs text-[var(--color-text-muted)]">{t('tools.life-grid.percent')}</div><div className="text-xl font-semibold">{stats.percent.toFixed(1)}%</div></div>
            </div>
            <div>
              <h2 className="mb-2 text-sm font-semibold text-[var(--color-text-muted)]">{t('tools.life-grid.weeks', { lived: stats.livedWeeks, total: stats.totalWeeks })}</h2>
              <div className="flex flex-wrap gap-[2px]">
                {Array.from({ length: stats.totalWeeks }, (_, i) => (
                  <span
                    key={i}
                    title={`W${i + 1}`}
                    className={`inline-block h-2 w-2 rounded-[1px] ${i < stats.livedWeeks ? 'bg-[var(--color-text)]' : 'bg-[var(--color-surface-active)]'}`}
                  />
                ))}
              </div>
            </div>
          </>
        )}
        <p className="text-xs text-[var(--color-text-muted)]">{t('tools.life-grid.hint')}</p>
      </div>
    </ToolLayout>
  );
});

export default LifeGridTool;
