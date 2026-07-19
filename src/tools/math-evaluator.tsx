import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

type Token =
  | { type: 'num'; value: number }
  | { type: 'op'; value: string }
  | { type: 'func'; value: string }
  | { type: 'lparen' }
  | { type: 'rparen' };

const functions: Record<string, (x: number) => number> = {
  sqrt: Math.sqrt, abs: Math.abs, sin: Math.sin, cos: Math.cos, tan: Math.tan,
  asin: Math.asin, acos: Math.acos, atan: Math.atan,
  log: Math.log10, ln: Math.log, exp: Math.exp,
  floor: Math.floor, ceil: Math.ceil, round: Math.round,
};

const constants: Record<string, number> = { pi: Math.PI, e: Math.E };

function tokenize(input: string): Token[] | null {
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    const ch = input[i];
    if (ch === ' ' || ch === '\t') { i += 1; continue; }
    if (/[0-9.]/.test(ch)) {
      const match = input.slice(i).match(/^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/);
      if (!match) return null;
      tokens.push({ type: 'num', value: Number(match[0]) });
      i += match[0].length;
      continue;
    }
    if (/[a-zA-Z]/.test(ch)) {
      const match = input.slice(i).match(/^[a-zA-Z]+/);
      if (!match) return null;
      const name = match[0].toLowerCase();
      i += match[0].length;
      let j = i;
      while (j < input.length && input[j] === ' ') j += 1;
      if (input[j] === '(' && functions[name]) tokens.push({ type: 'func', value: name });
      else if (constants[name] !== undefined) tokens.push({ type: 'num', value: constants[name] });
      else return null;
      continue;
    }
    if ('+-*/%^'.includes(ch)) { tokens.push({ type: 'op', value: ch }); i += 1; continue; }
    if (ch === '(') { tokens.push({ type: 'lparen' }); i += 1; continue; }
    if (ch === ')') { tokens.push({ type: 'rparen' }); i += 1; continue; }
    return null;
  }
  return tokens;
}

const precedence: Record<string, number> = { '+': 2, '-': 2, '*': 3, '/': 3, '%': 3, 'u-': 3.5, '^': 4 };
const rightAssoc = new Set(['^', 'u-']);

function toRpn(tokens: Token[]): (Token | { type: 'op'; value: 'u-' })[] | null {
  const output: Token[] = [];
  const stack: Token[] = [];
  let prev: Token | null = null;
  for (const token of tokens) {
    if (token.type === 'num') {
      output.push(token);
    } else if (token.type === 'func') {
      stack.push(token);
    } else if (token.type === 'op') {
      let op = token.value;
      const unary = !prev || prev.type === 'op' || prev.type === 'lparen' || prev.type === 'func';
      if (unary) {
        if (op === '+') { prev = token; continue; }
        if (op === '-') {
          // 前缀一元运算符直接入栈：它的操作数尚未读取，不能先弹出更高优先级的运算符
          stack.push({ type: 'op', value: 'u-' });
          prev = token;
          continue;
        }
        return null;
      }
      while (stack.length) {
        const top = stack[stack.length - 1];
        if (top.type !== 'op') break;
        const topPrec = precedence[top.value];
        const curPrec = precedence[op];
        if (topPrec > curPrec || (topPrec === curPrec && !rightAssoc.has(op))) output.push(stack.pop() as Token);
        else break;
      }
      stack.push({ type: 'op', value: op });
    } else if (token.type === 'lparen') {
      stack.push(token);
    } else {
      let found = false;
      while (stack.length) {
        const top = stack.pop() as Token;
        if (top.type === 'lparen') { found = true; break; }
        output.push(top);
      }
      if (!found) return null;
      if (stack.length && stack[stack.length - 1].type === 'func') output.push(stack.pop() as Token);
    }
    prev = token;
  }
  while (stack.length) {
    const top = stack.pop() as Token;
    if (top.type === 'lparen') return null;
    output.push(top);
  }
  return output;
}

function evaluate(input: string): number | null {
  const tokens = tokenize(input);
  if (!tokens || tokens.length === 0) return null;
  const rpn = toRpn(tokens);
  if (!rpn) return null;
  const stack: number[] = [];
  for (const token of rpn) {
    if (token.type === 'num') { stack.push(token.value); continue; }
    if (token.type === 'func') {
      const arg = stack.pop();
      if (arg === undefined) return null;
      stack.push(functions[token.value](arg));
      continue;
    }
    if (token.type !== 'op') return null;
    if (token.value === 'u-') {
      const arg = stack.pop();
      if (arg === undefined) return null;
      stack.push(-arg);
      continue;
    }
    const b = stack.pop();
    const a = stack.pop();
    if (a === undefined || b === undefined) return null;
    switch (token.value) {
      case '+': stack.push(a + b); break;
      case '-': stack.push(a - b); break;
      case '*': stack.push(a * b); break;
      case '/': stack.push(a / b); break;
      case '%': stack.push(a % b); break;
      case '^': stack.push(a ** b); break;
      default: return null;
    }
  }
  return stack.length === 1 ? stack[0] : null;
}

function formatResult(value: number): string {
  if (!Number.isFinite(value)) return String(value);
  return Number(value.toPrecision(12)).toString();
}

const MathEvaluatorTool = memo(function MathEvaluatorTool() {
  const { t } = useTranslation();
  const [input, setInput] = useState('sqrt(3^2 + 4^2) * (1 + 10%3)');

  const result = useMemo(() => evaluate(input), [input]);
  const display = result !== null ? formatResult(result) : '';
  const hasError = input.trim() !== '' && result === null;

  return (
    <ToolLayout id="math-evaluator" color="#fbbf24">
      <GlassInput aria-label={t('tools.math-evaluator.inputPlaceholder')} className={`font-mono ${hasError ? 'border-red-400/60' : ''}`} value={input} onChange={(event) => setInput(event.target.value)} placeholder="sqrt(3^2 + 4^2)" />
      {hasError && <p className="mt-3 text-sm text-red-500 dark:text-red-300">{t('tools.math-evaluator.invalid')}</p>}
      {display && (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">{t('tools.math-evaluator.result')}</h2>
            <CopyButton value={display} />
          </div>
          <div className="glass-input mono-panel p-5 text-3xl font-semibold">{display}</div>
        </div>
      )}
      <p className="mt-4 text-xs text-[var(--color-text-muted)]">{t('tools.math-evaluator.hint')}</p>
    </ToolLayout>
  );
});

export default MathEvaluatorTool;
