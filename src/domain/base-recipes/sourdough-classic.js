/**
 * Base Recipe: 乡村酸种 (Country Sourdough)
 *
 * 所有数值以 baker's percentage (bp) 为主，渲染时按 baseFlour × numUnits × bp 计算。
 */

export default {
  id: 'sourdough-classic',
  name: '乡村酸种',
  nameLatin: 'Country Sourdough',

  category: 'sourdough',
  leaveningType: 'levain', // 'levain' | 'commercial-yeast'

  baseFlour: 400,          // 基准面粉量（单条）
  hydration: 0.70,         // 70% 水合度

  // 基础食材列表（按 baker's percentage）
  ingredients: [
    { id: 'flour',   name: 'T65 高筋粉', bp: 1.00, role: 'flour',   isHydration: false },
    { id: 'water',   name: '水',         bp: 0.70, role: 'liquid',  isHydration: true  },
    { id: 'starter', name: '鲁邦种',     bp: 0.20, role: 'leaven',  isHydration: false },
    { id: 'salt',    name: '盐',         bp: 0.02, role: 'salt',    isHydration: false },
  ],

  // 流程引用：指向 src/domain/process/sourdough-steps.js
  processRef: 'sourdough-steps',

  // 默认主发酵/最终醒发时长（分钟）—— calculator 调整基数
  defaultBulkMinutes: 240,
  defaultProofMinutes: 60,

  // 可叠加的 modifier 类型
  acceptsModifiers: ['colorant', 'addin'],

  // 酸种独有：预留水比例（盐溶解用）
  defaults: {
    waterReservedRatio: 0.10,
    feedBufferGrams: 60,       // 养种时额外喂的缓冲量
  },

  // 面包切面底色（未叠加 modifier 时的预设色）—— HSL
  // 偏米白/淡麦色，略带氧化小麦黄
  breadColor: { h: 38, s: 25, l: 82 },

  // UI 层元数据
  meta: {
    description: '高水合乡村酸种，T65 面粉 + 天然鲁邦种，外壳脆裂、内部蜂巢气孔。',
    difficulty: 3,              // 1-5
    totalHours: [24, 30],       // 从喂种到出炉
    tags: ['sourdough', 'artisan', 'levain'],
  },
};
