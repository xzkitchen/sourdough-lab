import React from 'react';

/**
 * StampRadial — 烘焙坊圆章 SVG
 *
 * 编辑器 / 古书风的圆形 stamp：
 *   - 双圈外框
 *   - 上半弧文字 SOURDOUGH · LAB
 *   - 下半弧文字 ESTABLISHED · 2024
 *   - 中央竖排 LB 字符 + 麦穗
 *
 * Props:
 *   size  number  px (默认 150)
 *   tint  string  描边色（默认 currentColor）
 */
export function StampRadial({ size = 150, tint = 'currentColor' }) {
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size * 0.46;
  const rInner = size * 0.40;
  const rText  = size * 0.42;

  // 上弧 path（顺时针，文字朝外）
  const arcTop = `M ${cx - rText},${cy} A ${rText},${rText} 0 0 1 ${cx + rText},${cy}`;
  // 下弧 path（逆时针，文字朝外，需要从右到左）
  const arcBot = `M ${cx + rText},${cy} A ${rText},${rText} 0 0 1 ${cx - rText},${cy}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ color: tint }}
      aria-hidden="true"
    >
      {/* 双圈 */}
      <circle cx={cx} cy={cy} r={rOuter} fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={rInner} fill="none" stroke="currentColor" strokeWidth="0.5" />

      {/* 弧形 path 定义 */}
      <defs>
        <path id={`stamp-arc-top-${size}`} d={arcTop} />
        <path id={`stamp-arc-bot-${size}`} d={arcBot} />
      </defs>

      {/* 上弧文字 */}
      <text
        fontFamily='"IBM Plex Mono", monospace'
        fontSize={size * 0.075}
        fill="currentColor"
        letterSpacing={size * 0.025}
      >
        <textPath href={`#stamp-arc-top-${size}`} startOffset="50%" textAnchor="middle">
          SOURDOUGH · LAB
        </textPath>
      </text>

      {/* 下弧文字 */}
      <text
        fontFamily='"IBM Plex Mono", monospace'
        fontSize={size * 0.06}
        fill="currentColor"
        letterSpacing={size * 0.02}
      >
        <textPath href={`#stamp-arc-bot-${size}`} startOffset="50%" textAnchor="middle">
          EST · MMXXIV
        </textPath>
      </text>

      {/* 中央竖向小麦图形（极简两道线） */}
      <g transform={`translate(${cx},${cy})`}>
        <line x1="0" y1={-size * 0.18} x2="0" y2={size * 0.18} stroke="currentColor" strokeWidth="0.6"/>
        {[-0.12, -0.04, 0.04, 0.12].map((y, i) => (
          <g key={i}>
            <line x1="0" y1={size * y} x2={-size * 0.05} y2={size * (y - 0.03)} stroke="currentColor" strokeWidth="0.5" />
            <line x1="0" y1={size * y} x2={ size * 0.05} y2={size * (y - 0.03)} stroke="currentColor" strokeWidth="0.5" />
          </g>
        ))}
      </g>

      {/* 装饰星号 */}
      <text
        x={cx}
        y={cy + size * 0.32}
        textAnchor="middle"
        fontFamily='"EB Garamond", serif'
        fontSize={size * 0.1}
        fill="currentColor"
      >
        ✦
      </text>
    </svg>
  );
}

export default StampRadial;
