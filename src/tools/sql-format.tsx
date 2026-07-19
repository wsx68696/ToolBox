import { format } from 'sql-formatter';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

const dialects = ['sql', 'mysql', 'postgresql', 'sqlite', 'mariadb', 'bigquery', 'transactsql'] as const;
type Dialect = (typeof dialects)[number];

const dialectLabels: Record<Dialect, string> = {
  sql: 'Standard SQL', mysql: 'MySQL', postgresql: 'PostgreSQL', sqlite: 'SQLite', mariadb: 'MariaDB', bigquery: 'BigQuery', transactsql: 'T-SQL',
};

const initial = 'select u.id, u.name, count(o.id) as orders from users u left join orders o on o.user_id = u.id where u.active = 1 group by u.id, u.name having count(o.id) > 5 order by orders desc limit 10;';

const SqlFormatTool = memo(function SqlFormatTool() {
  const { t } = useTranslation();
  const [input, setInput] = useState(initial);
  const [dialect, setDialect] = useState<Dialect>('sql');
  const [uppercase, setUppercase] = useState(true);

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: '', error: '' };
    try {
      return { output: format(input, { language: dialect, keywordCase: uppercase ? 'upper' : 'preserve', tabWidth: 2 }), error: '' };
    } catch (err) {
      return { output: '', error: err instanceof Error ? err.message : 'Format error' };
    }
  }, [input, dialect, uppercase]);

  return (
    <ToolLayout id="sql-format" color="#4ade80">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select
          className="glass-select"
          value={dialect}
          onChange={(event) => setDialect(event.target.value as Dialect)}
          aria-label={t('tools.sql-format.dialect')}
        >
          {dialects.map((item) => <option key={item} value={item}>{dialectLabels[item]}</option>)}
        </select>
        <GlassButton aria-label={t('tools.sql-format.uppercase')} onClick={() => setUppercase((v) => !v)} className={uppercase ? 'border-green-300/40 bg-green-300/10' : ''}>
          {t('tools.sql-format.uppercase')}
        </GlassButton>
        <CopyButton value={output} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <GlassInput multiline aria-label={t('tools.sql-format.inputPlaceholder')} rows={16} value={input} onChange={(event) => setInput(event.target.value)} placeholder={t('tools.sql-format.inputPlaceholder')} />
        <div className="glass-input mono-panel min-h-96 overflow-auto p-4 text-sm">
          {error ? <span className="text-red-500 dark:text-red-300">{error}</span> : output}
        </div>
      </div>
    </ToolLayout>
  );
});

export default SqlFormatTool;
