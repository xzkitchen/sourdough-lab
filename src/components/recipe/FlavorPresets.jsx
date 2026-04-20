import React, { useMemo, useRef, useCallback, useEffect } from 'react';
import { cn } from '../../lib/cn.js';
import { calculateRecipe } from '../../domain/calculator.js';
import { FlavorOrb } from '../editorial/FlavorOrb.jsx';

/**
 * FlavorPresets —— Ledger V2 · Editorial 重构
 *
 * 放弃"10 张小卡共享 hairline"的档案柜感。
 * 改为「特写大卡 + 色球缩略图条」两层结构：
 *
 *   FeaturedSpecimen  —— 全宽大卡，展示当前激活 flavor
 *     · N° 01 ordinal + 72px FlavorOrb（带 grain 渐变色球）
 *     · 超大 Fraunces 中文名 + mono tracked 英文副标
 *     · hairline + 大号 HYDRATION 数字（pullquote）
 *     · 永远 bg-surface，不做 invert —— 色球本身就是锚点
 *
 *   FlavorThumbStrip  —— 色球缩略图横排（无卡片外框）
 *     · 10 个 44px FlavorOrb + 中文名
 *     · 选中态：色球外围 2px warn ring（offset 3px）+ 名字加重
 *     · 点击即选；滑动停止 150ms 后自动选中屏幕中心
 */
export function FlavorPresets({
  base,
  flavors,
  selected,
  onApply,
  numUnits = 3,
  className,
}) {
  // 匹配当前激活 flavor（失败回退到第一项，避免空态）
  const activeFlavorId = flavors.find((f) => {
    if (f.modifiers.length !== selected.length) return false;
    return f.modifiers.every((m) => {
      const sel = selected.find((s) => s.id === m.id);
      if (!sel) return false;
      return Math.abs((sel.dose ?? 0) - (m.dose ?? 0)) < 0.0001 || sel.dose === undefined;
    });
  })?.id;
  const activeFlavor =
    flavors.find((f) => f.id === activeFlavorId) || flavors[0];
  const activeOrdinal = flavors.findIndex((f) => f.id === activeFlavor.id) + 1;

  // 每 flavor 的 actualHydration (pct 0-100)
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

  return (
    <div className={cn('space-y-5', className)}>
      <FeaturedSpecimen
        ordinal={activeOrdinal}
        base={base}
        flavor={activeFlavor}
        hydrationPct={hydrationByFlavor[activeFlavor.id]}
      />
      <FlavorThumbStrip
        base={base}
        flavors={flavors}
        activeId={activeFlavor.id}
        onApply={onApply}
      />
    </div>
  );
}

// ── FeaturedSpecimen ──────────────────────────────────────────
function FeaturedSpecimen({ ordinal, base, flavor, hydrationPct }) {
  return (
    <article className="border border-line bg-surface px-5 py-5 sm:px-7 sm:py-7">
      {/* Header: ordinal + orb */}
      <div className="flex items-start justify-between gap-4">
        <span className="font-body uppercase tabular-nums tracking-[0.22em] text-[10px] text-faint leading-none pt-1">
          N°&nbsp;{String(ordinal).padStart(2, '0')}
        </span>
        <FlavorOrb
          base={base}
          modifiers={flavor.modifiers}
          size={72}
          className="drop-shadow-sm"
        />
      </div>

      {/* Name */}
      <div className="mt-5 space-y-2">
        <h3
          className="font-display text-ink leading-[1] tracking-tight"
          style={{
            fontSize: 'clamp(30px, 7.5vw, 44px)',
            fontVariationSettings: "'opsz' 48, 'SOFT' 50, 'wght' 400",
          }}
        >
          {flavor.name}
        </h3>
        <div className="font-body uppercase tracking-[0.16em] text-[11px] text-muted">
          {flavor.nameLatin}
        </div>
      </div>

      {/* Hydration pull-quote */}
      <div className="mt-5 pt-4 border-t border-line flex items-baseline justify-between">
        <span className="font-body uppercase tabular-nums tracking-[0.22em] text-[10px] text-faint">
          Hydration
        </span>
        <span
          className="font-display tabular-nums text-ink leading-none"
          style={{
            fontSize: 'clamp(24px, 5.6vw, 32px)',
            fontVariationSettings: "'opsz' 36, 'SOFT' 40, 'wght' 400",
          }}
        >
          {hydrationPct}
          <span className="text-[0.5em] text-faint ml-0.5">%</span>
        </span>
      </div>
    </article>
  );
}

