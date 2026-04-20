import React from 'react';
import { cn } from '../../lib/cn.js';
import { SmallCaps, LedgerRule } from '../primitives/index.js';

const NUM_WORDS = [
  'zero','one','two','three','four','five','six','seven','eight','nine',
  'ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen',
  'seventeen','eighteen','nineteen','twenty',
];

function numWord(n) {
  if (n >= 0 && n < NUM_WORDS.length) return NUM_WORDS[n];
  return String(n);
}

function formatDate(d = new Date()) {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm} / ${dd} / ${yy}`;
}

/**
 * Masthead — Bakery Ledger V2 刊头
 *
 * 结构：
 *   顶行 SmallCaps 双列：左 "VOL. 1 · TEN FORMULAS"，右 "DATE 04 / 20 / 26"
 *   主标题 Fraunces 超大 masthead：`Sourdough` regular + `Lab.` italic
 *   底 LedgerRule
 */
export function Masthead({
  volume = 1,
  count = 0,
  dateStr = formatDate(),
  lead = 'Sourdough',
  italic = 'Lab.',
  className,
}) {
  const countWord = numWord(count).toUpperCase();

  return (
    <header className={cn('space-y-4', className)}>
      <div className="flex items-baseline justify-between gap-4">
        <SmallCaps tone="faint">
          VOL. {volume} &nbsp;/&nbsp; {countWord} FORMULAS
        </SmallCaps>
        <SmallCaps tone="faint" className="shrink-0">
          DATE &nbsp;{dateStr}
        </SmallCaps>
      </div>

      <h1
        className="font-display text-ink leading-[0.92] tracking-[-0.02em]"
        style={{
          fontSize: 'clamp(42px, 10vw, 72px)',
          fontVariationSettings: "'opsz' 96, 'SOFT' 40, 'wght' 400",
        }}
      >
        <span>{lead} </span>
        <em
          className="italic"
          style={{ fontVariationSettings: "'opsz' 96, 'SOFT' 60, 'wght' 400" }}
        >
          {italic}
        </em>
      </h1>

      <LedgerRule />
    </header>
  );
}

export default Masthead;
