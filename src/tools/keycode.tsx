import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import ToolLayout from '../components/ToolLayout';

interface KeyInfo {
  key: string;
  code: string;
  keyCode: number;
  which: number;
  location: number;
  modifiers: string[];
}

const KeycodeTool = memo(function KeycodeTool() {
  const { t } = useTranslation();
  const [info, setInfo] = useState<KeyInfo | null>(null);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      event.preventDefault();
      const modifiers: string[] = [];
      if (event.ctrlKey) modifiers.push('Ctrl');
      if (event.altKey) modifiers.push('Alt');
      if (event.shiftKey) modifiers.push('Shift');
      if (event.metaKey) modifiers.push('Meta');
      setInfo({
        key: event.key === ' ' ? 'Space' : event.key,
        code: event.code,
        keyCode: event.keyCode,
        which: event.which,
        location: event.location,
        modifiers,
      });
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const locations = ['Standard', 'Left', 'Right', 'Numpad'];

  type RowKey = 'key' | 'code' | 'keyCode' | 'which' | 'location' | 'modifiers';
  const rows: { key: RowKey; value: string }[] = info ? [
    { key: 'key', value: info.key },
    { key: 'code', value: info.code },
    { key: 'keyCode', value: String(info.keyCode) },
    { key: 'which', value: String(info.which) },
    { key: 'location', value: `${info.location} (${locations[info.location] ?? '?'})` },
    { key: 'modifiers', value: info.modifiers.length ? info.modifiers.join(' + ') : '—' },
  ] : [];

  return (
    <ToolLayout id="keycode" color="#4ade80">
      <div className="glass-input grid min-h-40 place-items-center p-8 text-center">
        {info ? (
          <div>
            <div className="font-mono text-5xl font-semibold">{info.keyCode}</div>
            <div className="mt-2 text-[var(--color-text-muted)]">{info.code}</div>
          </div>
        ) : (
          <p className="text-[var(--color-text-muted)]">{t('tools.keycode.prompt')}</p>
        )}
      </div>
      {info && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {rows.map((row) => (
            <div key={row.key} className="glass-input flex items-center justify-between gap-3 p-3">
              <span className="text-sm text-[var(--color-text-muted)]">{t(`tools.keycode.${row.key}`)}</span>
              <div className="flex min-w-0 items-center gap-2">
                <code className="truncate font-mono text-sm">{row.value}</code>
                <CopyButton value={row.value} />
              </div>
            </div>
          ))}
        </div>
      )}
    </ToolLayout>
  );
});

export default KeycodeTool;
