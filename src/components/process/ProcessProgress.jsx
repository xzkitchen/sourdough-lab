import React, { useState, useCallback, useRef, useEffect } from 'react';

/**
 * ProcessProgress — Bake tab 顶部 sticky 进度条
 *
 * 抽出自 StepList。挂在 App.jsx 的 sticky 包裹里，
 * 滚动时一直贴顶。极致紧凑：单行控制 + 一条 segment bar。
 *
 *   Progress · 进度   2 / 13                 [↻ Reset]   15%
 *   ▓▓▓░░░░░░░░░░░░░░░░░ 段位条
 *
 * Props:
 *   steps             enhanceSteps() 输出
 *   completedIds      Set<string>
 *   currentStepId     string | null
 *   onReset()         调 App 层 setCompletedList([])
 *
 * 注意：sticky 由父级统一处理，本组件不做 sticky/top/z。
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
    <div className="border-b border-line-soft bg-surface">
      <div className="flex items-center gap-2 sm:gap-3 py-2 sm:py-2.5 px-3 sm:px-4">
        <div className="font-mono text-2xs text-faint uppercase tracking-[0.22em] whitespace-nowrap shrink-0">
          Progress
        </div>
        <div className="font-mono text-[11px] sm:text-xs text-muted whitespace-nowrap shrink-0 tabular-nums">
          {completed}/{total}
        </div>

        <div className="flex-1" />

        <button
          type="button"
          onClick={handleReset}
          disabled={completed === 0}
          aria-pressed={resetState === 'confirming'}
          className={[
            'font-mono text-2xs uppercase tracking-[0.24em] px-2 py-1 border whitespace-nowrap transition-colors duration-fast shrink-0',
            completed === 0
              ? 'border-line-soft text-faint cursor-not-allowed'
              : resetState === 'confirming'
                ? 'border-accent bg-accent text-bg cursor-pointer animate-pulse'
                : 'border-ink text-ink hover:bg-ink hover:text-bg active:bg-sunken cursor-pointer',
          ].join(' ')}
        >
          {resetState === 'confirming' ? '↻ Confirm?' : '↻ Reset'}
        </button>

        <div className="font-display text-xl sm:text-2xl font-medium text-ink tabular-nums leading-none shrink-0" style={{ letterSpacing: '-0.02em' }}>
          {percent}
          <span className="font-mono text-xs text-faint ml-0.5">%</span>
        </div>
      </div>

      {/* 段位条 */}
      <div className="flex h-1.5 border-t border-line-soft">
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
