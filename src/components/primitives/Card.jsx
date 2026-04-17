import React from 'react';
import { cn } from '../../lib/cn.js';

/**
 * Card — 标准容器
 *
 * Props:
 *   variant  'surface' | 'sunken' | 'plain'      默认 surface
 *     surface 比 body 略亮 (#FBF8F2) + 1px line
 *     sunken  比 body 略暗 (#EDE7DB) 用于嵌入区
 *     plain   无背景无边框（仅用于 group by Divider）
 *   padding  'none' | 'sm' | 'md' | 'lg'          默认 md
 *   as       HTML element                         默认 div
 */
export function Card({
  variant = 'surface',
  padding = 'md',
  as: Comp = 'div',
  className,
  children,
  ...rest
}) {
  const variants = {
    surface: 'bg-surface border border-line',
    sunken:  'bg-sunken',
    plain:   '',
  };
  const paddings = {
    none: '',
    sm:   'p-3',
    md:   'p-4 sm:p-5',
    lg:   'p-5 sm:p-8',
  };

  return (
    <Comp
      className={cn(
        'rounded-md',
        variants[variant],
        paddings[padding],
        className
      )}
      {...rest}
    >
      {children}
    </Comp>
  );
}

export default Card;
