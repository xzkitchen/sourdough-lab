/**
 * Process: 乡村酸种 13 步
 *
 * Schema：
 *   id                    唯一
 *   phase                 'prep' | 'mix' | 'bulk' | 'shape' | 'cold' | 'bake'
 *   title / subtitle      中/英文显示
 *   action                动作摘要（右上角 pill）
 *   timeValue / timeUnit  "30 / 分钟"
 *   minutes               用于总时长估算
 *   mixerParams           厨师机参数（可选）
 *   baseTips              静态提示（不含动态数值）
 *   warning               警告标签（可选）
 *
 * 动态内容（如"投料 T65 400g"）由 calculator.enhanceSteps() 按 recipe 注入。
 */

export const SOURDOUGH_STEPS = [
  {
    id: 'feed',
    phase: 'prep',
    title: '激活鲁邦种',
    subtitle: 'Levain Build',
    action: '25-28°C',
    timeValue: '4-8',
    timeUnit: '小时',
    minutes: 360,
    baseTips: [
      '按 Starter 页的定时喂养比例构建鲁邦种',
      '最佳温度 25-28°C，温度越低达峰越慢',
      '峰值判断：体积约 2-3 倍，顶部圆拱后刚开始变平或边缘微回落',
      '浮水测试只作辅助；高水合或取样消泡后会误判',
    ],
    warning: null,
  },
  {
    id: 'autolyse',
    phase: 'mix',
    title: '混合与静置',
    subtitle: 'Fermentolyse',
    action: '低速混合',
    timeValue: '45',
    timeUnit: '分钟静置',
    minutes: 45,
    mixerParams: {
      stage1: { speed: 1, time: '2-3分钟', goal: '混合至无干粉' },
    },
    baseTips: [
      'T65 面粉 + 本阶段水 + 鲁邦种入缸',
      '粉类 modifier（可可 / 抹茶 / 香料）先与面粉干拌均匀；整粒或浸泡混入料不要此时加入',
      '开启厨师机低速混合，只要看不见干粉即可停止',
      '千万不要过度搅拌，只需混合均匀',
      '盖上保鲜膜，静置 45 分钟，让面筋自然形成',
    ],
    warning: null,
  },
  {
    id: 'salt',
    phase: 'mix',
    title: '后加水 & 盐',
    subtitle: 'Bassinage',
    action: '慢速吸收',
    timeValue: '5',
    timeUnit: '分钟操作',
    minutes: 5,
    mixerParams: {
      stage1: { speed: 2, time: '3-5分钟', goal: '水分完全被吸收' },
    },
    baseTips: [
      '先把盐溶进预留水，做成盐水',
      '盐水分 2-3 次缓慢加入，每次等待面团吸收后再加下一次',
      '低速搅拌到盐水基本吸收即可，不要为了追求光滑而过揉',
      '此时面团短暂变松属正常，后续揉面和折叠会重新建立强度',
    ],
    warning: null,
  },
  {
    id: 'knead',
    phase: 'mix',
    title: '机械揉面',
    subtitle: 'Mechanical Mix',
    action: '中低速',
    timeValue: '4-7',
    timeUnit: '分钟',
    minutes: 7,
    mixerParams: {
      stage1: { speed: 2, time: '2-3分钟', goal: '盐水完全吸收' },
      stage2: { speed: 3, time: '2-4分钟', goal: '中等面筋（厚膜即可）' },
    },
    baseTips: [
      '目标状态：面团开始抱团、表面略光滑，仍有轻微粘性',
      '拉伸测试：能拉出较厚但有韧性的膜即可，不追求完全手套膜',
      '后续折叠会继续补强；若面温超过 26°C，立即停机降温',
    ],
    warning: '面温勿超 26°C',
  },
  {
    id: 'bulk_rest',
    phase: 'bulk',
    title: '静置松弛',
    subtitle: 'Bench Rest',
    action: '室温',
    timeValue: '30',
    timeUnit: '分钟',
    minutes: 30,
    baseTips: [
      '将面团转移至发酵盒（建议透明带刻度）',
      '手上沾水整理面团',
      '在盒子上标记初始高度',
    ],
    warning: null,
  },
  {
    id: 'fold_1',
    phase: 'bulk',
    title: '第一次折叠',
    subtitle: 'Stretch & Fold #1',
    action: '拉伸折叠',
    timeValue: '30',
    timeUnit: '分钟后',
    minutes: 30,
    baseTips: [
      '双手沾水防粘，不要破坏气泡',
      '若有浸泡类混入料（如亚麻籽 soaker），此时分 2-3 次铺上并折入',
      '抓住面团一侧向上拉伸至极限',
      '向中心覆盖折叠',
      '转动盒子 90 度，重复此动作 4 次（上下左右各一次）',
    ],
    warning: null,
  },
  {
    id: 'fold_2',
    phase: 'bulk',
    title: '第二次折叠',
    subtitle: 'Stretch & Fold #2',
    action: '拉伸/加料',
    timeValue: '30',
    timeUnit: '分钟后',
    minutes: 30,
    baseTips: [
      '重复之前的拉伸折叠动作 (Stretch & Fold)',
      '若有 fold-2 阶段的柔软或湿润混入料（如橄榄、葡萄干），此时均匀铺上',
      '像叠被子一样折叠包裹馅料',
    ],
    warning: null,
  },
  {
    id: 'fold_3',
    phase: 'bulk',
    title: '第三次折叠',
    subtitle: 'Stretch & Fold #3',
    action: '最后折叠',
    timeValue: '30',
    timeUnit: '分钟后',
    minutes: 30,
    baseTips: [
      '此时面团应有明显充气感，且比较有弹性',
      '动作要温柔，避免拉断',
      '若有 fold-3 阶段的较硬混入料（坚果、奶酪等），此时加入',
      '折叠完成后停止操作，进入静置',
    ],
    warning: null,
  },
  {
    id: 'bulk_final',
    phase: 'bulk',
    title: '一发结束',
    subtitle: 'Bulk End',
    action: '判断状态',
    timeValue: '2-3',
    timeUnit: '小时',
    minutes: 150,
    baseTips: [
      '体积膨胀：比初始高度增长 50%-75%',
      '不要等到完全翻倍；高水合酸种过发后整形会明显塌软',
      '表面观察：有大气泡，边缘圆润微凸',
      '晃动测试：晃动盒子，面团像果冻一样抖动',
      '指按测试：按压回弹缓慢但留有印记',
    ],
    warning: '宁欠勿过',
  },
  {
    id: 'preshape',
    phase: 'shape',
    title: '分割预整',
    subtitle: 'Divide',
    action: '操作台',
    timeValue: '30',
    timeUnit: '分钟',
    minutes: 30,
    baseTips: ['分割面团', '轻轻滚圆', '松弛 20 分钟'],
    warning: null,
  },
  {
    id: 'shape',
    phase: 'shape',
    title: '最终整形',
    subtitle: 'Final Shape',
    action: '入篮',
    timeValue: '10',
    timeUnit: '分钟',
    minutes: 10,
    baseTips: [
      '在面团光滑面撒粉，翻面',
      '轻拍排气（不要拍死）',
      '信封式折叠：左右向内折，再从上向下卷起',
      '收紧接缝，接缝朝上放入发酵篮',
    ],
    warning: null,
  },
  {
    id: 'cold',
    phase: 'cold',
    title: '冷藏发酵',
    subtitle: 'Cold Retard',
    action: '4°C',
    timeValue: '8-24',
    timeUnit: '小时',
    minutes: 0,
    baseTips: [
      '发酵篮套上保鲜袋密封，放入冰箱 4°C 层',
      '冷藏时间范围：8 至 24 小时（推荐 14-16 小时）',
      '请点击下方按钮记录放入时间，会自动算出预热时间',
    ],
    warning: null,
  },
  {
    id: 'bake',
    phase: 'bake',
    title: '预热烘烤',
    subtitle: 'Baking',
    action: '230°C',
    timeValue: '38',
    timeUnit: '分钟/个',
    minutes: 38,
    baseTips: [
      '提前 1 小时预热烤箱和铸铁锅至 230°C',
      '取出冷藏面团，割包（深 0.5cm，角度 45°）',
      '阶段一：入锅盖盖，烤 20 分钟',
      '阶段二：开盖，继续烤 18 分钟上色',
    ],
    warning: '注意高温防烫',
  },
];

export default SOURDOUGH_STEPS;
