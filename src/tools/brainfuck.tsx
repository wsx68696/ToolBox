import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

// Minimal Brainfuck interpreter + simple text->BF encoder (char-by-char cell set).
function runBrainfuck(code: string, input = ''): string {
  const mem = new Uint8Array(30000);
  let ptr = 0;
  let ip = 0;
  let inPtr = 0;
  let out = '';
  const jumps = new Map<number, number>();
  const stack: number[] = [];
  for (let i = 0; i < code.length; i += 1) {
    if (code[i] === '[') stack.push(i);
    if (code[i] === ']') {
      const start = stack.pop();
      if (start === undefined) throw new Error('unmatched ]');
      jumps.set(start, i);
      jumps.set(i, start);
    }
  }
  if (stack.length) throw new Error('unmatched [');
  let steps = 0;
  const LIMIT = 5_000_000;
  while (ip < code.length) {
    if (++steps > LIMIT) throw new Error('step limit');
    const c = code[ip];
    if (c === '>') ptr = (ptr + 1) % mem.length;
    else if (c === '<') ptr = (ptr - 1 + mem.length) % mem.length;
    else if (c === '+') mem[ptr] = (mem[ptr] + 1) & 0xff;
    else if (c === '-') mem[ptr] = (mem[ptr] - 1) & 0xff;
    else if (c === '.') out += String.fromCharCode(mem[ptr]);
    else if (c === ',') mem[ptr] = inPtr < input.length ? input.charCodeAt(inPtr++) & 0xff : 0;
    else if (c === '[' && mem[ptr] === 0) ip = jumps.get(ip) ?? ip;
    else if (c === ']' && mem[ptr] !== 0) ip = jumps.get(ip) ?? ip;
    ip += 1;
  }
  return out;
}

function textToBrainfuck(text: string): string {
  let code = '';
  let prev = 0;
  for (const ch of text) {
    const target = ch.charCodeAt(0) & 0xff;
    const diff = target - prev;
    if (diff > 0) code += '+'.repeat(diff);
    else if (diff < 0) code += '-'.repeat(-diff);
    code += '.';
    prev = target;
  }
  return code;
}

function bfToOok(bf: string, short = false): string {
  const map: Record<string, string> = short
    ? { '>': '.?', '<': '?.', '+': '..', '-': '!!', '.': '!.', ',': '.!', '[': '!?', ']': '?!' }
    : {
        '>': 'Ook. Ook?',
        '<': 'Ook? Ook.',
        '+': 'Ook. Ook.',
        '-': 'Ook! Ook!',
        '.': 'Ook! Ook.',
        ',': 'Ook. Ook!',
        '[': 'Ook! Ook?',
        ']': 'Ook? Ook!',
      };
  return bf.split('').map((c) => map[c] ?? '').filter(Boolean).join(short ? ' ' : ' ');
}

function ookToBf(ook: string): string {
  const tokens = ook.trim().split(/\s+/);
  // support short and long
  const rev: Record<string, string> = {
    '.?': '>', '?.': '<', '..': '+', '!!': '-', '!.': '.', '.!': ',', '!?': '[', '?!': ']',
    'Ook.Ook?': '>', 'Ook?Ook.': '<', 'Ook.Ook.': '+', 'Ook!Ook!': '-', 'Ook!Ook.': '.', 'Ook.Ook!': ',', 'Ook!Ook?': '[', 'Ook?Ook!': ']',
  };
  let bf = '';
  if (tokens[0]?.startsWith('Ook')) {
    for (let i = 0; i + 1 < tokens.length; i += 2) {
      const key = tokens[i] + tokens[i + 1];
      bf += rev[key] ?? '';
    }
  } else {
    for (const t of tokens) bf += rev[t] ?? '';
  }
  return bf;
}

const BrainfuckTool = memo(function BrainfuckTool() {
  const { t } = useTranslation();
  const [input, setInput] = useState('Hi');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const run = (fn: () => string) => {
    try {
      setOutput(fn());
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('tools.brainfuck.error'));
      setOutput('');
    }
  };

  return (
    <ToolLayout id="brainfuck" color="#f87171">
      <div className="flex flex-col gap-4">
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <h2 className="mb-2 font-semibold">{t('tools.brainfuck.input')}</h2>
            <GlassInput multiline rows={10} className="font-mono text-sm" value={input} onChange={(e) => setInput(e.target.value)} />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold">{t('tools.brainfuck.output')}</h2>
              <CopyButton value={output} />
            </div>
            <GlassInput multiline readOnly rows={10} className="font-mono text-sm" value={output} onChange={() => {}} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <GlassButton onClick={() => run(() => textToBrainfuck(input))}>{t('tools.brainfuck.toBf')}</GlassButton>
          <GlassButton onClick={() => run(() => bfToOok(textToBrainfuck(input), false))}>{t('tools.brainfuck.toOok')}</GlassButton>
          <GlassButton onClick={() => run(() => bfToOok(textToBrainfuck(input), true))}>{t('tools.brainfuck.toShortOok')}</GlassButton>
          <GlassButton onClick={() => run(() => runBrainfuck(input))}>{t('tools.brainfuck.runBf')}</GlassButton>
          <GlassButton onClick={() => run(() => runBrainfuck(ookToBf(input)))}>{t('tools.brainfuck.runOok')}</GlassButton>
        </div>
        {error && <p className="text-sm text-red-500 dark:text-red-300">{error}</p>}
        <p className="text-xs text-[var(--color-text-muted)]">{t('tools.brainfuck.hint')}</p>
      </div>
    </ToolLayout>
  );
});

export default BrainfuckTool;
