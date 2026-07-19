import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

interface Parsed {
  browser: string;
  browserVersion: string;
  engine: string;
  os: string;
  device: string;
}

function detect(ua: string): Parsed {
  const browsers: [RegExp, string][] = [
    [/Edg(?:e|A|iOS)?\/([\d.]+)/, 'Edge'],
    [/OPR\/([\d.]+)/, 'Opera'],
    [/Firefox\/([\d.]+)/, 'Firefox'],
    [/Chrome\/([\d.]+)/, 'Chrome'],
    [/Version\/([\d.]+).*Safari/, 'Safari'],
    [/MSIE ([\d.]+)|rv:([\d.]+)\)?.*Trident/, 'Internet Explorer'],
  ];
  let browser = 'Unknown';
  let browserVersion = '';
  for (const [regex, name] of browsers) {
    const match = ua.match(regex);
    if (match) { browser = name; browserVersion = match[1] ?? match[2] ?? ''; break; }
  }

  let engine = 'Unknown';
  if (/Gecko\/|Firefox/.test(ua) && !/like Gecko/.test(ua)) engine = 'Gecko';
  else if (/AppleWebKit/.test(ua)) engine = /Chrome|Edg|OPR/.test(ua) ? 'Blink' : 'WebKit';
  else if (/Trident/.test(ua)) engine = 'Trident';

  const osList: [RegExp, string][] = [
    [/Windows NT 10/, 'Windows 10/11'],
    [/Windows NT 6\.3/, 'Windows 8.1'],
    [/Windows NT 6\.1/, 'Windows 7'],
    [/Android ([\d.]+)/, 'Android'],
    [/iPhone OS ([\d_]+)/, 'iOS'],
    [/iPad.*OS ([\d_]+)/, 'iPadOS'],
    [/Mac OS X ([\d_]+)/, 'macOS'],
    [/CrOS/, 'ChromeOS'],
    [/Linux/, 'Linux'],
  ];
  let os = 'Unknown';
  for (const [regex, name] of osList) {
    const match = ua.match(regex);
    if (match) { os = name + (match[1] ? ' ' + match[1].replace(/_/g, '.') : ''); break; }
  }

  let device = 'Desktop';
  if (/iPad|Tablet/.test(ua)) device = 'Tablet';
  else if (/Mobi|iPhone|Android.*Mobile/.test(ua)) device = 'Mobile';
  else if (/Android/.test(ua)) device = 'Tablet';
  if (/bot|crawl|spider|slurp/i.test(ua)) device = 'Bot';

  return { browser, browserVersion, engine, os, device };
}

const UserAgentTool = memo(function UserAgentTool() {
  const { t } = useTranslation();
  const [ua, setUa] = useState(navigator.userAgent);
  const parsed = useMemo(() => detect(ua), [ua]);

  const rows: { key: keyof Parsed; label: string }[] = [
    { key: 'browser', label: t('tools.user-agent.browser') },
    { key: 'browserVersion', label: t('tools.user-agent.version') },
    { key: 'engine', label: t('tools.user-agent.engine') },
    { key: 'os', label: t('tools.user-agent.os') },
    { key: 'device', label: t('tools.user-agent.device') },
  ];

  return (
    <ToolLayout id="user-agent" color="#f87171">
      <GlassInput multiline aria-label={t('tools.user-agent.inputPlaceholder')} rows={3} value={ua} onChange={(event) => setUa(event.target.value)} placeholder={t('tools.user-agent.inputPlaceholder')} />
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.key} className="glass-input flex items-center justify-between gap-3 p-3">
            <span className="text-sm text-[var(--color-text-muted)]">{row.label}</span>
            <code className="truncate font-mono text-sm">{parsed[row.key] || '—'}</code>
          </div>
        ))}
      </div>
    </ToolLayout>
  );
});

export default UserAgentTool;
