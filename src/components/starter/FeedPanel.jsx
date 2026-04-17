import React from 'react';
import { Wheat, Droplet, Sprout } from 'lucide-react';
import { cn } from '../../lib/cn.js';
import { Card, NumberField } from '../primitives/index.js';

/**
 * FeedPanel — 鲁邦种喂养面板（一屏紧凑布局）
 *
 * 手机竖屏（375×812）完整可见：
 *   顶部 Header
 *   单卡片：输入 + 2×2 指标网格 + 双色条
 *   说明
 */
export function FeedPanel({ feed, seedStarter, onSeedChange, className }) {
  if (!feed) return null;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Section header */}
      <div className="flex items-baseline gap-2 px-0.5">
        <span className="text-[10px] uppercase tracking-[0.2em] text-faint font-body">
          Levain
        </span>
        <span className="font-display text-base text-ink">养种计算</span>
      </div>

      {/* 主卡：输入 + 指标 */}
      <Card variant="surface" padding="md">
        <NumberField
          label="已有旧种"
          hint="Seed"
          value={seedStarter}
          onChange={onSeedChange}
          min={1}
          step={5}
          unit="g"
        />

        {/* 4 指标 2×2 网格 */}
        <div className="grid grid-cols-2 gap-x-5 gap-y-3 mt-5 pt-4 border-t border-line-soft">
          <MetricCell
            icon={<Wheat size={12} strokeWidth={1.5} />}
            label="加 T65"
            value={feed.flour}
            unit="g"
            tone="accent"
          />
          <MetricCell
            icon={<Droplet size={12} strokeWidth={1.5} />}
            label="加 水"
            value={feed.water}
            unit="g"
            tone="accent"
          />
          <MetricCell
            label="配方需求"
            value={feed.needed}
            unit="g"
            tone="muted"
          />
          <MetricCell
            label="喂养后总量"
            value={feed.total}
            unit="g"
            tone="muted"
          />
        </div>
      </Card>

      {/* 说明 */}
      <div className="flex items-start gap-2.5 px-1">
        <Sprout
          size={12}
          strokeWidth={1.5}
          className="text-accent-ink shrink-0 mt-0.5"
          aria-hidden
        />
        <p className="text-xs text-muted font-body leading-relaxed">
          取 <span className="font-mono text-ink tabular-nums">{seedStarter}g</span> 旧种，
          加 <span className="font-mono text-ink tabular-nums">{feed.flour}g</span> T65 + <span className="font-mono text-ink tabular-nums">{feed.water}g</span> 水 混合。
          28°C 发酵 4–6h 至峰值，取 <span className="font-mono text-ink tabular-nums">{feed.needed}g</span> 做面包，剩 <span className="font-mono text-ink tabular-nums">{feed.buffer}g</span> 作下次火种。
        </p>
      </div>
    </div>
  );
}

function MetricCell({ icon, label, value, unit, tone }) {
  const valueColor = tone === 'accent' ? 'text-accent-ink' : 'text-ink';
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted font-body mb-1">
        {icon && <span className="text-accent-ink">{icon}</span>}
        <span>{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={cn('font-display text-2xl tabular-nums tracking-tight', valueColor)}>
          {value}
        </span>
        <span className="text-xs text-faint font-mono">{unit}</span>
      </div>
    </div>
  );
}

export default FeedPanel;
