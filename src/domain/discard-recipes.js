/**
 * Discard recipes — 弃种处理参考库
 *
 * 喂养前要丢掉的旧种（"弃种"）每周可累积 50–250g+，扔掉太可惜。
 * 这里列若干**有大师级出处**的弃种食谱，手风琴展开就地查看简版做法。
 *
 * 设计原则：
 *   - 不追踪累积量、不算精确克数（避免半途而废的状态管理）
 *   - 简版做法是**通用烹饪技法**（煎饼/脆饼/华夫的基础流程都属公共知识）；
 *     精确克数与配比涉及版权，留 source.url 给读者去原文对照
 *   - 来源全部为 King Arthur Baking Company（最权威、URL 稳定）
 *
 * Schema:
 *   nameZh        中文名
 *   nameLatin     英文名（编辑器风短标题）
 *   discardG      典型用量（克）
 *   timeMin       总用时（分钟，含烤/醒）
 *   difficulty    'beginner' | 'intermediate' | 'advanced'
 *   summary       一句简介（中文，编辑器风）
 *   ingredients   基础用料（仅类目，不含精确比例）
 *   steps         3–4 步通用做法（imperative，短句）
 *   source        { publisher, title, url } —— 完整配方原文
 */

export const DISCARD_RECIPES = [
  {
    id: 'discard-pancakes',
    nameZh: '弃种煎饼',
    nameLatin: 'Discard Pancakes',
    discardG: 200,
    timeMin: 15,
    difficulty: 'beginner',
    summary: '最快消化弃种的方法。早餐五分钟搅好、十分钟煎完，配蜂蜜或浆果。',
    ingredients: [
      '弃种 ~200g',
      '面粉（可半全麦替代）',
      '牛奶或植物奶',
      '蛋 1 个',
      '盐 + 小苏打',
      '少量糖（帮助上色，可选）',
    ],
    steps: [
      '所有材料搅匀至无干粉块，静置 5 分钟让面粉吸水',
      '中火预热不粘锅，刷一层薄油',
      '每张 ~1/4 杯（约 60ml），表面起泡且边缘变干即翻面',
      '两面金黄即可，趁热享用',
    ],
    source: {
      publisher: 'King Arthur',
      title: 'Sourdough Discard Pancakes or Waffles',
      url: 'https://www.kingarthurbaking.com/recipes/sourdough-discard-pancakes-or-waffles-recipe',
    },
  },
  {
    id: 'discard-crackers',
    nameZh: '弃种脆饼',
    nameLatin: 'Discard Crackers',
    discardG: 200,
    timeMin: 30,
    difficulty: 'beginner',
    summary: '老弃种（≥ 3 天）做出来更香脆。烤好密封常温可存约一周，配奶酪/汤极佳。',
    ingredients: [
      '弃种 ~200g',
      '面粉',
      '橄榄油',
      '盐',
      '迷迭香 / 百里香 / 黑胡椒（任选，可省）',
    ],
    steps: [
      '揉成不粘手的面团；太黏加面粉、太干加油',
      '在油纸上擀薄至约 2mm，刀划成方格（不切断）',
      '表面刷油、撒粗盐与香草',
      '175°C / 350°F 烤 18–22 分钟至金棕，冷却后掰开变脆',
    ],
    source: {
      publisher: 'King Arthur',
      title: 'Sourdough Crackers',
      url: 'https://www.kingarthurbaking.com/recipes/sourdough-crackers-recipe',
    },
  },
  {
    id: 'discard-waffles',
    nameZh: '弃种华夫',
    nameLatin: 'Discard Waffles',
    discardG: 250,
    timeMin: 20,
    difficulty: 'beginner',
    summary: '比煎饼更厚重，外脆内软。蛋白打发后另拌入是关键。',
    ingredients: [
      '弃种 ~250g',
      '面粉',
      '牛奶',
      '蛋（黄白分开）',
      '融化黄油',
      '盐 + 小苏打',
    ],
    steps: [
      '黄油融化后稍凉，混合除蛋白外所有材料',
      '蛋白单独打发至硬性发泡，轻拌入面糊（不要消泡）',
      '华夫机中高温预热，按机器说明烤 3–5 分钟',
      '表面金黄即可，配枫糖浆或新鲜水果',
    ],
    source: {
      publisher: 'King Arthur',
      title: 'Sourdough Discard Pancakes or Waffles',
      url: 'https://www.kingarthurbaking.com/recipes/sourdough-discard-pancakes-or-waffles-recipe',
    },
  },
];
