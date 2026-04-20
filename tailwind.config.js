import { colors, spacing, radii, fontFamily, fontSize, shadow, motion } from './src/design/tokens.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    // 彻底覆盖默认 color palette —— 只留 tokens + 必要的透明
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#FFFFFF',
      black: '#000000',

      // Design tokens
      bg:       colors.bg,
      surface:  colors.surface,
      sunken:   colors.sunken,

      ink:      colors.ink,
      muted:    colors.muted,
      faint:    colors.faint,
      invert:   colors.invert,

      line:     colors.line,
      'line-soft': colors.lineSoft,

      accent:       colors.accent,
      'accent-soft': colors.accentSoft,
      'accent-ink':  colors.accentInk,
      'accent-line': colors.accentLine,

      warn:   colors.warn,
      'warn-bg': colors.warnBg,
      ok:     colors.ok,
      'ok-bg': colors.okBg,
    },

    spacing,
    borderRadius: radii,
    fontFamily,
    fontSize,

    extend: {
      boxShadow: shadow,

      transitionTimingFunction: {
        editorial: motion.ease,
      },
      transitionDuration: {
        fast: motion.fast.replace('ms', ''),
        base: motion.base.replace('ms', ''),
        slow: motion.slow.replace('ms', ''),
      },

      // Fraunces variable font 预设 variation
      fontVariationSettings: {
        display: "'opsz' 28, 'SOFT' 50",
        displayBold: "'opsz' 48, 'SOFT' 30, 'wght' 700",
      },
    },
  },
  plugins: [],
};
