import React, { useMemo, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  FlavorPresets,
  IngredientTable,
  WarningList,
  FlavorSource,
  HydrationInline,
} from './components/recipe/index.js';

import { FeedPanel } from './components/starter/index.js';
import { StepList, CookMode, BatchLog } from './components/process/index.js';

import {
  Masthead,
  LedgerTabs,
  LedgerSection,
} from './components/editorial/index.js';

const TABS = [
  { id: 'formula', ordinal: '01', en: 'Formula', zh: '配方' },
  { id: 'starter', ordinal: '02', en: 'Levain',  zh: '养种' },
  { id: 'bake',    ordinal: '03', en: 'Method',  zh: '流程' },
];

const motionTransition = { duration: 0.14, ease: [0.2, 0.8, 0.2, 1] };

function App() {
  const [tab, setTab] = useStickyState('formula', 'sdl_tab');
  const [numUnits, setNumUnits] = useStickyState(3, 'sdl_num_units');
  const [selected, setSelected] = useStickyState([], 'sdl_selected_modifiers');

  const [seedStarter, setSeedStarter] = useStickyState(60, 'sdl_seed_starter');
  const [completedList, setCompletedList] = useStickyState([], 'sdl_completed_steps');
  const [coldStartTime, setColdStartTime] = useStickyState(null, 'sdl_cold_start');
  const [coldDuration, setColdDuration] = useStickyState(16, 'sdl_cold_duration');
  const [batches, setBatches] = useStickyState([], 'sdl_batches');

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

  const saveBatch = useCallback((batch) => {
    setBatches((prev) => [...prev, batch]);
    setCompletedList([]);
    setColdStartTime(null);
  }, [setBatches, setCompletedList, setColdStartTime]);

  const deleteBatch = useCallback((id) => {
    setBatches((prev) => prev.filter((b) => b.id !== id));
  }, [setBatches]);

  const activeFlavor = useMemo(() => matchFlavor(selected), [selected]);

  const allCompleted = steps.length > 0 && steps.every((s) => completedIds.has(s.id));

  const currentBatchDraft = useMemo(() => ({
    flavorId: activeFlavor?.id || 'custom',
    flavorName: activeFlavor?.name || '自定义配方',
    numUnits,
    hydration: calculated.actualHydration,
    coldDuration,
  }), [activeFlavor, numUnits, calculated.actualHydration, coldDuration]);

  const openCookMode = useCallback(() => {
    const currentIdx = steps.findIndex((s) => !completedIds.has(s.id));
    setCookCursor(currentIdx === -1 ? 0 : currentIdx);
    setCookOpen(true);
  }, [steps, completedIds]);

  return (
    <div className="min-h-screen relative">
      <div className="max-w-[720px] mx-auto px-5 sm:px-8 py-6 sm:py-10 relative z-10 space-y-8 sm:space-y-10">

        {/* ── Masthead ── */}
        <Masthead volume={1} count={FLAVORS.length} />

        {/* ── LedgerTabs ── */}
        <LedgerTabs tabs={TABS} value={tab} onChange={setTab} />

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
                numUnits={numUnits}
                activeFlavor={activeFlavor}
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
              <BakeTab
                steps={steps}
                completedIds={completedIds}
                coldStartTime={coldStartTime}
                coldDuration={coldDuration}
                onToggle={toggleStep}
                onColdStart={() => setColdStartTime(new Date().toISOString())}
                onColdDuration={setColdDuration}
                onColdReset={() => setColdStartTime(null)}
                onResetProgress={resetProgress}
                onOpenCookMode={openCookMode}
                batches={batches}
                onSaveBatch={saveBatch}
                onDeleteBatch={deleteBatch}
                canSaveBatch={allCompleted}
                currentBatchDraft={currentBatchDraft}
              />
            )}
          </motion.section>
        </AnimatePresence>

        <footer className="pt-8 text-center">
          <span className="text-[10px] text-faint font-body uppercase tracking-[0.24em]">
            Sourdough Lab · MMXXVI
          </span>
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

// ── Chapter I · Formula ────────────────────────────────────────
function FormulaTab({
  base,
  selected,
  calculated,
  numUnits,
  activeFlavor,
  onApplyFlavor,
}) {
  return (
    <div className="space-y-7 sm:space-y-9">
      <LedgerSection ordinal={1} title="Specimen" zhTitle="选品 · 风味">
        <FlavorPresets
          base={base}
          flavors={FLAVORS}
          selected={selected}
          onApply={onApplyFlavor}
          numUnits={numUnits}
        />
      </LedgerSection>

      <LedgerSection ordinal={2} title="Source" zhTitle="出处与说明">
        <FlavorSource flavor={activeFlavor} />
      </LedgerSection>

      <LedgerSection
        ordinal={3}
        title="Formula"
        zhTitle="配方清单"
        rightMeta={
          <HydrationInline
            value={calculated.actualHydration}
            base={base.hydration}
          />
        }
      >
        <IngredientTable
          ingredients={calculated.ingredients}
          totalWeight={calculated.totalWeight}
        />
      </LedgerSection>

      {(calculated.warnings?.length > 0 || calculated.notes?.length > 0) && (
        <LedgerSection ordinal={4} title="Notes" zhTitle="注释与警告">
          <WarningList warnings={calculated.warnings} notes={calculated.notes} />
        </LedgerSection>
      )}
    </div>
  );
}

// ── Chapter III · Bake ─────────────────────────────────────────
function BakeTab({
  steps,
  completedIds,
  coldStartTime,
  coldDuration,
  onToggle,
  onColdStart,
  onColdDuration,
  onColdReset,
  onResetProgress,
  onOpenCookMode,
  batches,
  onSaveBatch,
  onDeleteBatch,
  canSaveBatch,
  currentBatchDraft,
}) {
  return (
    <div className="space-y-7 sm:space-y-9">
      {/* StepList 自带 progress block */}
      <StepList
        steps={steps}
        completedIds={completedIds}
        coldStartTime={coldStartTime}
        coldDuration={coldDuration}
        onToggle={onToggle}
        onColdStart={onColdStart}
        onColdDuration={onColdDuration}
        onColdReset={onColdReset}
        onReset={onResetProgress}
        onOpenCookMode={onOpenCookMode}
      />

      <LedgerSection ordinal={1} title="Bake Log" zhTitle="批次记录">
        <BatchLog
          batches={batches}
          onSave={onSaveBatch}
          onDelete={onDeleteBatch}
          canSave={canSaveBatch}
          currentBatchDraft={currentBatchDraft}
        />
      </LedgerSection>
    </div>
  );
}

/** 在当前 selected modifiers 中寻找完全匹配的 flavor */
function matchFlavor(selected) {
  return FLAVORS.find((f) => {
    if (f.modifiers.length !== selected.length) return false;
    return f.modifiers.every((m) => {
      const sel = selected.find((s) => s.id === m.id);
      if (!sel) return false;
      return (
        Math.abs((sel.dose ?? 0) - (m.dose ?? 0)) < 0.0001 ||
        sel.dose === undefined
      );
    });
  }) || null;
}

export default App;
