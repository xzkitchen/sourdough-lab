import React from 'react';
import { cn } from '../../lib/cn.js';
import { FlavorOrb } from '../editorial/FlavorOrb.jsx';

/**
 * SpecimenCard —— SPECIMEN 选品卡
 *
 * 结构（紧凑版，一屏 ~2.5 张）：
 *   顶：左 ordinal "N° 01"，右 FlavorOrb（grain 渐变色球，按 modifier 变色）
 *   中：Fraunces 中文大字（flavor.name）+ mono tracked 英文小字（flavor.nameLatin）
 *   底：`H 70%` 小标签 + Fraunces 数字
 *
 * 激活态：bg-invert（暖焦糖棕）text-surface
 *
 * Props:
 *   ordinal           数字（1-based）
 *   base              base recipe（用于 FlavorOrb 颜色预测）
 *   flavor            { name, nameLatin, modifiers, ... }
 *   hydrationPct      数字 0-100
 *   active
 *   onSelect
 */
export function SpecimenCard({
  ordinal,
  base,
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
        'w-[36vw] max-w-[130px] aspect-[5/6]',
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
      {/* Top row: ordinal + FlavorOrb */}
      <div className="flex items-center justify-between px-2.5 pt-2.5">
        <span
          className={cn(
            'font-body uppercase tabular-nums tracking-[0.16em] text-[9px] leading-none',
            active ? 'text-surface/65' : 'text-faint'
          )}
        >
          N°&nbsp;{String(ordinal).padStart(2, '0')}
        </span>
        <FlavorOrb base={base} modifiers={flavor.modifiers} size={28} />
      </div>

      {/* Middle: name + latin */}
      <div className="px-2.5 mt-2 flex-1 flex flex-col justify-end">
        <h3
          className="font-display leading-[1.05] tracking-tight"
          style={{
            fontSize: 'clamp(16px, 3.8vw, 19px)',
            fontVariationSettings: "'opsz' 28, 'SOFT' 50, 'wght' 400",
          }}
        >
          {flavor.name}
        </h3>
        <span
          className={cn(
            'font-body uppercase tracking-[0.12em] text-[9px] leading-tight mt-1 truncate',
            active ? 'text-surface/70' : 'text-muted'
          )}
        >
          {flavor.nameLatin}
        </span>
      </div>

      {/* Bottom: hydration */}
      <div
        className={cn(
          'flex items-baseline justify-between px-2.5 py-2 mt-2 border-t',
          active ? 'border-surface/20' : 'border-line'
        )}
      >
        <span
          className={cn(
            'font-body uppercase tabular-nums tracking-[0.18em] text-[9px]',
            active ? 'text-surface/65' : 'text-faint'
          )}
        >
          H
        </span>
        <span
          className="font-display tabular-nums tracking-tight leading-none"
          style={{
            fontSize: 'clamp(15px, 3.6vw, 18px)',
            fontVariationSettings: "'opsz' 24, 'wght' 420",
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
