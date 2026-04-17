import { COLORANTS, COLORANTS_BY_ID, getColorant } from './colorants.js';
import { ADDINS, ADDINS_BY_ID, getAddin } from './addins.js';
import { FLAVORS, FLAVORS_BY_ID, getFlavor } from './flavors.js';

export { COLORANTS, COLORANTS_BY_ID, getColorant };
export { ADDINS, ADDINS_BY_ID, getAddin };
export { FLAVORS, FLAVORS_BY_ID, getFlavor };

/** 所有 modifier 的统一索引 */
export const ALL_MODIFIERS = [...COLORANTS, ...ADDINS];
export const MODIFIERS_BY_ID = {
  ...COLORANTS_BY_ID,
  ...ADDINS_BY_ID,
};

export function getModifier(id) {
  return MODIFIERS_BY_ID[id] || null;
}

/** 按 base recipe 过滤可用 modifier */
export function listModifiersFor(baseRecipe) {
  if (!baseRecipe?.acceptsModifiers) return [];
  return ALL_MODIFIERS.filter((m) =>
    baseRecipe.acceptsModifiers.includes(m.category)
  );
}
