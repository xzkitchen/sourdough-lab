import React, { useMemo, useRef, useCallback, useEffect } from 'react';
import { cn } from '../../lib/cn.js';
import { calculateRecipe } from '../../domain/calculator.js';
import { SpecimenCard } from './SpecimenCard.jsx';

/**
 * FlavorPresets —— Ledger V2 SPECIMEN 横排
 *
 * 不再有大标题 header（由外层 LedgerSection 承担），只渲染一条 snap-scroll 的卡片 strip。
 * 每张 SpecimenCard 调 calculateRecipe 算出自己的 actualHydration 显示。
 *
 * Props:
 *   base, flavors, selected, onApply, numUnits, className
 */
export function FlavorPresets({
  base,
  flavors,
  selected,
  onApply,
  numUnits = 3,
  className,
}) {
  const scrollRef = useRef(null);
  const itemRefs = useRef({});

  const activeFlavorId = flavors.find((f) => {
    if (f.modifiers.length !== selected.length) return false;
    return f.modifiers.every((m) => {
      const sel = selected.find((s) => s.id === m.id);
      if (!sel) return false;
      return Math.abs((sel.dose ?? 0) - (m.dose ?? 0)) < 0.0001 || sel.dose === undefined;
    });
  })?.id;

  const hydrationByFlavor = useMemo(() => {
    const map = {};
    for (const f of flavors) {
      try {
        const calc = calculateRecipe({
          base,
          numUnits,
          selectedModifiers: f.modifiers,
        });
        map[f.id] = Math.round(calc.actualHydration * 100);
      } catch {
        map[f.id] = Math.round(base.hydration * 100);
      }
    }
    return map;
  }, [base, flavors, numUnits]);

  const handleClick = useCallback(
    (flavor) => {
      onApply(flavor);
      const container = scrollRef.current;
      const el = itemRefs.current[flavor.id];
      if (container && el) {
        setTimeout(() => {
          const target = el.offsetLeft - (container.clientWidth - el.clientWidth) / 2;
          const max = container.scrollWidth - container.clientWidth;
          container.scrollTo({
            left: Math.max(0, Math.min(max, target)),
            behavior: 'smooth',
          });
        }, 120);
      }
    },
    [onApply]
  );

  useEffect(() => {
    if (!activeFlavorId) return;
    const container = scrollRef.current;
    const el = itemRefs.current[activeFlavorId];
    if (container && el) {
      const target = el.offsetLeft - (container.clientWidth - el.clientWidth) / 2;
      const max = container.scrollWidth - container.clientWidth;
      container.scrollLeft = Math.max(0, Math.min(max, target));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={cn('relative', className)}>
      <div
        ref={scrollRef}
        className={cn(
          'flex overflow-x-auto overflow-y-visible snap-x snap-mandatory',
          'gap-0 -mx-5 px-5 sm:-mx-8 sm:px-8',
          'pb-1 no-scrollbar'
        )}
      >
        {flavors.map((f, i) => {
          const last = i === flavors.length - 1;
          return (
            <div
              key={f.id}
              ref={(el) => {
                itemRefs.current[f.id] = el;
              }}
              className={cn('shrink-0', !last && '-mr-px')}
            >
              <SpecimenCard
                ordinal={i + 1}
                flavor={f}
                hydrationPct={hydrationByFlavor[f.id] ?? Math.round(base.hydration * 100)}
                active={f.id === activeFlavorId}
                onSelect={() => handleClick(f)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * SectionHeader —— 兼容旧 API 的保留导出（FeedPanel 可能仍 import）
 *
 * V2 里 section header 由 LedgerSection 承担；这个只是兜底。
 */
export function SectionHeader({ title, latin, right, className }) {
  return (
    <div className={cn('flex items-baseline justify-between gap-3', className)}>
      <div className="flex items-baseline gap-2 min-w-0">
        <span
          className="font-display text-ink tracking-tight leading-none"
          style={{ fontSize: 18, fontVariationSettings: "'opsz' 18, 'wght' 400" }}
        >
          {title}
        </span>
        {latin && (
          <>
            <span className="text-faint text-[10px]" aria-hidden>·</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-faint font-body">
              {latin}
            </span>
          </>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

export default FlavorPresets;
