import { GripVertical, Loader2, Plus, Search, Star, Trash2, X } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassCheckbox from '../components/GlassCheckbox';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  localizeCyberChefCategory,
  localizeCyberChefIngredient,
  localizeCyberChefOperation,
} from './cyberchef-localization';

// ---- engine types --------------------------------------------------------

interface NamedValue { name: string; value: unknown; }
interface SelectorOption { name: string; on?: number[]; off?: number[]; }

interface OpArg {
  name: string;
  type: string;
  value?: unknown;
  toggleValues?: string[];
  target?: number;
}

interface OpDef {
  module: string;
  description: string;
  infoURL: string | null;
  inputType: string;
  outputType: string;
  flowControl: boolean;
  args?: OpArg[];
}

type OpConfig = Record<string, OpDef>;
interface Category { name: string; ops: string[]; }

interface RecipeStep {
  uid: number;
  opName: string;
  args: unknown[];
  disabled: boolean;
}

// ---- arg helpers ---------------------------------------------------------

// Build the initial positional value for one ingredient, mirroring how
// CyberChef itself seeds default ingredient values.
function defaultArgValue(arg: OpArg): unknown {
  switch (arg.type) {
    case 'boolean':
      return Boolean(arg.value);
    case 'number':
      return typeof arg.value === 'number' ? arg.value : Number(arg.value) || 0;
    case 'option':
    case 'editableOption':
    case 'editableOptionShort': {
      const list = (arg.value as Array<string | NamedValue>) ?? [];
      const first = list[0];
      if (first === undefined) return '';
      return typeof first === 'string' ? first : String((first as NamedValue).value ?? '');
    }
    case 'populateOption':
    case 'populateMultiOption':
    case 'argSelector': {
      const list = (arg.value as SelectorOption[]) ?? [];
      return list[0]?.name ?? '';
    }
    case 'toggleString':
      return { option: arg.toggleValues?.[0] ?? '', string: '' };
    case 'label':
      return null;
    default:
      // string, text, binaryString, shortString, binaryShortString, etc.
      return typeof arg.value === 'string' ? arg.value : '';
  }
}

function makeStep(opName: string, def: OpDef): RecipeStep {
  const args = (def.args ?? []).map(defaultArgValue);
  return { uid: nextUid(), opName, args, disabled: false };
}

let uidCounter = 0;
const nextUid = () => { uidCounter += 1; return uidCounter; };

// Restore only operations that still exist in the current engine config.
// Missing/new ingredients receive their current defaults so a CyberChef
// upgrade cannot leave an unusable persisted recipe behind.
function restoreRecipe(value: unknown, ops: OpConfig): RecipeStep[] {
  if (!Array.isArray(value)) return [];

  const maxStoredUid = value.reduce((max, item) => {
    if (!item || typeof item !== 'object') return max;
    const uid = (item as Partial<RecipeStep>).uid;
    return typeof uid === 'number' && Number.isSafeInteger(uid) && uid > 0
      ? Math.max(max, uid)
      : max;
  }, 0);
  uidCounter = Math.max(uidCounter, maxStoredUid);

  const seenUids = new Set<number>();
  const restored: RecipeStep[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    const stored = item as Partial<RecipeStep>;
    if (typeof stored.opName !== 'string') continue;
    const def = ops[stored.opName];
    if (!def) continue;

    const storedArgs = Array.isArray(stored.args) ? stored.args : [];
    const args = (def.args ?? []).map((arg, index) => (
      index < storedArgs.length ? storedArgs[index] : defaultArgValue(arg)
    ));
    let uid = typeof stored.uid === 'number' && Number.isSafeInteger(stored.uid) && stored.uid > 0
      ? stored.uid
      : nextUid();
    if (seenUids.has(uid)) uid = nextUid();
    seenUids.add(uid);
    restored.push({
      uid,
      opName: stored.opName,
      args,
      disabled: Boolean(stored.disabled),
    });
  }
  return restored;
}

// Compute which ingredient indices are hidden by any argSelector in the op.
function hiddenIndices(def: OpDef, values: unknown[]): Set<number> {
  const hidden = new Set<number>();
  (def.args ?? []).forEach((arg, i) => {
    if (arg.type !== 'argSelector') return;
    const options = (arg.value as SelectorOption[]) ?? [];
    const selected = options.find((o) => o.name === values[i]) ?? options[0];
    selected?.off?.forEach((idx) => hidden.add(idx));
    // `on` indices are only visible for this selection; hide them for others.
    options.forEach((o) => o.on?.forEach((idx) => { if (o !== selected) hidden.add(idx); }));
    selected?.on?.forEach((idx) => hidden.delete(idx));
  });
  return hidden;
}

