import React from 'react';
import { Droplet } from 'lucide-react';
import { cn } from '../../lib/cn.js';
import { Pill, SmallCaps } from '../primitives/index.js';

/**
 * HydrationBadge — 旧 Pill 形态（FeedPanel 向后兼容）
 *   显示 "X% +delta" 三态（neutral / accent / warn）
 */
export function HydrationBadge({ value, base, className }) {
  const delta = value - base;
  const pct = Math.round(value * 1000) / 10;
  const isElevated = delta > 0.03;
  const isHigh = delta > 0.08;
  const tone = isHigh ? 'warn' : isElevated ? 'accent' : 'neutral';

  return (
    <Pill
      tone={tone}
      size="md"
      icon={<Droplet size={12} strokeWidth={1.5} />}
      className={className}
    >
      <span className="tabular-nums">{pct}%</span>
      {delta !== 0 && (
        <span
          className={cn(
            'ml-1 text-[10px] tabular-nums',
            isHigh ? 'text-warn' : 'text-accent-ink opacity-70'
          )}
        >
          {delta > 0 ? '+' : ''}
          {Math.round(delta * 1000) / 10}
        </span>
      )}
    </Pill>
  );
}

/**
 * HydrationInline —— Ledger V2 pull-quote style
 *   文本结构：`H 70%` 带一条 thin vertical 分隔线作前缀，用于 LedgerSection rightMeta
 *   delta > 0.08 时转 warn 色
 */
export function HydrationInline({ value, base, className }) {
  const pct = Math.round(value * 1000) / 10;
  const delta = value - base;
  const isHigh = delta > 0.08;
  return (
    <span
      className={cn(
        'inline-flex items-baseline gap-2 pl-3 border-l border-line',
        className
      )}
    >
      <SmallCaps tone={isHigh ? 'warn' : 'muted'}>H</SmallCaps>
      <span
        className={cn(
          'font-display tabular-nums leading-none',
          isHigh ? 'text-warn' : 'text-ink'
        )}
        style={{
          fontSize: 'clamp(16px, 3.5vw, 20px)',
          fontVariationSettings: "'opsz' 24, 'wght' 420",
        }}
      >
        {pct}
        <span className="text-[0.55em] opacity-60 ml-0.5">%</span>
      </span>
    </span>
  );
}

export default HydrationBadge;
