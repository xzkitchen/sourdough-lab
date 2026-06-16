import React, { useState } from 'react';
import { SecHead } from '../ledger/index.js';
import { Stepper } from '../primitives/Stepper.jsx';
import { DISCARD_RECIPES } from '../../domain/discard-recipes.js';

/**
 * 复活喂养比例：1:5:5（种 : 粉 : 水），总质量 = 11x 种。
 * 用一次大稀释解决疲弱种的双重问题（食物耗尽 + pH 过低），
 * 8–12h 室温后单次达 3 倍峰。
 *
 * 用户操作就三件事：取 X g 旧种 → 加 5X g 粉 + 5X g 水 → 等。
 * 罐里实际有多少不重要（取完剩下的全丢），所以不计算/不显示 discard。
 */
const REVIVAL_RATIO = 5;
const REVIVAL_TOTAL_MULT = 1 + REVIVAL_RATIO * 2; // 11

function calcRevival(targetTotal) {
  const newSeed = Math.max(1, Math.round(targetTotal / REVIVAL_TOTAL_MULT));
  const flour = newSeed * REVIVAL_RATIO;
  const water = newSeed * REVIVAL_RATIO;
  const total = newSeed + flour + water;
  return { newSeed, flour, water, total };
}

/** 模式切换分段控件（日常 / 复活）—— 触控目标 ≥40px */
function ModeToggle({ revivalMode, onChange }) {
  const btn = (active) => [
    'font-mono text-2xs uppercase tracking-[0.16em] px-3 py-2 min-h-[40px] transition-colors duration-fast leading-none whitespace-nowrap',
    active ? 'bg-ink text-bg cursor-default' : 'bg-bg text-muted hover:bg-sunken active:bg-sunken cursor-pointer',
  ].join(' ');
  return (
    <div className="flex border border-ink">
      <button
        type="button"
        onClick={() => onChange(false)}
        aria-pressed={!revivalMode}
        className={btn(!revivalMode)}
      >
        日常 Std
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        aria-pressed={revivalMode}
        className={`${btn(revivalMode)} border-l border-ink`}
      >
        复活 Revival
      </button>
    </div>
  );
}

/**
 * FeedPanel — 喂养 Tab
 *
 * 三段：
 *   №01 Quantity      面包数量
 *   №02 Seed amount   旧种数量
 *   №03 Feed          喂养方案（Std 1:1:1 单次 / Revival 1:5:5 复活模式）
 *
 * Props:
 *   numUnits / onNumUnitsChange
 *   seedStarter / onSeedChange
 *   feed                    calculator.calculateFeed() 输出
 *   revivalMode             boolean
 *   onRevivalModeChange(b)
 */
