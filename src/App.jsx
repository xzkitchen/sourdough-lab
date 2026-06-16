import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cn } from './lib/cn.js';
import { useStickyState } from './hooks/useStickyState.js';
import { useColdRetard } from './hooks/useColdRetard.js';
import { useWakeLock } from './hooks/useWakeLock.js';
import { clearAllStepTimers } from './components/process/StepTimer.jsx';

import { DEFAULT_BASE } from './domain/base-recipes/index.js';
import { FLAVORS, MODIFIERS_BY_ID } from './domain/modifiers/index.js';
import {
  calculateRecipe,
  calculateFeed,
  enhanceSteps,
  adjustStepsForTemp,
} from './domain/calculator.js';
import { getProcessSteps } from './domain/process/index.js';

import {
  ActiveFlavorBar,
  EnvironmentPanel,
  FlavorPresets,
  IngredientTable,
  Marginalia,
  FlavorSource,
} from './components/recipe/index.js';
import { FeedPanel } from './components/starter/index.js';
import { StepList, ProcessProgress, ColdRetardTracker } from './components/process/index.js';
import { SecHead } from './components/ledger/index.js';
import { Stepper } from './components/primitives/Stepper.jsx';

const TABS = [
  { id: 'formula', label: 'Formula', zh: '配方', n: '01' },
  { id: 'starter', label: 'Starter', zh: '养种', n: '02' },
  { id: 'bake',    label: 'Bake',    zh: '流程', n: '03' },
];

// Masthead 发刊号唯一来源（之前 kicker 写 001、Issue 块写 04，两处漂移）
const ISSUE_NO = '04';
const VOL_YEAR = '2026';

const motionTransition = { duration: 0.22, ease: [0.2, 0.8, 0.2, 1] };

/**
 * Sourdough Lab · V2 Ledger shell
 *
 * Domain 层完全沿用 v3 的 calculator + FLAVORS + steps；
 * 表现层全部替换为 migration/components 下的 ledger 组件。
 */
