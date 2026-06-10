import { describe, it, expect } from 'vitest';
import { calculateRecipe, calculateFeed, groupModifiersByStage, enhanceSteps, adjustStepsForTemp } from '../calculator.js';
import { predictBreadColor } from '../breadColor.js';

describe('calculateRecipe — base only', () => {
  it('乡村酸种 1 条基础配方', () => {
    const r = calculateRecipe({ base: 'sourdough-classic', numUnits: 1 });
    expect(r.flour).toBe(400);
    expect(r.water).toBe(280);
    expect(r.actualHydration).toBeCloseTo(0.70, 2);

    const byId = Object.fromEntries(r.ingredients.map((i) => [i.id, i]));
    expect(byId.flour.weight).toBe(400);
    expect(byId['water-autolyse'].weight).toBe(240);  // 280 - 40
    expect(byId['water-reserved'].weight).toBe(40);   // 400 × 0.10
    expect(byId.starter.weight).toBe(80);
    expect(byId.salt.weight).toBeCloseTo(8, 0);
    expect(r.warnings).toHaveLength(0);
  });

  it('乡村酸种 3 条按比例放大', () => {
    const r = calculateRecipe({ base: 'sourdough-classic', numUnits: 3 });
    expect(r.flour).toBe(1200);
    expect(r.water).toBe(840);
    expect(r.actualHydration).toBeCloseTo(0.70, 2);
  });
});

describe('calculateRecipe — 单 modifier', () => {
  it('抹茶 (default 2.9%) 吸水 + 警告咖啡因', () => {
    const r = calculateRecipe({
      base: 'sourdough-classic',
      numUnits: 1,
      selectedModifiers: [{ id: 'matcha' }],
    });
    // matcha 默认 2.9% → 400 × 0.029 = 11.6 → round 12g
    const matcha = r.ingredients.find((i) => i.id === 'matcha');
    expect(matcha.weight).toBe(12);
    // 吸水 0.80 × 12 = 9.6 → round 10g
    expect(r.water).toBe(280 + 10);

    // 咖啡因警告
    expect(r.warnings.join(' ')).toContain('咖啡因');
    expect(r.warnings.join(' ')).toContain('延长 15 分钟');

    // 额外糖
    const sugar = r.ingredients.find((i) => i.id === 'sugar-boost');
    expect(sugar).toBeTruthy();
    expect(sugar.weight).toBe(2);

    expect(r.processAdjust.bulkMinutesDelta).toBe(15);
  });

  it('可可 10% 触发面筋收紧 + hydrationBonusPct 3%', () => {
    const r = calculateRecipe({
      base: 'sourdough-classic',
      numUnits: 1,
      selectedModifiers: [{ id: 'cocoa', dose: 0.10 }],
    });
    // cocoa 40g；吸水 0.65 = 26g；glutenAdjust +3% of flour = 12g
    // 总水 = 280 + 26 + 12 = 318
    expect(r.water).toBe(280 + 26 + 12);
    expect(r.warnings.join(' ')).toContain('单宁');
  });

  it('葡萄干 (default 21%) 浸泡吸水 + 主发酵 -20 分钟', () => {
    const r = calculateRecipe({
      base: 'sourdough-classic',
      numUnits: 1,
      selectedModifiers: [{ id: 'raisin' }],
    });
    // raisin 默认 21% → 400 × 0.21 = 84g；吸水 0.35 × 84 = 29.4 → 29g
    expect(r.water).toBe(280 + 29);
    expect(r.processAdjust.bulkMinutesDelta).toBe(-20);
  });
});

describe('calculateRecipe — environment', () => {
  it('夏季模式不改原味配方克数，但给出控温和一发建议', () => {
    const r = calculateRecipe({
      base: 'sourdough-classic',
      numUnits: 1,
      environment: { mode: 'summer' },
    });

    const byId = Object.fromEntries(r.ingredients.map((i) => [i.id, i]));
    expect(r.water).toBe(280);
    expect(byId['water-autolyse'].weight).toBe(240);
    expect(byId['water-reserved'].weight).toBe(40);
    expect(r.environment.mode).toBe('summer');
    expect(r.environment.isWarm).toBe(true);
    expect(r.environment.targetWaterTempC).toBe(2);
    expect(r.environment.bulkRiseTarget).toBe('30-50%');
    expect(r.environment.actions.map((a) => a.value)).toEqual(['2-4°C', '24-25°C', '30-50%']);
    expect(r.processAdjust.bulkMinutesDelta).toBeLessThan(0);
    expect(r.notes.join(' ')).toContain('配方克数不变');
    expect(r.warnings.join(' ')).toContain('面温超过 26°C');
  });

  it('标准模式保持基础配方无额外提示', () => {
    const r = calculateRecipe({
      base: 'sourdough-classic',
      numUnits: 1,
      environment: { mode: 'standard' },
    });

    expect(r.environment.mode).toBe('standard');
    expect(r.environment.isWarm).toBe(false);
    expect(r.water).toBe(280);
    expect(r.notes).toHaveLength(0);
    expect(r.warnings).toHaveLength(0);
  });
});

