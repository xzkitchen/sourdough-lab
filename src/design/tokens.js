/**
 * Sourdough Lab Design Tokens — V2 Ledger
 *
 * 编辑器/手账风：暖纸底 + 墨黑 + 单色焦土 accent。
 * 1px hairline 主导，零渐变、零阴影（只在 ColdRetard 等少数地方破例）。
 *
 * 使用：JS 侧直接 import；Tailwind 侧见 tailwind.config.js。
 */

export const colors = {
  // Surfaces — 暖纸三阶
  bg:       '#F5F1E5',   // 暖米纸（body）
  surface:  '#EFE9DC',   // 卡片 / 节内底
  sunken:   '#E8E0D0',   // 嵌入式底（输入、被禁用）

  // Ink — 墨色三阶
  ink:      '#1A1715',   // 主墨色（近黑非黑）
  muted:    '#5C544C',   // 次要文字
  faint:    '#9C9387',   // 三级 / 占位 / disabled

  // Lines — hairline 主力（V2 比 V1 更清淡）
  line:     '#3A3530',   // 1px 实线 —— 跟 ink 同色系，比之前的 #E5DED0 重很多（编辑器风）
  lineSoft: '#C9BFAE',   // 弱分隔（虚线、软线）

  // Accent — 唯一焦土色（对齐 v2-ledger.jsx 的 burnt sienna）
  accent:     '#b94a20',  // 烧赭（v2 ledger 章印色，比 #B85A3E 更暖更沉）
  accentSoft: '#E8C9B8',  // hover / 淡底
  accentInk:  '#6e3a1a',  // 焦土上的深色文字（略偏暖、降饱和）
  accentLine: '#c46a3a',  // 焦土线条

  // Semantic
  warn:   '#A04530',
  warnBg: '#F4E4D7',
  ok:     '#5C7A5A',
  okBg:   '#E4EAD8',
};

export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',

  // 语义间距
  tight:  '8px',
  normal: '16px',
  group:  '28px',
  section:'40px',
};

export const radii = {
  none: '0px',
  sm:   '2px',
  md:   '4px',
  lg:   '8px',
  pill: '999px',
  full: '9999px',
};

/**
 * 字体栈 —— 与 index.html 加载的 Google Fonts 对齐
 *  display — Fraunces（可变字体，opsz/SOFT/wght 三轴；编辑器衬线，主标题、数字大字）
 *  serif   — Fraunces italic（拉丁副标题、引号字体；与 display 同一字体不同 ital 轴）
 *  zh      — Noto Serif SC（中文标题）
 *  body    — Inter + Noto Sans SC（正文）
 *  mono    — IBM Plex Mono（编号、克数、间距字符）
 */
export const fontFamily = {
  display: ['Fraunces', '"Noto Serif SC"', 'Georgia', 'serif'],
  serif:   ['Fraunces', '"Noto Serif SC"', 'Georgia', 'serif'],
  zh:      ['"Noto Serif SC"', '"Source Han Serif SC"', 'serif'],
  body:    ['Inter', '"Noto Sans SC"', 'system-ui', '-apple-system', 'sans-serif'],
  mono:    ['"IBM Plex Mono"', 'ui-monospace', 'SF Mono', 'monospace'],
};

export const fontSize = {
  // ledger 偏大反差：mono 极小、display 极大
  '2xs': ['9px',  { lineHeight: '12px', letterSpacing: '0.24em' }],
  xs:    ['11px', { lineHeight: '16px', letterSpacing: '0.18em' }],
  sm:    ['13px', { lineHeight: '20px' }],
  base:  ['15px', { lineHeight: '24px' }],
  md:    ['17px', { lineHeight: '26px' }],
  lg:    ['20px', { lineHeight: '28px' }],
  xl:    ['24px', { lineHeight: '32px', letterSpacing: '-0.01em' }],
  '2xl': ['32px', { lineHeight: '40px', letterSpacing: '-0.015em' }],
  '3xl': ['44px', { lineHeight: '48px', letterSpacing: '-0.02em' }],
  '4xl': ['54px', { lineHeight: '58px', letterSpacing: '-0.03em' }],
  '5xl': ['72px', { lineHeight: '72px', letterSpacing: '-0.04em' }],
};

export const shadow = {
  none: 'none',
  sm:   '0 1px 2px rgba(26, 23, 21, 0.04)',
  md:   '0 1px 2px rgba(26, 23, 21, 0.04), 0 8px 24px rgba(26, 23, 21, 0.06)',
  lg:   '0 2px 6px rgba(26, 23, 21, 0.05), 0 16px 40px rgba(26, 23, 21, 0.08)',
};

export const motion = {
  ease: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  fast:  '180ms',
  base:  '260ms',
  slow:  '420ms',
};

export const zIndex = {
  base:     1,
  raised:   10,
  sticky:   20,
  overlay:  40,
  modal:    60,
  toast:    80,
};

export const theme = {
  colors,
  spacing,
  radii,
  fontFamily,
  fontSize,
  shadow,
  motion,
  zIndex,
};

export default theme;
