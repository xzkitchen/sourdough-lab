// 方案 A: 经典乡村酸种包 (Classic Sourdough)
export const STEPS_SOURDOUGH = [
  { id: 'feed', phase: 'prep', title: '激活鲁邦种', subtitle: 'Levain Build', action: '28°C 恒温', timeValue: '4-6', timeUnit: '小时', minutes: 300, tips: ['最佳温度 26-28°C', '峰值判断：体积膨胀 2.5-3 倍', '浮水测试：取一小块放入水中漂浮'], warning: null },
  
  { 
    id: 'autolyse', phase: 'mix', title: '混合与静置', subtitle: 'Fermentolyse', action: '低速混合', timeValue: '45', timeUnit: '分钟静置', minutes: 45, 
    mixerParams: { stage1: { speed: 1, time: '2-3分钟', goal: '混合至无干粉' } },
    tips: ['T65面粉 + 水 + 鲁邦种', '开启厨师机低速混合，只要看不见干粉即可停止', '千万不要过度搅拌，只需混合均匀', '盖上保鲜膜，静置 45 分钟，让面筋自然形成'], 
    warning: null 
  },
  
  { 
    id: 'salt', phase: 'mix', title: '后加水 & 盐', subtitle: 'Bassinage', action: '慢速吸收', timeValue: '5', timeUnit: '分钟操作', minutes: 5, 
    mixerParams: { stage1: { speed: 2, time: '3-5分钟', goal: '水分完全被吸收' } },
    tips: ['预留的水分需分 2-3 次缓慢加入', '每次加水后等待面团完全吸收再加下一次', '最后加入盐，低速搅拌至完全溶解', '此时面团变烂属正常现象，不用慌张'], 
    warning: null 
  },
  
  { id: 'knead', phase: 'mix', title: '机械揉面', subtitle: 'Mechanical Mix', action: '中高速', timeValue: '8-10', timeUnit: '分钟', minutes: 10, mixerParams: { stage1: { speed: 3, time: '4分钟', goal: '成团' }, stage2: { speed: 4, time: '4-6分钟', goal: '中等面筋' } }, tips: ['目标状态：面团表面光滑，稍有粘性', '拉伸测试：能拉出较厚但有韧性的薄膜', '注意控制面温，若超过 26°C 需放入冷冻降温'], warning: '面温勿超 26°C' },
  
  { id: 'bulk_rest', phase: 'bulk', title: '静置松弛', subtitle: 'Bench Rest', action: '室温', timeValue: '30', timeUnit: '分钟', minutes: 30, tips: ['将面团转移至发酵盒（建议透明带刻度）', '手上沾水整理面团', '在盒子上标记初始高度'], warning: null },
  
  { id: 'fold_1', phase: 'bulk', title: '第一次折叠', subtitle: 'Stretch & Fold #1', action: '拉伸折叠', timeValue: '30', timeUnit: '分钟后', minutes: 30, tips: ['双手沾水防粘，不要破坏气泡', '抓住面团一侧向上拉伸至极限', '向中心覆盖折叠', '转动盒子 90 度，重复此动作 4 次（上下左右各一次）'], warning: null },
  
  { id: 'fold_2', phase: 'bulk', title: '第二次折叠', subtitle: 'Stretch & Fold #2', action: '拉伸/加料', timeValue: '30', timeUnit: '分钟后', minutes: 30, tips: ['重复之前的拉伸折叠动作 (Stretch & Fold)', '如果做口味款：将面团轻轻摊开', '均匀铺上馅料（番茄/罗勒等）', '像叠被子一样折叠包裹馅料'], warning: null },
  
  { id: 'fold_3', phase: 'bulk', title: '第三次折叠', subtitle: 'Stretch & Fold #3', action: '最后折叠', timeValue: '30', timeUnit: '分钟后', minutes: 30, tips: ['此时面团应有明显充气感，且比较有弹性', '动作要温柔，避免拉断', '折叠完成后停止操作，进入静置'], warning: null },
  
  { id: 'bulk_final', phase: 'bulk', title: '一发结束', subtitle: 'Bulk End', action: '判断状态', timeValue: '2-3', timeUnit: '小时', minutes: 150, tips: ['体积膨胀：比初始高度增长 50%-75%', '表面观察：有大气泡，边缘圆润微凸', '晃动测试：晃动盒子，面团像果冻一样抖动', '指按测试：按压回弹缓慢但留有印记'], warning: '宁欠勿过' },
  
  { id: 'preshape', phase: 'shape', title: '分割预整', subtitle: 'Divide', action: '操作台', timeValue: '30', timeUnit: '分钟', minutes: 30, tips: ['分割面团', '轻轻滚圆', '松弛 20 分钟'], warning: null },
  
  { id: 'shape', phase: 'shape', title: '最终整形', subtitle: 'Final Shape', action: '入篮', timeValue: '10', timeUnit: '分钟', minutes: 10, tips: ['在面团光滑面撒粉，翻面', '轻拍排气（不要拍死）', '信封式折叠：左右向内折，再从上向下卷起', '收紧接缝，接缝朝上放入发酵篮'], warning: null },
  
  { id: 'cold', phase: 'cold', title: '冷藏发酵', subtitle: 'Cold Retard', action: '4°C', timeValue: '12-16', timeUnit: '小时', minutes: 0, tips: ['发酵篮套上保鲜袋密封，放入冰箱 4°C 层', '冷藏时间范围：12 至 16 小时（推荐 16 小时）', '请点击下方按钮记录放入时间，我会帮你算预热时间'], warning: null },
  
  { id: 'bake', phase: 'bake', title: '预热烘烤', subtitle: 'Baking', action: '230°C', timeValue: '38', timeUnit: '分钟/个', minutes: 38, tips: ['提前 1 小时预热烤箱和铸铁锅至 230°C', '取出冷藏面团，割包（深 0.5cm，角度 45°）', '阶段一：入锅盖盖，烤 20 分钟', '阶段二：开盖，继续烤 18 分钟上色'], warning: '注意高温防烫' },
];

