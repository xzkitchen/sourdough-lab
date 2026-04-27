import React, { useState, useCallback, useRef, useEffect } from 'react';

/**
 * ProcessProgress — Bake tab 顶部 sticky 进度条
 *
 * 视觉与 ActiveFlavorBar 完全对称：相同 padding、相同 bg、相同节奏。
 * 切换 Formula ↔ Bake 时 sticky 区高度不变。
 *
 *   PROGRESS · 进度                              15%
 *   2 / 13 steps · [↻ Reset]                    Done
 *
 * 设计决策：
 *   - 不在 sticky 里画 segment bar——会让本 bar 比 ActiveFlavorBar
 *     高 8-10px 造成切换跳屏。进度的视觉感由百分比 + 计数承担。
 *   - Reset 按钮压扁到 mono 2xs px-2 py-0.5 小尺寸，inline 紧跟
 *     count，避免和大号 % 数字打架。
 *   - 右列 (% + Done caption) 是 ActiveFlavorBar (% + Hydration)
 *     的精确镜像：相同字号、相同 mt 间距、相同 caption 样式。
 *
 * Props:
 *   steps             enhanceSteps() 输出
 *   completedIds      Set<string>
 *   currentStepId     string | null  (保留接口；目前 sticky 里不画 segment)
 *   onReset()
 *
 * 注意：sticky 由父级 (App.jsx 中 nav+bar 合并后的 sticky 包裹) 统一处理。
 */
export function ProcessProgress({ steps, completedIds, onReset }) {
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
      <div className="flex items-center gap-3 sm:gap-4 py-3 sm:py-3.5 px-3 sm:px-4">
        {/* 左：双语标签 + 计数（Reset 内联） */}
        <div className="flex-1 min-w-0">
          <div className="font-mono text-2xs text-faint uppercase tracking-[0.24em] whitespace-nowrap">
            Progress · 进度
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="font-mono text-[11px] sm:text-xs text-muted tabular-nums whitespace-nowrap shrink-0">
              {completed} / {total} steps
            </div>
            <button
              type="button"
              onClick={handleReset}
              disabled={completed === 0}
              aria-pressed={resetState === 'confirming'}
              className={[
                'font-mono text-2xs uppercase tracking-[0.20em] px-2 py-0.5 border whitespace-nowrap transition-colors duration-fast shrink-0 leading-none',
                completed === 0
                  ? 'border-line-soft text-faint cursor-not-allowed'
                  : resetState === 'confirming'
                    ? 'border-accent bg-accent text-bg cursor-pointer animate-pulse'
                    : 'border-ink text-ink hover:bg-ink hover:text-bg active:bg-sunken cursor-pointer',
              ].join(' ')}
            >
              {resetState === 'confirming' ? '↻ Confirm?' : '↻ Reset'}
            </button>
          </div>
        </div>

        {/* 右：% + Done — 精确镜像 ActiveFlavorBar 的水合度块 */}
        <div className="text-right shrink-0 leading-none">
          <div className="font-mono font-semibold text-ink tabular-nums">
            <span className="text-base sm:text-lg">{percent}</span>
            <span className="text-sm sm:text-base font-normal text-muted ml-0.5">%</span>
          </div>
          <div className="font-mono text-2xs text-faint uppercase tracking-[0.22em] mt-1.5 whitespace-nowrap">
            Done
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProcessProgress;
