/**
 * BreadColor — 面包切面颜色预测
 *
 * 输入 base recipe + selected modifiers
 * 输出：
 *   - base       HSL 底色（加权混合后）
 *   - crust      HSL 表皮色（比底色暗 10 lightness + 加一点焦糖色）
 *   - dots       混入料颗粒数组，每个含 {color, density}，用于 BreadPreview SVG 散点
 */

import { getModifier } from './modifiers/index.js';

/**
 * HSL 加权平均（h 用圆形平均）
 */
function blendHSL(colors) {
  if (!colors.length) return { h: 38, s: 20, l: 85 };

  // s, l 按权重直接算术平均
  const totalW = colors.reduce((sum, c) => sum + c.w, 0) || 1;
  let sSum = 0, lSum = 0;
  let hSumSin = 0, hSumCos = 0;
  for (const { color, w } of colors) {
    sSum += color.s * w;
    lSum += color.l * w;
    const rad = (color.h * Math.PI) / 180;
    hSumSin += Math.sin(rad) * w;
    hSumCos += Math.cos(rad) * w;
  }
  const hAvg = Math.atan2(hSumSin / totalW, hSumCos / totalW) * 180 / Math.PI;
  return {
    h: Math.round((hAvg + 360) % 360),
    s: Math.round(sSum / totalW),
    l: Math.round(lSum / totalW),
  };
}

/**
 * 预测面包切面色
 * @param {object} base           - base recipe
 * @param {Array<{id, dose?}>} selectedModifiers
 * @returns {{base: HSL, crust: HSL, dots: Array<{color, density}>}}
 */
export function predictBreadColor(base, selectedModifiers = []) {
  // 1. 基础色（权重高，作为底）
  const baseColor = base.breadColor || { h: 38, s: 25, l: 82 };
  const baseWeight = 1.0;

  // 2. 收集 colorant 的加权色
  const colorantColors = [];
  for (const sel of selectedModifiers) {
    const mod = getModifier(sel.id);
    if (!mod || mod.category !== 'colorant') continue;
    if (!mod.breadColor) continue;
    const dose = typeof sel.dose === 'number' ? sel.dose : mod.dose.default;
    // 权重 = dose * 8（放大效果，4% matcha 权重 0.32，近乎盖过底色）
    colorantColors.push({ color: mod.breadColor, w: dose * 8 });
  }

  const finalBase = blendHSL([
    { color: baseColor, w: baseWeight },
    ...colorantColors,
  ]);

  // 3. 表皮色：明度 -18，稍微加焦糖饱和
  const crust = {
    h: Math.max(25, finalBase.h - 5),   // 拉向焦糖棕
    s: Math.min(60, finalBase.s + 15),
    l: Math.max(25, finalBase.l - 18),
  };

  // 4. 混入料颗粒
  const dots = [];
  for (const sel of selectedModifiers) {
    const mod = getModifier(sel.id);
    if (!mod || mod.category !== 'addin') continue;
    if (!mod.dotColor) continue;
    const dose = typeof sel.dose === 'number' ? sel.dose : mod.dose.default;
    dots.push({
      id: mod.id,
      name: mod.name,
      color: mod.dotColor,
      density: dose,     // 用于决定散点数量
    });
  }

  return { base: finalBase, crust, dots };
}

/** 便捷：HSL 对象转 CSS 字符串 */
export function hslToCss({ h, s, l }, alpha = 1) {
  if (alpha < 1) return `hsla(${h}, ${s}%, ${l}%, ${alpha})`;
  return `hsl(${h}, ${s}%, ${l}%)`;
}
