# Sourdough Lab

家用酸面包创意实验室 —— 基础配方 × 可叠加的色粉与混入料，自动重算水合度、发酵时间与警告。

2026 Warm Editorial 视觉（暖米纸 + 单一麦色 + Fraunces serif），PWA 可离线，零后端。

---

## 特性

- **Modifier 系统** —— 13 种色粉 + 19 种混入料 + 9 条创意预设，叠加后自动：
  - 按吸水率重算水合度
  - 按酵母/面筋影响调整发酵时间
  - 弹出烘焙学警告（如抹茶含咖啡因、betalain 色素不耐热）
  - 生成本阶段投料清单（如 `fold-3` 放核桃）
- **面包成色预览** —— SVG 椭圆切面 + 混入料颗粒散点，modifier 叠加实时变色
- **Chef's Picks feed** —— 横向滚动色球卡片，多层 radial 混色 + 颗粒 grain（ElevenLabs 风）
- **Cook Mode** —— 全屏单步模式，大字 + 编号 tips，厨房手脏时键盘/点按翻页
- **冷发酵追踪** —— 滑杆 8–24h，记录放入时间后自动算预热/开烤时间
- **本地持久化** —— 所有选择经 localStorage 自动保存
- **PWA** —— 可装到手机主屏

---

## 快速开始

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # 生产构建 -> dist/
npm run preview    # 本地预览生产包
npm test           # 运行 calculator 单元测试
```

---

## 技术栈

- React 18 + Vite 5
- Tailwind CSS 3（彻底覆盖默认 palette，只用 design tokens）
- framer-motion（Tab/CookMode/Modifier 过渡）
- lucide-react（40+ 线条图标）
- clsx + tailwind-merge（className 合并）
- vitest（单元测试）
- vite-plugin-pwa

包体积（gzip）：CSS 5KB + React vendor 45KB + App 72KB ≈ **122KB**

---

## 架构

```
src/
├── App.jsx                    # 路由 + 状态编排
├── design/
│   ├── tokens.js              # colors / spacing / radii / fontFamily / motion / zIndex
│   ├── fonts.css              # Fraunces / Inter / IBM Plex Mono / Noto
│   ├── gradient.js            # 多层 radial 混色生成器（ElevenLabs 风色球）
│   └── textureOverlay.svg     # 全局纸纹
├── domain/                    # 核心业务逻辑（零 UI）
│   ├── base-recipes/          # 基础配方
│   ├── modifiers/
│   │   ├── colorants.js       # 13 条色粉
│   │   ├── addins.js          # 19 条混入料
│   │   ├── flavors.js         # 9 条创意预设
│   │   └── index.js
│   ├── process/               # 流程步骤定义
│   ├── calculator.js          # calculateRecipe / calculateFeed / enhanceSteps
│   ├── breadColor.js          # HSL 加权混合预测切面色
│   └── __tests__/             # vitest 单元测试
├── components/
│   ├── primitives/            # Card / Divider / Button / Pill / NumberField / Slider
│   ├── recipe/                # FlavorPresets / ModifierTray / BreadPreview / ...
│   ├── starter/               # FeedPanel
│   └── process/               # StepList / StepCard / ColdRetardTracker / CookMode
├── hooks/useStickyState.js    # localStorage 持久化 hook
└── lib/cn.js                  # clsx + twMerge helper
```

**数据模型三层**：

1. **Base Recipe**（[base-recipes/sourdough-classic.js](src/domain/base-recipes/sourdough-classic.js)）—— 基准粉量 + baker's % 食材表 + 默认水合度
2. **Modifier**（色粉 / 混入料）—— 每条带 `dose` / `hydrationAdjust` / `fermentationAdjust` / `breadColor` / `addStage` / `warnings`
3. **Calculator** —— Base × numUnits + selected modifiers → 最终配方（含警告、透明化说明、分阶段投料）

UI 组件全部从这三层派生，零硬编码。

---

## 扩展指南

### 加一条新色粉

编辑 [src/domain/modifiers/colorants.js](src/domain/modifiers/colorants.js)，追加一个对象：

```js
{
  id: 'spirulina-blue',
  name: '蓝螺旋藻粉',
  nameLatin: 'Blue Spirulina',
  category: 'colorant',
  dose: { default: 0.015, min: 0.01, max: 0.025 },
  hydrationAdjust: { method: 'absorption', ratio: 0.30 },
  fermentationAdjust: null,
  glutenAdjust: null,
  breadColor: { h: 200, s: 55, l: 62 },
  flavor: ['oceanic'],
  worksWith: ['white-chocolate', 'coconut'],
  addStage: 'mix',
  warnings: [],
},
```

`BreadPreview`、`IngredientTable`、`WarningList`、`FlavorPresets` 全部零改动，立即可用。

### 加一条新混入料

编辑 [src/domain/modifiers/addins.js](src/domain/modifiers/addins.js)，schema 同上，重点字段：
- `addStage` —— `'mix'` / `'fold-1'` / `'fold-2'` / `'fold-3'` / `'shape'` / `'surface'`
- `preTreatment` —— `'toast'` / `'soak'` / `'chop'` / `null`
- `soakingLiquidRatio` —— 浸泡型 add-in 的吸液比例（浸液并入总水）
- `dotColor` —— 面包预览上的颗粒色

### 加一条新创意预设

编辑 [src/domain/modifiers/flavors.js](src/domain/modifiers/flavors.js)，引用已有 modifier id：

```js
{
  id: 'spirulina-coconut',
  name: '蓝藻椰香',
  nameLatin: 'Blue × Coconut',
  description: '海洋蓝色球，螺旋藻 + 椰蓉夹层',
  modifiers: [
    { id: 'spirulina-blue', dose: 0.02 },
  ],
  heroHue: 200,
},
```

CHEF'S PICKS feed 自动出现新色球卡。

### 调整基础配方

编辑 [src/domain/base-recipes/sourdough-classic.js](src/domain/base-recipes/sourdough-classic.js) 的 `baseFlour` / `hydration` / `ingredients` bp，calculator 自动按 `numUnits` 缩放。

### 加新的面包类型（如 Ciabatta / Focaccia）

1. 新建 [src/domain/base-recipes/ciabatta.js](src/domain/base-recipes/ciabatta.js)
2. 新建 [src/domain/process/ciabatta-steps.js](src/domain/process/ciabatta-steps.js)
3. 在 [base-recipes/index.js](src/domain/base-recipes/index.js) 和 [process/index.js](src/domain/process/index.js) 注册
4. App.jsx 加 base 切换器（目前硬编码 `DEFAULT_BASE`）

---

## 部署

### Vercel（推荐）

```bash
git push origin main
# 在 vercel.com 连接仓库，自动识别 Vite，零配置部署
```

### Netlify

```bash
npm run build
# 拖 dist/ 到 app.netlify.com/drop
```

### 其他静态托管

`dist/` 目录是纯静态资源，丢到任何 CDN（Cloudflare Pages / GitHub Pages / S3+CloudFront）即可。

---

## 设计系统

- 底色：暖米纸 `#F5F1EA`
- 强调色：麦色 `#B08968`（单一强调色，2026 quiet luxury）
- 字体：Fraunces（标题）/ Inter（正文）/ IBM Plex Mono（数字）/ Noto Serif SC + Noto Sans SC（中文）
- 圆角：4 / 8 / 12 / 999px
- Motion：`cubic-bezier(.2,.8,.2,1)`，三档 180/260/420ms
- 纹理：全局 feTurbulence 纸纹 overlay，opacity 0.5 multiply

详见 [src/design/tokens.js](src/design/tokens.js)。

---

## License

MIT
