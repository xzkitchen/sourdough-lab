import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/cn.js';
import { Button } from '../primitives/index.js';
import { ModifierCard } from './ModifierCard.jsx';

/**
 * ModifierTray — 色粉或混入料 托盘
 *
 * 始终可见（默认不折叠）。"查看全部 N 种"按钮控制是否显示全部 modifier。
 */
export function ModifierTray({
  title,
  sub,
  modifiers,
  selected,
  onToggle,
  onDoseChange,
  initialVisible = 4,
  hideHeader = false,
  className,
}) {
  const [showAll, setShowAll] = useState(false);
  const selectedIds = new Set(selected.map((s) => s.id));

  const sorted = [
    ...modifiers.filter((m) => selectedIds.has(m.id)),
    ...modifiers.filter((m) => !selectedIds.has(m.id)),
  ];
  const visibleCount = Math.max(initialVisible, selectedIds.size);
  const visible = showAll ? sorted : sorted.slice(0, visibleCount);
  const hiddenCount = sorted.length - visible.length;

  const doseFor = (id) => selected.find((s) => s.id === id)?.dose;

  return (
    <div className={cn('space-y-3', className)}>
      {!hideHeader && (
        <div className="flex items-baseline gap-2 px-0.5">
          <span className="font-display text-[15px] text-ink tracking-tight">
            {title}
          </span>
          {sub && (
            <span className="text-[10px] uppercase tracking-[0.18em] text-faint font-body">
              {sub}
            </span>
          )}
          {selectedIds.size > 0 && (
            <span className="ml-auto text-[10px] font-mono text-accent-ink tabular-nums">
              {selectedIds.size}
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {visible.map((m) => (
          <ModifierCard
            key={m.id}
            modifier={m}
            selected={selectedIds.has(m.id)}
            dose={doseFor(m.id)}
            onToggle={() => onToggle(m.id)}
            onDoseChange={(d) => onDoseChange(m.id, d)}
          />
        ))}
      </div>

      {hiddenCount > 0 && !showAll && (
        <div className="flex justify-start pt-1">
          <Button
            variant="text"
            size="sm"
            onClick={() => setShowAll(true)}
            iconRight={<ChevronDown size={12} strokeWidth={1.5} />}
          >
            更多 {hiddenCount}
          </Button>
        </div>
      )}
      {showAll && sorted.length > initialVisible && (
        <div className="flex justify-start pt-1">
          <Button variant="text" size="sm" onClick={() => setShowAll(false)}>
            收起
          </Button>
        </div>
      )}
    </div>
  );
}

export default ModifierTray;
