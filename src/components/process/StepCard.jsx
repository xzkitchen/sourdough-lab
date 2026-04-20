import React from 'react';
import { Check, Undo2 } from 'lucide-react';
import { cn } from '../../lib/cn.js';
import {
  SmallCaps,
  Ordinal,
  LedgerRule,
} from '../primitives/index.js';
import { MemoBlock } from '../editorial/MemoBlock.jsx';

/**
 * StepCard —— Ledger V2 LedgerStepRow
 *
 * collapsed 行（所有步骤默认 collapsed）：
 *   grid [56px ordinal] [1fr title] [auto meta]
 *   底 1px hairline
 *   current 态：ordinal 反白方块（bg-ink text-surface）+ 右侧 NOW 小徽记
 * expanded 态（仅 current step 自动展开）：
 *   hairline 框内渲染 baseTips（编号列表）、mixerParams / warning (MemoBlock)
 *   底部 MARK COMPLETE ✓ 按钮 = bg-ink text-surface full-width
 */
export function StepCard({ step, state, index, onToggle, children }) {
  const isDone = state === 'done';
  const isCurrent = state === 'current';
  const expanded = isCurrent && !isDone;

  return (
    <article
      className={cn(
        'transition-colors ease-editorial duration-base',
        isDone && 'opacity-55',
        'border-b border-line'
      )}
    >
      {/* Collapsed row */}
      <div
        className={cn(
          'grid items-stretch',
          isDone && 'line-through decoration-muted/40'
        )}
        style={{ gridTemplateColumns: '56px 1fr auto' }}
      >
        {/* Ordinal */}
        <div
          className={cn(
            'flex items-center justify-center',
            isCurrent ? 'bg-ink text-surface' : 'bg-transparent text-faint'
          )}
        >
          <Ordinal
            value={index}
            variant={isCurrent ? 'inverted' : 'serif-big'}
            tone={isDone ? 'faint' : 'muted'}
            className={isCurrent ? '!bg-transparent' : ''}
          />
        </div>

        {/* Title */}
        <div className="flex flex-col justify-center py-4 px-4 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3
              className={cn(
                'font-display leading-tight tracking-tight',
                isDone ? 'text-muted' : isCurrent ? 'text-ink' : 'text-ink'
              )}
              style={{
                fontSize: 'clamp(16px, 3.8vw, 19px)',
                fontVariationSettings: "'opsz' 28, 'SOFT' 50, 'wght' 400",
              }}
            >
              {step.title}
            </h3>
            {isCurrent && (
              <span
                className={cn(
                  'inline-flex items-center px-1.5 py-0.5 border border-warn',
                  'font-body uppercase tracking-[0.16em] text-[9px] text-warn'
                )}
              >
                Now
              </span>
            )}
          </div>
          <SmallCaps tone="faint" className="mt-1">
            {step.subtitle}
          </SmallCaps>
        </div>

        {/* Meta right */}
        <div className="flex flex-col items-end justify-center gap-0.5 py-4 pr-4 sm:pr-5 shrink-0 text-right">
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-sm tabular-nums text-ink">{step.timeValue}</span>
            <span className="text-[10px] text-faint font-body">{step.timeUnit}</span>
          </div>
          {step.temp && (
            <span className="text-[10px] text-faint font-mono">{step.temp}°C</span>
          )}
        </div>
      </div>

      {/* Expanded —— 仅 current */}
      {expanded && (step.action || step.warning || step.mixerParams || step.tips?.length > 0 || step.stageIngredients?.length > 0 || children) && (
        <div className="px-4 sm:px-5 pb-5 pt-1 space-y-4 bg-surface border-t border-line-soft">
          {/* Action + warning 小 pill 行 */}
          {(step.action || step.warning) && (
            <div className="flex flex-wrap gap-2">
              {step.action && (
                <span className="inline-flex items-center px-2 py-1 border border-line font-body text-[11px] text-ink uppercase tracking-[0.14em]">
                  {step.action}
                </span>
              )}
              {step.warning && (
                <span className="inline-flex items-center px-2 py-1 border border-warn bg-warn-bg font-body text-[11px] text-warn uppercase tracking-[0.14em]">
                  ⚠ {step.warning}
                </span>
              )}
            </div>
          )}

          {step.mixerParams && <MixerBlock params={step.mixerParams} />}

          {step.stageIngredients?.length > 0 && (
            <StageIngredients items={step.stageIngredients} />
          )}

          {step.tips?.length > 0 && (
            <ol className="space-y-0">
              {step.tips.map((t, i) => (
                <li
                  key={i}
                  className="grid gap-3 py-2.5 border-b border-line-soft last:border-b-0"
                  style={{ gridTemplateColumns: '24px 1fr' }}
                >
                  <Ordinal value={i + 1} variant="mono-sm" tone="warn" />
                  <p className="text-sm text-ink font-body leading-relaxed">{t}</p>
                </li>
              ))}
            </ol>
          )}

          {children}

          {/* MARK COMPLETE 按钮 */}
          <button
            type="button"
            onClick={onToggle}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-3',
              'bg-ink text-surface hover:bg-muted',
              'font-body uppercase tracking-[0.16em] text-[11px]',
              'transition-colors ease-editorial duration-fast'
            )}
          >
            <Check size={12} strokeWidth={2} />
            Mark Complete
          </button>
        </div>
      )}

      {/* Undo for done state */}
      {isDone && (
        <div className="px-4 sm:px-5 py-2 flex justify-end">
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex items-center gap-1.5 text-[11px] text-faint hover:text-ink font-body transition-colors ease-editorial duration-fast"
          >
            <Undo2 size={11} strokeWidth={1.5} />
            撤销
          </button>
        </div>
      )}
    </article>
  );
}

function MixerBlock({ params }) {
  const stages = [params.stage1, params.stage2].filter(Boolean);
  return (
    <div className="border border-line p-3 space-y-2">
      <SmallCaps tone="faint">Mixer · 厨师机</SmallCaps>
      <div className={cn('grid gap-2', stages.length > 1 ? 'grid-cols-2' : 'grid-cols-1')}>
        {stages.map((s, i) => (
          <div key={i} className="flex flex-col gap-0.5 text-xs">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono tabular-nums text-warn">{s.speed}</span>
              <span className="text-[10px] text-faint">档</span>
              <span className="text-faint">·</span>
              <span className="font-mono tabular-nums text-ink">{s.time}</span>
            </div>
            <span className="text-[10px] text-muted truncate">{s.goal}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StageIngredients({ items }) {
  return (
    <div className="border border-line">
      <div className="px-3 py-1.5 border-b border-line-soft">
        <SmallCaps tone="faint">Stage Ingredients · 本阶段投料</SmallCaps>
      </div>
      <ul className="divide-y divide-line-soft">
        {items.map((ing) => (
          <li
            key={ing.id}
            className="flex items-baseline justify-between px-3 py-2 text-xs"
          >
            <span className="text-ink font-body">{ing.name}</span>
            <span className="font-mono tabular-nums">
              <span className="text-warn">{ing.weight}</span>
              <span className="text-[10px] text-faint ml-0.5">g</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default StepCard;
