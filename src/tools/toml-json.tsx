import { parse, stringify } from 'smol-toml';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

const initialToml = 'name = "Toolbox"\nversion = 1\ntags = ["react", "vite"]\n\n[nested]\nprivate = true';

function tomlToJson(input: string): string {
  return JSON.stringify(parse(input), null, 2);
}

function jsonToToml(input: string): string {
  const data = JSON.parse(input);
  if (data === null || typeof data !== 'object' || Array.isArray(data)) throw new Error('root must be a table');
  return stringify(data as Record<string, unknown>);
}

const TomlJsonTool = memo(function TomlJsonTool() {
  const { t } = useTranslation();
  const [toml, setToml] = useState(initialToml);
  const [json, setJson] = useState(() => {
    try { return tomlToJson(initialToml); } catch { return ''; }
  });
  const [tomlError, setTomlError] = useState(false);
  const [jsonError, setJsonError] = useState(false);

  const changeToml = (value: string) => {
    setToml(value);
    try { setJson(tomlToJson(value)); setTomlError(false); setJsonError(false); }
    catch { setTomlError(true); }
  };

  const changeJson = (value: string) => {
    setJson(value);
    try { setToml(jsonToToml(value)); setJsonError(false); setTomlError(false); }
    catch { setJsonError(true); }
  };

  return (
    <ToolLayout id="toml-json" color="#fbbf24">
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">TOML</h2>
            <CopyButton value={toml} />
          </div>
          <GlassInput multiline aria-label="TOML" rows={16} className={tomlError ? 'border-red-400/60' : ''} value={toml} onChange={(event) => changeToml(event.target.value)} placeholder={t('tools.toml-json.tomlPlaceholder')} />
          {tomlError && <p className="mt-2 text-sm text-red-500 dark:text-red-300">{t('tools.toml-json.tomlInvalid')}</p>}
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">JSON</h2>
            <CopyButton value={json} />
          </div>
          <GlassInput multiline aria-label="JSON" rows={16} className={jsonError ? 'border-red-400/60' : ''} value={json} onChange={(event) => changeJson(event.target.value)} placeholder={t('tools.toml-json.jsonPlaceholder')} />
          {jsonError && <p className="mt-2 text-sm text-red-500 dark:text-red-300">{t('tools.toml-json.jsonInvalid')}</p>}
        </div>
      </div>
      <p className="mt-4 text-xs text-[var(--color-text-muted)]">{t('tools.toml-json.hint')}</p>
    </ToolLayout>
  );
});

export default TomlJsonTool;
