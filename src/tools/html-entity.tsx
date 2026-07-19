import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

const entityMap: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function encode(value: string) {
  return value.replace(/[&<>"']/g, (char) => entityMap[char] ?? char);
}

function decode(value: string) {
  const element = document.createElement('textarea');
  element.innerHTML = value;
  return element.value;
}

const initialText = '<article class="card">Toolbox & tools</article>';

const HtmlEntityTool = memo(function HtmlEntityTool() {
  const { t } = useTranslation();
  const [plain, setPlain] = useState(initialText);
  const [encoded, setEncoded] = useState(() => encode(initialText));

  const changePlain = (value: string) => {
    setPlain(value);
    setEncoded(encode(value));
  };

  const changeEncoded = (value: string) => {
    setEncoded(value);
    setPlain(decode(value));
  };

  return (
    <ToolLayout id="html-entity" color="#f87171">
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">{t('tools.html-entity.text')}</h2>
            <CopyButton value={plain} />
          </div>
          <GlassInput multiline aria-label={t('tools.html-entity.text')} rows={14} value={plain} onChange={(event) => changePlain(event.target.value)} placeholder={t('tools.html-entity.textPlaceholder')} />
        </div>
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">{t('tools.html-entity.encoded')}</h2>
            <CopyButton value={encoded} />
          </div>
          <GlassInput multiline aria-label={t('tools.html-entity.encoded')} rows={14} value={encoded} onChange={(event) => changeEncoded(event.target.value)} placeholder={t('tools.html-entity.encodedPlaceholder')} />
        </div>
      </div>
    </ToolLayout>
  );
});

export default HtmlEntityTool;
