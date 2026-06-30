# 喂养规划器 (Feeding Planner) — 设计

> 2026-06-30 · 取代喂养板块现有的 Std / Revival 两个模式

## 目标
解决吴老师的真实痛点:**每次喂养时「该取多少、什么比例、剩下一堆弃种太浪费」**。
把重心从「久置复活」挪到 **日常喂养 + 最小浪费**,复活只作为「种虚弱时」的分支。

## 两个模式(取代 Std / Revival)
1. **喂养(定时)** — 主模式。涵盖「日常维持」和「今晚喂明早用」。
   输入 *几点喂 / 几点要 / 早上做几个面包(或只维持)* → 算 **取 / 加 / 弃 + 达峰时间**。
   **退役旧 Std**:新模式是旧 build-to-target 的超集(旧的不管时间、不管浪费)。
2. **复活(状态)** — 副模式。状态卡 ①健康待唤醒 / ②微饿 / ③休眠 + ⚠污染红线 → 高稀释多轮时间线。

## 科学依据(有出处)
- 比例↔达峰时间(King Arthur 实测 @26°C):`1:1:1≈4h / 1:2:2≈8h / 1:4:4≈12h`。
  拟合:**`达峰h = 4 × (1 + log2(r))` @26°C**(完美过这三点)。反查:`r = 2^(窗口/4 − 1)`。
- 温度:每偏离 1°C 约 ±5% 发酵时长(与 environment.js 同口径),锚定在 KA 测量温度 26°C。
- 复活:取少量(~20g)弃其余 → 高稀释(1:5:5)→ 保温 25-28°C → 每 12h 一轮,直到稳定 4-8h 翻倍。
- 红线:只有 **发霉 / 腐臭** 才放弃;hooch 与强酸味都正常、可救。
- 来源:King Arthur「喂养比例实测」「How to feed」;The Perfect Loaf「21 常见问题」「储存与复活」。

## 代码落点(守 domain 纯函数 / UI 派生 / 数据在 domain)
- `src/domain/feeding.js` — 纯函数 `peakHours()` / `pickFeedRatio()` / `planTimedFeed()` / `planRevival()`
- `src/domain/starter-states.js` — 三状态档 + 红线,**纯数据**(带 source),以后加档改这里
- `FeedPanel.jsx` 重构:模式切换 Std/Revival → 喂养/复活;UI 全从函数派生,零硬编码克数

## 算法
```
// A. 比例反查
tempFactor(T)        = 1 + 0.05 × (26 − T)            // 冷→>1(更慢)
peakHours(r, T)      = 4 × (1 + log2(r)) × tempFactor(T)
pickFeedRatio(win,T) = r = round½( 2^( win/tempFactor(T)/4 − 1 ) ), clamp [0.5, 6]
                       → { r, 预计达峰h, 是否被 clamp }

// B. 定时喂养
planTimedFeed({ targetRipe, windowHours, roomTempC, availableGrams }):
  r         = pickFeedRatio(windowHours, roomTempC).r
  carryover = round( targetRipe / (1 + 2r) )
  加粉 = 加水 = round( carryover × r )
  弃种      = max(0, availableGrams − carryover)
  notEnough = availableGrams < carryover
targetRipe 默认 = 面团鲁邦种需求(numUnits×baseFlour×0.2) + 留种 20g;「只维持」取 60g

// C. 复活
planRevival({ stateId, availableGrams }):
  从 starter-states 取该档协议(比例/轮数/间隔/温度)→ 多轮 schedule(每轮取~20g)+ 判据 + 红线
```

## 界面 + 数据流
- 喂养卡:三输入(几点喂·几点要·目标)→ 结果卡「取 X+粉 Y+水 Z → 达峰 Hh;入面团/留种;多余→弃种食谱」
- 复活卡:三状态卡 → 多轮时间线 + 红线警示条
- App 状态(numUnits、室温、喂养/目标时间)→ domain 函数 → 派生 UI;弃种接现有 DISCARD_RECIPES

## 边界 / 防呆
- 冷房卡不住窗口 → 提示「保温到 X°C 或换比例」
- 种不够(available < carryover)→ 提示「先按 1:1:1 喂一轮建够」
- 复活红线(霉/腐臭)→ 红条「别救,重做」
- 过发酵防呆:会在目标前达峰 → 提示「会塌,晚点喂或更稀」

## 实现顺序(逐项验证)
1. **domain 定时喂养**(本设计先做):`feeding.js` 的 peakHours/pickFeedRatio/planTimedFeed + TDD
2. domain 复活:starter-states.js + planRevival + TDD
3. UI:FeedPanel 重构(喂养/复活两模式)+ 预览验证
4. 不破坏现有 20 个 calculator 测试
```
