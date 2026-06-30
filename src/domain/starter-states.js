/**
 * Starter states — 复活状态档案（纯数据）
 *
 * 只描述酸种状态和复活协议；UI 负责展示。
 * 红线不做成可选状态：发霉 / 腐臭时不要复活，直接重做。
 */

export const STARTER_STATES = [
  {
    id: 'wake',
    order: '01',
    name: '健康待唤醒',
    nameEn: 'Wake',
    symptom: '冷藏一周内，酸香正常，有少量 hooch',
    ratio: 2,
    rounds: 1,
    carryoverGrams: 20,
    intervalHours: 8,
    tempRange: '25-27°C',
    goal: '4-8h 明显翻倍，气味回到酸甜',
    note: '状态还健康，不需要强稀释；一轮唤醒后即可进入定时喂养。',
  },
  {
    id: 'hungry',
    order: '02',
    name: '微饿',
    nameEn: 'Hungry',
    symptom: '7-15 天未喂，酸味浓、塌陷明显',
    ratio: 4,
    rounds: 2,
    carryoverGrams: 15,
    intervalHours: 10,
    tempRange: '25-28°C',
    goal: '第二轮能在 6-8h 翻倍并保持峰值',
    note: '先降低酸度，再看活力；不要一次直接喂到面团目标量。',
  },
  {
    id: 'dormant',
    order: '03',
    name: '休眠',
    nameEn: 'Dormant',
    symptom: '15 天以上未喂，强酸、分层、活力弱',
    ratio: 5,
    rounds: 3,
    carryoverGrams: 10,
    intervalHours: 12,
    tempRange: '25-28°C',
    goal: '连续两轮 4-8h 翻倍后再用于面团',
    note: '高稀释多轮复活；每轮只留少量，酸度降下来比总量更重要。',
  },
];

export const STARTER_STATE_BY_ID = Object.fromEntries(
  STARTER_STATES.map((state) => [state.id, state])
);

export function getStarterState(id) {
  return STARTER_STATE_BY_ID[id] || STARTER_STATES[0];
}
