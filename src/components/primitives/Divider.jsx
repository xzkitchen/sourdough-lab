import React from 'react';
import { cn } from '../../lib/cn.js';

/**
 * Divider — 1px 分隔
 *
 * Props:
 *   variant  'solid' | 'dashed' | 'dotted'
 *   label    中间文字（如 "色粉 / Colorants"），两侧加线
 *   tone     'default' | 'soft' | 'accent'
 */
export function Divider({
  variant = 'solid',
  label,
  tone = 'default',
  className,
}) {
  const toneClass = {
    default: 'border-line',
    soft:    'border-line-soft',
    accent:  'border-accent-line',
  }[tone];

  const variantClass = {
    solid:  'border-t',
    dashed: 'border-t border-dashed',
    dotted: 'border-t border-dotted',
  }[variant];

  if (!label) {
    return <hr className={cn(variantClass, toneClass, 'my-0', className)} />;
  }

  const labelToneClass = {
    default: 'text-muted',
    soft:    'text-faint',
    accent:  'text-accent-ink',
  }[tone];

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn('flex-1', variantClass, toneClass)} />
      <span
        className={cn(
          'text-xs uppercase tracking-widest font-body',
          labelToneClass
        )}
      >
        {label}
      </span>
      <div className={cn('flex-1', variantClass, toneClass)} />
    </div>
  );
}

export default Divider;