// ── FlavorThumbStrip ──────────────────────────────────────────
function FlavorThumbStrip({ base, flavors, activeId, onApply }) {
  const scrollRef = useRef(null);
  const itemRefs = useRef({});
  const settleTimer = useRef(null);
  const programmaticScroll = useRef(false);

  const findClosest = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return null;
    const centerX = container.scrollLeft + container.clientWidth / 2;
    let closest = null;
    let closestDist = Infinity;
    for (const f of flavors) {
      const el = itemRefs.current[f.id];
      if (!el) continue;
      const ec = el.offsetLeft + el.offsetWidth / 2;
      const d = Math.abs(centerX - ec);
      if (d < closestDist) {
        closestDist = d;
        closest = f;
      }
    }
    return closest;
  }, [flavors]);

  const onScroll = useCallback(() => {
    if (programmaticScroll.current) return;
    clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      const f = findClosest();
      if (f && f.id !== activeId) onApply(f);
    }, 150);
  }, [activeId, findClosest, onApply]);

  // Mount: jump active to center, no animation
  useEffect(() => {
    const container = scrollRef.current;
    const el = itemRefs.current[activeId];
    if (container && el) {
      programmaticScroll.current = true;
      const target = el.offsetLeft - (container.clientWidth - el.clientWidth) / 2;
      const max = container.scrollWidth - container.clientWidth;
      container.scrollLeft = Math.max(0, Math.min(max, target));
      setTimeout(() => {
        programmaticScroll.current = false;
      }, 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = useCallback(
    (f) => {
      onApply(f);
      const container = scrollRef.current;
      const el = itemRefs.current[f.id];
      if (container && el) {
        programmaticScroll.current = true;
        const target = el.offsetLeft - (container.clientWidth - el.clientWidth) / 2;
        const max = container.scrollWidth - container.clientWidth;
        container.scrollTo({
          left: Math.max(0, Math.min(max, target)),
          behavior: 'smooth',
        });
        setTimeout(() => {
          programmaticScroll.current = false;
        }, 500);
      }
    },
    [onApply]
  );

  return (
    <div
      ref={scrollRef}
      onScroll={onScroll}
      className="flex gap-5 overflow-x-auto overflow-y-visible snap-x snap-mandatory pb-2 pt-2 pr-[35%] no-scrollbar"
    >
      {flavors.map((f) => {
        const active = f.id === activeId;
        return (
          <button
            key={f.id}
            ref={(el) => {
              itemRefs.current[f.id] = el;
            }}
            type="button"
            onClick={() => handleClick(f)}
            aria-pressed={active}
            className={cn(
              'snap-center shrink-0 flex flex-col items-center gap-2.5 w-[68px]',
              'transition-opacity ease-editorial duration-fast',
              !active && 'opacity-55 active:opacity-85'
            )}
          >
            {/* Orb + optional active ring */}
            <div
              className={cn(
                'relative rounded-full',
                active && 'ring-1 ring-offset-[3px] ring-offset-bg ring-warn'
              )}
            >
              <FlavorOrb base={base} modifiers={f.modifiers} size={44} />
            </div>
            <span
              className={cn(
                'font-body text-[11px] leading-tight text-center whitespace-nowrap',
                active ? 'text-ink' : 'text-muted'
              )}
              style={{
                fontVariationSettings: active ? "'wght' 500" : "'wght' 400",
              }}
            >
              {f.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// 保留旧 SectionHeader 兼容导出（BatchLog / FeedPanel 遗留 import）
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
