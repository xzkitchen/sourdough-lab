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
  FlavorSource,
} from './components/recipe/index.js';

import { FeedPanel } from './components/starter/index.js';
import { StepList, CookMode, BatchLog } from './components/process/index.js';

import {
  Masthead,
  ChapterHero,
} from './components/editorial/index.js';

const TABS = [
  { id: 'formula', label: 'Formula', zh: '配方', chapter: 'Chapter I · Formula' },
  { id: 'starter', label: 'Starter', zh: '养种', chapter: 'Chapter II · Starter' },
  { id: 'bake',    label: 'Bake',    zh: '流程', chapter: 'Chapter III · Bake' },
];

const motionTransition = { duration: 0.22, ease: [0.2, 0.8, 0.2, 1] };

const DIFF_LABEL = {
  beginner: '入门',
  intermediate: '中阶',
  advanced: '进阶',
};
const diffLabel = (d) => DIFF_LABEL[d] || '—';

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
    // 保存后自动 reset 流程，开始新一轮
    setCompletedList([]);
    setColdStartTime(null);
  }, [setBatches, setCompletedList, setColdStartTime]);

  const deleteBatch = useCallback((id) => {
    setBatches((prev) => prev.filter((b) => b.id !== id));
  }, [setBatches]);

  const activeFlavor = useMemo(() => matchFlavor(selected), [selected]);
  const activeFlavorIdx = useMemo(
    () => (activeFlavor ? FLAVORS.findIndex((f) => f.id === activeFlavor.id) : -1),
    [activeFlavor]
  );

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

  const currentTabMeta = TABS.find((t) => t.id === tab);

  return (
    <div className="min-h-screen relative">
      <div className="max-w-2xl mx-auto px-5 py-7 sm:px-8 sm:py-12 relative z-10 space-y-7 sm:space-y-10">

        {/* ── Masthead —— 刊头 ── */}
        <Masthead
          issue="07"
          chapter={currentTabMeta?.chapter}
          flavorName={activeFlavor?.name}
        />

        {/* ── Tab nav —— sticky 磁吸置顶 ── */}
        <nav
          className="flex border-b border-line sticky top-0 z-20 bg-bg/92 backdrop-blur-md -mx-5 px-5 sm:-mx-8 sm:px-8 pt-2"
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
                numUnits={numUnits}
                activeFlavor={activeFlavor}
                activeFlavorIdx={activeFlavorIdx}
                onApplyFlavor={applyFlavor}
              />
            )}

            {tab === 'starter' && (
              <StarterTab
                base={base}
                feed={feed}
                seedStarter={seedStarter}
                onSeedChange={setSeedStarter}
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

// ── Chapter I · Formula ────────────────────────────────────────
function FormulaTab({
  base,
  selected,
  calculated,
  numUnits,
  activeFlavor,
  activeFlavorIdx,
  onApplyFlavor,
}) {
  const hydraDelta = calculated.actualHydration - base.hydration;
  const hydraDeltaLabel = Math.abs(hydraDelta) > 0.0005
    ? `${hydraDelta > 0 ? '+' : ''}${(hydraDelta * 100).toFixed(1)}`
    : null;

  const meta = [
    {
      label: 'No.',
      value: activeFlavorIdx >= 0 ? String(activeFlavorIdx + 1).padStart(2, '0') : '—',
      big: true,
    },
    { label: 'Class', value: diffLabel(activeFlavor?.difficulty) },
    { label: 'Yield', value: `${numUnits} × 400g` },
    {
      label: 'Hydration',
      value: `${(calculated.actualHydration * 100).toFixed(1)}%`,
      delta: hydraDeltaLabel,
    },
  ];

  return (
    <div className="space-y-8 md:space-y-section">
      <ChapterHero
        chapter="Chapter I · Formula"
        title={activeFlavor?.name || '自定义配方'}
        subtitle={activeFlavor?.nameLatin || 'Custom formula'}
        description={activeFlavor?.note}
        meta={meta}
      />

      <div className="space-y-5">
        <FlavorPresets
          base={base}
          flavors={FLAVORS}
          selected={selected}
          onApply={onApplyFlavor}
        />

        <div className="pt-2">
          <FlavorSource flavor={activeFlavor} />
        </div>

        <Card variant="surface" padding="md" className="space-y-4">
          <SectionHeader title="配方清单" latin="Formula" />
          <IngredientTable
            ingredients={calculated.ingredients}
            totalWeight={calculated.totalWeight}
          />
        </Card>

        <WarningList warnings={calculated.warnings} notes={calculated.notes} />
      </div>
    </div>
  );
}

// ── Chapter II · Starter ───────────────────────────────────────
function StarterTab({
  base,
  feed,
  seedStarter,
  onSeedChange,
  numUnits,
  onNumUnitsChange,
  calculated,
}) {
  const meta = feed
    ? [
        { label: 'Need',  value: `${feed.needed}g`, big: true },
        { label: 'Seed',  value: `${seedStarter}g` },
        { label: 'Flour', value: `${feed.flour}g` },
        { label: 'Water', value: `${feed.water}g` },
      ]
    : [{ label: 'Status', value: '—', big: true }];

  return (
    <div className="space-y-8 md:space-y-section">
      <ChapterHero
        chapter="Chapter II · Starter"
        title="养种"
        subtitle="Levain"
        description="配比与时间缓慢磨合——温度、时长、种龄共同塑造风味。峰值前取用，发酵力最稳。"
        meta={meta}
      />

      <FeedPanel
        feed={feed}
        seedStarter={seedStarter}
        onSeedChange={onSeedChange}
        base={base}
        numUnits={numUnits}
        onNumUnitsChange={onNumUnitsChange}
        calculated={calculated}
      />
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
  const completedCount = steps.filter((s) => completedIds.has(s.id)).length;
  const totalMinutes = steps.reduce((sum, s) => sum + (s.minutes || 0), 0);
  const totalHours = Math.round(totalMinutes / 60);

  const meta = [
    { label: 'Step',  value: `${completedCount}/${steps.length}`, big: true },
    { label: 'Cold',  value: `${coldDuration}h` },
    { label: 'Total', value: `${totalHours}h` },
    { label: 'Batches', value: String(batches.length) },
  ];

  return (
    <div className="space-y-8 md:space-y-section">
      <ChapterHero
        chapter="Chapter III · Bake"
        title="流程"
        subtitle="Process"
        description="十道工序自喂种到出炉贯穿一昼夜。按表推进，耐心是风味的一部分。"
        meta={meta}
      />

      <div className="space-y-4">
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
        <BatchLog
          batches={batches}
          onSave={onSaveBatch}
          onDelete={onDeleteBatch}
          canSave={canSaveBatch}
          currentBatchDraft={currentBatchDraft}
        />
      </div>
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
