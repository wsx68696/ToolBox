import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ToolLayout from '../components/ToolLayout';

interface InfoRow { key: string; value: string }

const DeviceInfoTool = memo(function DeviceInfoTool() {
  const { t } = useTranslation();
  const [viewport, setViewport] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    const handler = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const nav = window.navigator;
  const groups: { title: string; rows: InfoRow[] }[] = [
    {
      title: t('tools.device-info.screen'),
      rows: [
        { key: t('tools.device-info.viewport'), value: `${viewport.w} × ${viewport.h}` },
        { key: t('tools.device-info.screenSize'), value: `${window.screen.width} × ${window.screen.height}` },
        { key: t('tools.device-info.pixelRatio'), value: String(window.devicePixelRatio) },
        { key: t('tools.device-info.colorDepth'), value: `${window.screen.colorDepth}-bit` },
        { key: t('tools.device-info.orientation'), value: window.screen.orientation?.type ?? '—' },
      ],
    },
    {
      title: t('tools.device-info.system'),
      rows: [
        { key: t('tools.device-info.language'), value: nav.language },
        { key: t('tools.device-info.languages'), value: nav.languages?.join(', ') ?? '—' },
        { key: t('tools.device-info.platform'), value: nav.platform ?? '—' },
        { key: t('tools.device-info.cores'), value: String(nav.hardwareConcurrency ?? '—') },
        { key: t('tools.device-info.timezone'), value: Intl.DateTimeFormat().resolvedOptions().timeZone },
        { key: t('tools.device-info.online'), value: nav.onLine ? t('tools.device-info.yes') : t('tools.device-info.no') },
        { key: t('tools.device-info.cookies'), value: nav.cookieEnabled ? t('tools.device-info.yes') : t('tools.device-info.no') },
      ],
    },
  ];

  return (
    <ToolLayout id="device-info" color="#f472b6">
      <div className="grid gap-6 lg:grid-cols-2">
        {groups.map((group) => (
          <section key={group.title}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">{group.title}</h2>
            <div className="grid gap-2">
              {group.rows.map((row) => (
                <div key={row.key} className="glass-input flex items-center justify-between gap-3 p-3">
                  <span className="text-sm text-[var(--color-text-muted)]">{row.key}</span>
                  <code className="truncate font-mono text-sm">{row.value}</code>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      <div className="mt-6">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">User Agent</h2>
        <div className="glass-input mono-panel p-4 text-sm">{nav.userAgent}</div>
      </div>
    </ToolLayout>
  );
});

export default DeviceInfoTool;
