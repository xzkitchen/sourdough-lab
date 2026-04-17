import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/cn.js';
import { hslToCss } from '../../domain/breadColor.js';
import { Slider } from '../primitives/index.js';

/**
 * ModifierCard — 单个 modifier (色粉/混入料)
 *
 * Props:
 *   modifier    modifier object
 *   selected    boolean
 *   dose        number (bp, e.g. 0.04 = 4%)
 *   onToggle()
 *   onDoseChange(dose)
 */
export function ModifierCard({
  modifier,
  selected,
  dose,
  onToggle,
  onDoseChange,
}) {
  const swatchColor = modifier.breadColor || modifier.dotColor || { h: 35, s: 20, l: 60 };
  const currentDose = dose ?? modifier.dose.default;

  return (
    <div
      className={cn(
        'group rounded-md border transition-colors ease-editorial duration-fast',
        selected
          ? 'bg-surface border-accent'
          : 'bg-surface border-line hover:border-accent-line'
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={selected}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        {/* Color swatch */}
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-line-soft"
          style={{ background: hslToCss(swatchColor) }}
          aria-hidden
        />

        {/* Name + Latin */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span
              className={cn(
                'font-body text-sm',
                selected ? 'text-ink font-medium' : 'text-ink'
              )}
            >
              {modifier.name}
            </span>
            <span className="text-[10px] text-faint font-body truncate">
              {modifier.nameLatin}
            </span>
          </div>
        </div>

        {/* Dose % or check */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={cn(
              'font-mono text-xs tabular-nums',
              selected ? 'text-accent-ink' : 'text-faint'
            )}
          >
            {Math.round(currentDose * 1000) / 10}%
          </span>
          <span
            className={cn(
              'w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ease-editorial duration-fast',
              selected
                ? 'bg-accent border-accent text-white'
                : 'border-line bg-surface'
            )}
            aria-hidden
          >
            {selected && <Check size={10} strokeWidth={2.5} />}
          </span>
        </div>
      </button>

      {/* Dose slider (仅选中时展开) */}
      {selected && (
        <div className="px-4 pb-4 pt-1">
          <Slider
            value={currentDose}
            onChange={onDoseChange}
            min={modifier.dose.min}
            max={modifier.dose.max}
            step={0.005}
            format={(v) => `${Math.round(v * 1000) / 10}%`}
            marks={[
              { value: modifier.dose.min,     label: `${modifier.dose.min * 100}%` },
              { value: modifier.dose.default, label: `${modifier.dose.default * 100}%` },
              { value: modifier.dose.max,     label: `${modifier.dose.max * 100}%` },
            ]}
            snap={false}
          />
        </div>
      )}
    </div>
  );
}

export default ModifierCard;
