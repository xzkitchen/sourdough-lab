import React from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * Marginalia — calculator 给出的 notes（透明计算说明）和 warnings（提示）
 *
 * 分两组、分层级、留白充分：
 *   - NOTES（计算说明）：墨色中性，古籍编号前缀（†, ‡, §, ¶）
 *   - CAUTION（注意）：焦土 warn 色 + 淡底块（warn-bg）强化层级
 *   - 每条之间 1px hairline 分隔（与食材表同一种 ledger 节奏），条目 py-3 留白
 *   - 图标用 h-5 flex 框稳定居中首行，文字折行不错位
 *
 * ⚠ 间距只用 tokens 合法档（1/2/3/4/5/6/7/8/10/12/16/20/24 + 语义档）。
 *   本项目 Tailwind spacing 是整体替换，半档（2.5/3.5）不存在会被静默丢弃。
 *
 * Props:
 *   notes      string[]   计算说明（如 "+ 10g 水（吸水补偿）"）
 *   warnings   string[]   注意事项 / 安全提示
 */
const MARGIN_GLYPHS = ['†', '‡', '§', '¶', '*', '※'];

export function Marginalia({ notes = [], warnings = [] }) {
  if (notes.length === 0 && warnings.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* NOTES — 计算说明（墨色中性） */}
      {notes.length > 0 && (
        <div className="border-t border-line-soft">
          <div className="font-mono text-2xs text-faint uppercase tracking-[0.24em] pt-4 pb-2">
            Notes · 计算说明
          </div>
          <ul>
            {notes.map((n, i) => (
              <li
                key={`n${i}`}
                className="flex gap-3 items-start py-3 border-b border-line-soft last:border-b-0"
              >
                <span className="flex h-5 items-center flex-shrink-0 font-display text-base text-faint leading-none">
                  {MARGIN_GLYPHS[i % MARGIN_GLYPHS.length]}
                </span>
                <p className="font-zh text-sm text-muted leading-relaxed flex-1 min-w-0">{n}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CAUTION — 注意（焦土 warn 色 + 淡底块强化层级） */}
      {warnings.length > 0 && (
        <div className="bg-warn-bg border border-line-soft px-4 pt-3 pb-1">
          <div className="font-mono text-2xs text-warn uppercase tracking-[0.24em] pb-1">
            Caution · 注意
          </div>
          <ul>
            {warnings.map((w, i) => (
              <li
                key={`w${i}`}
                className="flex gap-3 items-start py-3 border-b border-line-soft last:border-b-0"
              >
                <span className="flex h-5 items-center flex-shrink-0 text-warn">
                  <AlertTriangle size={15} strokeWidth={1.8} />
                </span>
                <p className="font-zh text-sm text-accent-ink leading-relaxed flex-1 min-w-0">{w}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Marginalia;
