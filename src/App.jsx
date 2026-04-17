import React, { useMemo, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStickyState } from './hooks/useStickyState.js';

import { DEFAULT_BASE } from './domain/base-recipes/index.js';
import { COLORANTS, ADDINS, FLAVORS } from './domain/modifiers/index.js';
import {
  calculateRecipe,
  calculateFeed,
  enhanceSteps,
} from './domain/calculator.js';
import { getProcessSteps } from './domain/process/index.js';

import {
  Card,
  Divider,
  Button,
  NumberField,
} from './components/primitives/index.js';

import {
  FlavorPresets,
  ModifierTray,
  IngredientTable,
  HydrationBadge,
  WarningList,
} from './components/recipe/index.js';

import { FeedPanel } from './components/starter/index.js';
import { StepList, CookMode } from './components/process/index.js';

const TABS = [
  { id: 'formula', label: 'Formula', zh: '配方' },
  { id: 'starter', label: 'Starter', zh: '养种' },
  { id: 'bake',    label: 'Bake',    zh: '流程' },
];

const motionTransition = { duration: 0.22, ease: [0.2, 0.8, 0.2, 1] };

function App() {
  const [tab, setTab] = useStickyState('formula', 'sdl_tab');
  const [numUnits, setNumUnits] = useStickyState(3, 'sdl_num_units');
  const [selected, setSelected] = useStickyState([], 'sdl_selected_modifiers');

  const [seedStarter, setSeedStarter] = useStickyState(60, 'sdl_seed_starter');
  const [completedList, setCompletedList] = useStickyState([], 'sdl_completed_steps');
  const [coldStartTime, setColdStartTime] = useStickyState(null, 'sdl_cold_start');
  const [coldDuration, setColdDuration] = useStickyState(16, 'sdl_cold_duration');

  const [cookOpen, setCookOpen] = useState(false);
  const [cookCursor, setCookCursor] = useState(0);

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
  const steps = useMemo(
    () => enhanceSteps(baseSteps, calculated),
    [baseSteps, calculated]
  );

  const completedIds = useMemo(() => new Set(completedList), [completedList]);

  const toggleModifier = useCallback((id) => {
    setSelected((prev) => {
      const exists = prev.find((s) => s.id === id);
      if (exists) return prev.filter((s) => s.id !== id);
      return [...prev, { id }];
    });
  }, [setSelected]);

  const changeDose = useCallback((id, dose) => {
    setSelected((prev) => prev.map((s) => (s.id === id ? { ...s, dose } : s)));
  }, [setSelected]);

  const applyFlavor = useCallback((flavor) => {
    setSelected(flavor.modifiers.map((m) => ({ id: m.id, dose: m.dose })));
  }, [setSelected]);

  const resetSelected = useCallback(() => setSelected([]), [setSelected]);

  const toggleStep = useCallback((stepId) => {
    setCompletedList((prev) =>
      prev.includes(stepId) ? prev.filter((id) => id !== stepId) : [...prev, stepId]
    );
  }, [setCompletedList]);

  const resetProgress = useCallback(() => {
    setCompletedList([]);
    setColdStartTime(null);
  }, [setCompletedList, setColdStartTime]);

  const openCookMode = useCallback(() => {
    const currentIdx = steps.findIndex((s) => !completedIds.has(s.id));
    setCookCursor(currentIdx === -1 ? 0 : currentIdx);
    setCookOpen(true);
  }, [steps, completedIds]);

  return (
    <div className="min-h-screen relative">
      <div className="max-w-2xl mx-auto px-5 py-7 sm:px-8 sm:py-12 relative z-10 space-y-7 sm:space-y-10">

        {/* ── Header ── */}
        <header>
          <h1 className="font-display text-[28px] sm:text-4xl text-ink leading-none tracking-tight">
            Sourdough <span className="italic">Lab.</span>
          </h1>
          <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-muted font-body uppercase tracking-[0.22em]">
            A lab for creative sourdough
          </p>
        </header>

        {/* ── Tab nav ── */}
        <nav
          className="flex items-baseline gap-5 sm:gap-6 border-b border-line"
          role="tablist"
          aria-label="页面切换"
        >
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={`pb-2.5 sm:pb-3 -mb-px border-b-[1.5px] transition-colors ease-editorial duration-fast flex items-baseline gap-1.5
                  ${active ? 'border-accent text-ink' : 'border-transparent text-muted hover:text-ink'}
                `}
              >
                <span className="font-display text-base sm:text-lg">{t.label}</span>
                <span className="hidden sm:inline font-body text-xs tracking-widest text-faint uppercase">
                  {t.zh}
                </span>
              </button>
            );
          })}
        </nav>

        {/* ── Tab contents ── */}
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
                base={base}
                numUnits={numUnits}
                onNumUnitsChange={setNumUnits}
                selected={selected}
                calculated={calculated}
                onToggle={toggleModifier}
                onDose={changeDose}
                onApplyFlavor={applyFlavor}
                onReset={resetSelected}
              />
            )}

            {tab === 'starter' && (
              <FeedPanel
                feed={feed}
                seedStarter={seedStarter}
                onSeedChange={setSeedStarter}
              />
            )}

            {tab === 'bake' && (
              <StepList
                steps={steps}
                completedIds={completedIds}
                coldStartTime={coldStartTime}
                coldDuration={coldDuration}
                onToggle={toggleStep}
                onColdStart={() => setColdStartTime(new Date().toISOString())}
                onColdDuration={setColdDuration}
                onColdReset={() => setColdStartTime(null)}
                onReset={resetProgress}
                onOpenCookMode={openCookMode}
              />
            )}
          </motion.section>
        </AnimatePresence>

        <Divider />
        <footer className="py-3 text-center text-[10px] text-faint font-body">
          Sourdough Lab · 2026
        </footer>
      </div>

      <CookMode
        open={cookOpen}
        steps={steps}
        completedIds={completedIds}
        cursorIndex={cookCursor}
        onCursor={setCookCursor}
        onToggle={toggleStep}
        onClose={() => setCookOpen(false)}
      />
    </div>
  );
}

