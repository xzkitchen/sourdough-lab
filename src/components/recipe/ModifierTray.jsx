import React from 'react';
import { cn } from '../../lib/cn.js';
import { ModifierCard } from './ModifierCard.jsx';

/**
 * ModifierTray — 全量平铺（单列），不再折叠。
 *
 * 已选项置顶，剩余按原顺序。
 */
export function ModifierTray({
  modifiers,
  selected,
  onToggle,
  onDoseChange,
  className,
}) {
  const selectedIds = new Set(selected.map((s) => s.id));
  const sorted = [
    ...modifiers.filter((m) => selectedIds.has(m.id)),
    ...modifiers.filter((m) => !selectedIds.has(m.id)),
  ];
  const doseFor = (id) => selected.find((s) => s.id === id)?.dose;

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {sorted.map((m) => (
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
  );
}

export default ModifierTray;
