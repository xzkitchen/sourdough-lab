/**
 * Colorants — 有权威来源支撑的色粉
 *
 * 每条都引用可核查的烘焙书或官方 URL。无权威来源的已剔除
 * （原有：仙人果粉、火龙果粉、红曲粉、螺旋藻、蝶豆花、墨鱼汁、
 *  竹炭粉、紫薯粉 — 均因缺少大师级出处被移除）。
 *
 * Schema 额外字段：
 *   source  { name, url }   权威来源（书名 / 官方 URL）
 */

export const COLORANTS = [
  {
    id: 'cocoa',
    name: '可可粉',
    nameLatin: 'Cocoa',
    category: 'colorant',
    dose: { default: 0.04, min: 0.03, max: 0.10 },
    preTreatment: 'sift',
    hydrationAdjust: { method: 'absorption', ratio: 0.65 },
    fermentationAdjust: null,
    glutenAdjust: {
      reason: '单宁收紧面筋',
      tip: '单宁收紧面筋；水合度 +3% 补偿',
      hydrationBonusPct: 3,
    },
    breadColor: { h: 20, s: 40, l: 35 },
    flavor: ['bitter', 'roasty', 'chocolate'],
    worksWith: ['chocolate-chips', 'cranberry'],
    addStage: 'mix',
    warnings: ['可可含单宁，会收紧面筋；与水先拌匀再加入面粉'],
    source: {
      name: 'King Arthur — Chocolate Sourdough',
      url: 'https://www.kingarthurbaking.com/recipes/chocolate-sourdough-bread-recipe',
    },
  },
  {
    id: 'matcha',
    name: '抹茶粉',
    nameLatin: 'Matcha',
    category: 'colorant',
    dose: { default: 0.029, min: 0.02, max: 0.05 },
    preTreatment: 'sift',
    hydrationAdjust: { method: 'absorption', ratio: 0.80 },
    fermentationAdjust: {
      delayMinutes: 15,
      sugarBoostGrams: 2,
      reason: '咖啡因轻度抑制酵母',
    },
    glutenAdjust: null,
    breadColor: { h: 90, s: 30, l: 62 },
    flavor: ['grassy', 'bitter', 'umami'],
    worksWith: ['white-chocolate', 'cinnamon'],
    addStage: 'mix',
    warnings: ['高温烤制会让抹茶色发黄；控制烤温 ≤ 220°C 保色'],
    source: {
      name: 'King Arthur — Marbled Matcha Milk Bread (adapted)',
      url: 'https://www.kingarthurbaking.com/recipes/marbled-matcha-milk-bread-recipe',
    },
  },
  {
    id: 'turmeric',
    name: '姜黄粉',
    nameLatin: 'Turmeric',
    category: 'colorant',
    dose: { default: 0.015, min: 0.01, max: 0.02 },
    preTreatment: null,
    hydrationAdjust: { method: 'absorption', ratio: 0.50 },
    fermentationAdjust: null,
    glutenAdjust: null,
    breadColor: { h: 42, s: 60, l: 55 },
    flavor: ['earthy', 'warm-spice'],
    worksWith: ['sunflower-seed'],
    addStage: 'mix',
    warnings: ['用量超过 2% 会明显发苦'],
    source: {
      name: 'sourdoughbread.ca — How to Add Colour',
      url: 'https://sourdoughbread.ca/how-to-add-colour',
    },
  },
  {
    id: 'beetroot',
    name: '甜菜根粉',
    nameLatin: 'Beetroot',
    category: 'colorant',
    dose: { default: 0.04, min: 0.03, max: 0.06 },
    preTreatment: null,
    hydrationAdjust: { method: 'absorption', ratio: 0.70 },
    fermentationAdjust: null,
    glutenAdjust: null,
    breadColor: { h: 340, s: 45, l: 45 },
    flavor: ['earthy', 'sweet'],
    worksWith: ['walnut'],
    addStage: 'mix',
    warnings: ['betalain 色素高温易褪色；建议烤温 ≤ 220°C'],
    source: {
      name: 'sourdoughbread.ca — How to Add Colour',
      url: 'https://sourdoughbread.ca/how-to-add-colour',
    },
  },
  {
    id: 'pumpkin',
    name: '南瓜粉',
    nameLatin: 'Pumpkin',
    category: 'colorant',
    dose: { default: 0.08, min: 0.06, max: 0.12 },
    preTreatment: null,
    hydrationAdjust: { method: 'absorption', ratio: 0.70 },
    fermentationAdjust: null,
    glutenAdjust: null,
    breadColor: { h: 28, s: 55, l: 60 },
    flavor: ['mild-sweet', 'autumnal'],
    worksWith: ['cinnamon', 'pumpkin-seed', 'walnut'],
    addStage: 'mix',
    warnings: [],
    source: {
      name: 'The Perfect Loaf — Pumpkin Cinnamon Sourdough',
      url: 'https://www.theperfectloaf.com/pumpkin-cinnamon-sourdough-bread/',
    },
  },
  {
    id: 'cinnamon',
    name: '肉桂粉',
    nameLatin: 'Cinnamon',
    category: 'colorant',
    dose: { default: 0.012, min: 0.008, max: 0.020 },
    preTreatment: null,
    hydrationAdjust: { method: 'absorption', ratio: 0.35 },
    fermentationAdjust: null,
    glutenAdjust: null,
    breadColor: { h: 24, s: 40, l: 55 },
    flavor: ['warm-spice', 'sweet'],
    worksWith: ['raisin', 'pumpkin', 'walnut'],
    addStage: 'mix',
    warnings: [],
    source: {
      name: 'King Arthur — Sourdough Cinnamon Raisin',
      url: 'https://www.kingarthurbaking.com/recipes/sourdough-cinnamon-raisin-bread-recipe',
    },
  },
];

export const COLORANTS_BY_ID = Object.fromEntries(
  COLORANTS.map((c) => [c.id, c])
);

export function getColorant(id) {
  return COLORANTS_BY_ID[id] || null;
}
