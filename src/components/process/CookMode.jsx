import React, { useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '../../lib/cn.js';

/**
 * CookMode — 全屏单步模式（厨房手脏友好）
 *
 * 大字显示当前步骤 + 配料 + 时间，屏幕点击空白翻页。
 *
 * Props:
 *   open          boolean
 *   steps         enhanceSteps 的输出
 *   completedIds  Set<string>
 *   cursorIndex   number (当前查看的步骤 index)
 *   onCursor(n)
 *   onToggle(stepId)
 *   onClose()
 */
export function CookMode({
  open,
  steps,
  completedIds,
  cursorIndex,
  onCursor,
  onToggle,
  onClose,
}) {
  const step = steps[cursorIndex];
  const canPrev = cursorIndex > 0;
  const canNext = cursorIndex < steps.length - 1;

  const prev = useCallback(() => canPrev && onCursor(cursorIndex - 1), [canPrev, cursorIndex, onCursor]);
  const next = useCallback(() => canNext && onCursor(cursorIndex + 1), [canNext, cursorIndex, onCursor]);

  // 键盘左右方向键翻页，Esc 退出
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'Escape') onClose();
      else if (e.key === ' ') {
        e.preventDefault();
        if (step) onToggle(step.id);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, prev, next, onClose, onToggle, step]);

  return (
    <AnimatePresence>
      {open && step && (
        <motion.div
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
          className="fixed inset-0 z-50 bg-bg"
          role="dialog"
          aria-modal="true"
          aria-label="Cook Mode"
        >
          {/* 顶栏 */}
          <div className="absolute top-0 left-0 right-0 px-6 py-5 flex items-center justify-between z-10">
            <div className="text-[10px] uppercase tracking-[0.2em] text-faint font-body">
              Cook Mode · {String(cursorIndex + 1).padStart(2, '0')} / {steps.length}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="退出 Cook Mode"
              className="w-9 h-9 flex items-center justify-center rounded-sm border border-line text-muted hover:text-ink hover:border-accent-line bg-surface transition-colors ease-editorial duration-fast"
            >
              <X size={14} strokeWidth={1.5} />
            </button>
          </div>

          {/* 进度条 */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-sunken mt-16">
            <motion.div
              className="h-full bg-accent"
              initial={false}
              animate={{ width: `${((cursorIndex + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            />
          </div>

          {/* 主内容 —— 支持左右拖动翻页 */}
          <div className="absolute inset-0 pt-20 pb-24 px-8 flex items-center justify-center overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.25}
                onDragEnd={(_, info) => {
                  const { offset, velocity } = info;
                  if ((offset.x < -80 || velocity.x < -400) && canNext) {
                    next();
                  } else if ((offset.x > 80 || velocity.x > 400) && canPrev) {
                    prev();
                  }
                }}
                className="max-w-2xl w-full space-y-8 cursor-grab active:cursor-grabbing"
              >
                <header className="space-y-3 text-center">
                  <div className="text-[11px] uppercase tracking-[0.25em] text-accent-ink font-body">
                    {step.subtitle}
                  </div>
                  <h1 className="font-display text-5xl md:text-6xl text-ink leading-[1.05] tracking-tight">
                    {step.title}
                  </h1>
                  <div className="flex items-baseline justify-center gap-3 text-muted font-body">
                    <span className="font-mono text-2xl text-ink tabular-nums">
                      {step.timeValue}
                    </span>
                    <span className="text-sm">{step.timeUnit}</span>
                    <span className="text-faint">·</span>
                    <span className="text-sm">{step.action}</span>
                  </div>
                </header>

                {step.warning && (
                  <div className="text-center">
                    <span className="inline-block px-3 py-1.5 rounded-sm bg-warn-bg text-warn text-xs font-body border-l-2 border-warn">
                      ⚠ {step.warning}
                    </span>
                  </div>
                )}

                {/* 投料 */}
                {step.stageIngredients?.length > 0 && (
                  <div className="border border-line bg-surface p-6">
                    <div className="text-[10px] uppercase tracking-widest text-muted font-body mb-3">
                      本阶段投料
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {step.stageIngredients.map((ing) => (
                        <div key={ing.id} className="flex items-baseline justify-between border-b border-line-soft pb-2">
                          <span className="text-base text-ink font-body">{ing.name}</span>
                          <span>
                            <span className="font-mono text-xl text-accent-ink tabular-nums">
                              {ing.weight}
                            </span>
                            <span className="text-xs text-faint ml-1">g</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tips */}
                {step.tips?.length > 0 && (
                  <ul className="space-y-4">
                    {step.tips.map((t, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-4 text-lg text-ink font-body leading-relaxed"
                      >
                        <span className="font-mono text-sm text-faint tabular-nums mt-1.5 shrink-0">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 底部操作栏 */}
          <div className="absolute bottom-0 left-0 right-0 px-6 py-5 flex items-center justify-between gap-4 z-10 bg-bg/80 backdrop-blur-sm border-t border-line">
            <button
              type="button"
              onClick={prev}
              disabled={!canPrev}
              aria-label="上一步"
              className={cn(
                'w-11 h-11 flex items-center justify-center rounded-sm transition-colors ease-editorial duration-fast',
                canPrev
                  ? 'border border-line text-ink hover:border-accent-line bg-surface'
                  : 'border border-line-soft text-faint cursor-not-allowed bg-surface'
              )}
            >
              <ChevronLeft size={18} strokeWidth={1.5} />
            </button>

            <button
              type="button"
              onClick={() => {
                onToggle(step.id);
                // 自动前进
                if (!completedIds.has(step.id) && canNext) {
                  setTimeout(next, 200);
                }
              }}
              className={cn(
                'flex-1 h-11 inline-flex items-center justify-center gap-2 rounded-sm font-body font-medium text-sm transition-colors ease-editorial duration-fast',
                completedIds.has(step.id)
                  ? 'border border-line text-muted hover:text-ink bg-surface'
                  : 'bg-accent text-white hover:bg-accent-ink'
              )}
            >
              <Check size={14} strokeWidth={2} />
              {completedIds.has(step.id) ? '已完成 · 点击撤销' : '标记完成'}
            </button>

            <button
              type="button"
              onClick={next}
              disabled={!canNext}
              aria-label="下一步"
              className={cn(
                'w-11 h-11 flex items-center justify-center rounded-sm transition-colors ease-editorial duration-fast',
                canNext
                  ? 'border border-line text-ink hover:border-accent-line bg-surface'
                  : 'border border-line-soft text-faint cursor-not-allowed bg-surface'
              )}
            >
              <ChevronRight size={18} strokeWidth={1.5} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CookMode;
