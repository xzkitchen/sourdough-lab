import React, { useCallback } from 'react';
import { StepTimer } from './StepTimer.jsx';

// 哪些步骤需要内置倒计时：等待型步骤（喂种/静置/折叠间隔/一发）+ 自溶 + 预整松弛。
// cold 有专属 ColdRetardTracker；bake/knead/shape 是持续操作，不需要计时器。
function needsTimer(step) {
  if (!step.minutes || step.minutes <= 0) return false;
  if (step.phase === 'prep' || step.phase === 'bulk') return true;
  return step.id === 'autolyse' || step.id === 'preshape';
}

/** 完成时刻 → "今日 14:32 / 昨日 / 周三 14:32" */
function fmtDoneTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const hm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  const day0 = new Date(d); day0.setHours(0, 0, 0, 0);
  const today0 = new Date(); today0.setHours(0, 0, 0, 0);
  const diff = Math.round((today0 - day0) / 86400000);
  if (diff === 0) return `今日 ${hm}`;
  if (diff === 1) return `昨日 ${hm}`;
  return `${diff}天前 ${hm}`;
}

/**
 * StepList — V2 Ledger 流程清单
 *
 * 特性：
 *   - 编号步骤卡（NN/total），点击展开看 tips（header 是 button，键盘可达）
 *   - "NOW" + "+ 投料" 标签
 *   - 完成 → 自动展开下一未完成步骤 + 平滑滚到 sticky 头部下方，并记录完成时刻
 *   - Locked 守卫：未到的步骤可以预读，但不能"跳着"标完成
 *   - 已完成的步骤可以再次点开 → "↶ 撤销" 撤销该步
 *
 * Props:
 *   steps / completedIds / currentStepId
 *   completedAt       { [stepId]: ts } 每步完成时刻
 *   openId / onOpenChange(id) / onToggle(stepId)
 *   coldSlot          可选：ColdRetardTracker 的 React 节点
 */
