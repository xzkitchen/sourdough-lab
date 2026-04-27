# Sourdough Lab — Editorial Redesign · Integration Guide

本包用来把"Editorial 2026"视觉方案落地到本地 Vite + React 工程。

## 目录结构

```
editorial-handoff/
├── INTEGRATION-GUIDE.md        ← 本文件
├── patch/                      ← ★ 真·要合入的代码
│   ├── src/
│   │   ├── design/tokens.js                    (覆盖)
│   │   ├── components/editorial/*.jsx          (新增)
│   │   └── components/recipe/FlavorPresets.jsx (覆盖)
│   └── EDITORIAL-REDESIGN.md   ← 原始改动说明
└── reference/                  ← 仅供参考 · 不直接合入
    ├── Sourdough Lab — Editorial.html   (沙箱可运行的单文件版本)
    └── app/                             (沙箱用的 JSX 源码)
        ├── formula.jsx       ← Formula tab 的完整实现蓝本
        ├── other-views.jsx   ← Starter / Bake / Cook Mode 蓝本
        ├── primitives.jsx    ← ColorOrb / BreadCrumb 蓝本
        ├── data.js           ← 沙箱数据结构（对照用，不合入）
        └── engine.js         ← 计算函数简化版（对照用，不合入）
```

## 分类说明

### 🟢 patch/ — 必合

这些是经过设计决策的新代码，直接进本地工程：

| 文件 | 动作 | 说明 |
|---|---|---|
| `src/design/tokens.js` | **覆盖** | 新增 chapter / meta-big / section-lg tier；保留所有原有 token |
| `src/components/editorial/Masthead.jsx` | 新增 | 刊头 ISSUE / DATE / N° |
| `src/components/editorial/MetaLine.jsx` | 新增 | 响应式元信息行 |
| `src/components/editorial/ChapterHero.jsx` | 新增 | 三栏 hero 容器 + 移动端自适应 |
| `src/components/editorial/ColorOrb.jsx` | 新增 | 修复版色球（feTurbulence + multiply grain + shine） |
| `src/components/editorial/index.js` | 新增 | barrel |
| `src/components/recipe/FlavorPresets.jsx` | **覆盖** | 切换到新 ColorOrb + `overflow-y: visible` 修复裁切 |

### 🟡 reference/ — 只做蓝本，不合入

`reference/` 里的 `app/*.jsx` 和单文件 HTML 是沙箱版本的全部实现。**不要直接拷贝 app/*.jsx 到 src/**，原因：

- 沙箱用的是浏览器内 Babel + `window.*` 全局挂载，不是 ES module
- 数据结构简化过，字段名和本地 `domain/modifiers/flavors.js`、`calculator.js` 不一致（例如 `flavor.note` vs 本地没有该字段）
- 样式类有沙箱专属的 `sdl-ing-row` / `sdl-feed-row` 等，需要放进本地全局 CSS 或 tailwind plugin

**正确用法**：读 `reference/app/formula.jsx` 来**理解**"Hero 怎么排 / Specsheet 怎么分栏 / Chef's Selection 怎么滚"，然后基于**本地现有的** `FLAVORS / calculateRecipe / FeedPanel / StepList` API 重写对应 Tab 组件。

---

## 推荐合入流程

### Step 1. 开分支

```bash
cd sourdough-lab
git checkout -b editorial-redesign
```

### Step 2. 放入 patch 文件

把 `editorial-handoff/patch/src/` 下的所有文件覆盖/新增到 `sourdough-lab/src/` 对应位置。

```bash
cp -r editorial-handoff/patch/src/* sourdough-lab/src/
```

### Step 3. 添加全局 CSS（必须！）

`FlavorPresets.jsx` 里的 strip 依赖一段全局 CSS 防止 webkit 滚动条裁剪。把下面加到 `src/design/fonts.css`（或者新建 `src/design/global.css` 并在入口 import）：

```css
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.no-scrollbar::-webkit-scrollbar { display: none; }
```

### Step 4. 重写 App.jsx —— 手动按蓝本改

不要直接拷贝 `reference/app/formula.jsx` —— 它依赖沙箱全局对象。
**参考 `patch/EDITORIAL-REDESIGN.md` 里的 App.jsx 片段**，把三个 Tab 的 hero 改为 `<ChapterHero>` 包裹：

- Formula tab → `<ChapterHero chapter="I" chapterLabel="Formula" zhTitle={flavor.name} ...>`
- Starter tab → `<ChapterHero chapter="II" chapterLabel="Starter" zhTitle="养种" ...>`
- Bake tab → `<ChapterHero chapter="III" chapterLabel="Bake" zhTitle="流程" ...>`

Meta 栏用 `<MetaLine>` 替换原卡片；Masthead 放在最顶部。

### Step 5. 本地验证

```bash
npm install   # 若有新依赖（当前 patch 无新依赖）
npm run dev
```

打开浏览器对照 `reference/Sourdough Lab — Editorial.html`（可直接双击打开），两者视觉应基本一致。

### Step 6. 常见问题排查

- **Tailwind 提示 class 找不到**：新 tokens 里的 `chapter` / `meta-big` 等需要 `tailwind.config.js` 能读到 —— 确认 `content` 里包含 `src/components/editorial/**`
- **色球 grain 仍不显现**：确认 `ColorOrb` 里的 `<filter id={...}>` id 是唯一的（含 `flavor.id + size`）
- **FlavorPresets 选中色球被裁**：检查 strip 容器是否应用了 `overflow-x-auto overflow-y-visible`，任一方向 overflow 为 visible 以外值都会裁切
- **Fraunces 变体字重不生效**：确认 `fonts.css` 加载的是 variable font 版本（包含 wght / opsz / SOFT 三个轴）

### Step 7. 提 PR

```bash
git add .
git commit -m "feat(design): editorial 2026 — chapter hero + masthead + color orb"
git push origin editorial-redesign
```

在 GitHub 开 PR 合到 main。

---

## 设计决策备忘

视觉方向：**Aesop × Kinfolk —— Quiet Luxury Lab meets Editorial Magazine**

关键选择：
- 一种强调色（#B08968 麦色），拒绝多彩
- Fraunces variable font 靠 opsz + SOFT + wght 三轴做大小字重
- Hairline 分隔线（1px #E5DED0）+ 纸纹 body 背景
- 每个 Tab 按"Chapter I/II/III"编号，建立杂志感节奏
- 色球是整个系统的视觉锚点：Hero 大球 + Chef's Selection feed
- 移动端关键改动：大色球/气泡球/进度环在窄屏时置顶作视觉锚点；Meta 信息 4 列小号；Specsheet / Feed / Timeline 全部响应式列宽
