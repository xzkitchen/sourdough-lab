// Sourdough Lab — shared domain (mockup port).
// Mirrors src/domain/* from the canonical app:
//   - base recipe: sourdough-classic (T65 / 70% / 0.20 starter / 0.02 salt)
//   - modifiers: colorants + addins (each has dose + hydration / fermentation / gluten adjustments)
//   - flavors: 11 curated presets, each = N modifiers with doses
//   - calculator: bp × flour, hydration absorption / soaking-liquid, gluten bonus, sugar boost
// All numbers integer g (salt 1-decimal). Hydration as 0..1.

(function () {
  const round  = (n) => Math.round(n);
  const round1 = (n) => Math.round(n * 10) / 10;
  const pct    = (r) => `${Math.round(r * 1000) / 10}%`;

  // ─── BASE: 乡村酸种 ────────────────────────────────
  const BASE = {
    id: 'sourdough-classic',
    name: '乡村酸种',
    nameLatin: 'Country Sourdough',
    baseFlour: 400,
    hydration: 0.70,
    ingredients: [
      { id: 'flour',   name: 'T65 高筋粉', bp: 1.00, role: 'flour',  isHydration: false },
      { id: 'water',   name: '水',         bp: 0.70, role: 'liquid', isHydration: true  },
      { id: 'starter', name: '鲁邦种',     bp: 0.20, role: 'leaven', isHydration: false },
      { id: 'salt',    name: '盐',         bp: 0.02, role: 'salt',   isHydration: false },
    ],
    defaults: { waterReservedRatio: 0.10, feedBufferGrams: 60 },
  };

  // ─── COLORANTS ─────────────────────────────────────
  const COLORANTS = [
    { id:'cocoa',    name:'可可粉',   nameLatin:'Cocoa',    category:'colorant',
      dose:{default:0.04,min:0.03,max:0.10},
      hydrationAdjust:{method:'absorption',ratio:0.65},
      glutenAdjust:{tip:'单宁收紧面筋；水合度 +3% 补偿', hydrationBonusPct:3},
      addStage:'mix', warnings:['可可含单宁，会收紧面筋；与水先拌匀再加入面粉'] },
    { id:'matcha',   name:'抹茶粉',   nameLatin:'Matcha',   category:'colorant',
      dose:{default:0.029,min:0.02,max:0.05},
      hydrationAdjust:{method:'absorption',ratio:0.80},
      fermentationAdjust:{delayMinutes:15, sugarBoostGrams:2, reason:'咖啡因轻度抑制酵母'},
      addStage:'mix', warnings:['高温烤制会让抹茶色发黄；控制烤温 ≤ 220°C 保色'] },
    { id:'turmeric', name:'姜黄粉',   nameLatin:'Turmeric', category:'colorant',
      dose:{default:0.015,min:0.01,max:0.02},
      hydrationAdjust:{method:'absorption',ratio:0.50},
      addStage:'mix', warnings:['用量超过 2% 会明显发苦'] },
    { id:'beetroot', name:'甜菜根粉', nameLatin:'Beetroot', category:'colorant',
      dose:{default:0.04,min:0.03,max:0.06},
      hydrationAdjust:{method:'absorption',ratio:0.70},
      addStage:'mix', warnings:['betalain 色素高温易褪色；建议烤温 ≤ 220°C'] },
    { id:'pumpkin',  name:'南瓜粉',   nameLatin:'Pumpkin',  category:'colorant',
      dose:{default:0.08,min:0.06,max:0.12},
      hydrationAdjust:{method:'absorption',ratio:0.70},
      addStage:'mix', warnings:[] },
    { id:'cinnamon', name:'肉桂粉',   nameLatin:'Cinnamon', category:'colorant',
      dose:{default:0.012,min:0.008,max:0.020},
      hydrationAdjust:{method:'absorption',ratio:0.35},
      addStage:'mix', warnings:[] },
  ];

  // ─── ADD-INS ───────────────────────────────────────
  const ADDINS = [
    { id:'pumpkin-seed',   name:'南瓜籽',   nameLatin:'Pumpkin Seed',   category:'addin',
      dose:{default:0.08,min:0.06,max:0.12}, addStage:'fold-3', warnings:[] },
    { id:'sunflower-seed', name:'葵花籽',   nameLatin:'Sunflower Seed', category:'addin',
      dose:{default:0.08,min:0.06,max:0.10}, addStage:'fold-3', warnings:[] },
    { id:'sesame',         name:'芝麻',     nameLatin:'Sesame',         category:'addin',
      dose:{default:0.05,min:0.03,max:0.08}, addStage:'fold-3', warnings:[] },
    { id:'flax-seed',      name:'亚麻籽',   nameLatin:'Flax Seed',      category:'addin',
      dose:{default:0.04,min:0.03,max:0.06},
      hydrationAdjust:{method:'soaking-liquid',ratio:1.0},
      addStage:'mix', warnings:['亚麻籽需等重量水浸泡 12h 形成凝胶；浸泡液并入总水'] },
    { id:'fennel-seed',    name:'茴香籽',   nameLatin:'Fennel Seed',    category:'addin',
      dose:{default:0.008,min:0.005,max:0.015}, addStage:'mix',
      warnings:['剂量超过 1.5% 会掩盖小麦香；推荐 0.8%'] },
    { id:'cheddar',        name:'车达奶酪', nameLatin:'Cheddar',        category:'addin',
      dose:{default:0.15,min:0.10,max:0.20}, addStage:'fold-3',
      warnings:['一半磨碎 + 一半切块效果最佳（融化层 + 保留块状）'] },
    { id:'jalapeno',       name:'腌辣椒',   nameLatin:'Jalapeño',       category:'addin',
      dose:{default:0.24,min:0.15,max:0.30}, addStage:'fold-3',
      warnings:['沥干后切碎；带汁会稀释面团'] },
    { id:'olive',          name:'卡拉马塔橄榄', nameLatin:'Kalamata Olive', category:'addin',
      dose:{default:0.10,min:0.08,max:0.15}, addStage:'fold-2',
      warnings:['橄榄本身含盐，基础盐可减至 1.8%'] },
    { id:'rosemary',       name:'迷迭香',   nameLatin:'Rosemary',       category:'addin',
      dose:{default:0.01,min:0.005,max:0.015}, addStage:'fold-2', warnings:[] },
  ];

  const MODIFIERS_BY_ID = {};
  [...COLORANTS, ...ADDINS].forEach(m => { MODIFIERS_BY_ID[m.id] = m; });

  // ─── FLAVORS (11 presets) ─────────────────────────
  const FLAVORS = [
    { id:'plain',           name:'原味',       nameLatin:'Country Bread',     hue:38,
      modifiers:[],
      note:'Robertson 经典 75% 水合配方；新手可从 70% 起步。无任何添加，发酵风味最纯。',
      source:{ name:'Tartine Bread', author:'Chad Robertson' } },
    { id:'olive-rosemary',  name:'橄榄迷迭香', nameLatin:'Olive & Rosemary',  hue:80,
      modifiers:[{id:'olive',dose:0.10},{id:'rosemary',dose:0.01}],
      note:'橄榄带盐，基础盐减 0.2%。地中海经典。',
      source:{ name:'Tartine — Olive & Rosemary', author:'Chad Robertson' } },
    { id:'jalapeno-cheddar',name:'辣椒车达',   nameLatin:'Jalapeño Cheddar',  hue:50,
      modifiers:[{id:'jalapeno',dose:0.24},{id:'cheddar',dose:0.15}],
      note:'奶酪一半磨碎 + 一半切块；辣椒含盐，基础盐减 0.2%。',
      source:{ name:'King Arthur — Jalapeño-Cheddar' } },
    { id:'seeded',          name:'混合种子',   nameLatin:'Seeded Sourdough',  hue:38,
      modifiers:[{id:'pumpkin-seed',dose:0.05},{id:'sunflower-seed',dose:0.05},{id:'sesame',dose:0.05}],
      note:'种子烤过香气更浓；最后一次折叠时加入。',
      source:{ name:'The Perfect Loaf — Seeded', author:'Maurizio Leo' } },
    { id:'pumpkin-cinnamon',name:'南瓜肉桂',   nameLatin:'Pumpkin Cinnamon',  hue:28,
      modifiers:[{id:'pumpkin',dose:0.08},{id:'cinnamon',dose:0.012}],
      note:'南瓜粉吸水大，水合度会升至约 75%。秋日温暖金橙色。',
      source:{ name:'The Perfect Loaf — Pumpkin Cinnamon', author:'Maurizio Leo' } },
    { id:'matcha-swirl',    name:'抹茶漩涡',   nameLatin:'Matcha Swirl',      hue:90,
      modifiers:[{id:'matcha',dose:0.029}],
      note:'sourdough 改编版，去除糖与奶。抹茶 EGCG 抗氧化力强。',
      source:{ name:'King Arthur — Marbled Matcha (adapted)' } },
    { id:'turmeric-golden', name:'金黄姜黄',   nameLatin:'Golden Turmeric',   hue:42,
      modifiers:[{id:'turmeric',dose:0.015},{id:'sunflower-seed',dose:0.06}],
      note:'姜黄素抗炎；佐黑胡椒可提升吸收。',
      source:{ name:'Full Proof Baking — Golden Turmeric', author:'Kristen Dennis' } },
    { id:'flax-multigrain', name:'亚麻多谷',   nameLatin:'Flax Multigrain',   hue:30,
      modifiers:[{id:'flax-seed',dose:0.04},{id:'sunflower-seed',dose:0.05},{id:'sesame',dose:0.03}],
      note:'亚麻籽前一晚等重量水浸泡 12h 成凝胶；ω-3 + 木酚素，心血管友好。',
      source:{ name:'The Perfect Loaf — Super-Seeded', author:'Maurizio Leo' } },
    { id:'beetroot-earth',  name:'甜菜根',     nameLatin:'Beetroot Levain',   hue:340,
      modifiers:[{id:'beetroot',dose:0.04}],
      note:'甜菜红素遇高温易褪色，烤温 ≤ 220°C 保色。',
      source:{ name:'Sourdough School — Beetroot', author:'Vanessa Kimbell' } },
    { id:'fennel-sesame',   name:'茴香芝麻',   nameLatin:'Fennel & Sesame',   hue:48,
      modifiers:[{id:'fennel-seed',dose:0.008},{id:'sesame',dose:0.05}],
      note:'茴香籽轻压出香气；托斯卡纳风格。',
      source:{ name:'Hamelman — Bread', author:'Jeffrey Hamelman' } },
  ];
  const FLAVORS_BY_ID = {}; FLAVORS.forEach(f => { FLAVORS_BY_ID[f.id] = f; });

  // ─── CORE: calculateRecipe ────────────────────────
  function calculateRecipe({ base = BASE, numUnits = 1, selectedModifiers = [] }) {
    const flour = base.baseFlour * numUnits;
    const baseIngredients = base.ingredients.map((ing) => ({
      id: ing.id, name: ing.name, role: ing.role,
      weight: ing.id === 'salt' ? round1(flour * ing.bp) : round(flour * ing.bp),
      bakersPct: ing.bp, isHydration: !!ing.isHydration,
      addStage: 'mix', source: 'base',
    }));
    let water = baseIngredients.filter(i => i.isHydration).reduce((s,i) => s + i.weight, 0);

    const modIngredients = [];
    const warnings = [];
    const notes = [];
    let sugarBoost = 0;

    for (const sel of selectedModifiers) {
      const mod = MODIFIERS_BY_ID[sel.id];
      if (!mod) { warnings.push(`未知 modifier: ${sel.id}`); continue; }
      const requestedDose = typeof sel.dose === 'number' ? sel.dose : mod.dose.default;
      const dose = Math.max(mod.dose.min, Math.min(mod.dose.max, requestedDose));
      const weight = round(flour * dose);

      modIngredients.push({
        id: mod.id, name: mod.name, role: mod.category,
        weight, bakersPct: dose, isHydration: false,
        addStage: mod.addStage, source: 'modifier',
      });

      if (mod.hydrationAdjust?.method === 'absorption') {
        const add = round(weight * mod.hydrationAdjust.ratio);
        if (add > 0) { water += add; notes.push(`${mod.name} +${add}g 水（吸水补偿 ${pct(mod.hydrationAdjust.ratio)}）`); }
      } else if (mod.hydrationAdjust?.method === 'soaking-liquid') {
        const liq = round(weight * mod.hydrationAdjust.ratio);
        if (liq > 0) { water += liq; notes.push(`${mod.name} 浸泡液 +${liq}g 并入总水`); }
      }
      if (mod.fermentationAdjust?.sugarBoostGrams) sugarBoost += mod.fermentationAdjust.sugarBoostGrams;
      if (mod.glutenAdjust?.hydrationBonusPct) {
        const add = round(flour * (mod.glutenAdjust.hydrationBonusPct / 100));
        water += add; notes.push(`${mod.name} 单宁收紧面筋 +${add}g 水`);
      }
      if (mod.glutenAdjust?.tip) warnings.push(`${mod.name}：${mod.glutenAdjust.tip}`);
      (mod.warnings || []).forEach(w => warnings.push(`${mod.name}：${w}`));
    }

    if (sugarBoost > 0) {
      const totalSugar = round(sugarBoost * numUnits);
      modIngredients.push({
        id:'sugar-boost', name:'额外糖（激活酵母）', role:'sugar',
        weight: totalSugar, bakersPct: totalSugar/flour, isHydration:false,
        addStage:'mix', source:'modifier',
      });
    }

    const actualHydration = water / flour;
    if (actualHydration > base.hydration + 0.08) {
      warnings.push(`水合度升至 ${pct(actualHydration)}（+${pct(actualHydration - base.hydration)}），建议延长 autolyse`);
    }

    // split water → autolyse + reserved (10%)
    const ingredients = [...baseIngredients, ...modIngredients];
    const reservedRatio = base.defaults?.waterReservedRatio || 0;
    const wIdx = ingredients.findIndex(i => i.id === 'water');
    if (wIdx >= 0) {
      const totalWater = round(water);
      if (reservedRatio > 0) {
        const reserved = round(flour * reservedRatio);
        const autolyse = totalWater - reserved;
        ingredients.splice(wIdx, 1,
          { id:'water-autolyse', name:'水', role:'liquid',
            weight: autolyse, bakersPct: autolyse/flour, isHydration:true,
            addStage:'autolyse', source:'base' },
          { id:'water-reserved', name:'预留水（后加）', role:'liquid',
            weight: reserved, bakersPct: reservedRatio, isHydration:true,
            addStage:'salt', source:'base' },
        );
      } else {
        ingredients[wIdx].weight = totalWater;
      }
    }

    const totalWeight = ingredients.reduce((s,i) => s + i.weight, 0);

    return {
      base, numUnits,
      flour: round(flour), water: round(water),
      actualHydration, totalWeight: round(totalWeight),
      ingredients, warnings, notes,
    };
  }

  function calculateFeed(calculated, seedStarter) {
    const starter = calculated.ingredients.find(i => i.id === 'starter');
    if (!starter) return null;
    const recipeNeeds = starter.weight;
    const buffer = calculated.base.defaults?.feedBufferGrams ?? 60;
    const target = recipeNeeds + buffer;
    const need = Math.max(0, target - seedStarter);
    const flour = Math.ceil(need / 2);
    const water = need - flour;
    return { needed: recipeNeeds, seed: seedStarter, flour, water,
             total: seedStarter + flour + water, buffer };
  }

  // ─── PROCESS STEPS (canonical 13) ────────────────
  const SOURDOUGH_STEPS = [
    { id:'feed',       phase:'prep',  title:'激活鲁邦种',  subtitle:'Levain Build',      time:'4–6 小时',  temp:'28°C',
      tips:['最佳温度 26-28°C','峰值判断：体积膨胀 2.5-3 倍','浮水测试：取一小块放入水中漂浮'] },
    { id:'autolyse',   phase:'mix',   title:'混合与静置',  subtitle:'Fermentolyse',      time:'45 分钟',   temp:'室温',
      tips:['T65 面粉 + 水 + 鲁邦种','低速混合至无干粉即停','盖保鲜膜静置 45 分钟'] },
    { id:'salt',       phase:'mix',   title:'后加水 & 盐', subtitle:'Bassinage',         time:'5 分钟',    temp:'室温',
      tips:['预留水分 2-3 次缓慢加入','每次完全吸收再加下一次','最后加盐，低速至完全溶解'] },
    { id:'knead',      phase:'mix',   title:'机械揉面',    subtitle:'Mechanical Mix',    time:'8–10 分钟', temp:'≤ 26°C',
      tips:['目标：表面光滑，稍有粘性','能拉出有韧性的薄膜','面温勿超 26°C'] },
    { id:'bulk_rest',  phase:'bulk',  title:'静置松弛',    subtitle:'Bench Rest',        time:'30 分钟',   temp:'室温',
      tips:['转移至透明带刻度发酵盒','手沾水整理','标记初始高度'] },
    { id:'fold_1',     phase:'bulk',  title:'第一次折叠',  subtitle:'Stretch & Fold #1', time:'30 分钟后', temp:'室温',
      tips:['双手沾水防粘','抓一侧向上拉伸至极限','向中心覆盖折叠','转盒 90° 重复 4 次'] },
    { id:'fold_2',     phase:'bulk',  title:'第二次折叠',  subtitle:'Stretch & Fold #2', time:'30 分钟后', temp:'室温',
      tips:['重复拉伸折叠动作','若有 fold-2 阶段混入料（橄榄、迷迭香等），此时铺上','像叠被子一样包裹'] },
    { id:'fold_3',     phase:'bulk',  title:'第三次折叠',  subtitle:'Stretch & Fold #3', time:'30 分钟后', temp:'室温',
      tips:['面团应明显充气','动作温柔避免拉断','若有 fold-3 阶段混入料（种子、奶酪等），此时加入'] },
    { id:'bulk_final', phase:'bulk',  title:'一发结束',    subtitle:'Bulk End',          time:'2–3 小时',  temp:'室温',
      tips:['体积膨胀 50%-75%','表面出现大气泡','晃动如果冻','宁欠勿过'] },
    { id:'preshape',   phase:'shape', title:'分割预整',    subtitle:'Divide',            time:'30 分钟',   temp:'台面',
      tips:['分割面团','轻轻滚圆','松弛 20 分钟'] },
    { id:'shape',      phase:'shape', title:'最终整形',    subtitle:'Final Shape',       time:'10 分钟',   temp:'台面',
      tips:['光滑面撒粉翻面','轻拍排气','信封折叠 + 向下卷紧','接缝朝上入发酵篮'] },
    { id:'cold',       phase:'cold',  title:'冷藏发酵',    subtitle:'Cold Retard',       time:'8–24 小时', temp:'4°C',
      tips:['发酵篮套保鲜袋密封','冰箱 4°C 层（推荐 14–16h）','点击记录放入时间'] },
    { id:'bake',       phase:'bake',  title:'预热烘烤',    subtitle:'Baking',            time:'38 分钟',   temp:'230°C',
      tips:['提前 1 小时预热烤箱 + 铸铁锅','割包：深 0.5cm / 45°','阶段一 盖盖烤 20 min','阶段二 开盖烤 18 min 上色'] },
  ];

  function enhanceSteps(steps, calculated) {
    // group modifier ingredients by addStage
    const byStage = {};
    for (const ing of calculated.ingredients) {
      if (ing.source !== 'modifier') continue;
      const s = ing.addStage || 'mix';
      (byStage[s] = byStage[s] || []).push(ing);
    }
    return steps.map(step => {
      const stage = byStage[step.id] || [];
      const tips = [...step.tips];
      if (stage.length) tips.push(`【本阶段投料】${stage.map(i => `${i.name} ${i.weight}g`).join(' / ')}`);
      return { ...step, tips, stageIngredients: stage };
    });
  }

  // ─── EXPORT ───────────────────────────────────────
  window.SDL = {
    BASE, FLAVORS, FLAVORS_BY_ID, MODIFIERS_BY_ID,
    SOURDOUGH_STEPS, calculateRecipe, calculateFeed, enhanceSteps,
  };

  // ─── BACK-COMPAT shims (for legacy v1 / v3) ──────
  // Old API: calcRecipe({breadType, numBreads, flavorType}) → {flour, water, starter, salt, totalWeight, hydration, ...}
  window.calcRecipe = function ({ breadType = 'sourdough', numBreads = 3, flavorType = 'classic' } = {}) {
    if (breadType === 'japanese') {
      // legacy japanese path (kept verbatim for v1 / v3 compatibility)
      const ratio = numBreads, base = {
        flourTangzhong:27, milkTangzhong:133, flour:250, allulose:18, salt:5, yeast:4,
        egg:50, milk:85, milkPowder:15, butter:20,
      }, tang = 150;
      return {
        flourTangzhong: base.flourTangzhong*ratio, milkTangzhong: base.milkTangzhong*ratio,
        tangzhongNeeded: tang*ratio,
        flour: base.flour*ratio, allulose: base.allulose*ratio, salt: base.salt*ratio,
        yeast: base.yeast*ratio, egg: base.egg*ratio, milk: base.milk*ratio,
        milkPowder: base.milkPowder*ratio, butter: base.butter*ratio, starter: 0,
        totalWeight: (base.flour+base.allulose+base.salt+base.yeast+base.egg+base.milk+base.milkPowder+base.butter+tang)*ratio,
        hydration: 74,
      };
    }
    // map legacy "tomato" to new "olive-rosemary" for v1/v3 (closest savory preset),
    // since tomato/basil are no longer in domain. "classic" → plain.
    // (v2 uses the new flavor model directly, not this shim.)
    const flavorMap = { classic:'plain', tomato:'olive-rosemary' };
    const flavorId = flavorMap[flavorType] || flavorType || 'plain';
    const flavor = FLAVORS_BY_ID[flavorId] || FLAVORS_BY_ID.plain;
    const calc = calculateRecipe({ base: BASE, numUnits: numBreads, selectedModifiers: flavor.modifiers });
    const find = (id) => calc.ingredients.find(i => i.id === id);
    const tomato = find('olive')?.weight || 0;
    const basil  = find('rosemary')?.weight || 0;
    const flour  = calc.flour;
    const totalWater = round(calc.water);
    const reserved = round(flour * 0.1);
    return {
      flour, water: totalWater, starter: find('starter').weight,
      salt: find('salt').weight,
      reservedWater: reserved, autolyseWater: totalWater - reserved,
      tomato, basil,
      totalWeight: calc.totalWeight,
      perLoaf: Math.round(calc.totalWeight / numBreads),
      hydration: Math.round(calc.actualHydration * 100),
    };
  };

  window.calcFeed = function ({ recipe, seedStarter }) {
    const recipeNeeds = recipe.starter || 0;
    const buffer = 60;
    const target = recipeNeeds + buffer;
    const need = Math.max(0, target - seedStarter);
    const flour = Math.ceil(need / 2);
    const water = need - flour;
    return { needed: recipeNeeds, seed: seedStarter, flour, water,
             total: seedStarter + flour + water, buffer };
  };

  window.STEPS_SOURDOUGH = SOURDOUGH_STEPS;
  // Legacy japanese steps kept for v1/v3 (verbatim from prior recipe.js)
  window.STEPS_JAPANESE = [
    { id:'tangzhong', phase:'prep',  title:'制作汤种',   subtitle:'Tangzhong Prep',     time:'冷藏过夜',   temp:'65°C',
      tips:['冷锅混合面粉和牛奶至无颗粒','开小火不停搅拌防糊底','出现明显纹路立即离火','保鲜膜贴面冷藏 4–24 h'] },
    { id:'mix',       phase:'mix',   title:'混合面团',   subtitle:'Initial Mix',        time:'8–10 分钟', temp:'低温',
      tips:['投料顺序：冰牛奶→蛋液→汤种→粉→酵母→奶粉→糖→盐','汤种必须冷藏状态（4-10°C）','1档 3 分钟至无干粉，转 3 档 5-7 分钟至粗膜'] },
    { id:'knead',     phase:'mix',   title:'加黄油揉面', subtitle:'Butter & Knead',     time:'8–12 分钟', temp:'室温',
      tips:['黄油软化至手指可按下','分 2-3 次加入','3-4 档揉至手套膜','过度揉面会断筋'] },
    { id:'bulk',      phase:'bulk',  title:'一次发酵',   subtitle:'Bulk Fermentation',  time:'50–70 分钟',temp:'28°C',
      tips:['28°C / 75% 湿度','室温 22-25°C 延至 90 分钟','面团膨胀至 2 倍','戳洞不回弹不塌陷'] },
    { id:'divide',    phase:'shape', title:'分割滚圆',   subtitle:'Divide & Round',     time:'20 分钟松弛',temp:'台面',
      tips:['共 3 份/条，每份约 199g','轻轻滚圆不过度排气','盖保鲜膜松弛 15-20 分钟'] },
    { id:'shape',     phase:'shape', title:'整形入模',   subtitle:'Shaping',            time:'15 分钟',   temp:'台面',
      tips:['第一次擀卷：牛舌状宽 8cm，卷起松弛','第二次擀卷：椭圆长 25cm，卷紧 2.5-3 圈','收口朝下入模','3 个面团并排入吐司盒'] },
    { id:'proof',     phase:'shape', title:'二次发酵',   subtitle:'Final Proof',        time:'40–60 分钟',temp:'35°C',
      tips:['35°C / 80% 湿度','面团发至 9 分满模','轻按缓慢回弹即可','切勿过发'] },
    { id:'bake',      phase:'bake',  title:'烘烤出炉',   subtitle:'Baking',             time:'30–35 分钟',temp:'上180/下200°C',
      tips:['预热上 180°C / 下 200°C','15 分钟时盖锡纸','出炉立即震模，侧放散热'] },
  ];
})();
