import React from 'react';
import { Wheat, Droplet, Sprout } from 'lucide-react';
import { cn } from '../../lib/cn.js';
import { Card, Divider, NumberField } from '../primitives/index.js';

/**
 * FeedPanel — 鲁邦种喂养面板
 *
 * Props:
 *   feed          calculateFeed() 输出 {needed, seed, flour, water, total, buffer}
 *   seedStarter   number (当前旧种重量)
 *   onSeedChange(next)
 */
export function FeedPanel({ feed, seedStarter, onSeedChange, className }) {
  if (!feed) return null;

  return (
    <div className={cn('space-y-6', className)}>
      {/* 输入区 */}
      <Card variant="surface" padding="lg">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="font-display text-xl text-ink tracking-tight">
            养种计算
          </h2>
          <span className="text-[10px] uppercase tracking-widest text-faint font-body">
            Levain
          </span>
        </div>

        <NumberField
          label="已有旧种"
          hint="Seed"
          value={seedStarter}
          onChange={onSeedChange}
          min={1}
          step={5}
          unit="g"
        />

        <Divider className="my-6" />

        <div className="grid grid-cols-2 gap-4">
          <MetricBlock
            label="配方需求"
            value={feed.needed}
            unit="g"
            subtitle={`含 ${feed.buffer}g 缓冲余量`}
            tone="muted"
          />
          <MetricBlock
            label="喂养后总量"
            value={feed.total}
            unit="g"
            subtitle="发至峰值后取用"
            tone="accent"
          />
        </div>
      </Card>

      {/* 喂养方案卡 */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between px-1">
          <div className="text-[10px] uppercase tracking-[0.2em] text-faint font-body">
            1:1 Feed Plan
          </div>
          <div className="text-[10px] uppercase tracking-widest text-faint font-body">
            喂养方案
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FeedCard
            icon={<Wheat size={14} strokeWidth={1.5} />}
            label="加 T65"
            value={feed.flour}
          />
          <FeedCard
            icon={<Droplet size={14} strokeWidth={1.5} />}
            label="加 水"
            value={feed.water}
          />
        </div>
      </div>

      {/* 说明 */}
      <Card variant="sunken" padding="md">
        <div className="flex items-start gap-3">
          <Sprout
            size={14}
            strokeWidth={1.5}
            className="text-accent-ink shrink-0 mt-0.5"
            aria-hidden
          />
          <p className="text-xs text-muted font-body leading-relaxed">
            取 <span className="font-mono text-ink tabular-nums">{seedStarter}g</span> 旧种，
            加上方显示的粉和水混合。静置发酵至峰值（约 4–6 小时）后，
            取 <span className="font-mono text-ink tabular-nums">{feed.needed}g</span> 用于做面包，
            剩余约 <span className="font-mono text-ink tabular-nums">{feed.buffer}g</span> 作为下次的火种（已含损耗余量）。
          </p>
        </div>
      </Card>
    </div>
  );
}

function MetricBlock({ label, value, unit, subtitle, tone }) {
  const color = tone === 'accent' ? 'text-accent-ink' : 'text-ink';
  const bgLine = tone === 'accent' ? 'border-accent-line' : 'border-line';
  return (
    <div className={cn('border-l-2 pl-4 py-1', bgLine)}>
      <div className="text-[10px] uppercase tracking-widest text-muted font-body mb-1">
        {label}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={cn('font-display text-3xl tabular-nums tracking-tight', color)}>
          {value}
        </span>
        <span className="text-sm text-faint font-mono">{unit}</span>
      </div>
      {subtitle && (
        <div className="text-[10px] text-faint font-body mt-1">{subtitle}</div>
      )}
    </div>
  );
}

function FeedCard({ icon, label, value }) {
  return (
    <Card variant="surface" padding="lg" className="text-center flex flex-col items-center gap-3">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted font-body">
        <span className="text-accent-ink">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-display text-4xl tabular-nums text-ink tracking-tight">
          {value}
        </span>
        <span className="text-sm text-faint font-mono">g</span>
      </div>
    </Card>
  );
}

export default FeedPanel;
