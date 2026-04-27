import React from 'react';

/**
 * SecHead — 编号节标题
 *
 *   № 01    FLAVOR              [right slot]
 *           风味预设
 *
 * 视觉：
 *   - 顶部一条 1px 实线
 *   - 编号 № 01：等宽小字，间距大
 *   - Latin 标签：等宽 caps，间距大
 *   - 中文小标题：Noto Serif SC，弱色
 *   - right：放置数据 chip / 状态条
 */
export function SecHead({ n, label, zhLabel, right, className = '' }) {
  return (
    <div className={`pt-2 mb-2 sm:pt-3 sm:mb-3 border-t border-ink ${className}`}>
      <div className="flex items-baseline justify-between gap-2 sm:gap-3">
        <div className="flex items-baseline gap-2 sm:gap-3 min-w-0">
          <span className="font-mono text-2xs text-muted uppercase tracking-[0.20em] sm:tracking-[0.24em] whitespace-nowrap">
            № {String(n).padStart(2, '0')}
          </span>
          <span className="font-mono text-[11px] sm:text-xs text-ink uppercase tracking-[0.16em] sm:tracking-[0.18em] whitespace-nowrap">
            {label}
          </span>
        </div>
        {right && <div className="flex-shrink-0">{right}</div>}
      </div>
      {zhLabel && (
        <div className="font-zh text-[13px] sm:text-sm text-muted mt-0.5">{zhLabel}</div>
      )}
    </div>
  );
}

export default SecHead;
