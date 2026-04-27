import React from 'react';
import { SecHead } from '../ledger/index.js';

/**
 * Stepper — 大号 ± 步进器（编辑器风：1px 实线 + 大号 mono 数字）
 *
 * Props:
 *   value          数字
 *   onChange(v)
 *   step           默认 1
 *   min            默认 1
 *   suffix         右侧小字（如 'g' / '个'）
 *   labelEn / labelZh   右侧上下两行小标
 *   ariaLabel
 */
function Stepper({ value, onChange, step = 1, min = 1, suffix, labelEn, labelZh, ariaLabel }) {
  const dec = () => onChange(Math.max(min, value - step));
  const inc = () => onChange(value + step);
  return (
    <div
      className="grid border border-ink bg-surface"
      style={{ gridTemplateColumns: '56px 1fr 56px' }}
      role="group"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        onClick={dec}
        aria-label="decrease"
        className="font-display text-2xl text-ink border-r border-ink hover:bg-sunken active:bg-sunken transition-colors duration-fast cursor-pointer"
      >
        −
      </button>
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="font-display font-medium text-4xl text-ink leading-none tabular-nums" style={{ letterSpacing: '-0.04em' }}>
          {value}
          {suffix && (
            <span className="font-mono text-base text-faint ml-1.5">{suffix}</span>
          )}
        </div>
        <div className="text-right">
          {labelEn && (
            <div className="font-mono text-2xs text-faint uppercase tracking-[0.24em]">
              {labelEn}
            </div>
          )}
          {labelZh && (
            <div className="font-zh text-xs text-muted mt-0.5">{labelZh}</div>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={inc}
        aria-label="increase"
        className="font-display text-2xl text-ink border-l border-ink hover:bg-sunken active:bg-sunken transition-colors duration-fast cursor-pointer"
      >
        +
      </button>
    </div>
  );
}

/**
 * FeedPanel — 喂养 Tab
 *
 * 三段：
 *   №01 Quantity      面包数量（驱动配方与喂种用量）
 *   №02 Seed amount   旧种数量
 *   №03 1:1 Feed      自动算出加粉/加水量 + 总量 + 取用提示
 *
 * Props:
 *   numUnits / onNumUnitsChange
 *   seedStarter / onSeedChange
 *   feed     calculator.calculateFeed() 输出 { needed, seed, flour, water, total, buffer }
 */
export function FeedPanel({
  numUnits,
  onNumUnitsChange,
  seedStarter,
  onSeedChange,
  feed,
}) {
  if (!feed) return null;

  return (
    <div className="space-y-7">
      {/* №01 Quantity */}
      <section>
        <SecHead n={1} label="Quantity" zhLabel="面包数量" />
        <Stepper
          value={numUnits}
          onChange={onNumUnitsChange}
          step={1}
          min={1}
          labelEn="Loaves"
          labelZh="个"
          ariaLabel="面包数量"
        />
      </section>

      {/* №02 Seed amount */}
      <section>
        <SecHead n={2} label="Seed amount" zhLabel="旧种数量" />
        <Stepper
          value={seedStarter}
          onChange={onSeedChange}
          step={5}
          min={5}
          suffix="g"
          labelEn="Existing"
          labelZh="现有量"
          ariaLabel="旧种数量"
        />
      </section>

      {/* №03 1:1 Feed */}
      <section>
        <SecHead n={3} label="1:1 Feed" zhLabel="喂养方案" />
        <div className="grid grid-cols-2 border border-ink">
          {[
            { label: 'Add flour', zh: '加 T65', v: feed.flour },
            { label: 'Add water', zh: '加 水',  v: feed.water },
          ].map((x, i) => (
            <div
              key={x.label}
              className={`p-5 bg-surface ${i > 0 ? 'border-l border-ink' : ''}`}
            >
              <div className="font-mono text-2xs text-faint uppercase tracking-[0.24em]">
                {x.label}
              </div>
              <div className="font-zh text-xs text-muted mt-0.5">{x.zh}</div>
              <div className="font-display font-medium text-4xl text-ink leading-none mt-3 tabular-nums" style={{ letterSpacing: '-0.03em' }}>
                {x.v}
              </div>
              <div className="font-mono text-2xs text-faint uppercase tracking-[0.24em] mt-1">
                grams
              </div>
            </div>
          ))}
        </div>

        {/* 总量 */}
        <div className="flex justify-between items-baseline border-t-2 border-b-2 border-ink py-3 mt-4">
          <div>
            <div className="font-mono text-2xs text-faint uppercase tracking-[0.30em]">
              Total after feed
            </div>
            <div className="font-zh text-xs text-muted mt-0.5">喂养后总量</div>
          </div>
          <div className="font-display font-medium text-3xl text-ink tabular-nums" style={{ letterSpacing: '-0.03em' }}>
            {feed.total}
            <span className="font-mono text-sm text-faint ml-1.5">g</span>
          </div>
        </div>

        {/* Memo */}
        <div className="mt-4 px-4 py-3 bg-surface border border-line-soft border-l-[3px] border-l-accent">
          <div className="font-mono text-2xs text-accent-ink uppercase tracking-[0.30em] mb-1.5">
            Memo · 操作提示
          </div>
          <p className="font-zh text-sm text-muted leading-relaxed">
            取 <strong className="font-mono text-ink font-semibold">{seedStarter}g</strong> 旧种，加粉和水。
            静置至峰值（4–6h），取 <strong className="font-mono text-ink font-semibold">{feed.needed}g</strong> 用于配方，
            剩 <strong className="font-mono text-ink font-semibold">{feed.buffer}g</strong> 作下次火种。
          </p>
        </div>
      </section>
    </div>
  );
}

export default FeedPanel;
