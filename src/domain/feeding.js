/**
 * Feeding planner — 喂养规划器纯函数（零 React 导入）
 *
 * 比例↔达峰时间锚点：King Arthur 实测 @26°C
 *   1:1:1≈4h, 1:2:2≈8h, 1:4:4≈12h
 * 拟合：peakHours = 4 × (1 + log2(r)) @26°C（完美过这三个锚点）
 * 反查：r = 2^(等效26°C窗口 / 4 − 1)
 * 温度：每偏离 1°C 约 ±5% 发酵时长（与 environment.js 同口径），锚定测量温度 26°C
 *
 * 来源：
 *   King Arthur — Testing different sourdough feeding ratios
 *   https://www.kingarthurbaking.com/blog/2025/03/13/sourdough-feeding-ratios
 */

import { getStarterState } from './starter-states.js';

const ANCHOR_TEMP_C = 26;
const ANCHOR_BASE_HOURS = 4; // 1:1:1 @26°C 的达峰时间
const TEMP_PCT_PER_DEG = 0.05;

const round = (n) => Math.round(n);
const round1 = (n) => Math.round(n * 10) / 10;
const roundHalf = (n) => Math.round(n * 2) / 2;

/** 温度因子：相对 26°C，冷 → >1（发酵更慢、达峰更久） */
export function tempFactor(roomTempC = ANCHOR_TEMP_C) {
  return 1 + TEMP_PCT_PER_DEG * (ANCHOR_TEMP_C - roomTempC);
}

/** 由喂养比例 r（种:粉:水 = 1:r:r）预测达峰小时 */
export function peakHours(r, roomTempC = ANCHOR_TEMP_C) {
  return ANCHOR_BASE_HOURS * (1 + Math.log2(r)) * tempFactor(roomTempC);
}

/**
 * 由目标时间窗口 + 室温反查喂养比例 r（四舍五入到 0.5 档，clamp 到 [0.5, 6]）
 * @param {number} windowHours  从喂养到希望达峰的小时数
 * @param {number} roomTempC    室温
 * @returns {{ r:number, expectedPeakHours:number, clamped:boolean }}
 */
export function pickFeedRatio(windowHours, roomTempC = ANCHOR_TEMP_C, { minR = 0.5, maxR = 6 } = {}) {
  const equiv26 = windowHours / tempFactor(roomTempC); // 折回 26°C 等效窗口
  const raw = Math.pow(2, equiv26 / ANCHOR_BASE_HOURS - 1);
  const rounded = roundHalf(raw);
  const r = Math.min(maxR, Math.max(minR, rounded));
  return {
    r,
    expectedPeakHours: round1(peakHours(r, roomTempC)),
    clamped: r !== rounded,
  };
}

/**
 * 定时喂养方案：按「目标熟种量 + 时间窗口 + 室温」算出 取/加/弃
 *
 * @param {Object} p
 * @param {number} p.targetRipe       想要的达峰熟种总量 g（= 面团需求 + 留种）
 * @param {number} p.windowHours      从喂到达峰的小时数
 * @param {number} [p.roomTempC=26]   室温
 * @param {number|null} [p.availableGrams=null]  现有旧种 g（用于算弃种 / 判断够不够）
 * @returns {{ ratio, carryover, flour, water, totalRipe, expectedPeakHours, discard, notEnough }}
 */
export function planTimedFeed({ targetRipe, windowHours, roomTempC = ANCHOR_TEMP_C, availableGrams = null }) {
  const pick = pickFeedRatio(windowHours, roomTempC);
  const r = pick.r;
  const carryover = round(targetRipe / (1 + 2 * r));
  const flour = round(carryover * r);
  const water = round(carryover * r);
  const totalRipe = carryover + flour + water;
  const notEnough = availableGrams != null && availableGrams < carryover;
  const discard = availableGrams != null ? Math.max(0, availableGrams - carryover) : null;

  return {
    ratio: r,
    availableGrams,
    carryover,
    flour,
    water,
    totalRipe,
    expectedPeakHours: pick.expectedPeakHours,
    discard,
    notEnough,
  };
}

/**
 * 复活方案：按状态档案生成多轮高稀释时间线。
 *
 * 第一轮从罐里取少量旧种，其余丢弃；后续每轮从上一轮峰值熟种里
 * 再取少量继续喂，直到状态目标满足。只有发霉 / 腐臭属于红线，不进本函数。
 *
 * @param {Object} p
 * @param {string} p.stateId
 * @param {number} p.availableGrams  罐里现有旧种 g
 * @returns {{ state, rounds, totalHours, notEnough, redline }}
 */
export function planRevival({ stateId = 'wake', availableGrams = 0 }) {
  const state = getStarterState(stateId);
  const minUsable = 5;
  const safeAvailable = Math.max(0, round(availableGrams || 0));
  const notEnough = safeAvailable < minUsable;
  const rounds = [];

  let sourceAvailable = safeAvailable;
  for (let i = 1; i <= state.rounds; i += 1) {
    const desiredCarryover = state.carryoverGrams;
    const carryover = i === 1
      ? Math.min(desiredCarryover, sourceAvailable)
      : desiredCarryover;
    const flour = round(carryover * state.ratio);
    const water = round(carryover * state.ratio);
    const total = carryover + flour + water;
    const discard = i === 1
      ? Math.max(0, sourceAvailable - carryover)
      : Math.max(0, sourceAvailable - carryover);

    rounds.push({
      n: i,
      ratio: state.ratio,
      carryover,
      flour,
      water,
      total,
      discard,
      waitHours: state.intervalHours,
      tempRange: state.tempRange,
    });

    sourceAvailable = total;
  }

  return {
    state,
    rounds,
    totalHours: state.rounds * state.intervalHours,
    notEnough,
    redline: '发霉 / 粉红或橙色斑点 / 腐臭味：不要复活，直接重做。',
  };
}