// Serialize a recipe step into the engine's recipeConfig entry. Positional
// args map by index; label slots become null and are dropped by the engine.
function toRecipeConfig(step: RecipeStep): { op: string; args: unknown[]; disabled: boolean } {
  return { op: step.opName, args: step.args, disabled: step.disabled };
}

// ---- worker singleton ----------------------------------------------------

let workerInstance: Worker | null = null;
let workerReady: Promise<Worker> | null = null;
let bakeSeq = 0;
const pending = new Map<number, { resolve: (v: BakeResult) => void }>();

interface BakeResult { output: string; error: string | null; duration: number; }

function getWorker(): Promise<Worker> {
  if (workerReady) return workerReady;
  workerReady = new Promise<Worker>((resolve) => {
    const w = new Worker('/cyberchef/cyberchef-worker.js');
    w.addEventListener('message', (e: MessageEvent) => {
      const msg = e.data as { action: string; data: unknown };
      if (msg.action === 'workerLoaded') {
        workerInstance = w;
        resolve(w);
        return;
      }
      if (msg.action === 'bakeComplete') {
        const d = msg.data as {
          result: string; error: boolean | { displayStr: string }; duration: number; id: number;
        };
        const p = pending.get(d.id);
        if (p) {
          pending.delete(d.id);
          const err = d.error && typeof d.error === 'object' ? d.error.displayStr : null;
          p.resolve({ output: d.result ?? '', error: err, duration: d.duration ?? 0 });
        }
        return;
      }
      if (msg.action === 'bakeError') {
        const d = msg.data as { error: string; id: number };
        const p = pending.get(d.id);
        if (p) {
          pending.delete(d.id);
          p.resolve({ output: '', error: d.error ?? 'Unknown error', duration: 0 });
        }
      }
    });
  });
  return workerReady;
}

async function bake(input: string, steps: RecipeStep[]): Promise<BakeResult> {
  const w = await getWorker();
  const id = (bakeSeq += 1);
  const recipeConfig = steps.filter((s) => !s.disabled).map(toRecipeConfig);
  return new Promise<BakeResult>((resolve) => {
    pending.set(id, { resolve });
    w.postMessage({
      action: 'bake',
      data: { input, recipeConfig, options: { returnType: 'string' }, id },
    });
  });
}

// ---- config loading ------------------------------------------------------

let configCache: { ops: OpConfig; cats: Category[] } | null = null;
let configPromise: Promise<{ ops: OpConfig; cats: Category[] }> | null = null;

function loadConfig(): Promise<{ ops: OpConfig; cats: Category[] }> {
  if (configCache) return Promise.resolve(configCache);
  if (configPromise) return configPromise;
  configPromise = Promise.all([
    fetch('/cyberchef/OperationConfig.json').then((r) => r.json()),
    fetch('/cyberchef/Categories.json').then((r) => r.json()),
  ]).then(([ops, cats]) => {
    configCache = { ops: ops as OpConfig, cats: cats as Category[] };
    return configCache;
  });
  return configPromise;
}

// Strip the HTML that CyberChef ships in op descriptions down to plain text.
function stripHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return (div.textContent ?? '').trim();
}

// ---- arg widgets ---------------------------------------------------------

interface ArgWidgetProps {
  arg: OpArg;
  value: unknown;
  onChange: (v: unknown) => void;
  // Called for populateOption/populateMultiOption to write into a sibling arg.
  onPopulate: (targetIdx: number, v: unknown) => void;
  language: string;
}

// Extract the plain option strings from an option-typed arg definition.
function optionStrings(arg: OpArg): string[] {
  const list = (arg.value as Array<string | NamedValue>) ?? [];
  return list.map((o) => (typeof o === 'string' ? o : String(o.name ?? o.value ?? '')));
}

