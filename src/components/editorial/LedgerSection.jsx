import React from 'react';
import { cn } from '../../lib/cn.js';
import { SmallCaps } from '../primitives/index.js';

/**
 * LedgerSection — 每个 tab 内部的章节包装
 *
 * 布局：header 行
 *   左：ordinal (mono-sm) + title (Fraunces md 英文) + zhTitle (正文小字)
 *   右：可选 rightMeta（如 `| H 70%`）
 *   下方：children
 *
 * 用在三个 tab 的所有 section，一致性。
 */
export function LedgerSection({
  ordinal,
  title,
  zhTitle,
  rightMeta,
  children,
  className,
}) {
  return (
    <section className={cn('space-y-4', className)}>
      <header className="flex items-baseline justify-between gap-3 pl-0">
        <div className="flex items-baseline gap-3 min-w-0 flex-wrap">
          {ordinal != null && (
            <SmallCaps tone="faint" className="shrink-0">
              {typeof ordinal === 'number' ? String(ordinal).padStart(2, '0') : ordinal}
            </SmallCaps>
          )}
          {title && (
            <h2
              className="font-display text-ink leading-none tracking-tight"
              style={{
                fontSize: 'clamp(20px, 4.5vw, 26px)',
                fontVariationSettings: "'opsz' 32, 'SOFT' 50, 'wght' 400",
              }}
            >
              {title}
            </h2>
          )}
          {zhTitle && (
            <span className="font-body text-sm text-muted shrink-0">
              {zhTitle}
            </span>
          )}
        </div>
        {rightMeta && (
          <div className="shrink-0 flex items-baseline gap-1">{rightMeta}</div>
        )}
      </header>

      <div>{children}</div>
    </section>
  );
}

export default LedgerSection;
