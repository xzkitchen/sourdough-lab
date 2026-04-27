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
    <div className="grid grid-cols-1 sm:grid-cols-2 border border-ink">
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
            onClick={(e) => {
              const el = e.currentTarget;
              onApply(f);
              // 选完后把这张卡片平滑顶到 sticky 头部正下方
              // sticky = nav (~76px) + ActiveFlavorBar (~58px) = ~134px
              // scroll-mt-[140px] 是这个 offset；setTimeout 让 React 先 render
              setTimeout(() => {
                el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 60);
            }}
            aria-pressed={sel}
            className={[
              'text-left px-4 py-3.5 sm:p-3 cursor-pointer transition-colors duration-fast ease-editorial',
              'active:bg-sunken',
              // 滚动 offset：抵消 sticky nav + ActiveFlavorBar 高度，
              // 让选中的卡片落在 sticky 头部下方 ~10px 的位置
              'scroll-mt-[140px] sm:scroll-mt-[150px]',
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
