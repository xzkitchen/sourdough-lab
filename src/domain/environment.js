/**
 * Environment adjustment — room temperature handling for sourdough.
 *
 * This keeps seasonal guidance in domain code so UI components only render the
 * calculator result.
 */

const BASE_ROOM_TEMP_C = 24;
const MIN_ROOM_TEMP_C = 16;
const MAX_ROOM_TEMP_C = 34;

const round = (n) => Math.round(n);
const round1 = (n) => Math.round(n * 10) / 10;

export function normalizeRoomTempC(value, fallback = BASE_ROOM_TEMP_C) {
  const n = Number(value);
  const normalized = Number.isFinite(n) ? n : fallback;
  return Math.max(MIN_ROOM_TEMP_C, Math.min(MAX_ROOM_TEMP_C, round(normalized)));
}

export function getFermentationFactor(roomTempC) {
  const temp = normalizeRoomTempC(roomTempC);
  return Math.max(0.5, Math.min(1.6, round1(1 - (temp - BASE_ROOM_TEMP_C) * 0.05)));
}

export function buildEnvironmentAdjustment(environment = {}, base = null) {
  const roomTempC = normalizeRoomTempC(environment.roomTempC);
  const fermentationFactor = getFermentationFactor(roomTempC);
  const warmDelta = Math.max(0, roomTempC - BASE_ROOM_TEMP_C);
  const isWarm = roomTempC >= 26;
  const isHot = roomTempC >= 28;
  const isVeryHot = roomTempC >= 30;

  const targetDoughTempC = isVeryHot ? 23 : isHot ? 24 : isWarm ? 25 : 26;
  const targetWaterTempC = isVeryHot ? 0 : isHot ? 2 : isWarm ? 6 : 18;
  const bulkRiseTarget = isHot ? '30-50%' : isWarm ? '40-55%' : '50-75%';
  const label = isVeryHot ? '酷热' : isHot ? '夏季高温' : isWarm ? '偏暖' : '标准室温';

  const defaultBulkMinutes = base?.defaultBulkMinutes || 240;
  const bulkMinutesDelta = isWarm
    ? round(defaultBulkMinutes * (fermentationFactor - 1))
    : 0;

  const notes = [];
  const warnings = [];
  const stepTips = {};

  if (isWarm) {
    notes.push(
      `室温 ${roomTempC}°C：配方水量不变，改用 ${targetWaterTempC}-${targetWaterTempC + 2}°C 冰水，揉面结束面温控制在 ${targetDoughTempC}-${targetDoughTempC + 1}°C。`
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
    roomTempC,
    baseRoomTempC: BASE_ROOM_TEMP_C,
    label,
    isWarm,
    fermentationFactor,
    targetDoughTempC,
    targetWaterTempC,
    bulkRiseTarget,
    bulkMinutesDelta,
    proofMinutesDelta: 0,
    temperatureDelta: isWarm ? targetDoughTempC - 26 : 0,
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
