import { load, dump } from 'js-yaml';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

const initialYaml = 'name: Toolbox\nversion: 1\ntags:\n  - react\n  - vite\nnested:\n  private: true';

function yamlToJson(input: string): string {
  const data = load(input);
  return JSON.stringify(data, null, 2);
}

function jsonToYaml(input: string): string {
  const data = JSON.parse(input);
  return dump(data, { indent: 2, lineWidth: -1 });
}

const YamlJsonTool = memo(function YamlJsonTool() {
  const { t } = useTranslation();
  const [yaml, setYaml] = useState(initialYaml);
  const [json, setJson] = useState(() => {
    try { return yamlToJson(initialYaml); } catch { return ''; }
  });
  const [yamlError, setYamlError] = useState(false);
  const [jsonError, setJsonError] = useState(false);

  const changeYaml = (value: string) => {
    setYaml(value);
    try { setJson(yamlToJson(value)); setYamlError(false); setJsonError(false); }
    catch { setYamlError(true); }
  };

  const changeJson = (value: string) => {
    setJson(value);
    try { setYaml(jsonToYaml(value)); setJsonError(false); setYamlError(false); }
    catch { setJsonError(true); }
  };

  return (
    <ToolLayout id="yaml-json" color="#f472b6">
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">YAML</h2>
            <CopyButton value={yaml} />
          </div>
          <GlassInput multiline aria-label="YAML" rows={16} className={yamlError ? 'border-red-400/60' : ''} value={yaml} onChange={(event) => changeYaml(event.target.value)} placeholder={t('tools.yaml-json.yamlPlaceholder')} />
          {yamlError && <p className="mt-2 text-sm text-red-500 dark:text-red-300">{t('tools.yaml-json.yamlInvalid')}</p>}
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">JSON</h2>
            <CopyButton value={json} />
          </div>
          <GlassInput multiline aria-label="JSON" rows={16} className={jsonError ? 'border-red-400/60' : ''} value={json} onChange={(event) => changeJson(event.target.value)} placeholder={t('tools.yaml-json.jsonPlaceholder')} />
          {jsonError && <p className="mt-2 text-sm text-red-500 dark:text-red-300">{t('tools.yaml-json.jsonInvalid')}</p>}
        </div>
      </div>
    </ToolLayout>
  );
});

export default YamlJsonTool;