function App() {
  const [tab, setTab] = useStickyState('formula', 'sdlv2_tab');
  // 减弱动画偏好：tab 切换只保留淡入，去掉位移与时长
  const prefersReducedMotion = useReducedMotion();
  // 减弱动画时用「短淡入」而非 duration:0 —— 后者会让 AnimatePresence mode="wait"
  // 收不到 exit 完成回调、卡住面板切换；0.14s 纯淡入既无位移又能正常完成过渡
  const tabTransition = prefersReducedMotion ? { duration: 0.14 } : motionTransition;
  const tabY = prefersReducedMotion ? 0 : 6;
  // tablist 键盘导航：← → 循环切换、Home/End 跳首尾，并把焦点移到目标 tab
  const tabRefs = useRef([]);
  const handleTabKeyDown = useCallback((e, i) => {
    let next = null;
    if (e.key === 'ArrowRight') next = (i + 1) % TABS.length;
    else if (e.key === 'ArrowLeft') next = (i - 1 + TABS.length) % TABS.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = TABS.length - 1;
    if (next === null) return;
    e.preventDefault();
    setTab(TABS[next].id);
    tabRefs.current[next]?.focus();
  }, [setTab]);
  const [numUnits, setNumUnits] = useStickyState(3, 'sdlv2_num_units');
  const [selected, setSelected] = useStickyState([], 'sdlv2_selected_modifiers');
  const [seasonMode, setSeasonMode] = useStickyState('summer', 'sdlv2_season_mode');
  const [seedStarter, setSeedStarter] = useStickyState(60, 'sdlv2_seed_starter');
  const [revivalMode, setRevivalMode] = useStickyState(false, 'sdlv2_revival_mode');
  const [completedList, setCompletedList] = useStickyState([], 'sdlv2_completed_steps');
  // 每步完成时刻 { [stepId]: ts } —— 跨天流程回看"上一步几点做的"
  const [completedAt, setCompletedAt] = useStickyState({}, 'sdlv2_completed_at');
  // 当前展开的步骤 id —— 抬到 App 是为了让 resetProgress 能一并重置展开态；
  // 持久化（sdlv2_open_step）让刷新后仍停在原步骤，stale id 会被 StepList 自然忽略
  const [openStepId, setOpenStepId] = useStickyState(null, 'sdlv2_open_step');

  const base = DEFAULT_BASE;

  const calculated = useMemo(
    () => calculateRecipe({
      base,
      numUnits,
      selectedModifiers: selected,
      environment: { mode: seasonMode },
    }),
    [base, numUnits, selected, seasonMode]
  );
  const feed = useMemo(
    () => calculateFeed(calculated, seedStarter),
    [calculated, seedStarter]
  );
  const baseSteps = useMemo(() => getProcessSteps(base.processRef), [base]);
  const tempAdjustedSteps = useMemo(
    () => adjustStepsForTemp(baseSteps, calculated.environment?.roomTempC),
    [baseSteps, calculated.environment?.roomTempC]
  );
  const steps = useMemo(() => enhanceSteps(tempAdjustedSteps, calculated), [tempAdjustedSteps, calculated]);

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
    setCompletedAt(prev => {
      const next = { ...prev };
      if (next[stepId]) delete next[stepId];   // 撤销 → 删时间戳
      else next[stepId] = Date.now();          // 完成 → 记时刻
      return next;
    });
  }, [setCompletedList, setCompletedAt]);

  // ── 配方指纹：第一步标完成时拍快照；之后配方参数变了 → Bake tab 警示 ──
  const recipeFingerprint = useMemo(
    () => JSON.stringify({ u: numUnits, m: selected, s: seasonMode }),
    [numUnits, selected, seasonMode]
  );
  const [bakingFingerprint, setBakingFingerprint] = useStickyState(null, 'sdlv2_baking_fingerprint');
  useEffect(() => {
    if (completedList.length > 0 && bakingFingerprint == null) {
      setBakingFingerprint(recipeFingerprint);
    }
  }, [completedList, bakingFingerprint, recipeFingerprint, setBakingFingerprint]);
  const recipeChangedMidBake =
    bakingFingerprint != null && bakingFingerprint !== recipeFingerprint;

  // ── 冷藏计时器：状态提升到 App，启动后在 Bake tab 顶部常驻 ──
  const coldStep = steps.find(s => s.phase === 'cold');
  const coldRetard = useColdRetard(coldStep?.id || 'cold');

  // Bake tab 阻止屏幕息屏（厨房场景手沾面，半小时不碰手机）
  useWakeLock(tab === 'bake');

  const resetProgress = useCallback(() => {
    setCompletedList([]);
    setCompletedAt({});
    // 第二炉从零开始：冷藏计时器 + 所有步骤计时器 + 配方快照一并清掉
    coldRetard.clear();
    clearAllStepTimers();
    setBakingFingerprint(null);
    // 一并把展开态拨回第一步 + 平滑滚动到它（让用户视觉上"回到原点"）
    const firstId = steps[0]?.id || null;
    setOpenStepId(firstId);
    if (firstId) {
      setTimeout(() => {
        const el = document.querySelector(`[data-step-id="${firstId}"]`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  }, [setCompletedList, setCompletedAt, steps, coldRetard, setBakingFingerprint]);

  // 启动时清洗一次：丢掉词汇表里已不存在的 modifier id（删过预设的老用户），
  // 避免 selected 里残留幽灵 id 让顶栏与配方表口径不一致。
  useEffect(() => {
    const cleaned = selected.filter((s) => MODIFIERS_BY_ID[s.id]);
    if (cleaned.length !== selected.length) setSelected(cleaned);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // matchFlavor 命中预设才有 activeFlavor；命中不到 = 自定义组合（null），
  // 不再静默回退到"原味"造成顶栏说原味、配方表却是别的克数的矛盾。
  const activeFlavor = useMemo(() => matchFlavor(selected), [selected]);
  const activeIndex = activeFlavor ? FLAVORS.findIndex(f => f.id === activeFlavor.id) : -1;
  // 自定义组合时，把实际选中的 modifier 中文名拼出来给顶栏显示
  const customLabel = useMemo(() => {
    if (activeFlavor || selected.length === 0) return null;
    return selected
      .map((s) => MODIFIERS_BY_ID[s.id]?.name || s.id)
      .join(' · ');
  }, [activeFlavor, selected]);

  // 冷藏步骤插入计时器：未启动时在第 12 步展开区内；
  // 启动后提升到 Bake tab 顶部常驻（见下方 tabpanel），步骤里只留一句指引
  const coldSlot = coldStep
    ? coldRetard.startedAt
      ? (
        <div className="mt-3 px-3 py-2 border border-line-soft border-dashed font-zh text-xs text-muted">
          计时进行中 · 倒计时和预热/入炉时间表已固定在本页顶部
        </div>
      )
      : <ColdRetardTracker tracker={coldRetard} />
    : null;

  return (
    <div className="min-h-screen relative ledger-side-rules">
      <div className="max-w-2xl mx-auto px-4 py-5 sm:px-8 sm:py-10 relative z-10 space-y-5 sm:space-y-6">

        {/* ── Masthead ── 两行标题（第二行斜体）+ 右侧发刊号 */}
        <header className="border-b-2 border-ink pb-4 sm:pb-5">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="font-mono text-2xs text-faint uppercase tracking-[0.30em] mb-1.5">
                {`№ ${ISSUE_NO} · Vol. ${VOL_YEAR}`}
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
                {`№ ${ISSUE_NO} · ${VOL_YEAR}`}
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
                  ref={(el) => (tabRefs.current[i] = el)}
                  type="button"
                  role="tab"
                  id={`tab-${t.id}`}
                  aria-selected={active}
                  aria-controls="tabpanel-main"
                  tabIndex={active ? 0 : -1}
                  onClick={() => setTab(t.id)}
                  onKeyDown={(e) => handleTabKeyDown(e, i)}
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
              customLabel={customLabel}
              index={activeIndex >= 0 ? activeIndex : 0}
              hydration={calculated.actualHydration}
              baseHydration={calculated.base?.hydration}
              warningCount={(calculated.warnings || []).length}
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
            initial={{ opacity: 0, y: tabY }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -tabY }}
            transition={tabTransition}
            role="tabpanel"
            id="tabpanel-main"
            aria-labelledby={`tab-${tab}`}
            tabIndex={0}
          >
            {tab === 'formula' && (
              <FormulaTab
                activeFlavor={activeFlavor}
                calculated={calculated}
                numUnits={numUnits}
                onNumUnitsChange={setNumUnits}
                seasonMode={seasonMode}
                onSeasonModeChange={setSeasonMode}
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
                revivalMode={revivalMode}
                onRevivalModeChange={setRevivalMode}
              />
            )}
            {tab === 'bake' && (
              <div>
                <SecHead n={1} label="Process" zhLabel="制作流程" />

                {/* 流程开始后配方被改动的警示（P0：克数静默变化） */}
                {recipeChangedMidBake && (
                  <div className="mb-3 px-4 py-3 bg-warn-bg border border-line-soft border-l-[3px] border-l-accent">
                    <div className="font-mono text-2xs text-accent-ink uppercase tracking-[0.24em] mb-1">
                      Recipe changed · 配方已变更
                    </div>
                    <p className="font-zh text-sm text-accent-ink leading-relaxed">
                      流程开始后，份数 / 风味 / 模式有改动，下方步骤中的克数已按<strong>新配方</strong>刷新；
                      进行中的面团仍是旧配方，请按实际情况判断。
                    </p>
                    <button
                      type="button"
                      onClick={() => setBakingFingerprint(recipeFingerprint)}
                      className="mt-2 px-3 py-2 border border-accent-ink text-accent-ink font-mono text-2xs uppercase tracking-[0.24em] cursor-pointer hover:bg-accent hover:text-bg hover:border-accent transition-colors duration-fast min-h-[40px]"
                    >
                      知道了 · 按新配方继续
                    </button>
                  </div>
                )}

                {/* 冷藏计时器启动后常驻顶部，不随第 12 步完成而消失 */}
                {coldRetard.startedAt && <ColdRetardTracker tracker={coldRetard} />}

                <StepList
                  steps={steps}
                  completedIds={completedIds}
                  completedAt={completedAt}
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
function FormulaTab({ activeFlavor, calculated, numUnits, onNumUnitsChange, seasonMode, onSeasonModeChange, onApplyFlavor }) {
  return (
    <div className="space-y-7">
      {/* №01 Choose flavor */}
      <section>
        <SecHead n={1} label="Flavor" zhLabel="风味预设" />
        <FlavorPresets
          flavors={FLAVORS}
          activeId={activeFlavor?.id ?? null}
          onApply={onApplyFlavor}
        />
      </section>

      {/* №02 Room temperature */}
      <section>
        <SecHead n={2} label="Mode" zhLabel="制作模式" />
        <EnvironmentPanel
          mode={seasonMode}
          onModeChange={onSeasonModeChange}
          environment={calculated.environment}
        />
      </section>

      {/* №03 Ingredient table —— 数量直接放在配方表上方：
            这张表的克数随份数变化，份数必须当场可见可改（和 Starter tab 共享同一 state）*/}
      <section id="formula-ingredients" className="scroll-mt-[var(--sticky-offset)]">
        <SecHead n={3} label="Ingredients" zhLabel="配方清单" />
        <div className="mb-2">
          <Stepper
            value={numUnits}
            onChange={onNumUnitsChange}
            step={1}
            min={1}
            max={8}
            labelEn="Loaves"
            labelZh="个 · 表中克数按此份数"
            ariaLabel="面包数量"
          />
        </div>
        <IngredientTable
          ingredients={calculated.ingredients}
          totalWeight={calculated.totalWeight}
          numUnits={numUnits}
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
