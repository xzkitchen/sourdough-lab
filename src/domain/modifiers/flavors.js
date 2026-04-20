/**
 * Flavors — 大师级创意预设（健康路线）
 *
 * 设计约束（xizai 个人偏好）：
 *   1) 不含核桃（walnut）——任何涉及核桃的配方已剔除
 *   2) 不加糖——不使用巧克力豆（添加糖）、甜蔓越莓干（添加糖）等
 *   3) 健康优先——种子 / 香料 / 蔬菜色粉 / 橄榄 / 奶酪，避免糖和精炼甜味
 *
 * 注：walnut / cranberry / chocolate-chips 等 modifier 仍保留在
 * addins.js / colorants.js 里（词汇表完整性 + 测试依赖），
 * 但不会出现在任何 FLAVOR 预设中。
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
    note: '奶酪一半磨碎 + 一半切块；辣椒含盐，基础盐减 0.2%。发酵奶酪提供钙与维生素 K2。',
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
    id: 'matcha-swirl',
    name: '抹茶漩涡',
    nameLatin: 'Matcha Swirl',
    description: '抹茶 2.9%，sourdough 改编版（不加糖）。',
    modifiers: [
      { id: 'matcha', dose: 0.029 },
    ],
    heroHue: 90,
    difficulty: 'advanced',
    source: {
      name: 'King Arthur — Marbled Matcha Milk Bread (adapted for sourdough)',
      url: 'https://www.kingarthurbaking.com/recipes/marbled-matcha-milk-bread-recipe',
    },
    note: '原配方为奶油吐司；此处改编为 lean sourdough，去除糖与奶。抹茶 EGCG 抗氧化力强。',
  },

  // ── 以下 4 条：2026 补充·健康路线 ─────────────────────

  {
    id: 'turmeric-golden',
    name: '金黄姜黄',
    nameLatin: 'Golden Turmeric',
    description: '姜黄 1.5% + 葵花籽 6%，抗炎金色谷物。',
    modifiers: [
      { id: 'turmeric', dose: 0.015 },
      { id: 'sunflower-seed', dose: 0.06 },
    ],
    heroHue: 42,
    difficulty: 'intermediate',
    source: {
      name: 'Full Proof Baking — Golden Turmeric Sourdough',
      author: 'Kristen Dennis',
      url: 'https://www.fullproofbaking.com/',
    },
    note: '姜黄素（curcumin）具抗炎活性；佐黑胡椒食用，piperine 可提升吸收率 ~2000%。',
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
    id: 'beetroot-earth',
    name: '甜菜根',
    nameLatin: 'Beetroot Levain',
    description: '甜菜根粉 4%，亮玫瑰红乡村酸种，土香带微甜。',
    modifiers: [
      { id: 'beetroot', dose: 0.04 },
    ],
    heroHue: 340,
    difficulty: 'intermediate',
    source: {
      name: 'The Sourdough School — Beetroot Sourdough',
      author: 'Vanessa Kimbell',
      url: 'https://www.sourdough.co.uk/',
    },
    note: '甜菜红素（betalain）遇高温易褪色，烤温 ≤ 220°C 保色。硝酸盐有助扩张血管、降血压。',
  },
  {
    id: 'fennel-sesame',
    name: '茴香芝麻',
    nameLatin: 'Fennel & Sesame',
    description: '茴香籽 0.8% + 芝麻 5%，托斯卡纳风格香草乡村。',
    modifiers: [
      { id: 'fennel-seed', dose: 0.008 },
      { id: 'sesame', dose: 0.05 },
    ],
    heroHue: 48,
    difficulty: 'intermediate',
    source: {
      name: "Jeffrey Hamelman — Bread: A Baker's Book of Techniques and Formulas",
      author: 'Jeffrey Hamelman',
      url: 'https://www.amazon.com/Bread-Bakers-Book-Techniques-Formulas/dp/0470380187',
    },
    note: '茴香籽轻压出香气；茴香 anethole 助消化缓胀气，芝麻提供钙与木酚素。',
  },
];

export const FLAVORS_BY_ID = Object.fromEntries(
  FLAVORS.map((f) => [f.id, f])
);

export function getFlavor(id) {
  return FLAVORS_BY_ID[id] || null;
}
