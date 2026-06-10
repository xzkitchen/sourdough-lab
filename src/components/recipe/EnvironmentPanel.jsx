import React from 'react';
import { Minus, Plus, Snowflake, Thermometer } from 'lucide-react';

const QUICK_TEMPS = [24, 26, 28, 30];

export function EnvironmentPanel({ value, onChange, environment }) {
  const roomTempC = environment?.roomTempC ?? value;
  const targetWaterTempC = environment?.targetWaterTempC ?? 18;
  const targetDoughTempC = environment?.targetDoughTempC ?? 26;
  const bulkRiseTarget = environment?.bulkRiseTarget ?? '50-75%';
  const label = environment?.label ?? '标准室温';
  const factor = environment?.fermentationFactor ?? 1;

  const setTemp = (next) => onChange(Math.max(16, Math.min(34, next)));

  return (
    <div className="border border-ink bg-surface">
      <div className="grid grid-cols-[48px_1fr_48px] sm:grid-cols-[56px_1fr_56px] border-b border-ink">
        <button
          type="button"
          onClick={() => setTemp(roomTempC - 1)}
          aria-label="降低室温"
          className="min-h-[48px] border-r border-ink flex items-center justify-center hover:bg-sunken active:bg-sunken transition-colors duration-fast cursor-pointer"
        >
          <Minus className="size-4" strokeWidth={1.7} />
        </button>
        <div className="px-3 sm:px-4 py-3 flex items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <Thermometer className="size-4 text-accent shrink-0" strokeWidth={1.7} />
            <div className="min-w-0">
              <div className="font-mono text-2xs text-faint uppercase tracking-[0.22em] truncate">
                Room temp
              </div>
              <div className="font-zh text-xs text-muted mt-0.5 truncate">{label}</div>
            </div>
          </div>
          <div className="font-display font-medium text-3xl sm:text-4xl text-ink leading-none tabular-nums whitespace-nowrap">
            {roomTempC}
            <span className="font-mono text-sm sm:text-base text-faint ml-1">°C</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setTemp(roomTempC + 1)}
          aria-label="提高室温"
          className="min-h-[48px] border-l border-ink flex items-center justify-center hover:bg-sunken active:bg-sunken transition-colors duration-fast cursor-pointer"
        >
          <Plus className="size-4" strokeWidth={1.7} />
        </button>
      </div>

      <div className="grid grid-cols-4 border-b border-line-soft">
        {QUICK_TEMPS.map((temp) => {
          const active = temp === roomTempC;
          return (
            <button
              key={temp}
              type="button"
              onClick={() => setTemp(temp)}
              aria-pressed={active}
              className={[
                'py-2 font-mono text-xs tabular-nums transition-colors duration-fast cursor-pointer',
                temp > QUICK_TEMPS[0] ? 'border-l border-line-soft' : '',
                active ? 'bg-ink text-bg' : 'bg-bg text-muted hover:bg-sunken active:bg-sunken',
              ].join(' ')}
            >
              {temp}°C
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-3 divide-x divide-line-soft">
        <Metric
          icon={<Snowflake className="size-3.5" strokeWidth={1.7} />}
          label="Ice water"
          value={`${targetWaterTempC}-${targetWaterTempC + 2}°C`}
          zh="水温"
        />
        <Metric
          label="Dough"
          value={`${targetDoughTempC}-${targetDoughTempC + 1}°C`}
          zh="面温"
        />
        <Metric
          label={`${Math.round(factor * 100)}% time`}
          value={bulkRiseTarget}
          zh="一发体积"
        />
      </div>
    </div>
  );
}

function Metric({ icon = null, label, value, zh }) {
  return (
    <div className="px-2.5 sm:px-3 py-3 min-w-0">
      <div className="font-mono text-2xs text-faint uppercase tracking-[0.16em] truncate flex items-center gap-1.5">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div className="font-mono text-sm sm:text-base font-semibold text-ink tabular-nums mt-1 whitespace-nowrap">
        {value}
      </div>
      <div className="font-zh text-xs text-muted mt-0.5 truncate">{zh}</div>
    </div>
  );
}

export default EnvironmentPanel;
