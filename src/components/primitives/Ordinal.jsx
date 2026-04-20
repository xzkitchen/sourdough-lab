import React from 'react';
import { cn } from '../../lib/cn.js';

/**
 * Ordinal — 序号组件
 *
 * variant:
 *   'mono-sm'   —— tracked small-caps "01" / "N° 01"，section 左 gutter / card 角标
 *   'serif-big' —— Fraunces 大号 "01"，步骤行左列
 *   'inverted'  —— serif-big 但包黑底方块（当前步骤高亮），aspect-square
 *
 * tone（仅 mono-sm / serif-big 可用）：ink / muted / faint / warn / accent-ink
 */
const TONES = {
  ink:          'text-ink',
  muted:        'text-muted',
  faint:        'text-faint',
  warn:         'text-warn',
  'accent-ink': 'text-accent-ink',
};

export function Ordinal({
  value,
  variant = 'mono-sm',
  tone = 'faint',
  prefix,
  className,
}) {
  const pad = typeof value === 'number' ? String(value).padStart(2, '0') : value;

  if (variant === 'inverted') {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center aspect-square',
          'bg-invert text-surface',
          'font-display tabular-nums',
          className
        )}
        style={{
          fontSize: 'clamp(24px, 6vw, 36px)',
          lineHeight: 1,
          fontVariationSettings: "'opsz' 44, 'SOFT' 40, 'wght' 380",
        }}
      >
        {prefix && <span className="mr-0.5 text-[0.5em] opacity-60">{prefix}</span>}
        {pad}
      </span>
    );
  }

  if (variant === 'serif-big') {
    return (
      <span
        className={cn(
          'font-display tabular-nums',
          TONES[tone] || TONES.faint,
          className
        )}
        style={{
          fontSize: 'clamp(24px, 6vw, 36px)',
          lineHeight: 1,
          fontVariationSettings: "'opsz' 44, 'SOFT' 40, 'wght' 380",
        }}
      >
        {prefix && <span className="mr-0.5 text-[0.5em] opacity-60">{prefix}</span>}
        {pad}
      </span>
    );
  }

  // 'mono-sm'
  return (
    <span
      className={cn(
        'font-body uppercase tabular-nums tracking-[0.18em] text-[10px] leading-[14px]',
        TONES[tone] || TONES.faint,
        className
      )}
    >
      {prefix && <span className="mr-0.5">{prefix}</span>}
      {pad}
    </span>
  );
}

export default Ordinal;
