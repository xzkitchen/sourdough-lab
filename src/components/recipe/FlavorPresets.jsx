import React from 'react';
import { MODIFIERS_BY_ID } from '../../domain/modifiers/index.js';

/**
 * FlavorPresets — 风味预设 2-列编号网格
 *
 * V2 ledger 风格：
 *   - 2 列 grid，1px 实线分隔
 *   - 每个 cell 显示 № NN 编号 + Latin 名 + 中文名 + modifier 摘要
 *   - 选中态：黑底白字（反转）
 *   - 点击切换 flavor，写入 selected modifiers 数组
 *
 * Props:
 *   flavors       FLAVORS 数组
 *   activeId      当前激活 flavor.id
 *   onApply(flavor)
 */
export function FlavorPresets({ flavors, activeId, onApply }) {
  return (
    <div className="grid grid-cols-2 border border-ink">
      {flavors.map((f, i) => {
        const sel = activeId === f.id;
        const col = i % 2;
        const row = Math.floor(i / 2);

        const modSummary = f.modifiers.length === 0
          ? '— pure base'
          : f.modifiers
              .map(m => MODIFIERS_BY_ID[m.id]?.nameLatin
                       || MODIFIERS_BY_ID[m.id]?.name
                       || m.id)
              .join(' · ');

        return (
          <button
            key={f.id}
            type="button"
            onClick={() => onApply(f)}
            aria-pressed={sel}
            className={[
              'text-left p-3 cursor-pointer transition-colors duration-fast ease-editorial',
              sel ? 'bg-ink text-bg' : 'bg-surface text-ink hover:bg-sunken',
              col > 0 ? 'border-l border-ink' : '',
              row > 0 ? 'border-t border-ink' : '',
            ].join(' ')}
            style={{ minHeight: 78 }}
          >
            <div className={`font-mono text-2xs tracking-[0.22em] ${sel ? 'opacity-65' : 'text-faint'}`}>
              № {String(i + 1).padStart(2, '0')}
            </div>
            <div className="font-display text-sm font-medium mt-1 leading-tight" style={{ letterSpacing: '-0.01em' }}>
              {f.nameLatin}
            </div>
            <div className={`font-zh text-xs mt-0.5 ${sel ? 'opacity-85' : 'text-muted'}`}>
              {f.name}
            </div>
            <div className={`font-mono text-2xs uppercase tracking-[0.18em] mt-1.5 ${sel ? 'opacity-55' : 'text-faint'}`}>
              {modSummary}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default FlavorPresets;
