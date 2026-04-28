import React from 'react';
import { SecHead } from '../ledger/index.js';

/**
 * Stepper — 大号 ± 步进器（编辑器风：1px 实线 + 大号 mono 数字）
 */
function Stepper({ value, onChange, step = 1, min = 1, suffix, labelEn, labelZh, ariaLabel }) {
  const dec = () => onChange(Math.max(min, value - step));
  const inc = () => onChange(value + step);
  return (
    <div
      className="grid border border-ink bg-surface grid-cols-[48px_1fr_48px] sm:grid-cols-[56px_1fr_56px]"
      role="group"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        onClick={dec}
        aria-label="decrease"
        className="font-display text-2xl text-ink border-r border-ink hover:bg-sunken active:bg-sunken transition-colors duration-fast cursor-pointer min-h-[48px]"
      >
        −
      </button>
      <div className="px-3 sm:px-4 py-3 flex items-center justify-between gap-2 min-w-0">
        <div className="font-display font-medium text-3xl sm:text-4xl text-ink leading-none tabular-nums" style={{ letterSpacing: '-0.04em' }}>
          {value}
          {suffix && (
            <span className="font-mono text-sm sm:text-base text-faint ml-1 sm:ml-1.5">{suffix}</span>
          )}
        </div>
        <div className="text-right min-w-0">
          {labelEn && (
            <div className="font-mono text-2xs text-faint uppercase tracking-[0.18em] sm:tracking-[0.24em] truncate">
              {labelEn}
            </div>
          )}
          {labelZh && (
            <div className="font-zh text-xs text-muted mt-0.5 truncate">{labelZh}</div>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={inc}
        aria-label="increase"
        className="font-display text-2xl text-ink border-l border-ink hover:bg-sunken active:bg-sunken transition-colors duration-fast cursor-pointer min-h-[48px]"
      >
        +
      </button>
    </div>
  );
}

/**
 * 复活喂养比例：1:5:5（种 : 粉 : 水），总质量 = 11x 种。
 * 用一次大稀释解决疲弱种的双重问题（食物耗尽 + pH 过低），
 * 8–12h 室温后单次达 3 倍峰。
 *
 * 关键假设：进入 Revival 模式时，罐内现存量 = targetTotal（上次正常
 * 喂养后的总量；这是用户的典型场景——"先按 1:1:1 喂到 300g 但没爆好，
 * 现在要复活"）。所以 discard = targetTotal - newSeed，不依赖 §02
 * 的 seedStarter 输入（那个字段在 Std 模式才有意义，是"下次喂养的
 * 火种基量"）。
 */
const REVIVAL_RATIO = 5;
const REVIVAL_TOTAL_MULT = 1 + REVIVAL_RATIO * 2; // 11

function calcRevival(targetTotal) {
  const newSeed = Math.max(1, Math.round(targetTotal / REVIVAL_TOTAL_MULT));
  const flour = newSeed * REVIVAL_RATIO;
  const water = newSeed * REVIVAL_RATIO;
  const total = newSeed + flour + water;
  const discard = Math.max(0, targetTotal - newSeed);
  return { newSeed, flour, water, total, discard, jarAssumed: targetTotal };
}

/** 模式切换分段控件（Std / Revival） */
function ModeToggle({ revivalMode, onChange }) {
  const btn = (active, label) => [
    'font-mono text-2xs uppercase tracking-[0.18em] px-2 py-1 transition-colors duration-fast leading-none whitespace-nowrap',
    active ? 'bg-ink text-bg cursor-default' : 'bg-bg text-muted hover:bg-sunken active:bg-sunken cursor-pointer',
  ].join(' ');
  return (
    <div className="flex border border-ink">
      <button
        type="button"
        onClick={() => onChange(false)}
        aria-pressed={!revivalMode}
        className={btn(!revivalMode)}
      >
        Std
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        aria-pressed={revivalMode}
        className={`${btn(revivalMode)} border-l border-ink`}
      >
        Revival
      </button>
    </div>
  );
}

/**
 * FeedPanel — 喂养 Tab
 *
 * 三段：
 *   №01 Quantity      面包数量
 *   №02 Seed amount   旧种数量
 *   №03 Feed          喂养方案（Std 1:1:1 单次 / Revival 1:5:5 复活模式）
 *
 * Props:
 *   numUnits / onNumUnitsChange
 *   seedStarter / onSeedChange
 *   feed                    calculator.calculateFeed() 输出
 *   revivalMode             boolean
 *   onRevivalModeChange(b)
 */
export function FeedPanel({
  numUnits,
  onNumUnitsChange,
  seedStarter,
  onSeedChange,
  feed,
  revivalMode = false,
  onRevivalModeChange,
}) {
  if (!feed) return null;

  // 复活模式的目标总量 = 配方需要 + 下次火种留量
  const targetTotal = feed.needed + feed.buffer;
  const revival = calcRevival(targetTotal);

  // 选择当前模式下要展示的数据
  const displayFlour = revivalMode ? revival.flour : feed.flour;
  const displayWater = revivalMode ? revival.water : feed.water;
  const displayTotal = revivalMode ? revival.total : feed.total;

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
          step={1}
          min={5}
          suffix="g"
          labelEn="Existing"
          labelZh="现有量"
          ariaLabel="旧种数量"
        />
      </section>

      {/* №03 Feed —— 模式切换 */}
      <section>
        <SecHead
          n={3}
          label={revivalMode ? 'Revival feed' : '1:1 Feed'}
          zhLabel={revivalMode ? '复活喂养 · 1:5:5' : '喂养方案 · 1:1:1'}
          right={<ModeToggle revivalMode={revivalMode} onChange={onRevivalModeChange} />}
        />

        {/* Revival 模式：先显示丢弃 / 保留种量 */}
        {revivalMode && (
          <div className="grid grid-cols-2 border border-ink mb-px">
            <div className="p-4 sm:p-5 bg-surface">
              <div className="font-mono text-2xs text-faint uppercase tracking-[0.24em]">
                Discard
              </div>
              <div className="font-zh text-xs text-muted mt-0.5">丢弃</div>
              <div className="font-display font-medium text-4xl text-ink leading-none mt-3 tabular-nums" style={{ letterSpacing: '-0.03em' }}>
                {revival.discard}
              </div>
              <div className="font-mono text-2xs text-faint uppercase tracking-[0.24em] mt-1">
                grams
              </div>
            </div>
            <div className="p-4 sm:p-5 bg-surface border-l border-ink">
              <div className="font-mono text-2xs text-faint uppercase tracking-[0.24em]">
                Keep seed
              </div>
              <div className="font-zh text-xs text-muted mt-0.5">保留种量</div>
              <div className="font-display font-medium text-4xl text-ink leading-none mt-3 tabular-nums" style={{ letterSpacing: '-0.03em' }}>
                {revival.newSeed}
              </div>
              <div className="font-mono text-2xs text-faint uppercase tracking-[0.24em] mt-1">
                grams
              </div>
            </div>
          </div>
        )}

        {/* 加粉 / 加水（两种模式共用同一布局，数据按模式切换） */}
        <div className="grid grid-cols-2 border border-ink">
          {[
            { label: 'Add flour', zh: '加 T65', v: displayFlour },
            { label: 'Add water', zh: '加 水',  v: displayWater },
          ].map((x, i) => (
            <div
              key={x.label}
              className={`p-4 sm:p-5 bg-surface ${i > 0 ? 'border-l border-ink' : ''}`}
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
            {displayTotal}
            <span className="font-mono text-sm text-faint ml-1.5">g</span>
          </div>
        </div>

        {/* Memo —— 不同模式不同提示 */}
        {revivalMode ? (
          <div className="mt-4 px-4 py-3 bg-surface border border-line-soft border-l-[3px] border-l-accent">
            <div className="font-mono text-2xs text-accent-ink uppercase tracking-[0.30em] mb-1.5">
              Memo · 复活操作
            </div>
            <p className="font-zh text-sm text-muted leading-relaxed">
              假设罐内有 <strong className="font-mono text-ink font-semibold">{revival.jarAssumed}g</strong> 旧种
              （上次正常喂养后的总量）。从中取 <strong className="font-mono text-ink font-semibold">{revival.newSeed}g</strong>，
              其余 <strong className="font-mono text-ink font-semibold">{revival.discard}g</strong> 丢弃。
              加 <strong className="font-mono text-ink font-semibold">{revival.flour}g</strong> 粉
              + <strong className="font-mono text-ink font-semibold">{revival.water}g</strong> 水（1:5:5 强稀释）。
              室温 25°C 静置 <strong className="font-mono text-ink font-semibold">8–12h</strong> 达 3 倍峰即可揉面；
              夏天高温缩短到 6–8h，冬天延长到 12–16h。
            </p>
          </div>
        ) : (
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
        )}
      </section>
    </div>
  );
}

export default FeedPanel;
