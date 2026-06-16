import React from 'react';
import { Snowflake, Thermometer, TimerReset } from 'lucide-react';

const MODES = [
  { id: 'standard', label: 'Standard', zh: '标准', meta: '24°C' },
  { id: 'summer', label: 'Summer', zh: '夏季', meta: '28°C' },
];

export function EnvironmentPanel({ mode, onModeChange, environment }) {
  const activeMode = environment?.mode || mode || 'standard';
  const actions = environment?.actions || [];
  const factor = environment?.fermentationFactor ?? 1;
  const timePct = Math.round(factor * 100);

  return (
    <div className="border border-ink bg-surface">
      <div className="grid grid-cols-2 border-b border-ink">
        {MODES.map((item, i) => {
          const active = item.id === activeMode;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onModeChange(item.id)}
              aria-pressed={active}
              className={[
                'px-3 py-3 text-left transition-colors duration-fast cursor-pointer',
                i > 0 ? 'border-l border-ink' : '',
                active ? 'bg-ink text-bg' : 'bg-bg text-ink hover:bg-sunken active:bg-sunken',
              ].join(' ')}
            >
              <div className={['font-mono text-2xs uppercase tracking-[0.22em]', active ? 'opacity-65' : 'text-faint'].join(' ')}>
                {item.label}
              </div>
              <div className="flex items-baseline justify-between gap-2 mt-1">
                <span className="font-zh text-sm font-medium">{item.zh}</span>
                <span className={['font-mono text-xs tabular-nums', active ? 'opacity-80' : 'text-muted'].join(' ')}>
                  {item.meta}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-3 divide-x divide-line-soft">
        <Metric icon={<Snowflake className="size-3.5" strokeWidth={1.7} />} item={actions[0]} />
        <Metric icon={<Thermometer className="size-3.5" strokeWidth={1.7} />} item={actions[1]} />
        <Metric icon={<TimerReset className="size-3.5" strokeWidth={1.7} />} item={actions[2]} />
      </div>

      <div className="border-t border-line-soft px-3 py-2 flex items-baseline justify-between gap-3">
        <div className="font-zh text-xs text-muted">
          配方克数不变
        </div>
        <div className="font-zh text-xs text-muted text-right">
          {activeMode === 'summer'
            ? `发酵更快，用时约为标准的 ${timePct}%`
            : '发酵按标准时长'}
        </div>
      </div>
    </div>
  );
}

function Metric({ icon = null, item }) {
  if (!item) return null;
  return (
    <div className="px-2.5 sm:px-3 py-3 min-w-0">
      <div className="font-mono text-2xs text-faint uppercase tracking-[0.16em] truncate flex items-center gap-1.5">
        {icon}
        <span className="truncate">{item.label}</span>
      </div>
      <div className="font-mono text-sm sm:text-base font-semibold text-ink tabular-nums mt-1 whitespace-nowrap">
        {item.value}
      </div>
    </div>
  );
}

export default EnvironmentPanel;
