import React from 'react';
import { MODIFIERS_BY_ID } from '../../domain/modifiers/index.js';

/** dose 转中文百分比标注（0.10 → "10%"，0.012 → "1.2%"） */
function doseLabel(dose) {
  if (typeof dose !== 'number') return '';
  const v = dose * 100;
  return v < 10 ? `${Math.round(v * 10) / 10}%` : `${Math.round(v)}%`;
}

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
    <div className="grid grid-cols-1 sm:grid-cols-2 border border-ink">
      {flavors.map((f, i) => {
        const sel = activeId === f.id;
        const col = i % 2;
        const row = Math.floor(i / 2);

        // 中文摘要：直接用 modifier 中文名 + 剂量（不再堆英文拉丁名）
        const modSummary = f.modifiers.length === 0
          ? '纯基础配方 · 无添加'
          : f.modifiers
              .map(m => {
                const mod = MODIFIERS_BY_ID[m.id];
                const name = mod?.name || m.id;
                const d = doseLabel(m.dose ?? mod?.dose?.default);
                return d ? `${name} ${d}` : name;
              })
              .join(' · ');

        return (
          <button
            key={f.id}
            type="button"
            onClick={() => {
              // 点已选中的卡片不做任何事（避免无谓滚动）
              if (sel) return;
              onApply(f);
              // 选完后把"配方清单"区滚进视野 —— 那才是发生变化的地方，
              // 而不是停在预设网格让用户看不到新克数/新警告。
              setTimeout(() => {
                document.getElementById('formula-ingredients')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 60);
            }}
            aria-pressed={sel}
            className={[
              'text-left px-4 py-3.5 sm:p-3 cursor-pointer transition-colors duration-fast ease-editorial',
              'active:bg-sunken',
              // 滚动 offset 来自 index.css 的 --sticky-offset（与 Bake sticky 栈同高，单一来源）
              'scroll-mt-[var(--sticky-offset)]',
              sel ? 'bg-ink text-bg active:bg-ink' : 'bg-surface text-ink hover:bg-sunken',
              // mobile: 单列，每一项之间用 top border 分隔（首项除外）
              i > 0 ? 'border-t border-ink' : '',
              // sm: 切换到 2 列，列分隔靠 left border
              col > 0 ? 'sm:border-l sm:border-ink' : '',
              // sm: 第一行右侧 cell（i=1）在 mobile 已加 top border，桌面端要消掉
              i === 1 ? 'sm:border-t-0' : '',
              // sm: 行分隔用 top border（row > 0 全部）
              row > 0 ? 'sm:border-t sm:border-ink' : '',
            ].join(' ')}
            style={{ minHeight: 64 }}
          >
            <div className={`font-mono text-2xs tracking-[0.22em] ${sel ? 'opacity-65' : 'text-faint'}`}>
              № {String(i + 1).padStart(2, '0')}
            </div>
            <div className="font-display text-base sm:text-sm font-medium mt-1 leading-tight" style={{ letterSpacing: '-0.01em' }}>
              {f.nameLatin}
            </div>
            <div className={`font-zh text-xs mt-0.5 ${sel ? 'opacity-85' : 'text-muted'}`}>
              {f.name}
            </div>
            <div className={`font-zh text-2xs leading-snug mt-1.5 ${sel ? 'opacity-70' : 'text-faint'}`}>
              {modSummary}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default FlavorPresets;
