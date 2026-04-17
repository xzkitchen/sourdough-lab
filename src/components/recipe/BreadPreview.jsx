import React, { useMemo } from 'react';
import { cn } from '../../lib/cn.js';
import { hslToCss } from '../../domain/breadColor.js';

/**
 * BreadPreview — 面包切面色预测可视化
 *
 * Props:
 *   prediction   { base: HSL, crust: HSL, dots: Array<{id, color, density, name}> }
 *   size         'sm' | 'md' | 'lg'  (默认 md)
 *   caption      下方说明文字
 */
export function BreadPreview({
  prediction,
  size = 'md',
  caption,
  className,
}) {
  const dims = {
    sm: { w: 160, h: 120 },
    md: { w: 280, h: 200 },
    lg: { w: 360, h: 260 },
  }[size];

  const { base, crust, dots } = prediction;

  // 确定性散点（基于 modifier id 计算种子，不随渲染变）
  const particles = useMemo(() => {
    const out = [];
    const rx = dims.w * 0.42;      // 切面椭圆半径
    const ry = dims.h * 0.32;
    const cx = dims.w / 2;
    const cy = dims.h / 2;

    dots.forEach((dot, i) => {
      const count = Math.max(6, Math.round(dot.density * 180));   // dose 大 -> 颗粒多
      const seed = hashString(dot.id);
      const rng = mulberry32(seed);
      for (let k = 0; k < count; k++) {
        // 在椭圆内均匀散点（极坐标 + sqrt 修正）
        const r = Math.sqrt(rng()) * 0.88;
        const theta = rng() * Math.PI * 2;
        const x = cx + rx * r * Math.cos(theta);
        const y = cy + ry * r * Math.sin(theta);
        const radius = 1.5 + rng() * 2.5;
        const rot = rng() * 30 - 15;
        out.push({
          key: `${dot.id}-${k}`,
          x, y,
          radius,
          rot,
          color: hslToCss(dot.color),
        });
      }
    });
    return out;
  }, [dots, dims.w, dims.h]);

  // 气孔（随机小圆，固定种子）
  const holes = useMemo(() => {
    const rx = dims.w * 0.38;
    const ry = dims.h * 0.28;
    const cx = dims.w / 2;
    const cy = dims.h / 2;
    const rng = mulberry32(1234);
    const out = [];
    for (let i = 0; i < 24; i++) {
      const r = Math.sqrt(rng()) * 0.82;
      const theta = rng() * Math.PI * 2;
      out.push({
        x: cx + rx * r * Math.cos(theta),
        y: cy + ry * r * Math.sin(theta),
        radius: 1 + rng() * 3,
        opacity: 0.12 + rng() * 0.15,
      });
    }
    return out;
  }, [dims.w, dims.h]);

  const baseCss = hslToCss(base);
  const crustCss = hslToCss(crust);
  // 表皮更深一档，用于外圈边
  const crustEdge = hslToCss({
    h: crust.h,
    s: Math.min(70, crust.s + 10),
    l: Math.max(15, crust.l - 8),
  });

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <svg
        width={dims.w}
        height={dims.h}
        viewBox={`0 0 ${dims.w} ${dims.h}`}
        role="img"
        aria-label="面包切面预览"
        className="shrink-0"
      >
        <defs>
          {/* 切面到表皮的径向渐变 */}
          <radialGradient id="breadCrumb" cx="50%" cy="50%" r="60%">
            <stop offset="0%"  stopColor={baseCss} />
            <stop offset="78%" stopColor={baseCss} />
            <stop offset="94%" stopColor={crustCss} />
            <stop offset="100%" stopColor={crustEdge} />
          </radialGradient>

          {/* 纸纹 overlay 叠在切面上 */}
          <filter id="crumbNoise" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="1.4"
              numOctaves="2"
              seed="11"
            />
            <feColorMatrix values="0 0 0 0 0.06
                                   0 0 0 0 0.05
                                   0 0 0 0 0.04
                                   0 0 0 0.25 0" />
            <feComposite in2="SourceGraphic" operator="in" />
          </filter>
        </defs>

        {/* 椭圆切面 */}
        <ellipse
          cx={dims.w / 2}
          cy={dims.h / 2}
          rx={dims.w * 0.45}
          ry={dims.h * 0.36}
          fill="url(#breadCrumb)"
          stroke={crustEdge}
          strokeWidth="1.5"
        />

        {/* 切面上的纸纹（很弱） */}
        <ellipse
          cx={dims.w / 2}
          cy={dims.h / 2}
          rx={dims.w * 0.43}
          ry={dims.h * 0.34}
          fill="#000"
          filter="url(#crumbNoise)"
        />

        {/* 气孔 */}
        {holes.map((h, i) => (
          <circle
            key={`hole-${i}`}
            cx={h.x}
            cy={h.y}
            r={h.radius}
            fill="rgba(0,0,0,0.18)"
            opacity={h.opacity}
          />
        ))}

        {/* 混入料颗粒 */}
        {particles.map((p) => (
          <ellipse
            key={p.key}
            cx={p.x}
            cy={p.y}
            rx={p.radius}
            ry={p.radius * 0.8}
            fill={p.color}
            transform={`rotate(${p.rot}, ${p.x}, ${p.y})`}
          />
        ))}
      </svg>

      {caption && (
        <div className="text-[11px] text-faint font-body tracking-wide text-center">
          {caption}
        </div>
      )}
    </div>
  );
}

// 简单的确定性 PRNG
function mulberry32(seed) {
  let t = seed;
  return function () {
    t |= 0;
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export default BreadPreview;
