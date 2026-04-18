/**
 * Calculator — 核心计算器
 *
 * 输入：base recipe + 份数 + 选中的 modifiers (含 dose)
 * 输出：完整的配方（食材权重 + 最终水合度 + 流程调整 + 警告 + note）
 *
 * 所有重量均为整数 g。
 */

import { getBaseRecipe } from './base-recipes/index.js';
import { getModifier } from './modifiers/index.js';

const round = (n) => Math.round(n);
const round1 = (n) => Math.round(n * 10) / 10;
const pct = (r) => `${Math.round(r * 1000) / 10}%`;

/**
 * @typedef {Object} SelectedModifier
 * @property {string} id          - modifier id
 * @property {number} [dose]      - 覆盖默认 dose（bp 值，如 0.04 = 4%）
 *
 * @typedef {Object} CalculatorInput
 * @property {string | object} base       - base recipe id 或对象
 * @property {number} numUnits            - 份数（条数）
 * @property {SelectedModifier[]} [selectedModifiers] - 已选 modifier
 *
 * @typedef {Object} CalculatorOutput
 * @property {Object} base
 * @property {number} numUnits
 * @property {number} flour               - 总面粉 g
 * @property {number} water               - 总水 g（含 modifier 补偿）
 * @property {number} actualHydration     - 实际水合度（0-1）
 * @property {number} totalWeight         - 所有食材总重 g
 * @property {Ingredient[]} ingredients   - 完整食材列表（基础 + modifier）
 * @property {Object} processAdjust       - { bulkMinutesDelta, proofMinutesDelta, temperatureDelta }
 * @property {string[]} warnings          - 给用户的提示
 * @property {string[]} notes             - 计算过程的透明化说明（"+ 10g 水 (抹茶吸水补偿)"）
 */

/**
 * 主入口
 * @param {CalculatorInput} input
 * @returns {CalculatorOutput}
 */
