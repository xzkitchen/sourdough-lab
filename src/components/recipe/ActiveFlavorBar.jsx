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
    <div className="sticky top-0 z-20 bg-bg/95 backdrop-blur-sm border-b border-ink">
      <div className="grid items-center gap-3 py-3" style={{ gridTemplateColumns: '40px 1fr auto' }}>
        {/* 圆章 + 编号 */}
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 opacity-60 text-ink">
            <StampRadial size={40} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-semibold text-ink">
            {String(index + 1).padStart(2, '0')}
          </div>
        </div>

        {/* 名称 */}
        <div className="min-w-0">
          <div className="font-mono text-2xs text-faint uppercase tracking-[0.24em]">
            Active · 当前
          </div>
          <div className="flex items-baseline gap-2 mt-0.5 min-w-0">
            <div className="font-display text-md font-medium text-ink leading-none truncate" style={{ letterSpacing: '-0.015em' }}>
              {flavor.nameLatin}
            </div>
            <div className="font-zh text-xs text-muted whitespace-nowrap">
              {flavor.name}
            </div>
          </div>
        </div>

        {/* 数据 */}
        <div className="text-right border-l border-line-soft pl-3">
          <div className="font-mono text-2xs text-faint uppercase tracking-[0.24em]">
            H · {flavor.modifiers.length} mod
          </div>
          <div className="font-mono text-base font-semibold text-ink leading-tight tabular-nums mt-0.5">
            {Math.round(hydration * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActiveFlavorBar;
