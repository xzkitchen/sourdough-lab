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

  // 点击只 apply flavor，不再自动滚动居中
  // —— 强制居中 88px 卡在 375px 视口时，两侧必然各留 ~143px 空白，
  //    造成"尾部大片留白"。改为保留用户当前滚动位置，选中态通过名字颜色
  //    和 accent dot 视觉反馈即可。
  const handleClick = useCallback(
    (flavor) => {
      onApply(flavor);
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
          - pl-5 起始留白
          - pr-8 / sm:pr-12 尾部 padding 只够最后一张卡不贴边，
            不再尝试"居中最后一张"（居中一张小卡必然留 ~143px 空白，无解）
          - snap-proximity 而非 mandatory —— 允许自由滚动，不强制对齐到卡
      */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto snap-x snap-proximity -mx-5 pl-5 pr-8 sm:-mx-8 sm:pl-8 sm:pr-12 pb-1"
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
