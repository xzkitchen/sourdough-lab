import React from 'react';
import { cn } from '../../lib/cn.js';
import { SmallCaps } from '../primitives/index.js';
import { FlavorStamp } from '../editorial/FlavorStamp.jsx';

/**
 * SpecimenCard — SPECIMEN 选品卡（替代原 ColorOrb 色球）
 *
 * 结构：
 *   顶：左 ordinal "N° 01"，右 FlavorStamp 印章
 *   中：Fraunces 中文大字（flavor.name） + mono tracked 英文小字（flavor.nameLatin）
 *   底：`HYDRATION 70%` 小标签 + Fraunces pullquote 数字
 *
 * 激活态：bg-ink text-surface；印章 opacity 较高保持可见
 *
 * Props:
 *   ordinal           数字（1-based，内部 padStart）
 *   flavor            { name, nameLatin, modifiers, note, ... }
 *   hydrationPct      数字 0-100（不是 0-1），已四舍五入
 *   active
 *   onSelect
 */
export function SpecimenCard({
  ordinal,
  flavor,
  hydrationPct,
  active,
  onSelect,
  className,
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        'snap-start shrink-0 relative overflow-hidden',
        'w-[52vw] max-w-[170px] aspect-[10/11]',
        'text-left flex flex-col',
        'border border-line',
        'transition-colors ease-editorial duration-fast',
        'active:opacity-95',
        active
          ? 'bg-invert text-surface border-invert'
          : 'bg-surface text-ink',
        className
      )}
    >
      {/* Top meta row */}
      <div className="flex items-start justify-between px-3 pt-3">
        <span
          className={cn(
            'font-body uppercase tabular-nums tracking-[0.18em] text-[9px] leading-[14px]',
            active ? 'text-surface/60' : 'text-faint'
          )}
        >
          N°&nbsp;{String(ordinal).padStart(2, '0')}
        </span>
        <div className={active ? 'text-surface/45' : 'text-faint/70'}>
          <FlavorStamp size={40} />
        </div>
      </div>

      {/* Middle: name */}
      <div className="px-3 mt-1 flex-1 flex flex-col justify-end">
        <h3
          className="font-display leading-[1.05] tracking-tight"
          style={{
            fontSize: 'clamp(18px, 4.2vw, 22px)',
            fontVariationSettings: "'opsz' 28, 'SOFT' 50, 'wght' 400",
          }}
        >
          {flavor.name}
        </h3>
        <span
          className={cn(
            'font-body uppercase tracking-[0.14em] text-[9px] leading-tight mt-1 truncate',
            active ? 'text-surface/70' : 'text-muted'
          )}
        >
          {flavor.nameLatin}
        </span>
      </div>

      {/* Bottom: hydration pullquote */}
      <div
        className={cn(
          'flex items-baseline justify-between px-3 py-2.5 mt-2 border-t',
          active ? 'border-surface/20' : 'border-line'
        )}
      >
        <span
          className={cn(
            'font-body uppercase tabular-nums tracking-[0.18em] text-[9px]',
            active ? 'text-surface/60' : 'text-faint'
          )}
        >
          H
        </span>
        <span
          className="font-display tabular-nums tracking-tight leading-none"
          style={{
            fontSize: 'clamp(16px, 4vw, 20px)',
            fontVariationSettings: "'opsz' 28, 'wght' 420",
          }}
        >
          {hydrationPct}
          <span className="text-[0.55em] opacity-60 ml-0.5">%</span>
        </span>
      </div>
    </button>
  );
}

export default SpecimenCard;
