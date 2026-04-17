/**
 * Flavors — 创意预设组合（"Chef's picks" / 实验室推荐）
 *
 * 每个 flavor 指向一组 modifier id + 推荐 dose，UI 上作为一键套用的入口。
 * 所有引用的 modifier id 必须在 colorants.js 或 addins.js 中存在。
 *
 * 新增 preset 时，确保风味/色彩在烘焙学上合理。
 */

export const FLAVORS = [
  {
    id: 'plain',
    name: '原味',
    nameLatin: 'Plain',
    description: '最纯粹的乡村酸种，T65 面粉 + 鲁邦种 + 盐，无任何修饰',
    modifiers: [],
    heroHue: 38,   // HSL hue 提示，用于预览色带
  },
  {
    id: 'matcha-grass',
    name: '抹茶草本',
    nameLatin: 'Matcha Grass',
    description: '4% 抹茶粉，鲜绿切面，苦韵与麦香',
    modifiers: [
      { id: 'matcha', dose: 0.04 },
    ],
    heroHue: 90,
  },
  {
    id: 'prickly-pear-pink',
    name: '仙人果淡粉',
    nameLatin: 'Prickly Pear Pink',
    description: '6% 仙人果粉，柔粉切面（烤后渐橙），微甜与麦香',
    modifiers: [
      { id: 'prickly-pear', dose: 0.06 },
    ],
    heroHue: 340,
  },
  {
    id: 'cocoa-cranberry-walnut',
    name: '可可蔓越莓核桃',
    nameLatin: 'Cocoa × Cran × Walnut',
    description: '深棕切面，红蔓越莓点缀 + 核桃碎粒，早餐法国三重奏',
    modifiers: [
      { id: 'cocoa',     dose: 0.08 },
      { id: 'cranberry', dose: 0.10 },
      { id: 'walnut',    dose: 0.10 },
    ],
    heroHue: 22,
  },
  {
    id: 'tomato-basil',
    name: '番茄罗勒',
    nameLatin: 'Tomato × Basil',
    description: '地中海风格，风干番茄 + 罗勒碎',
    modifiers: [
      { id: 'sundried-tomato', dose: 0.08 },
      { id: 'basil',           dose: 0.0075 },
    ],
    heroHue: 10,
  },
  {
    id: 'purple-sesame',
    name: '紫薯黑芝麻',
    nameLatin: 'Purple × Sesame',
    description: '紫薯粉的温柔淡紫 + 芝麻粒点缀',
    modifiers: [
      { id: 'purple-sweet-potato', dose: 0.08 },
      { id: 'sesame',              dose: 0.04 },
    ],
    heroHue: 280,
  },
  {
    id: 'squid-cheddar',
    name: '墨鱼车达',
    nameLatin: 'Squid × Cheddar',
    description: '黑底面团镶橙黄奶酪，视觉最强对比',
    modifiers: [
      { id: 'squid-ink', dose: 0.015 },
      { id: 'cheddar',   dose: 0.08 },
    ],
    heroHue: 0,
  },
  {
    id: 'charcoal-olive',
    name: '竹炭橄榄',
    nameLatin: 'Charcoal × Olive',
    description: '深灰切面 + 绿橄榄丁，烟熏地中海风',
    modifiers: [
      { id: 'bamboo-charcoal', dose: 0.015 },
      { id: 'olive',           dose: 0.08 },
    ],
    heroHue: 0,
  },
  {
    id: 'turmeric-pumpkin',
    name: '姜黄南瓜',
    nameLatin: 'Turmeric × Pumpkin',
    description: '金黄橙色，秋日温暖的姜黄 + 南瓜籽',
    modifiers: [
      { id: 'turmeric',     dose: 0.025 },
      { id: 'pumpkin-seed', dose: 0.08 },
    ],
    heroHue: 40,
  },
];

export const FLAVORS_BY_ID = Object.fromEntries(
  FLAVORS.map((f) => [f.id, f])
);

export function getFlavor(id) {
  return FLAVORS_BY_ID[id] || null;
}
