import { memo, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

type ChartKind = 'line' | 'radar' | 'pie';

interface ChartToolProps {
  id: 'chart-line' | 'chart-radar' | 'chart-nightingale';
  color: string;
  kind: ChartKind;
  defaultTitle: string;
  defaultCategories?: string;
  defaultData: string;
}

const ChartTool = memo(function ChartTool({ id, color, kind, defaultTitle, defaultCategories = 'Mon, Tue, Wed, Thu, Fri, Sat, Sun', defaultData }: ChartToolProps) {
  const { t } = useTranslation();
  const hostRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartRef = useRef<any>(null);
  const [title, setTitle] = useState(defaultTitle);
  const [categories, setCategories] = useState(defaultCategories);
  const [dataText, setDataText] = useState(defaultData);
  const [legend, setLegend] = useState(true);
  const [smooth, setSmooth] = useState(false);
  const [error, setError] = useState('');

  const [ready, setReady] = useState(0);

  useEffect(() => {
    let disposed = false;
    let ro: ResizeObserver | null = null;
    (async () => {
      if (!hostRef.current) return;
      const echarts = await import('echarts');
      if (disposed || !hostRef.current) return;
      chartRef.current = echarts.init(hostRef.current);
      ro = new ResizeObserver(() => chartRef.current?.resize());
      ro.observe(hostRef.current);
      setReady((n) => n + 1);
    })();
    return () => {
      disposed = true;
      ro?.disconnect();
      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current || !ready) return;
    try {
      const cats = categories.replace(/，/g, ',').split(',').map((s) => s.trim()).filter(Boolean);
      // Accept object literal or JSON.
      const raw = new Function(`"use strict"; return (${dataText});`)() as Record<string, number[]> | number[] | Array<{ name: string; value: number }>;
      let option: Record<string, unknown>;

      if (kind === 'line') {
        const seriesObj = raw as Record<string, number[]>;
        const series = Object.entries(seriesObj).map(([name, data]) => ({ name, type: 'line', smooth, data, label: { show: true } }));
        option = {
          title: { text: title, left: 'center' },
          tooltip: { trigger: 'axis' },
          legend: { show: legend, bottom: 0 },
          toolbox: { feature: { saveAsImage: {} } },
          xAxis: { type: 'category', data: cats, boundaryGap: false },
          yAxis: { type: 'value' },
          series,
        };
      } else if (kind === 'radar') {
        const seriesObj = raw as Record<string, number[]>;
        const indicator = cats.map((name, i) => {
          const max = Math.max(1, ...Object.values(seriesObj).map((arr) => arr[i] ?? 0)) * 1.2;
          return { name, max: Math.ceil(max) };
        });
        option = {
          title: { text: title, left: 'center' },
          tooltip: {},
          legend: { show: legend, bottom: 0 },
          toolbox: { feature: { saveAsImage: {} } },
          radar: { indicator },
          series: [{
            type: 'radar',
            data: Object.entries(seriesObj).map(([name, value]) => ({ name, value })),
          }],
        };
      } else {
        // nightingale / pie
        let pieData: Array<{ name: string; value: number }>;
        if (Array.isArray(raw)) {
          pieData = (raw as Array<{ name: string; value: number } | number>).map((item, i) =>
            typeof item === 'number' ? { name: cats[i] ?? `Item ${i + 1}`, value: item } : item,
          );
        } else {
          pieData = Object.entries(raw as unknown as Record<string, number>).map(([name, value]) => ({ name, value: Array.isArray(value) ? value[0] : value }));
        }
        option = {
          title: { text: title, left: 'center' },
          tooltip: { trigger: 'item' },
          legend: { show: legend, bottom: 0 },
          toolbox: { feature: { saveAsImage: {} } },
          series: [{
            type: 'pie',
            radius: ['15%', '70%'],
            roseType: 'area',
            itemStyle: { borderRadius: 6 },
            data: pieData,
          }],
        };
      }
      chartRef.current.setOption(option, true);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t(`tools.${id}.error`));
    }
  }, [title, categories, dataText, legend, smooth, kind, id, t, ready]);

  return (
    <ToolLayout id={id} color={color}>
      <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col gap-3">
          <label className="text-sm text-[var(--color-text-muted)]">
            {t(`tools.${id}.title`)}
            <GlassInput className="mt-1" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          {kind !== 'pie' && (
            <label className="text-sm text-[var(--color-text-muted)]">
              {t(`tools.${id}.categories`)}
              <GlassInput className="mt-1 font-mono text-sm" value={categories} onChange={(e) => setCategories(e.target.value)} />
            </label>
          )}
          <label className="text-sm text-[var(--color-text-muted)]">
            {t(`tools.${id}.data`)}
            <GlassInput multiline rows={12} className="mt-1 font-mono text-sm" value={dataText} onChange={(e) => setDataText(e.target.value)} />
          </label>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" className="glass-checkbox" checked={legend} onChange={(e) => setLegend(e.target.checked)} />{t(`tools.${id}.legend`)}</label>
            {kind === 'line' && <label className="flex items-center gap-2"><input type="checkbox" className="glass-checkbox" checked={smooth} onChange={(e) => setSmooth(e.target.checked)} />{t(`tools.${id}.smooth`)}</label>}
          </div>
          {error && <p className="text-sm text-red-500 dark:text-red-300">{error}</p>}
        </div>
        <div ref={hostRef} className="min-h-[22rem] w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)]" />
      </div>
    </ToolLayout>
  );
});

export default ChartTool;
