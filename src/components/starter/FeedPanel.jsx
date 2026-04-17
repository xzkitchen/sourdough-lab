import React from 'react';
import { Wheat, Droplet, Sprout } from 'lucide-react';
import { cn } from '../../lib/cn.js';
import { Card, NumberField } from '../primitives/index.js';
import { SectionHeader, HydrationBadge } from '../recipe/index.js';

/**
 * FeedPanel — 养种 + 数量 + 水合度
 *
 * 顶部：数量 + 水合度 —— 影响整个配方的全局参数
 * 中部：养种输入 + 喂养方案（加 T65 / 加水）
 * 底部：次要指标 + 说明
 */
export function FeedPanel({
  feed,
  seedStarter,
  onSeedChange,
  // 全局配方参数
  base,
  numUnits,
  onNumUnitsChange,
  calculated,
  className,
}) {
  if (!feed) return null;

  return (
    <div className={cn('space-y-7', className)}>
      {/* ── 全局：数量 + 水合度 ── */}
      <section className="space-y-3">
        <SectionHeader title="全局参数" latin="Global" />
        <Card variant="surface" padding="md" className="flex items-stretch gap-5">
          <div className="flex-1 min-w-0">
            <NumberField
              label="数量"
              hint="Loaves"
              value={numUnits}
              onChange={onNumUnitsChange}
              min={1}
              max={10}
            />
          </div>
          <div className="w-px bg-line-soft" aria-hidden />
          <div className="flex flex-col justify-center items-start gap-2 shrink-0">
            <div className="text-[10px] uppercase tracking-[0.18em] text-faint font-body">
              水合度
            </div>
            <HydrationBadge
              value={calculated.actualHydration}
              base={base.hydration}
            />
          </div>
        </Card>
      </section>

      {/* ── 养种 ── */}
      <section className="space-y-3">
        <SectionHeader title="养种计算" latin="Levain" />

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
        </Card>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <BigMetric
            icon={<Wheat size={14} strokeWidth={1.5} />}
            label="加 T65"
            value={feed.flour}
          />
          <BigMetric
            icon={<Droplet size={14} strokeWidth={1.5} />}
            label="加 水"
            value={feed.water}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <SmallMetric label="配方需求" value={feed.needed} />
          <SmallMetric label="喂养后总量" value={feed.total} />
        </div>

        <div className="flex items-start gap-2.5 pt-4 px-1">
          <Sprout
            size={12}
            strokeWidth={1.5}
            className="text-accent-ink shrink-0 mt-0.5"
            aria-hidden
          />
          <p className="text-xs text-muted font-body leading-relaxed">
            取 <span className="font-mono text-ink tabular-nums">{seedStarter}g</span> 旧种 +
            <span className="font-mono text-ink tabular-nums"> {feed.flour}g</span> T65 +
            <span className="font-mono text-ink tabular-nums"> {feed.water}g</span> 水，
            28°C 发酵 4–6h 至峰值，取 <span className="font-mono text-ink tabular-nums">{feed.needed}g</span> 做面包。
          </p>
        </div>
      </section>
    </div>
  );
}

function BigMetric({ icon, label, value }) {
  return (
    <Card variant="surface" padding="md" className="flex flex-col items-center gap-2 text-center">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted font-body">
        <span className="text-accent-ink">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-display text-3xl tabular-nums text-accent-ink tracking-tight">
          {value}
        </span>
        <span className="text-xs text-faint font-mono">g</span>
      </div>
    </Card>
  );
}

function SmallMetric({ label, value }) {
  return (
    <div className="flex items-baseline justify-between px-1">
      <span className="text-[11px] text-muted font-body">{label}</span>
      <span className="font-mono text-sm text-ink tabular-nums">
        {value}
        <span className="text-[10px] text-faint ml-0.5">g</span>
      </span>
    </div>
  );
}

export default FeedPanel;
