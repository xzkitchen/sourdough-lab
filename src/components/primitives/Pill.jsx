import React from 'react';
import { cn } from '../../lib/cn.js';

/**
 * Pill — 小徽记
 *
 * Props:
 *   tone  'neutral' | 'accent' | 'warn' | 'ok' | 'muted'
 *   size  'sm' | 'md'
 *   icon  左侧图标
 */
export function Pill({ tone = 'neutral', size = 'sm', icon, children, className }) {
  const tones = {
    neutral: 'bg-surface text-muted border border-line',
    accent:  'bg-accent-soft text-accent-ink border border-accent-line',
    warn:    'bg-warn-bg text-warn border border-warn',
    ok:      'bg-ok-bg text-ok border border-ok',
    muted:   'bg-sunken text-muted',
  };
  const sizes = {
    sm: 'h-5 px-2 text-[10px]',
    md: 'h-7 px-3 text-xs',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-body font-medium uppercase tracking-wider rounded-sm whitespace-nowrap',
        sizes[size],
        tones[tone],
        className
      )}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

export default Pill;
