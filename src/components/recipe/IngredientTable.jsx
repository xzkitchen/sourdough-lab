import React from 'react';
import { LedgerRow } from '../ledger/index.js';

/**
 * IngredientTable — 配方清单（编辑器表格）
 *
 * 表格 4 列：
 *   Ingredient | Bak% | Gram | Src
 *
 * - 表头/表脚为 2px 上下双线（ledger 风）
 * - 每行 1px 软线分隔
 * - 总重单独一行，加粗 + mono
 *
 * Props:
 *   ingredients   calculator 输出的 ingredients 数组
 *   totalWeight   总重 g
 */
export function IngredientTable({ ingredients, totalWeight }) {
  return (
    <div className="border-t-2 border-b-2 border-ink">
      {/* 表头 */}
      <div
        className="grid gap-1 pt-2 pb-1 border-b border-ink"
        style={{ gridTemplateColumns: '1fr 50px 60px 38px' }}
      >
        <div className="font-mono text-2xs text-faint uppercase tracking-[0.20em]">Ingredient</div>
        <div className="font-mono text-2xs text-faint uppercase tracking-[0.20em] text-right">Bak%</div>
        <div className="font-mono text-2xs text-faint uppercase tracking-[0.20em] text-right">Gram</div>
        <div className="font-mono text-2xs text-faint uppercase tracking-[0.20em] text-right">Src</div>
      </div>

      {/* 数据行 */}
      {ingredients.map((ing, i) => (
        <LedgerRow
          key={`${ing.id}-${i}`}
          name={ing.name}
          en={prettyEn(ing)}
          pct={fmtPct(ing.bakersPct)}
          grams={ing.weight}
          src={shortSrc(ing)}
          last={i === ingredients.length - 1}
        />
      ))}

      {/* 总重行 */}
      <div
        className="grid gap-1 py-2 border-t border-ink bg-surface"
        style={{ gridTemplateColumns: '1fr 50px 60px 38px' }}
      >
        <div className="font-mono text-xs text-ink uppercase tracking-[0.20em]">
          Total · 总重
        </div>
        <div></div>
        <div className="font-mono text-base font-semibold text-ink text-right tabular-nums">
          {totalWeight}
          <span className="text-2xs text-faint ml-0.5">g</span>
        </div>
        <div></div>
      </div>
    </div>
  );
}

function fmtPct(bp) {
  if (bp == null) return '—';
  const v = bp * 100;
  return v < 10 ? `${v.toFixed(1)}%` : `${Math.round(v)}%`;
}

function shortSrc(ing) {
  if (ing.source === 'modifier') return 'mod';
  if (ing.id === 'water-autolyse') return 'auto';
  if (ing.id === 'water-reserved') return 'rsv';
  return '·';
}

/**
 * 拉丁副标题 — 给基础食材一个手账风的英文小注。
 * 对于 modifier 和未知 id，返回 null（行不显示副标）
 */
function prettyEn(ing) {
  const map = {
    flour: 'Strong wheat T65',
    'water-autolyse': 'Water · autolyse',
    'water-reserved': 'Water · bassinage 10%',
    water: 'Water · total',
    starter: 'Active levain',
    salt: 'Sea salt · fine',
  };
  return map[ing.id] || null;
}

export default IngredientTable;
