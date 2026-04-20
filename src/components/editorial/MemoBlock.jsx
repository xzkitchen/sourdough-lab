import React from 'react';
import { cn } from '../../lib/cn.js';
import { SmallCaps } from '../primitives/index.js';

/**
 * MemoBlock — 左 2px 竖线 + 标签 + prose
 *
 * tone:
 *   'warn'  — 麦色 warn #A04530 (用于 MEMO / WARNING / tip 警告)
 *   'ink'   — 墨黑 (用于中性 NOTE)
 *   'muted' — 弱化 (用于补充说明)
 *
 * Props:
 *   tone='warn'
 *   label='MEMO'      小标签文字
 *   children          prose 内容（组件内自动 text-sm text-ink leading-relaxed）
 *   compact           true = 无 label 行，只显示左竖线 + prose
 */
const TONES = {
  warn:  { border: 'border-warn',  label: 'warn' },
  ink:   { border: 'border-ink',   label: 'ink' },
  muted: { border: 'border-faint', label: 'faint' },
};

export function MemoBlock({
  tone = 'warn',
  label = 'MEMO',
  children,
  compact = false,
  className,
}) {
  const spec = TONES[tone] || TONES.warn;
  return (
    <div className={cn('pl-3.5 border-l-2', spec.border, className)}>
      {!compact && label && (
        <SmallCaps tone={spec.label} className="block mb-1">
          {label}
        </SmallCaps>
      )}
      <div className="text-sm text-ink font-body leading-relaxed space-y-1.5">
        {children}
      </div>
    </div>
  );
}

export default MemoBlock;
