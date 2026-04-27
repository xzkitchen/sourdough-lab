import React from 'react';

/**
 * ProcessProgress — Bake tab 顶部 sticky 进度条
 *
 *   PROGRESS · 进度                              15%
 *   2 / 13 steps
 *   ▓▓▓░░░░░░░░░░░░░░░░░  ← 段位条
 *
 * Reset 按钮不在这里——它被移到 StepList 末尾的"— end —"行右侧，
 * 避免在 sticky 头部抢戏 + 误触风险。
 *
 * Props:
 *   steps             enhanceSteps() 输出
 *   completedIds      Set<string>
 *   currentStepId     string | null
 *
 * 注意：sticky 由父级 (App.jsx 中 nav+bar 合并后的 sticky 包裹) 统一处理。
 */
export function ProcessProgress({ steps, completedIds, currentStepId }) {
  const completed = steps.filter(s => completedIds.has(s.id)).length;
  const total = steps.length;
  const percent = total > 0 ? Math.round(completed / total * 100) : 0;

  return (
    <div className="border-b border-line-soft bg-bg">
      <div className="flex items-center gap-3 sm:gap-4 py-3 sm:py-3.5 px-3 sm:px-4">
        {/* 左：双语标签 + 计数 */}
        <div className="flex-1 min-w-0">
          <div className="font-mono text-2xs text-faint uppercase tracking-[0.24em] whitespace-nowrap">
            Progress · 进度
          </div>
          <div className="font-mono text-[11px] sm:text-xs text-muted mt-0.5 tabular-nums whitespace-nowrap">
            {completed} / {total} steps
          </div>
        </div>

        {/* 右：大号百分比 */}
        <div
          className="font-display font-medium text-ink tabular-nums leading-none shrink-0"
          style={{ letterSpacing: '-0.02em' }}
        >
          <span className="text-2xl sm:text-3xl">{percent}</span>
          <span className="font-mono text-sm sm:text-base font-normal text-faint ml-0.5">%</span>
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