export function StepList({ steps, completedIds, completedAt = {}, currentStepId, openId, onOpenChange, onToggle, coldSlot }) {
  const scrollToStep = useCallback((stepId) => {
    setTimeout(() => {
      const el = document.querySelector(`[data-step-id="${stepId}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  }, []);

  const markComplete = useCallback((stepId) => {
    onToggle(stepId);
    const idx = steps.findIndex(s => s.id === stepId);
    const next = steps.slice(idx + 1).find(s => !completedIds.has(s.id));
    onOpenChange(next ? next.id : null);
    if (next) scrollToStep(next.id);
  }, [onToggle, onOpenChange, steps, completedIds, scrollToStep]);

  const undoStep = useCallback((stepId) => {
    onToggle(stepId);
    onOpenChange(stepId);
  }, [onToggle, onOpenChange]);

  return (
    <div className="space-y-0">
      {steps.map((s, i) => (
        <StepRow
          key={s.id}
          step={s}
          index={i}
          done={completedIds.has(s.id)}
          doneAt={completedAt[s.id]}
          isCurrent={s.id === currentStepId}
          isOpen={openId === s.id}
          onOpen={() => onOpenChange(openId === s.id ? null : s.id)}
          onComplete={() => markComplete(s.id)}
          onUndo={() => undoStep(s.id)}
          prevIncomplete={steps.slice(0, i).find(p => !completedIds.has(p.id))}
          coldSlot={s.phase === 'cold' ? coldSlot : null}
        />
      ))}

      <div className="font-mono text-2xs text-faint uppercase tracking-[0.30em] text-center py-7">
        — end —
      </div>
    </div>
  );
}

function StepRow({
  step,
  index,
  done,
  doneAt,
  isCurrent,
  isOpen,
  onOpen,
  onComplete,
  onUndo,
  prevIncomplete,
  coldSlot,
}) {
  const hasModInjection = (step.stageIngredients || []).length > 0;
  const locked = !done && !!prevIncomplete;

  return (
    <div
      data-step-id={step.id}
      className={[
        '-mb-px border border-ink relative transition-opacity duration-fast',
        // 滚动 offset 来自 index.css 的 --sticky-offset（mobile 150 / sm 162，单一来源）
        'scroll-mt-[var(--sticky-offset)]',
        done ? (isCurrent ? '' : 'bg-bg') : (isCurrent ? 'bg-surface' : 'bg-bg'),
        done && !isOpen ? 'opacity-40' : 'opacity-100',
      ].join(' ')}
    >
      {/* Header — 整行是 button，键盘可聚焦/回车展开 */}
      <button
        type="button"
        onClick={onOpen}
        aria-expanded={isOpen}
        className="block w-full text-left cursor-pointer"
      >
        <div className="grid items-stretch grid-cols-[44px_1fr_64px] sm:grid-cols-[52px_1fr_72px]">
          {/* 编号格 */}
          <div
            className={[
              'border-r border-ink flex items-center justify-center',
              done || isCurrent ? 'bg-ink text-bg' : 'text-ink',
            ].join(' ')}
          >
            <div className="font-display font-medium text-lg sm:text-xl">
              {String(index + 1).padStart(2, '0')}
            </div>
          </div>

          {/* 标题 + 标签 */}
          <div className="px-3 sm:px-3.5 py-3 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <div className={`font-zh text-[15px] sm:text-base font-medium ${done ? 'line-through' : ''}`}>
                {step.title}
              </div>
              {isCurrent && (
                <span className="font-mono text-2xs text-accent border border-accent px-1.5 py-0.5 tracking-[0.20em] leading-none">
                  NOW
                </span>
              )}
              {hasModInjection && !done && (
                <span
                  className="font-zh text-2xs text-ink border border-ink px-1.5 py-0.5 leading-none"
                  title="本步需要投入混入料"
                >
                  +投料
                </span>
              )}
            </div>
            <div className="font-mono text-[11px] sm:text-xs text-faint uppercase tracking-[0.18em] mt-1 truncate">
              {step.subtitle}
            </div>
            {/* 完成时刻：跨天回看"上一步几点做的" */}
            {done && doneAt && (
              <div className="font-zh text-2xs text-muted mt-1">
                ✓ {fmtDoneTime(doneAt)} 完成
              </div>
            )}
          </div>

          {/* 右侧时间 */}
          <div className="px-2 sm:px-3.5 py-3 text-right border-l border-line-soft border-dashed">
            <div className="font-mono text-[11px] sm:text-xs font-semibold text-ink tabular-nums">
              {step.timeValue}
            </div>
            <div className="font-mono text-2xs text-faint uppercase tracking-[0.15em] mt-0.5">
              {step.timeUnit}
            </div>
          </div>
        </div>
      </button>

      {/* 展开区：未完成 → 克数块 + tips + Mark/Locked */}
      {isOpen && !done && (
        <div className="border-t border-line-soft pl-4 sm:pl-14 pr-4 py-3 bg-surface">

          {/* 本阶段称量：base 食材克数（无标签前缀，每行一个，hairline 上下分隔）*/}
          {step.stageBaseGrams && (
            <div className="border-y border-line-soft py-1.5 mb-3">
              {step.stageBaseGrams.map((g, idx) => (
                <div
                  key={idx}
                  className="flex items-baseline justify-between py-1"
                >
                  <span className="font-zh text-sm text-ink">{g.name}</span>
                  <span className="font-mono text-sm text-ink tabular-nums whitespace-nowrap">
                    {g.weight}
                    <span className="text-2xs text-faint ml-0.5">g</span>
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* 分割预整：每团重 / 份数 / 总重 三行（同样的 hairline 块结构）*/}
          {step.perLoafInfo && (
            <div className="border-y border-line-soft py-1.5 mb-3">
              <div className="flex items-baseline justify-between py-1">
                <span className="font-zh text-sm text-ink">每个面团</span>
                <span className="font-mono text-sm text-ink tabular-nums whitespace-nowrap">
                  ~{step.perLoafInfo.perLoaf}
                  <span className="text-2xs text-faint ml-0.5">g</span>
                </span>
              </div>
              <div className="flex items-baseline justify-between py-1">
                <span className="font-zh text-sm text-muted">份数</span>
                <span className="font-mono text-sm text-muted tabular-nums whitespace-nowrap">
                  {step.perLoafInfo.numUnits}<span className="text-2xs text-faint ml-0.5">个</span>
                </span>
              </div>
              <div className="flex items-baseline justify-between py-1">
                <span className="font-zh text-sm text-muted">总重</span>
                <span className="font-mono text-sm text-muted tabular-nums whitespace-nowrap">
                  {step.perLoafInfo.total}
                  <span className="text-2xs text-faint ml-0.5">g</span>
                </span>
              </div>
            </div>
          )}

          {step.tips.map((t, j) => (
            <div
              key={j}
              className="grid font-zh text-sm text-muted leading-relaxed mb-1"
              style={{ gridTemplateColumns: '24px 1fr' }}
            >
              <span className="font-mono text-xs text-accent tracking-[0.10em]">
                {String(j + 1).padStart(2, '0')}
              </span>
              <span>{t}</span>
            </div>
          ))}

          {/* mixerParams（如有）*/}
          {step.mixerParams && (
            <div className="mt-3 pt-3 border-t border-line-soft">
              <div className="font-mono text-2xs text-faint uppercase tracking-[0.24em] mb-1.5">
                Mixer · 厨师机
              </div>
              {Object.entries(step.mixerParams).map(([key, p]) => (
                <div key={key} className="font-zh text-sm text-muted">
                  · 速度 {p.speed} / {p.time} — <span className="text-ink">{p.goal}</span>
                </div>
              ))}
            </div>
          )}

          {/* 等待型步骤的内置倒计时（fold 间隔 / 静置 / 一发 / 喂种）*/}
          {!locked && needsTimer(step) && (
            <StepTimer stepId={step.id} minutes={step.minutes} title={step.title} />
          )}

          {/* Cold retard 计时器插入（仅 phase='cold' 且未被 lock）*/}
          {coldSlot && !locked && <div className="mt-3">{coldSlot}</div>}

          {locked ? (
            <div className="mt-3 px-3 py-2 border border-line-soft border-dashed">
              <div className="font-mono text-2xs text-faint uppercase tracking-[0.24em] mb-1">
                Locked · 需先完成
              </div>
              <div className="font-zh text-xs text-muted">
                请先完成步骤：
                <strong className="text-ink ml-1">{prevIncomplete.title}</strong>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={onComplete}
              className="mt-2.5 px-4 py-2.5 min-h-[44px] bg-ink text-bg font-zh text-sm tracking-wide cursor-pointer hover:bg-accent-ink transition-colors duration-fast"
            >
              完成此步 ✓
            </button>
          )}
        </div>
      )}

      {/* 展开区：已完成 → Undo（右对齐）*/}
      {isOpen && done && (
        <div className="border-t border-line-soft pl-4 sm:pl-14 pr-4 py-3 bg-surface flex items-center justify-between gap-3">
          <div className="font-zh text-xs text-muted">
            ✓ 已完成{doneAt ? ` · ${fmtDoneTime(doneAt)}` : ''}
          </div>
          <button
            type="button"
            onClick={onUndo}
            className="px-3 py-2.5 min-h-[44px] bg-transparent text-ink border border-ink font-zh text-xs cursor-pointer hover:bg-ink hover:text-bg active:bg-sunken transition-colors duration-fast whitespace-nowrap"
          >
            ↶ 撤销
          </button>
        </div>
      )}
    </div>
  );
}

export default StepList;
