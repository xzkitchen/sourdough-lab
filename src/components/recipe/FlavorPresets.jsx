import React, { useId } from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/cn.js';
import { predictBreadColor } from '../../domain/breadColor.js';
import { buildGradientBackground } from '../../design/gradient.js';

/**
 * FlavorPresets — 创意预设 feed
 *
 * 横向滚动的 editorial cards。
 * 每张卡顶部一个色球（多层 radial 混色 + SVG grain 颗粒），参考 ElevenLabs 风。
 *
 * Props:
 *   base       base recipe (用于色预测)
 *   flavors    FLAVORS array
 *   selected   current selected modifiers [{id, dose}]
 *   onApply(flavor)
 */
export function FlavorPresets({ base, flavors, selected, onApply, className }) {
  // 判断哪个 flavor 与当前 selected 完全匹配
  const activeFlavorId = flavors.find((f) => {
    if (f.modifiers.length !== selected.length) return false;
    return f.modifiers.every((m) => {
      const sel = selected.find((s) => s.id === m.id);
      if (!sel) return false;
      return Math.abs((sel.dose ?? 0) - (m.dose ?? 0)) < 0.0001 || sel.dose === undefined;
    });
  })?.id;

  return (
    <div className={cn('space-y-4', className)}>
      {/* 共享 SVG filter：所有色球用同一个 grain 滤镜 */}
      <GrainFilter />

      <div className="flex items-baseline justify-between px-1">
        <div className="text-[10px] uppercase tracking-[0.2em] text-faint font-body">
          Chef's picks
        </div>
        <div className="text-[10px] uppercase tracking-widest text-faint font-body">
          创意配方
        </div>
      </div>

      {/* 横向滚动 feed */}
      <div
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory -mx-6 px-6 pb-3"
        style={{ scrollbarWidth: 'thin' }}
      >
        {flavors.map((f) => {
          const active = f.id === activeFlavorId;
          const prediction = predictBreadColor(base, f.modifiers);
          const gradientBg = buildGradientBackground(prediction, f.modifiers);
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onApply(f)}
              aria-pressed={active}
              className={cn(
                'snap-start shrink-0 w-[200px] text-left',
                'rounded-md border bg-surface overflow-hidden relative',
                'transition-colors ease-editorial duration-fast',
                active
                  ? 'border-accent'
                  : 'border-line hover:border-accent-line'
              )}
            >
              {/* 色球区域 */}
              <div className="relative pt-6 pb-4 flex items-center justify-center">
                <ColorOrb background={gradientBg} size={96} />

                {/* 选中 check，角标式 */}
                {active && (
                  <span className="absolute top-3 right-3 w-5 h-5 rounded-sm bg-accent text-white flex items-center justify-center shadow-sm">
                    <Check size={12} strokeWidth={2.5} />
                  </span>
                )}
              </div>

              {/* 文字 */}
              <div className="px-4 pb-4">
                <div className="text-[10px] uppercase tracking-[0.18em] text-faint font-body mb-1">
                  {f.nameLatin}
                </div>
                <div
                  className={cn(
                    'font-display text-base leading-tight mb-2',
                    active ? 'text-accent-ink' : 'text-ink'
                  )}
                >
                  {f.name}
                </div>
                <div className="text-xs text-muted font-body leading-relaxed line-clamp-2 mb-3 min-h-[32px]">
                  {f.description}
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-faint font-body uppercase tracking-widest">
                  {f.modifiers.length === 0 ? (
                    <span>No modifiers</span>
                  ) : (
                    <>
                      <span className="tabular-nums font-mono text-accent-ink">
                        {f.modifiers.length}
                      </span>
                      <span>modifiers</span>
                    </>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * ColorOrb — 色球（ElevenLabs 风）
 *
 * 结构：两层
 *   1. 内圆：多层 radial gradient 提供色彩混融
 *   2. 外圆（SVG）：带 grain filter，叠在上面用 mix-blend 或 opacity 提供颗粒感
 */
function ColorOrb({ background, size = 96 }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* 渐变底 */}
      <div
        className="absolute inset-0 rounded-pill"
        style={{ background }}
      />
      {/* Grain overlay: SVG filter */}
      <svg
        className="absolute inset-0 w-full h-full rounded-pill mix-blend-overlay pointer-events-none"
        style={{ opacity: 0.55 }}
        aria-hidden
      >
        <rect width="100%" height="100%" filter="url(#orbGrain)" fill="#fff" />
      </svg>
      {/* 边缘柔化：极微阴影 */}
      <div
        className="absolute inset-0 rounded-pill pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 0 0.5px rgba(26,24,21,0.08), 0 1px 2px rgba(26,24,21,0.06)',
        }}
      />
    </div>
  );
}

/**
 * 全局 SVG filter (defs only, 实际不占空间)
 * 只渲染一次，供所有 ColorOrb 共享
 */
function GrainFilter() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: 'absolute' }}
      aria-hidden
    >
      <defs>
        <filter id="orbGrain" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="1.8"
            numOctaves="2"
            seed="9"
            stitchTiles="stitch"
          />
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
