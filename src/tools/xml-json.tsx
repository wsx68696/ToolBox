import { XMLBuilder, XMLParser, XMLValidator } from 'fast-xml-parser';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

const initialXml = '<?xml version="1.0" encoding="UTF-8"?>\n<project>\n  <name>Toolbox</name>\n  <tags>\n    <tag>react</tag>\n    <tag>vite</tag>\n  </tags>\n  <private>true</private>\n</project>';

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_', parseTagValue: true });
const builder = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: '@_', format: true, indentBy: '  ' });

function xmlToJson(input: string): { value: string; error: boolean } {
  if (!input.trim()) return { value: '', error: false };
  try {
    const validation = XMLValidator.validate(input);
    if (validation !== true) throw new Error('Invalid XML');
    const data = parser.parse(input);
    return { value: JSON.stringify(data, null, 2), error: false };
  } catch {
    return { value: '', error: true };
  }
}

function jsonToXml(input: string): { value: string; error: boolean } {
  if (!input.trim()) return { value: '', error: false };
  try {
    const data = JSON.parse(input);
    return { value: builder.build(data).trim(), error: false };
  } catch {
    return { value: '', error: true };
  }
}

const XmlJsonTool = memo(function XmlJsonTool() {
  const { t } = useTranslation();
  const [xml, setXml] = useState(initialXml);
  const [json, setJson] = useState(() => {
    const result = xmlToJson(initialXml);
    return result.error ? '' : result.value;
  });

  const xmlParsed = useMemo(() => xmlToJson(xml), [xml]);
  const jsonParsed = useMemo(() => jsonToXml(json), [json]);

  const changeXml = (value: string) => {
    setXml(value);
    const result = xmlToJson(value);
    if (!result.error) setJson(result.value);
  };

  const changeJson = (value: string) => {
    setJson(value);
    const result = jsonToXml(value);
    if (!result.error) setXml(result.value);
  };

  return (
    <ToolLayout id="xml-json" color="#f472b6">
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">XML</h2>
            <CopyButton value={xml} />
          </div>
          <GlassInput
            multiline
            aria-label="XML"
            rows={16}
            className={xmlParsed.error ? 'border-red-400/60' : ''}
            value={xml}
            onChange={(event) => changeXml(event.target.value)}
            placeholder={t('tools.xml-json.xmlPlaceholder')}
          />
          {xmlParsed.error && <p className="mt-2 text-sm text-red-500 dark:text-red-300">{t('tools.xml-json.xmlInvalid')}</p>}
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">JSON</h2>
            <CopyButton value={json} />
          </div>
          <GlassInput
            multiline
            aria-label="JSON"
            rows={16}
            className={jsonParsed.error ? 'border-red-400/60' : ''}
            value={json}
            onChange={(event) => changeJson(event.target.value)}
            placeholder={t('tools.xml-json.jsonPlaceholder')}
          />
          {jsonParsed.error && <p className="mt-2 text-sm text-red-500 dark:text-red-300">{t('tools.xml-json.jsonInvalid')}</p>}
        </div>
      </div>
      <p className="mt-4 text-xs text-[var(--color-text-muted)]">{t('tools.xml-json.hint')}</p>
    </ToolLayout>
  );
});

export default XmlJsonTool;