import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

type Row = Record<string, unknown>;

function toCsvValue(value: unknown): string {
  const text = value === null || value === undefined ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function jsonToCsv(input: string): string {
  const data: unknown = JSON.parse(input);
  if (!Array.isArray(data) || data.length === 0) throw new Error('array');
  const rows: Row[] = data.map((item) => (item !== null && typeof item === 'object' && !Array.isArray(item) ? item as Row : { value: item }));
  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  const lines = [headers.map(toCsvValue).join(',')];
  for (const row of rows) lines.push(headers.map((header) => toCsvValue(row[header])).join(','));
  return lines.join('\n');
}

function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    if (inQuotes) {
      if (ch === '"') {
        if (input[i + 1] === '"') { field += '"'; i += 1; }
        else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field); field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && input[i + 1] === '\n') i += 1;
      row.push(field); field = '';
      rows.push(row); row = [];
    } else {
      field += ch;
    }
  }
  if (field !== '' || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter((r) => !(r.length === 1 && r[0] === ''));
}

function coerce(value: string): unknown {
  if (value === '') return '';
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(value)) return Number(value);
  return value;
}

function csvToJson(input: string): string {
  const rows = parseCsv(input);
  if (rows.length < 1) throw new Error('empty');
  const [headers, ...body] = rows;
  const objects = body.map((row) => {
    const obj: Row = {};
    headers.forEach((header, index) => { obj[header || `col${index + 1}`] = coerce(row[index] ?? ''); });
    return obj;
  });
  return JSON.stringify(objects, null, 2);
}

const initialJson = '[\n  { "name": "Alice", "age": 30, "city": "Beijing" },\n  { "name": "Bob", "age": 24, "city": "Shanghai" }\n]';

const JsonCsvTool = memo(function JsonCsvTool() {
  const { t } = useTranslation();
  const [json, setJson] = useState(initialJson);
  const [csv, setCsv] = useState(() => jsonToCsv(initialJson));
  const [jsonError, setJsonError] = useState(false);
  const [csvError, setCsvError] = useState(false);

  const changeJson = (value: string) => {
    setJson(value);
    try {
      setCsv(jsonToCsv(value));
      setJsonError(false); setCsvError(false);
    } catch {
      setJsonError(true);
    }
  };

  const changeCsv = (value: string) => {
    setCsv(value);
    try {
      setJson(csvToJson(value));
      setCsvError(false); setJsonError(false);
    } catch {
      setCsvError(true);
    }
  };

  return (
    <ToolLayout id="json-csv" color="#818cf8">
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">JSON</h2>
            <CopyButton value={json} />
          </div>
          <GlassInput multiline aria-label="JSON" rows={16} className={jsonError ? 'border-red-400/60' : ''} value={json} onChange={(event) => changeJson(event.target.value)} placeholder={t('tools.json-csv.jsonPlaceholder')} />
          {jsonError && <p className="mt-2 text-sm text-red-500 dark:text-red-300">{t('tools.json-csv.jsonInvalid')}</p>}
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">CSV</h2>
            <CopyButton value={csv} />
          </div>
          <GlassInput multiline aria-label="CSV" rows={16} className={csvError ? 'border-red-400/60' : ''} value={csv} onChange={(event) => changeCsv(event.target.value)} placeholder={t('tools.json-csv.csvPlaceholder')} />
          {csvError && <p className="mt-2 text-sm text-red-500 dark:text-red-300">{t('tools.json-csv.csvInvalid')}</p>}
        </div>
      </div>
      <p className="mt-4 text-xs text-[var(--color-text-muted)]">{t('tools.json-csv.hint')}</p>
    </ToolLayout>
  );
});

export default JsonCsvTool;
