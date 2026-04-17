import React from 'react';
import { cn } from '../../lib/cn.js';

/**
 * Button — 三变体 × 两尺寸
 *
 * Props:
 *   variant  'primary' | 'ghost' | 'text'     默认 ghost
 *     primary  麦色底白字（CTA）
 *     ghost    白底 + line border + 墨文字
 *     text     纯文字，下划线 hover
 *   size     'sm' | 'md'                     默认 md
 *   icon     左侧图标 React node
 *   iconRight 右侧图标
 *   disabled
 *   className
 *   type     button|submit  默认 button
 */
export function Button({
  variant = 'ghost',
  size = 'md',
  icon,
  iconRight,
  disabled,
  className,
  children,
  type = 'button',
  onClick,
  ...rest
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-body font-medium tracking-wide rounded-sm transition-colors ease-editorial duration-base disabled:opacity-40 disabled:cursor-not-allowed';

  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-11 px-5 text-sm',
  };

  const variants = {
    primary: 'bg-accent text-white hover:bg-accent-ink disabled:hover:bg-accent',
    ghost:
      'bg-surface border border-line text-ink hover:border-accent-line hover:text-accent-ink',
    text: 'text-muted hover:text-ink underline-offset-4 hover:underline',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(base, sizes[size], variants[variant], className)}
      {...rest}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      {children && <span>{children}</span>}
      {iconRight && <span className="inline-flex shrink-0">{iconRight}</span>}
    </button>
  );
}

export default Button;
