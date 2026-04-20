import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { cn } from '../../lib/cn.js';

/**
 * WarningList — 警告与透明化说明
 *
 * Props:
 *   warnings   string[]
 *   notes      string[]
 */
export function WarningList({ warnings = [], notes = [], className }) {
  if (!warnings.length && !notes.length) return null;

  return (
    <div className={cn('space-y-2', className)}>
      {warnings.map((w, i) => (
        <div
          key={`w-${i}`}
          className="flex items-start gap-3 px-4 py-3 bg-warn-bg rounded-sm border-l-2 border-warn"
        >
          <AlertTriangle
            size={14}
            strokeWidth={1.5}
            className="text-warn shrink-0 mt-0.5"
            aria-hidden
          />
          <p className="text-sm text-ink font-body leading-relaxed">{w}</p>
        </div>
      ))}
      {notes.map((n, i) => (
        <div
          key={`n-${i}`}
          className="flex items-start gap-3 px-4 py-2.5 text-sm text-muted font-body"
        >
          <Info
            size={12}
            strokeWidth={1.5}
            className="text-faint shrink-0 mt-0.5"
            aria-hidden
          />
          <p className="leading-relaxed">{n}</p>
        </div>
      ))}
    </div>
  );
}

export default WarningList;