export function calculateRecipe(input) {
  const {
    base: baseInput,
    numUnits = 1,
    selectedModifiers = [],
  } = input;

  // 1. 解析 base
  const base = typeof baseInput === 'string'
    ? getBaseRecipe(baseInput)
    : baseInput;
  if (!base) throw new Error(`Unknown base recipe: ${baseInput}`);

  const flour = base.baseFlour * numUnits;

  // 2. 基础食材（按 bp 乘以总粉量）
  const baseIngredients = base.ingredients.map((ing) => ({
    id: ing.id,
    name: ing.name,
    role: ing.role,
    weight: ing.id === 'salt' ? round1(flour * ing.bp) : round(flour * ing.bp),
    bakersPct: ing.bp,
    isHydration: !!ing.isHydration,
    addStage: 'mix',
    note: ing.note || null,
    source: 'base',
  }));

  // 起始总水（来自 base ingredients 中 isHydration 的项）
  let water = baseIngredients
    .filter((i) => i.isHydration)
    .reduce((sum, i) => sum + i.weight, 0);

  // 3. 叠加 modifiers
  const modifierIngredients = [];
  const warnings = [];
  const notes = [];
  let bulkDelta = 0;      // 分钟
  let proofDelta = 0;
  let temperatureDelta = 0;
  let sugarBoost = 0;     // 单条基准，最后乘 numUnits

  for (const sel of selectedModifiers) {
    const mod = getModifier(sel.id);
    if (!mod) {
      warnings.push(`未知 modifier id: ${sel.id}`);
      continue;
    }

    const dose = typeof sel.dose === 'number' ? sel.dose : mod.dose.default;
    // clamp
    const clampedDose = Math.max(mod.dose.min, Math.min(mod.dose.max, dose));
    if (clampedDose !== dose) {
      warnings.push(`${mod.name} 用量 ${pct(dose)} 已调整至安全区间 ${pct(clampedDose)}`);
    }

    const weight = round(flour * clampedDose);

    modifierIngredients.push({
      id: mod.id,
      name: mod.name,
      role: mod.category,
      weight,
      bakersPct: clampedDose,
      isHydration: false,
      addStage: mod.addStage,
      preTreatment: mod.preTreatment || null,
      note: null,
      source: 'modifier',
    });

    // 3a. 水合度调整
    if (mod.hydrationAdjust?.method === 'absorption') {
      const add = round(weight * mod.hydrationAdjust.ratio);
      if (add > 0) {
        water += add;
        notes.push(`${mod.name} +${add}g 水（吸水补偿 ${pct(mod.hydrationAdjust.ratio)}）`);
      }
    } else if (mod.hydrationAdjust?.method === 'soaking-liquid') {
      const liquid = round(weight * mod.hydrationAdjust.ratio);
      if (liquid > 0) {
        water += liquid;
        notes.push(`${mod.name} 浸泡液 +${liquid}g 并入总水`);
      }
    }

    // 3b. 发酵调整
    if (mod.fermentationAdjust) {
      if (mod.fermentationAdjust.delayMinutes) {
        bulkDelta += mod.fermentationAdjust.delayMinutes;
        const sign = mod.fermentationAdjust.delayMinutes > 0 ? '延长' : '缩短';
        warnings.push(
          `${mod.name}：${mod.fermentationAdjust.reason}，主发酵${sign} ${Math.abs(mod.fermentationAdjust.delayMinutes)} 分钟`
        );
      }
      if (mod.fermentationAdjust.sugarBoostGrams) {
        sugarBoost += mod.fermentationAdjust.sugarBoostGrams;
      }
    }

    // 3c. 面筋调整
    if (mod.glutenAdjust?.hydrationBonusPct) {
      const add = round(flour * (mod.glutenAdjust.hydrationBonusPct / 100));
      water += add;
      notes.push(`${mod.name} 单宁收紧面筋 +${add}g 水`);
    }
    if (mod.glutenAdjust?.tip) {
      warnings.push(`${mod.name}：${mod.glutenAdjust.tip}`);
    }

    // 3d. 温度调整
    if (mod.temperatureAdjust) {
      temperatureDelta += mod.temperatureAdjust;
    }

    // 3e. modifier 自带 warnings
    (mod.warnings || []).forEach((w) => warnings.push(`${mod.name}：${w}`));
  }

  // 4. sugar boost 作为隐形食材（仅当总量 > 0）
  if (sugarBoost > 0) {
    const totalSugar = round(sugarBoost * numUnits);
    modifierIngredients.push({
      id: 'sugar-boost',
      name: '额外糖（激活酵母）',
      role: 'sugar',
      weight: totalSugar,
      bakersPct: totalSugar / flour,
      isHydration: false,
      addStage: 'mix',
      note: '用于补偿 modifier 对酵母的抑制',
      source: 'modifier',
    });
  }

  // 5. 实际水合度 + 水合度警告
  const actualHydration = water / flour;
  if (actualHydration > base.hydration + 0.08) {
    warnings.push(
      `水合度升至 ${pct(actualHydration)}（+${pct(actualHydration - base.hydration)}），建议延长 autolyse 或 lamination`
    );
  }

  // 6. 水的显示 —— 如果 base 声明了 waterReservedRatio，把水拆成 autolyse + reserved 两行
  const reservedRatio = base.defaults?.waterReservedRatio || 0;
  const ingredients = [...baseIngredients, ...modifierIngredients];
  const waterIdx = ingredients.findIndex((i) => i.id === 'water');
  if (waterIdx >= 0) {
    const totalWater = round(water);
    if (reservedRatio > 0) {
      const reservedWater = round(flour * reservedRatio);
      const autolyseWater = totalWater - reservedWater;
      ingredients.splice(
        waterIdx,
        1,
        {
          id: 'water-autolyse',
          name: '水',
          role: 'liquid',
          weight: autolyseWater,
          bakersPct: autolyseWater / flour,
          isHydration: true,
          addStage: 'autolyse',
          note: null,
          source: 'base',
        },
        {
          id: 'water-reserved',
          name: '预留水（后加）',
          role: 'liquid',
          weight: reservedWater,
          bakersPct: reservedRatio,
          isHydration: true,
          addStage: 'salt',
          note: null,
          source: 'base',
        }
      );
    } else {
      ingredients[waterIdx].weight = totalWater;
    }
  }

  // 7. 总重
  const totalWeight = ingredients.reduce((sum, i) => sum + i.weight, 0);

  // 8. 返回
  return {
    base,
    numUnits,
    flour: round(flour),
    water: round(water),
    actualHydration,
    totalWeight: round(totalWeight),
    ingredients,
    processAdjust: {
      bulkMinutesDelta: round(bulkDelta),
      proofMinutesDelta: round(proofDelta),
      temperatureDelta: round(temperatureDelta),
    },
    warnings,
    notes,
  };
}

/**
 * 按阶段分组 modifier 食材，用于步骤卡片展示"此时投料 X"
 */
export function groupModifiersByStage(ingredients) {
  const groups = {};
  for (const ing of ingredients) {
    if (ing.source !== 'modifier') continue;
    const stage = ing.addStage || 'mix';
    (groups[stage] = groups[stage] || []).push(ing);
  }
  return groups;
}

/**
 * 把 process steps 增强：注入对应阶段的 modifier 食材和调整过的 tips
 */
