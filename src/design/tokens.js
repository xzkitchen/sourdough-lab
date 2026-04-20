/**
 * Sourdough Lab Design Tokens
 * 2026 Warm Editorial — 暖米纸 + 墨黑 + 单一麦色
 *
 * 使用：JS 侧直接 import；Tailwind 侧见 tailwind.config.js。
 */

export const colors = {
  // Surfaces — 背景层级从最暗到最亮
  bg:       '#F5F1EA',   // 暖米纸（body）
  surface:  '#FBF8F2',   // 卡片背景（比 bg 略亮）
  sunken:   '#EDE7DB',   // 嵌入式背景（输入框、slider track）

  // Text — 墨色层级
  ink:      '#1A1815',   // 主文字（近墨黑，不用纯黑）
  muted:    '#6B635A',   // 次要文字
  faint:    '#A39A8E',   // 三级 / 占位 / disabled

  // Lines — hairline 主力
  line:     '#E5DED0',   // 1px 实线
  lineSoft: '#EFEADF',   // 虚线 / 极弱分隔

  // Accent — 唯一强调色
  accent:     '#B08968', // 麦色
  accentSoft: '#D9C3A8', // hover / 淡底
  accentInk:  '#6E4F2F', // accent 上的文字
  accentLine: '#C9A57F', // accent 线条（比 accent 略浅）

  // Semantic — 仅用于警告/完成的弹字与小徽记
  warn:   '#A04530',
  warnBg: '#F4E4D7',
  ok:     '#5C7A5A',
  okBg:   '#E4EAD8',
};

export const spacing = {
  // 基于 4px 栅格；大号留白是 2026 quiet luxury 核心
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

  // 语义间距 tier（手机优先节奏）
  tight:  '8px',    // 同一卡片内相邻元素
  normal: '16px',   // 相关段落之间
  group:  '28px',   // 大分组之间
  section:'40px',   // Tab 内 section 之间（桌面加大）
};

export const radii = {
  none: '0px',
  sm:   '4px',
  md:   '8px',
  lg:   '12px',
  pill: '999px',
  full: '9999px',   // 圆形（=tailwind 默认 rounded-full）
};

export const fontFamily = {
  display: ['Fraunces', 'Noto Serif SC', 'Georgia', 'serif'],
  body:    ['Inter', 'Noto Sans SC', 'system-ui', '-apple-system', 'sans-serif'],
  mono:    ['IBM Plex Mono', 'ui-monospace', 'SF Mono', 'monospace'],
};

export const fontSize = {
  xs:   ['11px', { lineHeight: '16px', letterSpacing: '0.02em' }],
  sm:   ['13px', { lineHeight: '20px' }],
  base: ['15px', { lineHeight: '24px' }],
  md:   ['17px', { lineHeight: '26px' }],
  lg:   ['20px', { lineHeight: '28px' }],
  xl:   ['24px', { lineHeight: '32px', letterSpacing: '-0.01em' }],
  '2xl':['32px', { lineHeight: '40px', letterSpacing: '-0.015em' }],
  '3xl':['44px', { lineHeight: '52px', letterSpacing: '-0.02em' }],
  '4xl':['60px', { lineHeight: '68px', letterSpacing: '-0.025em' }],
};

export const shadow = {
  // 极度克制，平面优先
  none: 'none',
  sm:   '0 1px 2px rgba(26, 24, 21, 0.04)',
  md:   '0 1px 2px rgba(26, 24, 21, 0.04), 0 8px 24px rgba(26, 24, 21, 0.06)',
  lg:   '0 2px 6px rgba(26, 24, 21, 0.05), 0 16px 40px rgba(26, 24, 21, 0.08)',
};

export const motion = {
  // iOS 风缓动，自然而克制
  ease: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  // 三档时长
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

// 便利导出：整体主题对象
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
