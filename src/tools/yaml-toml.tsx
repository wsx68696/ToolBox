import { load, dump } from 'js-yaml';
import { parse, stringify } from 'smol-toml';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

const initialYaml = 'name: Toolbox\nversion: 1\ntags:\n  - react\n  - vite\nnested:\n  private: true';

function yamlToToml(input: string): string {
  const data = load(input);
  if (data === null || typeof data !== 'object' || Array.isArray(data)) throw new Error('root must be a table');
  return stringify(data as Record<string, unknown>);
}

function tomlToYaml(input: string): string {
  return dump(parse(input), { indent: 2, lineWidth: -1 });
}

const YamlTomlTool = memo(function YamlTomlTool() {
  const { t } = useTranslation();
  const [yaml, setYaml] = useState(initialYaml);
  const [toml, setToml] = useState(() => {
    try { return yamlToToml(initialYaml); } catch { return ''; }
  });
  const [yamlError, setYamlError] = useState(false);
  const [tomlError, setTomlError] = useState(false);

  const changeYaml = (value: string) => {
    setYaml(value);
    try { setToml(yamlToToml(value)); setYamlError(false); setTomlError(false); }
    catch { setYamlError(true); }
  };

  const changeToml = (value: string) => {
    setToml(value);
    try { setYaml(tomlToYaml(value)); setTomlError(false); setYamlError(false); }
    catch { setTomlError(true); }
  };

  return (
    <ToolLayout id="yaml-toml" color="#818cf8">
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">YAML</h2>
            <CopyButton value={yaml} />
          </div>
          <GlassInput multiline aria-label="YAML" rows={16} className={yamlError ? 'border-red-400/60' : ''} value={yaml} onChange={(event) => changeYaml(event.target.value)} placeholder={t('tools.yaml-toml.yamlPlaceholder')} />
          {yamlError && <p className="mt-2 text-sm text-red-500 dark:text-red-300">{t('tools.yaml-toml.yamlInvalid')}</p>}
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">TOML</h2>
            <CopyButton value={toml} />
          </div>
          <GlassInput multiline aria-label="TOML" rows={16} className={tomlError ? 'border-red-400/60' : ''} value={toml} onChange={(event) => changeToml(event.target.value)} placeholder={t('tools.yaml-toml.tomlPlaceholder')} />
          {tomlError && <p className="mt-2 text-sm text-red-500 dark:text-red-300">{t('tools.yaml-toml.tomlInvalid')}</p>}
        </div>
      </div>
      <p className="mt-4 text-xs text-[var(--color-text-muted)]">{t('tools.yaml-toml.hint')}</p>
    </ToolLayout>
  );
});

export default YamlTomlTool;
