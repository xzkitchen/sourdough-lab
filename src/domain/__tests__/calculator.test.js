import { describe, it, expect } from 'vitest';
import { calculateRecipe, calculateFeed, groupModifiersByStage } from '../calculator.js';
import { predictBreadColor } from '../breadColor.js';

describe('calculateRecipe — base only', () => {
  it('乡村酸种 1 条基础配方', () => {
    const r = calculateRecipe({ base: 'sourdough-classic', numUnits: 1 });
    expect(r.flour).toBe(400);
    expect(r.water).toBe(280);
    expect(r.actualHydration).toBeCloseTo(0.70, 2);

    const byId = Object.fromEntries(r.ingredients.map((i) => [i.id, i]));
    expect(byId.flour.weight).toBe(400);
    expect(byId.water.weight).toBe(280);
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
  it('抹茶 4% 正确吸水 + 警告咖啡因', () => {
    const r = calculateRecipe({
      base: 'sourdough-classic',
      numUnits: 1,
      selectedModifiers: [{ id: 'matcha' }],
    });
    // 抹茶 400 × 4% = 16g；吸水 16 × 35% = 5.6g → round 6g
    const matcha = r.ingredients.find((i) => i.id === 'matcha');
    expect(matcha.weight).toBe(16);
    expect(r.water).toBe(280 + 6);

    // 咖啡因警告
    expect(r.warnings.join(' ')).toContain('咖啡因');
    expect(r.warnings.join(' ')).toContain('延长 15 分钟');

    // 额外糖
    const sugar = r.ingredients.find((i) => i.id === 'sugar-boost');
    expect(sugar).toBeTruthy();
    expect(sugar.weight).toBe(2);

    // 流程调整
    expect(r.processAdjust.bulkMinutesDelta).toBe(15);
  });

  it('仙人果粉 6% 温度 -10°C + 警告色变橙', () => {
    const r = calculateRecipe({
      base: 'sourdough-classic',
      numUnits: 1,
      selectedModifiers: [{ id: 'prickly-pear' }],
    });
    expect(r.processAdjust.temperatureDelta).toBe(-10);
    expect(r.warnings.join(' ')).toMatch(/橙色/);
  });

  it('可可 10% 触发面筋收紧警告 + 额外水', () => {
    const r = calculateRecipe({
      base: 'sourdough-classic',
      numUnits: 1,
      selectedModifiers: [{ id: 'cocoa' }],
    });
    // cocoa 40g、吸水 65% = 26g，glutenAdjust +3% of flour = 12g
    // 总水 = 280 + 26 + 12 = 318
    expect(r.water).toBe(280 + 26 + 12);
    expect(r.warnings.join(' ')).toContain('单宁');
  });

  it('葡萄干 12% 浸泡液并入 + 主发酵 -20 分钟', () => {
    const r = calculateRecipe({
      base: 'sourdough-classic',
      numUnits: 1,
      selectedModifiers: [{ id: 'raisin' }],
    });
    // raisin 48g，浸泡 50% = 24g
    expect(r.water).toBe(280 + 24);
    expect(r.processAdjust.bulkMinutesDelta).toBe(-20);
  });
});

describe('calculateRecipe — 多 modifier 叠加', () => {
  it('抹茶 4% + 核桃 12% + 蔓越莓 10%', () => {
    const r = calculateRecipe({
      base: 'sourdough-classic',
      numUnits: 1,
      selectedModifiers: [
        { id: 'matcha' },
        { id: 'walnut' },
        { id: 'cranberry' },
      ],
    });
    // 抹茶吸水 6g + 蔓越莓浸泡 0.6×40=24g；核桃烤无水
    expect(r.water).toBe(280 + 6 + 24);
    // 主发酵：抹茶 +15，蔓越莓 -15 → 0
    expect(r.processAdjust.bulkMinutesDelta).toBe(0);
    // ingredients 应有 5 项 base + 3 modifier + sugar-boost = 9
    expect(r.ingredients.length).toBeGreaterThanOrEqual(8);
  });

  it('触发高水合度警告（> base + 8%）', () => {
    const r = calculateRecipe({
      base: 'sourdough-classic',
      numUnits: 1,
      selectedModifiers: [
        { id: 'cocoa', dose: 0.15 },      // 60g × 0.65 = 39g 吸水 + 12g 面筋补偿
        { id: 'flax-seed', dose: 0.08 },  // 32g × 1.0 = 32g
      ],
    });
    expect(r.actualHydration).toBeGreaterThan(0.78);
    expect(r.warnings.some((w) => w.includes('水合度'))).toBe(true);
  });
});

describe('calculateRecipe — dose 边界', () => {
  it('dose 超出 max 时被 clamp 并 warn', () => {
    const r = calculateRecipe({
      base: 'sourdough-classic',
      numUnits: 1,
      selectedModifiers: [{ id: 'matcha', dose: 0.20 }],   // 远超 max 0.06
    });
    const matcha = r.ingredients.find((i) => i.id === 'matcha');
    expect(matcha.weight).toBe(round(400 * 0.06));   // clamp 到 6%
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
    expect(groups['fold-3']?.some((i) => i.id === 'raisin')).toBe(true);
  });
});

describe('calculateFeed (sourdough only)', () => {
  it('60g seed + 80g needed + 60g buffer → 补 20g (10g flour + 10g water)', () => {
    const r = calculateRecipe({ base: 'sourdough-classic', numUnits: 1 });
    const feed = calculateFeed(r, 60);
    expect(feed.needed).toBe(80);
    // total target = 80 + 60 = 140；需补 140 - 60 = 80；flour = ceil(40), water = 40
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

  it('抹茶 4% → base 颜色向绿色偏移', () => {
    const base = { breadColor: { h: 38, s: 25, l: 82 } };
    const res = predictBreadColor(base, [{ id: 'matcha', dose: 0.04 }]);
    // h 应该落在 38 (暖白) 和 90 (matcha) 之间
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

// helper (模块内已导出 round，测试时直接引用)
function round(n) { return Math.round(n); }
