/**
 * Gradient Engine — 多层 radial 混色生成器
 *
 * 参考 ElevenLabs 的色球风格：
 *   - 多个 radial hotspot 在不同位置叠加
 *   - 色相从 modifier + base 取，"未完全搅匀"的视觉
 *   - 配合 SVG feTurbulence grain 提供颗粒感
 *
 * 输出 CSS `background` 字符串可直接 inline style 使用。
 */

import { hslToCss } from '../domain/breadColor.js';
import { getModifier } from '../domain/modifiers/index.js';

/**
 * 根据 prediction 和可选 modifiers 生成多层 radial gradient。
 *
 * @param {object} prediction  breadColor 的输出 {base, crust, dots}
 * @param {Array<{id, dose}>} modifiers  用于取 colorant 的 breadColor / addin 的 dotColor
 * @returns {string} CSS background 值
 */
export function buildGradientBackground(prediction, modifiers = []) {
  const layers = [];

  // 收集所有色点（modifier 的 breadColor 优先，addin 的 dotColor 次之）
  const hotspots = [];
  for (const m of modifiers) {
    const mod = getModifier(m.id);
    if (!mod) continue;
    const color = mod.breadColor || mod.dotColor;
    if (!color) continue;
    hotspots.push({ color, weight: m.dose || mod.dose?.default || 0.05 });
  }

  // 固定位置的光斑槽
  // 调小前 3 个主槽、调大后 2 个 fallback 槽，防止 modifier 颜色
  // （通常占 slot 0-2）因为 radius 太大而在 slot 3/4 的位置"吞噬"
  // 对比色。这对单色系 flavor（如 pumpkin+cinnamon 都橘黄）尤其重要。
  const slots = [
    { x: 28, y: 32, r: 58, alpha: 0.95 },   // 68→58
    { x: 72, y: 28, r: 52, alpha: 0.90 },   // 62→52
    { x: 40, y: 75, r: 60, alpha: 0.88 },   // 70→60
    { x: 78, y: 72, r: 65, alpha: 0.85 },   // 58→65（对比色：补大一点）
    { x: 15, y: 62, r: 60, alpha: 0.80 },   // 50→60（对比色：补大一点）
  ];

  // 1. 最外层：prediction.crust 作为整体边缘色（低饱和，让中心色能透出）
  const crustSoft = { ...prediction.crust, s: Math.max(12, prediction.crust.s - 10) };
  // 最底层：均匀底色
  const baseLayer = `linear-gradient(135deg, ${hslToCss(prediction.base)} 0%, ${hslToCss(crustSoft)} 100%)`;

  // 2. modifier hotspots（每个 modifier 一个光斑，不够 5 个用 base/crust 补）
  //    fallback 色的 s 下限提到 65-70 —— 渲染时会 +5 被 cap 到 75（最大饱和），
  //    保证对比色不会被主色"冲淡"。hue 偏移 +60 / -60 / +200 覆盖多个色相象限。
  const fallback = [
    prediction.base,
    {
      h: (prediction.base.h + 60) % 360,
      s: Math.max(70, prediction.base.s + 25),
      l: Math.min(84, prediction.base.l + 2),
    },
    prediction.crust,
    {
      h: (prediction.crust.h + 300) % 360,
      s: Math.max(60, prediction.crust.s + 8),
      l: Math.min(82, prediction.crust.l + 14),
    },
    {
      h: (prediction.base.h + 200) % 360,
      s: Math.max(65, prediction.base.s + 20),
      l: Math.max(48, prediction.base.l - 14),
    },
  ];

  slots.forEach((slot, i) => {
    const hotspot = hotspots[i]?.color || fallback[i % fallback.length];
    const color = hslToCss({
      h: hotspot.h,
      s: Math.min(75, hotspot.s + 5),
      l: Math.min(88, Math.max(40, hotspot.l)),
    });
    const transparent = hslToCss({ ...hotspot, l: Math.min(95, hotspot.l + 10) }, 0);
    layers.push(
      `radial-gradient(circle at ${slot.x}% ${slot.y}%, ${color} 0%, ${transparent} ${slot.r}%)`
    );
  });

  // 反向叠：顶层是最显眼的 hotspot，底层是 base linear
  return [...layers, baseLayer].join(', ');
}

/**
 * 生成一个更柔和的"次要"渐变（用于 IngredientTable 卡头或 Badge 背景等）
 */
export function buildSoftGradient(prediction) {
  const base = hslToCss({ ...prediction.base, l: Math.min(95, prediction.base.l + 5) });
  const crust = hslToCss({ ...prediction.crust, s: Math.max(8, prediction.crust.s - 15), l: Math.min(92, prediction.crust.l + 20) });
  return `linear-gradient(135deg, ${base} 0%, ${crust} 100%)`;
}
