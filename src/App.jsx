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
  Card,
  Divider,
} from './components/primitives/index.js';

import {
  FlavorPresets,
  IngredientTable,
  WarningList,
  SectionHeader,
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

  const applyFlavor = useCallback((flavor) => {
    setSelected(flavor.modifiers.map((m) => ({ id: m.id, dose: m.dose })));
  }, [setSelected]);

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
        <header className="space-y-2">
          <h1 className="font-display text-[26px] sm:text-[32px] text-ink leading-[1.1] tracking-tight">
            Sourdough Lab
          </h1>
          <p className="text-xs text-muted font-body">
            手作酸面包实验室 · Artisan sourdough, modular
          </p>
        </header>

        {/* ── Tab nav ── */}
        <nav
          className="flex border-b border-line"
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
                className={cn(
                  'flex-1 pb-3 -mb-px border-b-[1.5px] transition-colors ease-editorial duration-fast flex flex-col items-center gap-0.5',
                  active
                    ? 'border-accent text-ink'
                    : 'border-transparent text-muted hover:text-ink'
                )}
              >
                <span className="font-display text-[17px] leading-none">{t.label}</span>
                <span className="font-body text-[10px] tracking-[0.2em] text-faint uppercase">
                  {t.zh}
                </span>
              </button>
            );
          })}
        </nav>

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
                selected={selected}
                calculated={calculated}
                onApplyFlavor={applyFlavor}
              />
            )}

            {tab === 'starter' && (
              <FeedPanel
                feed={feed}
                seedStarter={seedStarter}
                onSeedChange={setSeedStarter}
                base={base}
                numUnits={numUnits}
                onNumUnitsChange={setNumUnits}
                calculated={calculated}
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

// ── Formula Tab — 只两块：创意预设 + 配方清单 ──────────────────
function FormulaTab({ base, selected, calculated, onApplyFlavor }) {
  return (
    <div className="space-y-5">
      <FlavorPresets
        base={base}
        flavors={FLAVORS}
        selected={selected}
        onApply={onApplyFlavor}
      />

      <section className="space-y-4">
        <SectionHeader title="配方清单" latin="Formula" />
        <Card variant="surface" padding="md">
          <IngredientTable
            ingredients={calculated.ingredients}
            totalWeight={calculated.totalWeight}
          />
        </Card>
      </section>

      <WarningList warnings={calculated.warnings} notes={calculated.notes} />
    </div>
  );
}

export default App;
