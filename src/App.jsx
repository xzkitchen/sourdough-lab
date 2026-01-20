import React, { useState, useMemo, useCallback } from 'react';
import { Icons } from './utils/icons';
import { useStickyState } from './hooks/useStickyState';
import { STEPS_SOURDOUGH, STEPS_TOAST } from './data/steps';
import { STEPS_JAPANESE } from './STEPS_JAPANESE';
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
    if (breadType === 'japanese') {
      const base = {
        flourTangzhong: 28, milkTangzhong: 140,  // 原料168g，使用150g，预留18g
        flourMain: 250, allulose: 18, salt: 5, yeast: 4,
        egg: 50, milk: 85, milkPowder: 15, butter: 20,
        starter: 0  // 日式吐司用商业酵母，无需鲁邦种
      };
      const tangzhongNeeded = 150;  // 实际需要的汤种量
      return {
        flourTangzhong: base.flourTangzhong * ratio,
        milkTangzhong: base.milkTangzhong * ratio,
        tangzhongNeeded: tangzhongNeeded * ratio,
        flour: base.flourMain * ratio,
        allulose: base.allulose * ratio,
        salt: base.salt * ratio,
        yeast: base.yeast * ratio,
        egg: base.egg * ratio,
        milk: base.milk * ratio,
        milkPowder: base.milkPowder * ratio,
        butter: base.butter * ratio,
        starter: base.starter * ratio,  // 添加starter字段
        totalWeight: (250+18+5+4+50+85+15+20+150) * ratio,  // 使用汤种成品重量
        hydration: 74
      };
    } else if (breadType === 'toast') {
      const base = { 
        flour: 230, allulose: 20, milk: 95, tangzhong: 110, starter: 100, 
        milkPowder: 12, salt: 5, butterDough: 15, butterFilling: 15 
      };
      return { 
        flour: base.flour * ratio, allulose: base.allulose * ratio, milk: base.milk * ratio,
        tangzhong: base.tangzhong * ratio, starter: base.starter * ratio,
        milkPowder: base.milkPowder * ratio, salt: base.salt * ratio,
        butterDough: base.butterDough * ratio, butterFilling: base.butterFilling * ratio,
        totalWeight: (230+20+95+110+100+12+5+15+15) * ratio, hydration: 70 
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
    const currentSteps = breadType === 'japanese' ? STEPS_JAPANESE : 
                         breadType === 'toast' ? STEPS_TOAST : STEPS_SOURDOUGH;
    return currentSteps.map(step => {
      let ingredients = [];
      if (breadType === 'japanese') {
        if (step.id === 'tangzhong') ingredients = [{ name: '高筋粉', value: recipe.flourTangzhong }, { name: '牛奶', value: recipe.milkTangzhong }];
        else if (step.id === 'mix') ingredients = [{ name: '高筋粉', value: recipe.flour }, { name: '阿洛酮糖', value: recipe.allulose }, { name: '海盐', value: recipe.salt }, { name: '干酵母', value: recipe.yeast }, { name: '全蛋液', value: recipe.egg }, { name: '冰牛奶', value: recipe.milk }, { name: '汤种', value: recipe.tangzhongNeeded, unit: 'g (凉透)' }, { name: '奶粉', value: recipe.milkPowder }];
        else if (step.id === 'knead') ingredients = [{ name: '软化黄油', value: recipe.butter }];
        else if (step.id === 'divide') ingredients = [{ name: '每份', value: Math.round(recipe.totalWeight / (numBreads * 3)), unit: 'g' }];
      } else if (breadType === 'toast') {
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
            '【冷锅混合】:先将面粉和牛奶搅拌至无颗粒,再开火',
            '【全程搅拌】:开小火,需不停搅拌防止糊底',
            '【离火时机】:液体变稠,搅拌出现明显纹路(约65°C)时立即离火',
            '【贴面冷却】:保鲜膜贴着面糊表面盖好,防结皮,凉透后用',
            `【关于损耗】:原料共 ${rawTotal}g,需用 ${neededTotal}g。若不足,补牛奶至 ${neededTotal}g`
          ];
        }
        if (step.id === 'divide') {
          const totalPieces = numBreads * 3;
          const weightPerPiece = Math.round(recipe.totalWeight / totalPieces);
          currentTips = [
            `【分割】:共 ${totalPieces} 个小面团 (每条吐司 3 峰)`,
            `【重量】:每个面团约 ${weightPerPiece}g`,
            '【滚圆】:将每个小面团滚圆',
            '【松弛】:盖湿布松弛 20 分钟(松弛不到位会回缩)'
          ];
        }
        if (step.id === 'shape') {
          currentTips = [
            '【一次擀卷】:擀开卷起,松弛10分钟',
            '【二次擀卷】:再次擀长,压薄底边',
            '【卷入】:顶端放 5g 冷冻有盐黄油,卷在中心',
            '【入模】:3 个面团一组,并排放入吐司盒'
          ];
        }
      }
      if (breadType === 'japanese') {
        if (step.id === 'tangzhong') {
          const rawTotal = recipe.flourTangzhong + recipe.milkTangzhong;
          const neededTotal = recipe.tangzhongNeeded;
          currentTips = [
            '【冷锅混合】:先将面粉和牛奶搅拌至无颗粒,再开火',
            '【全程搅拌】:开小火,不停搅拌防止糊底',
            '【离火时机】:液体变稠,搅拌出现明显纹路(约65°C)时立即离火',
            '【贴面冷却】:保鲜膜贴着面糊表面盖好,防结皮',
            `【关于损耗】:原料共 ${rawTotal}g,需用 ${neededTotal}g。若不足,补牛奶至 ${neededTotal}g`,
            '【冷藏过夜】:冷藏4-24小时后使用,汤种必须完全凉透'
          ];
        }
        if (step.id === 'mix') {
          currentTips = [
            '【材料顺序】:液体在下(牛奶、蛋、汤种),粉类在上',
            '【酵母位置】:干酵母不要直接接触盐和糖',
            '【汤种温度】:汤种必须是冷藏状态(4-10°C),温热会杀死酵母',
            '【混合至无干粉】:1-2档慢速3-4分钟,搅拌至看不到干粉',
            '【揉至粗膜】:3-4档中速5-7分钟,能拉出厚膜,破口呈锯齿状',
            '【大宇大白象】:1档3分钟→3档5-7分钟',
            '【手揉参考】:混合5分钟→揉面15-20分钟'
          ];
        }
        if (step.id === 'knead') {
          currentTips = [
            '【黄油状态】:室温软化至手指能轻松按下',
            '【加入方式】:分2-3次加入,每次完全吃进再加下一次',
            '【判断标准】:能拉出透明薄膜(手套膜),破口边缘光滑',
            '【避免过度】:过度揉面会断筋,面团发粘',
            '【大宇大白象】:3-4档中速8-12分钟至手套膜',
            '【手揉参考】:摔打+揉压15-20分钟至手套膜'
          ];
        }
        if (step.id === 'bulk') {
          currentTips = [
            '【温湿度】:28°C / 75%湿度',
            '【发酵时间】:50-70分钟(室温22-25°C需90分钟)',
            '【判断标准】:面团膨胀至2倍大',
            '【戳洞测试】:手指沾粉戳洞,不回弹、不塌陷即可'
          ];
        }
        if (step.id === 'divide') {
          const totalPieces = numBreads * 3;
          const weightPerPiece = Math.round(recipe.totalWeight / totalPieces);
          currentTips = [
            `【分割】:共 ${totalPieces} 个小面团 (每条吐司 3 峰)`,
            `【重量】:每个面团约 ${weightPerPiece}g`,
            '【滚圆】:轻轻滚圆,不要过度排气',
            '【松弛】:盖保鲜膜松弛15-20分钟,松弛不足会回缩'
          ];
        }
        if (step.id === 'shape') {
          currentTips = [
            '【三次擀卷法】:这是撕拉纹理的秘密',
            '【第一次擀卷】:擀成牛舌状(宽约8cm),自上而下卷起,松弛10分钟',
            '【第二次擀卷】:擀成椭圆形(长约25cm),底边压薄,自上而下卷紧',
            '【卷的方向】:两次擀卷方向一致,卷起圈数约2.5-3圈',
            '【收口处理】:收口捏紧,收口朝下放入模具',
            '【入模】:3个面团并排放入吐司盒,间距均匀'
          ];
        }
        if (step.id === 'proof') {
          currentTips = [
            '【温湿度】:35°C / 80%湿度',
            '【发酵时间】:40-60分钟(室温需90-120分钟)',
            '【判断标准】:面团发至9分满模',
            '【回弹测试】:手指轻按,缓慢回弹即可',
            '【不要过发】:过发会导致组织粗糙,无法撕拉'
          ];
        }
        if (step.id === 'bake') {
          currentTips = [
            '【预热】:上火180°C / 下火200°C,预热15分钟',
            '【烘烤时间】:30-35分钟',
            '【10分钟】:开始膨胀上色',
            '【15分钟】:顶部金黄,盖锡纸防止过度上色',
            '【25分钟】:用手拍吐司侧面,听到空洞声',
            '【判断熟度】:中心温度90-93°C,或用牙签插入无湿面糊',
            '【出炉处理】:立即震模排气,脱模侧放散热,不要平放'
          ];
        }
      }
      return { 
        ...step, 
        ingredients, 
        tips: currentTips,
        subtitle: null,      // 明确设置为null，避免undefined显示
        description: null    // 明确设置为null，避免undefined显示
      };
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
            <div className="grid grid-cols-3 gap-2 mb-2">
              <button 
                onClick={() => handleSwitchBreadType('sourdough')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  breadType === 'sourdough' 
                    ? 'bg-neutral-800 border-orange-500/50 shadow-lg' 
                    : 'bg-neutral-900/40 border-white/5 hover:bg-neutral-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-1 text-orange-200">
                  <Icons.Bread className="w-5 h-5" />
                </div>
                <div className="font-bold text-xs text-white">乡村酸种</div>
                <div className="text-[9px] text-neutral-500 mt-0.5">Sourdough</div>
              </button>
              <button 
                onClick={() => handleSwitchBreadType('toast')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  breadType === 'toast' 
                    ? 'bg-neutral-800 border-orange-500/50 shadow-lg' 
                    : 'bg-neutral-900/40 border-white/5 hover:bg-neutral-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-1 text-orange-200">
                  <Icons.Toast className="w-5 h-5" />
                </div>
                <div className="font-bold text-xs text-white">奶盐吐司</div>
                <div className="text-[9px] text-neutral-500 mt-0.5">Levain</div>
              </button>
              <button 
                onClick={() => handleSwitchBreadType('japanese')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  breadType === 'japanese' 
                    ? 'bg-neutral-800 border-orange-500/50 shadow-lg' 
                    : 'bg-neutral-900/40 border-white/5 hover:bg-neutral-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-1 text-orange-200">
                  <Icons.Toast className="w-5 h-5" />
                </div>
                <div className="font-bold text-xs text-white">日式吐司</div>
                <div className="text-[9px] text-neutral-500 mt-0.5">Shokupan</div>
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
                label={breadType === 'japanese' ? '吐司数量 (原料597g/个)' : breadType === 'toast' ? '吐司数量 (原料602g/个)' : '面包数量 (Loaves)'}
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
                {breadType === 'japanese' ? (
                  <>
                    <IngredientRow name="【汤种】高筋粉" weight={recipe.flourTangzhong} percent={11} note="预留损耗" accent />
                    <IngredientRow name="【汤种】牛奶" weight={recipe.milkTangzhong} percent={56} note="预留损耗" accent />
                    <IngredientRow name="高筋面粉" weight={recipe.flour} percent={100} note="蛋白质>12.5%" />
                    <IngredientRow name="阿洛酮糖" weight={recipe.allulose} percent={7} note="健康代糖" />
                    <IngredientRow name="海盐" weight={recipe.salt} percent={2} />
                    <IngredientRow name="即发干酵母" weight={recipe.yeast} percent={1.6} note="商业酵母" />
                    <IngredientRow name="全蛋液" weight={recipe.egg} percent={20} note="撕拉关键" accent />
                    <IngredientRow name="冰牛奶" weight={recipe.milk} percent={34} />
                    <IngredientRow name="奶粉" weight={recipe.milkPowder} percent={6} />
                    <IngredientRow name="无盐黄油" weight={recipe.butter} percent={8} note="软化后加" />
                  </>
                ) : breadType === 'toast' ? (
                  <>
                    <IngredientRow name="高筋面粉" weight={recipe.flour} percent={100} note="蛋白质>12.5%" />
                    <IngredientRow name="阿洛酮糖" weight={recipe.allulose} percent={9} note="代糖" />
                    <IngredientRow name="牛奶 (冰)" weight={recipe.milk} percent={41} />
                    <IngredientRow name="汤种" weight={recipe.tangzhong} percent={48} note="需提前冷却" accent />
                    <IngredientRow name="鲁邦种" weight={recipe.starter} percent={43} />
                    <IngredientRow name="奶粉" weight={recipe.milkPowder} percent={5} />
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
            {breadType === 'japanese' ? (
              <div className="border border-white/10 rounded-3xl p-8 bg-neutral-900/60 backdrop-blur-sm text-center">
                <div className="text-6xl mb-4">🧑‍🍳</div>
                <h3 className="font-bold text-white text-lg mb-2">无需喂养</h3>
                <p className="text-neutral-400 text-sm">
                  日式吐司使用<span className="text-orange-400 font-bold">商业酵母</span>，无需提前喂养鲁邦种
                </p>
                <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                  <p className="text-xs text-orange-200/80">
                    💡 直接使用即发干酵母，省时省力，发酵更快速稳定
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="border border-white/10 rounded-3xl p-6 bg-neutral-900/60 backdrop-blur-sm">
                  <h3 className="font-bold text-white mb-6 flex items-center gap-2 text-sm tracking-wide">
                    <Icons.Wheat className="w-4 h-4 text-orange-400"/> 喂养计算
                  </h3>
                  <StepperControl 
                    label="使用旧种数量 (Seed Amount)" 
                    value={seedStarter} 
                    onChange={setSeedStarter} 
                    min={1} 
                    step={1} 
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
                  取 {seedStarter}g 旧种,加入上方显示的粉和水混合。静置发酵至峰值(约 4-6 小时)后,取 {feed.needed}g 用于做面包,
                  <span className="text-white font-bold">剩余约 {feed.buffer}g 作为下次的火种(已包含损耗余量)。</span>
                </div>
              </>
            )}
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
                      if(window.confirm('重置所有进度?')) { 
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
