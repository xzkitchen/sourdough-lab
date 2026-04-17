import sourdoughClassic from './sourdough-classic.js';

/**
 * Base recipes
 *
 * v1 仅支持 Country Sourdough。
 * 未来扩展 sourdough 变体（Ciabatta / Focaccia / Whole Wheat / Rye）时
 * 在这里 append，并在 process/ 加对应 steps 文件。
 */
export const BASE_RECIPES = [sourdoughClassic];

export const BASE_RECIPES_BY_ID = Object.fromEntries(
  BASE_RECIPES.map((r) => [r.id, r])
);

export function getBaseRecipe(id) {
  return BASE_RECIPES_BY_ID[id] || sourdoughClassic;
}

/** 默认 base —— 唯一基础配方 */
export const DEFAULT_BASE = sourdoughClassic;

export { sourdoughClassic };
