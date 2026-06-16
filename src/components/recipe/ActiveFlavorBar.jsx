import React from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * ActiveFlavorBar — Formula tab 顶部 sticky 横条
 *
 *   [ № 07 ]   Golden Turmeric              71%  +1%
 *              金黄姜黄                       Hydration
 *
 * flavor 为 null = 自定义组合（不在预设列表里），编号位显示 "—"，
 * 名称显示传入的 customLabel（实际选中的 modifier 名）。
 *
 * 水合度右侧附与基准的差值（base 70% → +1% 等），让用户感知"改了什么"。
 * 有 warnings 时在最右补一个数字徽标，提醒下方有注意事项。
 *
 * Props:
 *   flavor        命中的预设，或 null
 *   customLabel   flavor=null 时的自定义名称
 *   index         在 FLAVORS 中的序号（flavor=null 时忽略）
 *   hydration     0-1
 *   baseHydration 0-1，基准水合度（算 delta）
 *   warningCount  当前 warnings 数
 */
export function ActiveFlavorBar({ flavor, customLabel, index, hydration, baseHydration, warningCount = 0 }) {
  const pct = Math.round(hydration * 100);
  const isCustom = !flavor;
  const num = isCustom ? '—' : String(index + 1).padStart(2, '0');
  const latin = isCustom ? 'Custom blend' : flavor.nameLatin;
  const zh = isCustom ? (customLabel || '自定义组合') : flavor.name;

  const delta = baseHydration != null ? Math.round((hydration - baseHydration) * 100) : 0;
  const deltaText = delta === 0 ? null : `${delta > 0 ? '+' : ''}${delta}%`;

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
            {latin}
          </div>
          <div className="font-zh text-[11px] sm:text-xs text-muted leading-tight truncate mt-0.5">
            {zh}
          </div>
        </div>

        {/* warnings 徽标：有注意事项时提示下方 */}
        {warningCount > 0 && (
          <div
            className="flex items-center gap-1 shrink-0 text-accent-ink"
            title={`${warningCount} 条注意事项见下方批注`}
          >
            <AlertTriangle className="size-3.5" strokeWidth={1.8} />
            <span className="font-mono text-xs tabular-nums">{warningCount}</span>
          </div>
        )}

        {/* 水合度：值（大）+ delta + 标签（小）竖排 */}
        <div className="text-right shrink-0 leading-none">
          <div className="font-mono font-semibold text-ink tabular-nums">
            <span className="text-base sm:text-lg">{pct}</span>
            <span className="text-sm sm:text-base font-normal text-muted ml-0.5">%</span>
            {deltaText && (
              <span className="text-2xs font-normal text-accent-ink ml-1">{deltaText}</span>
            )}
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
