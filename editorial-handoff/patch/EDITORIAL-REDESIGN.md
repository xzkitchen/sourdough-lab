# Sourdough Lab — Editorial Redesign

把沙箱版 "2026 Editorial" 视觉语汇合入本地 React 工程的改动包。

## 核心思路

**从"clean utility UI"升级为"刊物式 editorial UI"**：
- 每个 Tab 是一个 Chapter，有刊物式 hero（No. / 巨字 / 锚点色球）
- 配方表用 specsheet 纵向长栏，不再包裹 Card
- Cook Mode 全屏大字，单步 100vh
- 色球 grain 用 `feTurbulence + multiply`，独立 filter 避免 scope 丢失
- 移动端适配：色球/进度环置顶，meta 4 列横排，所有 grid 列做 >640px 响应式切分

## 合入步骤（建议新分支）

```bash
cd /Users/wuxi/Library/Mobile\ Documents/com\~apple\~CloudDocs/projects/sourdough-lab
git checkout -b editorial-redesign
```

### 1. 复制以下新文件到工程

**新增（6 个）**
```
src/components/editorial/Masthead.jsx       # 刊头
src/components/editorial/MetaLine.jsx       # 元信息行
src/components/editorial/ChapterHero.jsx    # Chapter hero 布局容器
src/components/editorial/ColorOrb.jsx       # 色球（grain 修复版）
src/components/editorial/index.js           # barrel
```

**覆盖（2 个）**
```
src/design/tokens.js                        # 增加 chapter / meta-big / section-lg
src/components/recipe/FlavorPresets.jsx     # 用新 ColorOrb + overflow-y visible
```

### 2. 改写 `src/App.jsx`

用新的 `<Masthead />` 替换原 header；三个 Tab 内容各自用 `<ChapterHero />` 包装。
（见下方 "App.jsx 参考片段"，sandbox 里的 `app/formula.jsx` / `app/other-views.jsx` 可作为实现蓝本。）

### 3. 可选：重写 IngredientTable 为 Specsheet

如果你喜欢 Editorial 版的"横向超细长条目 + 巨大 Fraunces 数字"，把
`src/components/recipe/IngredientTable.jsx` 内部 `<table>` 改为
`<ul>` + grid 行：
```jsx
<li className="grid items-baseline gap-x-3 sm:gap-x-4 py-4 sm:py-5 sdl-ing-row">
  {/* dot · name · bp · weight (font-display 28px) */}
</li>
```
加全局 CSS：
```css
.sdl-ing-row { grid-template-columns: 20px 1fr 56px 84px; }
@media (min-width: 640px) {
  .sdl-ing-row { grid-template-columns: 28px 1fr 80px 120px; }
}
```

### 4. 验证 + 提交

```bash
npm run dev
# 手机扫码（Vite --host）在 375px 再走一遍三个 Tab
git add .
git commit -m "feat(design): editorial 2026 redesign — masthead, chapter hero, cook mode"
git push origin editorial-redesign
```

在 GitHub 上开 PR → 合到 main。

---

## App.jsx 参考片段（Formula Tab）

```jsx
import { Masthead, MetaLine, ChapterHero, ColorOrb } from './components/editorial';

function FormulaTab({ base, numUnits, flavor, calculated, onApplyFlavor }) {
  const hydraDelta = calculated.actualHydration - base.hydrationDefault;
  const idx = FLAVORS.findIndex(f => f.id === flavor?.id);

  return (
    <div className="space-y-16 md:space-y-24">
      <ChapterHero
        chapter="Chapter I · Formula"
        title={flavor?.name || '自定义配方'}
        subtitle={flavor?.nameLatin || 'Custom formula'}
        description={flavor?.note}
        meta={[
          { label: 'No.', value: String(idx + 1).padStart(2, '0'), big: true },
          { label: 'Class', value: diffLabel(flavor?.difficulty) },
          { label: 'Yield', value: `${numUnits} × 400g` },
          {
            label: 'Hydration',
            value: `${(calculated.actualHydration * 100).toFixed(1)}%`,
            delta: hydraDelta !== 0
              ? `${hydraDelta > 0 ? '+' : ''}${(hydraDelta * 100).toFixed(1)}`
              : null,
          },
        ]}
        anchor={
          <ColorOrb
            base={base}
            modifiers={flavor?.modifiers || []}
            size={168 /* mobile: also used for desktop via md:w-[188px] */}
            active
          />
        }
      />

      <FlavorPresets base={base} flavors={FLAVORS} selected={selected} onApply={onApplyFlavor} />
      <Specsheet ingredients={calculated.ingredients} />
      <WarningList warnings={calculated.warnings} notes={calculated.notes} />
    </div>
  );
}
```

---

## 沙箱里可直接参考的蓝本

这些沙箱文件是 Editorial 版的实现参考，**不要**复制回本地（结构不同），而是作为蓝本翻译：

- `app/formula.jsx`       — Formula Tab 完整实现（含 Specsheet / 背景 tint）
- `app/other-views.jsx`   — Starter / Bake / Cook Mode
- `app/primitives.jsx`    — ColorOrb 的第一版（本 patch 已抽成独立文件）
- `Sourdough Lab — Editorial.html` — 所有全局 CSS（sdl-slider / sdl-ing-row 等）

## 关键坑点

1. **色球 grain 不要用全局 `<defs>`**：Tab 切换 unmount 时 filter 会失效。每个球独立 filter。
2. **色球父容器必须 `overflow-hidden` + 父级 `overflow-y: visible`**：active 放大 3% 不被裁。
3. **移动端 hero 需要 2 个锚点 slot**（移动顶部 / 桌面右栏），用 `hidden md:flex` / `md:hidden` 切换而不是 flex order。
4. **Fraunces variation settings 必须显式写**：`fontVariationSettings: "'opsz' 96, 'SOFT' 60, 'wght' 380"`，否则 iOS Safari 不会应用 SOFT 轴。
