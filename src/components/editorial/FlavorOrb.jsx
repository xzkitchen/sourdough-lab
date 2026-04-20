import React from 'react';
import { cn } from '../../lib/cn.js';
import { predictBreadColor } from '../../domain/breadColor.js';
import { buildGradientBackground } from '../../design/gradient.js';

/**
 * FlavorOrb —— SPECIMEN 卡片上的颜色锚点（带 Grain 纸纹的渐变色球）
 *
 * 用 predictBreadColor + buildGradientBackground 从 base + modifiers 推出
 * 本口味面包切面的主色；feTurbulence 叠 multiply 给 grain 质感。
 * 每个实例 filter id 唯一，避免 tab 切换 unmount 时丢失。
 *
 * Props:
 *   base        base recipe
 *   modifiers   [{id, dose}] —— 空数组也会显示 base 色（原味的米黄）
 *   size        px
 *   className
 */
export function FlavorOrb({ base, modifiers = [], size = 40, className }) {
  const prediction = predictBreadColor(base, modifiers);
  const bg = buildGradientBackground(prediction, modifiers);
  const grainFreq = size < 50 ? 0.95 : size < 100 ? 0.75 : 0.65;
  const grainOpacity = size < 50 ? 0.5 : 0.42;
  const seed =
    Math.round(prediction.base.h) * 1000 +
    Math.round(prediction.base.s) * 10 +
    modifiers.length;
  const filterId = `orb-grain-${size}-${seed}`;

  return (
    <div
      className={cn('relative shrink-0', className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <div
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{ background: bg }}
      >
        <svg
          className="absolute inset-0 w-full h-full block pointer-events-none"
          style={{ mixBlendMode: 'multiply', opacity: grainOpacity }}
        >
          <filter id={filterId}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency={grainFreq}
              numOctaves="2"
              stitchTiles="stitch"
            />
            <feColorMatrix values="0 0 0 0 0.18  0 0 0 0 0.14  0 0 0 0 0.10  0 0 0 0.55 0" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#${filterId})`} />
        </svg>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 32% 28%, rgba(255,252,245,0.30) 0%, transparent 50%)',
          }}
        />
      </div>
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 0 0.5px rgba(26,24,21,0.10)',
        }}
      />
    </div>
  );
}

export default FlavorOrb;
