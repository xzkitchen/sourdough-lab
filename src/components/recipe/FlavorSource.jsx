import React from 'react';
import { BookOpen, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/cn.js';

/**
 * FlavorSource —— 展示当前激活 flavor 的权威来源
 *
 * Props:
 *   flavor   激活的 flavor object（或 null）
 */
export function FlavorSource({ flavor, className }) {
  if (!flavor) {
    return (
      <div
        className={cn(
          'flex items-start gap-2.5 px-5 py-4 rounded-md bg-sunken border border-line-soft',
          className
        )}
      >
        <BookOpen
          size={12}
          strokeWidth={1.5}
          className="text-muted shrink-0 mt-0.5"
          aria-hidden
        />
        <p className="text-xs text-muted font-body leading-relaxed">
          当前为自定义组合。选择上方「创意预设」可查看原作者来源。
        </p>
      </div>
    );
  }

  const { source, note, difficulty } = flavor;

  const difficultyLabel = {
    beginner: '新手友好',
    intermediate: '进阶',
    advanced: '高阶',
  }[difficulty] || null;

  return (
    <div
      className={cn(
        'px-5 py-4 rounded-md bg-surface border border-line space-y-2.5',
        className
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="text-[10px] uppercase tracking-[0.18em] text-faint font-body shrink-0">
            Based on
          </span>
          <span className="font-body text-[13px] text-ink truncate">
            {source.name}
          </span>
        </div>
        {difficultyLabel && (
          <span className="text-[10px] text-accent-ink font-body shrink-0">
            {difficultyLabel}
          </span>
        )}
      </div>

      {note && (
        <p className="text-xs text-muted font-body leading-relaxed">
          {note}
        </p>
      )}

      {source.url && (
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] text-accent-ink hover:text-ink font-body transition-colors ease-editorial duration-fast"
        >
          查看原文
          <ExternalLink size={10} strokeWidth={1.5} />
        </a>
      )}
    </div>
  );
}

export default FlavorSource;
