import { lazy, memo, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import ToolLayout from '../components/ToolLayout';

// Excalidraw is large; keep the heavy bundle behind a dynamic import so it
// only loads when this tool is opened.
const ExcalidrawCanvas = lazy(async () => {
  await import('@excalidraw/excalidraw/index.css');
  const mod = await import('@excalidraw/excalidraw');
  const Comp = mod.Excalidraw;
  return {
    default: function Wrapped() {
      return (
        <div className="h-[min(70vh,720px)] w-full overflow-hidden rounded-xl border border-[var(--color-border)]">
          <Comp langCode="zh-CN" />
        </div>
      );
    },
  };
});

const WhiteboardTool = memo(function WhiteboardTool() {
  const { t } = useTranslation();

  return (
    <ToolLayout id="whiteboard" color="#818cf8">
      <div className="flex flex-col gap-3">
        <p className="text-xs text-[var(--color-text-muted)]">{t('tools.whiteboard.hint')}</p>
        <Suspense
          fallback={
            <div className="flex h-[min(70vh,720px)] items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] text-sm text-[var(--color-text-muted)]">
              {t('tools.whiteboard.loading')}
            </div>
          }
        >
          <ExcalidrawCanvas />
        </Suspense>
      </div>
    </ToolLayout>
  );
});

export default WhiteboardTool;
