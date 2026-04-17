import React from 'react';
import { cn } from '../../lib/cn.js';

/**
 * IngredientTable — 宽松优雅的配方表
 *
 * 基础食材 + Modifier 食材用虚线分隔，不加小标签。
 * Modifier 行左侧 1px accent dot 做视觉识别。
 */
export function IngredientTable({
  ingredients,
  totalWeight,
  showBakersPct = true,
  className,
}) {
  const baseRows = ingredients.filter((i) => i.source !== 'modifier');
  const modRows = ingredients.filter((i) => i.source === 'modifier');

  return (
    <div className={cn('space-y-5', className)}>
      <ul className="divide-y divide-line-soft">
        {baseRows.map((ing) => (
          <Row key={ing.id} ing={ing} showBakersPct={showBakersPct} />
        ))}
      </ul>

      {modRows.length > 0 && (
        <>
          <div className="border-t border-dashed border-line" aria-hidden />
          <ul className="divide-y divide-line-soft">
            {modRows.map((ing) => (
              <Row key={ing.id} ing={ing} showBakersPct={showBakersPct} accent />
            ))}
          </ul>
        </>
      )}

      <div className="flex items-baseline justify-between pt-5 border-t border-line">
        <span className="text-xs text-muted font-body uppercase tracking-[0.18em]">
          总重 · Total
        </span>
        <span className="font-display text-2xl tabular-nums text-ink tracking-tight">
          {totalWeight}
          <span className="text-xs text-faint font-mono font-normal ml-1">g</span>
        </span>
      </div>
    </div>
  );
}

function Row({ ing, showBakersPct, accent }) {
  return (
    <li className="flex items-baseline py-4 gap-3">
      {accent && (
        <span
          className="w-1 h-1 rounded-full bg-accent shrink-0 translate-y-[-2px]"
          aria-hidden
        />
      )}
      <span
        className={cn(
          'flex-1 font-body text-sm min-w-0 truncate',
          accent ? 'text-accent-ink' : 'text-ink'
        )}
      >
        {ing.name}
        {ing.note && (
          <span className="text-[11px] text-faint ml-2">· {ing.note}</span>
        )}
      </span>

      {showBakersPct && ing.bakersPct !== undefined && (
        <span className="font-mono text-[11px] text-faint tabular-nums shrink-0 w-12 text-right">
          {Math.round(ing.bakersPct * 1000) / 10}%
        </span>
      )}

      <span className="font-mono text-sm tabular-nums text-ink shrink-0 w-16 text-right">
        {formatWeight(ing.weight)}
        <span className="text-[11px] text-faint ml-0.5">g</span>
      </span>
    </li>
  );
}

function formatWeight(w) {
  if (Number.isInteger(w)) return w;
  return Math.round(w * 10) / 10;
}

export default IngredientTable;
