import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '../../lib/cn.js';

/**
 * NumberField — 数字输入，+ / − 步进
 *
 * Props:
 *   label     上方标签（可选）
 *   hint      右侧附注（如 "Loaves"）
 *   value     当前值
 *   onChange(next)
 *   min, max, step  (min 默认 0, max 默认 Infinity, step 默认 1)
 *   unit      数字后缀（"g" 等）
 */
export function NumberField({
  label,
  hint,
  value,
  onChange,
  min = 0,
  max = Infinity,
  step = 1,
  unit,
  className,
}) {
  const clamp = (n) => Math.max(min, Math.min(max, n));
  const dec = () => onChange(clamp(value - step));
  const inc = () => onChange(clamp(value + step));
  const decDisabled = value <= min;
  const incDisabled = value >= max;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {(label || hint) && (
        <div className="flex items-baseline justify-between">
          {label && (
            <label className="text-xs uppercase tracking-widest text-muted font-body">
              {label}
            </label>
          )}
          {hint && <span className="text-xs text-faint font-body">{hint}</span>}
        </div>
      )}
      <div className="flex items-stretch border border-line bg-surface rounded-sm overflow-hidden">
        <button
          type="button"
          onClick={dec}
          disabled={decDisabled}
          aria-label="减少"
          className="w-12 flex items-center justify-center text-muted hover:bg-sunken hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent transition-colors ease-editorial duration-fast"
        >
          <Minus size={16} strokeWidth={1.5} />
        </button>
        <div className="flex-1 flex items-baseline justify-center gap-1 py-3">
          <span className="font-display text-3xl font-semibold tabular-nums text-ink tracking-tight">
            {value}
          </span>
          {unit && <span className="text-sm text-faint font-mono mb-1">{unit}</span>}
        </div>
        <button
          type="button"
          onClick={inc}
          disabled={incDisabled}
          aria-label="增加"
          className="w-12 flex items-center justify-center text-muted hover:bg-sunken hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent transition-colors ease-editorial duration-fast"
        >
          <Plus size={16} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

export default NumberField;
