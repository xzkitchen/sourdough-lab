/**
 * Discard recipes — 弃种处理参考库（静态、零状态）
 *
 * 喂养前要丢掉的旧种（"弃种"）每周可累积 50–250g+，扔掉太可惜。
 * 这里列若干**有大师级出处**的弃种食谱，用户在 Starter Tab 翻到底
 * 即可跳转。
 *
 * 设计原则：
 *   - 不追踪累积量、不算精确克数（避免半途而废的状态管理）
 *   - 每条只给：用量参考 + 总用时 + 来源链接
 *   - 来源全部为 King Arthur Baking Company（最权威、URL 稳定）
 *
 * Schema:
 *   nameZh        中文名
 *   nameLatin     英文名（编辑器风短标题）
 *   discardG      典型用量（克）
 *   timeMin       总用时（分钟，含烤/醒）
 *   difficulty    'beginner' | 'intermediate' | 'advanced'
 *   source        { publisher, title, url }
 */

export const DISCARD_RECIPES = [
  {
    id: 'discard-pancakes',
    nameZh: '弃种煎饼',
    nameLatin: 'Discard Pancakes',
    discardG: 200,
    timeMin: 15,
    difficulty: 'beginner',
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
    source: {
      publisher: 'King Arthur',
      title: 'Sourdough Discard Pancakes or Waffles',
      url: 'https://www.kingarthurbaking.com/recipes/sourdough-discard-pancakes-or-waffles-recipe',
    },
  },
];
