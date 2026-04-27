import React, { useRef, useCallback } from 'react';
import { cn } from '../../lib/cn.js';
import { ColorOrb } from '../editorial/ColorOrb.jsx';

/**
 * FlavorPresets — 横向 feed
 *
 * v2 Editorial 差异：
 *   - 色球改用 Editorial 版 ColorOrb（grain 用 multiply）
 *   - 容器 overflow-y: visible + py-3 —— active 放大 3% 不再被裁
 *   - 选中态：名字 accent-ink + italic，底部 accent 小圆点
 *
 * NOTE: 色球内置 grain（每球独立 filter），无需全局 GrainFilter。
 */
export function FlavorPresets({ base, flavors, selected, onApply, className }) {
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

  const handleClick = useCallback((flavor) => {
    onApply(flavor);
    const container = scrollRef.current;
    const el = itemRefs.current[flavor.id];
    if (container && el) {
      setTimeout(() => {
        const target = el.offsetLeft - (container.clientWidth - el.clientWidth) / 2;
        const max = container.scrollWidth - container.clientWidth;
        container.scrollTo({ left: Math.max(0, Math.min(max, target)), behavior: 'smooth' });
      }, 120);
    }
  }, [onApply]);

  return (
    <section className={cn('space-y-4', className)}>
      <div className="px-4 sm:px-5">
        <SectionHeader title="Chef's Selection" latin="创意预设" />
      </div>

      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto overflow-y-visible snap-x snap-mandatory -mx-5 pl-5 pr-[50vw] sm:-mx-8 sm:pl-8 py-3 pb-1"
      >
        {flavors.map((f) => {
          const active = f.id === activeFlavorId;
          return (
            <button
              key={f.id}
              ref={(el) => { itemRefs.current[f.id] = el; }}
              type="button"
              onClick={() => handleClick(f)}
              aria-pressed={active}
              className="snap-center shrink-0 flex flex-col items-center gap-3 py-1 w-[88px] group"
            >
              <ColorOrb base={base} modifiers={f.modifiers} size={76} active={active} />
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className={cn(
                    'font-body text-[12px] leading-tight text-center whitespace-nowrap',
                    active ? 'text-accent-ink italic font-medium' : 'text-ink'
                  )}
                >
                  {f.name}
                </span>
                <span
                  className={cn(
                    'w-1 h-1 rounded-full transition-colors ease-editorial duration-fast',
                    active ? 'bg-accent' : 'bg-transparent'
                  )}
                  aria-hidden
                />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/** Section header — Editorial 版：Latin 主位，中文副位 */
export function SectionHeader({ title, latin, right, className }) {
  return (
    <div className={cn('flex items-baseline justify-between gap-3', className)}>
      <div className="flex items-baseline gap-2 min-w-0">
        <span
          className="font-display text-ink tracking-tight leading-none"
          style={{ fontSize: 16, fontVariationSettings: "'opsz' 18, 'wght' 400" }}
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
