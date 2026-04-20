import React from 'react';
import { cn } from '../../lib/cn.js';

/**
 * FlavorStamp —— 圆形印章（radial moment 的落地）
 *
 * 单色 SVG，stroke 用 currentColor。以下元素：
 *   - 外圈圆（1px）
 *   - 12 条径向短 ticks（钟面意象）
 *   - 中心 2 个同心小圆（stamp 戳记质感）
 *
 * 不依赖 breadColor / 渐变；纯 letterpress 风格。
 * 放在 SpecimenCard 右上，通过父级 text-color 控制颜色（inactive: text-faint，active: text-surface/60）
 */
export function FlavorStamp({ size = 72, className }) {
  const cx = 50;
  const cy = 50;
  const ticks = [];
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI * 2) / 12;
    const x1 = cx + Math.cos(angle) * 42;
    const y1 = cy + Math.sin(angle) * 42;
    const x2 = cx + Math.cos(angle) * 47;
    const y2 = cy + Math.sin(angle) * 47;
    ticks.push(<line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />);
  }
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={cn('block', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="0.75"
      aria-hidden
    >
      <circle cx={cx} cy={cy} r="48" />
      <circle cx={cx} cy={cy} r="38" opacity="0.5" />
      <g strokeWidth="0.75">{ticks}</g>
      <circle cx={cx} cy={cy} r="6" opacity="0.8" />
      <circle cx={cx} cy={cy} r="2" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

export default FlavorStamp;
