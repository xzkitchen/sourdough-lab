import React, { useMemo, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './lib/cn.js';
import { useStickyState } from './hooks/useStickyState.js';

import { DEFAULT_BASE } from './domain/base-recipes/index.js';
import { FLAVORS } from './domain/modifiers/index.js';
import {
  calculateRecipe,
  calculateFeed,
  enhanceSteps,
} from './domain/calculator.js';
import { getProcessSteps } from './domain/process/index.js';

import {
  ActiveFlavorBar,
  FlavorPresets,
  IngredientTable,
  Marginalia,
  FlavorSource,
} from './components/recipe/index.js';
import { FeedPanel } from './components/starter/index.js';
import { StepList, ProcessProgress, ColdRetardTracker } from './components/process/index.js';
import { SecHead } from './components/ledger/index.js';

const TABS = [
  { id: 'formula', label: 'Formula', zh: '配方', n: '01' },
  { id: 'starter', label: 'Starter', zh: '养种', n: '02' },
  { id: 'bake',    label: 'Bake',    zh: '流程', n: '03' },
];

const motionTransition = { duration: 0.22, ease: [0.2, 0.8, 0.2, 1] };

/**
 * Sourdough Lab · V2 Ledger shell
 *
 * Domain 层完全沿用 v3 的 calculator + FLAVORS + steps；
 * 表现层全部替换为 migration/components 下的 ledger 组件。
 */
function App() {
  const [tab, setTab] = useStickyState('formula', 'sdlv2_tab');
  const [numUnits, setNumUnits] = useStickyState(3, 'sdlv2_num_units');
  const [selected, setSelected] = useStickyState([], 'sdlv2_selected_modifiers');
  const [seedStarter, setSeedStarter] = useStickyState(60, 'sdlv2_seed_starter');
  const [completedList, setCompletedList] = useStickyState([], 'sdlv2_completed_steps');
  // 当前展开的步骤 id —— 抬到 App 是为了让 resetProgress 能一并重置展开态
  const [openStepId, setOpenStepId] = useState(null);

  const base = DEFAULT_BASE;

  const calculated = useMemo(
    () => calculateRecipe({ base, numUnits, selectedModifiers: selected }),
    [base, numUnits, selected]
  );
  const feed = useMemo(
    () => calculateFeed(calculated, seedStarter),
    [calculated, seedStarter]
  );
  const baseSteps = useMemo(() => getProcessSteps(base.processRef), [base]);
  const steps = useMemo(() => enhanceSteps(baseSteps, calculated), [baseSteps, calculated]);

  const completedIds = useMemo(() => new Set(completedList), [completedList]);
  // Bake tab 当前可推进的步骤：第一个未完成（ProcessProgress + StepList 都用）
  const currentStepId = useMemo(
    () => steps.find(s => !completedIds.has(s.id))?.id || null,
    [steps, completedIds]
  );

  const applyFlavor = useCallback((flavor) => {
    setSelected(flavor.modifiers.map(m => ({ id: m.id, dose: m.dose })));
  }, [setSelected]);

  const toggleStep = useCallback((stepId) => {
    setCompletedList(prev =>
      prev.includes(stepId) ? prev.filter(id => id !== stepId) : [...prev, stepId]
    );
  }, [setCompletedList]);

  const resetProgress = useCallback(() => {
    setCompletedList([]);
    // 一并把展开态拨回第一步 + 平滑滚动到它（让用户视觉上"回到原点"）
    const firstId = steps[0]?.id || null;
    setOpenStepId(firstId);
    if (firstId) {
      setTimeout(() => {
        const el = document.querySelector(`[data-step-id="${firstId}"]`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  }, [setCompletedList, steps]);

  const activeFlavor = useMemo(() => matchFlavor(selected) || FLAVORS[0], [selected]);
  const activeIndex = FLAVORS.findIndex(f => f.id === activeFlavor.id);

  // 冷藏步骤插入计时器
  const coldStep = steps.find(s => s.phase === 'cold');
  const coldSlot = coldStep ? <ColdRetardTracker stepId={coldStep.id} /> : null;

  return (
    <div className="min-h-screen relative ledger-side-rules">
      <div className="max-w-2xl mx-auto px-4 py-5 sm:px-8 sm:py-10 relative z-10 space-y-5 sm:space-y-6">

        {/* ── Masthead ── 两行标题（第二行斜体）+ 右侧发刊号 */}
        <header className="border-b-2 border-ink pb-4 sm:pb-5">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="font-mono text-2xs text-faint uppercase tracking-[0.30em] mb-1.5">
                № 001 · Vol. 2026
              </div>
              <h1
                className="font-display font-medium text-ink leading-[0.95]"
                style={{
                  fontSize: 'clamp(34px, 9vw, 56px)',
                  letterSpacing: '-0.03em',
                  fontVariationSettings: "'opsz' 96, 'SOFT' 30, 'wght' 500",
                }}
              >
                The Bakery
              </h1>
              <div
                className="font-display font-medium italic text-ink leading-[0.95] mt-0.5"
                style={{
                  fontSize: 'clamp(34px, 9vw, 56px)',
                  letterSpacing: '-0.03em',
                  fontVariationSettings: "'opsz' 96, 'SOFT' 30, 'wght' 500",
                }}
              >
                Ledger.
              </div>
            </div>
            <div className="text-right shrink-0 pb-1">
              <div className="font-mono text-2xs text-faint uppercase tracking-[0.25em]">
                Issue
              </div>
              <div className="font-mono text-[11px] sm:text-xs text-ink mt-1 tabular-nums whitespace-nowrap">
                № 04 · 2026
              </div>
            </div>
          </div>
          <p className="font-zh text-xs text-muted mt-3 italic">— 手作酸面包实验室</p>
        </header>

        {/* ── Sticky 头部容器 ── nav + ActiveFlavorBar 合并 sticky，
              避免两个独立 sticky 之间出现像素级缝隙（透明带漏内容）。 */}
        <div className="sticky top-0 z-30 bg-bg">
          <nav
            className="grid grid-cols-3 border-b border-ink"
            role="tablist"
            aria-label="页面切换"
          >
            {TABS.map((t, i) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    'py-3.5 sm:py-4 transition-colors ease-editorial duration-fast cursor-pointer',
                    'active:bg-sunken active:scale-[0.98] transition-transform',
                    i > 0 ? 'border-l border-ink' : '',
                    active ? 'bg-ink text-bg active:bg-ink' : 'bg-bg text-ink hover:bg-surface',
                  )}
              >
                <div className={cn(
                  'font-mono text-2xs uppercase tracking-[0.30em]',
                  active ? 'opacity-65' : 'text-faint',
                )}>
                  № {t.n}
                </div>
                <div className="font-display text-base font-medium leading-tight" style={{ letterSpacing: '-0.01em' }}>
                  {t.label}
                </div>
                <div className={cn('font-zh text-xs', active ? 'opacity-85' : 'text-muted')}>
                  {t.zh}
                </div>
              </button>
            );
          })}
        </nav>

          {/* ── 第二行 sticky 内容：根据当前 tab 决定展示什么 ──
                和 nav 共用同一个 sticky 包裹，避免缝隙；
                也必须在 motion.section 之外（否则 framer-motion 的 transform 会破坏 sticky）。 */}
          {tab === 'formula' && (
            <ActiveFlavorBar
              flavor={activeFlavor}
              index={activeIndex >= 0 ? activeIndex : 0}
              hydration={calculated.actualHydration}
            />
          )}
          {tab === 'bake' && (
            <ProcessProgress
              steps={steps}
              completedIds={completedIds}
              currentStepId={currentStepId}
              onReset={resetProgress}
            />
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.section
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={motionTransition}
            role="tabpanel"
          >
            {tab === 'formula' && (
              <FormulaTab
                activeFlavor={activeFlavor}
                calculated={calculated}
                onApplyFlavor={applyFlavor}
              />
            )}
            {tab === 'starter' && (
              <FeedPanel
                numUnits={numUnits}
                onNumUnitsChange={setNumUnits}
                seedStarter={seedStarter}
                onSeedChange={setSeedStarter}
                feed={feed}
              />
            )}
            {tab === 'bake' && (
              <div>
                <SecHead n={1} label="Process" zhLabel="制作流程" />
                <StepList
                  steps={steps}
                  completedIds={completedIds}
                  currentStepId={currentStepId}
                  openId={openStepId}
                  onOpenChange={setOpenStepId}
                  onToggle={toggleStep}
                  coldSlot={coldSlot}
                />
              </div>
            )}
          </motion.section>
        </AnimatePresence>

        {/* ── Colophon ── 编辑器收尾：1px 软线 + 斜体小字（对齐 v2-ledger / editorial 风格）*/}
        <footer className="border-t border-line-soft pt-5 mt-12">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div className="space-y-0.5">
              <div className="font-display italic text-muted text-sm" style={{ fontVariationSettings: "'opsz' 14, 'wght' 400" }}>
                The Bakery Ledger · 酸种创意实验室
              </div>
              <div className="font-mono text-2xs text-faint uppercase tracking-[0.20em]">
                Est. 2026 · Set in Fraunces &amp; Inter · Printed on warm paper
              </div>
            </div>
            <div className="font-display italic text-faint text-xs" style={{ fontVariationSettings: "'opsz' 12, 'wght' 400" }}>
              — Flour, water, salt, time.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

// ── Formula Tab ─────────────────────────────────────────────
// 注意：ActiveFlavorBar 已被抬到 App 顶层（兄弟节点），
// 这里只渲染下方滚动区内容。
function FormulaTab({ activeFlavor, calculated, onApplyFlavor }) {
  return (
    <div className="space-y-7">
      {/* №01 Choose flavor */}
      <section>
        <SecHead n={1} label="Flavor" zhLabel="风味预设" />
        <FlavorPresets
          flavors={FLAVORS}
          activeId={activeFlavor.id}
          onApply={onApplyFlavor}
        />
      </section>

      {/* №02 Ingredient table */}
      <section>
        <SecHead n={2} label="Ingredients" zhLabel="配方清单" />
        <IngredientTable
          ingredients={calculated.ingredients}
          totalWeight={calculated.totalWeight}
        />
      </section>

      {/* Marginalia (notes + warnings) */}
      <Marginalia
        notes={calculated.notes || []}
        warnings={calculated.warnings || []}
      />

      {/* Source */}
      <FlavorSource flavor={activeFlavor} />
    </div>
  );
}

function matchFlavor(selected) {
  return FLAVORS.find(f => {
    if (f.modifiers.length !== selected.length) return false;
    return f.modifiers.every(m => {
      const sel = selected.find(s => s.id === m.id);
      if (!sel) return false;
      return Math.abs((sel.dose ?? 0) - (m.dose ?? 0)) < 0.0001 || sel.dose === undefined;
    });
  }) || null;
}

export default App;
