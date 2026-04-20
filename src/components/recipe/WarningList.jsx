import React from 'react';
import { cn } from '../../lib/cn.js';
import { MemoBlock } from '../editorial/MemoBlock.jsx';

/**
 * WarningList —— Ledger V2: 警告 + 补充说明，全部用 MemoBlock 渲染
 *   warnings: tone="warn" label="WARNING"
 *   notes:    tone="ink"  label="NOTE"
 */
export function WarningList({ warnings = [], notes = [], className }) {
  if (!warnings.length && !notes.length) return null;

  return (
    <div className={cn('space-y-3', className)}>
      {warnings.map((w, i) => (
        <MemoBlock key={`w-${i}`} tone="warn" label="Warning">
          <p>{w}</p>
        </MemoBlock>
      ))}
      {notes.map((n, i) => (
        <MemoBlock key={`n-${i}`} tone="ink" label="Note">
          <p className="text-muted">{n}</p>
        </MemoBlock>
      ))}
    </div>
  );
}

export default WarningList;
