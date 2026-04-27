import React from 'react';

/**
 * ActiveFlavorBar — Formula tab 顶部 sticky 横条
 *
 * 滚动时一直贴顶，显示当前激活的 flavor，方便用户在浏览风味列表时
 * 不丢失"我现在选的是什么"。
 *
 * 布局：[ № 09 数字牌 ] | [ Latin name + 中文名 ] | [ 水合度 · HYDRATION / 73% ]
 *
 * Props:
 *   flavor       FLAVORS 中的一项（含 name / nameLatin / modifiers）
 *   index        在 FLAVORS 列表中的序号
 *   hydration    数字 0-1
 */
// 注意：sticky 由父级 (App.jsx 中 nav+bar 合并后的 sticky 包裹) 统一处理，
//       本组件自己不做 sticky/top/z，避免和 nav 之间出现像素缝隙。
export function ActiveFlavorBar({ flavor, index, hydration }) {
  return (
    <div className="border-b border-ink bg-bg">
      <div className="grid items-center gap-3 sm:gap-4 py-2.5 sm:py-3 px-3 sm:px-4 grid-cols-[40px_1fr_auto] sm:grid-cols-[44px_1fr_auto]">
        {/* 编号牌：1px 实线方形 + 大号 mono 数字（清晰、编辑器风）*/}
        <div className="border border-ink flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11">
          <div className="font-mono text-[15px] sm:text-base font-semibold text-ink tabular-nums leading-none">
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

        {/* 水合度：清晰双语标签 + 大号数字 */}
        <div className="text-right border-l border-line-soft pl-3 sm:pl-4 min-w-0">
          <div className="font-mono text-2xs text-faint uppercase tracking-[0.20em] whitespace-nowrap">
            Hydration
          </div>
          <div className="font-zh text-[10px] text-faint leading-none mt-0.5">水合度</div>
          <div className="font-mono text-base sm:text-lg font-semibold text-ink leading-none tabular-nums mt-1">
            {Math.round(hydration * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActiveFlavorBar;
