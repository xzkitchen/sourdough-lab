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

// 方案 B: 轻盈奶盐吐司 (Light Milk Salt Toast)
export const STEPS_TOAST = [
  { 
    id: 'tangzhong', 
    phase: 'prep', 
    title: '制作汤种', 
    subtitle: 'Tangzhong Prep', 
    action: '65°C 糊化', 
    timeValue: '2', 
    timeUnit: '小时前', 
    minutes: 0, 
    tips: [
      '【冷锅混合】：先将面粉和牛奶搅拌至无颗粒，再开火', 
      '【全程搅拌】：开小火，需不停搅拌防止糊底', 
      '【离火时机】：液体变稠，搅拌出现明显纹路（约65°C）时立即离火', 
      '【贴面冷却】：保鲜膜贴着面糊表面盖好，防结皮，凉透后用',
      '【关于损耗】：原料共120g，需用110g。若不足，补牛奶至110g'
    ], 
    warning: '切勿加热鲁邦种' 
  },
  
  { id: 'feed', phase: 'prep', title: '激活鲁邦种', subtitle: 'Levain Build', action: '28°C 恒温', timeValue: '4-6', timeUnit: '小时', minutes: 300, tips: ['常规水粉比例 1:1 喂养', '发酵至体积翻倍甚至 3 倍'], warning: null },
  
  { 
    id: 'mix', phase: 'mix', title: '混合材料', subtitle: 'Mixing', action: '低速混合', timeValue: '3', timeUnit: '分钟', minutes: 3, 
    mixerParams: { stage1: { speed: 1, time: '3分钟', goal: '无干粉' } },
    tips: ['除黄油、盐外所有材料放入', '汤种撕小块加入', '冰牛奶预留10g'], warning: null 
  },
  
  { id: 'knead', phase: 'mix', title: '揉面 & 结膜', subtitle: 'Kneading', action: '中速', timeValue: '15', timeUnit: '分钟', minutes: 15, mixerParams: { stage1: { speed: 4, time: '6分钟', goal: '厚膜' }, stage2: { speed: 4, time: '8分钟', goal: '加盐油->薄膜' } }, tips: ['先打出厚膜再加盐和油', '阿洛酮糖面团保湿差，勿打过头', '目标：坚韧薄膜'], warning: '注意控温' },
  
  { id: 'bulk', phase: 'bulk', title: '基础发酵', subtitle: 'Bulk Fermentation', action: '26-28°C', timeValue: '3-4', timeUnit: '小时', minutes: 210, tips: ['体积增长 50%-60% 即可', '不需两倍大'], warning: null },
  
  { id: 'divide', phase: 'shape', title: '分割松弛', subtitle: 'Divide', action: '操作台', timeValue: '20', timeUnit: '分钟', minutes: 20, tips: ['【分割】：每条吐司分割成 3 个小面团', '【滚圆】：将每个小面团滚圆', '【松弛】：盖湿布松弛 20 分钟（松弛不到位会回缩）'], warning: null },
  
  { id: 'shape', phase: 'shape', title: '整形 & 裹油', subtitle: 'Shaping', action: '卷入黄油', timeValue: '15', timeUnit: '分钟', minutes: 15, tips: ['【一次擀卷】：擀开卷起，松弛10分钟', '【二次擀卷】：再次擀长，压薄底边', '【裹入】：在顶端放一条冷冻黄油，把它卷在中心', '【入模】：3 个面团一组，并排放入吐司盒'], warning: '黄油需冷冻' },
  
  { id: 'final_proof', phase: 'shape', title: '最终发酵', subtitle: 'Final Proof', action: '30-32°C', timeValue: '4.5-5', timeUnit: '小时', minutes: 300, tips: ['放入烤箱发酵，底部放一碗热水保持湿度', '没有发酵箱时建议温度：30-32°C', '发至 8 分满（最高点距模具口 2cm）', '手指轻按缓慢回弹留有浅坑即完成'], warning: '无需冷藏' },
  
  { id: 'bake', phase: 'bake', title: '控温烘烤', subtitle: 'Baking', action: '175°C', timeValue: '30', timeUnit: '分钟', minutes: 30, tips: ['预热 190°C，入炉调至 175°C（上下管）', '10-12分钟时观察上色，金黄满意后【立即盖锡纸】', '阿洛酮糖极易上色，必须盯着看防止烤焦', '出炉后震模脱模，侧放晾凉'], warning: '必盖锡纸' },
];
