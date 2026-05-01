import React, { useCallback } from 'react';

/**
 * StepList — V2 Ledger 流程清单
 *
 * 特性：
 *   - 编号步骤卡（NN/total），点击展开看 tips
 *   - "NOW" + "+ MOD" 标签
 *   - Mark complete → 自动展开下一未完成步骤 + 平滑滚到 sticky 头部下方
 *   - Locked 守卫：未到的步骤可以预读，但不能"跳着"标完成
 *   - 已完成的步骤可以再次点开 → "↶ Undo" 撤销该步
 *
 * 注：Reset 按钮在 ProcessProgress（sticky 头部）里。
 * openId 已抬到 App 层，让 reset 能同时弹回第一步。
 *
 * Props:
 *   steps             enhanceSteps() 输出
 *   completedIds      Set<string>
 *   currentStepId     string | null
 *   openId            string | null  当前展开的 step（受控）
 *   onOpenChange(id)  展开 step 切换
 *   onToggle(stepId)
 *   coldSlot          可选：ColdRetardTracker 的 React 节点
 */
export function StepList({ steps, completedIds, currentStepId, openId, onOpenChange, onToggle, coldSlot }) {
  // 完成步骤后自动滚到下一步：scrollIntoView + scroll-mt 已在 StepRow 上设
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
      {/* 步骤列表 */}
      {steps.map((s, i) => (
        <StepRow
          key={s.id}
          step={s}
          index={i}
          done={completedIds.has(s.id)}
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
      onClick={onOpen}
      className={[
        '-mb-px border border-ink cursor-pointer relative transition-opacity duration-fast',
        // 滚动 offset：sticky nav (~80) + sticky progress (~70) + 12px 呼吸 ≈ 162
        'scroll-mt-[150px] sm:scroll-mt-[162px]',
        done ? (isCurrent ? '' : 'bg-bg') : (isCurrent ? 'bg-surface' : 'bg-bg'),
        done && !isOpen ? 'opacity-40' : 'opacity-100',
      ].join(' ')}
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
              <span className="font-mono text-2xs text-ink border border-ink px-1.5 py-0.5 tracking-[0.20em] leading-none">
                + MOD
              </span>
            )}
          </div>
          <div className="font-mono text-[11px] sm:text-xs text-faint uppercase tracking-[0.18em] mt-1 truncate">
            {step.subtitle}
          </div>
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

      {/* 展开区：未完成 → 克数块 + tips + Mark/Locked */}
      {isOpen && !done && (
        <div className="border-t border-line-soft pl-4 sm:pl-14 pr-4 py-3 bg-surface" onClick={(e) => e.stopPropagation()}>

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

          {/* Cold retard 计时器插入（仅 phase='cold' 且未被 lock）。
              locked 时不渲染——让下方的 "Locked · 需先完成 X" 面板单独说话，
              避免用户绕过流程顺序在 cold-retard 上误点 Start。*/}
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
              onClick={(e) => { e.stopPropagation(); onComplete(); }}
              className="mt-2.5 px-4 py-2 bg-ink text-bg font-mono text-xs uppercase tracking-[0.30em] cursor-pointer hover:bg-accent-ink transition-colors duration-fast"
            >
              Mark complete ✓
            </button>
          )}
        </div>
      )}

      {/* 展开区：已完成 → Undo（右对齐）*/}
      {isOpen && done && (
        <div
          className="border-t border-line-soft pl-4 sm:pl-14 pr-4 py-3 bg-surface flex items-center justify-between gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="font-mono text-2xs text-faint uppercase tracking-[0.24em]">
            ✓ Completed · 已完成
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onUndo(); }}
            className="px-3 py-1.5 bg-transparent text-ink border border-ink font-mono text-2xs uppercase tracking-[0.30em] cursor-pointer hover:bg-ink hover:text-bg active:bg-sunken transition-colors duration-fast whitespace-nowrap"
          >
            ↶ Undo
          </button>
        </div>
      )}
    </div>
  );
}

export default StepList;
