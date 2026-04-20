import React from 'react';
import { cn } from '../../lib/cn.js';

/**
 * Masthead — 刊物式页眉
 *
 * 左：ISSUE 刊号 / 出版日期 / 栏目
 * 中：刊名（Fraunces Display）
 * 右：当前 flavor 标记
 *
 * 设计语汇：hairline 分割、etalon ALL CAPS、数字用 tabular-nums。
 */
export function Masthead({ issue = '07', chapter, flavorName }) {
  const date = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' })
    .format(new Date());
  return (
    <header className="border-b border-line pb-5 sm:pb-6">
      <div className="grid grid-cols-12 gap-x-4 items-baseline">
        <div className="col-span-4 flex flex-col gap-1">
          <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.28em] text-faint font-body">
            Issue N° {issue}
          </span>
          <span className="font-mono text-[10px] text-muted tabular-nums hidden sm:block">
            {date}
          </span>
        </div>

        <h1 className="col-span-4 text-center font-display text-ink tracking-tight leading-none"
            style={{
              fontSize: 'clamp(18px, 3vw, 24px)',
              fontVariationSettings: "'opsz' 24, 'SOFT' 40, 'wght' 400",
            }}>
          Sourdough Lab
        </h1>

        <div className="col-span-4 flex flex-col items-end gap-1">
          {chapter && (
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.28em] text-faint font-body">
              {chapter}
            </span>
          )}
          {flavorName && (
            <span className="font-display italic text-muted text-xs sm:text-sm truncate max-w-full"
                  style={{ fontVariationSettings: "'opsz' 14, 'wght' 400" }}>
              {flavorName}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}

export default Masthead;
