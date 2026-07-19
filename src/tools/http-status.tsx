import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

const codes: [number, string][] = [
  [100, 'Continue'], [101, 'Switching Protocols'], [102, 'Processing'], [103, 'Early Hints'],
  [200, 'OK'], [201, 'Created'], [202, 'Accepted'], [203, 'Non-Authoritative Information'], [204, 'No Content'], [205, 'Reset Content'], [206, 'Partial Content'],
  [300, 'Multiple Choices'], [301, 'Moved Permanently'], [302, 'Found'], [303, 'See Other'], [304, 'Not Modified'], [307, 'Temporary Redirect'], [308, 'Permanent Redirect'],
  [400, 'Bad Request'], [401, 'Unauthorized'], [402, 'Payment Required'], [403, 'Forbidden'], [404, 'Not Found'], [405, 'Method Not Allowed'], [406, 'Not Acceptable'],
  [407, 'Proxy Authentication Required'], [408, 'Request Timeout'], [409, 'Conflict'], [410, 'Gone'], [411, 'Length Required'], [412, 'Precondition Failed'],
  [413, 'Payload Too Large'], [414, 'URI Too Long'], [415, 'Unsupported Media Type'], [416, 'Range Not Satisfiable'], [417, 'Expectation Failed'], [418, "I'm a teapot"],
  [422, 'Unprocessable Content'], [425, 'Too Early'], [426, 'Upgrade Required'], [428, 'Precondition Required'], [429, 'Too Many Requests'],
  [431, 'Request Header Fields Too Large'], [451, 'Unavailable For Legal Reasons'],
  [500, 'Internal Server Error'], [501, 'Not Implemented'], [502, 'Bad Gateway'], [503, 'Service Unavailable'], [504, 'Gateway Timeout'],
  [505, 'HTTP Version Not Supported'], [506, 'Variant Also Negotiates'], [507, 'Insufficient Storage'], [508, 'Loop Detected'], [511, 'Network Authentication Required'],
];

const groupKeys = ['informational', 'success', 'redirect', 'clientError', 'serverError'] as const;

const groupColors = ['#818cf8', '#4ade80', '#fbbf24', '#f87171', '#f472b6'];

const HttpStatusTool = memo(function HttpStatusTool() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const groups = useMemo(() => {
    const term = query.trim().toLowerCase();
    const filtered = codes.filter(([code, phrase]) => !term || String(code).includes(term) || phrase.toLowerCase().includes(term));
    return groupKeys.map((key, index) => ({
      key,
      color: groupColors[index],
      items: filtered.filter(([code]) => Math.floor(code / 100) === index + 1),
    })).filter((group) => group.items.length > 0);
  }, [query]);

  return (
    <ToolLayout id="http-status" color="#f87171">
      <GlassInput aria-label={t('tools.http-status.searchPlaceholder')} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('tools.http-status.searchPlaceholder')} />
      {groups.length === 0 && <p className="mt-5 text-sm text-[var(--color-text-muted)]">{t('tools.http-status.noResults')}</p>}
      <div className="mt-5 space-y-6">
        {groups.map((group) => (
          <section key={group.key}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">{t(`tools.http-status.${group.key}`)}</h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map(([code, phrase]) => (
                <div key={code} className="glass-input flex items-center gap-3 p-3">
                  <span className="font-mono text-sm font-semibold" style={{ color: group.color }}>{code}</span>
                  <span className="truncate text-sm">{phrase}</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </ToolLayout>
  );
});

export default HttpStatusTool;
