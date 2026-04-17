import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * cn — className composer.
 * 合并 clsx (条件 className) + tailwind-merge (去除冲突 Tailwind 类)
 *
 * 用法：
 *   cn('px-4 py-2', isActive && 'bg-accent', className)
 *   cn('text-sm', 'text-lg')  // => 'text-lg' (后者胜出)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default cn;
