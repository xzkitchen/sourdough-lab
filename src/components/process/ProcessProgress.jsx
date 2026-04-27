import React, { useState, useCallback, useRef, useEffect } from 'react';

/**
 * ProcessProgress — Bake tab 顶部 sticky 进度条
 *
 * 视觉与 ActiveFlavorBar 对齐：bg-bg、相同 padding、双语标签 + 大号数字。
 * 节奏：左侧 2 行（label + count），右侧 Reset 按钮 + 大号百分比，
 * 底部 8px 段位条作为完成进度的可视化。
 *
 *   PROGRESS · 进度                  [↻ Reset]    15%
 *   2 / 13 steps
 *   ▓▓▓░░░░░░░░░░░░░░░░░  ← 段位条
 *
 * Props:
 *   steps             enhanceSteps() 输出
 *   completedIds      Set<string>
 *   currentStepId     string | null
 *   onReset()
 *
 * 注意：sticky 由父级 (App.jsx 中 nav+bar 合并后的 sticky 包裹) 统一处理。
 */
export function ProcessProgress({ steps, completedIds, currentStepId, onReset }) {
  const [resetState, setResetState] = useState('idle');
  const resetTimerRef = useRef(null);

  const completed = steps.filter(s => completedIds.has(s.id)).length;
  const total = steps.length;
  const percent = total > 0 ? Math.round(completed / total * 100) : 0;

  const handleReset = useCallback(() => {
    if (completed === 0) return;
    if (resetState === 'idle') {
      setResetState('confirming');
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => {
        setResetState('idle');
        resetTimerRef.current = null;
      }, 3000);
    } else {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
        resetTimerRef.current = null;
      }
      setResetState('idle');
      onReset();
    }
  }, [completed, onReset, resetState]);

  useEffect(() => () => {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
  }, []);

  return (
    <div className="border-b border-line-soft bg-bg">
      {/* 顶部信息行 —— 节奏对齐 ActiveFlavorBar */}
      <div className="flex items-center gap-3 sm:gap-4 py-3 sm:py-3.5 px-3 sm:px-4">
        {/* 左：双语标签 + 步骤计数 */}
        <div className="flex-1 min-w-0">
          <div className="font-mono text-2xs text-faint uppercase tracking-[0.24em] whitespace-nowrap">
            Progress · 进度
          </div>
          <div className="font-mono text-[11px] sm:text-xs text-muted mt-0.5 tabular-nums whitespace-nowrap">
            {completed} / {total} steps
          </div>
        </div>

        {/* 右：Reset + 大号百分比 */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            disabled={completed === 0}
            aria-pressed={resetState === 'confirming'}
            className={[
              'font-mono text-2xs uppercase tracking-[0.24em] px-2 py-1.5 border whitespace-nowrap transition-colors duration-fast',
              completed === 0
                ? 'border-line-soft text-faint cursor-not-allowed'
                : resetState === 'confirming'
                  ? 'border-accent bg-accent text-bg cursor-pointer animate-pulse'
                  : 'border-ink text-ink hover:bg-ink hover:text-bg active:bg-sunken cursor-pointer',
            ].join(' ')}
          >
            {resetState === 'confirming' ? '↻ Confirm?' : '↻ Reset'}
          </button>

          <div
            className="font-display font-medium text-ink tabular-nums leading-none"
            style={{ letterSpacing: '-0.02em' }}
          >
            <span className="text-2xl sm:text-3xl">{percent}</span>
            <span className="font-mono text-sm sm:text-base font-normal text-faint ml-0.5">%</span>
          </div>
        </div>
      </div>

      {/* 段位条：8px，节段间用极淡线分隔 */}
      <div className="flex h-2 border-t border-line-soft">
        {steps.map((s) => {
          const done = completedIds.has(s.id);
          const isCurrent = s.id === currentStepId;
          return (
            <div
              key={s.id}
              className="flex-1 border-r border-line-soft last:border-r-0"
              style={{
                background: done
                  ? '#1A1715'
                  : isCurrent
                    ? '#b94a20'
                    : 'transparent',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default ProcessProgress;
