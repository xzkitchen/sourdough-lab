import React from 'react';

/**
 * Marginalia — calculator 给出的 notes（透明计算说明）和 warnings（提示）
 *
 * 古书"页边批注"风格：
 *   - 极细 hairline 包裹
 *   - notes 用墨色，warnings 用焦土 accent 色 + 左侧 1px 实线区别
 *   - 编号前缀（†, ‡, §, ¶）增强古籍感
 *
 * Props:
 *   notes      string[]   计算说明（如 "+ 10g 水（吸水补偿）"）
 *   warnings   string[]   注意事项 / 安全提示
 */
const MARGIN_GLYPHS = ['†', '‡', '§', '¶', '*', '★'];

export function Marginalia({ notes = [], warnings = [] }) {
  if (notes.length === 0 && warnings.length === 0) return null;

  return (
    <div className="border-t border-b border-line-soft py-3 space-y-2.5">
      {notes.map((n, i) => (
        <div key={`n${i}`} className="flex gap-2 items-baseline">
          <span className="font-display text-base text-muted leading-none flex-shrink-0">
            {MARGIN_GLYPHS[i % MARGIN_GLYPHS.length]}
          </span>
          <p className="font-zh text-sm text-muted leading-relaxed flex-1">{n}</p>
        </div>
      ))}
      {warnings.map((w, i) => (
        <div key={`w${i}`} className="flex gap-2 items-baseline border-l border-accent pl-2.5">
          <span className="font-display text-base text-accent-ink leading-none flex-shrink-0">
            ⚠
          </span>
          <p className="font-zh text-sm text-accent-ink leading-relaxed flex-1">{w}</p>
        </div>
      ))}
    </div>
  );
}

export default Marginalia;
