import React from 'react';
import { Check, Undo2, ChefHat, AlertTriangle, Lock } from 'lucide-react';
import { cn } from '../../lib/cn.js';
import { Pill } from '../primitives/index.js';

/**
 * StepCard — 手风琴单步卡片（三态）
 *
 * 规则：
 *   - pending: 折叠（只显示编号/标题/时间），显锁形图标表示"需先完成前一步"
 *   - current: 完整展开，显 action pill + 投料 + mixer + tips + children + "标记完成"按钮
 *   - done   : 折叠，标题划线 + "已完成"徽记 + 底部小"撤销"按钮
 *
 * 只有 current 态才可点"标记完成"；pending 没有按钮
 */
export function StepCard({ step, state, index, onToggle, children }) {
  const isDone = state === 'done';
  const isCurrent = state === 'current';
  const isPending = state === 'pending';

  // ── Pending: 折叠 + 锁 ──────────────────────────────
  if (isPending) {
    return (
      <article
        className={cn(
          'relative rounded-md bg-surface border border-line',
          'opacity-70'
        )}
      >
        <div className="absolute left-0 top-4 bottom-4 w-[2px] rounded-full bg-line-soft" aria-hidden />
        <CollapsedRow step={step} index={index} trailing={
          <Lock size={12} strokeWidth={1.5} className="text-faint shrink-0" aria-hidden />
        } />
      </article>
    );
  }

  // ── Done: 折叠 + 撤销 ───────────────────────────────
  if (isDone) {
    return (
      <article
        className={cn(
          'relative rounded-md bg-surface border border-line',
          'opacity-55'
        )}
      >
        <div className="absolute left-0 top-4 bottom-4 w-[2px] rounded-full bg-line" aria-hidden />
        <CollapsedRow
          step={step}
          index={index}
          strike
          badge={
            <Pill tone="muted" size="sm" icon={<Check size={10} strokeWidth={2.5} />}>
              已完成
            </Pill>
          }
        />
        <div className="px-5 pb-3 -mt-1 flex justify-end">
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex items-center gap-1.5 text-[11px] text-faint hover:text-ink font-body transition-colors ease-editorial duration-fast"
          >
            <Undo2 size={11} strokeWidth={1.5} />
            撤销
          </button>
        </div>
      </article>
    );
  }

  // ── Current: 完整展开 ───────────────────────────────
  return (
    <article className="relative rounded-md bg-surface border border-accent transition-colors ease-editorial duration-base">
      <div className="absolute left-0 top-4 bottom-4 w-[2px] rounded-full bg-accent" aria-hidden />
      <div className="pl-5 pr-4 py-4 sm:pl-6 sm:pr-5 sm:py-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-mono text-[10px] text-faint tabular-nums">
                {String(index).padStart(2, '0')}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-faint font-body">
                {step.subtitle}
              </span>
              <Pill tone="accent" size="sm">当前</Pill>
            </div>
            <h3 className="font-display text-lg sm:text-xl tracking-tight leading-tight text-accent-ink">
              {step.title}
            </h3>
          </div>

          {/* 右上：时间 */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <div className="text-right">
              <div className="font-mono text-base tabular-nums text-ink">
                {step.timeValue}
              </div>
              <div className="text-[10px] text-faint font-body">
                {step.timeUnit}
              </div>
            </div>
          </div>
        </div>

        {/* Action pill + warning */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Pill tone="neutral" size="md">{step.action}</Pill>
          {step.warning && (
            <Pill tone="warn" size="md" icon={<AlertTriangle size={11} strokeWidth={1.5} />}>
              {step.warning}
            </Pill>
          )}
        </div>

        {/* 展开内容 */}
        <div className="space-y-4">
          {step.mixerParams && <MixerBlock params={step.mixerParams} />}

          {step.stageIngredients?.length > 0 && (
            <div className="border border-line-soft rounded-sm p-3 bg-sunken">
              <div className="text-[10px] uppercase tracking-widest text-muted font-body mb-2 flex items-center gap-1.5">
                <ChefHat size={11} strokeWidth={1.5} />
                本阶段投料
              </div>
              <div className="flex flex-wrap gap-2">
                {step.stageIngredients.map((ing) => (
                  <span
                    key={ing.id}
                    className="inline-flex items-baseline gap-1.5 px-2.5 py-1 rounded-sm bg-surface border border-line text-xs"
                  >
                    <span className="text-ink">{ing.name}</span>
                    <span className="font-mono text-accent-ink tabular-nums">
                      {ing.weight}
                    </span>
                    <span className="text-[10px] text-faint">g</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {step.tips?.length > 0 && (
            <ul className="space-y-2.5">
              {step.tips.map((t, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-ink font-body leading-relaxed">
                  <span className="block w-1 h-1 rounded-full bg-faint mt-2 shrink-0" aria-hidden />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          )}

          {children}
        </div>

        {/* 标记完成按钮 */}
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex items-center gap-1.5 h-8 px-3 text-xs rounded-sm bg-accent text-white hover:bg-accent-ink transition-colors ease-editorial duration-fast"
          >
            <Check size={11} strokeWidth={2} />
            标记完成
          </button>
        </div>
      </div>
    </article>
  );
}

/** 折叠行（pending & done 共用） */
function CollapsedRow({ step, index, trailing, badge, strike }) {
  return (
    <div className="pl-5 pr-4 py-4 sm:pl-6 sm:pr-5 sm:py-5 flex items-center justify-between gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-mono text-[10px] text-faint tabular-nums">
            {String(index).padStart(2, '0')}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-faint font-body">
            {step.subtitle}
          </span>
          {badge}
        </div>
        <h3
          className={cn(
            'font-display text-lg sm:text-xl tracking-tight leading-tight',
            strike ? 'text-muted line-through' : 'text-ink'
          )}
        >
          {step.title}
        </h3>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <div className="font-mono text-base tabular-nums text-ink">
            {step.timeValue}
          </div>
          <div className="text-[10px] text-faint font-body">
            {step.timeUnit}
          </div>
        </div>
        {trailing}
      </div>
    </div>
  );
}

function MixerBlock({ params }) {
  const stages = [params.stage1, params.stage2].filter(Boolean);
  return (
    <div className="border border-line-soft rounded-sm p-3 bg-sunken">
      <div className="text-[10px] uppercase tracking-widest text-muted font-body mb-2">
        厨师机 · Mixer
      </div>
      <div className={cn('grid gap-2', stages.length > 1 ? 'grid-cols-2' : 'grid-cols-1')}>
        {stages.map((s, i) => (
          <div key={i} className="flex items-baseline gap-2 text-xs">
            <span className="font-mono text-accent-ink tabular-nums">{s.speed}</span>
            <span className="text-[10px] text-faint">档</span>
            <span className="text-faint">·</span>
            <span className="font-mono text-ink tabular-nums">{s.time}</span>
            <span className="text-[10px] text-faint flex-1 truncate">{s.goal}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StepCard;
