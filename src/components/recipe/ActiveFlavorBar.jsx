import React from 'react';

/**
 * ActiveFlavorBar — Formula tab 顶部 sticky 单行条
 *
 * 紧凑、低视觉重量的"当前选中"指示条。一行布局：
 *   № 09   Country Bread · 原味             70% Hydr.
 *
 * 设计原则：
 *   - 不要竞争 Tab nav 的视觉权重（nav 已经有黑色 active 块）
 *   - 不要"框中框"——零内部边框，靠父级 sticky 提供分隔
 *   - 单行强制 truncate，长名字优雅省略而非换行
 *
 * Props:
 *   flavor       FLAVORS 中的一项
 *   index        在 FLAVORS 中的序号
 *   hydration    0-1
 *
 * 注意：sticky 由父级 (App.jsx 中 nav+bar 合并后的 sticky 包裹) 统一处理，
 *       本组件不做 sticky/top/z。
 */
export function ActiveFlavorBar({ flavor, index, hydration }) {
  const pct = Math.round(hydration * 100);
  const num = String(index + 1).padStart(2, '0');

  return (
    <div className="border-b border-line-soft bg-surface">
      <div className="flex items-baseline gap-3 sm:gap-4 py-2.5 sm:py-3 px-3 sm:px-4">
        {/* № 编号：纯文字、不加框 */}
        <div className="font-mono text-[11px] sm:text-xs text-faint uppercase tracking-[0.22em] tabular-nums whitespace-nowrap shrink-0">
          № {num}
        </div>

        {/* Latin 名 + 中文名同行；溢出 truncate */}
        <div className="flex-1 min-w-0 flex items-baseline gap-2 truncate">
          <span
            className="font-display text-base sm:text-md font-medium text-ink leading-none truncate"
            style={{ letterSpacing: '-0.015em' }}
          >
            {flavor.nameLatin}
          </span>
          <span className="font-zh text-[12px] sm:text-xs text-muted truncate shrink-0">
            {flavor.name}
          </span>
        </div>

        {/* 水合度：右对齐紧凑表达 */}
        <div className="font-mono text-sm sm:text-base text-ink tabular-nums whitespace-nowrap shrink-0">
          <span className="font-semibold">{pct}%</span>
          <span className="font-mono text-2xs text-faint uppercase tracking-[0.18em] ml-1.5">
            Hydr.
          </span>
        </div>
      </div>
    </div>
  );
}

export default ActiveFlavorBar;
