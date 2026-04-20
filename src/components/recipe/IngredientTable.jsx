import React from 'react';
import { cn } from '../../lib/cn.js';
import { SmallCaps, LedgerRule } from '../primitives/index.js';

/**
 * IngredientTable —— Ledger V2 式配方表
 *
 * 结构：
 *   表头行：INGREDIENT · BAK% · GRAM（SmallCaps，底 hairline）
 *   每行：CN 名（Fraunces md） / mono tracked 小字（note 或 id） · bp% · 克数（Fraunces pullquote）
 *   每行底 1px dotted border（ledger leader 感）
 *   底 TOTAL：double hairline 之上 + `TOTAL 总重` + 大号 Fraunces 克数
 *
 * modifier 行：左侧加一个极小的 accent 方块作视觉区分
 */
export function IngredientTable({
  ingredients,
  totalWeight,
  showBakersPct = true,
  className,
}) {
  return (
    <div className={cn('space-y-0', className)}>
      {/* Table header */}
      <div
        className="grid items-baseline pb-2 border-b border-line"
        style={{ gridTemplateColumns: '1fr 56px 96px' }}
      >
        <SmallCaps tone="faint">Ingredient</SmallCaps>
        <SmallCaps tone="faint" className="text-right">Bak%</SmallCaps>
        <SmallCaps tone="faint" className="text-right">Gram</SmallCaps>
      </div>

      <ul>
        {ingredients.map((ing) => (
          <Row key={ing.id} ing={ing} showBakersPct={showBakersPct} />
        ))}
      </ul>

      {/* TOTAL */}
      <div className="pt-3">
        <LedgerRule variant="double" />
        <div
          className="grid items-baseline pt-3"
          style={{ gridTemplateColumns: '1fr auto' }}
        >
          <div className="flex flex-col gap-0.5">
            <SmallCaps tone="ink">Total</SmallCaps>
            <span className="font-body text-[11px] text-faint">总重</span>
          </div>
          <span
            className="font-display tabular-nums tracking-tight text-ink leading-none text-right"
            style={{
              fontSize: 'clamp(28px, 6vw, 40px)',
              fontVariationSettings: "'opsz' 48, 'SOFT' 40, 'wght' 380",
            }}
          >
            {totalWeight}
            <span className="text-[0.4em] text-faint font-mono ml-1 align-baseline">g</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function Row({ ing, showBakersPct }) {
  const accent = ing.source === 'modifier';
  return (
    <li
      className="grid items-baseline py-3 border-b border-dotted border-line-soft"
      style={{ gridTemplateColumns: '1fr 56px 96px' }}
    >
      {/* Name col: CN 主 + note/latin 小字 */}
      <div className="flex flex-col gap-0.5 min-w-0 pr-2">
        <span
          className={cn(
            'font-display text-[16px] sm:text-[17px] leading-tight truncate',
            accent ? 'text-accent-ink' : 'text-ink'
          )}
          style={{ fontVariationSettings: "'opsz' 24, 'wght' 400" }}
        >
          {accent && (
            <span
              className="inline-block w-1 h-1 mr-2 align-middle bg-accent"
              aria-hidden
            />
          )}
          {ing.name}
        </span>
        {ing.note && (
          <span className="text-[10px] text-faint font-body uppercase tracking-[0.14em]">
            {ing.note}
          </span>
        )}
      </div>

      {/* BAK% */}
      <span className="font-mono text-[11px] text-faint tabular-nums text-right">
        {showBakersPct && ing.bakersPct !== undefined
          ? `${Math.round(ing.bakersPct * 1000) / 10}`
          : ''}
      </span>

      {/* GRAM —— Fraunces meta-big */}
      <span
        className="font-display tabular-nums text-ink leading-none text-right"
        style={{
          fontSize: 'clamp(22px, 5vw, 28px)',
          fontVariationSettings: "'opsz' 36, 'SOFT' 40, 'wght' 380",
        }}
      >
        {formatWeight(ing.weight)}
        <span className="text-[0.4em] text-faint font-mono ml-0.5 align-baseline">g</span>
      </span>
    </li>
  );
}

function formatWeight(w) {
  if (Number.isInteger(w)) return w;
  return Math.round(w * 10) / 10;
}

export default IngredientTable;
