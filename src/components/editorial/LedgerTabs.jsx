import React from 'react';
import { cn } from '../../lib/cn.js';

/**
 * LedgerTabs — 3 格 ledger 栏位 tab
 *
 * 每格：
 *   - 左上 ordinal "01"（mono tracked）
 *   - 下方主行：Fraunces EN 标题 + zh 小字
 * active: bg-ink text-surface (黑底反白)
 *
 * Props:
 *   tabs: [{ id, ordinal, en, zh }]
 *   value: 当前 active id
 *   onChange(id)
 */
export function LedgerTabs({ tabs, value, onChange, className }) {
  return (
    <nav
      role="tablist"
      aria-label="章节切换"
      className={cn(
        'grid border-t border-b border-line',
        className
      )}
      style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}
    >
      {tabs.map((t, i) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className={cn(
              'relative flex flex-col items-start gap-3 px-4 py-4 sm:px-5 sm:py-5',
              'transition-colors ease-editorial duration-fast',
              // 竖 hairline 分隔（第 i>0 格左边）
              i > 0 && 'border-l border-line',
              active
                ? 'bg-invert text-surface'
                : 'bg-transparent text-ink active:bg-sunken'
            )}
          >
            <span
              className={cn(
                'font-body uppercase tabular-nums tracking-[0.18em] text-[10px] leading-[14px]',
                active ? 'text-surface/60' : 'text-faint'
              )}
            >
              {t.ordinal}
            </span>
            <div className="flex flex-col items-start gap-0.5">
              <span
                className="font-display leading-none"
                style={{
                  fontSize: 'clamp(18px, 4vw, 22px)',
                  fontVariationSettings: "'opsz' 28, 'SOFT' 50, 'wght' 400",
                }}
              >
                {t.en}
              </span>
              <span
                className={cn(
                  'font-body text-[11px] leading-none',
                  active ? 'text-surface/70' : 'text-muted'
                )}
              >
                {t.zh}
              </span>
            </div>
          </button>
        );
      })}
    </nav>
  );
}

export default LedgerTabs;
