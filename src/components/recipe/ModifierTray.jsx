import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/cn.js';
import { Button } from '../primitives/index.js';
import { ModifierCard } from './ModifierCard.jsx';

/**
 * ModifierTray — 色粉或混入料 托盘（折叠式）
 *
 * 默认收起，只显示标题 + 已选数量徽记。
 * 点击标题栏或"展开"按钮才展开列表。
 * 如果有选中项，默认展开（保证用户能看到自己的选择）。
 */
export function ModifierTray({
  title,
  sub,
  modifiers,
  selected,
  onToggle,
  onDoseChange,
  initialVisible = 4,
  className,
}) {
  const selectedIds = new Set(selected.map((s) => s.id));
  // 有选中时默认展开；否则默认收起
  const [open, setOpen] = useState(selectedIds.size > 0);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (selectedIds.size > 0 && !open) setOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds.size]);

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
      {/* 标题行 — 可点击 */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 text-left group"
      >
        <div className="flex-1 flex items-baseline gap-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-faint font-body">
            {sub}
          </span>
          <span className="font-display text-base text-ink">{title}</span>
          {selectedIds.size > 0 && (
            <span className="text-[10px] font-mono text-accent-ink tabular-nums">
              {selectedIds.size}
            </span>
          )}
        </div>
        <ChevronDown
          size={14}
          strokeWidth={1.5}
          className={cn(
            'text-muted group-hover:text-ink transition-transform ease-editorial duration-fast',
            open && 'rotate-180'
          )}
          aria-hidden
        />
      </button>

      {open && (
        <div className="space-y-3">
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
            <div className="flex justify-center">
              <Button
                variant="text"
                size="sm"
                onClick={() => setShowAll(true)}
                iconRight={<ChevronDown size={12} strokeWidth={1.5} />}
              >
                查看全部 {sorted.length} 种
              </Button>
            </div>
          )}
          {showAll && sorted.length > initialVisible && (
            <div className="flex justify-center">
              <Button variant="text" size="sm" onClick={() => setShowAll(false)}>
                收起
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ModifierTray;
