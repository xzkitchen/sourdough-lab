import React, { useMemo, useCallback } from 'react';
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
import { StepList, ColdRetardTracker } from './components/process/index.js';
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
  }, [setCompletedList]);

  const activeFlavor = useMemo(() => matchFlavor(selected) || FLAVORS[0], [selected]);
  const activeIndex = FLAVORS.findIndex(f => f.id === activeFlavor.id);

  // 冷藏步骤插入计时器
  const coldStep = steps.find(s => s.phase === 'cold');
  const coldSlot = coldStep ? <ColdRetardTracker stepId={coldStep.id} /> : null;

  return (
    <div className="min-h-screen relative">
      <div className="max-w-2xl mx-auto px-4 py-5 sm:px-8 sm:py-10 relative z-10 space-y-5 sm:space-y-6">

        {/* ── Masthead ── */}
        <header className="border-b-2 border-ink pb-4">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="font-mono text-2xs text-faint uppercase tracking-[0.30em]">
                № 001 · Vol. 2026
              </div>
              <h1
                className="font-display font-medium text-ink leading-none mt-1.5"
                style={{
                  fontSize: 'clamp(28px, 7.5vw, 44px)',
                  letterSpacing: '-0.025em',
                  fontVariationSettings: "'opsz' 96, 'SOFT' 30, 'wght' 500",
                }}
              >
                Sourdough Lab
              </h1>
              <p className="font-zh text-xs text-muted mt-1">手作酸面包实验室</p>
            </div>
            <div className="font-mono text-2xs text-faint uppercase tracking-[0.20em] text-right hidden sm:block">
              Modular<br/>edition
            </div>
          </div>
        </header>

        {/* ── Tab nav ── */}
        <nav
          className="grid grid-cols-3 border-2 border-ink sticky top-0 z-30 bg-bg"
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
                  i > 0 ? 'border-l-2 border-ink' : '',
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

        {/* ── ActiveFlavorBar：仅在 Formula tab 显示，必须在 motion.section 之外
              否则 framer-motion 在 section 上写入的 transform 会让它 sticky 失效 ── */}
        {tab === 'formula' && (
          <ActiveFlavorBar
            flavor={activeFlavor}
            index={activeIndex >= 0 ? activeIndex : 0}
            hydration={calculated.actualHydration}
          />
        )}

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
                  onToggle={toggleStep}
                  onReset={resetProgress}
                  coldSlot={coldSlot}
                />
              </div>
            )}
          </motion.section>
        </AnimatePresence>

        {/* ── Colophon ── */}
        <footer className="border-t-2 border-ink pt-3 mt-10">
          <div className="flex justify-between items-baseline">
            <div className="font-mono text-2xs text-faint uppercase tracking-[0.30em]">
              Sourdough Lab · 2026
            </div>
            <div className="font-zh text-xs text-faint">编辑器 · ledger ed.</div>
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
