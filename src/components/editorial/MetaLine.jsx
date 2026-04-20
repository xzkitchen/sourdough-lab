import React from 'react';

/**
 * MetaLine — 刊物元信息行
 *
 * 竖排（桌面）/ 4 列横排（移动）都能用。用于 Chapter hero 左栏。
 *
 * Props:
 *   label — 小字标签（大写扩字距）
 *   value — 主值（Fraunces 大数字）
 *   delta — 可选 delta 提示（比如 hydration +2.5%）
 *   big   — 是否为主号位（No. 这种放大）
 */
export function MetaLine({ label, value, delta, big }) {
  return (
    <div className="space-y-1 md:space-y-1.5 min-w-0">
      <div className="text-[9px] md:text-[10px] uppercase tracking-[0.22em] md:tracking-[0.28em] text-faint font-body truncate">
        {label}
      </div>
      <div className="flex items-baseline gap-1.5 md:gap-2 flex-wrap">
        <span
          className={`font-display tabular-nums text-ink ${
            big ? 'text-[32px] md:text-[44px]' : 'text-[16px] md:text-[18px]'
          }`}
          style={{
            lineHeight: 1,
            fontVariationSettings: big
              ? "'opsz' 44, 'SOFT' 40, 'wght' 340"
              : "'opsz' 18, 'wght' 420",
          }}
        >
          {value}
        </span>
        {delta && (
          <span className="font-mono text-[10px] text-accent-ink tabular-nums">{delta}</span>
        )}
      </div>
    </div>
  );
}

export default MetaLine;
