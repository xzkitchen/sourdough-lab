/**
 * Sourdough Lab Design Tokens
 * 2026 Warm Editorial — 暖米纸 + 墨黑 + 单一麦色
 *
 * v2 Editorial — 在原有基础上增加 editorial 刊物版式所需的
 *   - masthead / chapter 专用字号
 *   - 语义化 spacing section-lg（页面大分段留白）
 *   - motion 更细腻的三档缓动
 *
 * 使用：JS 侧直接 import；Tailwind 侧见 tailwind.config.js。
 */

export const colors = {
  // Surfaces
  bg:       '#F5F1EA',
  surface:  '#FBF8F2',
  sunken:   '#EDE7DB',

  // Text
  ink:      '#1A1815',
  muted:    '#6B635A',
  faint:    '#A39A8E',

  // Lines
  line:     '#E5DED0',
  lineSoft: '#EFEADF',

  // Accent
  accent:     '#B08968',
  accentSoft: '#D9C3A8',
  accentInk:  '#6E4F2F',
  accentLine: '#C9A57F',

  // Semantic
  warn:   '#A04530',
  warnBg: '#F4E4D7',
  ok:     '#5C7A5A',
  okBg:   '#E4EAD8',
};

export const spacing = {
  0: '0px',
  1: '4px', 2: '8px', 3: '12px', 4: '16px', 5: '20px',
  6: '24px', 7: '28px', 8: '32px', 10: '40px', 12: '48px',
  16: '64px', 20: '80px', 24: '96px', 32: '128px',

  tight:      '8px',
  normal:     '16px',
  group:      '28px',
  section:    '40px',
  'section-lg': '64px',   // Editorial: Chapter 之间
  'section-xl':'96px',    // Editorial: Masthead → Body
};

export const radii = {
  none: '0px',
  sm:   '4px',
  md:   '8px',
  lg:   '12px',
  pill: '999px',
  full: '9999px',
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
  // Editorial additions
  'chapter': ['clamp(44px, 9vw, 96px)', { lineHeight: '0.95', letterSpacing: '-0.02em' }],
  'meta-big':['clamp(32px, 5vw, 44px)', { lineHeight: '1', letterSpacing: '-0.01em' }],
};

export const shadow = {
  none: 'none',
  sm:   '0 1px 2px rgba(26, 24, 21, 0.04)',
  md:   '0 1px 2px rgba(26, 24, 21, 0.04), 0 8px 24px rgba(26, 24, 21, 0.06)',
  lg:   '0 2px 6px rgba(26, 24, 21, 0.05), 0 16px 40px rgba(26, 24, 21, 0.08)',
  orb:  '0 10px 40px rgba(110,79,47,0.18), 0 2px 6px rgba(26,24,21,0.08)',
};

export const motion = {
  ease: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  fast:  '180ms',
  base:  '260ms',
  slow:  '420ms',
};

export const zIndex = {
  base: 1, raised: 10, sticky: 20, overlay: 40, modal: 60, toast: 80,
};

export const theme = { colors, spacing, radii, fontFamily, fontSize, shadow, motion, zIndex };
export default theme;
