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

  // 点击 → 应用 flavor + 平滑滚动到被点卡（尽量居中，最后几张被 clamp）
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

  return (
    <section className={cn('space-y-4', className)}>
      <GrainFilter />

      {/* Header 内缩 16px 模拟 Card 内部 padding，和"配方清单"起始 x 对齐 */}
      <div className="px-4 sm:px-5">
        <SectionHeader title="创意预设" latin="Chef's picks" />
      </div>

      {/*
        横向 feed 结构（两层）：
          - 外层 wrapper 负责 bleed 到屏幕边（-mx-*）+ 承担 mask-image 做左右软淡出
          - 内层 scroll 容器只管 overflow-x-auto + snap + padding
        这样分离是因为：mask-image 直接加在 overflow-x-auto 容器上会
        在 iOS Safari 破坏横向 scroll（WebKit compositing bug）
      */}
      <div className="-mx-5 sm:-mx-8 sdl-hscroll-fade-wrap">
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto snap-x snap-proximity pl-5 pr-8 sm:pl-8 sm:pr-12 pb-1"
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
              onClick={() => handleClick(f)}
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
      </div>
    </section>
  );
}

/** Section header —— 左对齐单行（中文 · LATIN） */
export function SectionHeader({ title, latin, right, className }) {
  return (
    <div className={cn('flex items-baseline justify-between gap-3', className)}>
      <div className="flex items-baseline gap-2 min-w-0">
        <span className="font-display text-[16px] text-ink tracking-tight leading-none">
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
