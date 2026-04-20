import React from 'react';
import { cn } from '../../lib/cn.js';

/**
 * SmallCaps — Ledger V2 的 tracked uppercase 标签
 *
 * 用于：section header ordinal、meta label、INGREDIENT / BAK% / GRAM 表头、
 *       MEMO / WARNING 小标、HYDRATION / TOTAL 之类的表意小字
 */
const TONES = {
  ink:         'text-ink',
  muted:       'text-muted',
  faint:       'text-faint',
  warn:        'text-warn',
  'accent-ink': 'text-accent-ink',
};

export function SmallCaps({ tone = 'muted', as: Tag = 'span', className, children, ...rest }) {
  return (
    <Tag
      className={cn(
        'font-body uppercase tabular-nums',
        'text-[10px] leading-[14px] tracking-[0.18em]',
        TONES[tone] || TONES.muted,
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default SmallCaps;
