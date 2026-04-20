import React from 'react';
import { cn } from '../../lib/cn.js';

/**
 * LedgerRule — 1px hairline 水平分隔线
 *
 * variant:
 *   solid  — 单条 1px
 *   double — 两条 1px（中间 2px 间距），用于 TOTAL 分隔
 *
 * tone:
 *   default / soft / strong
 */
const TONES = {
  default: 'border-line',
  soft:    'border-line-soft',
  strong:  'border-ink',
};

export function LedgerRule({ variant = 'solid', tone = 'default', className }) {
  const color = TONES[tone] || TONES.default;
  if (variant === 'double') {
    return (
      <div className={cn('space-y-[2px]', className)} aria-hidden>
        <div className={cn('border-t', color)} />
        <div className={cn('border-t', color)} />
      </div>
    );
  }
  return <div className={cn('border-t', color, className)} aria-hidden />;
}

export default LedgerRule;