// ── Formula Tab — 紧凑布局 ──────────────────────
function FormulaTab({
  base,
  numUnits,
  onNumUnitsChange,
  selected,
  calculated,
  onToggle,
  onDose,
  onApplyFlavor,
  onReset,
}) {
  return (
    <div className="space-y-8">
      {/* Chef's picks */}
      <FlavorPresets
        base={base}
        flavors={FLAVORS}
        selected={selected}
        onApply={onApplyFlavor}
      />

      {/* 数量 + 水合度紧凑 row */}
      <QuantityHydrationRow
        base={base}
        numUnits={numUnits}
        onNumUnitsChange={onNumUnitsChange}
        calculated={calculated}
      />

      {/* Ingredient table */}
      <section className="space-y-3">
        <div className="flex items-baseline gap-2 px-0.5">
          <span className="text-[10px] uppercase tracking-[0.2em] text-faint font-body">
            Formula
          </span>
          <span className="font-display text-base text-ink">配方清单</span>
        </div>
        <Card variant="surface" padding="md">
          <IngredientTable
            ingredients={calculated.ingredients}
            totalWeight={calculated.totalWeight}
          />
        </Card>
      </section>

      {/* Warnings + notes */}
      <WarningList warnings={calculated.warnings} notes={calculated.notes} />

      {/* 自定义 modifier */}
      <ModifierTray
        title="色粉"
        sub="Colorants"
        modifiers={COLORANTS}
        selected={selected.filter((s) => COLORANTS.some((c) => c.id === s.id))}
        onToggle={onToggle}
        onDoseChange={onDose}
        initialVisible={4}
      />

      <ModifierTray
        title="混入料"
        sub="Add-ins"
        modifiers={ADDINS}
        selected={selected.filter((s) => ADDINS.some((a) => a.id === s.id))}
        onToggle={onToggle}
        onDoseChange={onDose}
        initialVisible={4}
      />

      {selected.length > 0 && (
        <div className="flex justify-end">
          <Button variant="text" size="sm" onClick={onReset}>
            清空 modifier
          </Button>
        </div>
      )}
    </div>
  );
}

function QuantityHydrationRow({ base, numUnits, onNumUnitsChange, calculated }) {
  return (
    <Card variant="surface" padding="md" className="flex items-stretch gap-4 sm:gap-6">
      {/* 数量（左） */}
      <div className="flex-1 min-w-0">
        <NumberField
          label="数量"
          hint="Loaves"
          value={numUnits}
          onChange={onNumUnitsChange}
          min={1}
          max={10}
        />
      </div>

      {/* 分割线 */}
      <div className="w-px bg-line-soft" aria-hidden />

      {/* 水合度（右） */}
      <div className="flex flex-col justify-between shrink-0">
        <div className="text-[10px] uppercase tracking-widest text-muted font-body mb-2">
          水合度
        </div>
        <HydrationBadge
          value={calculated.actualHydration}
          base={base.hydration}
        />
        <div className="text-[10px] text-faint font-body mt-2">
          base {Math.round(base.hydration * 100)}%
        </div>
      </div>
    </Card>
  );
}

export default App;
