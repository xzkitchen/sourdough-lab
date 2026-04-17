import React, { useRef, useCallback } from 'react';
import { cn } from '../../lib/cn.js';
import { predictBreadColor } from '../../domain/breadColor.js';
import { buildGradientBackground } from '../../design/gradient.js';

/**
 * FlavorPresets — 横向滚动色球 feed
 *
 * 点击卡片：
 *   - 应用该 flavor
 *   - 自动平滑滚动到下一张（鼓励继续探索）
 *
 * 选中态：
 *   - 无描边
 *   - 色球保持
 *   - 下方名字转 accent-ink + font-medium
 *   - 色球下加 1 个 2px accent dot
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

  const handleClick = useCallback(
    (flavor, index) => {
      onApply(flavor);
      // 200ms 后把下一张卡平滑滚入视野
      const nextIndex = Math.min(index + 1, flavors.length - 1);
      const nextFlavor = flavors[nextIndex];
      const nextEl = itemRefs.current[nextFlavor?.id];
      if (nextEl && nextEl !== itemRefs.current[flavor.id]) {
        setTimeout(() => {
          nextEl.scrollIntoView({
            behavior: 'smooth',
            inline: 'center',
            block: 'nearest',
          });
        }, 180);
      }
    },
    [flavors, onApply]
  );

  return (
    <section className={cn('space-y-4', className)}>
      <GrainFilter />

      <SectionHeader
        title="创意预设"
        latin="Chef's picks"
        right={
          <div className="text-[10px] text-faint font-body tracking-wider tabular-nums">
            {flavors.length} 种 ·&nbsp;
            <span className="text-muted">← 滑动 →</span>
          </div>
        }
      />

      {/*
        横向 feed：
          - 左 px-5 正常起始留白
          - 右 pr-10 让最后一张卡"被截一半"露出 peek 暗示还有更多
          - 点击后自动滑到下一张居中
      */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto snap-x snap-mandatory -mx-5 pl-5 pr-10 sm:-mx-8 sm:pl-8 sm:pr-14 pb-1"
      >
        {flavors.map((f, i) => {
          const active = f.id === activeFlavorId;
          const prediction = predictBreadColor(base, f.modifiers);
          const gradientBg = buildGradientBackground(prediction, f.modifiers);
          return (
            <button
              key={f.id}
              ref={(el) => { itemRefs.current[f.id] = el; }}
              type="button"
              onClick={() => handleClick(f, i)}
              aria-pressed={active}
              className="snap-center shrink-0 flex flex-col items-center gap-3 py-1 w-[88px] group"
            >
              <ColorOrb background={gradientBg} size={76} active={active} />
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className={cn(
                    'font-body text-[12px] leading-tight text-center whitespace-nowrap',
                    active ? 'text-accent-ink font-medium' : 'text-ink'
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

/** Section header —— 堆叠式（eyebrow 上 / title 下） */
export function SectionHeader({ title, latin, right }) {
  return (
    <div className="flex items-end justify-between gap-3 px-0.5">
      <div className="space-y-0.5">
        {latin && (
          <div className="text-[10px] uppercase tracking-[0.22em] text-faint font-body">
            {latin}
          </div>
        )}
        <div className="font-display text-[17px] text-ink tracking-tight leading-none">
          {title}
        </div>
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

/** ColorOrb — 色球 */
function ColorOrb({ background, size, active }) {
  return (
    <div
      className={cn(
        'relative transition-transform ease-editorial duration-base',
        active && 'scale-[1.06]'
      )}
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-0 rounded-full" style={{ background }} />
      <svg
        className="absolute inset-0 w-full h-full rounded-full mix-blend-overlay pointer-events-none"
        style={{ opacity: 0.5 }}
        aria-hidden
      >
        <rect width="100%" height="100%" filter="url(#orbGrain)" fill="#fff" />
      </svg>
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          boxShadow: active
            ? 'inset 0 0 0 0.5px rgba(26,24,21,0.08), 0 3px 10px rgba(176,137,104,0.20)'
            : 'inset 0 0 0 0.5px rgba(26,24,21,0.06)',
        }}
      />
    </div>
  );
}

function GrainFilter() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
      <defs>
        <filter id="orbGrain" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.8" numOctaves="2" seed="9" stitchTiles="stitch" />
          <feColorMatrix
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 1.6 -0.5"
          />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
    </svg>
  );
}

export default FlavorPresets;
