import React, { useMemo, useRef, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import { cn } from '../../lib/cn.js';
import { Button } from '../primitives/index.js';
import { StepCard } from './StepCard.jsx';
import { ColdRetardTracker } from './ColdRetardTracker.jsx';

/**
 * StepList —— 流程步骤列表（手风琴式，只展开 current）
 *
 * 行为：
 *   - 进入 Bake tab：不自动滚动
 *   - 完成当前步骤后：平滑滚动到下一个 current
 *   - Cook Mode 已移除
 *   - 只有 current 步骤是展开 + 可点"标记完成"；pending 折叠；done 折叠 + 撤销
 */
export function StepList({
  steps,
  completedIds,
  coldStartTime,
  coldDuration,
  onToggle,
  onColdStart,
  onColdDuration,
  onColdReset,
  onReset,
  className,
}) {
  const { completedCount, percent, currentId } = useMemo(() => {
    const ids = new Set(steps.map((s) => s.id));
    const done = [...completedIds].filter((id) => ids.has(id));
    const pct = steps.length > 0 ? Math.round((done.length / steps.length) * 100) : 0;
    const current = steps.find((s) => !completedIds.has(s.id))?.id || null;
    return { completedCount: done.length, percent: pct, currentId: current };
  }, [steps, completedIds]);

  // 只在 currentId 真正"变化"时（完成一步后）平滑滚动；
  // 进入 tab / 第一次 render 不滚动
  const stepRefs = useRef({});
  const initializedRef = useRef(false);
  const prevCurrentRef = useRef(null);

  useEffect(() => {
    if (!initializedRef.current) {
      // 首次 render：仅记录当前 currentId，不滚动
      initializedRef.current = true;
      prevCurrentRef.current = currentId;
      return;
    }
    // 后续：currentId 改变（= 用户完成了一步）→ 平滑滚到新 current
    if (currentId && currentId !== prevCurrentRef.current) {
      const el = stepRefs.current[currentId];
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
    prevCurrentRef.current = currentId;
  }, [currentId]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* 极简 header */}
      <div className="flex items-baseline gap-2 px-0.5">
        <span className="text-[10px] uppercase tracking-[0.2em] text-faint font-body">
          Process
        </span>
        <span className="font-display text-base text-ink">制作流程</span>
        <span className="ml-auto text-[11px] font-mono text-muted tabular-nums">
          {completedCount} / {steps.length}
        </span>
      </div>

      {/* 1px 进度线 + 重置按钮 */}
      <div className="space-y-3">
        <div className="h-[2px] bg-sunken rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-[width] ease-editorial duration-slow"
            style={{ width: `${percent}%` }}
          />
        </div>

        {completedCount > 0 && (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              icon={<RotateCcw size={11} strokeWidth={1.5} />}
              onClick={() => {
                if (window.confirm('重置所有进度？')) onReset();
              }}
            >
              重置
            </Button>
          </div>
        )}
      </div>

      {/* Step cards */}
      <div className="space-y-3 pt-1">
        {steps.map((step, idx) => {
          const state = completedIds.has(step.id)
            ? 'done'
            : step.id === currentId
              ? 'current'
              : 'pending';

          return (
            <div
              key={step.id}
              ref={(el) => { stepRefs.current[step.id] = el; }}
            >
              <StepCard
                step={step}
                state={state}
                index={idx + 1}
                onToggle={() => onToggle(step.id)}
              >
                {step.id === 'cold' && state === 'current' && (
                  <ColdRetardTracker
                    savedTime={coldStartTime}
                    savedDuration={coldDuration}
                    onSetTime={onColdStart}
                    onSetDuration={onColdDuration}
                    onReset={onColdReset}
                  />
                )}
              </StepCard>
            </div>
          );
        })}
      </div>

      {/* 冷发酵已完成但仍显示时间表 */}
      {coldStartTime && completedIds.has('cold') && (
        <ColdRetardTracker
          savedTime={coldStartTime}
          savedDuration={coldDuration}
          onSetTime={onColdStart}
          onSetDuration={onColdDuration}
          onReset={onColdReset}
        />
      )}
    </div>
  );
}

export default StepList;
