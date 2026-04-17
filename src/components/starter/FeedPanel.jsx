import React from 'react';
import { Minus, Plus, Wheat, Droplet, Sprout } from 'lucide-react';
import { cn } from '../../lib/cn.js';
import { Card, NumberField } from '../primitives/index.js';
import { SectionHeader, HydrationBadge } from '../recipe/index.js';

/**
 * FeedPanel — 全局参数 + 养种计算
 *
 * 顶部 Global：数量 / 水合度（紧凑一行，不占大卡片）
 * 中部 Levain：旧种输入 + 加 T65 / 加水（step=1）
 * 底部：次要指标 + 说明
 */
export function FeedPanel({
  feed,
  seedStarter,
  onSeedChange,
  base,
  numUnits,
  onNumUnitsChange,
  calculated,
  className,
}) {
  if (!feed) return null;

  return (
    <div className={cn('space-y-6', className)}>
      {/* ── Global —— 紧凑行 ── */}
      <section className="space-y-2.5">
        <SectionHeader title="全局参数" latin="Global" />
        <div className="flex items-stretch gap-3">
          <GlobalCell
            label="数量"
            value={numUnits}
            unit="条"
            onChange={onNumUnitsChange}
            min={1}
            max={10}
          />
          <div className="flex-1 rounded-md border border-line bg-surface px-3 py-2.5 flex flex-col justify-center gap-1.5">
            <div className="text-[10px] uppercase tracking-[0.18em] text-faint font-body">
              水合度
            </div>
            <HydrationBadge
              value={calculated.actualHydration}
              base={base.hydration}
            />
          </div>
        </div>
      </section>

      {/* ── Levain ── */}
      <section className="space-y-3">
        <SectionHeader title="养种计算" latin="Levain" />

        <Card variant="surface" padding="md">
          <NumberField
            label="已有旧种"
            hint="Seed"
            value={seedStarter}
            onChange={onSeedChange}
            min={1}
            step={1}
            unit="g"
          />
        </Card>

        <div className="grid grid-cols-2 gap-3">
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

        <div className="grid grid-cols-2 gap-3 pt-1">
          <SmallMetric label="配方需求" value={feed.needed} />
          <SmallMetric label="喂养后总量" value={feed.total} />
        </div>

        <div className="flex items-start gap-2.5 pt-3 px-1">
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

/** GlobalCell —— 紧凑数字 stepper */
function GlobalCell({ label, value, unit, onChange, min = 0, max = Infinity }) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  return (
    <div className="flex-1 rounded-md border border-line bg-surface px-3 py-2.5 flex flex-col gap-1.5">
      <div className="text-[10px] uppercase tracking-[0.18em] text-faint font-body">
        {label}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={dec}
          disabled={value <= min}
          aria-label="减少"
          className="w-7 h-7 flex items-center justify-center rounded-sm text-muted hover:text-ink hover:bg-sunken disabled:opacity-30 transition-colors ease-editorial duration-fast"
        >
          <Minus size={12} strokeWidth={1.5} />
        </button>
        <div className="flex-1 flex items-baseline justify-center gap-1">
          <span className="font-display text-xl tabular-nums text-ink leading-none">
            {value}
          </span>
          {unit && <span className="text-[10px] text-faint font-body">{unit}</span>}
        </div>
        <button
          type="button"
          onClick={inc}
          disabled={value >= max}
          aria-label="增加"
          className="w-7 h-7 flex items-center justify-center rounded-sm text-muted hover:text-ink hover:bg-sunken disabled:opacity-30 transition-colors ease-editorial duration-fast"
        >
          <Plus size={12} strokeWidth={1.5} />
        </button>
      </div>
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
