import React from 'react';
import { cn } from '../../lib/cn.js';
import {
  SmallCaps,
  LedgerRule,
  BigSerifStepper,
} from '../primitives/index.js';
import { LedgerSection } from '../editorial/LedgerSection.jsx';
import { MemoBlock } from '../editorial/MemoBlock.jsx';
import { HydrationInline } from '../recipe/HydrationBadge.jsx';

/**
 * FeedPanel —— Ledger V2：多 LedgerSection 堆叠
 *
 * 01 Quantity 面包数量  →  BigSerifStepper (loaves) + rightMeta=H%
 * 02 Seed 旧种         →  BigSerifStepper (g)
 * 03 1:1 Feed 喂养方案 →  2-col ledger box (加T65 / 加水) + TOTAL
 * 04 Memo              →  使用说明 prose
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
    <div className={cn('space-y-10', className)}>
      {/* 01 · Quantity */}
      <LedgerSection
        ordinal={1}
        title="Quantity"
        zhTitle="面包数量"
        rightMeta={
          <HydrationInline
            value={calculated.actualHydration}
            base={base.hydration}
          />
        }
      >
        <BigSerifStepper
          value={numUnits}
          onChange={onNumUnitsChange}
          min={1}
          max={10}
          labelEn="Loaves"
          labelZh="个"
        />
      </LedgerSection>

      {/* 02 · Seed */}
      <LedgerSection ordinal={2} title="Seed" zhTitle="已有旧种">
        <BigSerifStepper
          value={seedStarter}
          onChange={onSeedChange}
          min={1}
          max={500}
          step={1}
          labelEn="Existing"
          labelZh="旧种"
          unit="g"
        />
      </LedgerSection>

      {/* 03 · Feed */}
      <LedgerSection ordinal={3} title="Feed" zhTitle="1:1 喂养方案">
        <div className="grid grid-cols-2 border border-line">
          <FeedCell labelEn="Add Flour" labelZh="加 T65" value={feed.flour} />
          <FeedCell
            labelEn="Add Water"
            labelZh="加 水"
            value={feed.water}
            leftBorder
          />
        </div>

        <div className="pt-4">
          <LedgerRule variant="double" />
          <div
            className="grid items-baseline pt-3"
            style={{ gridTemplateColumns: '1fr auto' }}
          >
            <div className="flex flex-col gap-0.5">
              <SmallCaps tone="ink">Total After Feed</SmallCaps>
              <span className="font-body text-[11px] text-faint">喂养后总量</span>
            </div>
            <span
              className="font-display tabular-nums tracking-tight text-ink leading-none text-right"
              style={{
                fontSize: 'clamp(28px, 6vw, 40px)',
                fontVariationSettings: "'opsz' 48, 'SOFT' 40, 'wght' 380",
              }}
            >
              {feed.total}
              <span className="text-[0.4em] text-faint font-mono ml-1 align-baseline">g</span>
            </span>
          </div>
        </div>
      </LedgerSection>

      {/* 04 · Memo */}
      <MemoBlock tone="warn" label="Memo">
        <p>
          取 <MonoN>{seedStarter}g</MonoN> 旧种，加粉 <MonoN>{feed.flour}g</MonoN> +
          水 <MonoN>{feed.water}g</MonoN>。28°C 发酵 4–6h 至峰值，
          取 <MonoN>{feed.needed}g</MonoN> 做面包，余约 <MonoN>{feed.buffer}g</MonoN> 作下次火种。
        </p>
      </MemoBlock>
    </div>
  );
}

function FeedCell({ labelEn, labelZh, value, leftBorder }) {
  return (
    <div className={cn('p-5 sm:p-6 flex flex-col gap-2', leftBorder && 'border-l border-line')}>
      <div className="flex flex-col gap-0.5">
        <SmallCaps tone="muted">{labelEn}</SmallCaps>
        <span className="font-body text-[11px] text-faint">{labelZh}</span>
      </div>
      <span
        className="font-display tabular-nums text-ink leading-none"
        style={{
          fontSize: 'clamp(44px, 12vw, 72px)',
          fontVariationSettings: "'opsz' 72, 'SOFT' 40, 'wght' 380",
        }}
      >
        {value}
      </span>
      <SmallCaps tone="faint">Grams</SmallCaps>
    </div>
  );
}

function MonoN({ children }) {
  return (
    <span className="font-mono tabular-nums text-ink">{children}</span>
  );
}

export default FeedPanel;