const ArgWidget = memo(function ArgWidget({ arg, value, onChange, onPopulate, language }: ArgWidgetProps) {
  const label = localizeCyberChefIngredient(arg.name, language);
  const displayOption = (option: string) => localizeCyberChefIngredient(option, language);
  switch (arg.type) {
    case 'label':
      return <div className="text-sm font-medium text-[var(--color-text)] pt-1">{label}</div>;

    case 'boolean':
      return (
        <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
          <GlassCheckbox checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
          {label}
        </label>
      );

    case 'number':
      return (
        <label className="flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">
          {label}
          <input
            type="number"
            className="glass-input"
            value={value === '' || value == null ? '' : Number(value)}
            onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          />
        </label>
      );

    case 'option':
    case 'argSelector': {
      const opts = arg.type === 'argSelector'
        ? ((arg.value as SelectorOption[]) ?? []).map((o) => o.name)
        : optionStrings(arg);
      return (
        <label className="flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">
          {label}
          <select className="glass-select" value={String(value ?? '')} onChange={(e) => onChange(e.target.value)}>
            {opts.map((o) => <option key={o} value={o}>{displayOption(o)}</option>)}
          </select>
        </label>
      );
    }

    case 'populateOption':
    case 'populateMultiOption': {
      const list = (arg.value as NamedValue[]) ?? [];
      return (
        <label className="flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">
          {label}
          <select
            className="glass-select"
            value={String(value ?? '')}
            onChange={(e) => {
              onChange(e.target.value);
              const picked = list.find((o) => o.name === e.target.value);
              if (picked && typeof arg.target === 'number') onPopulate(arg.target, picked.value);
            }}
          >
            {list.map((o) => <option key={o.name} value={o.name}>{displayOption(o.name)}</option>)}
          </select>
        </label>
      );
    }

    case 'editableOption':
    case 'editableOptionShort': {
      const list = (arg.value as NamedValue[]) ?? [];
      return (
        <label className="flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">
          {label}
          <input
            className="glass-input"
            list={`dl-${arg.name}`}
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value)}
          />
          <datalist id={`dl-${arg.name}`}>
            {list.map((o) => <option key={o.name} value={String(o.value ?? '')}>{displayOption(o.name)}</option>)}
          </datalist>
        </label>
      );
    }

    case 'toggleString': {
      const v = (value as { option: string; string: string }) ?? { option: '', string: '' };
      return (
        <label className="flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">
          {label}
          <div className="flex gap-2">
            <input
              className="glass-input flex-1"
              value={v.string}
              onChange={(e) => onChange({ ...v, string: e.target.value })}
            />
            <select
              className="glass-select w-auto"
              value={v.option}
              onChange={(e) => onChange({ ...v, option: e.target.value })}
            >
              {(arg.toggleValues ?? []).map((tv) => <option key={tv} value={tv}>{displayOption(tv)}</option>)}
            </select>
          </div>
        </label>
      );
    }

    case 'text':
      return (
        <label className="flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">
          {label}
          <textarea
            className="glass-input font-mono text-sm"
            rows={3}
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value)}
          />
        </label>
      );

    default:
      // string, shortString, binaryString, binaryShortString, etc.
      return (
        <label className="flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">
          {label}
          <input className="glass-input" value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} />
        </label>
      );
  }
});

// ---- recipe step card ----------------------------------------------------

interface StepCardProps {
  step: RecipeStep;
  def: OpDef;
  index: number;
  loose: (key: string, opts?: Record<string, unknown>) => string;
  language: string;
  onArgChange: (uid: number, argIdx: number, v: unknown) => void;
  onToggle: (uid: number) => void;
  onRemove: (uid: number) => void;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDrop: () => void;
}

const StepCard = memo(function StepCard({
  step, def, index, loose, language, onArgChange, onToggle, onRemove, onDragStart, onDragOver, onDrop,
}: StepCardProps) {
  const args = def.args ?? [];
  const hidden = useMemo(() => hiddenIndices(def, step.args), [def, step.args]);
  return (
    <div
      className={`mono-panel p-3 flex flex-col gap-3 ${step.disabled ? 'opacity-50' : ''}`}
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => { e.preventDefault(); onDragOver(index); }}
      onDrop={(e) => { e.preventDefault(); onDrop(); }}
    >
      <div className="flex items-center gap-2">
        <GripVertical aria-label={loose('dragStep')} size={16} className="text-[var(--color-text-muted)] cursor-grab shrink-0" />
        <span className="text-sm font-medium text-[var(--color-text)] flex-1 truncate" title={localizeCyberChefOperation(step.opName, language)}>
          {localizeCyberChefOperation(step.opName, language)}
        </span>
        <button
          className="glass-button-sm"
          title={loose('toggleStep')}
          onClick={() => onToggle(step.uid)}
        >
          <GlassCheckbox checked={!step.disabled} readOnly className="pointer-events-none" />
        </button>
        <button className="glass-button-sm" title={loose('removeStep')} onClick={() => onRemove(step.uid)}>
          <Trash2 size={14} />
        </button>
      </div>
      {args.length > 0 && (
        <div className="flex flex-col gap-2 pl-6">
          {args.map((arg, i) => (
            hidden.has(i) ? null : (
              <ArgWidget
                key={i}
                arg={arg}
                value={step.args[i]}
                language={language}
                onChange={(v) => onArgChange(step.uid, i, v)}
                onPopulate={(target, v) => onArgChange(step.uid, target, v)}
              />
            )
          ))}
        </div>
      )}
    </div>
  );
});

