import React from 'react';

/**
 * LedgerRow — 配方表行
 *
 * 用于 IngredientTable，每行 4 列：
 *   ┌─ name (zh) + en (latin) ─┬─ bp% ─┬─ grams ─┬─ src tag ─┐
 *
 * Props:
 *   name   中文名（如 "T65 高筋粉"）
 *   en     拉丁/英文副标题（如 "Strong wheat"）
 *   pct    "70.0%"
 *   grams  number (会渲染为 mono)
 *   src    'base' | 'modifier' | 'mod' | 'autolyse' | 'reserved' | 'salt' | string
 *   last   boolean — 取消下边框
 */
export function LedgerRow({ name, en, pct, grams, src, last = false }) {
  const srcLabel = src === 'modifier' ? 'mod'
                : src === 'base'     ? '·'
                : src;

  return (
    <div
      className={`grid items-baseline gap-1 py-2 ${last ? '' : 'border-b border-line-soft'}`}
      style={{ gridTemplateColumns: '1fr 50px 60px 38px' }}
    >
      <div className="min-w-0">
        <div className="font-zh text-base text-ink leading-tight truncate">{name}</div>
        {en && (
          <div className="font-serif text-xs text-muted italic mt-0.5 leading-tight truncate">
            {en}
          </div>
        )}
      </div>
      <div className="font-mono text-xs text-muted text-right tabular-nums whitespace-nowrap">
        {pct}
      </div>
      <div className="font-mono text-base text-ink text-right tabular-nums whitespace-nowrap">
        {grams}
        <span className="text-2xs text-faint ml-0.5">g</span>
      </div>
      <div className="font-mono text-2xs text-faint uppercase text-right">
        {srcLabel}
      </div>
    </div>
  );
}

export default LedgerRow;
