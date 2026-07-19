import { useCallback, useState } from 'react';

export function useCopy(timeout = 2000) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), timeout);
  }, [timeout]);

  return { copied, copy };
}
