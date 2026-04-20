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
    (flavor) => {
      onApply(flavor);
      // 手动计算 scrollLeft 让被点击卡居中 —— 不依赖 scrollIntoView
      // scrollIntoView 在目标已部分可见时可能 skip，尤其 iOS Safari
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
        横向 feed：
          - 左 pl-5 正常起始留白
          - 右 padding = 最后一张卡居中所需的最小值
            mobile：~42vw（足够 88px 卡在 375px 视口居中 + 小 buffer）
            desktop：fixed 320px（够 88px 卡在 max-w-2xl 容器里居中）
            之前用 pr-[50vw] 造成尾部过多空白（over-scroll 空区）
      */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto snap-x snap-mandatory -mx-5 pl-5 pr-[42vw] sm:-mx-8 sm:pl-8 sm:pr-[320px] pb-1"
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