// 方案 B: 日式松软吐司 (Japanese Shokupan) - 商业酵母版
export const STEPS_JAPANESE = [
  { 
    id: 'tangzhong', 
    phase: 'prep', 
    title: '制作汤种', 
    subtitle: 'Tangzhong Prep', 
    action: '65°C 糊化', 
    timeValue: '前一晚', 
    timeUnit: '冷藏过夜', 
    minutes: 0, 
    tips: [], // 动态生成
    warning: '必须完全冷透' 
  },
  
  { 
    id: 'mix', 
    phase: 'mix', 
    title: '混合面团', 
    subtitle: 'Initial Mix', 
    action: '低速混合', 
    timeValue: '8-10', 
    timeUnit: '分钟', 
    minutes: 10, 
    mixerParams: { 
      stage1: { speed: 1, time: '3分钟', goal: '无干粉' }, 
      stage2: { speed: 3, time: '5-7分钟', goal: '粗膜（破口锯齿状）' } 
    },
    tips: [
      '【投料顺序】①冰牛奶 → ②全蛋液 → ③汤种(冷藏态) → ④高筋粉 → ⑤奶粉 → ⑥阿洛酮糖 → ⑦干酵母 → ⑧海盐(撒最边上)',
      '汤种必须是冷藏状态（4-10°C），温热会杀死酵母',
      '1档混合3分钟至无干粉，转3档揉5-7分钟至粗膜'
    ], 
    warning: null 
  },
  
  { 
    id: 'knead', 
    phase: 'mix', 
    title: '加黄油揉面', 
    subtitle: 'Butter & Knead', 
    action: '中速揉面', 
    timeValue: '8-12', 
    timeUnit: '分钟', 
    minutes: 12, 
    mixerParams: { 
      stage1: { speed: 3, time: '8-12分钟', goal: '手套膜' } 
    },
    tips: [
      '黄油室温软化至手指能轻松按下',
      '分2-3次加入，每次完全吃进再加下一次',
      '3-4档中速揉8-12分钟至手套膜',
      '判断标准：能拉出透明薄膜，破口边缘光滑',
      '过度揉面会断筋、面团发粘，要注意观察'
    ], 
    warning: '避免过度揉面' 
  },
  
  { 
    id: 'bulk', 
    phase: 'bulk', 
    title: '一次发酵', 
    subtitle: 'Bulk Fermentation', 
    action: '28°C', 
    timeValue: '50-70', 
    timeUnit: '分钟', 
    minutes: 60, 
    tips: [
      '发酵环境：28°C / 75%湿度',
      '室温22-25°C时需延长至90分钟',
      '判断标准：面团膨胀至2倍大',
      '戳洞测试：手指沾粉戳洞，不回弹、不塌陷即可'
    ], 
    warning: null 
  },
  
  { 
    id: 'divide', 
    phase: 'shape', 
    title: '分割滚圆', 
    subtitle: 'Divide & Round', 
    action: '操作台', 
    timeValue: '20', 
    timeUnit: '分钟松弛', 
    minutes: 20, 
    tips: [], // 动态生成
    warning: null 
  },
  
  { 
    id: 'shape', 
    phase: 'shape', 
    title: '整形入模', 
    subtitle: 'Shaping', 
    action: '二次擀卷', 
    timeValue: '15', 
    timeUnit: '分钟', 
    minutes: 15, 
    tips: [
      '【二次擀卷法】这是撕拉纹理的秘密',
      '第一次擀卷：擀成牛舌状(宽约8cm)，自上而下卷起，松弛10分钟',
      '第二次擀卷：擀成椭圆形(长约25cm)，底边压薄，卷紧约2.5-3圈',
      '收口捏紧，收口朝下放入模具',
      '3个面团并排放入吐司盒，间距均匀'
    ], 
    warning: null 
  },
  
  { 
    id: 'proof', 
    phase: 'shape', 
    title: '二次发酵', 
    subtitle: 'Final Proof', 
    action: '35°C', 
    timeValue: '40-60', 
    timeUnit: '分钟', 
    minutes: 50, 
    tips: [
      '发酵环境：35°C / 80%湿度',
      '室温时需延长至90-120分钟',
      '判断标准：面团发至9分满模',
      '回弹测试：手指轻按，缓慢回弹即可',
      '不要过发！过发会导致组织粗糙，无法撕拉'
    ], 
    warning: '切勿过发' 
  },
  
  { 
    id: 'bake', 
    phase: 'bake', 
    title: '烘烤出炉', 
    subtitle: 'Baking', 
    action: '上180/下200', 
    timeValue: '30-35', 
    timeUnit: '分钟', 
    minutes: 32, 
    tips: [
      '预热：上火180°C / 下火200°C，预热15分钟',
      '烘烤：上火180°C / 下火200°C，烤30-35分钟',
      '10分钟时开始膨胀上色',
      '15分钟时顶部金黄，立即盖锡纸防过度上色',
      '25分钟时拍吐司侧面，听到空洞声',
      '判断熟度：中心温度90-93°C，或牙签插入无湿面糊',
      '出炉后立即震模排气，脱模侧放散热'
    ], 
    warning: '15分钟必盖锡纸' 
  },
];