export function FeedPanel({
  numUnits,
  onNumUnitsChange,
  seedStarter,
  onSeedChange,
  feed,
  revivalMode = false,
  onRevivalModeChange,
}) {
  // 弃种食谱手风琴：当前展开的 id（同一时间只展开一个）
  // 必须在任何条件 return 之前调用（Hooks 规则）
  const [expandedDiscardId, setExpandedDiscardId] = useState(null);

  if (!feed) return null;

  // 复活模式的目标总量 = 配方需要 + 下次火种留量
  const targetTotal = feed.needed + feed.buffer;
  const revival = calcRevival(targetTotal);

  // Std 模式下种:粉:水 的实际比例（differs from 1:1:1——差额补足算法）
  const feedRatio = !revivalMode && feed.seed > 0 && feed.flour > 0
    ? `1 : ${Math.round((feed.flour / feed.seed) * 10) / 10} : ${Math.round((feed.water / feed.seed) * 10) / 10}`
    : null;
  const stdSufficient = !revivalMode && feed.sufficient;

  // 选择当前模式下要展示的数据
  const displayFlour = revivalMode ? revival.flour : feed.flour;
  const displayWater = revivalMode ? revival.water : feed.water;
  const displayTotal = revivalMode ? revival.total : feed.total;

  return (
    <div className="space-y-7">
      {/* №01 Quantity */}
      <section>
        <SecHead n={1} label="Quantity" zhLabel="面包数量" />
        <Stepper
          value={numUnits}
          onChange={onNumUnitsChange}
          step={1}
          min={1}
          max={8}
          labelEn="Loaves"
          labelZh="个 · 与配方页同步"
          ariaLabel="面包数量"
        />
      </section>

      {/* №02 Seed amount —— Revival 模式不依赖现有量，改为说明 */}
      <section>
        <SecHead n={2} label="Seed amount" zhLabel="旧种数量" />
        {revivalMode ? (
          <div className="border border-ink p-4 bg-surface">
            <div className="font-zh text-sm text-muted leading-relaxed">
              复活模式按配方目标量大稀释，<strong className="text-ink">与罐里现有多少无关</strong>。
              下面 №03 会直接告诉你取多少旧种、加多少粉水。
            </div>
          </div>
        ) : (
          <Stepper
            value={seedStarter}
            onChange={onSeedChange}
            step={5}
            min={5}
            max={500}
            suffix="g"
            labelEn="Existing"
            labelZh="现有量 · 点数字可直接输入"
            ariaLabel="旧种数量"
          />
        )}
      </section>

      {/* №03 Feed —— 模式切换 */}
      <section>
        <SecHead
          n={3}
          label={revivalMode ? 'Revival feed' : 'Top-up feed'}
          zhLabel={revivalMode ? '复活喂养 · 1:5:5' : '补足喂养 · 喂到目标量'}
          right={<ModeToggle revivalMode={revivalMode} onChange={onRevivalModeChange} />}
        />

        {/* 模式说明：日常 vs 复活，切换前就能看懂 */}
        <p className="font-zh text-xs text-muted leading-relaxed mb-3">
          {revivalMode
            ? '复活：种偏弱/偏酸时用 1:5:5 大稀释，一次喂养重新激活。'
            : '日常：种状态正常，按配方所需补足喂养即可；种偏弱时切到「复活」。'}
        </p>

        {/* 旧种已够：不渲染 0/0 的喂养格，直接给结论 */}
        {stdSufficient && (
          <div className="border border-ink p-4 sm:p-5 bg-surface">
            <div className="font-mono text-2xs text-faint uppercase tracking-[0.24em]">
              No feed needed
            </div>
            <div className="font-zh text-base font-medium text-ink mt-1">
              现有 {feed.seed}g 已经够用，无需喂养
            </div>
            <p className="font-zh text-sm text-muted leading-relaxed mt-2">
              配方需要 <strong className="font-mono text-ink font-semibold">{feed.needed}g</strong>
              + 留种 <strong className="font-mono text-ink font-semibold">{feed.buffer}g</strong>
              {feed.surplus > 0 && (
                <>，富余 <strong className="font-mono text-ink font-semibold">{feed.surplus}g</strong>（可做下方弃种食谱）</>
              )}
              。种处于峰值即可直接使用；若已回落，按 Revival 模式重新激活。
            </p>
          </div>
        )}

        {/* 加粉 / 加水 +（Revival 模式额外的"取种"行）*/}
        {!stdSufficient && (
        <div className="border border-ink">
          {revivalMode && (
            <div className="p-4 sm:p-5 bg-surface flex items-baseline justify-between gap-3 border-b border-ink">
              <div>
                <div className="font-mono text-2xs text-faint uppercase tracking-[0.24em]">
                  Take from jar
                </div>
                <div className="font-zh text-xs text-muted mt-0.5">从罐里取（其余丢弃）</div>
              </div>
              <div
                className="font-display font-medium text-4xl text-ink leading-none tabular-nums"
                style={{ letterSpacing: '-0.03em' }}
              >
                {revival.newSeed}
                <span className="font-mono text-sm text-faint ml-1.5">g</span>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2">
            {[
              { label: 'Add flour', zh: '加 T65', v: displayFlour },
              { label: 'Add water', zh: '加 水',  v: displayWater },
            ].map((x, i) => (
              <div
                key={x.label}
                className={`p-4 sm:p-5 bg-surface ${i > 0 ? 'border-l border-ink' : ''}`}
              >
                <div className="font-mono text-2xs text-faint uppercase tracking-[0.24em]">
                  {x.label}
                </div>
                <div className="font-zh text-xs text-muted mt-0.5">{x.zh}</div>
                <div className="font-display font-medium text-4xl text-ink leading-none mt-3 tabular-nums" style={{ letterSpacing: '-0.03em' }}>
                  {x.v}
                </div>
                <div className="font-mono text-2xs text-faint uppercase tracking-[0.24em] mt-1">
                  grams
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* 总量 */}
        {!stdSufficient && (
        <div className="flex justify-between items-baseline border-t-2 border-b-2 border-ink py-3 mt-4">
          <div>
            <div className="font-mono text-2xs text-faint uppercase tracking-[0.30em]">
              Total after feed
            </div>
            <div className="font-zh text-xs text-muted mt-0.5">
              喂养后总量{feedRatio ? ` · 本次比例约 ${feedRatio}（种:粉:水）` : ''}
            </div>
          </div>
          <div className="font-display font-medium text-3xl text-ink tabular-nums" style={{ letterSpacing: '-0.03em' }}>
            {displayTotal}
            <span className="font-mono text-sm text-faint ml-1.5">g</span>
          </div>
        </div>
        )}

        {/* Memo —— 不同模式不同提示 */}
        {stdSufficient ? null : revivalMode ? (
          <div className="mt-4 px-4 py-3 bg-surface border border-line-soft border-l-[3px] border-l-accent">
            <div className="font-mono text-2xs text-accent-ink uppercase tracking-[0.30em] mb-1.5">
              Memo · 复活操作
            </div>
            <p className="font-zh text-sm text-muted leading-relaxed">
              从罐里取 <strong className="font-mono text-ink font-semibold">{revival.newSeed}g</strong> 旧种
              （罐里其余全部丢弃），加
              <strong className="font-mono text-ink font-semibold"> {revival.flour}g</strong> 粉
              + <strong className="font-mono text-ink font-semibold">{revival.water}g</strong> 水（1:5:5 强稀释）。
              室温 25°C 静置 <strong className="font-mono text-ink font-semibold">8–12h</strong> 达 3 倍峰即可揉面；
              夏天高温缩短到 6–8h，冬天延长到 12–16h。
            </p>
          </div>
        ) : (
          <div className="mt-4 px-4 py-3 bg-surface border border-line-soft border-l-[3px] border-l-accent">
            <div className="font-mono text-2xs text-accent-ink uppercase tracking-[0.30em] mb-1.5">
              Memo · 操作提示
            </div>
            <p className="font-zh text-sm text-muted leading-relaxed">
              取 <strong className="font-mono text-ink font-semibold">{seedStarter}g</strong> 旧种，
              加 <strong className="font-mono text-ink font-semibold">{feed.flour}g</strong> 粉
              + <strong className="font-mono text-ink font-semibold">{feed.water}g</strong> 水拌匀。
              静置至峰值（4–6h），取 <strong className="font-mono text-ink font-semibold">{feed.needed}g</strong> 用于配方，
              剩 <strong className="font-mono text-ink font-semibold">{feed.buffer}g</strong> 作下次火种。
            </p>
          </div>
        )}
      </section>

      {/* №04 Discard recipes —— 手风琴：点行就地展开简版做法，原配方留底部链接 */}
      <section>
        <SecHead n={4} label="Discard" zhLabel="弃种处理" />
        <div className="border border-ink">
          {DISCARD_RECIPES.map((r, i) => {
            const isOpen = expandedDiscardId === r.id;
            return (
              <div key={r.id} className={i > 0 ? 'border-t border-line-soft' : ''}>
                {/* 行头：整行点击切换展开 */}
                <button
                  type="button"
                  onClick={() => setExpandedDiscardId(isOpen ? null : r.id)}
                  aria-expanded={isOpen}
                  className="block w-full text-left px-4 py-3 sm:px-5 sm:py-3.5 hover:bg-surface active:bg-sunken transition-colors duration-fast cursor-pointer"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="min-w-0">
                      <div
                        className="font-display text-base font-medium text-ink leading-tight truncate"
                        style={{ letterSpacing: '-0.015em' }}
                      >
                        {r.nameLatin}
                      </div>
                      <div className="font-zh text-xs text-muted leading-tight mt-0.5 truncate">
                        {r.nameZh}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono text-xs text-ink tabular-nums leading-tight whitespace-nowrap">
                        {r.discardG}g · {r.timeMin}min
                      </div>
                      <div className="font-zh text-2xs text-faint leading-tight mt-0.5 whitespace-nowrap">
                        弃种量 · 用时
                      </div>
                      <div className="font-mono text-2xs text-faint uppercase tracking-[0.18em] mt-0.5 whitespace-nowrap">
                        {isOpen ? 'Close ↑' : 'Open ↓'}
                      </div>
                    </div>
                  </div>
                </button>

                {/* 展开区：简介 + 用料 + 做法 + 完整配方链接 */}
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-4 pt-3 bg-surface border-t border-line-soft">
                    {/* 简介 */}
                    <p className="font-zh text-sm text-muted leading-relaxed">
                      {r.summary}
                    </p>

                    {/* 用料 */}
                    <div className="mt-3 pt-3 border-t border-line-soft">
                      <div className="font-mono text-2xs text-faint uppercase tracking-[0.24em] mb-1.5">
                        Ingredients · 用料
                      </div>
                      <ul className="space-y-1">
                        {r.ingredients.map((ing, j) => (
                          <li
                            key={j}
                            className="grid font-zh text-sm text-muted leading-relaxed"
                            style={{ gridTemplateColumns: '14px 1fr' }}
                          >
                            <span className="font-mono text-2xs text-faint">·</span>
                            <span>{ing}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 做法 */}
                    <div className="mt-3 pt-3 border-t border-line-soft">
                      <div className="font-mono text-2xs text-faint uppercase tracking-[0.24em] mb-1.5">
                        Method · 做法
                      </div>
                      <ol className="space-y-1.5">
                        {r.steps.map((step, j) => (
                          <li
                            key={j}
                            className="grid font-zh text-sm text-muted leading-relaxed"
                            style={{ gridTemplateColumns: '24px 1fr' }}
                          >
                            <span className="font-mono text-xs text-accent tracking-[0.10em]">
                              {String(j + 1).padStart(2, '0')}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* 完整配方源链接 */}
                    <a
                      href={r.source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 pt-3 border-t border-line-soft block font-mono text-2xs text-accent-ink uppercase tracking-[0.24em] hover:underline"
                    >
                      完整配方与精确克数 → {r.source.publisher} ↗
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <p className="font-zh text-xs text-muted mt-2 leading-relaxed italic">
          — 弃种冷藏可存约一周；越老越酸，做脆饼反而更香。
        </p>
      </section>
    </div>
  );
}

export default FeedPanel;
