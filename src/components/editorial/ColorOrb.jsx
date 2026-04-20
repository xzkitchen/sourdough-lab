import React from 'react';
import { predictBreadColor } from '../../domain/breadColor.js';
import { buildGradientBackground } from '../../design/gradient.js';

/**
 * ColorOrb — Editorial 色球（重写版）
 *
 * 相较原 FlavorPresets 里的 ColorOrb：
 *   - grain 不再依赖全局 <defs>，每个球独立 <filter>，保证挂载顺序与作用域
 *   - 从 overlay 改为 multiply，并根据 size 调 baseFrequency 和 opacity
 *   - 加入 radial 高光（左上方 30° 位），让球体更立体
 *   - overflow-hidden 防放大裁切（父容器需预留 transform 空间）
 *
 * Props:
 *   base       base recipe（用于预测颜色）
 *   modifiers  已选 modifiers
 *   size       px
 *   active     是否放大 + 强阴影
 *   muted      饱和度降低
 */
export function ColorOrb({ base, modifiers, size = 120, active = false, muted = false }) {
  const prediction = predictBreadColor(base, modifiers);
  const bg = buildGradientBackground(prediction, modifiers);
  // 小球粗粒 / 大球细粒
  const grainFreq = size < 80 ? 0.9 : size < 150 ? 0.75 : 0.65;
  const grainOpacity = size < 80 ? 0.55 : 0.42;
  // 每个球的 filter id 需唯一
  const filterId = `orb-grain-${size}-${Math.round(prediction.base.h)}`;

  return (
    <div
      className="relative shrink-0"
      style={{
        width: size,
        height: size,
        transition: 'transform 420ms cubic-bezier(.2,.8,.2,1)',
        transform: active ? 'scale(1.03)' : 'scale(1)',
      }}
    >
      <div
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{ background: bg, filter: muted ? 'saturate(0.85)' : 'none' }}
      >
        {/* Grain layer */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none block"
          aria-hidden
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
        {/* Highlight */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 32% 28%, rgba(255,252,245,0.35) 0%, transparent 45%)',
          }}
        />
      </div>
      {/* Ring + shadow */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          boxShadow: active
            ? 'inset 0 0 0 0.5px rgba(26,24,21,0.12), 0 10px 40px rgba(110,79,47,0.18), 0 2px 6px rgba(26,24,21,0.08)'
            : 'inset 0 0 0 0.5px rgba(26,24,21,0.10), 0 4px 16px rgba(26,24,21,0.06)',
        }}
      />
    </div>
  );
}

export default ColorOrb;
