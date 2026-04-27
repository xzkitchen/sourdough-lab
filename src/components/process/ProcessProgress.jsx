import React, { useState, useCallback, useRef, useEffect } from 'react';

/**
 * ProcessProgress — Bake tab 顶部 sticky 进度条
 *
 *   PROGRESS · 进度                              85%
 *   2 / 13 steps                          [↻ Reset]
 *   ▓▓▓░░░░░░░░░░░░░░░░░  ← 段位条
 *
 * Reset 在右列 big % 下方，紧凑竖排。位置满足：
 *   - 在进度条上 (sticky 区一键可达)
 *   - 在右侧 (符合"所有 reset 右对齐"规则)
 *   - 不和 big % 横向抢戏 (在 % 下方而非旁边)
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
      <div className="flex items-start gap-3 sm:gap-4 py-3 sm:py-3.5 px-3 sm:px-4">
        {/* 左：双语标签 + 计数 */}
        <div className="flex-1 min-w-0">
          <div className="font-mono text-2xs text-faint uppercase tracking-[0.24em] whitespace-nowrap">
            Progress · 进度
          </div>
          <div className="font-mono text-[11px] sm:text-xs text-muted mt-0.5 tabular-nums whitespace-nowrap">
            {completed} / {total} steps
          </div>
        </div>

        {/* 右：% 大字 + Reset 按钮（竖排，紧凑） */}
        <div className="shrink-0 flex flex-col items-end gap-2">
          <div
            className="font-display font-medium text-ink tabular-nums leading-none"
            style={{ letterSpacing: '-0.02em' }}
          >
            <span className="text-2xl sm:text-3xl">{percent}</span>
            <span className="font-mono text-sm sm:text-base font-normal text-faint ml-0.5">%</span>
          </div>
          <button
            type="button"
            onClick={handleReset}
            disabled={completed === 0}
            aria-pressed={resetState === 'confirming'}
            className={[
              'font-mono text-2xs uppercase tracking-[0.20em] px-2 py-0.5 border whitespace-nowrap transition-colors duration-fast leading-none',
              completed === 0
                ? 'border-line-soft text-faint cursor-not-allowed'
                : resetState === 'confirming'
                  ? 'border-accent bg-accent text-bg cursor-pointer'
                  : 'border-ink text-ink hover:bg-ink hover:text-bg active:bg-sunken cursor-pointer',
            ].join(' ')}
          >
            {resetState === 'confirming' ? '↻ Confirm?' : '↻ Reset'}
          </button>
        </div>
      </div>

      {/* 段位条 */}
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
