/**
 * Flavors — 大师级创意预设（健康路线，6 款精选）
 *
 * 设计约束（xizai 个人偏好）：
 *   1) 不含核桃（walnut）——任何涉及核桃的配方已剔除
 *   2) 不加糖——不使用巧克力豆（添加糖）、甜蔓越莓干（添加糖）等；
 *      也排除天然高糖干果（无花果干 ~48%、葡萄干 ~59% 天然糖）
 *   3) 健康优先——种子 / 香料 / 蔬菜色粉 / 橄榄 / 坚果，避免糖和精炼甜味
 *   4) 不重复——每个 modifier 在保留风味中尽量只出现一次
 *
 * 注：walnut / cranberry / chocolate-chips / matcha / turmeric / beetroot /
 *     fennel-seed / jalapeno / cheddar / fig / raisin 等 modifier 仍保留在
 *     addins.js / colorants.js 里（词汇表完整性 + 测试依赖），
 *     但不会出现在任何 FLAVOR 预设中。
 *
 * 每条都有可核查的权威来源（master 烘焙书 / 官方 URL / 成名博客）。
 *
 * Schema 额外字段：
 *   source    { name, author?, url }
 *   difficulty 'beginner' | 'intermediate' | 'advanced'
 *   note       简短作者说明 / 健康亮点（中文）
 */

export const FLAVORS = [
  {
    id: 'plain',
    name: '原味',
    nameLatin: 'Country Bread',
    description: '最纯粹的乡村酸种，T65 + 鲁邦种 + 盐。',
    modifiers: [],
    heroHue: 38,
    difficulty: 'beginner',
    source: {
      name: 'Tartine Bread',
      author: 'Chad Robertson',
      url: 'https://www.amazon.com/Tartine-Bread-Chad-Robertson/dp/0811870413',
    },
    note: 'Robertson 经典 75% 水合配方；新手可从 70% 起步。无任何添加，发酵风味最纯。',
  },
  {
    id: 'olive-rosemary',
    name: '橄榄迷迭香',
    nameLatin: 'Olive & Rosemary Levain',
    description: 'Kalamata 橄榄 10% + 迷迭香 1%，地中海经典。',
    modifiers: [
      { id: 'olive', dose: 0.10 },
      { id: 'rosemary', dose: 0.01 },
    ],
    heroHue: 80,
    difficulty: 'intermediate',
    source: {
      name: 'Tartine Bread — Olive & Rosemary variation',
      author: 'Chad Robertson',
      url: 'https://www.amazon.com/Tartine-Bread-Chad-Robertson/dp/0811870413',
    },
    note: '橄榄带盐，基础盐减 0.2%。橄榄油单元不饱和脂肪 + 迷迭香萜类抗氧化。',
  },
  {
    id: 'seeded',
    name: '混合种子',
    nameLatin: 'Seeded Sourdough',
    description: '南瓜籽 + 葵花籽 + 芝麻 各 5%，综合坚果谷物香。',
    modifiers: [
      { id: 'pumpkin-seed', dose: 0.05 },
      { id: 'sunflower-seed', dose: 0.05 },
      { id: 'sesame', dose: 0.05 },
    ],
    heroHue: 38,
    difficulty: 'intermediate',
    source: {
      name: 'The Perfect Loaf — Seeded Sourdough',
      author: 'Maurizio Leo',
      url: 'https://www.theperfectloaf.com/seeded-sourdough/',
    },
    note: '种子烤过香气更浓；最后一次折叠时加入。三种子协同提供锌、镁、维 E 和高纤维。',
  },
  {
    id: 'pumpkin-cinnamon',
    name: '南瓜肉桂',
    nameLatin: 'Pumpkin Cinnamon',
    description: '南瓜 8% + 肉桂 1.2%，秋日温暖金橙色。',
    modifiers: [
      { id: 'pumpkin', dose: 0.08 },
      { id: 'cinnamon', dose: 0.012 },
    ],
    // pumpkin + cinnamon 的 breadColor 都挤在 h24-28 窄色带，默认渲染看起来像纯色。
    // 这里补 3 个**同色系但明度拉开**的装饰色点，模拟真实切面的 crust 焦糖 /
    // crumb 气孔 / 肉桂深褐 streak。全部在 h18-40 暖色段，不会出现冷色。
    orbAccents: [
      { color: { h: 22, s: 65, l: 38 }, weight: 0.18 }, // 深焦糖 crust
      { color: { h: 40, s: 25, l: 86 }, weight: 0.18 }, // 浅 crumb 气孔
      { color: { h: 18, s: 55, l: 48 }, weight: 0.15 }, // 肉桂深褐 streak
    ],
    heroHue: 28,
    difficulty: 'intermediate',
    source: {
      name: 'The Perfect Loaf — Pumpkin Cinnamon Sourdough',
      author: 'Maurizio Leo',
      url: 'https://www.theperfectloaf.com/pumpkin-cinnamon-sourdough-bread/',
    },
    note: '南瓜粉吸水大，水合度会升至约 75%。β-胡萝卜素 + 肉桂调节血糖。无添加糖。',
  },
  {
    id: 'flax-multigrain',
    name: '亚麻多谷',
    nameLatin: 'Flax Multigrain',
    description: '亚麻籽 4% + 葵花籽 5% + 芝麻 3%，ω-3 与木酚素富集。',
    modifiers: [
      { id: 'flax-seed', dose: 0.04 },
      { id: 'sunflower-seed', dose: 0.05 },
      { id: 'sesame', dose: 0.03 },
    ],
    heroHue: 30,
    difficulty: 'intermediate',
    source: {
      name: 'The Perfect Loaf — Super-Seeded Sourdough',
      author: 'Maurizio Leo',
      url: 'https://www.theperfectloaf.com/super-seeded-sourdough/',
    },
    note: '亚麻籽须前一晚等重量水浸泡 12h 成凝胶；α-亚麻酸 ω-3 + 芝麻木酚素，心血管友好。',
  },
  {
    id: 'pecan-country',
    name: '山核桃乡村',
    nameLatin: 'Pecan Country',
    description: '美洲山核桃 10%，纯坚果乡村酸种。',
    modifiers: [
      { id: 'pecan', dose: 0.10 },
    ],
    heroHue: 32,
    difficulty: 'intermediate',
    source: {
      name: 'Tartine Bread — Walnut Country (pecan-substituted)',
      author: 'Chad Robertson',
      url: 'https://www.amazon.com/Tartine-Bread-Chad-Robertson/dp/0811870413',
    },
    note: '替换 Tartine 经典 walnut 为美洲山核桃，剂量保持 10%。山核桃 MUFA 单不饱和脂肪 + 镁 + 维 E。烤前轻烤坚果，最后一次折叠加入。',
  },
];

export const FLAVORS_BY_ID = Object.fromEntries(
  FLAVORS.map((f) => [f.id, f])
);

export function getFlavor(id) {
  return FLAVORS_BY_ID[id] || null;
}
