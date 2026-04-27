import React from 'react';

/**
 * ActiveFlavorBar — Formula tab 顶部 sticky 横条
 *
 * 三栏 flex：
 *   [ № 07 ]   Golden Turmeric              71%
 *              金黄姜黄                       Hydration
 *
 * 两侧都是两行结构（Latin/zh + 数值/标签），节奏对齐，
 * 中间编号单行用 items-center 居中。
 *
 * Props:
 *   flavor       FLAVORS 中的一项
 *   index        在 FLAVORS 中的序号
 *   hydration    0-1
 *
 * 注意：sticky 由父级 (App.jsx 中 nav+bar 合并后的 sticky 包裹) 统一处理。
 */
export function ActiveFlavorBar({ flavor, index, hydration }) {
  const pct = Math.round(hydration * 100);
  const num = String(index + 1).padStart(2, '0');

  return (
    <div className="border-b border-line-soft bg-bg">
      <div className="flex items-center gap-3 sm:gap-4 py-3 sm:py-3.5 px-3 sm:px-4">
        {/* 编号：单行、纯文字、不加框 */}
        <div className="font-mono text-[11px] sm:text-xs text-faint uppercase tracking-[0.24em] tabular-nums whitespace-nowrap shrink-0">
          № {num}
        </div>

        {/* 名称：Latin 一行 + zh 一行（竖排） */}
        <div className="flex-1 min-w-0">
          <div
            className="font-display text-base sm:text-md font-medium text-ink leading-tight truncate"
            style={{ letterSpacing: '-0.015em' }}
          >
            {flavor.nameLatin}
          </div>
          <div className="font-zh text-[11px] sm:text-xs text-muted leading-tight truncate mt-0.5">
            {flavor.name}
          </div>
        </div>

        {/* 水合度：值（大）+ 标签（小）竖排，永远不会和 Hydration 重叠 */}
        <div className="text-right shrink-0 leading-none">
          <div className="font-mono font-semibold text-ink tabular-nums">
            <span className="text-base sm:text-lg">{pct}</span>
            <span className="text-sm sm:text-base font-normal text-muted ml-0.5">%</span>
          </div>
          <div className="font-mono text-2xs text-faint uppercase tracking-[0.22em] mt-1.5 whitespace-nowrap">
            Hydration
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActiveFlavorBar;
