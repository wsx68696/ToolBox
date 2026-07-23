import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

function jsonToJs(json: string): string {
  const data = JSON.parse(json);
  // Prefer a readable object literal; fall back to JSON with unquoted keys stripped carefully via stringify + rewrite.
  return `const data = ${stringifyJs(data)};`;
}

function stringifyJs(value: unknown, indent = 0): string {
  const pad = '  '.repeat(indent);
  const padIn = '  '.repeat(indent + 1);
  if (value === null) return 'null';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return `[\n${value.map((v) => `${padIn}${stringifyJs(v, indent + 1)}`).join(',\n')}\n${pad}]`;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return '{}';
    return `{\n${entries.map(([k, v]) => {
      const key = /^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k);
      return `${padIn}${key}: ${stringifyJs(v, indent + 1)}`;
    }).join(',\n')}\n${pad}}`;
  }
  return 'undefined';
}

function jsToJson(js: string): string {
  // Evaluate a restricted object/array literal by wrapping as an expression.
  // Only accepts object/array/primitive literals — no statements.
  const trimmed = js.trim()
    .replace(/^const\s+\w+\s*=\s*/, '')
    .replace(/^let\s+\w+\s*=\s*/, '')
    .replace(/^var\s+\w+\s*=\s*/, '')
    .replace(/;?\s*$/, '');
  // eslint-disable-next-line no-new-func
  const data = Function(`"use strict"; return (${trimmed});`)();
  return JSON.stringify(data, null, 2);
}

const JsonJsTool = memo(function JsonJsTool() {
  const { t } = useTranslation();
  const [json, setJson] = useState('{\n  "name": "toolbox",\n  "ok": true,\n  "tags": ["web", "misc"]\n}');
  const [js, setJs] = useState('const data = {\n  name: "toolbox",\n  ok: true,\n  tags: ["web", "misc"]\n};');
  const [mode, setMode] = useState<'json2js' | 'js2json'>('json2js');
  const [error, setError] = useState('');

  const convert = () => {
    try {
      if (mode === 'json2js') {
        setJs(jsonToJs(json));
      } else {
        setJson(jsToJson(js));
      }
      setError('');
    } catch {
      setError(t(mode === 'json2js' ? 'tools.json-js.jsonError' : 'tools.json-js.jsError'));
    }
  };

  const out = mode === 'json2js' ? js : json;

  return (
    <ToolLayout id="json-js" color="#4ade80">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <select className="glass-select" value={mode} onChange={(e) => setMode(e.target.value as 'json2js' | 'js2json')}>
            <option value="json2js">{t('tools.json-js.json2js')}</option>
            <option value="js2json">{t('tools.json-js.js2json')}</option>
          </select>
          <GlassButton onClick={convert}>{t('tools.json-js.convert')}</GlassButton>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <h2 className="mb-2 font-semibold">JSON</h2>
            <GlassInput multiline aria-label="JSON" rows={14} className="font-mono" value={json} onChange={(e) => setJson(e.target.value)} />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold">JavaScript</h2>
              <CopyButton value={out} />
            </div>
            <GlassInput multiline aria-label="JavaScript" rows={14} className="font-mono" value={js} onChange={(e) => setJs(e.target.value)} />
          </div>
        </div>
        {error && <p className="text-sm text-red-500 dark:text-red-300">{error}</p>}
      </div>
    </ToolLayout>
  );
});

export default JsonJsTool;
