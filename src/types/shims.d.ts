declare module 'less' {
  const less: {
    render: (
      input: string,
      options?: { compress?: boolean },
    ) => Promise<{ css: string }>;
  };
  export default less;
}

declare module 'sql.js' {
  export interface QueryExecResult {
    columns: string[];
    values: unknown[][];
  }
  export interface Database {
    exec: (sql: string) => QueryExecResult[];
    close: () => void;
  }
  export interface SqlJsStatic {
    Database: new (data?: ArrayLike<number> | Buffer | null) => Database;
  }
  export default function initSqlJs(config?: {
    locateFile?: (file: string) => string;
  }): Promise<SqlJsStatic>;
}
