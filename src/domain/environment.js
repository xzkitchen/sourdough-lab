/**
 * Environment adjustment — seasonal handling for sourdough.
 *
 * UI exposes a simple standard/summer mode. Domain keeps the actual numbers so
 * components do not hard-code baking rules.
 */

export const ENVIRONMENT_MODES = {
  standard: {
    id: 'standard',
    label: '标准',
    labelLatin: 'Standard',
    roomTempC: 24,
  },
  summer: {
    id: 'summer',
    label: '夏季',
    labelLatin: 'Summer',
    roomTempC: 28,
  },
};

const BASE_ROOM_TEMP_C = ENVIRONMENT_MODES.standard.roomTempC;
const SUMMER_ROOM_TEMP_C = ENVIRONMENT_MODES.summer.roomTempC;
const MIN_ROOM_TEMP_C = 16;
const MAX_ROOM_TEMP_C = 34;

const round = (n) => Math.round(n);
const round1 = (n) => Math.round(n * 10) / 10;

export function normalizeRoomTempC(value, fallback = BASE_ROOM_TEMP_C) {
  const n = Number(value);
  const normalized = Number.isFinite(n) ? n : fallback;
  return Math.max(MIN_ROOM_TEMP_C, Math.min(MAX_ROOM_TEMP_C, round(normalized)));
}

export function normalizeEnvironmentMode(mode) {
  return mode === ENVIRONMENT_MODES.summer.id
    ? ENVIRONMENT_MODES.summer.id
    : ENVIRONMENT_MODES.standard.id;
}

export function getFermentationFactor(roomTempC) {
  const temp = normalizeRoomTempC(roomTempC);
  return Math.max(0.5, Math.min(1.6, round1(1 - (temp - BASE_ROOM_TEMP_C) * 0.05)));
}

export function buildEnvironmentAdjustment(environment = {}, base = null) {
  const mode = normalizeEnvironmentMode(
    environment.mode || (Number(environment.roomTempC) >= 26 ? 'summer' : 'standard')
  );
  const roomTempC = mode === 'summer' ? SUMMER_ROOM_TEMP_C : BASE_ROOM_TEMP_C;
  const fermentationFactor = getFermentationFactor(roomTempC);
  const isSummer = mode === 'summer';

  const targetDoughTempC = isSummer ? 24 : 26;
  const targetWaterTempC = isSummer ? 2 : 18;
  const bulkRiseTarget = isSummer ? '30-50%' : '50-75%';
  const label = ENVIRONMENT_MODES[mode].label;

  const defaultBulkMinutes = base?.defaultBulkMinutes || 240;
  const bulkMinutesDelta = isSummer
    ? round(defaultBulkMinutes * (fermentationFactor - 1))
    : 0;

  const notes = [];
  const warnings = [];
  const stepTips = {};

  const actions = isSummer
    ? [
        { id: 'water', label: '冰水', value: `${targetWaterTempC}-${targetWaterTempC + 2}°C` },
        { id: 'dough', label: '面温', value: `${targetDoughTempC}-${targetDoughTempC + 1}°C` },
        { id: 'bulk', label: '一发', value: bulkRiseTarget },
      ]
    : [
        { id: 'water', label: '水温', value: '18-22°C' },
        { id: 'dough', label: '面温', value: '≤26°C' },
        { id: 'bulk', label: '一发', value: bulkRiseTarget },
      ];

  if (isSummer) {
    notes.push(
      `夏季模式：配方克数不变；用 ${targetWaterTempC}-${targetWaterTempC + 2}°C 冰水，揉面结束面温控制在 ${targetDoughTempC}-${targetDoughTempC + 1}°C。`
    );
    notes.push(
      `发酵速度约为标准室温的 ${round(100 / fermentationFactor)}%，一发目标改看体积增长 ${bulkRiseTarget}，不要按固定时长等到原配方上限。`
    );
    warnings.push(
      `夏季高温：若面温超过 26°C，停机把面团摊薄冷藏 10-15 分钟；继续高速打面会让面筋更松、更粘。`
    );
    warnings.push(
      `夏季高温：鲁邦种峰值刚到就用，避免过熟偏酸削弱面筋；收包偏软时提前预整。`
    );

    stepTips.knead = [
      `夏季控制：揉面结束量一次面温，目标 ${targetDoughTempC}-${targetDoughTempC + 1}°C，超过 26°C 先冷藏降温再继续。`,
      '冰袋只能降缸壁温度，面粉、鲁邦种和机器摩擦仍会升温；优先用冰水控制最终面温。',
    ];
    stepTips.bulk_final = [
      `夏季一发：体积增长 ${bulkRiseTarget} 即可准备预整，边缘开始变圆、有轻微晃动就收。`,
      '不要等到明显塌边或强烈酸味；那时面筋已经被高温发酵拖弱。',
    ];
  }

  return {
    mode,
    roomTempC,
    baseRoomTempC: BASE_ROOM_TEMP_C,
    label,
    isWarm: isSummer,
    isSummer,
    fermentationFactor,
    targetDoughTempC,
    targetWaterTempC,
    bulkRiseTarget,
    actions,
    bulkMinutesDelta,
    proofMinutesDelta: 0,
    temperatureDelta: isSummer ? targetDoughTempC - 26 : 0,
    notes,
    warnings,
    stepTips,
  };
}

export function formatAdjustedStepTime(step, minutes) {
  if (step.timeUnit?.includes('小时') && minutes >= 90) {
    const hours = round1(minutes / 60);
    return {
      timeValue: Number.isInteger(hours) ? String(hours) : String(hours),
      timeUnit: step.timeUnit,
    };
  }

  return {
    timeValue: String(minutes),
    timeUnit: step.timeUnit || '分钟',
  };
}
