import React, { useMemo } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { cn } from '../../lib/cn.js';
import { Button } from '../primitives/index.js';
import { StepCard } from './StepCard.jsx';
import { ColdRetardTracker } from './ColdRetardTracker.jsx';

/**
 * StepList — 流程步骤列表（极简 header，不 sticky）
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
  onOpenCookMode,
  className,
}) {
  const { completedCount, percent, currentId } = useMemo(() => {
    const ids = new Set(steps.map((s) => s.id));
    const done = [...completedIds].filter((id) => ids.has(id));
    const pct = Math.round((done.length / steps.length) * 100);
    const current = steps.find((s) => !completedIds.has(s.id))?.id || null;
    return { completedCount: done.length, percent: pct, currentId: current };
  }, [steps, completedIds]);

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

      {/* 1px 进度线 + 操作按钮 */}
      <div className="space-y-3">
        <div className="h-[2px] bg-sunken rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-[width] ease-editorial duration-slow"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            icon={<Play size={11} strokeWidth={1.5} />}
            onClick={onOpenCookMode}
            className="flex-1"
          >
            Cook Mode
          </Button>
          {completedCount > 0 && (
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
          )}
        </div>
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
            <StepCard
              key={step.id}
              step={step}
              state={state}
              index={idx + 1}
              onToggle={() => onToggle(step.id)}
            >
              {step.id === 'cold' && state !== 'done' && (
                <ColdRetardTracker
                  savedTime={coldStartTime}
                  savedDuration={coldDuration}
                  onSetTime={onColdStart}
                  onSetDuration={onColdDuration}
                  onReset={onColdReset}
                />
              )}
            </StepCard>
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
