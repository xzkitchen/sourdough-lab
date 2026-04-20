import React, { useMemo } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { cn } from '../../lib/cn.js';
import { Button, SmallCaps, LedgerRule } from '../primitives/index.js';
import { StepCard } from './StepCard.jsx';
import { ColdRetardTracker } from './ColdRetardTracker.jsx';

/**
 * StepList —— Ledger V2
 *
 * 顶部 progress block + 分段进度 + 操作行 + 步骤列表。
 * 无任何自动滚动（之前的 scrollIntoView 会在进入 Method tab 时自动跳，感知不好，已移除）。
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
    const pct = steps.length > 0 ? Math.round((done.length / steps.length) * 100) : 0;
    const current = steps.find((s) => !completedIds.has(s.id))?.id || null;
    return { completedCount: done.length, percent: pct, currentId: current };
  }, [steps, completedIds]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Progress block */}
      <div className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <SmallCaps tone="faint">Progress · 进度</SmallCaps>
            <span className="font-mono text-[13px] tabular-nums text-muted">
              {completedCount} / {steps.length} steps
            </span>
          </div>
          <span
            className="font-display tabular-nums tracking-tight text-ink leading-none"
            style={{
              fontSize: 'clamp(40px, 8vw, 56px)',
              fontVariationSettings: "'opsz' 64, 'SOFT' 40, 'wght' 380",
            }}
          >
            {percent}
            <span className="text-[0.45em] text-faint font-mono ml-0.5 align-baseline">%</span>
          </span>
        </div>

        <ProgressSegmented total={steps.length} completed={completedCount} />
      </div>

      {/* Action row */}
      <div className="flex items-stretch gap-3 border-y border-line -mx-5 px-5 sm:-mx-8 sm:px-8 py-3">
        <Button
          variant="primary"
          size="md"
          icon={<Play size={12} strokeWidth={1.5} />}
          onClick={onOpenCookMode}
          className="flex-1"
        >
          Cook Mode
        </Button>
        {completedCount > 0 && (
          <Button
            variant="ghost"
            size="md"
            icon={<RotateCcw size={12} strokeWidth={1.5} />}
            onClick={() => {
              if (window.confirm('重置所有进度？')) onReset();
            }}
          >
            重置
          </Button>
        )}
      </div>

      {/* Step list */}
      <ul className="border-t border-line">
        {steps.map((step, idx) => {
          const state = completedIds.has(step.id)
            ? 'done'
            : step.id === currentId
              ? 'current'
              : 'pending';

          return (
            <li key={step.id}>
              <StepCard
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
            </li>
          );
        })}
      </ul>

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

/** 13 等宽段 progress bar —— 完成段 bg-warn */
function ProgressSegmented({ total, completed }) {
  const segments = Array.from({ length: total }, (_, i) => i < completed);
  return (
    <div className="flex gap-[2px]">
      {segments.map((done, i) => (
        <div
          key={i}
          className={cn(
            'h-[6px] flex-1 transition-colors ease-editorial duration-base',
            done ? 'bg-warn' : 'bg-line-soft'
          )}
        />
      ))}
    </div>
  );
}

export default StepList;
