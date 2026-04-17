import React from 'react';
import { cn } from '../../lib/cn.js';

/**
 * IngredientTable — 日式表格线形（leader dots 填充）
 *
 * Props:
 *   ingredients   Array from calculator.ingredients
 *   totalWeight   number
 *   showBakersPct 是否显示 baker's percentage (默认 true)
 */
export function IngredientTable({
  ingredients,
  totalWeight,
  showBakersPct = true,
  className,
}) {
  // 分组：base 与 modifier
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
          <div className="text-[10px] uppercase tracking-widest text-faint font-body pt-2">
            + Modifier
          </div>
          <ul className="divide-y divide-line-soft">
            {modRows.map((ing) => (
              <Row
                key={ing.id}
                ing={ing}
                showBakersPct={showBakersPct}
                accent
              />
            ))}
          </ul>
        </>
      )}

      {/* 总重 */}
      <div className="pt-3 border-t border-line flex items-baseline justify-between">
        <span className="text-xs uppercase tracking-widest text-muted font-body">
          面团最终重量
        </span>
        <span className="font-display text-3xl tabular-nums text-ink tracking-tight">
          {totalWeight}
          <span className="text-sm text-faint font-mono font-normal ml-1">g</span>
        </span>
      </div>
    </div>
  );
}

function Row({ ing, showBakersPct, accent }) {
  return (
    <li className="flex items-baseline py-2.5 gap-2">
      {/* Accent dot for modifier rows */}
      {accent && (
        <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" aria-hidden />
      )}

      <span
        className={cn(
          'font-body text-sm shrink-0',
          accent ? 'text-accent-ink' : 'text-ink'
        )}
      >
        {ing.name}
      </span>

      {ing.note && (
        <span className="text-[11px] text-faint font-body shrink-0">
          · {ing.note}
        </span>
      )}

      {/* Leader dots */}
      <span
        className="flex-1 border-b border-dotted border-faint/50 translate-y-[-3px]"
        aria-hidden
      />

      {showBakersPct && ing.bakersPct !== undefined && (
        <span className="font-mono text-[11px] text-faint tabular-nums shrink-0">
          {Math.round(ing.bakersPct * 1000) / 10}%
        </span>
      )}

      <span className="font-mono text-base tabular-nums text-ink shrink-0">
        {formatWeight(ing.weight)}
        <span className="text-xs text-faint ml-0.5">g</span>
      </span>
    </li>
  );
}

function formatWeight(w) {
  if (Number.isInteger(w)) return w;
  return Math.round(w * 10) / 10;
}

export default IngredientTable;
