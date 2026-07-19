import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

function localInputValue(date: Date) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 19);
}

const TimestampTool = memo(function TimestampTool() {
  const { t } = useTranslation();
  const [date, setDate] = useState(() => new Date());
  const unixSeconds = Math.floor(date.getTime() / 1000);
  const outputs = useMemo(() => ({
    seconds: String(unixSeconds),
    milliseconds: String(date.getTime()),
    iso: date.toISOString(),
    local: date.toLocaleString(),
  }), [date, unixSeconds]);

  const setFromUnix = (value: string) => {
    const number = Number(value);
    if (Number.isFinite(number)) setDate(new Date(value.length > 10 ? number : number * 1000));
  };

  return (
    <ToolLayout id="timestamp" color="#fbbf24">
      <div className="mb-4 flex flex-wrap gap-2">
        <GlassButton aria-label={t('tools.timestamp.now')} onClick={() => setDate(new Date())}>{t('tools.timestamp.now')}</GlassButton>
        <CopyButton value={Object.values(outputs).join('\n')} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Field label={t('tools.timestamp.unix')} value={outputs.seconds} onChange={setFromUnix} />
        <Field label={`${t('tools.timestamp.unix')} (${t('tools.timestamp.milliseconds')})`} value={outputs.milliseconds} onChange={setFromUnix} />
        <Field label={t('tools.timestamp.iso')} value={outputs.iso} onChange={(value) => { const next = new Date(value); if (!Number.isNaN(next.getTime())) setDate(next); }} />
        <label className="text-sm text-[var(--color-text-muted)]">
          {t('tools.timestamp.local')}
          <GlassInput aria-label={t('tools.timestamp.local')} className="mt-2" type="datetime-local" value={localInputValue(date)} onChange={(event) => setDate(new Date(event.target.value))} />
        </label>
      </div>
      <div className="mt-5 glass-input mono-panel p-4">{JSON.stringify(outputs, null, 2)}</div>
    </ToolLayout>
  );
});

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="text-sm text-[var(--color-text-muted)]">
      {label}
      <GlassInput aria-label={label} className="mt-2" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

export default TimestampTool;