describe('calculateRecipe — 多 modifier 叠加', () => {
  it('抹茶 + 核桃 + 蔓越莓 默认 dose', () => {
    const r = calculateRecipe({
      base: 'sourdough-classic',
      numUnits: 1,
      selectedModifiers: [
        { id: 'matcha' },     // 12g, +10 水
        { id: 'walnut' },     // 48g, 无水
        { id: 'cranberry' },  // 64g, +19 水 (0.30 × 64 = 19.2)
      ],
    });
    // 总水 = 280 + 10 + 19 = 309
    expect(r.water).toBe(280 + 10 + 19);
    // 发酵：抹茶 +15, 蔓越莓 -10 → 5
    expect(r.processAdjust.bulkMinutesDelta).toBe(5);
    // 5 base + 3 modifier + sugar-boost = 9 行
    expect(r.ingredients.length).toBeGreaterThanOrEqual(8);
  });

  it('触发高水合度警告（> base + 8%）', () => {
    const r = calculateRecipe({
      base: 'sourdough-classic',
      numUnits: 1,
      selectedModifiers: [
        { id: 'cocoa', dose: 0.10 },      // 40 × 0.65 + 12 = 38
        { id: 'flax-seed', dose: 0.06 },  // 24 × 1.0 = 24
      ],
    });
    // 280 + 38 + 24 = 342 → hydration 85.5%
    expect(r.actualHydration).toBeGreaterThan(0.78);
    expect(r.warnings.some((w) => w.includes('水合度'))).toBe(true);
  });
});

describe('calculateRecipe — dose 边界', () => {
  it('dose 超出 max 时被 clamp 并 warn', () => {
    const r = calculateRecipe({
      base: 'sourdough-classic',
      numUnits: 1,
      selectedModifiers: [{ id: 'matcha', dose: 0.20 }],   // 远超 max 0.05
    });
    const matcha = r.ingredients.find((i) => i.id === 'matcha');
    expect(matcha.weight).toBe(round(400 * 0.05));   // clamp 到 5%
    expect(r.warnings.join(' ')).toMatch(/用量.*调整/);
  });
});

describe('groupModifiersByStage', () => {
  it('按 addStage 分组 modifier', () => {
    const r = calculateRecipe({
      base: 'sourdough-classic',
      numUnits: 1,
      selectedModifiers: [{ id: 'matcha' }, { id: 'walnut' }, { id: 'raisin' }],
    });
    const groups = groupModifiersByStage(r.ingredients);
    expect(groups.mix?.some((i) => i.id === 'matcha')).toBe(true);
    expect(groups['fold-3']?.some((i) => i.id === 'walnut')).toBe(true);
    // raisin 在 fold-2
    expect(groups['fold-2']?.some((i) => i.id === 'raisin')).toBe(true);
  });
});

describe('adjustStepsForTemp', () => {
  it('按室温缩短 prep / bulk 步骤，并保留 mix 步骤', () => {
    const steps = [
      { id: 'feed', phase: 'prep', minutes: 300, timeValue: '4-6', timeUnit: '小时' },
      { id: 'knead', phase: 'mix', minutes: 10, timeValue: '8-10', timeUnit: '分钟' },
      { id: 'fold_1', phase: 'bulk', minutes: 30, timeValue: '30', timeUnit: '分钟后' },
    ];

    const adjusted = adjustStepsForTemp(steps, 28);
    expect(adjusted[0].minutes).toBe(240);
    expect(adjusted[0].timeValue).toBe('4');
    expect(adjusted[1].minutes).toBe(10);
    expect(adjusted[1].temperatureAdjusted).toBeUndefined();
    expect(adjusted[2].minutes).toBe(24);
    expect(adjusted[2].timeUnit).toBe('分钟后');
  });
});

describe('enhanceSteps — environment tips', () => {
  it('夏季环境替换一发体积目标，避免同时显示标准目标', () => {
    const calculated = calculateRecipe({
      base: 'sourdough-classic',
      numUnits: 1,
      environment: { mode: 'summer' },
    });
    const [step] = enhanceSteps([
      {
        id: 'bulk_final',
        phase: 'bulk',
        baseTips: ['体积膨胀：比初始高度增长 50%-75%'],
      },
    ], calculated);

    expect(step.tips.join(' ')).toContain('30-50%');
    expect(step.tips.join(' ')).not.toContain('50%-75%');
  });
});

describe('calculateFeed (sourdough only)', () => {
  it('60g seed + 80g needed + 60g buffer → 补 20g (10g flour + 10g water)', () => {
    const r = calculateRecipe({ base: 'sourdough-classic', numUnits: 1 });
    const feed = calculateFeed(r, 60);
    expect(feed.needed).toBe(80);
    expect(feed.total).toBe(140);
    expect(feed.flour + feed.water).toBe(80);
  });
});

describe('predictBreadColor', () => {
  it('无 modifier → 返回 base color', () => {
    const base = { breadColor: { h: 38, s: 25, l: 82 } };
    const res = predictBreadColor(base, []);
    expect(res.base.h).toBe(38);
    expect(res.dots).toHaveLength(0);
  });

  it('抹茶 → base 颜色向绿色偏移', () => {
    const base = { breadColor: { h: 38, s: 25, l: 82 } };
    const res = predictBreadColor(base, [{ id: 'matcha', dose: 0.04 }]);
    expect(res.base.h).toBeGreaterThan(38);
    expect(res.base.h).toBeLessThan(90);
  });

  it('核桃混入 → 有 1 个 dot', () => {
    const base = { breadColor: { h: 38, s: 25, l: 82 } };
    const res = predictBreadColor(base, [{ id: 'walnut' }]);
    expect(res.dots).toHaveLength(1);
    expect(res.dots[0].id).toBe('walnut');
  });
});

function round(n) { return Math.round(n); }
