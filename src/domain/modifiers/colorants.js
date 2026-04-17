/**
 * Colorants — 天然色素/风味粉末
 *
 * 数据基于素材研究员汇总的烘焙学实证 (King Arthur, Perfect Loaf, MDPI 等)。
 *
 * Schema：
 *   id                  唯一标识
 *   name / nameLatin    显示名
 *   category            固定 'colorant'
 *   dose                {default, min, max} 相对 base flour 的占比
 *   hydrationAdjust     水合度调整
 *     method            'absorption' | 'soaking-liquid' | 'none'
 *     ratio             吸水倍率（相对自身重量）
 *   fermentationAdjust  发酵影响
 *     delayMinutes      主发酵延长（正）或缩短（负）
 *     sugarBoostGrams   建议额外加糖（单条基准）
 *     reason            中文理由
 *   glutenAdjust        面筋影响
 *     hydrationBonusPct 额外增加水合度百分比
 *     tip               操作提示
 *   breadColor          HSL {h, s, l} 用于面包切面预测
 *   flavor              风味标签
 *   worksWith           搭配建议（modifier id 或描述词）
 *   addStage            投料阶段
 *   warnings            警告字符串数组
 *   temperatureAdjust   烤制温度调整（°C）
 */

export const COLORANTS = [
  // ───────── 绿系 ─────────
  {
    id: 'matcha',
    name: '抹茶粉',
    nameLatin: 'Matcha',
    category: 'colorant',
    dose: { default: 0.04, min: 0.02, max: 0.06 },
    hydrationAdjust: { method: 'absorption', ratio: 0.35 },
    fermentationAdjust: {
      delayMinutes: 15,
      sugarBoostGrams: 2,
      reason: '咖啡因抑制酵母活性'
    },
    glutenAdjust: null,
    breadColor: { h: 90, s: 30, l: 62 },
    flavor: ['bitter', 'grassy', 'umami'],
    worksWith: ['white-chocolate', 'butter', 'honey'],
    addStage: 'mix',
    warnings: [],
    temperatureAdjust: 0,
  },
  {
    id: 'spirulina',
    name: '螺旋藻粉',
    nameLatin: 'Spirulina',
    category: 'colorant',
    dose: { default: 0.02, min: 0.015, max: 0.025 },
    hydrationAdjust: { method: 'absorption', ratio: 0.90 },
    fermentationAdjust: { delayMinutes: 5, sugarBoostGrams: 0, reason: '' },
    glutenAdjust: null,
    breadColor: { h: 160, s: 50, l: 50 },
    flavor: ['briny', 'marine'],
    worksWith: ['salt', 'butter'],
    addStage: 'mix',
    warnings: ['用量过多会有海草腥气'],
    temperatureAdjust: 0,
  },

  // ───────── 粉红/红系 ─────────
  {
    id: 'prickly-pear',                  // 吴老师点名
    name: '仙人果粉',
    nameLatin: 'Prickly Pear',
    category: 'colorant',
    dose: { default: 0.06, min: 0.03, max: 0.10 },
    hydrationAdjust: { method: 'absorption', ratio: 0.15 },
    fermentationAdjust: null,
    glutenAdjust: null,
    breadColor: { h: 340, s: 45, l: 70 },
    flavor: ['mild-sweet'],
    worksWith: ['yogurt', 'vanilla', 'coconut'],
    addStage: 'mix',
    warnings: ['焙烤时颜色会从粉色偏向橙色 (betalain 色素不耐热)'],
    temperatureAdjust: -10,              // 建议降温 10°C
  },
  {
    id: 'dragon-fruit',
    name: '火龙果粉',
    nameLatin: 'Dragon Fruit',
    category: 'colorant',
    dose: { default: 0.06, min: 0.03, max: 0.08 },
    hydrationAdjust: { method: 'absorption', ratio: 0.15 },
    fermentationAdjust: { delayMinutes: -10, sugarBoostGrams: 0, reason: '天然糖分加速发酵' },
    glutenAdjust: { hydrationBonusPct: 0, tip: '轻微削弱气孔保持力' },
    breadColor: { h: 335, s: 50, l: 72 },
    flavor: ['sweet'],
    worksWith: ['white-sugar', 'coconut', 'lime'],
    addStage: 'mix',
    warnings: ['烤后粉色会褪至橙色'],
    temperatureAdjust: -10,
  },
  {
    id: 'beetroot',
    name: '甜菜根粉',
    nameLatin: 'Beetroot',
    category: 'colorant',
    dose: { default: 0.06, min: 0.04, max: 0.08 },
    hydrationAdjust: { method: 'absorption', ratio: 0.35 },
    fermentationAdjust: null,
    glutenAdjust: null,
    breadColor: { h: 345, s: 55, l: 42 },
    flavor: ['earthy', 'mild-sweet'],
    worksWith: ['goat-cheese', 'rosemary', 'walnut'],
    addStage: 'mix',
    warnings: [],
    temperatureAdjust: 0,
  },
  {
    id: 'red-yeast-rice',
    name: '红曲粉',
    nameLatin: 'Red Yeast Rice',
    category: 'colorant',
    dose: { default: 0.025, min: 0.02, max: 0.03 },
    hydrationAdjust: { method: 'absorption', ratio: 0.10 },
    fermentationAdjust: { delayMinutes: -5, sugarBoostGrams: 0, reason: '轻微酸性加速发酵' },
    glutenAdjust: null,
    breadColor: { h: 5, s: 60, l: 38 },
    flavor: ['neutral'],
    worksWith: ['brown-sugar', 'osmanthus'],
    addStage: 'mix',
    warnings: [],
    temperatureAdjust: 0,
  },

  // ───────── 紫/蓝系 ─────────
  {
    id: 'purple-sweet-potato',
    name: '紫薯粉',
    nameLatin: 'Purple Sweet Potato',
    category: 'colorant',
    dose: { default: 0.08, min: 0.05, max: 0.10 },
    hydrationAdjust: { method: 'absorption', ratio: 0.50 },
    fermentationAdjust: { delayMinutes: 5, sugarBoostGrams: 0, reason: '轻微延缓' },
    glutenAdjust: null,
    breadColor: { h: 280, s: 35, l: 48 },
    flavor: ['mild-sweet', 'starchy'],
    worksWith: ['black-sesame', 'butter', 'honey'],
    addStage: 'mix',
    warnings: [],
    temperatureAdjust: 0,
  },
  {
    id: 'butterfly-pea',
    name: '蝶豆花粉',
    nameLatin: 'Butterfly Pea',
    category: 'colorant',
    dose: { default: 0.04, min: 0.03, max: 0.05 },
    hydrationAdjust: { method: 'absorption', ratio: 0.25 },
    fermentationAdjust: null,
    glutenAdjust: null,
    breadColor: { h: 225, s: 55, l: 55 },
    flavor: ['grassy', 'mild'],
    worksWith: ['lemon', 'honey', 'vanilla'],
    addStage: 'mix',
    warnings: ['遇酸（柠檬汁）会变紫或粉'],
    temperatureAdjust: 0,
  },

  // ───────── 棕/黑系 ─────────
  {
    id: 'cocoa',
    name: '可可粉',
    nameLatin: 'Cocoa',
    category: 'colorant',
    dose: { default: 0.10, min: 0.05, max: 0.15 },
    hydrationAdjust: { method: 'absorption', ratio: 0.65 },
    fermentationAdjust: null,
    glutenAdjust: { hydrationBonusPct: 3, tip: '单宁会收紧面筋，建议多加 3% 水或缩短 kneading' },
    breadColor: { h: 22, s: 35, l: 20 },
    flavor: ['bitter', 'chocolate'],
    worksWith: ['sugar', 'milk', 'salt', 'coffee'],
    addStage: 'mix',
    warnings: ['可能降低 oven spring'],
    temperatureAdjust: 0,
  },
  {
    id: 'squid-ink',
    name: '墨鱼汁',
    nameLatin: 'Squid Ink',
    category: 'colorant',
    dose: { default: 0.015, min: 0.01, max: 0.02 },   // 液体，g of flour
    hydrationAdjust: { method: 'absorption', ratio: 0.05 },  // 本身就是液体，不额外吸水
    fermentationAdjust: null,
    glutenAdjust: null,
    breadColor: { h: 0, s: 0, l: 8 },
    flavor: ['briny', 'umami'],
    worksWith: ['salt', 'seafood', 'olive-oil'],
    addStage: 'mix',
    warnings: ['咸度会叠加，基础盐酌减 0.3%'],
    temperatureAdjust: 0,
  },
  {
    id: 'bamboo-charcoal',
    name: '竹炭粉',
    nameLatin: 'Bamboo Charcoal',
    category: 'colorant',
    dose: { default: 0.015, min: 0.01, max: 0.02 },
    hydrationAdjust: { method: 'absorption', ratio: 0.05 },
    fermentationAdjust: null,
    glutenAdjust: null,
    breadColor: { h: 0, s: 0, l: 12 },
    flavor: ['neutral'],
    worksWith: ['cheese', 'garlic'],
    addStage: 'mix',
    warnings: [],
    temperatureAdjust: 0,
  },

  // ───────── 橙/黄系 ─────────
  {
    id: 'pumpkin',
    name: '南瓜粉',
    nameLatin: 'Pumpkin',
    category: 'colorant',
    dose: { default: 0.10, min: 0.08, max: 0.12 },
    hydrationAdjust: { method: 'absorption', ratio: 0.70 },
    fermentationAdjust: { delayMinutes: -5, sugarBoostGrams: 0, reason: '天然糖轻微加速' },
    glutenAdjust: null,
    breadColor: { h: 28, s: 55, l: 62 },
    flavor: ['sweet', 'earthy'],
    worksWith: ['cinnamon', 'ginger', 'brown-sugar'],
    addStage: 'mix',
    warnings: [],
    temperatureAdjust: 0,
  },
  {
    id: 'turmeric',
    name: '姜黄粉',
    nameLatin: 'Turmeric',
    category: 'colorant',
    dose: { default: 0.025, min: 0.02, max: 0.03 },
    hydrationAdjust: { method: 'absorption', ratio: 0.15 },
    fermentationAdjust: null,
    glutenAdjust: null,
    breadColor: { h: 42, s: 75, l: 62 },
    flavor: ['mild-spice', 'earthy'],
    worksWith: ['black-pepper', 'olive-oil', 'honey'],
    addStage: 'mix',
    warnings: [],
    temperatureAdjust: 0,
  },
];

export const COLORANTS_BY_ID = Object.fromEntries(
  COLORANTS.map((c) => [c.id, c])
);

export function getColorant(id) {
  return COLORANTS_BY_ID[id] || null;
}
