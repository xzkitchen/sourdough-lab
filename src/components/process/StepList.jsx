import React, { useState, useCallback, useRef, useEffect } from 'react';

/**
 * StepList — V2 Ledger 流程清单
 *
 * 特性：
 *   - 编号步骤卡（NN/total），点击展开看 tips
 *   - "NOW" + "+ MOD" 标签
 *   - Mark complete → 自动展开下一未完成步骤
 *   - Locked 守卫：未到的步骤可以预读，但不能"跳着"标完成
 *   - 已完成的步骤可以再次点开 → "↶ Undo" 撤销该步
 *   - 顶部进度条 + Reset 按钮（confirm 二次确认）
 *
 * Props:
 *   steps             enhanceSteps() 输出
 *   completedIds      Set<string>
 *   onToggle(stepId)
 *   onReset()
 *   coldSlot          可选：ColdRetardTracker 的 React 节点，会被插入到 phase='cold' 的步骤展开区
 */
export function StepList({ steps, completedIds, onToggle, onReset, coldSlot }) {
  const [openId, setOpenId] = useState(null);

  // Reset 二步确认状态：'idle' → 'confirming' → reset/timeout 回 'idle'
  // 不用 window.confirm()，因为 iOS Safari standalone PWA 模式会静默拦截原生对话框。
  const [resetState, setResetState] = useState('idle');
  const resetTimerRef = useRef(null);

  const completed = steps.filter(s => completedIds.has(s.id)).length;
  const total = steps.length;
  const percent = total > 0 ? Math.round(completed / total * 100) : 0;

  // 当前可推进的下一步：第一个未完成
  const currentStepId = steps.find(s => !completedIds.has(s.id))?.id || null;

  const markComplete = useCallback((stepId) => {
    onToggle(stepId);
    // 找下一个未完成（排除刚 toggle 的这一步）
    const idx = steps.findIndex(s => s.id === stepId);
    const next = steps.slice(idx + 1).find(s => !completedIds.has(s.id));
    setOpenId(next ? next.id : null);
  }, [onToggle, steps, completedIds]);

  const undoStep = useCallback((stepId) => {
    onToggle(stepId);
    setOpenId(stepId);
  }, [onToggle]);

  const handleReset = useCallback(() => {
    if (completed === 0) return;
    if (resetState === 'idle') {
      // 第一次点：进入待确认态，3 秒未二次点则回滚
      setResetState('confirming');
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => {
        setResetState('idle');
        resetTimerRef.current = null;
      }, 3000);
    } else {
      // 第二次点：执行重置
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
        resetTimerRef.current = null;
      }
      setResetState('idle');
      onReset();
      setOpenId(steps[0]?.id || null);
    }
  }, [completed, onReset, steps, resetState]);

  // unmount 清理
  useEffect(() => () => {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
  }, []);

  return (
    <div className="space-y-0">
      {/* 进度头条 */}
      <div className="border-t-2 border-b-2 border-ink py-3 mb-6">
        <div className="flex justify-between items-end">
          <div>
            <div className="font-mono text-2xs text-faint uppercase tracking-[0.30em]">
              Progress · 进度
            </div>
            <div className="font-mono text-xs text-muted mt-1">
              {completed} / {total} steps
            </div>
          </div>
          <div className="flex items-end gap-3">
            <button
              type="button"
              onClick={handleReset}
              disabled={completed === 0}
              aria-pressed={resetState === 'confirming'}
              className={[
                'self-center font-mono text-2xs uppercase tracking-[0.30em] px-2.5 py-1.5 border transition-colors duration-fast whitespace-nowrap',
                completed === 0
                  ? 'border-line-soft text-faint cursor-not-allowed'
                  : resetState === 'confirming'
                    ? 'border-accent bg-accent text-bg cursor-pointer animate-pulse'
                    : 'border-ink text-ink hover:bg-ink hover:text-bg cursor-pointer',
              ].join(' ')}
            >
              {resetState === 'confirming' ? '↻ Confirm?' : '↻ Reset'}
            </button>
            <div className="font-display font-medium text-4xl text-ink leading-none tabular-nums" style={{ letterSpacing: '-0.04em' }}>
              {percent}
              <span className="font-mono text-base text-faint">%</span>
            </div>
          </div>
        </div>
        {/* 段位条 */}
        <div className="flex mt-2.5 border border-ink">
          {steps.map(s => {
            const done = completedIds.has(s.id);
            const isCurrent = s.id === currentStepId;
            return (
              <div
                key={s.id}
                className="flex-1 h-2 border-r border-line-soft last:border-r-0"
                style={{
                  background: done
                    ? 'var(--seg-done)'
                    : isCurrent
                      ? 'var(--seg-current)'
                      : 'transparent',
                }}
              />
            );
          })}
        </div>
        <style>{`
          :root { --seg-done: #1A1715; --seg-current: #B85A3E; }
        `}</style>
      </div>

      {/* 步骤列表 */}
      {steps.map((s, i) => (
        <StepRow
          key={s.id}
          step={s}
          index={i}
          done={completedIds.has(s.id)}
          isCurrent={s.id === currentStepId}
          isOpen={openId === s.id}
          onOpen={() => setOpenId(openId === s.id ? null : s.id)}
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
  const prevStepNum = prevIncomplete
    ? null /* 计算延后注入避免 closure */
    : null;

  return (
    <div
      onClick={onOpen}
      className={[
        '-mb-px border border-ink cursor-pointer relative transition-opacity duration-fast',
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

      {/* 展开区：未完成 → tips + Mark/Locked */}
      {isOpen && !done && (
        <div className="border-t border-line-soft pl-4 sm:pl-14 pr-4 py-3 bg-surface" onClick={(e) => e.stopPropagation()}>
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

          {/* Cold retard 计时器插入（仅 phase='cold'）*/}
          {coldSlot && <div className="mt-3">{coldSlot}</div>}

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

      {/* 展开区：已完成 → Undo（右对齐：符合右手拇指操作习惯）*/}
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
