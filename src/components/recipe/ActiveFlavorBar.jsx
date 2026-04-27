import React from 'react';
import { StampRadial } from '../ledger/index.js';

/**
 * ActiveFlavorBar — Formula tab 顶部 sticky 横条
 *
 * 滚动时一直贴顶，显示当前激活的 flavor，方便用户在浏览风味列表时
 * 不丢失"我现在选的是什么"。
 *
 * 布局：[ № 圆章 40px ] | [ Latin name + 中文名 ] | [ Hydration + Mods ]
 *
 * Props:
 *   flavor       FLAVORS 中的一项（含 name / nameLatin / modifiers）
 *   index        在 FLAVORS 列表中的序号
 *   hydration    数字 0-1
 */
export function ActiveFlavorBar({ flavor, index, hydration }) {
  return (
    <div className="sticky top-[76px] sm:top-[88px] z-20 bg-bg/95 backdrop-blur-sm border-b border-ink">
      <div className="grid items-center gap-2 sm:gap-3 py-2.5 sm:py-3 grid-cols-[36px_1fr_auto] sm:grid-cols-[40px_1fr_auto]">
        {/* 圆章 + 编号 */}
        <div className="relative w-9 h-9 sm:w-10 sm:h-10">
          <div className="absolute inset-0 opacity-60 text-ink">
            <StampRadial size={40} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-semibold text-ink">
            {String(index + 1).padStart(2, '0')}
          </div>
        </div>

        {/* 名称：移动端竖排（Latin 一行 + zh 一行），sm: 横排 */}
        <div className="min-w-0">
          <div className="font-mono text-2xs text-faint uppercase tracking-[0.24em]">
            Active · 当前
          </div>
          <div className="mt-0.5 min-w-0 sm:flex sm:items-baseline sm:gap-2">
            <div className="font-display text-base sm:text-md font-medium text-ink leading-tight truncate" style={{ letterSpacing: '-0.015em' }}>
              {flavor.nameLatin}
            </div>
            <div className="font-zh text-[11px] sm:text-xs text-muted truncate">
              {flavor.name}
            </div>
          </div>
        </div>

        {/* 数据 */}
        <div className="text-right border-l border-line-soft pl-2 sm:pl-3">
          <div className="font-mono text-2xs text-faint uppercase tracking-[0.18em] sm:tracking-[0.24em] whitespace-nowrap">
            H · {flavor.modifiers.length} mod
          </div>
          <div className="font-mono text-[15px] sm:text-base font-semibold text-ink leading-tight tabular-nums mt-0.5">
            {Math.round(hydration * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActiveFlavorBar;
