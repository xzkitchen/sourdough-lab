import React from 'react';
import { ExternalLink } from 'lucide-react';
import { cn } from '../../lib/cn.js';
import { SmallCaps } from '../primitives/index.js';
import { MemoBlock } from '../editorial/MemoBlock.jsx';

const DIFFICULTY_LABEL = {
  beginner: '新手友好',
  intermediate: '进阶',
  advanced: '高阶',
};

/**
 * FlavorSource —— Ledger V2 风格：MemoBlock 左竖线 + 出处 prose
 */
export function FlavorSource({ flavor, className }) {
  if (!flavor) {
    return (
      <MemoBlock tone="muted" label="Custom" compact className={className}>
        <p className="text-xs text-muted">
          当前为自定义组合。选择上方 SPECIMEN 可查看原作者来源。
        </p>
      </MemoBlock>
    );
  }

  const { source, note, difficulty } = flavor;
  const diffLabel = DIFFICULTY_LABEL[difficulty];

  return (
    <MemoBlock tone="warn" label="Source" className={className}>
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <div className="flex items-baseline gap-2 min-w-0">
          <SmallCaps tone="faint" className="shrink-0">Based on</SmallCaps>
          <span className="font-body text-[13px] text-ink truncate">
            {source?.name}
            {source?.author && (
              <span className="text-muted"> · {source.author}</span>
            )}
          </span>
        </div>
        {diffLabel && (
          <SmallCaps tone="warn" className="shrink-0">
            {diffLabel}
          </SmallCaps>
        )}
      </div>

      {note && (
        <p className="text-sm text-muted leading-relaxed mt-2">{note}</p>
      )}

      {source?.url && (
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'inline-flex items-center gap-1 mt-2',
            'text-[11px] text-warn hover:text-ink font-body',
            'uppercase tracking-[0.14em] transition-colors ease-editorial duration-fast'
          )}
        >
          查看原文
          <ExternalLink size={10} strokeWidth={1.5} />
        </a>
      )}
    </MemoBlock>
  );
}

export default FlavorSource;
