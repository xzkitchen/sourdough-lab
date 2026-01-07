import React, { useState, useMemo, useCallback } from 'react';
import { Icons } from './utils/icons';
import { useStickyState } from './hooks/useStickyState';
import { STEPS_SOURDOUGH, STEPS_TOAST } from './data/steps';
import { ColdRetardTracker } from './components/ColdRetardTracker';
import { StepCard } from './components/StepCard';
import { IngredientRow, StepperControl, StatusBadge, FeedCard } from './components';

function App() {
  const [activeTab, setActiveTab] = useState('recipe');
  const [breadType, setBreadType] = useStickyState('sourdough', 'sl_bread_type');
  const [numBreads, setNumBreads] = useStickyState(3, 'sl_num');
  const [flavorType, setFlavorType] = useStickyState('classic', 'sl_flavor');
  const [seedStarter, setSeedStarter] = useStickyState(60, 'sl_seed_starter');
  const [completedSteps, setCompletedSteps] = useStickyState({}, 'sl_steps');
  const [coldStartTimeStr, setColdStartTimeStr] = useStickyState(null, 'sl_cold_start');
  const [coldDuration, setColdDuration] = useStickyState(16, 'sl_cold_duration');

  const handleSwitchBreadType = (type) => {
    setBreadType(type);
    setCompletedSteps({});
    setColdStartTimeStr(null);
    setNumBreads(3);
  };

  const recipe = useMemo(() => {
    const ratio = numBreads;
    if (breadType === 'toast') {
      const base = { 
        flour: 230, allulose: 35, milk: 90, tangzhong: 110, starter: 100, 
        milkPowder: 10, salt: 5, butterDough: 15, butterFilling: 15 
      };
      return { 
        flour: base.flour * ratio, allulose: base.allulose * ratio, milk: base.milk * ratio,
        tangzhong: base.tangzhong * ratio, starter: base.starter * ratio,
        milkPowder: base.milkPowder * ratio, salt: base.salt * ratio,
        butterDough: base.butterDough * ratio, butterFilling: base.butterFilling * ratio,
        totalWeight: (230+35+90+110+100+10+5+15) * ratio, hydration: 70 
      };
    } else {
      const base = { flour: 400, water: 280, starter: 80, salt: 8, tomato: 40, basil: 3 };
      const flour = base.flour * ratio;
      const water = base.water * ratio;
      const starter = base.starter * ratio;
      const salt = Math.round(base.salt * ratio * 10) / 10;
      const reservedWater = Math.round(water * 0.1);
      const autolyseWater = water - reservedWater;
      const tomato = flavorType === 'tomato' ? base.tomato * ratio : 0;
      const basil = flavorType === 'tomato' ? Math.round(base.basil * ratio * 10) / 10 : 0;
      const totalWeight = flour + water + starter + salt + tomato + basil;
      return { 
        flour, water, starter, salt, reservedWater, autolyseWater, tomato, basil, totalWeight, 
        perLoaf: Math.round(totalWeight / numBreads), hydration: 70 
      };
    }
  }, [numBreads, flavorType, breadType]);

  const feed = useMemo(() => {
    const recipeNeeds = recipe.starter;
    const buffer = 60;
    const totalBuildTarget = recipeNeeds + buffer;
    const mixtureNeeded = Math.max(0, totalBuildTarget - seedStarter);
    const flour = Math.ceil(mixtureNeeded / 2);
    const water = mixtureNeeded - flour;
    return { 
      needed: recipeNeeds, seed: seedStarter, flour, water, 
      total: seedStarter + flour + water, buffer 
    };
  }, [seedStarter, recipe.starter]);

  const steps = useMemo(() => {
    const currentSteps = breadType === 'toast' ? STEPS_TOAST : STEPS_SOURDOUGH;
    return currentSteps.map(step => {
      let ingredients = [];
      if (breadType === 'toast') {
        if (step.id === 'tangzhong') ingredients = [{ name: '高筋粉', value: 20 * numBreads }, { name: '牛奶', value: 100 * numBreads }];
        else if (step.id === 'feed') ingredients = [{ name: '旧种', value: feed.seed }, { name: '高粉', value: feed.flour }, { name: '水', value: feed.water }];
        else if (step.id === 'mix') ingredients = [{ name: '高筋粉', value: recipe.flour }, { name: '阿洛酮糖', value: recipe.allulose }, { name: '冰牛奶', value: recipe.milk }, { name: '汤种', value: recipe.tangzhong }, { name: '奶粉', value: recipe.milkPowder }, { name: '鲁邦种', value: recipe.starter }];
        else if (step.id === 'knead') ingredients = [{ name: '海盐', value: recipe.salt }, { name: '软化黄油', value: recipe.butterDough }];
        else if (step.id === 'shape') ingredients = [{ name: '有盐黄油', value: recipe.butterFilling, unit: 'g (冷冻)' }];
      } else {
        if (step.id === 'feed') ingredients = [{ name: '旧种', value: feed.seed }, { name: 'T65', value: feed.flour }, { name: '水', value: feed.water }];
        else if (step.id === 'autolyse') ingredients = [{ name: 'T65', value: recipe.flour }, { name: '水', value: recipe.autolyseWater }, { name: '鲁邦种', value: recipe.starter }];
        else if (step.id === 'salt') ingredients = [{ name: '盐', value: recipe.salt }, { name: '预留水', value: recipe.reservedWater }];
        else if (step.id === 'fold_2' && flavorType === 'tomato') ingredients = [{ name: '番茄', value: recipe.tomato }, { name: '罗勒', value: recipe.basil }];
        else if (step.id === 'preshape') ingredients = [{ name: '每份', value: recipe.perLoaf, unit: 'g' }];
      }
      
      let currentTips = step.tips;
      if (breadType === 'toast') {
        if (step.id === 'tangzhong') {
          const rawTotal = 120 * numBreads;
          const neededTotal = 110 * numBreads;
          currentTips = [
            '【冷锅混合】：先将面粉和牛奶搅拌至无颗粒，再开火',
            '【全程搅拌】：开小火，需不停搅拌防止糊底',
            '【离火时机】：液体变稠，搅拌出现明显纹路（约65°C）时立即离火',
            '【贴面冷却】：保鲜膜贴着面糊表面盖好，防结皮，凉透后用',
            `【关于损耗】：原料共 ${rawTotal}g，需用 ${neededTotal}g。若不足，补牛奶至 ${neededTotal}g`
          ];
        }
        if (step.id === 'divide') {
          const totalPieces = numBreads * 3;
          const weightPerPiece = Math.round(recipe.totalWeight / totalPieces);
          currentTips = [
            `【分割】：共 ${totalPieces} 个小面团 (每条吐司 3 峰)`,
            `【重量】：每个面团约 ${weightPerPiece}g`,
            '【滚圆】：将每个小面团滚圆',
            '【松弛】：盖湿布松弛 20 分钟（松弛不到位会回缩）'
          ];
        }
        if (step.id === 'shape') {
          currentTips = [
            '【一次擀卷】：擀开卷起，松弛10分钟',
            '【二次擀卷】：再次擀长，压薄底边',
            '【卷入】：顶端放 5g 冷冻有盐黄油，卷在中心',
            '【入模】：3 个面团一组，并排放入吐司盒'
          ];
        }
      }
      return { ...step, ingredients, tips: currentTips };
    });
  }, [feed, recipe, numBreads, flavorType, breadType]);

  const progress = useMemo(() => {
    const c = Object.values(completedSteps).filter(Boolean).length;
    return { completed: c, total: steps.length, percent: Math.round((c / steps.length) * 100) };
  }, [completedSteps, steps.length]);

  const toggleStep = useCallback((id) => {
    setCompletedSteps(p => ({ ...p, [id]: !p[id] }));
  }, [setCompletedSteps]);

  return (
    <div className="min-h-screen relative overflow-hidden pb-20">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#0c0a09]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-stone-900/40 via-[#0c0a09] to-[#0c0a09]"></div>
        <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] bg-orange-800/20 rounded-full blur-[120px] mix-blend-screen"></div>
        <div className="absolute top-[10%] right-[-20%] w-[500px] h-[500px] bg-rose-900/20 rounded-full blur-[100px] mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-amber-900/10 rounded-full blur-[120px] mix-blend-screen"></div>
      </div>

      <div className="max-w-md mx-auto px-6 py-10 relative z-10">
        {/* Header */}
        <header className="mb-10 pl-2">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-200">Sourdough</span>
              <span>Lab.</span>
            </h1>
          </div>
          <p className="text-neutral-500 font-medium tracking-wide text-sm flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block animate-pulse"></span>
            Artisan Baking Assistant
          </p>
        </header>

        {/* Navigation */}
        <nav className="flex bg-neutral-900/60 backdrop-blur-xl rounded-2xl p-1.5 mb-8 border border-white/10 shadow-2xl sticky top-4 z-50">
          {[
            { id: 'recipe', label: '配方', icon: Icons.Scale },
            { id: 'feed', label: '喂养', icon: Icons.Wheat },
            { id: 'process', label: '流程', icon: Icons.List }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-[13px] font-bold transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'bg-neutral-800 text-white shadow-lg shadow-black/20 border border-white/5' 
                  : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* TAB: Recipe */}
        {activeTab === 'recipe' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Bread Type Switcher */}
            <div className="grid grid-cols-2 gap-3 mb-2">
              <button 
                onClick={() => handleSwitchBreadType('sourdough')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  breadType === 'sourdough' 
                    ? 'bg-neutral-800 border-orange-500/50 shadow-lg' 
                    : 'bg-neutral-900/40 border-white/5 hover:bg-neutral-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-2 text-orange-200">
                  <Icons.Bread className="w-6 h-6" />
                </div>
                <div className="font-bold text-sm text-white">乡村酸种包</div>
                <div className="text-[10px] text-neutral-500 mt-1">Classic Sourdough</div>
              </button>
              <button 
                onClick={() => handleSwitchBreadType('toast')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  breadType === 'toast' 
                    ? 'bg-neutral-800 border-orange-500/50 shadow-lg' 
                    : 'bg-neutral-900/40 border-white/5 hover:bg-neutral-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-2 text-orange-200">
                  <Icons.Toast className="w-6 h-6" />
                </div>
                <div className="font-bold text-sm text-white">奶盐吐司</div>
                <div className="text-[10px] text-neutral-500 mt-1">Light Milk Salt</div>
              </button>
            </div>

            {/* Flavor Selection (Sourdough only) */}
            {breadType === 'sourdough' && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'classic', emoji: '🥖', title: '经典原味' },
                  { id: 'tomato', emoji: '🍅', title: '番茄罗勒' }
                ].map(f => (
                  <button 
                    key={f.id} 
                    onClick={() => setFlavorType(f.id)} 
                    className={`relative p-4 rounded-2xl border text-left transition-all ${
                      flavorType === f.id 
                        ? 'bg-neutral-800/80 border-neutral-600' 
                        : 'bg-neutral-900/40 border-white/5'
                    }`}
                  >
                    <div className="text-xl mb-1">{f.emoji}</div>
                    <div className={`font-bold text-xs ${flavorType === f.id ? 'text-white' : 'text-neutral-400'}`}>{f.title}</div>
                  </button>
                ))}
              </div>
            )}

            {/* Quantity Control */}
            <div className="bg-neutral-900/60 backdrop-blur-sm rounded-3xl p-6 border border-white/5">
              <StepperControl 
                label={breadType === 'toast' ? '吐司数量 (450g/个)' : '面包数量 (Loaves)'}
                value={numBreads} 
                onChange={setNumBreads} 
                min={1} 
                step={1} 
              />
            </div>

            {/* Recipe List */}
            <div className="border border-white/10 rounded-3xl overflow-hidden bg-neutral-900/60 backdrop-blur-sm">
              <div className="px-6 py-5 border-b border-white/5 flex justify-between items-baseline bg-black/20">
                <h3 className="font-bold text-white text-sm tracking-wide">配方清单</h3>
                <span className="text-[10px] font-bold text-neutral-400 bg-white/5 border border-white/5 px-2 py-1 rounded">Hydration {recipe.hydration}%</span>
              </div>
              <div className="divide-y divide-white/5">
                {breadType === 'toast' ? (
                  <>
                    <IngredientRow name="高筋面粉" weight={recipe.flour} percent={100} note="蛋白质>12.5%" />
                    <IngredientRow name="阿洛酮糖" weight={recipe.allulose} percent={15} note="代糖" />
                    <IngredientRow name="牛奶 (冰)" weight={recipe.milk} percent={40} />
                    <IngredientRow name="汤种" weight={recipe.tangzhong} percent={48} note="需提前冷却" accent />
                    <IngredientRow name="鲁邦种" weight={recipe.starter} percent={43} />
                    <IngredientRow name="奶粉" weight={recipe.milkPowder} percent={4} />
                    <IngredientRow name="海盐" weight={recipe.salt} percent={2} />
                    <IngredientRow name="无盐黄油" weight={recipe.butterDough} percent={6} note="揉入面团" />
                    <IngredientRow name="有盐黄油" weight={recipe.butterFilling} percent={6} note="整形时卷入 (冷冻)" accent />
                  </>
                ) : (
                  <>
                    <IngredientRow name="T65 高筋粉" weight={recipe.flour} percent={100} />
                    <IngredientRow name="水" weight={recipe.water} percent={70} note={`预留 ${recipe.reservedWater}g`} />
                    <IngredientRow name="鲁邦种" weight={recipe.starter} percent={20} />
                    <IngredientRow name="盐" weight={recipe.salt} percent={2} />
                    {flavorType === 'tomato' && (
                      <>
                        <IngredientRow name="风干番茄" weight={recipe.tomato} percent={10} accent />
                        <IngredientRow name="罗勒碎" weight={recipe.basil} percent={0.75} accent />
                      </>
                    )}
                  </>
                )}
              </div>
              <div className="px-6 py-6 bg-black/30 flex justify-between items-center border-t border-white/5">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Total Mass</span>
                <span className="font-mono text-3xl font-bold text-white tracking-tight">
                  {recipe.totalWeight}<span className="text-sm ml-1 text-neutral-500 font-medium">g</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Feed */}
        {activeTab === 'feed' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="border border-white/10 rounded-3xl p-6 bg-neutral-900/60 backdrop-blur-sm">
              <h3 className="font-bold text-white mb-6 flex items-center gap-2 text-sm tracking-wide">
                <Icons.Wheat className="w-4 h-4 text-orange-400"/> 喂养计算
              </h3>
              <StepperControl 
                label="使用旧种数量 (Seed Amount)" 
                value={seedStarter} 
                onChange={setSeedStarter} 
                min={5} 
                step={5} 
              />
              <div className="mt-8 pt-6 border-t border-white/5 flex gap-4">
                <StatusBadge label="配方需求" value={`${feed.needed}g`} type="neutral" />
                <StatusBadge label="喂养总量" value={`${feed.total}g`} type="success" />
              </div>
            </div>

            <div>
              <div className="text-center text-[10px] text-neutral-500 mb-4 uppercase tracking-widest font-bold">1:1 喂养方案</div>
              <div className="grid grid-cols-2 gap-4">
                <FeedCard label="加 T65" value={feed.flour} />
                <FeedCard label="加 水" value={feed.water} />
              </div>
              <div className="mt-4 bg-neutral-900/80 border border-white/10 rounded-3xl p-6 flex items-center justify-between px-8 shadow-lg">
                <span className="text-xs text-neutral-500 font-bold uppercase tracking-wider">喂养后总量</span>
                <span className="font-mono text-3xl font-bold text-white">
                  {feed.total}<span className="text-sm ml-1 text-neutral-500 font-medium">g</span>
                </span>
              </div>
            </div>
            
            <div className="p-5 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-xs text-orange-200/80 leading-relaxed backdrop-blur-md">
              <span className="font-bold block mb-1 text-orange-400">喂养提示</span>
              取 {seedStarter}g 旧种，加入上方显示的粉和水混合。静置发酵至峰值（约 4-6 小时）后，取 {feed.needed}g 用于做面包，
              <span className="text-white font-bold">剩余约 {feed.buffer}g 作为下次的火种（已包含损耗余量）。</span>
            </div>
          </div>
        )}

        {/* TAB: Process */}
        {activeTab === 'process' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Progress Bar */}
            <div className="bg-neutral-900/80 backdrop-blur-xl rounded-3xl p-6 border border-white/10 sticky top-24 z-40 shadow-2xl shadow-black/50 mb-10">
              <div className="flex justify-between items-end mb-3">
                <div>
                  <div className="text-3xl font-bold text-white">{progress.percent}%</div>
                  <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">Completion</div>
                </div>
                {progress.completed > 0 && (
                  <button 
                    onClick={() => { 
                      if(window.confirm('重置所有进度？')) { 
                        setCompletedSteps({}); 
                        setColdStartTimeStr(null); 
                      }
                    }} 
                    className="text-[10px] font-bold text-neutral-500 hover:text-white px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg transition-colors uppercase tracking-wider hover:bg-white/10"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-400 to-amber-200 rounded-full shadow-[0_0_15px_rgba(251,146,60,0.5)] transition-all duration-700 ease-out" 
                  style={{ width: `${progress.percent}%` }} 
                />
              </div>
            </div>

            {/* Step Cards */}
            <div className="space-y-4">
              {steps.map(step => (
                <StepCard 
                  key={step.id} 
                  step={step} 
                  isDone={completedSteps[step.id]} 
                  onToggle={() => toggleStep(step.id)}
                >
                  {step.id === 'cold' && breadType === 'sourdough' && (
                    <ColdRetardTracker 
                      savedTime={coldStartTimeStr} 
                      savedDuration={coldDuration}
                      onSetTime={(e) => {
                        e.stopPropagation();
                        setColdStartTimeStr(new Date().toISOString());
                      }}
                      onSetDuration={(d) => setColdDuration(d)}
                      onReset={(e) => {
                        e.stopPropagation();
                        setColdStartTimeStr(null);
                      }}
                    />
                  )}
                </StepCard>
              ))}
            </div>
            <div className="h-20 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-neutral-800 rounded-full"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
