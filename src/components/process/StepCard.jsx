import React from 'react';
import { Check, Undo2, ChefHat, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/cn.js';
import { Pill } from '../primitives/index.js';

/**
 * StepCard — 单步卡片（三态）
 *
 * 状态：
 *   pending：待开始，灰字 + 虚线左边
 *   current：进行中，麦色实线左边 + "当前" pill
 *   done   ：已完成，opacity 降 + 勾号徽记
 *
 * 关键修复（bug #3）：整卡不再 onClick；改为右下角独立 "标记完成" 按钮
 *
 * Props:
 *   step       process step object
 *   state      'pending' | 'current' | 'done'
 *   index      步骤序号 (1-based)
 *   onToggle() 点击"标记完成"/"撤销"时回调
 *   children   嵌套子元素（如 ColdRetardTracker）
 */
export function StepCard({ step, state, index, onToggle, children }) {
  const isDone = state === 'done';
  const isCurrent = state === 'current';

  return (
    <article
      className={cn(
        'relative rounded-md bg-surface transition-colors ease-editorial duration-base',
        'border',
        isCurrent ? 'border-accent' : 'border-line',
        isDone && 'opacity-55'
      )}
    >
      {/* 左侧状态 rail */}
      <div
        className={cn(
          'absolute left-0 top-4 bottom-4 w-[2px] rounded-full',
          isCurrent ? 'bg-accent' : isDone ? 'bg-line' : 'bg-line-soft'
        )}
        aria-hidden
      />

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
              {isCurrent && (
                <Pill tone="accent" size="sm">当前</Pill>
              )}
              {isDone && (
                <Pill tone="muted" size="sm" icon={<Check size={10} strokeWidth={2.5} />}>已完成</Pill>
              )}
            </div>
            <h3
              className={cn(
                'font-display text-lg sm:text-xl tracking-tight leading-tight',
                isDone ? 'text-muted line-through' : isCurrent ? 'text-accent-ink' : 'text-ink'
              )}
            >
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

        {/* Action pill */}
        {!isDone && (
          <div className="flex flex-wrap gap-2 mb-4">
            <Pill tone="neutral" size="md">
              {step.action}
            </Pill>
            {step.warning && (
              <Pill tone="warn" size="md" icon={<AlertTriangle size={11} strokeWidth={1.5} />}>
                {step.warning}
              </Pill>
            )}
          </div>
        )}

        {/* 展开：本阶段投料 + tips + 子组件 */}
        {!isDone && (
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
        )}

        {/* 完成按钮（独立，不冒泡） */}
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onToggle}
            className={cn(
              'inline-flex items-center gap-1.5 h-8 px-3 text-xs rounded-sm transition-colors ease-editorial duration-fast',
              isDone
                ? 'text-muted hover:text-ink border border-line hover:border-accent-line bg-surface'
                : isCurrent
                  ? 'bg-accent text-white hover:bg-accent-ink'
                  : 'text-muted hover:text-ink border border-line hover:border-accent-line bg-surface'
            )}
          >
            {isDone ? (
              <>
                <Undo2 size={11} strokeWidth={1.5} />
                撤销完成
              </>
            ) : (
              <>
                <Check size={11} strokeWidth={2} />
                标记完成
              </>
            )}
          </button>
        </div>
      </div>
    </article>
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