// ---- op library button ---------------------------------------------------

interface OpButtonProps {
  name: string;
  def: OpDef;
  onAdd: (name: string) => void;
  onDragOp: (name: string) => void;
  language: string;
  addLabel: (translatedName: string) => string;
  favorite: boolean;
  onToggleFavorite: (name: string) => void;
  favoriteLabel: (translatedName: string, favorite: boolean) => string;
}

const OpButton = memo(function OpButton({
  name, def, onAdd, onDragOp, language, addLabel, favorite, onToggleFavorite, favoriteLabel,
}: OpButtonProps) {
  const translatedName = localizeCyberChefOperation(name, language);
  const description = useMemo(() => stripHtml(def.description), [def.description]);
  return (
    <div className="group flex items-center rounded transition-colors hover:bg-[var(--color-surface-hover)]">
      <button
        className="flex min-w-0 flex-1 cursor-grab items-center justify-between gap-2 py-1.5 pl-2 pr-1 text-left text-xs active:cursor-grabbing"
        title={language.startsWith('zh') ? addLabel(translatedName) : description}
        aria-label={addLabel(translatedName)}
        draggable
        onDragStart={() => onDragOp(name)}
        onClick={() => onAdd(name)}
      >
        <span className="truncate text-[var(--color-text)]" title={translatedName}>{translatedName}</span>
        <Plus size={14} className="shrink-0 text-[var(--color-text-muted)] group-hover:text-[var(--color-text)]" />
      </button>
      <button
        type="button"
        className={`mr-1 grid h-7 w-7 shrink-0 place-items-center rounded-md transition-colors ${
          favorite
            ? 'text-amber-500 hover:bg-amber-500/10'
            : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-active)] hover:text-amber-500'
        }`}
        title={favoriteLabel(translatedName, favorite)}
        aria-label={favoriteLabel(translatedName, favorite)}
        aria-pressed={favorite}
        onClick={() => onToggleFavorite(name)}
      >
        <Star size={14} fill={favorite ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
});

// ---- main component ------------------------------------------------------

export default function CyberchefTool() {
  const { t, i18n } = useTranslation();
  const raw = t as unknown as (key: string, opts?: Record<string, unknown>) => string;
  // All keys live under tools.cyberchef.* — wrap so call sites stay short.
  const loose = useCallback(
    (key: string, opts?: Record<string, unknown>) => raw(`tools.cyberchef.${key}`, opts),
    [raw],
  );
  const language = i18n.resolvedLanguage ?? i18n.language;
  const addLabel = useCallback(
    (name: string) => loose('addOperation', { name }),
    [loose],
  );
  const favoriteLabel = useCallback(
    (name: string, favorite: boolean) => loose(favorite ? 'removeFavorite' : 'addFavorite', { name }),
    [loose],
  );

  const [ops, setOps] = useState<OpConfig | null>(null);
  const [cats, setCats] = useState<Category[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [storedFavorites, setStoredFavorites] = useLocalStorage<string[]>('toolbox:cyberchef:favorites', []);

  const [steps, setSteps] = useLocalStorage<RecipeStep[]>('toolbox:cyberchef:recipe', []);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [bakeError, setBakeError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [baking, setBaking] = useState(false);

  const dragFrom = useRef<number | null>(null);
  const dragTo = useRef<number | null>(null);
  const dragNewOp = useRef<string | null>(null);

  // Load engine config once.
  useEffect(() => {
    loadConfig()
      .then(({ ops: o, cats: c }) => {
        setOps(o);
        setCats(c);
        setOpenCat('Favourites');
        setSteps((current) => restoreRecipe(current, o));
      })
      .catch((e) => setLoadError(String(e)));
  }, []);
  // Re-bake whenever input or the recipe changes (debounced).
  useEffect(() => {
    if (!ops) return;
    if (steps.length === 0) {
      setOutput('');
      setBakeError(null);
      setDuration(null);
      return;
    }
    let cancelled = false;
    setBaking(true);
    const handle = setTimeout(() => {
      bake(input, steps).then((res) => {
        if (cancelled) return;
        setOutput(res.output);
        setBakeError(res.error);
        setDuration(res.duration);
        setBaking(false);
      });
    }, 250);
    return () => { cancelled = true; clearTimeout(handle); };
  }, [input, steps, ops]);

  const addOp = useCallback((opName: string) => {
    if (!ops) return;
    const def = ops[opName];
    if (!def) return;
    setSteps((prev) => [...prev, makeStep(opName, def)]);
  }, [ops]);

  const removeStep = useCallback((uid: number) => {
    setSteps((prev) => prev.filter((s) => s.uid !== uid));
  }, []);

  const toggleStep = useCallback((uid: number) => {
    setSteps((prev) => prev.map((s) => (s.uid === uid ? { ...s, disabled: !s.disabled } : s)));
  }, []);

  const clearRecipe = useCallback(() => setSteps([]), []);

  const toggleFavorite = useCallback((opName: string) => {
    setStoredFavorites((current) => {
      const safe = Array.isArray(current) ? current : [];
      return safe.includes(opName)
        ? safe.filter((name) => name !== opName)
        : [...safe, opName];
    });
  }, [setStoredFavorites]);

  const onArgChange = useCallback((uid: number, argIdx: number, v: unknown) => {
    setSteps((prev) => prev.map((s) => {
      if (s.uid !== uid) return s;
      const args = s.args.slice();
      args[argIdx] = v;
      return { ...s, args };
    }));
  }, []);
  const onDragOp = useCallback((opName: string) => {
    dragNewOp.current = opName;
    dragFrom.current = null;
  }, []);
  const onDragStart = useCallback((index: number) => {
    dragFrom.current = index;
    dragNewOp.current = null;
  }, []);
  const onDragOver = useCallback((index: number) => { dragTo.current = index; }, []);
  const onDrop = useCallback(() => {
    const newOp = dragNewOp.current;
    const from = dragFrom.current;
    const to = dragTo.current;
    dragNewOp.current = null;
    dragFrom.current = null;
    dragTo.current = null;
    // Dropping a fresh op from the library: insert it at the target slot (or append).
    if (newOp != null) {
      if (!ops || !ops[newOp]) return;
      const step = makeStep(newOp, ops[newOp]);
      setSteps((prev) => {
        const next = prev.slice();
        const at = to == null ? next.length : to;
        next.splice(at, 0, step);
        return next;
      });
      return;
    }
    // Reordering an existing step.
    if (from == null || to == null || from === to) return;
    setSteps((prev) => {
      const next = prev.slice();
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }, [ops]);

  // Filter the op library by the search query, across all categories.
  const searchResults = useMemo(() => {
    if (!ops || !search.trim()) return null;
    const q = search.trim().toLowerCase();
    return Object.keys(ops)
      .filter((name) => name.toLowerCase().includes(q)
        || localizeCyberChefOperation(name, language).toLowerCase().includes(q)
        || stripHtml(ops[name].description).toLowerCase().includes(q))
      .slice(0, 60);
  }, [language, ops, search]);

  const favoriteOps = useMemo(
    () => (Array.isArray(storedFavorites) && ops
      ? storedFavorites.filter((name, index) => Boolean(ops[name]) && storedFavorites.indexOf(name) === index)
      : []),
    [ops, storedFavorites],
  );
  const favoriteSet = useMemo(() => new Set(favoriteOps), [favoriteOps]);
  const libraryCategories = useMemo(() => {
    const favorites: Category = { name: 'Favourites', ops: favoriteOps };
    const withoutFavorites = cats.filter((cat) => cat.name !== 'Favourites');
    return [favorites, ...withoutFavorites];
  }, [cats, favoriteOps]);

  return (
    <ToolLayout id="cyberchef" color="#4ade80">
      {loadError && (
        <div className="mono-panel p-4 text-sm text-red-500 dark:text-red-300">{loose('loadError')}</div>
      )}
      {!ops && !loadError && (
        <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-sm p-4">
          <Loader2 size={16} className="animate-spin" />
          {loose('loading')}
        </div>
      )}
      {ops && (
        <div className="grid grid-cols-1 gap-4 lg:h-[calc(100dvh-20.25rem)] lg:min-h-[32rem] lg:grid-cols-3">
          {/* --- operations library --- */}
          <div className="flex flex-col gap-3 min-h-0">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                className="glass-input pl-9"
                placeholder={loose('searchOps')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  onClick={() => setSearch('')}
                  aria-label={loose('clearSearch')}
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="flex flex-col gap-1 flex-1 min-h-0 lg:overflow-y-auto pr-1">
              {searchResults ? (
                searchResults.length === 0 ? (
                  <div className="text-xs text-[var(--color-text-muted)] p-2">{loose('noResults')}</div>
                ) : (
                  searchResults.map((name) => (
                    <OpButton
                      key={name}
                      name={name}
                      def={ops[name]}
                      language={language}
                      addLabel={addLabel}
                      favorite={favoriteSet.has(name)}
                      favoriteLabel={favoriteLabel}
                      onAdd={addOp}
                      onDragOp={onDragOp}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))
                )
              ) : (
                libraryCategories.map((cat) => (
                  <div key={cat.name} className="flex flex-col">
                    <button
                      className="flex items-center justify-between text-left text-sm font-medium text-[var(--color-text)] py-1.5 px-2 rounded hover:bg-[var(--color-surface-hover)]"
                      onClick={() => setOpenCat((c) => (c === cat.name ? null : cat.name))}
                    >
                      <span>{localizeCyberChefCategory(cat.name, language)}</span>
                      <span className="text-xs text-[var(--color-text-muted)]">{cat.ops.length}</span>
                    </button>
                    {openCat === cat.name && (
                      <div className="flex flex-col gap-1 pb-2">
                        {cat.name === 'Favourites' && cat.ops.length === 0 ? (
                          <div className="px-2 py-2 text-xs text-[var(--color-text-muted)]">{loose('emptyFavorites')}</div>
                        ) : (
                          cat.ops.filter((n) => ops[n]).map((name) => (
                            <OpButton
                              key={name}
                              name={name}
                              def={ops[name]}
                              language={language}
                              addLabel={addLabel}
                              favorite={favoriteSet.has(name)}
                              favoriteLabel={favoriteLabel}
                              onAdd={addOp}
                              onDragOp={onDragOp}
                              onToggleFavorite={toggleFavorite}
                            />
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          {/* --- recipe --- */}
          <div className="flex flex-col gap-3 min-h-0">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--color-text)]">{loose('recipe')}</span>
              {steps.length > 0 && (
                <button className="glass-button-sm flex items-center gap-1" onClick={clearRecipe}>
                  <Trash2 size={14} /> {loose('clear')}
                </button>
              )}
            </div>
            <div
              className="flex flex-col gap-2 flex-1 min-h-0 lg:overflow-y-auto pr-1"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); onDrop(); }}
            >
              {steps.length === 0 ? (
                <div className="mono-panel p-6 text-center text-xs text-[var(--color-text-muted)]">
                  {loose('emptyRecipe')}
                </div>
              ) : (
                steps.map((step, i) => (
                  <StepCard
                    key={step.uid}
                    step={step}
                    def={ops[step.opName]}
                    index={i}
                    loose={loose}
                    language={language}
                    onArgChange={onArgChange}
                    onToggle={toggleStep}
                    onRemove={removeStep}
                    onDragStart={onDragStart}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                  />
                ))
              )}
            </div>
          </div>
          {/* --- input / output --- */}
          <div className="flex flex-col gap-3 min-h-0">
            <div className="flex flex-col gap-1 flex-1 min-h-0">
              <span className="text-sm font-medium text-[var(--color-text)]">{loose('input')}</span>
              <GlassInput
                multiline
                value={input}
                placeholder={loose('inputPlaceholder')}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 min-h-[8rem] resize-none"
              />
            </div>
            <div className="flex flex-col gap-1 flex-1 min-h-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--color-text)]">{loose('output')}</span>
                <div className="flex items-center gap-2">
                  {baking && <Loader2 size={14} className="animate-spin text-[var(--color-text-muted)]" />}
                  {duration != null && !baking && (
                    <span className="text-xs text-[var(--color-text-muted)]">{loose('duration', { ms: duration })}</span>
                  )}
                  {output && <CopyButton value={output} />}
                </div>
              </div>
              {bakeError ? (
                <div className="mono-panel p-3 text-sm text-red-500 dark:text-red-300 whitespace-pre-wrap break-words overflow-y-auto flex-1 min-h-[8rem]">{bakeError}</div>
              ) : (
                <textarea
                  className="glass-input font-mono text-sm flex-1 min-h-[8rem] resize-none"
                  readOnly
                  value={output}
                  placeholder={loose('outputPlaceholder')}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
