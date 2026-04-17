import React from 'react';
import { cn } from '../../lib/cn.js';

/**
 * IngredientTable — 严格等高行的配方表
 *
 * 所有行共享同一 grid 模板：[dot] [name · note] [bp%] [weight g]
 * base 行 dot 不可见但占位，保证行高与 modifier 行完全一致。
 */
export function IngredientTable({
  ingredients,
  totalWeight,
  showBakersPct = true,
  className,
}) {
  const baseRows = ingredients.filter((i) => i.source !== 'modifier');
  const modRows = ingredients.filter((i) => i.source === 'modifier');
  const hasMod = modRows.length > 0;

  return (
    <div className={cn('space-y-4', className)}>
      <ul className="divide-y divide-line-soft">
        {baseRows.map((ing) => (
          <Row key={ing.id} ing={ing} showBakersPct={showBakersPct} />
        ))}
        {hasMod && (
          <>
            {/* modifier 分组 —— 紧接 base 行，共用 divide-y */}
            {modRows.map((ing) => (
              <Row key={ing.id} ing={ing} showBakersPct={showBakersPct} accent />
            ))}
          </>
        )}
      </ul>

      <div className="flex items-baseline justify-between pt-4 border-t border-line">
        <span className="text-[10px] text-muted font-body uppercase tracking-[0.18em]">
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

/** 统一行结构：grid [14px dot] [1fr name] [44px bp] [64px weight] */
function Row({ ing, showBakersPct, accent }) {
  return (
    <li
      className="grid items-center py-4 gap-3"
      style={{ gridTemplateColumns: '6px 1fr 44px 64px' }}
    >
      {/* dot 位 —— 始终存在，accent 时显示麦色点 */}
      <span
        className={cn(
          'w-1 h-1 rounded-full',
          accent ? 'bg-accent' : 'bg-transparent'
        )}
        aria-hidden
      />

      <span
        className={cn(
          'font-body text-sm min-w-0 truncate',
          accent ? 'text-accent-ink' : 'text-ink'
        )}
      >
        {ing.name}
        {ing.note && (
          <span className="text-[11px] text-faint ml-2">· {ing.note}</span>
        )}
      </span>

      <span className="font-mono text-[11px] text-faint tabular-nums text-right">
        {showBakersPct && ing.bakersPct !== undefined
          ? `${Math.round(ing.bakersPct * 1000) / 10}%`
          : ''}
      </span>

      <span className="font-mono text-sm tabular-nums text-ink text-right">
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
