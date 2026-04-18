/**
 * Flavors — 大师级创意预设
 *
 * 规范：每一条都必须有可核查的权威来源（书籍 / 官方 URL）。
 * 所有配比基于原作者文献。第一条为 base（Tartine Country Bread 风格）。
 *
 * Schema 额外字段：
 *   source    { name, author, url }
 *   difficulty 'beginner' | 'intermediate' | 'advanced'
 *   note       简短作者说明（中文）
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
    note: 'Robertson 经典 75% 水合配方；新手可从 70% 起步。',
  },
  {
    id: 'walnut-levain',
    name: '核桃乡村',
    nameLatin: 'Walnut Levain',
    description: '烤核桃 12%，Tartine 经典坚果乡村。',
    modifiers: [
      { id: 'walnut', dose: 0.12 },
    ],
    heroHue: 28,
    difficulty: 'intermediate',
    source: {
      name: 'Tartine Bread — Walnut Country Bread variation',
      author: 'Chad Robertson',
      url: 'https://www.amazon.com/Tartine-Bread-Chad-Robertson/dp/0811870413',
    },
    note: '坚果须烤过冷却；第 2 或第 3 次折叠时加入。',
  },
  {
    id: 'olive-rosemary',
    name: '橄榄迷迭香',
    nameLatin: 'Olive & Rosemary Levain',
    description: 'Kalamata 橄榄 10% + 迷迭香，地中海经典。',
    modifiers: [
      { id: 'olive', dose: 0.10 },
      { id: 'rosemary', dose: 0.01 },
    ],
    heroHue: 80,
    difficulty: 'intermediate',
    source: {
      name: 'Tartine Bread — Olive Rosemary variation',
      author: 'Chad Robertson',
      url: 'https://www.amazon.com/Tartine-Bread-Chad-Robertson/dp/0811870413',
    },
    note: '橄榄带盐，基础盐减 0.2%。',
  },
  {
    id: 'fig-walnut',
    name: '无花果核桃',
    nameLatin: 'Fig & Walnut',
    description: '无花果干 21% + 核桃 24%，King Arthur 配方。',
    modifiers: [
      { id: 'fig', dose: 0.21 },
      { id: 'walnut', dose: 0.24 },
    ],
    heroHue: 22,
    difficulty: 'intermediate',
    source: {
      name: 'King Arthur — Fig and Walnut Sourdough',
      url: 'https://www.kingarthurbaking.com/recipes/fig-and-walnut-sourdough-recipe',
    },
    note: '原方水合 63%；大量干果加水合补偿后约 72%。',
  },
  {
    id: 'chocolate',
    name: '可可巧克力',
    nameLatin: 'Chocolate Sourdough',
    description: '可可 4% + 黑巧克力豆 22%，deep roasted 风味。',
    modifiers: [
      { id: 'cocoa', dose: 0.04 },
      { id: 'chocolate-chips', dose: 0.22 },
    ],
    heroHue: 18,
    difficulty: 'intermediate',
    source: {
      name: 'King Arthur — Chocolate Sourdough',
      url: 'https://www.kingarthurbaking.com/recipes/chocolate-sourdough-bread-recipe',
    },
    note: '可可先和水拌匀去结块；推荐 Dutch-process 可可。',
  },
  {
    id: 'jalapeno-cheddar',
    name: '辣椒车达',
    nameLatin: 'Jalapeño Cheddar',
    description: '腌辣椒 24% + 车达 15%，咸鲜微辣。',
    modifiers: [
      { id: 'jalapeno', dose: 0.24 },
      { id: 'cheddar', dose: 0.15 },
    ],
    heroHue: 50,
    difficulty: 'intermediate',
    source: {
      name: 'King Arthur — Jalapeño-Cheddar Bread',
      url: 'https://www.kingarthurbaking.com/recipes/jalapeno-cheddar-bread-recipe',
    },
    note: '奶酪一半磨碎 + 一半切块；橄榄/辣椒含盐，基础盐减 0.2%。',
  },
  {
    id: 'walnut-cranberry',
    name: '核桃蔓越莓',
    nameLatin: 'Walnut Cranberry',
    description: '核桃 12% + 蔓越莓 16%，早餐款酸甜平衡。',
    modifiers: [
      { id: 'walnut', dose: 0.12 },
      { id: 'cranberry', dose: 0.16 },
    ],
    heroHue: 355,
    difficulty: 'intermediate',
    source: {
      name: 'The Perfect Loaf — Walnut Cranberry Sourdough',
      author: 'Maurizio Leo',
      url: 'https://www.theperfectloaf.com/walnut-cranberry-sourdough/',
    },
    note: '蔓越莓略泡温水再加入；酸度促发酵，主发酵缩短 10–15%。',
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
    note: '种子烤过香气更浓；最后一次折叠时加入。',
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
    heroHue: 28,
    difficulty: 'intermediate',
    source: {
      name: 'The Perfect Loaf — Pumpkin Cinnamon Sourdough',
      author: 'Maurizio Leo',
      url: 'https://www.theperfectloaf.com/pumpkin-cinnamon-sourdough-bread/',
    },
    note: '南瓜粉吸水大，水合度会升至约 75%。',
  },
  {
    id: 'matcha-swirl',
    name: '抹茶漩涡',
    nameLatin: 'Matcha Swirl',
    description: '抹茶 2.9%，改编自 King Arthur marbled matcha。',
    modifiers: [
      { id: 'matcha', dose: 0.029 },
    ],
    heroHue: 90,
    difficulty: 'advanced',
    source: {
      name: 'King Arthur — Marbled Matcha Milk Bread (adapted for sourdough)',
      url: 'https://www.kingarthurbaking.com/recipes/marbled-matcha-milk-bread-recipe',
    },
    note: '原方为奶油吐司；此处为 sourdough 改编版，颜色会因烤制略偏橄榄绿。',
  },
];

export const FLAVORS_BY_ID = Object.fromEntries(
  FLAVORS.map((f) => [f.id, f])
);

export function getFlavor(id) {
  return FLAVORS_BY_ID[id] || null;
}
