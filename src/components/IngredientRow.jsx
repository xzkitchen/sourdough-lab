import React from 'react';

/**
 * 配料行组件
 * @param {string} name - 配料名称
 * @param {number} weight - 重量 (g)
 * @param {number} percent - 百分比
 * @param {string} note - 备注
 * @param {boolean} accent - 是否高亮显示
 */
export function IngredientRow({ name, weight, percent, note, accent }) {
  return (
    <div className={`flex items-center justify-between px-6 py-4 ${accent ? 'bg-orange-500/5' : ''}`}>
      <div className="flex-1">
        <span className={`font-medium text-sm ${accent ? 'text-orange-200' : 'text-neutral-200'}`}>
          {name}
        </span>
        {note && (
          <span className="ml-2 text-[10px] text-neutral-500">
            {note}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm font-bold text-white">
          {weight}<span className="text-neutral-500 font-normal text-xs ml-0.5">g</span>
        </span>
        <span className="text-[10px] text-neutral-500 font-medium w-10 text-right">
          {percent}%
        </span>
      </div>
    </div>
  );
}
