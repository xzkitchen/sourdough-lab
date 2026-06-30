import { describe, it, expect } from 'vitest';
import { peakHours, pickFeedRatio, planRevival, planTimedFeed } from '../feeding.js';

describe('peakHours — 比例→达峰时间 (锚定 KA @26°C)', () => {
  it('命中 KA 三个锚点 @26°C', () => {
    expect(peakHours(1, 26)).toBeCloseTo(4, 1); // 1:1:1 → ~4h
    expect(peakHours(2, 26)).toBeCloseTo(8, 1); // 1:2:2 → ~8h
    expect(peakHours(4, 26)).toBeCloseTo(12, 1); // 1:4:4 → ~12h
  });

  it('冷房达峰更慢（同比例，温度更低 → 时间更长）', () => {
    expect(peakHours(2, 22)).toBeGreaterThan(peakHours(2, 26));
  });
});

describe('pickFeedRatio — 窗口+室温 → 比例', () => {
  it('8 小时窗口 @26°C → 1:2:2（r=2），预计 ~8h 达峰', () => {
    const p = pickFeedRatio(8, 26);
    expect(p.r).toBe(2);
    expect(p.expectedPeakHours).toBeCloseTo(8, 0);
  });

  it('4h→r=1，12h→r=4 @26°C', () => {
    expect(pickFeedRatio(4, 26).r).toBe(1);
    expect(pickFeedRatio(12, 26).r).toBe(4);
  });

  it('同样 8h 窗口，冷房需要更浓的比例（r 更小）才能卡住', () => {
    expect(pickFeedRatio(8, 22).r).toBeLessThan(2);
  });
});

describe('planTimedFeed — 吴老师场景：22:00 喂 → 06:00 达峰', () => {
  it('8h 窗口 / 目标熟种 260g / 26°C / 旧种充足 85g', () => {
    const plan = planTimedFeed({
      targetRipe: 260,
      windowHours: 8,
      roomTempC: 26,
      availableGrams: 85,
    });
    expect(plan.ratio).toBe(2); // 1:2:2
    expect(plan.carryover).toBe(52); // 260 ÷ (1+2×2) = 52
    expect(plan.flour).toBe(104); // 52 × 2
    expect(plan.water).toBe(104);
    expect(plan.totalRipe).toBe(260); // 52 + 104 + 104
    expect(plan.discard).toBe(33); // 85 − 52
    expect(plan.notEnough).toBe(false);
  });

  it('旧种不够目标 carryover 时标记 notEnough', () => {
    const plan = planTimedFeed({
      targetRipe: 260,
      windowHours: 8,
      roomTempC: 26,
      availableGrams: 40, // < carryover 52
    });
    expect(plan.notEnough).toBe(true);
    expect(plan.discard).toBe(0);
  });
});

describe('planRevival — 状态感知复活', () => {
  it('健康待唤醒：一轮 1:2:2，罐里只取少量，其余丢弃', () => {
    const plan = planRevival({ stateId: 'wake', availableGrams: 80 });
    expect(plan.state.name).toBe('健康待唤醒');
    expect(plan.rounds).toHaveLength(1);
    expect(plan.rounds[0]).toMatchObject({
      ratio: 2,
      carryover: 20,
      flour: 40,
      water: 40,
      total: 100,
      discard: 60,
    });
    expect(plan.notEnough).toBe(false);
  });

  it('微饿：两轮高稀释，第二轮从上一轮峰值熟种里再取少量', () => {
    const plan = planRevival({ stateId: 'hungry', availableGrams: 60 });
    expect(plan.rounds).toHaveLength(2);
    expect(plan.rounds[0]).toMatchObject({ ratio: 4, carryover: 15, total: 135, discard: 45 });
    expect(plan.rounds[1]).toMatchObject({ ratio: 4, carryover: 15, total: 135, discard: 120 });
    expect(plan.totalHours).toBe(20);
  });

  it('休眠：三轮 1:5:5，并保留污染红线提示', () => {
    const plan = planRevival({ stateId: 'dormant', availableGrams: 30 });
    expect(plan.rounds).toHaveLength(3);
    expect(plan.rounds[0]).toMatchObject({ ratio: 5, carryover: 10, total: 110, discard: 20 });
    expect(plan.redline).toMatch(/发霉/);
  });

  it('少于 5g 时标记 notEnough', () => {
    const plan = planRevival({ stateId: 'wake', availableGrams: 3 });
    expect(plan.notEnough).toBe(true);
    expect(plan.rounds[0].carryover).toBe(3);
  });
});
