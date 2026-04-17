import React from 'react';
import { cn } from '../../lib/cn.js';

/**
 * IngredientTable — 极简表格（无 leader dots 喧宾夺主）
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
    <div className={cn('space-y-3', className)}>
      <ul className="divide-y divide-line-soft">
        {baseRows.map((ing) => (
          <Row key={ing.id} ing={ing} showBakersPct={showBakersPct} />
        ))}
      </ul>

      {modRows.length > 0 && (
        <>
          <div className="text-[10px] uppercase tracking-[0.18em] text-faint font-body pt-1">
            Modifier
          </div>
          <ul className="divide-y divide-line-soft">
            {modRows.map((ing) => (
              <Row key={ing.id} ing={ing} showBakersPct={showBakersPct} accent />
            ))}
          </ul>
        </>
      )}

      <div className="pt-3 border-t border-line-soft flex items-baseline justify-between">
        <span className="text-xs text-muted font-body">总重</span>
        <span className="font-display text-xl tabular-nums text-ink tracking-tight">
          {totalWeight}
          <span className="text-xs text-faint font-mono font-normal ml-1">g</span>
        </span>
      </div>
    </div>
  );
}

function Row({ ing, showBakersPct, accent }) {
  return (
    <li className="flex items-baseline py-2.5 gap-3">
      <span
        className={cn(
          'flex-1 font-body text-[13px] min-w-0 truncate',
          accent ? 'text-accent-ink' : 'text-ink'
        )}
      >
        {ing.name}
        {ing.note && (
          <span className="text-[11px] text-faint ml-1.5">· {ing.note}</span>
        )}
      </span>

      {showBakersPct && ing.bakersPct !== undefined && (
        <span className="font-mono text-[10px] text-faint tabular-nums shrink-0 w-10 text-right">
          {Math.round(ing.bakersPct * 1000) / 10}%
        </span>
      )}

      <span className="font-mono text-[13px] tabular-nums text-ink shrink-0 w-14 text-right">
        {formatWeight(ing.weight)}
        <span className="text-[10px] text-faint ml-0.5">g</span>
      </span>
    </li>
  );
}

function formatWeight(w) {
  if (Number.isInteger(w)) return w;
  return Math.round(w * 10) / 10;
}

export default IngredientTable;