export function enhanceSteps(steps, calculated) {
  const byStage = groupModifiersByStage(calculated.ingredients);
  return steps.map((step) => {
    const stageIngredients = byStage[step.id] || [];
    const enhancedTips = [...(step.baseTips || [])];

    // 阶段提示：加入此刻投料的 modifier
    if (stageIngredients.length) {
      const names = stageIngredients
        .map((i) => `${i.name} ${i.weight}g`)
        .join(' / ');
      enhancedTips.push(`【本阶段投料】${names}`);
    }

    return {
      ...step,
      tips: enhancedTips,
      stageIngredients,
    };
  });
}

/**
 * 养种（feed）计算 —— 仅 sourdough category 有效
 */
export function calculateFeed(calculated, seedStarter) {
  const starter = calculated.ingredients.find((i) => i.id === 'starter');
  if (!starter) return null; // 日式吐司没有 starter

  const recipeNeeds = starter.weight;
  const buffer = calculated.base.defaults?.feedBufferGrams ?? 60;
  const totalBuildTarget = recipeNeeds + buffer;
  const mixtureNeeded = Math.max(0, totalBuildTarget - seedStarter);
  const flourPart = Math.ceil(mixtureNeeded / 2);
  const waterPart = mixtureNeeded - flourPart;

  return {
    needed: recipeNeeds,
    seed: seedStarter,
    flour: flourPart,
    water: waterPart,
    total: seedStarter + flourPart + waterPart,
    buffer,
  };
}

/**
 * 按室温调整发酵阶段时长
 *
 * 规则（业界 rule of thumb）：
 *   基准 24°C；每差 1°C 调整 ~5% 发酵时长（冷 → 延长 / 热 → 缩短）
 *   只影响 phase = 'prep'（喂种）/ 'bulk'（主发酵）的步骤
 *
 * @param {Array} steps        基础步骤
 * @param {number} roomTempC   室温摄氏度（18–32 合理，默认 24）
 * @returns {Array}            minutes 字段被调整后的步骤
 */
export function adjustStepsForTemp(steps, roomTempC) {
  if (!roomTempC || roomTempC === 24) return steps;
  const factor = Math.max(0.5, Math.min(1.6, 1 - (roomTempC - 24) * 0.05));
  return steps.map((s) => {
    const affected = s.phase === 'prep' || s.phase === 'bulk';
    if (!affected || !s.minutes) return s;
    return { ...s, minutes: Math.round(s.minutes * factor) };
  });
}

/**
 * 时间反推计划器 —— 从目标出炉时间倒推每步起止时间
 *
 * @param {object} p
 * @param {Array} p.steps             enhanceSteps 后的步骤数组
 * @param {string|Date} p.targetBakeTime  目标面包出炉时刻（ISO 或 Date）
 * @param {number} p.coldDurationHours    冷藏发酵时长（小时，默认 16）
 * @returns {object|null}
 *   {
 *     schedule: { [stepId]: { start: Date, end: Date } },
 *     feedStart: Date,           // 喂种开始
 *     coldStart: Date,           // 放入冰箱
 *     preheatTime: Date,         // 烤箱预热建议（cold_end - 1h）
 *     bakeStart: Date,           // 入炉
 *     bakeEnd: Date,             // 出炉（= target）
 *     totalDurationMinutes: number
 *   }
 */
export function calculateSchedule({ steps, targetBakeTime, coldDurationHours = 16 }) {
  if (!targetBakeTime || !steps?.length) return null;

  const target = targetBakeTime instanceof Date ? targetBakeTime : new Date(targetBakeTime);
  if (isNaN(target.getTime())) return null;

  const schedule = {};
  let cursorEndMs = target.getTime();   // 最后一步 bake 的 end = target

  // 从最后一步倒推
  for (let i = steps.length - 1; i >= 0; i--) {
    const step = steps[i];
    let durationMin;
    if (step.id === 'cold') {
      durationMin = coldDurationHours * 60;
    } else {
      durationMin = step.minutes || 0;
    }
    const startMs = cursorEndMs - durationMin * 60 * 1000;
    schedule[step.id] = {
      start: new Date(startMs),
      end: new Date(cursorEndMs),
      durationMinutes: durationMin,
    };
    cursorEndMs = startMs;
  }

  const firstStep = steps[0];
  const feedStart = schedule[firstStep.id].start;
  const coldStart = schedule.cold ? schedule.cold.start : null;
  const coldEnd = schedule.cold ? schedule.cold.end : null;
  const bakeStart = schedule.bake ? schedule.bake.start : target;
  const preheatTime = bakeStart
    ? new Date(bakeStart.getTime() - 60 * 60 * 1000)
    : null;

  const totalDurationMinutes = Math.round((target.getTime() - feedStart.getTime()) / 60000);

  return {
    schedule,
    feedStart,
    coldStart,
    coldEnd,
    preheatTime,
    bakeStart,
    bakeEnd: target,
    totalDurationMinutes,
  };
}

export { round, round1, pct };
