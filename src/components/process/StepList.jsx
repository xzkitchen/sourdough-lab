import React, { useMemo } from 'react';
import { Play } from 'lucide-react';
import { cn } from '../../lib/cn.js';
import { Card, Button } from '../primitives/index.js';
import { StepCard } from './StepCard.jsx';
import { ColdRetardTracker } from './ColdRetardTracker.jsx';

/**
 * StepList — 流程步骤列表
 *
 * Props:
 *   steps             enhanceSteps() 增强后的步骤
 *   completedIds      Set<string>
 *   coldStartTime     ISO string | null
 *   coldDuration      hours
 *   onToggle(stepId)
 *   onColdStart()
 *   onColdDuration(h)
 *   onColdReset()
 *   onReset()
 *   onOpenCookMode()
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
    <div className={cn('space-y-6', className)}>
      {/* Progress header */}
      <Card variant="surface" padding="lg" className="sticky top-0 z-10 bg-surface/95 backdrop-blur-sm">
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl tabular-nums text-ink tracking-tight">
                {percent}
              </span>
              <span className="text-sm text-faint font-mono">%</span>
            </div>
            <div className="text-[10px] uppercase tracking-widest text-faint font-body mt-1">
              {completedCount} / {steps.length} · Completion
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon={<Play size={12} strokeWidth={1.5} />}
              onClick={onOpenCookMode}
            >
              Cook Mode
            </Button>
            {completedCount > 0 && (
              <Button
                variant="text"
                size="sm"
                onClick={() => {
                  if (window.confirm('重置所有进度？')) onReset();
                }}
              >
                Reset
              </Button>
            )}
          </div>
        </div>
        <div className="h-[2px] bg-sunken rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-[width] ease-editorial duration-slow"
            style={{ width: `${percent}%` }}
          />
        </div>
      </Card>

      {/* Step cards */}
      <div className="space-y-4">
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
              {/* 冷发酵步骤嵌入 tracker */}
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

      {/* 冷发酵步骤已完成但仍要看预热时间 */}
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
