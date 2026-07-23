import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import Dropzone from '../components/Dropzone';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

type SqlJsDb = {
  exec: (sql: string) => Array<{ columns: string[]; values: unknown[][] }>;
  close: () => void;
};

const SqliteTool = memo(function SqliteTool() {
  const { t } = useTranslation();
  const [fileName, setFileName] = useState('');
  const [tables, setTables] = useState<string[]>([]);
  const [active, setActive] = useState('');
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<unknown[][]>([]);
  const [sql, setSql] = useState('SELECT name FROM sqlite_master WHERE type=\'table\';');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [db, setDb] = useState<SqlJsDb | null>(null);

  const runSql = useCallback((database: SqlJsDb, query: string) => {
    try {
      const result = database.exec(query);
      if (result.length === 0) {
        setColumns([]);
        setRows([]);
      } else {
        setColumns(result[0].columns);
        setRows(result[0].values);
      }
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('tools.sqlite.error'));
      setColumns([]);
      setRows([]);
    }
  }, [t]);

  const onFile = async (file: File) => {
    setBusy(true);
    setError('');
    try {
      const initSqlJs = (await import('sql.js')).default;
      const SQL = await initSqlJs({ locateFile: () => '/wasm/sql-wasm.wasm' });
      const buffer = new Uint8Array(await file.arrayBuffer());
      db?.close();
      const database = new SQL.Database(buffer) as SqlJsDb;
      setDb(database);
      setFileName(file.name);
      const tableRows = database.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
      const names = tableRows[0]?.values.map((v) => String(v[0])) ?? [];
      setTables(['sqlite_master', ...names]);
      setActive(names[0] ?? 'sqlite_master');
      if (names[0]) {
        const q = `SELECT * FROM "${names[0].replace(/"/g, '""')}" LIMIT 200;`;
        setSql(q);
        runSql(database, q);
      } else {
        runSql(database, "SELECT * FROM sqlite_master;");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('tools.sqlite.error'));
    } finally {
      setBusy(false);
    }
  };

  const openTable = (name: string) => {
    if (!db) return;
    setActive(name);
    const q = name === 'sqlite_master'
      ? 'SELECT * FROM sqlite_master;'
      : `SELECT * FROM "${name.replace(/"/g, '""')}" LIMIT 200;`;
    setSql(q);
    runSql(db, q);
  };

  return (
    <ToolLayout id="sqlite" color="#fbbf24">
      <div className="flex flex-col gap-4">
        <Dropzone label={busy ? t('tools.sqlite.loading') : t('tools.sqlite.dropLabel')} inputLabel={t('tools.sqlite.dropLabel')} onFile={(f) => void onFile(f)} />
        {fileName && <p className="text-sm text-[var(--color-text-muted)]">{fileName} · {tables.length} {t('tools.sqlite.tables')}</p>}
        {tables.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tables.map((name) => (
              <button
                key={name}
                type="button"
                className={`glass-button-sm ${active === name ? 'border-[var(--color-ring)]' : ''}`}
                onClick={() => openTable(name)}
              >
                {name}
              </button>
            ))}
          </div>
        )}
        {db && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-end gap-2">
              <label className="min-w-0 flex-1 text-sm text-[var(--color-text-muted)]">
                SQL
                <GlassInput multiline rows={3} className="mt-1 font-mono text-sm" value={sql} onChange={(e) => setSql(e.target.value)} />
              </label>
              <GlassButton onClick={() => runSql(db, sql)}>{t('tools.sqlite.run')}</GlassButton>
            </div>
          </div>
        )}
        {error && <p className="text-sm text-red-500 dark:text-red-300">{error}</p>}
        {columns.length > 0 && (
          <div className="overflow-auto rounded-xl border border-[var(--color-border)]">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[var(--color-surface)] text-left">
                  {columns.map((c) => <th key={c} className="border-b border-[var(--color-border)] px-3 py-2 font-medium">{c}</th>)}
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                {rows.map((row, i) => (
                  <tr key={i} className="hover:bg-[var(--color-surface-hover)]">
                    {row.map((cell, j) => (
                      <td key={j} className="max-w-xs truncate border-b border-[var(--color-border)] px-3 py-1.5" title={String(cell ?? '')}>
                        {cell == null ? <span className="text-[var(--color-text-muted)]">NULL</span> : String(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between px-3 py-2 text-xs text-[var(--color-text-muted)]">
              <span>{t('tools.sqlite.rowCount', { count: rows.length })}</span>
              <CopyButton value={[columns.join('\t'), ...rows.map((r) => r.map((c) => c == null ? '' : String(c)).join('\t'))].join('\n')} />
            </div>
          </div>
        )}
        <p className="text-xs text-[var(--color-text-muted)]">{t('tools.sqlite.hint')}</p>
      </div>
    </ToolLayout>
  );
});

export default SqliteTool;
