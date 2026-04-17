import React, { useId } from 'react';
import { cn } from '../../lib/cn.js';

/**
 * Slider — 横向滑杆（原生 range + 自绘轨/thumb）
 *
 * Props:
 *   label        上方标签
 *   value        number
 *   onChange(next)
 *   min, max, step
 *   marks        [{ value, label? }] 轨下刻度（可选）
 *   format(v)    值格式化函数（默认 String(v)）
 *   hint         右上角说明
 *   snap         是否吸附到 marks (默认 false；为 true 时 onChange 自动吸附)
 */
export function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  marks,
  format = String,
  hint,
  snap = false,
  className,
}) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;

  const handleChange = (e) => {
    let next = Number(e.target.value);
    if (snap && marks?.length) {
      // 吸附到最近的 mark
      let nearest = marks[0].value;
      let bestDist = Math.abs(next - nearest);
      for (const m of marks) {
        const d = Math.abs(next - m.value);
        if (d < bestDist) {
          bestDist = d;
          nearest = m.value;
        }
      }
      // 只在落入吸附距离内才 snap（距离 < step 的 1.5 倍）
      if (bestDist <= step * 1.5) next = nearest;
    }
    onChange(next);
  };

  return (
    <div className={cn('flex flex-col gap-2 w-full', className)}>
      {(label || hint) && (
        <div className="flex items-baseline justify-between">
          {label && (
            <label htmlFor={id} className="text-xs uppercase tracking-widest text-muted font-body">
              {label}
            </label>
          )}
          <span className="font-mono text-sm text-ink tabular-nums">{format(value)}</span>
        </div>
      )}

      <div className="relative">
        {/* 隐藏原生 range，覆盖在 track 上 */}
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          aria-label={label}
          className="sl-range absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        {/* Track */}
        <div className="relative h-6 flex items-center">
          <div className="absolute inset-x-0 h-[2px] bg-sunken rounded-sm" />
          <div
            className="absolute left-0 h-[2px] bg-accent rounded-sm transition-[width] ease-editorial duration-fast"
            style={{ width: `${pct}%` }}
          />
          {/* Thumb */}
          <div
            className="absolute w-4 h-4 rounded-pill bg-surface border border-accent shadow-sm -translate-x-1/2 transition-[left] ease-editorial duration-fast"
            style={{ left: `${pct}%` }}
          />
        </div>

        {/* Marks */}
        {marks?.length > 0 && (
          <div className="relative mt-1.5 h-4">
            {marks.map((m) => {
              const mPct = ((m.value - min) / (max - min)) * 100;
              const isActive = Math.abs(m.value - value) < step / 2;
              return (
                <div
                  key={m.value}
                  className="absolute -translate-x-1/2 flex flex-col items-center gap-0.5"
                  style={{ left: `${mPct}%` }}
                >
                  <div
                    className={cn(
                      'w-[1px] h-1',
                      isActive ? 'bg-accent' : 'bg-faint'
                    )}
                  />
                  {m.label && (
                    <span
                      className={cn(
                        'text-[10px] font-body tabular-nums',
                        isActive ? 'text-accent-ink' : 'text-faint'
                      )}
                    >
                      {m.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Slider;
