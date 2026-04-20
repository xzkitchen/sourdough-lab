import React, { useMemo, useRef, useCallback, useEffect } from 'react';
import { cn } from '../../lib/cn.js';
import { calculateRecipe } from '../../domain/calculator.js';
import { SpecimenCard } from './SpecimenCard.jsx';

/**
 * FlavorPresets —— Ledger V2 SPECIMEN 横排（不贴屏幕边）
 *
 * - strip 不再 -mx bleed 到屏幕边，保持在 LedgerSection 容器内
 * - 每张卡 ~52vw / 最大 170px，一屏可见 1.5–2 张
 * - 滑动停止 150ms 后自动把最接近中心的卡设为 active（无需再点一次）
 * - 点击仍然立即 apply + 平滑滚动到中心
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
  const scrollSettleTimeoutRef = useRef(null);
  const programmaticScrollRef = useRef(false);

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

  const findClosestFlavor = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return null;
    const centerX = container.scrollLeft + container.clientWidth / 2;
    let closest = null;
    let closestDist = Infinity;
    for (const f of flavors) {
      const el = itemRefs.current[f.id];
      if (!el) continue;
      const elCenter = el.offsetLeft + el.offsetWidth / 2;
      const dist = Math.abs(centerX - elCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closest = f;
      }
    }
    return closest;
  }, [flavors]);

  const handleScroll = useCallback(() => {
    if (programmaticScrollRef.current) return;
    clearTimeout(scrollSettleTimeoutRef.current);
    scrollSettleTimeoutRef.current = setTimeout(() => {
      const closest = findClosestFlavor();
      if (closest && closest.id !== activeFlavorId) {
        onApply(closest);
      }
    }, 150);
  }, [activeFlavorId, findClosestFlavor, onApply]);

  const scrollToFlavor = useCallback((flavorId, behavior = 'smooth') => {
    const container = scrollRef.current;
    const el = itemRefs.current[flavorId];
    if (!container || !el) return;
    const target = el.offsetLeft - (container.clientWidth - el.clientWidth) / 2;
    const max = container.scrollWidth - container.clientWidth;
    const left = Math.max(0, Math.min(max, target));
    programmaticScrollRef.current = true;
    container.scrollTo({ left, behavior });
    setTimeout(() => {
      programmaticScrollRef.current = false;
    }, behavior === 'smooth' ? 500 : 50);
  }, []);

  const handleClick = useCallback(
    (flavor) => {
      onApply(flavor);
      scrollToFlavor(flavor.id, 'smooth');
    },
    [onApply, scrollToFlavor]
  );

  // Initial mount: jump to active flavor without animation
  useEffect(() => {
    if (activeFlavorId) {
      scrollToFlavor(activeFlavorId, 'auto');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={cn('relative', className)}>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={cn(
          'flex overflow-x-auto overflow-y-visible snap-x snap-mandatory',
          'gap-0 pr-[40%] pb-1 no-scrollbar'
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
                base={base}
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
